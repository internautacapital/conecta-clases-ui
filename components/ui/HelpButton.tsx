"use client"

import { useTour } from "@/contexts/TourContext"
import { HelpCircle } from "lucide-react"
import { useSession } from "next-auth/react"
import { useState } from "react"

interface HelpButtonProps {
  className?: string
  variant?: "floating" | "inline"
}

export function HelpButton({ className = "", variant = "floating" }: HelpButtonProps) {
  const { startTour } = useTour()
  const [isHovered, setIsHovered] = useState(false)
  const { data: session } = useSession()

  const handleClick = () => {
    startTour()
  }

  if (variant === "floating" && session?.user) {
    return (
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 cursor-pointer hover:scale-110 ${className}`}
        title="Ayuda - Tour de la plataforma"
      >
        <HelpCircle className="w-6 h-6" />
        
        {/* Tooltip */}
        {isHovered && (
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap">
            Tour de la plataforma
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
      </button>
    )
  }

  return (
      session && (
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors ${className}`}
        title="Iniciar tour de ayuda"
      >
        <HelpCircle className="w-4 h-4" />
        Ayuda
      </button>
      )
  )
}
