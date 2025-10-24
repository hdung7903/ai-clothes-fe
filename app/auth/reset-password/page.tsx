"use client"

import { useEffect } from "react"
import type { Metadata } from "next"
import { useRouter } from "next/navigation"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { useAppSelector } from "@/redux/hooks"
import { Loader2 } from "lucide-react"

// export const metadata: Metadata = {
//   title: "Đặt mật khẩu mới - TEECRAFT",
//   description: "Nhập mã được gửi đến email của bạn để đặt mật khẩu mới",
// }

export default function ResetPasswordPage() {
  const router = useRouter()
  const { isAuthenticated, user, isBootstrapping } = useAppSelector((state) => state.auth)

  // Redirect authenticated users away from reset password page
  useEffect(() => {
    // Wait for bootstrap to complete before redirecting
    if (isBootstrapping) return
    
    if (isAuthenticated && user) {
      console.log('👤 User already authenticated, redirecting from reset password page...')
      if (user.roles?.includes('Administrator')) {
        router.replace('/admin/dashboard')
      } else {
        router.replace('/')
      }
    }
  }, [isAuthenticated, user, isBootstrapping, router])

  // Show loading while checking auth status
  if (isBootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Đang kiểm tra trạng thái đăng nhập...</p>
        </div>
      </div>
    )
  }

  // If already authenticated, show loading while redirecting
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Đang chuyển hướng...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-lg border p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Đặt mật khẩu mới</h1>
            <p className="text-muted-foreground">Nhập mã được gửi đến email và mật khẩu mới của bạn</p>
          </div>
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  )
}


