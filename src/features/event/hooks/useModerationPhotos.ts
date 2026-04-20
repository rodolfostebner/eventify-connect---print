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

    const unsubscribe = subscribeToAllPosts(eventId, (payload) => {
      if (!mounted) return;
      const { eventType, new: newRecord, old: oldRecord } = payload;

      setPhotos((prev) => {
        if (eventType === 'INSERT') {
          return [newRecord, ...prev];
        }
        if (eventType === 'UPDATE') {
          return prev.map(p => p.id === newRecord.id ? { ...p, ...newRecord } : p);
        }
        if (eventType === 'DELETE') {
          return prev.filter(p => p.id !== oldRecord.id);
        }
        return prev;
      });
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [eventId]);

  return { photos, setPhotos, loading };
};
