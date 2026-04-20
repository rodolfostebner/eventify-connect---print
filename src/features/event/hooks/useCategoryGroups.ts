import { useMemo } from 'react';
import type { EventData, PhotoData } from '../../../types';

export const useCategoryGroups = (photos: PhotoData[], event: EventData) => {
  return useMemo(() => {
    const approved = photos.filter(p => p.status === 'approved' && !p.is_official);
    const official = photos.filter(p => p.status === 'approved' && p.is_official);
    if (approved.length === 0 && official.length === 0) return [];

    const categories: { title: string; photos: PhotoData[] }[] = [];

    const mostLiked = [...approved]
      .filter(p => (p.likes || 0) > 0)
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 5);
    if (mostLiked.length > 0) {
      categories.push({ title: 'Mais Curtida ❤️', photos: mostLiked });
    }

    const mostFunny = [...approved]
      .filter(p => (p.reactions?.['😂'] || 0) > 0)
      .sort((a, b) => (b.reactions?.['😂'] || 0) - (a.reactions?.['😂'] || 0))
      .slice(0, 5);
    if (mostFunny.length > 0) {
      categories.push({ title: 'Mais Divertida 😂', photos: mostFunny });
    }

    const specialMoment = [...approved]
      .filter(p => (p.reactions?.['✨'] || 0) > 0)
      .sort((a, b) => (b.reactions?.['✨'] || 0) - (a.reactions?.['✨'] || 0))
      .slice(0, 5);
    if (specialMoment.length > 0) {
      categories.push({ title: 'Momento Especial ✨', photos: specialMoment });
    }

    const mostCommented = [...approved]
      .filter(p => (p.comments?.filter(c => c.status === 'approved' && !(c as any).deleted).length || 0) > 0)
      .sort((a, b) => (b.comments?.filter(c => c.status === 'approved' && !(c as any).deleted).length || 0) - (a.comments?.filter(c => c.status === 'approved' && !(c as any).deleted).length || 0))
      .slice(0, 5);
    if (mostCommented.length > 0) {
      categories.push({ title: 'Mais Comentada 💬', photos: mostCommented });
    }

    if (event.has_official_photos && official.length > 0) {
      const bestOfficial = [...official]
        .filter(p => (p.likes || 0) > 0)
        .sort((a, b) => (b.likes || 0) - (a.likes || 0))
        .slice(0, 5);
      if (bestOfficial.length > 0) {
        categories.push({ title: 'Melhor Foto Oficial 📸', photos: bestOfficial });
      }
    }

    return categories;
  }, [photos, event.has_official_photos]);
};
