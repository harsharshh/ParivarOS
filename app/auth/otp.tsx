import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  PhoneAuthProvider,
  signInWithCredential,
  UserCredential,
  RecaptchaVerifier,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, Text, XStack, YStack } from 'tamagui';

import {
  firebaseAuth,
  firebaseDb,
  firebaseOptions,
  isFirebaseConfigured,
} from '@/config/firebase';
import { BrandLogoMark, BrandSpacing, BrandTypography } from '@/design-system';
import { useColorScheme } from '@/hooks/use-color-scheme';

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

  const gradientColors = useMemo(() => {
    return colorScheme === 'dark'
      ? ['rgba(12,10,28,1)', 'rgba(28,24,64,0.92)']
      : ['rgba(232,228,255,1)', 'rgba(195,185,255,0.92)'];
  }, [colorScheme]);

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
      router.replace('/onboarding');
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

      <SafeAreaView style={{ flex: 1 }}>
        <YStack
          f={1}
          ai="center"
          jc="center"
          paddingHorizontal={BrandSpacing.gutter}
          paddingVertical={BrandSpacing.stackGap}
          gap={BrandSpacing.stackGap}
        >
          <YStack ai="center" gap="$4">
            <BrandLogoMark size={128} />
            <Text
              fontFamily={BrandTypography.logo.fontFamily}
              fontWeight={BrandTypography.logo.fontWeight}
              fontSize={30}
              color="$color"
            >
              ParivarOS
            </Text>
            <Text
              fontFamily={BrandTypography.tagline.fontFamily}
              fontWeight={BrandTypography.tagline.fontWeight}
              letterSpacing={BrandTypography.tagline.letterSpacing}
              color="$color"
              opacity={0.85}
              textAlign="center"
            >
              Connect. Care. Celebrate.
            </Text>
          </YStack>

          <YStack
            width="100%"
            maxWidth={360}
            bg="$background"
            borderRadius="$6"
            padding="$6"
            gap="$4"
            elevation={2}
            shadowColor="rgba(0,0,0,0.1)"
          >
            <YStack gap="$2">
              <Text
                fontFamily={BrandTypography.caption.fontFamily}
                fontWeight={BrandTypography.caption.fontWeight}
                color="$color"
                opacity={0.9}
              >
                Mobile Number
              </Text>
              <XStack
                ai="center"
                gap="$3"
                borderRadius="$5"
                borderWidth={1}
                borderColor="rgba(148,124,255,0.4)"
                paddingHorizontal="$3"
                paddingVertical="$2"
                bg="rgba(148,124,255,0.08)"
              >
                <Text
                  fontFamily={BrandTypography.caption.fontFamily}
                  fontWeight={BrandTypography.caption.fontWeight}
                  color="$color"
                  opacity={0.9}
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
                />
              </XStack>
              <Button
                size="$4"
                onPress={handleSendCode}
                disabled={sendingCode || !firebaseReady}
                theme="accent"
                borderRadius="$5"
              >
                {sendingCode ? 'Sending…' : 'Send OTP'}
              </Button>
            </YStack>

            {verificationId && (
              <YStack gap="$2">
                <Text
                  fontFamily={BrandTypography.caption.fontFamily}
                  fontWeight={BrandTypography.caption.fontWeight}
                  color="$color"
                  opacity={0.9}
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
                />
                <Button
                  size="$4"
                  onPress={handleVerifyCode}
                  disabled={verifyingCode || !firebaseReady}
                  themeInverse
                  borderRadius="$5"
                >
                  {verifyingCode ? 'Verifying…' : 'Verify & Continue'}
                </Button>
              </YStack>
            )}

            {statusMessage && (
              <Text color="$color" opacity={0.8} textAlign="center">
                {statusMessage}
              </Text>
            )}

            {errorMessage && (
              <Text color="$red10" textAlign="center">
                {errorMessage}
              </Text>
            )}
            {!firebaseReady && !errorMessage && (
              <Text color="$color" opacity={0.7} textAlign="center">
                Firebase setup is required to complete sign in. Add your project keys to app.json.
              </Text>
            )}
          </YStack>
        </YStack>
      </SafeAreaView>
    </LinearGradient>
  );
}
