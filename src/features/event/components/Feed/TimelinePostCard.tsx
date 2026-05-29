import React, { useState, memo, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Send, Eye, MessageCircle, Star } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../../../lib/utils';
import type { EventData, PhotoData, AppUser, PhotoComment } from '../../../../types';
import { reactToPost, commentOnPost, deletePost, deleteComment } from '../../../../services/posts';

function formatRelativeTime(dateString?: string) {
  if (!dateString) return 'agora';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  
  if (isNaN(diffMs) || diffMs < 0) return 'agora';
  
  const diffSecs = Math.floor(diffMs / 1000);
  if (diffSecs < 60) return 'agora mesmo';
  
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `há ${diffMins} min`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `há ${diffHours}h`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'ontem';
  return `há ${diffDays} dias`;
}

interface TimelinePostCardProps {
  photo: PhotoData;
  user: AppUser | null;
  event: EventData;
  onLogin: () => void;
  onDelete?: () => void;
}

export const TimelinePostCard = memo(function TimelinePostCard({
  photo,
  user,
  event,
  onLogin,
}: TimelinePostCardProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);

  const isAdmin = (user as any)?.role === 'admin' || (event.admin_emails?.includes(user?.email || '') ?? false);

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

  const handleAddComment = useCallback(async (textToSubmit: string) => {
    if (!user || !textToSubmit.trim() || isSubmitting) return;

    // Limits check (dna.json: max_comments_per_photo = 2)
    const userComments = photo.comments?.filter(c => c.uid === user.id || (c as any).user_id === user.id) || [];
    if (userComments.length >= 2) {
      toast.error('Você atingiu o limite de 2 comentários por foto.');
      return;
    }

    setIsSubmitting(true);
    try {
      const trimmedText = textToSubmit.trim();
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
  }, [user, isSubmitting, photo.id, photo.comments, event.comment_moderation_enabled, event.custom_comments]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddComment(newComment);
  };

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
    if (!confirm('Tem certeza que deseja deletar esta foto?')) return;
    try {
      await deletePost(photo.id);
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

  const displayedComments = useMemo(() => {
    if (showAllComments) return approvedComments;
    return approvedComments.length > 0 ? [approvedComments[approvedComments.length - 1]] : [];
  }, [approvedComments, showAllComments]);

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden flex flex-col w-full max-w-xl mx-auto mb-6">
      {/* Header do Post */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-neutral-500 shrink-0 text-sm">
            {photo.user_name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-black text-neutral-800">{photo.user_name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">
                {formatRelativeTime(photo.created_at)}
              </span>
              {photo.is_official && (
                <>
                  <span className="text-[9px] text-neutral-300">•</span>
                  <span className="text-[9px] font-black text-amber-500 flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-current" /> Oficial
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {(isAdmin || (user && photo.user_id === user.id)) && (
          <button 
            onClick={handleDeletePhoto}
            className="p-2 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0"
            title="Deletar Foto"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Imagem do Post */}
      <div className="w-full bg-neutral-50 flex items-center justify-center max-h-[550px] overflow-hidden border-b border-neutral-50">
        <img 
          src={photo.url} 
          className="w-full h-auto object-contain max-h-[500px]" 
          loading="lazy"
          alt={`Foto de ${photo.user_name}`}
        />
      </div>

      {/* Área de Interações (Emojis + Views) */}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Grade de Emojis Reativos com Micro-animação */}
          <div className="flex items-center gap-2">
            {['🔥', '😂', '❤️', '🎸'].map(emoji => {
              const hasReacted = user ? photo.reacted_users?.includes(`${user.id}_${emoji}`) : false;
              const count = photo.reaction_counts?.[emoji] || 0;
              return (
                <motion.button
                  key={emoji}
                  whileTap={{ scale: 1.35 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  onClick={() => handleReact(emoji)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-black transition-all cursor-pointer",
                    hasReacted
                      ? "bg-neutral-100 border-neutral-300 text-neutral-600 shadow-sm"
                      : "bg-neutral-50 border-neutral-100 text-neutral-400 hover:bg-neutral-100"
                  )}
                >
                  <span className="text-sm leading-none">{emoji}</span>
                  <span className="leading-none text-[10px]">{count}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Visualizações e Comentários Totais */}
          <div className="flex items-center gap-3 text-[10px] font-bold text-neutral-400">
            <div className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-neutral-300" />
              <span>{photo.views_count || 0} {photo.views_count === 1 ? 'view' : 'views'}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5 text-neutral-300" />
              <span>{approvedComments.length} {approvedComments.length === 1 ? 'comentário' : 'comentários'}</span>
            </div>
          </div>
        </div>

        {/* Seção de Comentários */}
        <div className="space-y-3 pt-2 border-t border-neutral-50">
          <div className="space-y-2.5">
            {displayedComments.map((comment) => (
              <div key={comment.id} className="group/comment flex items-start justify-between gap-3 text-xs">
                <div className="flex-1">
                  <span className="font-black text-neutral-800 mr-2">{comment.user_name}</span>
                  <span className="text-neutral-600">{comment.text}</span>
                  <span className="text-[9px] text-neutral-300 ml-2 font-semibold">
                    {format(new Date(comment.timestamp), "HH:mm", { locale: ptBR })}
                  </span>
                </div>
                {(user?.id === comment.uid || isAdmin) && (
                  <button 
                    onClick={() => handleDeleteComment(comment.id!)}
                    className="opacity-0 group-hover/comment:opacity-100 p-0.5 text-neutral-300 hover:text-red-500 transition-all shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Toggle para mostrar todos os comentários se passar de 1 */}
          {approvedComments.length > 1 && (
            <button
              onClick={() => setShowAllComments(!showAllComments)}
              className="text-[10px] font-black uppercase tracking-wider text-neutral-400 hover:text-neutral-600 transition-colors mt-2 cursor-pointer"
            >
              {showAllComments 
                ? "Mostrar menos" 
                : `Mostrar todos os ${approvedComments.length} comentários...`
              }
            </button>
          )}

          {/* Comentários Rápidos (Pills) */}
          {user && event.custom_comments && event.custom_comments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {event.custom_comments.map((text, i) => (
                <button
                  key={i}
                  disabled={isSubmitting}
                  onClick={() => handleAddComment(text)}
                  className="px-2.5 py-1 bg-neutral-50 hover:bg-neutral-100 border border-neutral-100 rounded-full text-[9px] font-bold text-neutral-500 transition-all active:scale-95"
                >
                  {text}
                </button>
              ))}
            </div>
          )}

          {/* Input de Comentário Inline */}
          <div className="pt-2">
            <form onSubmit={handleFormSubmit} className="relative flex items-center">
              <input
                placeholder={user ? "Adicione um comentário..." : "Faça login para comentar"}
                disabled={!user || isSubmitting}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200/80 rounded-xl py-2 pl-3.5 pr-10 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900/5 focus:bg-white transition-all disabled:opacity-50 text-neutral-800"
              />
              <button
                type="submit"
                disabled={!user || !newComment.trim() || isSubmitting}
                className="absolute right-1.5 p-1.5 text-neutral-400 hover:text-neutral-800 disabled:opacity-0 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
});
