import React from 'react';
import { MessageCircle, Eye } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import type { AppUser } from '../../../../types';

interface InteractionBarProps {
  reactionCounts: Record<string, number>;
  commentCount: number;
  viewsCount: number;
  onReact: (emoji: string) => void;
  reactedUsers: string[];
  user: AppUser | null;
}

export const InteractionBar = React.memo(({
  reactionCounts,
  commentCount,
  viewsCount,
  onReact,
  reactedUsers,
  user
}: InteractionBarProps) => {
  const emojis = ['🔥', '😂', '❤️', '🎸'];

  return (
    <div className="p-3 bg-white/90 backdrop-blur-md border-t border-neutral-50 flex flex-col gap-2">
      {/* Emojis row */}
      <div className="grid grid-cols-4 gap-1 w-full">
        {emojis.map((emoji) => {
          const count = reactionCounts[emoji] || 0;
          const hasReacted = user ? reactedUsers.includes(`${user.id}_${emoji}`) : false;
          
          return (
            <button
              key={emoji}
              onClick={(e) => {
                e.stopPropagation();
                onReact(emoji);
              }}
              className={cn(
                "flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-black transition-all border cursor-pointer gap-0.5",
                hasReacted
                  ? "bg-neutral-100 border-neutral-200 text-neutral-600 scale-105 shadow-sm"
                  : "bg-neutral-50 border-neutral-100 text-neutral-400 hover:bg-neutral-100"
              )}
            >
              <span className="text-sm leading-none">{emoji}</span>
              <span className={cn(
                "text-[9px] font-bold leading-none",
                hasReacted ? "text-neutral-600" : "text-neutral-400"
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Views and Comments Row */}
      <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400 mt-1">
        <div className="flex items-center gap-1">
          <Eye className="w-3.5 h-3.5 text-neutral-300" />
          <span>{viewsCount} {viewsCount === 1 ? 'view' : 'views'}</span>
        </div>

        <div className="flex items-center gap-1">
          <MessageCircle className="w-3.5 h-3.5 text-neutral-300" />
          <span>{commentCount} {commentCount === 1 ? 'comentário' : 'comentários'}</span>
        </div>
      </div>
    </div>
  );
});
InteractionBar.displayName = 'InteractionBar';