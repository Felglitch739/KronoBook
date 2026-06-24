import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { type Cita, type Servicio, type Negocio } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const useBookings = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();
  
  const [citas, setCitas] = useState<Cita[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refetch = () => setRefreshTrigger((prev) => prev + 1);

  // Detectar si el usuario está dentro del panel de administración o superadmin
  const isAdminPage = location.pathname.includes('/admin') || location.pathname.startsWith('/superadmin');

  useEffect(() => {
    const loadTenantData = async () => {
      setLoading(true);
      try {
        let currentBusiness = null;

        // CASO A: ESTAMOS EN EL DASHBOARD DE ADMINISTRACIÓN
        if (isAdminPage) {
          if (!user) {
            setNegocio(null);
            setServicios([]);
            setCitas([]);
            setLoading(false);
            return;
          }

          if (slug) {
            // Buscar el negocio por slug al que el usuario tiene acceso
            const { data: staffData } = await supabase
              .from('negocio_staff')
              .select(`
                negocio_id,
                negocios (*)
              `)
              .eq('user_id', user.id);
            
            if (staffData && staffData.length > 0) {
              const matchedStaff = staffData.find((s: any) => s.negocios && s.negocios.slug === slug);
              if (matchedStaff) {
                currentBusiness = matchedStaff.negocios;
              }
            }
          }
        } 
        // CASO B: ESTAMOS EN LA LANDING PÚBLICA (VISTA DEL CLIENTE)
        else {
          const currentSlug = slug || 'barberia-chaga';
          const { data, error } = await supabase
            .from('negocios')
            .select('*')
            .eq('slug', currentSlug)
            .maybeSingle();

          if (error || !data) {
            if (slug) {
              navigate('/404');
            }
            return;
          } else {
            currentBusiness = data;
          }
        }

        if (currentBusiness) {
          setNegocio({
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
            .eq('negocio_id', currentBusiness.id)
            .order('precio', { ascending: true });

          // Descargar las citas vinculadas a este negocio
          const { data: citasData } = await supabase
            .from('citas')
            .select('*')
            .eq('negocio_id', currentBusiness.id)
            .order('fecha', { ascending: false });

          if (srvData) {
            const formattedServicios: Servicio[] = srvData.map((data: any) => ({
              id: data.id,
              negocioId: data.negocio_id,
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
              negocio_id: string;
              servicio_id: string;
              cliente_nombre: string;
              cliente_telefono: string;
              cliente_email: string | null;
              fecha: string;
              hora: string;
              estado: string;
              notas: string | null;
              propina: number | null;
              direccion_servicio: string | null;
            }
            const formattedCitas: Cita[] = (citasData as SupabaseCita[]).map((data) => ({
              id: data.id,
              negocioId: data.negocio_id,
              servicioId: data.servicio_id,
              clienteNombre: data.cliente_nombre,
              clienteTelefono: data.cliente_telefono,
              clienteEmail: data.cliente_email || undefined,
              fecha: data.fecha,
              hora: data.hora,
              estado: data.estado as Cita['estado'],
              notas: data.notas || undefined,
              propina: data.propina || 0,
              direccionServicio: data.direccion_servicio || undefined
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

  const addCita = async (citaData: Omit<Cita, 'id' | 'estado' | 'negocioId'>) => {
    if (!negocio) throw new Error("No negocio loaded");
    try {
      const newCitaInsert = {
        negocio_id: negocio.id,
        servicio_id: citaData.servicioId,
        cliente_nombre: citaData.clienteNombre,
        cliente_telefono: citaData.clienteTelefono,
        cliente_email: citaData.clienteEmail || null,
        fecha: citaData.fecha,
        hora: citaData.hora,
        estado: 'pendiente',
        notas: citaData.notas || null,
        direccion_servicio: citaData.direccionServicio || null
      };

      const { data, error } = await supabase
        .from('citas')
        .insert([newCitaInsert])
        .select()
        .single();

      if (error) throw error;

      const formattedCita: Cita = {
        id: data.id,
        negocioId: data.negocio_id,
        servicioId: data.servicio_id,
        clienteNombre: data.cliente_nombre,
        clienteTelefono: data.cliente_telefono,
        clienteEmail: data.cliente_email,
        fecha: data.fecha,
        hora: data.hora,
        estado: data.estado as Cita['estado'],
        notas: data.notas,
        propina: data.propina || 0,
        direccionServicio: data.direccion_servicio || undefined
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
      if (!negocio) {
        throw new Error("No se ha cargado ningún negocio para actualizar la cita");
      }

      const { error } = await supabase
        .from('citas')
        .update({ estado })
        .eq('id', id)
        .eq('negocio_id', negocio.id);

      if (error) {
        throw error;
      }

      setCitas((prev) =>
        prev.map((c) => (c.id === id ? { ...c, estado } : c))
      );
    } catch (error) {
      console.error('Error al actualizar estado de la cita en Supabase:', error);
    }
  };

  const updateBarberiaAppearance = async (tema: string, colorPrimario: string, colorSecundario: string) => {
    try {
      if (!negocio) throw new Error("No se ha cargado ningún negocio");
      
      const { error } = await supabase
        .from('negocios')
        .update({
          tema,
          color_primario: colorPrimario,
          color_secundario: colorSecundario
        })
        .eq('id', negocio.id);

      if (error) throw error;

      setNegocio({
        ...negocio,
        tema: tema as any,
        colorPrimario,
        colorSecundario
      });
    } catch (error) {
      console.error('Error al actualizar apariencia en Supabase:', error);
      throw error;
    }
  };

  const eliminarServicio = async (id: string) => {
    try {
      if (!negocio) throw new Error("No se ha cargado ningún negocio");
      
      const { error } = await supabase
        .from('servicios')
        .delete()
        .eq('id', id)
        .eq('negocio_id', negocio.id);

      if (error) throw error;

      setServicios((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error('Error al eliminar el servicio:', error);
      throw error;
    }
  };

  const eliminarCita = async (id: string) => {
    try {
      if (!negocio) throw new Error("No se ha cargado ningún negocio");

      const { error } = await supabase
        .from('citas')
        .delete()
        .eq('id', id)
        .eq('negocio_id', negocio.id);

      if (error) throw error;

      setCitas((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Error al eliminar la cita:', error);
      throw error;
    }
  };

  const crearServicio = async (servicioData: Omit<Servicio, 'id' | 'negocioId'>): Promise<Servicio> => {
    try {
      if (!negocio) throw new Error("No se ha cargado ningún negocio");

      const newServiceInsert = {
        negocio_id: negocio.id,
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
        negocioId: data.negocio_id,
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
    negocio,
    loading,
    addCita,
    updateCitaEstado,
    eliminarServicio,
    eliminarCita,
    crearServicio,
    updateBarberiaAppearance,
    refetch,
  };
};