"use client"

import { useRouter } from "next/navigation"
import { useState, useCallback } from "react"

export function useNavigationLoading() {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  const navigateWithLoading = useCallback((href: string) => {
    setIsNavigating(true)
    router.push(href)
    
    // Reset loading state after a short delay to allow for navigation
    setTimeout(() => {
      setIsNavigating(false)
    }, 1000)
  }, [router])

  return {
    isNavigating,
    navigateWithLoading,
    setIsNavigating
  }
}

