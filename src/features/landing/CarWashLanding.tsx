import React, { useRef } from 'react';
import { motion, useScroll, useTransform, type Variants } from 'framer-motion';
import {
  MapPin, Clock, ShieldCheck, Droplets, Sparkles, ChevronRight,
  CheckCircle2, CarFront, Wind, Star, Phone, Zap, Award
} from 'lucide-react';
import { type Negocio, type Servicio } from '../../types';

interface CarWashLandingProps {
  negocio: Negocio;
  servicios: Servicio[];
  onBookClick: () => void;
}

const fadeUp: Variants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  }
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } }
};

export const CarWashLanding: React.FC<CarWashLandingProps> = ({ negocio, servicios, onBookClick }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const mainPackages = servicios.filter(s => !s.nombre.toLowerCase().includes('extra'));
  const extras = servicios.filter(s => s.nombre.toLowerCase().includes('extra'));

  // Color palette (omitted unused blue/cyan for standard UI styling)

  const vehicleIcons: Record<number, React.ReactNode> = {
    0: <CarFront className="w-7 h-7" />,
    1: <CarFront className="w-7 h-7" />,
    2: <Wind className="w-7 h-7" />,
  };

  return (
    <div className="min-h-screen bg-[#030712] text-zinc-100 font-sans overflow-x-hidden selection:bg-sky-500/30">

      {/* ══════════════════════════════════════════
          HERO — Parallax full-bleed
      ══════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
        {/* Parallax BG */}
        <motion.div style={{ y: heroY }} className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&q=80&w=2500")' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/60 via-[#030712]/75 to-[#030712]" />
          {/* Electric blue ambient glows */}
          <div className="absolute top-1/4 right-1/4 w-[700px] h-[700px] rounded-full bg-sky-600/20 blur-[140px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-cyan-600/15 blur-[120px]" />
        </motion.div>

        {/* Hero Content */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-28 pb-16 w-full"
        >
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="max-w-3xl"
          >
            {/* Live badge */}
            <motion.div variants={fadeUp} className="mb-8 inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-sky-950/50 border border-sky-400/20 backdrop-blur-md">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-sky-300">Servicio a Domicilio — Disponible Hoy</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={fadeUp} className="text-6xl sm:text-7xl md:text-8xl font-black mb-6 leading-[1.0] tracking-tighter">
              Tu auto,{' '}
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-400">
                  impecable.
                </span>
                <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-500/0 via-sky-400 to-sky-500/0 rounded-full" />
              </span>
              <br />
              <span className="text-white/90">Sin salir de casa.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-xl md:text-2xl text-zinc-400 mb-10 max-w-xl font-light leading-relaxed">
              Detallado premium de alta gama,{' '}
              <strong className="text-white font-semibold">directo en tu cochera.</strong>{' '}
              Resultados profesionales garantizados.
            </motion.p>

            {/* CTA buttons */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 items-start">
              <button
                onClick={onBookClick}
                className="group relative px-10 py-5 bg-white text-[#030712] font-black rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(14,165,233,0.25)] hover:shadow-[0_0_70px_rgba(14,165,233,0.4)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-sky-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-2 text-lg">
                  Agendar mi Cita
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              <a
                href="tel:+528662040513"
                className="group flex items-center gap-3 px-8 py-5 rounded-2xl border border-white/10 hover:border-sky-500/40 bg-white/5 hover:bg-sky-500/10 backdrop-blur-sm transition-all duration-300"
              >
                <Phone className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
                <span className="text-white font-bold text-base">Llamar Ahora</span>
              </a>
            </motion.div>

            {/* Trust badges */}
            <motion.div variants={fadeUp} className="mt-12 flex flex-wrap gap-6 items-center">
              {[
                { icon: <Star className="w-4 h-4 fill-amber-400 text-amber-400" />, label: 'Productos Premium' },
                { icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />, label: 'Atención Meticulosa' },
                { icon: <MapPin className="w-4 h-4 text-sky-400" />, label: 'Servicio a Domicilio' },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                  {b.icon}
                  <span>{b.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-60"
        >
          <div className="w-px h-8 bg-gradient-to-b from-sky-400/0 to-sky-400/60" />
          <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════ */}
      <section className="relative z-20 border-y border-white/5 bg-[#080d1a]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-white/5">
          {[
            { value: 'Domicilio', label: 'Llegamos a ti' },
            { value: 'Premium', label: 'Productos de alta gama' },
            { value: 'Detalle', label: 'Atención meticulosa' },
            { value: 'Garantía', label: 'Sin rayones' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="text-center px-4 py-2"
            >
              <div className="text-2xl md:text-3xl font-black text-white mb-1">{stat.value}</div>
              <div className="text-sm text-zinc-500 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PROCESO — Timeline
      ══════════════════════════════════════════ */}
      <section className="py-28 px-6 relative z-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="text-center mb-20"
          >
            <motion.span variants={fadeUp} className="inline-block text-sky-400 font-bold uppercase tracking-widest text-xs mb-4">
              Así funciona
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
              Del exterior al interior,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400">
                cubrimos todo.
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-zinc-400 max-w-xl mx-auto text-lg">
              Nuestro proceso está diseñado para un resultado de agencia, sin que tengas que mover el auto.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector line (desktop) */}
            <div className="absolute top-16 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-px bg-gradient-to-r from-sky-500/0 via-sky-500/40 to-sky-500/0 hidden md:block" />

            {[
              {
                step: '01',
                icon: <Droplets className="w-7 h-7" />,
                title: 'Exterior Premium',
                desc: 'Lavado a presión con hidrolavadora de alta potencia. Limpieza profunda de rines y llantas. Abrillantador de plásticos y secado con microfibra anti-rayaduras.',
                color: 'from-sky-500/20 to-sky-600/5',
                border: 'border-sky-500/20',
                iconBg: 'bg-sky-500/10',
                iconColor: 'text-sky-400',
              },
              {
                step: '02',
                icon: <CarFront className="w-7 h-7" />,
                title: 'Interior Profundo',
                desc: 'Aspirado intensivo en asientos, alfombras y cajuela. Limpieza exhaustiva y desinfección de tablero, puertas, portavasos y todas las rejillas.',
                color: 'from-cyan-500/20 to-cyan-600/5',
                border: 'border-cyan-500/20',
                iconBg: 'bg-cyan-500/10',
                iconColor: 'text-cyan-400',
              },
              {
                step: '03',
                icon: <Award className="w-7 h-7" />,
                title: 'Acabado y Protección',
                desc: 'Aplicación de protector UV con acabado mate en plásticos interiores. Perfume de larga duración. Control de calidad visual antes de entregar.',
                color: 'from-indigo-500/20 to-indigo-600/5',
                border: 'border-indigo-500/20',
                iconBg: 'bg-indigo-500/10',
                iconColor: 'text-indigo-400',
              },
            ].map((feat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: idx * 0.15, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                whileHover={{ y: -6 }}
                className={`relative rounded-3xl p-8 bg-gradient-to-br ${feat.color} border ${feat.border} backdrop-blur-sm overflow-hidden group`}
              >
                {/* Step number */}
                <div className="absolute top-6 right-6 text-6xl font-black text-white/[0.04] select-none leading-none">{feat.step}</div>

                <div className={`w-14 h-14 ${feat.iconBg} rounded-2xl flex items-center justify-center mb-6 ${feat.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feat.title}</h3>
                <p className="text-zinc-400 leading-relaxed text-sm">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PAQUETES — Cards con glow animado
      ══════════════════════════════════════════ */}
      <section className="py-24 px-6 relative z-20 bg-gradient-to-b from-transparent to-[#060b18]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="mb-16"
          >
            <motion.span variants={fadeUp} className="inline-block text-sky-400 font-bold uppercase tracking-widest text-xs mb-4">
              Precios transparentes
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
              Elige tu vehículo
            </motion.h2>
            <motion.p variants={fadeUp} className="text-zinc-400 text-lg max-w-lg">
              El precio varía según el tamaño. Todo incluye el mismo servicio premium.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mainPackages.map((servicio, idx) => {
              const nombreCorto = servicio.nombre.split(' - ')[1] || servicio.nombre;
              const isPopular = idx === 1;

              return (
                <motion.div
                  key={servicio.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                  whileHover={{ y: -8 }}
                  className={`relative rounded-[2rem] p-8 flex flex-col overflow-hidden group cursor-pointer
                    ${isPopular
                      ? 'bg-gradient-to-br from-sky-950/60 to-[#060b18] border-2 border-sky-500/50 shadow-[0_0_60px_rgba(14,165,233,0.2)]'
                      : 'bg-[#0c1220]/80 border border-white/5 hover:border-sky-500/30'
                    }
                  `}
                >
                  {isPopular && (
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-sky-500/0 via-sky-400 to-sky-500/0" />
                  )}

                  {/* Popular badge */}
                  {isPopular && (
                    <div className="absolute top-5 right-5 px-3 py-1 rounded-full bg-sky-500 text-[10px] font-black text-white uppercase tracking-widest">
                      Más popular
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300
                    ${isPopular ? 'bg-sky-500/20 text-sky-300 group-hover:bg-sky-500/30' : 'bg-white/5 text-sky-400 group-hover:bg-sky-500/10'}`}>
                    {vehicleIcons[idx] || <CarFront className="w-7 h-7" />}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1 leading-tight">{nombreCorto}</h3>
                  <p className="text-zinc-500 text-sm mb-6">Detallado básico completo</p>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1.5 mb-1">
                      <span className="text-5xl font-black text-white">${servicio.precio}</span>
                      <span className="text-sm font-bold text-zinc-500">MXN</span>
                    </div>
                    <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Duración estimada: {servicio.duracionMinutos} min
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-grow">
                    {[
                      'Lavado exterior a presión',
                      'Limpieza de rines y llantas',
                      'Aspirado profundo interior',
                      'Desinfección de tablero y puertas',
                      'Protector UV en plásticos',
                      'Perfume de larga duración',
                    ].map((feat, fi) => (
                      <li key={fi} className="flex items-start gap-2.5 text-sm text-zinc-300">
                        <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isPopular ? 'text-sky-400' : 'text-zinc-500'}`} />
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={onBookClick}
                    className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wide transition-all duration-300 active:scale-[0.98]
                      ${isPopular
                        ? 'bg-sky-500 hover:bg-sky-400 text-white shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:shadow-[0_0_40px_rgba(14,165,233,0.5)]'
                        : 'bg-white/5 hover:bg-sky-500/20 text-zinc-200 hover:text-white border border-white/10 hover:border-sky-500/40'
                      }`}
                  >
                    Elegir este
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          EXTRAS
      ══════════════════════════════════════════ */}
      {extras.length > 0 && (
        <section className="py-20 px-6 relative z-20 bg-[#060b18]">
          <div className="max-w-4xl mx-auto">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              className="text-center mb-14"
            >
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/20 bg-amber-500/5 mb-6">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Potencia tu servicio</span>
              </motion.div>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-white mb-3">
                Servicios Adicionales
              </motion.h2>
              <motion.p variants={fadeUp} className="text-zinc-400 text-base">
                Agrégalos al momento de reservar. Sin costo extra de visita.
              </motion.p>
            </motion.div>

            <div className="space-y-3">
              {extras.map((extra, idx) => (
                <motion.div
                  key={extra.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl bg-[#0c1220]/60 border border-white/5 hover:border-amber-500/20 hover:bg-[#0c1220] transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4 mb-4 sm:mb-0">
                    <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 flex-shrink-0 group-hover:bg-amber-500/20 transition-colors">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white mb-0.5">{extra.nombre.replace('Extra: ', '')}</h4>
                      <p className="text-zinc-500 text-sm leading-relaxed max-w-xl">{extra.descripcion}</p>
                      <p className="text-zinc-600 text-xs flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" /> +{extra.duracionMinutos} min adicionales
                      </p>
                    </div>
                  </div>

                  <div className="flex-shrink-0 sm:pl-8 sm:border-l sm:border-white/5">
                    <p className="text-2xl font-black text-white">+${extra.precio}</p>
                    <p className="text-xs text-zinc-600 text-right">MXN</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          FINAL CTA SECTION
      ══════════════════════════════════════════ */}
      <section className="relative py-32 px-6 z-20 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full bg-sky-600/15 blur-[120px]" />
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="max-w-3xl mx-auto text-center relative"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-sky-500/20 bg-sky-500/5 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sky-300 text-xs font-bold uppercase tracking-widest">Disponible ahora mismo</span>
          </motion.div>

          <motion.h2 variants={fadeUp} className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
            ¿Listo para ver tu auto
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400"> brillar?</span>
          </motion.h2>

          <motion.p variants={fadeUp} className="text-zinc-400 text-xl mb-10 max-w-xl mx-auto">
            Agenda en menos de 2 minutos. Sin cuentas, sin complicaciones.
          </motion.p>

          <motion.div variants={fadeUp}>
            <button
              onClick={onBookClick}
              className="group relative inline-flex items-center gap-3 px-12 py-5 bg-white text-[#030712] font-black rounded-2xl text-lg overflow-hidden shadow-[0_0_60px_rgba(14,165,233,0.3)] hover:shadow-[0_0_80px_rgba(14,165,233,0.5)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-sky-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative">Agendar mi Cita Ahora</span>
              <ChevronRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="border-t border-white/5 py-12 px-6 relative z-20 bg-[#030712]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h4 className="text-2xl font-black text-white tracking-tight mb-1">{negocio.nombre}</h4>
            <p className="text-sm text-zinc-500 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-sky-500" />
              {negocio.direccion}
            </p>
          </div>

          <div className="flex items-center gap-6 text-zinc-600 text-sm">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {negocio.horario || 'Lun–Dom: 8am–8pm'}
            </span>
          </div>

          <a href="/" className="group flex items-center gap-1.5 opacity-50 hover:opacity-100 transition-opacity duration-300">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold group-hover:text-zinc-400">Powered by</span>
            <span className="font-black text-sm tracking-tight text-zinc-300 group-hover:text-white transition-colors">
              Krono<span className="text-sky-400">Book</span>
            </span>
          </a>
        </div>
      </footer>
    </div>
  );
};
