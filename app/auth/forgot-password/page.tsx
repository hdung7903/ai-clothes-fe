import type { Metadata } from "next"
import Link from "next/link"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu - TEECRAFT",
  description: "Đặt lại mật khẩu tài khoản TEECRAFT của bạn",
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-lg border p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Đặt lại mật khẩu</h1>
            <p className="text-muted-foreground">Nhập email của bạn để nhận hướng dẫn đặt lại</p>
          </div>

          <ForgotPasswordForm />

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Nhớ mật khẩu?{" "}
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
