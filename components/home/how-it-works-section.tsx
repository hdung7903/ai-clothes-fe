import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shirt, Heart, ShoppingCart } from "lucide-react"

const steps = [
  {
    step: "01",
    icon: Shirt,
    title: "Tìm Phong Cách Của Bạn",
    description:
      "Duyệt qua hàng mới và các món được tuyển chọn để khám phá những món bạn sẽ yêu thích.",
  },
  {
    step: "02",
    icon: Heart,
    title: "Chọn Kích Thước Phù Hợp",
    description:
      "Sử dụng hướng dẫn kích thước và đánh giá của chúng tôi để chọn kích thước và vừa vặn hoàn hảo.",
  },
  {
    step: "03",
    icon: ShoppingCart,
    title: "Thanh Toán Nhanh",
    description: "Thanh toán an toàn, địa chỉ đã lưu và tùy chọn vận chuyển nhanh.",
  },
  {
    step: "04",
    icon: Shirt,
    title: "Mặc Lại Nhiều Lần",
    description:
      "Tận hưởng sự thoải mái cao cấp và chất lượng được thiết kế cho cuộc sống hàng ngày.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-balance">
            {"Cách "}
            <span className="text-primary">{"Mua Sắm"}</span>
          </h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
            {"Trải nghiệm mua sắm đơn giản từ khám phá đến giao hàng trong bốn bước dễ dàng."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="border-border hover:shadow-lg transition-shadow duration-300 h-full">
                <CardHeader className="space-y-4 text-center">
                  <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center relative">
                    <step.icon className="h-8 w-8 text-primary" />
                    <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-accent text-accent-foreground text-sm font-bold flex items-center justify-center">
                      {step.step}
                    </div>
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <div className="h-0.5 w-8 bg-border"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
