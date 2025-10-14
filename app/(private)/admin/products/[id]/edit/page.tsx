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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, X, Upload, Eye, EyeOff } from "lucide-react"
import { Tree, TreeItem } from "@/components/ui/tree"
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
import { formatCurrency } from "@/utils/format"
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
  const [basePrice, setBasePrice] = React.useState<number | "">("")
  const [categoryId, setCategoryId] = React.useState("")
  
  // Options state
  const [options, setOptions] = React.useState<ProductOptionRequest[]>([])
  
  // Variants state
  const [variants, setVariants] = React.useState<ProductVariantRequest[]>([])
  
  // Categories tree
  const [categories, setCategories] = React.useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = React.useState(false)

  // Predefined option names
  const [optionNames] = React.useState([
    "COLOR", "SIZE"  ])

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
            setBasePrice(Number.isFinite(data.basePrice) ? data.basePrice : "")
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
        if (!ignore) setError("Failed to load product.")
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

  function mapOptionsToRequest(options: ProductOptionDetail[] | undefined) {
    return (options ?? []).map((opt) => ({
      optionId: opt.optionId,
      name: opt.name,
      values: (opt.values ?? []).map((v) => ({
        optionValueId: v.optionValueId,
        value: v.value,
        imageUrl: v.images ?? [],
      })),
    }))
  }

  function mapVariantsToRequest(variants: ProductVariantDetail[] | undefined) {
    return (variants ?? []).map((v) => ({
      id: v.variantId,
      sku: v.sku,
      price: v.price,
      stock: v.stock,
      optionValues: v.optionValues,
    }))
  }

  // Helper functions for options
  const addOption = () => {
    const newOption: ProductOptionRequest = {
      optionId: `opt_${Date.now()}`,
      name: "",
      values: []
    }
    setOptions([...options, newOption])
  }

  const updateOption = (index: number, field: keyof ProductOptionRequest, value: any) => {
    const updated = [...options]
    updated[index] = { ...updated[index], [field]: value }
    setOptions(updated)
  }

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index))
  }

  const addOptionValue = (optionIndex: number) => {
    const newValue: ProductOptionValueRequest = {
      optionValueId: `val_${Date.now()}`,
      value: "",
      imageUrl: []
    }
    const updated = [...options]
    updated[optionIndex].values.push(newValue)
    setOptions(updated)
  }


  const updateOptionValue = (optionIndex: number, valueIndex: number, field: keyof ProductOptionValueRequest, value: any) => {
    const updated = [...options]
    updated[optionIndex].values[valueIndex] = { ...updated[optionIndex].values[valueIndex], [field]: value }
    setOptions(updated)
  }

  const removeOptionValue = (optionIndex: number, valueIndex: number) => {
    const updated = [...options]
    updated[optionIndex].values.splice(valueIndex, 1)
    setOptions(updated)
  }

  // Helper functions for variants
  const addVariant = () => {
    const newVariant: ProductVariantRequest = {
      id: `var_${Date.now()}`,
      sku: "",
      price: 0,
      stock: 0,
      optionValues: {}
    }
    setVariants([...variants, newVariant])
  }

  const updateVariant = (index: number, field: keyof ProductVariantRequest, value: any) => {
    const updated = [...variants]
    updated[index] = { ...updated[index], [field]: value }
    setVariants(updated)
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  // Image upload functionality
  const handleImageUpload = async (file: File, optionIndex: number, valueIndex: number) => {
    const imageKey = `${optionIndex}-${valueIndex}`
    setUploadingImages(prev => new Set([...prev, imageKey]))
    
    try {
      const response = await uploadImage(file)
      if (response.success && response.data) {
        const updated = [...options]
        updated[optionIndex].values[valueIndex].imageUrl = [response.data]
        setOptions(updated)
        setImagePreviews(prev => ({ ...prev, [imageKey]: response.data! }))
      }
    } catch (error) {
      console.error('Image upload failed:', error)
    } finally {
      setUploadingImages(prev => {
        const newSet = new Set(prev)
        newSet.delete(imageKey)
        return newSet
      })
    }
  }

  const handleImageUrlChange = (url: string, optionIndex: number, valueIndex: number) => {
    const imageKey = `${optionIndex}-${valueIndex}`
    const updated = [...options]
    updated[optionIndex].values[valueIndex].imageUrl = [url]
    setOptions(updated)
    setImagePreviews(prev => ({ ...prev, [imageKey]: url }))
  }

  const getImagePreview = (optionIndex: number, valueIndex: number) => {
    const imageKey = `${optionIndex}-${valueIndex}`
    return imagePreviews[imageKey] || options[optionIndex]?.values[valueIndex]?.imageUrl?.[0] || ""
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!product) return
    setIsLoading(true)
    setError(null)
    try {
      const finalCategoryId = categoryId || product.category?.categoryId || ""
      if (!finalCategoryId) {
        throw new Error("Category is required")
      }
      await createOrUpdateProduct({
        productId: product.productId,
        name,
        description,
        imageUrl,
        basePrice: typeof basePrice === "number" ? basePrice : Number(basePrice || 0),
        categoryId: finalCategoryId,
        options,
        variants,
      })
    } catch {
      setError("Failed to save product.")
    } finally {
      setIsLoading(false)
    }
  }

  // Render categories recursively as a tree
  const renderCategoryNodes = (nodes: Category[]) => {
    return nodes.map((node) => (
      <TreeItem
        key={node.id}
        id={node.id}
        label={node.name}
        data={{ id: node.id, name: node.name }}
      >
        {node.subCategories && node.subCategories.length > 0
          ? renderCategoryNodes(node.subCategories)
          : null}
      </TreeItem>
    ))
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
                  <BreadcrumbLink href="/admin/dashboard">Admin</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin/products">Products</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Edit {id}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Edit Product</h1>
            <Button variant="outline" asChild>
              <Link href={`/admin/products/${id}`}>Cancel</Link>
            </Button>
          </div>
          
          {/* Current Product Data Display */}
          {product && (
            <Card>
              <CardHeader>
                <CardTitle>Current Product Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Product ID</Label>
                      <p className="text-sm text-muted-foreground font-mono">{product.productId}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Category</Label>
                      <p className="text-sm text-muted-foreground">{product.category?.name}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Options ({product.options?.length || 0})</Label>
                    <div className="mt-2 space-y-2">
                      {product.options?.map((option, index) => (
                        <div key={option.optionId} className="border rounded p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{option.name}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {option.values?.length || 0} values
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
                    <Label className="text-sm font-medium">Variants ({product.variants?.length || 0})</Label>
                    <div className="mt-2 space-y-2">
                      {product.variants?.map((variant, index) => (
                        <div key={variant.variantId} className="border rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{variant.sku}</Badge>
                              <span className="text-sm font-medium">{formatCurrency(variant.price, 'VND', 'vi-VN')}</span>
                              <span className="text-sm text-muted-foreground">Stock: {variant.stock}</span>
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
            {isLoading && <div>Loading...</div>}
            {!isLoading && error && <div className="text-destructive mb-3">{error}</div>}
            
            <form className="grid gap-6" onSubmit={onSubmit}>
              {/* Basic Product Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter product description"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input 
                      id="imageUrl" 
                      value={imageUrl} 
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="basePrice">Base Price</Label>
                      <Input
                        id="basePrice"
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        value={basePrice}
                        onChange={(e) => {
                          const v = e.target.value
                          setBasePrice(v === "" ? "" : Number(v))
                        }}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <div className="border rounded-md p-2 max-h-64 overflow-auto">
                        {isLoadingCategories ? (
                          <div className="text-sm text-muted-foreground px-2 py-1">Loading categories...</div>
                        ) : categories.length === 0 ? (
                          <div className="text-sm text-muted-foreground px-2 py-1">No categories found.</div>
                        ) : (
                          <Tree
                            onSelect={({ id }) => {
                              setCategoryId(id)
                            }}
                          >
                            {renderCategoryNodes(categories)}
                          </Tree>
                        )}
                      </div>
                      {categoryId ? (
                        <p className="text-xs text-muted-foreground">Selected: {categoryId}</p>
                      ) : product?.category?.name ? (
                        <p className="text-xs text-muted-foreground">Current: {product.category.name}</p>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Options */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Product Options</CardTitle>
                    <Button type="button" onClick={addOption} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Option
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {options.map((option, optionIndex) => (
                    <div key={option.optionId} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Option {optionIndex + 1}</h4>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeOption(optionIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label>Option Name</Label>
                        <Select value={option.name} onValueChange={(value) => updateOption(optionIndex, 'name', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select option type" />
                          </SelectTrigger>
                          <SelectContent>
                            {optionNames.map((name) => (
                              <SelectItem key={name} value={name}>
                                {name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Option Values</Label>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => addOptionValue(optionIndex)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Value
                          </Button>
                        </div>
                        
                        {option.values.map((value, valueIndex) => (
                          <div key={value.optionValueId} className="border rounded-lg p-3 space-y-3">
                            <div className="flex gap-2 items-center">
                              <Input
                                value={value.value}
                                onChange={(e) => updateOptionValue(optionIndex, valueIndex, 'value', e.target.value)}
                                placeholder="Value (e.g., Small, Red)"
                                className="flex-1"
                              />
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={() => removeOptionValue(optionIndex, valueIndex)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            {/* Option Value Image */}
                            <div className="space-y-3">
                              <Label className="text-sm">Image</Label>
                              
                              {/* Image Preview */}
                              {getImagePreview(optionIndex, valueIndex) && (
                                <div className="relative">
                                  <img
                                    src={getImagePreview(optionIndex, valueIndex)}
                                    alt={`${value.value} preview`}
                                    className="w-24 h-24 object-cover rounded-lg border"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none'
                                    }}
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="absolute -top-2 -right-2"
                                    onClick={() => {
                                      const imageKey = `${optionIndex}-${valueIndex}`
                                      const updated = [...options]
                                      updated[optionIndex].values[valueIndex].imageUrl = []
                                      setOptions(updated)
                                      setImagePreviews(prev => {
                                        const newPrev = { ...prev }
                                        delete newPrev[imageKey]
                                        return newPrev
                                      })
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                              
                              {/* Upload Options */}
                              <div className="space-y-2">
                                {/* File Upload */}
                                <div className="flex gap-2">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) {
                                        handleImageUpload(file, optionIndex, valueIndex)
                                      }
                                    }}
                                    className="hidden"
                                    id={`file-upload-${optionIndex}-${valueIndex}`}
                                  />
                                  <label
                                    htmlFor={`file-upload-${optionIndex}-${valueIndex}`}
                                    className="flex-1"
                                  >
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="w-full"
                                      disabled={uploadingImages.has(`${optionIndex}-${valueIndex}`)}
                                    >
                                      <Upload className="h-3 w-3 mr-1" />
                                      {uploadingImages.has(`${optionIndex}-${valueIndex}`) ? "Uploading..." : "Upload File"}
                                    </Button>
                                  </label>
                                </div>
                                
                                {/* URL Input */}
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="Or enter image URL"
                                    onChange={(e) => handleImageUrlChange(e.target.value, optionIndex, valueIndex)}
                                    value={value.imageUrl[0] || ""}
                                    className="flex-1"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {options.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No options added yet. Click "Add Option" to create product variations.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Product Variants */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Product Variants</CardTitle>
                    <Button type="button" onClick={addVariant} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Variant
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {variants.map((variant, variantIndex) => (
                    <div key={variant.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Variant {variantIndex + 1}</h4>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeVariant(variantIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>SKU</Label>
                          <Input
                            value={variant.sku}
                            onChange={(e) => updateVariant(variantIndex, 'sku', e.target.value)}
                            placeholder="e.g., TSHIRT-SM-RED"
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label>Price</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={variant.price}
                            onChange={(e) => updateVariant(variantIndex, 'price', Number(e.target.value))}
                            placeholder="0.00"
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label>Stock</Label>
                          <Input
                            type="number"
                            value={variant.stock}
                            onChange={(e) => updateVariant(variantIndex, 'stock', Number(e.target.value))}
                            placeholder="0"
                          />
                        </div>
                        
                        <div className="grid gap-2 col-span-2">
                          <Label>Option Values</Label>
                          <div className="space-y-2">
                            {Object.entries(variant.optionValues).map(([optionName, optionValue]) => (
                              <div key={optionName} className="flex gap-2 items-center">
                                <Badge variant="secondary" className="min-w-fit">
                                  {optionName}
                                </Badge>
                                <Input
                                  value={optionValue}
                                  onChange={(e) => {
                                    const updated = { ...variant.optionValues }
                                    updated[optionName] = e.target.value
                                    updateVariant(variantIndex, 'optionValues', updated)
                                  }}
                                  placeholder="Value"
                                  className="flex-1"
                                />
                              </div>
                            ))}
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                const optionNames = options.map(opt => opt.name).filter(name => name)
                                const newOptionName = optionNames[0] || "New Option"
                                const updated = { ...variant.optionValues }
                                updated[newOptionName] = ""
                                updateVariant(variantIndex, 'optionValues', updated)
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Option Value
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {variants.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No variants added yet. Click "Add Variant" to create product variations.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Form Actions */}
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Product"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href={`/admin/products/${id}`}>Cancel</Link>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


