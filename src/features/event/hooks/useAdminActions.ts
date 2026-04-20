import { useState } from 'react';
import { toast } from 'sonner';
import { updatePostStatus, createPost } from '../../../services/posts';
import { supabase } from '../../../lib/supabase/client';
import { createNotification } from '../../../services/notificationService';
import type { PhotoData, EventData } from '../../../types';

export const useAdminActions = (event: EventData | null) => {
  const [uploading, setUploading] = useState(false);

  const handleApprovePhoto = async (photo: PhotoData) => {
    try {
      await updatePostStatus(photo.id, 'approved');
      toast.success('Foto aprovada!');
      
      // Notify user if possible (requires user_id or firebase_uid)
      const userId = photo.firebase_uid || (photo as any).user_id;
      if (userId && event) {
        await createNotification({
          userId: userId,
          title: 'Foto Aprovada!',
          body: 'Sua foto foi aprovada e já está na galeria do evento.',
          link: `/${event.slug}`,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro ao aprovar foto.');
    }
  };

  const handleRejectPhoto = async (id: string) => {
    try {
      await updatePostStatus(id, 'rejected');
      toast.success('Foto rejeitada!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao rejeitar foto.');
    }
  };

  const handleOfficialUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !event?.id || !supabase) return;
    
    setUploading(true);
    let successCount = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${event.id}/official_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `photos/${fileName}`;

        // 1. Upload to Storage
        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(filePath);

        // 3. Create Post Record
        await createPost({
          eventId: event.id,
          url: publicUrl,
          user_name: 'Equipe Oficial',
          firebase_uid: 'admin',
          status: 'approved',
          is_official: true,
          likes: 0,
          comments: []
        });
        
        successCount++;
      }
      toast.success(`${successCount} fotos oficiais enviadas!`);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao fazer upload das fotos oficiais.');
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    handleApprovePhoto,
    handleRejectPhoto,
    handleOfficialUpload
  };
};
