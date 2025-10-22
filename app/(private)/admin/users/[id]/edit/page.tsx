import Link from "next/link"
import { notFound } from "next/navigation"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { getProfile } from "@/services/userServices"
import type { UserProfile } from "@/types/user"
import * as React from "react"

type PageProps = { params: { id: string } }

export default function Page({ params }: PageProps) {
  const { id } = params
  if (!id) notFound()
  const [profile, setProfile] = React.useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = React.useState<boolean>(true)
  const [error, setError] = React.useState<string>("")

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      setIsLoading(true)
      setError("")
      try {
        const res = await getProfile()
        if (!cancelled) setProfile(res?.data ?? null)
      } catch (e) {
        if (!cancelled) setError("Không thể tải thông tin người dùng")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
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
                  <BreadcrumbLink href="/admin/dashboard">Admin</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin/users">Người dùng</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Chỉnh sửa</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Chỉnh sửa người dùng</h1>
            <Button variant="outline" asChild>
              <Link href={`/admin/users/${id}`}>Hủy</Link>
            </Button>
          </div>
          <form className="rounded-xl border bg-background p-4 grid gap-4 max-w-xl">
            {isLoading && <div className="text-sm text-muted-foreground">Đang tải...</div>}
            {error && !isLoading && <div className="text-sm text-destructive">{error}</div>}
            {!isLoading && !error && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="name">Họ và tên</Label>
                  <Input id="name" defaultValue={profile?.fullName ?? ""} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={profile?.email ?? ""} />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Lưu</Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href={`/admin/users/${id}`}>Quay lại</Link>
                  </Button>
                </div>
              </>
            )}
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


