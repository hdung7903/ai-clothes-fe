"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Skeleton } from "../ui/skeleton"
import Link from "next/link"
import { Button } from "../ui/button"

const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    alert(`Đã copy mã: ${code}`)
}

export default function Popup() {
    const [open, setOpen] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const [products, setProducts] = useState<any[]>([])
    const [visibleCount, setVisibleCount] = useState(5)

    useEffect(() => {
        const loadProducts = async () => {
            await new Promise((resolve) => setTimeout(resolve, 1500))
            setProducts([
                { id: 1, code: "SALE20", title: "Giảm 20% Áo Thun", discount_percent: 20, start_date: "2025-09-20T00:00:00", end_date: "2025-10-05T23:59:59", category_id: 1, status: "ACTIVE" },
                { id: 2, code: "HOODIE30", title: "Giảm 30% Hoodie Mùa Đông", discount_percent: 30, start_date: "2025-09-15T00:00:00", end_date: "2025-10-01T23:59:59", category_id: 2, status: "ACTIVE" },
                { id: 3, code: "DRESS15", title: "Ưu đãi 15% cho Váy", discount_percent: 15, start_date: "2025-09-10T00:00:00", end_date: "2025-09-25T23:59:59", category_id: 3, status: "EXPIRED" },
                { id: 4, code: "ACC50", title: "Giảm 50% Phụ Kiện", discount_percent: 50, start_date: "2025-09-01T00:00:00", end_date: "2025-12-31T23:59:59", category_id: 4, status: "ACTIVE" },
                { id: 5, code: "BIGSALE", title: "Sale Toàn Bộ Sản Phẩm 10%", discount_percent: 10, start_date: "2025-09-22T00:00:00", end_date: "2025-09-30T23:59:59", category_id: 1, status: "ACTIVE" },
                { id: 6, code: "SALE20", title: "Giảm 20% Áo Thun", discount_percent: 20, start_date: "2025-09-20T00:00:00", end_date: "2025-10-05T23:59:59", category_id: 1, status: "ACTIVE" },
                { id: 7, code: "HOODIE30", title: "Giảm 30% Hoodie Mùa Đông", discount_percent: 30, start_date: "2025-09-15T00:00:00", end_date: "2025-10-01T23:59:59", category_id: 2, status: "ACTIVE" },
                { id: 8, code: "DRESS15", title: "Ưu đãi 15% cho Váy", discount_percent: 15, start_date: "2025-09-10T00:00:00", end_date: "2025-09-25T23:59:59", category_id: 3, status: "ACTIVE" },
                { id: 9, code: "ACC50", title: "Giảm 50% Phụ Kiện", discount_percent: 50, start_date: "2025-09-01T00:00:00", end_date: "2025-12-31T23:59:59", category_id: 4, status: "ACTIVE" },
                { id: 10, code: "BIGSALE", title: "Sale Toàn Bộ Sản Phẩm 10%", discount_percent: 10, start_date: "2025-09-22T00:00:00", end_date: "2025-09-30T23:59:59", category_id: 1, status: "ACTIVE" },
            ])
            setIsLoading(false)
        }

        loadProducts()
    }, [])

    const activeProducts = products.filter((v) => {
        const now = new Date()
        return (
            v.status === "ACTIVE" &&
            new Date(v.start_date) <= now &&
            new Date(v.end_date) >= now
        )
    })

    const visibleProducts = activeProducts.slice(0, visibleCount)

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget
        if (target.scrollTop + target.clientHeight >= target.scrollHeight - 50) {
            setVisibleCount((prev) => {
                if (prev < activeProducts.length) {
                    return prev + 5
                }
                return prev
            })
        }
    }

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-6 right-6 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700"
            >
                Xem voucher HOT
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] relative p-4 sm:p-6 
                        flex flex-col md:grid md:grid-cols-[1fr_auto] gap-4">

                        {/* nút đóng */}
                        <Button
                            onClick={() => setOpen(false)}
                            variant="ghost"
                            className="absolute top-3 right-3 h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                        >
                            ✕
                        </Button>

                        {/* CỘT TRÁI */}
                        <div className="max-h-[65vh] md:max-h-[70vh] overflow-y-auto pr-1 md:pr-4" onScroll={handleScroll}>
                            <div className="text-xl md:text-2xl font-bold sticky top-0 bg-white z-10 py-2 md:py-4">
                                Super vouchers
                            </div>

                            <div className="space-y-4">
                                {isLoading ? (
                                    <>
                                        <Skeleton className="h-20 w-full" />
                                        <Skeleton className="h-20 w-full" />
                                        <Skeleton className="h-20 w-full" />
                                    </>
                                ) : visibleProducts.length > 0 ? (
                                    visibleProducts.map((voucher) => (
                                        <Card key={voucher.id} className="relative">
                                            <CardHeader>
                                                <CardTitle className="text-sm md:text-lg">{voucher.title}</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-gray-700 flex flex-wrap items-center">
                                                    <span>Mã: <span className="font-mono">{voucher.code}</span></span>
                                                    <Button size="sm" onClick={() => handleCopy(voucher.code)} className="ml-3 mt-1 md:mt-0">
                                                        COPY
                                                    </Button>
                                                </div>
                                                <p
                                                    className={`font-semibold absolute top-3 right-3 ${voucher.discount_percent > 30 ? "text-red-600" : "text-green-600"}`}
                                                >
                                                    Giảm {voucher.discount_percent}%
                                                </p>

                                                <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-2">
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(voucher.start_date).toLocaleDateString("vi-VN")} → {new Date(voucher.end_date).toLocaleDateString("vi-VN")}
                                                    </div>
                                                    <Link href="/products" className="mt-2 md:mt-0">
                                                        <Button variant="outline" className="w-full md:w-auto">
                                                            Get voucher
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center">
                                        Hiện chưa có voucher nào.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* CỘT PHẢI (ẩn trên mobile, hiện từ md) */}
                        <div className="hidden md:flex items-center justify-center">
                            <img
                                src="/abstract-dress-design.jpg"
                                alt="Ads"
                                className="max-w-[250px] rounded-xl shadow-lg object-cover"
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
