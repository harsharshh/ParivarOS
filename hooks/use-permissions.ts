import { createContext, useContext } from 'react';

import type { useInitialPermissions } from './use-initial-permissions';

type InitialPermissionsReturn = ReturnType<typeof useInitialPermissions> | null;

export const PermissionsContext = createContext<InitialPermissionsReturn>(null);

export function usePermissions() {
  const ctx = useContext(PermissionsContext);
  if (!ctx) {
    throw new Error('usePermissions must be used within a PermissionsContext provider');
  }
  return ctx;
}

