import React, { useState, memo, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { User } from '../../../../services/authService';
import type { EventData, PhotoData } from '../../../../types';
import { likePost, commentOnPost } from '../../../../services/posts';
import { InteractionBar } from './InteractionBar';
import { PhotoModal } from './PhotoModal';

interface PhotoCardProps {
  photo: PhotoData;
  user: User | null;
  event: EventData;
  onLogin: () => void;
  onDelete?: () => void;
}

export const PhotoCard = memo(function PhotoCard({ photo, user, event, onLogin }: PhotoCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = (user as any)?.role === 'admin' || (event.admin_emails && user?.email ? event.admin_emails.includes(user.email) : false);
  const hasLiked = user ? photo.reacted_users?.includes(`${user.uid}_like`) : false;

  const handleLike = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (event.interactions_paused) {
      toast.error('Interações estão pausadas no momento.');
      return;
    }
    if (!user) {
      onLogin();
      return;
    }

    const likeKey = `${user.uid}_like`;
    try {
      await likePost(photo.id, likeKey, hasLiked ? -1 : 1);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao curtir foto.');
    }
  }, [event.interactions_paused, user, onLogin, photo.id, hasLiked]);

  const handleAddComment = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const comment: any = {
        id: crypto.randomUUID(),
        user: user.displayName || 'Anônimo',
        uid: user.uid,
        text: newComment.trim(),
        timestamp: new Date().toISOString(),
        status: event.comment_moderation_enabled === false ? 'approved' : 'pending'
      };

      await commentOnPost(photo.id, [...(photo.comments || []), comment]);
      setNewComment('');
      toast.success(event.comment_moderation_enabled === false ? 'Comentário enviado!' : 'Comentário enviado para moderação.');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao enviar comentário.');
    } finally {
      setIsSubmitting(false);
    }
  }, [user, newComment, isSubmitting, photo.id, event.comment_moderation_enabled]);

  const handleDeleteComment = useCallback(async (commentId: string) => {
    const comment = photo.comments?.find(c => c.id === commentId);
    if (!user || !comment || (comment.uid !== user.uid && !isAdmin)) return;

    try {
      const updatedComments = photo.comments?.map(c => 
        c.id === commentId ? { ...c, deleted: true } : c
      ) || [];
      await commentOnPost(photo.id, updatedComments as any);
      toast.success('Comentário removido!');
    } catch (err) {
      console.error(err);
    }
  }, [user, photo.comments, photo.id, isAdmin]);

  const approvedComments = useMemo(() => 
    (photo.comments || []).filter(c => c.status === 'approved' && !(c as any).deleted),
    [photo.comments]
  );

  const handleCloseModal = useCallback(() => setShowDetails(false), []);
  const handleOpenModal = useCallback(() => setShowDetails(true), []);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleOpenModal}
        className="group relative bg-white rounded-3xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
      >
        <div className="aspect-square relative overflow-hidden">
          <img 
            src={photo.url} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            loading="lazy"
            alt={`Foto de ${photo.user_name}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
             <span className="text-[10px] font-bold text-white truncate max-w-[100px]">
               {photo.user_name}
             </span>
          </div>
        </div>

        <InteractionBar 
          likes={photo.likes || 0}
          hasLiked={hasLiked}
          commentCount={approvedComments.length}
          onLike={handleLike}
        />
      </motion.div>

      <PhotoModal 
        isOpen={showDetails}
        onClose={handleCloseModal}
        photo={photo}
        user={user}
        isAdmin={isAdmin}
        hasLiked={hasLiked}
        onLike={handleLike}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        newComment={newComment}
        setNewComment={setNewComment}
        isSubmitting={isSubmitting}
        approvedComments={approvedComments}
      />
    </>
  );
});
