"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createOrUpdateVoucher, getVoucherById } from "@/services/voucherService"
import type { Voucher, CreateOrUpdateVoucherRequest } from "@/types/voucher"

interface VoucherFormProps {
  voucherId?: string;
  mode: 'create' | 'edit';
}

export function VoucherForm({ voucherId, mode }: VoucherFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [voucher, setVoucher] = React.useState<Voucher | null>(null)

  const [formData, setFormData] = React.useState<CreateOrUpdateVoucherRequest>({
    code: '',
    name: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    minOrderAmount: undefined,
    maxDiscountAmount: undefined,
    usageLimit: undefined,
    isActive: true,
    validFrom: '',
    validTo: '',
  })

  // Load voucher data for edit mode
  React.useEffect(() => {
    if (mode === 'edit' && voucherId) {
      const loadVoucher = async () => {
        try {
          setIsLoading(true)
          const response = await getVoucherById(voucherId)
          if (response.success && response.data) {
            setVoucher(response.data)
            setFormData({
              voucherId: response.data.voucherId,
              code: response.data.code,
              name: response.data.name,
              description: response.data.description || '',
              discountType: response.data.discountType,
              discountValue: response.data.discountValue,
              minOrderAmount: response.data.minOrderAmount,
              maxDiscountAmount: response.data.maxDiscountAmount,
              usageLimit: response.data.usageLimit,
              isActive: response.data.isActive,
              validFrom: response.data.validFrom.split('T')[0], // Convert to YYYY-MM-DD format
              validTo: response.data.validTo.split('T')[0],
            })
          } else {
            setError('Failed to load voucher data')
          }
        } catch (err) {
          setError('Failed to load voucher data')
        } finally {
          setIsLoading(false)
        }
      }
      loadVoucher()
    }
  }, [mode, voucherId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Convert date strings to ISO format
      const payload: CreateOrUpdateVoucherRequest = {
        ...formData,
        validFrom: new Date(formData.validFrom).toISOString(),
        validTo: new Date(formData.validTo).toISOString(),
      }

      const response = await createOrUpdateVoucher(payload)
      
      if (response.success) {
        router.push('/admin/vouchers')
      } else {
        setError(response.message || 'Failed to save voucher')
      }
    } catch (err) {
      setError('Failed to save voucher')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateOrUpdateVoucherRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (mode === 'edit' && isLoading && !voucher) {
    return <div>Loading voucher data...</div>
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'Create New Voucher' : 'Edit Voucher'}
        </CardTitle>
        <CardDescription>
          {mode === 'create' 
            ? 'Fill in the details to create a new voucher' 
            : 'Update the voucher information below'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Voucher Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                placeholder="e.g., SAVE20"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Voucher Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., 20% Off Summer Sale"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Optional description for the voucher"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discountType">Discount Type *</Label>
              <Select
                value={formData.discountType}
                onValueChange={(value) => handleInputChange('discountType', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                  <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="discountValue">
                Discount Value * 
                {formData.discountType === 'PERCENTAGE' ? ' (%)' : ' (VND)'}
              </Label>
              <Input
                id="discountValue"
                type="number"
                min="0"
                max={formData.discountType === 'PERCENTAGE' ? 100 : undefined}
                step={formData.discountType === 'PERCENTAGE' ? 0.01 : 1000}
                value={formData.discountValue}
                onChange={(e) => handleInputChange('discountValue', parseFloat(e.target.value) || 0)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minOrderAmount">Minimum Order Amount (VND)</Label>
              <Input
                id="minOrderAmount"
                type="number"
                min="0"
                step="1000"
                value={formData.minOrderAmount || ''}
                onChange={(e) => handleInputChange('minOrderAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="Optional minimum order amount"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxDiscountAmount">Maximum Discount Amount (VND)</Label>
              <Input
                id="maxDiscountAmount"
                type="number"
                min="0"
                step="1000"
                value={formData.maxDiscountAmount || ''}
                onChange={(e) => handleInputChange('maxDiscountAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="Optional maximum discount"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="usageLimit">Usage Limit</Label>
            <Input
              id="usageLimit"
              type="number"
              min="1"
              value={formData.usageLimit || ''}
              onChange={(e) => handleInputChange('usageLimit', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Optional usage limit (leave empty for unlimited)"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validFrom">Valid From *</Label>
              <Input
                id="validFrom"
                type="date"
                value={formData.validFrom}
                onChange={(e) => handleInputChange('validFrom', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validTo">Valid To *</Label>
              <Input
                id="validTo"
                type="date"
                value={formData.validTo}
                onChange={(e) => handleInputChange('validTo', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              disabled={isLoading}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : mode === 'create' ? 'Create Voucher' : 'Update Voucher'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
