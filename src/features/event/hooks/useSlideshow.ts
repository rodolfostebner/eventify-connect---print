import { useState, useEffect } from 'react';
import type { PhotoData } from '../../../types';

export const useSlideshow = (categoryGroups: { title: string; photos: PhotoData[] }[]) => {
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    if (categoryGroups.length === 0) return;

    if (currentGroupIndex >= categoryGroups.length) {
      setCurrentGroupIndex(0);
      setCurrentPhotoIndex(0);
      return;
    }
    const currentGroup = categoryGroups[currentGroupIndex];
    if (currentPhotoIndex >= currentGroup.photos.length) {
      setCurrentPhotoIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentPhotoIndex((prevPhoto) => {
        const group = categoryGroups[currentGroupIndex];
        if (!group || !group.photos) return 0;
        if (prevPhoto + 1 < group.photos.length) {
          return prevPhoto + 1;
        } else {
          setCurrentGroupIndex((prevGroup) => (prevGroup + 1) % categoryGroups.length);
          return 0;
        }
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [categoryGroups, currentGroupIndex, currentPhotoIndex]);

  const setPhotoIndex = (groupIndex: number, photoIndex: number) => {
    setCurrentGroupIndex(groupIndex);
    setCurrentPhotoIndex(photoIndex);
  };

  return {
    currentGroupIndex,
    currentPhotoIndex,
    setCurrentPhotoIndex,
    setCurrentGroupIndex,
    setPhotoIndex
  };
};
