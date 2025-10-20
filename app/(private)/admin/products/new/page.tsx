"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Checkbox, TreeCheckbox } from "@/components/ui/checkbox"
import { Trash2, Plus, X } from "lucide-react"
import * as React from "react"
import { createOrUpdateProduct } from "@/services/productService"
import { getAll } from "@/services/cartegoryServices"
import { uploadImage } from "@/services/storageService"
import type { CreateOrUpdateProductRequest, ProductOptionRequest, ProductVariantRequest } from "@/types/product"
import type { Category } from "@/types/category"

export default function Page() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [categories, setCategories] = React.useState<Category[]>([])
  const [uploadingImages, setUploadingImages] = React.useState<Set<string>>(new Set())
  const [isMainUploading, setIsMainUploading] = React.useState(false)
  const [selectedCategories, setSelectedCategories] = React.useState<Set<string>>(new Set())
  const [pendingCategorySelection, setPendingCategorySelection] = React.useState<string[]>([])

  // Form state
  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    imageUrl: "",
    basePrice: 0,
    categoryId: "",
  })
  
  const [options, setOptions] = React.useState<ProductOptionRequest[]>([
    {
      optionId: "color",
      name: "Màu sắc",
      values: []
    },
    {
      optionId: "size", 
      name: "Kích thước",
      values: []
    }
  ])
  const [variants, setVariants] = React.useState<ProductVariantRequest[]>([])

  const handleMainImageUpload = async (file: File) => {
    setIsMainUploading(true)
    try {
      const res = await uploadImage(file)
      if (res.success && res.data) {
        setFormData((prev) => ({ ...prev, imageUrl: res.data! }))
      } else {
        const errorMessage = res.errors ? Object.values(res.errors).flat().join(', ') : 'Upload ảnh thất bại'
        throw new Error(errorMessage)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi upload ảnh')
    } finally {
      setIsMainUploading(false)
    }
  }

  const removeMainImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: '' }))
  }

  const handleCategorySelectionChange = React.useCallback((selectedIds: string[]) => {
    setPendingCategorySelection(selectedIds)
  }, [])

  // Use useEffect to update selectedCategories after render
  React.useEffect(() => {
    setSelectedCategories(new Set(pendingCategorySelection))
  }, [pendingCategorySelection])

  // Load categories
  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getAll()
        if (response.data) {
          setCategories(response.data)
        }
      } catch (err) {
        console.error("Failed to load categories:", err)
      }
    }
    loadCategories()
  }, [])

  // Auto-generate variants when options change
  React.useEffect(() => {
    const colorOption = options.find(opt => opt.optionId === "color")
    const sizeOption = options.find(opt => opt.optionId === "size")
    
    if (colorOption && sizeOption && colorOption.values.length > 0 && sizeOption.values.length > 0) {
      const newVariants: ProductVariantRequest[] = []
      
      colorOption.values.forEach(colorValue => {
        sizeOption.values.forEach(sizeValue => {
          const variantId = `variant_${colorValue.optionValueId}_${sizeValue.optionValueId}`
          const sku = `${formData.name.replace(/\s+/g, '').toUpperCase()}_${colorValue.value.toUpperCase()}_${sizeValue.value.toUpperCase()}`
          
          newVariants.push({
            id: variantId,
            sku: sku,
            price: formData.basePrice,
            stock: 0,
            optionValues: {
              [colorOption.optionId]: colorValue.optionValueId,
              [sizeOption.optionId]: sizeValue.optionValueId
            }
          })
        })
      })
      
      setVariants(newVariants)
    } else {
      setVariants([])
    }
  }, [options, formData.name, formData.basePrice])

  const updateOption = (optionId: string, field: keyof ProductOptionRequest, value: any) => {
    setOptions(options.map(opt => 
      opt.optionId === optionId ? { ...opt, [field]: value } : opt
    ))
  }

  const addOptionValue = (optionId: string) => {
    const newValue = {
      optionValueId: `value_${Date.now()}`,
      value: "",
      imageUrl: []
    }
    setOptions(options.map(opt => 
      opt.optionId === optionId 
        ? { ...opt, values: [...opt.values, newValue] }
        : opt
    ))
  }

  const removeOptionValue = (optionId: string, valueId: string) => {
    setOptions(options.map(opt => 
      opt.optionId === optionId 
        ? { ...opt, values: opt.values.filter(val => val.optionValueId !== valueId) }
        : opt
    ))
  }

  const updateOptionValue = (optionId: string, valueId: string, field: keyof any, value: any) => {
    setOptions(options.map(opt => 
      opt.optionId === optionId 
        ? {
            ...opt,
            values: opt.values.map(val => 
              val.optionValueId === valueId ? { ...val, [field]: value } : val
            )
          }
        : opt
    ))
  }

  const handleImageUpload = async (optionId: string, valueId: string, file: File) => {
    const uploadKey = `${optionId}_${valueId}`
    setUploadingImages(prev => new Set(prev).add(uploadKey))
    
    try {
      const response = await uploadImage(file)
      if (response.success && response.data) {
        updateOptionValue(optionId, valueId, 'imageUrl', [response.data!])
      } else {
        const errorMessage = response.errors ? Object.values(response.errors).flat().join(', ') : 'Upload ảnh thất bại'
        throw new Error(errorMessage)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi upload ảnh")
    } finally {
      setUploadingImages(prev => {
        const newSet = new Set(prev)
        newSet.delete(uploadKey)
        return newSet
      })
    }
  }

  const removeImage = (optionId: string, valueId: string) => {
    updateOptionValue(optionId, valueId, 'imageUrl', [])
  }


  const updateVariant = (variantId: string, field: keyof ProductVariantRequest, value: any) => {
    setVariants(variants.map(v => 
      v.id === variantId ? { ...v, [field]: value } : v
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error("Tên sản phẩm là bắt buộc")
      }
      if (selectedCategories.size === 0) {
        throw new Error("Danh mục là bắt buộc")
      }
      if (variants.length === 0) {
        throw new Error("Cần ít nhất một biến thể sản phẩm")
      }

      // Validate variants
      for (const variant of variants) {
        if (!variant.sku.trim()) {
          throw new Error("SKU là bắt buộc cho tất cả biến thể")
        }
        if (variant.price <= 0) {
          throw new Error("Giá phải lớn hơn 0")
        }
      }

      const payload: CreateOrUpdateProductRequest = {
        productId: `product_${Date.now()}`,
        name: formData.name,
        description: formData.description,
        imageUrl: formData.imageUrl,
        basePrice: formData.basePrice,
        categoryId: Array.from(selectedCategories)[0], // Sử dụng danh mục đầu tiên được chọn
        options: options.filter(opt => opt.name.trim() !== ""),
        variants: variants
      }

      const response = await createOrUpdateProduct(payload)
      
      if (response.success) {
        router.push("/admin/products")
      } else {
        const errorMessage = response.errors ? Object.values(response.errors).flat().join(', ') : "Có lỗi xảy ra khi tạo sản phẩm"
        throw new Error(errorMessage)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra")
    } finally {
      setIsLoading(false)
    }
  }

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
                  <BreadcrumbPage>Tạo mới</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Tạo sản phẩm mới</h1>
            <Button variant="outline" asChild>
              <Link href="/admin/products">Hủy</Link>
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Thông tin sản phẩm</CardTitle>
                  <CardDescription>Thông tin cơ bản và giá cả.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Tên sản phẩm *</Label>
                    <Input 
                      id="name" 
                      placeholder="Nhập tên sản phẩm" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Mô tả</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Mô tả ngắn về sản phẩm"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="imageUrl">Hình ảnh sản phẩm</Label>
                    {formData.imageUrl ? (
                      <div className="flex items-center gap-3">
                        <img
                          src={formData.imageUrl}
                          alt={formData.name || 'product image'}
                          className="w-20 h-20 object-cover rounded border"
                        />
                        <div className="flex-1 grid gap-2">
                          <Input 
                            id="imageUrl" 
                            placeholder="https://example.com/image.jpg"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                          />
                          <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" onClick={removeMainImage}>Xóa ảnh</Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        <Input 
                          id="imageUrl" 
                          placeholder="Dán URL hình ảnh (tùy chọn)"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                        />
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                          <div className="text-center">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleMainImageUpload(file)
                              }}
                              className="hidden"
                              id={`main-image-upload`}
                              disabled={isMainUploading}
                            />
                            <label htmlFor={`main-image-upload`} className="cursor-pointer">
                              {isMainUploading ? (
                                <div className="space-y-2">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                  <p className="text-sm text-muted-foreground">Đang upload ảnh...</p>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <p className="text-sm text-muted-foreground">Nhấn để upload ảnh sản phẩm</p>
                                  <p className="text-xs text-muted-foreground">JPG, PNG, GIF tối đa 10MB</p>
                                </div>
                              )}
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="basePrice">Giá cơ bản (VNĐ) *</Label>
                    <Input 
                      id="basePrice" 
                      type="number" 
                      step="1000" 
                      placeholder="0" 
                      value={formData.basePrice}
                      onChange={(e) => setFormData({...formData, basePrice: Number(e.target.value)})}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Danh mục & hiển thị</CardTitle>
                  <CardDescription>Chọn danh mục và cài đặt hiển thị.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Danh mục *</Label>
                    <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
                      <TreeCheckbox 
                        data={categories}
                        onSelectionChange={handleCategorySelectionChange}
                      />
                    </div>
                    {selectedCategories.size > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Array.from(selectedCategories).map(categoryId => {
                          const category = categories.find(c => c.id === categoryId) || 
                                         categories.flatMap(c => c.subCategories || []).find(sc => sc.id === categoryId)
                          return category ? (
                            <Badge key={categoryId} variant="secondary" className="text-xs">
                              {category.name}
                            </Badge>
                          ) : null
                        })}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

             {/* Options Section */}
             <Card>
               <CardHeader>
                 <CardTitle>Tùy chọn sản phẩm</CardTitle>
                 <CardDescription>Thêm màu sắc và kích thước cho sản phẩm. Các biến thể sẽ được tạo tự động.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-6">
                 {options.map((option) => (
                   <div key={option.optionId} className="border rounded-lg p-4 space-y-3">
                     <div className="flex items-center gap-2">
                       <Label className="text-sm font-medium min-w-[100px]">{option.name}</Label>
                       <div className="flex-1">
                         <div className="space-y-2">
                           <div className="flex items-center justify-between">
                             <Label className="text-sm text-muted-foreground">Giá trị {option.name.toLowerCase()}</Label>
                             <Button
                               type="button"
                               variant="outline"
                               size="sm"
                               onClick={() => addOptionValue(option.optionId)}
                             >
                               <Plus className="h-4 w-4 mr-1" />
                               Thêm {option.name.toLowerCase()}
                             </Button>
                           </div>
                           
                           {option.values.map((value) => {
                             const uploadKey = `${option.optionId}_${value.optionValueId}`
                             const isUploading = uploadingImages.has(uploadKey)
                             const hasImage = value.imageUrl && value.imageUrl.length > 0
                             
                             return (
                               <div key={value.optionValueId} className="border rounded-lg p-3 space-y-3">
                                 <div className="flex items-center gap-2">
                                   <Input
                                     placeholder={`Nhập ${option.name.toLowerCase()} (VD: ${option.optionId === 'color' ? 'Đỏ, Xanh, Vàng' : 'S, M, L, XL'})`}
                                     value={value.value}
                                     onChange={(e) => updateOptionValue(option.optionId, value.optionValueId, 'value', e.target.value)}
                                     className="flex-1"
                                   />
                                   <Button
                                     type="button"
                                     variant="outline"
                                     size="sm"
                                     onClick={() => removeOptionValue(option.optionId, value.optionValueId)}
                                   >
                                     <X className="h-4 w-4" />
                                   </Button>
                                 </div>
                                 
                                 {/* Image Upload Section */}
                                 <div className="space-y-2">
                                   <Label className="text-xs text-muted-foreground">
                                     Hình ảnh {option.name.toLowerCase()}
                                   </Label>
                                   
                                   {hasImage ? (
                                     <div className="space-y-2">
                                       <div className="flex items-center gap-2">
                                         <img 
                                           src={value.imageUrl[0]} 
                                           alt={value.value}
                                           className="w-16 h-16 object-cover rounded border"
                                         />
                                         <div className="flex-1">
                                           <p className="text-sm text-muted-foreground">Đã upload ảnh</p>
                                           <p className="text-xs text-muted-foreground truncate">
                                             {value.imageUrl[0].split('/').pop()}
                                           </p>
                                         </div>
                                         <Button
                                           type="button"
                                           variant="outline"
                                           size="sm"
                                           onClick={() => removeImage(option.optionId, value.optionValueId)}
                                         >
                                           <X className="h-4 w-4" />
                                         </Button>
                                       </div>
                                     </div>
                                   ) : (
                                     <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                                       <div className="text-center">
                                         <input
                                           type="file"
                                           accept="image/*"
                                           onChange={(e) => {
                                             const file = e.target.files?.[0]
                                             if (file) {
                                               handleImageUpload(option.optionId, value.optionValueId, file)
                                             }
                                           }}
                                           className="hidden"
                                           id={`image-${option.optionId}-${value.optionValueId}`}
                                           disabled={isUploading}
                                         />
                                         <label 
                                           htmlFor={`image-${option.optionId}-${value.optionValueId}`}
                                           className="cursor-pointer"
                                         >
                                           {isUploading ? (
                                             <div className="space-y-2">
                                               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                               <p className="text-sm text-muted-foreground">Đang upload...</p>
                                             </div>
                                           ) : (
                                             <div className="space-y-2">
                                               <Plus className="h-8 w-8 text-muted-foreground mx-auto" />
                                               <p className="text-sm text-muted-foreground">
                                                 Nhấn để upload ảnh {option.name.toLowerCase()}
                                               </p>
                                               <p className="text-xs text-muted-foreground">
                                                 JPG, PNG, GIF tối đa 10MB
                                               </p>
                                             </div>
                                           )}
                                         </label>
                                       </div>
                                     </div>
                                   )}
                                 </div>
                               </div>
                             )
                           })}
                           
                           {option.values.length === 0 && (
                             <div className="text-center py-4 text-muted-foreground text-sm">
                               Chưa có {option.name.toLowerCase()} nào. Nhấn "Thêm {option.name.toLowerCase()}" để bắt đầu.
                             </div>
                           )}
                         </div>
                       </div>
                     </div>
                   </div>
                 ))}
               </CardContent>
             </Card>

             {/* Variants Section */}
             <Card>
               <CardHeader>
                 <CardTitle>Biến thể sản phẩm</CardTitle>
                 <CardDescription>
                   Các biến thể được tạo tự động dựa trên màu sắc và kích thước đã chọn. 
                   {variants.length > 0 && ` Hiện có ${variants.length} biến thể.`}
                 </CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                 {variants.length > 0 ? (
                   <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                     {variants.map((variant) => {
                       const colorOption = options.find(opt => opt.optionId === "color")
                       const sizeOption = options.find(opt => opt.optionId === "size")
                       
                       const colorValue = colorOption?.values.find(val => val.optionValueId === variant.optionValues[colorOption.optionId])
                       const sizeValue = sizeOption?.values.find(val => val.optionValueId === variant.optionValues[sizeOption.optionId])
                       
                       return (
                         <div key={variant.id} className="border rounded-lg p-4 space-y-3">
                           <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                               <Badge variant="outline">{colorValue?.value}</Badge>
                               <Badge variant="secondary">{sizeValue?.value}</Badge>
                             </div>
                           </div>
                           
                           <div className="grid gap-2">
                             <div>
                               <Label className="text-xs text-muted-foreground">SKU</Label>
                               <Input
                                 placeholder="Mã SKU"
                                 value={variant.sku}
                                 onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                                 className="text-sm"
                               />
                             </div>
                             <div className="grid grid-cols-2 gap-2">
                               <div>
                                 <Label className="text-xs text-muted-foreground">Giá (VNĐ)</Label>
                                 <Input
                                   type="number"
                                   step="1000"
                                   placeholder="0"
                                   value={variant.price}
                                   onChange={(e) => updateVariant(variant.id, 'price', Number(e.target.value))}
                                   className="text-sm"
                                 />
                               </div>
                               <div>
                                 <Label className="text-xs text-muted-foreground">Tồn kho</Label>
                                 <Input
                                   type="number"
                                   placeholder="0"
                                   value={variant.stock}
                                   onChange={(e) => updateVariant(variant.id, 'stock', Number(e.target.value))}
                                   className="text-sm"
                                 />
                               </div>
                             </div>
                           </div>
                         </div>
                       )
                     })}
                   </div>
                 ) : (
                   <div className="text-center py-8 text-muted-foreground">
                     <p>Chưa có biến thể nào.</p>
                     <p className="text-sm mt-1">Thêm màu sắc và kích thước để tạo biến thể tự động.</p>
                   </div>
                 )}
               </CardContent>
             </Card>

            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Đang tạo..." : "Tạo sản phẩm"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/products">Quay lại</Link>
              </Button>
            </div>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}