import React, { useState } from 'react';
import { type Servicio, type Cita } from '../../types';
import { Calendar } from './Calendar';
import { useBookings } from '../../hooks/useBookings';

interface BookingFlowProps {
  servicios: Servicio[];
  onBookingComplete: (citaData: Omit<Cita, 'id' | 'estado' | 'negocioId'>) => void;
  onCancel: () => void;
  askForAddress?: boolean;
}

export const BookingFlow: React.FC<BookingFlowProps> = ({
  servicios,
  onBookingComplete,
  onCancel,
  askForAddress = false,
}) => {
  const { negocio } = useBookings();
  const colorPrimario = negocio?.colorPrimario || '#0ea5e9';

  const [step, setStep] = useState(1);
  // Multi-selección de paquetes base
  const [selectedBaseIds, setSelectedBaseIds] = useState<string[]>([]);
  const [extraIds, setExtraIds] = useState<string[]>([]);
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [direccionServicio, setDireccionServicio] = useState('');
  const [notas, setNotas] = useState('');
  const [propina, setPropina] = useState<number>(0);
  const [propinaPersonalizada, setPropinaPersonalizada] = useState('');

  const baseServices = servicios.filter(s => !s.nombre.toLowerCase().includes('extra'));
  const extraServices = servicios.filter(s => s.nombre.toLowerCase().includes('extra'));

  const timeSlots = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

  const handleNext = () => setStep((prev) => prev + 1);
  const handlePrev = () => setStep((prev) => prev - 1);

  // Toggle base service selection
  const toggleBase = (id: string) => {
    setSelectedBaseIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Calcular totales de todos los servicios seleccionados
  const selectedBaseServices = baseServices.filter(s => selectedBaseIds.includes(s.id));
  const selectedExtraServices = extraServices.filter(s => extraIds.includes(s.id));
  const allSelectedServices = [...selectedBaseServices, ...selectedExtraServices];

  const totalPrecio = allSelectedServices.reduce((sum, s) => sum + s.precio, 0);
  const totalDuracion = allSelectedServices.reduce((sum, s) => sum + s.duracionMinutos, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBaseIds.length === 0 || !fecha || !hora || !clienteNombre || !clienteTelefono) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    // Construir notas con todos los servicios seleccionados
    const baseNames = selectedBaseServices.map(s => s.nombre).join(', ');
    let finalNotas = notas;

    const servicesSummary = `[Paquetes: ${baseNames}]`;
    finalNotas = finalNotas ? `${servicesSummary}\n${finalNotas}` : servicesSummary;

    if (extraIds.length > 0) {
      const extraNames = selectedExtraServices.map(s => s.nombre.replace('Extra: ', '')).join(', ');
      const extrasText = `[Extras: ${extraNames}]`;
      finalNotas = `${finalNotas}\n${extrasText}`;
    }

    onBookingComplete({
      clienteNombre,
      clienteEmail,
      clienteTelefono,
      servicioId: selectedBaseIds[0], // Supabase solo soporta 1 — usamos el primero
      fecha,
      hora,
      notas: finalNotas,
      propina,
      direccionServicio: askForAddress ? direccionServicio : undefined,
    });
  };

  return (
    <div className="max-w-xl mx-auto my-4 sm:my-12 p-4 sm:p-6 md:p-8 bg-gradient-to-br from-[#16191e]/80 to-[#0b0c0e]/95 backdrop-blur-xl border border-sky-500/20 shadow-[0_0_40px_rgba(14,165,233,0.15)] rounded-[2rem] text-zinc-100 relative overflow-hidden">
      {/* Glow superior decorativo */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-600 via-sky-400 to-cyan-400" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-sky-500/10 blur-[40px] pointer-events-none" />

      <h2 className="text-3xl font-black mb-8 text-center tracking-tight drop-shadow-md" style={{ color: colorPrimario }}>
        Reservar Servicio
      </h2>

      {/* Progress indicator */}
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

      {/* ── STEP 1: Selección de servicios ── */}
      {step === 1 && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-zinc-200 mb-2">1. Selecciona tu Servicio</h3>

          {/* Paquetes base — multi-selección */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-400 tracking-wider uppercase mb-3 flex items-center gap-2">
              Paquetes principales
              <span className="text-xs font-normal text-zinc-600 normal-case tracking-normal">(puedes elegir más de uno)</span>
            </h4>
            <div className="space-y-2">
              {baseServices.map((s) => {
                const isSelected = selectedBaseIds.includes(s.id);
                return (
                  <div
                    key={s.id}
                    onClick={() => toggleBase(s.id)}
                    className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer flex justify-between items-center active:scale-[0.98] group ${
                      isSelected
                        ? 'shadow-[0_0_20px_rgba(14,165,233,0.15)] -translate-y-0.5'
                        : 'border-zinc-800/80 bg-zinc-900/40 hover:border-sky-500/40 hover:bg-zinc-900/80'
                    }`}
                    style={isSelected ? { borderColor: colorPrimario, backgroundColor: `${colorPrimario}15` } : {}}
                  >
                    <div className="flex items-center gap-3">
                      {/* Checkbox visual */}
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                          isSelected ? 'shadow-[0_0_8px_rgba(14,165,233,0.4)]' : 'border-zinc-700 bg-zinc-900'
                        }`}
                        style={isSelected ? { borderColor: colorPrimario, backgroundColor: colorPrimario } : {}}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 text-zinc-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <strong className={`block font-bold text-base transition-colors duration-300 ${isSelected ? 'text-zinc-50' : 'text-zinc-300 group-hover:text-zinc-100'}`}>
                          {s.nombre}
                        </strong>
                        <span className="text-zinc-500 text-xs font-medium flex items-center gap-1.5 mt-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {s.duracionMinutos} min
                        </span>
                      </div>
                    </div>
                    <div className="font-black text-lg" style={{ color: colorPrimario }}>${s.precio} MXN</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Extras — multi-selección (igual que antes) */}
          {extraServices.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-zinc-400 tracking-wider uppercase mb-3">Servicios adicionales (Extras)</h4>
              <div className="space-y-2">
                {extraServices.map((s) => {
                  const isSelected = extraIds.includes(s.id);
                  return (
                    <div
                      key={s.id}
                      onClick={() => {
                        if (isSelected) {
                          setExtraIds(prev => prev.filter(id => id !== s.id));
                        } else {
                          setExtraIds(prev => [...prev, s.id]);
                        }
                      }}
                      className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer flex justify-between items-center active:scale-[0.98] group ${
                        isSelected
                          ? 'shadow-[0_0_20px_rgba(14,165,233,0.15)] -translate-y-0.5'
                          : 'border-zinc-800/80 bg-zinc-900/40 hover:border-sky-500/40 hover:bg-zinc-900/80'
                      }`}
                      style={isSelected ? { borderColor: `${colorPrimario}80`, backgroundColor: `${colorPrimario}08` } : {}}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-sky-500 focus:ring-0 focus:ring-offset-0 pointer-events-none"
                          style={{ accentColor: colorPrimario }}
                        />
                        <div>
                          <strong className={`block font-bold text-sm transition-colors duration-300 ${isSelected ? 'text-zinc-50' : 'text-zinc-300 group-hover:text-zinc-100'}`}>
                            {s.nombre.replace('Extra: ', '')}
                          </strong>
                          <span className="text-zinc-500 text-xs font-medium flex items-center gap-1.5 mt-0.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            +{s.duracionMinutos} min
                          </span>
                        </div>
                      </div>
                      <div className="font-bold text-base text-zinc-300">+${s.precio} MXN</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Resumen del subtotal y botón siguiente */}
          {selectedBaseIds.length > 0 && (
            <div className="pt-4 border-t border-zinc-800/80 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">
                  {selectedBaseIds.length + extraIds.length} servicio(s) seleccionado(s) · {totalDuracion} min
                </span>
                <span className="font-black" style={{ color: colorPrimario }}>${totalPrecio} MXN</span>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 rounded-xl text-zinc-950 font-black transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 text-sm uppercase tracking-wide cursor-pointer"
                  style={{ backgroundColor: colorPrimario }}
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 2: Fecha y hora ── */}
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

      {/* ── STEP 3: Datos del cliente ── */}
      {step === 3 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-xl font-bold text-zinc-200">3. Tus Datos</h3>

          {/* Resumen de la reserva */}
          {allSelectedServices.length > 0 && (
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-sm text-zinc-400 mb-2 space-y-1.5">
              {selectedBaseServices.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  <span className="font-semibold text-zinc-300">Paquetes:</span>
                  {selectedBaseServices.map(s => (
                    <span key={s.id} className="px-2 py-0.5 bg-zinc-800 rounded-md text-xs text-zinc-300">{s.nombre}</span>
                  ))}
                </div>
              )}
              {selectedExtraServices.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  <span className="font-semibold text-zinc-300">Extras:</span>
                  {selectedExtraServices.map(s => (
                    <span key={s.id} className="px-2 py-0.5 bg-zinc-800 rounded-md text-xs text-zinc-300">{s.nombre.replace('Extra: ', '')}</span>
                  ))}
                </div>
              )}
              <div className="pt-1 text-xs border-t border-zinc-800/50 flex justify-between">
                <span>Duración total: {totalDuracion} min</span>
                <span>📅 {fecha} · ⏰ {hora} hs</span>
              </div>
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

          {askForAddress && (
            <div className="space-y-1">
              <label className="block text-zinc-400 text-sm font-medium">Dirección para el servicio (Opcional)</label>
              <input
                type="text"
                value={direccionServicio}
                onChange={(e) => setDireccionServicio(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0b0c0e] border border-zinc-800 text-zinc-100 placeholder-zinc-600 outline-none transition-colors text-sm"
                placeholder="Ej. Calle Morelos 123, Col. Centro"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-zinc-400 text-sm font-medium">Notas o Comentarios</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0b0c0e] border border-zinc-800 text-zinc-100 placeholder-zinc-600 outline-none transition-colors text-sm resize-none"
              placeholder="Alguna preferencia, instrucciones de acceso..."
            />
          </div>

          {/* Propina */}
          <div className="space-y-3 pt-2">
            <label className="block text-zinc-400 text-sm font-medium">Propina (Opcional)</label>
            <div className="flex flex-wrap gap-2">
              {[0, 20, 50, 100].map((monto) => (
                <button
                  key={monto}
                  type="button"
                  onClick={() => {
                    setPropina(monto);
                    setPropinaPersonalizada('');
                  }}
                  className={`py-2 px-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                    propina === monto && propinaPersonalizada === ''
                      ? 'bg-zinc-100 text-zinc-900 border-zinc-100 shadow-md'
                      : 'bg-[#0b0c0e] border-zinc-800 text-zinc-300 hover:border-zinc-600'
                  }`}
                  style={propina === monto && propinaPersonalizada === '' ? { backgroundColor: colorPrimario, borderColor: colorPrimario, color: '#fff' } : {}}
                >
                  ${monto}
                </button>
              ))}
              <div className="relative flex-1 min-w-[100px]">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Otro"
                  value={propinaPersonalizada}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPropinaPersonalizada(val);
                    setPropina(val ? parseInt(val, 10) : 0);
                  }}
                  className={`w-full pl-8 pr-4 py-2 rounded-xl bg-[#0b0c0e] border text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors ${
                    propinaPersonalizada !== '' ? 'border-zinc-500' : 'border-zinc-800 focus:border-zinc-600'
                  }`}
                />
              </div>
            </div>
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
              className="flex-1 px-5 py-3.5 rounded-xl text-zinc-950 font-black transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 shadow-[0_0_15px_rgba(14,165,233,0.25)] hover:shadow-[0_0_25px_rgba(14,165,233,0.4)] text-sm cursor-pointer uppercase tracking-wide"
              style={{ backgroundColor: colorPrimario }}
            >
              Confirmar • ${totalPrecio + propina} MXN
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
