import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { type Cita, type Servicio, type Barberia } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const useBookings = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();
  
  const [citas, setCitas] = useState<Cita[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [barberia, setBarberia] = useState<Barberia | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refetch = () => setRefreshTrigger((prev) => prev + 1);

  // Detectar si el usuario está dentro del panel de administración o superadmin
  const isAdminPage = location.pathname.startsWith('/admin') || location.pathname.startsWith('/superadmin');

  useEffect(() => {
    const loadTenantData = async () => {
      setLoading(true);
      try {
        let currentBusiness = null;

        // CASO A: ESTAMOS EN EL DASHBOARD DE ADMINISTRACIÓN
        if (isAdminPage) {
          if (!user) {
            setBarberia(null);
            setServicios([]);
            setCitas([]);
            setLoading(false);
            return;
          }

          // Si eres SuperAdmin, temporalmente cargamos Chaga
          if (profile?.rol === 'superadmin') {
            const { data } = await supabase
              .from('barberias')
              .select('*')
              .eq('slug', 'barberia-chaga')
              .maybeSingle();
            currentBusiness = data;
          } else {
            // Si eres un Owner normal, busca la barbería que te pertenece a TI (owner_id)
            const { data, error } = await supabase
              .from('barberias')
              .select('*')
              .eq('owner_id', user.id)
              .maybeSingle();

            if (error || !data) {
              console.warn("No se pudo obtener la barbería por owner_id, cayendo en fallback a la primera barbería:", error?.message);
              // Fallback seguro a la primera barbería para no romper la pantalla de administración
              const { data: fallbackData } = await supabase
                .from('barberias')
                .select('*')
                .limit(1)
                .single();
              currentBusiness = fallbackData;
            } else {
              currentBusiness = data;
            }
          }
        } 
        // CASO B: ESTAMOS EN LA LANDING PÚBLICA (VISTA DEL CLIENTE)
        else {
          const currentSlug = slug || 'barberia-chaga';
          const { data, error } = await supabase
            .from('barberias')
            .select('*')
            .eq('slug', currentSlug)
            .maybeSingle();

          if (error || !data) {
            if (slug) {
              navigate('/404');
            }
            return;
          }
          currentBusiness = data;
        }

        if (currentBusiness) {
          // Mapear el objeto crudo de Supabase al tipo Barberia (incluye colores de marca)
          setBarberia({
            id: currentBusiness.id,
            nombre: currentBusiness.nombre,
            slug: currentBusiness.slug,
            direccion: currentBusiness.direccion,
            horario: currentBusiness.horario,
            colorPrimario: currentBusiness.color_primario ?? undefined,
            colorSecundario: currentBusiness.color_secundario ?? undefined,
            tema: currentBusiness.tema ?? undefined,
          });

          // Descargar los servicios vinculados a este negocio
          const { data: srvData } = await supabase
            .from('servicios')
            .select('*')
            .eq('barberia_id', currentBusiness.id)
            .order('precio', { ascending: true });

          // Descargar las citas vinculadas a este negocio
          const { data: citasData } = await supabase
            .from('citas')
            .select('*')
            .eq('barberia_id', currentBusiness.id)
            .order('fecha', { ascending: false });

          if (srvData) {
            const formattedServicios: Servicio[] = srvData.map((data: any) => ({
              id: data.id,
              barberiaId: data.barberia_id,
              nombre: data.nombre,
              precio: Number(data.precio),
              duracionMinutos: data.duracion_minutos,
              descripcion: data.descripcion || undefined
            }));
            setServicios(formattedServicios);
          }
          
          if (citasData) {
            interface SupabaseCita {
              id: string;
              barberia_id: string;
              servicio_id: string;
              cliente_nombre: string;
              cliente_telefono: string;
              cliente_email: string | null;
              fecha: string;
              hora: string;
              estado: string;
              notas: string | null;
              propina: number | null;
            }
            const formattedCitas: Cita[] = (citasData as SupabaseCita[]).map((data) => ({
              id: data.id,
              barberiaId: data.barberia_id,
              servicioId: data.servicio_id,
              clienteNombre: data.cliente_nombre,
              clienteTelefono: data.cliente_telefono,
              clienteEmail: data.cliente_email || undefined,
              fecha: data.fecha,
              hora: data.hora,
              estado: data.estado as Cita['estado'],
              notas: data.notas || undefined,
              propina: data.propina || 0
            }));
            setCitas(formattedCitas);
          } else {
            setCitas([]);
          }
        }
      } catch (error) {
        console.error('Error cargando datos de Supabase:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTenantData();
  }, [slug, isAdminPage, user, profile, navigate, refreshTrigger]);

  const addCita = async (citaData: Omit<Cita, 'id' | 'estado' | 'barberiaId'>) => {
    if (!barberia) throw new Error("No barberia loaded");
    try {
      const newCitaInsert = {
        barberia_id: barberia.id,
        servicio_id: citaData.servicioId,
        cliente_nombre: citaData.clienteNombre,
        cliente_telefono: citaData.clienteTelefono,
        cliente_email: citaData.clienteEmail || null,
        fecha: citaData.fecha,
        hora: citaData.hora,
        estado: 'pendiente',
        notas: citaData.notas || null
      };

      const { data, error } = await supabase
        .from('citas')
        .insert([newCitaInsert])
        .select()
        .single();

      if (error) throw error;

      const formattedCita: Cita = {
        id: data.id,
        barberiaId: data.barberia_id,
        servicioId: data.servicio_id,
        clienteNombre: data.cliente_nombre,
        clienteTelefono: data.cliente_telefono,
        clienteEmail: data.cliente_email,
        fecha: data.fecha,
        hora: data.hora,
        estado: data.estado as Cita['estado'],
        notas: data.notas,
        propina: data.propina || 0
      };

      setCitas((prev) => [formattedCita, ...prev]);
      return formattedCita;

    } catch (error) {
      console.error('Error al insertar cita:', error);
      throw error;
    }
  };

  const updateCitaEstado = async (id: string, estado: Cita['estado']) => {
    try {
      if (!barberia) {
        throw new Error("No se ha cargado ninguna barbería para actualizar la cita");
      }

      // Realizar la mutación real en Supabase con validación de barberia_id
      const { error } = await supabase
        .from('citas')
        .update({ estado })
        .eq('id', id)
        .eq('barberia_id', barberia.id);

      if (error) {
        throw error;
      }

      // Si la petición es exitosa, actualizar el estado local
      setCitas((prev) =>
        prev.map((c) => (c.id === id ? { ...c, estado } : c))
      );
    } catch (error) {
      console.error('Error al actualizar estado de la cita en Supabase:', error);
    }
  };

  const eliminarServicio = async (id: string) => {
    try {
      if (!barberia) throw new Error("No se ha cargado ninguna barbería");
      
      const { error } = await supabase
        .from('servicios')
        .delete()
        .eq('id', id)
        .eq('barberia_id', barberia.id);

      if (error) throw error;

      // Actualizar el estado local de React inmediatamente
      setServicios((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error('Error al eliminar el servicio:', error);
      throw error;
    }
  };

  const eliminarCita = async (id: string) => {
    try {
      if (!barberia) throw new Error("No se ha cargado ninguna barbería");

      const { error } = await supabase
        .from('citas')
        .delete()
        .eq('id', id)
        .eq('barberia_id', barberia.id);

      if (error) throw error;

      // Actualizar el estado local de React inmediatamente
      setCitas((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Error al eliminar la cita:', error);
      throw error;
    }
  };

  const crearServicio = async (servicioData: Omit<Servicio, 'id' | 'barberiaId'>): Promise<Servicio> => {
    try {
      if (!barberia) throw new Error("No se ha cargado ninguna barbería");

      const newServiceInsert = {
        barberia_id: barberia.id,
        nombre: servicioData.nombre,
        precio: servicioData.precio,
        duracion_minutos: servicioData.duracionMinutos,
        descripcion: servicioData.descripcion || null
      };

      const { data, error } = await supabase
        .from('servicios')
        .insert([newServiceInsert])
        .select()
        .single();

      if (error) throw error;

      const formattedService: Servicio = {
        id: data.id,
        barberiaId: data.barberia_id,
        nombre: data.nombre,
        precio: Number(data.precio),
        duracionMinutos: data.duracion_minutos,
        descripcion: data.descripcion || undefined
      };

      setServicios((prev) => [...prev, formattedService]);
      return formattedService;
    } catch (error) {
      console.error('Error al crear el servicio:', error);
      throw error;
    }
  };

  return {
    citas,
    servicios,
    barberia,
    loading,
    addCita,
    updateCitaEstado,
    eliminarServicio,
    eliminarCita,
    crearServicio,
    refetch,
  };
};