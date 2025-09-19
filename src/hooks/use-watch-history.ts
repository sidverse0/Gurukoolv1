
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Video } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const MAX_HISTORY_LENGTH = 10;

export function useWatchHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<Video[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load history from Firestore
  useEffect(() => {
    if (!user) {
      setHistory([]);
      setIsLoaded(true);
      return;
    }

    setIsLoaded(false);
    const docRef = doc(db, 'watchHistory', user.uid);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setHistory(docSnap.data().videos || []);
      } else {
        setHistory([]);
      }
      setIsLoaded(true);
    }, (error) => {
      console.warn('Could not read watch history from Firestore', error);
      setIsLoaded(true);
    });

    return () => unsubscribe();

  }, [user]);

  // Function to update Firestore
  const updateFirestoreHistory = async (updatedHistory: Video[]) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'watchHistory', user.uid);
      await setDoc(docRef, { videos: updatedHistory });
    } catch (error) {
      console.warn('Could not save watch history to Firestore', error);
    }
  };

  const addToHistory = useCallback(async (video: Video) => {
    if (!user) return;
    
    setHistory(prevHistory => {
      // Remove the video if it already exists to move it to the front
      const filteredHistory = prevHistory.filter(v => v.video_url !== video.video_url);
      
      // Add the new video to the beginning of the array
      const newHistory = [video, ...filteredHistory];
      
      // Trim the history to the max length
      const trimmedHistory = newHistory.slice(0, MAX_HISTORY_LENGTH);

      // Update Firestore asynchronously
      updateFirestoreHistory(trimmedHistory);
      
      return trimmedHistory;
    });
  }, [user]);


  return { history, addToHistory, isLoaded };
}
