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
  PAGE_SIZE: 4, // Limit to 4 vouchers
  MAX_HEIGHT: "60vh", // Make smaller
  DONT_SHOW_DURATION_MS: 60 * 60 * 1000, // 1 hour in milliseconds
  STORAGE_KEY: 'voucher-dialog-dismissed'
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
        PageNumber: page,
        PageSize: 20 // Fetch more vouchers to randomly select from
      })
      
      if (response.success && response.data) {
        // Map API response to VoucherSummaryItem format
        const allVouchers: VoucherSummaryItem[] = response.data.items.map((item: any) => {
          // Determine discount type based on value and description
          let discountType: 'PERCENT' | 'FIXED_AMOUNT' = 'FIXED_AMOUNT'
          if (item.discountType) {
            discountType = item.discountType === 'PERCENTAGE' ? 'PERCENT' : item.discountType
          } else if (item.discountValue && item.discountValue <= 100) {
            // If discount value is <= 100 and no type specified, assume percentage
            discountType = 'PERCENT'
          } else if (item.description && item.description.includes('%')) {
            // Check description for percentage indicator
            discountType = 'PERCENT'
          }
          
          return {
            id: item.id,
            code: item.code,
            description: item.description || item.code,
            discountType,
            discountValue: item.discountValue,
            startDate: item.startDate,
            endDate: item.endDate,
            usedCount: item.usedCount || 0,
            isActive: item.isActive,
            createdAt: item.createdAt || new Date().toISOString(),
            lastModifiedAt: item.lastModifiedAt || new Date().toISOString(),
            products: item.products || []
          }
        })
        
        // Randomly select 4 vouchers
        const shuffled = [...allVouchers].sort(() => Math.random() - 0.5)
        const randomVouchers = shuffled.slice(0, 4)
        
        setVouchers(randomVouchers)
        setHasMore(false) // Disable infinite scroll since we only show 4 vouchers
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
    
    // Check localStorage for "don't show again" timestamp
    try {
      const dismissedTimestamp = localStorage.getItem(DISPLAY_CONFIG.STORAGE_KEY)
      if (dismissedTimestamp) {
        const dismissedTime = parseInt(dismissedTimestamp, 10)
        const now = Date.now()
        
        // If less than 1 hour has passed, don't show
        if (now - dismissedTime < DISPLAY_CONFIG.DONT_SHOW_DURATION_MS) {
          return false
        } else {
          // Remove expired timestamp
          localStorage.removeItem(DISPLAY_CONFIG.STORAGE_KEY)
        }
      }
    } catch (error) {
      console.error('Error checking localStorage:', error)
    }
    
    return true
  }, [])

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
      
      // Save dismiss timestamp to localStorage
      if (dontShowAgain) {
        try {
          localStorage.setItem(DISPLAY_CONFIG.STORAGE_KEY, Date.now().toString())
        } catch (error) {
          console.error('Error saving to localStorage:', error)
        }
      }
    }
  }, [dontShowAgain])

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

  // Remove infinite scroll since we only show 4 vouchers

  // Format discount text
  const formatDiscountText = (voucher: VoucherSummaryItem) => {
    if (voucher.discountType === 'PERCENT') {
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
    const validFrom = new Date(voucher.startDate)
    const validTo = new Date(voucher.endDate)
    
    return now >= validFrom && now <= validTo && voucher.isActive
  }

  // Get category based on usage
  const getCategory = (voucher: VoucherSummaryItem) => {
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
        className="w-[90vw] sm:max-w-[800px] p-0 overflow-hidden gap-0 bg-gradient-to-br from-white via-orange-50/30 to-pink-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
        onEscapeKeyDown={(e) => {
          e.preventDefault()
          handleOpenChange(false)
        }}
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-orange-400/20 to-pink-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-br from-pink-400/20 to-orange-600/20 rounded-full blur-3xl" />
        </div>

        {/* Phần đầu */}
        <DialogHeader className="relative px-6 pt-6 pb-4 space-y-2 border-b border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-400 via-pink-500 to-pink-600 flex items-center justify-center shadow-lg shadow-pink-500/30 animate-pulse">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  🎉 Ưu đãi đặc biệt dành cho bạn!
                </DialogTitle>
                <DialogDescription className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                  Chọn voucher yêu thích và tiết kiệm ngay cho đơn hàng của bạn
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Danh sách voucher */}
        <div 
          ref={containerRef}
          className="relative p-6 overflow-y-auto overflow-x-hidden"
          style={{ 
            maxHeight: DISPLAY_CONFIG.MAX_HEIGHT
          }}
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
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 p-2">
              {vouchers.map((voucher, index) => {
                const category = getCategory(voucher)
                const available = isAvailable(voucher)
                const expired = isExpired(voucher.endDate)
                
                return (
                  <div
                    key={voucher.id || `voucher-${index}`}
                    className={`group relative flex flex-col gap-3 rounded-xl border-2 p-5 transition-all duration-300 ${
                      available 
                        ? 'border-orange-200/60 dark:border-orange-900/40 hover:border-orange-400/80 hover:shadow-xl hover:shadow-orange-500/20 bg-gradient-to-br from-white via-orange-50/30 to-pink-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 hover:-translate-y-1'
                        : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 opacity-60'
                    }`}
                  >
                    {/* Shine effect on hover */}
                    {available && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full" />
                    )}

                    {/* Top row: Discount badge and category badge */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      {/* Discount badge */}
                      <div className="flex-shrink-0">
                        <Badge className="bg-gradient-to-r from-orange-500 via-pink-500 to-pink-600 text-white font-black px-3 py-1.5 shadow-lg shadow-pink-500/30 text-xs border-2 border-white dark:border-gray-900 whitespace-nowrap">
                          {formatDiscountText(voucher)}
                        </Badge>
                      </div>

                      {/* Category or status badge */}
                      <div className="flex-shrink-0">
                        {!available ? (
                          <Badge variant="destructive" className="text-xs font-bold px-3 py-1 shadow-md">
                            {expired ? '⏰ Hết hạn' : '🔒 Chưa áp dụng'}
                          </Badge>
                        ) : (
                          <Badge 
                            variant="secondary" 
                            className={`text-xs uppercase font-bold px-3 py-1 shadow-md ${getCategoryColor(category)}`}
                          >
                            {category === 'popular' ? '🔥 Phổ biến' : '✨ Mới'}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-tight mb-2">
                          {voucher.description}
                        </h3>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {voucher.discountType === 'PERCENT' 
                            ? `🎁 Giảm ${voucher.discountValue || 0}% cho đơn hàng của bạn`
                            : `🎁 Giảm ${(voucher.discountValue || 0).toLocaleString('vi-VN')}₫ cho đơn hàng của bạn`
                          }
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="font-medium">HSD: {formatDate(voucher.endDate)}</span>
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 flex-1 px-3 py-2.5 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-2 border-dashed border-orange-300 dark:border-orange-700 group-hover:border-orange-400 dark:group-hover:border-orange-600 transition-colors">
                        <code className="text-sm font-mono font-bold text-orange-600 dark:text-orange-400 flex-1 tracking-wider truncate">
                          {voucher.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors flex-shrink-0"
                          onClick={() => handleCopy(voucher.code)}
                          disabled={!available}
                        >
                          {copiedCode === voucher.code ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-green-600 mr-1" />
                              <span className="text-xs font-medium text-green-600">Đã sao</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5 mr-1" />
                              <span className="text-xs font-medium">Sao chép</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Bottom decorative line */}
                    {available && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-pink-500 to-orange-400 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                )
              })}

              {/* Loading indicator for initial load only */}
              {isLoading && vouchers.length === 0 && (
                <div className="col-span-full flex items-center justify-center py-8 text-sm text-gray-500">
                  <div className="flex items-center gap-3 bg-white dark:bg-gray-900 px-6 py-3 rounded-full shadow-lg border border-gray-200 dark:border-gray-800">
                    <div className="h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    <span className="font-medium">Đang tải voucher...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chân trang */}
        <div className="relative px-6 py-4 border-t border-gray-200/50 dark:border-gray-800/50 bg-gradient-to-r from-white via-orange-50/20 to-pink-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                id="dont-show"
                checked={dontShowAgain}
                onCheckedChange={(checked) => setDontShowAgain(checked === true)}
                className="border-orange-400 data-[state=checked]:bg-orange-500"
              />
              <label
                htmlFor="dont-show"
                className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer font-medium"
              >
                Không hiển thị lại trong 1 giờ tới
              </label>
            </div>
            
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full">
              <Gift className="h-3.5 w-3.5" />
              <span>{vouchers.length}/4 voucher</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}