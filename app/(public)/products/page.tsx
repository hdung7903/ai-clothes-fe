"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select"
import { TreeSelect } from 'antd'
import { ShoppingCart, Search, Filter, X, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { ProductGridSkeleton } from "@/components/ui/loading/product-skeleton"
import { searchProducts, type SearchProductsQuery } from "@/services/productService"
import { getAll as getAllCategories } from "@/services/cartegoryServices"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { formatCurrency } from "../../../utils/format"
import { useAppDispatch } from "@/redux/hooks"
import { addItemAsync } from "@/redux/cartSlice"

type PriceRange = 'all' | '200-400' | '400-600' | 'over-600'
type SortOption = 'newest' | 'oldest' | 'price-low' | 'price-high' | 'name-asc' | 'name-desc'

export default function ProductsPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<any[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined)
  const [categories, setCategories] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [searchInput, setSearchInput] = useState<string>("") // For debounced search
  const [priceRange, setPriceRange] = useState<PriceRange>('all')
  const [sortOption, setSortOption] = useState<SortOption>('newest')
  const [pageSize] = useState(9)

  // Convert categories to Ant Design TreeSelect format
  const convertToTreeData = (categories: any[]): any[] => {
    return categories.map(category => ({
      title: category.name,
      value: category.id,
      key: category.id,
      children: category.subCategories && category.subCategories.length > 0 
        ? convertToTreeData(category.subCategories) 
        : undefined
    }))
  }

  // Calculate min/max price based on selected range
  const priceFilter = useMemo(() => {
    switch (priceRange) {
      case '200-400':
        return { min: 200000, max: 400000 }
      case '400-600':
        return { min: 400000, max: 600000 }
      case 'over-600':
        return { min: 600000, max: undefined }
      default:
        return { min: undefined, max: undefined }
    }
  }, [priceRange])

  // Calculate sort parameters
  const sortParams = useMemo(() => {
    switch (sortOption) {
      case 'oldest':
        return { sortBy: 'CREATED_ON' as const, sortDesc: false }
      case 'price-low':
        return { sortBy: 'PRICE' as const, sortDesc: false }
      case 'price-high':
        return { sortBy: 'PRICE' as const, sortDesc: true }
      case 'name-asc':
        return { sortBy: 'NAME' as const, sortDesc: false }
      case 'name-desc':
        return { sortBy: 'NAME' as const, sortDesc: true }
      default: // newest
        return { sortBy: 'CREATED_ON' as const, sortDesc: true }
    }
  }, [sortOption])

    const hasActiveFilters = searchTerm || selectedCategoryId || priceRange !== 'all'

  // Load products function with proper API integration
  const loadProducts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const query: SearchProductsQuery = {
        SearchTerm: searchTerm || undefined,
        CategoryId: selectedCategoryId,
        MinPrice: priceFilter.min,
        MaxPrice: priceFilter.max,
        SortBy: sortParams.sortBy,
        SortDescending: sortParams.sortDesc,
        PageNumber: currentPage,
        PageSize: pageSize,
      }
      
      const res = await searchProducts(query)
      const items = res.data?.items ?? []
      const mapped = items.map((p) => ({
        id: p.productId,
        name: p.name,
        image: p.imageUrl,
        priceRange: {
          min: p.minPrice,
          max: p.maxPrice,
        },
      }))
      setProducts(mapped)
      setTotalPages(res.data?.totalPages ?? 1)
    } catch (e) {
      console.error('Error loading products:', e)
      setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, selectedCategoryId, priceFilter.min, priceFilter.max, sortParams.sortBy, sortParams.sortDesc, currentPage, pageSize])

  // Manual search handler
  const handleSearch = () => {
    setSearchTerm(searchInput)
    setCurrentPage(1) // Reset to first page on search
  }

  // Handle Enter key press
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // Load products when filters change
  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // Load categories on mount
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

  const handleClearFilters = () => {
    setSearchInput("")
    setSearchTerm("")
    setSelectedCategoryId(undefined)
    setPriceRange('all')
    setSortOption('newest')
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Sản Phẩm</h1>
          <p className="text-muted-foreground">Khám phá các sản phẩm thời trang được thiết kế bởi AI và tạo riêng cho bạn</p>
        </div>

        {/* Main Layout: Filter Sidebar (1/3) + Product List (2/3) */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter Sidebar - 1/3 width */}
          <div className="w-full lg:w-1/3">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Bộ lọc tìm kiếm
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tìm kiếm</label>
                  <div className="relative flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input 
                        placeholder="Tìm kiếm sản phẩm..." 
                        className="pl-10 pr-10" 
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        disabled={isLoading}
                      />
                      {searchInput && (
                        <button
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => {
                            setSearchInput("")
                            setSearchTerm("")
                            setCurrentPage(1)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <Button
                      size="icon"
                      onClick={handleSearch}
                      disabled={isLoading}
                      className="flex-shrink-0"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Danh mục</label>
                  <TreeSelect
                    style={{ width: '100%' }}
                    value={selectedCategoryId}
                    onChange={(value) => {
                      setSelectedCategoryId(value)
                      setCurrentPage(1)
                    }}
                    treeData={convertToTreeData(categories)}
                    placeholder="Chọn danh mục"
                    treeDefaultExpandAll={false}
                    disabled={isLoading}
                    allowClear
                  />
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mức giá</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="all-price" 
                        name="price" 
                        value="all" 
                        checked={priceRange === 'all'}
                        onChange={(e) => {
                          setPriceRange(e.target.value as PriceRange)
                          setCurrentPage(1)
                        }}
                        className="rounded" 
                        disabled={isLoading}
                      />
                      <label htmlFor="all-price" className="text-sm cursor-pointer">Tất cả</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="200-400" 
                        name="price" 
                        value="200-400" 
                        checked={priceRange === '200-400'}
                        onChange={(e) => {
                          setPriceRange(e.target.value as PriceRange)
                          setCurrentPage(1)
                        }}
                        className="rounded" 
                        disabled={isLoading}
                      />
                      <label htmlFor="200-400" className="text-sm cursor-pointer">200.000₫ - 400.000₫</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="400-600" 
                        name="price" 
                        value="400-600" 
                        checked={priceRange === '400-600'}
                        onChange={(e) => {
                          setPriceRange(e.target.value as PriceRange)
                          setCurrentPage(1)
                        }}
                        className="rounded" 
                        disabled={isLoading}
                      />
                      <label htmlFor="400-600" className="text-sm cursor-pointer">400.000₫ - 600.000₫</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="over-600" 
                        name="price" 
                        value="over-600" 
                        checked={priceRange === 'over-600'}
                        onChange={(e) => {
                          setPriceRange(e.target.value as PriceRange)
                          setCurrentPage(1)
                        }}
                        className="rounded" 
                        disabled={isLoading}
                      />
                      <label htmlFor="over-600" className="text-sm cursor-pointer">Trên 600.000₫</label>
                    </div>
                  </div>
                </div>

                {/* Sort Options */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sắp xếp</label>
                  <Select 
                    value={sortOption} 
                    onValueChange={(value) => {
                      setSortOption(value as SortOption)
                      setCurrentPage(1)
                    }}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sắp xếp theo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Mới nhất</SelectItem>
                      <SelectItem value="oldest">Cũ nhất</SelectItem>
                      <SelectItem value="price-low">Giá: Thấp đến cao</SelectItem>
                      <SelectItem value="price-high">Giá: Cao đến thấp</SelectItem>
                      <SelectItem value="name-asc">Tên: A-Z</SelectItem>
                      <SelectItem value="name-desc">Tên: Z-A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleClearFilters}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Xóa bộ lọc
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Product List - 2/3 width */}
          <div className="w-full lg:w-2/3">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  {isLoading ? 'Đang tải...' : `Tìm thấy ${products.length} sản phẩm`}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {hasActiveFilters 
                    ? 'Hiển thị sản phẩm theo bộ lọc của bạn' 
                    : 'Hiển thị tất cả sản phẩm'}
                </p>
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <ProductGridSkeleton />
            ) : error ? (
              <Card className="p-6">
                <div className="text-center">
                  <p className="text-destructive mb-4">{error}</p>
                  <Button onClick={loadProducts}>Thử lại</Button>
                </div>
              </Card>
            ) : products.length === 0 ? (
              <Empty className="border">
                <EmptyHeader>
                  <EmptyTitle>Không tìm thấy sản phẩm</EmptyTitle>
                  <EmptyDescription>
                    {hasActiveFilters 
                      ? 'Hãy thử điều chỉnh tìm kiếm hoặc bộ lọc của bạn.' 
                      : 'Hiện tại chưa có sản phẩm nào.'}
                  </EmptyDescription>
                </EmptyHeader>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={handleClearFilters} className="mt-4">
                    <X className="h-4 w-4 mr-2" />
                    Xóa bộ lọc
                  </Button>
                )}
              </Empty>
            ) : (
              <>
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
                      <CardHeader className="p-0">
                        <div className="aspect-square relative">
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </CardHeader>
                      <CardFooter className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">{product.name}</CardTitle>
                          {product.priceRange && (
                            <CardDescription className="mt-1">
                              {formatCurrency(product.priceRange.min, 'VND', 'vi-VN')}
                              {product.priceRange.max !== product.priceRange.min && ` - ${formatCurrency(product.priceRange.max, 'VND', 'vi-VN')}`}
                            </CardDescription>
                          )}
                        </div>
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/products/${product.id}`)
                          }}
                          aria-label={`Xem chi tiết ${product.name}`}
                          className="flex-shrink-0"
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1 || isLoading}
                    >
                      Trang trước
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Trang {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages || isLoading}
                    >
                      Trang sau
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
