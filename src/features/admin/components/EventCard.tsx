import { useState } from 'react';
import { Eye, LayoutDashboard, ShieldCheck, Settings, Share2, EyeOff, Play, Pause, CheckCircle2, Printer, Store, Star, AlertTriangle, X, Check } from 'lucide-react';
import type { EventData } from '../../../types';

type PendingAction =
  | { type: 'inactivate' }
  | { type: 'status'; status: 'pre' | 'live' | 'post' };

const STATUS_LABEL: Record<'pre' | 'live' | 'post', string> = {
  pre: 'Pré-evento',
  live: 'Ao vivo',
  post: 'Pós-evento',
};

const STATUS_CONFIRM_STYLE: Record<'pre' | 'live' | 'post', { wrap: string; text: string; btn: string; cancel: string }> = {
  pre:  { wrap: 'bg-blue-50 border-blue-200',    text: 'text-blue-800',   btn: 'bg-blue-500 hover:bg-blue-600',     cancel: 'hover:bg-blue-100 text-blue-600' },
  live: { wrap: 'bg-red-50 border-red-200',      text: 'text-red-800',    btn: 'bg-red-500 hover:bg-red-600',       cancel: 'hover:bg-red-100 text-red-600' },
  post: { wrap: 'bg-neutral-100 border-neutral-300', text: 'text-neutral-700', btn: 'bg-neutral-600 hover:bg-neutral-700', cancel: 'hover:bg-neutral-200 text-neutral-600' },
};

interface EventCardProps {
  event: EventData;
  onUpdateStatus: (id: string, status: 'pre' | 'live' | 'post') => void;
  onShare: (event: EventData) => void;
  onEdit: (event: EventData) => void;
  onInactivate: (id: string) => void;
}

export function EventCard({ event, onUpdateStatus, onShare, onEdit, onInactivate }: EventCardProps) {
  const [pending, setPending] = useState<PendingAction | null>(null);
  const inativo = event.active === false;

  const handleConfirm = () => {
    if (!pending) return;
    if (pending.type === 'inactivate') onInactivate(event.id);
    else onUpdateStatus(event.id, pending.status);
    setPending(null);
  };

  const requestStatus = (status: 'pre' | 'live' | 'post') => {
    if (event.status === status) return;
    setPending({ type: 'status', status });
  };

  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden flex flex-col transition-colors ${
      inativo
        ? 'bg-neutral-100 border-neutral-200'
        : 'bg-white border-neutral-100'
    }`}>
      {/* Header — nome + status + ações */}
      <div className="p-4 flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className={`font-bold text-sm truncate ${inativo ? 'text-neutral-400' : 'text-neutral-900'}`}>
              {event.name}
            </h3>
            {inativo && (
              <span className="shrink-0 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase bg-neutral-200 text-neutral-500 border border-neutral-300">
                inativo
              </span>
            )}
          </div>
          <p className={`text-[10px] font-medium mt-0.5 ${inativo ? 'text-neutral-300' : 'text-neutral-400'}`}>
            /{event.slug}
          </p>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          {!inativo && (
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase mr-1 ${
              event.status === 'pre'  ? 'bg-blue-100 text-blue-600' :
              event.status === 'live' ? 'bg-red-100 text-red-600 animate-pulse' :
                                        'bg-neutral-200 text-neutral-500'
            }`}>
              {event.status}
            </span>
          )}
          <button
            onClick={() => onShare(event)}
            title="Compartilhar"
            className={`p-1.5 rounded-lg transition-colors ${
              inativo
                ? 'text-neutral-300 cursor-not-allowed'
                : 'hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700'
            }`}
            disabled={inativo}
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(event)}
            title="Configurações"
            className={`p-1.5 rounded-lg transition-colors ${
              inativo
                ? 'text-neutral-300 cursor-not-allowed'
                : 'hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700'
            }`}
            disabled={inativo}
          >
            <Settings className="w-4 h-4" />
          </button>
          {!inativo && (
            <button
              onClick={() => setPending({ type: 'inactivate' })}
              title="Inativar evento"
              className="p-1.5 rounded-lg hover:bg-amber-50 text-neutral-400 hover:text-amber-500 transition-colors"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Faixa de confirmação — status ou inativação */}
      {pending && (() => {
        if (pending.type === 'inactivate') return (
          <div className="mx-4 mb-3 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-[11px] text-amber-800 font-medium flex-1">Inativar este evento?</p>
            <button onClick={handleConfirm} title="Confirmar" className="p-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setPending(null)} title="Cancelar" className="p-1 rounded-lg hover:bg-amber-100 text-amber-600 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
        const s = STATUS_CONFIRM_STYLE[pending.status];
        return (
          <div className={`mx-4 mb-3 p-3 rounded-xl border flex items-center gap-2 ${s.wrap}`}>
            <AlertTriangle className={`w-4 h-4 shrink-0 ${s.text}`} />
            <p className={`text-[11px] font-medium flex-1 ${s.text}`}>
              Mudar para <span className="font-black uppercase">{STATUS_LABEL[pending.status]}</span>?
            </p>
            <button onClick={handleConfirm} title="Confirmar" className={`p-1 rounded-lg text-white transition-colors ${s.btn}`}>
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setPending(null)} title="Cancelar" className={`p-1 rounded-lg transition-colors ${s.cancel}`}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })()}

      <div className={`px-4 pb-4 space-y-3 flex-1 ${inativo ? 'opacity-40 pointer-events-none select-none' : ''}`}>
        {/* Controles de status */}
        <div className="flex gap-1.5">
          <button
            onClick={() => requestStatus('pre')}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors ${
              event.status === 'pre' ? 'bg-blue-600 text-white' : 'bg-neutral-50 text-neutral-500 border border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            <Pause className="w-3 h-3" /> PRE
          </button>
          <button
            onClick={() => requestStatus('live')}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors ${
              event.status === 'live' ? 'bg-red-600 text-white' : 'bg-neutral-50 text-neutral-500 border border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            <Play className="w-3 h-3" /> LIVE
          </button>
          <button
            onClick={() => requestStatus('post')}
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
