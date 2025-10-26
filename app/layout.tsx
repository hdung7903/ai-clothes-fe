import type React from "react";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});
import { Toaster } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { ReduxProvider } from "@/components/providers/redux-provider";
import { PageLoadingSpinner } from "@/components/ui/loading-spinner";
import { NavigationLoading } from "@/components/ui/navigation-loading";
import GlobalFloaters from "@/components/custom/global-floaters";
import { ClientOnly } from "@/components/ui/client-only";

export const metadata: Metadata = {
  title: "TEECRAFT - Transform Images into Custom Clothing",
  description:
    "Revolutionary platform that transforms your images into stunning custom clothing designs. Create, customize, and order unique fashion pieces with TEECRAFT's cutting-edge technology.",
  generator: "hdung7903",
  icons: {
    icon: "/branch.png",
    shortcut: "/branch.png",
    apple: "/branch.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`font-sans ${inter.variable} ${jetbrainsMono.variable}`}
        suppressHydrationWarning={true}
      >
        <ReduxProvider>
          <ClientOnly>
            <Toaster />
          </ClientOnly>
          <AppShell>
            <Suspense fallback={<PageLoadingSpinner />}>{children}</Suspense>
          </AppShell>
          <ClientOnly>
            <GlobalFloaters />
            <NavigationLoading />
          </ClientOnly>
        </ReduxProvider>
      </body>
    </html>
  );
}
