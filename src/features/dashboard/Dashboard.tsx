import React, { useState } from 'react';
import { type Cita, type Servicio } from '../../types';
import { FinanzasTab } from './FinanzasTab';
import { AgendaTab } from './AgendaTab';
import { ServicesManager } from '../../components/admin/ServicesManager';
import { AddAppointmentModal } from '../../components/dashboard/AddAppointmentModal';
import { DigitalReceiptModal } from '../../components/dashboard/DigitalReceiptModal';
import { useAuth } from '../../context/AuthContext';

interface QuickTransaction {
  id: string;
  fecha: string;
  cliente: string;
  servicio: string;
  monto: number;
  propina: number;
  total: number;
}

interface DashboardProps {
  citas: Cita[];
  servicios: Servicio[];
  onUpdateStatus: (id: string, estado: Cita['estado']) => void;
  barberiaId?: string;
  barberiaName?: string;
  onAddSuccess?: () => void;
  onDeleteService: (id: string) => Promise<void>;
  onDeleteCita: (id: string) => Promise<void>;
  onAddService: (servicio: Omit<Servicio, 'id' | 'barberiaId'>) => Promise<Servicio>;
}

export const Dashboard: React.FC<DashboardProps> = ({
  citas,
  servicios,
  onUpdateStatus,
  barberiaId,
  barberiaName,
  onAddSuccess,
  onDeleteService,
  onDeleteCita,
  onAddService,
}) => {
  const [activeTab, setActiveTab] = useState<'agenda' | 'finanzas' | 'servicios'>('agenda');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [justCreatedTx, setJustCreatedTx] = useState<QuickTransaction | null>(null);
  const { signOut } = useAuth();

  const fechaActual = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const fechaFormateada = fechaActual.charAt(0).toUpperCase() + fechaActual.slice(1);

  const handleSignOut = async () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      await signOut();
    }
  };

  const handleAddSuccess = (newCita?: { id: string; servicio_id: string; propina?: number; fecha: string; cliente_nombre?: string }) => {
    if (onAddSuccess) {
      onAddSuccess();
    }

    if (newCita) {
      const servicio = servicios.find(s => s.id === newCita.servicio_id);
      const precioServicio = servicio?.precio || 0;
      const propinaMonto = newCita.propina || 0;

      const tx: QuickTransaction = {
        id: newCita.id,
        fecha: newCita.fecha,
        cliente: newCita.cliente_nombre || 'Walk-in',
        servicio: servicio?.nombre || 'Servicio Rápido',
        monto: precioServicio,
        propina: propinaMonto,
        total: precioServicio + propinaMonto
      };

      setJustCreatedTx(tx);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-zinc-100 animate-fade-in">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-6">
        <div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-sky-400 to-cyan-600 bg-clip-text text-transparent">
            Panel del Administrador
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-2">
            <p className="text-sm text-zinc-400">Gestiona tu agenda y visualiza el rendimiento.</p>
            <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900/50 border border-zinc-800 rounded-full text-[11px] font-semibold text-zinc-400 shadow-sm cursor-default w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.5)]"></span>
              {fechaFormateada}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Botón Registrar Cita */}
          {barberiaId && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex justify-center items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold rounded-xl transition-all duration-200 border border-sky-500/20 hover:border border-sky-500/30 active:scale-95 cursor-pointer text-sm"
            >
              <span>Registrar Cita</span>
            </button>
          )}

          {/* Navegación por Pestañas */}
          <div className="flex p-1.5 bg-[#16191e]/40 backdrop-blur-md border border-white/5 shadow-xl rounded-xl w-full md:w-auto overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('agenda')}
              className={`flex-1 md:flex-none flex justify-center items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 active:scale-95 whitespace-nowrap cursor-pointer ${activeTab === 'agenda'
                  ? 'bg-sky-500 text-zinc-950 border border-sky-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Agenda
            </button>
            <button
              onClick={() => setActiveTab('finanzas')}
              className={`flex-1 md:flex-none flex justify-center items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 active:scale-95 whitespace-nowrap cursor-pointer ${activeTab === 'finanzas'
                  ? 'bg-sky-500 text-zinc-950 border border-sky-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Finanzas
            </button>
            <button
              onClick={() => setActiveTab('servicios')}
              className={`flex-1 md:flex-none flex justify-center items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 active:scale-95 whitespace-nowrap cursor-pointer ${activeTab === 'servicios'
                  ? 'bg-sky-500 text-zinc-950 border border-sky-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Servicios
            </button>
          </div>

          {/* Botón Cerrar Sesión */}
          <button
            onClick={handleSignOut}
            className="flex justify-center items-center gap-2 px-4 py-2.5 bg-zinc-900/50 hover:bg-rose-950/20 border border-zinc-800 hover:border-rose-500/20 text-zinc-400 hover:text-rose-400 font-bold rounded-xl transition-all duration-200 active:scale-95 cursor-pointer text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Salir</span>
          </button>
        </div>
      </div>


      {/* Contenido de la Pestaña */}
      <div className="animate-fade-in mt-6" key={activeTab}>
        {activeTab === 'agenda' ? (
          <AgendaTab 
            citas={citas} 
            servicios={servicios} 
            onUpdateStatus={onUpdateStatus} 
            onDeleteCita={onDeleteCita}
          />
        ) : activeTab === 'finanzas' ? (
          <FinanzasTab 
            citas={citas} 
            servicios={servicios} 
            businessName={barberiaName} 
            onDeleteCita={onDeleteCita}
          />
        ) : (
          <ServicesManager 
            servicios={servicios} 
            onDeleteService={onDeleteService} 
            onAddService={onAddService}
          />
        )}
      </div>

      {/* Modal de Cita Rápida / Venta */}
      {barberiaId && (
        <AddAppointmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          barberiaId={barberiaId}
          services={servicios}
          onSuccess={handleAddSuccess}
        />
      )}

      {/* Modal de Recibo Digital para venta rápida exitosa */}
      <DigitalReceiptModal
        isOpen={!!justCreatedTx}
        onClose={() => setJustCreatedTx(null)}
        transaction={justCreatedTx}
        businessName={barberiaName}
      />
    </div>
  );
};
