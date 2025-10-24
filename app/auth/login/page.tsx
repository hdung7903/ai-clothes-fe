"use client"

import { useEffect } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { useAppSelector } from "@/redux/hooks"
import { Loader2 } from "lucide-react"

// export const metadata: Metadata = {
//   title: "Đăng nhập - TEECRAFT",
//   description: "Đăng nhập vào tài khoản TEECRAFT của bạn",
// }

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, user, isBootstrapping } = useAppSelector((state) => state.auth)

  // Redirect authenticated users away from login page
  useEffect(() => {
    // Wait for bootstrap to complete before redirecting
    if (isBootstrapping) return
    
    if (isAuthenticated && user) {
      console.log('👤 User already authenticated, redirecting from login page...')
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
            <h1 className="text-2xl font-bold text-foreground mb-2">Chào mừng trở lại</h1>
            <p className="text-muted-foreground">Đăng nhập để tiếp tục thiết kế với AI</p>
          </div>

          <LoginForm />

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Chưa có tài khoản?{" "}
              <Link href="/auth/register" className="text-primary hover:text-primary/80 font-medium">
                Đăng ký
              </Link>
            </p>
            <Link href="/auth/forgot-password" className="text-sm text-muted-foreground hover:text-foreground block">
              Quên mật khẩu?
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
