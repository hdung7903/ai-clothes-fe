"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Minus, Plus, Trash2, ShoppingBag, Loader2 } from "lucide-react"
import Link from "next/link"
import { useMemo, useEffect, useState, useCallback, useRef } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import type { RootState } from "@/redux"
import { fetchCartItems, deleteItemsAsync, clearError, updateItemQuantityAsync, updateItemQuantity } from "@/redux/cartSlice"
import { formatCurrency } from "../../../utils/format"
import { LoginRequiredPopover } from "@/components/ui/login-required-popover"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function CartPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { items: cartItems, loading, error } = useAppSelector((s: RootState) => s.cart)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch cart items on component mount
  useEffect(() => {
    dispatch(fetchCartItems())
  }, [dispatch])

  // Auto-select all items when cart loads
  useEffect(() => {
    if (cartItems.length > 0 && selectedItems.size === 0) {
      setSelectedItems(new Set(cartItems.map(item => item.id)))
    }
  }, [cartItems, selectedItems.size])

  // Preserve selected items when cart updates (to prevent estimate reset)
  useEffect(() => {
    if (cartItems.length > 0) {
      // Keep only the selected items that still exist in the cart
      const validSelectedItems = new Set(
        Array.from(selectedItems).filter(itemId => 
          cartItems.some(item => item.id === itemId)
        )
      )
      
      // If some selected items were removed, update the selection
      if (validSelectedItems.size !== selectedItems.size) {
        setSelectedItems(validSelectedItems)
      }
    }
  }, [cartItems])

  // Handle cart errors and show toast notifications
  useEffect(() => {
    if (error && error.includes('Unable to update quantity')) {
      toast.warning('Không thể cập nhật số lượng. Đã khôi phục số lượng gốc.')
      dispatch(clearError())
    } else if (error && error.includes('Failed to update item')) {
      toast.error('Không thể cập nhật giỏ hàng. Vui lòng thử lại.')
      dispatch(clearError())
    }
  }, [error, dispatch])

  // Clear error and timeout when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError())
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [dispatch])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(cartItems.map(item => item.id)))
    } else {
      setSelectedItems(new Set())
    }
  }

  const handleSelectItem = (itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedItems)
    if (checked) {
      newSelected.add(itemId)
    } else {
      newSelected.delete(itemId)
    }
    setSelectedItems(newSelected)
  }

  const isAllSelected = cartItems.length > 0 && selectedItems.size === cartItems.length

  const handleRemoveItem = (cartItemId: string) => {
    dispatch(deleteItemsAsync([cartItemId]))
    // Remove from selected items if it was selected
    const newSelected = new Set(selectedItems)
    newSelected.delete(cartItemId)
    setSelectedItems(newSelected)
  }

  const handleUpdateQuantity = useCallback((cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    
    // Find the item to get productVariantId and productDesignId
    const item = cartItems.find(item => item.id === cartItemId)
    if (!item) return
    
    // Validate stock limits before attempting update
    if (newQuantity > item.stock) {
      // Don't update if trying to exceed stock
      toast.error(`Chỉ còn ${item.stock} sản phẩm có sẵn!`)
      return
    }
    
    // Clear any pending timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }
    
    // Optimistic update for immediate UI feedback
    dispatch(updateItemQuantity({ cartItemId, quantity: newQuantity }))
    
    // Debounced server update to prevent rapid API calls
    updateTimeoutRef.current = setTimeout(() => {
      dispatch(updateItemQuantityAsync({ 
        cartItemId, 
        productVariantId: item.productVariantId,
        productDesignId: item.productDesignId ?? null,
        quantity: newQuantity,
        originalQuantity: item.quantity // Pass original quantity for recovery
      }))
    }, 500) // 500ms debounce
  }, [cartItems, dispatch])

  const subtotal = useMemo(() => {
    return cartItems
      .filter(item => selectedItems.has(item.id))
      .reduce((sum: number, item) => sum + item.price * item.quantity, 0)
  }, [cartItems, selectedItems])
  
  const total = subtotal

  const selectedItemsCount = selectedItems.size
  
  // Calculate total quantity of all items in cart
  const totalQuantity = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0)
  }, [cartItems])
  
  // Calculate total quantity of selected items
  const selectedQuantity = useMemo(() => {
    return cartItems
      .filter(item => selectedItems.has(item.id))
      .reduce((sum, item) => sum + item.quantity, 0)
  }, [cartItems, selectedItems])

  const handleCheckout = () => {
    if (selectedItems.size === 0) return
    
    // Convert selected item IDs to query params
    const selectedIds = Array.from(selectedItems).join(',')
    router.push(`/checkout?items=${selectedIds}`)
  } 

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Giỏ Hàng</h1>
            <p className="text-muted-foreground">
              {totalQuantity} sản phẩm trong giỏ hàng của bạn
              {cartItems.length > 1 && (
                <span className="text-xs text-muted-foreground/70 ml-1">
                  ({cartItems.length} loại sản phẩm)
                </span>
              )}
            </p>
          </div>

          {loading ? (
            <Card className="text-center py-12">
              <CardContent>
                <Loader2 className="h-16 w-16 mx-auto text-muted-foreground mb-4 animate-spin" />
                <h2 className="text-xl font-semibold mb-2">Đang tải giỏ hàng...</h2>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="text-center py-12">
              <CardContent>
                <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Lỗi tải giỏ hàng</h2>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => dispatch(fetchCartItems())}>
                  Thử lại
                </Button>
              </CardContent>
            </Card>
          ) : cartItems.length === 0 ? (
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
                {/* Select All Card */}
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="select-all"
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                      />
                      <label
                        htmlFor="select-all"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Chọn tất cả ({totalQuantity} sản phẩm)
                      </label>
                      {selectedItemsCount > 0 && selectedItemsCount < cartItems.length && (
                        <span className="text-xs text-muted-foreground ml-auto">
                          Đã chọn {selectedQuantity}/{totalQuantity}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {cartItems.map((item) => (
                  <Card key={item.id} className={selectedItems.has(item.id) ? 'border-green-500 border-2' : ''}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <Checkbox
                          id={`item-${item.id}`}
                          checked={selectedItems.has(item.id)}
                          onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                          className="mt-1"
                        />
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
                          <p className="text-xs text-muted-foreground mt-1">
                            Còn lại: {item.stock} sản phẩm
                          </p>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                disabled={loading || item.quantity <= 1}
                                onClick={()=>handleUpdateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-12 text-center font-medium">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                disabled={loading || item.quantity >= item.stock}
                                onClick={()=>handleUpdateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-xl font-bold text-primary">
                                {formatCurrency(item.price * item.quantity, 'VND', 'vi-VN')}
                              </span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleRemoveItem(item.id)}
                                disabled={loading}
                              >
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
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle>Tóm Tắt Đơn Hàng</CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                      {selectedItemsCount > 0 ? (
                        <span className="text-green-600 font-medium">
                          {selectedQuantity} sản phẩm đã chọn
                        </span>
                      ) : (
                        <span className="text-orange-600">
                          Chưa chọn sản phẩm nào
                        </span>
                      )}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Tạm tính ({selectedQuantity} sản phẩm)</span>
                      <span>{formatCurrency(subtotal, 'VND', 'vi-VN')}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Tổng cộng</span>
                      <span className="text-primary">{formatCurrency(total, 'VND', 'vi-VN')}</span>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      * Giá trên chưa bao gồm chi phí vận chuyển.
                    </p>
                    <LoginRequiredPopover action="tiến hành thanh toán">
                      <Button 
                        className="w-full" 
                        onClick={handleCheckout}
                        disabled={selectedItemsCount === 0}
                      >
                        {selectedItemsCount === 0 
                          ? 'Vui lòng chọn sản phẩm' 
                          : `Thanh toán (${selectedQuantity})`
                        }
                      </Button>
                    </LoginRequiredPopover>
                    {selectedItemsCount === 0 && (
                      <p className="text-xs text-orange-600 text-center">
                        Vui lòng chọn ít nhất một sản phẩm để thanh toán
                      </p>
                    )}
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
