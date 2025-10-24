import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';

import type { PermissionSummary, PermissionsContextValue } from './use-permissions';

type PermissionState = PermissionSummary['camera'];

type StoredPermissions = PermissionSummary;

const STORAGE_KEY = 'parivaros.permissions.state';

function allGranted(state: StoredPermissions) {
  return (
    state.camera === 'granted' &&
    state.microphone === 'granted' &&
    state.location === 'granted' &&
    state.internet === 'granted'
  );
}

export function useInitialPermissions(): PermissionsContextValue {
  const [status, setStatus] = useState<StoredPermissions | null>(null);
  const hasRequestedRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setStatus(JSON.parse(stored));
        } else {
          setStatus({ camera: 'undetermined', microphone: 'undetermined', location: 'undetermined', internet: 'granted' });
        }
      } catch (error) {
        console.warn('Unable to load permission state', error);
        setStatus({ camera: 'undetermined', microphone: 'undetermined', location: 'undetermined', internet: 'granted' });
      }
    };

    void load();
  }, []);

  const persistStatus = useCallback(async (next: StoredPermissions) => {
    setStatus(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.warn('Unable to persist permission state', error);
    }
  }, []);

  const requestPermissions = useCallback(async () => {
    const next: StoredPermissions = {
      camera: 'undetermined',
      microphone: 'undetermined',
      location: 'undetermined',
      internet: 'granted',
    };

    try {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      next.camera = cameraStatus === 'granted' ? 'granted' : cameraStatus === 'denied' ? 'denied' : 'undetermined';
    } catch (error) {
      console.warn('Camera permission request failed', error);
    }

    try {
      const { status: audioStatus } = await Audio.requestPermissionsAsync();
      next.microphone = audioStatus === 'granted' ? 'granted' : audioStatus === 'denied' ? 'denied' : 'undetermined';
    } catch (error) {
      console.warn('Audio permission request failed', error);
    }

    try {
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      next.location = locationStatus === Location.PermissionStatus.GRANTED ? 'granted' :
        locationStatus === Location.PermissionStatus.DENIED ? 'denied' : 'undetermined';
    } catch (error) {
      console.warn('Location permission request failed', error);
    }

    await persistStatus(next);

    if (!allGranted(next)) {
      Alert.alert(
        'Permissions incomplete',
        'Some features may be limited without camera, microphone, and location access. You can update these in Settings later.'
      );
    }
  }, [persistStatus]);

  useEffect(() => {
    if (!hasRequestedRef.current && status && !allGranted(status)) {
      hasRequestedRef.current = true;
      // Delay slightly on iOS to ensure UI is ready
      const timer = setTimeout(() => {
        void requestPermissions();
      }, Platform.OS === 'ios' ? 400 : 0);
      return () => clearTimeout(timer);
    }
  }, [status, requestPermissions]);

  const permissionsSummary = useMemo(
    () =>
      status ?? {
        camera: 'undetermined',
        microphone: 'undetermined',
        location: 'undetermined',
        internet: 'granted',
      },
    [status]
  );

  return {
    status: permissionsSummary,
    requestPermissions,
  };
}
