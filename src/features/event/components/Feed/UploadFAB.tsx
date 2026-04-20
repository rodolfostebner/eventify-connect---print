import React from 'react';
import { Camera, Loader2 } from 'lucide-react';
import type { EventData } from '../../../../types';
import { cn } from '../../../../lib/utils';

interface UploadFABProps {
  event: EventData;
  uploading: boolean;
  onFabClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const UploadFAB = ({
  event,
  uploading,
  onFabClick,
  fileInputRef,
  onFileSelect
}: UploadFABProps) => {
  if (event.interactions_paused) return null;

  return (
    <>
      <input
        type="file"
        accept="image/*"
        capture={event.upload_source === 'camera' ? 'environment' : undefined}
        className="hidden"
        ref={fileInputRef}
        onChange={onFileSelect}
      />

      <div className="fixed bottom-8 right-8 z-[60]">
        <button
          onClick={onFabClick}
          disabled={uploading}
          className="w-16 h-16 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 disabled:opacity-50 group"
          style={{ 
            backgroundColor: event.primary_color || '#171717',
            boxShadow: `0 20px 40px -10px ${(event.primary_color || '#171717')}66`
          }}
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <Camera className="w-8 h-8" />
          )}
        </button>
      </div>
    </>
  );
};
