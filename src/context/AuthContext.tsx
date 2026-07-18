import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: any;
  profile: any;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // 2. Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Ignoramos estos eventos para no interrumpir el flujo de recuperación de contraseña.
      // PASSWORD_RECOVERY: el usuario llegó desde el link del email.
      // USER_UPDATED: se disparó internamente al actualizar la contraseña (supabase renueva el token).
      // En ambos casos, UpdatePassword.tsx maneja su propio ciclo de vida.
      if (event === 'PASSWORD_RECOVERY' || event === 'USER_UPDATED') {
        return;
      }

      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async (currentUser: any) => {
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
      } else {
        // Fallback si no hay fila en 'perfiles' para este usuario
        // Asignamos 'owner' por defecto para que cargue SU negocio via owner_id
        setProfile({
          id: currentUser.id,
          nombre: currentUser.user_metadata?.nombre || currentUser.email?.split('@')[0] || 'Administrador',
          rol: 'owner',
        });
      }
    } catch (err) {
      console.error("Error al obtener perfil:", err);
      // Fallback en caso de error de base de datos
      setProfile({
        id: currentUser.id,
        nombre: currentUser.email?.split('@')[0] || 'Administrador',
        rol: 'owner',
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
