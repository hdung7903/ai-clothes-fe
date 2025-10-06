"use client"

import { usePathname } from "next/navigation"
import { Header } from "@/components/home/header"
import { Footer } from "@/components/home/footer"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useEffect, useState } from "react"
import type { ReactNode } from "react"

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const hideChrome = pathname?.startsWith("/design") || pathname?.startsWith("/auth")

  // Show loading spinner while mounting to avoid SSR/CSR mismatches
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    )
  }

  // For auth and design pages, render children without chrome
  if (hideChrome) {
    return <>{children}</>
  }

  // For regular pages, render with header and footer
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">{children}</main>
      <Footer />
    </>
  )
}


