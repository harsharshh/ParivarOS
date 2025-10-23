import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YStack } from 'tamagui';

import { IntroCarousel } from '@/components/intro-carousel';

export default function IntroLandingScreen() {
  const router = useRouter();
  useEffect(() => {
    void (async () => {
      try {
        const flag = await AsyncStorage.getItem('parivaros_intro_complete');
        if (flag === 'true') {
          router.replace('/auth/otp');
        }
      } catch (error) {
        console.warn('Failed to read intro flag', error);
      }
    })();
  }, [router]);

  const handleDone = async () => {
    try {
      await AsyncStorage.setItem('parivaros_intro_complete', 'true');
    } catch (error) {
      console.warn('Failed to persist intro flag', error);
    }
    router.replace('/auth/otp');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack f={1} bg="$background">
        <IntroCarousel onDone={handleDone} />
      </YStack>
    </SafeAreaView>
  );
}
