import React, { useEffect, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Trash2, Send } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../../../lib/utils';
import type { PhotoData, PhotoComment } from '../../../../types';
import { User } from '../../../../services/authService';

interface CommentItemProps {
  comment: PhotoComment;
  canDelete: boolean;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

const CommentItem = memo(({ comment, canDelete, onDelete }: CommentItemProps) => {
  const handleDelete = useCallback(() => {
    if (comment.id) onDelete(comment.id);
  }, [comment.id, onDelete]);

  return (
    <div className="group/comment flex items-start justify-between gap-3">
      <div className="flex-1">
        <p className="text-xs">
          <span className="font-black mr-2">{comment.user_name}</span>
          <span className="text-neutral-600">{comment.text}</span>
        </p>
        <p className="text-[9px] text-neutral-300 mt-1 font-bold">
          {format(new Date(comment.timestamp), "HH:mm '·' d 'de' MMM", { locale: ptBR })}
        </p>
      </div>
      {canDelete && (
        <button 
          onClick={handleDelete}
          className="opacity-0 group-hover/comment:opacity-100 p-1 text-neutral-300 hover:text-red-500 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
});
CommentItem.displayName = 'CommentItem';

interface PhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  photo: PhotoData | null | undefined;
  user: User | null;
  isAdmin: boolean;
  onAddComment: (e: React.FormEvent) => void;
  onDeleteComment: (id: string) => void;
  newComment: string;
  setNewComment: (val: string) => void;
  isSubmitting: boolean;
  approvedComments: PhotoComment[];
  event: EventData;
  onReact: (emoji: string) => void;
  onDeletePhoto?: () => void;
}

export const PhotoModal = ({
  isOpen,
  onClose,
  photo,
  user,
  isAdmin,
  onAddComment,
  onDeleteComment,
  newComment,
  setNewComment,
  isSubmitting,
  approvedComments,
  event,
  onReact,
  onDeletePhoto
}: PhotoModalProps) => {
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

  if (!isOpen || !photo) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative flex flex-col h-full max-h-[90vh]"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-black/10 hover:bg-black/20 text-white rounded-full backdrop-blur-md transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="aspect-square w-full bg-neutral-100">
              <img 
                src={photo.url} 
                className="w-full h-full object-contain" 
                loading="lazy"
                alt={`Foto de ${photo.user_name}`}
              />
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-neutral-500">
                      {photo.user_name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-black">{photo.user_name}</p>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Postado agora</p>
                    </div>
                  </div>
                  
                  {(isAdmin || (user && (photo.user_id === user.uid || photo.firebase_uid === user.uid))) && onDeletePhoto && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Tem certeza que deseja deletar esta foto?')) {
                          onDeletePhoto();
                        }
                      }}
                      className="p-2 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Deletar Foto"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  {['🔥', '😂', '❤️', '🎸'].map(emoji => {
                    const hasReacted = user ? photo.reacted_users?.includes(`${user.uid}_${emoji}`) : false;
                    const count = photo.reaction_counts?.[emoji] || 0;
                    return (
                      <button
                        key={emoji}
                        onClick={() => onReact(emoji)}
                        className={cn(
                          "flex items-center gap-2 px-5 py-2.5 rounded-2xl border transition-all font-black text-sm",
                          hasReacted
                            ? "bg-neutral-900 border-neutral-900 text-white shadow-lg scale-105"
                            : "bg-white border-neutral-100 text-neutral-400 hover:border-neutral-200 hover:bg-neutral-50"
                        )}
                      >
                        <span className="text-lg">{emoji}</span>
                        {count > 0 && <span>{count}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-50 pb-2">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-300">
                    Comentários ({approvedComments.length})
                  </h4>
                </div>
                
                {/* Quick Comments */}
                {user && event.custom_comments && event.custom_comments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {event.custom_comments.map((text, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setNewComment(text);
                          // Trigger submit automatically or just set?
                          // For now just set to avoid accidental double submits
                        }}
                        className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-full text-[10px] font-bold text-neutral-600 transition-colors"
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                )}

                <div className="space-y-4 max-h-[30vh] overflow-y-auto no-scrollbar">
                  {approvedComments.length === 0 ? (
                    <p className="text-center py-8 text-xs text-neutral-400 font-medium italic">Ninguém comentou ainda. Seja o primeiro!</p>
                  ) : (
                    approvedComments.map((comment) => (
                      <CommentItem 
                        key={comment.id}
                        comment={comment}
                        canDelete={user?.uid === comment.uid || isAdmin}
                        onDelete={onDeleteComment}
                        isAdmin={isAdmin}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-neutral-50 border-t border-neutral-100">
            <form onSubmit={onAddComment} className="relative">
              <input
                placeholder={user ? "Adicione um comentário..." : "Faça login para comentar"}
                disabled={!user || isSubmitting}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full bg-white border border-neutral-200 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/5 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!user || !newComment.trim() || isSubmitting}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neutral-400 hover:text-neutral-900 disabled:opacity-0 transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
