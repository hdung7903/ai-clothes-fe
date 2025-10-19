"use client"
import * as React from "react"
import { useParams } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { deleteTemplateById, getTemplateById } from "@/services/templateServices"
import { Button } from "@/components/ui/button"
import type { TemplateDetail } from "@/types/template"

export default function Page() {
  const params = useParams<{ id: string }>()
  const id = params?.id as string
  const [isLoading, setIsLoading] = React.useState(true)
  const [data, setData] = React.useState<TemplateDetail | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  React.useEffect(() => {
    let ignore = false
    const run = async () => {
      try {
        setIsLoading(true)
        const res = await getTemplateById(id)
        if (!ignore) {
          setData(res.data ?? null)
        }
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }
    if (id) run()
    return () => { ignore = true }
  }, [id])

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
                  <BreadcrumbLink href="/admin/templates">Templates</BreadcrumbLink>
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
          {isLoading && <div className="text-sm text-muted-foreground">Đang tải...</div>}
          {!isLoading && !data && (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <div className="h-12 w-12 rounded-full border" />
              <div className="space-y-1">
                <p className="font-medium">Không tìm thấy template</p>
                <p className="text-sm text-muted-foreground">Có thể template đã bị xóa hoặc ID không hợp lệ.</p>
              </div>
              <Button asChild size="sm" variant="outline">
                <a href="/admin/templates">Quay lại danh sách</a>
              </Button>
            </div>
          )}
          {!isLoading && data && (
            <Card className="max-w-4xl">
              <CardHeader>
                <CardTitle>{data.productName} - {data.printAreaName}</CardTitle>
                <CardDescription>
                  {data.productOptionName}: {data.productOptionValue}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-6 md:flex-row">
                  {data.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={data.imageUrl} alt={data.printAreaName} className="h-56 w-56 rounded object-cover ring-1 ring-border" />
                  )}
                  <div className="space-y-2 text-sm">
                    <div><span className="text-muted-foreground">Template ID:</span> <span className="font-mono">{data.id}</span></div>
                    <div><span className="text-muted-foreground">Product ID:</span> <span className="font-mono">{data.productId}</span></div>
                    <div><span className="text-muted-foreground">Option Value ID:</span> <span className="font-mono">{data.productOptionValueId}</span></div>
                    <div><span className="text-muted-foreground">Tạo lúc:</span> {new Date(data.createdAt).toLocaleString()}</div>
                    <div><span className="text-muted-foreground">Cập nhật:</span> {new Date(data.lastModifiedAt).toLocaleString()}</div>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-end gap-2">
                  <Button asChild variant="secondary">
                    <a href={`/admin/templates/${data.id}/edit`}>Chỉnh sửa</a>
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={isDeleting}
                    onClick={async () => {
                      if (!confirm('Xóa template này?')) return
                      try {
                        setIsDeleting(true)
                        const res = await deleteTemplateById(data.id)
                        if (res.success) {
                          window.location.href = '/admin/templates'
                        }
                      } finally {
                        setIsDeleting(false)
                      }
                    }}
                  >
                    {isDeleting ? 'Đang xóa...' : 'Xóa'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}



