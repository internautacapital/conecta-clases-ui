"use client"

import { useErrorInterceptor } from "@/hooks/useErrorInterceptor"

/**
 * Componente que inicializa el interceptor de errores
 * Debe ser incluido en el layout principal
 */
export function ErrorInterceptor() {
  useErrorInterceptor()
  
  // Este componente no renderiza nada
  return null
}
