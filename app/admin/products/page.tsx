"use client";

import { useEffect, useMemo, useState } from "react";
import AdminPagination from "@/components/admin/pagination";
import Filter from "@/components/admin/filter";
import Sort from "@/components/admin/sort";
import { filterAndSortData } from "../utility/filter/filData";
import { useDebounce } from "../hook/useDebounce";


import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BinhDropdownMenuGeneric } from "@/components/admin/drop-down-setting";
import { Settings } from "lucide-react";
import Link from "next/link";

type Product = {
    id: string;
    name: string;
    price: string;
    category: string;
    rating: number;
    image: string;
    isNew: boolean;
};

const products: Product[] = [
    { id: "PROD-001", name: "Custom T-Shirt Design", price: "$29.99", category: "T-Shirts", rating: 4.8, image: "/custom-t-shirt-design.jpg", isNew: true },
    { id: "PROD-002", name: "Custom Hoodie", price: "$49.99", category: "Hoodies", rating: 4.9, image: "/custom-hoodie.png", isNew: false },
    { id: "PROD-003", name: "Floral T-Shirt Design", price: "$32.99", category: "T-Shirts", rating: 4.7, image: "/floral-t-shirt-design.jpg", isNew: true },
    { id: "PROD-004", name: "Geometric Hoodie Design", price: "$54.99", category: "Hoodies", rating: 3.6, image: "/geometric-hoodie-design.jpg", isNew: false },
    { id: "PROD-005", name: "Abstract Dress Design", price: "$69.99", category: "Dresses", rating: 4.8, image: "/abstract-dress-design.jpg", isNew: true },
    { id: "PROD-006", name: "Vintage Band T-Shirt", price: "$34.99", category: "T-Shirts", rating: 3.5, image: "/vintage-band-t-shirt.jpg", isNew: false },

    // Thêm 10 data mới
    { id: "PROD-007", name: "Minimalist Tote Bag", price: "$24.99", category: "Accessories", rating: 4.6, image: "/minimalist-tote-bag.jpg", isNew: true },
    { id: "PROD-008", name: "Classic Denim Jacket", price: "$89.99", category: "Jackets", rating: 3.4, image: "/classic-denim-jacket.jpg", isNew: false },
    { id: "PROD-009", name: "Summer Beach Shorts", price: "$27.99", category: "Shorts", rating: 1.2, image: "/summer-beach-shorts.jpg", isNew: true },
    { id: "PROD-010", name: "Oversized Graphic Hoodie", price: "$59.99", category: "Hoodies", rating: 4.9, image: "/oversized-graphic-hoodie.jpg", isNew: true },
    { id: "PROD-011", name: "Slim Fit Jeans", price: "$44.99", category: "Jeans", rating: 4.3, image: "/slim-fit-jeans.jpg", isNew: false },
    { id: "PROD-012", name: "Plaid Flannel Shirt", price: "$39.99", category: "Shirts", rating: 3.7, image: "/plaid-flannel-shirt.jpg", isNew: false },
    { id: "PROD-013", name: "Sports Sneakers", price: "$79.99", category: "Shoes", rating: 4.5, image: "/sports-sneakers.jpg", isNew: true },
    { id: "PROD-014", name: "Leather Belt", price: "$19.99", category: "Accessories", rating: 4.1, image: "/leather-belt.jpg", isNew: false },
    { id: "PROD-015", name: "Casual Polo Shirt", price: "$29.99", category: "Shirts", rating: 3.9, image: "/casual-polo-shirt.jpg", isNew: true },
    { id: "PROD-016", name: "Wool Cardigan", price: "$64.99", category: "Sweaters", rating: 2.6, image: "/wool-cardigan.jpg", isNew: false },
];


function prettyHeader(k: keyof Product) {
    const map: Partial<Record<keyof Product, string>> = {
        id: "ID",
        name: "Name",
        price: "Price",
        category: "Category",
        rating: "Rating",
        image: "Image",
        isNew: "Status",
    };
    return map[k] ?? String(k);
}

function renderCell(p: Product, k: keyof Product) {
    switch (k) {
        case "image":
            return <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover shadow-sm" />;
        case "isNew":
            return p.isNew ? (
                <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-700">
                    New
                </span>
            ) : (
                <span className="rounded-full bg-gray-300/30 px-2 py-0.5 text-xs text-gray-600">Old</span>
            );
        case "rating":
            return <span className="font-medium text-right">{p.rating.toFixed(1)}</span>;
        default:
            return String(p[k]);
    }
}

export default function ProductManagement() {
    const [data, setData] = useState<Product[]>([]);
    const [filters, setFilters] = useState({ search: "", category: "all" });
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState({ selectedSort: "" });
    const pageSize = 5;

    useEffect(() => {
        const fetchData = async () => {
            await new Promise((r) => setTimeout(r, 200));
            setData(products);
        };
        fetchData();
    }, []);

    const debouncedFilters = useDebounce(filters, 300);

    const filteredData = useMemo(() => {
        return filterAndSortData(data, filters, sort, "category", "name");
    }, [data, debouncedFilters, sort]);

    const start = (page - 1) * pageSize;
    const currentPageData = filteredData.slice(start, start + pageSize);

    const headers =
        currentPageData.length > 0
            ? (Object.keys(currentPageData[0]) as (keyof Product)[])
            : [];

    return (
        <div className="mx-auto px-10 space-y-6">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-4 shadow-sm">
                <h2 className="text-l tracking-tight font-sans border-2 px-5 py-0.5 rounded-2xl bg-black text-white">Products</h2>

                <div className="flex flex-wrap items-center gap-3">
                    <Filter
                        categories={[...new Set(products.map((p) => p.category))]}
                        onChange={setFilters}
                        filterBy="Filter by category"
                        searchBy="Search by name..."
                    />
                    <Sort sortItems={["Id", "Name", "Price", "Rating"]} onChange={setSort} />
                    <Link href={"/admin/products/add"}><Button className="shadow-sm">Add Product</Button></Link>

                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden  w-[100%] rounded-xl border shadow-sm">
                <Table className="w-full [&_th]:px-8 [&_td]:px-8 [&_th]:py-5 [&_td]:py-5">
                    <TableCaption className="py-3 text-sm text-muted-foreground">
                        Showing {currentPageData.length} of {filteredData.length} products
                    </TableCaption>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            {headers.map((key) => (
                                <TableHead key={key} className="whitespace-nowrap">
                                    {prettyHeader(key)}
                                </TableHead>
                            ))}
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {currentPageData.map((product) => (
                            <TableRow key={product.id} className={`${product.rating > 4 ? "" : ""} hover:bg-muted/30`}>
                                {headers.map((key) => (
                                    <TableCell key={String(key)}>{renderCell(product, key)}</TableCell>
                                ))}
                                <TableCell className="text-right">
                                    <BinhDropdownMenuGeneric
                                        data={product}
                                        options={[
                                            {
                                                label: "ConsoleLog->ID",
                                                icon: <Settings className="w-4 h-4" />,
                                                onClick: (u) => console.log("Xem chi tiết", u.id),
                                            },
                                            {
                                                label: "Alert User",
                                                icon: <Settings className="w-4 h-4" />,
                                                onClick: (u) => alert(`Ban user ${u.name}`),
                                            },
                                        ]}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>

                    <TableFooter className="bg-muted/30">
                        <TableRow>
                            <TableCell colSpan={headers.length} className="font-medium">
                                Total
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                                {filteredData.length}
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>

            {/* Pagination */}
            <AdminPagination
                totalItems={filteredData.length}
                pageSize={pageSize}
                onPageChange={(newPage) => setPage(newPage)}
            />
        </div>
    );
}
