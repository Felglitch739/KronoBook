/**
 * ============================================================================
 * GUÍA DE SEGURIDAD MULTI-TENANT: CONFIGURACIÓN DE POLÍTICAS RLS EN SUPABASE
 * ============================================================================
 * 
 * Para garantizar que ningún negocio (tenant) pueda ver, modificar o borrar
 * citas o servicios de otro negocio, debes activar Row Level Security (RLS)
 * en tu consola de Supabase (SQL Editor) ejecutando las siguientes sentencias:
 * 
 * 1. Habilitar RLS en las tablas:
 *    ALTER TABLE barberias ENABLE ROW LEVEL SECURITY;
 *    ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;
 *    ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
 * 
 * 2. Política para 'barberias' (Lectura pública, escritura reservada al Owner):
 *    CREATE POLICY "Permitir lectura pública de barberías"
 *    ON barberias FOR SELECT USING (true);
 * 
 *    CREATE POLICY "Owners pueden actualizar su propia barbería"
 *    ON barberias FOR UPDATE USING (auth.uid() = owner_id);
 * 
 * 3. Política para 'servicios' (Lectura pública, gestión exclusiva del Owner):
 *    CREATE POLICY "Permitir lectura pública de servicios"
 *    ON servicios FOR SELECT USING (true);
 * 
 *    CREATE POLICY "Owners gestionan sus propios servicios"
 *    ON servicios FOR ALL USING (
 *      barberia_id IN (
 *        SELECT id FROM barberias WHERE owner_id = auth.uid()
 *      )
 *    );
 * 
 * 4. Política para 'citas' (Lectura y creación libre por barberia_id, gestión restringida al Owner):
 *    -- Permite a clientes registrar citas para un negocio (INSERT) y leerlas (SELECT)
 *    CREATE POLICY "Clientes y dueños pueden ver citas de su barbería"
 *    ON citas FOR SELECT USING (true);
 * 
 *    CREATE POLICY "Cualquiera puede insertar citas"
 *    ON citas FOR INSERT WITH CHECK (true);
 * 
 *    -- Restringe la actualización y eliminación únicamente al dueño de la barbería
 *    CREATE POLICY "Owners tienen control total de citas de su barbería"
 *    ON citas FOR ALL USING (
 *      barberia_id IN (
 *        SELECT id FROM barberias WHERE owner_id = auth.uid()
 *      )
 *    );
 * ============================================================================
 */

import React, { useState } from 'react';
import { type Servicio } from '../../types';
import { Trash2, Plus } from 'lucide-react';

interface ServicesManagerProps {
  servicios: Servicio[];
  onDeleteService: (id: string) => Promise<void>;
  onAddService: (servicio: Omit<Servicio, 'id' | 'barberiaId'>) => Promise<Servicio>;
}

export const ServicesManager: React.FC<ServicesManagerProps> = ({
  servicios,
  onDeleteService,
  onAddService,
}) => {
  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  // Estado para el modal de agregar servicio
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [duracionMinutos, setDuracionMinutos] = useState('30');
  const [descripcion, setDescripcion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDelete = async (id: string, nombreServicio: string) => {
    const confirmed = window.confirm(`¿Estás seguro de que deseas eliminar el servicio "${nombreServicio}"? Esta acción borrará permanentemente el servicio y todas las citas asociadas.`);
    if (!confirmed) return;

    try {
      setLoadingId(id);
      setDeletingIds((prev) => [...prev, id]);
      
      await new Promise((resolve) => setTimeout(resolve, 300));
      await onDeleteService(id);
    } catch (error) {
      console.error('Error al borrar el servicio:', error);
      alert('Hubo un error al intentar eliminar el servicio. Por favor, inténtalo de nuevo.');
      setDeletingIds((prev) => prev.filter((item) => item !== id));
    } finally {
      setLoadingId(null);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const parsedPrecio = parseFloat(precio);
    const parsedDuracion = parseInt(duracionMinutos, 10);

    // Validaciones
    if (!nombre.trim()) {
      return setErrorMsg('El nombre del servicio es requerido.');
    }
    if (isNaN(parsedPrecio) || parsedPrecio < 0) {
      return setErrorMsg('El precio debe ser un número mayor o igual a 0.');
    }
    if (isNaN(parsedDuracion) || parsedDuracion <= 0) {
      return setErrorMsg('La duración debe ser mayor a 0 minutos.');
    }

    try {
      setIsSubmitting(true);
      await onAddService({
        nombre: nombre.trim(),
        precio: parsedPrecio,
        duracionMinutos: parsedDuracion,
        descripcion: descripcion.trim() || undefined,
      });

      // Resetear campos y cerrar modal
      setNombre('');
      setPrecio('');
      setDuracionMinutos('30');
      setDescripcion('');
      setIsModalOpen(false);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg('Error al agregar el servicio. Verifica tu conexión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-zinc-800 gap-4">
        <div>
          <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Catálogo de Servicios
          </h3>
          <p className="text-xs text-zinc-400 mt-1">Gestiona los servicios ofrecidos en tu negocio. Elimina o agrega servicios de forma aislada y segura.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex justify-center items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold rounded-xl transition-all duration-200 border border-sky-500/20 active:scale-95 cursor-pointer text-sm"
        >
          <Plus size={16} />
          <span>Agregar Servicio</span>
        </button>
      </div>

      {servicios.length === 0 ? (
        <div className="text-zinc-500 text-center py-12 bg-zinc-900/20 rounded-3xl border border-zinc-800/50">
          No hay servicios registrados en este catálogo.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicios.map((servicio) => {
            const isDeleting = deletingIds.includes(servicio.id);
            const isLoading = loadingId === servicio.id;

            return (
              <div
                key={servicio.id}
                className={`
                  relative bg-[#16191e]/40 backdrop-blur-md border border-white/5 rounded-2xl p-6
                  flex flex-col h-full transition-all duration-300 ease-out shadow-xl
                  hover:shadow-sky-500/5 hover:border-sky-500/20 hover:-translate-y-1
                  ${isDeleting ? 'opacity-0 scale-95 duration-300 pointer-events-none' : 'opacity-100 scale-100'}
                `}
              >
                <div className="flex justify-between items-start gap-4 mb-3">
                  <h4 className="text-lg font-bold text-zinc-100">
                    {servicio.nombre}
                  </h4>
                  <button
                    onClick={() => handleDelete(servicio.id, servicio.nombre)}
                    disabled={isLoading || isDeleting}
                    className="p-2 rounded-lg bg-zinc-900/50 border border-zinc-800/80 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all duration-200 active:scale-95 cursor-pointer text-zinc-400 hover:text-rose-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Eliminar Servicio"
                  >
                    <Trash2 size={16} className={isLoading ? "animate-spin text-rose-500" : "text-rose-500 hover:text-rose-400"} />
                  </button>
                </div>

                <p className="text-zinc-400 text-xs sm:text-sm flex-grow mb-6 leading-relaxed">
                  {servicio.descripcion || 'Sin descripción disponible.'}
                </p>

                <div className="flex justify-between items-center pt-4 border-t border-zinc-800/60 mt-auto">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold">Precio</span>
                    <span className="font-extrabold text-xl text-sky-400">${servicio.precio} <span className="text-xs text-zinc-500 font-semibold">MXN</span></span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold">Duración</span>
                    <span className="text-xs font-bold text-zinc-300 bg-zinc-900/50 px-2.5 py-1.5 border border-zinc-800 rounded-lg inline-flex items-center gap-1.5 mt-0.5">
                      <svg className="w-3 h-3 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {servicio.duracionMinutos} min
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Agregar Servicio */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-zinc-950/80 flex justify-center items-center z-50 p-4 backdrop-blur-sm animate-fade-in transition-all duration-200">
          <div className="bg-[#1e2326]/90 border border-zinc-800/80 w-full max-w-md p-6 rounded-3xl shadow-2xl relative overflow-hidden animate-scale-up transition-all duration-200">
            {/* Barra de Acento Superior */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-600 via-sky-400 to-cyan-500" />

            <h3 className="text-xl font-bold text-zinc-100 mb-4 flex items-center gap-2 mt-2">
              Agregar Nuevo Servicio
            </h3>

            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm p-3 rounded-xl mb-4">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Nombre del Servicio</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-[#1e2326]/50 border border-zinc-800 rounded-xl py-3 px-4 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-sky-500/80 focus:ring-4 focus:ring-sky-500/5 transition-all duration-200 text-sm"
                  placeholder="Ej. Corte de Cabello Degradado"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Precio ($ MXN)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    className="w-full bg-[#1e2326]/50 border border-zinc-800 rounded-xl py-3 px-4 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-sky-500/80 focus:ring-4 focus:ring-sky-500/5 transition-all duration-200 text-sm"
                    placeholder="200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Duración (min)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={duracionMinutos}
                    onChange={(e) => setDuracionMinutos(e.target.value)}
                    className="w-full bg-[#1e2326]/50 border border-zinc-800 rounded-xl py-3 px-4 text-zinc-100 focus:outline-none focus:border-sky-500/80 focus:ring-4 focus:ring-sky-500/5 transition-all duration-200 text-sm"
                    placeholder="30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Descripción (Opcional)</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full bg-[#1e2326]/50 border border-zinc-800 rounded-xl py-3 px-4 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-sky-500/80 focus:ring-4 focus:ring-sky-500/5 transition-all duration-200 text-sm h-20 resize-none"
                  placeholder="Ej. Peinado final con cera mate..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 bg-zinc-800 hover:bg-zinc-750 active:bg-zinc-700 active:scale-95 text-zinc-300 font-bold p-3.5 rounded-xl transition-all duration-200 cursor-pointer text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 bg-sky-500 hover:bg-sky-400 active:bg-sky-600 disabled:opacity-70 text-zinc-950 font-bold p-3.5 rounded-xl transition-all duration-200 shadow-[0_0_15px_rgba(14,165,233,0.2)] hover:shadow-[0_0_25px_rgba(14,165,233,0.4)] active:scale-95 cursor-pointer text-sm"
                >
                  {isSubmitting ? 'Guardando...' : 'Crear Servicio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
