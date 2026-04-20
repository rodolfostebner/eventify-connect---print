import React from 'react';
import { Check, Trash2, ShieldCheck } from 'lucide-react';
import type { PhotoData } from '../../../types';

interface PhotoModerationProps {
  photos: PhotoData[];
  onApprove: (photo: PhotoData) => void;
  onReject: (id: string) => void;
}

export const PhotoModeration = ({ photos, onApprove, onReject }: PhotoModerationProps) => {
  const pendingPhotos = photos.filter(p => p.status === 'pending');

  if (pendingPhotos.length === 0) {
    return (
      <div className="py-20 text-center bg-white rounded-[40px] border border-neutral-100 shadow-sm">
        <ShieldCheck className="w-16 h-16 mx-auto text-neutral-100 mb-4" />
        <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px]">Tudo limpo! Nenhuma foto pendente.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {pendingPhotos.map((photo) => (
        <div key={photo.id} className="bg-white rounded-[32px] overflow-hidden border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
          <div className="aspect-square relative overflow-hidden">
            <img src={photo.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
              {photo.user_name}
            </div>
          </div>
          <div className="p-4 flex gap-3 mt-auto">
            <button
              onClick={() => onReject(photo.id)}
              className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Rejeitar
            </button>
            <button
              onClick={() => onApprove(photo)}
              className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-700 shadow-lg shadow-green-200 transition-all active:scale-95"
            >
              <Check className="w-4 h-4" /> Aprovar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
