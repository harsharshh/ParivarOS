import { PortalProvider as GorhomPortalProvider } from '@gorhom/portal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import 'react-native-reanimated';
import { PortalProvider as TamaguiPortalProvider, TamaguiProvider, Theme } from 'tamagui';

import { firebaseAuth, firebaseDb } from '@/config/firebase';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useInitialPermissions } from '@/hooks/use-initial-permissions';
import { PermissionsContext } from '@/hooks/use-permissions';
import tamaguiConfig from '@/tamagui.config';

type ThemePreference = {
  themeName: 'light' | 'dark';
  setThemeName: (value: 'light' | 'dark') => void;
};

const THEME_STORAGE_KEY = 'parivaros.theme';

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
  const [themeName, setThemeNameState] = useState<'light' | 'dark'>(colorScheme ?? 'light');
  const [isThemeHydrated, setThemeHydrated] = useState(false);
  const [hasUserPreference, setHasUserPreference] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string>('index');
  const [profileName, setProfileName] = useState<string | null>(null);
  const permissions = useInitialPermissions();
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
    const loadThemePreference = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme === 'light' || storedTheme === 'dark') {
          setThemeNameState(storedTheme);
          setHasUserPreference(true);
        }
      } catch (error) {
        console.warn('Failed to load theme preference', error);
      } finally {
        setThemeHydrated(true);
      }
    };

    void loadThemePreference();
  }, []);

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
  const handleSetThemeName = useCallback(
    (value: 'light' | 'dark') => {
      setThemeNameState(value);
      setHasUserPreference(true);
      void AsyncStorage.setItem(THEME_STORAGE_KEY, value).catch((error) => {
        console.warn('Failed to persist theme preference', error);
      });
    },
    []
  );

  const preferenceValue = useMemo(
    () => ({
      themeName,
      setThemeName: handleSetThemeName,
    }),
    [handleSetThemeName, themeName]
  );

  useEffect(() => {
    if (colorScheme && !hasUserPreference) {
      setThemeNameState(colorScheme);
    }
  }, [colorScheme, hasUserPreference]);

  if (!fontsLoaded || !isThemeHydrated) {
    return null;
  }

  return (
    <ThemePreferenceContext.Provider value={preferenceValue}>
      <PermissionsContext.Provider value={permissions}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <TamaguiProvider config={tamaguiConfig} defaultTheme={themeName}>
            <GorhomPortalProvider>
              <TamaguiPortalProvider>
                <ThemeProvider value={themeName === 'dark' ? DarkTheme : DefaultTheme}>
                  <Theme  name={themeName}>
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
                  <Stack.Screen name="create-parivar/index" options={{ headerShown: false }} />
                  <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                </Stack>
                    <StatusBar style="auto" />
                  </Theme>
                </ThemeProvider>
              </TamaguiPortalProvider>
            </GorhomPortalProvider>
          </TamaguiProvider>
        </GestureHandlerRootView>
      </PermissionsContext.Provider>
    </ThemePreferenceContext.Provider>
  );
}
