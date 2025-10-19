"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { registerUser, clearError, requestEmailVerificationAction } from "@/redux/authSlice"

const registerSchema = z
  .object({
    firstName: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
    lastName: z.string().min(2, "Họ phải có ít nhất 2 ký tự"),
    email: z.string().email("Vui lòng nhập địa chỉ email hợp lệ"),
    password: z
      .string()
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số",
      ),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, "Bạn phải đồng ý với điều khoản và chính sách"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  })

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isLoading, error } = useAppSelector((state) => state.auth)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const acceptTerms = watch("acceptTerms")

  // Clear error when component mounts
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  const onSubmit = async (data: RegisterFormData) => {
    const { firstName, lastName, confirmPassword, acceptTerms, ...credentials } = data
    const result = await dispatch(registerUser(credentials))
    
    if (registerUser.fulfilled.match(result)) {
      // Save email for verification flow
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('pendingVerificationEmail', credentials.email)
        }
      } catch {}
      // Fire and forget email verification request and navigate to verify page
      dispatch(requestEmailVerificationAction({ email: credentials.email }))
      router.push(`/auth/verify?email=${encodeURIComponent(credentials.email)}`)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Image src="/branch.png" alt="AI Clothes" width={120} height={120} priority />
        </div>
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Tạo tài khoản thành công!</h3>
          <p className="text-muted-foreground">Tài khoản của bạn đã được tạo. Đang chuyển đến trang đăng nhập...</p>
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Tên</Label>
          <Input
            id="firstName"
            placeholder="Tên"
            {...register("firstName")}
            className={errors.firstName ? "border-destructive" : ""}
          />
          {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Họ</Label>
          <Input
            id="lastName"
            placeholder="Họ"
            {...register("lastName")}
            className={errors.lastName ? "border-destructive" : ""}
          />
          {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="nhan@example.com"
          {...register("email")}
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Tạo mật khẩu mạnh"
            {...register("password")}
            className={errors.password ? "border-destructive pr-10" : "pr-10"}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Xác nhận mật khẩu"
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

      <div className="flex items-start space-x-2">
        <Checkbox
          id="acceptTerms"
          checked={acceptTerms}
          onCheckedChange={(checked) => setValue("acceptTerms", !!checked)}
          className="mt-1"
        />
        <Label htmlFor="acceptTerms" className="text-sm font-normal leading-5">
          Tôi đồng ý với{" "}
          <a href="/terms" className="text-primary hover:text-primary/80 underline">
            Điều khoản dịch vụ
          </a>{" "}
          và{" "}
          <a href="/privacy" className="text-primary hover:text-primary/80 underline">
            Chính sách bảo mật
          </a>
        </Label>
      </div>
      {errors.acceptTerms && <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang tạo tài khoản...
          </>
        ) : (
          "Tạo tài khoản"
        )}
      </Button>
    </form>
  )
}
