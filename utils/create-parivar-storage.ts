import AsyncStorage from '@react-native-async-storage/async-storage';

export type CreateParivarStep = 1 | 2;

export type CreateParivarMemberDraft = {
  id: string;
  name: string;
  dob?: string;
  gender?: string;
  bloodGroup?: string;
  relationship?: string;
  medicalConditions?: string[];
  userId?: string;
  phoneNumber?: string;
};

export type CreateParivarProgress = {
  step: CreateParivarStep;
  familyId?: string;
  familyName?: string;
  members?: CreateParivarMemberDraft[];
  lastUpdated: number;
};

const STORAGE_KEY = 'parivaros.create-parivar-progress';

export async function getCreateParivarProgress(): Promise<CreateParivarProgress | null> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }
    const parsed = JSON.parse(stored) as CreateParivarProgress | null;
    if (!parsed) {
      return null;
    }
    return parsed;
  } catch (error) {
    console.warn('[CreateParivarStorage] Failed to read progress', error);
    return null;
  }
}

export async function saveCreateParivarProgress(
  progress: Omit<CreateParivarProgress, 'lastUpdated'>
): Promise<void> {
  try {
    const payload: CreateParivarProgress = {
      ...progress,
      lastUpdated: Date.now(),
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('[CreateParivarStorage] Failed to persist progress', error);
  }
}

export async function clearCreateParivarProgress(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('[CreateParivarStorage] Failed to clear progress', error);
  }
}
