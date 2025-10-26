"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Sparkles, Zap } from "lucide-react"
import Link from "next/link"

const packages = [
  {
    id: 1,
    name: "Gói Miễn Phí",
    price: "0đ",
    period: "",
    description: "Hoàn hảo cho người mới bắt đầu",
    icon: Sparkles,
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    borderColor: "border-blue-200 dark:border-blue-800",
    features: [
      "Thiết kế không giới hạn",
      "Thư viện mẫu cơ bản",
      "Xuất file chất lượng tiêu chuẩn",
      "Hỗ trợ qua email",
      "Lưu trữ đám mây",
    ],
    limitations: [
      "Không có AI tạo ảnh",
    ]
  },
  {
    id: 2,
    name: "Gói Pro",
    price: "30,000đ",
    period: "",
    description: "Nhận ngay 10 ảnh AI bất kỳ",
    icon: Zap,
    iconColor: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950",
    borderColor: "border-green-200 dark:border-green-800",
    popular: true,
    features: [
      "Tất cả tính năng gói Miễn Phí",
      "10 ảnh AI tạo bất kỳ",
      "Toàn bộ thư viện mẫu premium",
      "Xuất file chất lượng cao",
      "Xóa logo watermark",
      "Hỗ trợ ưu tiên",
    ],
  },
]

export default function PackagesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
          Mua Gói AI - Tạo Ảnh Ngay
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Nâng cấp lên gói Pro với chỉ 30,000đ và nhận ngay 10 ảnh AI bất kỳ để thiết kế sáng tạo
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {packages.map((pkg) => {
            const Icon = pkg.icon
            return (
              <Card 
                key={pkg.id} 
                className={`relative flex flex-col ${pkg.popular ? 'ring-2 ring-green-500 shadow-xl scale-105' : ''} ${pkg.borderColor} hover:shadow-lg transition-all duration-300`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    Phổ Biến Nhất
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <div className={`w-16 h-16 ${pkg.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md`}>
                    <Icon className={`h-8 w-8 ${pkg.iconColor}`} />
                  </div>
                  <CardTitle className="text-2xl font-bold">{pkg.name}</CardTitle>
                  <CardDescription className="text-sm mt-2">{pkg.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{pkg.price}</span>
                    <span className="text-muted-foreground">{pkg.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                    {pkg.limitations?.map((limitation, index) => (
                      <li key={`limit-${index}`} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-6">
                  <Link href={pkg.id === 1 ? "/auth/register" : "/checkout"} className="w-full">
                    <Button 
                      className={`w-full ${
                        pkg.popular 
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg' 
                          : 'bg-transparent text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950 hover:text-green-700 dark:hover:text-green-300 border border-green-300 dark:border-green-700'
                      } transition-all duration-300`}
                      size="lg"
                    >
                      {pkg.id === 1 ? 'Bắt Đầu Miễn Phí' : 'Mua Ngay'}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </section>

      {/* FAQ or Additional Info Section */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-2xl p-8 border border-green-200 dark:border-green-800">
          <h2 className="text-2xl font-bold mb-4 text-center">Câu Hỏi Thường Gặp</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-green-600 dark:text-green-400 mb-2">
                10 ảnh AI có thể tạo ảnh gì?
              </h3>
              <p className="text-sm text-muted-foreground">
                Bạn có thể tạo bất kỳ ảnh nào bạn muốn: logo, hình minh họa, design pattern, mockup, hoặc bất kỳ ý tưởng sáng tạo nào cho sản phẩm của mình.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-green-600 dark:text-green-400 mb-2">
                Phương thức thanh toán nào được hỗ trợ?
              </h3>
              <p className="text-sm text-muted-foreground">
                Chúng tôi chấp nhận thanh toán qua thẻ tín dụng, thẻ ghi nợ, chuyển khoản ngân hàng và ví điện tử.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-green-600 dark:text-green-400 mb-2">
                Gói Pro có thời hạn sử dụng không?
              </h3>
              <p className="text-sm text-muted-foreground">
                10 ảnh AI của bạn không có thời hạn sử dụng. Bạn có thể sử dụng bất cứ lúc nào sau khi mua gói.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
