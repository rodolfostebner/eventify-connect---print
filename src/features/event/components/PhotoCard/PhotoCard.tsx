import React, { useState, memo, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import type { EventData, PhotoData, AppUser } from '../../../../types';
import { likePost, commentOnPost, reactToPost, deletePost, deleteComment, recordPhotoView } from '../../../../services/posts';
import { InteractionBar } from './InteractionBar';
import { PhotoModal } from './PhotoModal';

interface PhotoCardProps {
  photo: PhotoData;
  user: AppUser | null;
  event: EventData;
  onLogin: () => void;
  onDelete?: () => void;
}

export const PhotoCard = memo(function PhotoCard({ photo, user, event, onLogin }: PhotoCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = (user as any)?.role === 'admin' || (event.admin_emails?.includes(user?.email || '') ?? false);
  const hasLiked = user ? photo.reacted_users?.includes(`${user.id}_🔥`) : false;

  const handleLike = useCallback(async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!user) {
      onLogin();
      return;
    }

    // Limits check (dna.json: max_emojis_per_photo = 2)
    const userReactions = photo.reacted_users?.filter(r => r.startsWith(`${user.id}_`)) || [];
    if (!hasLiked && userReactions.length >= 2) {
      toast.error('Você atingiu o limite de 2 reações por foto.');
      return;
    }

    try {
      await likePost(photo.id, user.id, hasLiked ? -1 : 1);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao curtir foto.');
    }
  }, [user, onLogin, photo.id, hasLiked, photo.reacted_users]);

  const handleReact = useCallback(async (emoji: string) => {
    if (!user) {
      onLogin();
      return;
    }

    const reactKey = `${user.id}_${emoji}`;
    const hasReacted = photo.reacted_users?.includes(reactKey);

    // Limits check (dna.json: max_emojis_per_photo = 2)
    const userReactions = photo.reacted_users?.filter(r => r.startsWith(`${user.id}_`)) || [];
    if (!hasReacted && userReactions.length >= 2) {
      toast.error('Você atingiu o limite de 2 reações por foto.');
      return;
    }
    
    try {
      await reactToPost(photo.id, emoji, user.id, hasReacted ? -1 : 1);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao reagir.');
    }
  }, [user, onLogin, photo.id, photo.reacted_users]);

  const handleAddComment = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || isSubmitting) return;

    // Limits check (dna.json: max_comments_per_photo = 2)
    const userComments = photo.comments?.filter(c => c.uid === user.id || (c as any).user_id === user.id) || [];
    if (userComments.length >= 2) {
      toast.error('Você atingiu o limite de 2 comentários por foto.');
      return;
    }

    setIsSubmitting(true);
    try {
      const trimmedText = newComment.trim();
      const isQuickComment = event.custom_comments?.includes(trimmedText);
      
      await commentOnPost(photo.id, {
        uid: user.id,
        text: trimmedText,
        status: (event.comment_moderation_enabled === false || isQuickComment) ? 'approved' : 'pending'
      });
      setNewComment('');
      const status = (event.comment_moderation_enabled === false || isQuickComment) ? 'approved' : 'pending';
      toast.success(status === 'approved' ? 'Comentário enviado!' : 'Comentário enviado para moderação.');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao enviar comentário.');
    } finally {
      setIsSubmitting(false);
    }
  }, [user, newComment, isSubmitting, photo.id, photo.comments, event.comment_moderation_enabled, event.custom_comments]);

  const handleDeleteComment = useCallback(async (commentId: string) => {
    const comment = photo.comments?.find(c => c.id === commentId);
    if (!user || !comment || (comment.uid !== user.id && !isAdmin)) return;

    try {
      await deleteComment(commentId);
      toast.success('Comentário removido!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao remover comentário.');
    }
  }, [user, photo.comments, isAdmin]);

  const handleDeletePhoto = useCallback(async () => {
    try {
      await deletePost(photo.id);
      setShowDetails(false);
      toast.success('Foto removida!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao remover foto.');
    }
  }, [photo.id]);

  const approvedComments = useMemo(() => 
    (photo.comments || []).filter(c => c.status === 'approved' && !(c as any).deleted),
    [photo.comments]
  );

  const handleCloseModal = useCallback(() => setShowDetails(false), []);
  const handleOpenModal = useCallback(() => {
    setShowDetails(true);
    // Grava visualização única se o usuário estiver logado e não for o autor do post
    if (user && user.id !== photo.user_id) {
      recordPhotoView(photo.id, user.id).catch(err => {
        console.error('Erro ao registrar visualização:', err);
      });
    }
  }, [user, photo.id, photo.user_id]);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleOpenModal}
        className="group relative bg-white rounded-xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
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
          reactionCounts={photo.reaction_counts || {}}
          commentCount={approvedComments.length}
          viewsCount={photo.views_count || 0}
          onReact={handleReact}
          reactedUsers={photo.reacted_users || []}
          user={user}
        />
      </motion.div>

      <PhotoModal 
        isOpen={showDetails}
        onClose={handleCloseModal}
        photo={photo}
        user={user}
        isAdmin={isAdmin}
        onReact={handleReact}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        onDeletePhoto={handleDeletePhoto}
        newComment={newComment}
        setNewComment={setNewComment}
        isSubmitting={isSubmitting}
        approvedComments={approvedComments}
        event={event}
      />
    </>
  );
});
