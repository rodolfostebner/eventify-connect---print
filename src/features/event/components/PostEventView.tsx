import React, { useState, useEffect, useMemo } from 'react';
import { Star, Briefcase, Trophy, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { EventData, AppUser, Exhibitor, Partner, ExhibitorCategory } from '../../../types';
import { useEventPhotos } from '../hooks/useEventPhotos';
import { PhotoCard } from './PhotoCard/PhotoCard';
import { PartnerSection } from './PartnerSection';
import { ExhibitorList } from './ExhibitorList';
import { ExhibitorDetailModal } from './ExhibitorDetailModal';
import { getExhibitors } from '../../../services/exhibitorService';
import { getPartners } from '../../../services/partnerService';
import { getExhibitorCategories } from '../../../services/exhibitorCategoryService';
import { getParticipantStarRanking, type ParticipantStarRanking } from '../../../services/evaluationService';
import { rotateByTime, SPONSOR_ROTATION_MS } from '../../../lib/utils';

interface Props {
  event: EventData;
  user: AppUser | null;
  onLogin: () => void;
}

const MEDALS = ['🥇', '🥈', '🥉'];

export const PostEventView = ({ event, user, onLogin }: Props) => {
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [categories, setCategories] = useState<ExhibitorCategory[]>([]);
  const [rankings, setRankings] = useState<ParticipantStarRanking[]>([]);
  const [selectedExhibitor, setSelectedExhibitor] = useState<Exhibitor | null>(null);
  const [momentIdx, setMomentIdx] = useState(0);
  const [showAllRankings, setShowAllRankings] = useState(false);

  const { photos } = useEventPhotos(event.id);

  useEffect(() => {
    getExhibitors(event.id).then(setExhibitors).catch(() => {});
    getPartners(event.id).then(setPartners).catch(() => {});
    getExhibitorCategories(event.id).then(setCategories).catch(() => {});
    getParticipantStarRanking(event.id, event.date).then(setRankings).catch(() => {});
  }, [event.id]);

  // Rodízio justo dos patrocinadores/serviços (gira a cada 5 min — ver SPONSOR_ROTATION_MS)
  const sponsors = useMemo(
    () => rotateByTime(partners.filter(p => p.type === 'patrocinador' || p.type === 'apoiador'), SPONSOR_ROTATION_MS),
    [partners],
  );
  const services = useMemo(
    () => rotateByTime(partners.filter(p => p.type === 'servico'), SPONSOR_ROTATION_MS),
    [partners],
  );

  // Fotos destacadas: top por likes e por cada emoji
  const momentPhotos = useMemo(() => {
    const approved = photos.filter(p => p.status === 'approved' && !p.is_official);
    return [...approved].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 12);
  }, [photos]);

  const rankingPhotoHighlights = useMemo(() => {
    const categories_emoji = [
      { id: '🔥', title: 'Mais Curtida', emoji: '🔥' },
      { id: '😂', title: 'Mais Divertida', emoji: '😂' },
      { id: '❤️', title: 'Mais Fofura', emoji: '❤️' },
      { id: '🗣️', title: 'Mais Comentada', emoji: '🗣️' },
    ];
    return categories_emoji.map(cat => {
      const sorted = [...photos.filter(p => !p.is_official)].sort((a, b) => {
        if (cat.id === '🔥') return (b.likes || 0) - (a.likes || 0);
        if (cat.id === '🗣️') return (b.comments?.filter(c => c.status === 'approved').length || 0) - (a.comments?.filter(c => c.status === 'approved').length || 0);
        return (b.reaction_counts?.[cat.id] || 0) - (a.reaction_counts?.[cat.id] || 0);
      });
      const top = sorted[0];
      const score = top ? (cat.id === '🔥' ? top.likes || 0 : cat.id === '🗣️' ? top.comments?.filter(c => c.status === 'approved').length || 0 : top.reaction_counts?.[cat.id] || 0) : 0;
      return { ...cat, photo: top, score };
    }).filter(r => r.photo && r.score > 0);
  }, [photos]);

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-12">
      {/* Banner "Evento encerrado" */}
      <div
        className="mx-4 mt-4 rounded-2xl p-5 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #2D2D3F, #4A4A60)', boxShadow: '0 4px 12px rgba(45,45,63,0.2)' }}
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-green-400/20 flex items-center justify-center shrink-0">
            <span className="text-xl">✅</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/50 mb-1">Encerrado</p>
            <h2 className="text-lg font-black leading-tight">{event.name}</h2>
            <p className="text-[12px] text-white/60 mt-1 leading-snug">
              {event.post_event_message || 'Obrigado por participar! O evento foi um sucesso.'}
            </p>
          </div>
        </div>
        {event.summary_file_url && (
          <a
            href={event.summary_file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black"
            style={{ backgroundColor: '#F5E96B', color: '#2D2D3F' }}
          >
            Resumo →
          </a>
        )}
      </div>

      {/* Ranking dos expositores */}
      {rankings.length > 0 && (
        <div className="mx-4 mt-4 bg-white rounded-2xl p-4 border border-[#ECECF1] shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h3 className="text-[15px] font-black text-[#2D2D3F]">Ranking dos Expositores</h3>
          </div>
          <div className="space-y-2">
            {(showAllRankings ? rankings : rankings.slice(0, 5)).map((r, i) => (
              <div key={r.exhibitor_id} className="flex items-center gap-3 py-2 border-b border-[#F0F0F4] last:border-0">
                <span className="text-xl w-7 text-center shrink-0">{MEDALS[i] ?? `#${i + 1}`}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-[#2D2D3F] truncate">{r.exhibitor_name}</p>
                  <p className="text-[10px] text-[#94949E]">{r.voters} {r.voters === 1 ? 'voto' : 'votos'}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[15px] font-black text-[#3FA790] tabular-nums leading-none">{r.score} ⭐</p>
                  <p className="text-[9px] text-[#94949E] uppercase tracking-wider mt-1">estrelas</p>
                </div>
              </div>
            ))}
          </div>
          {rankings.length > 5 && (
            <button
              onClick={() => setShowAllRankings(v => !v)}
              className="mt-3 w-full text-center text-[11px] font-bold text-[#3FA790] hover:underline"
            >
              {showAllRankings ? 'Ver menos ↑' : 'Ver ranking completo →'}
            </button>
          )}
        </div>
      )}

      {/* Momentos — carrossel horizontal de fotos */}
      {momentPhotos.length > 0 && (
        <div className="mt-4">
          <div className="px-4 flex items-center gap-2 mb-3">
            <span className="text-base">📸</span>
            <h3 className="text-[15px] font-black text-[#2D2D3F]">Momentos</h3>
          </div>
          <div
            className="flex gap-2.5 overflow-x-auto px-4"
            style={{ scrollbarWidth: 'none', scrollSnapType: 'x mandatory' }}
          >
            {momentPhotos.map(photo => (
              <div
                key={photo.id}
                className="shrink-0 w-[140px] h-[170px] rounded-xl overflow-hidden relative bg-neutral-100"
                style={{ scrollSnapAlign: 'start' }}
              >
                <img src={photo.image_url} alt="" className="w-full h-full object-cover" />
                {(photo.likes || 0) > 0 && (
                  <div className="absolute bottom-2 left-2 bg-black/50 rounded-full px-2 py-0.5 text-white text-[10px] font-bold">
                    ❤️ {photo.likes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Destaques de fotos por categoria */}
      {rankingPhotoHighlights.length > 0 && (
        <div className="mx-4 mt-4 bg-white rounded-2xl p-4 border border-[#ECECF1] shadow-sm">
          <h3 className="text-[15px] font-black text-[#2D2D3F] mb-4">Destaques do Feed</h3>
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={momentIdx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex items-center gap-3 mb-3 px-1">
                  <span className="text-3xl shrink-0">{rankingPhotoHighlights[momentIdx].emoji}</span>
                  <p className="flex-1 min-w-0 text-[10px] font-black uppercase tracking-widest text-[#94949E]">{rankingPhotoHighlights[momentIdx].title}</p>
                  <span className="text-2xl font-black text-[#2D2D3F] shrink-0">{rankingPhotoHighlights[momentIdx].score}</span>
                </div>
                <div className="max-w-[300px] mx-auto">
                  <PhotoCard photo={rankingPhotoHighlights[momentIdx].photo!} user={user} event={event} onLogin={onLogin} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex items-center justify-between mt-3">
            <button onClick={() => setMomentIdx(i => Math.max(0, i - 1))} disabled={momentIdx === 0} className="p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-30 transition-colors">
              <ArrowLeft className="w-4 h-4 text-[#5A5A6E]" />
            </button>
            <div className="flex gap-1.5">
              {rankingPhotoHighlights.map((_, i) => (
                <button key={i} onClick={() => setMomentIdx(i)} className={`h-1.5 rounded-full transition-all ${i === momentIdx ? 'w-6 bg-[#2D2D3F]' : 'w-1.5 bg-[#D0D0D8]'}`} />
              ))}
            </div>
            <button onClick={() => setMomentIdx(i => Math.min(rankingPhotoHighlights.length - 1, i + 1))} disabled={momentIdx === rankingPhotoHighlights.length - 1} className="p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-30 transition-colors">
              <ArrowRight className="w-4 h-4 text-[#5A5A6E]" />
            </button>
          </div>
        </div>
      )}

      {/* Expositores filtrável */}
      <div className="mx-4 mt-4 bg-white rounded-2xl p-4 border border-[#ECECF1] shadow-sm">
        <h3 className="text-[15px] font-black text-[#2D2D3F] mb-4">Expositores</h3>
        <ExhibitorList
          exhibitors={exhibitors}
          categories={categories}
          onSelect={setSelectedExhibitor}
          event={{ id: event.id, status: event.status }}
          user={user}
        />
      </div>

      {/* Patrocinadores */}
      {(sponsors.length > 0 || services.length > 0) && (
        <div className="mx-4 mt-4 bg-white rounded-2xl p-4 border border-[#ECECF1] shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#94949E] mb-4">⭐ Quem tornou isso possível</p>
          <div className="space-y-8">
            {sponsors.length > 0 && (
              <PartnerSection title="Patrocinadores & Apoiadores" items={sponsors.map(s => ({ id: s.id, name: s.name, bio: s.description ?? '', logo: s.logo_url ?? undefined, photos: s.photos, socials: { instagram: s.instagram_url ?? undefined, tiktok: s.tiktok_url ?? undefined, youtube: s.youtube_url ?? undefined, whatsapp: s.whatsapp ?? undefined, website: s.website_url ?? undefined, email: s.email ?? undefined, phone: s.phone ?? undefined } }))} icon={<Star className="w-5 h-5" />} showMessages />
            )}
            {services.length > 0 && (
              <PartnerSection title="Serviços" items={services.map(s => ({ id: s.id, name: s.name, bio: s.description ?? '', logo: s.logo_url ?? undefined, photos: s.photos, socials: { instagram: s.instagram_url ?? undefined, tiktok: s.tiktok_url ?? undefined, youtube: s.youtube_url ?? undefined, whatsapp: s.whatsapp ?? undefined, website: s.website_url ?? undefined, email: s.email ?? undefined, phone: s.phone ?? undefined } }))} icon={<Briefcase className="w-5 h-5" />} showMessages />
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedExhibitor && (
          <ExhibitorDetailModal
            exhibitor={selectedExhibitor}
            exhibitors={exhibitors}
            categories={categories}
            event={event}
            user={user}
            onClose={() => setSelectedExhibitor(null)}
            onSelectRelated={setSelectedExhibitor}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
