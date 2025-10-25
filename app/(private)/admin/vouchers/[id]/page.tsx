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
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Package } from "lucide-react"
import * as React from "react"
import { useRouter } from "next/navigation"
import { getVoucherById } from "@/services/voucherService"
import type { Voucher } from "@/types/voucher"
import { formatCurrency } from "../../../../../utils/format"

interface VoucherViewPageProps {
  params: {
    id: string;
  };
}

export default function VoucherViewPage({ params }: VoucherViewPageProps) {
  const router = useRouter()
  const [voucher, setVoucher] = React.useState<Voucher | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const loadVoucher = async () => {
      try {
        setIsLoading(true)
        const response = await getVoucherById(params.id)
        if (response.success && response.data) {
          // Map response data to Voucher type - use productDetails as products
          const voucherData: Voucher = {
            id: response.data.id,
            code: response.data.code,
            description: response.data.description,
            discountType: response.data.discountType,
            discountValue: response.data.discountValue,
            startDate: response.data.startDate,
            endDate: response.data.endDate,
            usedCount: response.data.usedCount,
            isActive: response.data.isActive,
            createdAt: response.data.createdAt,
            lastModifiedAt: response.data.lastModifiedAt,
            products: response.data.productDetails, // Use productDetails which has full product info
          }
          setVoucher(voucherData)
        } else {
          setError('Không thể tải thông tin voucher')
        }
      } catch (err) {
        setError('Không thể tải thông tin voucher')
      } finally {
        setIsLoading(false)
      }
    }
    loadVoucher()
  }, [params.id])

  const formatDiscountValue = (voucher: Voucher) => {
    if (voucher.discountType === 'PERCENT') {
      return `${voucher.discountValue || 0}%`
    }
    return formatCurrency(voucher.discountValue || 0, 'VND', 'vi-VN')
  }

  const formatUsage = (voucher: Voucher) => {
    return `${voucher.usedCount}`
  }

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date()
  }

  const isActive = (voucher: Voucher) => {
    const now = new Date()
    const startDate = new Date(voucher.startDate)
    const endDate = new Date(voucher.endDate)
    return voucher.isActive && now >= startDate && now <= endDate
  }

  if (isLoading) {
    return (
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Đang tải thông tin voucher...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (error || !voucher) {
    return (
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-64">
            <Alert variant="destructive" className="max-w-md">
              <AlertDescription>{error || 'Không tìm thấy voucher'}</AlertDescription>
            </Alert>
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
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin/dashboard">Quản trị</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin/vouchers">Voucher</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{voucher.code}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">{voucher.code}</h1>
              <p className="text-muted-foreground">{voucher.description}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.back()}>
                Quay lại
              </Button>
              <Button asChild>
                <a href={`/admin/vouchers/${voucher.id}/edit`}>Chỉnh sửa</a>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Trạng thái</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={isActive(voucher) ? "default" : "secondary"}>
                  {isActive(voucher) ? "Đang hoạt động" : isExpired(voucher.endDate) ? "Hết hạn" : "Không hoạt động"}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Giảm giá</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatDiscountValue(voucher)}</div>
                <p className="text-sm text-muted-foreground">
                  {voucher.discountType === 'PERCENT' ? 'Giảm giá phần trăm' : 'Giảm giá số tiền cố định'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Sử dụng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatUsage(voucher)}</div>
                <p className="text-sm text-muted-foreground">Lần sử dụng</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin voucher</CardTitle>
                <CardDescription>Thông tin cơ bản về voucher này</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Mã voucher</label>
                  <p className="text-sm font-mono">{voucher.code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Mô tả</label>
                  <p className="text-sm">{voucher.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Loại giảm giá</label>
                  <p className="text-sm">
                    {voucher.discountType === 'PERCENT' ? 'Phần trăm' : 'Số tiền cố định'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Giá trị giảm giá</label>
                  <p className="text-sm">{formatDiscountValue(voucher)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Trạng thái kích hoạt</label>
                  <p className="text-sm">{voucher.isActive ? 'Có' : 'Không'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thời gian hiệu lực</CardTitle>
                <CardDescription>Khoảng thời gian voucher có hiệu lực</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ngày bắt đầu</label>
                  <p className="text-sm">{new Date(voucher.startDate).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ngày kết thúc</label>
                  <p className="text-sm">{new Date(voucher.endDate).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Số lần sử dụng</label>
                  <p className="text-sm">{voucher.usedCount}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ngày tạo</label>
                  <p className="text-sm">{new Date(voucher.createdAt).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Sản phẩm áp dụng voucher
              </CardTitle>
              <CardDescription>
                Danh sách sản phẩm có thể sử dụng voucher này
              </CardDescription>
            </CardHeader>
            <CardContent>
              {voucher.products && voucher.products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {voucher.products.map((product) => (
                    <div key={product.id} className="flex items-center space-x-3 p-3 rounded-lg border">
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{product.name}</h4>
                        <p className="text-xs text-muted-foreground">ID: {product.id}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Voucher này áp dụng cho tất cả sản phẩm</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
