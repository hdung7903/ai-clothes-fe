"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createOrUpdateTemplate, getTemplateById } from "@/services/templateServices"
import type { CreateOrUpdateTemplateRequest } from "@/types/template"

interface TemplateFormProps {
  templateId?: string;
  mode: 'create' | 'edit';
}

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
            } else {
              setError(res.message || 'Không tải được dữ liệu template')
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
      const payload: CreateOrUpdateTemplateRequest = {
        ...formData,
        templateId: mode === 'edit' ? (formData.templateId || templateId || "") : (formData.templateId || "00000000-0000-0000-0000-000000000000"),
      }
      const res = await createOrUpdateTemplate(payload)
      if (res.success) {
        router.push('/admin/templates')
      } else {
        setError(res.message || 'Lưu template thất bại')
      }
    } catch {
      setError('Lưu template thất bại')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateOrUpdateTemplateRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (mode === 'edit' && isLoading && !formData.templateId) {
    return <div>Đang tải dữ liệu template...</div>
  }

  return (
    <Card className="max-w-2xl mx-auto">
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

          <div className="space-y-2">
            <Label htmlFor="productId">Product ID *</Label>
            <Input
              id="productId"
              value={formData.productId}
              onChange={(e) => handleInputChange('productId', e.target.value)}
              placeholder="VD: 7b1c3e0c-..."
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="productOptionValueId">Product Option Value ID *</Label>
            <Input
              id="productOptionValueId"
              value={formData.productOptionValueId}
              onChange={(e) => handleInputChange('productOptionValueId', e.target.value)}
              placeholder="VD: 0c8a4f2a-..."
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="printAreaName">Print Area Name *</Label>
            <Input
              id="printAreaName"
              value={formData.printAreaName}
              onChange={(e) => handleInputChange('printAreaName', e.target.value)}
              placeholder="VD: Front, Back, Sleeve..."
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL *</nLabel>
            <Input
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) => handleInputChange('imageUrl', e.target.value)}
              placeholder="https://..."
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>Hủy</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Đang lưu...' : (mode === 'create' ? 'Tạo Template' : 'Cập nhật')}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}


