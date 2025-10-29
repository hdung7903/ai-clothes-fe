import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-green-50 to-yellow-50 py-20 lg:py-32">
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
            <div className="inline-flex items-center space-x-2 bg-yellow-400/20 text-yellow-700 px-4 py-2 rounded-full text-sm font-medium border border-yellow-400/30">
              <Sparkles className="h-4 w-4" />
              <span>{"Mùa Mới • Sản Phẩm Giới Hạn"}</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-balance leading-tight text-gray-900 tracking-wide antialiased font-[family-name:var(--font-playfair)]">
              {"Nâng Cấp "}
              <span className="text-green-600">{"Tủ Quần Áo"}</span>
              {" của bạn với "}
              <span className="text-amber-500 bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">{"Thời Trang Hiện Đại"}</span>

            </h1>

            <p className="text-xl text-gray-600 text-pretty leading-relaxed max-w-2xl">
              {"Khám phá các bộ sưu tập được tuyển chọn, những món đồ thiết yếu hàng ngày và những món đồ nổi bật được thiết kế cho sự thoải mái, chất lượng và phong cách dễ dàng."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/30"
                asChild
              >
                <a href="/products">
                  {"Mua Sắm Ngay"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6 bg-white border-2 border-green-600 text-green-600 hover:bg-green-50"
                asChild
              >
                <a href="/packages">
                  {"Trải nghiệm Thiết Kế"}
                </a>
              </Button>
            </div>

            <div className="flex items-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                <span>{"Miễn Phí Vận Chuyển"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                <span>{"Đổi Trả Dễ Dàng Trong 5 Ngày"}</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-green-400/30 via-yellow-300/30 to-green-500/30 p-8 shadow-2xl">
              <img
                src="/landing.png"
                alt="Áo Thun Hoa từ Bộ Sưu Tập Mới"
                className="w-full h-full object-cover rounded-xl shadow-lg"
              />
            </div>
            {/* Decorative accent */}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-yellow-400 rounded-full blur-3xl opacity-20"></div>
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-green-500 rounded-full blur-3xl opacity-20"></div>
          </div>
        </div>
      </div>
    </section>
  )
}