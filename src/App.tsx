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
  const { servicios, barberia, loading, addCita } = useBookings();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0c0e] text-zinc-100 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-400 text-lg animate-pulse font-medium">Cargando perfil de KronoBook...</p>
      </div>
    );
  }

  // Si no hay datos, usamos los mockData por defecto temporalmente para previsualización
  const activeBarberia = barberia || mockBarberia;
  const activeServicios = servicios.length > 0 ? servicios : mockServicios;

  // Check if it's the custom car wash partition
  const isCarWash = slug === 'kronowash' || slug === 'lavado';

  return (
    <Layout slug={slug || 'demo'}>
      <Routes>
        <Route 
          path="/" 
          element={
            isCarWash ? (
              <CarWashLanding
                barberia={activeBarberia}
                servicios={activeServicios}
                onBookClick={() => navigate(`/${slug}/reservar`)}
              />
            ) : (
              <LandingPage
                barberia={activeBarberia}
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
  const { citas, servicios, barberia, updateCitaEstado, eliminarServicio, eliminarCita, crearServicio, refetch } = useBookings();
  const activeServicios = servicios.length > 0 ? servicios : mockServicios;

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
    <Layout isAdmin={true} slug={barberia?.slug}>
      <Routes>
        <Route 
          path="/dashboard" 
          element={
            <Dashboard 
              citas={citas} 
              servicios={activeServicios} 
              onUpdateStatus={updateCitaEstado} 
              barberiaId={barberia?.id} 
              barberiaName={barberia?.nombre}
              onAddSuccess={refetch} 
              onDeleteService={eliminarServicio}
              onDeleteCita={eliminarCita}
              onAddService={crearServicio}
            />
          } 
        />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </Layout>
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
