
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Video } from '@/lib/types';

const FAVORITES_KEY = 'edustream_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Video[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(FAVORITES_KEY);
      if (item) {
        setFavorites(JSON.parse(item));
      }
    } catch (error) {
      console.warn('Could not read favorites from localStorage', error);
      setFavorites([]);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      } catch (error) {
        console.warn('Could not save favorites to localStorage', error);
      }
    }
  }, [favorites, isLoaded]);

  const addFavorite = useCallback((video: Video) => {
    setFavorites(prevFavorites => {
      // Avoid adding duplicates
      if (prevFavorites.some(fav => fav.video_url === video.video_url)) {
        return prevFavorites;
      }
      return [...prevFavorites, video];
    });
  }, []);

  const removeFavorite = useCallback((video: Video) => {
    setFavorites(prevFavorites =>
      prevFavorites.filter(fav => fav.video_url !== video.video_url)
    );
  }, []);

  const isFavorite = useCallback(
    (video: Video) => {
      return favorites.some(fav => fav.video_url === video.video_url);
    },
    [favorites]
  );

  return { favorites, addFavorite, removeFavorite, isFavorite, isLoaded };
}
