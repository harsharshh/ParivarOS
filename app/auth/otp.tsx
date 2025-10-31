import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { PhoneAuthProvider, RecaptchaVerifier, UserCredential, signInWithCredential } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, Text, XStack, YStack } from 'tamagui';

import {
  firebaseAuth,
  firebaseDb,
  firebaseOptions,
  isFirebaseConfigured,
} from '@/config/firebase';
import { ThemeColors, accentPalette } from '@/constants/tamagui-theme';
import { BrandLogoMark, BrandSpacing, BrandTypography } from '@/design-system';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { withAlpha } from '@/utils/color';

const DEFAULT_DIAL_CODE = '+91';

export default function OtpAuthScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const firebaseReady = Boolean(isFirebaseConfigured && firebaseAuth && firebaseOptions);

  const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal>(null);
  const webRecaptchaVerifier = useRef<RecaptchaVerifier | null>(null);

  const [localNumber, setLocalNumber] = useState('');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const themePalette = ThemeColors[colorScheme];
  const accentSpectrum = accentPalette[colorScheme];

  const colors = useMemo(() => {
    const accent = themePalette.accent;
    return {
      background: themePalette.background,
      card: themePalette.surface,
      surfaceMuted: themePalette.surfaceMuted,
      border: themePalette.border,
      outline: withAlpha(accent, colorScheme === 'dark' ? 0.42 : 0.28),
      inputBorder: withAlpha(themePalette.text, colorScheme === 'dark' ? 0.3 : 0.18),
      inputBackground: withAlpha(themePalette.inputBackground, colorScheme === 'dark' ? 0.9 : 0.92),
      text: themePalette.text,
      secondary: themePalette.subtleText,
      muted: themePalette.mutedText,
      accent,
      accentForeground: themePalette.accentForeground,
      accentStrong: themePalette.accentStrong,
      shadow: themePalette.elevatedShadow,
      danger: themePalette.danger,
      dangerForeground: themePalette.dangerForeground,
    };
  }, [colorScheme, themePalette]);

  const gradientColors = useMemo(() => {
    const highlight = withAlpha(accentSpectrum[colorScheme === 'dark' ? 8 : 6], colorScheme === 'dark' ? 0.85 : 0.55);
    const base = colors.background;
    return colorScheme === 'dark' ? [highlight, base] : [base, highlight];
  }, [accentSpectrum, colorScheme, colors.background]);

  const ensureWebRecaptcha = useCallback(() => {
    if (Platform.OS !== 'web' || !firebaseReady || !firebaseAuth || typeof document === 'undefined') {
      return null;
    }

    const containerId = 'parivaros-recaptcha-container';

    if (!webRecaptchaVerifier.current) {
      let container = document.getElementById(containerId);
      if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        container.style.display = 'none';
        document.body.appendChild(container);
      }

      webRecaptchaVerifier.current = new RecaptchaVerifier(
        firebaseAuth,
        container,
        {
          size: 'invisible',
        }
      );
    }

    return webRecaptchaVerifier.current;
  }, [firebaseReady]);

  useEffect(() => {
    ensureWebRecaptcha();

    return () => {
      if (Platform.OS !== 'web' || typeof document === 'undefined') {
        return;
      }

      if (webRecaptchaVerifier.current) {
        webRecaptchaVerifier.current.clear();
        webRecaptchaVerifier.current = null;
      }

      const container = document.getElementById('parivaros-recaptcha-container');
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };
  }, [ensureWebRecaptcha]);

  async function handleSendCode() {
    if (!firebaseReady || !firebaseAuth || !firebaseOptions) {
      setErrorMessage('Firebase is not configured yet. Please try again later.');
      return;
    }

    setErrorMessage(null);
    setStatusMessage(null);

    const sanitized = localNumber.replace(/\D/g, '');

    if (sanitized.length < 10) {
      setErrorMessage('Enter a valid 10-digit mobile number.');
      return;
    }

    const formatted = `${DEFAULT_DIAL_CODE}${sanitized}`;

    try {
      setSendingCode(true);
      const phoneProvider = new PhoneAuthProvider(firebaseAuth);
      const verifier = Platform.OS === 'web' ? ensureWebRecaptcha() : recaptchaVerifier.current;

      if (!verifier) {
        setErrorMessage('Unable to start verification. Please try again.');
        return;
      }

      const id = await phoneProvider.verifyPhoneNumber(
        formatted,
        verifier
      );
      setVerificationId(id);
      setStatusMessage('OTP sent! Please check your phone.');
      if (Platform.OS === 'web') {
        webRecaptchaVerifier.current?.clear();
        webRecaptchaVerifier.current = null;
        ensureWebRecaptcha();
      }
    } catch (error: unknown) {
      console.error('Error sending OTP', error);
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to send OTP. Try again.'
      );
    } finally {
      setSendingCode(false);
    }
  }

  async function ensureUserDocument(userCredential: UserCredential) {
    if (!firebaseDb) {
      return;
    }
    const { user } = userCredential;
    if (!user) {
      return;
    }

    const userRef = doc(firebaseDb, 'users', user.uid);
    const existing = await getDoc(userRef);
    const timestamp = serverTimestamp();

    await setDoc(
      userRef,
      {
        uid: user.uid,
        phoneNumber: user.phoneNumber,
        displayName: user.displayName ?? null,
        photoURL: user.photoURL ?? null,
        updatedAt: timestamp,
        createdAt: existing.exists() ? existing.data()?.createdAt ?? timestamp : timestamp,
      },
      { merge: true }
    );
  }

  async function handleVerifyCode() {
    if (!firebaseReady || !firebaseAuth) {
      setErrorMessage('Firebase is not configured yet. Please try again later.');
      return;
    }

    if (!verificationId) {
      setErrorMessage('Request an OTP first.');
      return;
    }

    if (!verificationCode || verificationCode.length < 6) {
      setErrorMessage('Enter the 6-digit OTP you received.');
      return;
    }

    try {
      setVerifyingCode(true);
      setErrorMessage(null);
      setStatusMessage(null);

      const credential = PhoneAuthProvider.credential(
        verificationId,
        verificationCode
      );
      const userCredential = await signInWithCredential(firebaseAuth, credential);
      await ensureUserDocument(userCredential);

      setStatusMessage('Verification successful! Redirecting…');
      if (firebaseDb && userCredential.user) {
        try {
          const profileSnapshot = await getDoc(doc(firebaseDb, 'users', userCredential.user.uid));
          const profileData = profileSnapshot.exists() ? profileSnapshot.data() : null;
          const hasProfile =
            profileData &&
            typeof profileData.name === 'string' &&
            profileData.name.trim().length > 0 &&
            typeof profileData.bloodGroup === 'string' &&
            profileData.bloodGroup.trim().length > 0 &&
            typeof profileData.dob === 'string' &&
            profileData.dob.trim().length > 0;

          router.replace(hasProfile ? '/(tabs)' : '/onboarding');
        } catch (error) {
          console.warn('Failed to check profile after OTP verification', error);
          router.replace('/(tabs)');
        }
      } else {
        router.replace('/(tabs)');
      }
    } catch (error: unknown) {
      console.error('Error verifying OTP', error);
      setErrorMessage(
        error instanceof Error ? error.message : 'Invalid OTP. Please try again.'
      );
    } finally {
      setVerifyingCode(false);
    }
  }

  return (
    <LinearGradient
      colors={gradientColors}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {firebaseReady && firebaseOptions && (
        <FirebaseRecaptchaVerifierModal
          ref={recaptchaVerifier}
          firebaseConfig={firebaseOptions}
          attemptInvisibleVerification
        />
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
            <YStack
              f={1}
              ai="center"
              jc="center"
              paddingHorizontal={BrandSpacing.gutter}
              paddingVertical={BrandSpacing.stackGap}
              gap={BrandSpacing.stackGap}
              backgroundColor="transparent"
            >
              <YStack ai="center" gap="$4">
                <BrandLogoMark size={128} />
                <Text
                  fontFamily={BrandTypography.logo.fontFamily}
                  fontWeight={BrandTypography.logo.fontWeight}
                  fontSize={30}
                  color={colors.text}
                >
                  ParivarOS
                </Text>
                <Text
                  fontFamily={BrandTypography.tagline.fontFamily}
                  fontWeight={BrandTypography.tagline.fontWeight}
                  letterSpacing={BrandTypography.tagline.letterSpacing}
                  color={colors.secondary}
                  textAlign="center"
                >
                  Connect. Care. Celebrate.
                </Text>
              </YStack>

              <YStack
                width="100%"
                maxWidth={360}
                backgroundColor={colors.card}
                borderRadius="$6"
                padding="$6"
                gap="$4"
                shadowColor={colors.shadow}
                shadowRadius={24}
              >
                <YStack gap="$2">
                  <Text
                    fontFamily={BrandTypography.caption.fontFamily}
                    fontWeight={BrandTypography.caption.fontWeight}
                    color={colors.text}
                  >
                    Mobile Number
                  </Text>
                  <XStack
                    ai="center"
                    gap="$3"
                    borderRadius="$5"
                    borderWidth={1}
                    borderColor={colors.inputBorder}
                    paddingHorizontal="$3"
                    paddingVertical="$2"
                    backgroundColor={colors.inputBackground}
                  >
                    <Text
                      fontFamily={BrandTypography.caption.fontFamily}
                      fontWeight={BrandTypography.caption.fontWeight}
                      color={colors.text}
                    >
                      {DEFAULT_DIAL_CODE}
                    </Text>
                    <Input
                      flex={1}
                      borderWidth={0}
                      backgroundColor="transparent"
                      value={localNumber}
                      onChangeText={(value) => setLocalNumber(value.replace(/\D/g, ''))}
                      keyboardType="phone-pad"
                      autoComplete="tel"
                      placeholder="Enter your number"
                      size="$5"
                      textAlign="center"
                      color={colors.text}
                      placeholderTextColor={withAlpha(colors.text, 0.4)}
                      returnKeyType="done"
                      blurOnSubmit
                      onSubmitEditing={Keyboard.dismiss}
                    />
                  </XStack>
                  <Button
                    size="$4"
                    onPress={handleSendCode}
                    disabled={sendingCode || !firebaseReady}
                    backgroundColor={colors.accent}
                    pressStyle={{ scale: 0.97, backgroundColor: colors.accentStrong }}
                    opacity={sendingCode || !firebaseReady ? 0.6 : 1}
                    borderRadius="$5"
                  >
                    <Text color={colors.accentForeground} fontWeight="700">
                      {sendingCode ? 'Sending…' : 'Send OTP'}
                    </Text>
                  </Button>
                </YStack>

                {verificationId && (
                  <YStack gap="$2">
                    <Text
                      fontFamily={BrandTypography.caption.fontFamily}
                      fontWeight={BrandTypography.caption.fontWeight}
                      color={colors.text}
                    >
                      Enter OTP
                    </Text>
                    <Input
                      value={verificationCode}
                      onChangeText={setVerificationCode}
                      keyboardType="number-pad"
                      maxLength={6}
                      placeholder="••••••"
                      size="$5"
                      textAlign="center"
                      color={colors.text}
                      backgroundColor={colors.inputBackground}
                      borderWidth={1}
                      borderColor={colors.inputBorder}
                      placeholderTextColor={withAlpha(colors.text, 0.4)}
                      returnKeyType="done"
                      blurOnSubmit
                      onSubmitEditing={Keyboard.dismiss}
                    />
                    <Button
                      size="$4"
                      onPress={handleVerifyCode}
                      disabled={verifyingCode || !firebaseReady}
                      backgroundColor={colors.accentStrong}
                      pressStyle={{ scale: 0.97 }}
                      opacity={verifyingCode || !firebaseReady ? 0.6 : 1}
                      borderRadius="$5"
                    >
                      <Text color={colors.accentForeground} fontWeight="700">
                        {verifyingCode ? 'Verifying…' : 'Verify & Continue'}
                      </Text>
                    </Button>
                  </YStack>
                )}

                {statusMessage && (
                  <Text color={colors.secondary} textAlign="center">
                    {statusMessage}
                  </Text>
                )}

                {errorMessage && (
                  <Text color={colors.danger} textAlign="center">
                    {errorMessage}
                  </Text>
                )}
                {!firebaseReady && !errorMessage && (
                  <Text color={colors.muted} textAlign="center">
                    Firebase setup is required to complete sign in. Add your project keys to app.json.
                  </Text>
                )}
              </YStack>
            </YStack>
          </Pressable>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
