"use client"

import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Gift, Copy, Check, Clock, AlertCircle } from "lucide-react"
import { searchVouchers } from "@/services/voucherService"
import type { VoucherSummaryItem } from "@/types/voucher"

const DISPLAY_CONFIG = {
  DELAY_MS: 3000, // 3 seconds delay
  SHOW_ONCE_PER_SESSION: true,
  PAGE_SIZE: 12,
  MAX_HEIGHT: "85vh",
}

export function VoucherDialog() {
  const [open, setOpen] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [vouchers, setVouchers] = useState<VoucherSummaryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  
  const containerRef = useRef<HTMLDivElement | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const hasShownRef = useRef(false)

  // Load vouchers from API
  const loadVouchers = useCallback(async (page: number = 1, append: boolean = false) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await searchVouchers({
        IsActive: true,
        SortBy: 'CREATED_ON',
        SortDescending: true,
        PageNumber: page,
        PageSize: DISPLAY_CONFIG.PAGE_SIZE
      })
      
      if (response.success && response.data) {
        // Map API response to VoucherSummaryItem format
        const newVouchers = response.data.items.map((item: any) => {
          // Determine discount type based on value and description
          let discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' = 'FIXED_AMOUNT'
          if (item.discountType) {
            discountType = item.discountType
          } else if (item.discountValue && item.discountValue <= 100) {
            // If discount value is <= 100 and no type specified, assume percentage
            discountType = 'PERCENTAGE'
          } else if (item.description && item.description.includes('%')) {
            // Check description for percentage indicator
            discountType = 'PERCENTAGE'
          }
          
          return {
            voucherId: item.id,
            code: item.code,
            name: item.description || item.code,
            discountType,
            discountValue: item.discountValue,
            isActive: item.isActive,
            validFrom: item.startDate,
            validTo: item.endDate,
            usageLimit: undefined, // Not provided in API response
            usedCount: item.usedCount,
            createdBy: undefined // Not provided in API response
          }
        })
        setVouchers(prev => append ? [...prev, ...newVouchers] : newVouchers)
        setHasMore(page < response.data.totalPages)
        setPageNumber(page)
      } else {
        setError('Không thể tải danh sách voucher')
      }
    } catch (err) {
      setError('Lỗi khi tải voucher')
      console.error('Error loading vouchers:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load more vouchers
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      loadVouchers(pageNumber + 1, true)
    }
  }, [isLoading, hasMore, pageNumber, loadVouchers])

  // Check if should show dialog
  const shouldShowDialog = useCallback(() => {
    if (hasShownRef.current) return false
    
    // In-memory check for "don't show again"
    if (dontShowAgain) return false
    
    return true
  }, [dontShowAgain])

  // Load vouchers when component mounts
  useEffect(() => {
    loadVouchers(1, false)
  }, [loadVouchers])

  // Hiển thị hộp thoại sau một khoảng trễ
  useEffect(() => {
    if (!shouldShowDialog() || vouchers.length === 0) return

    const timer = setTimeout(() => {
      setOpen(true)
      hasShownRef.current = true
    }, DISPLAY_CONFIG.DELAY_MS)

    return () => clearTimeout(timer)
  }, [shouldShowDialog, vouchers.length])

  // Đóng hộp thoại
  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      setCopiedCode(null)
    }
  }, [])

  // Sao chép mã voucher
  const handleCopy = useCallback(async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      
      // Đặt lại trạng thái sau 2 giây
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      console.error("Sao chép thất bại:", error)
    }
  }, [])

  // Áp dụng voucher (đóng hộp thoại và sao chép)
  const handleApply = useCallback((code: string) => {
    handleCopy(code)
    setTimeout(() => setOpen(false), 500)
  }, [handleCopy])

  // Theo dõi cuộn vô hạn
  useEffect(() => {
    if (!open) return

    const sentinel = sentinelRef.current
    const container = containerRef.current
    if (!sentinel || !container) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { root: container, rootMargin: "100px", threshold: 0.1 }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [open, loadMore])

  // Format discount text
  const formatDiscountText = (voucher: VoucherSummaryItem) => {
    if (voucher.discountType === 'PERCENTAGE') {
      return `GIẢM ${voucher.discountValue || 0}%`
    } else {
      return `GIẢM ${(voucher.discountValue || 0).toLocaleString('vi-VN')}₫`
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  // Check if voucher is expired
  const isExpired = (validTo: string) => {
    return new Date(validTo) < new Date()
  }

  // Check if voucher is available
  const isAvailable = (voucher: VoucherSummaryItem) => {
    const now = new Date()
    const validFrom = new Date(voucher.validFrom)
    const validTo = new Date(voucher.validTo)
    
    return now >= validFrom && now <= validTo && voucher.isActive
  }

  // Get category based on usage
  const getCategory = (voucher: VoucherSummaryItem) => {
    if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit * 0.8) {
      return 'limited'
    }
    if (voucher.usedCount > 50) {
      return 'popular'
    }
    return 'new'
  }

  // Lấy màu huy hiệu theo danh mục
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "popular":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
      case "new":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
      case "limited":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="w-[95vw] sm:max-w-[1100px] p-0 overflow-hidden gap-0 mt-20"
        onEscapeKeyDown={(e) => {
          e.preventDefault()
          handleOpenChange(false)
        }}
      >
        {/* Phần đầu */}
        <DialogHeader className="px-6 pt-6 pb-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-600 flex items-center justify-center">
                <Gift className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl">🎉 Ưu đãi dành riêng cho bạn!</DialogTitle>
                <DialogDescription className="text-sm">
                  Chọn voucher yêu thích và tiết kiệm cho đơn hàng của bạn
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Danh sách voucher */}
        <div 
          ref={containerRef}
          className="p-6 overflow-y-auto"
          style={{ maxHeight: DISPLAY_CONFIG.MAX_HEIGHT }}
        >
          {error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <p className="text-destructive font-medium mb-2">Không thể tải voucher</p>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => loadVouchers(1, false)} variant="outline">
                  Thử lại
                </Button>
              </div>
            </div>
          ) : vouchers.length === 0 && !isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-medium mb-2">Chưa có voucher nào</p>
                <p className="text-sm text-muted-foreground">Vui lòng quay lại sau</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              {vouchers.map((voucher, index) => {
                const category = getCategory(voucher)
                const available = isAvailable(voucher)
                const expired = isExpired(voucher.validTo)
                
                return (
                  <div
                    key={voucher.voucherId || `voucher-${index}`}
                    className={`group relative flex flex-col gap-3 rounded-xl border p-4 transition-all duration-200 ${
                      available 
                        ? 'border-gray-200 dark:border-gray-800 hover:border-primary/50 hover:shadow-md bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50'
                        : 'border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 opacity-60'
                    }`}
                  >
                    {/* Huy hiệu danh mục */}
                    <div className="absolute top-3 right-3">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs uppercase font-semibold ${getCategoryColor(category)}`}
                      >
                        {category}
                      </Badge>
                    </div>

                    {/* Trạng thái không khả dụng */}
                    {!available && (
                      <div className="absolute top-3 left-3">
                        <Badge variant="destructive" className="text-xs">
                          {expired ? 'Hết hạn' : 'Chưa áp dụng'}
                        </Badge>
                      </div>
                    )}

                    {/* Nội dung */}
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-lg shrink-0">
                        {voucher.code.substring(0, 2)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                            {voucher.name}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {voucher.discountType === 'PERCENTAGE' 
                            ? `Giảm ${voucher.discountValue || 0}% cho đơn hàng`
                            : `Giảm ${(voucher.discountValue || 0).toLocaleString('vi-VN')}₫ cho đơn hàng`
                          }
                        </p>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            HSD: {formatDate(voucher.validTo)}
                          </span>
                          {voucher.usageLimit && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <span className="font-medium">Đã dùng:</span> {voucher.usedCount}/{voucher.usageLimit}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Hành động */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700">
                        <code className="text-sm font-mono font-semibold text-primary flex-1">
                          {voucher.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => handleCopy(voucher.code)}
                        >
                          {copiedCode === voucher.code ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      
                      <Button
                        size="sm"
                        className="h-9 font-semibold"
                        onClick={() => handleApply(voucher.code)}
                        disabled={!available}
                      >
                        {available ? 'Áp dụng' : 'Không khả dụng'}
                      </Button>
                    </div>

                    {/* Huy hiệu giảm giá */}
                    <div className="absolute -top-2 -left-2 rotate-[-8deg]">
                      <Badge className="bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold px-3 py-1 shadow-lg">
                        {formatDiscountText(voucher)}
                      </Badge>
                    </div>
                  </div>
                )
              })}

              {/* Đang tải thêm */}
              {isLoading && (
                <div className="col-span-full flex items-center justify-center py-8 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Đang tải thêm voucher...</span>
                  </div>
                </div>
              )}

              {/* Sentinel for infinite scroll */}
              {hasMore && !isLoading && (
                <div ref={sentinelRef} className="col-span-full h-1" />
              )}
            </div>
          )}
        </div>

        {/* Chân trang */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="dont-show"
                checked={dontShowAgain}
                onCheckedChange={(checked) => setDontShowAgain(checked === true)}
              />
              <label
                htmlFor="dont-show"
                className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
              >
                Không hiển thị lại hôm nay
              </label>
            </div>
            
            <div className="text-xs text-gray-500">
              {vouchers.length} voucher{isLoading ? ' (đang tải...)' : ''}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}