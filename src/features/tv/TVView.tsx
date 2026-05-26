import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence, useAnimation } from 'motion/react';
import { Trophy, Camera, Heart, Megaphone, Bell, Volume2, Gift } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { EventData, PhotoData, Announcement, RafflePrize, RaffleTicket } from '../../types';
import { subscribeToEvent } from '../../services/eventService';
import { fetchPosts, subscribeToPosts } from '../../services/posts';
import { getPrize, getEventTickets } from '../../services/raffleService';

// ─── Web Audio API Synthesis Presets ───────────────────────────────────────
function playSynthClassic() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    const frequencies = [659.25, 830.61, 987.77]; // E5, G#5, B5 chord
    
    frequencies.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.25 / frequencies.length, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 2.0);
    });
  } catch (e) {
    console.error('Failed to play synth classic:', e);
  }
}

function playSynthScifi() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.35);
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.8);
    
    setTimeout(() => {
      try {
        const osc2 = ctx.createOscillator();
        const gainNode2 = ctx.createGain();
        const now2 = ctx.currentTime;
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(450, now2);
        osc2.frequency.exponentialRampToValueAtTime(1500, now2 + 0.3);
        gainNode2.gain.setValueAtTime(0, now2);
        gainNode2.gain.linearRampToValueAtTime(0.12, now2 + 0.05);
        gainNode2.gain.exponentialRampToValueAtTime(0.001, now2 + 0.5);
        osc2.connect(gainNode2);
        gainNode2.connect(ctx.destination);
        osc2.start(now2);
        osc2.stop(now2 + 0.6);
      } catch {}
    }, 150);
  } catch (e) {
    console.error('Failed to play synth scifi:', e);
  }
}

function playSynthTriumph() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, idx) => {
      const noteDelay = idx * 0.08;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + noteDelay);
      
      gainNode.gain.setValueAtTime(0, now + noteDelay);
      gainNode.gain.linearRampToValueAtTime(0.15, now + noteDelay + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + noteDelay + 0.6);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(now + noteDelay);
      osc.stop(now + noteDelay + 0.7);
    });
  } catch (e) {
    console.error('Failed to play synth triumph:', e);
  }
}

function playSynthGentle() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now); // C5
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.18, now + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 1.6);
  } catch (e) {
    console.error('Failed to play synth gentle:', e);
  }
}

function playSynthRetro() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const gainNode1 = ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(880, now); // A5
    gainNode1.gain.setValueAtTime(0, now);
    gainNode1.gain.linearRampToValueAtTime(0.04, now + 0.01);
    gainNode1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc1.connect(gainNode1);
    gainNode1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.15);
    
    setTimeout(() => {
      try {
        const osc2 = ctx.createOscillator();
        const gainNode2 = ctx.createGain();
        const now2 = ctx.currentTime;
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(1318.51, now2); // E6
        gainNode2.gain.setValueAtTime(0, now2);
        gainNode2.gain.linearRampToValueAtTime(0.04, now2 + 0.01);
        gainNode2.gain.exponentialRampToValueAtTime(0.001, now2 + 0.2);
        osc2.connect(gainNode2);
        gainNode2.connect(ctx.destination);
        osc2.start(now2);
        osc2.stop(now2 + 0.25);
      } catch {}
    }, 120);
  } catch (e) {
    console.error('Failed to play synth retro:', e);
  }
}

function playNotificationSound(audioUrl: string | null): HTMLAudioElement | null {
  try {
    if (!audioUrl || audioUrl === 'silent') return null;

    if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) {
      const audio = new Audio(audioUrl);
      audio.volume = 0.8;
      audio.play().catch(err => {
        console.error('Failed to play custom announcement audio file:', err);
      });
      return audio;
    }

    switch (audioUrl) {
      case 'synth_classic':
        playSynthClassic();
        break;
      case 'synth_scifi':
        playSynthScifi();
        break;
      case 'synth_triumph':
        playSynthTriumph();
        break;
      case 'synth_gentle':
        playSynthGentle();
        break;
      case 'synth_retro':
        playSynthRetro();
        break;
      default:
        playSynthClassic();
    }
    return null;
  } catch (err) {
    console.error('Error playing announcement sound:', err);
    return null;
  }
}

function unlockAudioContext() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);

    // Dynamic browser HTML5 Audio autoplay bypass
    const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAAA');
    silentAudio.play().catch(() => {});
  } catch (e) {
    console.error('Failed to unlock audio context:', e);
  }
}

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
    <div className="relative w-full max-w-xl mx-auto overflow-hidden" style={{ height: ITEM_H * 7 }}>
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

function RaffleOverlay({
  event,
  getBackgroundStyle,
}: {
  event: EventData;
  getBackgroundStyle: () => React.CSSProperties;
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

  return (
    <AnimatePresence>
      <motion.div
        key={`raffle-${tvState}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-12 overflow-hidden"
        style={getBackgroundStyle()}
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

// ────────────────────────────────────────────────────────────────────────────

export default function TVView() {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<EventData | null>(null);
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [categoryGroups, setCategoryGroups] = useState<{ title: string; emoji: string; photos: PhotoData[] }[]>([]);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showRanking, setShowRanking] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [activeAnnouncement, setActiveAnnouncement] = useState<Announcement | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const announcementAudioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch and handle active announcements in real-time
  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;
    let active = true;

    if (!event?.active_announcement_id) {
      setActiveAnnouncement(null);
      return;
    }

    import('../../lib/supabase/client').then(({ supabase }) => {
      if (!supabase) return;
      supabase
        .from('announcements')
        .select('*')
        .eq('id', event.active_announcement_id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching active announcement:', error);
            return;
          }
          if (active && data) {
            const ann = data as Announcement;
            if (ann.target_tv) {
              setActiveAnnouncement(ann);
              
              // Play synthesized chime
              if (soundEnabled) {
                const audio = playNotificationSound(ann.audio_url || 'synth_classic');
                if (audio) announcementAudioRef.current = audio;
              }

              // Auto-dismiss after show_duration_sec
              const duration = (ann.show_duration_sec || 15) * 1000;
              timerId = setTimeout(() => {
                import('../../services/announcementService').then(({ triggerAnnouncement }) => {
                  triggerAnnouncement(event.id, null).catch(console.error);
                });
              }, duration);
            } else {
              setActiveAnnouncement(null);
            }
          }
        });
    });

    return () => {
      active = false;
      if (timerId) clearTimeout(timerId);
      if (announcementAudioRef.current) {
        announcementAudioRef.current.pause();
        announcementAudioRef.current = null;
      }
    };
  }, [event?.active_announcement_id, event?.announcement_trigger_at, soundEnabled]);

  useEffect(() => {
    if (event?.tv_show_ranking) {
      if (!showRanking && countdown === null) {
        setCountdown(10);
      }
    } else {
      setShowRanking(false);
      setCountdown(null);
    }
  }, [event?.tv_show_ranking]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowRanking(true);
      setCountdown(null);
    }
  }, [countdown]);

  // Subscribe to event by slug with hybrid polling fallback for network resilience
  useEffect(() => {
    if (!slug) return;
    
    // 1. Realtime subscription
    const unsubscribe = subscribeToEvent(
      slug,
      (ev) => { if (ev) setEvent(ev); },
      (error) => console.error('Error fetching event in TVView:', error),
    );

    // 2. Silent Polling backup (guarantees updates even under WebSocket restrictions)
    const intervalId = setInterval(() => {
      import('../../services/eventService').then(({ getEventBySlug }) => {
        getEventBySlug(slug)
          .then((ev) => {
            if (ev) {
              setEvent(current => {
                if (
                  current?.active_announcement_id !== ev.active_announcement_id ||
                  current?.announcement_trigger_at !== ev.announcement_trigger_at ||
                  current?.tv_show_ranking !== ev.tv_show_ranking ||
                  current?.tv_raffle_state !== ev.tv_raffle_state ||
                  current?.tv_raffle_prize_id !== ev.tv_raffle_prize_id
                ) {
                  return ev;
                }
                return current;
              });
            }
          })
          .catch(console.error);
      });
    }, 5000); // Poll every 5 seconds

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, [slug]);

  // Subscribe to approved photos once event is loaded
  useEffect(() => {
    if (!event?.id) return;

    const processPhotos = (allPhotos: PhotoData[]) => {
      setPhotos(allPhotos);

      const categories = [
        { id: 'likes', title: 'Mais Curtida', emoji: '❤️' },
        { id: '😂', title: 'Mais Divertida', emoji: '😂' },
        { id: '✨', title: 'Momento Especial', emoji: '✨' },
        { id: '💬', title: 'Mais Comentada', emoji: '💬' },
        { id: '🎸', title: 'Rock Star', emoji: '🎸' },
        { id: '⭐', title: 'Queridinha', emoji: '⭐' },
      ];

      const groups = categories.map((cat) => {
        let sortedPhotos = allPhotos.filter((p) => !p.is_official);
        if (cat.id === 'likes') {
          sortedPhotos.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        } else if (cat.id === '💬') {
          sortedPhotos.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
        } else {
          sortedPhotos.sort((a, b) => (b.reaction_counts?.[cat.id] || 0) - (a.reaction_counts?.[cat.id] || 0));
        }

        const top5 = sortedPhotos
          .filter((p) => {
            if (cat.id === 'likes') return (p.likes || 0) > 0;
            if (cat.id === '💬') return (p.comments?.length || 0) > 0;
            return (p.reaction_counts?.[cat.id] || 0) > 0;
          })
          .slice(0, 5);

        return { title: cat.title, emoji: cat.emoji, photos: top5 };
      }).filter((g) => g.photos.length > 0);

      // Add official photos if enabled
      if (event.has_official_photos) {
        const officialPhotos = allPhotos
          .filter((p) => p.is_official)
          .sort((a, b) => (b.likes || 0) - (a.likes || 0))
          .slice(0, 5);
        if (officialPhotos.length > 0) {
          groups.push({ title: 'Melhor Foto Oficial', emoji: '📸', photos: officialPhotos });
        }
      }

      setCategoryGroups(groups);
    };

    // Initial Fetch
    fetchPosts(event.id).then(processPhotos).catch(console.error);

    // Subscribe
    return subscribeToPosts(event.id, (payload) => {
      // Re-fetch everything on any change to keep sorting and grouping correct
      // This is simpler for TV view which 
      fetchPosts(event.id).then(processPhotos).catch(console.error);
    });
  }, [event?.id, event?.has_official_photos]);

  useEffect(() => {
    if (categoryGroups.length === 0) return;

    if (currentGroupIndex >= categoryGroups.length) {
      setCurrentGroupIndex(0);
      setCurrentPhotoIndex(0);
      return;
    }
    const currentGroup = categoryGroups[currentGroupIndex];
    if (currentPhotoIndex >= currentGroup.photos.length) {
      setCurrentPhotoIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentPhotoIndex((prevPhoto) => {
        const group = categoryGroups[currentGroupIndex];
        if (!group || !group.photos) return 0;
        if (prevPhoto + 1 < group.photos.length) {
          return prevPhoto + 1;
        } else {
          setCurrentGroupIndex((prevGroup) => (prevGroup + 1) % categoryGroups.length);
          return 0;
        }
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [categoryGroups, currentGroupIndex, currentPhotoIndex]);

  const getBackgroundStyle = () => {
    if (!event) return {};
    const type = event.tv_bg_type || event.bg_type || 'color';
    const value = event.tv_bg_value || event.bg_value || '#0a0a0a';

    if (type === 'color') return { backgroundColor: value };
    if (type === 'gradient') {
      const from = event.tv_bg_gradient_from || event.bg_gradient_from || '#0a0a0a';
      const to = event.tv_bg_gradient_to || event.bg_gradient_to || '#1a1a1a';
      return { background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` };
    }
    if (type === 'pattern') {
      const bg = event.tv_bg_pattern_bg || event.bg_pattern_bg || '#0a0a0a';
      const fg = event.tv_bg_pattern_fg || event.bg_pattern_fg || '#1a1a1a';

      switch (value) {
        case 'dots':
          return { backgroundColor: bg, backgroundImage: `radial-gradient(${fg} 1px, transparent 1px)`, backgroundSize: '20px 20px' };
        case 'grid':
          return { backgroundColor: bg, backgroundImage: `linear-gradient(${fg} 1px, transparent 1px), linear-gradient(90deg, ${fg} 1px, transparent 1px)`, backgroundSize: '40px 40px' };
        case 'diagonal':
          return { backgroundColor: bg, backgroundImage: `linear-gradient(45deg, ${fg} 25%, transparent 25%, transparent 50%, ${fg} 50%, ${fg} 75%, transparent 75%, transparent)`, backgroundSize: '20px 20px' };
        case 'waves':
          return { backgroundColor: bg, backgroundImage: `radial-gradient(circle at 100% 50%, ${bg} 20%, ${fg} 21%, ${fg} 34%, ${bg} 35%, ${bg} 100%), radial-gradient(circle at 0% 50%, ${bg} 20%, ${fg} 21%, ${fg} 34%, ${bg} 35%, ${bg} 100%)`, backgroundSize: '40px 40px' };
        case 'circuit':
          return { backgroundColor: bg, backgroundImage: `linear-gradient(90deg, ${fg} 1px, transparent 1px), linear-gradient(${fg} 1px, transparent 1px)`, backgroundSize: '100px 100px', opacity: 0.1 };
        case 'hexagons':
          return { backgroundColor: bg, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cpath fill='${encodeURIComponent(fg)}' fill-opacity='0.4' d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9l11-6.35 11 6.35v12.7l-11 6.35L3 30.6V17.9z'/%3E%3C/svg%3E")` };
        default:
          return { backgroundColor: bg };
      }
    }
    return { backgroundColor: '#0a0a0a' };
  };

  if (!event) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-bold">Carregando Telão...</div>;

  if (countdown !== null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={getBackgroundStyle()}>
        <motion.div
          key={countdown}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          className="text-[20rem] font-black text-white leading-none"
          style={{ textShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
        >
          {countdown}
        </motion.div>
        <p className="text-4xl font-bold text-white/50 uppercase tracking-widest mt-8">
          Preparando Ranking Final...
        </p>
      </div>
    );
  }

  if (showRanking) {
    const topPhotos = categoryGroups.map((g) => ({ ...g, photo: g.photos[0] })).filter((g) => g.photo);
    return (
      <div className="min-h-screen flex flex-col p-12" style={getBackgroundStyle()}>
        <header className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-6">
            {event.logo_url && (
              <div className="p-4 bg-white rounded-2xl shadow-2xl">
                <img src={event.logo_url} alt="Logo" className="h-24 w-auto object-contain" referrerPolicy="no-referrer" />
              </div>
            )}
            <div>
              <h1 className="text-6xl font-black tracking-tighter uppercase text-white" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                Ranking Final
              </h1>
              <p className="text-2xl font-bold text-white/70 uppercase tracking-widest mt-2">
                Os grandes destaques do evento
              </p>
            </div>
          </div>
          {event.app_logo && (
            <div className="p-4 bg-white rounded-2xl shadow-2xl">
              <img src={event.app_logo} alt="App Logo" className="h-24 w-auto object-contain" referrerPolicy="no-referrer" />
            </div>
          )}
        </header>

        <main className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-8">
          {topPhotos.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-white/10 flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white/10 to-transparent" />
              <span className="text-6xl mb-6 relative z-10">{item.emoji}</span>
              <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-8 relative z-10">
                {item.title}
              </h3>
              <div className="w-full aspect-square rounded-xl overflow-hidden border-4 border-white/20 shadow-2xl relative z-10 mb-6">
                <img src={item.photo.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="relative z-10">
                <p className="text-sm font-bold uppercase tracking-widest text-white/50 mb-1">Vencedor(a)</p>
                <p className="text-3xl font-black text-white">{item.photo.user_name || 'Anônimo'}</p>
              </div>
            </motion.div>
          ))}
        </main>
      </div>
    );
  }

  const currentGroup = categoryGroups[currentGroupIndex];
  const currentPhoto = currentGroup?.photos[currentPhotoIndex];

  return (
    <div className="min-h-screen text-white overflow-hidden flex flex-col" style={getBackgroundStyle()}>
      {/* Header */}
      <header className="px-8 py-4 flex justify-between items-center border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          {event.logo_url && (
            <div className="p-2 bg-white rounded-xl shadow-lg">
              <img src={event.logo_url} alt="Logo" className="max-h-32 w-auto object-contain" referrerPolicy="no-referrer" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase leading-none" style={{ color: event.tv_primary_color || '#ffffff' }}>{event.name}</h1>
            <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px] mt-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Feed Interativo ao Vivo
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-bold text-neutral-500 uppercase">Envie sua foto!</p>
            <p className="text-lg font-black text-white">/{event.slug}</p>
          </div>
          <div className="w-16 h-16 bg-neutral-900 rounded-2xl flex items-center justify-center text-white shadow-2xl border-2 border-white/20 shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
              <path d="M12 21c-4.97 0-9-4.03-9-9s4.03-9 9-9 9 4.03 9 9-4.03 9-9 9z" />
              <path d="M7.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
              <path d="M16.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
              <path d="M9 15c.5 1 1.5 1.5 3 1.5s2.5-.5 3-1.5" />
            </svg>
          </div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-10 p-10 overflow-hidden">
        {/* Slideshow */}
        <div className="col-span-9 bg-black/20 rounded-2xl overflow-hidden relative shadow-2xl border border-white/5">
          <AnimatePresence mode="wait">
            {currentPhoto ? (
              <motion.div
                key={`${currentGroup.title}-${currentPhoto.id}`}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 flex items-center justify-center p-8"
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={currentPhoto.url}
                    className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border-8 border-white/10"
                    referrerPolicy="no-referrer"
                  />

                  <div className="absolute top-10 left-10 bg-black/60 backdrop-blur-md px-8 py-4 rounded-xl border border-white/10 flex items-center gap-4">
                    <span className="text-4xl">{currentGroup.emoji}</span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Categoria</p>
                      <h3 className="text-xl font-black uppercase tracking-tight" style={{ color: event.tv_primary_color || '#ffffff' }}>{currentGroup.title}</h3>
                    </div>
                  </div>

                  <div className="absolute bottom-10 left-10 right-10 p-8 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center font-bold text-white/60">
                          {currentPhoto.user_name?.substring(0, 2).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Foto enviada por</p>
                          <h2 className="text-2xl font-black tracking-tighter">{currentPhoto.user_name}</h2>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        {Object.entries(currentPhoto.reaction_counts || { '❤️': currentPhoto.likes || 0 }).map(([emoji, count]) => (
                          <div key={emoji} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl">
                            <span className="text-2xl">{emoji}</span>
                            <span className="text-xl font-black">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-full text-neutral-700">
                <Camera className="w-24 h-24 animate-pulse" />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Ranking sidebar */}
        <div className="col-span-3 flex flex-col gap-8 overflow-hidden">
          <section className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-6 h-6" style={{ color: event.tv_primary_color || '#EAB308' }} />
              <h2 className="text-xl font-black uppercase tracking-tight">Ranking</h2>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              {currentGroup?.photos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  layout
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className={cn(
                    'p-3 rounded-2xl border transition-all duration-500 flex gap-3 items-center',
                    index === currentPhotoIndex
                      ? 'bg-white border-white shadow-xl scale-105'
                      : 'bg-black/20 border-white/5',
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm',
                    index === currentPhotoIndex ? 'bg-neutral-100 text-neutral-900' : 'bg-white/10 text-white',
                  )}>
                    {index + 1}
                  </div>
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0">
                    <img src={photo.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('font-bold text-sm truncate', index === currentPhotoIndex ? 'text-neutral-900' : 'text-white')}>
                      {photo.user_name}
                    </p>
                    <div className="flex items-center gap-1.5" style={{ color: event.tv_primary_color || '#ef4444' }}>
                      <Heart className="w-3 h-3 fill-current" />
                      <span className="font-black text-xs">{photo.likes}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
              {(!currentGroup || currentGroup.photos.length === 0) && (
                <p className="text-neutral-600 font-bold uppercase tracking-widest text-center py-12 text-xs">Nenhuma interação ainda</p>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Sound activation button for browser auto-play policy */}
      {!soundEnabled && (
        <button
          onClick={() => {
            setSoundEnabled(true);
            unlockAudioContext();
          }}
          className="fixed bottom-6 right-6 z-[9999] bg-neutral-900/90 text-white hover:bg-neutral-800 text-xs font-black px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-white/10 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
        >
          <Volume2 className="w-4 h-4 text-green-400 animate-pulse" />
          Ativar Som da TV
        </button>
      )}

      {/* Overlay de Sorteio (z-[200], abaixo dos anúncios z-[999]) */}
      <RaffleOverlay event={event} getBackgroundStyle={getBackgroundStyle} />

      {/* Fullscreen Overlay for active announcement */}
      <AnimatePresence>
        {activeAnnouncement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex flex-col items-center justify-center p-12 overflow-hidden"
            style={{
              backgroundColor: `${activeAnnouncement.bg_color || '#ef4444'}EE`,
              color: activeAnnouncement.text_color || '#ffffff'
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.4))] pointer-events-none" />
            
            <motion.div
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: -30, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 120 }}
              className="max-w-4xl w-full text-center space-y-8 flex flex-col items-center px-6 relative z-10"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="w-28 h-28 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30 shadow-2xl"
              >
                {activeAnnouncement.icon === 'bell' ? (
                  <Bell className="w-14 h-14 animate-bounce text-white" />
                ) : (
                  <Megaphone className="w-14 h-14 -rotate-12 text-white" />
                )}
              </motion.div>

              <h2 className="text-6xl font-black uppercase tracking-tight leading-tight filter drop-shadow-md">
                {activeAnnouncement.title}
              </h2>

              <div className="w-40 h-1 bg-white/30 rounded-full" />

              <p className="text-2xl font-bold max-w-3xl leading-relaxed text-white/95 filter drop-shadow-sm">
                {activeAnnouncement.message}
              </p>

              <div className="pt-6">
                <div className="px-5 py-2 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 text-[10px] font-black tracking-widest uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  Aviso em Destaque
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
