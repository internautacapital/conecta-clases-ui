'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react';
import { driver, DriveStep } from 'driver.js';
import { firstTimeTourSteps } from '@/lib/tourSteps';
import 'driver.js/dist/driver.css';

interface TourContextType {
  startTour: (steps?: DriveStep[]) => void;
  hasSeenTour: boolean;
  markTourAsSeen: () => void;
  resetTour: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

const TOUR_STORAGE_KEY = 'conecta-clases-tour-seen';

export function TourProvider({ children }: { children: ReactNode }) {
  const [hasSeenTour, setHasSeenTour] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Verificar si el usuario ya vio el tour
    const tourSeen = localStorage.getItem(TOUR_STORAGE_KEY);
    setHasSeenTour(tourSeen === 'true');
  }, []);

  const startTour = (customSteps?: DriveStep[]) => {
    if (!mounted) return;

    const steps = customSteps || firstTimeTourSteps;

    const driverObj = driver({
      showProgress: true,
      steps: steps,
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Finalizar',
      progressText: '{{current}} de {{total}}',
      onDestroyStarted: () => {
        if (!hasSeenTour) {
          markTourAsSeen();
        }
        driverObj.destroy();
      },
    });

    driverObj.drive();
  };

  const markTourAsSeen = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    setHasSeenTour(true);
  };

  const resetTour = () => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    setHasSeenTour(false);
  };

  const value = {
    startTour,
    hasSeenTour,
    markTourAsSeen,
    resetTour,
  };

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}
