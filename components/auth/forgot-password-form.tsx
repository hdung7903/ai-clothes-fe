"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { requestPasswordResetAction, clearError } from "@/redux/authSlice"

const forgotPasswordSchema = z.object({
  email: z.string().email("Vui lòng nhập địa chỉ email hợp lệ"),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm() {
  const [isSuccess, setIsSuccess] = useState(false)
  const [lastEmail, setLastEmail] = useState<string>("")
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isLoading, error } = useAppSelector((state) => state.auth)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  // Clear error when component mounts
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  const onSubmit = async (data: ForgotPasswordFormData) => {
    const result = await dispatch(requestPasswordResetAction(data))
    
    if (requestPasswordResetAction.fulfilled.match(result)) {
      setLastEmail(data.email)
      setIsSuccess(true)
      // Auto-navigate to reset screen after short delay
      setTimeout(() => {
        router.push(`/auth/reset-password?email=${encodeURIComponent(data.email)}`)
      }, 1200)
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
          <h3 className="text-lg font-semibold text-foreground mb-2">Kiểm tra email của bạn</h3>
          <p className="text-muted-foreground">Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn.</p>
        </div>
        <div className="grid grid-cols-1 gap-2">
          <Button onClick={() => router.push(`/auth/reset-password?email=${encodeURIComponent(lastEmail)}`)} className="w-full">
            Tiếp tục đặt lại mật khẩu
          </Button>
          <Button variant="outline" onClick={() => setIsSuccess(false)} className="w-full">
            Gửi lại email khác
          </Button>
        </div>
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
        <Input
          id="email"
          type="email"
          placeholder="Nhập địa chỉ email của bạn"
          {...register("email")}
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang gửi email đặt lại...
          </>
        ) : (
          "Gửi email đặt lại"
        )}
      </Button>
    </form>
  )
}
