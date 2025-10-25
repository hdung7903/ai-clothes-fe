"use client"

import { Button } from "@/components/ui/button"
import { 
  ShoppingCart, 
  User, 
  Menu, 
  LogOut, 
  Package, 
  Palette, 
  Shield,
  UserCircle,
  ChevronDown
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/redux/hooks"
import { logoutUser } from "@/redux/authSlice"
import { fetchCartItems } from "@/redux/cartSlice"
import { useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function Header() {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth)
  const cartCount = useAppSelector((s) => s.cart.items.reduce((sum, it) => sum + it.quantity, 0))
  const dispatch = useAppDispatch()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Fetch cart items when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCartItems())
    }
  }, [isAuthenticated, dispatch])

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap()
      setIsMobileMenuOpen(false)
      setIsDropdownOpen(false)
      // Điều hướng sang trang login sau khi logout thành công
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center">
              <img 
                src="/branch.png" 
                alt="TEECRAFT Logo" 
                className="h-8 w-8 object-contain"
              />
            </div>
            <span className="text-xl font-bold">
              <span className="text-green-600">TEE</span>
              <span className="text-yellow-500">CRAFT</span>
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            href="/products" 
            className="text-foreground hover:text-green-600 dark:hover:text-green-400 transition-all font-medium relative group"
          >
            Sản Phẩm
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 dark:bg-green-400 transition-all group-hover:w-full"></span>
          </Link>
          <Link 
            href="/about" 
            className="text-foreground hover:text-green-600 dark:hover:text-green-400 transition-all font-medium relative group"
          >
            Về Chúng Tôi
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 dark:bg-green-400 transition-all group-hover:w-full"></span>
          </Link>
          <Link 
            href="/contact" 
            className="text-foreground hover:text-green-600 dark:hover:text-green-400 transition-all font-medium relative group"
          >
            Liên Hệ
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 dark:bg-green-400 transition-all group-hover:w-full"></span>
          </Link>
        </nav>

        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Desktop Cart */}
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="hidden md:flex relative hover:bg-green-50 dark:hover:bg-green-950 hover:text-green-600 transition-all">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-green-600 dark:bg-green-500 px-1 text-[10px] font-semibold text-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Desktop User Menu */}
          {isAuthenticated && user ? (
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild className="hidden md:flex">
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 hover:bg-green-50 dark:hover:bg-green-950 transition-colors border border-green-600 bg-green-50 dark:bg-green-950 dark:border-green-500"
                  style={{ 
                    borderColor: 'var(--color-green-700)', 
                    backgroundColor: 'color-mix(in srgb, var(--color-green-700) 10%, transparent)' 
                  }}
                  onPointerEnter={() => setIsDropdownOpen(true)}
                  onPointerLeave={(e) => {
                    // Chỉ đóng nếu không hover vào dropdown content
                    const rect = e.currentTarget.getBoundingClientRect()
                    if (e.clientY < rect.bottom) {
                      setIsDropdownOpen(false)
                    }
                  }}
                >
                  <UserCircle className="h-5 w-5 text-green-600" />
                  <span className="max-w-[12rem] truncate font-medium">{user.fullName || user.email}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-64 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800"
                onPointerEnter={() => setIsDropdownOpen(true)}
                onPointerLeave={() => setIsDropdownOpen(false)}
              >
                <DropdownMenuLabel className="font-semibold text-green-900 dark:text-green-100">
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-5 w-5" />
                    <div className="flex flex-col">
                      <span className="text-sm">{user.fullName || 'Người dùng'}</span>
                      <span className="text-xs font-normal text-green-600 dark:text-green-400 truncate max-w-[180px]">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-green-200 dark:bg-green-800" />
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-green-100 dark:hover:bg-green-900 focus:bg-green-100 dark:focus:bg-green-900">
                  <Link href="/account" className="flex items-center gap-3 py-2">
                    <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="font-medium">Tài Khoản</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-green-100 dark:hover:bg-green-900 focus:bg-green-100 dark:focus:bg-green-900">
                  <Link href="/account/orders" className="flex items-center gap-3 py-2">
                    <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="font-medium">Đơn Hàng Của Tôi</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-green-100 dark:hover:bg-green-900 focus:bg-green-100 dark:focus:bg-green-900">
                  <Link href="/account/designs" className="flex items-center gap-3 py-2">
                    <Palette className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="font-medium">Thiết Kế Của Tôi</span>
                  </Link>
                </DropdownMenuItem>
                {user.roles?.includes('Administrator') && (
                  <>
                    <DropdownMenuSeparator className="bg-green-200 dark:bg-green-800" />
                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-green-100 dark:hover:bg-green-900 focus:bg-green-100 dark:focus:bg-green-900">
                      <Link href="/admin/dashboard" className="flex items-center gap-3 py-2">
                        <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="font-medium">Quản Trị Viên</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator className="bg-green-200 dark:bg-green-800" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="cursor-pointer flex items-center gap-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 focus:bg-red-50 dark:focus:bg-red-950 focus:text-red-600 dark:focus:text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium">Đăng Xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/login">
              <Button variant="outline" className="hidden md:flex bg-transparent hover:bg-green-50 dark:hover:bg-green-950 hover:text-green-600 hover:border-green-300 transition-all">
                Đăng Nhập
              </Button>
            </Link>
          )}

          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-4 mt-6">
                {/* Mobile Navigation Links */}
                <nav className="flex flex-col space-y-2">
                  <Link 
                    href="/products" 
                    className="text-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors py-3 px-2 rounded-md hover:bg-green-50 dark:hover:bg-green-950 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sản Phẩm
                  </Link>
                  <Link 
                    href="/about" 
                    className="text-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors py-3 px-2 rounded-md hover:bg-green-50 dark:hover:bg-green-950 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Về Chúng Tôi
                  </Link>
                  <Link 
                    href="/contact" 
                    className="text-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors py-3 px-2 rounded-md hover:bg-green-50 dark:hover:bg-green-950 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Liên Hệ
                  </Link>
                </nav>

                <div className="border-t pt-4">
                  {/* Mobile Cart */}
                  <Link 
                    href="/cart" 
                    className="flex items-center gap-3 text-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors py-3 px-2 rounded-md hover:bg-green-50 dark:hover:bg-green-950 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>Giỏ Hàng</span>
                    {cartCount > 0 && (
                      <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-green-600 dark:bg-green-500 px-2 text-[10px] font-semibold text-white">
                        {cartCount}
                      </span>
                    )}
                  </Link>

                  {/* Mobile User Menu */}
                  {isAuthenticated && user ? (
                    <div className="space-y-2 mt-4">
                      <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                        <UserCircle className="h-5 w-5" />
                        <span>{user.fullName || user.email}</span>
                      </div>
                      <Link 
                        href="/account" 
                        className="flex items-center gap-3 text-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors py-2 px-2 rounded-md hover:bg-green-50 dark:hover:bg-green-950"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User className="h-5 w-5" />
                        <span>Tài Khoản</span>
                      </Link>
                      <Link 
                        href="/account/orders" 
                        className="flex items-center gap-3 text-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors py-2 px-2 rounded-md hover:bg-green-50 dark:hover:bg-green-950"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Package className="h-5 w-5" />
                        <span>Đơn Hàng</span>
                      </Link>
                      <Link 
                        href="/account/designs" 
                        className="flex items-center gap-3 text-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors py-2 px-2 rounded-md hover:bg-green-50 dark:hover:bg-green-950"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Palette className="h-5 w-5" />
                        <span>Thiết Kế Của Tôi</span>
                      </Link>
                      {user.roles?.includes('Administrator') && (
                        <Link 
                          href="/admin/dashboard" 
                          className="flex items-center gap-3 text-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors py-2 px-2 rounded-md hover:bg-green-50 dark:hover:bg-green-950"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Shield className="h-5 w-5" />
                          <span>Quản Trị</span>
                        </Link>
                      )}
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors py-2 px-2 rounded-md hover:bg-red-50 dark:hover:bg-red-950 w-full text-left mt-2"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Đăng Xuất</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 mt-4">
                      <Link 
                        href="/auth/login" 
                        className="block"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Button variant="outline" className="w-full hover:bg-green-50 dark:hover:bg-green-950 hover:text-green-600 hover:border-green-400 transition-all">
                          Đăng Nhập
                        </Button>
                      </Link>
                    </div>
                  )}

                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
