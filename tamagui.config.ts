import { createInterFont } from '@tamagui/font-inter';
import { shorthands } from '@tamagui/shorthands';
import { tokens } from '@tamagui/themes';
import { createTamagui } from 'tamagui';

import { themes } from './constants/tamagui-theme';

const headingFont = createInterFont({
  family: 'Inter',
  size: {
    1: 14,
    2: 16,
    3: 18,
    4: 20,
    5: 24,
    6: 28,
    7: 32,
    8: 36,
    9: 42,
  },
  lineHeight: {
    1: 18,
    2: 20,
    3: 22,
    4: 24,
    5: 28,
    6: 34,
    7: 38,
    8: 42,
    9: 48,
  },
  weight: {
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
    1: 13,
    2: 15,
    3: 16,
    4: 18,
    5: 20,
    6: 22,
    7: 24,
    8: 26,
    9: 28,
  },
  lineHeight: {
    1: 18,
    2: 20,
    3: 24,
    4: 26,
    5: 30,
    6: 34,
    7: 36,
    8: 38,
    9: 42,
  },
  weight: {
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
