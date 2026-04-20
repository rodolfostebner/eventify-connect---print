import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { createPost } from '../../../services/posts';
import type { EventData } from '../../../types';
import { User } from '../../../services/authService';
import { supabase } from '../../../lib/supabase/client';
import { uploadImage } from '../../../services/storageService';

export const usePhotoUpload = (event: EventData, user: User | null) => {
  const [uploading, setUploading] = useState(false);

  const handleDirectUpload = useCallback(async (file: File) => {
    if (event.interactions_paused) return;
    const toastId = toast.loading('Processando sua foto...');
    setUploading(true);

    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('O arquivo selecionado não é uma imagem.');
      }

      // 1. Process/Compress image
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1200; // Increased slightly for better quality
            const MAX_HEIGHT = 1200;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              // Fill background to white for JPEGs (prevents transparency turning black)
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, width, height);
              ctx.drawImage(img, 0, 0, width, height);
            }

            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            resolve(dataUrl);
          };
          img.onerror = reject;
          img.src = e.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // 2. Upload to Cloudflare R2 via Edge Function
      const blob = await (await fetch(base64)).blob();
      const fileExt = blob.type === 'image/png' ? 'png' : 'jpg';
      const fileToUpload = new File([blob], `${user?.uid || 'anon'}_${Date.now()}.${fileExt}`, { type: blob.type });
      
      const publicUrl = await uploadImage(fileToUpload);

      // 3. Save to Database
      await createPost({
        eventId: event.id,
        url: publicUrl, // Use storage URL instead of base64
        user_name: user?.displayName || 'Anônimo',
        firebase_uid: user?.uid,
        status: 'approved' // Auto-approve for now if moderation not enabled on event?
      });

      toast.success('Foto enviada!', { id: toastId });
    } catch (err: any) {
      console.error('Erro no upload:', err);
      toast.error(err.message || 'Erro ao enviar foto.', { id: toastId });
    } finally {
      setUploading(false);
    }
  }, [event.id, event.interactions_paused, user]);

  return { uploading, handleDirectUpload };
};
