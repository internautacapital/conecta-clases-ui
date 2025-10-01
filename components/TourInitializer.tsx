'use client';

import { useAutoTour } from '@/hooks/useAutoTour';

/**
 * Componente que inicializa el tour automático
 * Debe ser incluido en páginas donde queremos que se active el tour
 */
export function TourInitializer() {
  useAutoTour();

  // Este componente no renderiza nada
  return null;
}
