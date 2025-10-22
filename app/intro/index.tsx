import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YStack } from 'tamagui';

import { IntroCarousel } from '@/components/intro-carousel';

export default function IntroLandingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack f={1} bg="$background">
        <IntroCarousel onDone={() => router.replace('/(tabs)')} />
      </YStack>
    </SafeAreaView>
  );
}
