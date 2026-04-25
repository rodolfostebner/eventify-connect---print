import { useState, useEffect } from 'react';
import { fetchAllPosts, subscribeToAllPosts } from '../../../services/posts';
import type { PhotoData } from '../../../types';

export const useModerationPhotos = (eventId: string | undefined) => {
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    let mounted = true;

    const loadPhotos = async () => {
      try {
        const data = await fetchAllPosts(eventId);
        if (mounted) {
          setPhotos(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching all posts:', err);
        if (mounted) setLoading(false);
      }
    };

    loadPhotos();

    const unsubscribe = subscribeToAllPosts(eventId, () => {
      if (!mounted) return;
      loadPhotos();
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [eventId]);

  return { photos, setPhotos, loading };
};
