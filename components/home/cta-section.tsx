import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-accent p-12 lg:p-20 text-center">
          <div className="relative z-10 space-y-8">
            <div className="inline-flex items-center space-x-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              <span>{"Đừng Bỏ Lỡ"}</span>
            </div>

            <h2 className="text-3xl lg:text-5xl font-bold text-white text-balance">
              {"Mua Sắm Ngay "}
              <br />
              {"Trước Khi Hết Hàng"}
            </h2>

            <p className="text-xl text-white/90 text-pretty max-w-2xl mx-auto">
              {"Khám phá phong cách mới toanh! Nhận ngay hàng loạt voucher và tận hưởng đổi trả dễ dàng trong 5 ngày."}
            </p>

          </div>

          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-accent/90"></div>
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 border border-white rounded-full"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 border border-white rounded-full"></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-white rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
