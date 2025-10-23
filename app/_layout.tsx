import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { PortalProvider as GorhomPortalProvider } from '@gorhom/portal';
import { TamaguiProvider, Theme, PortalProvider as TamaguiPortalProvider } from 'tamagui';
import * as ExpoSplashScreen from 'expo-splash-screen';

import { useColorScheme } from '@/hooks/use-color-scheme';
import tamaguiConfig from '@/tamagui.config';

export const unstable_settings = {
  anchor: '(tabs)',
};

void ExpoSplashScreen.preventAutoHideAsync().catch(() => {
  // no-op: prevent auto hide may fail in dev reloads
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
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

  if (!fontsLoaded) {
    return null;
  }

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme ?? 'light'}>
      <GorhomPortalProvider>
        <TamaguiPortalProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Theme name={colorScheme ?? 'light'}>
              <Stack initialRouteName="index">
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="intro/index" options={{ headerShown: false }} />
                <Stack.Screen name="auth/otp" options={{ headerShown: false }} />
                <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              </Stack>
              <StatusBar style="auto" />
            </Theme>
          </ThemeProvider>
        </TamaguiPortalProvider>
      </GorhomPortalProvider>
    </TamaguiProvider>
  );
}
