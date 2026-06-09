import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { type Servicio } from '../../types';

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  barberiaId: string;
  services: Servicio[];
  onSuccess: (newCita?: any) => void;
}

export const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({
  isOpen,
  onClose,
  barberiaId,
  services,
  onSuccess
}) => {
  const getCurrentTimeStr = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const [servicioId, setServicioId] = useState('');
  const [hora, setHora] = useState(getCurrentTimeStr());
  const [propina, setPropina] = useState('0');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!servicioId) return setErrorMsg('Selecciona un servicio');

    setLoading(true);
    setErrorMsg(null);

    // Obtener la fecha de hoy limpia (YYYY-MM-DD) para evitar problemas de zona horaria
    const hoy = new Date().toLocaleDateString('sv-SE'); // sv-SE da formato YYYY-MM-DD de forma confiable

    // Obtener hora actual en formato HH:MM si no se especifica
    const horaFinal = hora || getCurrentTimeStr();

    try {
      const { data, error } = await supabase.from('citas').insert([
        {
          barberia_id: barberiaId,
          servicio_id: servicioId,
          cliente_nombre: 'Walk-in (Presencial)', // Nombre genérico automático
          cliente_telefono: 'Walk-in',
          fecha: hoy,
          hora: horaFinal,
          estado: 'completada', // Al ser añadida por el admin en el momento, ya está completada
          propina: parseFloat(propina) || 0,
          notas: notes || 'Registrado desde el Dashboard admin.'
        }
      ]).select();

      if (error) throw error;

      onSuccess(data && data[0] ? data[0] : undefined); // Recarga las citas y pasa los datos del ticket
      onClose();   // Cierra el modal
      // Resetear campos
      setServicioId('');
      setHora(getCurrentTimeStr());
      setPropina('0');
      setNotes('');
    } catch (error: any) {
      console.error(error);
      setErrorMsg('Error al registrar la cita rápida: ' + (error.message || 'Error de base de datos'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/80 flex justify-center items-center z-50 p-4 backdrop-blur-sm animate-fade-in transition-all duration-200">
      <div className="bg-[#1e2326]/90 border border-zinc-800/80 w-full max-w-md p-6 rounded-3xl shadow-2xl relative overflow-hidden animate-scale-up transition-all duration-200">
        {/* Top Gradient Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-500" />

        <h3 className="text-xl font-bold text-zinc-100 mb-4 flex items-center gap-2 mt-2">
          Registrar Venta / Cita Rápida
        </h3>

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm p-3 rounded-xl mb-4">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seleccionar Servicio */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Servicio</label>
            <select
              required
              value={servicioId}
              onChange={(e) => setServicioId(e.target.value)}
              className="w-full bg-[#1e2326]/50 border border-zinc-800 rounded-xl py-3 px-4 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500/80 focus:ring-4 focus:ring-amber-500/5 transition-all duration-200 text-sm cursor-pointer active:scale-[0.99]"
            >
              <option value="" className="bg-[#1e2326] text-zinc-400">-- Selecciona el servicio dado --</option>
              {services.map((srv) => (
                <option key={srv.id} value={srv.id} className="bg-[#1e2326] text-zinc-100">
                  {srv.nombre} (${srv.precio} MXN)
                </option>
              ))}
            </select>
          </div>

          {/* Propina */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Propina Extra ($ MXN)</label>
            <input
              type="number"
              min="0"
              step="any"
              value={propina}
              onChange={(e) => setPropina(e.target.value)}
              className="w-full bg-[#1e2326]/50 border border-zinc-800 rounded-xl py-3 px-4 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500/80 focus:ring-4 focus:ring-amber-500/5 transition-all duration-200 text-sm"
              placeholder="0.00"
            />
          </div>

          {/* Hora */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Hora</label>
            <input
              type="time"
              required
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="w-full bg-[#1e2326]/50 border border-zinc-800 rounded-xl py-3 px-4 text-zinc-100 focus:outline-none focus:border-amber-500/80 focus:ring-4 focus:ring-amber-500/5 transition-all duration-200 text-sm"
            />
          </div>

          {/* Detalles Extras */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Notas / Detalles</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#1e2326]/50 border border-zinc-800 rounded-xl py-3 px-4 text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-amber-500/80 focus:ring-4 focus:ring-amber-500/5 transition-all duration-200 text-sm"
              placeholder="Ej. Cliente güero, corte con navaja..."
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 bg-zinc-800 hover:bg-zinc-750 active:bg-zinc-700 active:scale-95 text-zinc-300 font-bold p-3.5 rounded-xl transition-all duration-200 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-1/2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-70 text-zinc-950 font-bold p-3.5 rounded-xl transition-all duration-200 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] active:scale-95 cursor-pointer"
            >
              {loading ? 'Registrando...' : 'Agregar a Caja 💰'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
