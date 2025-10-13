import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import 'react-native-reanimated';
import { TamaguiProvider, Theme } from 'tamagui';

import { useColorScheme } from '@/hooks/use-color-scheme';
import tamaguiConfig from '@/tamagui.config';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Regular.otf'),
    'Inter Bold': require('@tamagui/font-inter/otf/Inter-Bold.otf'),
    'Inter SemiBold': require('@tamagui/font-inter/otf/Inter-SemiBold.otf'),
    'Inter Medium': require('@tamagui/font-inter/otf/Inter-Medium.otf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme ?? 'light'}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Theme name={colorScheme ?? 'light'}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </Theme>
      </ThemeProvider>
    </TamaguiProvider>
  );
}
