"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Server, Home, RefreshCw, AlertTriangle, Clock, Mail, ArrowLeft } from "lucide-react"

export default function ServerErrorPage() {
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const handleRetry = async () => {
    setIsRetrying(true)
    setRetryCount(prev => prev + 1)
    
    // Simulate retry delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    try {
      window.location.reload()
    } catch (error) {
      setIsRetrying(false)
    }
  }

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = "/"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Main Error Card */}
        <Card className="border-destructive/20">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Server className="h-20 w-20 text-destructive" />
                <div className="absolute -top-2 -right-2">
                  <AlertTriangle className="h-6 w-6 text-destructive animate-pulse" />
                </div>
              </div>
            </div>
            <div className="text-7xl font-bold text-destructive mb-2">500</div>
            <CardTitle className="text-2xl">Lỗi Máy Chủ</CardTitle>
            <CardDescription className="text-base">
              Đã xảy ra lỗi không mong muốn từ phía máy chủ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Chúng tôi đã được thông báo về lỗi này và đang khắc phục. Vui lòng thử lại sau ít phút.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button 
                onClick={handleRetry} 
                className="w-full" 
                disabled={isRetrying}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Đang thử lại...' : 'Thử Lại'}
              </Button>

              <Button 
                variant="outline" 
                onClick={handleGoBack}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay Lại
              </Button>

              <Link href="/" className="w-full">
                <Button variant="outline" className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Về Trang Chủ
                </Button>
              </Link>
            </div>

            {retryCount > 0 && (
              <div className="text-sm text-muted-foreground text-center">
                Đã thử lại {retryCount} lần
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Cần Hỗ Trợ?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Nếu lỗi vẫn tiếp tục xảy ra, vui lòng liên hệ với chúng tôi:
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>Email: support@teecraft.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Thời gian phản hồi: 24 giờ</span>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowDetails(!showDetails)}
              className="w-full"
            >
              {showDetails ? 'Ẩn' : 'Hiển thị'} thông tin kỹ thuật
            </Button>
            
            {showDetails && (
              <div className="mt-3 p-3 bg-muted rounded-md text-xs font-mono">
                <div>Error Code: 500</div>
                <div>Timestamp: {new Date().toISOString()}</div>
                <div>User Agent: {typeof window !== 'undefined' ? window.navigator.userAgent.substring(0, 50) + '...' : 'N/A'}</div>
                <div>URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
