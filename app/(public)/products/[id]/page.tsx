"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { ShoppingCart, Share, Star, Minus, Plus, ZoomIn, User, Clock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState, use, useCallback, useMemo } from "react"
import { getProductById } from "@/services/productService"
import { formatCurrency } from "../../../../utils/format"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { addItemSmart } from "@/redux/cartSlice"
import { toast } from "sonner"
import { LoginRequiredPopover } from "@/components/ui/login-required-popover"

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const dispatch = useAppDispatch()
  const router = useRouter()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [product, setProduct] = useState<{
    id: string
    name: string
    price: number
    description: string
    images: string[]
    sizes: string[]
    colors: string[]
    features: string[]
    category?: string
    variants: { variantId: string; price: number; stock: number; optionValues: Record<string, string> }[]
  } | null>(null)

  // Mock feedback data - in a real app, this would come from an API
  const [feedback] = useState([
    {
      id: "1",
      user: "Nguyễn Thị Lan",
      comment: "Thiết kế này thật tuyệt vời! Chất lượng rất tốt và vừa vặn hoàn hảo. Rất khuyến khích!",
      rating: 5,
      timestamp: "2024-01-15T10:30:00Z"
    },
    {
      id: "2", 
      user: "Trần Văn Minh",
      comment: "Sản phẩm tuyệt vời, giao hàng nhanh. Chất liệu cảm giác cao cấp và thiết kế đúng như hình ảnh.",
      rating: 5,
      timestamp: "2024-01-12T14:22:00Z"
    },
    {
      id: "3",
      user: "Lê Thị Hoa",
      comment: "Chất lượng tổng thể tốt, mặc dù kích thước hơi nhỏ một chút. Nên đặt size lớn hơn một size.",
      rating: 4,
      timestamp: "2024-01-10T09:15:00Z"
    },
    {
      id: "4",
      user: "Phạm Đức Anh",
      comment: "Dịch vụ khách hàng xuất sắc và sản phẩm vượt quá mong đợi của tôi. Chắc chắn sẽ đặt hàng lại!",
      rating: 5,
      timestamp: "2024-01-08T16:45:00Z"
    }
  ])

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await getProductById(id)
        const d = res.data
        if (!d) throw new Error("No product")
        // Map API detail to UI shape
        const allSizes = d.options
          .find((o) => o.name.toLowerCase() === "size")?.values.map((v) => v.value) ?? []
        const allColors = d.options
          .find((o) => o.name.toLowerCase() === "color")?.values.map((v) => v.value) ?? []
        const primaryImage = d.imageUrl
        const variantImages = d.options.flatMap((o) => o.values.flatMap((v) => v.images))
        setProduct({
          id: d.productId,
          name: d.name,
          price: d.basePrice,
          description: d.description,
          images: [primaryImage, ...variantImages].filter(Boolean),
          sizes: allSizes,
          colors: allColors,
          features: [],
          category: d.category?.name,
          variants: d.variants.map(v => ({
            variantId: v.variantId,
            price: v.price,
            stock: v.stock,
            optionValues: v.optionValues,
          })),
        })
      } catch (e) {
        setError("Không thể tải thông tin sản phẩm.")
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [id])

  // Auto-transition effect for carousel
  useEffect(() => {
    if (!product || product.images.length <= 1) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
    }, 4000) // Change image every 4 seconds

    return () => clearInterval(interval)
  }, [product])

  // Share functionality
  const handleShare = useCallback(async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Đã sao chép liên kết sản phẩm!")
    } catch (err) {
      toast.error("Không thể sao chép liên kết")
    }
  }, [])

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleAddToCart = async () => {
    if (!product || !selectedSize || !selectedColor) return

    try {
      const matchedVariant = product.variants.find(
        (v) => v.optionValues["SIZE"] === selectedSize && v.optionValues["COLOR"] === selectedColor
      )
      if (!matchedVariant) {
        toast.error("Vui lòng chọn đúng phân loại (Size/Color) có sẵn")
        return
      }
      if (!matchedVariant.stock || matchedVariant.stock <= 0) {
        toast.error("Phiên bản sản phẩm này đã hết hàng")
        return
      }
      if (quantity > matchedVariant.stock) {
        toast.error(`Chỉ còn lại ${matchedVariant.stock} sản phẩm cho lựa chọn này`)
        return
      }
      const cartItem = {
        id: matchedVariant.variantId,
        name: product.name,
        price: matchedVariant.price,
        quantity: quantity,
        size: selectedSize,
        color: selectedColor,
        image: product.images[0],
      }

      // Add to cart (handles both local and server sync automatically)
      dispatch(addItemSmart(cartItem))

      toast.success("Đã thêm sản phẩm vào giỏ hàng!")
    } catch (error) {
      console.error('Failed to add item to cart:', error)
      toast.error("Không thể thêm sản phẩm vào giỏ hàng")
    }
  }

  const handleBuyNow = async () => {
    if (!product || !selectedSize || !selectedColor || quantity <= 0) return

    try {
      const matchedVariant = product.variants.find(
        (v) => v.optionValues["SIZE"] === selectedSize && v.optionValues["COLOR"] === selectedColor
      )
      if (!matchedVariant) {
        toast.error("Vui lòng chọn đúng phân loại (Size/Color) có sẵn")
        return
      }
      if (!matchedVariant.stock || matchedVariant.stock <= 0) {
        toast.error("Phiên bản sản phẩm này đã hết hàng")
        return
      }
      if (quantity > matchedVariant.stock) {
        toast.error(`Chỉ còn lại ${matchedVariant.stock} sản phẩm cho lựa chọn này`)
        return
      }
      const cartItem = {
        id: matchedVariant.variantId,
        name: product.name,
        price: matchedVariant.price,
        quantity: quantity,
        size: selectedSize,
        color: selectedColor,
        image: product.images[0],
      }

      // Add to cart (handles both local and server sync automatically)
      dispatch(addItemSmart(cartItem))

      router.push('/checkout')
    } catch (error) {
      console.error('Failed to add item to cart:', error)
      toast.error("Không thể thêm sản phẩm vào giỏ hàng")
    }
  }

  const selectedVariant = useMemo(() => {
    if (!product || !selectedSize || !selectedColor) return undefined
    return product.variants.find(
      (v) => v.optionValues["SIZE"] === selectedSize && v.optionValues["COLOR"] === selectedColor
    )
  }, [product, selectedSize, selectedColor])

  const addDisabled = useMemo(() => {
    if (!selectedSize || !selectedColor || quantity <= 0) return true
    if (!selectedVariant) return true
    if (!selectedVariant.stock || selectedVariant.stock <= 0) return true
    return quantity > selectedVariant.stock
  }, [selectedSize, selectedColor, quantity, selectedVariant])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-8 w-64 bg-muted rounded mb-2 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="aspect-square rounded-lg bg-muted animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 w-72 bg-muted rounded animate-pulse" />
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link href="/products" className="text-primary hover:underline">
          ← Quay lại sản phẩm
        </Link>
        <div className="mt-6 text-sm text-destructive">{error ?? "Không tìm thấy sản phẩm."}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/products" className="text-primary hover:underline">
            ← Quay lại sản phẩm
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div className="space-y-4">
            <Carousel
              className="w-full"
              opts={{
                align: "start",
                loop: true,
                skipSnaps: false,
                dragFree: true,
              }}
            >
              <CarouselContent>
                {product.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="aspect-square rounded-lg overflow-hidden relative group cursor-pointer">
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                            <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                        <DialogTitle className="sr-only">
                          {product.name} - Image {index + 1}
                        </DialogTitle>
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </DialogContent>
                    </Dialog>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            
            {/* Thumbnail Navigation */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <Dialog key={index}>
                    <DialogTrigger asChild>
                      <button
                        className={`aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                          currentImageIndex === index
                            ? "ring-2 ring-primary ring-offset-2"
                            : "hover:opacity-80 hover:ring-1 hover:ring-primary/50"
                        }`}
                      >
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                      <DialogTitle className="sr-only">
                        {product.name} - Thumbnail {index + 1}
                      </DialogTitle>
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              {product.category && <Badge className="mb-2">{product.category}</Badge>}
              <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl font-bold text-primary">{formatCurrency(product.price, 'VND', 'vi-VN')}</span>
              </div>
            </div>

            <p className="text-muted-foreground">{product.description}</p>

            {/* Size Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Kích thước</label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn kích thước" />
                </SelectTrigger>
                <SelectContent>
                  {product.sizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Màu sắc</label>
              <Select value={selectedColor} onValueChange={setSelectedColor}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn màu sắc" />
                </SelectTrigger>
                <SelectContent>
                  {product.colors.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div>
              <label className="text-sm font-medium mb-2 block">Số lượng</label>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button variant="outline" size="icon" onClick={() => {
                  const matchedVariant = product.variants.find(
                    (v) => v.optionValues["SIZE"] === selectedSize && v.optionValues["COLOR"] === selectedColor
                  )
                  const maxQty = matchedVariant?.stock ?? Infinity
                  setQuantity((prev) => Math.min(prev + 1, Number.isFinite(maxQty) ? maxQty : prev + 1))
                }}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {selectedSize && selectedColor && selectedVariant && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {selectedVariant.stock > 0 ? `Còn ${selectedVariant.stock} sản phẩm cho lựa chọn này` : "Hết hàng cho lựa chọn này"}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <LoginRequiredPopover 
                action="thêm sản phẩm vào giỏ hàng"
                onAction={handleAddToCart}
              >
                <Button
                  className="flex-1"
                  disabled={addDisabled}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Thêm vào giỏ hàng
                </Button>
              </LoginRequiredPopover>
              <LoginRequiredPopover 
                action="tiến hành thanh toán"
                onAction={handleBuyNow}
              >
                <Button
                  className="flex-1"
                  variant="secondary"
                  disabled={addDisabled}
                >
                  Thanh toán ngay
                </Button>
              </LoginRequiredPopover>
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share className="h-4 w-4" />
              </Button>
            </div>

            {/* Features */}
            {product.features.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tính năng sản phẩm</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Product Description */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Mô tả sản phẩm</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {product.description || "Khám phá sự kết hợp hoàn hảo giữa phong cách và sự thoải mái với bộ sưu tập quần áo cao cấp của chúng tôi. Mỗi sản phẩm đều được chế tác cẩn thận bằng chất liệu chất lượng cao và nguyên tắc thiết kế hiện đại để đảm bảo cả độ bền và sự hấp dẫn thời trang. Dù bạn đang tìm kiếm những món đồ thiết yếu hàng ngày hay những món đồ nổi bật, bộ sưu tập của chúng tôi mang đến những lựa chọn đa dạng cho mọi dịp."}
                </p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">Chất liệu & Bảo quản</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• 100% Cotton cao cấp</li>
                      <li>• Có thể giặt máy</li>
                      <li>• Vải đã co trước</li>
                      <li>• Thiết kế không phai màu</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Kích thước & Vừa vặn</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Đúng kích thước</li>
                      <li>• Kiểu dáng thoải mái</li>
                      <li>• Co giãn thoải mái</li>
                      <li>• Hoàn thiện chuyên nghiệp</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Feedback */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Đánh giá khách hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {feedback.map((review) => (
                  <div key={review.id} className="border-b border-border pb-4 last:border-b-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{review.user}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < review.rating
                                    ? "text-yellow-500 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(review.timestamp)}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
