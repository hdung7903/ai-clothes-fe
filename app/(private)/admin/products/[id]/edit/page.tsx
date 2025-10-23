"use client"
import Link from "next/link"
import { notFound } from "next/navigation"
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
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, X, Upload } from "lucide-react"
import { TreeSelect } from "antd"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import * as React from "react"
import { getProductById, createOrUpdateProduct } from "@/services/productService"
import { getAll as getAllCategories } from "@/services/cartegoryServices"
import { uploadImage } from "@/services/storageService"
import type { ProductDetail, ProductOptionDetail, ProductVariantDetail, ProductOptionRequest, ProductVariantRequest, ProductOptionValueRequest } from "@/types/product"
import { formatCurrency, toSkuToken } from "@/utils/format"
import type { Category } from "@/types/category"

type PageProps = { params: any }

export default function Page({ params }: PageProps) {
  // Next.js: params is a Promise in client components; unwrap with React.use()
  const { id } = React.use(params) as { id: string }
  if (!id) notFound()

  const [product, setProduct] = React.useState<ProductDetail | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Form fields
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [imageUrl, setImageUrl] = React.useState("")
  const [basePrice, setBasePrice] = React.useState<string>("")
  const [categoryId, setCategoryId] = React.useState("")
  
  // Options state - Initialize with predefined COLOR and SIZE options
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
  
  // Variants state
  const [variants, setVariants] = React.useState<ProductVariantRequest[]>([])
  
  // Categories tree
  const [categories, setCategories] = React.useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = React.useState(false)

  // Image upload states
  const [uploadingImages, setUploadingImages] = React.useState<Set<string>>(new Set())
  const [imagePreviews, setImagePreviews] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    let ignore = false
    const run = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await getProductById(id)
        if (!ignore) {
          const data = res.data ?? null
          setProduct(data)
          if (data) {
            setName(data.name ?? "")
            setDescription(data.description ?? "")
            setImageUrl(data.imageUrl ?? "")
            setBasePrice(Number.isFinite(data.basePrice) ? data.basePrice.toString() : "")
            setCategoryId(data.category?.categoryId ?? "")
            
            // Map options
            const mappedOptions = mapOptionsToRequest(data.options)
            setOptions(mappedOptions)
            
            // Map variants
            const mappedVariants = mapVariantsToRequest(data.variants)
            setVariants(mappedVariants)
          }
        }
      } catch {
        if (!ignore) setError("Không thể tải sản phẩm.")
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }
    run()
    return () => { ignore = true }
  }, [id])

  // Load categories tree
  React.useEffect(() => {
    let ignore = false
    const loadCats = async () => {
      setIsLoadingCategories(true)
      try {
        const res = await getAllCategories()
        if (!ignore) {
          setCategories(res.data ?? [])
        }
      } finally {
        if (!ignore) setIsLoadingCategories(false)
      }
    }
    loadCats()
    return () => { ignore = true }
  }, [])

  // Validation function to check for duplicate values
  const validateOptionValues = (optionName: string, newValue: string, currentValues: any[], currentIndex: number) => {
    const trimmedValue = newValue.trim().toLowerCase()
    if (!trimmedValue) return true // Allow empty values
    
    const existingValues = currentValues
      .filter((_, index) => index !== currentIndex) // Exclude current value being edited by index
      .map(v => v.trim().toLowerCase())
    
    return !existingValues.includes(trimmedValue)
  }

  // Helper functions for variant management
  const addVariant = (colorValue: string, sizeValue: string) => {
    const basePriceNum = parseFloat(basePrice) || 0
    const sku = `${toSkuToken(name)}_${toSkuToken(colorValue)}_${toSkuToken(sizeValue)}`
    
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

  const updateVariantByCombo = (colorValue: string, sizeValue: string, field: keyof ProductVariantRequest, value: any) => {
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

  function mapOptionsToRequest(options: ProductOptionDetail[] | undefined) {
    return (options ?? []).map((opt) => ({
      optionId: opt.optionId || null, // Sử dụng null nếu không có optionId từ server
      name: opt.name,
      values: (opt.values ?? []).filter(v => v.value && v.value.trim() !== "").map((v) => ({
        optionValueId: v.optionValueId || null, // Sử dụng null nếu không có optionValueId từ server
        value: v.value,
        imageUrl: v.images ?? [],
      })),
    }))
  }

  function mapVariantsToRequest(variants: ProductVariantDetail[] | undefined) {
    return (variants ?? []).map((v) => ({
      id: v.variantId || null, // Giữ nguyên variantId từ server
      sku: v.sku, // Giữ nguyên SKU từ API response
      price: v.price,
      stock: v.stock,
      optionValues: v.optionValues,
    }))
  }

  // Helper functions for options
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

  const updateOptionValue = (optionName: string, valueIndex: number, field: keyof any, value: any) => {
    // If updating the 'value' field (color/size name), update variants first
    if (field === 'value') {
      const currentOption = options.find(opt => opt.name === optionName)
      if (currentOption) {
        const oldValue = currentOption.values[valueIndex]?.value
        const newValue = value
        
        // If the value actually changed, update related variants
        if (oldValue !== newValue && oldValue) {
          setVariants(prev => prev.map(variant => {
            // Check if this variant uses the old value
            const usesOldValue = variant.optionValues[optionName] === oldValue
            
            if (usesOldValue) {
              // Update optionValues with new value
              const updatedOptionValues = {
                ...variant.optionValues,
                [optionName]: newValue
              }
              
              // Calculate new SKU based on updated optionValues
              // Use current name from state for SKU calculation
              const currentName = name || product?.name || ""
              const newSku = `${toSkuToken(currentName)}_${toSkuToken(updatedOptionValues.COLOR)}_${toSkuToken(updatedOptionValues.SIZE)}`
              
              // Keep existing variantId when updating option values
              return {
                ...variant,
                id: variant.id, // Giữ nguyên variantId hiện tại
                optionValues: updatedOptionValues,
                sku: newSku
              }
            }
            return variant
          }))
        }
        
        // Validate for duplicate values
        const currentValues = currentOption.values.map(v => v.value)
        if (!validateOptionValues(optionName, value, currentValues, valueIndex)) {
          setError(`${optionName === 'COLOR' ? 'Màu sắc' : 'Kích thước'} "${value.trim()}" đã tồn tại. Vui lòng chọn giá trị khác.`)
        } else {
          setError(null)
        }
      }
    }
    
    // Always update the option value
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
  }

  // Helper functions for variants
  const updateVariantField = (index: number, field: keyof ProductVariantRequest, value: any) => {
    const updated = [...variants]
    updated[index] = { ...updated[index], [field]: value }
    setVariants(updated)
  }

  // Image upload functionality
  const handleImageUpload = async (optionName: string, valueIndex: number, file: File) => {
    const uploadKey = `${optionName}_${valueIndex}`
    setUploadingImages(prev => new Set(prev).add(uploadKey))
    
    try {
      const response = await uploadImage(file)
      if (response.success && response.data) {
        updateOptionValue(optionName, valueIndex, 'imageUrl', [response.data!])
      }
    } catch (error) {
      console.error('Image upload failed:', error)
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

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!product) return
    setIsLoading(true)
    setError(null)
    try {
      // ===== VALIDATE REQUIRED FIELDS =====
      
      // 1. Validate product name
      if (!name || !name.trim()) {
        throw new Error("Tên sản phẩm là bắt buộc và không được để trống")
      }
      
      // 2. Validate description
      if (!description || !description.trim()) {
        throw new Error("Mô tả sản phẩm là bắt buộc và không được để trống")
      }
      
      // 3. Validate image URL
      if (!imageUrl || !imageUrl.trim()) {
        throw new Error("Hình ảnh sản phẩm là bắt buộc")
      }
      
      // 4. Validate category
      const finalCategoryId = categoryId || product.category?.categoryId || ""
      if (!finalCategoryId || !finalCategoryId.trim()) {
        throw new Error("Danh mục là bắt buộc. Vui lòng chọn ít nhất một danh mục")
      }
      
      // 5. Validate base price
      if (!basePrice || basePrice.trim() === "") {
        throw new Error("Giá cơ bản là bắt buộc")
      }
      const basePriceValue = Number(basePrice)
      if (isNaN(basePriceValue)) {
        throw new Error("Giá cơ bản phải là số hợp lệ")
      }
      if (basePriceValue <= 0) {
        throw new Error("Giá cơ bản phải lớn hơn 0")
      }
      
      // ===== VALIDATE OPTIONS =====
      
      // Filter out options with empty values
      const validOptions = options.map(opt => ({
        ...opt,
        values: opt.values.filter(v => v.value && v.value.trim() !== "")
      })).filter(opt => opt.values.length > 0)
      
      // Check if there are valid options
      if (validOptions.length === 0) {
        throw new Error("Sản phẩm phải có ít nhất một tùy chọn (màu sắc hoặc kích thước)")
      }
      
      // Check for COLOR and SIZE options
      const colorOption = validOptions.find(opt => opt.name === "COLOR")
      const sizeOption = validOptions.find(opt => opt.name === "SIZE")
      
      if (!colorOption || colorOption.values.length === 0) {
        throw new Error("Sản phẩm phải có ít nhất một màu sắc")
      }
      
      if (!sizeOption || sizeOption.values.length === 0) {
        throw new Error("Sản phẩm phải có ít nhất một kích thước")
      }
      
      // ===== VALIDATE VARIANTS =====
      
      if (variants.length === 0) {
        throw new Error("Sản phẩm phải có ít nhất một biến thể")
      }
      
      // Validate each variant
      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i]
        
        // Check SKU
        if (!variant.sku || !variant.sku.trim()) {
          throw new Error(`Biến thể #${i + 1}: SKU là bắt buộc`)
        }
        
        // Check price
        if (variant.price === null || variant.price === undefined) {
          throw new Error(`Biến thể "${variant.sku}": Giá là bắt buộc`)
        }
        if (isNaN(variant.price)) {
          throw new Error(`Biến thể "${variant.sku}": Giá phải là số hợp lệ`)
        }
        if (variant.price < 0) {
          throw new Error(`Biến thể "${variant.sku}": Giá không được âm`)
        }
        
        // Check stock
        if (variant.stock === null || variant.stock === undefined) {
          throw new Error(`Biến thể "${variant.sku}": Tồn kho là bắt buộc`)
        }
        if (isNaN(variant.stock)) {
          throw new Error(`Biến thể "${variant.sku}": Tồn kho phải là số nguyên hợp lệ`)
        }
        if (variant.stock < 0) {
          throw new Error(`Biến thể "${variant.sku}": Tồn kho không được âm`)
        }
        if (!Number.isInteger(variant.stock)) {
          throw new Error(`Biến thể "${variant.sku}": Tồn kho phải là số nguyên`)
        }
        
        // Check option values
        if (!variant.optionValues.COLOR || !variant.optionValues.COLOR.trim()) {
          throw new Error(`Biến thể "${variant.sku}": Màu sắc là bắt buộc`)
        }
        if (!variant.optionValues.SIZE || !variant.optionValues.SIZE.trim()) {
          throw new Error(`Biến thể "${variant.sku}": Kích thước là bắt buộc`)
        }
      }

      // Ensure variants have correct id values
      const validVariants = variants.map(variant => ({
        ...variant,
        // Keep existing variantId for existing variants, null for new ones
        // If variant has a valid id (not null/undefined), keep it; otherwise set to null for new variants
        id: variant.id && variant.id !== null ? variant.id : null
      }))

      await createOrUpdateProduct({
        productId: product.productId,
        name: name.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim(),
        basePrice: basePriceValue,
        categoryId: finalCategoryId,
        options: validOptions,
        variants: validVariants,
      })
      
      // Redirect to admin products list after successful update
      window.location.href = '/admin/products'
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể lưu sản phẩm.")
    } finally {
      setIsLoading(false)
    }
  }

  // Convert categories to TreeSelect format
  const convertCategoriesToTreeData = (nodes: Category[]): any[] => {
    return nodes.map((node) => ({
      title: node.name,
      value: node.id,
      key: node.id,
      children: node.subCategories && node.subCategories.length > 0 
        ? convertCategoriesToTreeData(node.subCategories)
        : undefined
    }))
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
                  <BreadcrumbPage>Chỉnh sửa {id}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Chỉnh sửa sản phẩm</h1>
            <Button variant="outline" asChild>
              <Link href="/admin/products">Hủy</Link>
            </Button>
          </div>
          
          {/* Current Product Data Display */}
          {product && (
            <Card>
              <CardHeader>
                <CardTitle>Thông tin sản phẩm hiện tại</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Mã sản phẩm</Label>
                      <p className="text-sm text-muted-foreground font-mono">{product.productId}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Danh mục</Label>
                      <p className="text-sm text-muted-foreground">{product.category?.name}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Tùy chọn ({product.options?.length || 0})</Label>
                    <div className="mt-2 space-y-2">
                      {product.options?.map((option, index) => (
                        <div key={option.optionId} className="border rounded p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{option.name}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {option.values?.length || 0} giá trị
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {option.values?.map((value) => (
                              <Badge key={value.optionValueId} variant="secondary" className="text-xs">
                                {value.value}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Biến thể ({product.variants?.length || 0})</Label>
                    <div className="mt-2 space-y-2">
                      {product.variants?.map((variant, index) => (
                        <div key={variant.variantId} className="border rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{variant.sku}</Badge>
                              <span className="text-sm font-medium">{formatCurrency(variant.price, 'VND', 'vi-VN')}</span>
                              <span className="text-sm text-muted-foreground">Tồn kho: {variant.stock}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(variant.optionValues).map(([key, value]) => (
                              <Badge key={key} variant="secondary" className="text-xs">
                                {key}: {value}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          <div className="grid gap-6">
            {isLoading && <div>Đang tải...</div>}
            {!isLoading && error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-3">
                {error}
              </div>
            )}
            
            <form className="grid gap-6" onSubmit={onSubmit}>
              {/* Basic Product Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin cơ bản</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Tên sản phẩm</Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nhập tên sản phẩm"
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">Mô tả</Label>
                    <Textarea 
                      id="description" 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Nhập mô tả sản phẩm"
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="imageUrl">Hình ảnh sản phẩm</Label>
                    
                    {/* Image Preview */}
                    {imageUrl && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <img 
                            src={imageUrl} 
                            alt="Product preview"
                            className="w-32 h-32 object-cover rounded border"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">Hình ảnh hiện tại</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {imageUrl.split('/').pop()}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setImageUrl("")}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* URL Input */}
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Nhập URL hình ảnh</Label>
                      <Input 
                        id="imageUrl" 
                        value={imageUrl} 
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    
                    {/* File Upload */}
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Hoặc upload file</Label>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                        <div className="text-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                try {
                                  setIsLoading(true)
                                  const response = await uploadImage(file)
                                  if (response.success && response.data) {
                                    setImageUrl(response.data)
                                  }
                                } catch (error) {
                                  console.error('Image upload failed:', error)
                                  setError('Không thể upload hình ảnh. Vui lòng thử lại.')
                                } finally {
                                  setIsLoading(false)
                                }
                              }
                            }}
                            className="hidden"
                            id="product-image-upload"
                            disabled={isLoading}
                          />
                          <label 
                            htmlFor="product-image-upload"
                            className="cursor-pointer"
                          >
                            {isLoading ? (
                              <div className="space-y-2">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                <p className="text-sm text-muted-foreground">Đang upload...</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                                <p className="text-sm text-muted-foreground">
                                  Nhấn để upload hình ảnh sản phẩm
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  JPG, PNG, GIF tối đa 10MB
                                </p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="basePrice">Giá cơ bản</Label>
                      <Input
                        id="basePrice"
                        type="text"
                        value={basePrice}
                        onChange={(e) => {
                          const raw = e.target.value
                          const digits = raw.replace(/\D+/g, '').replace(/^0+(?=\d)/, '')
                          setBasePrice(digits)
                        }}
                        placeholder="0"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="category">Danh mục</Label>
                      <TreeSelect
                        style={{ width: '100%' }}
                        value={categoryId}
                        placeholder="Chọn danh mục"
                        allowClear
                        treeDefaultExpandAll
                        onChange={(value) => setCategoryId(value)}
                        treeData={convertCategoriesToTreeData(categories)}
                        loading={isLoadingCategories}
                        styles={{
                          popup: {
                            root: { maxHeight: 300, overflow: 'auto' }
                          }
                        }}
                      />
                      {categoryId ? (
                        <p className="text-xs text-muted-foreground">Đã chọn: {categoryId}</p>
                      ) : product?.category?.name ? (
                        <p className="text-xs text-muted-foreground">Hiện tại: {product.category.name}</p>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Options */}
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
                                      onKeyDown={(e) => {
                                        // Ngăn các listener global chặn phím (bao gồm Space)
                                        e.stopPropagation()
                                      }}
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
                                       Hình ảnh màu sắc
                                     </Label>
                                     
                                     {/* Image Preview */}
                                     {hasImage && (
                                       <div className="space-y-2">
                                         <div className="flex items-center gap-2">
                                           <img 
                                             src={value.imageUrl[0]} 
                                             alt={value.value}
                                             className="w-16 h-16 object-cover rounded border"
                                             onError={(e) => {
                                               const target = e.target as HTMLImageElement;
                                               target.style.display = 'none';
                                             }}
                                           />
                                           <div className="flex-1">
                                             <p className="text-sm text-muted-foreground">Hình ảnh hiện tại</p>
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
                                     )}
                                     
                                     {/* URL Input */}
                                     <div className="space-y-2">
                                       <Label className="text-xs text-muted-foreground">Nhập URL hình ảnh</Label>
                                       <Input 
                                         type="url"
                                         placeholder="https://example.com/color-image.jpg"
                                         value={hasImage ? value.imageUrl[0] : ""}
                                         onChange={(e) => {
                                           const url = e.target.value
                                           updateOptionValue(option.name, valueIndex, 'imageUrl', url ? [url] : [])
                                         }}
                                         className="text-sm"
                                       />
                                     </div>
                                     
                                     {/* File Upload */}
                                     <div className="space-y-2">
                                       <Label className="text-xs text-muted-foreground">Hoặc upload file</Label>
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
                                                 <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                                                 <p className="text-sm text-muted-foreground">
                                                   Nhấn để upload ảnh màu sắc
                                                 </p>
                                                 <p className="text-xs text-muted-foreground">
                                                   JPG, PNG, GIF tối đa 10MB
                                                 </p>
                                               </div>
                                             )}
                                           </label>
                                         </div>
                                       </div>
                                     </div>
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

              {/* Product Variants - Preview Only */}
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

              {/* Form Actions */}
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Đang lưu..." : "Lưu sản phẩm"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/admin/products">Hủy</Link>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


