'use client'

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SessionProvider } from "next-auth/react"
import { LoadingProvider } from "@/contexts/LoadingContext"
import { TourProvider } from "@/contexts/TourContext"
import { useState } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <LoadingProvider>
          <TourProvider>
            {children}
          </TourProvider>
        </LoadingProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}
