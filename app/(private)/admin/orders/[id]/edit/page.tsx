"use client"

import { AdminSidebar } from "@/components/admin/admin-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import * as React from "react"
import { adminGetOrderById, adminUpdateOrderStatus, adminUpdatePaymentStatus } from "@/services/orderServices"
import type { GetOrderByIdResponse, AdminUpdateOrderStatusRequest, AdminUpdatePaymentStatusRequest } from "@/types/order"
import { formatDate, formatVND, formatEnumString } from "@/utils/format"
import { useAppSelector } from "@/redux/hooks"
import { useRouter } from "next/navigation"
import Link from "next/link"

// Server status mapping
const STATUS_STRING_TO_CODE: Record<string, number> = {
  PENDING: 0,
  REJECTED: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  DELIVERED: 4,
  CONFIRM_RECEIVED: 5,
  CANCELLED: 6,
}

const STATUS_CODE_TO_LABEL: Record<number, string> = {
  0: 'Chờ xử lý',
  1: 'Từ chối',
  2: 'Đang xử lý',
  3: 'Đã gửi hàng',
  4: 'Đã giao hàng',
  5: 'Xác nhận đã nhận',
  6: 'Đã hủy',
}

function normalizeStatusKey(input: string): string {
  return input
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_')
}

function getStatusCodeFromString(status: string): number {
  const key = normalizeStatusKey(status)
  if (key in STATUS_STRING_TO_CODE) return STATUS_STRING_TO_CODE[key]
  // fallback common aliases from legacy values
  if (key === 'CONFIRMED') return STATUS_STRING_TO_CODE.PROCESSING
  return STATUS_STRING_TO_CODE.PENDING
}

function getStatusLabelFromCode(code: number | null): string {
  if (code === null || code === undefined) return ''
  return STATUS_CODE_TO_LABEL[code] ?? String(code)
}

// Payment status mapping
const PAYMENT_STRING_TO_CODE: Record<string, number> = {
  ONLINE_PAYMENT_AWAITING: 0,
  ONLINE_PAYMENT_PAID: 1,
  COD: 2,
  REFUNDING: 3,
  REFUNDED: 4,
}

const PAYMENT_CODE_TO_LABEL: Record<number, string> = {
  0: 'Chờ thanh toán (online)',
  1: 'Đã thanh toán (online)',
  2: 'Thanh toán khi nhận hàng (COD)',
  3: 'Đang hoàn tiền',
  4: 'Đã hoàn tiền',
}

function getPaymentStatusCodeFromString(status: string): number {
  const key = normalizeStatusKey(status)
  if (key in PAYMENT_STRING_TO_CODE) return PAYMENT_STRING_TO_CODE[key]
  // legacy aliases
  if (key === 'ONLINE_PAYMENT_COMPLETED') return PAYMENT_STRING_TO_CODE.ONLINE_PAYMENT_PAID
  if (key === 'CASH_ON_DELIVERY') return PAYMENT_STRING_TO_CODE.COD
  return PAYMENT_STRING_TO_CODE.ONLINE_PAYMENT_AWAITING
}

function getPaymentStatusLabelFromCode(code: number | null): string {
  if (code === null || code === undefined) return ''
  return PAYMENT_CODE_TO_LABEL[code] ?? String(code)
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function Page({ params }: PageProps) {
  const router = useRouter()
  const { isAuthenticated, user, tokens, isLoading } = useAppSelector((state) => state.auth)
  
  const [order, setOrder] = React.useState<GetOrderByIdResponse | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  // Form states
  const [orderStatus, setOrderStatus] = React.useState<number | null>(null)
  const [paymentStatus, setPaymentStatus] = React.useState<number | null>(null)
  const [note, setNote] = React.useState<string>("")

  // Unwrap params using React.use()
  const { id: orderId } = React.use(params)

  // Check authentication and redirect if needed
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?next=/admin/orders')
      return
    }
    
    if (!isLoading && user && !user.roles?.includes('Administrator')) {
      router.push('/unauthorized')
      return
    }
  }, [isAuthenticated, user, isLoading, router])

  // Fetch order details
  React.useEffect(() => {
    const fetchOrder = async () => {
      if (!isAuthenticated || !tokens?.accessToken) return
      
      try {
        setLoading(true)
        setError(null)
        
        const response = await adminGetOrderById(orderId)
        
        if (response.success && response.data) {
          setOrder(response.data)
          setOrderStatus(getStatusCodeFromString(response.data.status))
          setPaymentStatus(getPaymentStatusCodeFromString(response.data.paymentStatus))
        } else {
          setError('Không thể tải thông tin đơn hàng')
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && tokens?.accessToken) {
      fetchOrder()
    }
  }, [orderId, isAuthenticated, tokens])

  const handleUpdateOrderStatus = async () => {
    if (!order || !tokens?.accessToken) return

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const payload: AdminUpdateOrderStatusRequest = {
        status: (orderStatus ?? getStatusCodeFromString(order.status)),
      }

      const response = await adminUpdateOrderStatus(order.orderId, payload)
      
      if (response.success) {
        setSuccess('Cập nhật trạng thái đơn hàng thành công!')
        // Refresh order data
        const updatedResponse = await adminGetOrderById(orderId)
        if (updatedResponse.success && updatedResponse.data) {
          setOrder(updatedResponse.data)
        }
      } else {
        setError('Cập nhật trạng thái đơn hàng thất bại')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra'
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdatePaymentStatus = async () => {
    if (!order || !tokens?.accessToken) return

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const payload: AdminUpdatePaymentStatusRequest = {
        paymentStatus: (paymentStatus ?? getPaymentStatusCodeFromString(order.paymentStatus)),
      }

      const response = await adminUpdatePaymentStatus(order.orderId, payload)
      
      if (response.success) {
        setSuccess('Cập nhật trạng thái thanh toán thành công!')
        // Refresh order data
        const updatedResponse = await adminGetOrderById(orderId)
        if (updatedResponse.success && updatedResponse.data) {
          setOrder(updatedResponse.data)
        }
      } else {
        setError('Cập nhật trạng thái thanh toán thất bại')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra'
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800'
      case 'Shipped':
        return 'bg-blue-100 text-blue-800'
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'Cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800'
      case 'Failed':
        return 'bg-red-100 text-red-800'
      case 'Refunded':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-64">
            <Spinner className="h-8 w-8" />
            <span className="ml-2">Đang tải thông tin đơn hàng...</span>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (error && !order) {
    return (
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-destructive mb-4">Lỗi: {error}</p>
              <Button onClick={() => router.back()} variant="outline">
                Quay lại
              </Button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!order) {
    return (
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Không tìm thấy đơn hàng</p>
              <Button onClick={() => router.back()} variant="outline">
                Quay lại
              </Button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin/dashboard">Quản trị</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin/orders">Đơn hàng</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href={`/admin/orders/${order.orderId}`}>Chi tiết</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Chỉnh sửa</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Chỉnh sửa đơn hàng</h1>
              <p className="text-muted-foreground">Mã đơn hàng: {order.orderId}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/admin/orders/${order.orderId}`}>Xem chi tiết</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/orders">Quay lại</Link>
              </Button>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
              {success}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Order Status Update */}
            <Card>
              <CardHeader>
                <CardTitle>Cập nhật trạng thái đơn hàng</CardTitle>
                <CardDescription>
                  Thay đổi trạng thái xử lý của đơn hàng
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="order-status">Trạng thái hiện tại</Label>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-order-status">Trạng thái mới</Label>
                  <Select value={orderStatus !== null ? String(orderStatus) : undefined} onValueChange={(v) => setOrderStatus(Number(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái mới" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Chờ xử lý</SelectItem>
                      <SelectItem value="1">Từ chối</SelectItem>
                      <SelectItem value="2">Đang xử lý</SelectItem>
                      <SelectItem value="3">Đã gửi hàng</SelectItem>
                      <SelectItem value="4">Đã giao hàng</SelectItem>
                      <SelectItem value="5">Xác nhận đã nhận</SelectItem>
                      <SelectItem value="6">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

            

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      className="w-full" 
                      disabled={
                        saving ||
                        (orderStatus === null ? true : orderStatus === getStatusCodeFromString(order.status))
                      }
                    >
                      {saving ? <Spinner className="h-4 w-4 mr-2" /> : null}
                      Cập nhật trạng thái đơn hàng
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xác nhận cập nhật</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn có chắc chắn muốn thay đổi trạng thái đơn hàng từ "{order.status}" thành "{getStatusLabelFromCode(orderStatus)}"?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction onClick={handleUpdateOrderStatus}>
                        Xác nhận
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>

            {/* Payment Status Update */}
            <Card>
              <CardHeader>
                <CardTitle>Cập nhật trạng thái thanh toán</CardTitle>
                <CardDescription>
                  Thay đổi trạng thái thanh toán của đơn hàng
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="payment-status">Trạng thái thanh toán hiện tại</Label>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {formatEnumString(order.paymentStatus)}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-payment-status">Trạng thái thanh toán mới</Label>
                  <Select value={paymentStatus !== null ? String(paymentStatus) : undefined} onValueChange={(v) => setPaymentStatus(Number(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái thanh toán mới" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Chờ thanh toán (online)</SelectItem>
                      <SelectItem value="1">Đã thanh toán (online)</SelectItem>
                      <SelectItem value="2">Thanh toán khi nhận hàng (COD)</SelectItem>
                      <SelectItem value="3">Đang hoàn tiền</SelectItem>
                      <SelectItem value="4">Đã hoàn tiền</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      className="w-full" 
                      disabled={
                        saving ||
                        (paymentStatus === null ? true : paymentStatus === getPaymentStatusCodeFromString(order.paymentStatus))
                      }
                    >
                      {saving ? <Spinner className="h-4 w-4 mr-2" /> : null}
                      Cập nhật trạng thái thanh toán
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xác nhận cập nhật</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn có chắc chắn muốn thay đổi trạng thái thanh toán từ "{formatEnumString(order.paymentStatus)}" thành "{getPaymentStatusLabelFromCode(paymentStatus)}"?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction onClick={handleUpdatePaymentStatus}>
                        Xác nhận
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Tóm tắt đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Mã đơn hàng</p>
                  <p className="font-mono">{order.orderId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ngày đặt</p>
                  <p>{formatDate(order.orderDate, "ddmmyyyy")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Khách hàng</p>
                  <p>{order.recipientName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tổng tiền</p>
                  <p className="font-bold">{formatVND(order.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tạm tính</p>
                  <p>{formatVND(order.subTotal)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Giảm giá</p>
                  <p className="text-green-600">-{formatVND(order.discountAmount)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phương thức thanh toán</p>
                  <p>{formatEnumString(order.paymentMethod)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Người tạo</p>
                  <p>{order.createdBy?.name || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}