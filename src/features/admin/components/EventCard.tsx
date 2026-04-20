import { Eye, LayoutDashboard, ShieldCheck, Settings, Share2, Trash2, Play, Pause, CheckCircle2, Printer } from 'lucide-react';
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
    <div className="p-4 rounded-2xl border border-neutral-100 bg-neutral-50 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm">{event.name}</h3>
          <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-tighter">/{event.slug}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
          event.status === 'pre' ? 'bg-blue-100 text-blue-600' :
          event.status === 'live' ? 'bg-red-100 text-red-600 animate-pulse' :
          'bg-neutral-200 text-neutral-600'
        }`}>
          {event.status}
        </span>
      </div>

      {/* Status Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => onUpdateStatus(event.id, 'pre')}
          className={`flex-1 py-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors ${event.status === 'pre' ? 'bg-blue-600 text-white' : 'bg-white text-neutral-600 border border-neutral-200'}`}
        >
          <Pause className="w-3 h-3" /> PRE
        </button>
        <button
          onClick={() => onUpdateStatus(event.id, 'live')}
          className={`flex-1 py-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors ${event.status === 'live' ? 'bg-red-600 text-white' : 'bg-white text-neutral-600 border border-neutral-200'}`}
        >
          <Play className="w-3 h-3" /> LIVE
        </button>
        <button
          onClick={() => onUpdateStatus(event.id, 'post')}
          className={`flex-1 py-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors ${event.status === 'post' ? 'bg-neutral-600 text-white' : 'bg-white text-neutral-600 border border-neutral-200'}`}
        >
          <CheckCircle2 className="w-3 h-3" /> POST
        </button>
      </div>

      {/* Quick Links */}
      <div className="flex gap-2 pt-2 border-t border-neutral-200">
        <button
          onClick={() => window.open(`/event/${event.slug}`, '_blank')}
          className="flex-1 py-2 bg-white border border-neutral-200 rounded-lg text-[10px] font-bold text-neutral-600 flex items-center justify-center gap-1"
        >
          <Eye className="w-3 h-3" /> VER APP
        </button>
        <button
          onClick={() => window.open(`/tv/${event.slug}`, '_blank')}
          className="flex-1 py-2 bg-white border border-neutral-200 rounded-lg text-[10px] font-bold text-neutral-600 flex items-center justify-center gap-1"
        >
          <LayoutDashboard className="w-3 h-3" /> TV
        </button>
        <button
          onClick={() => window.open(`/moderation/${event.slug}`, '_blank')}
          className="flex-1 py-2 bg-blue-50 border border-blue-100 rounded-lg text-[10px] font-bold text-blue-600 flex items-center justify-center gap-1"
        >
          <ShieldCheck className="w-3 h-3" /> CURADORIA
        </button>
        <button
          onClick={() => window.open(`/operator/${event.slug}`, '_blank')}
          className="flex-1 py-2 bg-violet-50 border border-violet-100 rounded-lg text-[10px] font-bold text-violet-600 flex items-center justify-center gap-1"
        >
          <Printer className="w-3 h-3" /> OPERADOR
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onShare(event)}
          className="flex-1 py-2 bg-white border border-neutral-200 rounded-lg text-[10px] font-bold text-neutral-600 flex items-center justify-center gap-1 hover:bg-neutral-50"
        >
          <Share2 className="w-3 h-3" /> COMPARTILHAR
        </button>
        <button
          onClick={() => onEdit(event)}
          className="flex-1 py-2 bg-neutral-100 rounded-lg text-[10px] font-bold text-neutral-600 flex items-center justify-center gap-1 hover:bg-neutral-200"
        >
          <Settings className="w-3 h-3" /> CONFIGURAÇÕES
        </button>
        <button
          onClick={() => onDelete(event.id)}
          className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-red-100"
        >
          <Trash2 className="w-3 h-3" /> EXCLUIR
        </button>
      </div>
    </div>
  );
}
