import React, { useState, useMemo } from 'react';
import { type Cita, type Servicio } from '../../types';
import { AppointmentList } from './AppointmentList';

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

interface AgendaTabProps {
  citas: Cita[];
  servicios: Servicio[];
  onUpdateStatus: (id: string, estado: Cita['estado']) => void;
  onDeleteCita: (id: string) => Promise<void>;
}

export const AgendaTab: React.FC<AgendaTabProps> = ({ citas, servicios, onUpdateStatus, onDeleteCita }) => {
  // Inicializamos en Junio 2026, mes de la mock data
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1));
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Generamos la cuadrícula de días
  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null); // Espacios vacíos del mes anterior
    }
    for (let i = 1; i <= daysInMonth; i++) {
      // Formatear a YYYY-MM-DD
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(i).padStart(2, '0');
      days.push(`${year}-${monthStr}-${dayStr}`);
    }
    return days;
  }, [year, month, daysInMonth, firstDay]);

  const citasDelDia = useMemo(() => {
    if (!selectedDateStr) return [];
    return citas.filter(c => {
      if (!c.fecha) return false;
      const formattedCitaFecha = typeof c.fecha === 'string' ? c.fecha.split('T')[0] : '';
      return formattedCitaFecha === selectedDateStr;
    });
  }, [citas, selectedDateStr]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 animate-fadeIn">
      {/* Columna del Calendario Mensual */}
      <div className="lg:w-1/2 xl:w-7/12 flex flex-col">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl shadow-sky-500/5 rounded-2xl sm:rounded-3xl p-3 sm:p-6 flex-grow">
          {/* Header del Calendario */}
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-100 flex items-center gap-2">
              <span className="text-sky-500">{MONTH_NAMES[month]}</span> {year}
            </h3>
            <div className="flex gap-1 sm:gap-2">
              <button onClick={handlePrevMonth} className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-zinc-800 text-zinc-400 hover:text-sky-500 hover:bg-zinc-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={handleNextMonth} className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-zinc-800 text-zinc-400 hover:text-sky-500 hover:bg-zinc-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

          {/* Grid del Calendario */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
              <div key={d} className="text-center text-[10px] sm:text-xs font-bold text-zinc-500 uppercase py-1 sm:py-2">
                {d}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((dateStr, idx) => {
              if (!dateStr) return <div key={`empty-${idx}`} className="h-10 sm:h-16 rounded-lg sm:rounded-xl border border-transparent"></div>;
              
              const isSelected = selectedDateStr === dateStr;
              const citasEnEsteDia = citas.filter(c => {
                if (!c.fecha) return false;
                const formattedCitaFecha = typeof c.fecha === 'string' ? c.fecha.split('T')[0] : '';
                return formattedCitaFecha === dateStr;
              });
              const hasCitas = citasEnEsteDia.length > 0;
              const dayNumber = parseInt(dateStr.split('-')[2], 10);

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`h-10 sm:h-16 flex flex-col items-center justify-center sm:justify-start py-1 sm:py-2 rounded-lg sm:rounded-xl border transition-all duration-200 relative group cursor-pointer ${
                    isSelected 
                      ? 'bg-sky-500/10 border-sky-500 border border-sky-500/20' 
                      : 'bg-zinc-800/30 border-zinc-700/50 hover:border-sky-500/50 hover:bg-zinc-800'
                  }`}
                >
                  <span className={`text-xs sm:text-sm font-bold leading-none ${isSelected ? 'text-sky-500' : 'text-zinc-300 group-hover:text-sky-400'}`}>
                    {dayNumber}
                  </span>
                  
                  {/* Indicadores dorados de citas */}
                  {hasCitas && (
                    <div className="flex gap-1 mt-1 flex-wrap justify-center px-1">
                      {citasEnEsteDia.slice(0, 3).map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-sky-500' : 'bg-sky-500/60 group-hover:bg-sky-400'}`}></div>
                      ))}
                      {citasEnEsteDia.length > 3 && (
                        <span className="text-[8px] text-sky-500 font-bold leading-none">+</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Columna del Panel Lateral (Desglose del Día) */}
      <div className="lg:w-1/2 xl:w-5/12 flex flex-col">
        {selectedDateStr ? (
          <div key={selectedDateStr} className="animate-slide-in-right bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl shadow-sky-500/5 rounded-3xl p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-800 shrink-0">
              <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Agenda del Día
              </h3>
              <span className="text-sm font-bold text-sky-500 bg-sky-500/10 px-3 py-1 rounded-lg border border-sky-500/20">
                {selectedDateStr}
              </span>
            </div>
            
            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 350px)' }}>
              <AppointmentList
                citas={citasDelDia}
                servicios={servicios}
                onUpdateStatus={onUpdateStatus}
                onDeleteCita={onDeleteCita}
                forceSingleDay={true}
              />
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl p-12 text-center min-h-[400px]">
            <svg className="w-16 h-16 mb-4 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <p className="text-lg font-bold text-zinc-400">Selecciona un Día</p>
            <p className="text-sm mt-2">Haz clic en una fecha del calendario para ver el desglose de citas y administrar los horarios de esa jornada.</p>
          </div>
        )}
      </div>
    </div>
  );
};
