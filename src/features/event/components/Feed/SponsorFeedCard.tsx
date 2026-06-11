import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, X } from 'lucide-react';
import { SocialLinks } from '../SocialLinks';
import type { Partner, PartnerType } from '../../../../types';
import { cn } from '../../../../lib/utils';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<PartnerType, string> = {
  patrocinador: 'Patrocinador',
  apoiador: 'Apoiador',
  servico: 'Serviço',
};

const TYPE_COLORS: Record<PartnerType, { bg: string; text: string; border: string }> = {
  patrocinador: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  apoiador: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  servico: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface SponsorFeedCardProps {
  partner: Partner;
  /** URL da foto já selecionada (1 entre as fotos do parceiro) */
  photoUrl: string | null;
  /** 'grid' = compacto para galeria; 'timeline' = largura total para feed vertical */
  variant: 'grid' | 'timeline';
}

// ─── Componente Principal ────────────────────────────────────────────────────

export function SponsorFeedCard({ partner, photoUrl, variant }: SponsorFeedCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const typeStyle = TYPE_COLORS[partner.type] || TYPE_COLORS.patrocinador;
  const typeLabel = TYPE_LABELS[partner.type] || 'Parceiro';

  return (
    <>
      <div onClick={() => setIsModalOpen(true)} className="cursor-pointer">
        {variant === 'grid' ? (
          <GridVariant partner={partner} photoUrl={photoUrl} typeStyle={typeStyle} typeLabel={typeLabel} />
        ) : (
          <TimelineVariant partner={partner} photoUrl={photoUrl} typeStyle={typeStyle} typeLabel={typeLabel} />
        )}
      </div>

      <SponsorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        partner={partner}
        photoUrl={photoUrl}
        typeStyle={typeStyle}
        typeLabel={typeLabel}
      />
    </>
  );
}

// ─── Variante Grid (compacta) ────────────────────────────────────────────────

function GridVariant({
  partner, photoUrl, typeStyle, typeLabel,
}: {
  partner: Partner;
  photoUrl: string | null;
  typeStyle: { bg: string; text: string; border: string };
  typeLabel: string;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.35 }}
      className={cn(
        'relative bg-white rounded-xl overflow-hidden border shadow-sm hover:shadow-lg hover:scale-[0.99] transition-all duration-300 h-full flex flex-col',
        typeStyle.border,
      )}
    >
      {/* Tag de tipo */}
      <div className={cn(
        'absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider',
        typeStyle.bg, typeStyle.text,
      )}>
        ✦ {typeLabel}
      </div>

      {/* Foto */}
      <div className="aspect-square relative overflow-hidden bg-neutral-50 flex items-center justify-center shrink-0">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={partner.name}
            className="w-full h-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : partner.logo_url ? (
          <img
            src={partner.logo_url}
            alt={partner.name}
            className="max-w-[70%] max-h-[70%] object-contain"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <Users className="w-10 h-10 text-neutral-300" />
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      {/* Footer compacto */}
      <div className="p-2.5 space-y-1.5 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {partner.logo_url && (
              <img
                src={partner.logo_url}
                alt=""
                className="w-6 h-6 rounded-md object-contain bg-neutral-50 shrink-0"
                referrerPolicy="no-referrer"
              />
            )}
            <h4 className="text-[11px] font-bold text-neutral-800 truncate leading-tight">{partner.name}</h4>
          </div>
          {partner.description && (
            <p className="text-[9px] text-neutral-500 line-clamp-2 leading-snug">{partner.description}</p>
          )}
        </div>
        <div onClick={(e) => e.stopPropagation()} className="pt-1 border-t border-neutral-100/60 mt-auto">
          <SocialLinks
            instagram={partner.instagram_url ?? undefined}
            tiktok={partner.tiktok_url ?? undefined}
            youtube={partner.youtube_url ?? undefined}
            whatsapp={partner.whatsapp ?? undefined}
            website={partner.website_url ?? undefined}
            email={partner.email ?? undefined}
            phone={partner.phone ?? undefined}
            containerClassName="flex gap-1 flex-wrap"
            buttonClassName="p-1 bg-neutral-50 rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 text-[10px]"
          />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Variante Timeline (largura total) ───────────────────────────────────────

function TimelineVariant({
  partner, photoUrl, typeStyle, typeLabel,
}: {
  partner: Partner;
  photoUrl: string | null;
  typeStyle: { bg: string; text: string; border: string };
  typeLabel: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.995 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'bg-white rounded-2xl border overflow-hidden shadow-sm w-full max-w-xl mx-auto hover:shadow-md transition-all duration-300',
        typeStyle.border,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-neutral-50">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {partner.logo_url ? (
            <img
              src={partner.logo_url}
              alt=""
              className="w-9 h-9 rounded-lg object-contain bg-neutral-50 p-1 shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-neutral-400" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-black text-neutral-800 truncate">{partner.name}</p>
            <span className={cn(
              'inline-block px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider mt-0.5',
              typeStyle.bg, typeStyle.text,
            )}>
              ✦ {typeLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Foto principal */}
      {photoUrl && (
        <div className="w-full bg-neutral-50 flex items-center justify-center max-h-[450px] overflow-hidden border-b border-neutral-50">
          <img
            src={photoUrl}
            alt={partner.name}
            className="w-full h-auto object-contain max-h-[450px]"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* Descrição + redes sociais */}
      <div className="p-4 space-y-3">
        {partner.description && (
          <p className="text-xs text-neutral-600 leading-relaxed line-clamp-3">{partner.description}</p>
        )}
        <div onClick={(e) => e.stopPropagation()} className="border-t border-neutral-100 pt-2">
          <SocialLinks
            instagram={partner.instagram_url ?? undefined}
            tiktok={partner.tiktok_url ?? undefined}
            youtube={partner.youtube_url ?? undefined}
            whatsapp={partner.whatsapp ?? undefined}
            website={partner.website_url ?? undefined}
            email={partner.email ?? undefined}
            phone={partner.phone ?? undefined}
            containerClassName="flex gap-2 pt-1 flex-wrap"
            buttonClassName="p-1.5 bg-neutral-50 rounded-full text-neutral-600 transition-colors hover:bg-neutral-100"
          />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Modal do Patrocinador ───────────────────────────────────────────────────

interface SponsorModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: Partner;
  photoUrl: string | null;
  typeStyle: { bg: string; text: string; border: string };
  typeLabel: string;
}

function SponsorModal({
  isOpen,
  onClose,
  partner,
  photoUrl,
  typeStyle,
  typeLabel,
}: SponsorModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />
          
          {/* Container do Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative flex flex-col h-full max-h-[85vh] z-[101]"
          >
            {/* Botão de Fechar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-sm transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
              {/* Imagem Principal ou Logo do Parceiro */}
              <div className="w-full bg-neutral-50 p-4 sm:p-6 flex items-center justify-center min-h-[250px] max-h-[45vh] overflow-hidden relative border-b border-neutral-100 shrink-0">
                {photoUrl ? (
                  <img 
                    src={photoUrl} 
                    className="w-auto max-h-[38vh] object-contain rounded-xl shadow-md border border-neutral-200/60" 
                    loading="lazy"
                    alt={`Foto de ${partner.name}`}
                    referrerPolicy="no-referrer"
                  />
                ) : partner.logo_url ? (
                  <img 
                    src={partner.logo_url} 
                    className="max-w-[60%] max-h-[38vh] object-contain" 
                    loading="lazy"
                    alt={`Logo de ${partner.name}`}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Users className="w-20 h-20 text-neutral-300" />
                )}
              </div>

              {/* Informações */}
              <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Identidade */}
                  <div className="flex items-center gap-3 border-b border-neutral-50 pb-4">
                    {partner.logo_url ? (
                      <img
                        src={partner.logo_url}
                        alt=""
                        className="w-12 h-12 rounded-xl object-contain bg-neutral-50 p-1 border shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6 text-neutral-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-base font-black text-neutral-800 truncate leading-snug">{partner.name}</h3>
                      <span className={cn(
                        'inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider mt-1.5',
                        typeStyle.bg, typeStyle.text,
                      )}>
                        ✦ {typeLabel}
                      </span>
                    </div>
                  </div>

                  {/* Descrição Completa */}
                  {partner.description && (
                    <div className="space-y-2">
                      <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">
                        Sobre o parceiro
                      </h4>
                      <p className="text-xs text-neutral-600 leading-relaxed whitespace-pre-line">
                        {partner.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Redes Sociais no Rodapé */}
                <div className="space-y-3 border-t border-neutral-100 pt-4 mt-auto">
                  <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">
                    Canais de Contato
                  </h4>
                  <SocialLinks
                    instagram={partner.instagram_url ?? undefined}
                    tiktok={partner.tiktok_url ?? undefined}
                    youtube={partner.youtube_url ?? undefined}
                    whatsapp={partner.whatsapp ?? undefined}
                    website={partner.website_url ?? undefined}
                    email={partner.email ?? undefined}
                    phone={partner.phone ?? undefined}
                    containerClassName="flex gap-2 flex-wrap"
                    buttonClassName="flex items-center justify-center p-2.5 bg-neutral-50 hover:bg-neutral-100 rounded-xl text-neutral-600 transition-colors border border-neutral-200/30"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
