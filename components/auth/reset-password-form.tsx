"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { resetPasswordAction, clearError } from "@/redux/authSlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, Eye, EyeOff } from "lucide-react"

const resetPasswordSchema = z
  .object({
    email: z.string().email("Vui lòng nhập địa chỉ email hợp lệ"),
    resetCode: z.string().min(4, "Nhập mã đã gửi đến email của bạn"),
    newPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(6, "Xác nhận mật khẩu mới"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  })

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export function ResetPasswordForm() {
  const dispatch = useAppDispatch()
  const { isLoading, error } = useAppSelector((s) => s.auth)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const searchParams = useSearchParams()
  const emailParam = searchParams.get("email") || ""
  const codeParam = searchParams.get("code") || ""

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: emailParam,
      resetCode: codeParam,
    },
  })

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  const onSubmit = async (data: ResetPasswordFormData) => {
    const result = await dispatch(
      resetPasswordAction({ email: data.email, resetCode: data.resetCode, newPassword: data.newPassword })
    )

    if (resetPasswordAction.fulfilled.match(result)) {
      setIsSuccess(true)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Image src="/branch.png" alt="AI Clothes" width={120} height={120} priority />
        </div>
        <div className="flex justify-center">
          <CheckCircle className="h-12 w-12 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Đã cập nhật mật khẩu</h3>
          <p className="text-muted-foreground">Bạn có thể đăng nhập bằng mật khẩu mới.</p>
        </div>
        <Link href="/auth/login" className="block">
          <Button className="w-full">Đi đến đăng nhập</Button>
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex justify-center">
        <Image src="/branch.png" alt="AI Clothes" width={120} height={120} priority />
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="Email của bạn" {...register("email")} className={errors.email ? "border-destructive" : ""} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="resetCode">Mã đặt lại</Label>
        <Input id="resetCode" type="text" placeholder="Nhập mã" {...register("resetCode")} className={errors.resetCode ? "border-destructive" : ""} />
        {errors.resetCode && <p className="text-sm text-destructive">{errors.resetCode.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">Mật khẩu mới</Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showNewPassword ? "text" : "password"}
            placeholder="Mật khẩu mới"
            {...register("newPassword")}
            className={errors.newPassword ? "border-destructive pr-10" : "pr-10"}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowNewPassword(!showNewPassword)}
          >
            {showNewPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
        {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Xác nhận mật khẩu mới"
            {...register("confirmPassword")}
            className={errors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
        {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang cập nhật mật khẩu...
          </>
        ) : (
          "Cập nhật mật khẩu"
        )}
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        <span>Không nhận được mã? </span>
        <Link href="/auth/forgot-password" className="text-primary hover:text-primary/80">Gửi lại</Link>
      </div>
    </form>
  )
}


