"use client"
import Link from "next/link"
import * as React from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { searchTemplates, type SearchTemplatesQuery, deleteTemplateById } from "@/services/templateServices"
import type { TemplateSummaryItem } from "@/types/template"

export default function Page() {
  const [query, setQuery] = React.useState("")
  const [pageSize, setPageSize] = React.useState(10)
  const [page, setPage] = React.useState(1)
  const [items, setItems] = React.useState<TemplateSummaryItem[]>([])
  const [totalPages, setTotalPages] = React.useState(1)
  const [isLoading, setIsLoading] = React.useState(false)

  const currentPage = Math.min(page, totalPages)

  React.useEffect(() => {
    let ignore = false
    const run = async () => {
      setIsLoading(true)
      try {
        const payload: SearchTemplatesQuery = {
          PageNumber: currentPage,
          PageSize: pageSize,
          SearchTerm: query || undefined,
        }
        const res = await searchTemplates(payload)
        if (!ignore) {
          setItems(res.data?.items ?? [])
          setTotalPages(res.data?.totalPages || 1)
        }
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }
    run()
    return () => { ignore = true }
  }, [query, currentPage, pageSize])

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
                  <BreadcrumbPage>Templates</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-xl font-semibold">Quản lý template</h1>
              <Button asChild>
                <Link href="/admin/templates/new">Thêm template</Link>
              </Button>
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <Input
                placeholder="Tìm kiếm theo tên sản phẩm/print area"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1) }}
                className="md:max-w-sm"
              />
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Số hàng mỗi trang</span>
                <select
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                  value={String(pageSize)}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                </select>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hình ảnh</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Option</TableHead>
                  <TableHead>Print area</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={5}>Đang tải...</TableCell>
                  </TableRow>
                )}
                {!isLoading && items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>Không tìm thấy template.</TableCell>
                  </TableRow>
                )}
                {!isLoading && items.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      {t.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.imageUrl} alt={t.printAreaName} className="h-10 w-10 rounded object-cover" />
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{t.productName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">{t.productOptionName} - {t.productOptionValue}</div>
                    </TableCell>
                    <TableCell>{t.printAreaName}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/templates/${t.id}`}>Xem</Link>
                      </Button>
                      <Button variant="secondary" size="sm" asChild>
                        <Link href={`/admin/templates/${t.id}/edit`}>Sửa</Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">Xóa</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xóa template?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Hành động này không thể hoàn tác. Thao tác này sẽ xóa vĩnh viễn template tại print area "{t.printAreaName}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={async () => {
                                try {
                                  setIsLoading(true)
                                  const res = await deleteTemplateById(t.id)
                                  if (res.success) {
                                    setItems(prev => prev.filter(x => x.id !== t.id))
                                  }
                                } finally {
                                  setIsLoading(false)
                                }
                              }}
                            >
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination className="mt-2">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)) }} />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink href="#" isActive={currentPage === i + 1} onClick={(e) => { e.preventDefault(); setPage(i + 1) }}>
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)) }} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


