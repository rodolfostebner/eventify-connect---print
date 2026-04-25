import { useState, useEffect } from 'react';
import { fetchPosts, subscribeToPosts } from '../../../services/posts';
import type { PhotoData } from '../../../types';

export const useEventPhotos = (eventId: string) => {
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadInitialPosts = async () => {
      try {
        const initialPhotos = await fetchPosts(eventId);
        if (mounted) {
          setPhotos(initialPhotos);
          setLoading(false);
        }
      } catch (err) {
        console.error('Initial fetch error:', err);
        if (mounted) setLoading(false);
      }
    };

    loadInitialPosts();

    const unsubscribe = subscribeToPosts(eventId, () => {
      if (!mounted) return;
      loadInitialPosts();
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [eventId]);

  return { photos, loading };
};
