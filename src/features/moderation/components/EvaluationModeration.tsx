import React from 'react';
import { Check, Trash2, MessageSquare, Star } from 'lucide-react';
import type { Evaluation } from '../../../types';

interface EvaluationModerationProps {
  evaluations: Evaluation[];
  onModerateComment: (id: string, action: 'approved' | 'rejected') => void;
}

export const EvaluationModeration = ({ evaluations, onModerateComment }: EvaluationModerationProps) => {
  const renderStars = (starsCount: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${
          i < starsCount ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-none'
        }`}
      />
    ));
  };

  if (evaluations.length === 0) {
    return (
      <div className="py-20 text-center bg-white rounded-[40px] border border-neutral-100 shadow-sm">
        <MessageSquare className="w-16 h-16 mx-auto text-neutral-100 mb-4" />
        <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px]">Nenhuma avaliação pendente.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {evaluations.map((evalItem) => {
        const displayName = evalItem.user?.display_name || 'Participante';
        const exhibitorName = evalItem.exhibitor?.name || 'Expositor';

        return (
          <div key={evalItem.id} className="bg-white p-5 rounded-[32px] border border-neutral-100 shadow-sm flex items-center gap-6 hover:shadow-md transition-shadow">
            <div className="w-20 h-20 rounded-[24px] overflow-hidden shrink-0 border-4 border-neutral-50 shadow-inner flex items-center justify-center bg-neutral-100">
              {evalItem.exhibitor?.logo_url ? (
                <img src={evalItem.exhibitor.logo_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-2xl font-bold text-neutral-400">{exhibitorName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3FA790] bg-[#3FA790]/10 px-2 py-0.5 rounded-full">
                  {exhibitorName}
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                  por {displayName}
                </span>
              </div>
              
              <div className="flex items-center gap-1 mb-2">
                {renderStars(evalItem.stars)}
              </div>

              <p className="text-base font-medium text-neutral-900 leading-snug">{evalItem.comment}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onModerateComment(evalItem.id, 'rejected')}
                className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-colors cursor-pointer"
                title="Rejeitar"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => onModerateComment(evalItem.id, 'approved')}
                className="p-4 bg-green-600 text-white rounded-2xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95 cursor-pointer"
                title="Aprovar"
              >
                <Check className="w-5 h-5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
