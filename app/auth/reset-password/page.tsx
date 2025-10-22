import type { Metadata } from "next"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export const metadata: Metadata = {
  title: "Đặt mật khẩu mới - TEECRAFT",
  description: "Nhập mã được gửi đến email của bạn để đặt mật khẩu mới",
}

export default function ResetPasswordPage() {
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


