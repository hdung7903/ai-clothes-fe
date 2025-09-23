"use client"

import { usePathname } from "next/navigation"
import { Header } from "@/components/home/header"
import { Footer } from "@/components/home/footer"
import { useEffect, useState } from "react"
import type { ReactNode } from "react"

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const hideChrome = pathname?.startsWith("/design") || pathname?.startsWith("/auth")

  // Avoid SSR/CSR mismatches by rendering only children until mounted,
  // and also when we intentionally hide the chrome on certain routes.
  if (!isMounted || hideChrome) {
    return <>{children}</>
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">{children}</main>
      <Footer />
    </>
  )
}


