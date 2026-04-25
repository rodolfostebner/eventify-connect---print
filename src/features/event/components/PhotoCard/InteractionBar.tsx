import React from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface InteractionBarProps {
  likes: number;
  hasLiked: boolean;
  commentCount: number;
  onLike: (e: React.MouseEvent) => void;
}

export const InteractionBar = React.memo(({
  likes,
  hasLiked,
  commentCount,
  onLike
}: InteractionBarProps) => {
  return (
    <div className="p-3 flex items-center gap-4 bg-white/80 backdrop-blur-md">
      <button
        onClick={onLike}
        aria-label="Curtir foto"
        className={cn(
          "flex items-center gap-1.5 text-xs font-black transition-all active:scale-95",
          hasLiked ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600"
        )}
      >
        <span className="text-sm">🔥</span>
        {likes}
      </button>

      <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-400">
        <MessageCircle className="w-4 h-4" />
        {commentCount}
      </div>
    </div>
  );
});