import React from 'react';
import { Sparkles, Clock } from 'lucide-react';
import { type Negocio, type Servicio } from '../../types';
import { themeConfig } from '../../config/themeConfig';

interface LandingPageProps {
  negocio: Negocio;
  servicios: Servicio[];
  onBookClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ negocio, servicios, onBookClick }) => {
  // ── Colores de marca dinámicos con fallback neutral ──────────────────
  // Cada negocio puede tener su propio color_primario / color_secundario en Supabase.
  // Si no están definidos, usamos ámbar clásico de barbería.
  const primary = negocio.colorPrimario ?? '#1d4ed8'; // Barber Pole Blue
  const secondary = negocio.colorSecundario ?? '#b91c1c'; // Barber Pole Red

  // Para los textos sobre fondo primario: si el color es muy oscuro usamos blanco, si no zinc-950
  // Heurística rápida: si empieza con #1 o #0 asumimos oscuro → texto blanco
  const primaryTextColor = (() => {
    const hex = primary.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.55 ? '#09090b' : '#fafafa'; // zinc-950 ó zinc-50
  })();

  const tema = negocio.tema || 'elegant';
  const theme = themeConfig[tema];

  return (
    <div
      className={`min-h-screen flex flex-col w-full ${theme.bg} ${theme.text} ${theme.fontBase}`}
      style={{
        '--color-primario': primary,
        '--color-secundario': secondary
      } as React.CSSProperties}
    >

      {/* ─── HERO SECTION — oscuro con foto de fondo ─── */}
      <section className={`relative w-full min-h-[88vh] flex flex-col items-center justify-center py-20 px-4 overflow-hidden ${theme.bg}`}>
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80")' }}
        />
        {/* Dark Overlay */}
        <div className={`absolute inset-0 z-0 ${theme.overlay}`} />
        {/* Bottom fade to dark glass background */}
        <div className={`absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t ${theme.fadeBottom} to-transparent z-0 pointer-events-none`} />

        {/* Content */}
        <header className="text-center max-w-4xl mx-auto z-10 relative mt-8">
          {/* Eyebrow tag con color primario del negocio */}
          <div className="inline-flex items-center gap-3 mb-10">
            <div className="h-px w-10" style={{ backgroundColor: primary }}></div>
            <span
              className="font-black tracking-[0.3em] uppercase text-xs px-3 py-1 border"
              style={{ color: primary, borderColor: `${primary}55` }}
            >
              Barbería Auténtica
            </span>
            <div className="h-px w-10" style={{ backgroundColor: primary }}></div>
          </div>

          {/* Título con fuente Serif */}
          <h1 className={`${theme.fontTitle} text-6xl md:text-8xl lg:text-9xl font-black mb-6 leading-none tracking-tight ${theme.title} drop-shadow-2xl`}>
            {negocio.nombre}
          </h1>

          <div className={`${theme.textMuted} text-base md:text-lg mb-12 max-w-xl mx-auto font-light leading-relaxed space-y-2`}>
            <p className="uppercase tracking-widest text-xs text-zinc-400 font-semibold">{negocio.direccion}</p>
            <p className="text-sm font-semibold" style={{ color: primary }}>{negocio.horario}</p>
          </div>

          {/* CTA — Neobrutalismo con color primario del negocio o override del tema */}
          <button
            onClick={onBookClick}
            className={`
              group relative font-black uppercase tracking-widest
              px-10 py-4 md:px-12 md:py-5
              rounded-xl
              transition-all duration-500 ease-out
              text-base md:text-lg cursor-pointer
              shadow-[0_0_30px_var(--color-primario)] hover:shadow-[0_0_50px_var(--color-primario)]
              hover:-translate-y-1
            `}
            style={tema !== 'light' ? { backgroundColor: primary, color: primaryTextColor } : undefined}
          >
            <span className="flex items-center justify-center gap-3">
              Reserva tu cita
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </button>
        </header>
      </section>

      {/* ─── SERVICES SECTION — fondo oscuro profundo, glassmorphism ─── */}
      <section className={`w-full ${theme.bg} py-24 px-4`}>
        <div className="max-w-6xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>

          {/* Header de sección */}
          <div className="mb-16">
            <p className={`uppercase tracking-[0.3em] text-xs font-black ${theme.textMuted} mb-3`}>Lo que ofrecemos</p>
            <h2
              className={`${theme.fontTitle} text-4xl md:text-5xl font-black ${theme.title} inline-block border-b-4 pb-2 leading-tight`}
              style={{ borderColor: secondary }}
            >
              Nuestros Servicios
            </h2>
          </div>

          {/* Grid de tarjetas — carbón sobre crema */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {servicios.map((servicio) => (
              <div
                key={servicio.id}
                className={`
                  group ${theme.bgSecondary} ${theme.glass} ${theme.text}
                  border ${theme.border} rounded-2xl
                  ${theme.shadow} hover:shadow-[var(--color-primario)]/20
                  hover:-translate-y-1 ${theme.borderHover}
                  transition-all duration-500 ease-out
                  p-6 md:p-8 flex flex-col h-full cursor-pointer
                `}
              >
                {/* Header del servicio con icono sutil */}
                <div className="flex items-start justify-between mb-4">
                  <h3
                    className={`${theme.fontTitle} text-xl md:text-2xl font-black leading-tight`}
                    style={{ color: primary }}
                  >
                    {servicio.nombre}
                  </h3>
                  <div className="p-2 rounded-xl bg-[var(--color-primario)]/10 text-[var(--color-primario)] group-hover:bg-[var(--color-primario)]/20 transition-colors">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>
                <p className={`${theme.textMuted} mb-8 flex-grow leading-relaxed text-sm md:text-base`}>
                  {servicio.descripcion}
                </p>

                {/* Footer de la tarjeta */}
                <div className={`flex justify-between items-end pt-5 border-t ${theme.border} mt-auto`}>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-0.5 font-bold">Precio</span>
                    <span className={`font-black text-2xl md:text-3xl ${theme.title}`}>${servicio.precio}</span>
                    <span className="text-zinc-500 text-xs font-semibold ml-1">MXN</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-0.5 font-bold">Duración</span>
                    <span className={`text-sm font-black ${theme.title} ${theme.bg} px-3 py-1.5 border ${theme.border} rounded-lg flex items-center gap-1.5 transition-colors duration-300 group-hover:${theme.bgSecondary} group-hover:${theme.borderHover}`}>
                      <Clock className="w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110" style={{ color: primary }} />
                      {servicio.duracionMinutos} min
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA secundario al fondo de la sección crema */}
          <div className="mt-16 text-center">
            <button
              onClick={onBookClick}
              className={`
              font-black uppercase tracking-widest
              px-10 py-4 rounded-xl
              transition-all duration-500 ease-out
              text-sm cursor-pointer
              shadow-md hover:shadow-lg hover:-translate-y-1
            `}
              style={tema !== 'elegant' ? { backgroundColor: secondary, color: '#fafafa' } : undefined}
            >
              Reservar ahora →
            </button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER minimal ─── */}
      <footer className={`${theme.bgSecondary} border-t ${theme.border} py-12 px-4 flex flex-col items-center justify-center`}>
        <p className={`${theme.textMuted} text-xs tracking-widest uppercase font-semibold mb-4`}>
          {negocio.nombre}
        </p>
        <a href="/" className="group flex items-center gap-2 opacity-50 hover:opacity-100 transition-all duration-300">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold group-hover:text-zinc-400">Powered by</span>
          <span className="font-black text-sm tracking-tight text-zinc-300 group-hover:text-zinc-100 transition-colors">
            Krono<span className="text-[#38bdf8]">Book</span>
          </span>
        </a>
      </footer>
    </div>
  );
};
