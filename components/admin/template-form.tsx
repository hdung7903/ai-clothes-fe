"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createOrUpdateTemplate, getTemplateById } from "@/services/templateServices"
import type { CreateOrUpdateTemplateRequest } from "@/types/template"
import { searchProducts, type SearchProductsQuery, getProductById } from "@/services/productService"
import type { ProductSummaryItem, ProductDetail } from "@/types/product"
import { uploadImage } from "@/services/storageService"
import { Palette, Package, Settings, Image, Plus, Check, X, Upload, Eye } from "lucide-react"

interface TemplateFormProps {
  templateId?: string;
  mode: 'create' | 'edit';
  productId?: string;
}

// Predefined print area groups for better UX (limited as requested)
const printAreaGroups = [
  {
    title: 'Thân áo',
    items: ['Mặt trước', 'Mặt sau'],
  },
  {
    title: 'Tay áo',
    items: ['Tay trái', 'Tay phải'],
  },
]

const groupedAreasFlat: string[] = printAreaGroups.flatMap(g => g.items)

export function TemplateForm({ templateId, mode, productId }: TemplateFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [formData, setFormData] = React.useState<CreateOrUpdateTemplateRequest>({
    templateId: "",
    productId: productId || "",
    productOptionValueId: "",
    printAreaName: "",
    imageUrl: "",
  })

  const [products, setProducts] = React.useState<ProductSummaryItem[]>([])
  const [productDetail, setProductDetail] = React.useState<ProductDetail | null>(null)
  const [isLoadingProducts, setIsLoadingProducts] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [leftImageFile, setLeftImageFile] = React.useState<File | null>(null)
  const [leftImagePreview, setLeftImagePreview] = React.useState<string | null>(null)
  const [addedAreas, setAddedAreas] = React.useState<{ printAreaName: string; url?: string; file?: File | null; previewUrl?: string | null }[]>([])
  const [editImageFile, setEditImageFile] = React.useState<File | null>(null)
  const [editImagePreview, setEditImagePreview] = React.useState<string | null>(null)
  const [originalPrintAreaName, setOriginalPrintAreaName] = React.useState<string>("")
  const [originalImageUrl, setOriginalImageUrl] = React.useState<string>("")
  const [selectedArea, setSelectedArea] = React.useState<string>("")
  const [selectedAreaImage, setSelectedAreaImage] = React.useState<File | null>(null)
  const [selectedAreaPreview, setSelectedAreaPreview] = React.useState<string | null>(null)

  React.useEffect(() => {
    // Load products list for selection
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

  // Load product detail when productId is provided from props
  React.useEffect(() => {
    if (productId && mode === 'create') {
      let ignore = false
      const run = async () => {
        try {
          const res = await getProductById(productId)
          if (!ignore && res.success) {
            setProductDetail(res.data ?? null)
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
          if (!ignore) {
            if (res.success && res.data) {
              setFormData({
                templateId: res.data.id,
                productId: res.data.productId,
                productOptionValueId: res.data.productOptionValueId,
                printAreaName: res.data.printAreaName,
                imageUrl: res.data.imageUrl,
              })
              // Set the current print area as selected for edit mode
              setSelectedArea(res.data.printAreaName)
              setOriginalPrintAreaName(res.data.printAreaName)
              setOriginalImageUrl(res.data.imageUrl)
              // Load product detail to populate option values
              try {
                const detailRes = await getProductById(res.data.productId)
                if (detailRes.success) setProductDetail(detailRes.data ?? null)
              } catch { /* noop */ }
            } else {
              setError('Không tải được dữ liệu template')
            }
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
  }, [mode, templateId])

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
        // Resolve image URLs: use direct URL if provided, otherwise upload file
        const resolved = await Promise.all(addedAreas.map(async (a) => {
          let finalUrl = a.url || ''
          if (!finalUrl) {
            if (!a.file) throw new Error('Thiếu ảnh cho khu vực ' + a.printAreaName)
            const uploadRes = await uploadImage(a.file)
            if (!uploadRes.success || !uploadRes.data) throw new Error('Upload ảnh thất bại cho ' + a.printAreaName)
            finalUrl = uploadRes.data
          }
          return {
            templateId: null,
            productId: formData.productId,
            productOptionValueId: formData.productOptionValueId,
            printAreaName: a.printAreaName,
            imageUrl: finalUrl,
          }
        }))
        const results = await Promise.all(resolved.map(payload => createOrUpdateTemplate(payload)))
        const anyFail = results.some(r => !r.success)
        if (anyFail) {
          setError('Một số khu vực không lưu được. Vui lòng kiểm tra lại.')
        } else {
          router.push('/admin/templates')
        }
      } else {
        // Edit mode: if a new file selected, upload first
        let finalImageUrl = formData.imageUrl
        if (mode === 'edit' && editImageFile) {
          const up = await uploadImage(editImageFile)
          if (!up.success || !up.data) throw new Error('Upload ảnh thất bại')
          finalImageUrl = up.data
        } else if (!finalImageUrl && selectedAreaImage) {
          // fallback if user used area image selector
          const up = await uploadImage(selectedAreaImage)
          if (!up.success || !up.data) throw new Error('Upload ảnh thất bại')
          finalImageUrl = up.data
        }
        // Block submit if area changed and no new image provided
        if (selectedArea && selectedArea !== originalPrintAreaName && !editImageFile && !formData.imageUrl) {
          throw new Error('Vui lòng chọn ảnh mới cho khu vực đã đổi')
        }
        const payload: CreateOrUpdateTemplateRequest = {
          ...formData,
          imageUrl: finalImageUrl,
          templateId: mode === 'edit' ? (formData.templateId || templateId || "") : null, // Gửi null khi tạo mới
        }
        const res = await createOrUpdateTemplate(payload)
        if (res.success) {
          router.push('/admin/templates')
        } else {
          setError('Lưu template thất bại')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu template thất bại')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateOrUpdateTemplateRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleProductChange = async (productId: string) => {
    setFormData(prev => ({ ...prev, productId, productOptionValueId: "" }))
    setProductDetail(null)
    if (!productId) return
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

  const handleLocalFileSelect = (file?: File | null) => {
    if (!file) {
      setLeftImageFile(null)
      setLeftImagePreview(null)
      return
    }
    setLeftImageFile(file)
    try {
      const url = URL.createObjectURL(file)
      setLeftImagePreview(url)
    } catch {
      setLeftImagePreview(null)
    }
  }

  const handleAreaSelect = (areaName: string) => {
    // In edit mode, allow changing the print area
    if (mode === 'edit') {
      setSelectedArea(areaName)
      setFormData(prev => ({
        ...prev,
        printAreaName: areaName,
        // Clear url when switching to a different area to avoid showing old area's image
        imageUrl: areaName === originalPrintAreaName ? prev.imageUrl : "",
      }))
      // Clear edit previews when switching area
      setEditImageFile(null)
      setEditImagePreview(null)
      return
    }
    // In create mode, check if already added
    const isAlreadyAdded = addedAreas.some(a => a.printAreaName.toLowerCase() === areaName.toLowerCase())
    if (isAlreadyAdded) return
    setSelectedArea(areaName)
    setFormData(prev => ({ ...prev, printAreaName: areaName }))
  }

  const handleAreaImageSelect = (file?: File | null) => {
    if (!file) {
      setSelectedAreaImage(null)
      setSelectedAreaPreview(null)
      return
    }
    setSelectedAreaImage(file)
    try {
      const url = URL.createObjectURL(file)
      setSelectedAreaPreview(url)
    } catch {
      setSelectedAreaPreview(null)
    }
  }

  const handleCompleteArea = () => {
    if (!selectedArea || (!formData.imageUrl && !selectedAreaImage)) return
    
    const newItem = selectedAreaImage
      ? { printAreaName: selectedArea, file: selectedAreaImage, previewUrl: selectedAreaPreview ?? null }
      : { printAreaName: selectedArea, url: formData.imageUrl }
    
    setAddedAreas(prev => [...prev, newItem])
    setSelectedArea("")
    setSelectedAreaImage(null)
    setSelectedAreaPreview(null)
    setFormData(prev => ({ ...prev, printAreaName: '', imageUrl: '' }))
    setLeftImageFile(null)
    setLeftImagePreview(null)
  }

  if (mode === 'edit' && isLoading && !formData.templateId) {
    return <div>Đang tải dữ liệu template...</div>
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Palette className="h-8 w-8 text-primary" />
            {mode === 'create' ? 'Tạo Template mới' : 'Chỉnh sửa Template'}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'create' ? 'Thiết kế và tạo template cho sản phẩm' : 'Cập nhật thông tin template'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            <X className="h-4 w-4 mr-2" />
            Hủy
          </Button>
          <Button type="submit" form="template-form" disabled={isLoading} className="bg-primary hover:bg-primary/90">
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang lưu...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                {mode === 'create' ? 'Lưu tất cả' : 'Cập nhật'}
              </>
            )}
          </Button>
        </div>
      </div>

      <form id="template-form" onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertDescription className="flex items-center gap-2">
              <X className="h-4 w-4" />
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Form Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Thông tin sản phẩm
                </CardTitle>
                <CardDescription>Chọn sản phẩm và tùy chọn để tạo template</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Chọn sản phẩm *</Label>
                  <Select value={formData.productId} onValueChange={handleProductChange} disabled={isLoading || isLoadingProducts || (mode === 'create' && !!productId)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={isLoadingProducts ? 'Đang tải sản phẩm...' : 'Chọn sản phẩm'} />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.productId} value={p.productId}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {mode === 'create' && productId && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Sản phẩm đã được chọn từ trang quản lý sản phẩm
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Chọn Option Value *</Label>
                  <Select
                    value={formData.productOptionValueId}
                    onValueChange={(v) => handleInputChange('productOptionValueId', v)}
                    disabled={isLoading || !formData.productId || availableOptionValues.length === 0}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={!formData.productId ? 'Chọn sản phẩm trước' : (availableOptionValues.length ? 'Chọn option value' : 'Không có option value')} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableOptionValues.map((ov) => (
                        <SelectItem key={ov.id} value={ov.id}>{ov.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Print Area Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Khu vực in (Print area) *
                </CardTitle>
                <CardDescription>Chọn khu vực trên sản phẩm để in thiết kế</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {printAreaGroups.map(group => (
                    <div key={group.title} className="col-span-2 md:col-span-1">
                      <div className="text-sm font-medium text-muted-foreground mb-3">{group.title}</div>
                      <div className="grid grid-cols-2 gap-2">
                        {group.items.map((v) => {
                          const isAlreadyAdded = mode === 'create' && addedAreas.some(a => a.printAreaName.toLowerCase() === v.toLowerCase())
                          const isSelected = selectedArea === v
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
                                  : "hover:bg-muted border-border hover:border-primary/50") +
                                " rounded-lg border px-3 py-3 text-sm text-left transition-all duration-200"
                              }
                              disabled={isLoading || (mode === 'create' && isAlreadyAdded)}
                              title={isAlreadyAdded ? "Khu vực này đã được thêm" : ""}
                            >
                              <div className="flex items-center justify-between">
                                <span>{v}</span>
                                {isAlreadyAdded && <Check className="h-3 w-3 text-green-600" />}
                                {isSelected && !isAlreadyAdded && <div className="h-2 w-2 rounded-full bg-primary" />}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Image Upload */}
            {selectedArea && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Hình ảnh cho {selectedArea} *
                  </CardTitle>
                  <CardDescription>Upload hình ảnh hoặc nhập URL cho khu vực đã chọn</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">URL hình ảnh</Label>
                    <Input
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                      placeholder="Dán URL hình ảnh (https://...)"
                      disabled={isLoading || isUploading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Hoặc upload file</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleAreaImageSelect((e.target as HTMLInputElement).files?.[0] || null)}
                        disabled={isLoading || isUploading}
                        className="flex-1"
                      />
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  {(selectedAreaPreview || (mode === 'edit' && formData.imageUrl)) && (
                    <div className="space-y-2">
                      <Label>Xem trước</Label>
                      <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={selectedAreaPreview || formData.imageUrl} 
                          alt="Preview" 
                          className="aspect-square w-full max-w-xs rounded-lg object-cover ring-1 ring-border shadow-sm" 
                        />
                        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                          <Eye className="h-3 w-3 inline mr-1" />
                          Preview
                        </div>
                      </div>
                    </div>
                  )}

                  {mode === 'create' && (
                    <Button
                      type="button"
                      onClick={handleCompleteArea}
                      disabled={!selectedArea || (!formData.imageUrl && !selectedAreaImage)}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Hoàn thành chọn {selectedArea}
                    </Button>
                  )}
                  
                  {mode === 'edit' && selectedArea !== originalPrintAreaName && (
                    <Alert className="border-amber-200 bg-amber-50">
                      <AlertDescription className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Bạn vừa đổi khu vực. Hãy chọn ảnh mới cho khu vực này trước khi cập nhật.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Preview */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Khu vực đã thêm
                </CardTitle>
                <CardDescription>
                  {mode === 'edit' ? 'Template hiện tại' : `${addedAreas.length} khu vực`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mode === 'edit' ? (
                  <div className="space-y-4">
                    <div className="rounded-lg border p-4">
                      <div className="text-sm font-medium mb-3">{selectedArea || formData.printAreaName || 'Print area'}</div>
                      <div className="space-y-3">
                        {(
                          editImagePreview ||
                          selectedAreaPreview ||
                          (selectedArea === originalPrintAreaName && formData.imageUrl)
                        ) ? (
                          <div className="relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={editImagePreview || selectedAreaPreview || formData.imageUrl} 
                              alt={selectedArea || formData.printAreaName || 'Preview'} 
                              className="aspect-square w-full rounded-lg object-cover ring-1 ring-border shadow-sm" 
                            />
                            <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                              <Eye className="h-3 w-3 inline mr-1" />
                              Current
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-square w-full rounded-lg border-2 border-dashed border-muted bg-muted/40 flex items-center justify-center">
                            <div className="text-center text-muted-foreground">
                              <Image className="h-8 w-8 mx-auto mb-2" />
                              <p className="text-sm">Chưa có hình ảnh</p>
                            </div>
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label className="text-xs">Thay đổi hình ảnh</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const f = (e.target as HTMLInputElement).files?.[0] || null
                              setEditImageFile(f)
                              if (f) {
                                try {
                                  const u = URL.createObjectURL(f)
                                  setEditImagePreview(u)
                                } catch {
                                  setEditImagePreview(null)
                                }
                              } else {
                                setEditImagePreview(null)
                              }
                            }}
                            disabled={isLoading || isUploading}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {addedAreas.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Palette className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">Chưa có khu vực nào</p>
                        <p className="text-xs">Thêm ở khung bên trái</p>
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
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {(a.previewUrl || a.url) ? (
                                <div className="relative">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img 
                                    src={a.previewUrl || a.url!} 
                                    alt={a.printAreaName} 
                                    className="aspect-square w-full rounded-md object-cover ring-1 ring-border" 
                                  />
                                  <div className="absolute top-1 right-1 bg-black/50 text-white text-xs px-1 py-0.5 rounded">
                                    {idx + 1}
                                  </div>
                                </div>
                              ) : (
                                <div className="aspect-square w-full rounded-md border-2 border-dashed border-muted bg-muted/40 flex items-center justify-center">
                                  <Image className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}



