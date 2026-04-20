import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Printer, CheckCircle2, Trash2, LogOut, Loader2,
  Clock, ArrowLeft, Inbox, ChevronDown, ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { logout } from '../services/authService';
import type { User } from '../services/authService';
import type { PrintOrder, PhotoData, EventData } from '../types';
import { usePrintQueue } from '../features/operator/hooks/usePrintQueue';
import { subscribeToEvent } from '../services/eventService';

const OPTION_LABELS: Record<string, { label: string; icon: string }> = {
  photos_only:          { label: '10 Adesivos de foto',        icon: '📸' },
  photos_album:         { label: 'Fotos + Álbum Físico',       icon: '📖' },
  photos_album_stickers:{ label: 'Fotos + Álbum + Stickers',   icon: '✨' },
};

function StatusBadge({ status }: { status?: string }) {
  const isCompleted = status === 'completed';
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest',
      isCompleted ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700 animate-pulse',
    )}>
      {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
      {isCompleted ? 'Concluído' : 'Aguardando'}
    </span>
  );
}

function PhotoStrip({ photoIds, photosMap }: { photoIds: string[]; photosMap: Record<string, PhotoData> }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {photoIds.map((id, i) => {
        const photo = photosMap[id];
        return (
          <div
            key={id}
            className="w-12 h-12 rounded-xl overflow-hidden border-2 border-neutral-100 bg-neutral-100 shrink-0 relative"
          >
            {photo?.url ? (
              <img src={photo.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-neutral-400">{i + 1}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({
  order,
  photosMap,
  processingId,
  onComplete,
  onDelete,
}: {
  order: PrintOrder;
  photosMap: Record<string, PhotoData>;
  processingId: string | null;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isProcessing = processingId === order.id;
  const isCompleted = order.status === 'completed';
  const optionInfo = OPTION_LABELS[order.option] ?? { label: order.option, icon: '🖨️' };

  const formattedTime = order.createdAt
    ? format(new Date(order.createdAt), "HH:mm 'de' dd/MM", { locale: ptBR })
    : '—';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        'rounded-2xl border transition-all duration-300',
        isCompleted
          ? 'bg-neutral-50 border-neutral-100 opacity-60'
          : 'bg-white border-neutral-200 shadow-sm',
      )}
    >
      {/* Header */}
      <div className="p-5 flex items-center gap-4">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-black text-sm shrink-0">
          {order.userName?.charAt(0).toUpperCase() ?? '?'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-black text-sm truncate">{order.userName}</p>
            <StatusBadge status={order.status} />
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
            <span>{optionInfo.icon} {optionInfo.label}</span>
            <span>·</span>
            <span><Clock className="w-3 h-3 inline mr-0.5" />{formattedTime}</span>
            <span>·</span>
            <span>{order.photoIds?.length ?? 0} fotos</span>
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="p-2 hover:bg-neutral-50 rounded-xl transition-colors text-neutral-400"
        >
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Photo strip (expandable) */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-3">Fotos Selecionadas</p>
              <PhotoStrip photoIds={order.photoIds ?? []} photosMap={photosMap} />
              {order.userEmail && (
                <p className="mt-3 text-[10px] text-neutral-400 font-medium">Email: {order.userEmail}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      {!isCompleted && (
        <div className="px-5 pb-5 flex gap-2">
          <button
            onClick={() => onComplete(order.id)}
            disabled={isProcessing}
            className="flex-1 py-3 bg-neutral-900 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            {isProcessing
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Printer className="w-4 h-4" />}
            Marcar como Impresso
          </button>
          <button
            onClick={() => onDelete(order.id)}
            className="p-3 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default function OperatorPanel({ user }: { user: User | null }) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventData | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  // Subscribe to event info
  useEffect(() => {
    if (!slug) return;
    return subscribeToEvent(slug, (ev) => { if (ev) setEvent(ev); });
  }, [slug]);

  const {
    orders, photosMap, loading,
    processingId, pendingCount, completedCount,
    handleComplete, handleDelete,
  } = usePrintQueue(event?.id);

  const pendingOrders = orders.filter(o => o.status !== 'completed');
  const completedOrders = orders.filter(o => o.status === 'completed');

  const handleLogout = async () => {
    try { await logout(); navigate('/'); } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2.5 bg-neutral-50 hover:bg-neutral-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
              <Printer className="w-5 h-5" /> Fila de Impressão
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mt-0.5">
              {event?.name ?? slug} · Operador
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Stats chips */}
          <div className="hidden sm:flex items-center gap-2">
            <span className={cn(
              'px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider',
              pendingCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-neutral-100 text-neutral-400',
            )}>
              <Clock className="w-3 h-3 inline mr-1" />{pendingCount} Pendentes
            </span>
            <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-100 text-green-700">
              <CheckCircle2 className="w-3 h-3 inline mr-1" />{completedCount} Prontos
            </span>
          </div>

          {user && (
            <button onClick={handleLogout} className="p-2.5 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="Sair">
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-neutral-300">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p className="text-[10px] font-black uppercase tracking-widest">Carregando fila...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-neutral-300">
            <Inbox className="w-16 h-16 mb-4 opacity-50" />
            <p className="font-black text-lg text-neutral-400">Nenhum pedido ainda</p>
            <p className="text-sm text-neutral-300 mt-1">Os pedidos aparecerão aqui em tempo real</p>
          </div>
        )}

        {/* Pending orders */}
        {!loading && pendingOrders.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <h2 className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                Aguardando Impressão ({pendingCount})
              </h2>
            </div>
            <div className="space-y-3">
              <AnimatePresence>
                {pendingOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    photosMap={photosMap}
                    processingId={processingId}
                    onComplete={handleComplete}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </div>
          </section>
        )}

        {/* Completed orders (collapsible) */}
        {!loading && completedOrders.length > 0 && (
          <section>
            <button
              onClick={() => setShowCompleted(v => !v)}
              className="flex items-center gap-2 mb-4 w-full text-left group"
            >
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <h2 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex-1">
                Concluídos ({completedCount})
              </h2>
              {showCompleted ? <ChevronUp className="w-4 h-4 text-neutral-300" /> : <ChevronDown className="w-4 h-4 text-neutral-300" />}
            </button>
            <AnimatePresence>
              {showCompleted && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 overflow-hidden"
                >
                  {completedOrders.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      photosMap={photosMap}
                      processingId={processingId}
                      onComplete={handleComplete}
                      onDelete={handleDelete}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )}
      </main>
    </div>
  );
}
