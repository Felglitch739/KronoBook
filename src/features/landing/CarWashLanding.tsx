import React, { useRef, useState, useEffect } from 'react';
import { 
  motion, useScroll, useTransform, useInView, useMotionValue, 
  useSpring, AnimatePresence, type Variants 
} from 'framer-motion';
import { 
  MapPin, Phone, Droplets, Wind, ArrowRight, 
  Shield, Gem, ChevronDown, Menu, X, MessageCircle, ArrowUpRight,
  Car, Truck, Clock, Check
} from 'lucide-react';
import { type Negocio, type Servicio } from '../../types';

/* ─── Props ─── */
interface CarWashLandingProps {
  negocio: Negocio;
  servicios: Servicio[];
  onBookClick: () => void;
}

/* ─── Animation Variants ─── */
const fadeUp: Variants = {
  hidden: { y: 40, opacity: 0 },
  visible: (delay: number = 0) => ({
    y: 0, opacity: 1,
    transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }
  })
};

const slideInLeft: Variants = {
  hidden: { x: -60, opacity: 0 },
  visible: (delay: number = 0) => ({
    x: 0, opacity: 1,
    transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }
  })
};

const slideInRight: Variants = {
  hidden: { x: 60, opacity: 0 },
  visible: (delay: number = 0) => ({
    x: 0, opacity: 1,
    transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }
  })
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } }
};

const lineReveal: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } }
};

/* ─── Character-by-character text reveal ─── */
const CharReveal: React.FC<{ text: string; className?: string; delay?: number }> = ({ text, className = '', delay = 0 }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  
  return (
    <span ref={ref} className={className}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: delay + i * 0.02, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block"
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  );
};

/* ─── Animated counter ─── */
const AnimatedCounter: React.FC<{ value: string; label: string }> = ({ value, label }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <div ref={ref} className="text-center md:text-left">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-4xl md:text-5xl font-display font-bold text-white mb-2 tracking-tight"
      >
        {value}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-[10px] uppercase tracking-[0.2em] text-tenant-text/35 font-medium"
      >
        {label}
      </motion.div>
    </div>
  );
};

/* ─── Animated Section wrapper ─── */
const AnimatedSection: React.FC<{
  children: React.ReactNode;
  className?: string;
  id?: string;
}> = ({ children, className = '', id }) => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.section>
  );
};

/* ─── Magnetic Button effect ─── */
const MagneticButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}> = ({ children, onClick, className = '' }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.15);
    y.set((e.clientY - cy) * 0.15);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.button>
  );
};

/* ─── Process Card with hover glow ─── */
interface ProcessCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  index: number;
}

const ProcessCard: React.FC<ProcessCardProps> = ({ icon, title, desc, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <motion.div
      ref={cardRef}
      variants={fadeUp}
      custom={index * 0.15}
      onMouseMove={handleMouseMove}
      className="relative bg-tenant-card p-8 rounded-2xl border border-white/[0.06] hover:border-tenant-primary/30 hover:shadow-[0_0_30px_rgba(110,59,255,0.05)] transition-all duration-500 flex flex-col items-center text-center group overflow-hidden cursor-pointer"
    >
      {/* Radial glow following mouse */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{
          background: `radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(110, 59, 255, 0.08), transparent 60%)`,
        }}
      />
      
      {/* Ambient corner glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-tenant-primary/0 group-hover:bg-tenant-primary/[0.04] rounded-full blur-3xl transition-all duration-1000 pointer-events-none" />

      <div className="relative z-10 w-14 h-14 bg-tenant-background rounded-xl flex items-center justify-center text-tenant-primary mb-6 border border-white/[0.06] group-hover:border-tenant-primary/40 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(110,59,255,0.2)] transition-all duration-500">
        {icon}
      </div>
      <h3 className="relative z-10 text-xl font-display font-bold mb-3 text-white group-hover:text-white transition-colors duration-500">{title}</h3>
      <p className="relative z-10 text-tenant-text/60 text-sm leading-relaxed group-hover:text-tenant-text/80 transition-colors duration-500">{desc}</p>
    </motion.div>
  );
};


/* ─── Pricing Card with hover glow ─── */
interface PricingCardProps {
  title: string;
  sub: string;
  desc: string;
  price: string;
  duration: string;
  popular: boolean;
  icon: React.ReactNode;
  features: string[];
  onBookClick: () => void;
  index: number;
}

const PricingCard: React.FC<PricingCardProps> = ({
  title, sub, desc, price, duration, popular, icon, features, onBookClick, index
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <motion.div
      ref={cardRef}
      variants={fadeUp}
      custom={index * 0.15}
      onMouseMove={handleMouseMove}
      className={`relative bg-[#121212] flex flex-col p-8 rounded-2xl transition-all duration-500 group overflow-hidden ${
        popular ? 'border border-white/20' : 'border border-white/5 hover:border-tenant-primary/30'
      }`}
    >
      {/* Radial glow following mouse */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{
          background: `radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(110, 59, 255, 0.1), transparent 60%)`,
        }}
      />
      
      {/* Ambient corner glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-tenant-primary/0 group-hover:bg-tenant-primary/[0.04] rounded-full blur-3xl transition-all duration-1000 pointer-events-none" />

      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide z-10">
          Más Popular
        </div>
      )}

      <div className="text-center mb-6 relative z-10">
        <div className="text-white group-hover:scale-110 transition-transform duration-500">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white mt-3">
          {title} 
          <span className="block text-sm font-normal text-gray-400 mt-1">{sub}</span>
        </h3>
        <p className="text-xs text-gray-500 mt-1">{desc}</p>
      </div>

      <div className="text-center mb-6 relative z-10">
        <span className="text-5xl font-extrabold text-white">${price}</span>
        <span className="text-lg text-gray-400 ml-1">MXN</span>
        <p className="text-xs text-gray-500 mt-2 flex items-center justify-center gap-1">
          <Clock className="w-4 h-4" />
          Duración estimada: {duration} min
        </p>
      </div>

      <hr className="border-gray-800 mb-6 relative z-10" />

      <ul className="space-y-4 mb-8 text-sm text-gray-300 flex-1 relative z-10">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-white shrink-0 group-hover:text-tenant-primary transition-colors duration-300" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onBookClick}
        className={`w-full font-bold py-3 rounded-lg transition-colors duration-300 relative z-10 ${
          popular 
            ? 'bg-white text-black hover:bg-gray-200' 
            : 'bg-[#0b0b0b] text-white border border-gray-800 hover:border-gray-500 hover:bg-[#1a1a1a]'
        }`}
      >
        Agendar Cita
      </button>
    </motion.div>
  );
};

/* ─── Floating particle decoration ─── */
const FloatingParticles: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 rounded-full bg-tenant-primary/20"
        style={{
          left: `${15 + i * 15}%`,
          top: `${20 + (i % 3) * 25}%`,
        }}
        animate={{
          y: [0, -30, 0],
          opacity: [0.2, 0.5, 0.2],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 4 + i * 0.5,
          repeat: Infinity,
          delay: i * 0.8,
          ease: 'easeInOut',
        }}
      />
    ))}
  </div>
);

/* ─── Horizontal scrolling text marquee ─── */
const Marquee: React.FC<{ items: string[] }> = ({ items }) => {
  const doubled = [...items, ...items];
  return (
    <div className="relative overflow-hidden py-6 border-y border-white/[0.04] bg-tenant-background/50 backdrop-blur">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-tenant-primary/5 to-transparent pointer-events-none" />
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="text-[11px] uppercase tracking-[0.3em] text-tenant-text/15 font-semibold flex items-center gap-12 relative z-10">
            {item}
            <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-tenant-primary to-purple-400" />
          </span>
        ))}
      </motion.div>
    </div>
  );
};


/* ═══════════════════════════════════════════════════
   MAIN COMPONENT — DualFX Landing Page
   ═══════════════════════════════════════════════════ */
export const CarWashLanding: React.FC<CarWashLandingProps> = ({ onBookClick }) => {
  type VehicleType = 'Sedán' | 'SUV' | 'Pick-Up';
  // @ts-ignore - Variables en desarrollo
  const [_activeVehicle, _setActiveVehicle] = useState<VehicleType>('Sedán');

  // @ts-ignore - Variables en desarrollo
  const _vehicleData = {
    'Sedán': {
      exterior: {
        price: '$450', duration: '1.5 - 2 hrs',
        desc: 'Descontaminación de carrocería, rines y pasos de rueda con espumas de pH neutro. Ideal para compactos.',
      },
      interior: {
        price: '$550', duration: '2 - 3 hrs',
        desc: 'Aspirado de cabina, limpieza con vapor de polímeros y textiles en espacios estándar. Protección UV.',
      }
    },
    'SUV': {
      exterior: {
        price: '$650', duration: '2 - 2.5 hrs',
        desc: 'Limpieza intensiva para dimensiones medianas/grandes. Descontaminación profunda de tolvas y chasis.',
      },
      interior: {
        price: '$750', duration: '3 - 4 hrs',
        desc: 'Aspirado profundo de 3 filas de asientos y carga. Desinfección integral con vapor y acondicionador.',
      }
    },
    'Pick-Up': {
      exterior: {
        price: '$750', duration: '2.5 - 3 hrs',
        desc: 'Lavado especializado de batea y carrocería. Tratamiento de plásticos exteriores y eliminación de lodo pesado.',
      },
      interior: {
        price: '$650', duration: '2.5 - 3 hrs',
        desc: 'Limpieza ruda de cabina, tapetes y textiles. Restauración de plásticos interiores expuestos al uso rudo.',
      }
    }
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#filosofia', label: 'Filosofía' },
    { href: '#servicios', label: 'Servicios' },
    { href: '#contacto', label: 'Contacto' },
  ];

  return (
    <div className="min-h-screen bg-tenant-background text-tenant-text font-sans overflow-x-hidden selection:bg-tenant-primary/30 selection:text-white">

      {/* ═══════════════ NAVBAR ═══════════════ */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'backdrop-blur-2xl bg-tenant-background/80 border-b border-white/[0.06] shadow-lg shadow-black/20'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-10 flex items-center justify-between h-16 md:h-[72px] w-full">
          {/* Logo with hover effect */}
          <motion.a 
            href="#" 
            className="flex items-center gap-1.5 group w-1/3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-[22px] font-display font-bold tracking-tight text-white">
              Dual<span className="text-tenant-primary group-hover:drop-shadow-[0_0_8px_rgba(var(--tenant-primary),0.5)] transition-all duration-500">FX</span>
            </span>
          </motion.a>

          {/* Desktop links with underline animation */}
          <div className="hidden md:flex items-center justify-center gap-10 text-[13px] font-medium text-tenant-text/60 tracking-wide w-1/3">
            {navLinks.map(l => (
              <a key={l.href} href={l.href} className="relative group py-2 hover:text-white transition-colors duration-300">
                {l.label}
                <span className="absolute bottom-0 left-0 w-0 h-px bg-tenant-primary group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex justify-end w-1/3">
            <MagneticButton
            onClick={onBookClick}
            className="hidden md:inline-flex items-center gap-2 bg-tenant-primary text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold hover:opacity-90 transition-all duration-300 shadow-lg shadow-tenant-primary/15 hover:shadow-[0_4px_25px_rgba(var(--tenant-primary),0.35)] active:scale-[0.97]"
          >
            Reservar Cita
          </MagneticButton>
          </div>

          {/* Mobile hamburger */}
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden p-2 text-tenant-text"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>

        {/* Mobile fullscreen menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden overflow-hidden bg-tenant-background/98 backdrop-blur-2xl border-t border-white/[0.04]"
            >
              <div className="px-5 py-8 flex flex-col gap-6">
                {navLinks.map((l, i) => (
                  <motion.a
                    key={l.href}
                    href={l.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-tenant-text/80 text-lg font-medium hover:text-white transition-colors flex items-center justify-between"
                  >
                    {l.label}
                    <ArrowUpRight className="w-4 h-4 text-tenant-primary/50" />
                  </motion.a>
                ))}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  onClick={() => { onBookClick(); setMobileMenuOpen(false); }}
                  className="w-full bg-tenant-primary text-white py-4 rounded-xl text-sm font-semibold mt-4 shadow-lg shadow-tenant-primary/20"
                >
                  Reservar Cita
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>


      {/* ═══════════════ HERO ═══════════════ */}
      <section ref={heroRef} className="relative min-h-[100svh] flex items-center pt-20 overflow-hidden">
        {/* Parallax background */}
        <motion.div style={{ y: heroY, scale: heroScale }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-tenant-background" />
          {/* Photo layer */}
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="absolute inset-0 bg-cover bg-center opacity-[0.08]"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=2400")' }}
          />
          {/* Animated purple glow */}
          <motion.div
            animate={{ 
              scale: [1, 1.15, 1],
              opacity: [0.06, 0.1, 0.06]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full bg-tenant-primary blur-[180px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.03, 0.06, 0.03]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-tenant-primary blur-[150px]"
          />
          {/* Grid pattern overlay */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
          {/* Dark gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-tenant-background/20 via-tenant-background/50 to-tenant-background" />
        </motion.div>

        <FloatingParticles />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 max-w-7xl mx-auto px-5 md:px-10 w-full"
        >
          <motion.div variants={stagger} initial="hidden" animate="visible" className="max-w-3xl">
            {/* Eyebrow with animated line */}
            <motion.div variants={fadeUp} custom={0} className="flex items-center gap-3 mb-8">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="w-10 h-px bg-tenant-primary origin-left"
              />
              <motion.span
                initial={{ opacity: 0, letterSpacing: '0.5em' }}
                animate={{ opacity: 1, letterSpacing: '0.2em' }}
                transition={{ duration: 1, delay: 0.6 }}
                className="text-tenant-primary text-[11px] md:text-xs font-semibold uppercase"
              >
                Detailing Automotriz Premium
              </motion.span>
            </motion.div>

            {/* Headline with character reveal */}
            <motion.h1 variants={fadeUp} custom={0.15} className="text-[clamp(2.5rem,7vw,4.5rem)] font-display font-bold leading-[1.08] tracking-[-0.025em] mb-7">
              <CharReveal text="Ingeniería aplicada" delay={0.3} />
              <br className="hidden sm:block" />
              <span className="block mt-1">
                <CharReveal text="al cuidado " delay={0.7} />
                <span className="relative inline-block">
                  <CharReveal 
                    text="automotriz." 
                    delay={0.9}
                    className="text-transparent bg-clip-text bg-gradient-to-r from-tenant-primary to-purple-400"
                  />
                  {/* Animated underline */}
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 1.8, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-tenant-primary/0 via-tenant-primary/50 to-tenant-primary/0 origin-left"
                  />
                </span>
              </span>
            </motion.h1>

            {/* Subhead */}
            <motion.p variants={fadeUp} custom={0.35} className="text-base md:text-lg text-tenant-text/50 max-w-xl leading-relaxed mb-10">
              No somos un autolavado. Somos precisión, artesanía y tecnología — diseñados para restaurar y proteger la estética de tu vehículo.
            </motion.p>

            {/* CTA buttons */}
            <motion.div variants={fadeUp} custom={0.5} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <MagneticButton
                onClick={onBookClick}
                className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-tenant-primary text-white font-semibold text-sm rounded-xl shadow-xl shadow-tenant-primary/20 hover:shadow-[0_8px_40px_rgba(var(--tenant-primary),0.4)] hover:bg-[#5d30e6] transition-all duration-500 active:scale-[0.97] relative overflow-hidden"
              >
                {/* Shine sweep */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center gap-2.5">
                  Agenda tu experiencia
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </MagneticButton>
              <a
                href="#filosofia"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/10 text-tenant-text/70 font-medium text-sm rounded-xl hover:bg-white/[0.03] hover:border-white/20 hover:text-white transition-all duration-500"
              >
                Conoce el proceso
              </a>
            </motion.div>

            {/* Trust pills */}
            <motion.div variants={fadeUp} custom={0.65} className="mt-16 flex flex-wrap gap-x-8 gap-y-3">
              {[
                { icon: <Shield className="w-3.5 h-3.5" />, label: 'Sin Micro-rayaduras' },
                { icon: <Gem className="w-3.5 h-3.5" />, label: 'Productos Premium' },
                { icon: <MapPin className="w-3.5 h-3.5" />, label: 'Servicio a Domicilio' },
              ].map((pill, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + i * 0.15, duration: 0.5 }}
                  className="flex items-center gap-2 text-[11px] md:text-xs text-tenant-text/30 font-medium tracking-wide uppercase"
                >
                  <span className="text-tenant-primary/60">{pill.icon}</span>
                  {pill.label}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-5 h-5 text-tenant-text/50" />
          </motion.div>
        </motion.div>
      </section>


      {/* ═══════════════ MARQUEE ═══════════════ */}
      <Marquee items={['Detailing Exterior', 'Protección Cerámica', 'Detailing Interior', 'Corrección de Pintura', 'Sellador UV', 'Descontaminación', 'Acabado de Exhibición']} />


      {/* ═══════════════ PHILOSOPHY ═══════════════ */}
      <AnimatedSection id="filosofia" className="py-24 md:py-40 px-5 md:px-10 bg-tenant-background relative z-20">
        <FloatingParticles />
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            {/* Text column */}
            <div>
              <motion.p variants={fadeUp} custom={0} className="text-tenant-primary text-[11px] font-semibold tracking-[0.2em] uppercase mb-5 flex items-center gap-3">
                <motion.span variants={lineReveal} className="w-8 h-px bg-tenant-primary origin-left" />
                Nuestra Filosofía
              </motion.p>
              
              <motion.h2 variants={slideInLeft} custom={0.1} className="text-3xl md:text-4xl lg:text-[2.75rem] font-display font-bold tracking-tight leading-[1.12] mb-8">
                Donde la ingeniería <br className="hidden md:block" />
                se encuentra con el{' '}
                <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-tenant-primary to-purple-400">detalle.</span>
                  <motion.span
                    variants={lineReveal}
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-tenant-primary/0 via-tenant-primary/40 to-tenant-primary/0 origin-left"
                  />
                </span>
              </motion.h2>
              
              <motion.p variants={fadeUp} custom={0.25} className="text-tenant-text/45 text-base leading-[1.8] mb-5">
                Cada vehículo merece un trato meticuloso. No vendemos "lavados" — aplicamos técnicas de detailing profesional apoyadas por herramientas de precisión y productos de grado clínico.
              </motion.p>
              <motion.p variants={fadeUp} custom={0.35} className="text-tenant-text/45 text-base leading-[1.8] mb-14">
                El resultado es una restauración visual profunda: eliminamos contaminantes y devolvemos el brillo original sin comprometer la integridad de la pintura.
              </motion.p>

              <motion.div variants={fadeUp} custom={0.45} className="flex gap-14 md:gap-20">
                <AnimatedCounter value="0%" label="Fricción Innecesaria" />
                <AnimatedCounter value="100%" label="Precisión Técnica" />
              </motion.div>
            </div>

            {/* Image column with reveal */}
            <motion.div
              variants={slideInRight}
              custom={0.2}
              className="relative w-full aspect-[4/5] md:aspect-[4/3] lg:aspect-[4/5] rounded-2xl overflow-hidden group"
            >
              {/* Radial glow behind image */}
              <div className="absolute inset-0 bg-tenant-primary/10 blur-3xl pointer-events-none scale-125 z-0" />
              
              {/* Image wrapper with clip reveal */}
              <motion.div
                initial={{ clipPath: 'inset(100% 0 0 0)' }}
                whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <img
                  src="https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&q=80&w=1200"
                  alt="Detailing automotriz de alta gama"
                  loading="lazy"
                  className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-[1.5s] ease-out scale-105 group-hover:scale-100"
                />
              </motion.div>
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-tenant-background via-transparent to-transparent pointer-events-none" />
              
              {/* Corner info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="absolute bottom-6 left-6 right-6 flex items-end justify-between pointer-events-none"
              >
                <div>
                  <div className="text-[10px] uppercase tracking-[0.25em] text-tenant-text/25 font-medium mb-1">Resultado</div>
                  <div className="text-sm font-display font-semibold text-white/70">Acabado de Exhibición</div>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-8 h-8 rounded-full border border-tenant-primary/30 flex items-center justify-center"
                >
                  <div className="w-2 h-2 rounded-full bg-tenant-primary/60" />
                </motion.div>
              </motion.div>

              {/* Border */}
              <div className="absolute inset-0 rounded-2xl border border-white/[0.06] pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </AnimatedSection>


      {/* ═══════════════ SERVICES (PROCESO Y PRECIOS) ═══════════════ */}
      <AnimatedSection id="servicios" className="py-24 md:py-40 px-5 md:px-10 bg-tenant-background relative z-20">
        <div className="max-w-7xl mx-auto space-y-32">
          
          {/* Bloque 1: El Proceso */}
          <div>
            <div className="text-center mb-16">
              <motion.h2 variants={fadeUp} custom={0.1} className="text-3xl md:text-4xl lg:text-[2.75rem] font-display font-bold tracking-tight mb-5">
                Del exterior al interior, cubrimos todo.
              </motion.h2>
              <motion.div variants={lineReveal} className="w-16 h-px bg-tenant-primary mx-auto origin-center" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
              {[
                { icon: <Droplets className="w-6 h-6" />, title: 'Exterior Premium', desc: 'Lavado a presión, descontaminación de rines y secado anti-rayaduras.' },
                { icon: <Wind className="w-6 h-6" />, title: 'Interior Profundo', desc: 'Aspirado intensivo, limpieza de plásticos y desinfección de cabina.' },
                { icon: <Shield className="w-6 h-6" />, title: 'Acabado y Protección', desc: 'Aplicación de protector UV y control de calidad final.' },
              ].map((item, i) => (
                <ProcessCard
                  key={i}
                  icon={item.icon}
                  title={item.title}
                  desc={item.desc}
                  index={i}
                />
              ))}
            </div>
          </div>

          {/* Bloque 2: Precios */}
          <div className="relative">
            {/* Background Orb for Pricing */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-tenant-primary/10 blur-[150px] pointer-events-none z-0" />
            
            <div className="text-center mb-16 relative z-10">
              <motion.h2 variants={fadeUp} custom={0.1} className="text-3xl md:text-4xl lg:text-[2.75rem] font-display font-bold tracking-tight mb-5 text-white">
                Precios transparentes. Elige tu vehículo.
              </motion.h2>
              <motion.div variants={lineReveal} className="w-16 h-px bg-white/20 mx-auto origin-center" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto relative z-10">
              {[
                { 
                  title: 'Autos', 
                  sub: '(Sedán / Compactos)', 
                  desc: 'Detallado básico completo',
                  price: '400', 
                  duration: '90',
                  popular: false,
                  icon: <Car className="w-8 h-8 text-white mx-auto mb-3" />,
                  features: [
                    'Lavado exterior a presión',
                    'Limpieza profunda de rines',
                    'Aspirado interior completo',
                    'Limpieza de cristales',
                    'Acondicionador de plásticos',
                    'Encerado express'
                  ]
                },
                { 
                  title: 'SUV', 
                  sub: '(Camionetas de 2 filas)', 
                  desc: 'Detallado básico completo',
                  price: '500', 
                  duration: '120',
                  popular: true,
                  icon: <Car className="w-8 h-8 text-white mx-auto mb-3" />,
                  features: [
                    'Lavado exterior a presión',
                    'Limpieza profunda de rines',
                    'Aspirado interior completo',
                    'Limpieza de cristales',
                    'Acondicionador de plásticos',
                    'Encerado express',
                    'Desinfección de cabina'
                  ]
                },
                { 
                  title: 'Pick-ups y Vans', 
                  sub: '(3 filas o batea)', 
                  desc: 'Detallado básico completo',
                  price: '600', 
                  duration: '150',
                  popular: false,
                  icon: <Truck className="w-8 h-8 text-white mx-auto mb-3" />,
                  features: [
                    'Lavado exterior a presión',
                    'Limpieza de batea/caja',
                    'Aspirado interior completo',
                    'Limpieza de cristales',
                    'Acondicionador de plásticos',
                    'Encerado express',
                    'Tratamiento de lodo pesado'
                  ]
                },
              ].map((item, i) => (
                <PricingCard
                  key={i}
                  title={item.title}
                  sub={item.sub}
                  desc={item.desc}
                  price={item.price}
                  duration={item.duration}
                  popular={item.popular}
                  icon={item.icon}
                  features={item.features}
                  onBookClick={onBookClick}
                  index={i}
                />
              ))}
            </div>
          </div>

        </div>
      </AnimatedSection>


      {/* ═══════════════ CTA BANNER ═══════════════ */}
      <AnimatedSection className="py-28 md:py-40 px-5 md:px-10 relative z-20 overflow-hidden">
        <div className="max-w-4xl mx-auto relative">
          {/* Animated background glow */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.04, 0.08, 0.04],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -inset-20 bg-tenant-primary rounded-full blur-[120px] pointer-events-none"
          />

          <div className="relative text-center">
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-4xl lg:text-5xl font-display font-bold tracking-tight mb-6 leading-tight">
              ¿Listo para ver tu auto <br className="hidden sm:block" />
              al nivel de{' '}
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-tenant-primary to-purple-400">exhibición?</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute -bottom-1 left-0 right-0 h-[2px] bg-tenant-primary/40 origin-left"
                />
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={0.1} className="text-tenant-text/40 text-sm md:text-base mb-12 max-w-md mx-auto">
              Agenda en menos de 2 minutos. Sin cuentas, sin complicaciones.
            </motion.p>
            <motion.div variants={fadeUp} custom={0.2} className="flex flex-col sm:flex-row gap-4 justify-center">
              <MagneticButton
                onClick={onBookClick}
                className="group inline-flex items-center justify-center gap-2.5 px-10 py-4 bg-tenant-primary text-white font-semibold text-sm rounded-xl shadow-xl shadow-tenant-primary/20 hover:shadow-[0_8px_40px_rgba(var(--tenant-primary),0.4)] hover:bg-[#5d30e6] transition-all duration-500 active:scale-[0.97] relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center gap-2.5">
                  Agendar mi Cita
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </MagneticButton>
              <a
                href="https://wa.me/528662040513?text=Hola,%20me%20gustaría%20agendar%20una%20cita%20con%20DualFX."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 border border-white/10 text-tenant-text/60 font-medium text-sm rounded-xl hover:bg-white/[0.03] hover:border-white/20 hover:text-white transition-all duration-500"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>


      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer id="contacto" className="bg-tenant-background border-t border-white/[0.04] pt-16 md:pt-24 pb-8 px-5 md:px-10 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-16">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-2">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-2xl font-display font-bold tracking-tight mb-5 block text-white"
              >
                Dual<span className="text-tenant-primary">FX</span>
              </motion.span>
              <p className="text-tenant-text/30 text-sm max-w-xs leading-relaxed">
                Detailing automotriz de precisión. Redefiniendo el estándar del cuidado vehicular en Matamoros, Tamaulipas.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-white/80 text-[11px] font-semibold uppercase tracking-[0.15em] mb-5">Navegación</h4>
              <ul className="space-y-3 text-sm text-tenant-text/30">
                <li><a href="#filosofia" className="hover:text-white transition-colors duration-300">Filosofía</a></li>
                <li><a href="#servicios" className="hover:text-white transition-colors duration-300">Servicios</a></li>
                <li><button onClick={onBookClick} className="hover:text-white transition-colors duration-300">Agendar Cita</button></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white/80 text-[11px] font-semibold uppercase tracking-[0.15em] mb-5">Contacto</h4>
              <ul className="space-y-3 text-sm text-tenant-text/30">
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Matamoros, Tamaulipas, México</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>+52 (866) 204 0513</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-white/[0.04]">
            <p className="text-[11px] text-tenant-text/20 tracking-wide">
              © {new Date().getFullYear()} DualFX Detailing. Todos los derechos reservados.
            </p>
            <a href="/" className="group flex items-center gap-2 text-tenant-text/20 hover:text-tenant-text/40 transition-colors duration-300">
              <span className="text-[10px] uppercase tracking-widest font-medium">Powered by</span>
              <span className="text-xs font-bold tracking-tight">
                Krono<span className="text-tenant-primary/50 group-hover:text-tenant-primary transition-colors duration-300">Book</span>
              </span>
            </a>
          </div>
        </div>
      </footer>

      {/* ═══════════════ MOBILE FIXED CTA BAR ═══════════════ */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-tenant-background/90 backdrop-blur-2xl border-t border-white/[0.06] px-4 py-3 safe-area-pb"
      >
        <button
          onClick={onBookClick}
          className="w-full bg-tenant-primary text-white py-3.5 rounded-xl text-sm font-semibold shadow-lg shadow-tenant-primary/20 active:scale-[0.98] transition-transform"
        >
          Reservar Cita
        </button>
      </motion.div>

    </div>
  );
};
