import React from 'react';

interface TransactionData {
  id: string;
  fecha: string;
  cliente: string;
  servicio: string;
  monto: number;
  propina: number;
  total: number;
  estado?: string;
}

interface DigitalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionData | null;
  businessName?: string;
}

export const DigitalReceiptModal: React.FC<DigitalReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
  businessName = 'BARBERÍA KRONOBOOK'
}) => {
  if (!isOpen || !transaction) return null;

  // Formatear mensaje para compartir por WhatsApp
  const handleWhatsAppShare = () => {
    const formattedId = transaction.id.substring(0, 8).toUpperCase();
    const text = `💈 *${businessName.toUpperCase()}* 💈
----------------------------------
*TICKET DE VENTA*
Recibo: #${formattedId}
Fecha: ${transaction.fecha}
Cliente: ${transaction.cliente}
----------------------------------
*DETALLE*
1x ${transaction.servicio}: $${transaction.monto}
Propina: $${transaction.propina}
----------------------------------
*TOTAL COBRADO: $${transaction.total}*
----------------------------------
¡Gracias por tu preferencia!
_KronoBook POS_`;

    const encodedText = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const ticketId = transaction.id.substring(0, 8).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn no-print">
      {/* Estilos dedicados para la impresión del ticket */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Ocultar absolutamente todo en la página */
          body * {
            visibility: hidden !important;
          }
          /* Mostrar solo el ticket y sus hijos */
          #digital-receipt-print-area,
          #digital-receipt-print-area * {
            visibility: visible !important;
          }
          /* Posicionamiento del ticket para impresión física */
          #digital-receipt-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 80mm !important; /* Estándar papel térmico */
            margin: 0 !important;
            padding: 10px !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            font-family: monospace !important;
          }
          /* Quitar márgenes de página del navegador */
          @page {
            margin: 0;
            size: auto;
          }
        }
      `}} />

      <div className="relative w-full max-w-md bg-zinc-900/90 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl p-6 flex flex-col gap-6 animate-scaleIn">
        {/* Encabezado del Modal */}
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
          <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Ticket de Venta
          </h3>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-1.5 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Zona del Ticket Físico */}
        <div className="flex justify-center py-2">
          <div 
            id="digital-receipt-print-area"
            className="w-[290px] bg-[#f7f4eb] text-[#1e2021] font-mono text-xs shadow-xl flex flex-col items-stretch relative"
          >
            {/* Dientes de sierra superiores */}
            <div className="w-full h-2.5 text-[#f7f4eb] fill-current select-none">
              <svg className="w-full h-full" viewBox="0 0 100 10" preserveAspectRatio="none">
                <polygon points="0,10 2.5,0 5,10 7.5,0 10,10 12.5,0 15,10 17.5,0 20,10 22.5,0 25,10 27.5,0 30,10 32.5,0 35,10 37.5,0 40,10 42.5,0 45,10 47.5,0 50,10 52.5,0 55,10 57.5,0 60,10 62.5,0 65,10 67.5,0 70,10 72.5,0 75,10 77.5,0 80,10 82.5,0 85,10 87.5,0 90,10 92.5,0 95,10 97.5,0 100,10" />
              </svg>
            </div>

            {/* Contenido del Ticket */}
            <div className="px-5 py-4 flex flex-col gap-3 select-text">
              {/* Encabezado del negocio */}
              <div className="text-center">
                <h4 className="font-black text-sm tracking-wider uppercase mb-0.5">{businessName}</h4>
                <p className="text-[10px] text-zinc-600">POS KRONOBOOK SYSTEM</p>
              </div>

              {/* Info del ticket */}
              <div className="text-[10px] space-y-0.5 border-t border-b border-dashed border-[#cbc7bb] py-2">
                <div className="flex justify-between">
                  <span>TICKET:</span>
                  <span className="font-bold">#{ticketId}</span>
                </div>
                <div className="flex justify-between">
                  <span>FECHA:</span>
                  <span>{transaction.fecha}</span>
                </div>
                <div className="flex justify-between">
                  <span>CLIENTE:</span>
                  <span className="font-bold uppercase">{transaction.cliente}</span>
                </div>
              </div>

              {/* Detalle de conceptos */}
              <div className="space-y-1 py-1">
                <div className="flex justify-between items-start">
                  <div className="max-w-[180px]">
                    <p className="font-bold uppercase">{transaction.servicio}</p>
                    <p className="text-[9px] text-zinc-600">Cant: 1</p>
                  </div>
                  <span className="font-bold">${transaction.monto}</span>
                </div>

                {transaction.propina > 0 && (
                  <div className="flex justify-between text-zinc-700">
                    <span>+ PROPINA ADICIONAL</span>
                    <span>${transaction.propina}</span>
                  </div>
                )}
              </div>

              {/* Totalizador */}
              <div className="border-t-2 border-double border-[#cbc7bb] pt-2 mt-1">
                <div className="flex justify-between text-sm font-black">
                  <span>TOTAL COBRADO</span>
                  <span>${transaction.total}</span>
                </div>
              </div>

              {/* Pie de ticket */}
              <div className="text-center mt-3 pt-2 border-t border-dashed border-[#cbc7bb]">
                <p className="text-[9px] font-bold tracking-widest">¡GRACIAS POR TU PREFERENCIA!</p>
                <p className="text-[8px] text-zinc-500 mt-1">SaaS de Reserva & Finanzas</p>
              </div>
            </div>

            {/* Dientes de sierra inferiores */}
            <div className="w-full h-2.5 text-[#f7f4eb] fill-current select-none mt-auto">
              <svg className="w-full h-full" viewBox="0 0 100 10" preserveAspectRatio="none">
                <polygon points="0,0 2.5,10 5,0 7.5,10 10,0 12.5,10 15,0 17.5,10 20,0 22.5,10 25,0 27.5,10 30,0 32.5,10 35,0 37.5,10 40,0 42.5,10 45,0 47.5,10 50,0 52.5,10 55,0 57.5,10 60,0 62.5,10 65,0 67.5,10 70,0 72.5,10 75,0 77.5,10 80,0 82.5,10 85,0 87.5,10 90,0 92.5,10 95,0 97.5,10 100,0" />
              </svg>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="grid grid-cols-2 gap-3 border-t border-zinc-800 pt-4 mt-2">
          <button 
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold py-2.5 px-4 rounded-xl border border-zinc-700 hover:border-zinc-500 active:scale-95 transition-all text-xs cursor-pointer"
          >
            <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir Ticket
          </button>
          <button 
            onClick={handleWhatsAppShare}
            className="flex items-center justify-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-bold py-2.5 px-4 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 active:scale-95 transition-all text-xs cursor-pointer"
          >
            {/* SVG WhatsApp icon */}
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.115-2.906-6.99C16.554 1.876 14.079 1.848 11.442 1.848c-5.437 0-9.861 4.42-9.865 9.864-.001 1.765.485 3.486 1.408 5.01L1.97 21.03l4.677-1.876zm12.39-5.49c-.29-.146-1.72-.85-1.986-.948-.267-.098-.46-.147-.654.145-.193.292-.747.948-.916 1.144-.168.196-.337.22-.627.073-.29-.146-1.228-.453-2.34-1.445-.865-.772-1.45-1.725-1.618-2.02-.168-.293-.018-.452.128-.597.133-.13.29-.34.436-.51.145-.17.194-.292.29-.487.097-.195.048-.366-.024-.512-.072-.146-.655-1.58-.897-2.162-.236-.57-.478-.49-.655-.499-.17-.008-.363-.01-.555-.01-.193 0-.507.073-.772.36-.265.288-1.013.992-1.013 2.417s1.036 2.793 1.18 2.99c.145.195 2.037 3.113 4.936 4.36.69.298 1.228.476 1.648.61.692.22 1.32.19 1.817.115.553-.083 1.72-.703 1.961-1.383.242-.68.242-1.266.17-1.383-.07-.117-.265-.19-.556-.337z"/>
            </svg>
            Enviar WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};
