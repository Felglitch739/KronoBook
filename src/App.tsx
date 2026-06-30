import React from 'react';
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import { Layout } from './components/shared/Layout';
import { LandingPage } from './features/landing/LandingPage';
import { CarWashLanding } from './features/landing/CarWashLanding';
import { BookingFlow } from './features/agenda/BookingFlow';
import { Dashboard } from './features/dashboard/Dashboard';
import { Login } from './features/auth/Login';
import { Signup } from './features/auth/Signup';
// Removed Onboarding
import { KronoBookLanding } from './pages/KronoBookLanding';
import { useBookings } from './hooks/useBookings';
import { mockBarberia, mockServicios } from './data/mockData';
import { useAuth } from './context/AuthContext';

function TenantApp() {
  const { user } = useAuth();
  const { servicios, negocio, loading, addCita } = useBookings();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [userBusinessSlugs, setUserBusinessSlugs] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (user) {
      import('./lib/supabase').then(async ({ supabase }) => {
        const { data: staffData } = await supabase
          .from('negocio_staff')
          .select(`
            negocio_id,
            negocios (slug)
          `)
          .eq('user_id', user.id);
          
        if (staffData && staffData.length > 0) {
          const slugs = staffData
            .map((s: any) => s.negocios?.slug)
            .filter(Boolean);
          setUserBusinessSlugs(slugs);
        }
      });
    } else {
      setUserBusinessSlugs([]);
    }
  }, [user]);

  const isStaffForCurrentSlug = Boolean(slug && userBusinessSlugs.includes(slug));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0c0e] text-zinc-100 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-400 text-lg animate-pulse font-medium">Cargando perfil de KronoBook...</p>
      </div>
    );
  }

  // Si no hay datos, usamos los mockData por defecto temporalmente para previsualización
  const activeNegocio = negocio || mockBarberia;
  const activeServicios = negocio ? servicios : mockServicios;

  // Check if it's the custom car wash partition
  const isCarWash = slug === 'dualfx' || slug === 'kronowash' || slug === 'lavado';

  return (
    <Layout slug={slug || 'demo'} isStaffForCurrentSlug={isStaffForCurrentSlug}>
      <Routes>
        <Route 
          path="/" 
          element={
            isCarWash ? (
              <CarWashLanding
                negocio={activeNegocio}
                servicios={activeServicios}
                onBookClick={() => navigate(`/${slug}/reservar`)}
              />
            ) : (
              <LandingPage
                negocio={activeNegocio}
                servicios={activeServicios}
                onBookClick={() => navigate(`/${slug}/reservar`)}
              />
            )
          } 
        />
        <Route 
          path="/reservar" 
          element={
            <BookingFlow
              servicios={activeServicios}
              onBookingComplete={(citaData) => {
                addCita(citaData);
                // Redirigir al inicio o página de éxito
                navigate(`/${slug}`);
              }}
              onCancel={() => navigate(`/${slug}`)}
              askForAddress={isCarWash}
            />
          } 
        />
        {/* Rutas administrativas del tenant protegido */}
        <Route path="/admin/*" element={<TenantAdminGuard />} />
      </Routes>
    </Layout>
  );
}

function TenantAdminGuard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-400 text-lg animate-pulse font-medium">Verificando sesión...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardWrapper />;
}

// Global Admin App for the business selector
function GlobalAdminApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-400 text-lg animate-pulse font-medium">Verificando sesión...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout isAdmin={true} slug="global">
      <SelectBusiness />
    </Layout>
  );
}

// Wrapper para inyectar useBookings dentro del contexto de /:slug/
function DashboardWrapper() {
  const { citas, servicios, negocio, loading, updateCitaEstado, eliminarServicio, eliminarCita, crearServicio, refetch } = useBookings();
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-400">Cargando dashboard...</p>
      </div>
    );
  }

  if (!negocio) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
        <h2 className="text-3xl font-black text-red-500">Acceso Denegado</h2>
        <p className="text-zinc-400">No tienes permisos para administrar este negocio o no existe.</p>
        <button 
          onClick={() => window.location.href = '/admin'}
          className="mt-4 px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-lg transition-all"
        >
          Ir a mis negocios
        </button>
      </div>
    );
  }

  return (
    <Dashboard 
      citas={citas} 
      servicios={servicios} 
      onUpdateStatus={updateCitaEstado} 
      negocioId={negocio?.id} 
      negocioName={negocio?.nombre}
      onAddSuccess={refetch} 
      onDeleteService={eliminarServicio}
      onDeleteCita={eliminarCita}
      onAddService={crearServicio}
    />
  );
}

// Componente para seleccionar a qué negocio entrar (Opción B)
function SelectBusiness() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [negocios, setNegocios] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (user) {
      import('./lib/supabase').then(async ({ supabase }) => {
        const { data: staffData } = await supabase
          .from('negocio_staff')
          .select(`
            negocio_id,
            negocios (
              id,
              nombre,
              slug
            )
          `)
          .eq('user_id', user.id);
          
        if (staffData && staffData.length > 0) {
          const negociosData = staffData
            .map((s: any) => s.negocios)
            .filter(Boolean);
            
          if (negociosData && negociosData.length > 0) {
            setNegocios(negociosData);
            if (negociosData.length === 1) {
              navigate(`/${negociosData[0].slug}/admin`, { replace: true });
            }
          }
        }
        setLoading(false);
      });
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h2 className="text-3xl font-black text-white mb-8">Selecciona un Negocio</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
        {negocios.map(negocio => (
          <button
            key={negocio.id}
            onClick={() => navigate(`/${negocio.slug}/admin`)}
            className="flex flex-col items-center justify-center p-8 bg-zinc-900 border border-white/10 hover:border-sky-500/50 rounded-2xl transition-all duration-300 hover:scale-105 group"
          >
            <div className="w-16 h-16 bg-zinc-800 group-hover:bg-sky-500/20 text-sky-400 rounded-2xl flex items-center justify-center mb-4 transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <h3 className="text-xl font-bold text-white text-center">{negocio.nombre}</h3>
            <p className="text-sm text-zinc-500 mt-2">/ {negocio.slug}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/* Página de marketing del producto SaaS */}
      <Route path="/" element={<KronoBookLanding />} />

      {/* Página 404 genérica */}
      <Route path="/404" element={
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center gap-4 text-center p-4">
          <h1 className="text-4xl font-black text-sky-400 tracking-wider">404</h1>
          <p className="text-xl font-bold text-zinc-300">Negocio No Encontrado</p>
          <p className="text-zinc-500 max-w-md">El enlace al que intentas acceder no corresponde a ningún negocio registrado en KronoBook.</p>
          <a href="/" className="mt-4 px-6 py-2.5 bg-sky-400 hover:bg-sky-300 text-zinc-950 font-black border-2 border-zinc-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-widest text-sm">
            Volver al inicio
          </a>
        </div>
      } />

      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/admin/*" element={<GlobalAdminApp />} />
      {/* Rutas de tenants: /:slug y /:slug/admin */}
      <Route path="/:slug/*" element={<TenantApp />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

export default App;
