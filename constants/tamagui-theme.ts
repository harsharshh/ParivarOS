import * as Colors from '@tamagui/colors';
import { createThemes, defaultComponentThemes } from '@tamagui/theme-builder';

export const darkPalette = [
  'hsla(32, 32%, 8%, 1)',
  'hsla(30, 28%, 10%, 1)',
  'hsla(32, 24%, 12%, 1)',
  'hsla(34, 22%, 15%, 1)',
  'hsla(33, 20%, 18%, 1)',
  'hsla(33, 18%, 22%, 1)',
  'hsla(33, 16%, 26%, 1)',
  'hsla(33, 14%, 30%, 1)',
  'hsla(33, 12%, 35%, 1)',
  'hsla(40, 40%, 75%, 1)',
  'hsla(42, 65%, 88%, 1)',
  'hsla(44, 75%, 94%, 1)',
];
export const lightPalette = [
  'hsla(42, 46%, 96%, 1)',
  'hsla(40, 42%, 92%, 1)',
  'hsla(38, 38%, 88%, 1)',
  'hsla(36, 34%, 82%, 1)',
  'hsla(34, 30%, 78%, 1)',
  'hsla(32, 28%, 72%, 1)',
  'hsla(30, 26%, 66%, 1)',
  'hsla(28, 24%, 60%, 1)',
  'hsla(26, 22%, 54%, 1)',
  'hsla(30, 30%, 28%, 1)',
  'hsla(32, 28%, 16%, 1)',
  'hsla(34, 32%, 9%, 1)',
];

export const accentPalette = {
  dark: [
    'hsla(37, 68%, 34%, 1)',
    'hsla(37, 64%, 37%, 1)',
    'hsla(37, 60%, 40%, 1)',
    'hsla(37, 60%, 42%, 1)',
    'hsla(37, 60%, 45%, 1)',
    'hsla(37, 60%, 48%, 1)',
    'hsla(37, 60%, 52%, 1)',
    'hsla(37, 60%, 55%, 1)',
    'hsla(37, 60%, 58%, 1)',
    'hsla(37, 60%, 61%, 1)',
    'hsla(42, 68%, 86%, 1)',
    'hsla(44, 72%, 92%, 1)',
  ],
  light: [
    'hsla(37, 80%, 75%, 1)',
    'hsla(37, 74%, 72%, 1)',
    'hsla(37, 70%, 68%, 1)',
    'hsla(37, 68%, 64%, 1)',
    'hsla(37, 66%, 60%, 1)',
    'hsla(37, 64%, 56%, 1)',
    'hsla(37, 62%, 52%, 1)',
    'hsla(37, 60%, 48%, 1)',
    'hsla(37, 58%, 44%, 1)',
    'hsla(37, 56%, 40%, 1)',
    'hsla(43, 72%, 90%, 1)',
    'hsla(45, 76%, 94%, 1)',
  ],
} as const;

const lightShadows = {
  shadow1: 'rgba(0,0,0,0.04)',
  shadow2: 'rgba(0,0,0,0.08)',
  shadow3: 'rgba(0,0,0,0.16)',
  shadow4: 'rgba(0,0,0,0.24)',
  shadow5: 'rgba(0,0,0,0.32)',
  shadow6: 'rgba(0,0,0,0.4)',
};

const darkShadows = {
  shadow1: 'rgba(0,0,0,0.2)',
  shadow2: 'rgba(0,0,0,0.3)',
  shadow3: 'rgba(0,0,0,0.4)',
  shadow4: 'rgba(0,0,0,0.5)',
  shadow5: 'rgba(0,0,0,0.6)',
  shadow6: 'rgba(0,0,0,0.7)',
};

const builtThemes = createThemes({
  componentThemes: defaultComponentThemes,

  base: {
    palette: {
      dark: darkPalette,
      light: lightPalette,
    },

    extra: {
      light: {
        ...Colors.green,
        ...Colors.red,
        ...Colors.yellow,
        ...lightShadows,
        shadowColor: lightShadows.shadow1,
      },
      dark: {
        ...Colors.greenDark,
        ...Colors.redDark,
        ...Colors.yellowDark,
        ...darkShadows,
        shadowColor: darkShadows.shadow1,
      },
    },
  },

  accent: {
    palette: {
      dark: accentPalette.dark,
      light: accentPalette.light,
    },
  },

  childrenThemes: {
    warning: {
      palette: {
        dark: Object.values(Colors.yellowDark),
        light: Object.values(Colors.yellow),
      },
    },

    error: {
      palette: {
        dark: Object.values(Colors.redDark),
        light: Object.values(Colors.red),
      },
    },

    success: {
      palette: {
        dark: Object.values(Colors.greenDark),
        light: Object.values(Colors.green),
      },
    },
  },
});

export type CustomThemes = typeof builtThemes;

export const themes: CustomThemes =
  process.env.TAMAGUI_ENVIRONMENT === 'client' && process.env.NODE_ENV === 'production'
    ? ({} as CustomThemes)
    : builtThemes;

export const ThemeColors = {
  light: {
    text: lightPalette[11],
    subtleText: 'rgba(31, 27, 22, 0.62)',
    mutedText: 'rgba(31, 27, 22, 0.48)',
    background: lightPalette[0],
    surface: '#ffffff',
    surfaceMuted: lightPalette[1],
    surfaceAlt: lightPalette[2],
    tint: accentPalette.light[7],
    accent: accentPalette.light[7],
    accentStrong: accentPalette.light[9],
    accentForeground: '#ffffff',
    icon: 'rgba(31, 27, 22, 0.6)',
    tabIconDefault: 'rgba(31, 27, 22, 0.35)',
    tabIconSelected: accentPalette.light[7],
    border: 'rgba(31, 27, 22, 0.08)',
    shadow: 'rgba(17, 12, 4, 0.08)',
    elevatedShadow: 'rgba(17, 12, 4, 0.14)',
    inputBackground: '#ffffff',
    danger: Colors.red.red8,
    dangerForeground: '#ffffff',
  },
  dark: {
    text: darkPalette[10],
    subtleText: 'rgba(244, 235, 215, 0.76)',
    mutedText: 'rgba(244, 235, 215, 0.52)',
    background: darkPalette[0],
    surface: darkPalette[2],
    surfaceMuted: darkPalette[3],
    surfaceAlt: darkPalette[4],
    tint: accentPalette.dark[6],
    accent: accentPalette.dark[6],
    accentStrong: accentPalette.dark[8],
    accentForeground: darkPalette[0],
    icon: 'rgba(244, 235, 215, 0.7)',
    tabIconDefault: 'rgba(244, 235, 215, 0.4)',
    tabIconSelected: accentPalette.dark[7],
    border: 'rgba(244, 235, 215, 0.08)',
    shadow: 'rgba(5, 3, 1, 0.4)',
    elevatedShadow: 'rgba(5, 3, 1, 0.48)',
    inputBackground: darkPalette[2],
    danger: Colors.redDark.red9,
    dangerForeground: '#1c0a05',
  },
} as const;
