import { useCallback, useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';

import { firebaseAuth, firebaseDb } from '@/config/firebase';

const DEFAULT_NAME = 'Parivar Friend';

export function useParivarStatus() {
  const [profileName, setProfileName] = useState(DEFAULT_NAME);
  const [hasCreatedParivar, setHasCreatedParivar] = useState(false);
  const [hasJoinedParivar, setHasJoinedParivar] = useState(false);

  const refreshStatus = useCallback(async () => {
    if (!firebaseAuth?.currentUser || !firebaseDb) {
      setProfileName(DEFAULT_NAME);
      setHasCreatedParivar(false);
      setHasJoinedParivar(false);
      return;
    }

    try {
      const snapshot = await getDoc(doc(firebaseDb, 'users', firebaseAuth.currentUser.uid));
      if (snapshot.exists()) {
        const data = snapshot.data() as Record<string, unknown>;
        const resolvedName =
          (data?.name as string | undefined)?.trim() ||
          firebaseAuth.currentUser.displayName ||
          firebaseAuth.currentUser.email?.split('@')[0] ||
          DEFAULT_NAME;
        setProfileName(resolvedName);

        const created = Array.isArray((data as { createdParivarIds?: unknown[] }).createdParivarIds)
          ? ((data as { createdParivarIds?: unknown[] }).createdParivarIds as unknown[])
          : (data as { createdParivarId?: unknown }).createdParivarId
            ? [(data as { createdParivarId?: unknown }).createdParivarId as unknown]
            : [];

        const joined = Array.isArray((data as { parivarIds?: unknown[] }).parivarIds)
          ? ((data as { parivarIds?: unknown[] }).parivarIds as unknown[])
          : Array.isArray((data as { families?: unknown[] }).families)
            ? ((data as { families?: unknown[] }).families as unknown[])
            : [];

        setHasCreatedParivar(created.length > 0);
        setHasJoinedParivar(joined.length > 0);
      } else {
        setProfileName(DEFAULT_NAME);
        setHasCreatedParivar(false);
        setHasJoinedParivar(false);
      }
    } catch (error) {
      console.warn('Failed to load parivar status', error);
      setProfileName(DEFAULT_NAME);
      setHasCreatedParivar(false);
      setHasJoinedParivar(false);
    }
  }, []);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  return {
    profileName,
    hasCreatedParivar,
    hasJoinedParivar,
    refreshStatus,
  };
}

