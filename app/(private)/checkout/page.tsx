"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Check, ChevronsUpDown, Truck, LogIn, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { formatCurrency } from "@/utils/format";
import { useEffect, useMemo, useState } from "react";
import {
  fetchVietnamProvinces,
  type ProvinceData,
} from "@/services/locationService";
import { cn } from "@/lib/utils";
import { LoginRequiredPopover } from "@/components/ui/login-required-popover";
import { createOrder, updateOrderStatusByUser, checkOrderPaymentStatus } from "@/services/orderServices";
import {
  fetchCartItems,
  updateItemDiscounts,
  clearDiscounts,
  clearCart,
} from "@/redux/cartSlice";
import { logout } from "@/redux/authSlice";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createQrCode } from "@/services/paymentServices";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const allCartItems = useAppSelector((s) => s.cart.items);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Get selected item IDs from URL params
  const selectedItemIds = useMemo(() => {
    const itemsParam = searchParams.get('items');
    return itemsParam ? itemsParam.split(',') : [];
  }, [searchParams]);

  // Filter cart items to only include selected ones
  const cartItems = useMemo(() => {
    if (selectedItemIds.length === 0) {
      // If no items specified, use all cart items (fallback)
      return allCartItems;
    }
    return allCartItems.filter(item => selectedItemIds.includes(item.id));
  }, [allCartItems, selectedItemIds]);

  const subtotal = cartItems.reduce((sum, item) => {
    // Always use original price for subtotal calculation
    return sum + (item.price * item.quantity);
  }, 0);
  const [shipping] = useState<number>(0);
  const [voucherCode, setVoucherCode] = useState<string>("");
  const [discount, setDiscount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState<string>("");

  // Online payment state
  const [paymentQr, setPaymentQr] = useState<string | null>(null);
  const [paymentDeadline, setPaymentDeadline] = useState<number | null>(null);
  const [countdownMs, setCountdownMs] = useState<number>(0);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState<boolean>(false);
  const [paymentResultOpen, setPaymentResultOpen] = useState<boolean>(false);
  const [paymentResultType, setPaymentResultType] = useState<
    "success" | "failure" | null
  >(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [currentPaymentCode, setCurrentPaymentCode] = useState<string>("SEPAY");

  function formatCountdown(ms: number): string {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");
    return `${mm}:${ss}`;
  }

  // Form state
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string>("");
  const [addressDetail, setAddressDetail] = useState<string>("");

  // Location state
  const [provinces, setProvinces] = useState<ProvinceData[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");
  const [openProvince, setOpenProvince] = useState(false);
  const [openWard, setOpenWard] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("COD");

  const wards = useMemo(() => {
    const found = provinces.find((p) => p.province === selectedProvince);
    return found?.wards ?? [];
  }, [provinces, selectedProvince]);

  // Phone validation function for Vietnamese phone numbers
  function validateVietnamesePhone(phoneNumber: string): {
    isValid: boolean;
    error: string;
  } {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, "");

    // Check if empty
    if (!cleaned) {
      return { isValid: false, error: "Số điện thoại không được để trống" };
    }

    // Check length (Vietnamese phone numbers are typically 10-11 digits)
    if (cleaned.length < 10 || cleaned.length > 11) {
      return { isValid: false, error: "Số điện thoại phải có 10-11 chữ số" };
    }

    // Check if it starts with valid Vietnamese prefixes
    const validPrefixes = [
      "032",
      "033",
      "034",
      "035",
      "036",
      "037",
      "038",
      "039", // Viettel
      "070",
      "076",
      "077",
      "078",
      "079", // Mobifone
      "081",
      "082",
      "083",
      "084",
      "085", // Vinaphone
      "056",
      "058", // Vietnamobile
      "059", // Gmobile
      "03",
      "05",
      "07",
      "08",
      "09", // Shorter prefixes
    ];

    const hasValidPrefix = validPrefixes.some((prefix) =>
      cleaned.startsWith(prefix)
    );

    if (!hasValidPrefix) {
      return {
        isValid: false,
        error: "Số điện thoại không đúng định dạng Việt Nam",
      };
    }

    return { isValid: true, error: "" };
  }

  // Format phone number for better UX
  function formatPhoneNumber(value: string): string {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, "");

    // Format as Vietnamese phone number (add spaces for readability)
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    } else if (cleaned.length <= 10) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(
        6
      )}`;
    } else {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(
        6,
        10
      )}`;
    }
  }

  // Handle phone input change with validation
  function handlePhoneChange(value: string) {
    // Format the phone number for display
    const formatted = formatPhoneNumber(value);
    setPhone(formatted);

    // Clear error if field is empty (let required validation handle it)
    if (!value.trim()) {
      setPhoneError("");
      return;
    }

    const validation = validateVietnamesePhone(value);
    setPhoneError(validation.error);
  }

  useEffect(() => {
    let mounted = true;
    fetchVietnamProvinces()
      .then((data) => {
        if (mounted) setProvinces(data);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // Countdown for online payment session (5 minutes)
  useEffect(() => {
    if (!paymentDeadline) return;
    const tick = () => {
      const ms = Math.max(0, paymentDeadline - Date.now());
      setCountdownMs(ms);
      if (ms === 0) {
        setPaymentQr(null);
        setPaymentDeadline(null);
        setPaymentDialogOpen(false);
        toast.error(
          "Phiên thanh toán đã hết hạn sau 2 phút. Vui lòng thử lại."
        );
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [paymentDeadline]);

  // Poll payment status when payment dialog is open
  useEffect(() => {
    if (!paymentDialogOpen || !currentOrderId) return;

    const pollPaymentStatus = async () => {
      try {
        const response = await checkOrderPaymentStatus(currentOrderId);
        if (response.success && response.data === true) {
          // Payment successful - complete the order
          toast.success("Thanh toán thành công! Đơn hàng đã được xác nhận.");
          
          // Clear the cart since order is completed
          dispatch(clearCart());
          
          // Close payment dialog
          setPaymentDialogOpen(false);
          setPaymentQr(null);
          setPaymentDeadline(null);
          setCurrentOrderId(null);
          setCurrentPaymentCode("SEPAY");
          
          // Redirect to orders page
          router.push("/account/orders");
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        // Don't show error to user, just continue polling
      }
    };

    // Poll immediately, then every 3 seconds
    pollPaymentStatus();
    const interval = setInterval(pollPaymentStatus, 3000);

    return () => clearInterval(interval);
  }, [paymentDialogOpen, currentOrderId, router]);



  async function handleRetryPayment() {
    if (!paymentQr) {
      try {
        const qrRes = await createQrCode({
          amount: Math.max(0, subtotal - discount),
          paymentCode: currentPaymentCode,
        });
        if (qrRes.success) {
          setPaymentQr(qrRes.data ?? null);
          setPaymentDeadline(Date.now() + 2 * 60 * 1000);
          setPaymentDialogOpen(true);
          setPaymentResultOpen(false);
        } else {
          const payErr = qrRes.errors
            ? Object.values(qrRes.errors).flat().join(", ")
            : "Không lấy được thông tin thanh toán";
          toast.error(payErr);
        }
      } catch {
        toast.error("Không thể khởi tạo lại thanh toán. Vui lòng thử lại.");
      }
    } else {
      setPaymentDialogOpen(true);
      setPaymentResultOpen(false);
    }
  }

  function handleChangeMethodToCOD() {
    setPaymentMethod("COD");
    setPaymentResultOpen(false);
    toast.message("Đã chuyển sang phương thức COD");
  }

  async function handleCancelPayment() {
    if (!currentOrderId) {
      toast.error("Không tìm thấy thông tin đơn hàng");
      return;
    }

    try {
      const response = await updateOrderStatusByUser(currentOrderId, {
        action: 0 // Cancel action
      });

      if (response.success) {
        toast.success("Đơn hàng đã được hủy thành công");
        setPaymentDialogOpen(false);
        setPaymentQr(null);
        setPaymentDeadline(null);
        setCurrentOrderId(null);
        setCurrentPaymentCode("SEPAY");
        // Redirect back to cart
        router.push("/cart");
      } else {
        const errorMessage = response.errors
          ? Object.values(response.errors).flat().join(", ")
          : "Không thể hủy đơn hàng";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Cancel payment error:", error);
      toast.error("Có lỗi xảy ra khi hủy đơn hàng. Vui lòng thử lại.");
    }
  }

  async function validateVoucher() {
    const code = voucherCode.trim().toUpperCase();
    if (!code) {
      setDiscount(0);
      setVoucherError("");
      // Clear any existing discounts when voucher code is empty
      dispatch(clearDiscounts());
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      setVoucherError("Vui lòng đăng nhập để sử dụng mã giảm giá");
      return;
    }

    // Validate required fields for order creation
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !phone.trim() ||
      !recipientAddress
    ) {
      setVoucherError(
        "Vui lòng điền đầy đủ thông tin giao hàng trước khi áp dụng mã giảm giá"
      );
      return;
    }

    // Validate phone number format
    const phoneValidation = validateVietnamesePhone(phone.trim());
    if (!phoneValidation.isValid) {
      setVoucherError(`Số điện thoại không hợp lệ: ${phoneValidation.error}`);
      return;
    }

    setIsValidatingVoucher(true);
    setVoucherError("");

    try {
      const orderRequest = {
        recipientPhone: phone.trim(),
        recipientName: `${firstName.trim()} ${lastName.trim()}`,
        recipientAddress: recipientAddress,
        paymentMethod: paymentMethod,
        orderItems: cartItems.map((item) => ({
          productVariantId: item.productVariantId,
          designId: item.productDesignId ?? null,
          quantity: item.quantity,
        })),
        voucherCodes: [code],
        isCreated: false, // Key change: set to false for validation
      };

      const response = await createOrder(orderRequest);

      if (response.success && response.data) {
        const discountAmount = response.data.discountAmount || 0;
        
        // Update discount based on API response
        setDiscount(discountAmount);

        // Update individual item discounts
        if (response.data.items && response.data.items.length > 0) {
          const itemDiscounts = response.data.items.map((item) => ({
            productVariantId: item.productVariantId,
            discountAmount: item.discountAmount || 0,
            totalAmount: item.totalAmount || item.subTotal,
            voucherCode: item.voucherCode || code,
            voucherDiscountPercent: item.voucherDiscountPercent || 0,
          }));

          dispatch(updateItemDiscounts(itemDiscounts));
        }

        setVoucherError("");
        
        // Chỉ hiển thị thông báo thành công nếu thực sự có giảm giá
        if (discountAmount > 0) {
          toast.success(`Mã giảm giá đã được áp dụng! Giảm ${formatCurrency(discountAmount)}`);
        } else {
          toast.info("Mã voucher hợp lệ nhưng không áp dụng được giảm giá cho đơn hàng này");
        }
      } else {
        const errorMessage = response.errors
          ? Object.values(response.errors).flat().join(", ")
          : "Mã giảm giá không hợp lệ hoặc đã hết hạn";
        setVoucherError(errorMessage);
        setDiscount(0);
        // Clear any existing discounts
        dispatch(clearDiscounts());
      }
    } catch (error) {
      console.error("Voucher validation error:", error);

      // Check if it's an authentication error
      if (
        error instanceof Error &&
        (error.message === "AUTHENTICATION_REQUIRED" ||
          error.message.includes("No authentication token found") ||
          error.message.includes("Please login first"))
      ) {
        setVoucherError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
        handleAuthFailure();
      } else {
        setVoucherError(
          "Có lỗi xảy ra khi kiểm tra mã giảm giá. Vui lòng thử lại"
        );
        setDiscount(0);
      }
    } finally {
      setIsValidatingVoucher(false);
    }
  }

  function applyVoucher() {
    const code = voucherCode.trim().toUpperCase();
    if (!code) {
      setDiscount(0);
      setVoucherError("");
      return;
    }
    // Simple demo rules: SAVE10 => 10% off
    if (code === "SAVE10") {
      const pct = 0.1;
      setDiscount(Math.floor(subtotal * pct));
    } else {
      setDiscount(0);
    }
  }

  // Combine address fields into single string
  const recipientAddress = useMemo(() => {
    if (!addressDetail || !selectedWard || !selectedProvince) return "";
    return `${addressDetail}, ${selectedWard}, ${selectedProvince}`;
  }, [addressDetail, selectedWard, selectedProvince]);

  // Check if address detail input should be disabled
  const isAddressDetailDisabled = !selectedProvince || !selectedWard;

  // Function to handle authentication failure
  function handleAuthFailure() {
    // Clear Redux state
    dispatch(logout());

    // Clear localStorage
    try {
      localStorage.removeItem("auth.tokens");
    } catch {
      // Ignore localStorage errors
    }

    // Show error message
    toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");

    // Redirect to login page
    setTimeout(() => {
      router.push("/auth/login");
    }, 2000);
  }

  async function handleCreateOrder() {
    if (!user || cartItems.length === 0) {
      toast.error("Không thể tạo đơn hàng. Vui lòng kiểm tra lại thông tin.");
      return;
    }

    // Check authentication state before proceeding
    if (!isAuthenticated) {
      handleAuthFailure();
      return;
    }

    // Double-check token exists in localStorage
    try {
      const tokenData = localStorage.getItem("auth.tokens");
      if (!tokenData) {
        handleAuthFailure();
        return;
      }
    } catch {
      handleAuthFailure();
      return;
    }

    // Validate required fields
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !phone.trim() ||
      !recipientAddress
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng.");
      return;
    }

    // Validate phone number format
    const phoneValidation = validateVietnamesePhone(phone.trim());
    if (!phoneValidation.isValid) {
      toast.error(`Số điện thoại không hợp lệ: ${phoneValidation.error}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const orderRequest = {
        recipientPhone: phone.trim(),
        recipientName: `${firstName.trim()} ${lastName.trim()}`,
        recipientAddress: recipientAddress,
        paymentMethod: paymentMethod,
        orderItems: cartItems.map((item) => ({
          productVariantId: item.productVariantId,
          designId: item.productDesignId ?? null,
          quantity: item.quantity,
        })),
        voucherCodes: voucherCode.trim()
          ? [voucherCode.trim().toUpperCase()]
          : [],
        isCreated: true,
      };

      const response = await createOrder(orderRequest);

      if (response.success && response.data) {
        // Store the order ID for potential cancellation
        setCurrentOrderId(response.data.orderId);
        // Store the payment code from response
        const orderPaymentCode = response.data.paymentCode || "SEPAY";
        setCurrentPaymentCode(orderPaymentCode);
        
        if (paymentMethod === "ONLINE_PAYMENT") {
          // Start 5-minute payment window and request payment info (e.g., QR)
          try {
            const qrRes = await createQrCode({
              amount: Math.max(0, subtotal - discount),
              paymentCode: orderPaymentCode,
            });
            if (qrRes.success) {
              setPaymentQr(qrRes.data ?? null);
              setPaymentDeadline(Date.now() + 2 * 60 * 1000);
              setPaymentDialogOpen(true);
              toast.success(
                "Đơn hàng đã tạo. Vui lòng thanh toán online trong 2 phút."
              );
            } else {
              const payErr = qrRes.errors
                ? Object.values(qrRes.errors).flat().join(", ")
                : "Không lấy được thông tin thanh toán";
              toast.error(payErr);
            }
          } catch (e) {
            toast.error(
              "Không thể khởi tạo thanh toán online. Vui lòng thử lại."
            );
          }
          // Do not clear cart or redirect yet; wait for payment
        } else {
          toast.success("Đơn hàng đã được tạo thành công!");
          // Clear the cart since order is completed
          dispatch(clearCart());
          router.push(`/account/orders`);
        }
      } else {
        const errorMessage = response.errors
          ? Object.values(response.errors).flat().join(", ")
          : "Có lỗi xảy ra khi tạo đơn hàng";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Order creation error:", error);

      // Check if it's an authentication error
      if (
        error instanceof Error &&
        (error.message === "AUTHENTICATION_REQUIRED" ||
          error.message.includes("No authentication token found") ||
          error.message.includes("Please login first"))
      ) {
        handleAuthFailure();
      } else {
        toast.error("Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const total = Math.max(0, subtotal - discount);

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <Link
                href="/cart"
                className="text-primary hover:underline mb-4 inline-block"
              >
                ← Quay lại giỏ hàng
              </Link>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Thanh Toán
              </h1>
              <p className="text-muted-foreground">Hoàn tất đơn hàng của bạn</p>
            </div>

            <Card className="text-center py-12">
              <CardContent>
                <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4">
                  <LogIn className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">
                  Yêu Cầu Đăng Nhập
                </h2>
                <p className="text-muted-foreground mb-6">
                  Bạn cần đăng nhập để tiến hành thanh toán. Vui lòng đăng nhập
                  để tiếp tục với đơn hàng của bạn.
                </p>
                <div className="flex gap-4 justify-center">
                  <Link href="/auth/login">
                    <Button>
                      <LogIn className="h-4 w-4 mr-2" />
                      Đăng Nhập
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button variant="outline">Tạo Tài Khoản</Button>
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Các sản phẩm trong giỏ hàng sẽ được bảo toàn sau khi bạn đăng
                  nhập.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Link
              href="/cart"
              className="text-primary hover:underline mb-4 inline-block"
            >
              ← Quay lại giỏ hàng
            </Link>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Thanh Toán
            </h1>
            <p className="text-muted-foreground">
              Hoàn tất đơn hàng của bạn {cartItems.length > 0 && `(${cartItems.length} sản phẩm) - ${formatCurrency(total, "VND", "vi-VN")}`}
            </p>
          </div>

          {/* Empty cart warning */}
          {cartItems.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Truck className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Không có sản phẩm nào được chọn</h2>
                <p className="text-muted-foreground mb-4">
                  Vui lòng quay lại giỏ hàng và chọn sản phẩm để thanh toán
                </p>
                <Link href="/cart">
                  <Button>Quay lại giỏ hàng</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Checkout form - only show if there are items */}
          {cartItems.length > 0 && (
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
                      <Label htmlFor="firstName" className="mb-2">Tên</Label>
                      <Input
                        id="firstName"
                        placeholder="Nhập tên của bạn"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="mb-2">Họ</Label>
                      <Input
                        id="lastName"
                        placeholder="Nhập họ của bạn"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email" className="mb-2">Email</Label>
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
                    <Label htmlFor="phone" className="mb-2">Số điện thoại</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="VD: 012 345 6789"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className={
                        phoneError ? "border-red-500 focus:border-red-500" : ""
                      }
                    />
                    {phoneError && (
                      <p className="text-sm text-red-500 mt-1">{phoneError}</p>
                    )}
                  </div>
                  {/* Vietnam Location - Province and Ward */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="province" className="mb-2">Tỉnh/Thành phố</Label>
                      <Popover
                        open={openProvince}
                        onOpenChange={setOpenProvince}
                      >
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
                            <CommandEmpty>
                              Không tìm thấy tỉnh/thành phố.
                            </CommandEmpty>
                            <ScrollArea className="h-60">
                              <CommandGroup>
                                {provinces.map((p) => (
                                  <CommandItem
                                    key={p.province}
                                    value={p.province}
                                    onSelect={(value) => {
                                      setSelectedProvince(value);
                                      setSelectedWard("");
                                      setOpenProvince(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedProvince === p.province
                                          ? "opacity-100"
                                          : "opacity-0"
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
                      <Label htmlFor="ward" className="mb-2">Phường/Xã</Label>
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
                            <CommandEmpty>
                              Không tìm thấy phường/xã.
                            </CommandEmpty>
                            <ScrollArea className="h-60">
                              <CommandGroup>
                                {wards.map((w) => (
                                  <CommandItem
                                    key={w.name}
                                    value={w.name}
                                    onSelect={(value) => {
                                      setSelectedWard(value);
                                      setOpenWard(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedWard === w.name
                                          ? "opacity-100"
                                          : "opacity-0"
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
                    <Label htmlFor="address" className="mb-2">Địa chỉ chi tiết</Label>
                    <Input
                      id="address"
                      placeholder={
                        isAddressDetailDisabled
                          ? "Vui lòng chọn tỉnh/thành phố và phường/xã trước"
                          : "Số nhà, tên đường, tòa nhà..."
                      }
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
                      <Label htmlFor="voucher" className="mb-2">Nhập mã giảm giá</Label>
                      <Input
                        id="voucher"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                        placeholder="VD: SAVE10"
                        className={
                          voucherError
                            ? "border-red-500 focus:border-red-500"
                            : ""
                        }
                      />
                      {voucherError && (
                        <p className="text-sm text-red-500 mt-1">
                          {voucherError}
                        </p>
                      )}
                    </div>
                    <div className="flex items-end">
                      <Button
                        className="w-full"
                        type="button"
                        onClick={validateVoucher}
                        disabled={isValidatingVoucher}
                      >
                        {isValidatingVoucher ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Đang kiểm tra...
                          </>
                        ) : (
                          "Áp dụng"
                        )}
                      </Button>
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
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem id="pay-cod" value="COD" />
                      <Label htmlFor="pay-cod">
                        Thanh toán khi nhận hàng (COD)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem id="pay-online" value="ONLINE_PAYMENT" />
                      <Label htmlFor="pay-online">Thanh toán online</Label>
                    </div>
                  </RadioGroup>
                  {paymentQr && (
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setPaymentDialogOpen(true)}
                      >
                        Xem mã QR thanh toán
                      </Button>
                    </div>
                  )}
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
                    {cartItems.map((item) => {
                      const originalPrice = item.price * item.quantity;
                      const hasDiscount =
                        item.discountAmount && item.discountAmount > 0;

                      return (
                        <div
                          key={item.id}
                          className="flex justify-between items-center"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              SL: {item.quantity} • Kích thước: {item.size} •
                              Màu sắc: {item.color}
                            </p>
                            {hasDiscount && item.voucherCode && (
                              <p className="text-xs text-green-600 mt-1">
                                🎉 Giảm {item.voucherDiscountPercent}% với mã{" "}
                                {item.voucherCode}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="font-medium">
                              {formatCurrency(originalPrice, "VND", "vi-VN")}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Giá gốc</span>
                      <span>{formatCurrency(subtotal, "VND", "vi-VN")}</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Giảm giá</span>
                        <span>-{formatCurrency(discount, "VND", "vi-VN")}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Tổng cộng</span>
                      <span className="text-primary">
                        {formatCurrency(total, "VND", "vi-VN")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      * Giá trên chưa bao gồm chi phí vận chuyển.
                    </p>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleCreateOrder}
                    disabled={
                      isSubmitting || cartItems.length === 0 || !!phoneError
                    }
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
          )}
        </div>
      </div>
      <Dialog open={paymentDialogOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Quét mã QR để thanh toán</DialogTitle>
            <DialogDescription>
              Vui lòng hoàn tất thanh toán trong {formatCountdown(countdownMs)}
            </DialogDescription>
          </DialogHeader>
          {paymentQr ? (
            <div className="flex flex-col items-center gap-3">
              <img
                src={paymentQr}
                alt="QR thanh toán"
                className="rounded-md border w-64 h-64 object-contain bg-white"
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Không có mã QR khả dụng.
            </p>
          )}
          <DialogFooter>
            <div className="flex w-full justify-center">
              <Button variant="destructive" onClick={handleCancelPayment}>
                Hủy thanh toán
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={paymentResultOpen} onOpenChange={setPaymentResultOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {paymentResultType === "success"
                ? "Thanh toán thành công"
                : "Thanh toán thất bại"}
            </DialogTitle>
            <DialogDescription>
              {paymentResultType === "success"
                ? "Cảm ơn bạn! Chúng tôi đang xử lý đơn hàng của bạn."
                : "Rất tiếc, có vẻ như thanh toán chưa hoàn tất. Bạn có thể thử lại hoặc đổi phương thức."}
            </DialogDescription>
          </DialogHeader>
          {paymentResultType === "success" ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                Bạn có thể xem tình trạng đơn hàng trong mục Đơn hàng của tôi.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                Hãy đảm bảo bạn chuyển đúng số tiền trong thời hạn. Nếu vẫn gặp
                vấn đề, vui lòng thử lại hoặc đổi phương thức.
              </p>
            </div>
          )}
          <DialogFooter>
            {paymentResultType === "success" ? (
              <div className="flex w-full justify-between gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setPaymentResultOpen(false);
                    router.push("/");
                  }}
                >
                  Tiếp tục mua sắm
                </Button>
                <Button
                  onClick={() => {
                    setPaymentResultOpen(false);
                    router.push("/account/orders");
                  }}
                >
                  Xem đơn hàng
                </Button>
              </div>
            ) : (
              <div className="flex w-full justify-between gap-2">
                <Button variant="secondary" onClick={handleChangeMethodToCOD}>
                  Đổi sang COD
                </Button>
                <Button onClick={handleRetryPayment}>Thử lại thanh toán</Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
