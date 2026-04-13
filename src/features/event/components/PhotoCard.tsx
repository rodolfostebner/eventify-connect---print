import React, { useState } from 'react';
import { toast } from 'sonner';
import { User } from '../../../services/authService';
import type { EventData, PhotoData } from '../../../types';
import { likePost, reactToPost, commentOnPost } from '../../../services/posts';

interface PhotoCardProps {
  photo: PhotoData;
  user: User | null;
  event: EventData;
  onLogin: () => void;
  onDelete?: () => void;
}

export function PhotoCard({ photo, user, event, onLogin }: PhotoCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Security check using role or emails
  const isAdmin = (user as any)?.role === 'admin' || (event.admin_emails && user?.email ? event.admin_emails.includes(user.email) : false);

  const handleLike = async () => {
    if (event.interactions_paused) {
      toast.error('Interações estão pausadas no momento.');
      return;
    }
    if (!user) {
      onLogin();
      return;
    }

    const likeKey = `${user.uid}_like`;
    const hasLiked = photo.reacted_users?.includes(likeKey);

    try {
      await likePost(photo.id, likeKey, hasLiked ? -1 : 1);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao curtir foto.');
    }
  };

  const handleReaction = async (emoji: string) => {
    if (event.interactions_paused) {
      toast.error('Interações estão pausadas no momento.');
      return;
    }
    if (!user) {
      onLogin();
      return;
    }

    const reactionKey = `${user.uid}_${emoji}`;
    const hasReacted = photo.reacted_users?.includes(reactionKey);

    const userReactions = (photo.reacted_users || []).filter(
      key => key.startsWith(`${user.uid}_`) && key !== `${user.uid}_like`
    );

    try {
      if (!hasReacted && userReactions.length >= 2) {
        toast.error('Você só pode usar até 2 reações.');
        return;
      }

      await reactToPost(photo.id, emoji, user.uid, hasReacted ? -1 : 1);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao reagir.');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const comment: any = {
        id: crypto.randomUUID(), // Substituted from Math.random()
        user: user.displayName || 'Anônimo',
        uid: user.uid,
        text: newComment.trim(),
        timestamp: new Date().toISOString(),
        status: event.comment_moderation_enabled === false ? 'approved' : 'pending'
      };

      await commentOnPost(photo.id, comment);

      setNewComment('');
      toast.success('Comentário enviado!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const comment = photo.comments?.find(c => c.id === commentId);

    if (!user || !comment || (comment.uid !== user.uid && !isAdmin)) return;

    try {
      const deletePayload: any = {
        id: commentId,
        deleted: true
      };

      await commentOnPost(photo.id, deletePayload);

      toast.success('Comentário excluído!');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div
        className="bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-sm"
      >
        <div className="aspect-square relative cursor-pointer" onClick={() => setShowDetails(true)}>
          <img src={photo.url} className="w-full h-full object-cover" />
        </div>

        <div className="p-3 flex justify-between">
          <button onClick={handleLike}>
            ❤️ {photo.likes || 0}
          </button>

          <button onClick={() => setShowDetails(true)}>
            💬 {(photo.comments || []).filter(c => c.status === 'approved' && !(c as any).deleted).length}
          </button>
        </div>
      </div>

      {/* MODAL */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-md p-4 rounded-xl">
            <img src={photo.url} className="w-full mb-4 rounded-lg" />

            {/* Comentários */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(photo.comments || [])
                .filter(c => c.status === 'approved' && !(c as any).deleted)
                .map((comment) => (
                  <div key={comment.id} className="flex justify-between">
                    <span>{comment.text}</span>

                    {(user?.uid === comment.uid || isAdmin) && (
                      <button onClick={() => handleDeleteComment(comment.id)}>
                        ❌
                      </button>
                    )}
                  </div>
                ))}
            </div>

            {/* Input */}
            <form onSubmit={handleAddComment} className="flex gap-2 mt-4">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 border p-2 rounded"
              />
              <button type="submit">Enviar</button>
            </form>

            <button onClick={() => setShowDetails(false)} className="mt-4">
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
