import React, { useMemo, useState } from 'react';
import { type Cita, type Servicio } from '../../types';
import { DigitalReceiptModal } from '../../components/dashboard/DigitalReceiptModal';
import { Trash2 } from 'lucide-react';

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

interface FinanzasTabProps {
  citas: Cita[];
  servicios: Servicio[];
  businessName?: string;
  onDeleteCita: (id: string) => Promise<void>;
}

export const FinanzasTab: React.FC<FinanzasTabProps> = ({ citas, servicios, businessName, onDeleteCita }) => {
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
        const diff = t.getDate() - day + (day === 0 ? -6 : 1); // Lunes como primer día
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

  // Calculamos las métricas
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
    
    // Mock variation metrics for demonstration
    const variacionIngresos = 12.5; // Positive
    const variacionPropinas = 5.2;
    const variacionCitas = 8.1;
    
    return { 
      totalGanancias, 
      totalServicios, 
      totalPropinas, 
      promedio, 
      completadas,
      variacionIngresos,
      variacionPropinas,
      variacionCitas
    };
  }, [citas, servicios]);

  // Historial de transacciones
  const transacciones = useMemo(() => {
    return filteredCitas
      .filter(c => c.estado === 'completada' || c.estado === 'confirmada')
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .map(cita => {
        const servicio = servicios.find(s => s.id === cita.servicioId);
        const propinaMonto = cita.propina || 0;
        const servicioPrecio = servicio?.precio || 0;
        return {
          id: cita.id,
          fecha: cita.fecha,
          cliente: cita.clienteNombre,
          servicio: servicio?.nombre || 'Desconocido',
          monto: servicioPrecio,
          propina: propinaMonto,
          total: servicioPrecio + propinaMonto,
          estado: cita.estado
        };
      });
  }, [citas, servicios]);

  const datosGrafica = useMemo(() => {
    let endDate = new Date();
    endDate.setHours(0, 0, 0, 0);

    if (filteredCitas.length > 0) {
      const dates = filteredCitas.map(c => new Date(c.fecha + 'T00:00:00'));
      const maxTxDate = new Date(Math.max(...dates.map(d => d.getTime())));
      
      endDate = maxTxDate;
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
        c.fecha === fecha &&
        (c.estado === 'completada' || c.estado === 'confirmada')
      );
      const totalDia = citasDelDia.reduce((acc, c) => {
        const servicio = servicios.find(s => s.id === c.servicioId);
        return acc + (servicio?.precio || 0) + (c.propina || 0);
      }, 0);
      const dateObj = new Date(fecha + 'T00:00:00');
      const diaSemana = dateObj.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
      const diaNum = dateObj.getDate();
      const label = `${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)} ${diaNum}`;
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
    return puntos.reduce((acc, p, i) => {
      return acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
    }, "");
  }, [puntos]);

  const areaPath = useMemo(() => {
    if (puntos.length === 0) return "";
    return `${linePath} L ${puntos[puntos.length - 1].x} 130 L ${puntos[0].x} 130 Z`;
  }, [puntos, linePath]);

  const handleExport = () => {
    if (transacciones.length === 0) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Fecha,Cliente,Servicio,Monto Servicio,Propina,Monto Total,Estado\n";
    
    transacciones.forEach(tx => {
      csvContent += `"${tx.id}","${tx.fecha}","${tx.cliente}","${tx.servicio}",${tx.monto},${tx.propina},${tx.total},"${tx.estado}"\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Corte_de_Caja_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getVariationClass = (value: number) => {
    if (value > 0) return 'text-emerald-500';
    if (value < 0) return 'text-rose-500';
    return 'text-zinc-500';
  };

  const getVariationIcon = (value: number) => {
    if (value > 0) return '↑';
    if (value < 0) return '↓';
    return '−';
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-[#16191e]/40 backdrop-blur-md p-4 rounded-2xl border border-white/5">
        <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2 mb-4 sm:mb-0">
          <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Resumen Financiero
        </h2>
        <div className="flex gap-2 p-1 bg-zinc-900/50 rounded-xl overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'hoy', label: 'Hoy' },
            { id: 'semana', label: 'Esta Semana' },
            { id: 'mes', label: 'Este Mes' },
            { id: 'mes_anterior', label: 'Mes Anterior' },
            { id: 'todos', label: 'Todo' },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setFiltro(opt.id as any)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                filtro === opt.id ? 'bg-sky-500 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl shadow-sky-500/5 hover:border-sky-500/40 p-6 rounded-2xl transition-colors flex items-center gap-4 group cursor-default relative overflow-hidden">
          <div className="p-4 bg-zinc-800/50 rounded-xl text-sky-500 group-hover:scale-110 transition-transform z-10">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="z-10 flex-1">
            <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Ingresos (Caja)</h4>
            <p className="text-3xl font-black text-sky-400">${metricas.totalGanancias}</p>
            <div className="flex justify-between items-center mt-1">
              <p className="text-[10px] text-zinc-500">Srv: ${metricas.totalServicios} | Prop: ${metricas.totalPropinas}</p>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-zinc-900/50 ${getVariationClass(metricas.variacionIngresos)}`}>
                {getVariationIcon(metricas.variacionIngresos)} {Math.abs(metricas.variacionIngresos)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl shadow-sky-500/5 hover:border-sky-500/40 p-6 rounded-2xl transition-colors flex items-center gap-4 group cursor-default">
          <div className="p-4 bg-zinc-800/50 rounded-xl text-sky-400 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <div className="flex-1">
            <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Total Propinas</h4>
            <p className="text-3xl font-black text-white">${metricas.totalPropinas}</p>
            <div className="flex justify-between items-center mt-1">
              <p className="text-[10px] text-zinc-500">Acumulado mensual</p>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-zinc-900/50 ${getVariationClass(metricas.variacionPropinas)}`}>
                {getVariationIcon(metricas.variacionPropinas)} {Math.abs(metricas.variacionPropinas)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl shadow-sky-500/5 hover:border-sky-500/40 p-6 rounded-2xl transition-colors flex items-center gap-4 group cursor-default">
          <div className="p-4 bg-zinc-800/50 rounded-xl text-zinc-400 group-hover:text-sky-500 group-hover:scale-110 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
          <div className="flex-1">
            <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Promedio Ticket</h4>
            <p className="text-3xl font-black text-zinc-100">${metricas.promedio}</p>
            <p className="text-[10px] text-zinc-500 mt-1">Por cita completada</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl shadow-sky-500/5 hover:border-sky-500/40 p-6 rounded-2xl transition-colors flex items-center gap-4 group cursor-default">
          <div className="p-4 bg-zinc-800/50 rounded-xl text-zinc-400 group-hover:text-sky-500 group-hover:scale-110 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <div className="flex-1">
            <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Citas Completadas</h4>
            <p className="text-3xl font-black text-zinc-100">{metricas.completadas}</p>
            <div className="flex justify-between items-center mt-1">
              <p className="text-[10px] text-zinc-500">Histórico</p>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-zinc-900/50 ${getVariationClass(metricas.variacionCitas)}`}>
                {getVariationIcon(metricas.variacionCitas)} {Math.abs(metricas.variacionCitas)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfica de Rendimiento */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl shadow-sky-500/5 rounded-3xl p-6 md:p-8">
        <h3 className="text-xl font-bold text-zinc-200 flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          Tendencia de Ingresos
        </h3>
        <p className="text-xs text-zinc-400 mb-6">Visualización del flujo de caja diario sumando servicios y propinas.</p>
        
        <div className="w-full overflow-hidden">
          <svg viewBox="0 0 500 160" className="w-full h-auto text-zinc-600 font-mono text-[9px] select-none">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Gridlines */}
            <line x1="40" y1="30" x2="460" y2="30" stroke="#27272a" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="40" y1="80" x2="460" y2="80" stroke="#27272a" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="40" y1="130" x2="460" y2="130" stroke="#27272a" strokeWidth="1" />

            {/* Y Axis Labels */}
            <text x="30" y="33" textAnchor="end" fill="#71717a">${maxTotal}</text>
            <text x="30" y="83" textAnchor="end" fill="#71717a">${Math.round(maxTotal / 2)}</text>
            <text x="30" y="133" textAnchor="end" fill="#71717a">$0</text>

            {/* Area Path */}
            {areaPath && (
              <path d={areaPath} fill="url(#chartGradient)" />
            )}

            {/* Line Path */}
            {linePath && (
              <path d={linePath} fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            )}

            {/* Points and Labels */}
            {puntos.map((p, i) => (
              <g key={i} className="group/point">
                <circle cx={p.x} cy={p.y} r="8" fill="#0ea5e9" fillOpacity="0.15" className="opacity-0 group-hover/point:opacity-100 transition-opacity duration-200" />
                <circle cx={p.x} cy={p.y} r="4.5" fill="#0ea5e9" fillOpacity={1} stroke="#18181b" strokeWidth="1.5" className="cursor-pointer" />
                <text
                  x={p.x}
                  y={p.y - 10}
                  textAnchor="middle"
                  fill="#0ea5e9"
                  className="font-bold opacity-0 group-hover/point:opacity-100 transition-opacity duration-200 pointer-events-none"
                >
                  ${p.total}
                </text>
                <text x={p.x} y="150" textAnchor="middle" fill="#a1a1aa">{p.label}</text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Tabla de Transacciones */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl shadow-sky-500/5 rounded-3xl p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-xl font-bold text-zinc-200 flex items-center gap-2">
            <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            Registro Histórico de Transacciones
          </h3>
          <button 
            onClick={handleExport}
            disabled={transacciones.length === 0}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-300 hover:text-sky-500 font-semibold py-2 px-4 rounded-xl border border-zinc-700 transition-colors text-sm cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Exportar CSV
          </button>
        </div>
        
        {transacciones.length === 0 ? (
          <p className="text-zinc-500 text-center py-8">No hay transacciones registradas aún.</p>
        ) : (
          <div className="overflow-x-auto -mx-6 md:mx-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Fecha</th>
                  <th className="py-4 px-6">Cliente</th>
                  <th className="py-4 px-6">Servicio</th>
                  <th className="py-4 px-6 text-right">Monto Servicio</th>
                  <th className="py-4 px-6 text-right">Propina</th>
                  <th className="py-4 px-6 text-right">Total Cobrado</th>
                  <th className="py-4 px-6 text-right w-16">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-sm">
                {transacciones.map((tx) => (
                  <tr 
                    key={tx.id} 
                    onClick={() => setSelectedTx(tx)}
                    className="hover:bg-zinc-800/40 hover:text-sky-400 transition-all cursor-pointer group"
                    title="Ver ticket digital"
                  >
                    <td className="py-4 px-6 font-medium text-zinc-300 group-hover:text-zinc-100">{tx.fecha}</td>
                    <td className="py-4 px-6 text-zinc-100 font-semibold">{tx.cliente}</td>
                    <td className="py-4 px-6 text-zinc-400 group-hover:text-zinc-300">{tx.servicio}</td>
                    <td className="py-4 px-6 text-right font-mono text-zinc-300">${tx.monto}</td>
                    <td className="py-4 px-6 text-right font-mono text-sky-400">
                      {tx.propina > 0 ? `+$${tx.propina}` : '-'}
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-bold text-sky-400 group-hover:scale-105 transition-transform origin-right">
                      ${tx.total}
                    </td>
                    <td className="py-4 px-6 text-right text-zinc-500 group-hover:text-sky-500 transition-colors flex items-center justify-end gap-3">
                      <svg className="w-5 h-5 opacity-45 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(tx.id, tx.cliente);
                        }}
                        className="p-1 rounded-md bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-zinc-950 transition-all duration-200 cursor-pointer"
                        title="Eliminar Cita/Transacción"
                      >
                        <Trash2 size={14} className="text-rose-500 hover:text-rose-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Ticket Digital */}
      <DigitalReceiptModal 
        isOpen={!!selectedTx} 
        onClose={() => setSelectedTx(null)} 
        transaction={selectedTx} 
        businessName={businessName}
      />
    </div>
  );
};
