import React, { useState } from 'react';
import { type Servicio, type Cita } from '../../types';
import { Calendar } from './Calendar';
import { useBookings } from '../../hooks/useBookings';

interface BookingFlowProps {
  servicios: Servicio[];
  onBookingComplete: (citaData: Omit<Cita, 'id' | 'estado' | 'barberiaId'>) => void;
  onCancel: () => void;
}

export const BookingFlow: React.FC<BookingFlowProps> = ({
  servicios,
  onBookingComplete,
  onCancel,
}) => {
  const { barberia } = useBookings();
  const colorPrimario = barberia?.colorPrimario || '#1d4ed8';

  const [step, setStep] = useState(1);
  const [servicioId, setServicioId] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [notas, setNotas] = useState('');

  const timeSlots = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

  const handleNext = () => setStep((prev) => prev + 1);
  const handlePrev = () => setStep((prev) => prev - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!servicioId || !fecha || !hora || !clienteNombre || !clienteTelefono) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    onBookingComplete({
      clienteNombre,
      clienteEmail,
      clienteTelefono,
      servicioId,
      fecha,
      hora,
      notas,
    });
  };

  const selectedService = servicios.find((s) => s.id === servicioId);

  return (
    <div className="max-w-xl mx-auto my-12 p-6 md:p-8 bg-[#16191e]/40 backdrop-blur-md border border-white/5 shadow-xl rounded-3xl text-zinc-100">
      <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: colorPrimario }}>
        Reservar una Cita
      </h2>

      <div className="flex justify-between items-center mb-8 px-2">
        {[1, 2, 3].map((num) => (
          <div key={num} className="flex items-center flex-1 last:flex-none">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                step >= num
                  ? 'text-zinc-950 font-black shadow-lg'
                  : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
              }`}
              style={step >= num ? { backgroundColor: colorPrimario } : {}}
            >
              {num}
            </div>
            {num < 3 && (
              <div
                className={`h-0.5 flex-grow mx-4 transition-all duration-300 ${
                  step > num ? '' : 'bg-zinc-800'
                }`}
                style={step > num ? { backgroundColor: colorPrimario } : {}}
              />
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-zinc-200 mb-4">1. Selecciona el Servicio</h3>
          <div className="space-y-3">
            {servicios.map((s) => (
              <div
                key={s.id}
                onClick={() => {
                  setServicioId(s.id);
                  handleNext();
                }}
                className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex justify-between items-center active:scale-[0.98] ${
                  servicioId === s.id
                    ? 'shadow-lg'
                    : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70 active:bg-zinc-900/80'
                }`}
                style={servicioId === s.id ? { borderColor: colorPrimario, backgroundColor: `${colorPrimario}10` } : {}}
              >
                <div>
                  <strong className="block text-zinc-100 font-semibold">{s.nombre}</strong>
                  <span className="text-zinc-500 text-sm">{s.duracionMinutos} min</span>
                </div>
                <div className="font-bold text-lg" style={{ color: colorPrimario }}>${s.precio} MXN</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-zinc-200">2. Fecha y Hora</h3>
          <Calendar selectedDate={fecha} onChange={setFecha} primaryColor={colorPrimario} />

          {fecha && (
            <div className="animate-fadeIn">
              <label className="block mb-3 text-zinc-400 font-semibold text-sm tracking-wide uppercase">
                Selecciona la Hora
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => {
                      setHora(slot);
                      handleNext();
                    }}
                    className={`py-2 px-3 rounded-lg border text-sm font-semibold transition-all duration-200 cursor-pointer active:scale-95 ${
                      hora === slot
                        ? 'text-zinc-950 shadow-md'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-zinc-100 active:bg-zinc-800'
                    }`}
                    style={hora === slot ? { backgroundColor: colorPrimario, borderColor: colorPrimario } : {}}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={handlePrev}
              className="px-5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 active:bg-[#0b0c0e] active:scale-95 transition-all duration-200 text-sm font-medium cursor-pointer"
            >
              Atrás
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-xl font-bold text-zinc-200">3. Tus Datos</h3>
          
          {selectedService && (
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-sm text-zinc-400 mb-2">
              <span className="font-semibold text-zinc-300">Resumen:</span> {selectedService.nombre} • {fecha} a las {hora} hs
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-zinc-400 text-sm font-medium">Nombre Completo *</label>
            <input
              type="text"
              required
              value={clienteNombre}
              onChange={(e) => setClienteNombre(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0b0c0e] border border-zinc-800 text-zinc-100 placeholder-zinc-600 outline-none transition-colors text-sm"
              placeholder="Ej. Juan Pérez"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-zinc-400 text-sm font-medium">Teléfono *</label>
            <input
              type="tel"
              required
              value={clienteTelefono}
              onChange={(e) => setClienteTelefono(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0b0c0e] border border-zinc-800 text-zinc-100 placeholder-zinc-600 outline-none transition-colors text-sm"
              placeholder="Ej. 55 1234 5678"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-zinc-400 text-sm font-medium">Email (Opcional)</label>
            <input
              type="email"
              value={clienteEmail}
              onChange={(e) => setClienteEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0b0c0e] border border-zinc-800 text-zinc-100 placeholder-zinc-600 outline-none transition-colors text-sm"
              placeholder="juan@ejemplo.com"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-zinc-400 text-sm font-medium">Notas o Comentarios</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0b0c0e] border border-zinc-800 text-zinc-100 placeholder-zinc-600 outline-none transition-colors text-sm resize-none"
              placeholder="Alguna preferencia para tu corte..."
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={handlePrev}
              className="flex-1 px-5 py-3 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 active:bg-[#0b0c0e] active:scale-95 transition-all duration-200 text-sm font-semibold cursor-pointer"
            >
              Atrás
            </button>
            <button
              type="submit"
              className="flex-1 px-5 py-3 rounded-xl text-zinc-950 font-bold transition-all duration-200 active:scale-95 shadow-lg text-sm cursor-pointer"
              style={{ backgroundColor: colorPrimario }}
            >
              Confirmar Reserva
            </button>
          </div>
        </form>
      )}

      <button
        onClick={onCancel}
        type="button"
        className="mt-6 w-full text-center text-zinc-500 hover:text-red-400/80 active:text-red-400 active:scale-95 transition-all duration-200 text-xs font-semibold uppercase tracking-wider cursor-pointer"
      >
        Cancelar y volver
      </button>
    </div>
  );
};
