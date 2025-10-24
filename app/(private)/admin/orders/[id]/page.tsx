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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import * as React from "react"
import { adminGetOrderById } from "@/services/orderServices"
import type { GetOrderByIdResponse } from "@/types/order"
import { formatDate, formatVND, formatEnumString } from "@/utils/format"
import { useAppSelector } from "@/redux/hooks"
import { useRouter } from "next/navigation"
import Link from "next/link"

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
  const [error, setError] = React.useState<string | null>(null)

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

  if (error) {
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
                <BreadcrumbItem>
                  <BreadcrumbPage>Chi tiết đơn hàng</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Chi tiết đơn hàng</h1>
              <p className="text-muted-foreground">Mã đơn hàng: {order.orderId}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/admin/orders">Quay lại</Link>
              </Button>
              <Button asChild>
                <Link href={`/admin/orders/${order.orderId}/edit`}>Chỉnh sửa</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Order Information */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ngày đặt</p>
                    <p>{formatDate(order.orderDate, "ddmmyyyy")}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Trạng thái</p>
                    <Badge className={getStatusColor(order.status)}>
                      {formatEnumString(order.status)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Thanh toán</p>
                    <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                      {formatEnumString(order.paymentStatus)}
                    </Badge>
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
                <Separator />
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tạm tính</p>
                    <p className="font-semibold">{formatVND(order.subTotal)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Giảm giá</p>
                    <p className="font-semibold text-green-600">-{formatVND(order.discountAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tổng tiền</p>
                    <p className="text-xl font-bold">{formatVND(order.totalAmount)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin khách hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tên người nhận</p>
                    <p>{order.recipientName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Số điện thoại</p>
                    <p>{order.recipientPhone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Địa chỉ giao hàng</p>
                    <p>{order.recipientAddress}</p>
                  </div>
                </div>
                {(order.userFeedback || order.rating) && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      {order.userFeedback && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Phản hồi khách hàng</p>
                          <p className="text-sm">{order.userFeedback}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Chi tiết sản phẩm</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Giá gốc</TableHead>
                    <TableHead>Giảm giá</TableHead>
                    <TableHead>Giá sau giảm</TableHead>
                    <TableHead className="text-right">Thành tiền</TableHead>
                    <TableHead className="text-center">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items?.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-md"
                            />
                          )}
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              SKU: {item.variantSku}
                            </p>
                            {item.voucherCode && (
                              <p className="text-sm text-green-600">
                                Voucher: {item.voucherCode}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{item.quantity}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{formatVND(item.unitPrice)}</span>
                      </TableCell>
                      <TableCell>
                        {item.discountAmount > 0 ? (
                          <div className="space-y-1">
                            <p className="text-sm text-green-600 font-medium">
                              -{formatVND(item.discountAmount)}
                            </p>
                            {item.voucherDiscountAmount > 0 && (
                              <p className="text-xs text-muted-foreground">
                                Voucher: -{formatVND(item.voucherDiscountAmount)}
                              </p>
                            )}
                            {item.voucherDiscountPercent > 0 && (
                              <p className="text-xs text-muted-foreground">
                                ({item.voucherDiscountPercent}%)
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Không giảm</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {formatVND(item.unitPrice - (item.discountAmount / item.quantity))}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="space-y-1">
                          <p className="font-medium">{formatVND(item.totalAmount)}</p>
                          {item.discountAmount > 0 && (
                            <p className="text-sm text-green-600">
                              Tiết kiệm: {formatVND(item.discountAmount)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.productDesignId && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/orders/${order.orderId}/design/${item.productDesignId}`}>
                              Xem thiết kế
                            </Link>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}