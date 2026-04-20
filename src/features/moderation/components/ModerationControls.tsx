import React from 'react';
import { ShieldCheck, Upload, Loader2, Pause, Play, Trophy } from 'lucide-react';
import type { EventData, PhotoData } from '../../../types';
import { cn } from '../../../lib/utils';

interface ModerationControlsProps {
  event: EventData | null;
  uploading: boolean;
  onUploadClick: () => void;
  onToggleInteractions: () => void;
  onToggleTVRanking: () => void;
  rankingData: { title: string; emoji: string; photo: PhotoData; score: number }[];
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ModerationControls = ({
  event,
  uploading,
  onUploadClick,
  onToggleInteractions,
  onToggleTVRanking,
  rankingData,
  fileInputRef,
  onFileSelect
}: ModerationControlsProps) => {
  return (
    <div className="space-y-8">
      <section className="bg-white p-8 rounded-[40px] border border-neutral-100 shadow-sm">
        <h2 className="text-xl font-black mb-8 flex items-center gap-3">
          <ShieldCheck className="text-neutral-900" /> Controles do Evento
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Upload Oficial */}
          <div className="p-6 bg-neutral-50 rounded-3xl border border-neutral-100 flex flex-col gap-4">
            <div>
              <h3 className="font-black text-sm uppercase tracking-tight">Upload Oficial</h3>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Equipe de fotografia</p>
            </div>
            <input type="file" accept="image/*" multiple className="hidden" ref={fileInputRef} onChange={onFileSelect} />
            <button
              onClick={onUploadClick}
              disabled={uploading}
              className="w-full py-4 bg-neutral-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all disabled:opacity-50 shadow-lg shadow-neutral-200"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? 'Enviando...' : 'Selecionar Fotos'}
            </button>
          </div>

          {/* Interações */}
          <div className="p-6 bg-neutral-50 rounded-3xl border border-neutral-100 flex flex-col gap-4">
            <div>
              <h3 className="font-black text-sm uppercase tracking-tight">Interações</h3>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Curtidas e Comentários</p>
            </div>
            <button
              onClick={onToggleInteractions}
              className={cn(
                'w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg',
                event?.interactions_paused
                  ? 'bg-red-500 text-white shadow-red-100'
                  : 'bg-white border-2 border-neutral-100 text-neutral-600 hover:bg-neutral-100 shadow-neutral-100',
              )}
            >
              {event?.interactions_paused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
              {event?.interactions_paused ? 'Retomar Tudo' : 'Pausar Tudo'}
            </button>
          </div>

          {/* TV Ranking */}
          <div className="p-6 bg-neutral-50 rounded-3xl border border-neutral-100 flex flex-col gap-4">
            <div>
              <h3 className="font-black text-sm uppercase tracking-tight">Ranking na TV</h3>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Exibição no telão</p>
            </div>
            <button
              onClick={onToggleTVRanking}
              className={cn(
                'w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg',
                event?.tv_show_ranking
                  ? 'bg-blue-600 text-white shadow-blue-100'
                  : 'bg-white border-2 border-neutral-100 text-neutral-600 hover:bg-neutral-100 shadow-neutral-100',
              )}
            >
              <Trophy className="w-4 h-4" />
              {event?.tv_show_ranking ? 'Ocultar na TV' : 'Mostrar na TV'}
            </button>
          </div>
        </div>
      </section>

      {/* Ranking Preview */}
      <section className="bg-white p-8 rounded-[40px] border border-neutral-100 shadow-sm">
        <h2 className="text-xl font-black mb-8 flex items-center gap-3">
          <Trophy className="text-yellow-500" /> Preview do Ranking
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {rankingData.map((item, idx) => (
            <div key={idx} className="bg-neutral-50/50 rounded-3xl p-5 border border-neutral-100 flex flex-col items-center text-center gap-4 group">
              <span className="text-4xl filter drop-shadow-sm group-hover:scale-110 transition-transform">{item.emoji}</span>
              <div>
                <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-neutral-400">{item.title}</h3>
                <p className="text-lg font-black text-neutral-900 mt-1">{item.score}</p>
              </div>
              <div className="w-full aspect-square rounded-2xl overflow-hidden relative shadow-lg">
                <img src={item.photo.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <p className="text-white font-black text-[8px] uppercase tracking-widest truncate">{item.photo.user_name}</p>
                </div>
              </div>
            </div>
          ))}
          {rankingData.length === 0 && (
            <div className="col-span-full py-16 text-center text-neutral-300 font-bold uppercase tracking-widest text-[10px]">
              Nenhuma interação registrada ainda.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
