"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Sparkles, Zap, X, Clock } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { buyTokenPackage, createQrCode, checkPaymentStatus } from "@/services/paymentServices"
import { useRouter } from "next/navigation"
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
    tokenPackageId: null, // Không có token package ID cho gói miễn phí
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
    tokenPackageId: "11111111-1111-1111-1111-111111111111", // ID của gói token
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
  const router = useRouter()
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [isLoadingQr, setIsLoadingQr] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<typeof packages[0] | null>(null)
  const [timeLeft, setTimeLeft] = useState(120) // 2 phút = 120 giây
  const [isExpired, setIsExpired] = useState(false)
  const [paymentCode, setPaymentCode] = useState<string | null>(null)
  const [isCheckingPayment, setIsCheckingPayment] = useState(false)

  // Countdown timer
  useEffect(() => {
    if (!isQrDialogOpen || isLoadingQr || !qrCodeUrl) {
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsExpired(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isQrDialogOpen, isLoadingQr, qrCodeUrl])

  // Reset timer khi đóng dialog
  useEffect(() => {
    if (!isQrDialogOpen) {
      setTimeLeft(120)
      setIsExpired(false)
      setQrCodeUrl(null)
      setPaymentCode(null)
      setIsCheckingPayment(false)
    }
  }, [isQrDialogOpen])

  // Kiểm tra trạng thái thanh toán định kỳ
  useEffect(() => {
    if (!isQrDialogOpen || !paymentCode || isExpired || isLoadingQr) {
      return
    }

    // Kiểm tra ngay lập tức
    const checkStatus = async () => {
      if (isCheckingPayment) return
      
      setIsCheckingPayment(true)
      try {
        const response = await checkPaymentStatus({ paymentCode })
        
        if (response.success && response.data?.isPaid) {
          // Thanh toán thành công
          setIsQrDialogOpen(false)
          
          // Hiển thị thông báo thành công
          alert('Thanh toán thành công! Gói Pro đã được kích hoạt.')
          
          // Reload trang để cập nhật dữ liệu
          window.location.reload()
          
          // Điều hướng về trang chủ sau khi reload
          setTimeout(() => {
            router.push('/')
          }, 100)
        }
      } catch (error) {
        console.error('Error checking payment status:', error)
      } finally {
        setIsCheckingPayment(false)
      }
    }

    // Kiểm tra mỗi 3 giây
    const interval = setInterval(checkStatus, 3000)
    checkStatus() // Gọi ngay lần đầu

    return () => clearInterval(interval)
  }, [isQrDialogOpen, paymentCode, isExpired, isLoadingQr, isCheckingPayment, router])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleBuyPackage = async (pkg: typeof packages[0]) => {
    if (pkg.id === 1) {
      // Gói miễn phí - điều hướng đến đăng ký
      window.location.href = "/auth/register"
      return
    }

    // Gói Pro - mua gói token và hiển thị QR code
    if (!pkg.tokenPackageId) {
      alert('Thông tin gói không hợp lệ')
      return
    }

    setSelectedPackage(pkg)
    setIsQrDialogOpen(true)
    setIsLoadingQr(true)
    
    try {
      // Bước 1: Gọi API mua gói token
      const buyResponse = await buyTokenPackage({
        tokenPackageId: pkg.tokenPackageId
      })
      
      if (!buyResponse.success || !buyResponse.data) {
        console.error('Failed to buy token package:', buyResponse.errors)
        alert('Không thể mua gói. Vui lòng thử lại sau.')
        setIsQrDialogOpen(false)
        return
      }

      const { paymentCode, amount } = buyResponse.data

      // Lưu paymentCode để kiểm tra trạng thái
      setPaymentCode(paymentCode)

      // Bước 2: Gọi API tạo mã QR với paymentCode và amount
      const qrResponse = await createQrCode({
        paymentCode,
        amount
      })
      
      if (qrResponse.success && qrResponse.data) {
        setQrCodeUrl(qrResponse.data)
      } else {
        console.error('Failed to get QR code:', qrResponse.errors)
        alert('Không thể tạo mã QR. Vui lòng thử lại sau.')
        setIsQrDialogOpen(false)
      }
    } catch (error) {
      console.error('Error in payment process:', error)
      alert('Đã xảy ra lỗi. Vui lòng thử lại sau.')
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
            ) : isExpired ? (
              <div className="flex flex-col items-center gap-4">
                <div className="h-64 w-64 bg-red-50 dark:bg-red-950 rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Clock className="h-12 w-12 text-red-500 mx-auto" />
                    <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                      Mã QR đã hết hạn
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Vui lòng thử lại
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setIsQrDialogOpen(false)
                    if (selectedPackage) {
                      setTimeout(() => handleBuyPackage(selectedPackage), 300)
                    }
                  }}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  Tạo mã QR mới
                </Button>
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
                
                {/* Countdown Timer */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                  timeLeft <= 30 
                    ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400' 
                    : 'bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400'
                }`}>
                  <Clock className="h-4 w-4" />
                  <span className="font-mono font-semibold">
                    {formatTime(timeLeft)}
                  </span>
                </div>

                <div className="text-center space-y-2">
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                    Quét mã QR bằng ứng dụng ngân hàng
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Sau khi thanh toán thành công, gói Pro sẽ được kích hoạt tự động
                  </p>
                  <p className="text-xs text-red-500 font-medium">
                    Mã QR có hiệu lực trong 2 phút
                  </p>
                  {isCheckingPayment && (
                    <p className="text-xs text-blue-500 font-medium animate-pulse">
                      Đang kiểm tra trạng thái thanh toán...
                    </p>
                  )}
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
