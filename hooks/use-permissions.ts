import { createContext, useContext } from 'react';

export type PermissionSummary = {
  camera: 'granted' | 'denied' | 'undetermined';
  microphone: 'granted' | 'denied' | 'undetermined';
  location: 'granted' | 'denied' | 'undetermined';
  internet: 'granted' | 'denied' | 'undetermined';
};

export type PermissionsContextValue = {
  status: PermissionSummary;
  requestPermissions: () => Promise<void>;
};

export const PermissionsContext = createContext<PermissionsContextValue | null>(null);

export function usePermissions(): PermissionsContextValue {
  const ctx = useContext(PermissionsContext);
  if (!ctx) {
    throw new Error('usePermissions must be used within a PermissionsContext provider');
  }
  return ctx;
}
