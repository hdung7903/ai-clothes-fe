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
import { loginUser, clearError, fetchUserProfile } from "@/redux/authSlice"

const loginSchema = z.object({
  email: z.string().email("Vui lòng nhập địa chỉ email hợp lệ"),
  password: z.string().min(5, "Mật khẩu phải có ít nhất 5 ký tự"),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [loginAttempted, setLoginAttempted] = useState(false)
  const router = useRouter()
  const dispatch = useAppDispatch()
  const authState = useAppSelector((state) => state.auth)
  const { 
    isLoading, 
    error, 
    isAuthenticated, 
    tokens, 
    user, 
    lastErrorPayload,
    isBootstrapping = true // Default to true to prevent premature redirects
  } = authState

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // Fetch profile once we have tokens after login attempt
  useEffect(() => {
    if (loginAttempted && tokens?.accessToken && !user) {
      console.log('📥 Fetching user profile with token...')
      dispatch(fetchUserProfile(tokens.accessToken))
    }
  }, [tokens?.accessToken, user, dispatch, loginAttempted])

  // Điều hướng sau khi đăng nhập thành công
  useEffect(() => {
    // Only redirect after a login attempt, not on mount
    if (!loginAttempted) return
    
    if (!isAuthenticated) return
    if (!user) {
      console.log('⏳ Authenticated but no user profile yet, waiting...')
      return
    }

    console.log('🚀 Login successful, redirecting based on role:', user.roles)
    if (Array.isArray(user.roles) && user.roles.includes('Administrator')) {
      router.push('/admin/dashboard')
    } else {
      router.push('/')
    }
  }, [isAuthenticated, user, router, loginAttempted])

  // Clear error when component mounts
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  const onSubmit = async (data: LoginFormData) => {
    console.log('🔐 Login attempt started')
    setLoginAttempted(true)
    const result = await dispatch(loginUser(data))
    
    // Kiểm tra nếu có lỗi ACCOUNT_EMAIL_NOT_VERIFIED
    if (loginUser.rejected.match(result)) {
      const errorPayload = result.payload as any
      console.log('Login error payload:', errorPayload)
      
      // Kiểm tra cấu trúc lỗi từ API
      if (errorPayload?.ACCOUNT_EMAIL_NOT_VERIFIED || 
          (errorPayload?.errors && errorPayload.errors.ACCOUNT_EMAIL_NOT_VERIFIED)) {
        // Clear error trước khi chuyển hướng
        dispatch(clearError())
        router.push(`/auth/verify?email=${encodeURIComponent(data.email)}`)
        return
      }
    } else if (loginUser.fulfilled.match(result)) {
      console.log('✅ Login fulfilled, tokens received:', result.payload)
    }
  }

  // Kiểm tra lỗi từ state sau khi login failed
  useEffect(() => {
    if (lastErrorPayload && !isLoading) {
      console.log('Checking lastErrorPayload:', lastErrorPayload)
      
      // Kiểm tra cấu trúc lỗi từ API
      if (lastErrorPayload?.ACCOUNT_EMAIL_NOT_VERIFIED || 
          (lastErrorPayload?.errors && lastErrorPayload.errors.ACCOUNT_EMAIL_NOT_VERIFIED)) {
        // Lấy email từ form data hiện tại
        const formData = watch()
        if (formData.email) {
          // Clear error trước khi chuyển hướng
          dispatch(clearError())
          router.push(`/auth/verify?email=${encodeURIComponent(formData.email)}`)
        }
      }
    }
  }, [lastErrorPayload, isLoading, router, watch])

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
          placeholder="Nhập email của bạn"
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
            placeholder="Nhập mật khẩu"
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


      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang đăng nhập...
          </>
        ) : (
          "Đăng nhập"
        )}
      </Button>
    </form>
  )
}
