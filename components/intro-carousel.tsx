import { ComponentType, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Button, Text, XStack, YStack } from 'tamagui';

import CarouselPager from './intro-carousel-pager';
import type { PagerHandle } from './intro-carousel-pager';
import {
  BrandSpacing,
  BrandTypography,
  FamilyTreeIllustration,
  ConnectedParivarIllustration,
  AICareIllustration,
  IllustrationProps,
  BrandColors,
} from '@/design-system';
import { useColorScheme } from '@/hooks/use-color-scheme';

type SlideContent = {
  title: string;
  blurb: string;
  Illustration: ComponentType<IllustrationProps>;
};

type SlideDefinition = SlideContent & {
  key: string;
};

type IntroCarouselProps = {
  onDone: () => void;
};

const slides: SlideDefinition[] = [
  {
    key: 'family-tree',
    title: 'Build your digital family tree',
    blurb: 'Capture every connection and celebrate your shared history.',
    Illustration: FamilyTreeIllustration,
  },
  {
    key: 'connected-parivar',
    title: 'Stay connected with your parivar',
    blurb: 'Share updates, memories, and moments that keep everyone close.',
    Illustration: ConnectedParivarIllustration,
  },
  {
    key: 'ai-care',
    title: 'Let Parivar AI care for what matters',
    blurb: 'Smart reminders and rituals ensure traditions thrive every day.',
    Illustration: AICareIllustration,
  },
];

function IntroSlide({
  title,
  blurb,
  Illustration,
  active,
}: SlideContent & { active: boolean }) {
  const illustrationProgress = useSharedValue(active ? 1 : 0.9);
  const textProgress = useSharedValue(active ? 1 : 0.8);

  useEffect(() => {
    illustrationProgress.value = withTiming(active ? 1 : 0.9, { duration: 450 });
    textProgress.value = withTiming(active ? 1 : 0.8, { duration: 400 });
  }, [active, illustrationProgress, textProgress]);

  const illustrationStyle = useAnimatedStyle(() => ({
    transform: [{ scale: illustrationProgress.value }],
    opacity: illustrationProgress.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - textProgress.value) * 12 }],
    opacity: textProgress.value,
  }));

  return (
    <YStack f={1} ai="center" jc="center" gap={BrandSpacing.elementGap} paddingHorizontal={BrandSpacing.gutter}>
      <Animated.View style={illustrationStyle}>
        <Illustration width={280} height={220} />
      </Animated.View>
      <Animated.View style={textStyle}>
        <YStack ai="center" gap="$2">
          <Text
            fontFamily={BrandTypography.tagline.fontFamily}
            fontWeight={BrandTypography.tagline.fontWeight}
            fontSize={24}
            color="$color"
            textAlign="center"
          >
            {title}
          </Text>
          <Text
            fontFamily={BrandTypography.body.fontFamily}
            fontSize={16}
            color="$color"
            opacity={0.75}
            textAlign="center"
            maxWidth={320}
            lineHeight={22}
          >
            {blurb}
          </Text>
        </YStack>
      </Animated.View>
    </YStack>
  );
}

export function IntroCarousel({ onDone }: IntroCarouselProps) {
  const pagerRef = useRef<PagerHandle>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const colorScheme = useColorScheme() ?? 'light';
  const colors = BrandColors[colorScheme];
  const { width } = useWindowDimensions();
  const inactiveIndicator = colorScheme === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.18)';

  const handleNext = useCallback(() => {
    if (activeIndex < slides.length - 1) {
      pagerRef.current?.setPage(activeIndex + 1);
    } else {
      onDone();
    }
  }, [activeIndex, onDone]);

  const nextLabel = useMemo(() => (activeIndex === slides.length - 1 ? 'Get Started' : 'Next →'), [activeIndex]);

  return (
    <YStack f={1} bg="$background" paddingTop="$8" paddingBottom="$6">
      <XStack paddingHorizontal={BrandSpacing.gutter} justifyContent="flex-end">
        {activeIndex < slides.length - 1 && (
          <Button
            size="$3"
            variant="ghost"
            onPress={onDone}
            borderWidth={0}
            backgroundColor="transparent"
            color={colors.tint}
          >
            Skip
          </Button>
        )}
      </XStack>

      <CarouselPager
        style={{ flex: 1, width }}
        initialPage={0}
        ref={pagerRef}
        width={width}
        onPageSelected={(index) => setActiveIndex(index)}
      >
        {slides.map((slide, index) => {
          const { key, ...slideProps } = slide;
          return (
            <YStack key={key} f={1} width={width}>
              <IntroSlide {...slideProps} active={activeIndex === index} />
            </YStack>
          );
        })}
      </CarouselPager>

      <YStack paddingHorizontal={BrandSpacing.gutter} gap="$4" mt="$4">
        <XStack ai="center" jc="center" gap="$2">
          {slides.map((slide, index) => (
            <YStack
              key={slide.key}
              height={8}
              borderRadius={999}
              bg={activeIndex === index ? colors.tint : inactiveIndicator}
              width={activeIndex === index ? 36 : 12}
              opacity={activeIndex === index ? 1 : 0.6}
            />
          ))}
        </XStack>

        <Button size="$5" onPress={handleNext} themeInverse={activeIndex === slides.length - 1}>
          {nextLabel}
        </Button>

      </YStack>
    </YStack>
  );
}
