import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { Toaster } from "sonner"
import { AppShell } from "@/components/layout/app-shell"
import { ReduxProvider } from "@/components/providers/redux-provider"
import { PageLoadingSpinner } from "@/components/ui/loading-spinner"
import { NavigationLoading } from "@/components/ui/navigation-loading"

export const metadata: Metadata = {
  title: "AI Fashion Designer - Transform Images into Custom Clothing",
  description:
    "Revolutionary AI-powered platform that transforms your images into stunning custom clothing designs. Create, customize, and order unique fashion pieces with cutting-edge artificial intelligence.",
  // generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ReduxProvider>
          <Toaster />
          <AppShell>
            <Suspense fallback={<PageLoadingSpinner />}>{children}</Suspense>
          </AppShell>
          <NavigationLoading />
          <Analytics />
        </ReduxProvider>
      </body>
    </html>
  )
}
