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

interface TemplateFormProps {
  templateId?: string;
  mode: 'create' | 'edit';
}

// Predefined print area groups for better UX (limited as requested)
const printAreaGroups = [
  {
    title: 'Thân áo',
    items: ['Front', 'Back'],
  },
  {
    title: 'Tay áo',
    items: ['Left Sleeve', 'Right Sleeve'],
  },
]

const groupedAreasFlat: string[] = printAreaGroups.flatMap(g => g.items)

export function TemplateForm({ templateId, mode }: TemplateFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [formData, setFormData] = React.useState<CreateOrUpdateTemplateRequest>({
    templateId: "",
    productId: "",
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
      for (const val of opt.values) {
        list.push({ id: val.optionValueId, label: `${opt.name}: ${val.value}` })
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
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'Tạo Template mới' : 'Chỉnh sửa Template'}
        </CardTitle>
        <CardDescription>
          {mode === 'create' ? 'Nhập thông tin để tạo template' : 'Cập nhật thông tin template'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Chọn sản phẩm *</Label>
                <Select value={formData.productId} onValueChange={handleProductChange} disabled={isLoading || isLoadingProducts}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={isLoadingProducts ? 'Đang tải sản phẩm...' : 'Chọn sản phẩm'} />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.productId} value={p.productId}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Chọn Option Value *</Label>
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

              <div className="space-y-2">
                <Label>Khu vực in (Print area) *</Label>
                <div className="rounded-md border p-3">
                  <Input
                    placeholder="Tìm khu vực (vd: front, back, sleeve, chest...)"
                    className="mb-3"
                    onChange={(e) => {
                      const q = e.target.value.trim().toLowerCase()
                      const firstMatched = groupedAreasFlat.find(x => x.toLowerCase().includes(q))
                      if (q && firstMatched) {
                        handleInputChange('printAreaName', firstMatched)
                      }
                    }}
                    disabled={isLoading}
                  />
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {printAreaGroups.map(group => (
                      <div key={group.title} className="col-span-2 md:col-span-1">
                        <div className="text-xs font-medium text-muted-foreground mb-1">{group.title}</div>
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
                                    ? "ring-2 ring-ring bg-accent text-accent-foreground"
                                    : isAlreadyAdded
                                    ? "opacity-50 cursor-not-allowed bg-muted"
                                    : "hover:bg-muted") +
                                  " rounded-md border px-2 py-2 text-sm text-left"
                                }
                                disabled={isLoading || (mode === 'create' && isAlreadyAdded)}
                                title={isAlreadyAdded ? "Khu vực này đã được thêm" : ""}
                              >
                                {v}
                                {isAlreadyAdded && <span className="ml-1 text-xs">✓</span>}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Custom option removed per request */}
                </div>
              </div>

              {selectedArea && (
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Hình ảnh cho {selectedArea} *</Label>
                  <div className="flex flex-col gap-2">
                    <Input
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                      placeholder="Dán URL hình ảnh (https://...)"
                      disabled={isLoading || isUploading}
                    />
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleAreaImageSelect((e.target as HTMLInputElement).files?.[0] || null)}
                        disabled={isLoading || isUploading}
                      />
                      {(selectedAreaPreview || (mode === 'edit' && formData.imageUrl)) ? (
                        <div className="mt-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={selectedAreaPreview || formData.imageUrl} alt="Preview" className="aspect-square w-full max-w-xs rounded-md object-cover ring-1 ring-border" />
                        </div>
                      ) : null}
                    </div>
                    {mode === 'create' && (
                      <Button
                        type="button"
                        onClick={handleCompleteArea}
                        disabled={!selectedArea || (!formData.imageUrl && !selectedAreaImage)}
                        className="w-full"
                      >
                        Hoàn thành chọn {selectedArea}
                      </Button>
                    )}
                    {mode === 'edit' && selectedArea !== originalPrintAreaName && (
                      <div className="text-xs text-amber-600">Bạn vừa đổi khu vực. Hãy chọn ảnh mới cho khu vực này trước khi cập nhật.</div>
                    )}
                  </div>
                </div>
              )}


              <div className="flex justify-start gap-2 pt-2 md:justify-end">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>Hủy</Button>
                <Button type="submit" disabled={isLoading}>{isLoading ? 'Đang lưu...' : (mode === 'create' ? 'Lưu tất cả' : 'Cập nhật')}</Button>
              </div>
            </div>

            <div className="flex items-start justify-center">
              <div className="w-full rounded-lg border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-medium text-muted-foreground">Khu vực đã thêm</div>
                  {mode === 'edit' ? null : (
                    <div className="text-xs text-muted-foreground">{addedAreas.length} khu vực</div>
                  )}
                </div>
                {mode === 'edit' ? (
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    <div className="rounded-md border p-2">
                      <div className="text-sm font-medium truncate">{selectedArea || formData.printAreaName || 'Print area'}</div>
                      <div className="mt-2">
                        {(
                          editImagePreview ||
                          selectedAreaPreview ||
                          // Only show existing image if area unchanged
                          (selectedArea === originalPrintAreaName && formData.imageUrl)
                        ) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={editImagePreview || selectedAreaPreview || formData.imageUrl} alt={selectedArea || formData.printAreaName || 'Preview'} className="aspect-square w-full rounded-md object-cover ring-1 ring-border" />
                        ) : (
                          <div className="aspect-square w-full rounded-md border bg-muted/40" />
                        )}
                      </div>
                      <div className="mt-2">
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
                ) : (
                  <>
                    {addedAreas.length === 0 ? (
                      <div className="text-sm text-muted-foreground">Chưa có khu vực nào. Thêm ở khung bên trái.</div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                        {addedAreas.map((a, idx) => (
                          <div key={a.printAreaName + idx} className="rounded-md border p-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-sm font-medium truncate" title={a.printAreaName}>{a.printAreaName}</div>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setAddedAreas(prev => prev.filter((_, i) => i !== idx))}
                              >
                                Xóa
                              </Button>
                            </div>
                            <div className="mt-2">
                              {(a.previewUrl || a.url) ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={a.previewUrl || a.url!} alt={a.printAreaName} className="aspect-square w-full rounded-md object-cover ring-1 ring-border" />
                              ) : (
                                <div className="aspect-square w-full rounded-md border bg-muted/40" />
                              )}
                            </div>
                            <div className="mt-2">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const f = (e.target as HTMLInputElement).files?.[0] || null
                                  if (!f) {
                                    setAddedAreas(prev => prev.map((it, i) => i === idx ? { ...it, file: null, previewUrl: null } : it))
                                    return
                                  }
                                  try {
                                    const url = URL.createObjectURL(f)
                                    setAddedAreas(prev => prev.map((it, i) => i === idx ? { ...it, file: f, previewUrl: url, url: undefined } : it))
                                  } catch {
                                    setAddedAreas(prev => prev.map((it, i) => i === idx ? { ...it, file: f, previewUrl: null, url: undefined } : it))
                                  }
                                }}
                                disabled={isLoading || isUploading}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}



