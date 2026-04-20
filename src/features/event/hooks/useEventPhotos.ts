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

    const unsubscribe = subscribeToPosts(eventId, (payload) => {
      if (!mounted) return;
      const { eventType, new: newRecord, old: oldRecord } = payload;

      setPhotos((prev) => {
        if (eventType === 'INSERT') {
          if (newRecord.status === 'approved') {
            return [newRecord, ...prev];
          }
          return prev;
        }

        if (eventType === 'UPDATE') {
          // If status changed from pending to approved, it might not be in 'prev' if it was filtered out
          const exists = prev.some(p => p.id === newRecord.id);
          if (newRecord.status === 'approved') {
            if (exists) {
              return prev.map(p => p.id === newRecord.id ? { ...p, ...newRecord } : p);
            } else {
              return [newRecord, ...prev].sort((a, b) => 
                new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
              );
            }
          } else if (exists) {
            // If it was approved but now is something else, remove it
            return prev.filter(p => p.id !== newRecord.id);
          }
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

  return { photos, loading };
};
