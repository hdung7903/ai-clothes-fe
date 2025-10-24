"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createOrUpdateTemplate, getTemplateById, getTemplatesByProduct, deleteTemplateById } from "@/services/templateServices"
import type { CreateOrUpdateTemplateRequest, TemplateSummaryItem } from "@/types/template"
import { searchProducts, type SearchProductsQuery, getProductById } from "@/services/productService"
import type { ProductSummaryItem, ProductDetail } from "@/types/product"
import { uploadImage } from "@/services/storageService"
import { toast } from "sonner"

interface TemplateEditFormProps {
  templateId?: string;
  mode?: 'create' | 'edit';
  productId?: string;
}

const editPrintAreaGroups = [
  { title: 'Thân áo', items: ['Mặt trước', 'Mặt sau'] },
  { title: 'Tay áo', items: ['Tay trái', 'Tay phải'] },
]

export function TemplateEditForm({ templateId, mode = 'edit', productId }: TemplateEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [products, setProducts] = React.useState<ProductSummaryItem[]>([])
  const [productDetail, setProductDetail] = React.useState<ProductDetail | null>(null)
  const [isLoadingProducts, setIsLoadingProducts] = React.useState(false)

  const [formData, setFormData] = React.useState<CreateOrUpdateTemplateRequest>({
    templateId: "",
    productId: productId || "",
    productOptionValueId: "",
    printAreaName: "",
    imageUrl: "",
  })

  const [selectedArea, setSelectedArea] = React.useState<string>("")
  const [originalArea, setOriginalArea] = React.useState<string>("")
  const [originalImageUrl, setOriginalImageUrl] = React.useState<string>("")
  const [newImageFile, setNewImageFile] = React.useState<File | null>(null)
  const [newImagePreview, setNewImagePreview] = React.useState<string | null>(null)
  // Store image previews for each area
  const [areaImagePreviews, setAreaImagePreviews] = React.useState<Record<string, string>>({})
  const [areaImageFiles, setAreaImageFiles] = React.useState<Record<string, File>>({})
  const [productInfo, setProductInfo] = React.useState<{ name: string; imageUrl: string; optionName: string; optionValue: string } | null>(null)
  const [templatesForOption, setTemplatesForOption] = React.useState<TemplateSummaryItem[]>([])
  
  // For create mode - store added areas with uploaded URLs
  const [addedAreas, setAddedAreas] = React.useState<{ printAreaName: string; url: string }[]>([])
  
  // Ref for file input to reset it
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    let ignore = false
    const run = async () => {
      try {
        setIsLoadingProducts(true)
        const payload: SearchProductsQuery = {
          SearchTerm: undefined,
          CategoryId: undefined,
          MinPrice: undefined as any,
          MaxPrice: undefined as any,
          SortBy: 'CREATED_ON',
          SortDescending: true,
          PageNumber: 1,
          PageSize: 100,
        }
        const res = await searchProducts(payload)
        if (!ignore) setProducts(res.data?.items ?? [])
      } finally {
        if (!ignore) setIsLoadingProducts(false)
      }
    }
    run()
    return () => { ignore = true }
  }, [])

  // Load product detail when productId is provided from props (create mode)
  React.useEffect(() => {
    if (productId && mode === 'create') {
      let ignore = false
      const run = async () => {
        try {
          const res = await getProductById(productId)
          if (!ignore && res.success) {
            setProductDetail(res.data ?? null)
            if (res.data) {
              setProductInfo({
                name: res.data.name,
                imageUrl: res.data.imageUrl || "",
                optionName: "",
                optionValue: "",
              })
            }
          }
        } catch { /* noop */ }
      }
      run()
      return () => { ignore = true }
    }
  }, [productId, mode])

  React.useEffect(() => {
    if (mode === 'edit' && templateId) {
      let ignore = false
      const run = async () => {
        try {
          setIsLoading(true)
          const res = await getTemplateById(templateId)
          if (!ignore && res.success && res.data) {
            setFormData({
              templateId: res.data.id,
              productId: res.data.productId,
              productOptionValueId: res.data.productOptionValueId,
              printAreaName: res.data.printAreaName,
              imageUrl: res.data.imageUrl,
            })
            setSelectedArea(res.data.printAreaName)
            setOriginalArea(res.data.printAreaName)
            setOriginalImageUrl(res.data.imageUrl)
            setProductInfo({
              name: res.data.product?.name || res.data.productName,
              imageUrl: res.data.product?.imageUrl || "",
              optionName: res.data.productOptionName,
              optionValue: res.data.productOptionValue,
            })
            const detail = await getProductById(res.data.productId)
            if (detail.success) setProductDetail(detail.data ?? null)
          }
        } catch {
          if (!ignore) setError('Không tải được dữ liệu template')
        } finally {
          if (!ignore) setIsLoading(false)
        }
      }
      run()
      return () => { ignore = true }
    }
  }, [templateId, mode])

  const handleInputChange = (field: keyof CreateOrUpdateTemplateRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleProductChange = async (productId: string) => {
    setFormData(prev => ({ ...prev, productId, productOptionValueId: "" }))
    try {
      const res = await getProductById(productId)
      if (res.success) setProductDetail(res.data ?? null)
    } catch { /* noop */ }
  }

  const availableOptionValues = React.useMemo(() => {
    if (!productDetail) return [] as { id: string; label: string }[]
    const list: { id: string; label: string }[] = []
    for (const opt of productDetail.options) {
      // Only show color options, skip size options
      if (opt.name.toLowerCase().includes('color') || opt.name.toLowerCase().includes('màu')) {
        for (const val of opt.values) {
          list.push({ id: val.optionValueId, label: val.value })
        }
      }
    }
    return list
  }, [productDetail])

  // Default option value to first if missing
  React.useEffect(() => {
    if (!formData.productOptionValueId && availableOptionValues.length > 0) {
      setFormData(prev => ({ ...prev, productOptionValueId: availableOptionValues[0].id }))
    }
  }, [availableOptionValues, formData.productOptionValueId])

  // Clear area image previews when option value changes and update product info
  React.useEffect(() => {
    // Clear stored previews when option value changes
    setAreaImagePreviews({})
    setAreaImageFiles({})
    setNewImagePreview(null)
    setNewImageFile(null)
    
    // Update product info when option value changes
    if (formData.productOptionValueId && productDetail) {
      const selectedOption = productDetail.options.find(opt => 
        opt.values.some(val => val.optionValueId === formData.productOptionValueId)
      )
      const selectedValue = selectedOption?.values.find(val => val.optionValueId === formData.productOptionValueId)
      
      if (selectedOption && selectedValue) {
        setProductInfo(prev => ({
          ...prev!,
          optionName: selectedOption.name,
          optionValue: selectedValue.value
        }))
      }
    }
  }, [formData.productOptionValueId, productDetail])

  // Fetch templates for current product + option value
  React.useEffect(() => {
    let ignore = false
    const run = async () => {
      if (!formData.productId || !formData.productOptionValueId) { setTemplatesForOption([]); return }
      try {
        const res = await getTemplatesByProduct(formData.productId, formData.productOptionValueId)
        if (!ignore && res.success) setTemplatesForOption(res.data || [])
      } catch { if (!ignore) setTemplatesForOption([]) }
    }
    run()
    return () => { ignore = true }
  }, [formData.productId, formData.productOptionValueId])

  // When option value changes, update current area's image from templates (if exists) unless user selected a new file
  React.useEffect(() => {
    if (!selectedArea) return
    // If user has uploaded an image for this area, use that instead of template data
    if (areaImagePreviews[selectedArea]) {
      setFormData(prev => ({ ...prev, imageUrl: areaImagePreviews[selectedArea] }))
      return
    }
    const match = templatesForOption.find(t => t.printAreaName === selectedArea)
    setFormData(prev => ({ ...prev, imageUrl: match?.imageUrl || "" }))
  }, [templatesForOption, selectedArea, areaImagePreviews])

  const handleAreaSelect = (areaName: string) => {
    // In edit mode, allow changing the print area
    if (mode === 'edit') {
      setSelectedArea(areaName)
      setFormData(prev => ({
        ...prev,
        printAreaName: areaName,
        // Clear url when switching to a different area to avoid showing old area's image
        imageUrl: areaName === originalArea ? prev.imageUrl : "",
      }))
      // Clear edit previews when switching area
      setNewImageFile(null)
      setNewImagePreview(null)
      return
    }
    // In create mode, check if already added
    const isAlreadyAdded = addedAreas.some(a => a.printAreaName.toLowerCase() === areaName.toLowerCase())
    if (isAlreadyAdded) return
    setSelectedArea(areaName)
    setFormData(prev => ({ ...prev, printAreaName: areaName, imageUrl: "" }))
    // Clear file input and previews when switching area in create mode
    setNewImageFile(null)
    setNewImagePreview(null)
    // Reset file input element
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleNewImageSelect = async (file?: File | null) => {
    setNewImageFile(file || null)
    if (!file) { 
      setNewImagePreview(null)
      // Remove from stored previews for current area
      if (selectedArea) {
        setAreaImagePreviews(prev => {
          const updated = { ...prev }
          delete updated[selectedArea]
          return updated
        })
        setAreaImageFiles(prev => {
          const updated = { ...prev }
          delete updated[selectedArea]
          return updated
        })
        // Clear imageUrl when removing file
        setFormData(prev => ({ ...prev, imageUrl: "" }))
      }
      return 
    }
    
    // Upload image immediately when file is selected
    try {
      setIsLoading(true)
      const uploadRes = await uploadImage(file)
      if (!uploadRes.success || !uploadRes.data) {
        toast.error('Upload ảnh thất bại')
        setNewImageFile(null)
        setNewImagePreview(null)
        return
      }
      
      const uploadedUrl = uploadRes.data
      setNewImagePreview(uploadedUrl)
      
      // Store the uploaded URL and file for current area
      if (selectedArea) {
        setAreaImagePreviews(prev => ({ ...prev, [selectedArea]: uploadedUrl }))
        setAreaImageFiles(prev => ({ ...prev, [selectedArea]: file }))
        // Update formData with uploaded URL
        setFormData(prev => ({ ...prev, imageUrl: uploadedUrl }))
      }
      
      toast.success('Upload ảnh thành công')
    } catch (error) {
      toast.error('Upload ảnh thất bại')
      setNewImagePreview(null)
      setNewImageFile(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCurrentImage = async () => {
    if (mode === 'edit' && selectedArea) {
      // Find existing template for this area
      const existingTemplate = templatesForOption.find(t => t.printAreaName === selectedArea)
      
      if (existingTemplate && existingTemplate.id) {
        try {
          setIsLoading(true)
          const res = await deleteTemplateById(existingTemplate.id)
          if (res.success) {
            toast.success("Xóa template thành công")
            // Refresh templates list
            const refreshRes = await getTemplatesByProduct(formData.productId, formData.productOptionValueId)
            if (refreshRes.success) {
              setTemplatesForOption(refreshRes.data || [])
            }
          } else {
            toast.error("Xóa template thất bại")
            return
          }
        } catch (error) {
          toast.error("Xóa template thất bại")
          return
        } finally {
          setIsLoading(false)
        }
      }
    }
    
    setFormData(prev => ({ ...prev, imageUrl: "" }))
    setNewImageFile(null)
    setNewImagePreview(null)
    // Remove from stored previews for current area
    if (selectedArea) {
      setAreaImagePreviews(prev => {
        const updated = { ...prev }
        delete updated[selectedArea]
        return updated
      })
      setAreaImageFiles(prev => {
        const updated = { ...prev }
        delete updated[selectedArea]
        return updated
      })
    }
  }

  const handleCompleteArea = () => {
    if (!selectedArea || !formData.imageUrl) return
    
    // Since image is already uploaded in handleNewImageSelect, just use the URL from formData
    const newItem = { printAreaName: selectedArea, url: formData.imageUrl }
    
    setAddedAreas(prev => [...prev, newItem])
    setSelectedArea("")
    setNewImageFile(null)
    setNewImagePreview(null)
    setFormData(prev => ({ ...prev, printAreaName: '', imageUrl: '' }))
    // Reset file input element
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      if (mode === 'create') {
        if (addedAreas.length === 0) {
          setError('Vui lòng thêm ít nhất một khu vực in')
          setIsLoading(false)
          return
        }
        // Images are already uploaded, just use the URLs
        const resolved = addedAreas.map((a) => {
          if (!a.url) throw new Error('Thiếu ảnh cho khu vực ' + a.printAreaName)
          return {
            templateId: null, // Always null for create mode
            productId: formData.productId,
            productOptionValueId: formData.productOptionValueId,
            printAreaName: a.printAreaName,
            imageUrl: a.url,
          }
        })
        const results = await Promise.all(resolved.map(payload => createOrUpdateTemplate(payload)))
        const anyFail = results.some(r => !r.success)
        if (anyFail) {
          setError('Một số khu vực không lưu được. Vui lòng kiểm tra lại.')
          toast.error('Một số khu vực không lưu được. Vui lòng kiểm tra lại.')
        } else {
          // Success - no navigation, just show success message or reset form
          setAddedAreas([])
          setSelectedArea("")
          setFormData(prev => ({ ...prev, printAreaName: '', imageUrl: '' }))
          toast.success(`Tạo thành công ${resolved.length} template(s)`)
        }
      } else {
        // Edit mode: image is already uploaded in handleNewImageSelect if new file was selected
        let finalImageUrl = formData.imageUrl
        
        if (!finalImageUrl) {
          throw new Error('Vui lòng chọn ảnh cho template')
        }
        
        // For edit mode, check if this area has existing template with image from API
        const existingTemplate = templatesForOption.find(t => t.printAreaName === selectedArea)
        
        // Determine templateId based on whether area has existing template with image
        let templateIdToUse: string | null = null
        
        if (existingTemplate && existingTemplate.imageUrl) {
          // Area has existing template with image - use its ID to update
          templateIdToUse = existingTemplate.id
        } else {
          // Area doesn't have existing template with image - create new (null ID)
          templateIdToUse = null
        }
        
        const payload: CreateOrUpdateTemplateRequest = {
          ...formData,
          templateId: templateIdToUse,
          imageUrl: finalImageUrl,
        }
        const res = await createOrUpdateTemplate(payload)
        if (res.success) {
          // Success - no navigation, just show success message
          setError(null)
          toast.success(templateIdToUse ? 'Cập nhật template thành công' : 'Tạo template mới thành công')
          // Refresh templates list
          const refreshRes = await getTemplatesByProduct(formData.productId, formData.productOptionValueId)
          if (refreshRes.success) {
            setTemplatesForOption(refreshRes.data || [])
          }
        } else {
          setError('Lưu template thất bại')
          toast.error('Lưu template thất bại')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu template thất bại')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Tạo Template mới' : 'Chỉnh sửa Template'}</CardTitle>
        <CardDescription>{mode === 'create' ? 'Thiết kế và tạo template cho sản phẩm' : 'Cập nhật thông tin template'}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {productInfo && (
            <div className="rounded-md border p-3 flex items-center gap-3">
              {productInfo.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={productInfo.imageUrl} alt={productInfo.name} className="h-12 w-12 rounded object-cover ring-1 ring-border" />
              ) : (
                <div className="h-12 w-12 rounded border bg-muted/40" />)
              }
              <div className="text-sm">
                <div className="font-medium">{productInfo.name}</div>
                <div className="text-muted-foreground">{productInfo.optionName}: {productInfo.optionValue}</div>
              </div>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">

              <div className="space-y-2">
                <Label>Giá trị tùy chọn (theo sản phẩm) *</Label>
                <Select
                  value={formData.productOptionValueId}
                  onValueChange={(v) => handleInputChange('productOptionValueId', v)}
                  disabled={isLoading || !formData.productId || availableOptionValues.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={!formData.productId ? 'Chọn sản phẩm trước' : (availableOptionValues.length ? 'Chọn giá trị' : 'Không có giá trị')} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableOptionValues.map((ov) => (
                      <SelectItem key={ov.id} value={ov.id}>{ov.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Khu vực in (Print area) *</Label>
                <div className="rounded-md border p-3">
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {editPrintAreaGroups.map(group => (
                      <div key={group.title} className="col-span-2 md:col-span-1">
                        <div className="text-xs font-medium text-muted-foreground mb-1">{group.title}</div>
                        <div className="grid grid-cols-2 gap-2">
                          {group.items.map((v) => {
                            const isSelected = selectedArea === v
                            const isAlreadyAdded = mode === 'create' && addedAreas.some(a => a.printAreaName.toLowerCase() === v.toLowerCase())
                            const existsForOption = templatesForOption.some(t => t.printAreaName === v)
                            return (
                              <button
                                type="button"
                                key={v}
                                onClick={() => handleAreaSelect(v)}
                                className={
                                  (isSelected
                                    ? "ring-2 ring-primary bg-primary/10 text-primary border-primary"
                                    : isAlreadyAdded
                                    ? "opacity-50 cursor-not-allowed bg-muted border-muted"
                                    : existsForOption
                                    ? "border-green-500 bg-green-50 hover:bg-green-100"
                                    : "hover:bg-muted border-border hover:border-primary/50") +
                                  " rounded-md border px-2 py-2 text-sm text-left transition-all duration-200"
                                }
                                disabled={isLoading || (mode === 'create' && isAlreadyAdded)}
                                title={
                                  isAlreadyAdded 
                                    ? "Khu vực này đã được thêm" 
                                    : existsForOption 
                                    ? "Khu vực này đã có template" 
                                    : ""
                                }
                              >
                                <div className="flex items-center justify-between">
                                  <span>{v}</span>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Hình ảnh *</Label>
                <div className="flex flex-col gap-2">
                  <Input
                    value={formData.imageUrl}
                    onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                    placeholder="Dán URL hình ảnh (https://...)"
                    disabled={isLoading}
                  />
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleNewImageSelect((e.target as HTMLInputElement).files?.[0] || null)}
                    disabled={isLoading}
                  />
                  {(formData.imageUrl || newImagePreview) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteCurrentImage}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                          Đang xóa...
                        </>
                      ) : (
                        'Xóa ảnh hiện tại'
                      )}
                    </Button>
                  )}

                  {mode === 'create' && selectedArea && (
                    <Button
                      type="button"
                      onClick={handleCompleteArea}
                      disabled={!selectedArea || (!formData.imageUrl && !newImageFile)}
                      className="w-full"
                    >
                      Hoàn thành chọn {selectedArea}
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex justify-start gap-2 pt-2 md:justify-end">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>Hủy</Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang lưu...
                    </>
                  ) : (
                    mode === 'create' ? 'Lưu tất cả' : 'Cập nhật'
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-start justify-center">
              <div className="w-full rounded-lg border p-3">
                <div className="mb-2 text-sm font-medium text-muted-foreground">
                  {mode === 'create' ? 'Khu vực đã thêm' : 'Xem trước hình ảnh'}
                </div>
                {mode === 'create' ? (
                  <div className="space-y-3">
                    {addedAreas.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="text-sm">Chưa có khu vực nào</div>
                        <div className="text-xs">Thêm ở khung bên trái</div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {addedAreas.map((a, idx) => (
                          <div key={a.printAreaName + idx} className="rounded-lg border p-3">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="text-sm font-medium truncate" title={a.printAreaName}>
                                {a.printAreaName}
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setAddedAreas(prev => prev.filter((_, i) => i !== idx))}
                                className="h-6 w-6 p-0"
                              >
                                ×
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {a.url ? (
                                <div className="relative">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img 
                                    src={a.url} 
                                    alt={a.printAreaName} 
                                    className="aspect-square w-full rounded-md object-cover ring-1 ring-border" 
                                  />
                                  <div className="absolute top-1 right-1 bg-black/50 text-white text-xs px-1 py-0.5 rounded">
                                    {idx + 1}
                                  </div>
                                </div>
                              ) : (
                                <div className="aspect-square w-full rounded-md border-2 border-dashed border-muted bg-muted/40 flex items-center justify-center">
                                  <div className="text-muted-foreground">No image</div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  (newImagePreview || formData.imageUrl) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={newImagePreview || formData.imageUrl} alt={selectedArea || 'Preview'} className="aspect-square w-full rounded-md object-cover ring-1 ring-border" />
                  ) : (
                    <div className="aspect-square w-full rounded-md border bg-muted/40" />
                  )
                )}
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}


