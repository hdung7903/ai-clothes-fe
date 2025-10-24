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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Eye, Trash2, Upload } from "lucide-react"
import * as React from "react"
import { searchSuggestionImages, deleteSuggestionImageById } from "@/services/suggestionImageService"
import type { SearchSuggestionImagesQuery, SuggestionImageSummaryItem } from "@/types/suggestionImage"
import { ImageUploadDialog } from "@/components/admin/image-upload-dialog"

export default function SuggestionImagesPage() {
  const [query, setQuery] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all")
  const [isActiveFilter, setIsActiveFilter] = React.useState<string>("all")
  const [pageSize, setPageSize] = React.useState(10)
  const [page, setPage] = React.useState(1)
  const [items, setItems] = React.useState<SuggestionImageSummaryItem[]>([])
  const [totalPages, setTotalPages] = React.useState(1)
  const [isLoading, setIsLoading] = React.useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false)
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false)
  const [selectedImage, setSelectedImage] = React.useState<SuggestionImageSummaryItem | null>(null)

  const currentPage = Math.min(page, totalPages)

  const loadData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const payload: SearchSuggestionImagesQuery = {
        PageNumber: currentPage,
        PageSize: pageSize,
        SearchTerm: query || undefined,
        Category: categoryFilter === "all" ? undefined : categoryFilter,
        IsActive: isActiveFilter === "all" ? undefined : isActiveFilter === "active",
        SortBy: "displayOrder",
        SortOrder: "asc",
      }
      const res = await searchSuggestionImages(payload)
      setItems(res.data?.items ?? [])
      setTotalPages(res.data?.totalPages || 1)
    } catch (error) {
      console.error("Error loading images:", error)
    } finally {
      setIsLoading(false)
    }
  }, [query, categoryFilter, isActiveFilter, currentPage, pageSize])

  React.useEffect(() => {
    let ignore = false
    const run = async () => {
      if (!ignore) {
        await loadData()
      }
    }
    run()
    return () => {
      ignore = true
    }
  }, [loadData])

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteSuggestionImageById(id)
      if (res.success) {
        // Reload data
        setPage(1)
        await loadData()
      } else {
        alert("Xóa ảnh thất bại")
      }
    } catch (error) {
      alert("Đã xảy ra lỗi khi xóa ảnh")
    }
  }

  const handleViewImage = (item: SuggestionImageSummaryItem) => {
    setSelectedImage(item)
    setViewDialogOpen(true)
  }

  const handleUploadSuccess = async () => {
    setPage(1)
    await loadData()
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
                  <BreadcrumbPage>Ảnh đề xuất</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-xl font-semibold">Quản lý ảnh đề xuất</h1>
              <Button onClick={() => setUploadDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Tải ảnh lên
              </Button>
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <Input
                placeholder="Tìm kiếm theo tên hoặc mô tả"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(1)
                }}
                className="md:max-w-sm"
              />
              <div className="flex items-center gap-2">
                <Select
                  value={categoryFilter}
                  onValueChange={(v) => {
                    setCategoryFilter(v)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả danh mục</SelectItem>
                    <SelectItem value="Logo">Logo</SelectItem>
                    <SelectItem value="Pattern">Pattern</SelectItem>
                    <SelectItem value="Icon">Icon</SelectItem>
                    <SelectItem value="Text">Text</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={isActiveFilter}
                  onValueChange={(v) => {
                    setIsActiveFilter(v)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="active">Đang hoạt động</SelectItem>
                    <SelectItem value="inactive">Không hoạt động</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">Số hàng mỗi trang</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => {
                    setPageSize(Number(v))
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="w-[90px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead className="text-right w-[150px]">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">Đang tải...</TableCell>
                  </TableRow>
                )}
                {!isLoading && items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Không tìm thấy ảnh nào
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {item.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded border overflow-hidden flex-shrink-0">
                          <img 
                            src={item.imageUrl} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewImage(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bạn có chắc chắn muốn xóa ảnh này không? Hành động này không thể hoàn tác.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(item.id)}>
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      onClick={() => setPage(p)}
                      isActive={currentPage === p}
                      className="cursor-pointer"
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>

        {/* Upload Dialog */}
        <ImageUploadDialog 
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          onSuccess={handleUploadSuccess}
        />

        {/* View Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Chi tiết ảnh</DialogTitle>
            </DialogHeader>
            {selectedImage && (
              <div className="space-y-4">
                <div className="rounded-lg border overflow-hidden">
                  <img 
                    src={selectedImage.imageUrl} 
                    className="w-full h-auto"
                  />
                </div>
                <div className="grid gap-3">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">ID</div>
                    <div className="font-mono text-sm">{selectedImage.id}</div>
                  </div>
        
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Trạng thái</div>
                      <div>
                        {selectedImage.isActive ? (
                          <Badge className="bg-green-500">Hoạt động</Badge>
                        ) : (
                          <Badge variant="secondary">Không hoạt động</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
