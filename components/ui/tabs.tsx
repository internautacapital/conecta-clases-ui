import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  children: React.ReactNode
}

const Tabs = ({ defaultValue, value, onValueChange, className, children }: TabsProps) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "")
  const currentValue = value !== undefined ? value : internalValue

  const handleValueChange = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <div className={cn("w-full", className)}>
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child, { 
              value: currentValue, 
              onValueChange: handleValueChange 
            } as Partial<TabsListProps>)
          : child
      )}
    </div>
  )
}

interface TabsListProps {
  className?: string
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
}

const TabsList = ({ className, children, value, onValueChange }: TabsListProps) => (
  <div className={cn("inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500", className)}>
    {React.Children.map(children, child =>
      React.isValidElement(child)
        ? React.cloneElement(child, { 
            currentValue: value, 
            onValueChange 
          } as Partial<TabsTriggerProps>)
        : child
    )}
  </div>
)

interface TabsTriggerProps {
  value: string
  className?: string
  children: React.ReactNode
  currentValue?: string
  onValueChange?: (value: string) => void
}

const TabsTrigger = ({ value: triggerValue, className, children, currentValue, onValueChange }: TabsTriggerProps) => {
  const isActive = currentValue === triggerValue

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900",
        className
      )}
      onClick={() => onValueChange?.(triggerValue)}
    >
      {children}
    </button>
  )
}

interface TabsContentProps {
  value: string
  className?: string
  children: React.ReactNode
  currentValue?: string
}

const TabsContent = ({ value: contentValue, className, children, currentValue }: TabsContentProps) => {
  if (currentValue !== contentValue) return null

  return (
    <div className={cn("mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2", className)}>
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
