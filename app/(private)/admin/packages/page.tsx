"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Package,
  Calendar,
  User,
  Mail,
  DollarSign,
  Coins,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getTokenPackagePurchaseHistory } from "@/services/paymentServices";
import type { TokenPackagePurchaseHistoryItem } from "@/types/payment";
import { formatCurrency } from "@/utils/format";
import { toast } from "sonner";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function AdminPackagesPage() {
  const [history, setHistory] = useState<TokenPackagePurchaseHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [pageNumber]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const response = await getTokenPackagePurchaseHistory(
        pageNumber,
        pageSize
      );

      if (response.success && response.data) {
        setHistory(response.data.items);
        setTotalPages(response.data.totalPages);
        setTotalCount(response.data.totalCount);
        setHasNextPage(response.data.hasNextPage);
        setHasPreviousPage(response.data.hasPreviousPage);
      } else {
        const errorMsg = response.errors
          ? Object.values(response.errors).flat().join(", ")
          : "Không thể tải lịch sử mua gói";
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Error loading purchase history:", error);
      toast.error("Có lỗi xảy ra khi tải lịch sử mua gói");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
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
                  <BreadcrumbLink href="/admin/dashboard">Admin</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Gói Token</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-8 w-8 text-primary" />
                  <h1 className="text-3xl font-bold tracking-tight">
                    Quản Lý Gói Token
                  </h1>
                </div>
                <p className="text-muted-foreground">
                  Xem lịch sử mua gói token của người dùng
                </p>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tổng Giao Dịch
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading && history.length === 0 ? (
                  <div className="text-2xl font-bold text-muted-foreground">
                    ---
                  </div>
                ) : (
                  <div className="text-2xl font-bold">{totalCount}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tổng Doanh Thu (Trang Hiện Tại)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading && history.length === 0 ? (
                  <div className="text-2xl font-bold text-muted-foreground">
                    ---
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(
                      history.reduce((sum, item) => sum + item.price, 0),
                      "VND",
                      "vi-VN"
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tổng Token (Trang Hiện Tại)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading && history.length === 0 ? (
                  <div className="text-2xl font-bold text-muted-foreground">
                    ---
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-blue-600">
                    {history.reduce((sum, item) => sum + item.tokenAmount, 0)}{" "}
                    tokens
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Purchase History Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lịch Sử Mua Gói</CardTitle>
              <CardDescription>
                Danh sách tất cả giao dịch mua gói token
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Chưa có giao dịch nào
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mã Thanh Toán</TableHead>
                          <TableHead>Người Mua</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead className="text-right">Giá</TableHead>
                          <TableHead className="text-right">Token</TableHead>
                          <TableHead>Thời Gian</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {history.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Badge variant="outline" className="font-mono">
                                {item.paymentCode}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {item.createdByDto.name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {item.createdByDto.email}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <span className="font-semibold text-green-600">
                                  {formatCurrency(item.price, "VND", "vi-VN")}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Coins className="h-4 w-4 text-blue-600" />
                                <span className="font-semibold text-blue-600">
                                  {item.tokenAmount}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {formatDate(item.createdAt)}
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                      <div className="text-sm text-muted-foreground">
                        Trang {pageNumber} / {totalPages} (Tổng {totalCount}{" "}
                        giao dịch)
                      </div>
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                if (hasPreviousPage) setPageNumber((prev) => prev - 1)
                              }}
                              className={!hasPreviousPage || isLoading ? 'pointer-events-none opacity-50' : ''}
                            />
                          </PaginationItem>

                          {/* Show page numbers with smart range */}
                          {Array.from({ length: totalPages }).map((_, i) => {
                            const pageNum = i + 1
                            const isNearCurrent = Math.abs(pageNum - pageNumber) <= 1
                            const isFirst = pageNum === 1
                            const isLast = pageNum === totalPages

                            if (isNearCurrent || isFirst || isLast) {
                              return (
                                <PaginationItem key={pageNum}>
                                  <PaginationLink
                                    href="#"
                                    isActive={pageNumber === pageNum}
                                    onClick={(e) => {
                                      e.preventDefault()
                                      setPageNumber(pageNum)
                                    }}
                                  >
                                    {pageNum}
                                  </PaginationLink>
                                </PaginationItem>
                              )
                            }

                            if (isNearCurrent || i === 0 || i === totalPages - 1) return null
                            if (pageNum === Math.floor(totalPages / 2)) {
                              return (
                                <PaginationItem key="ellipsis">
                                  <span className="px-2">...</span>
                                </PaginationItem>
                              )
                            }

                            return null
                          })}

                          <PaginationItem>
                            <PaginationNext
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                if (hasNextPage) setPageNumber((prev) => prev + 1)
                              }}
                              className={!hasNextPage || isLoading ? 'pointer-events-none opacity-50' : ''}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </>
  );
}
