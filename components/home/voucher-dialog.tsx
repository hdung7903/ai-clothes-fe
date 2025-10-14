"use client"

import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Gift, Copy, Check, Clock } from "lucide-react"

type Voucher = {
  id: string
  code: string
  title: string
  description: string
  discountText: string
  expiresAt?: string
  minSpend?: string
  category?: "popular" | "new" | "limited"
}

const VOUCHERS: Voucher[] = [
  {
    id: "welcome-10",
    code: "WELCOME10",
    title: "Welcome 10% Off",
    description: "Save 10% on your first order",
    discountText: "10% OFF",
    minSpend: "$30",
    category: "popular",
    expiresAt: "Dec 31, 2024",
  },
  {
    id: "freeship",
    code: "FREESHIP",
    title: "Free Shipping",
    description: "Enjoy free shipping on all orders",
    discountText: "FREE SHIP",
    minSpend: "$50",
    category: "new",
    expiresAt: "Dec 31, 2024",
  },
  {
    id: "bundle-15",
    code: "BUNDLE15",
    title: "Bundle and Save",
    description: "Buy 2+ items and get extra discount",
    discountText: "15% OFF",
    minSpend: "$100",
    category: "limited",
    expiresAt: "Dec 20, 2024",
  },
]

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
  const [visibleCount, setVisibleCount] = useState(DISPLAY_CONFIG.PAGE_SIZE)
  
  const containerRef = useRef<HTMLDivElement | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const hasShownRef = useRef(false)

  // Generate expanded vouchers list
  const allVouchers = useMemo(() => {
    const expanded: Voucher[] = []
    for (let i = 0; i < 60; i++) {
      const base = VOUCHERS[i % VOUCHERS.length]
      expanded.push({
        ...base,
        id: `${base.id}-${i}`,
      })
    }
    return expanded
  }, [])

  const displayedVouchers = useMemo(
    () => allVouchers.slice(0, visibleCount),
    [allVouchers, visibleCount]
  )

  // Check if should show dialog
  const shouldShowDialog = useCallback(() => {
    if (hasShownRef.current) return false
    
    // In-memory check for "don't show again"
    if (dontShowAgain) return false
    
    return true
  }, [dontShowAgain])

  // Show dialog with delay
  useEffect(() => {
    if (!shouldShowDialog()) return

    const timer = setTimeout(() => {
      setOpen(true)
      hasShownRef.current = true
    }, DISPLAY_CONFIG.DELAY_MS)

    return () => clearTimeout(timer)
  }, [shouldShowDialog])

  // Handle dialog close
  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      setVisibleCount(DISPLAY_CONFIG.PAGE_SIZE)
      setCopiedCode(null)
    }
  }, [])

  // Copy voucher code
  const handleCopy = useCallback(async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }, [])

  // Apply voucher (close dialog and copy)
  const handleApply = useCallback((code: string) => {
    handleCopy(code)
    setTimeout(() => setOpen(false), 500)
  }, [handleCopy])

  // Infinite scroll observer
  useEffect(() => {
    if (!open) return

    const sentinel = sentinelRef.current
    const container = containerRef.current
    if (!sentinel || !container) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => 
            Math.min(prev + DISPLAY_CONFIG.PAGE_SIZE, allVouchers.length)
          )
        }
      },
      { root: container, rootMargin: "100px", threshold: 0.1 }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [open, allVouchers.length])

  // Get category badge color
  const getCategoryColor = (category?: string) => {
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
        className="w-[95vw] sm:max-w-[1100px] p-0 overflow-hidden gap-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault()
          handleOpenChange(false)
        }}
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-600 flex items-center justify-center">
                <Gift className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl">🎉 Special Offers Just For You!</DialogTitle>
                <DialogDescription className="text-sm">
                  Choose your favorite voucher and save on your order
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Vouchers List */}
        <div 
          ref={containerRef}
          className="px-6 pb-6 overflow-y-auto"
          style={{ maxHeight: DISPLAY_CONFIG.MAX_HEIGHT }}
        >
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {displayedVouchers.map((voucher) => (
              <div
                key={voucher.id}
                className="group relative flex flex-col gap-3 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:border-primary/50 hover:shadow-md transition-all duration-200 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50"
              >
                {/* Category Badge */}
                {voucher.category && (
                  <div className="absolute top-3 right-3">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs uppercase font-semibold ${getCategoryColor(voucher.category)}`}
                    >
                      {voucher.category}
                    </Badge>
                  </div>
                )}

                {/* Content */}
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-lg shrink-0">
                    {voucher.code.substring(0, 2)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                        {voucher.title}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {voucher.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                      {voucher.minSpend && (
                        <span className="flex items-center gap-1">
                          <span className="font-medium">Min:</span> {voucher.minSpend}
                        </span>
                      )}
                      {voucher.expiresAt && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {voucher.expiresAt}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
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
                  >
                    Apply
                  </Button>
                </div>

                {/* Discount Badge */}
                <div className="absolute -top-2 -left-2 rotate-[-8deg]">
                  <Badge className="bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold px-3 py-1 shadow-lg">
                    {voucher.discountText}
                  </Badge>
                </div>
              </div>
            ))}

            {/* Loading Sentinel */}
            {visibleCount < allVouchers.length && (
              <div
                ref={sentinelRef}
                className="col-span-full flex items-center justify-center py-8 text-sm text-gray-500"
              >
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>Loading more vouchers...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
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
                Don't show this again today
              </label>
            </div>
            
            <div className="text-xs text-gray-500">
              {displayedVouchers.length} of {allVouchers.length} vouchers
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}