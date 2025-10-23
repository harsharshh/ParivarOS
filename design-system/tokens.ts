import { Colors } from '@/constants/theme';
import { accentPalette } from '@/constants/tamagui-theme';
import { withAlpha } from '@/utils/color';

export const BrandColors = Colors;

export const BrandGradients = {
  primary: {
    light: [Colors.light.tint, Colors.light.accent],
    dark: [Colors.dark.tint, Colors.dark.accent],
  },
  subtle: {
    light: [
      withAlpha(accentPalette.light[2], 0.18),
      withAlpha(accentPalette.light[4], 0.18),
    ],
    dark: [
      withAlpha(accentPalette.dark[2], 0.28),
      withAlpha(accentPalette.dark[4], 0.28),
    ],
  },
};

export const BrandTypography = {
  logo: {
    fontFamily: 'Inter Bold',
    fontWeight: '700' as const,
  },
  tagline: {
    fontFamily: 'Inter SemiBold',
    fontWeight: '600' as const,
    fontSize: 22,
    letterSpacing: 0.3,
  },
  caption: {
    fontFamily: 'Inter Medium',
    fontWeight: '500' as const,
    fontSize: 16,
  },
  body: {
    fontFamily: 'Inter',
    fontWeight: '400' as const,
    fontSize: 16,
  },
};

export const BrandSpacing = {
  gutter: 24,
  elementGap: 16,
  stackGap: 32,
};

export const BrandAssets = {
  svg: {
    mark: 'assets/branding/parivaros-logo-mark.svg',
    wordmark: 'assets/branding/parivaros-logo-wordmark.svg',
  },
  raster: {
    splashIcon: 'assets/images/splash-icon.png',
    appIconForeground: 'assets/images/android-icon-foreground.png',
  },
};
