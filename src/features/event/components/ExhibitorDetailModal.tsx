import React, { useState, useEffect } from 'react';
import { X, Instagram, MessageCircle, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Exhibitor, ExhibitorCategory, AppUser, EventData, Product, Evaluation } from '../../../types';
import { trackVisit } from '../../../services/visitService';
import { getProducts } from '../../../services/productService';
import { formatInstagram, formatWhatsApp, formatWebsite } from '../../../utils/formatters';
import { ExhibitorCatalogModal } from './ExhibitorCatalogModal';
import { getExhibitorEvaluations, subscribeToEvaluations } from '../../../services/evaluationService';
import { ExhibitorRatingSummary } from '../../evaluation/components/ExhibitorRatingSummary';
import { EvaluationModal } from '../../evaluation/components/EvaluationModal';
import { EvaluationListModal } from '../../evaluation/components/EvaluationListModal';


interface Props {
  exhibitor: Exhibitor;
  exhibitors: Exhibitor[];
  categories: ExhibitorCategory[];
  event: EventData;
  user: AppUser | null;
  onClose: () => void;
  onSelectRelated: (ex: Exhibitor) => void;
}

export function ExhibitorDetailModal({ exhibitor, categories, event, user, onClose }: Props) {
  const [showCatalog, setShowCatalog] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  const loadEvaluations = () => {
    getExhibitorEvaluations(exhibitor.id)
      .then(setEvaluations)
      .catch((err) => console.error('Erro ao carregar avaliações:', err));
  };

  useEffect(() => {
    getProducts(exhibitor.id).then(setProducts).catch(() => {});
    loadEvaluations();

    const unsubscribe = subscribeToEvaluations(event.id, () => {
      loadEvaluations();
    });

    return () => {
      unsubscribe();
    };
  }, [exhibitor.id, event.id]);

  const category = categories.find(c => c.id === exhibitor.category_id)
    ?? categories.find(c => c.name.toLowerCase() === exhibitor.category?.toLowerCase());
  const color = category?.color ?? '#3FA790';
  const primaryColor = event.primary_color || '#3FA790';

  const handleSocial = (type: 'instagram' | 'whatsapp' | 'website', url: string) => {
    void trackVisit({ eventId: event.id, exhibitorId: exhibitor.id, userId: user?.id, action: `click_${type}` as any, eventStatus: event.status });
    const href = type === 'instagram' ? formatInstagram(url) : type === 'whatsapp' ? formatWhatsApp(url) : formatWebsite(url);
    if (href) window.open(href, '_blank');
  };

  const stats = [
    ...(exhibitor.ano || exhibitor.turma
      ? [{ icon: '🎓', label: 'Turma', value: [exhibitor.ano, exhibitor.turma].filter(Boolean).join(' · ') }]
      : []),
    ...(exhibitor.members && exhibitor.members.length > 0
      ? [{ icon: '👥', label: 'Integrantes', value: String(exhibitor.members.length) }]
      : []),
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] bg-black/50"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 top-12 md:inset-x-auto md:top-auto md:left-1/2 md:-translate-x-1/2 md:bottom-0 md:w-full md:max-w-2xl z-[81] flex flex-col rounded-t-3xl overflow-hidden bg-[#F5F5F7]"
        style={{ maxHeight: '92dvh' }}
      >
        {/* Hero */}
        <div
          className="relative flex-shrink-0 flex items-center justify-center overflow-hidden"
          style={{
            height: 240,
            background: exhibitor.photo_url
              ? undefined
              : `linear-gradient(135deg, ${color}, ${color}99)`,
          }}
        >
          {exhibitor.photo_url
            ? <img src={exhibitor.photo_url} alt="" className="w-full h-full object-cover" />
            : exhibitor.logo_url
              ? <img src={exhibitor.logo_url} alt={exhibitor.name} className="max-h-28 max-w-[60%] object-contain drop-shadow-lg" />
              : <span className="text-[100px] leading-none select-none">{exhibitor.name.charAt(0).toUpperCase()}</span>
          }

          {/* Overlay escuro quando tem foto para melhorar leitura do botão */}
          {exhibitor.photo_url && <div className="absolute inset-0 bg-black/10" />}

          <button
            onClick={onClose}
            className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow"
          >
            <X className="w-4 h-4 text-[#2D2D3F]" />
          </button>
        </div>

        {/* Card sobrepondo o hero */}
        <div className="flex-1 overflow-y-auto -mt-5 rounded-t-3xl bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div className="px-5 pt-5 pb-10 space-y-0">
            {/* Badge categoria */}
            {category && (
              <span
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: color }}
              >
                {category.icon} {category.name}
              </span>
            )}

            {/* Nome */}
            <h1 className="text-[22px] font-black text-[#2D2D3F] tracking-tight mt-2 mb-1">{exhibitor.name}</h1>

            {/* Tagline ou descrição como subtítulo */}
            {(exhibitor.tagline || exhibitor.description) && (
              <p className="text-[13px] text-[#5A5A6E] leading-relaxed">
                {exhibitor.tagline || exhibitor.description}
              </p>
            )}

            {/* Resumo de Avaliações */}
            <ExhibitorRatingSummary
              evaluations={evaluations}
              event={event}
              user={user}
              onOpenEvaluate={() => setShowRatingModal(true)}
              onOpenComments={() => setShowCommentsModal(true)}
            />

            {/* Fotos dos produtos */}
            {products.some(p => p.photos?.[0]) && (
              <div className="flex gap-2 mt-4 overflow-x-auto -mx-5 px-5 pb-1" style={{ scrollbarWidth: 'none' }}>
                {products.filter(p => p.photos?.[0]).map(p => (
                  <button
                    key={p.id}
                    onClick={() => setShowCatalog(true)}
                    className="shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-[#F5F5F7] border border-[#ECECF1] hover:opacity-80 transition-opacity"
                  >
                    <img src={p.photos[0]} alt={p.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Stats */}
            {stats.length > 0 && (
              <div
                className="grid gap-2 mt-4 pt-4 pb-4 border-t border-b border-[#F0F0F4]"
                style={{ gridTemplateColumns: `repeat(${Math.min(stats.length, 3)}, 1fr)` }}
              >
                {stats.map(s => (
                  <div key={s.label} className="flex items-center gap-1.5">
                    <span className="text-sm">{s.icon}</span>
                    <div>
                      <p className="text-[9px] text-[#94949E] font-bold uppercase tracking-wide">{s.label}</p>
                      <p className="text-[12px] font-bold text-[#2D2D3F]">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA row */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowCatalog(true)}
                className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white text-center transition-opacity hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                Confira o catálogo →
              </button>
              {exhibitor.instagram_url && (
                <button
                  onClick={() => handleSocial('instagram', exhibitor.instagram_url!)}
                  className="w-11 h-11 rounded-xl border border-[#E8E8ED] bg-white flex items-center justify-center hover:bg-neutral-50 transition-colors shrink-0"
                >
                  <Instagram className="w-4.5 h-4.5 text-[#2D2D3F]" />
                </button>
              )}
              {exhibitor.whatsapp && (
                <button
                  onClick={() => handleSocial('whatsapp', `https://wa.me/${exhibitor.whatsapp!.replace(/\D/g, '')}`)}
                  className="w-11 h-11 rounded-xl border border-[#E8E8ED] bg-white flex items-center justify-center hover:bg-neutral-50 transition-colors shrink-0"
                >
                  <MessageCircle className="w-4.5 h-4.5 text-[#2D2D3F]" />
                </button>
              )}
              {exhibitor.website_url && (
                <button
                  onClick={() => handleSocial('website', exhibitor.website_url!)}
                  className="w-11 h-11 rounded-xl border border-[#E8E8ED] bg-white flex items-center justify-center hover:bg-neutral-50 transition-colors shrink-0"
                >
                  <Globe className="w-4.5 h-4.5 text-[#2D2D3F]" />
                </button>
              )}
            </div>

            {/* Sobre o estande */}
            {exhibitor.description && exhibitor.tagline && (
              <div className="mt-5">
                <h3 className="text-[11px] font-black uppercase tracking-[0.12em] text-[#94949E] mb-2">Sobre o estande</h3>
                <p className="text-[12.5px] text-[#2D2D3F] leading-relaxed whitespace-pre-line">{exhibitor.description}</p>
              </div>
            )}

            {/* Comentários button */}
            {evaluations.length > 0 && (
              <button
                onClick={() => setShowCommentsModal(true)}
                className="w-full mt-4 py-3 rounded-xl border border-[#ECECF1] bg-white text-xs font-bold text-[#5A5A6E] hover:bg-neutral-50 transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                Ler avaliações e comentários ({evaluations.length})
              </button>
            )}

            {/* Integrantes */}
            {exhibitor.members && exhibitor.members.length > 0 && (
              <div className="mt-5">
                <h3 className="text-[11px] font-black uppercase tracking-[0.12em] text-[#94949E] mb-3">Integrantes</h3>
                <div className="flex flex-wrap gap-1.5">
                  {exhibitor.members.map((m, i) => (
                    <span key={i} className="px-2.5 py-1 bg-[#F5F5F7] rounded-full text-[11px] font-medium text-[#5A5A6E]">{m}</span>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showCatalog && (
          <ExhibitorCatalogModal
            exhibitor={exhibitor}
            eventStatus={event.status}
            eventId={event.id}
            userId={user?.id}
            primaryColor={primaryColor}
            onClose={() => setShowCatalog(false)}
          />
        )}

        {showRatingModal && user && (
          <EvaluationModal
            exhibitorId={exhibitor.id}
            exhibitorName={exhibitor.name}
            event={event}
            user={user}
            onClose={() => setShowRatingModal(false)}
            onSuccess={loadEvaluations}
          />
        )}

        {showCommentsModal && (
          <EvaluationListModal
            exhibitorName={exhibitor.name}
            evaluations={evaluations}
            event={event}
            user={user}
            onClose={() => setShowCommentsModal(false)}
            onRefresh={loadEvaluations}
            onEdit={() => {
              setShowCommentsModal(false);
              setShowRatingModal(true);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
