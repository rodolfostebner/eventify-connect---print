import React from 'react';
import { X, Check } from 'lucide-react';
import type { PrintOrder, PhotoData } from '../../../types';

interface PrintOrderModalProps {
  order: PrintOrder | null;
  photos: PhotoData[];
  onClose: () => void;
  onComplete: (id: string) => void;
}

export const PrintOrderModal = ({ 
  order, 
  photos, 
  onClose, 
  onComplete 
}: PrintOrderModalProps) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[48px] overflow-hidden flex flex-col shadow-2xl relative">
        <div className="p-10 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tighter">Fotos do Pedido</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm font-black text-neutral-900">{order.userName}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-200" />
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{order.option.replace(/_/g, ' ')}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-neutral-50 rounded-full transition-colors">
            <X className="w-8 h-8" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 bg-neutral-50/30">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {order.photoIds.map((photoId) => {
              const photo = photos.find((p) => p.id === photoId);
              return (
                <div key={photoId} className="group aspect-square rounded-3xl overflow-hidden bg-white border-4 border-white shadow-lg transition-transform hover:scale-105">
                  {photo ? (
                    <img src={photo.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-300 p-4 text-center font-bold uppercase">
                      Foto removida
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-10 border-t border-neutral-100 bg-white flex justify-end gap-4">
          <button 
            onClick={onClose} 
            className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-neutral-500 hover:bg-neutral-50 transition-colors"
          >
            Fechar
          </button>
          <button
            onClick={() => { onComplete(order.id); onClose(); }}
            className="px-10 py-4 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 shadow-xl shadow-green-100 transition-all active:scale-95 flex items-center gap-2"
          >
            <Check className="w-5 h-5" /> Concluir Pedido
          </button>
        </div>
      </div>
    </div>
  );
};
