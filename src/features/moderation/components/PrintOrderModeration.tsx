import React from 'react';
import { Printer, Eye, Trash2, Check } from 'lucide-react';
import type { PrintOrder } from '../../../types';

interface PrintOrderModerationProps {
  orders: PrintOrder[];
  onViewDetails: (order: PrintOrder) => void;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export const PrintOrderModeration = ({ 
  orders, 
  onViewDetails, 
  onComplete, 
  onDelete 
}: PrintOrderModerationProps) => {
  const pendingOrders = orders.filter(o => o.status !== 'completed');

  if (pendingOrders.length === 0) {
    return (
      <div className="py-20 text-center bg-white rounded-[40px] border border-neutral-100 shadow-sm">
        <Printer className="w-16 h-16 mx-auto text-neutral-100 mb-4" />
        <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px]">Fila de impressão vazia.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {pendingOrders.map((order) => (
        <div key={order.id} className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm flex items-center justify-between gap-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
              <Printer className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-black text-lg tracking-tighter text-neutral-900">{order.userName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  {order.option.replace(/_/g, ' ')}
                </span>
                <span className="text-[10px] font-bold text-neutral-400">
                  {order.photoIds.length} fotos
                </span>
              </div>
              <p className="text-[9px] text-neutral-300 font-bold uppercase tracking-tighter mt-2">
                Solicitado em: {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onViewDetails(order)}
              className="p-4 bg-neutral-50 text-neutral-600 rounded-2xl hover:bg-neutral-100 transition-colors shadow-sm"
              title="Ver fotos"
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDelete(order.id)}
              className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-colors shadow-sm"
              title="Excluir pedido"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => onComplete(order.id)}
              className="p-4 bg-green-600 text-white rounded-2xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95"
              title="Concluir impressão"
            >
              <Check className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
