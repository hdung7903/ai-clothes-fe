"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProductGridSkeleton } from "@/components/ui/loading/product-skeleton"
import { searchProducts, type SearchProductsQuery } from "@/services/productService"
import { formatCurrency } from "@/utils/format"

interface UiProduct {
  id: string
  name: string
  image: string
  priceRange?: { min: number; max: number }
}

export function FeaturedProductsSection() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<UiProduct[]>([])

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const query: SearchProductsQuery = {
          SearchTerm: undefined,
          CategoryId: undefined,
          MinPrice: undefined,
          MaxPrice: undefined,
          SortBy: 'CREATED_ON',
          SortDescending: true,
          PageNumber: 1,
          PageSize: 6,
        }
        const res = await searchProducts(query)
        const items = res.data?.items ?? []
        // Map API items to UI-friendly objects (same as products page)
        const mapped: UiProduct[] = items.map((p) => ({
          id: p.productId,
          name: p.name,
          image: p.imageUrl,
          priceRange: {
            min: p.minPrice,
            max: p.maxPrice,
          },
        }))
        setProducts(mapped)
      } catch {
        setError("Không thể tải sản phẩm nổi bật.")
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-wide antialiased font-[family-name:var(--font-playfair)]">Sản phẩm nổi bật</h2>
          <p className="text-muted-foreground">Những thiết kế mới nhất từ studio TEECRAFT của chúng tôi</p>
        </div>
        <Link href="/products" className="text-sm font-medium underline underline-offset-4">Xem tất cả</Link>
      </div>

      {isLoading ? (
        <ProductGridSkeleton />
      ) : error ? (
        <div className="text-sm text-destructive">{error}</div>
      ) : products.length === 0 ? (
        <div className="text-sm text-muted-foreground">Chưa có sản phẩm nào. Hãy quay lại sau!</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden group">
              <CardHeader className="p-0">
                <div className="aspect-square relative bg-muted">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                {product.priceRange && (
                  <CardDescription className="mt-1">
                    {formatCurrency(product.priceRange.min, 'VND', 'vi-VN')}
                    {product.priceRange.max !== product.priceRange.min &&
                      ` - ${formatCurrency(product.priceRange.max ,'VND', 'vi-VN')}`}
                  </CardDescription>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <div className="flex gap-3 w-full">
                  <Link href={`/products/${product.id}`} className="flex-1">
                    <Button className="w-full bg-green-600 hover:bg-green-700">Xem chi tiết</Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}


