import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Megaphone, Bell, Volume2 } from 'lucide-react';
import type { EventData, Announcement } from '../../types';
import { supabase } from '../../lib/supabase/client';
import { triggerAnnouncement } from '../../services/announcementService';

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
      audio.play().catch((err) => {
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

/**
 * Overlay de aviso do telão — compartilhado entre o TVView legado e o
 * TVDisplay modular (temas novos). Lê `event.active_announcement_id`,
 * exibe em tela cheia quando o aviso tem `target_tv`, toca o som e
 * limpa o aviso ativo automaticamente após `show_duration_sec`.
 *
 * O disparo (announcementService.triggerAnnouncement) grava o aviso na
 * linha do evento, então este overlay funciona em qualquer tema do telão.
 */
export default function AnnouncementOverlay({ event }: { event: EventData }) {
  const [activeAnnouncement, setActiveAnnouncement] = useState<Announcement | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const announcementAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout> | null = null;
    let active = true;

    if (!event?.active_announcement_id || !supabase) {
      setActiveAnnouncement(null);
      return;
    }

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

            // Toca o chime sintetizado
            if (soundEnabled) {
              const audio = playNotificationSound(ann.audio_url || 'synth_classic');
              if (audio) announcementAudioRef.current = audio;
            }

            // Auto-limpa após show_duration_sec
            const duration = (ann.show_duration_sec || 15) * 1000;
            timerId = setTimeout(() => {
              triggerAnnouncement(event.id, null).catch(console.error);
            }, duration);
          } else {
            setActiveAnnouncement(null);
          }
        }
      });

    return () => {
      active = false;
      if (timerId) clearTimeout(timerId);
      if (announcementAudioRef.current) {
        announcementAudioRef.current.pause();
        announcementAudioRef.current = null;
      }
    };
  }, [event?.active_announcement_id, event?.announcement_trigger_at, event?.id, soundEnabled]);

  return (
    <>
      {/* Botão de ativação de som (política de autoplay do navegador) */}
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

      {/* Overlay em tela cheia do aviso ativo */}
      <AnimatePresence>
        {activeAnnouncement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex flex-col items-center justify-center p-12 overflow-hidden"
            style={{
              backgroundColor: `${activeAnnouncement.bg_color || '#ef4444'}EE`,
              color: activeAnnouncement.text_color || '#ffffff',
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.4))] pointer-events-none" />

            <motion.div
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: -30, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 120 }}
              className="max-w-4xl w-full text-center space-y-8 flex flex-col items-center px-6 relative z-10"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
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
    </>
  );
}
