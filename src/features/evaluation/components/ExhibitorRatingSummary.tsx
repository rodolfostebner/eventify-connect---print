import React from 'react';
import { Star } from 'lucide-react';
import type { Evaluation, EventData, AppUser } from '../../../types';

interface Props {
  evaluations: Evaluation[];
  event: EventData;
  user: AppUser | null;
  onOpenEvaluate: () => void;
  onOpenComments: () => void;
}

export function ExhibitorRatingSummary({
  evaluations,
  event,
  user,
  onOpenEvaluate,
  onOpenComments,
}: Props) {
  const count = evaluations.length;
  
  // Calcula média de estrelas
  const average = count > 0 
    ? evaluations.reduce((sum, e) => sum + e.stars, 0) / count 
    : 0;

  const isLive = event.status === 'live';
  // Participantes avaliam; admins também podem para fins de teste
  const canEvaluate = user && (user.role === 'participant' || user.role === 'admin' || user.role === 'event_admin');

  // Renderiza as estrelas
  const renderStars = () => {
    const starsArray = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= Math.round(average);
      starsArray.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            isFilled 
              ? 'text-amber-400 fill-amber-400' 
              : 'text-gray-300 fill-none'
          }`}
        />
      );
    }
    return starsArray;
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mt-1 mb-2 text-xs">
      {/* Estrelas */}
      <div className="flex items-center gap-0.5">
        {renderStars()}
      </div>

      {/* Média e Total */}
      <span className="font-bold text-[#2D2D3F]">
        {average > 0 ? average.toFixed(1) : 'Sem avaliações'}
      </span>
      
      {count > 0 && (
        <button
          onClick={onOpenComments}
          className="text-[#5A5A6E] hover:underline cursor-pointer font-medium"
        >
          ({count} {count === 1 ? 'avaliação' : 'avaliações'})
        </button>
      )}

      {/* Botão Avalie */}
      {isLive && canEvaluate && (
        <>
          <span className="text-gray-300">•</span>
          <button
            onClick={onOpenEvaluate}
            className="font-bold text-amber-500 hover:text-amber-600 cursor-pointer hover:underline"
          >
            Avalie
          </button>
        </>
      )}
    </div>
  );
}
