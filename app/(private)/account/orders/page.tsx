"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getOrderById, getUserOrders } from "@/services/orderServices"
import type { GetOrderByIdResponse, GetOrdersResponse, OrderItemResponse } from "@/types/order"
import { formatCurrency } from "@/utils/format"
import { useAppSelector } from "@/redux/hooks"
import { useRouter } from "next/navigation"

export default function OrdersPage() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated)
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
        if (errorMessage.includes('AUTHENTICATION_REQUIRED')) {
          setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
          // Redirect to login after a short delay
          setTimeout(() => {
            router.push('/auth/login?next=/account/orders')
          }, 2000)
        } else {
          setError("Không thể tải danh sách đơn hàng.")
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
      else setOrderDetail(null)
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error"
      if (errorMessage.includes('AUTHENTICATION_REQUIRED')) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
        setTimeout(() => {
          router.push('/auth/login?next=/account/orders')
        }, 2000)
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

  const renderStatusBadge = (status: string) => {
    const s = status.toLowerCase()
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline"
    if (s.includes("pending") || s.includes("processing") || s.includes("chờ")) variant = "secondary"
    if (s.includes("completed") || s.includes("success") || s.includes("hoàn") || s.includes("giao")) variant = "default"
    if (s.includes("cancel") || s.includes("failed") || s.includes("hủy")) variant = "destructive"
    return <Badge variant={variant}>{status}</Badge>
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
                    <div key={o.orderId} className="rounded-lg border p-4 flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm text-muted-foreground">Mã đơn</span>
                          <span className="font-medium">{o.orderId}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">Ngày: {new Date(o.orderDate).toLocaleString()}</div>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStatusBadge(o.status)}
                          <div className="text-sm">Tổng: <span className="font-semibold text-primary">{formatCurrency(o.totalAmount, 'VND', 'vi-VN')}</span></div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => openDetail(o.orderId)}>Xem chi tiết</Button>
                        <Button onClick={() => openDetail(o.orderId)}>Mở dialog</Button>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between pt-2">
                    <Button variant="outline" disabled={!canPrev} onClick={() => setPageNumber((p) => Math.max(1, p - 1))}>Trang trước</Button>
                    <div className="text-sm text-muted-foreground">Trang {pageNumber}/{totalPages}</div>
                    <Button variant="outline" disabled={!canNext} onClick={() => setPageNumber((p) => p + 1)}>Trang tiếp</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="text-sm text-muted-foreground">Đang tải chi tiết...</div>
          ) : !orderDetail ? (
            <div className="text-sm text-destructive">Không thể tải chi tiết đơn hàng.</div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Mã đơn:</span> {orderDetail.orderId}</div>
                <div><span className="text-muted-foreground">Ngày:</span> {new Date(orderDetail.orderDate).toLocaleString()}</div>
                <div><span className="text-muted-foreground">Trạng thái:</span> {orderDetail.status}</div>
                <div><span className="text-muted-foreground">Thanh toán:</span> {orderDetail.paymentMethod}</div>
                <div><span className="text-muted-foreground">Người nhận:</span> {orderDetail.recipientName}</div>
                <div><span className="text-muted-foreground">SĐT:</span> {orderDetail.recipientPhone}</div>
                <div className="col-span-2"><span className="text-muted-foreground">Địa chỉ:</span> {orderDetail.recipientAddress}</div>
              </div>

              <div className="border rounded-md">
                <div className="px-3 py-2 border-b font-medium">Sản phẩm</div>
                <div className="divide-y">
                  {orderDetail.items.map((it: OrderItemResponse) => (
                    <div key={it.id} className="p-3 text-sm grid grid-cols-6 gap-2 items-center">
                      <div className="col-span-3">
                        <div className="font-medium">{it.name}</div>
                        <div className="text-muted-foreground">SKU: {it.variantSku}</div>
                      </div>
                      <div className="col-span-1">x{it.quantity}</div>
                      <div className="col-span-2 text-right font-medium">{formatCurrency(it.totalAmount, 'VND', 'vi-VN')}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-right space-y-1 text-sm">
                <div>Subtotal: {formatCurrency(orderDetail.subTotal, 'VND', 'vi-VN')}</div>
                <div>Giảm giá: {formatCurrency(orderDetail.discountAmount, 'VND', 'vi-VN')}</div>
                <div className="font-semibold">Tổng: {formatCurrency(orderDetail.totalAmount, 'VND', 'vi-VN')}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
