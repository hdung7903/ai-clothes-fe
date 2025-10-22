"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createOrUpdateTemplate, getTemplateById, getTemplatesByProduct } from "@/services/templateServices"
import type { CreateOrUpdateTemplateRequest, TemplateSummaryItem } from "@/types/template"
import { searchProducts, type SearchProductsQuery, getProductById } from "@/services/productService"
import type { ProductSummaryItem, ProductDetail } from "@/types/product"
import { uploadImage } from "@/services/storageService"

interface TemplateEditFormProps {
  templateId: string;
}

const editPrintAreaGroups = [
  { title: 'Thân áo', items: ['Mặt trước', 'Mặt sau'] },
  { title: 'Tay áo', items: ['Tay trái', 'Tay phải'] },
]

export function TemplateEditForm({ templateId }: TemplateEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [products, setProducts] = React.useState<ProductSummaryItem[]>([])
  const [productDetail, setProductDetail] = React.useState<ProductDetail | null>(null)
  const [isLoadingProducts, setIsLoadingProducts] = React.useState(false)

  const [formData, setFormData] = React.useState<CreateOrUpdateTemplateRequest>({
    templateId: "",
    productId: "",
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

  React.useEffect(() => {
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
  }, [templateId])

  // Cleanup URL objects on unmount
  React.useEffect(() => {
    return () => {
      Object.values(areaImagePreviews).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [])

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
    setSelectedArea(areaName)
    setFormData(prev => ({ ...prev, printAreaName: areaName }))
    
    // Update current image preview based on what's stored for this area
    if (areaImagePreviews[areaName]) {
      setNewImagePreview(areaImagePreviews[areaName])
      setNewImageFile(areaImageFiles[areaName])
    } else {
      setNewImagePreview(null)
      setNewImageFile(null)
    }
  }

  const handleNewImageSelect = (file?: File | null) => {
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
      }
      return 
    }
    try { 
      const previewUrl = URL.createObjectURL(file)
      setNewImagePreview(previewUrl)
      // Store the preview and file for current area
      if (selectedArea) {
        setAreaImagePreviews(prev => ({ ...prev, [selectedArea]: previewUrl }))
        setAreaImageFiles(prev => ({ ...prev, [selectedArea]: file }))
      }
    } catch { 
      setNewImagePreview(null) 
    }
  }

  const handleDeleteCurrentImage = () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      let finalImageUrl = formData.imageUrl
      // Use the stored file for current area if available
      const currentAreaFile = areaImageFiles[selectedArea]
      if (currentAreaFile) {
        const up = await uploadImage(currentAreaFile)
        if (!up.success || !up.data) throw new Error('Upload ảnh thất bại')
        finalImageUrl = up.data
      } else if (selectedArea !== originalArea && !finalImageUrl) {
        throw new Error('Vui lòng chọn ảnh mới cho khu vực đã đổi')
      }
      const payload: CreateOrUpdateTemplateRequest = {
        ...formData,
        templateId: formData.templateId || templateId,
        imageUrl: finalImageUrl,
      }
      const res = await createOrUpdateTemplate(payload)
      if (res.success) router.push('/admin/templates')
      else setError('Lưu template thất bại')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu template thất bại')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Chỉnh sửa Template</CardTitle>
        <CardDescription>Cập nhật thông tin template</CardDescription>
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
                            const existsForOption = templatesForOption.some(t => t.printAreaName === v)
                            return (
                              <button
                                type="button"
                                key={v}
                                onClick={() => handleAreaSelect(v)}
                                className={
                                  (isSelected
                                    ? "ring-2 ring-ring bg-accent text-accent-foreground"
                                    : "hover:bg-muted") +
                                  " rounded-md border px-2 py-2 text-sm text-left"
                                }
                                disabled={isLoading}
                              >
                                {v}
                                {existsForOption ? <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-green-500 align-middle" /> : null}
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
                      Xóa ảnh hiện tại
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex justify-start gap-2 pt-2 md:justify-end">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>Hủy</Button>
                <Button type="submit" disabled={isLoading}>{isLoading ? 'Đang lưu...' : 'Cập nhật'}</Button>
              </div>
            </div>

            <div className="flex items-start justify-center">
              <div className="w-full rounded-lg border p-3">
                <div className="mb-2 text-sm font-medium text-muted-foreground">Xem trước hình ảnh</div>
                {(newImagePreview || formData.imageUrl) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={newImagePreview || formData.imageUrl} alt={selectedArea || 'Preview'} className="aspect-square w-full rounded-md object-cover ring-1 ring-border" />
                ) : (
                  <div className="aspect-square w-full rounded-md border bg-muted/40" />
                )}
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}


