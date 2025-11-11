import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { ArrowLeft, Check, Edit3, Plus, Trash2, UserRound } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import {
  arrayUnion,
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { Fragment, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Input, Spinner, Text, XStack, YStack } from 'tamagui';

import { ThemePreferenceContext } from '@/app/_layout';
import { firebaseAuth, firebaseDb } from '@/config/firebase';
import { ThemeColors, accentPalette } from '@/constants/tamagui-theme';
import { BrandSpacing, BrandTypography } from '@/design-system';
import { FamilyTreeIllustration } from '@/design-system/illustrations';
import { withAlpha } from '@/utils/color';
import { responsiveFont } from '@/utils/responsive-font';
import {
  CreateParivarMemberDraft,
  CreateParivarProgress,
  CreateParivarStep,
  clearCreateParivarProgress,
  getCreateParivarProgress,
  saveCreateParivarProgress,
} from '@/utils/create-parivar-storage';

type UserProfile = {
  name?: string;
  dob?: string;
  medicalHistory?: string[];
  gender?: string;
  bloodGroup?: string;
};

type MemberFormState = {
  name: string;
  relationship: string;
  gender: string;
  bloodGroup: string;
  dob: string;
  dobDate: Date | null;
  medicalConditions: string;
  phoneNumber: string;
};

const relationshipOptions = [
  'Spouse',
  'Child',
  'Parent',
  'Sibling',
  'Grandparent',
  'Grandchild',
  'Relative',
  'Friend',
  'Caregiver',
  'Other',
];

const genderOptions = ['Female', 'Male', 'Non-binary', 'Prefer not to say'];
const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const medicalOptions = ['None', 'Diabetes', 'Hypertension', 'Asthma', 'Allergies', 'Heart Conditions'];
const defaultMedicalSelections = medicalOptions[0];
const defaultPhoneCountryCode = '+91';

const steps = [
  {
    id: 1 as CreateParivarStep,
    label: 'Parivar name',
  },
  {
    id: 2 as CreateParivarStep,
    label: 'Family members',
  },
];

function createEmptyMemberForm(): MemberFormState {
  return {
    name: '',
    relationship: '',
    gender: '',
    bloodGroup: '',
    dob: '',
    dobDate: null,
    medicalConditions: defaultMedicalSelections,
    phoneNumber: '',
  };
}

function formatDate(date: Date) {
  const adjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  return adjusted.toISOString().split('T')[0];
}

function parseDateString(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

function getAgeFromDate(value?: string) {
  if (!value) return '';
  const birthDate = parseDateString(value);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

function generateMemberId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function extractLocalPhone(value?: string) {
  if (!value) {
    return '';
  }
  const normalized = value.replace(/\s+/g, '');
  const withoutCode = normalized.startsWith(defaultPhoneCountryCode)
    ? normalized.slice(defaultPhoneCountryCode.length)
    : normalized.startsWith('+')
      ? normalized.slice(1)
      : normalized;
  return withoutCode.replace(/\D/g, '');
}

function mapDraftMembers(value: unknown): CreateParivarMemberDraft[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const normalized = value
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }
      const raw = item as Record<string, unknown>;
      const id = typeof raw.id === 'string' ? raw.id : undefined;
      const name = typeof raw.name === 'string' ? raw.name : undefined;
      if (!id || !name) {
        return null;
      }
      const relationship = typeof raw.relationship === 'string' ? raw.relationship : undefined;
      const gender = typeof raw.gender === 'string' ? raw.gender : undefined;
      const bloodGroup = typeof raw.bloodGroup === 'string' ? raw.bloodGroup : undefined;
      const dob = typeof raw.dob === 'string' ? raw.dob : undefined;
      const medicalConditions = Array.isArray(raw.medicalConditions)
        ? (raw.medicalConditions.filter((value) => typeof value === 'string') as string[])
        : undefined;
      const phoneNumber = typeof raw.phoneNumber === 'string' ? raw.phoneNumber : undefined;

      const member: CreateParivarMemberDraft = {
        id,
        name,
      };
      if (relationship) {
        member.relationship = relationship;
      }
      if (gender) {
        member.gender = gender;
      }
      if (bloodGroup) {
        member.bloodGroup = bloodGroup;
      }
      if (dob) {
        member.dob = dob;
      }
      if (medicalConditions && medicalConditions.length > 0) {
        member.medicalConditions = medicalConditions;
      }
      if (phoneNumber) {
        member.phoneNumber = phoneNumber;
      }
      return member;
    })
    .filter(Boolean) as CreateParivarMemberDraft[];

  return normalized.length > 0 ? normalized : undefined;
}

export default function CreateParivarScreen() {
  const router = useRouter();
  const { themeName } = useContext(ThemePreferenceContext);
  const palette = ThemeColors[themeName];
  const accentSpectrum = accentPalette[themeName];
  const colors = useMemo(() => {
    const accentSoft = withAlpha(palette.accent, themeName === 'dark' ? 0.3 : 0.16);
    return {
      background: palette.surface,
      card: palette.surface,
      accent: palette.accent,
      accentSoft,
      accentFaint: withAlpha(palette.accent, themeName === 'dark' ? 0.18 : 0.12),
      text: palette.text,
      muted: palette.subtleText,
      surface: palette.surfaceAlt,
      avatar: withAlpha(accentSpectrum[themeName === 'dark' ? 6 : 3], themeName === 'dark' ? 0.28 : 0.18),
      field: palette.inputBackground,
      shadow: palette.elevatedShadow,
      border: palette.border,
    };
  }, [accentSpectrum, palette, themeName]);

  const user = firebaseAuth?.currentUser;
  const [hydrating, setHydrating] = useState(true);
  const [step, setStep] = useState<CreateParivarStep>(1);
  const [familyName, setFamilyName] = useState('');
  const [familyId, setFamilyId] = useState<string | undefined>();
  const [members, setMembers] = useState<CreateParivarMemberDraft[]>([]);
  const [familyNameBusy, setFamilyNameBusy] = useState(false);
  const [familyNameError, setFamilyNameError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [memberForm, setMemberForm] = useState<MemberFormState>(() => createEmptyMemberForm());
  const [memberSaving, setMemberSaving] = useState(false);
  const [memberDobPickerVisible, setMemberDobPickerVisible] = useState(false);
  const [memberTempDob, setMemberTempDob] = useState<Date>(new Date(1990, 0, 1));
  const [finalizing, setFinalizing] = useState(false);
  const [showInlineMemberForm, setShowInlineMemberForm] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [isEditingFamilyName, setIsEditingFamilyName] = useState(false);
  const [familyNameDraft, setFamilyNameDraft] = useState('');
  const [selectionPicker, setSelectionPicker] = useState<
    { type: 'relationship' | 'gender' | 'blood'; tempValue: string }
  >();

  useEffect(() => {
    let isActive = true;

    const hydrate = async () => {
      if (!firebaseDb || !user) {
        if (isActive) {
          setHydrating(false);
        }
        return;
      }

      try {
        const userRef = doc(firebaseDb, 'users', user.uid);
        const [profileSnapshot, storedProgress] = await Promise.all([
          getDoc(userRef),
          getCreateParivarProgress(),
        ]);

        if (!isActive) {
          return;
        }

        let localProgress = storedProgress;

        if (profileSnapshot.exists()) {
          const data = profileSnapshot.data() as Record<string, unknown>;
          setUserProfile({
            name: typeof data.name === 'string' ? data.name : undefined,
            dob: typeof data.dob === 'string' ? data.dob : undefined,
            gender: typeof data.gender === 'string' ? data.gender : undefined,
            medicalHistory: Array.isArray(data.medicalHistory)
              ? (data.medicalHistory as string[])
              : undefined,
            bloodGroup: typeof data.bloodGroup === 'string' ? data.bloodGroup : undefined,
          });

          if (!localProgress?.familyId) {
            const rawDraft = (data as { latestFamilyDraft?: unknown }).latestFamilyDraft;
            if (rawDraft && typeof rawDraft === 'object' && rawDraft !== null) {
              const { familyId: rawFamilyId, familyName: rawFamilyName, members: rawMembers } = rawDraft as {
                familyId?: unknown;
                familyName?: unknown;
                members?: unknown;
              };
              const draftFamilyId =
                typeof rawFamilyId === 'string' ? rawFamilyId : undefined;
              if (draftFamilyId) {
                const draftFamilyName =
                  typeof rawFamilyName === 'string' ? rawFamilyName : undefined;
                const draftMembers = mapDraftMembers(rawMembers);
                const remoteProgress: CreateParivarProgress = {
                  step: 2,
                  familyId: draftFamilyId,
                  familyName: draftFamilyName,
                  members: draftMembers,
                  lastUpdated: Date.now(),
                };
                await saveCreateParivarProgress({
                  step: remoteProgress.step,
                  familyId: remoteProgress.familyId,
                  familyName: remoteProgress.familyName,
                  members: remoteProgress.members,
                });
                localProgress = remoteProgress;
              }
            }
          }
        }

        if (localProgress?.familyId) {
          setFamilyId(localProgress.familyId);
          if (localProgress.familyName) {
            setFamilyName(localProgress.familyName);
          }
          if (localProgress.step) {
            setStep(localProgress.step);
          }
          if (Array.isArray(localProgress.members) && localProgress.members.length > 0) {
            setMembers(localProgress.members);
          }

          try {
            const familySnapshot = await getDoc(doc(firebaseDb, 'families', localProgress.familyId));
            if (familySnapshot.exists()) {
              const data = familySnapshot.data() as Record<string, unknown>;
              if (typeof data.name === 'string') {
                setFamilyName(data.name);
              }
              if (Array.isArray(data.members)) {
                setMembers(data.members as CreateParivarMemberDraft[]);
              } else if (Array.isArray(localProgress.members)) {
                setMembers(localProgress.members);
              }
            } else if (Array.isArray(localProgress.members)) {
              setMembers(localProgress.members);
            }
          } catch (error) {
            console.warn('Unable to hydrate family data from Firestore', error);
            if (Array.isArray(localProgress.members)) {
              setMembers(localProgress.members);
            }
          }
        }
      } catch (error) {
        console.warn('Failed to hydrate create parivar screen', error);
      } finally {
        if (isActive) {
          setHydrating(false);
        }
      }
    };

    void hydrate();

    return () => {
      isActive = false;
    };
  }, [user]);

  const ownerMember = useMemo<CreateParivarMemberDraft>(() => {
    if (!user) {
      return {
        id: 'self',
        name: 'You',
        relationship: 'Self',
      };
    }

    return {
      id: user.uid,
      name:
        userProfile?.name ||
        user.displayName ||
        user.email?.split('@')[0] ||
        'You',
      relationship: 'Self',
      dob: userProfile?.dob,
      gender: userProfile?.gender,
      bloodGroup: userProfile?.bloodGroup,
      medicalConditions:
        userProfile?.medicalHistory && userProfile.medicalHistory.length > 0
          ? userProfile.medicalHistory
          : undefined,
      userId: user.uid,
      phoneNumber: user.phoneNumber ?? undefined,
    };
  }, [user, userProfile]);

  const sanitizeFamilyMembers = (members: CreateParivarMemberDraft[]) =>
    members.map((member) => {
      const payload: Record<string, unknown> = {
        id: member.id,
        name: member.name,
        relationship: member.relationship ?? 'Family',
      };
      if (member.gender) {
        payload.gender = member.gender;
      }
      if (member.bloodGroup) {
        payload.bloodGroup = member.bloodGroup;
      }
      if (member.dob) {
        payload.dob = member.dob;
      }

      const normalizedMedical =
        Array.isArray(member.medicalConditions)
          ? member.medicalConditions.filter((value) => !!value)
          : typeof member.medicalConditions === 'string'
            ? member.medicalConditions
                .split(',')
                .map((value) => value.trim())
                .filter((value) => value.length > 0)
            : undefined;
      if (normalizedMedical && normalizedMedical.length > 0) {
        payload.medicalConditions = normalizedMedical;
      }

      if (member.userId) {
        payload.userId = member.userId;
      }
      if (member.phoneNumber) {
        payload.phoneNumber = member.phoneNumber;
      }
      return payload;
    });

  const ensureOwnerMember = useCallback(
    (incoming: CreateParivarMemberDraft[]) => {
      if (!incoming.length) {
        return [ownerMember];
      }
      const hasOwner = incoming.some(
        (member) => member.id === ownerMember.id || member.userId === ownerMember.userId
      );
      if (hasOwner) {
        return incoming;
      }
      return [ownerMember, ...incoming];
    },
    [ownerMember]
  );

  useEffect(() => {
    if (step === 2) {
      setMembers((existing) => ensureOwnerMember(existing));
    }
  }, [ensureOwnerMember, step]);

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleSaveFamilyName = useCallback(async () => {
    if (!firebaseDb || !user) {
      Alert.alert(
        'Unable to create Parivar',
        'Please sign in again before starting your Parivar.'
      );
      return;
    }

    const rawValue = familyId && isEditingFamilyName ? familyNameDraft : familyName;
    const trimmed = rawValue.trim();
    if (!trimmed) {
      setFamilyNameError('Give your Parivar a joyful name.');
      return;
    }

    try {
      setFamilyNameBusy(true);
      setFamilyNameError(null);
      const normalized = trimmed
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      if (!normalized) {
        setFamilyNameError('Choose a name using letters or numbers.');
        setFamilyNameBusy(false);
        return;
      }

      const familiesRef = collection(firebaseDb, 'families');
      const duplicateQuery = query(
        familiesRef,
        where('normalizedName', '==', normalized),
        limit(1)
      );
      const duplicateSnapshot = await getDocs(duplicateQuery);
      const duplicateDocId = duplicateSnapshot.empty ? undefined : duplicateSnapshot.docs[0].id;

      if (familyId) {
        if (duplicateDocId && duplicateDocId !== familyId) {
          setFamilyNameError(
            'Looks like this Parivar already exists. Try a different name that is uniquely yours.'
          );
          setFamilyNameBusy(false);
          return;
        }

        const familyRef = doc(firebaseDb, 'families', familyId);
        await updateDoc(familyRef, {
          name: trimmed,
          normalizedName: normalized,
          updatedAt: serverTimestamp(),
        });

        const userRef = doc(firebaseDb, 'users', user.uid);
        await setDoc(
          userRef,
          {
            latestFamilyDraft: {
              familyId,
              familyName: trimmed,
              updatedAt: serverTimestamp(),
            },
          },
          { merge: true }
        );

        setFamilyName(trimmed);
        setIsEditingFamilyName(false);
        setFamilyNameDraft('');

        await saveCreateParivarProgress({
          step: 2,
          familyId,
          familyName: trimmed,
          members,
        });
      } else {
        if (duplicateDocId) {
          setFamilyNameError(
            'Looks like this Parivar already exists. Try a different name that is uniquely yours.'
          );
          setFamilyNameBusy(false);
          return;
        }

        const familyDocRef = doc(firebaseDb, 'families', normalized);
        const initialMembers = [ownerMember];
        const serializedMembers = sanitizeFamilyMembers(initialMembers);
        await setDoc(familyDocRef, {
          name: trimmed,
          normalizedName: normalized,
          createdBy: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          members: serializedMembers,
          status: 'draft',
        });

        const userRef = doc(firebaseDb, 'users', user.uid);
        await setDoc(
          userRef,
          {
            latestFamilyDraft: {
              familyId: familyDocRef.id,
              familyName: trimmed,
              members: serializedMembers.map((member) => ({
                id: member.id as string,
                name: member.name as string,
                relationship: member.relationship as string,
              })),
              updatedAt: serverTimestamp(),
            },
          },
          { merge: true }
        );

        setFamilyId(familyDocRef.id);
        setFamilyName(trimmed);
        setMembers(initialMembers);
        setStep(2);
        await saveCreateParivarProgress({
          step: 2,
          familyId: familyDocRef.id,
          familyName: trimmed,
          members: initialMembers,
        });
      }
    } catch (error) {
      console.warn('Failed to create Parivar', error);
      Alert.alert(
        'Unable to create Parivar',
        'Something went wrong while saving your Parivar. Please try again.'
      );
    } finally {
      setFamilyNameBusy(false);
    }
  }, [familyId, familyName, familyNameDraft, isEditingFamilyName, members, ownerMember, user]);

  const openNewMemberForm = useCallback(() => {
    setMemberForm(createEmptyMemberForm());
    setMemberTempDob(new Date(1990, 0, 1));
    setMemberSaving(false);
    setEditingMemberId(null);
    setShowInlineMemberForm(true);
  }, []);

  const openEditMemberForm = useCallback(
    (memberId: string) => {
      const existing = members.find((member) => member.id === memberId);
      if (!existing) return;

      setMemberForm({
        name: existing.name ?? '',
        relationship: existing.relationship ?? '',
        gender: existing.gender ?? '',
        bloodGroup: existing.bloodGroup ?? '',
        dob: existing.dob ?? '',
        dobDate: existing.dob ? parseDateString(existing.dob) : null,
        medicalConditions: Array.isArray(existing.medicalConditions)
          ? existing.medicalConditions.join(', ')
          : existing.medicalConditions
            ? String(existing.medicalConditions)
            : defaultMedicalSelections,
        phoneNumber: extractLocalPhone(existing.phoneNumber),
      });
      setMemberTempDob(existing.dob ? parseDateString(existing.dob) : new Date(1990, 0, 1));
      setMemberSaving(false);
      setEditingMemberId(memberId);
      setShowInlineMemberForm(true);
    },
    [members]
  );

  const cancelMemberForm = useCallback(() => {
    setMemberForm(createEmptyMemberForm());
    setMemberSaving(false);
    setShowInlineMemberForm(false);
    setSelectionPicker(undefined);
    setEditingMemberId(null);
  }, []);

  const startEditingFamilyName = useCallback(() => {
    setFamilyNameDraft(familyName);
    setIsEditingFamilyName(true);
    setFamilyNameError(null);
  }, [familyName]);

  const cancelEditingFamilyName = useCallback(() => {
    setFamilyNameDraft('');
    setIsEditingFamilyName(false);
    setFamilyNameError(null);
  }, []);

  const handleSubmitMember = useCallback(async () => {
    if (!firebaseDb || !user || !familyId) {
      Alert.alert(
        'Unable to add member',
        'Please ensure you are online and signed in.'
      );
      return;
    }

    const name = memberForm.name.trim();
    const relationship = memberForm.relationship.trim();
    const bloodGroup = memberForm.bloodGroup.trim();
    const cleanedPhone = memberForm.phoneNumber.replace(/\D/g, '').trim();

    if (!name) {
      Alert.alert('Almost there', 'Please share the member’s name.');
      return;
    }

    if (!relationship) {
      Alert.alert('Almost there', 'Select how this member is related to you.');
      return;
    }

    try {
      setMemberSaving(true);
      const medicalConditions = memberForm.medicalConditions
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);

      const hydratedMember: CreateParivarMemberDraft = {
        id: editingMemberId ?? generateMemberId(),
        name,
        relationship,
        gender: memberForm.gender || undefined,
        bloodGroup: bloodGroup || undefined,
        dob: memberForm.dob || undefined,
        medicalConditions: medicalConditions.length ? medicalConditions : undefined,
        phoneNumber: cleanedPhone ? `${defaultPhoneCountryCode}${cleanedPhone}` : undefined,
      };

      const memberCollection = editingMemberId
        ? members.map((member) => (member.id === editingMemberId ? hydratedMember : member))
        : [...members, hydratedMember];

      const nextMembers = ensureOwnerMember(memberCollection);
      const serializedMembers = sanitizeFamilyMembers(nextMembers);
      const familyRef = doc(firebaseDb, 'families', familyId);
      await updateDoc(familyRef, {
        members: serializedMembers,
        updatedAt: serverTimestamp(),
      });

      if (hydratedMember.id !== ownerMember.id) {
        const invitedUserRef = doc(firebaseDb, 'users', hydratedMember.id);
        const invitedPayload: Record<string, unknown> = {
          name,
          relationship,
          gender: memberForm.gender || deleteField(),
          bloodGroup: bloodGroup || deleteField(),
          dob: memberForm.dob || deleteField(),
          medicalConditions: medicalConditions.length ? medicalConditions : deleteField(),
          status: 'INVITED',
          familyId,
          invitedBy: user.uid,
          updatedAt: serverTimestamp(),
        };
        if (cleanedPhone) {
          invitedPayload.phoneNumber = `${defaultPhoneCountryCode}${cleanedPhone}`;
        } else if (editingMemberId) {
          invitedPayload.phoneNumber = deleteField();
        }
        if (!editingMemberId) {
          invitedPayload.createdAt = serverTimestamp();
        }
        await setDoc(invitedUserRef, invitedPayload, { merge: true });
      }

      const userRef = doc(firebaseDb, 'users', user.uid);
      await setDoc(
        userRef,
        {
          latestFamilyDraft: {
            familyId,
            familyName,
            members: serializedMembers.map((member) => ({
              id: member.id as string,
              name: member.name as string,
              relationship: member.relationship as string,
            })),
            updatedAt: serverTimestamp(),
          },
        },
        { merge: true }
      );

      setMembers(nextMembers);
      await saveCreateParivarProgress({
        step: 2,
        familyId,
        familyName,
        members: nextMembers,
      });
      cancelMemberForm();
    } catch (error) {
      console.warn('Failed to add family member', error);
      Alert.alert('Unable to add member', 'Please try again in a moment.');
    } finally {
      setMemberSaving(false);
    }
  }, [
    cancelMemberForm,
    ensureOwnerMember,
    familyId,
    familyName,
    memberForm,
    members,
    editingMemberId,
    ownerMember,
    user,
  ]);

  const handleDeleteMember = useCallback(
    async (memberId: string) => {
      if (!firebaseDb || !user || !familyId) {
        Alert.alert(
          'Unable to remove member',
          'Please ensure you are online and signed in.'
        );
        return;
      }

      const target = members.find((member) => member.id === memberId);
      if (!target) {
        return;
      }

      if (target.relationship?.toLowerCase() === 'self') {
        Alert.alert('Cannot remove member', 'You cannot remove yourself from the Parivar.');
        return;
      }

      try {
        setMemberSaving(true);
        const remaining = members.filter((member) => member.id !== memberId);
        const nextMembers = ensureOwnerMember(remaining);
        const serializedMembers = sanitizeFamilyMembers(nextMembers);

        const familyRef = doc(firebaseDb, 'families', familyId);
        await updateDoc(familyRef, {
          members: serializedMembers,
          updatedAt: serverTimestamp(),
        });

        if (target.id !== ownerMember.id) {
          await setDoc(
            doc(firebaseDb, 'users', target.id),
            {
              status: 'DELETED',
              familyId,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        }

        const userRef = doc(firebaseDb, 'users', user.uid);
        await setDoc(
          userRef,
          {
            latestFamilyDraft: {
              familyId,
              familyName,
              members: serializedMembers.map((member) => ({
                id: member.id as string,
                name: member.name as string,
                relationship: member.relationship as string,
              })),
              updatedAt: serverTimestamp(),
            },
          },
          { merge: true }
        );

        setMembers(nextMembers);
        await saveCreateParivarProgress({
          step: 2,
          familyId,
          familyName,
          members: nextMembers,
        });

        if (editingMemberId === memberId) {
          cancelMemberForm();
        }
      } catch (error) {
        console.warn('Failed to delete member', error);
        Alert.alert('Unable to remove member', 'Please try again in a moment.');
      } finally {
        setMemberSaving(false);
      }
    }, [cancelMemberForm, editingMemberId, ensureOwnerMember, familyId, familyName, members, ownerMember, user]);

  const handleFinalize = useCallback(async () => {
    if (!firebaseDb || !user || !familyId) {
      Alert.alert(
        'Almost there',
        'We need a stable connection to finish creating your Parivar.'
      );
      return;
    }

    const finalMembers = ensureOwnerMember(members);
    const serializedMembers = sanitizeFamilyMembers(finalMembers);
    if (!finalMembers.length) {
      Alert.alert('Add a member', 'Add at least one member before finishing.');
      return;
    }

    try {
      setFinalizing(true);
      const familyRef = doc(firebaseDb, 'families', familyId);
      await updateDoc(familyRef, {
        members: serializedMembers,
        memberCount: finalMembers.length,
        status: 'active',
        updatedAt: serverTimestamp(),
        completedAt: serverTimestamp(),
      });

      const userRef = doc(firebaseDb, 'users', user.uid);
      await setDoc(
        userRef,
        {
          createdParivarIds: arrayUnion(familyId),
          parivarIds: arrayUnion(familyId),
          families: arrayUnion({
            id: familyId,
            name: familyName,
            relationship: 'Self',
          }),
          latestFamilyDraft: deleteField(),
        },
        { merge: true }
      );

      await clearCreateParivarProgress();
      Alert.alert(
        'Parivar ready!',
        'Your Parivar is all set. Invite your loved ones to join.',
        [
          {
            text: 'Go to home',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error) {
      console.warn('Failed to finalize Parivar', error);
      Alert.alert(
        'Unable to finish',
        'Something went wrong while publishing your Parivar. Please try again.'
      );
    } finally {
      setFinalizing(false);
    }
  }, [ensureOwnerMember, familyId, familyName, members, router, user]);

  if (!firebaseDb) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <YStack
          f={1}
          jc="center"
          ai="center"
          padding={BrandSpacing.gutter}
          bg={colors.background}
        >
          <Text textAlign="center" color={colors.text} fontSize={responsiveFont(18)} fontWeight="600">
            Firebase is not configured.
          </Text>
          <Text textAlign="center" color={colors.muted} marginTop={12}>
            Add your Firebase credentials to continue creating your Parivar.
          </Text>
          <Button marginTop={24} onPress={handleGoBack}>
            Go Back
          </Button>
        </YStack>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <YStack
          f={1}
          jc="center"
          ai="center"
          padding={BrandSpacing.gutter}
          bg={colors.background}
        >
          <Text textAlign="center" color={colors.text} fontSize={responsiveFont(18)} fontWeight="600">
            You need to sign in first.
          </Text>
          <Text textAlign="center" color={colors.muted} marginTop={12}>
            Log in again so we can keep your Parivar safe and private.
          </Text>
          <Button marginTop={24} onPress={handleGoBack}>
            Go Back
          </Button>
        </YStack>
      </SafeAreaView>
    );
  }

  if (hydrating) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <YStack
          f={1}
          jc="center"
          ai="center"
          bg={colors.background}
          gap="$3"
        >
          <Spinner size="large" color={colors.accent} />
          <Text color={colors.muted}>Preparing your Parivar workspace…</Text>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <YStack flex={1} backgroundColor={colors.background}>
          <YStack
            paddingHorizontal={BrandSpacing.gutter}
            paddingTop={BrandSpacing.elementGap}
            paddingBottom={BrandSpacing.stackGap / 1.5}
            bg={colors.background}
          >
            <XStack ai="center" gap="$3">
              <Button
                size="$3"
                circular
                icon={<ArrowLeft color={colors.text} size={18} />}
                backgroundColor={colors.field}
                shadowColor={withAlpha(colors.accent, 0.12)}
                shadowRadius={10}
                pressStyle={{ scale: 0.94 }}
                onPress={handleGoBack}
              />
              <YStack flex={1} gap="$1">
                <Text
                  fontSize={responsiveFont(22)}
                  fontFamily={BrandTypography.tagline.fontFamily}
                  fontWeight={BrandTypography.tagline.fontWeight}
                  color={colors.text}
                >
                  Create your Parivar
                </Text>
                <Text color={colors.muted}>
                  A warm home for every generation and story.
                </Text>
              </YStack>
            </XStack>
          </YStack>

          <YStack paddingHorizontal={BrandSpacing.gutter} paddingBottom={BrandSpacing.stackGap} bg={colors.background}>
            <Card padding="$4" backgroundColor={colors.card} alignSelf="center" shadowColor={colors.shadow} shadowRadius={18}>
              <XStack ai="center" jc="center" gap="$4">
                {steps.map((item, index) => {
                  const isActive = step === item.id;
                  const isCompleted = step > item.id;
                  const bubbleColor = isActive || isCompleted ? colors.accent : colors.accentFaint;
                  return (
                    <Fragment key={item.id}>
                      <YStack ai="center" gap="$2">
                        <YStack
                          width={44}
                          height={44}
                          borderRadius={22}
                          ai="center"
                          jc="center"
                          backgroundColor={bubbleColor}
                        >
                          {isCompleted ? (
                            <Check size={20} color="#fff" />
                          ) : (
                            <Text color={isActive ? '#fff' : colors.muted} fontWeight="700">
                              {item.id}
                            </Text>
                          )}
                        </YStack>
                        <Text
                          fontWeight={isActive ? '700' : '600'}
                          fontSize={responsiveFont(13)}
                          color={isActive ? colors.text : colors.muted}
                          textAlign="center"
                        >
                          {item.label}
                        </Text>
                      </YStack>
                      {index < steps.length - 1 && (
                        <View
                          style={{
                            width: 48,
                            height: 2,
                            backgroundColor: isCompleted ? colors.accent : colors.accentFaint,
                          }}
                        />
                      )}
                    </Fragment>
                  );
                })}
              </XStack>
            </Card>
          </YStack>

          <ScrollView
            style={{ flex: 1, backgroundColor: colors.background }}
            contentContainerStyle={{
              paddingHorizontal: BrandSpacing.gutter,
              paddingBottom: BrandSpacing.stackGap * 2,
              paddingTop: BrandSpacing.elementGap,
              gap: BrandSpacing.stackGap,
            }}
            keyboardShouldPersistTaps="handled"
          >
            {step === 1 ? (
              <Card
                elevate
                padding="$5"
                backgroundColor={colors.card}
                shadowColor={colors.shadow}
                shadowRadius={22}
              >
                <YStack gap="$4">
                  <YStack ai="center" marginTop={-BrandSpacing.elementGap / 2}>
                    <FamilyTreeIllustration width={260} height={200} mode={themeName} />
                  </YStack>

                  <YStack gap="$2">
                    <Text fontSize={responsiveFont(18)} fontWeight="700" color={colors.text}>
                      Give your Parivar a heartfelt name
                    </Text>
                    <Text color={colors.muted}>
                      This name appears on invites, stories, and every gentle reminder.
                    </Text>
                  </YStack>

                  <YStack gap="$3">
                    <Text fontWeight="600" color={colors.text}>
                      Parivar Name
                    </Text>
                    <Input
                      value={familyName}
                      onChangeText={(value) => {
                        setFamilyName(value);
                        setFamilyNameError(null);
                      }}
                      placeholder="e.g. The Sharma Parivar"
                      autoCapitalize="words"
                      size="$5"
                      bg={colors.field}
                      borderColor={familyNameError ? palette.danger : colors.border}
                      borderWidth={1}
                      color={colors.text}
                      placeholderTextColor={colors.muted}
                    />
                    {familyNameError ? (
                      <Text color={palette.danger} fontSize={responsiveFont(13)}>
                        {familyNameError}
                      </Text>
                    ) : (
                      <Text color={colors.muted} fontSize={responsiveFont(13)}>
                        Pick something unique. We&apos;ll make sure no one else is using it.
                      </Text>
                    )}
                  </YStack>

                  <YStack marginTop={BrandSpacing.elementGap / 2}>
                    <Button
                      size="$5"
                      backgroundColor={colors.accent}
                      onPress={handleSaveFamilyName}
                      disabled={familyNameBusy}
                    >
                      <Text color={palette.accentForeground} fontWeight="600">
                        {familyNameBusy ? 'Saving...' : 'Save & Continue'}
                      </Text>
                    </Button>
                  </YStack>
                </YStack>
              </Card>
            ) : (
              <YStack gap="$5">
              <Card padding="$4" gap="$3" backgroundColor={colors.card} shadowColor={colors.shadow} shadowRadius={16}>
                {isEditingFamilyName ? (
                  <YStack gap="$3">
                    <Input
                      value={familyNameDraft}
                      onChangeText={setFamilyNameDraft}
                      placeholder="Enter family name"
                      size="$4"
                      bg={colors.field}
                      borderColor={familyNameError ? palette.danger : colors.border}
                      borderWidth={1}
                      color={colors.text}
                      placeholderTextColor={colors.muted}
                    />
                    {familyNameError ? (
                      <Text color={palette.danger} fontSize={responsiveFont(13)}>
                        {familyNameError}
                      </Text>
                    ) : null}
                    <XStack gap="$2">
                      <Button flex={1} backgroundColor={colors.card} onPress={cancelEditingFamilyName}>
                        <Text color={colors.text} fontWeight="600">
                          Cancel
                        </Text>
                      </Button>
                      <Button
                        flex={1}
                        backgroundColor={colors.accent}
                        onPress={handleSaveFamilyName}
                        disabled={familyNameBusy}
                      >
                        <Text color={palette.accentForeground} fontWeight="600">
                          {familyNameBusy ? 'Saving...' : 'Save name'}
                        </Text>
                      </Button>
                    </XStack>
                  </YStack>
                ) : (
                  <XStack ai="center" jc="space-between">
                    <YStack>
                      <Text fontSize={responsiveFont(16)} fontWeight="700" color={colors.text}>
                        {familyName}
                      </Text>
                      
                    </YStack>
                    <Button
                      size="$2"
                      circular
                      backgroundColor={colors.field}
                      onPress={startEditingFamilyName}
                    >
                      <Edit3 size={16} color={colors.text} />
                    </Button>
                  </XStack>
                )}
              </Card>

              <YStack gap="$4">
                {members.map((member) => {
                  const isOwner = member.relationship?.toLowerCase() === 'self';
                  return (
                    <Card
                      key={member.id}
                      padding="$4"
                      backgroundColor={isOwner ? colors.accentFaint : colors.card}
                      gap="$3"
                      shadowColor={colors.shadow}
                      shadowRadius={isOwner ? 18 : 12}
                    >
                      <XStack ai="center" gap="$3" jc="space-between">
                        <XStack ai="center" gap="$3">
                          <YStack
                            width={44}
                            height={44}
                            borderRadius={22}
                            ai="center"
                            jc="center"
                            backgroundColor={colors.avatar}
                          >
                            <UserRound size={22} color={colors.accent} />
                          </YStack>
                          <YStack gap="$1">
                            <Text fontSize={responsiveFont(16)} fontWeight="700" color={colors.text}>
                              {member.name}
                            </Text>
                            <Text fontSize={responsiveFont(13)} color={colors.muted}>
                              {member.relationship || 'Family'}
                              {isOwner ? ' • You' : ''}
                            </Text>
                            {member.dob && (
                              <Text fontSize={responsiveFont(13)} color={colors.muted}>
                                {getAgeFromDate(member.dob)} years old
                              </Text>
                            )}
                          </YStack>
                        </XStack>
                        {!isOwner && (
                          <XStack gap="$2">
                            <Button
                              size="$2"
                              circular
                              backgroundColor={colors.field}
                              onPress={() => openEditMemberForm(member.id)}
                            >
                              <Edit3 size={16} color={colors.text} />
                            </Button>
                            <Button
                              size="$2"
                              circular
                              backgroundColor={colors.field}
                              onPress={() => handleDeleteMember(member.id)}
                            >
                              <Trash2 size={16} color={colors.text} />
                            </Button>
                          </XStack>
                        )}
                      </XStack>
                    </Card>
                  );
                })}
              </YStack>

              {showInlineMemberForm ? null : (
                <Button
                  size="$5"
                  icon={<Plus color={colors.text} size={20} />}
                  backgroundColor={colors.card}
                  shadowColor={colors.shadow}
                  shadowRadius={16}
                  onPress={openNewMemberForm}
                >
                  <Text color={colors.text} fontWeight="600">
                    Add another member
                  </Text>
                </Button>
              )}
              {showInlineMemberForm && (
                <Card
                  padding="$5"
                  backgroundColor={colors.card}
                  shadowColor={colors.shadow}
                  shadowRadius={18}
                  gap="$4"
                >
                  <YStack gap="$4">
                    <YStack gap="$2">
                      <Text fontSize={responsiveFont(18)} fontWeight="700" color={colors.text}>
                        {editingMemberId ? 'Edit family member' : 'Add a family member'}
                      </Text>
                      <Text color={colors.muted} fontSize={responsiveFont(13)}>
                        Save each member and we&apos;ll keep everything synced.
                      </Text>
                    </YStack>

                    <YStack gap="$3">
                      <YStack gap="$2">
                        <Text fontWeight="600" color={colors.text}>
                          Name
                        </Text>
                        <Input
                          value={memberForm.name}
                          onChangeText={(value) => setMemberForm((prev) => ({ ...prev, name: value }))}
                          placeholder="Enter first name"
                          size="$4"
                          bg={colors.field}
                          borderColor={colors.border}
                          borderWidth={1}
                          color={colors.text}
                          placeholderTextColor={colors.muted}
                        />
                      </YStack>

                      <YStack gap="$2">
                        <Text fontWeight="600" color={colors.text}>
                          Relationship with you
                        </Text>
                        <Button
                          size="$4"
                          backgroundColor={colors.field}
                          borderColor={colors.border}
                          borderWidth={1}
                          justifyContent="flex-start"
                          onPress={() =>
                            setSelectionPicker({ type: 'relationship', tempValue: memberForm.relationship || '' })
                          }
                        >
                          <Text color={memberForm.relationship ? colors.text : colors.muted}>
                            {memberForm.relationship || 'Select relationship'}
                          </Text>
                        </Button>
                      </YStack>

                      <YStack gap="$2">
                        <Text fontWeight="600" color={colors.text}>
                          Phone number
                        </Text>
                        <XStack
                          ai="center"
                          gap="$2"
                          borderRadius="$5"
                          borderWidth={1}
                          borderColor={colors.border}
                          paddingHorizontal="$3"
                          paddingVertical="$2"
                          backgroundColor={colors.field}
                        >
                          <Text color={colors.text} fontWeight="600">
                            {defaultPhoneCountryCode}
                          </Text>
                          <Input
                            flex={1}
                            borderWidth={0}
                            backgroundColor="transparent"
                            value={memberForm.phoneNumber}
                            onChangeText={(value) =>
                              setMemberForm((prev) => ({
                                ...prev,
                                phoneNumber: value.replace(/\D/g, ''),
                              }))
                            }
                            placeholder="9876543210"
                            size="$4"
                            color={colors.text}
                            placeholderTextColor={colors.muted}
                            keyboardType="number-pad"
                          />
                        </XStack>
                      </YStack>

                      <YStack gap="$2">
                        <Text fontWeight="600" color={colors.text}>
                          Gender
                        </Text>
                        <Button
                          size="$4"
                          backgroundColor={colors.field}
                          borderColor={colors.border}
                          borderWidth={1}
                          justifyContent="flex-start"
                          onPress={() =>
                            setSelectionPicker({ type: 'gender', tempValue: memberForm.gender || '' })
                          }
                        >
                          <Text color={memberForm.gender ? colors.text : colors.muted}>
                            {memberForm.gender || 'Select gender'}
                          </Text>
                        </Button>
                      </YStack>

                      <YStack gap="$2">
                        <Text fontWeight="600" color={colors.text}>
                          Blood group
                        </Text>
                        <Button
                          size="$4"
                          backgroundColor={colors.field}
                          borderColor={colors.border}
                          borderWidth={1}
                          justifyContent="flex-start"
                          onPress={() =>
                            setSelectionPicker({ type: 'blood', tempValue: memberForm.bloodGroup || '' })
                          }
                        >
                          <Text color={memberForm.bloodGroup ? colors.text : colors.muted}>
                            {memberForm.bloodGroup || 'Select blood group'}
                          </Text>
                        </Button>
                      </YStack>

                      <YStack gap="$2">
                        <Text fontWeight="600" color={colors.text}>
                          Date of birth
                        </Text>
                        <Button
                          size="$4"
                          backgroundColor={colors.field}
                          borderColor={colors.border}
                          borderWidth={1}
                          justifyContent="flex-start"
                          onPress={() => {
                            const existing = memberForm.dob ? parseDateString(memberForm.dob) : undefined;
                            setMemberTempDob(existing ?? new Date(1990, 0, 1));
                            setMemberDobPickerVisible(true);
                          }}
                        >
                          <Text color={memberForm.dob ? colors.text : colors.muted}>
                            {memberForm.dob || 'Select birth date'}
                          </Text>
                        </Button>
                      </YStack>

                      <YStack gap="$2">
                        <Text fontWeight="600" color={colors.text}>
                          Medical conditions
                        </Text>
                        <XStack flexWrap="wrap" gap="$2">
                          {medicalOptions.map((option) => {
                            const selections = memberForm.medicalConditions
                              .split(',')
                              .map((value) => value.trim())
                              .filter(Boolean);
                            const active = selections.includes(option);
                            return (
                              <Button
                                key={option}
                                size="$2"
                                paddingHorizontal="$3"
                                paddingVertical="$1"
                                borderRadius="$4"
                                variant={active ? 'accent' : 'outlined'}
                                onPress={() => {
                                  setMemberForm((prev) => {
                                    const current = prev.medicalConditions
                                      .split(',')
                                      .map((value) => value.trim())
                                      .filter(Boolean);

                                    let next: string[];
                                    if (option === 'None') {
                                      next = ['None'];
                                    } else {
                                      next = current.filter((value) => value !== 'None');
                                      if (next.includes(option)) {
                                        next = next.filter((value) => value !== option);
                                      } else {
                                        next = [...next, option];
                                      }
                                      if (next.length === 0) {
                                        next = ['None'];
                                      }
                                    }

                                    return {
                                      ...prev,
                                      medicalConditions: next.join(', '),
                                    };
                                  });
                                }}
                              >
                                <Text fontSize={responsiveFont(12)}>{option}</Text>
                              </Button>
                            );
                          })}
                        </XStack>
                      </YStack>
                    </YStack>

                    <XStack gap="$3">
                      <Button flex={1} backgroundColor={colors.card} onPress={cancelMemberForm}>
                        <Text color={colors.text} fontWeight="600">
                          Cancel
                        </Text>
                      </Button>
                      <Button
                        flex={1}
                        backgroundColor={colors.accent}
                        onPress={handleSubmitMember}
                        disabled={memberSaving}
                      >
                        <Text color={palette.accentForeground} fontWeight="600">
                          {memberSaving ? 'Saving...' : editingMemberId ? 'Update member' : 'Save member'}
                        </Text>
                      </Button>
                    </XStack>
                  </YStack>
                </Card>
              )}
              <YStack gap="$2" marginTop={showInlineMemberForm ? BrandSpacing.stackGap : 0}>
                <Button
                  size="$5"
                  backgroundColor={colors.accent}
                  onPress={handleFinalize}
                  disabled={finalizing}
                >
                  <Text color={palette.accentForeground} fontWeight="600">
                    {finalizing ? 'Wrapping up...' : 'Finish creating Parivar'}
                  </Text>
                </Button>
                <Text fontSize={responsiveFont(13)} color={colors.muted} textAlign="center">
                  You can always add more members or update details later.
                </Text>
              </YStack>
            </YStack>
            )}
          </ScrollView>
        </YStack>
      </KeyboardAvoidingView>

      {selectionPicker && (
        <Modal transparent visible animationType="fade">
          <YStack f={1} bg="rgba(0,0,0,0.45)" padding="$4" jc="center" ai="center">
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                width: '100%',
                maxWidth: 360,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Picker
                selectedValue={selectionPicker.tempValue}
                onValueChange={(value) =>
                  setSelectionPicker((prev) => (prev ? { ...prev, tempValue: value } : prev))
                }
                dropdownIconColor={colors.text}
                style={{ color: colors.text, backgroundColor: colors.field }}
                itemStyle={{ color: colors.text, fontSize: 16 }}
              >
                <Picker.Item
                  label={
                    selectionPicker.type === 'relationship'
                      ? 'Select relationship'
                      : selectionPicker.type === 'gender'
                        ? 'Select gender'
                        : 'Select blood group'
                  }
                  value=""
                />
                {(selectionPicker.type === 'relationship'
                  ? relationshipOptions
                  : selectionPicker.type === 'gender'
                    ? genderOptions
                    : bloodGroupOptions
                ).map((option) => (
                  <Picker.Item key={option} label={option} value={option} />
                ))}
              </Picker>
              <XStack gap="$3" padding="$3" backgroundColor={colors.card}>
                <Button
                  flex={1}
                  backgroundColor={colors.card}
                  onPress={() => setSelectionPicker(undefined)}
                >
                  <Text color={colors.text} fontWeight="600">
                    Cancel
                  </Text>
                </Button>
                <Button
                  flex={1}
                  backgroundColor={colors.accent}
                  onPress={() => {
                    setMemberForm((prev) => ({
                      ...prev,
                      relationship:
                        selectionPicker.type === 'relationship'
                          ? selectionPicker.tempValue
                          : prev.relationship,
                      gender:
                        selectionPicker.type === 'gender'
                          ? selectionPicker.tempValue
                          : prev.gender,
                      bloodGroup:
                        selectionPicker.type === 'blood'
                          ? selectionPicker.tempValue
                          : prev.bloodGroup,
                    }));
                    setSelectionPicker(undefined);
                  }}
                >
                  <Text color={palette.accentForeground} fontWeight="600">
                    Done
                  </Text>
                </Button>
              </XStack>
            </View>
          </YStack>
        </Modal>
      )}

      <Modal transparent visible={memberDobPickerVisible} animationType="fade">
        <YStack f={1} bg="rgba(0,0,0,0.45)" jc="center" ai="center" padding="$4">
          <Card
            width="100%"
            maxWidth={420}
            padding="$4"
            gap="$3"
            backgroundColor={colors.card}
            borderRadius="$6"
            shadowColor={colors.shadow}
            shadowRadius={20}
          >
            <Text fontFamily={BrandTypography.caption.fontFamily} color={colors.text} opacity={0.9}>
              Select birth date
            </Text>
            <DateTimePicker
              value={memberTempDob}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  setMemberTempDob(selectedDate);
                }
              }}
              maximumDate={new Date()}
              textColor={colors.text}
            />
            <XStack gap="$3">
              <Button
                flex={1}
                backgroundColor={colors.card}
                onPress={() => setMemberDobPickerVisible(false)}
              >
                <Text color={colors.text} fontWeight="600">
                  Cancel
                </Text>
              </Button>
              <Button
                flex={1}
                backgroundColor={colors.accent}
                onPress={() => {
                  const nextDob = formatDate(memberTempDob);
                  setMemberForm((prev) => ({
                    ...prev,
                    dob: nextDob,
                    dobDate: memberTempDob,
                  }));
                  setMemberDobPickerVisible(false);
                }}
              >
                <Text color={palette.accentForeground} fontWeight="600">
                  Done
                </Text>
              </Button>
            </XStack>
          </Card>
        </YStack>
      </Modal>
    </SafeAreaView>
  );
}
