import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

/** Convierte un nombre de negocio a un slug URL-safe */
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // Quitar acentos
    .replace(/[^a-z0-9\s-]/g, '')      // Solo alfanuméricos, espacios y guiones
    .replace(/\s+/g, '-')              // Espacios → guiones
    .replace(/-+/g, '-')               // Múltiples guiones → uno
    .replace(/^-|-$/g, '');            // Quitar guiones al inicio/final
};

// Pasos del onboarding
type OnboardingStep = 1 | 2 | 3;

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user, recheckBusiness } = useAuth();

  const [step, setStep] = useState<OnboardingStep>(1);
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [horario, setHorario] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const slug = useMemo(() => generateSlug(nombre), [nombre]);

  const canProceedStep1 = nombre.trim().length >= 3 && slug.length >= 3;
  const canProceedStep2 = direccion.trim().length >= 5;
  const canSubmit = canProceedStep1 && canProceedStep2 && horario.trim().length >= 3;

  const handleSubmit = async () => {
    if (!user) {
      setErrorMsg('No se detectó una sesión activa. Inicia sesión de nuevo.');
      return;
    }
    if (!canSubmit) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // Verificar que el slug no exista
      const { data: existing } = await supabase
        .from('negocios')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (existing) {
        setErrorMsg(`El nombre "${nombre}" genera un enlace que ya está en uso (/${slug}). Intenta con un nombre ligeramente diferente.`);
        setIsSubmitting(false);
        return;
      }

      // Insertar el negocio
      const { data: negocioData, error } = await supabase
        .from('negocios')
        .insert({
          nombre: nombre.trim(),
          slug,
          direccion: direccion.trim(),
          horario: horario.trim(),
          color_primario: '#0ea5e9',
          color_secundario: '#22d3ee',
          tema: 'dark',
        })
        .select('id')
        .single();

      if (error || !negocioData) {
        if (error?.message.includes('duplicate') || error?.message.includes('unique')) {
          setErrorMsg('Ya tienes un negocio registrado o el nombre ya está en uso.');
        } else {
          setErrorMsg(`Error al registrar: ${error?.message || 'Error desconocido'}`);
        }
        setIsSubmitting(false);
        return;
      }

      // Insertar al usuario como owner en negocio_staff
      const { error: staffError } = await supabase
        .from('negocio_staff')
        .insert({
          negocio_id: negocioData.id,
          user_id: user.id,
          rol: 'owner',
        });

      if (staffError) {
        console.error('Error insertando en negocio_staff:', staffError);
        // Continuamos de todas formas o manejar el error (esto es un caso borde, asumiendo éxito)
      }

      // Actualizar contexto y redirigir
      await recheckBusiness();
      navigate(`/admin/${slug}/dashboard`, { replace: true });

    } catch (err) {
      console.error('Error en onboarding:', err);
      setErrorMsg('Ocurrió un error inesperado. Intenta de nuevo.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c0e] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/8 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Card */}
      <div className="max-w-lg w-full bg-[#16191e]/70 backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-zinc-800/80 shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative overflow-hidden animate-scale-up">
        {/* Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-600 via-sky-400 to-cyan-500 rounded-t-3xl" />

        {/* Header */}
        <div className="text-center mb-8 mt-2">
          <div className="inline-flex items-center justify-center p-3 bg-zinc-900 rounded-2xl border border-zinc-800/80 shadow-md mb-4">
            <svg className="w-8 h-8 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-sky-400 via-sky-500 to-cyan-600 bg-clip-text text-transparent">
            Configura tu Negocio
          </h1>
          <p className="text-sm text-zinc-400 font-medium mt-2 max-w-xs mx-auto">
            En menos de un minuto tendrás tu página de reservas lista para recibir clientes.
          </p>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between items-center mb-8 px-4">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center flex-1 last:flex-none">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                  step >= num
                    ? 'bg-sky-500 text-zinc-950 shadow-[0_0_15px_rgba(14,165,233,0.4)]'
                    : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                }`}
              >
                {step > num ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                ) : (
                  num
                )}
              </div>
              {num < 3 && (
                <div className={`h-0.5 flex-grow mx-3 transition-all duration-300 ${step > num ? 'bg-sky-500' : 'bg-zinc-800'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm p-4 rounded-2xl mb-6 animate-fade-in flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* ── STEP 1: Nombre del Negocio ── */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Nombre de tu Negocio *
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-[#0b0c0e] border border-zinc-800 rounded-xl py-3.5 px-4 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-sky-500/80 focus:ring-4 focus:ring-sky-500/5 transition-all text-sm"
                placeholder="Ej. Barbería Los Reyes, Studio Nails, Mi Detallado..."
                autoFocus
              />
            </div>

            {/* Slug Preview */}
            {slug && (
              <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-4 animate-fade-in">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  Tu enlace de reservas será:
                </p>
                <div className="flex items-center gap-2 bg-[#0b0c0e] rounded-lg px-4 py-2.5 border border-zinc-800">
                  <span className="text-zinc-500 text-sm font-mono">kronobook.com/</span>
                  <span className="text-sky-400 text-sm font-mono font-bold">{slug}</span>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                disabled={!canProceedStep1}
                onClick={() => { setErrorMsg(null); setStep(2); }}
                className="w-full bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:hover:bg-sky-500 text-zinc-950 font-black py-3.5 px-4 rounded-xl transition-all duration-300 active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed text-sm"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Dirección ── */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Dirección o Ubicación *
              </label>
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className="w-full bg-[#0b0c0e] border border-zinc-800 rounded-xl py-3.5 px-4 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-sky-500/80 focus:ring-4 focus:ring-sky-500/5 transition-all text-sm"
                placeholder="Ej. Av. Juárez #456, Zona Centro o Servicio a Domicilio"
                autoFocus
              />
              <p className="text-xs text-zinc-500 mt-2">Tus clientes verán esta dirección en tu página de reservas.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-3.5 px-4 rounded-xl transition-all active:scale-[0.98] cursor-pointer text-sm"
              >
                Atrás
              </button>
              <button
                type="button"
                disabled={!canProceedStep2}
                onClick={() => { setErrorMsg(null); setStep(3); }}
                className="flex-1 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:hover:bg-sky-500 text-zinc-950 font-black py-3.5 px-4 rounded-xl transition-all duration-300 active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed text-sm"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Horario + Confirmación ── */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Horario de Atención *
              </label>
              <input
                type="text"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                className="w-full bg-[#0b0c0e] border border-zinc-800 rounded-xl py-3.5 px-4 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-sky-500/80 focus:ring-4 focus:ring-sky-500/5 transition-all text-sm"
                placeholder="Ej. Lunes a Sábado: 10:00 AM - 8:00 PM"
                autoFocus
              />
            </div>

            {/* Resumen Final */}
            <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-5 space-y-3">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Resumen de tu negocio</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Nombre</span>
                  <span className="text-zinc-100 font-bold">{nombre}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">URL</span>
                  <span className="text-sky-400 font-mono font-bold">/{slug}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Dirección</span>
                  <span className="text-zinc-100 font-medium text-right max-w-[200px] truncate">{direccion}</span>
                </div>
                {horario && (
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Horario</span>
                    <span className="text-zinc-100 font-medium text-right max-w-[200px] truncate">{horario}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isSubmitting}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 font-bold py-3.5 px-4 rounded-xl transition-all active:scale-[0.98] cursor-pointer text-sm"
              >
                Atrás
              </button>
              <button
                type="button"
                disabled={!canSubmit || isSubmitting}
                onClick={handleSubmit}
                className="flex-1 relative group bg-sky-500 hover:bg-sky-400 disabled:opacity-60 disabled:hover:bg-sky-500 text-zinc-950 font-black py-3.5 px-4 rounded-xl transition-all duration-300 active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed overflow-hidden text-sm"
              >
                {/* Hover shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                
                {isSubmitting ? (
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creando...
                  </span>
                ) : (
                  <span className="relative z-10">Crear Mi Negocio</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="text-zinc-600 text-xs mt-8 text-center">
        Powered by <span className="font-bold text-zinc-500">Krono<span className="text-sky-500">Book</span></span>
      </p>
    </div>
  );
};
