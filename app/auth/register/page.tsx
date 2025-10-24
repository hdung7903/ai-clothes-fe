"use client"

import { useEffect } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { RegisterForm } from "@/components/auth/register-form"
import { useAppSelector } from "@/redux/hooks"
import { Loader2 } from "lucide-react"

// export const metadata: Metadata = {
//   title: "Đăng ký - TEECRAFT",
//   description: "Tạo tài khoản TEECRAFT của bạn",
// }

export default function RegisterPage() {
  const router = useRouter()
  const { isAuthenticated, user, isBootstrapping } = useAppSelector((state) => state.auth)

  // Redirect authenticated users away from register page
  useEffect(() => {
    // Wait for bootstrap to complete before redirecting
    if (isBootstrapping) return
    
    if (isAuthenticated && user) {
      console.log('👤 User already authenticated, redirecting from register page...')
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
            <h1 className="text-2xl font-bold text-foreground mb-2">Tạo tài khoản</h1>
            <p className="text-muted-foreground">Tham gia cùng hàng nghìn nhà thiết kế sử dụng AI</p>
          </div>

          <RegisterForm />

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Đã có tài khoản?{" "}
              <Link href="/auth/login" className="text-primary hover:text-primary/80 font-medium">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
