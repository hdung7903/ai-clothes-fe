"use client"
import React from "react"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

type AdminPaginationProps = {
    totalItems: number
    pageSize?: number
    onPageChange?: (page: number) => void
}

export default function AdminPagination({ totalItems, pageSize = 5, onPageChange }: AdminPaginationProps) {
    const [page, setPage] = React.useState(1)
    const totalPages = Math.ceil(totalItems / pageSize)

    function handlePageChange(newPage: number) {
        if (newPage < 1 || newPage > totalPages) return
        setPage(newPage)
        onPageChange?.(newPage) // callback để parent biết page đã thay đổi
    }

    return (
        <Pagination className="mt-6">
            <PaginationContent>
                {/* Nút Previous */}
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                            e.preventDefault()
                            handlePageChange(page - 1)
                        }}
                        aria-disabled={page === 1}
                        className={page === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                </PaginationItem>

                {/* Số trang (ví dụ hiển thị 1-5) */}
                {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1
                    return (
                        <PaginationItem key={pageNum}>
                            <PaginationLink
                                href="#"
                                isActive={pageNum === page}
                                onClick={(e) => {
                                    e.preventDefault()
                                    handlePageChange(pageNum)
                                }}
                            >
                                {pageNum}
                            </PaginationLink>
                        </PaginationItem>
                    )
                })}

                {/* Ellipsis (ẩn khi ít trang) */}
                {totalPages > 5 && <PaginationEllipsis />}

                {/* Nút Next */}
                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={(e) => {
                            e.preventDefault()
                            handlePageChange(page + 1)
                        }}
                        aria-disabled={page === totalPages}
                        className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    )
}
