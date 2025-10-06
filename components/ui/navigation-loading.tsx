"use client"

import { LoadingSpinner } from "./loading-spinner"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export function NavigationLoading() {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleStart = () => {
      // Defer state update to avoid scheduling during insertion effects
      setTimeout(() => setIsLoading(true), 0)
    }
    const handleComplete = () => setIsLoading(false)

    // Listen for route changes
    const originalPush = window.history.pushState
    const originalReplace = window.history.replaceState

    window.history.pushState = function(...args) {
      handleStart()
      originalPush.apply(this, args)
      setTimeout(handleComplete, 500) // Reset after navigation
    }

    window.history.replaceState = function(...args) {
      handleStart()
      originalReplace.apply(this, args)
      setTimeout(handleComplete, 500)
    }

    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', handleStart)
    
    // Reset loading when pathname changes
    handleComplete()

    return () => {
      window.history.pushState = originalPush
      window.history.replaceState = originalReplace
      window.removeEventListener('popstate', handleStart)
    }
  }, [pathname])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-card rounded-lg shadow-lg border p-6">
        <LoadingSpinner size="lg" text="Navigating..." />
      </div>
    </div>
  )
}

