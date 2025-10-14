import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Nguyễn Thị Lan",
    role: "Khách Hàng Đã Xác Thực",
    content:
      "Vừa vặn hoàn hảo và chất liệu cảm giác cao cấp. Tôi đã mặc chiếc áo mới này liên tục!",
    rating: 5,
    avatar: "/professional-woman-fashion-designer.jpg",
  },
  {
    name: "Trần Minh Tuấn",
    role: "Khách Hàng Đã Xác Thực",
    content:
      "Giao hàng nhanh và chất lượng tuyệt vời. Đường may và hoàn thiện vượt xa giá tiền.",
    rating: 5,
    avatar: "/professional-man-boutique-owner.jpg",
  },
  {
    name: "Lê Thị Hương",
    role: "Khách Hàng Đã Xác Thực",
    content: "Đúng kích thước và cực kỳ thoải mái. Nhận được lời khen mỗi khi tôi mặc nó.",
    rating: 5,
    avatar: "/young-woman-fashion-enthusiast.png",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-balance">
            {"Khách Hàng "}
            <span className="text-primary">{"Nói Gì"}</span>
          </h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
            {"Đánh giá thực tế về sự thoải mái, vừa vặn và chất lượng từ những người mua sắm giống như bạn."}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-border hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="space-y-4">
                <div className="flex items-center space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                  ))}
                </div>
                <CardDescription className="text-foreground text-base leading-relaxed">
                  {`"${testimonial.content}"`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
