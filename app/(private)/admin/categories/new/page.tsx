"use client"
import Link from "next/link"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import * as CategoryService from "@/services/cartegoryServices"
import { useRouter } from "next/navigation"
import { TreeSelect } from "antd"
import type { TreeSelectProps } from "antd"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Folder, FolderOpen } from "lucide-react"
import type { Category } from "@/types/category"

export default function Page() {
  const router = useRouter()
  const [name, setName] = React.useState("")
  const [parentId, setParentId] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [categories, setCategories] = React.useState<Category[]>([])

  React.useEffect(() => {
    let ignore = false
    ;(async () => {
      try {
        const res = await CategoryService.getAll()
        if (!ignore) setCategories(res.data || [])
      } catch {}
    })()
    return () => {
      ignore = true
    }
  }, [])

  const treeData = React.useMemo(() => {
    // Use nested subCategories from API for tree
    const roots = categories.filter((c) => c.parentCategoryId == null)
    return roots
  }, [categories])

  // Function to count all categories including subcategories
  const countAllCategories = (categories: Category[]): number => {
    let count = 0
    const countRecursive = (cats: Category[]) => {
      cats.forEach(cat => {
        count++
        if (cat.subCategories && cat.subCategories.length > 0) {
          countRecursive(cat.subCategories)
        }
      })
    }
    countRecursive(categories)
    return count
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim()) {
      setError("Tên danh mục là bắt buộc")
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      const res = await CategoryService.createOrUpdate({
        id: null,
        name: name.trim(),
        parentCategoryId: parentId.trim() ? parentId.trim() : null,
      })
      if (res.success) {
        router.push("/admin/categories")
      } else {
        setError(Object.values(res.errors || {}).flat().join(", ") || "Không thể tạo danh mục")
      }
    } catch {
      setError("Lỗi kết nối mạng")
    } finally {
      setIsSubmitting(false)
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
                  <BreadcrumbPage>Tạo mới</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
          {/* Header Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/categories">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Quay lại
                  </Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Tạo danh mục mới</h1>
                  <p className="text-muted-foreground">Thêm danh mục sản phẩm mới vào hệ thống</p>
                </div>
              </div>
              <Badge variant="outline" className="gap-1">
                <Plus className="h-3 w-3" />
                Danh mục mới
              </Badge>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Form Section */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Folder className="h-5 w-5 text-primary" />
                    Thông tin danh mục
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6" onSubmit={onSubmit}>
                    <div className="grid gap-2">
                      <Label htmlFor="name">Tên danh mục *</Label>
                      <Input 
                        id="name" 
                        placeholder="Nhập tên danh mục" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label>Danh mục cha (tùy chọn)</Label>
                      <TreeSelect
                        style={{ width: '100%' }}
                        value={parentId || undefined}
                        placeholder="Chọn danh mục cha (để trống nếu là danh mục gốc)"
                        allowClear
                        treeDefaultExpandAll
                        showSearch
                        treeNodeFilterProp="title"
                        styles={{
                          popup: {
                            root: {
                              maxHeight: '300px',
                              overflow: 'auto'
                            }
                          }
                        }}
                        treeData={treeData.map(category => ({
                          title: category.name,
                          value: category.id,
                          key: category.id,
                          children: category.subCategories?.map(subCategory => ({
                            title: subCategory.name,
                            value: subCategory.id,
                            key: subCategory.id,
                            children: subCategory.subCategories?.map((grandChild: Category) => ({
                              title: grandChild.name,
                              value: grandChild.id,
                              key: grandChild.id,
                            }))
                          }))
                        }))}
                        onChange={(value) => setParentId(value || "")}
                        className="w-full"
                      />
                    </div>

                    {error && (
                      <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                        {error}
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <Button type="submit" disabled={isSubmitting} className="flex-1">
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Đang tạo...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Tạo danh mục
                          </>
                        )}
                      </Button>
                      <Button type="button" variant="outline" asChild>
                        <Link href="/admin/categories">Hủy</Link>
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Info Section */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-primary" />
                    Hướng dẫn
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-primary">1</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Tên danh mục</p>
                        <p className="text-xs text-muted-foreground">Nhập tên danh mục rõ ràng và dễ hiểu</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-primary">2</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Danh mục cha</p>
                        <p className="text-xs text-muted-foreground">Chọn danh mục cha để tạo cấu trúc phân cấp</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-primary">3</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Lưu danh mục</p>
                        <p className="text-xs text-muted-foreground">Nhấn "Tạo danh mục" để lưu vào hệ thống</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Thống kê</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Tổng danh mục</span>
                      <Badge variant="outline">{countAllCategories(categories)}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Danh mục gốc</span>
                      <Badge variant="outline">{treeData.length}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


