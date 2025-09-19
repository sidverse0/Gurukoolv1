'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Video } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Video[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load favorites from Firestore
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setIsLoaded(true);
      return;
    }

    setIsLoaded(false);
    const docRef = doc(db, 'favorites', user.uid);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setFavorites(docSnap.data().videos || []);
      } else {
        setFavorites([]);
      }
      setIsLoaded(true);
    }, (error) => {
      console.warn('Could not read favorites from Firestore', error);
      setIsLoaded(true);
    });

    return () => unsubscribe();

  }, [user]);

  // Function to update Firestore
  const updateFirestoreFavorites = async (updatedFavorites: Video[]) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'favorites', user.uid);
      await setDoc(docRef, { videos: updatedFavorites });
    } catch (error) {
      console.warn('Could not save favorites to Firestore', error);
    }
  };

  const addFavorite = useCallback(async (video: Video) => {
    const newFavorites = [...favorites, video];
    setFavorites(prevFavorites => {
      if (prevFavorites.some(fav => fav.video_url === video.video_url)) {
        return prevFavorites;
      }
      return [...prevFavorites, video];
    });
    await updateFirestoreFavorites(newFavorites);
  }, [favorites, user]);

  const removeFavorite = useCallback(async (video: Video) => {
    const newFavorites = favorites.filter(fav => fav.video_url !== video.video_url);
    setFavorites(newFavorites);
    await updateFirestore_Favorites(newFavorites);
  }, [favorites, user]);

  const isFavorite = useCallback(
    (video: Video) => {
      return favorites.some(fav => fav.video_url === video.video_url);
    },
    [favorites]
  );

  return { favorites, addFavorite, removeFavorite, isFavorite, isLoaded };
}
