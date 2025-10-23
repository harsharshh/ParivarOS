import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Input, Text, XStack, YStack } from 'tamagui';
import { doc, setDoc } from 'firebase/firestore';

import { BrandLogoMark, BrandSpacing, BrandTypography } from '@/design-system';
import { firebaseAuth, firebaseDb } from '@/config/firebase';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const medicalOptions = ['None', 'Diabetes', 'Hypertension', 'Asthma', 'Allergies', 'Heart Conditions'];

export default function OnboardingScreen() {
  const router = useRouter();
  const user = firebaseAuth?.currentUser;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [dobDate, setDobDate] = useState<Date | undefined>(undefined);
  const [bloodGroup, setBloodGroup] = useState<string>('');
  const [showBloodPicker, setShowBloodPicker] = useState(false);
  const [tempDob, setTempDob] = useState<Date>(new Date(1990, 0, 1));
  const [medicalHistory, setMedicalHistory] = useState<string[]>(['None']);
  const [busy, setBusy] = useState(false);

  const isComplete = name.trim() && email.trim() && dob.trim() && bloodGroup.trim();
  const canSave = Boolean(isComplete && firebaseDb && user);

  async function handleContinue() {
    if (!canSave || !firebaseDb || !user) {
      return;
    }

    try {
      setBusy(true);
      const normalizedHistory = medicalHistory.includes('None') ? [] : medicalHistory;
      const userRef = doc(firebaseDb, 'users', user.uid);
      await setDoc(
        userRef,
        {
          name: name.trim(),
          email: email.trim(),
          dob,
          bloodGroup,
          medicalHistory: normalizedHistory,
        },
        { merge: true }
      );
      router.replace('/(tabs)');
    } finally {
      setBusy(false);
    }
  }

  function toggleMedical(option: string) {
    setMedicalHistory((prev) => {
      if (option === 'None') {
        return prev.includes('None') ? ['None'] : ['None'];
      }

      const next = prev.filter((item) => item !== 'None');
      if (next.includes(option)) {
        const updated = next.filter((item) => item !== option);
        return updated.length === 0 ? ['None'] : updated;
      }
      return [...next, option];
    });
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <YStack
          f={1}
          bg="$background"
          paddingHorizontal="$4"
          paddingVertical={BrandSpacing.stackGap}
          gap="$5"
          jc="center"
        >
          <YStack ai="center" gap="$3" paddingHorizontal="$4">
            <BrandLogoMark size={88} />
            <Text
              fontFamily={BrandTypography.logo.fontFamily}
              fontWeight={BrandTypography.logo.fontWeight}
              fontSize={26}
              color="$color"
              textAlign="center"
            >
              Let&apos;s get to know you.
            </Text>
            <Text color="$color" opacity={0.7} textAlign="center" maxWidth={320}>
              These details help your parivar find you and keep you safe.
            </Text>
          </YStack>

          <Card
            elevate
            bordered
            padding="$5"
            gap="$5"
            backgroundColor="rgba(148,124,255,0.08)"
            borderColor="rgba(148,124,255,0.35)"
          >
            <YStack gap="$3">
              <Text fontFamily={BrandTypography.caption.fontFamily} color="$color" opacity={0.8}>
                Full Name
              </Text>
              <Input
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                size="$4"
                bg="$background"
              />
            </YStack>

            <YStack gap="$3">
              <Text fontFamily={BrandTypography.caption.fontFamily} color="$color" opacity={0.8}>
                Email Address
              </Text>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                size="$4"
                bg="$background"
              />
            </YStack>

          <XStack gap="$3" flexWrap="wrap">
            <YStack flex={1} gap="$3">
              <Text fontFamily={BrandTypography.caption.fontFamily} color="$color" opacity={0.8}>
                Date of Birth
              </Text>
                <Button
                  onPress={() => {
                    setTempDob(dobDate ?? new Date(1990, 0, 1));
                    setShowDobPicker(true);
                  }}
                  variant="outlined"
                  borderColor="rgba(148,124,255,0.4)"
                  justifyContent="flex-start"
                  size="$4"
                  bg="$background"
                >
                  <Text color="$color" opacity={dob ? 1 : 0.5}>
                    {dob || 'Select birth date'}
                  </Text>
                </Button>
              </YStack>
              <YStack flex={1} gap="$3">
                <Text fontFamily={BrandTypography.caption.fontFamily} color="$color" opacity={0.8}>
                  Blood Group
                </Text>
                <Button
                  onPress={() => setShowBloodPicker(true)}
                  variant="outlined"
                  borderColor="rgba(148,124,255,0.4)"
                  justifyContent="flex-start"
                  size="$4"
                  bg="$background"
                >
              <Text color="$color" opacity={bloodGroup ? 1 : 0.5}>
                {bloodGroup || 'A+/B+'}
              </Text>
            </Button>
          </YStack>

          <YStack flexBasis="100%" gap="$2">
            <Text fontFamily={BrandTypography.caption.fontFamily} color="$color" opacity={0.8}>
              Medical History
            </Text>
            <XStack flexWrap="wrap" gap="$2">
              {medicalOptions.map((option) => {
                const active = medicalHistory.includes(option);
                return (
                  <Button
                    key={option}
                    size="$2"
                    paddingHorizontal="$3"
                    paddingVertical="$1"
                    borderRadius="$4"
                    variant={active ? 'accent' : 'outlined'}
                    onPress={() => toggleMedical(option)}
                  >
                    <Text fontSize={12}>{option}</Text>
                  </Button>
                );
              })}
            </XStack>
          </YStack>
        </XStack>

      </Card>

        <Modal transparent visible={showBloodPicker} animationType="fade">
          <YStack f={1} bg="rgba(0,0,0,0.4)" jc="center" ai="center" padding="$4">
            <Card width="90%" padding="$4" gap="$3" bg="$background" borderRadius="$6">
              <Text fontFamily={BrandTypography.caption.fontFamily} color="$color" opacity={0.9}>
                Choose Blood Group
              </Text>
              <YStack bg="$background" borderRadius="$4" borderWidth={1} borderColor="rgba(148,124,255,0.4)">
                <Picker
                  selectedValue={bloodGroup}
                  onValueChange={(value) => setBloodGroup(value)}
                >
                  <Picker.Item label="Select" value="" />
                  {bloodGroups.map((group) => (
                    <Picker.Item key={group} label={group} value={group} />
                  ))}
                </Picker>
              </YStack>
              <Button theme="accent" onPress={() => setShowBloodPicker(false)}>
                Done
              </Button>
            </Card>
          </YStack>
        </Modal>

        <Modal transparent visible={showDobPicker} animationType="fade">
          <YStack f={1} bg="rgba(0,0,0,0.4)" jc="center" ai="center" padding="$4">
            <Card width="90%" padding="$4" gap="$3" bg="$background" borderRadius="$6">
              <Text fontFamily={BrandTypography.caption.fontFamily} color="$color" opacity={0.9}>
                Select Birth Date
              </Text>
              <DateTimePicker
                value={tempDob}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    setTempDob(selectedDate);
                  }
                }}
                maximumDate={new Date()}
              />
              <XStack gap="$3">
                <Button flex={1} variant="outlined" onPress={() => setShowDobPicker(false)}>
                  Cancel
                </Button>
                <Button
                  flex={1}
                  theme="accent"
                  onPress={() => {
                    setDobDate(tempDob);
                    setDob(tempDob.toISOString().split('T')[0]);
                    setShowDobPicker(false);
                  }}
                >
                  Done
                </Button>
              </XStack>
            </Card>
          </YStack>
        </Modal>
        <Button
          size="$5"
          themeInverse
          disabled={!canSave || busy}
          onPress={handleContinue}
        >
          {busy ? 'Saving…' : 'Continue'}
        </Button>
      </YStack>
    </KeyboardAvoidingView>
  </SafeAreaView>
  );
}
