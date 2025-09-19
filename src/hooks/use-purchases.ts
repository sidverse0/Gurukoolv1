
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export function usePurchases() {
  const { user } = useAuth();
  const [purchasedBatchIds, setPurchasedBatchIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      setPurchasedBatchIds([]);
      setIsLoaded(true);
      return;
    }

    setIsLoaded(false);
    const paymentsRef = collection(db, 'payments');
    const q = query(
      paymentsRef,
      where('userId', '==', user.uid),
      where('status', '==', 'successful')
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const batchIds: string[] = [];
        querySnapshot.forEach((doc) => {
          if (!batchIds.includes(doc.data().batchId)) {
            batchIds.push(doc.data().batchId);
          }
        });
        setPurchasedBatchIds(batchIds);
        setIsLoaded(true);
      },
      (error) => {
        console.warn('Could not read purchases from Firestore', error);
        setIsLoaded(true);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { purchasedBatchIds, isLoaded };
}
