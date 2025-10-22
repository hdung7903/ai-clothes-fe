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
import { Badge } from "@/components/ui/badge"
import { TreeSelect } from 'antd'
import 'antd/dist/reset.css'
import { Trash2, Plus, X } from "lucide-react"
import * as React from "react"
import { createOrUpdateProduct } from "@/services/productService"
import { toSkuToken } from "@/utils/format"
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
  const [basePriceText, setBasePriceText] = React.useState<string>("")

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
      optionId: null,
      name: "COLOR",
      values: []
    },
    {
      optionId: null, 
      name: "SIZE",
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

  // Convert categories to Ant Design TreeSelect format
  const convertToTreeData = (categories: Category[]): any[] => {
    return categories.map(category => ({
      title: category.name,
      value: category.id,
      key: category.id,
      children: category.subCategories && category.subCategories.length > 0 
        ? convertToTreeData(category.subCategories) 
        : undefined
    }))
  }

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

  // Helper functions for variant management
  const addVariant = (colorValue: string, sizeValue: string) => {
    const basePriceNum = parseInt((basePriceText || '0').replace(/,/g, ''), 10) || 0
    const sku = `${toSkuToken(formData.name)}_${toSkuToken(colorValue)}_${toSkuToken(sizeValue)}`
    
    const newVariant: ProductVariantRequest = {
      id: null,
      sku: sku,
      price: basePriceNum,
      stock: 0,
      optionValues: {
        COLOR: colorValue,
        SIZE: sizeValue
      }
    }
    
    setVariants(prev => [...prev, newVariant])
  }

  const removeVariant = (colorValue: string, sizeValue: string) => {
    setVariants(prev => prev.filter(variant => 
      !(variant.optionValues.COLOR === colorValue && variant.optionValues.SIZE === sizeValue)
    ))
  }

  const updateVariant = (colorValue: string, sizeValue: string, field: keyof ProductVariantRequest, value: any) => {
    setVariants(prev => prev.map(variant => {
      if (variant.optionValues.COLOR === colorValue && variant.optionValues.SIZE === sizeValue) {
        return { ...variant, [field]: value }
      }
      return variant
    }))
  }

  const getVariant = (colorValue: string, sizeValue: string) => {
    return variants.find(variant => 
      variant.optionValues.COLOR === colorValue && variant.optionValues.SIZE === sizeValue
    )
  }

  // Auto-generate variants only when options are added (not when values change)
  React.useEffect(() => {
    const colorOption = options.find(opt => opt.name === "COLOR")
    const sizeOption = options.find(opt => opt.name === "SIZE")
    
    if (!colorOption || !sizeOption) {
      setVariants([])
      return
    }

    // Get all valid combinations
    const validCombinations: { color: string; size: string }[] = []
    colorOption.values.forEach((colorValue) => {
      sizeOption.values.forEach((sizeValue) => {
        if (colorValue.value.trim() !== "" && sizeValue.value.trim() !== "") {
          validCombinations.push({
            color: colorValue.value,
            size: sizeValue.value
          })
        }
      })
    })

    // Remove variants that no longer have valid combinations
    setVariants(prev => prev.filter(variant => 
      validCombinations.some(combo => 
        variant.optionValues.COLOR === combo.color && variant.optionValues.SIZE === combo.size
      )
    ))

    // Add missing variants for new combinations
    validCombinations.forEach(combo => {
      if (!getVariant(combo.color, combo.size)) {
        addVariant(combo.color, combo.size)
      }
    })
  }, [options])

  const updateOption = (optionName: string, field: keyof ProductOptionRequest, value: any) => {
    setOptions(options.map(opt => 
      opt.name === optionName ? { ...opt, [field]: value } : opt
    ))
  }

  const addOptionValue = (optionName: string) => {
    const newValue = {
      optionValueId: null,
      value: "",
      imageUrl: []
    }
    setOptions(options.map(opt => 
      opt.name === optionName 
        ? { ...opt, values: [...opt.values, newValue] }
        : opt
    ))
  }

  const removeOptionValue = (optionName: string, valueIndex: number) => {
    setOptions(options.map(opt => 
      opt.name === optionName 
        ? { ...opt, values: opt.values.filter((_, index) => index !== valueIndex) }
        : opt
    ))
  }

  // Validation function to check for duplicate values
  const validateOptionValues = (optionName: string, newValue: string, currentValues: any[], currentIndex: number) => {
    const trimmedValue = newValue.trim().toLowerCase()
    if (!trimmedValue) return true // Allow empty values
    
    const existingValues = currentValues
      .filter((_, index) => index !== currentIndex) // Exclude current value being edited by index
      .map(v => v.trim().toLowerCase())
    
    return !existingValues.includes(trimmedValue)
  }

  const updateOptionValue = (optionName: string, valueIndex: number, field: keyof any, value: any) => {
    // Always update the value first, then validate
    setOptions(options.map(opt => 
      opt.name === optionName 
        ? {
            ...opt,
            values: opt.values.map((val, index) => 
              index === valueIndex ? { ...val, [field]: value } : val
            )
          }
        : opt
    ))
    
    // Validate for duplicate values when updating the 'value' field
    if (field === 'value') {
      const currentOption = options.find(opt => opt.name === optionName)
      if (currentOption) {
        const currentValues = currentOption.values.map(v => v.value)
        if (!validateOptionValues(optionName, value, currentValues, valueIndex)) {
          setError(`${optionName === 'COLOR' ? 'Màu sắc' : 'Kích thước'} "${value.trim()}" đã tồn tại. Vui lòng chọn giá trị khác.`)
        } else {
          setError(null)
        }
      }
    }
  }

  const handleImageUpload = async (optionName: string, valueIndex: number, file: File) => {
    const uploadKey = `${optionName}_${valueIndex}`
    setUploadingImages(prev => new Set(prev).add(uploadKey))
    
    try {
      const response = await uploadImage(file)
      if (response.success && response.data) {
        updateOptionValue(optionName, valueIndex, 'imageUrl', [response.data!])
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

  const removeImage = (optionName: string, valueIndex: number) => {
    updateOptionValue(optionName, valueIndex, 'imageUrl', [])
  }


  const updateVariantField = (variantIndex: number, field: keyof ProductVariantRequest, value: any) => {
    setVariants(prev => prev.map((variant, index) => 
      index === variantIndex ? { ...variant, [field]: value } : variant
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Validate required fields
      if (!formData.name || !formData.name.trim()) {
        throw new Error("Tên sản phẩm là bắt buộc")
      }
      if (!formData.description || !formData.description.trim()) {
        throw new Error("Mô tả sản phẩm là bắt buộc")
      }
      if (!formData.imageUrl || !formData.imageUrl.trim()) {
        throw new Error("Hình ảnh sản phẩm là bắt buộc")
      }
      if (!formData.basePrice || formData.basePrice <= 0) {
        throw new Error("Giá cơ bản phải lớn hơn 0")
      }
      if (selectedCategories.size === 0) {
        throw new Error("Danh mục là bắt buộc")
      }
      
      const variantsPayload = variants.map(variant => ({
        id: null,
        sku: variant.sku,
        price: variant.price,
        stock: variant.stock,
        optionValues: variant.optionValues
      }))

      const validOptions = options.map(opt => ({
        ...opt,
        values: opt.values.filter(v => v.value && v.value.trim() !== "")
      })).filter(opt => opt.values.length > 0)

      const payload: CreateOrUpdateProductRequest = {
        productId: null, // Gửi null khi tạo mới, backend sẽ tự tạo ID
        name: formData.name,
        description: formData.description,
        imageUrl: formData.imageUrl,
        basePrice: parseInt((basePriceText || String(formData.basePrice)).replace(/,/g, ''), 10) || 0,
        categoryId: Array.from(selectedCategories)[0], // Sử dụng danh mục đầu tiên được chọn
        options: validOptions,
        variants: variantsPayload // Gửi array với id: null
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
    <>
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
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
              {error}
            </div>
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
                    <Label htmlFor="description">Mô tả *</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Mô tả ngắn về sản phẩm"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      required
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
                            required
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
                          placeholder="Dán URL hình ảnh (bắt buộc)"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                          required
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
                      inputMode="numeric"
                      placeholder="0" 
                      value={basePriceText}
                      onChange={(e) => {
                        const raw = e.target.value
                        // allow only digits and strip leading zeros (keep single zero)
                        const digits = raw.replace(/\D+/g, '').replace(/^0+(?=\d)/, '')
                        setBasePriceText(digits)
                      }}
                      onBlur={() => {
                        const num = parseInt((basePriceText || '0').replace(/,/g, ''), 10) || 0
                        setFormData({ ...formData, basePrice: num })
                      }}
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
                    <TreeSelect
                      style={{ width: '100%' }}
                      value={Array.from(selectedCategories)}
                      onChange={handleCategorySelectionChange}
                      treeData={convertToTreeData(categories)}
                      treeCheckable={true}
                      showCheckedStrategy={TreeSelect.SHOW_PARENT}
                      placeholder="Chọn danh mục"
                      maxTagCount="responsive"
                      treeDefaultExpandAll={false}
                      styles={{
                        popup: {
                          root: {
                            maxHeight: 300,
                            overflow: 'auto'
                          }
                        }
                      }}
                    />
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
                   <div key={option.name} className="border rounded-lg p-4 space-y-3">
                     <div className="flex items-center gap-2">
                       <Label className="text-sm font-medium min-w-[100px]">
                         {option.name === "COLOR" ? "Màu sắc" : option.name === "SIZE" ? "Kích thước" : option.name}
                       </Label>
                       <div className="flex-1">
                         <div className="space-y-2">
                           <div className="flex items-center justify-between">
                             <Label className="text-sm text-muted-foreground">
                               Giá trị {option.name === "COLOR" ? "màu sắc" : option.name === "SIZE" ? "kích thước" : option.name}
                             </Label>
                             <Button
                               type="button"
                               variant="outline"
                               size="sm"
                               onClick={() => addOptionValue(option.name)}
                             >
                               <Plus className="h-4 w-4 mr-1" />
                               Thêm {option.name === "COLOR" ? "màu sắc" : option.name === "SIZE" ? "kích thước" : option.name}
                             </Button>
                           </div>
                           
                           {option.values.map((value, valueIndex) => {
                             const uploadKey = `${option.name}_${valueIndex}`
                             const isUploading = uploadingImages.has(uploadKey)
                             const hasImage = value.imageUrl && value.imageUrl.length > 0
                             
                             return (
                               <div key={valueIndex} className="border rounded-lg p-3 space-y-3">
                                 <div className="flex items-center gap-2">
                                  <Input
                                    type="text"
                                    autoComplete="off"
                                     placeholder={`Nhập ${option.name === "COLOR" ? "màu sắc" : option.name === "SIZE" ? "kích thước" : option.name} (VD: ${option.name === 'COLOR' ? 'Đỏ, Xanh, Vàng' : 'S, M, L, XL'})`}
                                     value={value.value}
                                     onChange={(e) => updateOptionValue(option.name, valueIndex, 'value', e.target.value)}
                                     className="flex-1"
                                   />
                                   <Button
                                     type="button"
                                     variant="outline"
                                     size="sm"
                                     onClick={() => removeOptionValue(option.name, valueIndex)}
                                   >
                                     <X className="h-4 w-4" />
                                   </Button>
                                 </div>
                                 
                                {/* Image Upload Section (only for color) */}
                                {option.name === 'COLOR' && (
                                  <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">
                                      Hình ảnh {option.name === "COLOR" ? "màu sắc" : option.name === "SIZE" ? "kích thước" : option.name}
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
                                            onClick={() => removeImage(option.name, valueIndex)}
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
                                                handleImageUpload(option.name, valueIndex, file)
                                              }
                                            }}
                                            className="hidden"
                                            id={`image-${option.name}-${valueIndex}`}
                                            disabled={isUploading}
                                          />
                                          <label 
                                            htmlFor={`image-${option.name}-${valueIndex}`}
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
                                                  Nhấn để upload ảnh {option.name === "COLOR" ? "màu sắc" : option.name === "SIZE" ? "kích thước" : option.name}
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
                                )}
                               </div>
                             )
                           })}
                           
                           {option.values.length === 0 && (
                             <div className="text-center py-4 text-muted-foreground text-sm">
                               Chưa có {option.name === "COLOR" ? "màu sắc" : option.name === "SIZE" ? "kích thước" : option.name} nào. Nhấn "Thêm {option.name === "COLOR" ? "màu sắc" : option.name === "SIZE" ? "kích thước" : option.name}" để bắt đầu.
                             </div>
                           )}
                         </div>
                       </div>
                     </div>
                   </div>
                 ))}
               </CardContent>
             </Card>

             {/* Variants Section - Preview Only */}
             <Card>
               <CardHeader>
                 <CardTitle>Biến thể sản phẩm (Xem trước)</CardTitle>
                 <CardDescription>
                   Các biến thể sẽ được tạo tự động bởi backend dựa trên màu sắc và kích thước đã chọn. 
                   {variants.length > 0 && ` Hiện có ${variants.length} biến thể dự kiến.`}
                 </CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                 {variants.length > 0 ? (
                   <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                     {variants.map((variant, variantIndex) => {
                       const colorOption = options.find(opt => opt.name === "COLOR")
                       const sizeOption = options.find(opt => opt.name === "SIZE")
                       
                       const colorValue = colorOption?.values.find(val => val.value === variant.optionValues[colorOption.name])
                       const sizeValue = sizeOption?.values.find(val => val.value === variant.optionValues[sizeOption.name])
                       
                       return (
                         <div key={`${variant.sku}-${variant.optionValues[colorOption?.name || 'COLOR']}-${variant.optionValues[sizeOption?.name || 'SIZE']}`} className="border rounded-lg p-4 space-y-3">
                           <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                               <Badge variant="outline">{colorValue?.value}</Badge>
                               <Badge variant="secondary">{sizeValue?.value}</Badge>
                             </div>
                           </div>
                           
                           <div className="grid gap-2">
                             <div>
                               <Label className="text-xs text-muted-foreground">SKU (Dự kiến)</Label>
                               <Input
                                 placeholder="Mã SKU"
                                 value={variant.sku}
                                 onChange={(e) => updateVariantField(variantIndex, 'sku', e.target.value)}
                                 className="text-sm"
                               />
                             </div>
                             <div className="grid grid-cols-2 gap-2">
                               <div>
                                 <Label className="text-xs text-muted-foreground">Giá (VNĐ)</Label>
                                  <Input
                                    type="text"
                                   step="1000"
                                   placeholder="0"
                                    value={variant.price}
                                    onChange={(e) => {
                                      const digits = e.target.value.replace(/\D+/g, '').replace(/^0+(?=\d)/, '')
                                      updateVariantField(variantIndex, 'price', digits ? Number(digits) : 0)
                                    }}
                                   className="text-sm"
                                 />
                               </div>
                               <div>
                                 <Label className="text-xs text-muted-foreground">Tồn kho</Label>
                                  <Input
                                    type="text"
                                   placeholder="0"
                                    value={variant.stock}
                                    onChange={(e) => {
                                      const digits = e.target.value.replace(/\D+/g, '').replace(/^0+(?=\d)/, '')
                                      updateVariantField(variantIndex, 'stock', digits ? Number(digits) : 0)
                                    }}
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
                     <p className="text-sm mt-1">Thêm màu sắc và kích thước để xem trước biến thể.</p>
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
    </>
  )
}