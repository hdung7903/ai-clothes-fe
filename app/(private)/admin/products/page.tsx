"use client";
import Link from "next/link";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Palette,
  Trash2,
  Package,
  DollarSign,
  User,
  LayoutTemplate,
} from "lucide-react";
import * as React from "react";
import {
  searchProducts,
  type SearchProductsQuery,
  deleteProductById,
} from "@/services/productService";
import { getTemplatesByProduct } from "@/services/templateServices";
import type { ProductSummaryItem } from "@/types/product";
import type { TemplateSummaryItem } from "@/types/template";
import { formatCurrency } from "../../../../utils/format";

export default function Page() {
  const [query, setQuery] = React.useState("");
  const [pageSize, setPageSize] = React.useState(5);
  const [page, setPage] = React.useState(1);
  const [items, setItems] = React.useState<ProductSummaryItem[]>([]);
  const [totalPages, setTotalPages] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [productTemplates, setProductTemplates] = React.useState<
    Record<string, TemplateSummaryItem[]>
  >({});

  const currentPage = Math.min(page, totalPages);

  React.useEffect(() => {
    let ignore = false;
    const run = async () => {
      setIsLoading(true);
      try {
        const payload: SearchProductsQuery = {
          SearchTerm: query || undefined,
          SortBy: "CREATED_ON",
          SortDescending: true,
          PageNumber: currentPage,
          PageSize: pageSize,
        };
        const res = await searchProducts(payload);
        if (!ignore) {
          setItems(res.data?.items ?? []);
          setTotalPages(res.data?.totalPages || 1);

          // Load templates for each product
          const templates: Record<string, TemplateSummaryItem[]> = {};
          for (const product of res.data?.items ?? []) {
            try {
              const templateRes = await getTemplatesByProduct(
                product.productId
              );
              if (templateRes.success) {
                templates[product.productId] = templateRes.data ?? [];
              }
            } catch (error) {
              console.error(
                `Failed to load templates for product ${product.productId}:`,
                error
              );
              templates[product.productId] = [];
            }
          }
          setProductTemplates(templates);
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };
    run();
    return () => {
      ignore = true;
    };
  }, [query, currentPage, pageSize]);

  // Helper function to get template URL
  const getTemplateUrl = (productId: string) => {
    const templates = productTemplates[productId] || [];
    if (templates.length > 0) {
      // If templates exist, go to edit the first template
      return `/admin/templates/${templates[0].id}/edit`;
    } else {
      // If no templates, go to create new template
      return `/admin/templates/new?productId=${productId}`;
    }
  };

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
                  <BreadcrumbLink href="/admin/dashboard">
                    Quản trị
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Sản phẩm</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
          {/* Header Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">
                  Quản lý sản phẩm
                </h1>
                <p className="text-muted-foreground">
                  Quản lý và theo dõi tất cả sản phẩm trong hệ thống
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild size="lg" className="shadow-lg">
                  <Link
                    href="/admin/products/new"
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Thêm sản phẩm
                  </Link>
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tổng sản phẩm
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{items.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Sản phẩm hiện có
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Trạng thái
                  </CardTitle>
                  <Badge variant="secondary" className="h-6">
                    {isLoading ? "Đang tải..." : "Hoạt động"}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">✓</div>
                  <p className="text-xs text-muted-foreground">
                    Hệ thống hoạt động
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Tìm kiếm và lọc
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm sản phẩm theo tên"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setPage(1);
                      }}
                      className="pl-10 md:max-w-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Hiển thị:
                    </span>
                    <Select
                      value={String(pageSize)}
                      onValueChange={(v) => {
                        setPageSize(Number(v));
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 dòng</SelectItem>
                        <SelectItem value="10">10 dòng</SelectItem>
                        <SelectItem value="20">20 dòng</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Danh sách sản phẩm
              </CardTitle>
              <CardDescription>
                Quản lý và chỉnh sửa thông tin sản phẩm
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Sản phẩm</TableHead>
                      <TableHead className="font-semibold">Giá</TableHead>
                      <TableHead className="font-semibold">Người tạo</TableHead>
                      <TableHead className="text-right font-semibold">
                        Thao tác
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            Đang tải dữ liệu...
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {!isLoading && items.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Package className="h-8 w-8" />
                            <p>Không tìm thấy sản phẩm nào</p>
                            <p className="text-sm">
                              Hãy thử thay đổi từ khóa tìm kiếm
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {!isLoading &&
                      items.map((p) => (
                        <TableRow
                          key={p.productId}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{p.name}</div>
                              <div className="text-sm text-muted-foreground">
                                ID: {p.productId}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium text-green-600">
                                {formatCurrency(p.minPrice, "VND", "vi-VN")} -{" "}
                                {formatCurrency(p.maxPrice, "VND", "vi-VN")}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Khoảng giá
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {p.createdBy?.name || "Không xác định"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="h-8"
                              >
                                <Link
                                  href={`/admin/products/${p.productId}`}
                                  className="flex items-center gap-1"
                                >
                                  <Eye className="h-3 w-3" />
                                  Xem
                                </Link>
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                asChild
                                className="h-8"
                              >
                                <Link
                                  href={`/admin/products/${p.productId}/edit`}
                                  className="flex items-center gap-1"
                                >
                                  <Edit className="h-3 w-3" />
                                  Sửa
                                </Link>
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                asChild
                                className="h-8"
                              >
                                <Link
                                  href={getTemplateUrl(p.productId)}
                                  className="flex items-center gap-1"
                                >
                                  <Palette className="h-3 w-3" />
                                  {(productTemplates[p.productId] || [])
                                    .length > 0
                                    ? "Sửa mẫu"
                                    : "Tạo mẫu"}
                                </Link>
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="h-8"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2">
                                      <Trash2 className="h-5 w-5 text-destructive" />
                                      Xóa sản phẩm?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Hành động này không thể hoàn tác. Sản phẩm{" "}
                                      <strong>"{p.name}"</strong> sẽ bị xóa vĩnh
                                      viễn khỏi hệ thống.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Hủy bỏ
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={async () => {
                                        try {
                                          setIsLoading(true);
                                          const res = await deleteProductById(
                                            p.productId
                                          );
                                          if (res.data) {
                                            setItems((prev) =>
                                              prev.filter(
                                                (it) =>
                                                  it.productId !== p.productId
                                              )
                                            );
                                          }
                                        } finally {
                                          setIsLoading(false);
                                        }
                                      }}
                                      className="bg-destructive hover:bg-destructive/90"
                                    >
                                      Xóa sản phẩm
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
            </CardContent>
          </Card>
          {/* Pagination */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Hiển thị {items.length} sản phẩm trên trang {currentPage} /{" "}
                  {totalPages}
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage((p) => Math.max(1, p - 1));
                        }}
                        className={
                          currentPage <= 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          href="#"
                          isActive={currentPage === i + 1}
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(i + 1);
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
                          e.preventDefault();
                          setPage((p) => Math.min(totalPages, p + 1));
                        }}
                        className={
                          currentPage >= totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
