import { useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

import { SplashScreenContent } from '@/components/splash-screen';
import { firebaseAuth, firebaseDb } from '@/config/firebase';

export default function SplashScreenRoute() {
  const router = useRouter();
  const resolvedRef = useRef(false);

  const routeAfterIntroCheck = useCallback(async () => {
    try {
      const flag = await AsyncStorage.getItem('parivaros_intro_complete');
      resolvedRef.current = true;
      router.replace(flag === 'true' ? '/auth/otp' : '/intro');
    } catch (error) {
      console.warn('Failed to read intro completion flag', error);
      resolvedRef.current = true;
      router.replace('/intro');
    }
  }, [router]);

  useEffect(() => {
    if (!firebaseAuth) {
      let cancelled = false;
      void (async () => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        if (!cancelled && !resolvedRef.current) {
          await routeAfterIntroCheck();
        }
      })();

      return () => {
        cancelled = true;
        resolvedRef.current = true;
      };
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (resolvedRef.current) {
        return;
      }

      if (!user) {
        await routeAfterIntroCheck();
        return;
      }

      if (!firebaseDb) {
        resolvedRef.current = true;
        router.replace('/(tabs)');
        return;
      }

      try {
        const snapshot = await getDoc(doc(firebaseDb, 'users', user.uid));
        const profile = snapshot.exists() ? snapshot.data() : null;
        const hasProfile = Boolean(profile && profile.name && profile.bloodGroup && profile.dob);
        resolvedRef.current = true;
        router.replace(hasProfile ? '/(tabs)' : '/onboarding');
      } catch (error) {
        console.warn('Failed to load profile, continuing to dashboard', error);
        resolvedRef.current = true;
        router.replace('/(tabs)');
      }
    });

    return () => {
      resolvedRef.current = true;
      unsubscribe();
    };
  }, [routeAfterIntroCheck, router]);

  return <SplashScreenContent />;
}
