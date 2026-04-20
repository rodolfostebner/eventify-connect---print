import { useState } from 'react';
import { Copy, Check, X as CloseIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { EventData } from '../../../types';

interface ShareModalProps {
  event: EventData | null;
  onClose: () => void;
}

export function ShareModal({ event, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!event) return null;

  const eventUrl = `${window.location.origin}/event/${event.slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(eventUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {event && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl text-center"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Acesso do Participante</h3>
              <button onClick={onClose}><CloseIcon className="w-6 h-6 text-neutral-400" /></button>
            </div>

            <div className="space-y-6">
              <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-100 flex flex-col items-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(eventUrl)}`}
                  alt="QR Code"
                  className="w-48 h-48 rounded-2xl shadow-sm mb-4"
                />
                <p className="text-[10px] font-bold uppercase text-neutral-400 tracking-widest">Aponte a câmera para acessar</p>
              </div>

              <div className="text-left">
                <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-2">Link de Acesso</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={eventUrl}
                    className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-xs font-mono"
                  />
                  <button
                    onClick={handleCopy}
                    className="p-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-left">
                <p className="text-xs text-blue-700 leading-relaxed">
                  <strong>Dica:</strong> Imprima este QR Code e coloque em locais visíveis do evento para que os participantes possam postar fotos e interagir.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
