"use client"

import { useLoading } from "@/contexts/LoadingContext"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ReactNode, MouseEvent } from "react"

interface LoadingLinkProps {
  href: string
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function LoadingLink({ href, children, className, onClick }: LoadingLinkProps) {
  const { startLoading } = useLoading()
  const router = useRouter()

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    
    // Execute custom onClick if provided
    if (onClick) {
      onClick()
    }
    
    // Start loading immediately
    startLoading()
    
    // Navigate after a small delay to ensure loading shows
    setTimeout(() => {
      router.push(href)
    }, 50)
  }

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  )
}
