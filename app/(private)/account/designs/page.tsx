"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Palette, ShoppingCart, Trash2, Search, Plus } from "lucide-react"
import { searchProductDesigns } from "@/services/productDesignServices"
import { addItem } from "@/services/cartServices"
import type { ProductDesignSummaryItem } from "@/types/productDesign"
import type { AddCartItemRequest } from "@/types/cart"
import { useAppSelector } from "@/redux/hooks"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function SavedDesignsPage() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [designs, setDesigns] = useState<ProductDesignSummaryItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize] = useState(12)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  
  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [designToDelete, setDesignToDelete] = useState<string | null>(null)
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const [errorDialogOpen, setErrorDialogOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login?next=/account/designs")
      return
    }
    
    const loadDesigns = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await searchProductDesigns({
          PageNumber: pageNumber,
          PageSize: pageSize,
          SearchTerm: searchTerm || undefined
        })
        
        if (res.success && res.data) {
          setDesigns(res.data.items)
          setTotalPages(res.data.totalPages)
          setTotalCount(res.data.totalCount)
        } else {
          setError("Không thể tải danh sách thiết kế")
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Unknown error"
        if (errorMessage.includes('AUTHENTICATION_REQUIRED')) {
          setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
          setTimeout(() => {
            router.push('/auth/login?next=/account/designs')
          }, 2000)
        } else {
          setError("Không thể tải danh sách thiết kế.")
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    loadDesigns()
  }, [isAuthenticated, pageNumber, pageSize, searchTerm, router])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPageNumber(1) // Reset to first page when searching
  }

  const handleDeleteDesign = (designId: string) => {
    setDesignToDelete(designId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!designToDelete) return
    
    try {
      // TODO: Implement delete functionality
      console.log("Delete design:", designToDelete)
      toast.success("Đã xóa thiết kế thành công!")
      setDeleteDialogOpen(false)
      setDesignToDelete(null)
      // After successful deletion, reload the list
      setPageNumber(1)
    } catch (error) {
      console.error("Error deleting design:", error)
      setErrorMessage("Không thể xóa thiết kế. Vui lòng thử lại.")
      setErrorDialogOpen(true)
      setDeleteDialogOpen(false)
    }
  }

  const handleAddToCart = async (design: ProductDesignSummaryItem) => {
    try {
      // Check if design has templates
      if (design.templates.length === 0) {
        setErrorMessage("Thiết kế này chưa có template nào để thêm vào giỏ hàng.")
        setErrorDialogOpen(true)
        return
      }

      // For now, we'll use the productOptionValueId as productVariantId
      // In a real scenario, you might need to fetch product details to get the correct variant ID
      // or show a modal to let user select specific variant
      const cartItem: AddCartItemRequest = {
        productVariantId: design.productOptionValueId, // Using productOptionValueId as variant ID
        productDesignId: design.id,
        quantity: 1
      }

      const response = await addItem(cartItem)
      
      if (response.success) {
        toast.success("Đã thêm thiết kế vào giỏ hàng thành công!")
      } else {
        setErrorMessage("Không thể thêm thiết kế vào giỏ hàng. Vui lòng thử lại.")
        setErrorDialogOpen(true)
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      setErrorMessage("Có lỗi xảy ra khi thêm vào giỏ hàng. Vui lòng thử lại.")
      setErrorDialogOpen(true)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const canPrev = pageNumber > 1
  const canNext = pageNumber < totalPages

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Link href="/account" className="text-primary hover:underline mb-4 inline-block">
              ← Quay lại tài khoản
            </Link>
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Thiết Kế Của Tôi</h1>
                <p className="text-muted-foreground">
                  Quản lý các thiết kế đã tạo và lưu ({totalCount} thiết kế)
                </p>
              </div>
              <Link href="/design">
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Tạo Thiết Kế Mới
                </Button>
              </Link>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm thiết kế..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" variant="outline">
                Tìm Kiếm
              </Button>
            </form>
          </div>

          {!isAuthenticated ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">Vui lòng đăng nhập để xem thiết kế của bạn.</div>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="aspect-square bg-muted" />
                  <CardHeader>
                    <div className="h-4 w-3/4 bg-muted rounded mb-2" />
                    <div className="h-3 w-1/2 bg-muted rounded" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 w-full bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-destructive">{error}</div>
            </div>
          ) : designs.length === 0 ? (
            <div className="text-center py-12">
              <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chưa có thiết kế nào</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Không tìm thấy thiết kế phù hợp với từ khóa tìm kiếm." : "Bạn chưa tạo thiết kế nào. Hãy bắt đầu tạo thiết kế đầu tiên!"}
              </p>
              <Link href="/design">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo Thiết Kế Đầu Tiên
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {designs.map((design) => (
                  <Card key={design.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <Link href={`/account/designs/${design.id}`}>
                      <div className="aspect-square relative bg-muted cursor-pointer">
                        {design.icons.length > 0 ? (
                          <img
                            src={design.icons[0].imageUrl}
                            alt={design.name}
                            className="w-full h-full object-cover"
                          />
                        ) : design.templates.length > 0 ? (
                          <img
                            src={design.templates[0].designImageUrl}
                            alt={design.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Palette className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                        <Badge className="absolute top-2 right-2" variant="secondary">
                          {design.templates.length} template{design.templates.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </Link>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Palette className="h-4 w-4" />
                        {design.name}
                      </CardTitle>
                      <CardDescription>
                        <div className="space-y-1">
                          <div>{design.productName} - {design.productOptionValue}</div>
                          <div className="text-xs">Tạo: {formatDate(design.createdAt)}</div>
                          {design.lastModifiedAt !== design.createdAt && (
                            <div className="text-xs">Sửa: {formatDate(design.lastModifiedAt)}</div>
                          )}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Link href={`/account/designs/${design.id}`} className="flex-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="w-full"
                          >
                            Xem chi tiết
                          </Button>
                        </Link>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleAddToCart(design)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Thêm vào giỏ
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteDesign(design.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-6">
                  <Button 
                    variant="outline" 
                    disabled={!canPrev} 
                    onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                  >
                    Trang trước
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Trang {pageNumber}/{totalPages} ({totalCount} thiết kế)
                  </div>
                  <Button 
                    variant="outline" 
                    disabled={!canNext} 
                    onClick={() => setPageNumber((p) => p + 1)}
                  >
                    Trang tiếp
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa thiết kế</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa thiết kế này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setDesignToDelete(null)
              }}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lỗi</DialogTitle>
            <DialogDescription>{errorMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setErrorDialogOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
