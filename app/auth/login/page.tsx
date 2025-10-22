import type { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Đăng nhập - TEECRAFT",
  description: "Đăng nhập vào tài khoản TEECRAFT của bạn",
}

export default function LoginPage() {
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
