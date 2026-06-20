import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: any;
  profile: any;
  loading: boolean;
  hasBusiness: boolean | null; // null = aún no verificado, true/false = verificado
  signOut: () => Promise<void>;
  recheckBusiness: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasBusiness, setHasBusiness] = useState<boolean | null>(null);

  const checkBusiness = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('barberias')
        .select('id')
        .eq('owner_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error verificando negocio:', error.message);
        setHasBusiness(false);
      } else {
        setHasBusiness(!!data);
      }
    } catch {
      setHasBusiness(false);
    }
  }, []);

  const recheckBusiness = useCallback(async () => {
    if (user) {
      await checkBusiness(user.id);
    }
  }, [user, checkBusiness]);

  useEffect(() => {
    // 1. Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser);
        checkBusiness(currentUser.id);
      } else {
        setProfile(null);
        setHasBusiness(null);
        setLoading(false);
      }
    });

    // 2. Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser);
        checkBusiness(currentUser.id);
      } else {
        setProfile(null);
        setHasBusiness(null);
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
    <AuthContext.Provider value={{ user, profile, loading, hasBusiness, signOut, recheckBusiness }}>
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
