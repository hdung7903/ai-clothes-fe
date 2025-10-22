"use client"
import Link from "next/link"
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import * as React from "react"
import * as CategoryService from "@/services/cartegoryServices"
import type { Category } from "@/types/category"
import { useRouter } from "next/navigation"
import { Eye, Edit, Trash2, Plus, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TreeSelect } from "antd"
import type { TreeSelectProps } from "antd"

export default function Page() {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string | undefined>(undefined)
  const [items, setItems] = React.useState<Category[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  React.useEffect(() => {
    let ignore = false
    const run = async () => {
      setIsLoading(true)
      try {
        const res = await CategoryService.getAll()
        if (!ignore) {
          setItems(res.data || [])
        }
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }
    run()
    return () => {
      ignore = true
    }
  }, [])

  // Convert categories to TreeSelect format
  const treeData = React.useMemo<TreeSelectProps['treeData']>(() => {
    const convertToTreeData = (categories: Category[]): TreeSelectProps['treeData'] => {
      return categories.map((category) => ({
        title: (
          <div className="flex items-center justify-between w-full group">
            <span className="truncate">{category.name}</span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/admin/categories/${category.id}`)
                    }}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Xem chi tiết</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/admin/categories/${category.id}/edit`)
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Chỉnh sửa danh mục</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xóa danh mục</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn có chắc chắn muốn xóa "{category.name}"? Hành động này không thể hoàn tác.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(category.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Xóa
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                  </AlertDialog>
                </TooltipTrigger>
                <TooltipContent>Xóa danh mục</TooltipContent>
              </Tooltip>
            </div>
          </div>
        ),
        value: category.id,
        key: category.id,
        children: category.subCategories && category.subCategories.length > 0 
          ? convertToTreeData(category.subCategories) 
          : undefined,
      }))
    }

    // Only show root categories (parentCategoryId is null)
    const rootCategories = items.filter((c) => c.parentCategoryId == null)
    return convertToTreeData(rootCategories)
  }, [items, router])

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id)
      await CategoryService.deleteById(id)
      setItems((prev) => prev.filter((c) => c.id !== id))
      // Clear selected category if it was deleted
      if (selectedCategory === id) {
        setSelectedCategory(undefined)
      }
    } finally {
      setDeletingId(null)
    }
  }

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
                <BreadcrumbItem>
                  <BreadcrumbPage>Danh mục</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
          {/* Header Section */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Quản lý danh mục</h1>
                <p className="text-muted-foreground mt-2">Quản lý danh mục sản phẩm và cấu trúc phân cấp</p>
              </div>
              <Button asChild size="lg" className="gap-2 shadow-lg">
                <Link href="/admin/categories/new">
                  <Plus className="h-4 w-4" />
                  Thêm danh mục
                </Link>
              </Button>
            </div>
            
            {/* Search and Stats */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm danh mục..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="md:max-w-sm"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="gap-1">
                    <span>Tổng danh mục:</span>
                    <span className="font-semibold">{countAllCategories(items)}</span>
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <span>Danh mục gốc:</span>
                    <span className="font-semibold">{items.filter(c => c.parentCategoryId == null).length}</span>
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <h3 className="text-lg font-semibold mb-2">Đang tải danh mục</h3>
                    <p className="text-muted-foreground">Vui lòng chờ trong giây lát...</p>
                  </div>
                </div>
              ) : !treeData || treeData.length === 0 ? (
                <div className="text-center py-16">
                  <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                    <Search className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Không tìm thấy danh mục</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {query ? "Hãy thử điều chỉnh từ khóa tìm kiếm" : "Bắt đầu bằng cách tạo danh mục đầu tiên"}
                  </p>
                  {!query && (
                    <Button asChild size="lg">
                      <Link href="/admin/categories/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Tạo danh mục đầu tiên
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Cây danh mục</h3>
                    <div className="text-sm text-muted-foreground">
                      Chọn danh mục để xem chi tiết
                    </div>
                  </div>
                  
                  <TreeSelect
                    style={{ width: '100%' }}
                    value={selectedCategory}
                    placeholder="Chọn danh mục để xem chi tiết"
                    allowClear
                    treeDefaultExpandAll
                    showSearch
                    treeNodeFilterProp="title"
                    styles={{
                      popup: {
                        root: {
                          maxHeight: '400px',
                          overflow: 'auto'
                        }
                      }
                    }}
                    treeData={treeData || []}
                    onChange={(value) => setSelectedCategory(value)}
                    className="w-full"
                  />
                  
                  {selectedCategory && (
                    <Card className="mt-4 border-l-4 border-l-primary bg-primary/5">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">Chi tiết danh mục đã chọn</h4>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/admin/categories/${selectedCategory}`)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Xem chi tiết
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/admin/categories/${selectedCategory}/edit`)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Chỉnh sửa
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  disabled={deletingId === selectedCategory}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  {deletingId === selectedCategory ? "Đang xóa..." : "Xóa"}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Xóa danh mục</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(selectedCategory)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Xóa
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ID danh mục: <code className="bg-muted px-1 rounded">{selectedCategory}</code>
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
    </TooltipProvider>
  )
}


