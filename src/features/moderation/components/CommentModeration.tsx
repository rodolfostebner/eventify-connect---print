import React from 'react';
import { Check, Trash2, MessageCircle } from 'lucide-react';
import type { PhotoData } from '../../../types';

interface CommentModerationProps {
  photos: PhotoData[];
  onModerateComment: (photoId: string, commentIndex: number, action: 'approved' | 'rejected') => void;
}

export const CommentModeration = ({ photos, onModerateComment }: CommentModerationProps) => {
  const pendingComments = photos.flatMap((p) =>
    (p.comments || [])
      .map((c, i) => ({ ...c, photoId: p.id, photoUrl: p.url, index: i }))
      .filter((c) => c.status === 'pending')
  );

  if (pendingComments.length === 0) {
    return (
      <div className="py-20 text-center bg-white rounded-[40px] border border-neutral-100 shadow-sm">
        <MessageCircle className="w-16 h-16 mx-auto text-neutral-100 mb-4" />
        <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px]">Nenhum comentário pendente.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {pendingComments.map((comment, i) => (
        <div key={`${comment.photoId}-${i}`} className="bg-white p-5 rounded-[32px] border border-neutral-100 shadow-sm flex items-center gap-6 hover:shadow-md transition-shadow">
          <div className="w-20 h-20 rounded-[24px] overflow-hidden shrink-0 border-4 border-neutral-50 shadow-inner">
            <img src={comment.photoUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-1">{comment.user}</p>
            <p className="text-base font-medium text-neutral-900 leading-snug">{comment.text}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onModerateComment(comment.photoId, comment.index, 'rejected')}
              className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-colors"
              title="Rejeitar"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => onModerateComment(comment.photoId, comment.index, 'approved')}
              className="p-4 bg-green-600 text-white rounded-2xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95"
              title="Aprovar"
            >
              <Check className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
