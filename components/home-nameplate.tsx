import { memo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { Card, Text, YStack } from 'tamagui';

import { ThemeColors } from '@/constants/tamagui-theme';
import { BrandTypography } from '@/design-system/tokens';

type HomeNameplateProps = {
  themeName: 'light' | 'dark';
  familyName: string;
  initials: string;
};

function CrestIcon({ tint, stroke }: { tint: string; stroke: string }) {
  return (
    <Svg width={64} height={64} viewBox="0 0 64 64">
      <Circle cx={32} cy={32} r={30} fill={tint} opacity={0.18} />
      <Path
        d="M32 12c6.627 0 12 5.373 12 12 0 8.045-8.418 14.117-11.178 15.874a1.566 1.566 0 0 1-1.644 0C28.418 38.117 20 32.045 20 24c0-6.627 5.373-12 12-12Zm0 32c7.18 0 13 4.477 13 10v2H19v-2c0-5.523 5.82-10 13-10Z"
        stroke={stroke}
        strokeWidth={2.4}
        fill="none"
        strokeLinejoin="round"
      />
      <Path
        d="M32 17.5c3.59 0 6.5 2.91 6.5 6.5S35.59 30.5 32 30.5 25.5 27.59 25.5 24 28.41 17.5 32 17.5Z"
        fill={stroke}
        opacity={0.22}
      />
    </Svg>
  );
}

export const HomeNameplate = memo(function HomeNameplate({
  themeName,
  familyName,
  initials,
}: HomeNameplateProps) {
  const palette = ThemeColors[themeName];
  const accentColor = palette.accent;
  const accentForeground = palette.accentForeground;
  const gradientColors =
    themeName === 'dark'
      ? [palette.surface, palette.surfaceAlt]
      : [palette.surfaceAlt, palette.surface];

  return (
    <Card
      alignSelf="center"
      borderRadius="$9"
      padding={0}
      overflow="hidden"
      shadowColor={palette.elevatedShadow}
      shadowRadius={28}
      borderWidth={1}
      borderColor={accentColor}
      maxWidth={360}
      width="100%"
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingVertical: 20, paddingHorizontal: 24 }}
      >
        <YStack ai="center" gap="$3">
          <YStack position="relative" ai="center" jc="center">
            <CrestIcon tint={accentColor} stroke={accentColor} />
            <YStack
              position="absolute"
              ai="center"
              jc="center"
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor={accentColor}
              shadowColor={accentColor}
              shadowRadius={12}
            >
              <Text fontSize={18} color={accentForeground} fontWeight="700">
                {initials || 'P'}
              </Text>
            </YStack>
          </YStack>
          <Text
            fontFamily={BrandTypography.tagline.fontFamily}
            fontWeight={BrandTypography.tagline.fontWeight}
            fontSize={20}
            color={palette.text}
            textAlign="center"
          >
            {familyName}
          </Text>
        </YStack>
      </LinearGradient>
    </Card>
  );
});
