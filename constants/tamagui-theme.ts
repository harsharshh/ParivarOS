import * as Colors from '@tamagui/colors';
import { createThemes, defaultComponentThemes } from '@tamagui/theme-builder';

export const darkPalette = [
  'hsla(0, 15%, 1%, 1)',
  'hsla(0, 15%, 6%, 1)',
  'hsla(0, 15%, 12%, 1)',
  'hsla(0, 15%, 17%, 1)',
  'hsla(0, 15%, 23%, 1)',
  'hsla(0, 15%, 28%, 1)',
  'hsla(0, 15%, 34%, 1)',
  'hsla(0, 15%, 39%, 1)',
  'hsla(0, 15%, 45%, 1)',
  'hsla(0, 15%, 50%, 1)',
  'hsla(0, 15%, 93%, 1)',
  'hsla(0, 15%, 99%, 1)',
];

export const lightPalette = [
  'hsla(0, 15%, 99%, 1)',
  'hsla(0, 15%, 94%, 1)',
  'hsla(0, 15%, 88%, 1)',
  'hsla(0, 15%, 83%, 1)',
  'hsla(0, 15%, 77%, 1)',
  'hsla(0, 15%, 72%, 1)',
  'hsla(0, 15%, 66%, 1)',
  'hsla(0, 15%, 61%, 1)',
  'hsla(0, 15%, 55%, 1)',
  'hsla(0, 15%, 50%, 1)',
  'hsla(0, 15%, 15%, 1)',
  'hsla(0, 15%, 1%, 1)',
];

export const accentPalette = {
  dark: [
    'hsla(21, 50%, 35%, 1)',
    'hsla(21, 50%, 38%, 1)',
    'hsla(21, 50%, 41%, 1)',
    'hsla(21, 50%, 43%, 1)',
    'hsla(21, 50%, 46%, 1)',
    'hsla(21, 50%, 49%, 1)',
    'hsla(21, 50%, 52%, 1)',
    'hsla(21, 50%, 54%, 1)',
    'hsla(21, 50%, 57%, 1)',
    'hsla(21, 50%, 60%, 1)',
    'hsla(250, 50%, 90%, 1)',
    'hsla(250, 50%, 95%, 1)',
  ],
  light: [
    'hsla(21, 50%, 61%, 1)',
    'hsla(21, 50%, 61%, 1)',
    'hsla(21, 50%, 62%, 1)',
    'hsla(21, 50%, 62%, 1)',
    'hsla(21, 50%, 63%, 1)',
    'hsla(21, 50%, 63%, 1)',
    'hsla(21, 50%, 64%, 1)',
    'hsla(21, 50%, 64%, 1)',
    'hsla(21, 50%, 65%, 1)',
    'hsla(21, 50%, 65%, 1)',
    'hsla(250, 50%, 95%, 1)',
    'hsla(250, 50%, 95%, 1)',
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
    text: lightPalette[10],
    background: lightPalette[0],
    tint: accentPalette.dark[0],
    accent: accentPalette.light[4],
    accentForeground: lightPalette[11],
    icon: lightPalette[6],
    tabIconDefault: lightPalette[7],
    tabIconSelected: accentPalette.dark[0],
  },
  dark: {
    text: darkPalette[10],
    background: darkPalette[0],
    tint: accentPalette.dark[4],
    accent: accentPalette.dark[8],
    accentForeground: darkPalette[0],
    icon: darkPalette[6],
    tabIconDefault: darkPalette[5],
    tabIconSelected: accentPalette.dark[4],
  },
} as const;

