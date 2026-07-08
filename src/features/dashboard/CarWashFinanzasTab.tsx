import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Cita, type Servicio } from '../../types';
import { DigitalReceiptModal } from '../../components/dashboard/DigitalReceiptModal';
import { Trash2, DollarSign, TrendingUp, HandCoins, Activity, Download, FileText } from 'lucide-react';

export interface Transaccion {
  id: string;
  fecha: string;
  cliente: string;
  servicio: string;
  monto: number;
  propina: number;
  total: number;
  estado: string;
}

interface CarWashFinanzasTabProps {
  citas: Cita[];
  servicios: Servicio[];
  businessName?: string;
  onDeleteCita: (id: string) => Promise<void>;
}

export const CarWashFinanzasTab: React.FC<CarWashFinanzasTabProps> = ({ citas, servicios, businessName, onDeleteCita }) => {
  const [selectedTx, setSelectedTx] = useState<Transaccion | null>(null);
  const [filtro, setFiltro] = useState<'hoy' | 'semana' | 'mes' | 'mes_anterior' | 'todos'>('mes');

  const handleDeleteClick = async (id: string, clienteName: string) => {
    const confirmed = window.confirm(`¿Estás seguro de que deseas eliminar la transacción de "${clienteName}"? Esto borrará la cita de la base de datos y descontará las ganancias inmediatamente.`);
    if (!confirmed) return;
    try {
      await onDeleteCita(id);
    } catch (error) {
      console.error('Error al eliminar transacción:', error);
      alert('Hubo un error al intentar eliminar la transacción.');
    }
  };
  
  const filteredCitas = useMemo(() => {
    return citas.filter(c => {
      if (filtro === 'todos') return true;
      const date = new Date(c.fecha + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (filtro === 'hoy') {
        return date.getTime() === today.getTime();
      }
      if (filtro === 'semana') {
        const t = new Date(today);
        const day = t.getDay();
        const diff = t.getDate() - day + (day === 0 ? -6 : 1);
        const startOfWeek = new Date(t.setDate(diff));
        startOfWeek.setHours(0,0,0,0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        return date >= startOfWeek && date <= endOfWeek;
      }
      if (filtro === 'mes') {
        return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
      }
      if (filtro === 'mes_anterior') {
        let lastMonth = today.getMonth() - 1;
        let year = today.getFullYear();
        if (lastMonth < 0) {
          lastMonth = 11;
          year--;
        }
        return date.getMonth() === lastMonth && date.getFullYear() === year;
      }
      return true;
    });
  }, [citas, filtro]);

  const metricas = useMemo(() => {
    const citasCobrables = filteredCitas.filter(c => c.estado === 'completada' || c.estado === 'confirmada');
    
    let totalServicios = 0;
    let totalPropinas = 0;
    
    citasCobrables.forEach(c => {
      const servicio = servicios.find(s => s.id === c.servicioId);
      totalServicios += (servicio?.precio || 0);
      totalPropinas += (c.propina || 0);
    });
    
    const totalGanancias = totalServicios + totalPropinas;
    const promedio = citasCobrables.length > 0 ? Math.round(totalGanancias / citasCobrables.length) : 0;
    const completadas = filteredCitas.filter(c => c.estado === 'completada').length;
    
    const variacionIngresos = 12.5;
    const variacionPropinas = 5.2;
    const variacionCitas = 8.1;
    
    return { 
      totalGanancias, totalServicios, totalPropinas, promedio, completadas,
      variacionIngresos, variacionPropinas, variacionCitas
    };
  }, [filteredCitas, servicios]);

  const transacciones = useMemo(() => {
    return filteredCitas
      .filter(c => c.estado === 'completada' || c.estado === 'confirmada')
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .map(cita => {
        const servicio = servicios.find(s => s.id === cita.servicioId);
        const propinaMonto = cita.propina || 0;
        const servicioPrecio = servicio?.precio || 0;
        return {
          id: cita.id, fecha: cita.fecha, cliente: cita.clienteNombre,
          servicio: servicio?.nombre || 'Desconocido', monto: servicioPrecio,
          propina: propinaMonto, total: servicioPrecio + propinaMonto, estado: cita.estado
        };
      });
  }, [filteredCitas, servicios]);

  const datosGrafica = useMemo(() => {
    let endDate = new Date();
    endDate.setHours(0, 0, 0, 0);

    if (filteredCitas.length > 0) {
      const dates = filteredCitas.map(c => new Date(c.fecha + 'T00:00:00'));
      endDate = new Date(Math.max(...dates.map(d => d.getTime())));
    } else if (filtro === 'mes_anterior') {
      const today = new Date();
      endDate = new Date(today.getFullYear(), today.getMonth(), 0);
    }

    const fechas: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(endDate);
      d.setDate(endDate.getDate() - i);
      fechas.push(d.toLocaleDateString('sv-SE'));
    }

    return fechas.map(fecha => {
      const citasDelDia = filteredCitas.filter(c =>
        c.fecha === fecha && (c.estado === 'completada' || c.estado === 'confirmada')
      );
      const totalDia = citasDelDia.reduce((acc, c) => {
        const servicio = servicios.find(s => s.id === c.servicioId);
        return acc + (servicio?.precio || 0) + (c.propina || 0);
      }, 0);
      const dateObj = new Date(fecha + 'T00:00:00');
      const diaSemana = dateObj.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
      const label = `${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)} ${dateObj.getDate()}`;
      return { fecha, label, total: totalDia };
    });
  }, [filteredCitas, servicios, filtro]);

  const maxTotal = useMemo(() => {
    const maxVal = Math.max(...datosGrafica.map(d => d.total), 0);
    return maxVal === 0 ? 100 : maxVal;
  }, [datosGrafica]);

  const puntos = useMemo(() => {
    const n = datosGrafica.length;
    return datosGrafica.map((d, i) => {
      const x = 40 + (i * (420 / Math.max(n - 1, 1)));
      const y = 130 - (d.total / maxTotal) * 100;
      return { x, y, label: d.label, total: d.total };
    });
  }, [datosGrafica, maxTotal]);

  const linePath = useMemo(() => {
    return puntos.reduce((acc, p, i) => acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`), "");
  }, [puntos]);

  const areaPath = useMemo(() => {
    if (puntos.length === 0) return "";
    return `${linePath} L ${puntos[puntos.length - 1].x} 130 L ${puntos[0].x} 130 Z`;
  }, [puntos, linePath]);

  const handleExport = () => {
    if (transacciones.length === 0) return;
    let csvContent = "data:text/csv;charset=utf-8,ID,Fecha,Cliente,Servicio,Monto Servicio,Propina,Monto Total,Estado\n";
    transacciones.forEach(tx => {
      csvContent += `"${tx.id}","${tx.fecha}","${tx.cliente}","${tx.servicio}",${tx.monto},${tx.propina},${tx.total},"${tx.estado}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Corte_DualFX_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const MetricCard = ({ title, value, sub, icon: Icon, delay }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white/[0.02] backdrop-blur-md border border-white/[0.05] p-5 md:p-6 rounded-[2rem] hover:bg-white/[0.04] transition-colors relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
        <Icon className="w-24 h-24 text-[#6E3BFF]" />
      </div>
      <div className="relative z-10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6E3BFF]/20 to-[#9B6DFF]/10 flex items-center justify-center border border-[#6E3BFF]/20 mb-4">
          <Icon className="w-5 h-5 text-[#9B6DFF]" />
        </div>
        <h4 className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">{title}</h4>
        <p className="text-3xl font-display font-bold text-white">{value}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-white/40">{sub}</span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn">
      {/* Filtros */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/[0.02] p-4 rounded-[2rem] border border-white/[0.05]">
        <h2 className="text-lg font-bold flex items-center gap-2 px-2">
          <DollarSign className="w-5 h-5 text-[#6E3BFF]" />
          Finanzas DualFX
        </h2>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-none px-2">
          {[
            { id: 'hoy', label: 'Hoy' },
            { id: 'semana', label: 'Semana' },
            { id: 'mes', label: 'Mes' },
            { id: 'mes_anterior', label: 'Mes Ant.' },
            { id: 'todos', label: 'Todo' },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setFiltro(opt.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filtro === opt.id 
                  ? 'bg-gradient-to-r from-[#6E3BFF] to-[#9B6DFF] text-white shadow-[0_0_15px_rgba(110,59,255,0.3)]' 
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <MetricCard title="Ingresos (Caja)" value={`$${metricas.totalGanancias}`} sub={`Srv: $${metricas.totalServicios} | Prop: $${metricas.totalPropinas}`} icon={DollarSign} delay={0.1} />
        <MetricCard title="Total Propinas" value={`$${metricas.totalPropinas}`} sub="Acumulado del periodo" icon={HandCoins} delay={0.2} />
        <MetricCard title="Promedio Ticket" value={`$${metricas.promedio}`} sub="Por cita completada" icon={TrendingUp} delay={0.3} />
        <MetricCard title="Completadas" value={metricas.completadas} sub="Servicios finalizados" icon={Activity} delay={0.4} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        {/* Gráfica de Rendimiento */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="xl:col-span-2 bg-white/[0.02] backdrop-blur-md border border-white/[0.05] rounded-[2rem] p-6 md:p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#6E3BFF]" />
                Flujo de Caja
              </h3>
              <p className="text-sm text-white/40 mt-1">Últimos 7 días activos del periodo seleccionado</p>
            </div>
          </div>
          
          <div className="w-full overflow-hidden">
            <svg viewBox="0 0 500 160" className="w-full h-auto text-white/50 font-sans text-[9px] select-none">
              <defs>
                <linearGradient id="chartGradientFX" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6E3BFF" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#6E3BFF" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <line x1="40" y1="30" x2="460" y2="30" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="40" y1="80" x2="460" y2="80" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="40" y1="130" x2="460" y2="130" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

              <text x="30" y="33" textAnchor="end" fill="currentColor">${maxTotal}</text>
              <text x="30" y="83" textAnchor="end" fill="currentColor">${Math.round(maxTotal / 2)}</text>
              <text x="30" y="133" textAnchor="end" fill="currentColor">$0</text>

              {areaPath && <path d={areaPath} fill="url(#chartGradientFX)" />}
              {linePath && <path d={linePath} fill="none" stroke="#9B6DFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_8px_rgba(110,59,255,0.5)]" />}

              {puntos.map((p, i) => (
                <g key={i} className="group/point">
                  <circle cx={p.x} cy={p.y} r="12" fill="#6E3BFF" fillOpacity="0.2" className="opacity-0 group-hover/point:opacity-100 transition-opacity duration-300" />
                  <circle cx={p.x} cy={p.y} r="5" fill="#0a0a0f" stroke="#9B6DFF" strokeWidth="2" className="cursor-pointer drop-shadow-[0_0_5px_rgba(110,59,255,0.8)]" />
                  <text x={p.x} y={p.y - 15} textAnchor="middle" fill="#9B6DFF" className="font-bold opacity-0 group-hover/point:opacity-100 transition-opacity duration-300 pointer-events-none drop-shadow-md">
                    ${p.total}
                  </text>
                  <text x={p.x} y="150" textAnchor="middle" fill="currentColor">{p.label}</text>
                </g>
              ))}
            </svg>
          </div>
        </motion.div>

        {/* Tabla de Transacciones (Reciente) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/[0.02] backdrop-blur-md border border-white/[0.05] rounded-[2rem] p-6 md:p-8 flex flex-col h-[500px] xl:h-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#6E3BFF]" />
              Transacciones
            </h3>
            <button 
              onClick={handleExport}
              disabled={transacciones.length === 0}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-xl disabled:opacity-50 transition-colors text-[#9B6DFF]"
              title="Exportar CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {transacciones.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/30 text-center">
                <DollarSign className="w-12 h-12 mb-2 opacity-20" />
                <p>No hay ingresos<br/>en este periodo.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {transacciones.map((tx) => (
                    <motion.div 
                      key={tx.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => setSelectedTx(tx)}
                      className="group p-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-2xl cursor-pointer transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-sm">{tx.cliente}</p>
                          <p className="text-xs text-white/50">{tx.servicio}</p>
                        </div>
                        <p className="font-display font-bold text-[#9B6DFF]">${tx.total}</p>
                      </div>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                        <p className="text-[10px] font-mono text-white/30">{tx.fecha}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(tx.id, tx.cliente);
                          }}
                          className="text-white/20 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <DigitalReceiptModal 
        isOpen={!!selectedTx} 
        onClose={() => setSelectedTx(null)} 
        transaction={selectedTx} 
        businessName={businessName}
      />
    </div>
  );
};
