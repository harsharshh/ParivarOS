import { Text, YStack } from 'tamagui';
import Animated from 'react-native-reanimated';

import {
  BrandLogoMark,
  BrandSpacing,
  BrandTypography,
  useBrandSplashAnimation,
  useRotatingPhrases,
} from '@/design-system';

const AnimatedTagline = Animated.createAnimatedComponent(Text);

export function SplashScreenContent() {
  const { phrase } = useRotatingPhrases({ interval: 2200 });
  const { logoStyle, taglineStyle } = useBrandSplashAnimation();

  return (
    <YStack
      f={1}
      bg="$background"
      ai="center"
      jc="center"
      paddingHorizontal={BrandSpacing.gutter}
      gap={BrandSpacing.elementGap}
    >
      <Animated.View style={logoStyle}>
        <BrandLogoMark size={164} />
      </Animated.View>

      <AnimatedTagline
        fontFamily={BrandTypography.tagline.fontFamily}
        fontSize={BrandTypography.tagline.fontSize}
        fontWeight={BrandTypography.tagline.fontWeight}
        color="$color"
        textAlign="center"
        letterSpacing={BrandTypography.tagline.letterSpacing}
        style={taglineStyle as any}
      >
        Connect. Care. Celebrate.
      </AnimatedTagline>

      <Text
        fontFamily={BrandTypography.caption.fontFamily}
        fontSize={BrandTypography.caption.fontSize}
        fontWeight={BrandTypography.caption.fontWeight}
        color="$color"
        opacity={0.72}
        textAlign="center"
      >
        {phrase.hi} / {phrase.en}
      </Text>
    </YStack>
  );
}
