import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, DollarSign, List, LogOut, Plus } from 'lucide-react';
import { type Cita, type Servicio } from '../../types';
import { useAuth } from '../../context/AuthContext';

import { AddAppointmentModal } from '../../components/dashboard/AddAppointmentModal';
import { DigitalReceiptModal } from '../../components/dashboard/DigitalReceiptModal';

// Components
import { CarWashAgendaTab } from './CarWashAgendaTab';
import { CarWashFinanzasTab } from './CarWashFinanzasTab';
import { ServicesManager } from '../../components/admin/ServicesManager';

interface QuickTransaction {
  id: string;
  fecha: string;
  cliente: string;
  servicio: string;
  monto: number;
  propina: number;
  total: number;
}

interface CarWashDashboardProps {
  citas: Cita[];
  servicios: Servicio[];
  onUpdateStatus: (id: string, estado: Cita['estado']) => void;
  negocioId?: string;
  negocioName?: string;
  onAddSuccess?: () => void;
  onDeleteService: (id: string) => Promise<void>;
  onDeleteCita: (id: string) => Promise<void>;
  onAddService: (servicio: Omit<Servicio, 'id' | 'negocioId'>) => Promise<Servicio>;
}

export const CarWashDashboard: React.FC<CarWashDashboardProps> = ({
  citas,
  servicios,
  onUpdateStatus,
  negocioId,
  negocioName,
  onAddSuccess,
  onDeleteService,
  onDeleteCita,
  onAddService,
}) => {
  const [activeTab, setActiveTab] = useState<'agenda' | 'finanzas' | 'servicios'>('agenda');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [justCreatedTx, setJustCreatedTx] = useState<QuickTransaction | null>(null);
  const { signOut } = useAuth();


  const handleSignOut = async () => {
    if (window.confirm('¿Cerrar sesión de DualFX Admin?')) {
      await signOut();
    }
  };

  const handleAddSuccess = (newCita?: { id: string; servicio_id: string; propina?: number; fecha: string; cliente_nombre?: string }) => {
    if (onAddSuccess) onAddSuccess();

    if (newCita) {
      const servicio = servicios.find(s => s.id === newCita.servicio_id);
      const precioServicio = servicio?.precio || 0;
      const propinaMonto = newCita.propina || 0;
      const tx: QuickTransaction = {
        id: newCita.id,
        fecha: newCita.fecha,
        cliente: newCita.cliente_nombre || 'Walk-in',
        servicio: servicio?.nombre || 'Servicio',
        monto: precioServicio,
        propina: propinaMonto,
        total: precioServicio + propinaMonto
      };
      setJustCreatedTx(tx);
    }
  };

  const navItems = [
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'finanzas', label: 'Ingresos', icon: DollarSign },
    { id: 'servicios', label: 'Servicios', icon: List },
  ] as const;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans selection:bg-[#6E3BFF]/30 pb-24 md:pb-8">
      {/* Background Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#6E3BFF]/10 blur-[120px] pointer-events-none rounded-full" />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 relative z-10">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-4xl font-display font-bold tracking-tight"
            >
              Dual<span className="text-[#6E3BFF] drop-shadow-[0_0_10px_rgba(110,59,255,0.5)]">FX</span> Command
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-white/40 text-sm mt-1"
            >
              Panel de Administración y Agenda
            </motion.p>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#6E3BFF] to-[#9B6DFF] text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(110,59,255,0.3)] hover:shadow-[0_4px_30px_rgba(110,59,255,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4" /> Nueva Cita
            </button>
            <button
              onClick={handleSignOut}
              className="p-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-2 p-1.5 bg-white/[0.03] border border-white/[0.05] rounded-2xl w-fit mb-8 backdrop-blur-xl relative z-10">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive ? 'text-white' : 'text-white/40 hover:text-white/80'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="desktop-nav"
                    className="absolute inset-0 bg-white/10 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <main className="relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="min-h-[500px]"
            >
              {activeTab === 'agenda' && (
                <CarWashAgendaTab citas={citas} servicios={servicios} onUpdateStatus={onUpdateStatus} onDeleteCita={onDeleteCita} businessName={negocioName} />
              )}
              {activeTab === 'finanzas' && (
                <CarWashFinanzasTab citas={citas} servicios={servicios} businessName={negocioName} onDeleteCita={onDeleteCita} />
              )}
              {activeTab === 'servicios' && (
                <ServicesManager servicios={servicios} onDeleteService={onDeleteService} onAddService={onAddService} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation & FAB */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        {/* Floating Action Button */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-[#6E3BFF] to-[#9B6DFF] text-white rounded-full shadow-[0_0_20px_rgba(110,59,255,0.4)] active:scale-95 transition-transform"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/[0.05] pb-safe">
          <div className="flex justify-around items-center px-4 h-20">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center justify-center gap-1 w-16 py-1 rounded-xl transition-all active:scale-90 ${
                    isActive ? 'text-[#6E3BFF]' : 'text-white/40'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {isModalOpen && negocioId && (
        <AddAppointmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          negocioId={negocioId}
          services={servicios}
          onSuccess={handleAddSuccess}
        />
      )}

      <DigitalReceiptModal
        isOpen={!!justCreatedTx}
        onClose={() => setJustCreatedTx(null)}
        transaction={justCreatedTx}
        businessName={negocioName}
      />
    </div>
  );
};
