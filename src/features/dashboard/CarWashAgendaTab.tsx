import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Phone, User, Trash2, CheckCircle2, XCircle, Bell, ChevronDown, MessageCircle } from 'lucide-react';
import { type Cita, type Servicio } from '../../types';

// Helper for generating calendar days
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};
const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

interface CarWashAgendaTabProps {
  citas: Cita[];
  servicios: Servicio[];
  onUpdateStatus: (id: string, estado: Cita['estado']) => void;
  onDeleteCita: (id: string) => Promise<void>;
  businessName?: string;
}

export const CarWashAgendaTab: React.FC<CarWashAgendaTabProps> = ({ citas, servicios, onUpdateStatus, onDeleteCita }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(
    `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
  );
  const [expandedCitaId, setExpandedCitaId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(i).padStart(2, '0');
      days.push(`${year}-${monthStr}-${dayStr}`);
    }
    return days;
  }, [year, month, daysInMonth, firstDay]);

  const citasDelDia = useMemo(() => {
    if (!selectedDateStr) return [];
    return citas
      .filter(c => {
        if (!c.fecha) return false;
        const formattedCitaFecha = typeof c.fecha === 'string' ? c.fecha.split('T')[0] : '';
        return formattedCitaFecha === selectedDateStr;
      })
      .sort((a, b) => a.hora.localeCompare(b.hora));
  }, [citas, selectedDateStr]);

  const getServiceDetails = (servicioId: string) => {
    return servicios.find(s => s.id === servicioId);
  };

  const getStatusConfig = (estado: string) => {
    switch (estado) {
      case 'completada': return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Completada', dot: 'bg-emerald-500' };
      case 'confirmada': return { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', label: 'Confirmada', dot: 'bg-blue-500' };
      case 'cancelada': return { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', label: 'Cancelada', dot: 'bg-rose-500' };
      default: return { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Pendiente', dot: 'bg-amber-500' };
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Eliminar esta cita permanentemente?')) {
      setIsDeleting(id);
      try {
        await onDeleteCita(id);
      } finally {
        setIsDeleting(null);
        setExpandedCitaId(null);
      }
    }
  };

  const handleWhatsAppReminder = (cita: Cita, service: Servicio | undefined) => {
    const message = `¡Hola ${cita.clienteNombre}! 🚗✨ Te recordamos que tienes una cita en *DualFX* el ${cita.fecha} a las ${cita.hora} para *${service?.nombre || 'tu servicio'}*. ${cita.direccionServicio ? `📍 Dirección: ${cita.direccionServicio}` : ''} ¡Te esperamos!`;
    const phone = cita.clienteTelefono.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const toggleExpanded = (id: string) => {
    setExpandedCitaId(prev => prev === id ? null : id);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Calendar Column */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:w-1/2 flex flex-col"
      >
        <div className="bg-white/[0.02] backdrop-blur-md border border-white/[0.05] rounded-[2rem] p-4 sm:p-6 shadow-2xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <span className="text-[#6E3BFF] drop-shadow-[0_0_8px_rgba(110,59,255,0.5)]">{MONTH_NAMES[month]}</span>
              <span className="text-white/90">{year}</span>
            </h3>
            <div className="flex gap-2">
              <button onClick={handlePrevMonth} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-white/50 hover:text-white">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={handleNextMonth} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-white/50 hover:text-white">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Days header */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
              <div key={d} className="text-center text-[10px] sm:text-xs font-bold text-white/30 uppercase py-2">
                {d}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((dateStr, idx) => {
              if (!dateStr) return <div key={`empty-${idx}`} className="aspect-square rounded-xl border border-transparent"></div>;
              
              const isSelected = selectedDateStr === dateStr;
              const isToday = dateStr === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
              
              const citasEnEsteDia = citas.filter(c => {
                if (!c.fecha) return false;
                const formattedCitaFecha = typeof c.fecha === 'string' ? c.fecha.split('T')[0] : '';
                return formattedCitaFecha === dateStr;
              });
              const dayNumber = parseInt(dateStr.split('-')[2], 10);

              return (
                <button
                  key={dateStr}
                  onClick={() => {
                    setSelectedDateStr(dateStr);
                    setExpandedCitaId(null);
                  }}
                  className={`relative aspect-square flex flex-col items-center justify-center sm:justify-start sm:py-2 rounded-xl sm:rounded-2xl border transition-all duration-300 active:scale-95 ${
                    isSelected 
                      ? 'bg-gradient-to-br from-[#6E3BFF]/20 to-[#9B6DFF]/10 border-[#6E3BFF]/50 shadow-[0_0_20px_rgba(110,59,255,0.15)]' 
                      : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <span className={`text-xs sm:text-sm font-bold mt-1 sm:mt-0 ${
                    isSelected ? 'text-white' : isToday ? 'text-[#6E3BFF]' : 'text-white/60'
                  }`}>
                    {dayNumber}
                  </span>
                  
                  {/* Indicators */}
                  {citasEnEsteDia.length > 0 && (
                    <div className="flex gap-0.5 sm:gap-1 mt-1 flex-wrap justify-center px-1">
                      {citasEnEsteDia.slice(0, 3).map((_, i) => (
                        <div key={i} className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${isSelected ? 'bg-[#9B6DFF]' : 'bg-[#6E3BFF]/60'}`}></div>
                      ))}
                      {citasEnEsteDia.length > 3 && (
                        <span className="text-[8px] text-[#6E3BFF] font-bold leading-none mt-auto">+</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Appointments Column */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:w-1/2 flex flex-col"
      >
        <div className="bg-white/[0.02] backdrop-blur-md border border-white/[0.05] rounded-[2rem] p-4 sm:p-6 flex-grow min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#6E3BFF]" />
              Agenda del Día
            </h3>
            {selectedDateStr && (
              <motion.span 
                key={selectedDateStr}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xs font-bold px-3 py-1 bg-[#6E3BFF]/10 text-[#9B6DFF] rounded-lg border border-[#6E3BFF]/20"
              >
                {selectedDateStr}
              </motion.span>
            )}
          </div>
          
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {citasDelDia.length > 0 ? (
                citasDelDia.map((cita, index) => {
                  const service = getServiceDetails(cita.servicioId);
                  const isDeletingThis = isDeleting === cita.id;
                  const isExpanded = expandedCitaId === cita.id;
                  const statusConfig = getStatusConfig(cita.estado);
                  
                  return (
                    <motion.div
                      key={cita.id}
                      layout
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -100, scale: 0.9, transition: { duration: 0.3 } }}
                      transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 25 }}
                      className={`group rounded-2xl border transition-all duration-300 overflow-hidden ${
                        isExpanded 
                          ? 'bg-white/[0.04] border-[#6E3BFF]/30 shadow-[0_0_30px_rgba(110,59,255,0.1)]' 
                          : 'bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.03]'
                      }`}
                    >
                      {/* Clickable Header — always visible */}
                      <button
                        onClick={() => toggleExpanded(cita.id)}
                        className="w-full p-4 flex items-center gap-3 text-left active:scale-[0.99] transition-transform"
                      >
                        {/* Time badge */}
                        <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-[#6E3BFF]/20 to-[#9B6DFF]/10 flex flex-col items-center justify-center border border-[#6E3BFF]/20">
                          <Clock className="w-4 h-4 text-[#9B6DFF] mb-0.5" />
                          <span className="text-[10px] font-bold text-white/70">{cita.hora}</span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm truncate">{cita.clienteNombre}</h4>
                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border} border`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} ${cita.estado === 'pendiente' ? 'animate-pulse' : ''}`} />
                              {statusConfig.label}
                            </div>
                          </div>
                          <p className="text-xs text-white/40 mt-0.5 truncate">
                            {service?.nombre || 'Servicio'} · <span className="text-[#9B6DFF]">${service?.precio || 0}</span>
                          </p>
                        </div>

                        {/* Expand arrow */}
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                        >
                          <ChevronDown className="w-5 h-5 text-white/20" />
                        </motion.div>
                      </button>

                      {/* Expandable Content */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 space-y-3">
                              {/* Divider */}
                              <div className="h-px bg-gradient-to-r from-transparent via-[#6E3BFF]/20 to-transparent" />

                              {/* Client details */}
                              <div className="grid grid-cols-2 gap-3">
                                <motion.div 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.05 }}
                                  className="flex items-center gap-2 p-3 bg-black/20 rounded-xl"
                                >
                                  <User className="w-4 h-4 text-[#6E3BFF] shrink-0" />
                                  <span className="text-sm font-medium text-white/80 truncate">{cita.clienteNombre}</span>
                                </motion.div>
                                <motion.a 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.1 }}
                                  href={`tel:${cita.clienteTelefono}`}
                                  className="flex items-center gap-2 p-3 bg-black/20 hover:bg-[#6E3BFF]/10 rounded-xl transition-colors"
                                >
                                  <Phone className="w-4 h-4 text-[#6E3BFF] shrink-0" />
                                  <span className="text-sm font-medium text-white/80 truncate">{cita.clienteTelefono}</span>
                                </motion.a>
                              </div>

                              {/* Service info */}
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="flex items-center justify-between p-3 bg-black/20 rounded-xl"
                              >
                                <div>
                                  <span className="block text-[10px] uppercase tracking-wider text-white/30 font-semibold mb-0.5">Servicio</span>
                                  <span className="text-sm text-white/80 font-medium">{service?.nombre || 'Desconocido'}</span>
                                </div>
                                <div className="text-right">
                                  <span className="block text-[10px] uppercase tracking-wider text-white/30 font-semibold mb-0.5">Precio</span>
                                  <span className="text-lg text-[#9B6DFF] font-bold">${service?.precio || 0}</span>
                                </div>
                              </motion.div>

                              {/* Address */}
                              {cita.direccionServicio && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.2 }}
                                  className="flex items-start gap-2 p-3 bg-white/[0.02] rounded-xl border border-white/5"
                                >
                                  <MapPin className="w-4 h-4 text-[#6E3BFF] shrink-0 mt-0.5" />
                                  <span className="text-sm text-white/60">{cita.direccionServicio}</span>
                                </motion.div>
                              )}

                              {/* Notes */}
                              {cita.notas && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.25 }}
                                  className="p-3 bg-[#6E3BFF]/5 border border-[#6E3BFF]/10 rounded-xl"
                                >
                                  <p className="text-xs text-white/50 italic">"{cita.notas}"</p>
                                </motion.div>
                              )}

                              {/* Action Buttons */}
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="grid grid-cols-2 gap-2 pt-1"
                              >
                                {/* Confirm / Complete */}
                                {cita.estado !== 'completada' && cita.estado !== 'cancelada' && (
                                  <button
                                    onClick={() => onUpdateStatus(cita.id, 'completada')}
                                    className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-bold transition-all active:scale-95"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Completar
                                  </button>
                                )}
                                
                                {/* Cancel */}
                                {cita.estado !== 'cancelada' && cita.estado !== 'completada' && (
                                  <button
                                    onClick={() => onUpdateStatus(cita.id, 'cancelada')}
                                    className="flex items-center justify-center gap-2 py-3 px-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-xl text-sm font-bold transition-all active:scale-95"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    Cancelar
                                  </button>
                                )}

                                {/* Reactivate if completed/cancelled */}
                                {(cita.estado === 'completada' || cita.estado === 'cancelada') && (
                                  <button
                                    onClick={() => onUpdateStatus(cita.id, 'pendiente')}
                                    className="flex items-center justify-center gap-2 py-3 px-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 rounded-xl text-sm font-bold transition-all active:scale-95"
                                  >
                                    <Bell className="w-4 h-4" />
                                    Reactivar
                                  </button>
                                )}

                                {/* WhatsApp Reminder */}
                                <button
                                  onClick={() => handleWhatsAppReminder(cita, service)}
                                  className="flex items-center justify-center gap-2 py-3 px-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 rounded-xl text-sm font-bold transition-all active:scale-95"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  WhatsApp
                                </button>
                              </motion.div>

                              {/* Delete — separated visually */}
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.35 }}
                                className="pt-2 border-t border-white/5"
                              >
                                <button
                                  onClick={() => handleDelete(cita.id)}
                                  disabled={isDeletingThis}
                                  className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  {isDeletingThis ? 'Eliminando...' : 'Eliminar cita permanentemente'}
                                </button>
                              </motion.div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="py-16 text-center flex flex-col items-center justify-center text-white/30 border border-dashed border-white/10 rounded-2xl"
                >
                  <CalendarIcon className="w-14 h-14 mb-4 opacity-15" />
                  <p className="font-bold text-lg">Sin citas</p>
                  <p className="text-xs mt-1 opacity-60 max-w-[200px]">Selecciona una fecha en el calendario o registra una nueva cita.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
