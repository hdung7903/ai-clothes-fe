"use client"
import Link from "next/link"
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Spinner } from "@/components/ui/spinner"
import { Empty } from "@/components/ui/empty"
import * as React from "react"
import { adminGetAllOrders } from "@/services/orderServices"
import type { AdminGetOrdersResponse, AdminOrderResponseItem } from "@/types/order"
import { formatCurrency, formatEnumString, formatDate, formatVND } from "@/utils/format"
import { useAppSelector } from "@/redux/hooks"
import { useRouter } from "next/navigation"

export default function Page() {
  const router = useRouter()
  const { isAuthenticated, user, tokens, isLoading } = useAppSelector((state) => state.auth)
  
  const [query, setQuery] = React.useState("")
  const [pageSize, setPageSize] = React.useState(10)
  const [page, setPage] = React.useState(1)
  const [statusFilter, setStatusFilter] = React.useState<string | undefined>(undefined)
  const [paymentStatusFilter, setPaymentStatusFilter] = React.useState<string | undefined>(undefined)
  
  const [orders, setOrders] = React.useState<AdminOrderResponseItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalCount, setTotalCount] = React.useState(0)
  const [authChecked, setAuthChecked] = React.useState(false)
  const [loadingStep, setLoadingStep] = React.useState<string>("")
  const [redirectAttempted, setRedirectAttempted] = React.useState(false)

  // Check authentication and redirect if needed
  React.useEffect(() => {
    console.log('🔍 Auth check effect running:', { 
      isAuthenticated, 
      hasUser: !!user, 
      hasTokens: !!tokens, 
      isLoading,
      userRoles: user?.roles,
      userRolesDetail: user?.roles?.map(role => `"${role}"`),
      authChecked 
    })

    // Add a longer delay to ensure Redux state is fully hydrated and avoid race conditions
    const timer = setTimeout(() => {
      console.log('⏰ Timer fired, checking auth after delay')
      
      // Don't redirect if still loading
      if (isLoading) {
        console.log('⏳ Still loading, waiting...')
        return
      }

      // If we've already checked and user is authenticated, don't check again
      if (authChecked && isAuthenticated) {
        console.log('✅ Already checked and authenticated, skipping')
        return
      }

      // Additional check: if we have tokens but no user yet, wait a bit more
      if (tokens?.accessToken && !user && !isLoading) {
        console.log('⏳ Have tokens but no user yet, waiting for profile fetch...')
        return
      }

      // Check authentication
      if (!isAuthenticated) {
        console.log('❌ User not authenticated, redirecting to login')
        if (!redirectAttempted) {
          setRedirectAttempted(true)
          router.push('/auth/login?next=/admin/orders')
        }
        return
      }
      
      // Check if user has admin role
      if (user && !user.roles?.includes('Administrator')) {
        console.log('❌ User does not have Administrator role:', user.roles, 'redirecting to unauthorized')
        if (!redirectAttempted) {
          setRedirectAttempted(true)
          router.push('/unauthorized')
        }
        return
      }

      // If we reach here, user is authenticated and has admin role
      if (isAuthenticated && user?.roles?.includes('Administrator')) {
        console.log('✅ User is authenticated and has Administrator role, setting authChecked')
        setAuthChecked(true)
      }
    }, 500) // Increased to 500ms delay to avoid race conditions

    return () => clearTimeout(timer)
  }, [isAuthenticated, user, tokens, isLoading, router, authChecked, redirectAttempted])

  // Separate effect to handle authChecked changes
  React.useEffect(() => {
    console.log('🔄 AuthChecked changed:', authChecked)
    if (authChecked) {
      console.log('✅ Auth is checked, component is ready')
    }
  }, [authChecked])

  // Monitor authentication state stability
  React.useEffect(() => {
    console.log('🔍 Auth state monitor:', {
      isAuthenticated,
      hasUser: !!user,
      hasTokens: !!tokens?.accessToken,
      isLoading,
      userRoles: user?.roles
    })
    
    // If we have all required data and not loading, we can proceed
    if (isAuthenticated && user && tokens?.accessToken && !isLoading) {
      console.log('✅ All auth data available, checking if we should set authChecked')
      
      // Only set authChecked if user has Administrator role
      if (user.roles?.includes('Administrator') && !authChecked) {
        console.log('✅ User has Administrator role, setting authChecked')
        setAuthChecked(true)
      }
    }
  }, [isAuthenticated, user, tokens, isLoading, authChecked])

  const fetchOrders = React.useCallback(async () => {
    // Don't fetch if not authenticated or not checked yet
    if (!authChecked || !isAuthenticated || !tokens?.accessToken) {
      console.log('🚫 Not ready to fetch orders:', { authChecked, isAuthenticated, hasToken: !!tokens?.accessToken })
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      setLoadingStep("Preparing request...")
      
      console.log('📡 Fetching orders with token:', tokens.accessToken.substring(0, 20) + '...')
      console.log('📡 API URL: /api/Order/admin/all')
      console.log('📡 Query params:', {
        pageNumber: page,
        pageSize: pageSize,
        status: statusFilter,
        paymentStatus: paymentStatusFilter,
        customerName: query.trim() || undefined,
      })
      
      setLoadingStep("Calling API...")
      
      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
        console.log('⏰ Request timeout after 30 seconds')
      }, 300)
      
      const response = await adminGetAllOrders({
        pageNumber: page,
        pageSize: pageSize,
        status: statusFilter,
        paymentStatus: paymentStatusFilter,
        customerName: query.trim() || undefined,
      })
      
      clearTimeout(timeoutId)
      
      setLoadingStep("Processing response...")
      console.log('📡 API Response received:', response)
      
      if (response.success && response.data) {
        setOrders(response.data.items)
        setTotalPages(response.data.totalPages)
        setTotalCount(response.data.totalCount)
        setLoadingStep("Completed!")
        console.log('✅ Orders fetched successfully:', response.data.items.length)
      } else {
        setError('Failed to fetch orders')
        console.error('❌ Failed to fetch orders:', response)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      console.error('❌ Error fetching orders:', errorMessage)
      
      if (errorMessage.includes('AUTHENTICATION_REQUIRED')) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
        setTimeout(() => {
          router.push('/auth/login?next=/admin/orders')
        }, 2000)
      } else if (errorMessage.includes('aborted')) {
        setError('Request timeout. Vui lòng thử lại.')
      } else {
        setError(`Lỗi: ${errorMessage}`)
      }
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, statusFilter, paymentStatusFilter, query, isAuthenticated, tokens, router, authChecked])

  React.useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Trigger fetch when auth is checked
  React.useEffect(() => {
    if (authChecked) {
      console.log('🎯 Auth checked, triggering fetch orders')
      fetchOrders()
    }
  }, [authChecked, fetchOrders])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(1) // Reset to first page when changing page size
  }

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)
    setPage(1) // Reset to first page when searching
  }
  return (
    <>
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
                <BreadcrumbItem>
                  <BreadcrumbPage>Đơn hàng</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-xl font-semibold">Quản lý đơn hàng</h1>
              <Button asChild>
                <Link href="/admin/orders/new">Tạo đơn hàng</Link>
              </Button>
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-2">
                <Input
                  placeholder="Tìm kiếm đơn hàng theo tên khách hàng"
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="md:max-w-sm"
                />
                <Select
                  value={statusFilter === undefined ? "all" : statusFilter}
                  onValueChange={(v) => {
                    setStatusFilter(v === "all" ? undefined : v)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                    <SelectItem value="ACCEPTED">Đã xác nhận</SelectItem>
                    <SelectItem value="REJECTED">Đã từ chối</SelectItem>
                    <SelectItem value="SHIPPED">Đã gửi hàng</SelectItem>
                    <SelectItem value="CONFIRM_RECEIVED">Đã giao hàng</SelectItem>
                    <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                    <SelectItem value="EXPIRED">Hết hạn</SelectItem>
                    <SelectItem value="RETURNED">Đã trả hàng</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={paymentStatusFilter === undefined ? "all" : paymentStatusFilter}
                  onValueChange={(v) => {
                    setPaymentStatusFilter(v === "all" ? undefined : v)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Thanh toán" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả thanh toán</SelectItem>
                    <SelectItem value="ONLINE_PAYMENT_AWAITING">Chờ thanh toán (online)</SelectItem>
                    <SelectItem value="ONLINE_PAYMENT_PAID">Đã thanh toán (online)</SelectItem>
                    <SelectItem value="COD">Thanh toán khi nhận hàng (COD)</SelectItem>
                    <SelectItem value="REFUNDING">Đang hoàn tiền</SelectItem>
                    <SelectItem value="REFUNDED">Đã hoàn tiền</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Số dòng mỗi trang</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => handlePageSizeChange(Number(v))}
                >
                  <SelectTrigger className="w-[90px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-background">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Spinner className="h-8 w-8" />
                <div className="ml-4 text-center">
                  <div>Đang tải đơn hàng...</div>
                  {loadingStep && <div className="text-sm text-muted-foreground mt-1">{loadingStep}</div>}
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <p className="text-destructive mb-2">Lỗi: {error}</p>
                  <Button onClick={fetchOrders} variant="outline">
                    Thử lại
                  </Button>
                </div>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-8">
                <div className="text-center">
                  <h3 className="text-lg font-medium">Không tìm thấy đơn hàng</h3>
                  <p className="text-muted-foreground">Không có đơn hàng nào phù hợp với bộ lọc hiện tại.</p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã đơn hàng</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Ngày đặt</TableHead>
                    <TableHead>Tổng tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thanh toán</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.orderId}>
                      <TableCell className="font-mono text-sm">{order.orderId}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.recipientName}</div>
                          <div className="text-sm text-muted-foreground">{order.recipientPhone}</div>
                        </div>
                      </TableCell>
                       <TableCell>
                         {formatDate(order.orderDate, "ddmmyyyy")}
                       </TableCell>
                       <TableCell>{formatVND(order.totalAmount)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                          order.paymentStatus === 'Failed' ? 'bg-red-100 text-red-800' :
                          order.paymentStatus === 'Refunded' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {formatEnumString(order.paymentStatus)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                         <Button variant="outline" size="sm" asChild>
                           <Link href={`/admin/orders/${order.orderId}`}>Xem</Link>
                         </Button>
                         <Button variant="secondary" size="sm" asChild>
                           <Link href={`/admin/orders/${order.orderId}/edit`}>Sửa</Link>
                         </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          {totalPages > 1 && (
            <Pagination className="mt-2">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (page > 1) handlePageChange(page - 1)
                    }}
                    className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                  const pageNumber = i + 1
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href="#"
                        isActive={page === pageNumber}
                        onClick={(e) => {
                          e.preventDefault()
                          handlePageChange(pageNumber)
                        }}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (page < totalPages) handlePageChange(page + 1)
                    }}
                    className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
          
          {totalCount > 0 && (
             <div className="text-sm text-muted-foreground text-center">
               Hiển thị {orders.length} trong tổng số {totalCount} đơn hàng
             </div>
          )}
        </div>
      </SidebarInset>
    </>
  )
}


