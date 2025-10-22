"use client"
import Link from "next/link"
import { notFound, useRouter } from "next/navigation"
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
import * as React from "react"
import * as CategoryService from "@/services/cartegoryServices"
import type { Category } from "@/types/category"
import { TreeSelect } from "antd"
import type { TreeSelectProps } from "antd"

type PageProps = { params: Promise<{ id: string }> }

export default function Page({ params }: PageProps) {
  const { id } = React.use(params)
  if (!id) notFound()
  const router = useRouter()

  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [name, setName] = React.useState("")
  const [parentId, setParentId] = React.useState<string | null>(null)
  const [categories, setCategories] = React.useState<Category[]>([])
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    let ignore = false
    const run = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [detail, all] = await Promise.all([
          CategoryService.getById(id),
          CategoryService.getAll(),
        ])
        if (ignore) return
        if (!detail.success || !detail.data) {
          setError("Không thể tải thông tin danh mục")
        } else {
          setName(detail.data.name)
          setParentId(detail.data.parentCategoryId ?? null)
        }
        setCategories(all.data || [])
      } catch {
        if (!ignore) setError("Lỗi kết nối mạng")
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }
    run()
    return () => { ignore = true }
  }, [id])

  const roots = React.useMemo(() => (categories || []).filter((c) => c.parentCategoryId == null), [categories])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim()) {
      setError("Tên danh mục là bắt buộc")
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await CategoryService.createOrUpdate({
        id,
        name: name.trim(),
        parentCategoryId: parentId,
      })
      if (res.success) {
        router.push(`/admin/categories/${id}`)
      } else {
        setError(Object.values(res.errors || {}).flat().join(", ") || "Không thể lưu danh mục")
      }
    } catch {
      setError("Lỗi kết nối mạng")
    } finally {
      setSaving(false)
    }
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
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin/categories">Danh mục</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Chỉnh sửa {id}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Chỉnh sửa danh mục</h1>
            <Button variant="outline" asChild>
              <Link href={`/admin/categories/${id}`}>Hủy</Link>
            </Button>
          </div>
          {isLoading ? (
            <div className="rounded-xl border bg-background p-4 text-sm text-muted-foreground max-w-xl">Đang tải...</div>
          ) : (
            <form className="rounded-xl border bg-background p-4 grid gap-4 max-w-xl" onSubmit={onSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="name">Tên danh mục</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Danh mục cha</Label>
                <TreeSelect
                  style={{ width: '100%' }}
                  value={parentId}
                  placeholder="Chọn danh mục cha (tùy chọn)"
                  allowClear
                  treeDefaultExpandAll
                  showSearch
                  treeNodeFilterProp="title"
                  styles={{
                    popup: {
                      root: {
                        maxHeight: '200px',
                        overflow: 'auto'
                      }
                    }
                  }}
                  treeData={roots.map(category => ({
                    title: category.name,
                    value: category.id,
                    key: category.id,
                    children: category.subCategories?.map(subCategory => ({
                      title: subCategory.name,
                      value: subCategory.id,
                      key: subCategory.id,
                      children: subCategory.subCategories?.map(grandChild => ({
                        title: grandChild.name,
                        value: grandChild.id,
                        key: grandChild.id,
                      }))
                    }))
                  }))}
                  onChange={(value) => {
                    if (value === id) return // Prevent selecting self as parent
                    setParentId(value)
                  }}
                  className="w-full"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</Button>
                <Button type="button" variant="outline" asChild>
                  <Link href={`/admin/categories/${id}`}>Quay lại</Link>
                </Button>
              </div>
            </form>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


