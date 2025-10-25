"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { 
  ArrowLeft, 
  Edit, 
  ShoppingCart, 
  Trash2, 
  Calendar, 
  Package, 
  Palette,
  Image as ImageIcon,
  Loader2
} from "lucide-react"
import { getProductDesignById, deleteProductDesignById } from "@/services/productDesignServices"
import { getProductById } from "@/services/productService"
import { addItemByOption } from "@/services/cartServices"
import type { ProductDesignDetail } from "@/types/productDesign"
import type { ProductDetail } from "@/types/product"
import { useAppSelector, useAppDispatch } from "@/redux/hooks"
import { fetchCartItems } from "@/redux/cartSlice"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { formatCurrency } from "@/utils/format"

export default function DesignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated)
  
  const [design, setDesign] = useState<ProductDesignDetail | null>(null)
  const [productDetail, setProductDetail] = useState<ProductDetail | null>(null)
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const designId = params.id as string

  // Prevent hydration mismatch by ensuring component is mounted
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    
    if (!isAuthenticated) {
      router.push(`/auth/login?next=/account/designs/${designId}`)
      return
    }

    const loadDesign = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await getProductDesignById(designId)
        
        if (res.success && res.data) {
          setDesign(res.data)
          
          // Load product details to get available sizes
          const productRes = await getProductById(res.data.productId)
          if (productRes.success && productRes.data) {
            setProductDetail(productRes.data)
            
            // Find size option and set default selected size (only if in stock)
            const sizeOption = productRes.data.options.find(option => 
              option.name.toLowerCase() === 'size' || option.name.toLowerCase() === 'kích thước'
            )
            if (sizeOption && sizeOption.values.length > 0) {
              // Get the color option name and value from the design
              const colorOptionName = res.data.productOptionValueDetail.optionName
              const selectedColor = res.data.productOptionValueDetail.value
              const productData = productRes.data
              
              // Find the first size that has stock for the selected color
              const availableSize = sizeOption.values.find(sizeValue => {
                const variant = productData.variants.find(v => {
                  const variantColor = v.optionValues[colorOptionName]
                  const variantSize = v.optionValues['SIZE'] || v.optionValues['size'] || v.optionValues['Kích thước']
                  return variantColor === selectedColor && variantSize === sizeValue.value
                })
                return variant && variant.stock > 0
              })
              
              // Set the first available size or the first size if none available
              setSelectedSize(availableSize?.optionValueId || sizeOption.values[0].optionValueId)
            }
          }
        } else {
          setError("Không thể tải thông tin thiết kế")
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Unknown error"
        if (errorMessage.includes('Authentication')) {
          setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
          setTimeout(() => {
            router.push(`/auth/login?next=/account/designs/${designId}`)
          }, 2000)
        } else {
          setError("Không thể tải thông tin thiết kế.")
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadDesign()
  }, [isMounted, isAuthenticated, designId, router])

  const handleAddToCart = async () => {
    if (!design || !productDetail || !selectedSize) {
      toast.error("Vui lòng chọn kích thước trước khi thêm vào giỏ hàng")
      return
    }

    setIsAddingToCart(true)
    try {
      // Call the itemByOption API with the required format
      const response = await addItemByOption({
        productId: design.productId,
        productOptionValueIds: [selectedSize, design.productOptionValueId],
        productDesignId: design.id,
        quantity: 1
      })

      if (response.success) {
        toast.success("Đã thêm thiết kế vào giỏ hàng!")
        // Refresh cart items to update cart state
        dispatch(fetchCartItems())
      } else {
        toast.error("Không thể thêm vào giỏ hàng. Vui lòng thử lại.")
      }
    } catch (error) {
      console.error("Add to cart error:", error)
      toast.error("Không thể thêm vào giỏ hàng. Vui lòng thử lại.")
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleEdit = () => {
    if (!design) return
    // Navigate to design editor with this design
    router.push(`/design?productId=${design.productId}&designId=${design.id}`)
  }

  const handleDelete = async () => {
    if (!design) return

    setIsDeleting(true)
    try {
      const res = await deleteProductDesignById(design.id)
      
      if (res.success) {
        toast.success("Đã xóa thiết kế thành công!")
        router.push("/account/designs")
      } else {
        toast.error("Không thể xóa thiết kế. Vui lòng thử lại.")
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Không thể xóa thiết kế. Vui lòng thử lại.")
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!isMounted) return dateString // Return raw string during SSR to prevent hydration mismatch
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Prevent rendering until component is mounted to avoid hydration mismatch
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !design) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="text-center py-12">
              <Palette className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">
                {error || "Không tìm thấy thiết kế"}
              </h2>
              <p className="text-muted-foreground mb-6">
                Thiết kế này có thể đã bị xóa hoặc bạn không có quyền truy cập.
              </p>
              <Link href="/account/designs">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quay lại danh sách
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link href="/account/designs">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại danh sách thiết kế
              </Button>
            </Link>
            
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{design.name}</h1>
                <p className="text-muted-foreground">
                  Thiết kế cho sản phẩm: {design.product.name}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    Thông tin sản phẩm
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <img
                      src={design.product.imageUrl || "/placeholder.svg"}
                      alt={design.product.name}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {design.product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {design.product.description}
                      </p>
                      <Badge variant="secondary">
                        {design.productOptionValueDetail.optionName}: {design.productOptionValueDetail.value}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Design Templates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Palette className="mr-2 h-5 w-5" />
                    Thiết kế ({design.templates.length} vùng in)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {design.templates.length === 0 ? (
                    <p className="text-muted-foreground text-center py-6">
                      Chưa có thiết kế nào được áp dụng
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {design.templates.map((template) => (
                        <div key={template.templateId} className="relative group">
                          <div className="border rounded-lg overflow-hidden">
                            <img
                              src={template.designImageUrl}
                              alt={template.printAreaName}
                              className="w-full h-48 object-contain bg-gray-50"
                            />
                          </div>
                          <div className="mt-2">
                            <p className="font-medium">{template.printAreaName}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Icons Used */}
              {design.icons.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ImageIcon className="mr-2 h-5 w-5" />
                      Biểu tượng đã sử dụng ({design.icons.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                      {design.icons.map((icon, index) => (
                        <div key={icon.id} className="relative group">
                          <div className="border rounded-lg p-2 bg-white hover:shadow-md transition-shadow">
                            <img
                              src={icon.imageUrl}
                              alt={`Icon ${index + 1}`}
                              className="w-full h-16 object-contain"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Design Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin thiết kế</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center text-sm text-muted-foreground mb-1">
                      <Calendar className="mr-2 h-4 w-4" />
                      Ngày tạo
                    </div>
                    <p className="text-sm font-medium" suppressHydrationWarning>
                      {formatDate(design.createdAt)}
                    </p>
                  </div>
                  

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Trạng thái</p>
                    <Badge variant="default">Đã lưu</Badge>
                  </div>


                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Hành động</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Size Selection */}
                  {productDetail && (
                    <>
                      {(() => {
                        const sizeOption = productDetail.options.find(option => 
                          option.name.toLowerCase() === 'size' || option.name.toLowerCase() === 'kích thước'
                        )
                        
                        if (!sizeOption || sizeOption.values.length === 0) {
                          return null
                        }
                        
                        // Get the color option name from the design
                        const colorOptionName = design?.productOptionValueDetail.optionName || 'COLOR'
                        const selectedColor = design?.productOptionValueDetail.value
                        
                        // Function to check if a size has stock for the selected color
                        const isSizeAvailable = (sizeValueId: string) => {
                          const sizeValue = sizeOption.values.find(v => v.optionValueId === sizeValueId)?.value
                          
                          // Find variant that matches both the color and size
                          const variant = productDetail.variants.find(v => {
                            const variantColor = v.optionValues[colorOptionName]
                            const variantSize = v.optionValues['SIZE'] || v.optionValues['size'] || v.optionValues['Kích thước']
                            return variantColor === selectedColor && variantSize === sizeValue
                          })
                          
                          return variant ? variant.stock > 0 : false
                        }
                        
                        return (
                          <div>
                            <Label className="text-sm font-medium mb-3 block">
                              Chọn kích thước
                            </Label>
                            <RadioGroup
                              value={selectedSize || ""}
                              onValueChange={setSelectedSize}
                              className="grid grid-cols-2 gap-2"
                            >
                              {sizeOption.values.map((sizeValue) => {
                                const isAvailable = isSizeAvailable(sizeValue.optionValueId)
                                
                                return (
                                  <div key={sizeValue.optionValueId} className="flex items-center space-x-2">
                                    <RadioGroupItem
                                      value={sizeValue.optionValueId}
                                      id={sizeValue.optionValueId}
                                      disabled={!isAvailable}
                                    />
                                    <Label
                                      htmlFor={sizeValue.optionValueId}
                                      className={`text-sm ${isAvailable ? 'cursor-pointer' : 'cursor-not-allowed text-muted-foreground'}`}
                                    >
                                      {sizeValue.value}
                                      {!isAvailable && (
                                        <span className="text-xs ml-1">(Hết hàng)</span>
                                      )}
                                    </Label>
                                  </div>
                                )
                              })}
                            </RadioGroup>
                          </div>
                        )
                      })()}
                      <Separator />
                    </>
                  )}
                  
                  <Button 
                    className="w-full" 
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || !selectedSize}
                  >
                    {isAddingToCart ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang thêm...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Thêm vào giỏ hàng
                      </>
                    )}
                  </Button>                 
                  
                  <Link href={`/products/${design.productId}`} className="block">
                    <Button className="w-full" variant="outline">
                      <Package className="mr-2 h-4 w-4" />
                      Xem sản phẩm
                    </Button>
                  </Link>

                  <Separator className="my-4" />
                  
                  <Button 
                    className="w-full" 
                    variant="destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa thiết kế
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa thiết kế</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa thiết kế "{design.name}" không? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
