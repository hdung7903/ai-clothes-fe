'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux'

/**
 * GuestLayout - Chuyển hướng người dùng đã đăng nhập về trang chủ
 * Các trang auth (login, register, ...) chỉ dành cho khách
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, isBootstrapping } = useSelector((state: RootState) => state.auth)
  const hasRedirected = useRef(false)

  useEffect(() => {
    // Chờ bootstrap hoàn tất
    if (isBootstrapping) {
      return
    }

    // Nếu đã redirect rồi thì không redirect nữa
    if (hasRedirected.current) {
      return
    }

    // Nếu đã đăng nhập, chuyển về trang chủ (trừ verify page)
    if (isAuthenticated && user && !pathname?.includes('/verify')) {
      hasRedirected.current = true
      if (Array.isArray(user.roles) && user.roles.includes('Administrator')) {
        router.push('/admin/dashboard')
      } else {
        router.push('/')
      }
    }
  }, [isAuthenticated, user, isBootstrapping, router, pathname])

  return <>{children}</>
}
