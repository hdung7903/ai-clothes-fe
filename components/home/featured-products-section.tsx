"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProductGridSkeleton } from "@/components/ui/loading/product-skeleton"
// import { searchProducts, type SearchProductsQuery } from "@/services/productService" // [Commented] Switched to Platzi Fake Store API
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
        // [Commented] Previous internal API approach
        // const query: SearchProductsQuery = {
        //   SearchTerm: undefined,
        //   CategoryId: undefined,
        //   MinPrice: undefined,
        //   MaxPrice: undefined,
        //   SortBy: 'CREATED_ON',
        //   SortDescending: true,
        //   PageNumber: 1,
        //   PageSize: 6,
        // }
        // const res = await searchProducts(query)
        // const items = res.data?.items ?? []
        // const mapped: UiProduct[] = items.map((p) => ({
        //   id: p.productId,
        //   name: p.name,
        //   image: p.imageUrl,
        //   priceRange: { min: p.minPrice, max: p.maxPrice },
        // }))
        // setProducts(mapped)

        // New: Fetch from Platzi Fake Store API
        // Docs: https://fakeapi.platzi.com/en/rest/products/ (endpoint base https://api.escuelajs.co/api/v1)
        const response = await fetch("https://api.escuelajs.co/api/v1/products?offset=0&limit=6", { cache: "no-store" })
        if (!response.ok) throw new Error("Failed to load products")
        const data: Array<{ id: number; title: string; price: number; images: string[] }> = await response.json()
        const mappedFromPlatzi: UiProduct[] = (data || []).map((p) => ({
          id: String(p.id),
          name: p.title,
          image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : "",
          priceRange: { min: p.price, max: p.price },
        }))
        setProducts(mappedFromPlatzi)
      } catch {
        setError("Failed to load featured products.")
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
          <h2 className="text-2xl md:text-3xl font-bold">Featured Products</h2>
          <p className="text-muted-foreground">Fresh drops from our TEECRAFT studio</p>
        </div>
        <Link href="/products" className="text-sm font-medium underline underline-offset-4">View all</Link>
      </div>

      {isLoading ? (
        <ProductGridSkeleton />
      ) : error ? (
        <div className="text-sm text-destructive">{error}</div>
      ) : products.length === 0 ? (
        <div className="text-sm text-muted-foreground">No products yet. Check back soon!</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden group">
              <div className="aspect-square relative bg-muted">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                {product.priceRange && (
                  <CardDescription>
                    {formatCurrency(product.priceRange.min, 'VND', 'vi-VN')}
                    {product.priceRange.max !== product.priceRange.min &&
                      ` - ${formatCurrency(product.priceRange.max ,'VND', 'vi-VN')}`}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Link href={`/products/${product.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">View details</Button>
                  </Link>
                  <Link href="/cart">
                    <Button>Add</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}


