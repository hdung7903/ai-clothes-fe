"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { getOrderById, getUserOrders, userConfirmOrderReceived, userCancelPendingOrder } from "@/services/orderServices"
import { createFeedback } from "@/services/feedbackServices"
import type { GetOrderByIdResponse, GetOrdersResponse, OrderItemResponse } from "@/types/order"
import { formatCurrency } from "@/utils/format"
import { useAppSelector, useAppDispatch } from "@/redux/hooks"
import { useRouter } from "next/navigation"
import { addItemAsync } from "@/redux/cartSlice"
import { ShoppingCart, Package, Star, CheckCircle, X } from "lucide-react"
import { toast } from "sonner"

export default function OrdersPage() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated)
  const dispatch = useAppDispatch()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orders, setOrders] = useState<GetOrdersResponse["items"]>([])
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)

  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [orderDetail, setOrderDetail] = useState<GetOrderByIdResponse | null>(null)
  const [addingToCart, setAddingToCart] = useState<{ [key: string]: boolean }>({})
  
  // Feedback dialog states
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  const [rating, setRating] = useState(5)
  const [submittingFeedback, setSubmittingFeedback] = useState(false)
  const [confirmingOrder, setConfirmingOrder] = useState(false)
  const [cancellingOrder, setCancellingOrder] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await getUserOrders(pageNumber, pageSize)
        if (!res.success || !res.data) throw new Error("Failed to fetch orders")
        setOrders(res.data.items)
        setTotalPages(res.data.totalPages)
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Unknown error"
        if (errorMessage.includes('Authentication required') || errorMessage.includes('401')) {
          setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
          toast.error("Phiên đăng nhập hết hạn", {
            description: "Đang chuyển đến trang đăng nhập..."
          })
          setTimeout(() => {
            router.push('/auth/login?next=/account/orders')
          }, 2000)
        } else {
          setError("Không thể tải danh sách đơn hàng.")
          toast.error("Lỗi tải dữ liệu", {
            description: errorMessage
          })
        }
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [isAuthenticated, pageNumber, pageSize, router])

  useEffect(() => {
    if (!isAuthenticated) {
      try {
        router.push("/auth/login?next=/account/orders")
      } catch {}
    }
  }, [isAuthenticated, router])

  const openDetail = async (orderId: string) => {
    setSelectedOrderId(orderId)
    setDetailOpen(true)
    setDetailLoading(true)
    setOrderDetail(null)
    try {
      const res = await getOrderById(orderId)
      if (res.success && res.data) setOrderDetail(res.data)
      else {
        setOrderDetail(null)
        toast.error("Không thể tải chi tiết đơn hàng")
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error"
      if (errorMessage.includes('Authentication required') || errorMessage.includes('401')) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
        toast.error("Phiên đăng nhập hết hạn", {
          description: "Đang chuyển đến trang đăng nhập..."
        })
        setTimeout(() => {
          router.push('/auth/login?next=/account/orders')
        }, 2000)
      } else {
        toast.error("Lỗi", {
          description: errorMessage
        })
      }
      setOrderDetail(null)
    } finally {
      setDetailLoading(false)
    }
  }

  const openLatestDetail = async () => {
    if (!orders || orders.length === 0) return
    const latest = [...orders].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())[0]
    if (latest) await openDetail(latest.orderId)
  }

  const handleAddItemToCart = async (item: OrderItemResponse) => {
    try {
      setAddingToCart(prev => ({ ...prev, [item.id]: true }))
      
      await dispatch(addItemAsync({
        productVariantId: item.productVariantId,
        productDesignId: item.productDesignId || null,
        quantity: item.quantity
      })).unwrap()
      
      toast.success("Đã thêm vào giỏ hàng", {
        description: `${item.name} x${item.quantity}`
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Không thể thêm vào giỏ hàng"
      toast.error("Lỗi", {
        description: errorMessage
      })
    } finally {
      setAddingToCart(prev => ({ ...prev, [item.id]: false }))
    }
  }

  const handleReorderAll = async () => {
    if (!orderDetail) return
    
    try {
      setAddingToCart(prev => ({ ...prev, 'all': true }))
      
      let successCount = 0
      let failCount = 0
      
      for (const item of orderDetail.items) {
        try {
          await dispatch(addItemAsync({
            productVariantId: item.productVariantId,
            productDesignId: item.productDesignId || null,
            quantity: item.quantity
          })).unwrap()
          successCount++
        } catch (error) {
          failCount++
          console.error(`Failed to add item ${item.name}:`, error)
        }
      }
      
      if (successCount > 0) {
        toast.success("Đã thêm vào giỏ hàng", {
          description: `${successCount} sản phẩm đã được thêm${failCount > 0 ? ` (${failCount} lỗi)` : ''}`
        })
      }
      
      if (failCount > 0 && successCount === 0) {
        toast.error("Không thể thêm vào giỏ hàng", {
          description: "Vui lòng thử lại sau"
        })
      }
    } finally {
      setAddingToCart(prev => ({ ...prev, 'all': false }))
    }
  }

  const renderStatusBadge = (status: string) => {
    const s = status.toLowerCase()
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline"
    if (s.includes("pending") || s.includes("processing") || s.includes("chờ")) variant = "secondary"
    if (s.includes("shipped")) variant = "default"
    if (s.includes("completed") || s.includes("success") || s.includes("hoàn") || s.includes("confirm_received")) variant = "default"
    if (s.includes("cancel") || s.includes("failed") || s.includes("hủy")) variant = "destructive"
    return <Badge variant={variant}>{status}</Badge>
  }

  // Handle confirm order received (SHIPPED -> CONFIRM_RECEIVED)
  const handleConfirmOrder = async (orderId: string) => {
    setConfirmingOrder(true)
    try {
      const response = await userConfirmOrderReceived(orderId)
      
      if (response.success) {
        toast.success("Đã xác nhận nhận hàng thành công!")
        // Reload orders list
        const res = await getUserOrders(pageNumber, pageSize)
        if (res.success && res.data) {
          setOrders(res.data.items)
        }
        // Reload detail if open
        if (selectedOrderId === orderId && detailOpen) {
          const detailRes = await getOrderById(orderId)
          if (detailRes.success && detailRes.data) {
            setOrderDetail(detailRes.data)
          }
        }
      } else {
        const errorMsg = response.errors 
          ? Object.values(response.errors).flat().join(", ")
          : "Không thể xác nhận đơn hàng"
        toast.error(errorMsg)
      }
    } catch (error) {
      console.error("Error confirming order:", error)
      toast.error("Có lỗi xảy ra khi xác nhận đơn hàng")
    } finally {
      setConfirmingOrder(false)
    }
  }

  // Handle cancel order (PENDING -> CANCELED) using action: 0
  const handleCancelOrder = async (orderId: string) => {
    setCancellingOrder(true)
    try {
      const response = await userCancelPendingOrder(orderId)
      if (response.success) {
        toast.success("Đã hủy đơn hàng thành công!")
        // Reload orders list
        const res = await getUserOrders(pageNumber, pageSize)
        if (res.success && res.data) {
          setOrders(res.data.items)
        }
        // Reload detail if open
        if (selectedOrderId === orderId && detailOpen) {
          const detailRes = await getOrderById(orderId)
          if (detailRes.success && detailRes.data) {
            setOrderDetail(detailRes.data)
          }
        }
      } else {
        const errorMsg = response.errors 
          ? Object.values(response.errors).flat().join(", ")
          : "Không thể hủy đơn hàng"
        toast.error(errorMsg)
      }
    } catch (error) {
      console.error("Error canceling order:", error)
      toast.error("Có lỗi xảy ra khi hủy đơn hàng")
    } finally {
      setCancellingOrder(false)
    }
  }

  // Open feedback dialog
  const openFeedbackDialog = (orderId: string) => {
    setSelectedOrderId(orderId)
    setFeedbackText("")
    setRating(5)
    setFeedbackDialogOpen(true)
  }

  // Submit feedback
  const handleSubmitFeedback = async () => {
    if (!selectedOrderId || !feedbackText.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá")
      return
    }

    setSubmittingFeedback(true)
    try {
      console.log('📝 Submitting feedback:', {
        orderId: selectedOrderId,
        rating,
        feedbackLength: feedbackText.trim().length
      })

      const response = await createFeedback({
        orderId: selectedOrderId,
        feedback: feedbackText.trim(),
        rating: rating
      })

      console.log('📝 Feedback response:', response)

      if (response.success) {
        toast.success("Cảm ơn bạn đã đánh giá!")
        setFeedbackDialogOpen(false)
        setFeedbackText("")
        setRating(5)
        // Reload orders list
        const res = await getUserOrders(pageNumber, pageSize)
        if (res.success && res.data) {
          setOrders(res.data.items)
        }
        // Reload detail if open
        if (detailOpen && selectedOrderId) {
          const detailRes = await getOrderById(selectedOrderId)
          if (detailRes.success && detailRes.data) {
            setOrderDetail(detailRes.data)
          }
        }
      } else {
        // Check for authentication error specifically
        if (response.errors?.auth) {
          console.error('❌ Authentication error:', response.errors.auth)
          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
          // Optionally redirect to login
          // router.push('/auth/login')
        } else {
          const errorMsg = response.errors 
            ? Object.values(response.errors).flat().join(", ")
            : "Không thể gửi đánh giá"
          toast.error(errorMsg)
        }
      }
    } catch (error) {
      console.error("❌ Error submitting feedback:", error)
      toast.error("Có lỗi xảy ra khi gửi đánh giá")
    } finally {
      setSubmittingFeedback(false)
    }
  }

  const canPrev = useMemo(() => pageNumber > 1, [pageNumber])
  const canNext = useMemo(() => pageNumber < totalPages, [pageNumber, totalPages])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <Link href="/account" className="text-primary hover:underline mb-4 inline-block">
              ← Quay lại tài khoản
            </Link>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Đơn hàng của tôi</h1>
                <p className="text-muted-foreground">Xem lịch sử đặt hàng và chi tiết.</p>
              </div>
              <div className="shrink-0">
                <Button variant="outline" onClick={openLatestDetail} disabled={orders.length === 0 || isLoading}>
                  Xem đơn gần nhất
                </Button>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lịch sử đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
              {!isAuthenticated ? (
                <div className="text-sm text-muted-foreground">Vui lòng đăng nhập để xem đơn hàng của bạn.</div>
              ) : isLoading ? (
                <div className="space-y-4">
                  {[1,2,3].map((i) => (
                    <div key={i} className="rounded-lg border p-4 animate-pulse">
                      <div className="h-4 w-32 bg-muted rounded mb-2" />
                      <div className="h-3 w-48 bg-muted rounded mb-1" />
                      <div className="h-3 w-40 bg-muted rounded mb-1" />
                      <div className="h-3 w-24 bg-muted rounded" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-sm text-destructive">{error}</div>
              ) : orders.length === 0 ? (
                <div className="text-sm text-muted-foreground">Bạn chưa có đơn hàng nào.</div>
              ) : (
                <div className="space-y-4">
                  {orders.map((o) => (
                    <div key={o.orderId} className="rounded-lg border p-4 hover:border-primary/50 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-sm text-muted-foreground">Mã đơn:</span>
                            <span className="font-medium">{o.orderId}</span>
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            Ngày: {new Date(o.orderDate).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            {renderStatusBadge(o.status)}
                            <div className="text-sm">
                              <span className="text-muted-foreground">Tổng:</span>{' '}
                              <span className="font-semibold text-primary text-base">
                                {formatCurrency(o.totalAmount, 'VND', 'vi-VN')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => openDetail(o.orderId)}
                            className="gap-2"
                          >
                            <Package className="h-4 w-4" />
                            Chi tiết
                          </Button>
                          
                          {/* Show "Hủy đơn" when status is PENDING */}
                          {o.status === "PENDING" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleCancelOrder(o.orderId)}
                              disabled={cancellingOrder}
                              className="gap-2"
                            >
                              <X className="h-4 w-4" />
                              Hủy đơn
                            </Button>
                          )}

                          {/* Show "Xác nhận đã nhận" button when status is SHIPPED */}
                          {o.status === "SHIPPED" && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleConfirmOrder(o.orderId)}
                              disabled={confirmingOrder}
                              className="gap-2"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Xác nhận đã nhận
                            </Button>
                          )}
                          
                          {/* Show "Đánh giá" button when status is CONFIRM_RECEIVED and hasn't been reviewed */}
                          {o.status === "CONFIRM_RECEIVED" && !o.isFeedback && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => openFeedbackDialog(o.orderId)}
                              className="gap-2"
                            >
                              <Star className="h-4 w-4" />
                              Đánh giá
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between pt-2">
                    <Button variant="outline" disabled={!canPrev} onClick={() => setPageNumber((p) => Math.max(1, p - 1))}>
                      ← Trang trước
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      Trang {pageNumber} / {totalPages}
                    </div>
                    <Button variant="outline" disabled={!canNext} onClick={() => setPageNumber((p) => p + 1)}>
                      Trang tiếp →
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Chi tiết đơn hàng
            </DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="text-sm text-muted-foreground">Đang tải chi tiết...</div>
          ) : !orderDetail ? (
            <div className="text-sm text-destructive">Không thể tải chi tiết đơn hàng.</div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Mã đơn:</span> {orderDetail.orderId}</div>
                <div><span className="text-muted-foreground">Ngày:</span> {new Date(orderDetail.orderDate).toLocaleString()}</div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Trạng thái:</span> {renderStatusBadge(orderDetail.status)}
                </div>
                <div><span className="text-muted-foreground">Thanh toán:</span> {orderDetail.paymentMethod}</div>
                <div><span className="text-muted-foreground">Người nhận:</span> {orderDetail.recipientName}</div>
                <div><span className="text-muted-foreground">SĐT:</span> {orderDetail.recipientPhone}</div>
                <div className="col-span-2"><span className="text-muted-foreground">Địa chỉ:</span> {orderDetail.recipientAddress}</div>
              </div>

              <div className="border rounded-md">
                <div className="px-3 py-2 border-b font-medium flex items-center justify-between">
                  <span>Sản phẩm</span>
                  <Button 
                    size="sm" 
                    onClick={handleReorderAll}
                    disabled={addingToCart['all']}
                    className="gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {addingToCart['all'] ? 'Đang thêm...' : 'Mua lại tất cả'}
                  </Button>
                </div>
                <div className="divide-y">
                  {orderDetail.items.map((it: OrderItemResponse) => (
                    <div key={it.id} className="p-3 text-sm grid grid-cols-6 gap-2 items-center">
                      <div className="col-span-3">
                        <div className="font-medium">{it.name}</div>
                        <div className="text-muted-foreground text-xs">SKU: {it.variantSku}</div>
                        {it.productDesignId && (
                          <Badge variant="secondary" className="mt-1 text-xs">Thiết kế riêng</Badge>
                        )}
                      </div>
                      <div className="col-span-1 text-center">x{it.quantity}</div>
                      <div className="col-span-1 text-right font-medium">{formatCurrency(it.totalAmount, 'VND', 'vi-VN')}</div>
                      <div className="col-span-1 flex justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddItemToCart(it)}
                          disabled={addingToCart[it.id]}
                          className="gap-1"
                        >
                          <ShoppingCart className="h-3 w-3" />
                          {addingToCart[it.id] ? '...' : 'Thêm'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-right space-y-1 text-sm bg-muted/30 p-3 rounded-md">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tạm tính:</span>
                  <span>{formatCurrency(orderDetail.subTotal, 'VND', 'vi-VN')}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá:</span>
                  <span>-{formatCurrency(orderDetail.discountAmount, 'VND', 'vi-VN')}</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-2 border-t">
                  <span>Tổng cộng:</span>
                  <span className="text-primary">{formatCurrency(orderDetail.totalAmount, 'VND', 'vi-VN')}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Đánh giá đơn hàng
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Star Rating */}
            <div className="space-y-2">
              <Label>Mức độ hài lòng</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= rating
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {rating === 5 && "Tuyệt vời! 😍"}
                {rating === 4 && "Rất tốt! 😊"}
                {rating === 3 && "Tốt! 🙂"}
                {rating === 2 && "Bình thường 😐"}
                {rating === 1 && "Cần cải thiện 😞"}
              </p>
            </div>

            {/* Feedback Text */}
            <div className="space-y-2">
              <Label htmlFor="feedback-text">Nhận xét của bạn</Label>
              <Textarea
                id="feedback-text"
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm và dịch vụ..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setFeedbackDialogOpen(false)}
              disabled={submittingFeedback}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmitFeedback}
              disabled={submittingFeedback || !feedbackText.trim()}
            >
              {submittingFeedback ? "Đang gửi..." : "Gửi đánh giá"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
