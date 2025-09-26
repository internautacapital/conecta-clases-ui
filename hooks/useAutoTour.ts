"use client"

import { useEffect } from "react"
import { useTour } from "@/contexts/TourContext"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"

/**
 * Hook que inicia automáticamente el tour en la primera visita del usuario
 */
export function useAutoTour() {
  const { startTour, hasSeenTour } = useTour()
  const { data: session, status } = useSession()
  const pathname = usePathname()

  useEffect(() => {
    // Solo ejecutar si:
    // 1. El usuario está autenticado
    // 2. No ha visto el tour antes
    // 3. Está en el dashboard (página principal)
    // 4. Los elementos del tour están disponibles
    if (
      status === "authenticated" && 
      session && 
      !hasSeenTour && 
      pathname.startsWith("/dashboard")
    ) {
      // Esperar un poco para que los elementos se rendericen
      const timer = setTimeout(() => {
        // Verificar que los elementos del tour existan antes de iniciarlo
        const navbarElement = document.querySelector('[data-tour="navbar"]')
        const notificationsElement = document.querySelector('[data-tour="notifications"]')
        
        if (navbarElement && notificationsElement) {
          startTour()
        }
      }, 1500) // Esperar 1.5 segundos para que todo se cargue

      return () => clearTimeout(timer)
    }
  }, [status, session, hasSeenTour, pathname, startTour])
}
