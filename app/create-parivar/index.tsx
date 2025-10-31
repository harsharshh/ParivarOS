import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { Fragment, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check, Plus, UserRound } from '@tamagui/lucide-icons';
import {
  Button,
  Card,
  Input,
  Spinner,
  Text,
  TextArea,
  XStack,
  YStack,
} from 'tamagui';
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

import { ThemePreferenceContext } from '@/app/_layout';
import { firebaseAuth, firebaseDb } from '@/config/firebase';
import { ThemeColors, accentPalette } from '@/constants/tamagui-theme';
import { BrandSpacing, BrandTypography } from '@/design-system';
import { FamilyTreeIllustration } from '@/design-system/illustrations';
import { withAlpha } from '@/utils/color';
import {
  CreateParivarMemberDraft,
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
};

type MemberFormState = {
  name: string;
  relationship: string;
  gender: string;
  dob: string;
  dobDate: Date | null;
  medicalConditions: string;
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
    dob: '',
    dobDate: null,
    medicalConditions: '',
  };
}

function formatDate(date: Date) {
  return date.toISOString().split('T')[0];
}

function generateMemberId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
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
  const [memberModalVisible, setMemberModalVisible] = useState(false);
  const [memberForm, setMemberForm] = useState<MemberFormState>(() => createEmptyMemberForm());
  const [memberSaving, setMemberSaving] = useState(false);
  const [memberDobPickerVisible, setMemberDobPickerVisible] = useState(false);
  const [memberTempDob, setMemberTempDob] = useState<Date>(new Date(1990, 0, 1));
  const [finalizing, setFinalizing] = useState(false);

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

        if (profileSnapshot.exists()) {
          const data = profileSnapshot.data() as Record<string, unknown>;
          setUserProfile({
            name: typeof data.name === 'string' ? data.name : undefined,
            dob: typeof data.dob === 'string' ? data.dob : undefined,
            gender: typeof data.gender === 'string' ? data.gender : undefined,
            medicalHistory: Array.isArray(data.medicalHistory)
              ? (data.medicalHistory as string[])
              : undefined,
          });
        }

        if (storedProgress?.familyId) {
          setFamilyId(storedProgress.familyId);
          if (storedProgress.familyName) {
            setFamilyName(storedProgress.familyName);
          }
          if (storedProgress.step) {
            setStep(storedProgress.step);
          }

          try {
            const familySnapshot = await getDoc(doc(firebaseDb, 'families', storedProgress.familyId));
            if (familySnapshot.exists()) {
              const data = familySnapshot.data() as Record<string, unknown>;
              if (typeof data.name === 'string') {
                setFamilyName(data.name);
              }
              if (Array.isArray(data.members)) {
                setMembers(data.members as CreateParivarMemberDraft[]);
              } else if (Array.isArray(storedProgress.members)) {
                setMembers(storedProgress.members);
              }
            } else if (Array.isArray(storedProgress.members)) {
              setMembers(storedProgress.members);
            }
          } catch (error) {
            console.warn('Unable to hydrate family data from Firestore', error);
            if (Array.isArray(storedProgress.members)) {
              setMembers(storedProgress.members);
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
      medicalConditions:
        userProfile?.medicalHistory && userProfile.medicalHistory.length > 0
          ? userProfile.medicalHistory
          : undefined,
      userId: user.uid,
    };
  }, [user, userProfile]);

  const ensureOwnerMember = useCallback(
    (incoming: CreateParivarMemberDraft[]) => {
      if (!incoming.length) {
        return [ownerMember];
      }
      const hasOwner = incoming.some((member) => member.id === ownerMember.id || member.userId === ownerMember.userId);
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
    const trimmed = familyName.trim();
    if (!trimmed) {
      setFamilyNameError('Give your Parivar a joyful name.');
      return;
    }

    try {
      setFamilyNameBusy(true);
      setFamilyNameError(null);
      const normalized = trimmed.toLowerCase().replace(/\s+/g, '-');
      const familiesRef = collection(firebaseDb, 'families');
      const duplicateQuery = query(
        familiesRef,
        where('normalizedName', '==', normalized),
        limit(1)
      );
      const duplicateSnapshot = await getDocs(duplicateQuery);
      if (!duplicateSnapshot.empty) {
        setFamilyNameError(
          'Looks like this Parivar already exists. Try a different name that is uniquely yours.'
        );
        return;
      }

      const familyRef = doc(familiesRef);
      const initialMembers = [ownerMember];
      await setDoc(familyRef, {
        name: trimmed,
        normalizedName: normalized,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        members: initialMembers,
      });

      const userRef = doc(firebaseDb, 'users', user.uid);
      await setDoc(
        userRef,
        {
          latestFamilyDraft: {
            familyId: familyRef.id,
            familyName: trimmed,
            members: initialMembers.map(({ id, name, relationship }) => ({
              id,
              name,
              relationship,
            })),
            updatedAt: serverTimestamp(),
          },
        },
        { merge: true }
      );

      setFamilyId(familyRef.id);
      setMembers(initialMembers);
      setStep(2);
      await saveCreateParivarProgress({
        step: 2,
        familyId: familyRef.id,
        familyName: trimmed,
        members: initialMembers,
      });
    } catch (error) {
      console.warn('Failed to create Parivar', error);
      Alert.alert(
        'Unable to create Parivar',
        'Something went wrong while saving your Parivar. Please try again.'
      );
    } finally {
      setFamilyNameBusy(false);
    }
  }, [familyName, ownerMember, user]);

  const openMemberModal = useCallback(() => {
    setMemberForm(createEmptyMemberForm());
    setMemberTempDob(new Date(1990, 0, 1));
    setMemberModalVisible(true);
  }, []);

  const closeMemberModal = useCallback(() => {
    setMemberModalVisible(false);
    setMemberSaving(false);
    setMemberForm(createEmptyMemberForm());
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

      const newMember: CreateParivarMemberDraft = {
        id: generateMemberId(),
        name,
        relationship,
        gender: memberForm.gender || undefined,
        dob: memberForm.dob || undefined,
        medicalConditions: medicalConditions.length ? medicalConditions : undefined,
      };

      const nextMembers = ensureOwnerMember([...members, newMember]);
      const familyRef = doc(firebaseDb, 'families', familyId);
      await updateDoc(familyRef, {
        members: nextMembers,
        updatedAt: serverTimestamp(),
      });

      const userRef = doc(firebaseDb, 'users', user.uid);
      await setDoc(
        userRef,
        {
          latestFamilyDraft: {
            familyId,
            familyName,
            members: nextMembers.map(({ id, name: mName, relationship: rel }) => ({
              id,
              name: mName,
              relationship: rel,
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
      closeMemberModal();
    } catch (error) {
      console.warn('Failed to add family member', error);
      Alert.alert('Unable to add member', 'Please try again in a moment.');
    } finally {
      setMemberSaving(false);
    }
  }, [
    closeMemberModal,
    ensureOwnerMember,
    familyId,
    familyName,
    memberForm,
    members,
    user,
  ]);

  const handleFinalize = useCallback(async () => {
    if (!firebaseDb || !user || !familyId) {
      Alert.alert(
        'Almost there',
        'We need a stable connection to finish creating your Parivar.'
      );
      return;
    }

    const finalMembers = ensureOwnerMember(members);
    if (!finalMembers.length) {
      Alert.alert('Add a member', 'Add at least one member before finishing.');
      return;
    }

    try {
      setFinalizing(true);
      const familyRef = doc(firebaseDb, 'families', familyId);
      await updateDoc(familyRef, {
        members: finalMembers,
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
          <Text textAlign="center" color={colors.text} fontSize={18} fontWeight="600">
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
          <Text textAlign="center" color={colors.text} fontSize={18} fontWeight="600">
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
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
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
          <XStack ai="center" gap="$3">
            <Button
              size="$3"
              circular
              icon={<ArrowLeft color={colors.text} size={18} />}
              backgroundColor={colors.card}
              shadowColor={colors.shadow}
              shadowRadius={12}
              pressStyle={{ scale: 0.94 }}
              onPress={handleGoBack}
            />
            <YStack>
              <Text
                fontSize={22}
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
                        fontSize={13}
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

          {step === 1 ? (
            <Card
              elevate
              padding="$5"
              backgroundColor={colors.card}
              shadowColor={colors.shadow}
              shadowRadius={22}
            >
              <YStack gap="$5">
                <YStack ai="center">
                  <FamilyTreeIllustration width={260} height={200} mode={themeName} />
                </YStack>

                <YStack gap="$2">
                  <Text fontSize={18} fontWeight="700" color={colors.text}>
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
                    <Text color={palette.danger} fontSize={13}>
                      {familyNameError}
                    </Text>
                  ) : (
                    <Text color={colors.muted} fontSize={13}>
                      Pick something unique. We&apos;ll make sure no one else is using it.
                    </Text>
                  )}
                </YStack>

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
            </Card>
          ) : (
            <YStack gap="$5">
              <Card padding="$4" gap="$2" backgroundColor={colors.card} shadowColor={colors.shadow} shadowRadius={16}>
                <Text fontSize={16} fontWeight="700" color={colors.text}>
                  {familyName}
                </Text>
                <Text color={colors.muted}>
                  Add members to start weaving memories together.
                </Text>
              </Card>

              <YStack gap="$4">
                {members.map((member) => {
                  const isOwner = member.relationship?.toLowerCase() === 'self';
                  const medicalList =
                    Array.isArray(member.medicalConditions) && member.medicalConditions.length > 0
                      ? member.medicalConditions
                      : null;
                  return (
                    <Card
                      key={member.id}
                      padding="$4"
                      backgroundColor={isOwner ? colors.accentFaint : colors.card}
                      gap="$3"
                      shadowColor={colors.shadow}
                      shadowRadius={isOwner ? 18 : 12}
                    >
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
                        <YStack flex={1} gap="$1">
                          <Text fontSize={16} fontWeight="700" color={colors.text}>
                            {member.name}
                          </Text>
                          <Text fontSize={13} color={colors.muted}>
                            {member.relationship || 'Family'}
                            {isOwner ? ' • You' : ''}
                          </Text>
                          {member.dob && (
                            <Text fontSize={13} color={colors.muted}>
                              Born on {member.dob}
                            </Text>
                          )}
                        </YStack>
                      </XStack>
                      {medicalList && (
                        <XStack flexWrap="wrap" gap="$2">
                          {medicalList.map((condition) => (
                            <Button
                              key={condition}
                              size="$2"
                              backgroundColor={colors.accentSoft}
                              paddingHorizontal="$3"
                              paddingVertical="$1"
                              color={colors.text}
                            >
                              <Text fontSize={12} color={colors.text}>
                                {condition}
                              </Text>
                            </Button>
                          ))}
                        </XStack>
                      )}
                    </Card>
                  );
                })}
              </YStack>

              <Button
                size="$5"
                icon={<Plus color={colors.text} size={20} />}
                backgroundColor={colors.card}
                shadowColor={colors.shadow}
                shadowRadius={16}
                onPress={openMemberModal}
              >
                <Text color={colors.text} fontWeight="600">
                  Add another member
                </Text>
              </Button>
              <YStack gap="$2">
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
                <Text fontSize={13} color={colors.muted} textAlign="center">
                  You can always add more members or update details later.
                </Text>
              </YStack>
            </YStack>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal transparent visible={memberModalVisible} animationType="slide">
        <YStack
          f={1}
          bg="rgba(0,0,0,0.45)"
          padding="$4"
          jc="center"
          ai="center"
        >
          <Card
            width="100%"
            maxWidth={420}
            padding="$5"
            gap="$4"
            borderRadius="$6"
            backgroundColor={colors.card}
            shadowColor={colors.shadow}
            shadowRadius={24}
          >
            <YStack gap="$2">
              <Text fontSize={18} fontWeight="700" color={colors.text}>
                Add a family member
              </Text>
              <Text color={colors.muted} fontSize={13}>
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
                placeholder="Full name"
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
                <YStack
                  borderRadius="$5"
                  borderWidth={1}
                  borderColor={colors.border}
                  overflow="hidden"
                  bg={colors.field}
                >
                  <Picker
                    selectedValue={memberForm.relationship}
                    onValueChange={(value) =>
                      setMemberForm((prev) => ({ ...prev, relationship: value }))
                    }
                  >
                    <Picker.Item label="Select relationship" value="" />
                    {relationshipOptions.map((option) => (
                      <Picker.Item key={option} label={option} value={option} />
                    ))}
                  </Picker>
                </YStack>
              </YStack>

              <YStack gap="$2">
                <Text fontWeight="600" color={colors.text}>
                  Gender
                </Text>
                <YStack
                  borderRadius="$5"
                  borderWidth={1}
                  borderColor={colors.border}
                  overflow="hidden"
                  bg={colors.field}
                >
                  <Picker
                    selectedValue={memberForm.gender}
                    onValueChange={(value) =>
                      setMemberForm((prev) => ({ ...prev, gender: value }))
                    }
                  >
                    <Picker.Item label="Select gender" value="" />
                    {genderOptions.map((option) => (
                      <Picker.Item key={option} label={option} value={option} />
                    ))}
                  </Picker>
                </YStack>
              </YStack>

              <YStack gap="$2">
                <Text fontWeight="600" color={colors.text}>
                  Date of birth
                </Text>
                <Button
                  backgroundColor={colors.card}
                  justifyContent="flex-start"
                  onPress={() => {
                    setMemberTempDob(memberForm.dobDate ?? new Date(1990, 0, 1));
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
                <TextArea
                  value={memberForm.medicalConditions}
                  onChangeText={(value) =>
                    setMemberForm((prev) => ({ ...prev, medicalConditions: value }))
                  }
                  placeholder="Optional. Separate multiple conditions with commas."
                  rows={3}
                  bg={colors.field}
                  borderColor={colors.border}
                  color={colors.text}
                  placeholderTextColor={colors.muted}
                />
              </YStack>
            </YStack>

            <XStack gap="$3">
              <Button
                flex={1}
                backgroundColor={colors.card}
                onPress={closeMemberModal}
              >
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
                  {memberSaving ? 'Saving...' : 'Save member'}
                </Text>
              </Button>
            </XStack>
          </Card>
        </YStack>
      </Modal>

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
