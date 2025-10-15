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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import * as React from "react"
import { searchVouchers, type SearchVouchersQuery, deleteVoucherById } from "@/services/voucherService"
import type { VoucherSummaryItem } from "@/types/voucher"
import { formatCurrency } from "../../../../utils/format"

export default function Page() {
  const [query, setQuery] = React.useState("")
  const [isActiveFilter, setIsActiveFilter] = React.useState<string>("all")
  const [discountTypeFilter, setDiscountTypeFilter] = React.useState<string>("all")
  const [pageSize, setPageSize] = React.useState(5)
  const [page, setPage] = React.useState(1)
  const [items, setItems] = React.useState<VoucherSummaryItem[]>([])
  const [totalPages, setTotalPages] = React.useState(1)
  const [isLoading, setIsLoading] = React.useState(false)

  const currentPage = Math.min(page, totalPages)

  React.useEffect(() => {
    let ignore = false
    const run = async () => {
      setIsLoading(true)
      try {
        const payload: SearchVouchersQuery = {
          SearchTerm: query || undefined,
          IsActive: isActiveFilter === "all" ? undefined : isActiveFilter === "active",
          DiscountType: discountTypeFilter === "all" ? undefined : discountTypeFilter as 'PERCENTAGE' | 'FIXED_AMOUNT',
          SortBy: 'CREATED_ON',
          SortDescending: true,
          PageNumber: currentPage,
          PageSize: pageSize,
        }
        const res = await searchVouchers(payload)
        if (!ignore) {
          setItems(res.data?.items ?? [])
          setTotalPages(res.data?.totalPages || 1)
        }
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }
    run()
    return () => {
      ignore = true
    }
  }, [query, isActiveFilter, discountTypeFilter, currentPage, pageSize])

  const formatDiscountValue = (voucher: VoucherSummaryItem) => {
    if (voucher.discountType === 'PERCENTAGE') {
      return `${voucher.discountValue}%`
    }
    return formatCurrency(voucher.discountValue, 'VND', 'vi-VN')
  }

  const formatUsage = (voucher: VoucherSummaryItem) => {
    if (voucher.usageLimit) {
      return `${voucher.usedCount}/${voucher.usageLimit}`
    }
    return `${voucher.usedCount}`
  }

  const isExpired = (validTo: string) => {
    return new Date(validTo) < new Date()
  }

  const isActive = (voucher: VoucherSummaryItem) => {
    const now = new Date()
    const validFrom = new Date(voucher.validFrom)
    const validTo = new Date(voucher.validTo)
    return voucher.isActive && now >= validFrom && now <= validTo
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
                  <BreadcrumbPage>Voucher</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-xl font-semibold">Quản lý voucher</h1>
              <Button asChild>
                <Link href="/admin/vouchers/new">Thêm voucher</Link>
              </Button>
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <Input
                placeholder="Tìm kiếm voucher theo mã hoặc tên"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(1)
                }}
                className="md:max-w-sm"
              />
              <div className="flex items-center gap-2">
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
                <Select
                  value={discountTypeFilter}
                  onValueChange={(v) => {
                    setDiscountTypeFilter(v)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại</SelectItem>
                    <SelectItem value="PERCENTAGE">Phần trăm</SelectItem>
                    <SelectItem value="FIXED_AMOUNT">Số tiền cố định</SelectItem>
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
                  <TableHead>Mã</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Giảm giá</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Sử dụng</TableHead>
                  <TableHead>Hiệu lực</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={7}>Đang tải...</TableCell>
                  </TableRow>
                )}
                {!isLoading && items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7}>Không tìm thấy voucher.</TableCell>
                  </TableRow>
                )}
                {!isLoading && items.map((v) => (
                  <TableRow key={v.voucherId}>
                    <TableCell className="font-mono">{v.code}</TableCell>
                    <TableCell>{v.name}</TableCell>
                    <TableCell>{formatDiscountValue(v)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={isActive(v) ? "default" : "secondary"}>
                          {isActive(v) ? "Đang hoạt động" : isExpired(v.validTo) ? "Hết hạn" : "Không hoạt động"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{formatUsage(v)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(v.validFrom).toLocaleDateString()}</div>
                        <div className="text-muted-foreground">đến {new Date(v.validTo).toLocaleDateString()}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/vouchers/${v.voucherId}`}>Xem</Link>
                      </Button>
                      <Button variant="secondary" size="sm" asChild>
                        <Link href={`/admin/vouchers/${v.voucherId}/edit`}>Sửa</Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">Xóa</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xóa voucher?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Hành động này không thể hoàn tác. Thao tác này sẽ xóa vĩnh viễn voucher "{v.code}" - {v.name}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={async () => {
                                try {
                                  setIsLoading(true)
                                  const res = await deleteVoucherById(v.voucherId)
                                  // optimistic refresh: remove from local list if success
                                  if (res.success) {
                                    setItems((prev) => prev.filter((it) => it.voucherId !== v.voucherId))
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
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setPage((p) => Math.max(1, p - 1))
                  }}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === i + 1}
                    onClick={(e) => {
                      e.preventDefault()
                      setPage(i + 1)
                    }}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setPage((p) => Math.min(totalPages, p + 1))
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
