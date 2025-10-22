import { useEffect, useMemo, useState } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

export type BilingualPhrase = {
  hi: string;
  en: string;
};

export const BrandLoadingPhrases: BilingualPhrase[] = [
  { hi: 'बस कुछ ही पल…', en: 'Just a moment…' },
  { hi: 'हम जुड़ रहे हैं…', en: 'We are connecting…' },
  { hi: 'आभार आपके धैर्य का…', en: 'Thanks for waiting…' },
  { hi: 'परिवारों को जोड़ रहे हैं…', en: 'Bringing families together…' },
];

type RotatingPhrasesOptions = {
  interval?: number;
};

export function useRotatingPhrases(options: RotatingPhrasesOptions = {}) {
  const { interval = 2000 } = options;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const rotation = setInterval(() => {
      setIndex((current) => (current + 1) % BrandLoadingPhrases.length);
    }, interval);

    return () => clearInterval(rotation);
  }, [interval]);

  return useMemo(
    () => ({
      index,
      phrase: BrandLoadingPhrases[index],
      hasMultiple: BrandLoadingPhrases.length > 1,
    }),
    [index]
  );
}

export function useBrandSplashAnimation() {
  const scale = useSharedValue(0.9);
  const logoOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withTiming(1, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });

    logoOpacity.value = withTiming(1, { duration: 700 });

    taglineOpacity.value = withDelay(
      250,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) })
    );
  }, [logoOpacity, scale, taglineOpacity]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: logoOpacity.value,
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  return {
    logoStyle,
    taglineStyle,
  };
}

export type AnimationStyles = ReturnType<typeof useBrandSplashAnimation>;
