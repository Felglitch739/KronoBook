import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, ShieldCheck, Droplets, Sparkles, ChevronRight, CheckCircle2, PlusCircle, CarFront, Wind } from 'lucide-react';
import { type Barberia, type Servicio } from '../../types';

interface CarWashLandingProps {
  barberia: Barberia;
  servicios: Servicio[];
  onBookClick: () => void;
}

export const CarWashLanding: React.FC<CarWashLandingProps> = ({ barberia, servicios, onBookClick }) => {
  const primary = barberia.colorPrimario ?? '#0ea5e9'; 
  
  // Separar los paquetes principales de los extras (upsells)
  const mainPackages = servicios.filter(s => !s.nombre.toLowerCase().includes('extra'));
  const extras = servicios.filter(s => s.nombre.toLowerCase().includes('extra'));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-zinc-100 font-sans selection:bg-sky-500/30 selection:text-sky-200 overflow-x-hidden">
      
      {/* ── HERO SECTION ── */}
      <section className="relative min-h-[95vh] flex items-center pt-24 pb-12 px-4 md:px-8">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] rounded-full bg-sky-900/20 blur-[120px] mix-blend-screen" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-900/20 blur-[100px] mix-blend-screen" />
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 mix-blend-overlay"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&q=80&w=2500")' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030712]/80 to-[#030712] z-10" />
        </div>

        {/* Content */}
        <div className="relative z-20 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-left"
          >
            <motion.div variants={itemVariants} className="mb-8 inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-sky-950/40 border border-sky-500/20 backdrop-blur-md shadow-[0_0_20px_rgba(14,165,233,0.1)]">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-sky-200">Servicio Móvil Disponible Ahora</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-[1.05]">
              Revive tu auto.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-sky-100 to-sky-400">Sin salir de casa.</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-xl md:text-2xl text-zinc-400 mb-10 max-w-xl font-light leading-relaxed">
              El servicio de <strong className="text-white font-medium">Detallado Premium</strong> ideal para devolverle el brillo a tu vehículo, directo en tu cochera.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-5">
              <button 
                onClick={onBookClick}
                className="group relative px-10 py-5 bg-white text-[#030712] font-black rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-all hover:scale-[1.02] active:scale-95 w-full sm:w-auto"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-sky-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
                <span className="relative z-10 flex items-center justify-center gap-2 text-lg tracking-wide">
                  Agendar Cita <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              
              <div className="flex items-center gap-3 text-sm font-medium text-zinc-400 px-2 py-4">
                <MapPin className="w-5 h-5 text-sky-500" />
                Llegamos a tu ubicación
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="hidden lg:block relative"
          >
            {/* Decorative Image Container */}
            <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5] border border-white/10 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/20 to-transparent z-10 mix-blend-overlay"></div>
              <img 
                src="https://images.unsplash.com/photo-1552930294-6b595f4c2974?auto=format&fit=crop&q=80&w=1200" 
                alt="Detallado de auto premium" 
                className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-1000"
              />
            </div>
            
            {/* Floating Badge */}
            <motion.div 
              animate={{ y: [0, -10, 0] }} 
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -bottom-8 -left-8 bg-[#0a0f1c] border border-white/10 p-6 rounded-3xl shadow-xl backdrop-blur-xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-sky-500/10 rounded-2xl flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7 text-sky-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">100% Sin Rayones</p>
                  <p className="text-zinc-400 text-sm">Microfibras premium</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── LO QUE INCLUYE (EL PROCESO) ── */}
      <section className="py-24 px-4 relative z-20 bg-gradient-to-b from-[#030712] to-[#0a0f1c]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-6">¿Qué incluye el Detallado Básico?</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-lg">Atención minuciosa en cada área de tu vehículo para un resultado impecable.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: Droplets, 
                title: 'Exterior Premium', 
                desc: 'Lavado a presión con hidrolavadora, limpieza profunda de rines/llantas, abrillantador de plásticos y secado minucioso con microfibra sin rayones.' 
              },
              { 
                icon: CarFront, 
                title: 'Interior Profundo', 
                desc: 'Aspirado profundo en asientos, alfombras y cajuela. Limpieza exhaustiva y desinfección de tablero, puertas, portavasos y rejillas.' 
              },
              { 
                icon: Wind, 
                title: 'Acabado y Protección', 
                desc: 'Aplicación de protector UV con acabado mate en plásticos interiores (nada grasoso) y perfume ambiental de larga duración.' 
              }
            ].map((feat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-[#0f1423] border border-white/5 rounded-3xl p-8 hover:border-sky-500/30 transition-colors group"
              >
                <div className="w-14 h-14 bg-[#151b2d] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-sky-500/10 transition-colors">
                  <feat.icon className="w-7 h-7 text-sky-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feat.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PAQUETES PRINCIPALES ── */}
      <section className="py-24 px-4 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-4">Elige tu vehículo</h2>
              <p className="text-zinc-400 text-lg max-w-xl">El precio y duración del detallado básico varía según el tamaño de tu auto.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mainPackages.map((servicio, idx) => {
              // Extraer el tipo de auto del nombre "Detallado Básico - Autos (...)"
              const nombreCorto = servicio.nombre.split(' - ')[1] || servicio.nombre;
              
              return (
                <motion.div
                  key={servicio.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group relative bg-[#0f1423] border border-white/5 hover:border-sky-500/50 rounded-[2rem] p-8 flex flex-col h-full overflow-hidden transition-all duration-300 shadow-2xl"
                >
                  <div className="relative z-10 flex-grow">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-white/5 rounded-xl text-sky-400">
                        <CarFront className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-white leading-tight">{nombreCorto}</h3>
                    </div>
                    
                    <div className="mb-8">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-white">${servicio.precio}</span>
                        <span className="text-sm font-bold text-zinc-500">MXN</span>
                      </div>
                      <p className="text-sm text-zinc-500 mt-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Tiempo est: {servicio.duracionMinutos} min
                      </p>
                    </div>

                    <ul className="space-y-3 mb-8">
                      <li className="flex items-start gap-3 text-zinc-300 text-sm">
                        <CheckCircle2 className="w-5 h-5 text-sky-400 flex-shrink-0" />
                        <span>Exterior: Lavado, rines, llantas</span>
                      </li>
                      <li className="flex items-start gap-3 text-zinc-300 text-sm">
                        <CheckCircle2 className="w-5 h-5 text-sky-400 flex-shrink-0" />
                        <span>Interior: Aspirado y desinfección</span>
                      </li>
                      <li className="flex items-start gap-3 text-zinc-300 text-sm">
                        <CheckCircle2 className="w-5 h-5 text-sky-400 flex-shrink-0" />
                        <span>Acabado: Protector UV mate</span>
                      </li>
                    </ul>
                  </div>

                  <button 
                    onClick={onBookClick}
                    className="w-full py-4 rounded-xl bg-white/5 hover:bg-sky-500 hover:text-white text-zinc-300 font-bold transition-colors mt-auto"
                  >
                    Seleccionar
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── UPSELLS (EXTRAS) ── */}
      {extras.length > 0 && (
        <section className="py-20 px-4 relative z-20 border-t border-white/5 bg-[#080b14]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-sky-400 font-bold uppercase tracking-wider text-sm mb-2 block">Lleva tu servicio al siguiente nivel</span>
              <h2 className="text-3xl md:text-4xl font-black">Servicios Adicionales (Extras)</h2>
            </div>

            <div className="flex flex-col gap-4">
              {extras.map((extra, idx) => (
                <motion.div
                  key={extra.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 rounded-2xl bg-[#0f1423] border border-white/5 hover:border-sky-500/20 transition-colors"
                >
                  <div className="flex items-start gap-4 mb-4 sm:mb-0">
                    <div className="p-3 bg-sky-500/10 rounded-xl text-sky-400 flex-shrink-0 mt-1 sm:mt-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">{extra.nombre.replace('Extra: ', '')}</h4>
                      <p className="text-zinc-400 text-sm leading-relaxed max-w-xl">{extra.descripcion}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:pl-6 sm:border-l sm:border-white/10">
                    <div className="text-left sm:text-right">
                      <p className="text-xl font-black text-white">+${extra.precio}</p>
                      <p className="text-xs text-zinc-500 flex items-center gap-1 sm:justify-end">
                        <Clock className="w-3 h-3" /> +{extra.duracionMinutos}m
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <p className="text-zinc-500 text-sm mb-6">Podrás agregar estos servicios durante el proceso de reserva.</p>
              <button
                onClick={onBookClick}
                className="inline-flex items-center gap-2 px-8 py-4 bg-sky-500 hover:bg-sky-400 text-white font-black rounded-2xl transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)]"
              >
                Comenzar Reserva <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/10 py-12 px-4 relative z-20 bg-[#030712]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h4 className="text-2xl font-black text-white tracking-tight">{barberia.nombre}</h4>
            <p className="text-sm text-zinc-500 mt-1">{barberia.direccion}</p>
          </div>
          
          <a href="/" className="group flex items-center gap-2 opacity-60 hover:opacity-100 transition-all duration-300">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold group-hover:text-zinc-400">Powered by</span>
            <span className="font-black text-sm tracking-tight text-zinc-300 group-hover:text-zinc-100 transition-colors">
              Krono<span className="text-sky-400">Book</span>
            </span>
          </a>
        </div>
      </footer>
    </div>
  );
};
