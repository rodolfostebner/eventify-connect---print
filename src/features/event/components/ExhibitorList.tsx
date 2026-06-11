import { useState, useMemo } from 'react';
import type { Exhibitor, ExhibitorCategory, AppUser } from '../../../types';
import { rotateByTime } from '../../../lib/utils';
import { ExhibitorCard, type CardSize } from './ExhibitorCard';

interface Props {
  exhibitors: Exhibitor[];
  categories: ExhibitorCategory[];
  onSelect: (ex: Exhibitor) => void;
  event?: { id: string; status: 'pre' | 'live' | 'post' };
  user?: AppUser | null;
}

export function ExhibitorList({ exhibitors, categories, onSelect, event, user }: Props) {
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [cardSize, setCardSize] = useState<CardSize>('small');

  // Se não há categorias cadastradas no DB, deriva do campo texto dos expositores
  const effectiveCategories = useMemo<ExhibitorCategory[]>(() => {
    if (categories.length > 0) return categories;
    const seen = new Set<string>();
    return exhibitors.reduce<ExhibitorCategory[]>((acc, ex) => {
      if (ex.category && !seen.has(ex.category)) {
        seen.add(ex.category);
        acc.push({ id: ex.category, event_id: '', name: ex.category, icon: '🏷️', color: '#94949E', order_index: acc.length, created_at: '' });
      }
      return acc;
    }, []);
  }, [categories, exhibitors]);

  const getCat = (ex: Exhibitor): ExhibitorCategory | undefined =>
    effectiveCategories.find(c => c.id === ex.category_id) ??
    effectiveCategories.find(c => c.name.toLowerCase() === ex.category?.toLowerCase());

  // Rodízio justo: gira 1 posição por minuto para dar a todos a chance de
  // aparecer no topo. Funciona para qualquer quantidade (30, 40...) — ver
  // rotateByTime. Afeta apenas o feed do app (o telão tem lógica própria).
  const rotatedExhibitors = useMemo(() => rotateByTime(exhibitors), [exhibitors]);

  const filtered = selectedCat === 'all'
    ? rotatedExhibitors
    : rotatedExhibitors.filter(ex => {
        const cat = getCat(ex);
        return cat?.id === selectedCat;
      });

  const toggleCat = (id: string) => setSelectedCat(prev => prev === id ? 'all' : id);

  return (
    <div className="space-y-4">
      {/* Filtro de categorias */}
      {effectiveCategories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setSelectedCat('all')}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
              selectedCat === 'all'
                ? 'bg-[#2D2D3F] text-white shadow-md'
                : 'bg-white border border-[#ECECF1] text-[#5A5A6E] hover:border-neutral-300'
            }`}
          >
            ✦ Todos
          </button>
          {effectiveCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => toggleCat(cat.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                selectedCat === cat.id
                  ? 'text-white shadow-md'
                  : 'bg-white border border-[#ECECF1] text-[#5A5A6E] hover:border-neutral-300'
              }`}
              style={selectedCat === cat.id ? { backgroundColor: cat.color, boxShadow: `0 6px 16px ${cat.color}55` } : undefined}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Contagem + seletor de tamanho */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-[#94949E] font-medium">
          {filtered.length} expositor{filtered.length !== 1 ? 'es' : ''}
          {selectedCat !== 'all' && ' nesta categoria'}
        </p>
        <div className="flex items-center gap-0.5 bg-[#F0F0F4] rounded-lg p-0.5">
          {([['small', '⊞', 'Grade'], ['medium', '☰', 'Lista'], ['large', '▭', 'Expandido']] as [CardSize, string, string][]).map(([s, icon, label]) => (
            <button
              key={s}
              onClick={() => setCardSize(s)}
              title={label}
              className={`px-2.5 py-1 rounded-md text-[12px] transition-all ${
                cardSize === s ? 'bg-white text-[#2D2D3F] shadow-sm font-bold' : 'text-[#94949E] hover:text-[#5A5A6E]'
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-[#94949E]">
          <p className="text-sm font-medium">Nenhum expositor nesta categoria.</p>
        </div>
      ) : cardSize === 'small' ? (
        <div className="grid grid-cols-3 gap-2.5">
          {filtered.map(ex => (
            <ExhibitorCard key={ex.id} exhibitor={ex} category={getCat(ex)} size="small" onSelect={onSelect} event={event} user={user} />
          ))}
        </div>
      ) : cardSize === 'large' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(ex => (
            <ExhibitorCard key={ex.id} exhibitor={ex} category={getCat(ex)} size="large" onSelect={onSelect} event={event} user={user} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(ex => (
            <ExhibitorCard key={ex.id} exhibitor={ex} category={getCat(ex)} size="medium" onSelect={onSelect} event={event} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}
