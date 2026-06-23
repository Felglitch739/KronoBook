import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if the browser supports service workers and push notifications
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const subscribeToPush = async () => {
    if (!user) {
      console.warn('Usuario no autenticado, no se puede suscribir a notificaciones.');
      return false;
    }

    setLoading(true);
    try {
      // Solicitar permiso explícito al usuario
      const currentPermission = await Notification.requestPermission();
      setPermission(currentPermission);

      if (currentPermission !== 'granted') {
        throw new Error('Permiso de notificaciones denegado.');
      }

      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      
      // Temporarily using a dummy string if the env variable is missing, as requested
      const activeVapidKey = vapidPublicKey || 'BKsS5-mG2N220Fk2Y_hD-8hY9O3L9R_p9L4aZ5k0e3H8N5tZ7wU8cE6R9V2Q5bL8D1K4F7X3V9X2V9X2V9X2V9A=';

      const registration = await navigator.serviceWorker.ready;

      // Suscribirse usando la VAPID key
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(activeVapidKey)
      });

      const subscriptionData = JSON.parse(JSON.stringify(subscription));

      // Guardar la suscripción en Supabase
      const { error } = await supabase.from('push_subscriptions').upsert({
        user_id: user.id,
        endpoint: subscriptionData.endpoint,
        p256dh: subscriptionData.keys.p256dh,
        auth: subscriptionData.keys.auth,
      }, { onConflict: 'user_id, endpoint' });

      if (error) {
        throw error;
      }

      setIsSubscribed(true);
      return true;
    } catch (error) {
      console.error('Error al suscribir a push:', error);
      setIsSubscribed(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    isSupported,
    isSubscribed,
    permission,
    loading,
    subscribeToPush
  };
};
