import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

export const UpdatePassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [done, setDone] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const navigate = useNavigate();

  // Supabase maneja automáticamente el token del enlace de email y establece la sesión.
  // Solo esperamos a que onAuthStateChange dispare con el evento PASSWORD_RECOVERY.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });

    // También verificar si ya hay sesión activa (el usuario llegó con token válido)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsError(false);
    setMessage(null);

    if (password.length < 6) {
      setIsError(true);
      setMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirm) {
      setIsError(true);
      setMessage('Las contraseñas no coinciden. Inténtalo de nuevo.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setIsError(true);
      setMessage(`Error al actualizar: ${error.message}`);
    } else {
      setDone(true);
      setMessage('¡Contraseña actualizada con éxito! Redirigiendo al inicio de sesión...');
      setTimeout(() => {
        supabase.auth.signOut().then(() => navigate('/login', { replace: true }));
      }, 2500);
    }
    setLoading(false);
  };

  // Si el enlace no es válido / no hay sesión activa
  if (!sessionReady) {
    return (
      <div className="min-h-screen bg-[#0b0c0e] flex flex-col justify-center items-center px-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-sky-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="max-w-md w-full bg-[#1e2326]/70 backdrop-blur-xl p-8 rounded-3xl border border-zinc-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-center">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-600 via-sky-400 to-cyan-500 rounded-t-3xl" />
          <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 font-medium">Verificando enlace de recuperación...</p>
          <p className="text-zinc-600 text-xs mt-2">Si esto tarda mucho, el enlace puede haber expirado.</p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="mt-6 text-sky-400 hover:text-sky-300 font-bold text-sm transition-colors"
          >
            Solicitar nuevo enlace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0c0e] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-zinc-800/20 rounded-full blur-[150px] pointer-events-none" />

      {/* Card */}
      <div className="max-w-md w-full bg-[#1e2326]/70 backdrop-blur-xl p-8 rounded-3xl border border-zinc-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-zinc-700/50 transition-all duration-300">

        {/* Top Accent Bar — verde para diferenciarlo */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-500 rounded-t-3xl" />

        <div className="text-center mb-8 mt-2">
          <div className="inline-flex items-center justify-center p-3 bg-zinc-900 rounded-2xl border border-zinc-800/80 shadow-md mb-4 group-hover:border-emerald-500/20 transition-colors">
            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black tracking-wider bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
            Nueva Contraseña
          </h2>
          <p className="text-sm text-zinc-400 font-medium mt-1">
            Elige una contraseña segura para tu cuenta
          </p>
        </div>

        {/* Message banners */}
        {message && (
          <div
            className={`text-sm p-4 rounded-2xl mb-6 flex items-start gap-3 animate-fade-in ${
              isError
                ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            }`}
          >
            {isError ? (
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="font-medium leading-relaxed">{message}</span>
          </div>
        )}

        {!done && (
          <form onSubmit={handleUpdate} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Nueva Contraseña
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1e2326]/50 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/80 focus:ring-4 focus:ring-emerald-500/5 transition-all text-sm"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </span>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full bg-[#1e2326]/50 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/80 focus:ring-4 focus:ring-emerald-500/5 transition-all text-sm"
                  placeholder="Repite tu contraseña"
                />
              </div>
            </div>

            {/* Strength hint */}
            {password.length > 0 && (
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      password.length >= level * 3
                        ? password.length >= 12
                          ? 'bg-emerald-500'
                          : password.length >= 8
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                        : 'bg-zinc-800'
                    }`}
                  />
                ))}
                <span className="text-xs text-zinc-500 w-16 text-right">
                  {password.length >= 12 ? 'Fuerte' : password.length >= 8 ? 'Media' : 'Débil'}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group/btn bg-emerald-600 hover:bg-emerald-500 disabled:opacity-75 disabled:hover:bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 border border-emerald-500/20 active:scale-[0.98] overflow-hidden cursor-pointer flex justify-center items-center gap-2 mt-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out" />
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Actualizando...</span>
                </>
              ) : (
                <span>Cambiar Contraseña</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
