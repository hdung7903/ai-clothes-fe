'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux'
import { Loader2 } from 'lucide-react'

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    // Nếu đang loading, chờ
    if (isLoading) return

    // Nếu chưa đăng nhập, chuyển về trang login
    if (!isAuthenticated || !user) {
      router.push('/auth/login')
      return
    }

    // Kiểm tra role Administrator
    const hasAdminRole = user.roles?.includes('Administrator')
    
    if (!hasAdminRole) {
      // Chuyển về trang thông báo không có quyền
      router.push('/unauthorized')
      return
    }
  }, [user, isAuthenticated, isLoading, router])

  // Hiển thị loading khi đang kiểm tra
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    )
  }

  // Nếu chưa đăng nhập hoặc không có quyền, không hiển thị nội dung
  if (!isAuthenticated || !user || !user.roles?.includes('Administrator')) {
    return null
  }

  return <>{children}</>
}
