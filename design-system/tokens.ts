import { Colors } from '@/constants/theme';

export const BrandColors = Colors;

export const BrandGradients = {
  primary: {
    light: [Colors.light.tint, Colors.light.text],
    dark: [Colors.dark.tint, Colors.dark.text],
  },
  subtle: {
    light: ['rgba(107,92,255,0.16)', 'rgba(148,124,255,0.16)'],
    dark: ['rgba(107,92,255,0.32)', 'rgba(148,124,255,0.32)'],
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
