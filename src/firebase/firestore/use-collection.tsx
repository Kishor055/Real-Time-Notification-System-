
'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  collection, 
  onSnapshot, 
  Query, 
  DocumentData, 
  query, 
  orderBy, 
  limit as firestoreLimit 
} from 'firebase/firestore';
import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useCollection<T = DocumentData>(
  collectionPath: string,
  options?: {
    orderByField?: string;
    orderDirection?: 'asc' | 'desc';
    limitCount?: number;
  }
) {
  const db = useFirestore();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !collectionPath) return;

    let q = query(collection(db, collectionPath));
    
    if (options?.orderByField) {
      q = query(q, orderBy(options.orderByField, options.orderDirection || 'desc'));
    }
    
    if (options?.limitCount) {
      q = query(q, firestoreLimit(options.limitCount));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as T));
        setData(items);
        setLoading(false);
      },
      async (error) => {
        const permissionError = new FirestorePermissionError({
          path: collectionPath,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db, collectionPath, JSON.stringify(options)]);

  return { data, loading };
}
