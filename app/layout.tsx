import type React from "react";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Poppins, Roboto_Mono, Playfair_Display } from "next/font/google";
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
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});
const robotoMono = Roboto_Mono({
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-roboto-mono",
  display: "swap",
});
const playfairDisplay = Playfair_Display({
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-playfair",
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: "TeeCraft - Every Shirt Tells A Story",
  description:
  "Nền tảng cách mạng hóa thời trang với công nghệ AI. Tạo và thiết kế những bộ trang phục độc đáo của riêng bạn với TEECRAFT - biến ý tưởng thành hiện thực.",
  generator: "hdung7903",
  icons: [
    {
      rel: 'icon',
      type: 'image/png',
      url: '/branch.png',
      sizes: 'any',
    },
    {
      rel: 'apple-touch-icon',
      type: 'image/png',
      url: '/branch.png',
    },
  ],
  openGraph: {
    title: "TeeCraft - Every Shirt Tells A Story",
    description: "Nền tảng cách mạng hóa thời trang với công nghệ AI. Tạo và thiết kế những bộ trang phục độc đáo của riêng bạn với TEECRAFT - biến ý tưởng thành hiện thực.",
    images: ["/branch.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TeeCraft - Every Shirt Tells A Story",
    description: "Nền tảng cách mạng hóa thời trang với công nghệ AI. Tạo và thiết kế những bộ trang phục độc đáo của riêng bạn với TEECRAFT - biến ý tưởng thành hiện thực.",
    images: ["/branch.png"],
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
        className={`font-sans ${inter.variable} ${jetbrainsMono.variable} ${poppins.variable} ${robotoMono.variable} ${playfairDisplay.variable}`}
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
