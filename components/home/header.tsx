"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart, User, Menu, LogOut, Settings, X, Shield } from "lucide-react"
import Link from "next/link"
import { useAppSelector, useAppDispatch } from "@/redux/hooks"
import { logoutUser } from "@/redux/authSlice"
import { fetchCartItems } from "@/redux/cartSlice"
import { useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
          <Link href="/products" className="text-foreground hover:text-primary transition-colors">
            Sản Phẩm
          </Link>
          <Link href="/about" className="text-foreground hover:text-primary transition-colors">
            Về Chúng Tôi
          </Link>
          <Link href="/contact" className="text-foreground hover:text-primary transition-colors">
            Liên Hệ
          </Link>
        </nav>

        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Desktop Cart */}
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="hidden md:flex relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Desktop User Menu */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="hidden md:flex">
                <Button variant="ghost" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="max-w-[12rem] truncate">{user.fullName || user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/account" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Tài Khoản</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/orders" className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    <span>Đơn Hàng</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/designs" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>Thiết Kế Của Tôi</span>
                  </Link>
                </DropdownMenuItem>
                {user.roles?.includes('Administrator') && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/dashboard" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>Quản Trị</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-600 focus:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Đăng Xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/login">
              <Button variant="outline" className="hidden md:flex bg-transparent">
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
                <nav className="flex flex-col space-y-4">
                  <Link 
                    href="/products" 
                    className="text-foreground hover:text-primary transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sản Phẩm
                  </Link>
                  <Link 
                    href="/about" 
                    className="text-foreground hover:text-primary transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Về Chúng Tôi
                  </Link>
                  <Link 
                    href="/contact" 
                    className="text-foreground hover:text-primary transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Liên Hệ
                  </Link>
                </nav>

                <div className="border-t pt-4">
                  {/* Mobile Cart */}
                  <Link 
                    href="/cart" 
                    className="flex items-center gap-2 text-foreground hover:text-primary transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>Giỏ Hàng</span>
                    {cartCount > 0 && (
                      <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                        {cartCount}
                      </span>
                    )}
                  </Link>

                  {/* Mobile User Menu */}
                  {isAuthenticated && user ? (
                    <div className="space-y-2 mt-4">
                      <div className="text-sm text-muted-foreground mb-2">
                        Xin chào, {user.fullName || user.email}
                      </div>
                      <Link 
                        href="/account" 
                        className="flex items-center gap-2 text-foreground hover:text-primary transition-colors py-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>Tài Khoản</span>
                      </Link>
                      <Link 
                        href="/account/orders" 
                        className="flex items-center gap-2 text-foreground hover:text-primary transition-colors py-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Đơn Hàng</span>
                      </Link>
                      <Link 
                        href="/account/designs" 
                        className="flex items-center gap-2 text-foreground hover:text-primary transition-colors py-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Thiết Kế Của Tôi</span>
                      </Link>
                      {user.roles?.includes('Administrator') && (
                        <Link 
                          href="/admin/dashboard" 
                          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors py-2"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Shield className="h-4 w-4" />
                          <span>Quản Trị</span>
                        </Link>
                      )}
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors py-2 w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
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
                        <Button variant="outline" className="w-full">
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
