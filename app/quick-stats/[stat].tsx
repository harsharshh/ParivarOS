import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Platform, ScrollView, View } from 'react-native';
import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import { Button, Card, Input, Text, XStack, YStack } from 'tamagui';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

import { ThemePreferenceContext } from '@/app/_layout';
import { firebaseAuth, firebaseDb } from '@/config/firebase';
import { ThemeColors } from '@/constants/tamagui-theme';
import { BrandSpacing, BrandTypography, ParivarMemberCard, StatsCard } from '@/design-system';
import { responsiveFont } from '@/utils/responsive-font';
import { withAlpha } from '@/utils/color';
import { useParivarStatus } from '@/hooks/use-parivar-status';
import type { CreateParivarMemberDraft } from '@/utils/create-parivar-storage';
import {
  MemberFormState,
  bloodGroupOptions,
  createEmptyMemberForm,
  defaultMedicalSelections,
  defaultPhoneCountryCode,
  genderOptions,
  medicalOptions,
  relationshipOptions,
  sanitizeFamilyMembers,
  generateMemberId,
  parseDateString,
  extractLocalPhone,
  formatDate,
} from '@/utils/member-form';

function getAgeFromDate(value?: string) {
  if (!value) return '';
  const birthDate = parseDateString(value);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return `${age}`;
}

type QuickStatMetric = {
  title: string;
  value: string;
  description: string;
};

type QuickStatFocusArea = {
  title: string;
  description: string;
};

type QuickStatConfig = {
  title: string;
  overview: string;
  hero: {
    value: string;
    label: string;
    caption: string;
  };
  metrics: QuickStatMetric[];
  focusAreas: QuickStatFocusArea[];
  suggestions: string[];
};

const quickStatConfigs: Record<string, QuickStatConfig> = {
  'parivar-members': {
    title: 'Parivar Members',
    overview:
      'See how your loved ones are connecting and where you might want to nudge for more engagement.',
    hero: {
      value: '12',
      label: 'Members connected',
      caption: 'Across immediate and extended family circles.',
    },
    metrics: [
      {
        title: 'Active this week',
        value: '9',
        description: 'Members who viewed or shared updates in the past 7 days.',
      },
      {
        title: 'Invites pending',
        value: '3',
        description: 'Family members still waiting to join your Parivar.',
      },
      {
        title: 'Core family setup',
        value: '75%',
        description: 'Profiles with completed DOB, blood group, and relation details.',
      },
    ],
    focusAreas: [
      {
        title: 'Profiles needing updates',
        description: 'Encourage members missing birthdays or photos to complete their profile.',
      },
      {
        title: 'Welcome the newcomers',
        description:
          'Send a warm note or share a family memory to help newly-joined relatives feel at home.',
      },
      {
        title: 'Strengthen inactive circles',
        description: 'Reconnect with elder relatives who have not visited recently.',
      },
    ],
    suggestions: [
      'Share a family highlight to spark conversation.',
      'Send invites again to relatives who have not accepted yet.',
      'Update relationship tags so every member knows how they are connected.',
    ],
  },
  'parivar-linked': {
    title: 'Parivar Linked',
    overview: 'Monitor the other Parivars you follow and the meaningful exchanges happening.',
    hero: {
      value: '3',
      label: 'Linked Parivars',
      caption: 'Families with shared stories and celebrations.',
    },
    metrics: [
      {
        title: 'Shared moments',
        value: '18',
        description: 'Updates exchanged with linked Parivars this month.',
      },
      {
        title: 'Pending collaborations',
        value: '2',
        description: 'Invitations awaiting confirmation for joint events or rituals.',
      },
      {
        title: 'Reciprocity score',
        value: '4.5',
        description: 'Average rating of how balanced your interactions feel.',
      },
    ],
    focusAreas: [
      {
        title: 'Celebrate together',
        description: 'Plan a shared event with your most active partner Parivar.',
      },
      {
        title: 'Revive quiet links',
        description: 'Reach out to Parivars that have been silent for over a month.',
      },
      {
        title: 'Share cultural gems',
        description: 'Exchange recipes, rituals, or songs that mean a lot to both families.',
      },
    ],
    suggestions: [
      'Send a gratitude note for recent support from a linked Parivar.',
      'Create a collaborative album to swap memories seamlessly.',
      'Schedule quarterly catch-ups with key family leads.',
    ],
  },
  events: {
    title: 'Events',
    overview:
      'Keep an eye on upcoming gatherings so every celebration and ritual stays coordinated.',
    hero: {
      value: '5',
      label: 'Upcoming events',
      caption: 'Including birthdays, anniversaries, and planned gatherings.',
    },
    metrics: [
      {
        title: 'Prepared checklists',
        value: '4',
        description: 'Events with assigned hosts, reminders, and preparation tasks.',
      },
      {
        title: 'Celebrations this week',
        value: '2',
        description: 'Special milestones happening in the next seven days.',
      },
      {
        title: 'Awaiting confirmation',
        value: '1',
        description: 'Events pending final approvals from key members.',
      },
    ],
    focusAreas: [
      {
        title: 'Finalize logistics',
        description: 'Confirm venues, timings, and rituals for the next two gatherings.',
      },
      {
        title: 'Assign hosts',
        description: 'Ensure each event has a family lead for coordination.',
      },
      {
        title: 'Capture memories',
        description: 'Plan who will record photos, videos, or voice memories during events.',
      },
    ],
    suggestions: [
      'Send reminders to participants about their responsibilities.',
      'Share the plan with relatives who live away so they can join virtually.',
      'Update the Parivar calendar to keep everyone aligned.',
    ],
  },
  'health-reminders': {
    title: 'Health Reminders',
    overview:
      'Track wellness routines and reminders to ensure the entire Parivar stays healthy together.',
    hero: {
      value: '2',
      label: 'Active reminders',
      caption: 'Tasks scheduled for medication, check-ups, and wellbeing habits.',
    },
    metrics: [
      {
        title: 'Completed this week',
        value: '6',
        description: 'Health reminders marked as done in the past seven days.',
      },
      {
        title: 'Overdue tasks',
        value: '1',
        description: 'Reminders that need immediate attention.',
      },
      {
        title: 'Care teams set',
        value: '4',
        description: 'Members who have an assigned caregiver or accountability partner.',
      },
    ],
    focusAreas: [
      {
        title: 'Support elders',
        description: 'Set gentle nudges or phone call reminders for senior members.',
      },
      {
        title: 'Sync medical records',
        description: 'Upload prescriptions and doctor notes for quick reference.',
      },
      {
        title: 'Celebrate health wins',
        description: 'Share short notes when someone completes a wellbeing goal.',
      },
    ],
    suggestions: [
      'Create a weekly rhythm where everyone logs their check-ins.',
      'Invite siblings or cousins to share responsibility for follow-ups.',
      'Add voice notes for complex routines to make them easier to follow.',
    ],
  },
};

export default function QuickStatDetailScreen() {
  const params = useLocalSearchParams<{ stat?: string }>();
  const slugParam = Array.isArray(params.stat) ? params.stat[0] : params.stat;
  const config = slugParam ? quickStatConfigs[slugParam] : undefined;

  const { themeName } = useContext(ThemePreferenceContext);
  const palette = ThemeColors[themeName];
  const { latestFamilyDraft, hasCreatedParivar, primaryFamily } = useParivarStatus();
  const isParivarMembers = slugParam === 'parivar-members';
  const familyId = primaryFamily?.id ?? latestFamilyDraft?.familyId ?? null;
  const familyDisplayName = latestFamilyDraft?.familyName ?? primaryFamily?.name ?? 'Parivar';
  const user = firebaseAuth?.currentUser;
  const [remoteMembers, setRemoteMembers] = useState<CreateParivarMemberDraft[] | null>(null);
  const [membersLoading, setMembersLoading] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [memberForm, setMemberForm] = useState<MemberFormState>(() => createEmptyMemberForm());
  const [memberSaving, setMemberSaving] = useState(false);
  const [memberFormVersion, setMemberFormVersion] = useState(0);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberTempDob, setMemberTempDob] = useState<Date>(new Date(1990, 0, 1));
  const [memberDobPickerVisible, setMemberDobPickerVisible] = useState(false);
  const [selectionPicker, setSelectionPicker] = useState<{ type: 'relationship' | 'gender' | 'blood'; tempValue: string } | null>(null);
  const resolveMembers = useCallback(
    () =>
      remoteMembers ??
      (Array.isArray(latestFamilyDraft?.members)
        ? [...latestFamilyDraft.members]
        : []),
    [latestFamilyDraft, remoteMembers]
  );

  const colors = useMemo(
    () => ({
      background: palette.surface,
      text: palette.text,
      secondary: palette.subtleText,
      muted: palette.mutedText,
      cardBackground: palette.surface,
      highlightBackground: withAlpha(palette.accent, themeName === 'dark' ? 0.28 : 0.18),
      shadow: palette.shadow,
    }),
    [palette, themeName]
  );

  useEffect(() => {
    let isActive = true;
    if (!isParivarMembers) {
      return () => {
        isActive = false;
      };
    }
    if (!familyId || !firebaseDb) {
      setRemoteMembers(null);
      setMembersLoading(false);
      return () => {
        isActive = false;
      };
    }

    setMembersLoading(true);
    void (async () => {
      try {
        const snapshot = await getDoc(doc(firebaseDb, 'families', familyId));
        if (!isActive) {
          return;
        }
        if (snapshot.exists()) {
          const data = snapshot.data() as Record<string, unknown>;
          const members = Array.isArray(data.members)
            ? (data.members.filter((member) => !!member && typeof member === 'object') as CreateParivarMemberDraft[])
            : [];
          setRemoteMembers(members);
        } else {
          setRemoteMembers([]);
        }
      } catch (error) {
        console.warn('Failed to fetch family members from Firestore', error);
        if (isActive) {
          setRemoteMembers(null);
        }
      } finally {
        if (isActive) {
          setMembersLoading(false);
        }
      }
    })();

    return () => {
      isActive = false;
    };
  }, [familyId, isParivarMembers]);

  const parivarMembers = useMemo(() => {
    if (!isParivarMembers) {
      return { list: [], usingPlaceholder: false };
    }

    const resolved = resolveMembers();
    const memberSource = resolved.length ? resolved : null;

    const placeholderMembers: CreateParivarMemberDraft[] = [
      {
        id: 'mom',
        name: 'Sakshi Sharma',
        relationship: 'Mother • Guardian of family traditions',
        userId: 'demo',
        dob: '12 Aug',
        bloodGroup: 'O+',
      },
      {
        id: 'dad',
        name: 'Rajesh Sharma',
        relationship: 'Father • Family historian',
        userId: 'demo',
        dob: '04 Jan',
        bloodGroup: 'B+',
      },
      {
        id: 'spouse',
        name: 'Meera Sharma',
        relationship: 'Spouse • Celebration anchor',
        userId: 'demo',
        dob: '21 Apr',
        bloodGroup: 'A+',
        medicalConditions: ['Culture curator'],
      },
      {
        id: 'brother',
        name: 'Arjun Sharma',
        relationship: 'Brother • Tech guide',
        userId: 'demo',
        medicalConditions: ['Helps with invites'],
      },
      {
        id: 'grandma',
        name: 'Dadi Maa',
        relationship: 'Grandmother • Blessings and bhajans',
      },
    ];

    const resolvedMembers = memberSource ?? placeholderMembers;
    const usingPlaceholder = memberSource === null;

    const derived = resolvedMembers.slice(0, 24).map((member, index) => {
      const joined = Boolean(member.userId);
      const name = member.name || 'Parivar Friend';
      const ageLabel = member.dob ? `Age ${getAgeFromDate(member.dob)}` : null;
      const genderLabel = member.gender || null;
      const relationLabel = member.relationship || null;
      return {
        id: member.id ?? `${name}-${index}`,
        name,
        relation: member.relationship || 'Loved one',
        statusLabel: joined ? 'Onboarded' : 'Invite pending',
        tags: [
          ageLabel,
          genderLabel,
          relationLabel,
        ].filter(Boolean) as string[],
        note: member.phoneNumber ? `Phone: ${member.phoneNumber}` : undefined,
        joined,
        raw: member,
      };
    });

    return {
      list: derived,
      usingPlaceholder,
    };
  }, [isParivarMembers, resolveMembers]);

  if (!config) {
    return <Redirect href="/(tabs)" />;
  }

  const canMutateMembers = hasCreatedParivar && !parivarMembers.usingPlaceholder;

  const handleMemberUpdate = (member: CreateParivarMemberDraft) => {
    if (!member) {
      return;
    }

    setShowMemberForm(false);
    const medicalString = Array.isArray(member.medicalConditions)
      ? member.medicalConditions.join(', ')
      : member.medicalConditions || defaultMedicalSelections;

    setMemberForm({
      name: member.name ?? '',
      relationship: member.relationship ?? '',
      gender: member.gender ?? '',
      bloodGroup: member.bloodGroup ?? '',
      dob: member.dob ?? '',
      dobDate: member.dob ? parseDateString(member.dob) : null,
      medicalConditions: medicalString || defaultMedicalSelections,
      phoneNumber: extractLocalPhone(member.phoneNumber),
    });
    setMemberFormVersion((value) => value + 1);
    setMemberTempDob(member.dob ? parseDateString(member.dob) : new Date(1990, 0, 1));
    setEditingMemberId(member.id ?? null);
    setSelectionPicker(null);
  };

  const handleMemberNudge = (name: string) => {
    Alert.alert('Gentle nudge sent', `${name} will receive a reminder to complete their profile.`);
  };

  const handleMemberInvite = (name: string) => {
    Alert.alert('Invite sent', `${name} will receive a fresh invite to join your Parivar.`);
  };

  const handleOpenMemberForm = () => {
    if (!familyId) {
      Alert.alert('Create a Parivar', 'Please create your Parivar before inviting members.');
      return;
    }
    setMemberForm(createEmptyMemberForm());
    setMemberFormVersion((value) => value + 1);
    setShowMemberForm(true);
    setSelectionPicker(null);
    setEditingMemberId(null);
  };

  const handleCancelMemberForm = () => {
    setShowMemberForm(false);
    setMemberForm(createEmptyMemberForm());
    setSelectionPicker(null);
    setMemberDobPickerVisible(false);
    setEditingMemberId(null);
  };

  const handleQuickMemberSubmit = async () => {
    if (!firebaseDb || !familyId) {
      Alert.alert('Unable to add member', 'Make sure you are connected and part of a family.');
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

      const currentMembers = resolveMembers();
      const memberId = editingMemberId ?? generateMemberId();
      const existingEntry = currentMembers.find((member) => member.id === memberId);
      const hydratedMember: CreateParivarMemberDraft = {
        id: memberId,
        name,
        relationship,
        gender: memberForm.gender || undefined,
        bloodGroup: bloodGroup || undefined,
        dob: memberForm.dob || undefined,
        medicalConditions: medicalConditions.length ? medicalConditions : undefined,
        phoneNumber: cleanedPhone ? `${defaultPhoneCountryCode}${cleanedPhone}` : undefined,
      };
      const normalizedMember: CreateParivarMemberDraft = {
        ...existingEntry,
        ...hydratedMember,
      };

      const nextMembers = editingMemberId
        ? currentMembers.map((member) => (member.id === memberId ? normalizedMember : member))
        : [...currentMembers, normalizedMember];

      const serializedMembers = sanitizeFamilyMembers(nextMembers);

      const familyRef = doc(firebaseDb, 'families', familyId);
      await updateDoc(familyRef, {
        members: serializedMembers,
        memberCount: serializedMembers.length,
        updatedAt: serverTimestamp(),
      });

      if (normalizedMember.id) {
        const invitePayload: Record<string, unknown> = {
          name,
          relationship,
          familyId,
          updatedAt: serverTimestamp(),
        };
        if (memberForm.gender) invitePayload.gender = memberForm.gender;
        if (bloodGroup) invitePayload.bloodGroup = bloodGroup;
        if (memberForm.dob) invitePayload.dob = memberForm.dob;
        if (medicalConditions.length) invitePayload.medicalConditions = medicalConditions;
        if (cleanedPhone) {
          invitePayload.phoneNumber = `${defaultPhoneCountryCode}${cleanedPhone}`;
        }
        if (!normalizedMember.userId) {
          invitePayload.status = 'INVITED';
          invitePayload.invitedBy = user?.uid ?? null;
        }
        await setDoc(doc(firebaseDb, 'users', normalizedMember.id), invitePayload, { merge: true });
      }

      if (user) {
        await setDoc(
          doc(firebaseDb, 'users', user.uid),
          {
            latestFamilyDraft: {
              familyId,
              familyName: familyDisplayName,
              members: nextMembers.map((member) => ({
                id: member.id,
                name: member.name,
                relationship: member.relationship ?? 'Family',
              })),
              updatedAt: serverTimestamp(),
            },
          },
          { merge: true }
        );
      }

      setRemoteMembers(nextMembers);
      setShowMemberForm(false);
      setEditingMemberId(null);
      setMemberForm(createEmptyMemberForm());
      setSelectionPicker(null);
      Alert.alert(
        editingMemberId ? 'Member updated' : 'Member added',
        `${name} has been ${editingMemberId ? 'updated' : 'added'} to your Parivar.`
      );
    } catch (error) {
      console.warn('Failed to add member from quick stats', error);
      Alert.alert('Unable to add member', 'Please try again in a moment.');
    } finally {
      setMemberSaving(false);
    }
  };

  const handlePickerDone = () => {
    if (!selectionPicker) {
      return;
    }
    const value = selectionPicker.tempValue;
    if (selectionPicker.type === 'relationship') {
      setMemberForm((prev) => ({ ...prev, relationship: value }));
    } else if (selectionPicker.type === 'gender') {
      setMemberForm((prev) => ({ ...prev, gender: value }));
    } else {
      setMemberForm((prev) => ({ ...prev, bloodGroup: value }));
    }
    setSelectionPicker(null);
  };


const renderMemberForm = (mode: 'add' | 'edit') => {
  const isEdit = mode === 'edit';
  return (
    <Card padding="$4" backgroundColor={colors.cardBackground} shadowColor={colors.shadow} shadowRadius={18} gap="$3">
      <YStack gap="$2">
        <Text fontSize={responsiveFont(16)} fontWeight="700" color={colors.text}>
          {isEdit ? 'Update family member' : 'Add a family member'}
        </Text>
        <Text color={colors.secondary} fontSize={responsiveFont(13)}>
          {isEdit
            ? 'Edit this member’s details and we will keep everything in sync.'
            : 'These details help keep everyone nurtured and connected.'}
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
            bg={colors.background}
            borderColor={colors.shadow}
            borderWidth={1}
            color={colors.text}
            placeholderTextColor={colors.secondary}
          />
        </YStack>

        <YStack gap="$2">
          <Text fontWeight="600" color={colors.text}>
            Relationship
          </Text>
          <Button
            size="$4"
            backgroundColor={colors.background}
            borderColor={colors.shadow}
            borderWidth={1}
            justifyContent="flex-start"
            onPress={() =>
              setSelectionPicker({ type: 'relationship', tempValue: memberForm.relationship || '' })
            }
          >
            <Text color={memberForm.relationship ? colors.text : colors.secondary}>
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
            borderColor={colors.shadow}
            paddingHorizontal="$3"
            paddingVertical="$2"
            backgroundColor={colors.background}
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
              placeholderTextColor={colors.secondary}
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
            backgroundColor={colors.background}
            borderColor={colors.shadow}
            borderWidth={1}
            justifyContent="flex-start"
            onPress={() => setSelectionPicker({ type: 'gender', tempValue: memberForm.gender || '' })}
          >
            <Text color={memberForm.gender ? colors.text : colors.secondary}>
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
            backgroundColor={colors.background}
            borderColor={colors.shadow}
            borderWidth={1}
            justifyContent="flex-start"
            onPress={() => setSelectionPicker({ type: 'blood', tempValue: memberForm.bloodGroup || '' })}
          >
            <Text color={memberForm.bloodGroup ? colors.text : colors.secondary}>
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
            backgroundColor={colors.background}
            borderColor={colors.shadow}
            borderWidth={1}
            justifyContent="flex-start"
            onPress={() => {
              const existing = memberForm.dob ? parseDateString(memberForm.dob) : undefined;
              setMemberTempDob(existing ?? new Date(1990, 0, 1));
              setMemberDobPickerVisible(true);
            }}
          >
            <Text color={memberForm.dob ? colors.text : colors.secondary}>
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

                      let next;
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
        <Button flex={1} backgroundColor={colors.cardBackground} onPress={handleCancelMemberForm}>
          <Text color={colors.text} fontWeight="600">
            Cancel
          </Text>
        </Button>
        <Button
          flex={1}
          backgroundColor={palette.accent}
          onPress={handleQuickMemberSubmit}
          disabled={memberSaving}
        >
          <Text color={palette.accentForeground} fontWeight="600">
            {memberSaving ? 'Saving...' : isEdit ? 'Update member' : 'Save member'}
          </Text>
        </Button>
      </XStack>
    </Card>
  );
};

  const renderParivarMembersContent = () => (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingHorizontal: BrandSpacing.gutter,
        paddingVertical: BrandSpacing.stackGap,
        gap: BrandSpacing.stackGap,
      }}
      showsVerticalScrollIndicator={false}
    >
      <YStack gap="$2">
        <XStack ai="center" jc="space-between" flexWrap="wrap" gap="$2">
          <Text fontFamily={BrandTypography.tagline.fontFamily} fontSize={responsiveFont(18)} color={colors.text}>
            Parivar members
          </Text>
          <Button
            size="$3"
            backgroundColor={showMemberForm ? colors.cardBackground : palette.accent}
            color={showMemberForm ? colors.text : palette.accentForeground}
            onPress={showMemberForm ? handleCancelMemberForm : handleOpenMemberForm}
            disabled={!familyId || Boolean(editingMemberId)}
          >
            {showMemberForm ? 'Close form' : 'Add member'}
          </Button>
        </XStack>
        <Text color={colors.secondary} fontSize={responsiveFont(13)}>
          Add new loved ones directly from here or view everyone already connected to your Parivar.
        </Text>
      </YStack>

      {showMemberForm && (
        <View key={`add-form-${memberFormVersion}`}>{renderMemberForm('add')}</View>
      )}

      {membersLoading ? (
        <Text color={colors.secondary} fontSize={responsiveFont(12)}>
          Syncing the latest member list…
        </Text>
      ) : null}

      {!membersLoading && !parivarMembers.list.length && !parivarMembers.usingPlaceholder ? (
        <Card
          padding="$4"
          borderRadius="$8"
          backgroundColor={colors.cardBackground}
          shadowColor={colors.shadow}
          shadowRadius={16}
          gap="$2"
        >
          <Text fontWeight="600" color={colors.text}>
            No members yet
          </Text>
          <Text color={colors.secondary} fontSize={responsiveFont(13)}>
            Start adding your loved ones from Kutumb Kendra to see them here.
          </Text>
        </Card>
      ) : (
        <>
          {parivarMembers.usingPlaceholder ? (
            <Text color={colors.muted} fontSize={responsiveFont(12)}>
              Preview data while we finish syncing your real Parivar members.
            </Text>
          ) : null}
          <YStack gap="$3">
            {parivarMembers.list.map((member) => {
              const isEditingMember = editingMemberId === member.id;
              if (isEditingMember) {
                return <View key={`${member.id}-edit-${memberFormVersion}`}>{renderMemberForm('edit')}</View>;
              }

              return (
                <ParivarMemberCard
                  key={member.id}
                  name={member.name}
                  relation={member.relation}
                  statusLabel={member.statusLabel}
                  note={member.note}
                  tags={member.tags}
                  actions={
                    canMutateMembers ? (
                      <XStack gap="$2" flexWrap="wrap">
                        {!member.joined ? (
                          <Button
                            size="$3"
                            backgroundColor={palette.accent}
                            color={palette.accentForeground}
                            onPress={() => handleMemberInvite(member.name)}
                          >
                            Invite
                          </Button>
                        ) : null}
                        <Button
                          size="$3"
                          backgroundColor={palette.surfaceAlt}
                          color={colors.text}
                          onPress={() => handleMemberUpdate(member.raw)}
                        >
                          Update
                        </Button>
                        {member.joined ? (
                          <Button
                            size="$3"
                            backgroundColor={palette.accent}
                            color={palette.accentForeground}
                            onPress={() => handleMemberNudge(member.name)}
                          >
                            Nudge
                          </Button>
                        ) : null}
                      </XStack>
                    ) : undefined
                  }
                />
              );
            })}
          </YStack>
        </>
      )}
    </ScrollView>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: isParivarMembers ? '' : config.title,
          headerShown: !isParivarMembers,
          headerBackTitle: 'Back',
        }}
      />
      {isParivarMembers ? (
        renderParivarMembersContent()
      ) : (
        <ScrollView
          style={{ flex: 1, backgroundColor: colors.background }}
          contentContainerStyle={{
            paddingHorizontal: BrandSpacing.gutter,
            paddingVertical: BrandSpacing.stackGap,
            gap: BrandSpacing.stackGap,
          }}
          showsVerticalScrollIndicator={false}
        >
          <YStack gap="$3">
            <Text fontFamily={BrandTypography.tagline.fontFamily} fontSize={responsiveFont(16)} color={colors.text}>
              At a glance
            </Text>
            <Card
              padding="$4"
              borderRadius="$8"
              backgroundColor={colors.highlightBackground}
              gap="$2"
              shadowColor={colors.shadow}
              shadowRadius={18}
            >
              <Text color={colors.text} fontSize={responsiveFont(12)} textTransform="uppercase" letterSpacing={0.6}>
                {config.hero.label}
              </Text>
              <Text color={colors.text} fontSize={responsiveFont(32)} fontWeight="700">
                {config.hero.value}
              </Text>
              <Text color={colors.secondary} fontSize={responsiveFont(13)}>
                {config.hero.caption}
              </Text>
              <Text color={colors.secondary} fontSize={responsiveFont(13)}>
                {config.overview}
              </Text>
            </Card>
          </YStack>

          <YStack gap="$3">
            <Text fontFamily={BrandTypography.tagline.fontFamily} fontSize={responsiveFont(16)} color={colors.text}>
              Key metrics
            </Text>
            <XStack gap="$3" flexWrap="wrap">
              {config.metrics.map((metric) => (
                <StatsCard
                  key={metric.title}
                  title={metric.title}
                  value={metric.value}
                  description={metric.description}
                  layout="half"
                />
              ))}
            </XStack>
          </YStack>

          <YStack gap="$3">
            <Text fontFamily={BrandTypography.tagline.fontFamily} fontSize={responsiveFont(16)} color={colors.text}>
              Focus areas
            </Text>
            <YStack gap="$3">
              {config.focusAreas.map((area) => (
                <Card
                  key={area.title}
                  padding="$4"
                  borderRadius="$8"
                  backgroundColor={colors.cardBackground}
                  gap="$2"
                  shadowColor={colors.shadow}
                  shadowRadius={16}
                >
                  <Text fontWeight="600" fontSize={responsiveFont(15)} color={colors.text}>
                    {area.title}
                  </Text>
                  <Text
                    color={colors.secondary}
                    fontSize={responsiveFont(13)}
                    lineHeight={responsiveFont(18, { minMultiplier: 0.9, maxMultiplier: 1.05 })}
                  >
                    {area.description}
                  </Text>
                </Card>
              ))}
            </YStack>
          </YStack>

          <YStack gap="$3">
            <Text fontFamily={BrandTypography.tagline.fontFamily} fontSize={responsiveFont(16)} color={colors.text}>
              Recommended next steps
            </Text>
            <Card
              padding="$4"
              borderRadius="$8"
              backgroundColor={colors.cardBackground}
              gap="$3"
              shadowColor={colors.shadow}
              shadowRadius={16}
            >
              <YStack gap="$2">
                {config.suggestions.map((suggestion) => (
                  <Text
                    key={suggestion}
                    color={colors.secondary}
                    fontSize={responsiveFont(13)}
                    lineHeight={responsiveFont(18, { minMultiplier: 0.9, maxMultiplier: 1.05 })}
                  >
                    {`\u2022 ${suggestion}`}
                  </Text>
                ))}
              </YStack>
              <Text color={colors.muted} fontSize={responsiveFont(12)}>
                Tip: periodic check-ins keep everyone aligned and nurtured.
              </Text>
            </Card>
          </YStack>
        </ScrollView>
      )}

      {selectionPicker && (
        <Modal transparent animationType="fade" visible>
          <YStack f={1} bg="rgba(0,0,0,0.45)" padding="$4" jc="center" ai="center">
            <View
              style={{
                backgroundColor: colors.cardBackground,
                borderRadius: 16,
                width: '100%',
                maxWidth: 360,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: colors.shadow,
              }}
            >
              <Picker
                selectedValue={selectionPicker.tempValue}
                onValueChange={(value) =>
                  setSelectionPicker((prev) => (prev ? { ...prev, tempValue: value } : prev))
                }
                style={{ color: colors.text, backgroundColor: colors.background }}
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
              <XStack borderTopWidth={1} borderTopColor={colors.shadow}>
                <Button f={1} backgroundColor={colors.cardBackground} onPress={() => setSelectionPicker(null)}>
                  <Text color={colors.text} fontWeight="600">
                    Cancel
                  </Text>
                </Button>
                <Button f={1} backgroundColor={palette.accent} onPress={handlePickerDone}>
                  <Text color={palette.accentForeground} fontWeight="600">
                    Done
                  </Text>
                </Button>
              </XStack>
            </View>
          </YStack>
        </Modal>
      )}

      {memberDobPickerVisible && (
        <Modal transparent animationType="fade" visible>
          <YStack f={1} bg="rgba(0,0,0,0.45)" jc="center" ai="center" padding="$4">
            <Card
              width="100%"
              maxWidth={420}
              padding="$4"
              gap="$3"
              backgroundColor={colors.cardBackground}
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
                themeVariant={themeName === 'dark' ? 'dark' : 'light'}
                textColor={colors.text}
              />
              <XStack gap="$3">
                <Button flex={1} backgroundColor={colors.cardBackground} onPress={() => setMemberDobPickerVisible(false)}>
                  <Text color={colors.text} fontWeight="600">
                    Cancel
                  </Text>
                </Button>
                <Button
                  flex={1}
                  backgroundColor={palette.accent}
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
      )}
    </>
  );
}
