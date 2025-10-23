import Constants from 'expo-constants';
import { FirebaseOptions, initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseCompat from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

type ExpoExtraFirebase = FirebaseOptions & {
  webClientId?: string;
};

const extraSources: Array<Record<string, unknown> | undefined> = [
  Constants?.expoConfig?.extra as Record<string, unknown> | undefined,
  Constants?.manifest?.extra as Record<string, unknown> | undefined,
  // @ts-expect-error manifest2 exists on newer Expo runtimes
  Constants?.manifest2?.extra as Record<string, unknown> | undefined,
];

let firebaseConfig: ExpoExtraFirebase | undefined;
for (const source of extraSources) {
  if (source?.firebase) {
    firebaseConfig = source.firebase as ExpoExtraFirebase;
    break;
  }
}

if (!firebaseConfig) {
  try {
    // Fallback to static config so web bundler still gains access during SSR / static export.
    // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
    const appConfig = require('../app.json');
    firebaseConfig = appConfig?.expo?.extra?.firebase as ExpoExtraFirebase | undefined;
  } catch {
    // ignore
  }
}

export const isFirebaseConfigured = Boolean(firebaseConfig);

let firebaseAppInstance: ReturnType<typeof getApp> | undefined;

if (firebaseConfig) {
  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }
  firebaseAppInstance = getApp();
  if (!firebaseCompat.apps.length) {
    firebaseCompat.initializeApp(firebaseConfig);
  }
} else {
  console.warn(
    '[Firebase] Missing firebase config in expo extra. Set `extra.firebase` within app.json or app.config.ts.'
  );
}

export const firebaseApp = firebaseAppInstance;

export const firebaseAuth = (() => {
  if (!firebaseAppInstance) {
    return undefined;
  }

  if (Platform.OS === 'web') {
    return getAuth(firebaseAppInstance);
  }

  try {
    return initializeAuth(firebaseAppInstance, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(firebaseAppInstance);
  }
})();

export const firebaseDb = firebaseAppInstance ? getFirestore(firebaseAppInstance) : undefined;
export const firebaseOptions = firebaseConfig;
