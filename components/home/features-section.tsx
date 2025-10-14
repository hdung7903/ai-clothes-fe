import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Palette, ShoppingBag, Users, Shirt, Heart } from "lucide-react"

const features = [
  {
    icon: Shirt,
    title: "Bộ Sưu Tập Được Tuyển Chọn",
    description:
      "Các món đồ theo mùa và những món thiết yếu hàng ngày được thiết kế cho tủ quần áo hiện đại.",
  },
  {
    icon: Palette,
    title: "Vải Cao Cấp",
    description:
      "Chất liệu mềm mại, thoáng khí với chất lượng bền lâu và chú ý đến từng chi tiết.",
  },
  {
    icon: ShoppingBag,
    title: "Thanh Toán Nhanh, An Toàn",
    description: "Nhiều tùy chọn thanh toán và vận chuyển nhanh tại trang thanh toán.",
  },
  {
    icon: Users,
    title: "Hướng Dẫn Kích Thước",
    description:
      "Thông số chi tiết và khuyến nghị kích thước để giúp bạn tìm được vừa vặn hoàn hảo.",
  },
  {
    icon: Heart,
    title: "Được Khách Hàng Yêu Thích",
    description: "Hàng nghìn đánh giá năm sao về sự thoải mái, vừa vặn và phong cách.",
  },
  {
    icon: ShoppingBag,
    title: "Đổi Trả Dễ Dàng",
    description: "Đổi trả miễn phí trong 30 ngày và tùy chọn tín dụng cửa hàng tức thì.",
  },
  {
    icon: Palette,
    title: "Phong Cách Đa Dạng",
    description: "Từ những món cơ bản cuối tuần đến những món nổi bật, tất cả ở một nơi.",
  },
  {
    icon: Users,
    title: "Hỗ Trợ Chuyên Nghiệp",
    description: "Chăm sóc khách hàng thân thiện sẵn sàng giúp đỡ với đơn hàng và kích thước.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-balance">
            {"Thiết Kế Cho "}
            <span className="text-primary">{"Phong Cách Hàng Ngày"}</span>
          </h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
            {"Mua sắm những món đồ chất lượng với chi tiết tinh tế, vừa vặn dễ dàng và giao hàng không căng thẳng."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-border hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
