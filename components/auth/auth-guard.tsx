'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
}

/**
 * AuthGuard - Bảo vệ các route yêu cầu đăng nhập
 * Redirect về /auth/login nếu chưa đăng nhập
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, isBootstrapping } = useSelector((state: RootState) => state.auth)
  const hasRedirected = useRef(false)

  useEffect(() => {
    // Nếu đang loading hoặc đang bootstrap (khởi tạo auth trên client), chờ
    if (isLoading || isBootstrapping) {
      return
    }

    // Nếu đã redirect rồi thì không redirect nữa
    if (hasRedirected.current) {
      return
    }

    // Nếu chưa đăng nhập, chuyển về trang login
    if (!isAuthenticated || !user) {
      hasRedirected.current = true
      router.push('/auth/login')
      return
    }
  }, [user, isAuthenticated, isLoading, isBootstrapping, router])

  // Hiển thị loading khi đang kiểm tra hoặc đang bootstrap
  if (isLoading || isBootstrapping) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Đang xác thực...</p>
        </div>
      </div>
    )
  }

  // Nếu chưa đăng nhập, không hiển thị nội dung
  if (!isAuthenticated || !user) {
    return null
  }

  return <>{children}</>
}
