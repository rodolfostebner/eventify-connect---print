import { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { EventData } from '../../../types';

const AUTO_DISMISS_MS = 5000;

interface Props {
  event: EventData;
  visible: boolean;
  onClose: () => void;
}

export function EventWelcomeModal({ event, visible, onClose }: Props) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onClose, AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [visible, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            onClick={e => e.stopPropagation()}
            className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-1.5 bg-black/20 hover:bg-black/30 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            {event.owner_photo && (
              <div className="w-full max-h-64 overflow-hidden">
                <img
                  src={event.owner_photo}
                  alt=""
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {event.owner_text && (
              <div className="px-6 py-5">
                <p className="text-sm text-neutral-600 leading-relaxed font-medium italic text-center">
                  "{event.owner_text}"
                </p>
              </div>
            )}

            {/* Barra de progresso de auto-fechamento */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: AUTO_DISMISS_MS / 1000, ease: 'linear' }}
              className="h-1 origin-left"
              style={{ backgroundColor: event.primary_color || '#3FA790' }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
