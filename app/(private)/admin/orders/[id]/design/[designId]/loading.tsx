import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function AdminDesignDetailLoading() {
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
                  <Skeleton className="h-4 w-32" />
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
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Skeleton className="h-8 w-80 mb-2" />
              <Skeleton className="h-5 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content Skeleton */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Information */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-7 w-48" />
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Skeleton className="w-24 h-24 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Design Templates */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-7 w-56" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                      <div key={i}>
                        <Skeleton className="w-full h-64 rounded-lg mb-2" />
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Icons */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-7 w-64" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Skeleton key={i} className="w-full h-20 rounded-lg" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-6">
              {/* Design Info */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-7 w-40" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-5 w-full" />
                  </div>

                  <Separator />

                  <div>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </div>

                  <Separator />

                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </div>

                  <Separator />

                  <div>
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-5 w-24" />
                  </div>

                  <Separator />

                  <div>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-5 w-28" />
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-7 w-32" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
