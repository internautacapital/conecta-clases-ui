'use client';

import { useEffect, useState } from 'react';

/**
 * Hook that returns true only after the component has hydrated on the client.
 * Useful for preventing hydration mismatches when rendering content that
 * differs between server and client (like dates, random values, etc.)
 */
export function useClientOnly() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

/**
 * Hook that provides a safe date that won't cause hydration mismatches.
 * Returns null during SSR and the actual date after hydration.
 */
export function useSafeDate() {
  const isClient = useClientOnly();
  return isClient ? new Date() : null;
}
