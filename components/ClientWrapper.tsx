"use client"

import { PageLoader } from "@/components/ui/PageLoader"
import { LoadingProvider } from "@/contexts/LoadingContext"
import { ReactNode } from "react"

export function ClientWrapper({ children }: { children: ReactNode }) {
  return (
    <LoadingProvider>
      <PageLoader />
      {children}
    </LoadingProvider>
  )
}
