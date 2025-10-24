import { memo, useId } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { withAlpha } from '@/utils/color';
import { accentPalette } from '@/constants/tamagui-theme';
import { BrandColors, BrandTypography } from './tokens';

type LogoProps = {
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export const BrandLogoMark = memo(function BrandLogoMark({ size = 164, style }: LogoProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const gradientId = useId();
  const highlightId = useId();
  const colors = BrandColors[colorScheme];
  const accentSpectrum = accentPalette[colorScheme];
  const highlightStart = withAlpha(accentSpectrum[colorScheme === 'dark' ? 8 : 4], colorScheme === 'dark' ? 0.82 : 0.68);
  const highlightEnd = withAlpha(accentSpectrum[colorScheme === 'dark' ? 5 : 3], colorScheme === 'dark' ? 0.74 : 0.56);
  const haloFill = withAlpha(accentSpectrum[colorScheme === 'dark' ? 9 : 5], colorScheme === 'dark' ? 0.55 : 0.38);
  const centerGlow = withAlpha(accentSpectrum[colorScheme === 'dark' ? 7 : 4], colorScheme === 'dark' ? 0.65 : 0.42);

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      style={style}
      accessibilityRole="image"
      aria-label="ParivarOS logo mark"
    >
      <Defs>
        <LinearGradient id={gradientId} x1="44" y1="36" x2="220" y2="220" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={colors.tint} />
          <Stop offset="1" stopColor={colors.text} stopOpacity={0.92} />
        </LinearGradient>
        <LinearGradient
          id={highlightId}
          x1="128"
          y1="88"
          x2="128"
          y2="176"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor={highlightStart} />
          <Stop offset="1" stopColor={highlightEnd} />
        </LinearGradient>
      </Defs>

      <Rect x="32" y="32" width="192" height="192" rx="88" fill={`url(#${gradientId})`} />
      <Path
        d="M88 96C78.059 96 70 104.059 70 114c0 31.5 58 74 58 74s58-42.5 58-74c0-9.941-8.059-18-18-18s-18 8.059-18 18c0-9.941-8.059-18-18-18s-18 8.059-18 18c0-9.941-8.059-18-18-18h-8Z"
        fill={`url(#${highlightId})`}
      />
      <Circle cx="92" cy="92" r="18" fill={haloFill} />
      <Circle cx="128" cy="92" r="18" fill={centerGlow} />
      <Circle cx="164" cy="92" r="18" fill={haloFill} />
    </Svg>
  );
});

type WordmarkProps = {
  height?: number;
  style?: StyleProp<ViewStyle>;
};

export const BrandWordmark = memo(function BrandWordmark({ height = 72, style }: WordmarkProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const gradientId = useId();
  const colors = BrandColors[colorScheme];
  const aspectRatio = 640 / 200;
  const width = height * aspectRatio;
  const plaqueFill = withAlpha(colors.tint, colorScheme === 'dark' ? 0.18 : 0.12);

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 640 200"
      style={style}
      accessibilityRole="image"
      aria-label="ParivarOS wordmark"
    >
      <Defs>
        <LinearGradient id={gradientId} x1="32" y1="40" x2="608" y2="160" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={colors.tint} />
          <Stop offset="1" stopColor={colors.text} stopOpacity={0.92} />
        </LinearGradient>
      </Defs>

      <Rect x="16" y="32" width="608" height="136" rx="24" fill={plaqueFill} />
      <SvgText
        x="64"
        y="120"
        fontFamily={BrandTypography.logo.fontFamily}
        fontWeight={BrandTypography.logo.fontWeight}
        fontSize="82"
        fill={`url(#${gradientId})`}
      >
        ParivarOS
      </SvgText>
      <SvgText
        x="68"
        y="154"
        fontFamily={BrandTypography.caption.fontFamily}
        fontWeight={BrandTypography.caption.fontWeight}
        fontSize="28"
        fill={colors.text}
        opacity={0.75}
      >
        Connect · Care · Celebrate
      </SvgText>
    </Svg>
  );
});
