import { PortalProvider as GorhomPortalProvider } from '@gorhom/portal';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { createContext, useEffect, useMemo, useState } from 'react';
import 'react-native-reanimated';
import { PortalProvider as TamaguiPortalProvider, TamaguiProvider, Theme } from 'tamagui';
import { doc, getDoc } from 'firebase/firestore';

import { useColorScheme } from '@/hooks/use-color-scheme';
import tamaguiConfig from '@/tamagui.config';
import { firebaseAuth, firebaseDb } from '@/config/firebase';

type ThemePreference = {
  themeName: 'light' | 'dark';
  setThemeName: (value: 'light' | 'dark') => void;
};

export const ThemePreferenceContext = createContext<ThemePreference>({
  themeName: 'light',
  setThemeName: () => {},
});

export const unstable_settings = {
  anchor: '(tabs)',
};

void ExpoSplashScreen.preventAutoHideAsync().catch(() => {
  // no-op: prevent auto hide may fail in dev reloads
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [themeName, setThemeName] = useState<'light' | 'dark'>(colorScheme ?? 'light');
  const [initialRoute, setInitialRoute] = useState<string>('index');
  const [profileName, setProfileName] = useState<string | null>(null);
  const [fontsLoaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Regular.otf'),
    'Inter Bold': require('@tamagui/font-inter/otf/Inter-Bold.otf'),
    'Inter SemiBold': require('@tamagui/font-inter/otf/Inter-SemiBold.otf'),
    'Inter Medium': require('@tamagui/font-inter/otf/Inter-Medium.otf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      void ExpoSplashScreen.hideAsync().catch(() => {
        // ignore hide errors to avoid crashing during fast refresh
      });
    }
  }, [fontsLoaded]);

  useEffect(() => {
    const loadProfile = async () => {
      const user = firebaseAuth?.currentUser;
      if (!user || !firebaseDb) {
        return;
      }
      try {
        const snapshot = await getDoc(doc(firebaseDb, 'users', user.uid));
        if (snapshot.exists()) {
          const data = snapshot.data() as Record<string, unknown>;
          const extractedName = (data?.name as string | undefined)?.trim();
          const resolvedName =
            extractedName || user.displayName || user.email?.split('@')[0] || null;
          setProfileName(resolvedName);
          if (data?.name && data?.dob && data?.bloodGroup) {
            setInitialRoute('(tabs)');
          } else {
            setInitialRoute('onboarding/index');
          }
        }
      } catch (error) {
        console.warn('Unable to load user profile', error);
      }
    };

    void loadProfile();
  }, []);

  const stackInitialParams = useMemo(() => ({ profileName }), [profileName]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemePreferenceContext.Provider value={{ themeName, setThemeName }}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme={themeName}>
      <GorhomPortalProvider>
        <TamaguiPortalProvider>
          <ThemeProvider value={themeName === 'dark' ? DarkTheme : DefaultTheme}>
            <Theme name={themeName}>
              <Stack initialRouteName={initialRoute}>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="intro/index" options={{ headerShown: false }} />
                <Stack.Screen name="auth/otp" options={{ headerShown: false }} />
                <Stack.Screen
                  name="onboarding/index"
                  options={{ headerShown: false }}
                  initialParams={stackInitialParams}
                />
                <Stack.Screen
                  name="(tabs)"
                  options={{ headerShown: false }}
                  initialParams={stackInitialParams}
                />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              </Stack>
              <StatusBar style="auto" />
            </Theme>
          </ThemeProvider>
        </TamaguiPortalProvider>
      </GorhomPortalProvider>
    </TamaguiProvider>
    </ThemePreferenceContext.Provider>
  );
}
