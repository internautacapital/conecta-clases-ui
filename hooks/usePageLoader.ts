"use client"

import { useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export function usePageLoader() {
  const [loading, setLoading] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Start loading
    setLoading(true)
    
    // Set a minimum timeout of 1 second
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000) // Minimum 1 second loading time

    return () => {
      clearTimeout(timer)
    }
  }, [pathname, searchParams])

  return loading
}
