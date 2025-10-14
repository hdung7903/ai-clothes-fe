import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted py-20 lg:py-32">
      {/* Decorative branch elements */}
      <div className="absolute top-10 left-10 opacity-10 rotate-12">
        <img src="/branch.png" alt="" className="h-16 w-16 object-contain" />
      </div>
      <div className="absolute top-20 right-20 opacity-5 -rotate-12">
        <img src="/branch.png" alt="" className="h-12 w-12 object-contain" />
      </div>
      <div className="absolute bottom-20 left-1/4 opacity-8 rotate-45">
        <img src="/branch.png" alt="" className="h-10 w-10 object-contain" />
      </div>
      
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              <span>{"Mùa Mới • Sản Phẩm Giới Hạn"}</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-balance leading-tight">
              {"Nâng Cấp "}
              <span className="text-primary">{"Tủ Quần Áo"}</span>
              {" của bạn với "}
              <span className="text-accent">{"Thời Trang Hiện Đại"}</span>
            </h1>

            <p className="text-xl text-muted-foreground text-pretty leading-relaxed max-w-2xl">
              {"Khám phá các bộ sưu tập được tuyển chọn, những món đồ thiết yếu hàng ngày và những món đồ nổi bật được thiết kế cho sự thoải mái, chất lượng và phong cách dễ dàng."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg px-8 py-6">
                {"Mua Sắm Hàng Mới"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent">
                {"Xem Bán Chạy"}
              </Button>
            </div>

            <div className="flex items-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-primary rounded-full"></div>
                <span>{"Miễn Phí Vận Chuyển Trên 1.500.000đ"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-accent rounded-full"></div>
                <span>{"Đổi Trả Dễ Dàng Trong 30 Ngày"}</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 p-8">
              <img
                src="/floral-t-shirt-design.jpg"
                alt="Áo Thun Hoa từ Bộ Sưu Tập Mới"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
