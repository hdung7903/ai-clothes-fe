"use client"

import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { ArrowUpRight, Package, ShoppingCart, Tag, Users, TrendingUp, Clock, CheckCircle, Truck } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Spinner } from "@/components/ui/spinner"
import { useEffect, useState } from "react"
import { getDashboardData } from "@/services/adminServices"
import type { DashboardData } from "@/types/admin"
import { useAppSelector } from "@/redux/hooks"
import { useRouter } from "next/navigation"

export default function Page() {
  const router = useRouter()
  const { isAuthenticated, user, isLoading: authLoading } = useAppSelector((state) => state.auth)
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check authentication and admin role
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?next=/admin/dashboard')
      return
    }
    
    if (!authLoading && user && !user.roles?.includes('Administrator')) {
      router.push('/unauthorized')
      return
    }
  }, [isAuthenticated, user, authLoading, router])

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return
      
      try {
        setLoading(true)
        setError(null)
        
        const response = await getDashboardData()
        
        if (response.success && response.data) {
          setDashboardData(response.data)
        } else {
          setError('Không thể tải dữ liệu dashboard')
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu'
        setError(errorMessage)
        console.error('Error fetching dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && user?.roles?.includes('Administrator')) {
      fetchData()
    }
  }, [isAuthenticated, user])

  // Calculate total orders
  const totalOrders = dashboardData 
    ? dashboardData.totalPendingOrder + 
      dashboardData.totalAcceptedOrder + 
      dashboardData.totalProcessingOrder + 
      dashboardData.totalShippedOrder + 
      dashboardData.totalConfirmReceived
    : 0

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
                  <BreadcrumbLink href="/admin/dashboard">Bảng điều khiển</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Tổng quan</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Spinner className="h-12 w-12" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-xl font-semibold mb-2 text-red-600">Lỗi tải dữ liệu</p>
                <p className="text-muted-foreground">{error}</p>
              </div>
            </div>
          ) : dashboardData ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalOrders.toLocaleString('vi-VN')}</div>
                    <p className="text-xs text-muted-foreground">Tất cả đơn hàng</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Người dùng</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData.totalUser.toLocaleString('vi-VN')}</div>
                    <p className="text-xs text-muted-foreground">Đã đăng ký</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sản phẩm</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData.totalProduct.toLocaleString('vi-VN')}</div>
                    <p className="text-xs text-muted-foreground">Đang hiển thị</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Đơn hoàn thành</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData.totalConfirmReceived.toLocaleString('vi-VN')}</div>
                    <p className="text-xs text-muted-foreground">Đã giao thành công</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Đơn chờ xử lý
                    </CardTitle>
                    <CardDescription>Đơn hàng đang chờ xác nhận</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{dashboardData.totalPendingOrder.toLocaleString('vi-VN')}</div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {((dashboardData.totalPendingOrder / totalOrders) * 100).toFixed(1)}% tổng đơn
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Đã xác nhận
                    </CardTitle>
                    <CardDescription>Đơn hàng đã được chấp nhận</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {dashboardData.totalAcceptedOrder.toLocaleString('vi-VN')}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {((dashboardData.totalAcceptedOrder / totalOrders) * 100).toFixed(1)}% tổng đơn
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      Đang xử lý
                    </CardTitle>
                    <CardDescription>Đơn hàng đang được chuẩn bị</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">
                      {dashboardData.totalProcessingOrder.toLocaleString('vi-VN')}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {((dashboardData.totalProcessingOrder / totalOrders) * 100).toFixed(1)}% tổng đơn
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-purple-600" />
                      Đang giao
                    </CardTitle>
                    <CardDescription>Đơn hàng đang được vận chuyển</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600">
                      {dashboardData.totalShippedOrder.toLocaleString('vi-VN')}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {((dashboardData.totalShippedOrder / totalOrders) * 100).toFixed(1)}% tổng đơn
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Tổng quan đơn hàng</CardTitle>
                    <CardDescription>Phân bổ trạng thái đơn hàng</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-yellow-500" />
                          <span className="text-sm">Chờ xử lý</span>
                        </div>
                        <span className="text-sm font-semibold">{dashboardData.totalPendingOrder}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-green-500" />
                          <span className="text-sm">Đã xác nhận</span>
                        </div>
                        <span className="text-sm font-semibold">{dashboardData.totalAcceptedOrder}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-blue-500" />
                          <span className="text-sm">Đang xử lý</span>
                        </div>
                        <span className="text-sm font-semibold">{dashboardData.totalProcessingOrder}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-purple-500" />
                          <span className="text-sm">Đang giao</span>
                        </div>
                        <span className="text-sm font-semibold">{dashboardData.totalShippedOrder}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-emerald-500" />
                          <span className="text-sm">Hoàn thành</span>
                        </div>
                        <span className="text-sm font-semibold">{dashboardData.totalConfirmReceived}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : null}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
