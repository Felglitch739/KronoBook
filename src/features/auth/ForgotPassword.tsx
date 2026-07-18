import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setIsError(false);

    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/update-password`
        : 'https://kronobook.vercel.app/update-password';

    console.log('URL de redirección que se enviará a Supabase:', redirectTo);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      setIsError(true);
      setMessage(`Error: ${error.message}`);
    } else {
      setSent(true);
      setMessage('Te hemos enviado un correo con el enlace para restablecer tu contraseña. Revisa también tu carpeta de spam.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0b0c0e] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-sky-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-zinc-800/20 rounded-full blur-[150px] pointer-events-none" />

      {/* Card */}
      <div className="max-w-md w-full bg-[#1e2326]/70 backdrop-blur-xl p-8 rounded-3xl border border-zinc-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-zinc-700/50 transition-all duration-300">

        {/* Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-600 via-sky-400 to-cyan-500 rounded-t-3xl" />

        <div className="text-center mb-8 mt-2">
          {/* Icon */}
          <div className="inline-flex items-center justify-center p-3 bg-zinc-900 rounded-2xl border border-zinc-800/80 shadow-md mb-4 group-hover:border-sky-500/20 transition-colors">
            <svg className="w-8 h-8 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black tracking-wider bg-gradient-to-r from-sky-400 via-sky-500 to-cyan-600 bg-clip-text text-transparent">
            Recuperar Contraseña
          </h2>
          <p className="text-sm text-zinc-400 font-medium mt-1">
            Te enviaremos un enlace a tu correo
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

        {!sent ? (
          <form onSubmit={handleReset} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1e2326]/50 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-sky-500/80 focus:ring-4 focus:ring-sky-500/5 transition-all text-sm"
                  placeholder="tu@correo.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group/btn bg-sky-500 hover:bg-sky-400 disabled:opacity-75 disabled:hover:bg-sky-500 text-zinc-950 font-bold py-3.5 px-4 rounded-xl transition-all duration-300 border border-sky-500/20 active:scale-[0.98] overflow-hidden cursor-pointer flex justify-center items-center gap-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out" />
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-zinc-950" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Enviando...</span>
                </>
              ) : (
                <span>Enviar enlace de recuperación</span>
              )}
            </button>
          </form>
        ) : (
          /* Estado "enviado": mostrar botón de reenvío */
          <button
            onClick={() => { setSent(false); setMessage(null); }}
            className="w-full border border-zinc-700 hover:border-zinc-600 text-zinc-400 hover:text-zinc-300 font-semibold py-3 px-4 rounded-xl transition-all text-sm"
          >
            ¿No llegó? Intentar con otro correo
          </button>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sky-400 hover:text-sky-300 font-bold text-sm transition-colors inline-flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
};
