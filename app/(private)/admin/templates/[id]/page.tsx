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
import { getTemplateById } from "@/services/templateServices"
import type { TemplateDetail } from "@/types/template"

export default function Page() {
  const params = useParams<{ id: string }>()
  const id = params?.id as string
  const [isLoading, setIsLoading] = React.useState(true)
  const [data, setData] = React.useState<TemplateDetail | null>(null)

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
          {isLoading && <div>Đang tải...</div>}
          {!isLoading && !data && <div>Không tìm thấy template.</div>}
          {!isLoading && data && (
            <Card className="max-w-3xl">
              <CardHeader>
                <CardTitle>{data.productName} - {data.printAreaName}</CardTitle>
                <CardDescription>
                  {data.productOptionName}: {data.productOptionValue}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6">
                  {data.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={data.imageUrl} alt={data.printAreaName} className="h-40 w-40 rounded object-cover border" />
                  )}
                  <div className="space-y-2 text-sm">
                    <div><span className="text-muted-foreground">Template ID:</span> <span className="font-mono">{data.id}</span></div>
                    <div><span className="text-muted-foreground">Product ID:</span> <span className="font-mono">{data.productId}</span></div>
                    <div><span className="text-muted-foreground">Option Value ID:</span> <span className="font-mono">{data.productOptionValueId}</span></div>
                    <div><span className="text-muted-foreground">Tạo lúc:</span> {new Date(data.createdAt).toLocaleString()}</div>
                    <div><span className="text-muted-foreground">Cập nhật:</span> {new Date(data.lastModifiedAt).toLocaleString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


