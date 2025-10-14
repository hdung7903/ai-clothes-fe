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
        if (!ignore) setError("Failed to load product.")
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
                  <BreadcrumbLink href="/admin/dashboard">Admin</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin/products">Products</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{id}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Product Details</h1>
            <Button asChild>
              <Link href={`/admin/products/${id}/edit`}>Edit</Link>
            </Button>
          </div>
          <div className="rounded-xl border bg-background p-4">
            {isLoading && <div>Loading...</div>}
            {!isLoading && error && <div className="text-destructive">{error}</div>}
            {!isLoading && !error && product && (
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
                      No image
                    </div>
                  )}
                </div>
                <div className="md:col-span-2 grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="text-sm text-muted-foreground">Product ID</div>
                      <div className="font-medium break-all">{product.productId}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Name</div>
                      <div className="font-medium">{product.name}</div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-sm text-muted-foreground">Description</div>
                      <div className="font-medium">{product.description}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Base Price</div>
                      <div className="font-medium">{formatCurrency(product.basePrice, 'VND', 'vi-VN')}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Category</div>
                      <div className="font-medium">{product.category?.name}</div>
                    </div>
                  </div>

                  {product.options?.length > 0 && (
                    <div className="grid gap-3">
                      <div className="text-sm text-muted-foreground">Options</div>
                      <div className="grid gap-4">
                        {product.options.map((opt) => (
                          <div key={opt.optionId} className="grid gap-2">
                            <div className="font-medium">{opt.name}</div>
                            {opt.values?.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {opt.values.map((val) => (
                                  <div key={val.optionValueId} className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">{val.value}</span>
                                    {val.images?.length > 0 && (
                                      <div className="flex gap-2">
                                        {val.images.map((img, i) => (
                                          <div key={img + i} className="relative h-10 w-10 overflow-hidden rounded border">
                                            <Image src={img} alt={`${opt.name} ${val.value}`} fill sizes="40px" className="object-cover" />
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
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


