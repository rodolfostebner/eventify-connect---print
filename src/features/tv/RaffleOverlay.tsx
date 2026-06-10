import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'motion/react';
import { Gift } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { EventData, RafflePrize, RaffleTicket } from '../../types';
import { getPrize, getEventTickets } from '../../services/raffleService';

// ─── Tambor Giratório de Sorteio ────────────────────────────────────────────

const ITEM_H = 88; // altura px de cada item na lista
const SPIN_PASSES = 4; // quantas passagens completas antes de parar

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function RaffleSpinner({
  tickets,
  winner,
  primaryColor,
}: {
  tickets: RaffleTicket[];
  winner: RaffleTicket;
  primaryColor?: string;
}) {
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);

  // Constrói o deck: SPIN_PASSES passagens aleatórias + ganhador no final
  const deck = [
    ...Array.from({ length: SPIN_PASSES }, () => shuffleArray(tickets)).flat(),
    winner,
  ];

  const winnerIndex = deck.length - 1;
  // Centraliza o ganhador na janela (mostra 7 itens → centro = index 3)
  const centerOffset = 3;
  const finalY = -((winnerIndex - centerOffset) * ITEM_H);

  useEffect(() => {
    // Começa no topo, anima até o ganhador com ease-out exagerado
    controls.start({
      y: finalY,
      transition: {
        duration: 8,
        ease: [0.12, 0.01, 0.2, 1], // curva que acelera rápido e desacelera muito no final
      },
    });
  }, [controls, finalY]);

  const displayName = (t: RaffleTicket) =>
    t.user?.display_name || t.user?.email || 'Participante';

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto overflow-hidden" style={{ height: ITEM_H * 7 }}>
      {/* Gradiente topo/baixo para efeito de profundidade */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none" />

      {/* Destaque central */}
      <div
        className="absolute inset-x-0 z-20 pointer-events-none"
        style={{
          top: centerOffset * ITEM_H,
          height: ITEM_H,
          border: `2px solid ${primaryColor || '#EAB308'}`,
          boxShadow: `0 0 30px ${primaryColor || '#EAB308'}66`,
          borderRadius: 16,
        }}
      />

      {/* Lista animada */}
      <motion.div animate={controls} initial={{ y: 0 }} className="absolute inset-x-0 top-0">
        {deck.map((ticket, idx) => {
          const isWinner = idx === winnerIndex;
          return (
            <div
              key={`${ticket.id}-${idx}`}
              className={cn(
                'flex items-center justify-center px-6 font-black text-2xl tracking-tight transition-colors',
                isWinner ? 'text-white' : 'text-white/50',
              )}
              style={{ height: ITEM_H }}
            >
              {displayName(ticket)}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

/**
 * Overlay de sorteio do telão — compartilhado entre o TVView legado e o
 * TVDisplay modular (temas novos). Lê `event.tv_raffle_state` e
 * `event.tv_raffle_prize_id` (controlados pelo painel) e exibe o prêmio /
 * tambor giratório / ganhador em tela cheia.
 *
 * `getBackgroundStyle` é opcional: o legado passa o fundo do evento; os
 * temas novos usam um fallback escuro (a vinheta preta cobre o fundo).
 */
export default function RaffleOverlay({
  event,
  getBackgroundStyle,
}: {
  event: EventData;
  getBackgroundStyle?: () => React.CSSProperties;
}) {
  const [prize, setPrize] = useState<RafflePrize | null>(null);
  const [tickets, setTickets] = useState<RaffleTicket[]>([]);
  const [winnerTicket, setWinnerTicket] = useState<RaffleTicket | null>(null);
  const [spinReady, setSpinReady] = useState(false);

  const tvState = event.tv_raffle_state;
  const prizeId = event.tv_raffle_prize_id;

  useEffect(() => {
    if (!prizeId) { setPrize(null); setTickets([]); setWinnerTicket(null); setSpinReady(false); return; }

    getPrize(prizeId).then(setPrize);

    if (tvState === 'showing_winner') {
      // Carrega lista de participantes + identifica ganhador
      getEventTickets(event.id).then((all) => {
        setTickets(all);
        getPrize(prizeId).then((p) => {
          if (!p) return;
          const wt = all.find((t) => t.id === p.winner_ticket_id) ?? null;
          setWinnerTicket(wt);
          // Pequeno delay para o overlay aparecer antes de iniciar o spin
          setTimeout(() => setSpinReady(true), 600);
        });
      });
    } else {
      setTickets([]);
      setWinnerTicket(null);
      setSpinReady(false);
    }
  }, [prizeId, tvState, event.id]);

  if (tvState === 'idle' || !prizeId) return null;

  const displayName = (t: RaffleTicket) =>
    t.user?.display_name || t.user?.email || 'Ganhador(a)';

  const bgStyle = getBackgroundStyle ? getBackgroundStyle() : { backgroundColor: '#0a0a0a' };

  return (
    <AnimatePresence>
      <motion.div
        key={`raffle-${tvState}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-12 overflow-hidden"
        style={bgStyle}
      >
        {/* Vinheta escurecida sobre o bg do evento */}
        <div className="absolute inset-0 bg-black/60 pointer-events-none" />

        <div className="relative z-10 w-full flex flex-col items-center gap-8 text-white text-center">
          {/* Cabeçalho */}
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-3"
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center border-4 border-white/20"
              style={{ backgroundColor: `${event.tv_primary_color || '#EAB308'}33` }}
            >
              <Gift className="w-10 h-10" style={{ color: event.tv_primary_color || '#EAB308' }} />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/50">
              {tvState === 'showing_prize' ? 'Próximo Sorteio' : 'Sorteando...'}
            </p>
            <h2 className="text-5xl font-black tracking-tight leading-tight">
              {prize?.name ?? '—'}
            </h2>
            {prize?.description && (
              <p className="text-lg text-white/70 max-w-xl">{prize.description}</p>
            )}
          </motion.div>

          {/* Estado: mostrando prêmio */}
          {tvState === 'showing_prize' && prize?.image_url && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: 'spring', damping: 20 }}
              className="w-64 h-64 rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl"
            >
              <img src={prize.image_url} alt={prize.name} className="w-full h-full object-cover" />
            </motion.div>
          )}

          {tvState === 'showing_prize' && !prize?.image_url && (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-[120px] leading-none"
            >
              🎁
            </motion.div>
          )}

          {/* Estado: sorteio em andamento / ganhador */}
          {tvState === 'showing_winner' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="w-full max-w-2xl"
            >
              {spinReady && tickets.length > 0 && winnerTicket ? (
                <RaffleSpinner
                  tickets={tickets}
                  winner={winnerTicket}
                  primaryColor={event.tv_primary_color}
                />
              ) : (
                <div className="flex items-center justify-center h-40">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white"
                  />
                </div>
              )}

              {/* Revela o ganhador após a animação (8s + 0.6s delay = ~9s) */}
              {spinReady && winnerTicket && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 9, duration: 0.8 }}
                  className="mt-8 flex flex-col items-center gap-2"
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/50">
                    Parabéns!
                  </p>
                  <p className="text-6xl font-black tracking-tight" style={{ color: event.tv_primary_color || '#EAB308' }}>
                    {displayName(winnerTicket)}
                  </p>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: 9 }}
                    className="text-6xl mt-4"
                  >
                    🏆
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
