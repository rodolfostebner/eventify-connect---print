import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, ShieldCheck, LogOut } from 'lucide-react';

import type { EventData, PhotoData, PrintOrder, PostComment } from '../types';
import { subscribeToEvent, updateEvent } from '../services/eventService';
import { fetchAllPosts, subscribeToAllPosts, updatePostStatus, deletePost, commentOnPost, approveComment, deleteComment } from '../services/posts';
import { completePrintOrder, deletePrintOrder } from '../services/printService';
import { User, logout } from '../services/authService';
import { cn } from '../lib/utils';

// Modular Hooks
import { useModerationPhotos } from '../features/event/hooks/useModerationPhotos';
import { usePrintOrders } from '../features/event/hooks/usePrintOrders';
import { useAdminActions } from '../features/event/hooks/useAdminActions';

// Modular Components
import { PhotoModeration } from '../features/moderation/components/PhotoModeration';
import { CommentModeration } from '../features/moderation/components/CommentModeration';
import { PrintOrderModeration } from '../features/moderation/components/PrintOrderModeration';
import { ModerationControls } from '../features/moderation/components/ModerationControls';
import { PrintOrderModal } from '../features/moderation/components/PrintOrderModal';

export default function ModerationPanel({ user }: { user: User | null }) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventData | null>(null);
  const [filter, setFilter] = useState<'photos' | 'comments' | 'prints' | 'controls'>('photos');
  const [selectedOrder, setSelectedOrder] = useState<PrintOrder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Data Hooks
  const { photos, setPhotos, loading: loadingPhotos } = useModerationPhotos(event?.id);
  const { printOrders, loading: loadingPrints } = usePrintOrders(event?.id);
  const { 
    uploading, 
    handleApprovePhoto, 
    handleRejectPhoto, 
    handleOfficialUpload 
  } = useAdminActions(event);

  // Subscribe to event
  useEffect(() => {
    if (!slug) return;
    return subscribeToEvent(
      slug,
      (ev) => { if (ev) setEvent(ev); },
      (error) => console.error('Error fetching event in ModerationPanel:', error),
    );
  }, [slug]);


  const handleApprovePhotoLocal = async (photo: PhotoData) => {
    setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, status: 'approved' } : p));
    await handleApprovePhoto(photo);
  };

  const handleRejectPhotoLocal = async (id: string) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, status: 'rejected' } : p));
    await handleRejectPhoto(id);
  };

  const handleModerateComment = async (
    photoId: string,
    commentId: string,
    action: 'approved' | 'rejected',
  ) => {
    try {
      const photo = photos.find(p => p.id === photoId);
      if (!photo) return;

      // Optimistic update
      setPhotos(prev => prev.map(p => {
        if (p.id !== photoId) return p;
        const newComments = (p.comments || []).map((c): PostComment => 
          c.id === commentId ? { ...c, status: action } : c
        ).filter(c => action === 'approved' || c.id !== commentId);
        return { ...p, comments: newComments };
      }));

      if (action === 'approved') {
        await approveComment(commentId);
      } else {
        await deleteComment(commentId);
      }
      
      toast.success(action === 'approved' ? 'Comentário aprovado!' : 'Comentário removido!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao moderar comentário.');
    }
  };

  const rankingData = useMemo(() => {
    const approvedPhotos = photos.filter((p) => p.status === 'approved');
    const categories = [
      { id: '🔥', title: 'Mais Curtidas', emoji: '🔥' },
      { id: '😂', title: 'Mais Divertida', emoji: '😂' },
      { id: '❤️', title: 'Mais Fofura', emoji: '❤️' },
      { id: '🗣️', title: 'Mais Comentada', emoji: '🗣️' },
      { id: '🎸', title: 'Rockstar', emoji: '🎸' },
    ];

    const ranking = categories.map((cat) => {
      let sortedPhotos = [...approvedPhotos].filter(p => !p.is_official);
      if (cat.id === '🔥') {
        sortedPhotos.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      } else if (cat.id === '🗣️') {
        sortedPhotos.sort((a, b) => (b.comments?.filter(c => c.status === 'approved').length || 0) - (a.comments?.filter(c => c.status === 'approved').length || 0));
      } else {
        sortedPhotos.sort((a, b) => (b.reaction_counts?.[cat.id] || 0) - (a.reaction_counts?.[cat.id] || 0));
      }

      const topPhoto = sortedPhotos[0];
      let score = 0;
      if (topPhoto) {
        if (cat.id === '🔥') score = topPhoto.likes || 0;
        else if (cat.id === '🗣️') score = topPhoto.comments?.filter(c => c.status === 'approved').length || 0;
        else score = topPhoto.reaction_counts?.[cat.id] || 0;
      }
      return { title: cat.title, emoji: cat.emoji, photo: topPhoto, score };
    }).filter((r) => r.photo && r.score > 0);

    // Destaques Oficiais
    if (event?.has_official_photos) {
      const officialPhotos = approvedPhotos.filter(p => p.is_official).sort((a, b) => (b.likes || 0) - (a.likes || 0));
      if (officialPhotos.length > 0) {
        ranking.push({
          title: 'Destaques Oficiais',
          emoji: '📸',
          photo: officialPhotos[0],
          score: officialPhotos[0].likes || 0
        });
      }
    }

    return ranking;
  }, [photos, event?.has_official_photos]);


  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const pendingPhotosCount = photos.filter(p => p.status === 'pending').length;
  const pendingCommentsCount = photos.flatMap(p => (p.comments || []).filter(c => c.status === 'pending')).length;
  const pendingPrintsCount = printOrders.filter(o => o.status !== 'completed').length;

  if (loadingPhotos && !event) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50">
      <Loader2 className="w-8 h-8 animate-spin text-neutral-400 mb-4" />
      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Preparando Curadoria...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] p-6 md:p-12">
      <header className="max-w-6xl mx-auto flex flex-col gap-10 mb-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/')} className="p-3 bg-white hover:bg-neutral-50 rounded-2xl shadow-sm border border-neutral-100 transition-all">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                 Curadoria
              </h1>
              <p className="text-neutral-400 text-sm font-medium mt-1">/{slug} • Gerenciamento em tempo real</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-4 bg-white p-2 pr-4 rounded-full border border-neutral-100 shadow-sm">
                <img
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'A'}&background=random`}
                  className="w-10 h-10 rounded-full border-2 border-neutral-50"
                  referrerPolicy="no-referrer"
                />
                <div className="hidden sm:block">
                   <p className="text-[10px] font-black uppercase tracking-widest text-neutral-900">{user.displayName || 'Admin'}</p>
                   <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-tighter">Nível 3 Acesso</p>
                </div>
              </div>
            )}
            <button onClick={handleLogout} className="p-4 bg-white hover:bg-red-50 text-neutral-300 hover:text-red-500 rounded-2xl border border-neutral-100 shadow-sm transition-all" title="Sair">
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex gap-2 bg-neutral-100 p-1.5 rounded-[24px] w-fit shadow-inner">
          {(['photos', 'comments', 'prints', 'controls'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                'px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300',
                filter === tab 
                  ? 'bg-white text-neutral-900 shadow-lg' 
                  : 'text-neutral-400 hover:text-neutral-600',
              )}
            >
              {tab === 'photos' && `Fotos (${pendingPhotosCount})`}
              {tab === 'comments' && `Comentários (${pendingCommentsCount})`}
              {tab === 'prints' && `Pedidos (${pendingPrintsCount})`}
              {tab === 'controls' && 'Controles'}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {filter === 'photos' && (
          <PhotoModeration 
            photos={photos} 
            onApprove={handleApprovePhotoLocal} 
            onReject={handleRejectPhotoLocal} 
          />
        )}
        
        {filter === 'comments' && (
          <CommentModeration 
            photos={photos} 
            onModerateComment={handleModerateComment} 
          />
        )}

        {filter === 'prints' && (
          <PrintOrderModeration 
            orders={printOrders}
            onViewDetails={setSelectedOrder}
            onComplete={completePrintOrder}
            onDelete={deletePrintOrder}
          />
        )}

        {filter === 'controls' && (
          <ModerationControls
            event={event}
            uploading={uploading}
            onUploadClick={() => fileInputRef.current?.click()}
            onToggleInteractions={() => event && updateEvent(event.id, { interactions_paused: !event.interactions_paused })}
            onToggleTVRanking={() => event && updateEvent(event.id, { tv_show_ranking: !event.tv_show_ranking })}
            onToggleModeration={() => event && updateEvent(event.id, { comment_moderation_enabled: !event.comment_moderation_enabled })}
            onToggleOfficialPhotos={() => event && updateEvent(event.id, { has_official_photos: !event.has_official_photos })}
            rankingData={rankingData as any}
            fileInputRef={fileInputRef}
            onFileSelect={(e) => handleOfficialUpload(e.target.files)}
          />
        )}
      </main>

      <PrintOrderModal
        order={selectedOrder}
        photos={photos}
        onClose={() => setSelectedOrder(null)}
        onComplete={completePrintOrder}
      />
    </div>
  );
}
