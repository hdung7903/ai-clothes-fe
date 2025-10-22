"use client"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Search, Package, X, CheckCircle } from "lucide-react"
import { searchProducts, type SearchProductsQuery } from "@/services/productService"
import type { ProductSummaryItem } from "@/types/product"
import { formatCurrency } from "@/utils/format"

interface ProductSelectorProps {
  selectedProductIds: string[]
  onSelectionChange: (productIds: string[]) => void
  disabled?: boolean
}

export function ProductSelector({ selectedProductIds, onSelectionChange, disabled }: ProductSelectorProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [products, setProducts] = React.useState<ProductSummaryItem[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const pageSize = 10

  // Load products
  const loadProducts = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const query: SearchProductsQuery = {
        SearchTerm: searchTerm || undefined,
        SortBy: 'NAME',
        SortDescending: false,
        PageNumber: page,
        PageSize: pageSize,
      }
      
      const response = await searchProducts(query)
      if (response.success && response.data) {
        setProducts(response.data.items)
        setTotalPages(response.data.totalPages)
      }
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, page, pageSize])

  React.useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const handleProductToggle = (productId: string) => {
    if (disabled) return
    
    const isSelected = selectedProductIds.includes(productId)
    if (isSelected) {
      onSelectionChange(selectedProductIds.filter(id => id !== productId))
    } else {
      onSelectionChange([...selectedProductIds, productId])
    }
  }

  const handleSelectAll = () => {
    if (disabled) return
    
    const allProductIds = products.map(p => p.productId)
    const allSelected = allProductIds.every(id => selectedProductIds.includes(id))
    
    if (allSelected) {
      // Deselect all visible products
      const remainingIds = selectedProductIds.filter(id => !allProductIds.includes(id))
      onSelectionChange(remainingIds)
    } else {
      // Select all visible products
      const newIds = [...new Set([...selectedProductIds, ...allProductIds])]
      onSelectionChange(newIds)
    }
  }

  const handleClearAll = () => {
    if (disabled) return
    onSelectionChange([])
  }

  const selectedProducts = products.filter(p => selectedProductIds.includes(p.productId))
  const allVisibleSelected = products.length > 0 && products.every(p => selectedProductIds.includes(p.productId))

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setPage(1)
            }}
            disabled={disabled}
            className="pl-10"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSelectAll}
          disabled={disabled || products.length === 0}
        >
          {allVisibleSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClearAll}
          disabled={disabled || selectedProductIds.length === 0}
        >
          <X className="h-4 w-4 mr-1" />
          Xóa tất cả
        </Button>
      </div>

      {/* Selected Products Summary */}
      {selectedProductIds.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Sản phẩm đã chọn ({selectedProductIds.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedProducts.slice(0, 5).map((product) => (
                <Badge key={product.productId} variant="secondary" className="text-xs">
                  {product.name}
                </Badge>
              ))}
              {selectedProducts.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{selectedProducts.length - 5} sản phẩm khác
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Package className="h-4 w-4" />
            Danh sách sản phẩm
          </CardTitle>
          <CardDescription>
            Chọn sản phẩm để áp dụng voucher
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2 text-sm text-muted-foreground">Đang tải...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Không tìm thấy sản phẩm nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => {
                const isSelected = selectedProductIds.includes(product.productId)
                return (
                  <div
                    key={product.productId}
                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                      isSelected ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted/50'
                    }`}
                  >
                    <Checkbox
                      id={product.productId}
                      checked={isSelected}
                      onCheckedChange={() => handleProductToggle(product.productId)}
                      disabled={disabled}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{product.name}</h4>
                          <p className="text-xs text-muted-foreground truncate">{product.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-medium text-green-600">
                              {formatCurrency(product.minPrice, 'VND', 'vi-VN')}
                            </span>
                            {product.minPrice !== product.maxPrice && (
                              <>
                                <span className="text-xs text-muted-foreground">-</span>
                                <span className="text-xs font-medium text-green-600">
                                  {formatCurrency(product.maxPrice, 'VND', 'vi-VN')}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <>
              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Trang {page} / {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || disabled}
                  >
                    Trước
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || disabled}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
