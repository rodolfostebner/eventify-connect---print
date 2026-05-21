import { Eye, LayoutDashboard, ShieldCheck, Settings, Share2, Trash2, Play, Pause, CheckCircle2, Printer, Store, Star } from 'lucide-react';
import type { EventData } from '../../../types';

interface EventCardProps {
  event: EventData;
  onUpdateStatus: (id: string, status: 'pre' | 'live' | 'post') => void;
  onShare: (event: EventData) => void;
  onEdit: (event: EventData) => void;
  onDelete: (id: string) => void;
}

export function EventCard({ event, onUpdateStatus, onShare, onEdit, onDelete }: EventCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden flex flex-col">
      {/* Header — nome + status + ações */}
      <div className="p-4 flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-neutral-900 truncate">{event.name}</h3>
          <p className="text-[10px] text-neutral-400 font-medium mt-0.5">/{event.slug}</p>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase mr-1 ${
            event.status === 'pre'  ? 'bg-blue-100 text-blue-600' :
            event.status === 'live' ? 'bg-red-100 text-red-600 animate-pulse' :
                                      'bg-neutral-200 text-neutral-500'
          }`}>
            {event.status}
          </span>
          <button
            onClick={() => onShare(event)}
            title="Compartilhar"
            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(event)}
            title="Configurações"
            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(event.id)}
            title="Excluir"
            className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="px-4 pb-4 space-y-3 flex-1">
        {/* Controles de status */}
        <div className="flex gap-1.5">
          <button
            onClick={() => onUpdateStatus(event.id, 'pre')}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors ${
              event.status === 'pre' ? 'bg-blue-600 text-white' : 'bg-neutral-50 text-neutral-500 border border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            <Pause className="w-3 h-3" /> PRE
          </button>
          <button
            onClick={() => onUpdateStatus(event.id, 'live')}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors ${
              event.status === 'live' ? 'bg-red-600 text-white' : 'bg-neutral-50 text-neutral-500 border border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            <Play className="w-3 h-3" /> LIVE
          </button>
          <button
            onClick={() => onUpdateStatus(event.id, 'post')}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors ${
              event.status === 'post' ? 'bg-neutral-700 text-white' : 'bg-neutral-50 text-neutral-500 border border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" /> POST
          </button>
        </div>

        {/* Acessos rápidos — grade 3 colunas com ícone + label */}
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => window.open(`/event/${event.slug}`, '_blank')}
            className="py-2.5 bg-neutral-50 border border-neutral-100 rounded-xl text-[9px] font-bold text-neutral-600 flex flex-col items-center gap-1 hover:bg-neutral-100 transition-colors"
          >
            <Eye className="w-4 h-4" /> APP
          </button>
          <button
            onClick={() => window.open(`/tv/${event.slug}`, '_blank')}
            className="py-2.5 bg-neutral-50 border border-neutral-100 rounded-xl text-[9px] font-bold text-neutral-600 flex flex-col items-center gap-1 hover:bg-neutral-100 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" /> TV
          </button>
          <button
            onClick={() => window.open(`/moderation/${event.slug}`, '_blank')}
            className="py-2.5 bg-blue-50 border border-blue-100 rounded-xl text-[9px] font-bold text-blue-600 flex flex-col items-center gap-1 hover:bg-blue-100 transition-colors"
          >
            <ShieldCheck className="w-4 h-4" /> CURADORIA
          </button>
          <button
            onClick={() => window.open(`/operator/${event.slug}`, '_blank')}
            className="py-2.5 bg-violet-50 border border-violet-100 rounded-xl text-[9px] font-bold text-violet-600 flex flex-col items-center gap-1 hover:bg-violet-100 transition-colors"
          >
            <Printer className="w-4 h-4" /> OPERADOR
          </button>
          <button
            onClick={() => window.open(`/expositores/${event.slug}`, '_blank')}
            className="py-2.5 bg-amber-50 border border-amber-100 rounded-xl text-[9px] font-bold text-amber-600 flex flex-col items-center gap-1 hover:bg-amber-100 transition-colors"
          >
            <Store className="w-4 h-4" /> EXPOSITORES
          </button>
          <button
            onClick={() => window.open(`/parceiros/${event.slug}`, '_blank')}
            className="py-2.5 bg-yellow-50 border border-yellow-100 rounded-xl text-[9px] font-bold text-yellow-600 flex flex-col items-center gap-1 hover:bg-yellow-100 transition-colors"
          >
            <Star className="w-4 h-4" /> PARCEIROS
          </button>
        </div>
      </div>
    </div>
  );
}
