import Svg, { Rect, Circle, Path, LinearGradient, Stop, Defs } from 'react-native-svg';

import { ThemeColors, accentPalette, darkPalette, lightPalette } from '@/constants/tamagui-theme';
import { withAlpha } from '@/utils/color';

type FamilyCardIllustrationProps = {
  width?: number;
  height?: number;
  theme?: 'light' | 'dark';
  accentStart?: string;
  accentEnd?: string;
};

export function FamilyCardIllustration({
  width = 220,
  height = 140,
  theme = 'light',
  accentStart,
  accentEnd,
}: FamilyCardIllustrationProps) {
  const themePalette = ThemeColors[theme];
  const basePalette = theme === 'dark' ? darkPalette : lightPalette;
  const accentSpectrum = accentPalette[theme];

  const resolvedAccentStart = accentStart ?? accentSpectrum[theme === 'dark' ? 7 : 4];
  const resolvedAccentEnd = accentEnd ?? accentSpectrum[theme === 'dark' ? 9 : 6];

  const gradientStart =
    theme === 'dark' ? accentSpectrum[9] : basePalette[1];
  const gradientEnd = theme === 'dark' ? accentSpectrum[7] : accentSpectrum[2];
  const circleBase = accentSpectrum[theme === 'dark' ? 8 : 5];
  const circleBaseSecondary = accentSpectrum[theme === 'dark' ? 10 : 7];
  const subtleCircle =
    theme === 'dark'
      ? withAlpha(accentSpectrum[11], 0.4)
      : accentSpectrum[3];
  const highlight =
    theme === 'dark'
      ? withAlpha(themePalette.accentForeground, 0.92)
      : themePalette.background;
  const strokeAccent = accentSpectrum[theme === 'dark' ? 6 : 8];

  return (
    <Svg width={width} height={height} viewBox="0 0 220 140" fill="none">
      <Defs>
        <LinearGradient id="bgGradient" x1="0" y1="0" x2="220" y2="140" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={gradientStart} />
          <Stop offset="1" stopColor={gradientEnd} />
        </LinearGradient>
      </Defs>

      <Rect x="0" y="20" width="220" height="100" rx="24" fill="url(#bgGradient)" />

      <Circle cx="70" cy="86" r="36" fill={subtleCircle} opacity={theme === 'dark' ? 0.3 : 0.18} />
      <Circle cx="150" cy="80" r="42" fill={circleBaseSecondary} opacity={theme === 'dark' ? 0.22 : 0.18} />

      <Circle cx="72" cy="70" r="18" fill={subtleCircle} />
      <Path
        d="M72 92c-11 0-20 9-20 20h40c0-11-9-20-20-20Z"
        fill={subtleCircle}
      />
      <Circle cx="108" cy="64" r="20" fill={circleBaseSecondary} />
      <Path
        d="M108 90c-12 0-22 10-22 22h44c0-12-10-22-22-22Z"
        fill={circleBaseSecondary}
      />
      <Circle cx="150" cy="72" r="22" fill={circleBase} />
      <Path
        d="M150 102c-13 0-24 11-24 24h48c0-13-11-24-24-24Z"
        fill={circleBase}
      />
      <Circle cx="138" cy="52" r="10" fill={highlight} opacity={0.85} />
      <Circle cx="96" cy="50" r="9" fill={highlight} opacity={0.82} />
      <Circle cx="176" cy="66" r="12" fill={highlight} opacity={0.88} />
      <Path
        d="M128 38c2-5 7-9 14-9 8 0 14 6 15 14"
        stroke={strokeAccent}
        strokeWidth="4"
        strokeLinecap="round"
      />
    </Svg>
  );
}
