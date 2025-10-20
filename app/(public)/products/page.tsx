"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select"
import { TreeCheckbox } from "@/components/ui/checkbox"
import { ShoppingCart, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { ProductGridSkeleton } from "@/components/ui/loading/product-skeleton"
import { searchProducts, type SearchProductsQuery } from "@/services/productService"
import { getAll as getAllCategories } from "@/services/cartegoryServices"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { formatCurrency } from "../../../utils/format"
import { useAppDispatch } from "@/redux/hooks"
import { addItem as addCartItem } from "@/redux/cartSlice"

export default function ProductsPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const query: SearchProductsQuery = {
          SearchTerm: undefined,
          CategoryId: selectedCategoryIds.length === 0 ? undefined : selectedCategoryIds[0], // For now, use first selected category
          MinPrice: undefined,
          MaxPrice: undefined,
          SortBy: 'CREATED_ON',
          SortDescending: true,
          PageNumber: 1,
          PageSize: 9,
        }
        const res = await searchProducts(query)
        const items = res.data?.items ?? []
        // Map API items to UI-friendly objects
        const mapped = items.map((p) => ({
          id: p.productId,
          name: p.name,
          image: p.imageUrl,
          priceRange: {
            min: p.minPrice,
            max: p.maxPrice,
          },
          // Category is not provided on summary; leave undefined
        }))
        setProducts(mapped)
      } catch (e) {
        setError("Failed to load products.")
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [selectedCategoryIds])

  useEffect(() => {
    const run = async () => {
      try {
        const res = await getAllCategories()
        const cats = res.data ?? []
        setCategories(cats)
      } catch {
        // ignore
      }
    }
    run()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Products</h1>
          <p className="text-muted-foreground">Discover AI-designed clothing and create your own</p>
        </div>

        {/* Main Layout: Filter Sidebar (1/3) + Product List (2/3) */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter Sidebar - 1/3 width */}
          <div className="w-full lg:w-1/3">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Bộ lọc tìm kiếm</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tìm kiếm</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input placeholder="Tìm kiếm sản phẩm..." className="pl-10" />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Danh mục</label>
                  <div className="max-h-64 overflow-y-auto border rounded-md p-2">
                    <TreeCheckbox 
                      data={categories} 
                      onSelectionChange={(selectedIds: string[]) => setSelectedCategoryIds(selectedIds)}
                    />
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mức giá</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="all-price" name="price" value="all" className="rounded" />
                      <label htmlFor="all-price" className="text-sm">Tất cả</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="under-500k" name="price" value="under-500k" className="rounded" />
                      <label htmlFor="under-500k" className="text-sm">Dưới 500.000₫</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="500k-1m" name="price" value="500k-1m" className="rounded" />
                      <label htmlFor="500k-1m" className="text-sm">500.000₫ - 1.000.000₫</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="1m-2m" name="price" value="1m-2m" className="rounded" />
                      <label htmlFor="1m-2m" className="text-sm">1.000.000₫ - 2.000.000₫</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="over-2m" name="price" value="over-2m" className="rounded" />
                      <label htmlFor="over-2m" className="text-sm">Trên 2.000.000₫</label>
                    </div>
                  </div>
                </div>

                {/* Sort Options */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sắp xếp</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sắp xếp theo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Mới nhất</SelectItem>
                      <SelectItem value="price-low">Giá: Thấp đến cao</SelectItem>
                      <SelectItem value="price-high">Giá: Cao đến thấp</SelectItem>
                      <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters */}
                <Button variant="outline" className="w-full">
                  Xóa bộ lọc
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Product List - 2/3 width */}
          <div className="w-full lg:w-2/3">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold">Tìm thấy {products.length} kết quả</h2>
                <p className="text-sm text-muted-foreground">Hiển thị sản phẩm theo bộ lọc của bạn</p>
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <ProductGridSkeleton />
            ) : error ? (
              <div className="text-sm text-destructive">{error}</div>
            ) : products.length === 0 ? (
              <Empty className="border">
                <EmptyHeader>
                  <EmptyTitle>Không tìm thấy sản phẩm</EmptyTitle>
                  <EmptyDescription>Hãy thử điều chỉnh tìm kiếm hoặc bộ lọc của bạn.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card
                    key={product.id}
                    className="overflow-hidden group hover:shadow-lg hover:-translate-y-0.5 hover:ring-1 hover:ring-primary/20 transition-all cursor-pointer"
                    onClick={() => router.push(`/products/${product.id}`)}
                    role="link"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        router.push(`/products/${product.id}`)
                      }
                    }}
                  >
                    <div className="aspect-square relative">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                          {product.priceRange && (
                            <CardDescription>
                              {formatCurrency(product.priceRange.min, 'VND', 'vi-VN')}
                              {product.priceRange.max !== product.priceRange.min && ` - ${formatCurrency(product.priceRange.max, 'VND', 'vi-VN')}`}
                            </CardDescription>
                          )}
                        </div>
                        <div className="text-right">
                          <Button
                            variant="secondary"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/products/${product.id}`)
                            }}
                            aria-label={`Go to ${product.name} details`}
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
