"use client"

import { useClientOnly } from "@/hooks/useClientOnly"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export function usePageLoader() {
  const [loading, setLoading] = useState(false)
  const isClient = useClientOnly()
  const pathname = usePathname()

  useEffect(() => {
    if (!isClient) return
    
    // Start loading
    setLoading(true)
    
    // Set a minimum timeout of 1 second
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000) // Minimum 1 second loading time

    return () => {
      clearTimeout(timer)
    }
  }, [isClient, pathname])

  return loading
}
