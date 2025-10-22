"use client"
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
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import * as React from "react"
import * as CategoryService from "@/services/cartegoryServices"
import type { Category } from "@/types/category"
import { ArrowLeft, Edit, Trash2, Folder, FolderOpen, Users, Package, Eye } from "lucide-react"
import { TreeSelect } from "antd"
import type { TreeSelectProps } from "antd"

type PageProps = { params: Promise<{ id: string }> }

export default function Page({ params }: PageProps) {
  const { id } = React.use(params)
  const [category, setCategory] = React.useState<Category | null>(null)
  const [allCategories, setAllCategories] = React.useState<Category[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!id) {
      notFound()
      return
    }

    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Fetch both category details and all categories for parent lookup
        const [categoryRes, allCategoriesRes] = await Promise.all([
          CategoryService.getById(id),
          CategoryService.getAll()
        ])

        if (categoryRes.success && categoryRes.data) {
          setCategory(categoryRes.data)
        } else {
          setError("Không tìm thấy danh mục")
        }

        if (allCategoriesRes.success && allCategoriesRes.data) {
          setAllCategories(allCategoriesRes.data)
        }
      } catch (err) {
        console.error('Error fetching category:', err)
        setError("Có lỗi xảy ra khi tải dữ liệu")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await CategoryService.deleteById(id)
      // Redirect to categories list after successful deletion
      window.location.href = '/admin/categories'
    } catch (err) {
      console.error('Error deleting category:', err)
      setError("Có lỗi xảy ra khi xóa danh mục")
    } finally {
      setIsDeleting(false)
    }
  }

  const getParentCategoryName = (parentId: string | null | undefined): string => {
    if (!parentId) return "Danh mục gốc"
    
    // Recursive function to find parent in nested structure
    const findParentRecursive = (categories: Category[]): Category | null => {
      for (const cat of categories) {
        if (cat.id === parentId) {
          return cat
        }
        if (cat.subCategories && cat.subCategories.length > 0) {
          const found = findParentRecursive(cat.subCategories)
          if (found) return found
        }
      }
      return null
    }
    
    const parent = findParentRecursive(allCategories)
    return parent ? parent.name : "Không xác định"
  }

  const getSubcategoriesCount = (): number => {
    return category?.subCategories?.length || 0
  }

  if (isLoading) {
    return (
      <TooltipProvider>
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
                    <BreadcrumbPage>Đang tải...</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Đang tải thông tin danh mục...</p>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
      </TooltipProvider>
    )
  }

  if (error || !category) {
    return (
      <TooltipProvider>
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
                    <BreadcrumbPage>Lỗi</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Không thể tải thông tin danh mục</h3>
              <p className="text-muted-foreground mb-4">{error || "Danh mục không tồn tại"}</p>
              <Button asChild>
                <Link href="/admin/categories">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại danh sách
                </Link>
              </Button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
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
                  <BreadcrumbPage>{category.name}</BreadcrumbPage>
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
                  <h1 className="text-2xl font-bold tracking-tight">{category.name}</h1>
                  <p className="text-muted-foreground">Chi tiết thông tin danh mục</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href={`/admin/categories/${id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Chỉnh sửa
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Xóa
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xóa danh mục</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn có chắc chắn muốn xóa danh mục "{category.name}"? Hành động này không thể hoàn tác.
                        {getSubcategoriesCount() > 0 && (
                          <span className="block mt-2 text-destructive">
                            ⚠️ Danh mục này có {getSubcategoriesCount()} danh mục con. Tất cả danh mục con cũng sẽ bị xóa.
                          </span>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? "Đang xóa..." : "Xóa"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Folder className="h-5 w-5 text-primary" />
                  Thông tin cơ bản
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">ID danh mục</div>
                  <div className="font-medium font-mono text-sm bg-muted px-2 py-1 rounded">{category.id}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Tên danh mục</div>
                  <div className="font-medium">{category.name}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Danh mục cha</div>
                  <div className="font-medium">
                    {category.parentCategoryId ? (
                      <Badge variant="outline" className="gap-1">
                        <FolderOpen className="h-3 w-3" />
                        {getParentCategoryName(category.parentCategoryId)}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <Folder className="h-3 w-3" />
                        Danh mục gốc
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Thống kê
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Số danh mục con</span>
                  <Badge variant="outline" className="gap-1">
                    <Users className="h-3 w-3" />
                    {getSubcategoriesCount()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Cấp độ</span>
                  <Badge variant="secondary">
                    {category.parentCategoryId ? "Danh mục con" : "Danh mục gốc"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subcategories */}
          {getSubcategoriesCount() > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-primary" />
                  Danh mục con ({getSubcategoriesCount()})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {category.subCategories?.map((subCategory) => (
                    <div key={subCategory.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-base">{subCategory.name}</h4>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button asChild size="sm" variant="outline" className="flex-1">
                          <Link href={`/admin/categories/${subCategory.id}`}>
                            <Eye className="h-3 w-3 mr-1" />
                            Xem
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline" className="flex-1">
                          <Link href={`/admin/categories/${subCategory.id}/edit`}>
                            <Edit className="h-3 w-3 mr-1" />
                            Sửa
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
    </TooltipProvider>
  )
}


