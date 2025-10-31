import { useCallback, useEffect, useState } from 'react';
import { doc, getDoc, Timestamp } from 'firebase/firestore';

import { firebaseAuth, firebaseDb } from '@/config/firebase';
import type { CreateParivarMemberDraft } from '@/utils/create-parivar-storage';

const DEFAULT_NAME = 'Parivar Friend';

export type LatestFamilyDraft = {
  familyId: string;
  familyName?: string;
  members?: CreateParivarMemberDraft[];
  updatedAt?: number;
};

export type PrimaryFamilyInfo = {
  id?: string;
  name: string;
  relationship?: string;
};

export function useParivarStatus() {
  const [profileName, setProfileName] = useState(DEFAULT_NAME);
  const [hasCreatedParivar, setHasCreatedParivar] = useState(false);
  const [hasJoinedParivar, setHasJoinedParivar] = useState(false);
  const [latestFamilyDraft, setLatestFamilyDraft] = useState<LatestFamilyDraft | null>(null);
  const [primaryFamily, setPrimaryFamily] = useState<PrimaryFamilyInfo | null>(null);

  const refreshStatus = useCallback(async () => {
    if (!firebaseAuth?.currentUser || !firebaseDb) {
      setProfileName(DEFAULT_NAME);
      setHasCreatedParivar(false);
      setHasJoinedParivar(false);
      setLatestFamilyDraft(null);
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

        const familiesRaw = Array.isArray((data as { families?: unknown[] }).families)
          ? ((data as { families?: unknown[] }).families as unknown[])
          : [];
        const normalizedFamilies = familiesRaw.filter((entry) => entry && typeof entry === 'object') as Array<
          Record<string, unknown>
        >;
        const primaryEntry =
          normalizedFamilies.find((family) =>
            typeof family.relationship === 'string' && family.relationship.toLowerCase() === 'self'
          ) || normalizedFamilies[0];
        if (primaryEntry && typeof primaryEntry.name === 'string') {
          setPrimaryFamily({
            id: typeof primaryEntry.id === 'string' ? primaryEntry.id : undefined,
            name: primaryEntry.name,
            relationship:
              typeof primaryEntry.relationship === 'string' ? primaryEntry.relationship : undefined,
          });
        } else {
          setPrimaryFamily(null);
        }

        const rawDraft = (data as { latestFamilyDraft?: unknown }).latestFamilyDraft;
        if (rawDraft && typeof rawDraft === 'object' && rawDraft !== null) {
          const draft = rawDraft as Record<string, unknown>;
          const familyId = typeof draft.familyId === 'string' ? draft.familyId : undefined;
          if (familyId) {
            const familyName = typeof draft.familyName === 'string' ? draft.familyName : undefined;
            const members = Array.isArray(draft.members)
              ? (draft.members.filter((member) => !!member && typeof member === 'object') as CreateParivarMemberDraft[])
              : undefined;
            const updatedAt =
              draft.updatedAt instanceof Timestamp
                ? draft.updatedAt.toMillis()
                : typeof draft.updatedAt === 'number'
                  ? draft.updatedAt
                  : undefined;

            setLatestFamilyDraft({
              familyId,
              familyName,
              members,
              updatedAt,
            });
          } else {
            setLatestFamilyDraft(null);
          }
        } else {
          setLatestFamilyDraft(null);
        }
      } else {
        setProfileName(DEFAULT_NAME);
        setHasCreatedParivar(false);
        setHasJoinedParivar(false);
        setLatestFamilyDraft(null);
        setPrimaryFamily(null);
      }
    } catch (error) {
      console.warn('Failed to load parivar status', error);
      setProfileName(DEFAULT_NAME);
      setHasCreatedParivar(false);
      setHasJoinedParivar(false);
      setLatestFamilyDraft(null);
      setPrimaryFamily(null);
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
    latestFamilyDraft,
    primaryFamily,
  };
}
