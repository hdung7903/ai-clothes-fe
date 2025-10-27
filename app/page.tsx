import type { Metadata } from "next"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturesSection } from "@/components/home/features-section"
import { HowItWorksSection } from "@/components/home/how-it-works-section"
import { TestimonialsSection } from "@/components/home/testimonials-section"
import { CTASection } from "@/components/home/cta-section"
import { VoucherDialog } from "@/components/home/voucher-dialog"
import { FeaturedProductsSection } from "@/components/home/featured-products-section"

export const metadata: Metadata = {
  title: "TEECRAFT - Thiết Kế Áo Thun Cá Nhân Hóa Bằng AI",
  description: "Tạo ra những chiếc áo thun độc đáo với công nghệ AI tiên tiến. TEECRAFT mang đến nền tảng thiết kế thời trang cá nhân hóa dễ dàng và thú vị cho người Việt Nam.",
  keywords: "TEECRAFT, thiết kế áo thun, AI, thời trang cá nhân hóa, tùy chỉnh áo, thiết kế online, thời trang Việt Nam",
  icons: [
    {
      rel: 'icon',
      type: 'image/png',
      url: '/branch.png?v=1',
    },
    {
      rel: 'shortcut icon',
      type: 'image/png',
      url: '/branch.png?v=1',
    },
    {
      rel: 'apple-touch-icon',
      type: 'image/png',
      url: '/branch.png?v=1',
    },
  ],
}

export default function HomePage() {
  return (
    <>
      <VoucherDialog />
      <HeroSection />
      <FeaturesSection />
      <FeaturedProductsSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
    </>
  )
}
