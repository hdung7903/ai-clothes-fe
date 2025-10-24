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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import * as React from "react"
import { getProductDesignById } from "@/services/productDesignServices"
import type { ProductDesignDetail } from "@/types/productDesign"
import { useAppSelector } from "@/redux/hooks"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Calendar, 
  Package, 
  Palette,
  Image as ImageIcon,
  ArrowLeft
} from "lucide-react"

interface PageProps {
  params: Promise<{
    id: string
    designId: string
  }>
}

export default function AdminDesignDetailPage({ params }: PageProps) {
  const router = useRouter()
  const { isAuthenticated, user, tokens, isLoading } = useAppSelector((state) => state.auth)
  
  const [design, setDesign] = React.useState<ProductDesignDetail | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Unwrap params using React.use()
  const { id: orderId, designId } = React.use(params)

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

  // Fetch design details
  React.useEffect(() => {
    const fetchDesign = async () => {
      if (!isAuthenticated || !tokens?.accessToken) return
      
      try {
        setLoading(true)
        setError(null)
        
        const response = await getProductDesignById(designId)
        
        if (response.success && response.data) {
          setDesign(response.data)
        } else {
          setError('Không thể tải thông tin thiết kế')
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && tokens?.accessToken) {
      fetchDesign()
    }
  }, [designId, isAuthenticated, tokens])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-64">
            <Spinner className="h-12 w-12" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (error || !design) {
    return (
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Palette className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-xl font-semibold mb-2">
                {error || "Không tìm thấy thiết kế"}
              </p>
              <p className="text-muted-foreground mb-6">
                Thiết kế này có thể đã bị xóa hoặc bạn không có quyền truy cập.
              </p>
              <Button onClick={() => router.push(`/admin/orders/${orderId}`)} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại đơn hàng
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
                  <BreadcrumbLink href={`/admin/orders/${orderId}`}>Chi tiết đơn hàng</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Thiết kế sản phẩm</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">{design.name}</h1>
              <p className="text-muted-foreground">
                Thiết kế cho sản phẩm: {design.product.name}
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href={`/admin/orders/${orderId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại đơn hàng
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    Thông tin sản phẩm
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <img
                      src={design.product.imageUrl || "/placeholder.svg"}
                      alt={design.product.name}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {design.product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {design.product.description}
                      </p>
                      <Badge variant="secondary">
                        {design.productOptionValueDetail.optionName}: {design.productOptionValueDetail.value}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Design Templates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Palette className="mr-2 h-5 w-5" />
                    Thiết kế ({design.templates.length} vùng in)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {design.templates.length === 0 ? (
                    <p className="text-muted-foreground text-center py-6">
                      Chưa có thiết kế nào được áp dụng
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {design.templates.map((template) => (
                        <div key={template.templateId} className="relative group">
                          <div className="border rounded-lg overflow-hidden bg-gray-50">
                            <img
                              src={template.designImageUrl}
                              alt={template.printAreaName}
                              className="w-full h-64 object-contain"
                            />
                          </div>
                          <div className="mt-2">
                            <p className="font-medium">{template.printAreaName}</p>
                            <p className="text-sm text-muted-foreground">
                              Template ID: {template.templateId}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Icons Used */}
              {design.icons.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ImageIcon className="mr-2 h-5 w-5" />
                      Biểu tượng đã sử dụng ({design.icons.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                      {design.icons.map((icon, index) => (
                        <div key={icon.id} className="relative group">
                          <div className="border rounded-lg p-2 bg-white hover:shadow-md transition-shadow">
                            <img
                              src={icon.imageUrl}
                              alt={`Icon ${index + 1}`}
                              className="w-full h-16 object-contain"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Design Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin thiết kế</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center text-sm text-muted-foreground mb-1">
                      <Calendar className="mr-2 h-4 w-4" />
                      Ngày tạo
                    </div>
                    <p className="text-sm font-medium">
                      {formatDate(design.createdAt)}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <div className="flex items-center text-sm text-muted-foreground mb-1">
                      <Calendar className="mr-2 h-4 w-4" />
                      Chỉnh sửa lần cuối
                    </div>
                    <p className="text-sm font-medium">
                      {formatDate(design.lastModifiedAt)}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Design ID</p>
                    <p className="text-xs font-mono break-all">{design.id}</p>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Product ID</p>
                    <p className="text-xs font-mono break-all">{design.productId}</p>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Vùng in
                    </p>
                    <p className="text-sm font-medium">
                      {design.templates.length} vùng
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Biểu tượng
                    </p>
                    <p className="text-sm font-medium">
                      {design.icons.length} biểu tượng
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Hành động nhanh</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full" variant="outline" asChild>
                    <Link href={`/admin/orders/${orderId}`}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Quay lại đơn hàng
                    </Link>
                  </Button>
                  
                  <Button className="w-full" variant="outline" asChild>
                    <Link href={`/products/${design.productId}`}>
                      <Package className="mr-2 h-4 w-4" />
                      Xem sản phẩm
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
