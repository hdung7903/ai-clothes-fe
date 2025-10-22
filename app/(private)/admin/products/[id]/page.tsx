"use client"
import Link from "next/link"
import Image from "next/image"
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import * as React from "react"
import { getProductById } from "@/services/productService"
import type { ProductDetail } from "@/types/product"
import { formatCurrency } from "@/utils/format"

type PageProps = { params: any }

export default function Page({ params }: PageProps) {
  // Next.js: params is a Promise in client components; unwrap with React.use()
  const { id } = React.use(params) as { id: string }
  if (!id) notFound()

  const [product, setProduct] = React.useState<ProductDetail | null>(null)
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let ignore = false
    const run = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await getProductById(id)
        if (!ignore) {
          setProduct(res.data ?? null)
        }
      } catch (e) {
        if (!ignore) setError("Không thể tải thông tin sản phẩm.")
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }
    run()
    return () => { ignore = true }
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
                  <BreadcrumbLink href="/admin/dashboard">Quản trị</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin/products">Sản phẩm</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{product?.name || id}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Chi tiết sản phẩm</h1>
            <div className="flex gap-2">
              <Button asChild>
                <Link href={`/admin/products/${id}/edit`}>Chỉnh sửa</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/products">Quay lại</Link>
              </Button>
            </div>
          </div>
          {isLoading && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">Đang tải...</div>
              </CardContent>
            </Card>
          )}
          {!isLoading && error && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-destructive">{error}</div>
              </CardContent>
            </Card>
          )}
          {!isLoading && !error && product && (
            <div className="grid gap-6">
              {/* Thông tin cơ bản */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin cơ bản</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-1">
                      {product.imageUrl ? (
                        <div className="relative aspect-square overflow-hidden rounded-md border bg-muted">
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover"
                            priority
                          />
                        </div>
                      ) : (
                        <div className="flex aspect-square items-center justify-center rounded-md border text-sm text-muted-foreground">
                          Không có hình ảnh
                        </div>
                      )}
                    </div>
                    <div className="md:col-span-2 grid gap-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <div className="text-sm text-muted-foreground">Mã sản phẩm</div>
                          <div className="font-medium break-all font-mono text-sm">{product.productId}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Tên sản phẩm</div>
                          <div className="font-medium">{product.name}</div>
                        </div>
                        <div className="md:col-span-2">
                          <div className="text-sm text-muted-foreground">Mô tả</div>
                          <div className="font-medium">{product.description || "Không có mô tả"}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Giá cơ bản</div>
                          <div className="font-medium text-lg text-green-600">{formatCurrency(product.basePrice, 'VND', 'vi-VN')}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Danh mục</div>
                          <div className="font-medium">{product.category?.name || "Chưa phân loại"}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tùy chọn sản phẩm */}
              {product.options?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Tùy chọn sản phẩm ({product.options.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {product.options.map((option) => (
                        <div key={option.optionId} className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline" className="text-sm font-medium">
                              {option.name}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {option.values?.length || 0} giá trị
                            </span>
                          </div>
                          {option.values?.length > 0 && (
                            <div className="grid gap-3">
                              {option.values.map((value) => (
                                <div key={value.optionValueId} className="flex items-center gap-3">
                                  <Badge variant="secondary">{value.value}</Badge>
                                  {value.images?.length > 0 && (
                                    <div className="flex gap-2">
                                      {value.images.map((img, i) => (
                                        <div key={img + i} className="relative h-12 w-12 overflow-hidden rounded border">
                                          <Image 
                                            src={img} 
                                            alt={`${option.name} ${value.value}`} 
                                            fill 
                                            sizes="48px" 
                                            className="object-cover" 
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Biến thể sản phẩm */}
              {product.variants?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Biến thể sản phẩm ({product.variants.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {product.variants.map((variant) => (
                        <div key={variant.variantId} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="font-mono">
                                {variant.sku}
                              </Badge>
                              <div className="text-lg font-semibold text-green-600">
                                {formatCurrency(variant.price, 'VND', 'vi-VN')}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Tồn kho: <span className="font-medium">{variant.stock}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(variant.optionValues).map(([optionName, optionValue]) => (
                              <div key={optionName} className="flex items-center gap-1">
                                <Badge variant="secondary" className="text-xs">
                                  {optionName}: {optionValue}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


