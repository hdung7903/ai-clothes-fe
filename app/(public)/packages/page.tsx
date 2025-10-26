"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Sparkles, Zap, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { getQrCode } from "@/services/paymentService"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Image from "next/image"

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
      "Tạo thiết kế không giới hạn",
      "Truy cập thư viện mẫu cơ bản",
      "Xuất file chất lượng tiêu chuẩn",
      "Hỗ trợ qua email",
      "Chưa bao gồm tính năng tạo ảnh bằng AI",
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
    description: "Nhận ngay 10 lượt tạo ảnh AI bất kỳ",
    icon: Zap,
    iconColor: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950",
    borderColor: "border-green-200 dark:border-green-800",
    popular: true,
    features: [
      "Bao gồm toàn bộ tính năng của gói Miễn Phí",
      "Mở khóa toàn bộ thư viện mẫu cao cấp",
      "Hỗ trợ ưu tiên và phản hồi nhanh",
      "Dùng hết lượt tạo ảnh AI sẽ tự động chuyển về gói miễn phí",
    ],
  },
]

export default function PackagesPage() {
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [isLoadingQr, setIsLoadingQr] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<typeof packages[0] | null>(null)

  const handleBuyPackage = async (pkg: typeof packages[0]) => {
    if (pkg.id === 1) {
      // Gói miễn phí - điều hướng đến đăng ký
      window.location.href = "/auth/register"
      return
    }

    // Gói Pro - hiển thị QR code
    setSelectedPackage(pkg)
    setIsQrDialogOpen(true)
    setIsLoadingQr(true)
    
    try {
      const amount = 30000 // 30,000 VND
      const response = await getQrCode(amount)
      
      if (response.data) {
        setQrCodeUrl(response.data)
      } else {
        console.error('Failed to get QR code')
        alert('Không thể tạo mã QR. Vui lòng thử lại sau.')
        setIsQrDialogOpen(false)
      }
    } catch (error) {
      console.error('Error fetching QR code:', error)
      alert('Đã xảy ra lỗi khi tạo mã QR. Vui lòng thử lại sau.')
      setIsQrDialogOpen(false)
    } finally {
      setIsLoadingQr(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
          Mua Gói AI - Tạo Ảnh Ngay
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Nâng cấp lên gói Pro với chỉ 30,000đ và nhận ngay 10 lượt tạo ảnh AI bất kỳ để thiết kế sáng tạo
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
                  <Button 
                    onClick={() => handleBuyPackage(pkg)}
                    className={`w-full ${
                      pkg.popular 
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg' 
                        : 'bg-transparent text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950 hover:text-green-700 dark:hover:text-green-300 border border-green-300 dark:border-green-700'
                    } transition-all duration-300`}
                    size="lg"
                  >
                    {pkg.id === 1 ? 'Bắt Đầu Miễn Phí' : 'Mua Ngay'}
                  </Button>
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
                10 lượt tạo ảnh AI có thể tạo ảnh gì?
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
                10 lượt tạo ảnh AI của bạn không có thời hạn sử dụng. Bạn có thể sử dụng bất cứ lúc nào sau khi mua gói.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* QR Code Payment Dialog */}
      <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
              Thanh Toán Gói Pro
            </DialogTitle>
            <DialogDescription className="text-center">
              Quét mã QR để thanh toán {selectedPackage?.price}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center gap-4 py-4">
            {isLoadingQr ? (
              <div className="flex flex-col items-center gap-2">
                <div className="h-64 w-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Đang tạo mã QR...</p>
                </div>
              </div>
            ) : qrCodeUrl ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative h-64 w-64 bg-white p-4 rounded-lg shadow-lg">
                  <Image
                    src={qrCodeUrl}
                    alt="QR Code Payment"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                    Quét mã QR bằng ứng dụng ngân hàng
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Sau khi thanh toán thành công, gói Pro sẽ được kích hoạt tự động
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center text-red-500">
                Không thể tải mã QR
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => setIsQrDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
