"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Home, Search, ArrowLeft, FileX, HelpCircle, ExternalLink } from "lucide-react"

export default function NotFound() {
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = "/"
    }
  }

  const popularPages = [
    { name: "Trang Chủ", href: "/", icon: Home },
    { name: "Sản Phẩm", href: "/products", icon: Search },
    { name: "Công Cụ Thiết Kế", href: "/design", icon: ExternalLink },
    { name: "Về Chúng Tôi", href: "/about", icon: HelpCircle },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Main 404 Card */}
        <Card className="border-primary/20">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <FileX className="h-20 w-20 text-primary" />
                <div className="absolute -top-2 -right-2">
                  <Search className="h-6 w-6 text-primary animate-pulse" />
                </div>
              </div>
            </div>
            <div className="text-7xl font-bold text-primary mb-2">404</div>
            <CardTitle className="text-2xl">Không Tìm Thấy Trang</CardTitle>
            <CardDescription className="text-base">
              Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Search className="h-4 w-4" />
              <AlertDescription>
                Có thể URL đã thay đổi hoặc trang đã bị xóa. Hãy thử các liên kết bên dưới.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Link href="/" className="w-full">
                <Button className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Về Trang Chủ
                </Button>
              </Link>

              <Link href="/products" className="w-full">
                <Button variant="outline" className="w-full">
                  <Search className="h-4 w-4 mr-2" />
                  Xem Sản Phẩm
                </Button>
              </Link>

              <Button 
                variant="outline" 
                onClick={handleGoBack}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay Lại
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Suggestions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Có Thể Bạn Đang Tìm
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Dưới đây là một số trang phổ biến có thể hữu ích:
            </p>
            
            <div className="grid grid-cols-1 gap-2">
              {popularPages.map((page) => {
                const IconComponent = page.icon
                return (
                  <Link key={page.href} href={page.href}>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start h-auto p-3"
                    >
                      <IconComponent className="h-4 w-4 mr-3 flex-shrink-0" />
                      <span className="text-left">{page.name}</span>
                    </Button>
                  </Link>
                )
              })}
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="w-full"
            >
              {showSuggestions ? 'Ẩn' : 'Hiển thị'} gợi ý khác
            </Button>
            
            {showSuggestions && (
              <div className="mt-3 p-3 bg-muted rounded-md text-sm">
                <p className="font-medium mb-2">Mẹo tìm kiếm:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Kiểm tra lại URL có đúng chính tả không</li>
                  <li>• Thử tìm kiếm từ khóa trong thanh tìm kiếm</li>
                  <li>• Sử dụng menu điều hướng chính</li>
                  <li>• Liên hệ hỗ trợ nếu vẫn không tìm thấy</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
