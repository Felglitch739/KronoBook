import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import BarberiaChagaPreview from '../assets/BarberiaChaga_Preview.png';
import { useSEO } from '../hooks/useSEO';
import { Logo } from '../components/shared/Logo';

// ──────────────────────────────────────────────────────────────────────
//  KronoBookLanding — Landing page de marketing del producto SaaS
//  Paleta: #0b0c0e (Modo Oscuro) + #38bdf8 / sky-400 (Celeste Brillante)
//  Ruta: /
// ──────────────────────────────────────────────────────────────────────

const WHATSAPP_NUMBER = '526868000000';
const WHATSAPP_MSG = encodeURIComponent(
  '¡Hola! Me interesa registrar mi negocio en KronoBook. ¿Me dan más información?'
);
const WHATSAPP_URL = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${WHATSAPP_MSG}`;

// Logo component is imported from components/shared/Logo

// ─────────────────────────────────────────────────────────────────────
export const KronoBookLanding: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  // Configuración de Meta Tags dinámicos para optimización SEO
  useSEO({
    title: "KronoBook | Domina tu Agenda y Gestiona tu Negocio en Línea",
    description: "KronoBook automatiza las reservas de tu spa, estética, barbería, consultorio o cualquier negocio de citas con POS integrado. Gestiona tu agenda en tiempo real y ofrece la mejor experiencia de reserva digital a tus clientes.",
    keywords: "reserva de citas, agenda digital, saas de citas, punto de venta barberia, software gestion estetica, control de citas online, pos para spa",
    ogTitle: "KronoBook | Domina tu Agenda y Gestiona tu Negocio en Línea",
    ogDescription: "Reserva de citas 24/7 con cobro POS integrado para barberías, estéticas y spas. Configuración en 48 horas.",
    ogImage: "https://kronobook.com/og-image.png",
    ogType: "website",
  });

  // Mouse tracking: actualiza las variables CSS sin re-renders de React
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    heroRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    heroRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <div className="min-h-screen bg-[#0b0c0e] text-zinc-100 flex flex-col w-full relative overflow-x-hidden">

      {/* ── NAV ── */}
      <header className="w-full border-b border-zinc-800/60 sticky top-0 bg-[#0b0c0e]/90 backdrop-blur-md z-50">
        <nav className="w-full px-6 py-4 flex items-center justify-between" aria-label="Navegación principal">
          <Link to="/" className="cursor-pointer">
            <Logo size="sm" />
            <span className="ml-1.5 text-[10px] font-bold text-sky-500 border border-sky-500/30 bg-sky-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider group-hover:bg-sky-500/20 transition-all duration-300">
              Beta
            </span>
          </Link>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-black uppercase tracking-wide text-zinc-950 bg-sky-400 hover:bg-sky-300 active:scale-95 transition-all duration-300 px-4 py-2 rounded-lg hidden sm:flex items-center gap-2"
          >
            Registrar mi Negocio
          </a>
        </nav>
      </header>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 flex flex-col w-full">

        {/* ── HERO ── */}
      {/*
        La máscara difumina el Hero hacia la sección siguiente.
        onMouseMove escribe coordenadas del cursor en variables CSS nativas
        para que la "linterna" del Dot Grid las consuma sin re-renders.
      */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="relative flex flex-col items-center justify-center text-center min-h-[90vh] px-4 group/hero"
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
          maskImage:       'linear-gradient(to bottom, black 80%, transparent 100%)',
        }}
      >
        {/* ── CAPA 1: Dot Grid Base — malla sutil siempre visible ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(56,189,248,0.18) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* ── CAPA 2: Dot Grid Interactivo — iluminación de linterna (Desktop) ── */}
        {/*
          Esta segunda capa es idéntica pero tiene 100% de opacidad en los puntos.
          La máscara CSS la recorta a un círculo de 250px centrado en el cursor.
          El resultado: los puntos "brillan" solo donde está el mouse.
        */}
        <div
          className="absolute inset-0 pointer-events-none hidden md:block transition-opacity duration-500 opacity-0 group-hover/hero:opacity-100"
          aria-hidden="true"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(56,189,248,0.85) 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
            WebkitMaskImage:
              'radial-gradient(250px circle at var(--mouse-x, -999px) var(--mouse-y, -999px), black 0%, transparent 100%)',
            maskImage:
              'radial-gradient(250px circle at var(--mouse-x, -999px) var(--mouse-y, -999px), black 0%, transparent 100%)',
          }}
        />

        {/* ── CAPA 3: Fallback móvil — brillo estático pulsante suave ── */}
        <div
          className="absolute inset-0 pointer-events-none md:hidden animate-pulse-slow"
          aria-hidden="true"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(56,189,248,0.55) 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 45%, black 0%, transparent 65%)',
            maskImage:       'radial-gradient(ellipse at 50% 45%, black 0%, transparent 65%)',
          }}
        />

        {/* Ambiente de luz difusa para profundidad */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[360px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(56,189,248,0.05) 0%, transparent 70%)' }}
        />

        {/* ── CONTENIDO HERO (z-10: por encima del grid) ── */}
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">

          {/* Isotipo grande en Hero */}
          <div className="mb-8 cursor-default inline-flex">
            <Logo size="lg" />
          </div>

          {/* Eyebrow pill */}
          <div className="inline-flex items-center gap-2 mb-8 border border-sky-500/30 bg-sky-500/5 px-4 py-1.5 rounded-full animate-float shadow-[0_0_20px_rgba(56,189,248,0.05)]">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-sky-400 text-xs font-bold uppercase tracking-widest">
              SISTEMA DE GESTIÓN Y RESERVAS
            </span>
          </div>

          {/* H1 */}
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-black leading-[1.05] tracking-tight text-zinc-50 mb-7">
            Domina tu Agenda.<br />
            <span className="text-sky-400">Crece tu Negocio.</span><br />
            Sin Esfuerzo.
          </h1>

          {/* Subtítulo — universal, multi-vertical */}
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            KronoBook ayuda a tu barbería, estética, spa o consultorio a gestionar clientes, 
            citas y servicios — todo desde un solo lugar. Tus clientes reservan en segundos, 
            tú trabajas con orden.
          </p>

          {/* CTA único, centrado y protagónico */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group/cta relative z-20 font-black uppercase tracking-widest text-zinc-950 bg-sky-400 hover:bg-sky-300 rounded-xl active:scale-95 hover:-translate-y-1 transition-all duration-300 px-14 py-5 text-base flex items-center gap-3 cursor-pointer shadow-xl shadow-sky-400/20 hover:shadow-sky-400/40"
          >
            <svg
              className="w-5 h-5 fill-current group-hover/cta:rotate-12 transition-transform duration-300"
              viewBox="0 0 24 24"
            >
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.115-2.906-6.99C16.554 1.876 14.079 1.848 11.442 1.848c-5.437 0-9.861 4.42-9.865 9.864-.001 1.765.485 3.486 1.408 5.01L1.97 21.03l4.677-1.876zm12.39-5.49c-.29-.146-1.72-.85-1.986-.948-.267-.098-.46-.147-.654.145-.193.292-.747.948-.916 1.144-.168.196-.337.22-.627.073-.29-.146-1.228-.453-2.34-1.445-.865-.772-1.45-1.725-1.618-2.02-.168-.293-.018-.452.128-.597.133-.13.29-.34.436-.51.145-.17.194-.292.29-.487.097-.195.048-.366-.024-.512-.072-.146-.655-1.58-.897-2.162-.236-.57-.478-.49-.655-.499-.17-.008-.363-.01-.555-.01-.193 0-.507.075-.772.36-.265.288-1.013.992-1.013 2.417s1.036 2.793 1.18 2.99c.145.195 2.037 3.113 4.936 4.36.69.298 1.228.476 1.648.61.692.22 1.32.19 1.817.115.578-.087 1.774-.703 1.961-1.383.242-.68.242-1.266.17-1.383-.07-.117-.265-.19-.556-.337z" />
            </svg>
            <span>Registrar mi Negocio</span>
          </a>

          {/* Micro-copy de confianza */}
          <p className="mt-5 text-zinc-600 text-xs tracking-wide">
            Sin tarjeta de crédito · Configuración en 48&nbsp;h · Soporte por WhatsApp
          </p>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section
        className="w-full py-32 px-4 animate-fade-in-up bg-[#0b0c0e]"
        style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="mb-16 text-center">
            <p className="uppercase tracking-[0.3em] text-xs font-black text-sky-500 mb-3">Proceso</p>
            <h2 className="font-serif text-4xl md:text-5xl font-black text-zinc-50">
              Listo en 48 horas
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                num: '01',
                title: 'Nos contactas',
                desc: 'Mándanos un WhatsApp con el nombre de tu negocio, tu horario y los servicios que ofreces.',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />,
              },
              {
                num: '02',
                title: 'Personalizamos',
                desc: 'Configuramos tu página con tus colores, logo, servicios y precios. Sin que muevas un dedo.',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />,
              },
              {
                num: '03',
                title: 'Empiezas a recibir citas',
                desc: 'Comparte tu link y tus clientes ya pueden reservar directo desde su celular, 24/7.',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
              },
            ].map((step) => (
              <article
                key={step.num}
                className="group p-8 md:p-10 flex flex-col gap-5 bg-[#16191e]/40 backdrop-blur-md border border-white/5 shadow-xl rounded-2xl transition-all duration-700 ease-out hover:bg-white/10 hover:-translate-y-2 hover:border-sky-500/30 hover:shadow-[0_20px_50px_rgba(56,189,248,0.1)]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded group-hover:bg-sky-500/20 group-hover:border-sky-400/50 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(56,189,248,0.2)] transition-all duration-500 ease-out">
                    <svg className="w-5 h-5 text-sky-400 group-hover:rotate-6 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {step.icon}
                    </svg>
                  </div>
                  <span className="font-black text-5xl text-sky-400/10 group-hover:text-sky-400/30 leading-none select-none transition-all duration-500 ease-out">{step.num}</span>
                </div>
                <div>
                  <h3 className="font-black text-lg text-zinc-50 mb-2 uppercase tracking-wide group-hover:text-sky-400 transition-colors duration-300">{step.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRECIOS ── */}
      <section
        className="w-full py-32 px-4 animate-fade-in-up bg-[#0b0c0e]"
        style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="mb-16 text-center">
            <p className="uppercase tracking-[0.3em] text-xs font-black text-sky-500 mb-3">Sin sorpresas</p>
            <h2 className="font-serif text-4xl md:text-5xl font-black text-zinc-50">
              Un solo plan, claro y justo
            </h2>
            <p className="text-zinc-500 mt-4 max-w-lg mx-auto text-sm leading-relaxed">
              Sin contratos anuales forzados. Sin letra chica. Si ya no lo necesitas, lo cancelas.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <article className="relative bg-sky-500/5 backdrop-blur-md border border-sky-500/30 rounded-3xl p-8 shadow-[0_0_30px_rgba(56,189,248,0.05)] hover:border-sky-400 hover:shadow-[0_0_40px_rgba(56,189,248,0.15)] transition-all duration-500 ease-out hover:-translate-y-2 group/card">
              <div className="text-center mt-4 mb-6">
                <h3 className="text-zinc-400 text-xs uppercase tracking-widest font-black mb-2">
                  Plan Selector / Control Total
                </h3>
                <div className="flex justify-center items-baseline gap-2 mt-4">
                  <span className="text-6xl font-black text-zinc-50 tracking-tight">$250</span>
                  <span className="text-sky-400 font-bold text-sm">MXN / mes</span>
                </div>
                <div className="flex flex-col gap-1.5 mt-6 text-xs text-zinc-300 font-bold tracking-wide">
                  <span className="px-3 py-1 bg-zinc-900/60 border border-zinc-800 rounded-lg">✓ Sin contratos</span>
                  <span className="px-3 py-1 bg-zinc-900/60 border border-zinc-800 rounded-lg">✓ Configuración gratuita</span>
                  <span className="px-3 py-1 bg-zinc-900/60 border border-zinc-800 rounded-lg">✓ Cancela cuando quieras</span>
                </div>
              </div>

              {/* Divisor */}
              <div className="w-full h-px bg-zinc-800/80 my-6" />

              <ul className="space-y-4 mb-8">
                {[
                  'Agenda Virtual 24/7 interactiva',
                  'Recordatorios automáticos de citas',
                  'Panel de Administración y Finanzas en tiempo real',
                  'Soporte técnico local garantizado',
                  'Multi-Tenant aislado y seguro',
                ].map((feat) => (
                  <li key={feat} className="flex items-start gap-3.5 text-sm text-zinc-300 group/item">
                    <svg
                      className="w-4 h-4 text-sky-400 mt-0.5 shrink-0 group-hover/item:scale-125 transition-transform duration-200"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="group-hover/item:text-zinc-50 transition-colors duration-200">{feat}</span>
                  </li>
                ))}
              </ul>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 font-black uppercase tracking-widest text-zinc-950 bg-sky-400 hover:bg-sky-300 rounded-xl active:scale-95 hover:-translate-y-1 transition-all duration-300 py-4 text-sm cursor-pointer group-hover/card:scale-[1.02] shadow-lg shadow-sky-400/10 hover:shadow-sky-400/20"
              >
                Comenzar Hoy
              </a>
            </article>
          </div>
        </div>
      </section>

      {/* ── CLIENTES ACTUALES / DEMO ── */}
      <section
        className="w-full py-32 px-4 text-center animate-fade-in-up bg-[#0b0c0e]"
        style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
      >
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          <p className="uppercase tracking-[0.3em] text-xs font-black text-sky-500 mb-4">Míralo funcionando</p>
          <h2 className="font-serif text-3xl md:text-5xl font-black text-zinc-50 mb-4 tracking-tight">
            Clientes Actuales
          </h2>
          <p className="text-zinc-400 text-sm md:text-base mb-10 max-w-2xl leading-relaxed font-light">
            Esta es exactamente la experiencia interactiva que tendrán los clientes de tu negocio.
            Una interfaz rápida, moderna y optimizada para reservas reales en tiempo real.
          </p>

          {/* Browser Mockup */}
          <Link
            to="/barberia-chaga"
            className="w-full max-w-4xl mx-auto rounded-2xl border border-white/10 bg-[#16191e]/40 backdrop-blur-md shadow-xl overflow-hidden group hover:border-sky-500/40 hover:shadow-[0_20px_60px_rgba(56,189,248,0.15)] transition-all duration-700 ease-out hover:-translate-y-3 block"
          >
            <div className="bg-[#16191e] px-4 py-3 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#ef4444]/80" />
                <span className="w-3 h-3 rounded-full bg-[#eab308]/80" />
                <span className="w-3 h-3 rounded-full bg-[#22c55e]/80" />
              </div>
              <div className="bg-zinc-900/90 border border-white/5 text-[11px] text-zinc-500 rounded px-8 md:px-16 py-1 select-none font-mono tracking-tight flex items-center gap-1">
                <svg className="w-3 h-3 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>kronobook.com/barberia-chaga</span>
              </div>
              <div className="flex gap-1.5 opacity-0 md:opacity-100">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
              </div>
            </div>
            <div className="relative overflow-hidden aspect-video bg-[#0b0c0e]">
              <img
                src={BarberiaChagaPreview}
                alt="Vista previa de Barbería Chaga en KronoBook"
                className="w-full h-full object-cover object-top duration-700 group-hover:scale-[1.015] brightness-95 group-hover:brightness-100 transition-all"
              />
            </div>
          </Link>
        </div>
      </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="w-full border-t border-white/5 py-10 px-6 bg-[#0b0c0e]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo en Footer */}
          <div className="flex items-center gap-2 cursor-default">
            <Logo size="sm" />
            <span className="text-zinc-600 text-xs">© {new Date().getFullYear()}</span>
          </div>
          <p className="text-zinc-600 text-xs text-center md:text-right">
            Sistema SaaS de reservas para negocios de citas · Hecho en México 🇲🇽
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors uppercase tracking-widest"
          >
            Contacto →
          </a>
        </div>
      </footer>
    </div>
  );
};
