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
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Percent, DollarSign, Gift, Clock, CheckCircle, XCircle, Sparkles, Package } from "lucide-react"
import { createOrUpdateVoucher, getVoucherById } from "@/services/voucherService"
import type { CreateOrUpdateVoucherRequest, DiscountType } from "@/types/voucher"
import { formatCurrency } from "@/utils/format"
import { ProductSelector } from "./product-selector"

interface VoucherFormProps {
  voucherId?: string;
  mode: 'create' | 'edit';
}

export function VoucherForm({ voucherId, mode }: VoucherFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState("basic")

  // no min-start restriction anymore; allow today

  const [formData, setFormData] = React.useState<CreateOrUpdateVoucherRequest>({
    voucherId: null,
    code: '',
    description: '',
    discountType: 'PERCENT' as DiscountType,
    discountValue: 0,
    startDate: '',
    endDate: '',
    isActive: true,
    productIds: [],
  })

  // Additional state for time inputs
  const [startTime, setStartTime] = React.useState('00:00')
  const [endTime, setEndTime] = React.useState('23:59')

  // Default start date/time to user's access time in create mode
  React.useEffect(() => {
    if (mode === 'create' && !formData.startDate) {
      const now = new Date()
      const yyyyMmDd = now.toISOString().split('T')[0]
      const hh = String(now.getHours()).padStart(2, '0')
      const mm = String(now.getMinutes()).padStart(2, '0')
      setFormData(prev => ({ ...prev, startDate: yyyyMmDd }))
      setStartTime(`${hh}:${mm}`)
    }
  }, [mode, formData.startDate])

  // Load voucher data for edit mode
  React.useEffect(() => {
    if (mode === 'edit' && voucherId) {
      const loadVoucher = async () => {
        try {
          setIsLoading(true)
          const response = await getVoucherById(voucherId)
          if (response.success && response.data) {
            const startDateTime = new Date(response.data.startDate)
            const endDateTime = new Date(response.data.endDate)
            
            setFormData({
              voucherId: response.data.id,
              code: response.data.code,
              description: response.data.description,
              discountType: response.data.discountType as DiscountType,
              discountValue: response.data.discountValue,
              isActive: response.data.isActive,
              startDate: startDateTime.toISOString().split('T')[0],
              endDate: endDateTime.toISOString().split('T')[0],
              productIds: response.data.products.map(p => p.productId),
            })
            
            // Set time values
            setStartTime(startDateTime.toTimeString().slice(0, 5))
            setEndTime(endDateTime.toTimeString().slice(0, 5))
          } else {
            setError('Không thể tải dữ liệu voucher')
          }
        } catch (err) {
          setError('Không thể tải dữ liệu voucher')
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

    // Validation
    if (!formData.discountType || formData.discountType.trim() === '') {
      setError('Loại giảm giá không được để trống')
      setIsLoading(false)
      return
    }

    if (!['PERCENT', 'FIXED_AMOUNT'].includes(formData.discountType as string)) {
      setError('Loại giảm giá phải là PERCENT hoặc FIXED_AMOUNT')
      setIsLoading(false)
      return
    }

    if (formData.discountValue <= 0) {
      setError('Giá trị giảm giá phải lớn hơn 0')
      setIsLoading(false)
      return
    }

    if (formData.discountType === 'PERCENT' && formData.discountValue > 100) {
      setError('Phần trăm giảm giá không được vượt quá 100%')
      setIsLoading(false)
      return
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError('Ngày kết thúc phải sau ngày bắt đầu')
      setIsLoading(false)
      return
    }

    // Validate datetime range
    if (formData.startDate && formData.endDate) {
      const startDateTime = new Date(`${formData.startDate}T${startTime}:00`)
      const endDateTime = new Date(`${formData.endDate}T${endTime}:00`)
      
      if (endDateTime <= startDateTime) {
        setError('Thời gian kết thúc phải sau thời gian bắt đầu')
        setIsLoading(false)
        return
      }
    }

    try {
      // Combine date and time for start and end dates
      const startDateTime = new Date(`${formData.startDate}T${startTime}:00`)
      const endDateTime = new Date(`${formData.endDate}T${endTime}:00`)
      
      const payload: CreateOrUpdateVoucherRequest = {
        ...formData,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
      }

      // Debug: Log the payload being sent
      console.log('Voucher payload being sent:', payload)
      console.log('DiscountType value:', payload.discountType, 'Type:', typeof payload.discountType)

      const response = await createOrUpdateVoucher(payload)
      
      if (response.success) {
        router.push('/admin/vouchers')
      } else {
        const errorMessage = response.errors 
          ? Object.values(response.errors).flat().join(', ')
          : response.validationErrors 
          ? Object.values(response.validationErrors).flat().join(', ')
          : 'Không thể lưu voucher'
        setError(errorMessage)
      }
    } catch (err) {
      setError('Không thể lưu voucher')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateOrUpdateVoucherRequest, value: any) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      }

      // Auto-update end date when start date changes
      if (field === 'startDate' && value && prev.endDate) {
        const startDate = new Date(value)
        const endDate = new Date(prev.endDate)
        
        // If end date is before or same as new start date, update it
        if (endDate <= startDate) {
          const newEndDate = new Date(startDate)
          newEndDate.setDate(newEndDate.getDate() + 1)
          newData.endDate = newEndDate.toISOString().split('T')[0]
        }
      }

      return newData
    })

    // Clear error when user starts typing
    if (error) {
      setError(null)
    }
  }

  const getMinEndDate = () => {
    if (!formData.startDate) return ''
    return formData.startDate
  }


  const formatDiscountPreview = () => {
    if (formData.discountType === 'PERCENT') {
      return `${formData.discountValue}%`
    }
    return formatCurrency(formData.discountValue, 'VND', 'vi-VN')
  }

  const getStatusInfo = () => {
    if (!formData.startDate || !formData.endDate) return null
    
    const now = new Date()
    const startDateTime = new Date(`${formData.startDate}T${startTime}:00`)
    const endDateTime = new Date(`${formData.endDate}T${endTime}:00`)
    
    if (now < startDateTime) {
      return { status: 'upcoming', text: 'Sắp diễn ra', color: 'bg-blue-100 text-blue-800' }
    } else if (now > endDateTime) {
      return { status: 'expired', text: 'Đã hết hạn', color: 'bg-red-100 text-red-800' }
    } else {
      return { status: 'active', text: 'Đang hoạt động', color: 'bg-green-100 text-green-800' }
    }
  }

  const statusInfo = getStatusInfo()

  if (mode === 'edit' && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải dữ liệu voucher...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {mode === 'create' ? 'Tạo voucher mới' : 'Chỉnh sửa voucher'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {mode === 'create' 
              ? 'Thiết lập voucher khuyến mãi để thu hút khách hàng' 
              : 'Cập nhật thông tin voucher hiện tại'
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          {statusInfo && (
            <Badge className={statusInfo.color}>
              {statusInfo.text}
            </Badge>
          )}
          <Badge variant={formData.isActive ? "default" : "secondary"}>
            {formData.isActive ? "Kích hoạt" : "Tạm dừng"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Thông tin cơ bản
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Cài đặt nâng cao
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="basic" className="space-y-6">
                {/* Voucher Code Section */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Gift className="h-5 w-5" />
                      Mã voucher
                    </CardTitle>
                    <CardDescription>
                      Mã mà khách hàng sẽ sử dụng để áp dụng voucher
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label htmlFor="code">Mã voucher *</Label>
                        <Input
                          id="code"
                          value={formData.code}
                          onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                          placeholder="VD: SAVE20"
                          required
                          disabled={isLoading || mode === 'edit'}
                          className="font-mono text-lg"
                        />
                        {mode === 'edit' && (
                          <p className="text-xs text-muted-foreground mt-1">Mã voucher không thể thay đổi khi cập nhật.</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Mô tả voucher *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Mô tả chi tiết về voucher và điều kiện sử dụng..."
                        required
                        disabled={isLoading}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Discount Section */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {formData.discountType === 'PERCENT' ? (
                        <Percent className="h-5 w-5" />
                      ) : (
                        <DollarSign className="h-5 w-5" />
                      )}
                      Giá trị giảm giá
                    </CardTitle>
                    <CardDescription>
                      Thiết lập loại và giá trị giảm giá cho voucher
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="discountType">Loại giảm giá *</Label>
                        <Select
                          value={formData.discountType}
                          onValueChange={(value: DiscountType) => {
                            console.log('Select value changed to:', value)
                            handleInputChange('discountType', value)
                          }}
                          disabled={isLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại giảm giá" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PERCENT">
                              <div className="flex items-center gap-2">
                                <Percent className="h-4 w-4" />
                                Phần trăm (%)
                              </div>
                            </SelectItem>
                            <SelectItem value="FIXED_AMOUNT">
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Số tiền cố định (VND)
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="discountValue">
                          Giá trị giảm giá *
                          <span className="text-muted-foreground ml-1">
                            {formData.discountType === 'PERCENT' ? '(%)' : '(VND)'}
                          </span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="discountValue"
                            type="number"
                            min="0"
                            max={formData.discountType === 'PERCENT' ? 100 : undefined}
                            step={formData.discountType === 'PERCENT' ? 0.01 : 1}
                            value={formData.discountValue === 0 ? '' : formData.discountValue}
                            onChange={(e) => {
                              const value = e.target.value
                              if (value === '') {
                                handleInputChange('discountValue', 0)
                              } else {
                                const numValue = parseFloat(value)
                                if (!isNaN(numValue)) {
                                  // Validate percentage range
                                  if (formData.discountType === 'PERCENT' && numValue < 0) {
                                    return // Don't update if negative percentage
                                  }
                                  handleInputChange('discountValue', numValue)
                                }
                              }
                            }}
                            required
                            disabled={isLoading}
                            className="text-lg font-semibold"
                            placeholder={formData.discountType === 'PERCENT' ? '0' : '0'}
                          />
                          {formData.discountType === 'PERCENT' && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              %
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formData.discountType === 'PERCENT' 
                            ? 'Nhập số từ 0.01 đến 100' 
                            : 'Nhập số tiền giảm giá (VND)'
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Validity Period */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CalendarDays className="h-5 w-5" />
                      Thời gian hiệu lực
                    </CardTitle>
                    <CardDescription>
                      Thiết lập thời gian voucher có hiệu lực
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Ngày bắt đầu *</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => handleInputChange('startDate', e.target.value)}
                          required
                          disabled={isLoading}
                        />
                        <Label htmlFor="startTime">Giờ bắt đầu *</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          required
                          disabled={isLoading}
                        />
                        <p className="text-xs text-muted-foreground">
                          Có thể chọn ngày hôm nay
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">Ngày kết thúc *</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => handleInputChange('endDate', e.target.value)}
                          min={getMinEndDate()}
                          required
                          disabled={isLoading}
                        />
                        <Label htmlFor="endTime">Giờ kết thúc *</Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          required
                          disabled={isLoading}
                        />
                        <p className="text-xs text-muted-foreground">
                          Phải sau thời gian bắt đầu
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6">
                {/* Product Selection */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Package className="h-5 w-5" />
                      Sản phẩm áp dụng voucher
                    </CardTitle>
                    <CardDescription>
                      Chọn sản phẩm cụ thể để áp dụng voucher. Để trống để áp dụng cho tất cả sản phẩm.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProductSelector
                      selectedProductIds={formData.productIds}
                      onSelectionChange={(productIds) => handleInputChange('productIds', productIds)}
                      disabled={isLoading}
                    />
                  </CardContent>
                </Card>

                {/* Status Settings */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CheckCircle className="h-5 w-5" />
                      Trạng thái voucher
                    </CardTitle>
                    <CardDescription>
                      Quản lý trạng thái kích hoạt của voucher
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="isActive" className="text-base font-medium">
                          Kích hoạt voucher
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Voucher sẽ có hiệu lực và khách hàng có thể sử dụng
                        </p>
                      </div>
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                        disabled={isLoading}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                  className="min-w-[100px]"
                >
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="min-w-[120px]"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {mode === 'create' ? 'Tạo voucher' : 'Cập nhật voucher'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Tabs>
        </div>

        {/* Preview Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Xem trước voucher
              </CardTitle>
              <CardDescription>
                Voucher sẽ hiển thị như thế này cho khách hàng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Voucher Preview */}
              <div className="relative overflow-hidden rounded-lg border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-6">
                <div className="absolute top-2 right-2">
                  <Badge variant={formData.isActive ? "default" : "secondary"} className="text-xs">
                    {formData.isActive ? "Hoạt động" : "Tạm dừng"}
                  </Badge>
                </div>
                
                <div className="text-center space-y-3">
                  <div className="text-2xl font-bold text-primary">
                    {formData.code || "VOUCHER_CODE"}
                  </div>
                  
                  <div className="text-lg font-semibold">
                    Giảm {formatDiscountPreview()}
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {formData.description || "Mô tả voucher sẽ hiển thị ở đây"}
                  </p>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formData.startDate && formData.endDate ? (
                        <>
                          {new Date(formData.startDate).toLocaleDateString('vi-VN')} {startTime} - {new Date(formData.endDate).toLocaleDateString('vi-VN')} {endTime}
                        </>
                      ) : (
                        "Chọn ngày và giờ hiệu lực"
                      )}
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Package className="h-3 w-3" />
                      {formData.productIds.length === 0 ? (
                        "Áp dụng cho tất cả sản phẩm"
                      ) : (
                        `Áp dụng cho ${formData.productIds.length} sản phẩm`
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Thông tin nhanh</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Loại giảm giá:</span>
                    <span className="font-medium">
                      {formData.discountType === 'PERCENT' ? 'Phần trăm' : 'Số tiền'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Giá trị:</span>
                    <span className="font-medium">{formatDiscountPreview()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trạng thái:</span>
                    <Badge variant={formData.isActive ? "default" : "secondary"} className="text-xs">
                      {formData.isActive ? "Kích hoạt" : "Tạm dừng"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sản phẩm:</span>
                    <span className="font-medium text-xs">
                      {formData.productIds.length === 0 ? "Tất cả sản phẩm" : `${formData.productIds.length} sản phẩm`}
                    </span>
                  </div>
                  {formData.startDate && formData.endDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Thời gian:</span>
                      <span className="font-medium text-xs">
                        {(() => {
                          const startDateTime = new Date(`${formData.startDate}T${startTime}:00`)
                          const endDateTime = new Date(`${formData.endDate}T${endTime}:00`)
                          const diffTime = endDateTime.getTime() - startDateTime.getTime()
                          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
                          const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                          
                          if (diffDays > 0) {
                            return `${diffDays} ngày ${diffHours} giờ`
                          } else {
                            return `${diffHours} giờ`
                          }
                        })()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
