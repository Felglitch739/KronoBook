import React, { useState, useEffect } from 'react';
import { useBookings } from '../../hooks/useBookings';

export const AparienciaTab: React.FC = () => {
  const { barberia, updateBarberiaAppearance } = useBookings();
  const [tema, setTema] = useState<'dark' | 'light' | 'elegant'>('elegant');
  const [colorPrimario, setColorPrimario] = useState('#1d4ed8');
  const [colorSecundario, setColorSecundario] = useState('#b91c1c');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (barberia) {
      setTema(barberia.tema || 'elegant');
      setColorPrimario(barberia.colorPrimario || '#1d4ed8');
      setColorSecundario(barberia.colorSecundario || '#b91c1c');
    }
  }, [barberia]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateBarberiaAppearance(tema, colorPrimario, colorSecundario);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      alert('Error al guardar la apariencia. Inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  // Determinar color de texto primario en base al brillo
  const getTextColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.55 ? '#09090b' : '#fafafa';
  };

  const primaryText = getTextColor(colorPrimario);

  if (!barberia) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
      {/* Controles de Configuración */}
      <div className="space-y-6">
        <div className="bg-[#16191e]/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-xl">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
            Personalización de Marca
          </h3>

          <div className="space-y-6">
            {/* Selector de Tema */}
            <div>
              <label className="block text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Tema Visual</label>
              <div className="grid grid-cols-3 gap-3">
                {(['dark', 'light', 'elegant'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTema(t)}
                    className={`py-3 px-2 rounded-xl text-sm font-bold uppercase tracking-wider transition-all border-2 ${
                      tema === t 
                        ? 'border-sky-500 text-sky-400 bg-sky-500/10' 
                        : 'border-zinc-800 text-zinc-500 bg-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de Color Primario */}
            <div>
              <label className="block text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Color Primario</label>
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-full overflow-hidden border-4 border-zinc-800 shadow-inner flex-shrink-0">
                  <input
                    type="color"
                    value={colorPrimario}
                    onChange={(e) => setColorPrimario(e.target.value)}
                    className="absolute -inset-4 w-24 h-24 cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <input 
                    type="text" 
                    value={colorPrimario.toUpperCase()} 
                    onChange={(e) => setColorPrimario(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-zinc-100 font-mono text-sm focus:border-sky-500 outline-none transition-colors"
                  />
                  <p className="text-xs text-zinc-500 mt-1">Usado para botones principales y acentos.</p>
                </div>
              </div>
            </div>

            {/* Selector de Color Secundario */}
            <div>
              <label className="block text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Color Secundario</label>
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-full overflow-hidden border-4 border-zinc-800 shadow-inner flex-shrink-0">
                  <input
                    type="color"
                    value={colorSecundario}
                    onChange={(e) => setColorSecundario(e.target.value)}
                    className="absolute -inset-4 w-24 h-24 cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <input 
                    type="text" 
                    value={colorSecundario.toUpperCase()} 
                    onChange={(e) => setColorSecundario(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-zinc-100 font-mono text-sm focus:border-sky-500 outline-none transition-colors"
                  />
                  <p className="text-xs text-zinc-500 mt-1">Usado para fondos secundarios y detalles.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-800/50 flex justify-end items-center gap-4">
            {saveSuccess && (
              <span className="text-emerald-400 text-sm font-semibold animate-pulse">¡Cambios guardados!</span>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-zinc-950 font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 text-sm shadow-[0_0_15px_rgba(14,165,233,0.3)]"
            >
              {isSaving ? 'Guardando...' : 'Guardar Apariencia'}
            </button>
          </div>
        </div>
      </div>

      {/* Live Preview - Simulador Móvil */}
      <div className="flex justify-center items-start">
        <div className="relative w-[320px] h-[650px] bg-black rounded-[3rem] border-[10px] border-zinc-900 shadow-2xl overflow-hidden ring-1 ring-zinc-800 flex flex-col">
          {/* Notch / Status Bar simulado */}
          <div className="absolute top-0 inset-x-0 h-6 bg-black z-50 rounded-t-[2.5rem] flex justify-center">
            <div className="w-24 h-5 bg-black rounded-b-xl"></div>
          </div>

          {/* Contenido Preview dinámico según tema */}
          <div className={`flex-1 overflow-y-auto overflow-x-hidden pt-8 pb-4 px-4 ${
            tema === 'dark' ? 'bg-zinc-950 text-zinc-100' :
            tema === 'light' ? 'bg-zinc-50 text-zinc-900' :
            'bg-[#0a0503] text-[#f4ecd8]' // elegant
          }`}>
            {/* Hero Mockup */}
            <div className="text-center mt-6 mb-8">
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="h-px w-6" style={{ backgroundColor: colorPrimario }}></div>
                <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: colorPrimario }}>Demo</span>
                <div className="h-px w-6" style={{ backgroundColor: colorPrimario }}></div>
              </div>
              <h2 className="text-3xl font-black mb-2" style={tema === 'elegant' ? { fontFamily: 'serif' } : {}}>{barberia.nombre}</h2>
              <p className="text-xs opacity-60 mb-6">{barberia.direccion}</p>
              
              <button 
                className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider"
                style={{ backgroundColor: colorPrimario, color: primaryText }}
              >
                Reservar tu cita
              </button>
            </div>

            {/* Services Mockup */}
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4" style={{ borderColor: colorSecundario, borderBottomWidth: 2, display: 'inline-block' }}>Servicios</h3>
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className={`p-4 rounded-2xl border ${
                    tema === 'dark' ? 'bg-zinc-900/50 border-zinc-800' :
                    tema === 'light' ? 'bg-white border-zinc-200 shadow-sm' :
                    'bg-[#120a05] border-[#2a1a10]'
                  }`}>
                    <h4 className="font-bold text-sm" style={{ color: colorPrimario }}>Servicio Demo {i}</h4>
                    <p className="text-[10px] opacity-60 mt-1 mb-3">Breve descripción del servicio para mostrar diseño.</p>
                    <div className="flex justify-between items-end border-t border-current pt-2 opacity-80">
                      <span className="text-sm font-black">$200</span>
                      <span className="text-[10px]">30 min</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
