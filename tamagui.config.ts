import { createInterFont } from '@tamagui/font-inter';
import { shorthands } from '@tamagui/shorthands';
import { tokens } from '@tamagui/themes';
import { createTamagui } from 'tamagui';
import { responsiveFont } from './utils/responsive-font';

import { themes } from './constants/tamagui-theme';

const headingFont = createInterFont({
  family: 'Inter',
  size: {
    true: responsiveFont(20),
    1: responsiveFont(14),
    2: responsiveFont(16),
    3: responsiveFont(18),
    4: responsiveFont(20),
    5: responsiveFont(24),
    6: responsiveFont(28),
    7: responsiveFont(32),
    8: responsiveFont(36),
    9: responsiveFont(42),
  },
  lineHeight: {
    true: responsiveFont(24),
    1: responsiveFont(18),
    2: responsiveFont(20),
    3: responsiveFont(22),
    4: responsiveFont(24),
    5: responsiveFont(28),
    6: responsiveFont(34),
    7: responsiveFont(38),
    8: responsiveFont(42),
    9: responsiveFont(48),
  },
  weight: {
    true: '600',
    1: '400',
    2: '400',
    3: '500',
    4: '600',
    5: '600',
    6: '700',
    7: '700',
    8: '800',
    9: '900',
  },
});

const bodyFont = createInterFont({
  family: 'Inter',
  size: {
    true: responsiveFont(16),
    1: responsiveFont(13),
    2: responsiveFont(15),
    3: responsiveFont(16),
    4: responsiveFont(18),
    5: responsiveFont(20),
    6: responsiveFont(22),
    7: responsiveFont(24),
    8: responsiveFont(26),
    9: responsiveFont(28),
  },
  lineHeight: {
    true: responsiveFont(22),
    1: responsiveFont(18),
    2: responsiveFont(20),
    3: responsiveFont(24),
    4: responsiveFont(26),
    5: responsiveFont(30),
    6: responsiveFont(34),
    7: responsiveFont(36),
    8: responsiveFont(38),
    9: responsiveFont(42),
  },
  weight: {
    true: '400',
    1: '400',
    2: '400',
    3: '400',
    4: '500',
    5: '600',
    6: '600',
    7: '700',
    8: '700',
    9: '800',
  },
});

const config = createTamagui({
  defaultTheme: 'light',
  tokens,
  themes,
  shorthands,
  fonts: {
    heading: headingFont,
    body: bodyFont,
  },
});

export type AppConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
