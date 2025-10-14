"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import type { RootState } from "@/redux"
import { updateQuantity as updateCartQty, removeItem as removeCartItem } from "@/redux/cartSlice"
import { formatCurrency } from "../../../utils/format"
import { LoginRequiredPopover } from "@/components/ui/login-required-popover"

export default function CartPage() {
  const dispatch = useAppDispatch()
  const cartItems = useAppSelector((s: RootState) => s.cart.items)

  const updateQuantity = (id: string, size: string | undefined, color: string | undefined, newQuantity: number) => {
    dispatch(updateCartQty({ id, size, color, quantity: newQuantity }))
  }

  const subtotal = useMemo(() => cartItems.reduce((sum: number, item) => sum + item.price * item.quantity, 0), [cartItems])
  const shipping = 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Giỏ Hàng</h1>
            <p className="text-muted-foreground">{cartItems.length} sản phẩm trong giỏ hàng của bạn</p>
          </div>

          {cartItems.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Giỏ hàng của bạn đang trống</h2>
                <p className="text-muted-foreground mb-4">Thêm một số sản phẩm để bắt đầu</p>
                <Link href="/products">
                  <Button>Tiếp tục mua sắm</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          <p className="text-muted-foreground text-sm">
                            Kích thước: {item.size} • Màu sắc: {item.color}
                          </p>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-12 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-xl font-bold text-primary">
                                {formatCurrency(item.price * item.quantity, 'VND', 'vi-VN')}
                              </span>
                              <Button variant="ghost" size="icon" onClick={() => dispatch(removeCartItem({ id: item.id, size: item.size, color: item.color }))}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Tóm Tắt Đơn Hàng</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Tạm tính</span>
                      <span>{formatCurrency(subtotal, 'VND', 'vi-VN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phí vận chuyển</span>
                      <span>{formatCurrency(shipping, 'VND', 'vi-VN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Thuế</span>
                      <span>{formatCurrency(tax, 'VND', 'vi-VN')}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Tổng cộng</span>
                      <span className="text-primary">{formatCurrency(total, 'VND', 'vi-VN')}</span>
                    </div>
                    <div className="space-y-2">
                      <Input placeholder="Mã giảm giá" />
                      <Button variant="outline" className="w-full bg-transparent">
                        Áp dụng mã
                      </Button>
                    </div>
                    <LoginRequiredPopover action="tiến hành thanh toán">
                      <Link href="/checkout">
                        <Button className="w-full">Tiến hành thanh toán</Button>
                      </Link>
                    </LoginRequiredPopover>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
