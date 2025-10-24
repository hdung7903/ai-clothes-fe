"use client"
import { useParams, useRouter } from "next/navigation"
import * as React from "react"
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
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { Pencil } from "lucide-react"
import Link from "next/link"
import { getSuggestionImageById } from "@/services/suggestionImageService"
import type { SuggestionImage } from "@/types/suggestionImage"

export default function SuggestionImageDetailPage() {
  const params = useParams()
  const router = useRouter()
  const imageId = params?.id as string
  const [image, setImage] = React.useState<SuggestionImage | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    const loadData = async () => {
      if (!imageId) return
      setIsLoading(true)
      try {
        const res = await getSuggestionImageById(imageId)
        if (res.success && res.data) {
          setImage(res.data)
        } else {
          setError("Không thể tải thông tin ảnh")
        }
      } catch (err) {
        setError("Đã xảy ra lỗi khi tải dữ liệu")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [imageId])

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
                  <BreadcrumbLink href="/admin/images">Ảnh đề xuất</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Chi tiết</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {isLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardHeader>
                <CardTitle>Lỗi</CardTitle>
                <CardDescription>{error}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.back()}>Quay lại</Button>
              </CardContent>
            </Card>
          ) : image ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{image.name}</CardTitle>
                    <CardDescription>Chi tiết ảnh đề xuất</CardDescription>
                  </div>
                  <Button asChild>
                    <Link href={`/admin/images/${imageId}/edit`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Chỉnh sửa
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Image Preview */}
                <div>
                  <h3 className="font-semibold mb-2">Ảnh xem trước</h3>
                  <div className="relative w-full max-w-md aspect-square border rounded-lg overflow-hidden">
                    <img 
                      src={image.imageUrl} 
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-1">Tên ảnh</h3>
                    <p className="text-muted-foreground">{image.name}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-1">Danh mục</h3>
                    {image.category ? (
                      <Badge variant="outline">{image.category}</Badge>
                    ) : (
                      <p className="text-muted-foreground">Không có</p>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-1">Thứ tự hiển thị</h3>
                    <p className="text-muted-foreground">{image.displayOrder}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-1">Trạng thái</h3>
                    {image.isActive ? (
                      <Badge className="bg-green-500">Hoạt động</Badge>
                    ) : (
                      <Badge variant="secondary">Không hoạt động</Badge>
                    )}
                  </div>

                  {image.description && (
                    <div className="md:col-span-2">
                      <h3 className="font-semibold mb-1">Mô tả</h3>
                      <p className="text-muted-foreground">{image.description}</p>
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <h3 className="font-semibold mb-1">URL ảnh</h3>
                    <a 
                      href={image.imageUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline break-all text-sm"
                    >
                      {image.imageUrl}
                    </a>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-1">Ngày tạo</h3>
                    <p className="text-muted-foreground">
                      {new Date(image.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-1">Ngày cập nhật</h3>
                    <p className="text-muted-foreground">
                      {new Date(image.updatedAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => router.back()}>
                    Quay lại
                  </Button>
                  <Button asChild>
                    <Link href={`/admin/images/${imageId}/edit`}>
                      Chỉnh sửa
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
