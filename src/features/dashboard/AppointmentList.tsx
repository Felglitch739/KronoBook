import React, { useState } from 'react';
import { type Cita, type Servicio } from '../../types';
import { Trash2 } from 'lucide-react';

interface AppointmentListProps {
  citas: Cita[];
  servicios: Servicio[];
  onUpdateStatus: (id: string, estado: Cita['estado']) => void;
  onDeleteCita: (id: string) => Promise<void>;
  forceSingleDay?: boolean;
}

export const AppointmentList: React.FC<AppointmentListProps> = ({
  citas,
  servicios,
  onUpdateStatus,
  onDeleteCita,
  forceSingleDay = false,
}) => {
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);

  const handleDeleteCita = async (id: string, nombreCliente: string) => {
    const confirmed = window.confirm(`¿Estás seguro de que deseas eliminar la cita de "${nombreCliente}"? Esta acción borrará permanentemente la cita de la base de datos.`);
    if (!confirmed) return;

    try {
      await onDeleteCita(id);
      setSelectedCita(null);
    } catch (error) {
      console.error('Error al borrar la cita:', error);
      alert('Hubo un error al intentar eliminar la cita.');
    }
  };

  const getService = (servicioId: string | undefined, servicio_id?: string) => {
    const targetId = servicioId || servicio_id;
    return servicios.find((s) => s.id === targetId);
  };

  const getServiceName = (servicioId: string | undefined, servicio_id?: string) => 
    getService(servicioId, servicio_id)?.nombre || 'Servicio Desconocido';
    
  const getServiceDuration = (servicioId: string | undefined, servicio_id?: string) => 
    getService(servicioId, servicio_id)?.duracionMinutos || 30;
    
  const getServicePrice = (servicioId: string | undefined, servicio_id?: string) => 
    getService(servicioId, servicio_id)?.precio || 0;

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  if (citas.length === 0) {
    return <div className="text-zinc-500 text-center py-12 bg-zinc-900/20 rounded-3xl border border-zinc-800/50">No hay citas para mostrar.</div>;
  }

  // Agrupar por fechas únicas y ordenarlas cronológicamente
  const fechasUnicas = Array.from(
    new Set(
      citas
        .map(c => (typeof c.fecha === 'string' ? c.fecha.split('T')[0] : ''))
        .filter(Boolean)
    )
  ).sort();

  return (
    <div className="space-y-12">
      {fechasUnicas.map(fecha => {
        const citasDelDia = citas.filter(c => {
          if (!c.fecha) return false;
          const formattedCitaFecha = typeof c.fecha === 'string' ? c.fecha.split('T')[0] : '';
          return formattedCitaFecha === fecha;
        });
        
        return (
          <div key={fecha} className={`${forceSingleDay ? '' : 'bg-[#16191e]/40 backdrop-blur-md border border-white/5 shadow-xl rounded-3xl p-4 sm:p-6 shadow-xl'}`}>
            {!forceSingleDay && (
              <div className="mb-6 pb-4 border-b border-zinc-800">
                <h3 className="text-xl font-bold text-sky-500">{fecha}</h3>
              </div>
            )}
            
            <div className="relative">
              {/* Línea de tiempo vertical */}
              <div className="absolute left-[56px] sm:left-[70px] top-0 bottom-0 w-px bg-zinc-800/50"></div>
              
              <div className="space-y-6">
                {timeSlots.map(slot => {
                  const citasEnHora = citasDelDia.filter(c => {
                    if (!c.hora) return false;
                    const cleanCitaHora = typeof c.hora === 'string' ? c.hora.slice(0, 5) : '';
                    return cleanCitaHora === slot;
                  });
                  
                  return (
                    <div key={slot} className="relative flex items-start gap-4 sm:gap-6 group">
                      <div className="w-[45px] sm:w-[60px] flex-shrink-0 text-right pt-3">
                        <span className="text-xs sm:text-sm font-bold text-zinc-500 group-hover:text-sky-500 transition-colors">{slot}</span>
                      </div>
                      
                      {/* Nodo de la línea de tiempo */}
                      <div className="absolute left-[56px] sm:left-[70px] top-5 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-zinc-900 bg-zinc-700 group-hover:bg-sky-500 group-hover:border-sky-900 transition-colors z-10"></div>
                      
                      <div className="flex-grow grid grid-cols-1 xl:grid-cols-2 gap-4 pt-1">
                        {citasEnHora.length === 0 ? (
                           <div className="h-12 border border-dashed border-zinc-800/50 rounded-xl flex items-center px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-xs text-zinc-600 font-medium">Disponible</span>
                           </div>
                        ) : (
                           citasEnHora.map(cita => {
                             const cId = cita.id || (cita as any).id;
                             const cNombre = cita.clienteNombre || (cita as any).cliente_nombre || 'Cliente';
                             const cEstado = cita.estado || (cita as any).estado || 'pendiente';
                             const cServicioId = cita.servicioId || (cita as any).servicio_id;
                             return (
                               <button 
                                 key={cId} 
                                 onClick={() => setSelectedCita(cita)}
                                 className="relative text-left bg-[#272e33] border border-zinc-700/50 hover:border-sky-500/30 rounded-xl p-4 shadow-lg transition-all hover:-translate-y-1 overflow-hidden group/card cursor-pointer"
                               >
                                 {/* Barra lateral de estado colorida */}
                                 <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                                   cEstado === 'pendiente' ? 'bg-sky-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' :
                                   cEstado === 'confirmada' ? 'bg-emerald-500' :
                                   cEstado === 'completada' ? 'bg-sky-500' : 'bg-rose-500'
                                 }`}></div>
                                 
                                 <div className="pl-3 flex flex-col h-full">
                                   <div className="flex justify-between items-start mb-2">
                                     <h4 className="text-base font-bold text-zinc-100 truncate pr-2">{cNombre}</h4>
                                     <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                                       cEstado === 'pendiente' ? 'bg-sky-500/10 text-sky-400' :
                                       cEstado === 'confirmada' ? 'bg-emerald-500/10 text-emerald-400' :
                                       cEstado === 'completada' ? 'bg-sky-500/10 text-sky-400' : 'bg-rose-500/10 text-rose-400'
                                     }`}>
                                       {cEstado}
                                     </span>
                                   </div>
                                   
                                   <div className="flex items-center gap-2 mb-3">
                                     <span className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded border border-zinc-700 truncate max-w-full">
                                       {getServiceName(cServicioId)} ({getServiceDuration(cServicioId)}m)
                                     </span>
                                   </div>
                                   
                                   {/* Acciones Rápidas con Iconos Minimalistas */}
                                   <div className="flex justify-end gap-2 pt-3 border-t border-zinc-700/50 mt-auto">
                                     {cEstado === 'pendiente' && (
                                       <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(cId, 'confirmada'); }} className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-zinc-950 transition-colors cursor-pointer" title="Confirmar Cita">
                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                       </button>
                                     )}
                                     {cEstado === 'confirmada' && (
                                       <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(cId, 'completada'); }} className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500 hover:text-zinc-950 transition-colors cursor-pointer" title="Marcar Completada">
                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                       </button>
                                     )}
                                     {cEstado !== 'cancelada' && cEstado !== 'completada' && (
                                       <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(cId, 'cancelada'); }} className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-zinc-950 transition-colors cursor-pointer" title="Cancelar Cita">
                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                       </button>
                                     )}
                                     <button 
                                       onClick={(e) => { 
                                         e.stopPropagation(); 
                                         handleDeleteCita(cId, cNombre); 
                                       }} 
                                       className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-zinc-950 transition-colors cursor-pointer" 
                                       title="Eliminar Cita"
                                     >
                                       <Trash2 size={14} />
                                     </button>
                                   </div>
                                 </div>
                               </button>
                             );
                           })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

      {/* Modal de Detalle de Cita */}
      {selectedCita && (() => {
        const cId = selectedCita.id || (selectedCita as any).id;
        const cNombre = selectedCita.clienteNombre || (selectedCita as any).cliente_nombre || 'Cliente';
        const cTelefono = selectedCita.clienteTelefono || (selectedCita as any).cliente_telefono || '';
        const cServicioId = selectedCita.servicioId || (selectedCita as any).servicio_id;
        const cFecha = selectedCita.fecha || '';
        const cHora = selectedCita.hora || '';
        const cEstado = selectedCita.estado || (selectedCita as any).estado || 'pendiente';
        const cNotas = selectedCita.notas || (selectedCita as any).notes || (selectedCita as any).notas;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b0c0e]/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-[#1e2326] border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
              <div className="absolute top-4 right-4">
                <button onClick={() => setSelectedCita(null)} className="p-2 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-full transition-colors cursor-pointer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <div className="p-8">
                <h3 className="text-2xl font-bold text-zinc-100 mb-1">{cNombre}</h3>
                <p className="text-sky-500 font-mono text-sm mb-6">{cTelefono}</p>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
                    <div className="text-zinc-400 text-sm">Servicio</div>
                    <div className="font-bold text-zinc-100 text-right">{getServiceName(cServicioId)}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
                      <div className="text-zinc-400 text-xs uppercase tracking-wider mb-1">Horario</div>
                      <div className="font-bold text-zinc-100">{cFecha} <br/> <span className="text-sky-500">{cHora}</span></div>
                    </div>
                    <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
                      <div className="text-zinc-400 text-xs uppercase tracking-wider mb-1">Precio</div>
                      <div className="font-bold text-zinc-100 text-lg">${getServicePrice(cServicioId)} MXN</div>
                    </div>
                  </div>

                  {cNotas && (
                    <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
                      <div className="text-zinc-400 text-xs uppercase tracking-wider mb-1">Notas del Cliente</div>
                      <p className="text-zinc-300 italic text-sm">"{cNotas}"</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50 mt-4">
                    <div className="text-zinc-400 text-sm">Estado Actual</div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      cEstado === 'confirmada' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      cEstado === 'pendiente' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                      cEstado === 'completada' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                      'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {cEstado}
                    </span>
                  </div>
                </div>

                {/* Acciones Footer Modal */}
                <div className="mt-8 flex flex-col gap-3">
                  <a 
                    href={`https://wa.me/${cTelefono.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(cNombre)},%20te%20escribimos%20de%20Barbería%20Chaga%20para%20recordarte%20tu%20cita%20de%20${encodeURIComponent(getServiceName(cServicioId))}%20el%20día%20${cFecha}%20a%20las%20${cHora}.%20¡Te%20esperamos!`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20b858] text-white font-bold py-3 px-4 rounded-xl transition-colors border border-sky-500/20 hover:shadow-[0_0_20px_rgba(37,211,102,0.4)] cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.12.551 4.195 1.597 6.01L.062 24l6.113-1.559a11.96 11.96 0 005.856 1.523h.005c6.645 0 12.03-5.385 12.03-12.031C24.066 5.385 18.681 0 12.031 0zm0 21.965h-.004a9.92 9.92 0 01-5.06-1.385l-.363-.215-3.766.96.98-3.667-.236-.375A9.915 9.915 0 012.073 12.03c0-5.5 4.475-9.975 9.96-9.975 5.5 0 9.974 4.475 9.974 9.975 0 5.5-4.474 9.975-9.974 9.975zm5.46-7.464c-.299-.15-1.774-.875-2.049-.975-.274-.1-.474-.15-.674.15-.2.3-.775.975-.95 1.175-.175.2-.35.225-.65.075-.3-.15-1.267-.467-2.414-1.49-.893-.797-1.496-1.782-1.67-2.082-.175-.3-.018-.462.132-.612.135-.135.299-.35.449-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.674-1.625-.924-2.225-.244-.588-.492-.507-.674-.516-.175-.008-.375-.008-.575-.008-.2 0-.525.075-.8.375-.275.3-1.049 1.025-1.049 2.5s1.074 2.9 1.224 3.1c.15.2 2.115 3.225 5.125 4.525.717.31 1.277.495 1.714.633.72.229 1.375.197 1.892.119.578-.087 1.774-.725 2.024-1.425.25-.7.25-1.3.175-1.425-.075-.125-.275-.2-.575-.35z"/></svg>
                    Enviar Recordatorio
                  </a>
                  <div className="flex gap-3 w-full">
                    {cEstado === 'pendiente' && (
                      <button onClick={() => { onUpdateStatus(cId, 'confirmada'); setSelectedCita(null); }} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3 px-4 rounded-xl transition-colors cursor-pointer">
                        Confirmar Cita
                      </button>
                    )}
                    {cEstado === 'confirmada' && (
                      <button onClick={() => { onUpdateStatus(cId, 'completada'); setSelectedCita(null); }} className="flex-1 bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold py-3 px-4 rounded-xl transition-colors cursor-pointer">
                        Completar
                      </button>
                    )}
                    {cEstado !== 'cancelada' && cEstado !== 'completada' && (
                      <button onClick={() => { onUpdateStatus(cId, 'cancelada'); setSelectedCita(null); }} className="flex-1 bg-zinc-800 hover:bg-rose-500/20 text-zinc-300 hover:text-rose-400 border border-transparent hover:border-rose-500/30 font-bold py-3 px-4 rounded-xl transition-colors cursor-pointer">
                        Cancelar
                      </button>
                    )}
                  </div>
                  <button 
                    onClick={() => handleDeleteCita(cId, cNombre)}
                    className="w-full mt-2 bg-rose-500/10 hover:bg-rose-500 hover:text-zinc-950 text-rose-400 font-bold py-2.5 px-4 rounded-xl border border-rose-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    <span>Eliminar Cita</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
