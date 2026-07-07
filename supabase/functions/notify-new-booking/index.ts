// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
// @ts-ignore
import webpush from "npm:web-push@3.6.7";

// Declaración para evitar errores del IDE si no está configurada la extensión de Deno
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Manejo de CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload = await req.json();
    
    // Validamos que sea un evento de INSERT de la tabla 'citas'
    if (payload.type !== 'INSERT' || payload.table !== 'citas') {
       return new Response(JSON.stringify({ error: "Invalid webhook payload" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
    }

    const record = payload.record;

    // 1. Obtener los administradores asignados al negocio
    const { data: staff, error: staffError } = await supabase
      .from('negocio_staff')
      .select('user_id')
      .eq('negocio_id', record.negocio_id);

    if (staffError) throw staffError;

    if (!staff || staff.length === 0) {
       return new Response(JSON.stringify({ message: "No staff found for this negocio" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const userIds = staff.map((s: any) => s.user_id);

    // 2. Obtener las suscripciones activas de esos usuarios
    const { data: subscriptions, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('user_id', userIds);

    if (subsError) throw subsError;

    if (!subscriptions || subscriptions.length === 0) {
       return new Response(JSON.stringify({ message: "No active push subscriptions found" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 3. Configurar llaves VAPID (Las obtienes con `npx web-push generate-vapid-keys`)
    // IMPORTANTE: Asegúrate de añadir VAPID_PUBLIC_KEY y VAPID_PRIVATE_KEY a los Secrets de Supabase
    webpush.setVapidDetails(
      Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@kronobook.com',
      Deno.env.get('VAPID_PUBLIC_KEY')!,
      Deno.env.get('VAPID_PRIVATE_KEY')!
    );

    // Formatear la fecha/hora en caso de que existan, para que la notificación se vea bien
    const fechaFormat = record.fecha ? new Date(record.fecha).toLocaleDateString() : '';
    const cuerpoNotificacion = `Cliente: ${record.cliente_nombre || 'Sin nombre'}\nFecha: ${fechaFormat} a las ${record.hora}`;

    const notificationPayload = JSON.stringify({
      title: '¡Nueva Cita Agendada!',
      body: cuerpoNotificacion,
      data: {
        url: `/admin`, // El Service Worker usará esta URL al hacer clic
        negocio_id: record.negocio_id
      }
    });

    let successCount = 0;
    let failureCount = 0;

    // 4. Enviar notificación a todos los dispositivos suscritos de los admins
    for (const sub of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };
        await webpush.sendNotification(pushSubscription, notificationPayload);
        successCount++;
      } catch (error: any) {
        failureCount++;
        console.error("Error sending push to endpoint:", sub.endpoint, error);
        
        // Si la suscripción ha expirado, fue revocada por el usuario o es inválida
        if (error.statusCode === 404 || error.statusCode === 410) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('id', sub.id);
          console.log(`Deleted expired subscription ID: ${sub.id}`);
        }
      }
    }

    return new Response(JSON.stringify({ success: true, successCount, failureCount }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    console.error("Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
