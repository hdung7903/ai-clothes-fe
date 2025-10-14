"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Check, ChevronsUpDown, Truck, LogIn, Loader2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { useAppSelector, useAppDispatch } from "@/redux/hooks"
import { formatCurrency } from "@/utils/format"
import { useEffect, useMemo, useState } from "react"
import { fetchVietnamProvinces, type ProvinceData } from "@/services/locationService"
import { cn } from "@/lib/utils"
import { LoginRequiredPopover } from "@/components/ui/login-required-popover"
import { createOrder } from "@/services/orderServices"
import { clearCart } from "@/redux/cartSlice"
import { logout } from "@/redux/authSlice"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function CheckoutPage() {
  const cartItems = useAppSelector((s) => s.cart.items)
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated)
  const user = useAppSelector((s) => s.auth.user)
  const dispatch = useAppDispatch()
  const router = useRouter()

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const [shipping, setShipping] = useState<number>(19999)
  const [voucherCode, setVoucherCode] = useState<string>("")
  const [discount, setDiscount] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [firstName, setFirstName] = useState<string>("")
  const [lastName, setLastName] = useState<string>("")
  const [phone, setPhone] = useState<string>("")
  const [phoneError, setPhoneError] = useState<string>("")
  const [addressDetail, setAddressDetail] = useState<string>("")

  // Location state
  const [provinces, setProvinces] = useState<ProvinceData[]>([])
  const [selectedProvince, setSelectedProvince] = useState<string>("")
  const [selectedWard, setSelectedWard] = useState<string>("")
  const [openProvince, setOpenProvince] = useState(false)
  const [openWard, setOpenWard] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<string>("COD")

  const wards = useMemo(() => {
    const found = provinces.find((p) => p.province === selectedProvince)
    return found?.wards ?? []
  }, [provinces, selectedProvince])

  // Phone validation function for Vietnamese phone numbers
  function validateVietnamesePhone(phoneNumber: string): { isValid: boolean; error: string } {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '')
    
    // Check if empty
    if (!cleaned) {
      return { isValid: false, error: "Số điện thoại không được để trống" }
    }
    
    // Check length (Vietnamese phone numbers are typically 10-11 digits)
    if (cleaned.length < 10 || cleaned.length > 11) {
      return { isValid: false, error: "Số điện thoại phải có 10-11 chữ số" }
    }
    
    // Check if it starts with valid Vietnamese prefixes
    const validPrefixes = [
      '032', '033', '034', '035', '036', '037', '038', '039', // Viettel
      '070', '076', '077', '078', '079', // Mobifone
      '081', '082', '083', '084', '085', // Vinaphone
      '056', '058', // Vietnamobile
      '059', // Gmobile
      '03', '05', '07', '08', '09' // Shorter prefixes
    ]
    
    const hasValidPrefix = validPrefixes.some(prefix => cleaned.startsWith(prefix))
    
    if (!hasValidPrefix) {
      return { isValid: false, error: "Số điện thoại không đúng định dạng Việt Nam" }
    }
    
    return { isValid: true, error: "" }
  }

  // Format phone number for better UX
  function formatPhoneNumber(value: string): string {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '')
    
    // Format as Vietnamese phone number (add spaces for readability)
    if (cleaned.length <= 3) {
      return cleaned
    } else if (cleaned.length <= 6) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`
    } else if (cleaned.length <= 10) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
    } else {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 10)}`
    }
  }

  // Handle phone input change with validation
  function handlePhoneChange(value: string) {
    // Format the phone number for display
    const formatted = formatPhoneNumber(value)
    setPhone(formatted)
    
    // Clear error if field is empty (let required validation handle it)
    if (!value.trim()) {
      setPhoneError("")
      return
    }
    
    const validation = validateVietnamesePhone(value)
    setPhoneError(validation.error)
  }

  useEffect(() => {
    let mounted = true
    fetchVietnamProvinces()
      .then((data) => {
        if (mounted) setProvinces(data)
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  function applyVoucher() {
    const code = voucherCode.trim().toUpperCase()
    if (!code) {
      setDiscount(0)
      return
    }
    // Simple demo rules: SAVE10 => 10% off, FREESHIP => free shipping
    if (code === "SAVE10") {
      const pct = 0.1
      setDiscount(Math.floor(subtotal * pct))
    } else if (code === "FREESHIP") {
      setDiscount(0)
      setShipping(0)
      return
    } else {
      setDiscount(0)
    }
  }

  // Combine address fields into single string
  const recipientAddress = useMemo(() => {
    if (!addressDetail || !selectedWard || !selectedProvince) return ""
    return `${addressDetail}, ${selectedWard}, ${selectedProvince}`
  }, [addressDetail, selectedWard, selectedProvince])

  // Check if address detail input should be disabled
  const isAddressDetailDisabled = !selectedProvince || !selectedWard

  // Function to handle authentication failure
  function handleAuthFailure() {
    // Clear Redux state
    dispatch(logout())
    dispatch(clearCart())
    
    // Clear localStorage
    try {
      localStorage.removeItem('auth.tokens')
    } catch {
      // Ignore localStorage errors
    }
    
    // Show error message
    toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
    
    // Redirect to login page
    setTimeout(() => {
      router.push('/auth/login')
    }, 2000)
  }

  async function handleCreateOrder() {
    if (!user || cartItems.length === 0) {
      toast.error("Không thể tạo đơn hàng. Vui lòng kiểm tra lại thông tin.")
      return
    }

    // Check authentication state before proceeding
    if (!isAuthenticated) {
      handleAuthFailure()
      return
    }

    // Double-check token exists in localStorage
    try {
      const tokenData = localStorage.getItem('auth.tokens')
      if (!tokenData) {
        handleAuthFailure()
        return
      }
    } catch {
      handleAuthFailure()
      return
    }

    // Validate required fields
    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !recipientAddress) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng.")
      return
    }

    // Validate phone number format
    const phoneValidation = validateVietnamesePhone(phone.trim())
    if (!phoneValidation.isValid) {
      toast.error(`Số điện thoại không hợp lệ: ${phoneValidation.error}`)
      return
    }

    setIsSubmitting(true)

    try {
      const orderRequest = {
        recipientPhone: phone.trim(),
        recipientName: `${firstName.trim()} ${lastName.trim()}`,
        recipientAddress: recipientAddress,
        paymentMethod: paymentMethod,
        orderItems: cartItems.map(item => ({
          productVariantId: item.id,
          designId: null, // Default value for designId
          quantity: item.quantity
        })),
        voucherCodes: voucherCode.trim() ? [voucherCode.trim().toUpperCase()] : [],
        isCreated: true
      }

      const response = await createOrder(orderRequest)
      
      if (response.success && response.data) {
        toast.success("Đơn hàng đã được tạo thành công!")
        dispatch(clearCart())
        router.push(`/account/orders`)
      } else {
        const errorMessage = response.errors 
          ? Object.values(response.errors).flat().join(', ')
          : "Có lỗi xảy ra khi tạo đơn hàng"
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Order creation error:', error)
      
      // Check if it's an authentication error
      if (error instanceof Error && (
        error.message === 'AUTHENTICATION_REQUIRED' || 
        error.message.includes('No authentication token found') ||
        error.message.includes('Please login first')
      )) {
        handleAuthFailure()
      } else {
        toast.error("Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const total = Math.max(0, subtotal - discount)

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <Link href="/cart" className="text-primary hover:underline mb-4 inline-block">
                ← Quay lại giỏ hàng
              </Link>
              <h1 className="text-3xl font-bold text-foreground mb-2">Thanh Toán</h1>
              <p className="text-muted-foreground">Hoàn tất đơn hàng của bạn</p>
            </div>

            <Card className="text-center py-12">
              <CardContent>
                <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4">
                  <LogIn className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Yêu Cầu Đăng Nhập</h2>
                <p className="text-muted-foreground mb-6">
                  Bạn cần đăng nhập để tiến hành thanh toán. Vui lòng đăng nhập để tiếp tục với đơn hàng của bạn.
                </p>
                <div className="flex gap-4 justify-center">
                  <Link href="/auth/login">
                    <Button>
                      <LogIn className="h-4 w-4 mr-2" />
                      Đăng Nhập
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button variant="outline">
                      Tạo Tài Khoản
                    </Button>
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Các sản phẩm trong giỏ hàng sẽ được bảo toàn sau khi bạn đăng nhập.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Link href="/cart" className="text-primary hover:underline mb-4 inline-block">
              ← Quay lại giỏ hàng
            </Link>
            <h1 className="text-3xl font-bold text-foreground mb-2">Thanh Toán</h1>
            <p className="text-muted-foreground">Hoàn tất đơn hàng của bạn</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <div className="space-y-6">
              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Thông Tin Giao Hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Tên</Label>
                      <Input 
                        id="firstName" 
                        placeholder="Nhập tên của bạn" 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Họ</Label>
                      <Input 
                        id="lastName" 
                        placeholder="Nhập họ của bạn" 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="example@email.com" 
                      value={user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="VD: 012 345 6789" 
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className={phoneError ? "border-red-500 focus:border-red-500" : ""}
                    />
                    {phoneError && (
                      <p className="text-sm text-red-500 mt-1">{phoneError}</p>
                    )}
                  </div>
                  {/* Vietnam Location - Province and Ward */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="province">Tỉnh/Thành phố</Label>
                      <Popover open={openProvince} onOpenChange={setOpenProvince}>
                        <PopoverTrigger asChild>
                          <Button
                            id="province"
                            variant="outline"
                            role="combobox"
                            aria-expanded={openProvince}
                            className="w-full justify-between"
                          >
                            {selectedProvince || "Chọn tỉnh/thành phố"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                            <CommandInput placeholder="Tìm kiếm tỉnh/thành phố..." />
                            <CommandEmpty>Không tìm thấy tỉnh/thành phố.</CommandEmpty>
                            <ScrollArea className="h-60">
                              <CommandGroup>
                                {provinces.map((p) => (
                                  <CommandItem
                                    key={p.province}
                                    value={p.province}
                                    onSelect={(value) => {
                                      setSelectedProvince(value)
                                      setSelectedWard("")
                                      setOpenProvince(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedProvince === p.province ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {p.province}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </ScrollArea>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label htmlFor="ward">Phường/Xã</Label>
                      <Popover open={openWard} onOpenChange={setOpenWard}>
                        <PopoverTrigger asChild>
                          <Button
                            id="ward"
                            variant="outline"
                            role="combobox"
                            aria-expanded={openWard}
                            className="w-full justify-between"
                            disabled={!selectedProvince}
                          >
                            {selectedWard || "Chọn phường/xã"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                            <CommandInput placeholder="Tìm kiếm phường/xã..." />
                            <CommandEmpty>Không tìm thấy phường/xã.</CommandEmpty>
                            <ScrollArea className="h-60">
                              <CommandGroup>
                                {wards.map((w) => (
                                  <CommandItem
                                    key={w.name}
                                    value={w.name}
                                    onSelect={(value) => {
                                      setSelectedWard(value)
                                      setOpenWard(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedWard === w.name ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {w.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </ScrollArea>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Địa chỉ chi tiết</Label>
                    <Input 
                      id="address" 
                      placeholder={isAddressDetailDisabled ? "Vui lòng chọn tỉnh/thành phố và phường/xã trước" : "Số nhà, tên đường, tòa nhà..."}
                      value={addressDetail}
                      onChange={(e) => setAddressDetail(e.target.value)}
                      disabled={isAddressDetailDisabled}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Address - Vietnam Location removed, now part of Shipping Information */}

              {/* Voucher */}
              <Card>
                <CardHeader>
                  <CardTitle>Mã Giảm Giá</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <Label htmlFor="voucher">Nhập mã giảm giá</Label>
                      <Input id="voucher" value={voucherCode} onChange={(e) => setVoucherCode(e.target.value)} placeholder="VD: SAVE10 hoặc FREESHIP" />
                    </div>
                    <div className="flex items-end">
                      <Button className="w-full" type="button" onClick={applyVoucher}>Áp dụng</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Phương Thức Thanh Toán</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem id="pay-cod" value="COD" />
                      <Label htmlFor="pay-cod">Thanh toán khi nhận hàng (COD)</Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem id="pay-online" value="ONLINE_PAYMENT" />
                      <Label htmlFor="pay-online">Thanh toán online</Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Tóm Tắt Đơn Hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            SL: {item.quantity} • Kích thước: {item.size} • Màu sắc: {item.color}
                          </p>
                        </div>
                        <span className="font-medium">{formatCurrency(item.price * item.quantity, 'VND', 'vi-VN')}</span>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-2">
                    
                    
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Giảm giá</span>
                        <span>-{formatCurrency(discount, 'VND', 'vi-VN')}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Tổng cộng</span>
                      <span className="text-primary">{formatCurrency(total, 'VND', 'vi-VN')}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Lưu ý: Tổng này chưa bao gồm phí vận chuyển. Phí vận chuyển sẽ được tính ở bước tiếp theo.</p>
                  </div>

                  

                  <Button 
                    className="w-full" 
                    onClick={handleCreateOrder}
                    disabled={isSubmitting || cartItems.length === 0 || !!phoneError}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      "Hoàn Tất Đơn Hàng"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
