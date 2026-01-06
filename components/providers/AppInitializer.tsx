'use client';

import { ReactNode } from 'react';

interface AppInitializerProps {
  children: ReactNode;
}

/**
 * App Initializer component
 *
 * Handles app-level initialization.
 */
export function AppInitializer({ children }: AppInitializerProps) {
  return <>{children}</>;
}

export default AppInitializer;
