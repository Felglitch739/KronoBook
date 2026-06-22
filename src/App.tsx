import React from 'react';
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import { Layout } from './components/shared/Layout';
import { LandingPage } from './features/landing/LandingPage';
import { CarWashLanding } from './features/landing/CarWashLanding';
import { BookingFlow } from './features/agenda/BookingFlow';
import { Dashboard } from './features/dashboard/Dashboard';
import { Login } from './features/auth/Login';
import { Signup } from './features/auth/Signup';
import { Onboarding } from './features/onboarding/Onboarding';
import { KronoBookLanding } from './pages/KronoBookLanding';
import { useBookings } from './hooks/useBookings';
import { mockBarberia, mockServicios } from './data/mockData';
import { useAuth } from './context/AuthContext';

function TenantApp() {
  const { servicios, negocio, loading, addCita } = useBookings();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [userBusinessSlugs, setUserBusinessSlugs] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (user) {
      import('./lib/supabase').then(async ({ supabase }) => {
        const { data: staffData } = await supabase
          .from('negocio_staff')
          .select('negocio_id')
          .eq('user_id', user.id);
          
        if (staffData && staffData.length > 0) {
          const negocioIds = staffData.map(s => s.negocio_id);
          const { data: negociosData } = await supabase
            .from('negocios')
            .select('slug')
            .in('id', negocioIds);
            
          if (negociosData) {
            setUserBusinessSlugs(negociosData.map(n => n.slug));
          }
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
  const activeServicios = servicios.length > 0 ? servicios : mockServicios;

  // Check if it's the custom car wash partition
  const isCarWash = slug === 'kronowash' || slug === 'lavado';

  return (
    <Layout slug={slug || 'demo'} isStaffForCurrentSlug={isStaffForCurrentSlug}>
      <Routes>
        <Route 
          path="/" 
          element={
            isCarWash ? (
              <CarWashLanding
                barberia={activeNegocio}
                servicios={activeServicios}
                onBookClick={() => navigate(`/${slug}/reservar`)}
              />
            ) : (
              <LandingPage
                barberia={activeNegocio}
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
      </Routes>
    </Layout>
  );
}

// Admin component with active auth check + onboarding guard
function AdminApp() {
  const { user, loading: loadingAuth, hasBusiness } = useAuth();
  // El DashboardWrapper se encarga de usar useBookings según el slug de la ruta
  
  // Extraer el slug de la URL actual si existe
  const location = window.location.pathname;
  // '/admin/:slug/dashboard' -> match
  const match = location.match(/\/admin\/([^\/]+)\/dashboard/);
  const currentAdminSlug = match ? match[1] : undefined;

  if (loadingAuth || hasBusiness === null) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-400 text-lg animate-pulse font-medium">Verificando sesión...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Si tiene sesión pero NO tiene negocio → Onboarding
  if (hasBusiness === false) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <Layout isAdmin={true} slug={currentAdminSlug}>
      <Routes>
        {/* Opción B: Si no hay slug, mostrar selector de negocio */}
        <Route path="/dashboard" element={<SelectBusiness />} />
        {/* Dashboard específico por slug */}
        <Route path="/:slug/dashboard" element={<DashboardWrapper />} />
        
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

// Wrapper para inyectar useBookings dentro del contexto de /:slug/
function DashboardWrapper() {
  const { citas, servicios, negocio, updateCitaEstado, eliminarServicio, eliminarCita, crearServicio, refetch } = useBookings();
  const activeServicios = servicios.length > 0 ? servicios : mockServicios;

  return (
    <Dashboard 
      citas={citas} 
      servicios={activeServicios} 
      onUpdateStatus={updateCitaEstado} 
      barberiaId={negocio?.id} 
      barberiaName={negocio?.nombre}
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
          .select('negocio_id')
          .eq('user_id', user.id);
          
        if (staffData && staffData.length > 0) {
          const negocioIds = staffData.map(s => s.negocio_id);
          const { data: negociosData } = await supabase
            .from('negocios')
            .select('id, nombre, slug')
            .in('id', negocioIds);
            
          if (negociosData) {
            setNegocios(negociosData);
            // Si solo tiene 1 negocio, redirigir automáticamente
            if (negociosData.length === 1) {
              navigate(`/admin/${negociosData[0].slug}/dashboard`, { replace: true });
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
            onClick={() => navigate(`/admin/${negocio.slug}/dashboard`)}
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
      <div className="mt-12">
        <button onClick={() => navigate('/onboarding')} className="text-sky-400 hover:text-sky-300 font-medium underline">
          + Registrar otro negocio
        </button>
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

      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin/signup" element={<Signup />} />
      <Route path="/onboarding" element={<OnboardingGuard />} />
      <Route path="/admin/*" element={<AdminApp />} />
      {/* Rutas de tenants: /:slug y /:slug/reservar */}
      <Route path="/:slug/*" element={<TenantApp />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

/** Protección: Solo usuarios autenticados sin negocio pueden ver onboarding */
function OnboardingGuard() {
  const { user, loading, hasBusiness } = useAuth();

  if (loading || hasBusiness === null) {
    return (
      <div className="min-h-screen bg-[#0b0c0e] text-zinc-100 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-400 text-lg animate-pulse font-medium">Verificando sesión...</p>
      </div>
    );
  }

  // No autenticado → Login
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Ya tiene negocio → Admin
  if (hasBusiness === true) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Onboarding />;
}

export default App;
