"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
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
import BinhSort from "@/components/admin/sort";
import Filter from "@/components/admin/filter";
import AdminPagination from "@/components/admin/pagination";
import { useDebounce } from "../hook/useDebounce";
import { filterAndSortData } from "../utility/filter/filData";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Settings, Copy } from "lucide-react"
import { DropdownMenuTrigger, DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BinhDropdownMenuGeneric } from "@/components/admin/drop-down-setting";

type User = {
    id: string;
    role: string;
    name: string;
    age: number;
    email: string;
    address: string;
    active: boolean;
    gender: boolean;
    dob: Date;
    phone: string;
};

const hardUsers: User[] = [
    { id: "ID1", role: "role1", name: "John Doe", age: 18, email: "user1@gmail.com", address: "Vietnam", active: true, gender: true, dob: new Date("2006-01-01"), phone: "012345678" },
    { id: "ID2", role: "role2", name: "Alice Smith", age: 22, email: "alice.smith@example.com", address: "USA", active: true, gender: false, dob: new Date("2002-03-15"), phone: "0987654321" },
    { id: "ID3", role: "role3", name: "Bob Johnson", age: 30, email: "bob.johnson@example.com", address: "UK", active: false, gender: true, dob: new Date("1994-07-21"), phone: "0934123456" },
    { id: "ID4", role: "role1", name: "Charlie Nguyen", age: 25, email: "charlie.nguyen@example.com", address: "Vietnam", active: true, gender: true, dob: new Date("1999-10-10"), phone: "0911222333" },
    { id: "ID5", role: "role1", name: "Daisy Tran", age: 28, email: "daisy.tran@example.com", address: "Canada", active: true, gender: false, dob: new Date("1996-12-12"), phone: "0909090909" },
    { id: "ID6", role: "role3", name: "Ethan Lee", age: 35, email: "ethan.lee@example.com", address: "Singapore", active: false, gender: true, dob: new Date("1989-05-05"), phone: "0999888777" },
    { id: "ID7", role: "role1", name: "Fiona Chen", age: 21, email: "fiona.chen@example.com", address: "China", active: true, gender: false, dob: new Date("2003-02-02"), phone: "0888123456" },
    { id: "ID8", role: "role2", name: "George Kim", age: 27, email: "george.kim@example.com", address: "Korea", active: true, gender: true, dob: new Date("1997-08-08"), phone: "0777123456" },
    { id: "ID9", role: "role3", name: "Hannah Park", age: 19, email: "hannah.park@example.com", address: "Korea", active: false, gender: false, dob: new Date("2005-11-11"), phone: "0666123456" },
    { id: "ID10", role: "role2", name: "Ivan Petrov", age: 33, email: "ivan.petrov@example.com", address: "Russia", active: true, gender: true, dob: new Date("1991-09-09"), phone: "0555123456" },
    { id: "ID11", role: "role2", name: "Julia Roberts", age: 26, email: "julia.roberts@example.com", address: "Australia", active: true, gender: false, dob: new Date("1998-06-06"), phone: "0444123456" },
];

const UserPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [filters, setFilters] = useState({ search: "", category: "all" });
    const [page, setPage] = useState(1);
    const pageSize = 5;
    const [sort, setSort] = useState({ selectedSort: "" });

    const debouncedFilters = useDebounce(filters, 300);
    const filteredData = useMemo(() => {
        return filterAndSortData(users, debouncedFilters, sort, "address", "name");
    }, [users, debouncedFilters, sort]);

    const start = (page - 1) * pageSize;
    const currentPageData = filteredData.slice(start, start + pageSize);

    useEffect(() => {
        const fetchData = async () => {
            await new Promise((r) => setTimeout(r, 200));
            setUsers(hardUsers);
        };
        fetchData();
    }, []);

    return (
        <div className="mx-auto px-10 space-y-6">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-card p-4 shadow-sm border-2">
                <h2 className="text-l tracking-tight font-sans border-2 px-5 py-0.5 rounded-2xl bg-black text-white">Users</h2>

                <div className="flex flex-wrap items-center gap-3">
                    <BinhSort sortItems={["Address", "Name"]} onChange={setSort} />
                    <Filter
                        categories={[...new Set(hardUsers.map((p) => p.address))]}
                        onChange={setFilters}
                        filterBy="Filter by address"
                        searchBy="Search by name..."
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden w-full rounded-xl border shadow-sm">
                <Table className="w-full [&_th]:px-8 [&_td]:px-8 [&_th]:py-5 [&_td]:py-5">
                    <TableCaption className="py-3 text-sm text-muted-foreground">
                        Showing {currentPageData.length} of {filteredData.length} users
                    </TableCaption>

                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="whitespace-nowrap">ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Active</TableHead>

                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {currentPageData.map((user) => (
                            <TableRow key={user.id} className={`${user.active ? "" : ""} hover:bg-muted/30`}>
                                <TableCell>{user.id}</TableCell>
                                <TableCell>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <Dialog>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <DialogTrigger asChild>
                                                        <p className="cursor-pointer hover:underline">{user.name}</p>
                                                    </DialogTrigger>
                                                </TooltipTrigger>
                                                <TooltipContent >
                                                    <p>More details</p>
                                                </TooltipContent>

                                            </Tooltip>

                                            <DialogContent
                                                className="max-w-4xl overflow-hidden rounded-2xl border">

                                                {/* Thanh màu trên đầu tạo điểm nhấn */}
                                                <div className="w-full bg-gradient-to-r from-primary via-primary/60 to-transparent" />

                                                {/* Header */}
                                                <div className="hidden">
                                                    <DialogHeader className="px-6 pt-4 pb-3 border-b">
                                                        <DialogTitle className="text-xl font-semibold">User Details</DialogTitle>

                                                    </DialogHeader>
                                                </div>

                                                {/* Nội dung chính */}
                                                <div>
                                                    {/* Cột trái: Profile Card */}
                                                    <div className={`md:col-span-1 ${user.active ? "bg-green-50" : "bg-red-50"} w-1000px `}>
                                                        <div className="rounded-xl border p-5 bg-muted/40 shadow-inner space-y-5">
                                                            {/* Avatar */}
                                                            <div className="flex items-center gap-4">
                                                                <div className="h-16 w-16 rounded-full bg-primary/10 text-primary grid place-items-center text-xl font-bold">
                                                                    {user.name
                                                                        .split(" ")
                                                                        .filter(Boolean)
                                                                        .slice(0, 2)
                                                                        .map((s) => s[0]?.toUpperCase() ?? "")
                                                                        .join("")}
                                                                </div>
                                                                <div>
                                                                    <p className="text-lg font-semibold">{user.name}</p>
                                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                                        <Badge variant="secondary">@{user.role}</Badge>
                                                                        {user.active ? (
                                                                            <Badge className="bg-emerald-500/90 text-white">Active</Badge>
                                                                        ) : (
                                                                            <Badge variant="destructive">Inactive</Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Info */}
                                                            <div className="space-y-1 text-sm text-muted-foreground">
                                                                <p><span className="font-medium text-foreground">ID:</span> {user.id}</p>
                                                                <p><span className="font-medium text-foreground">Email:</span> {user.email} </p>
                                                                <p><span className="font-medium text-foreground">Phone:</span> {user.phone}</p>
                                                                <p><span className="font-medium text-foreground">Address:</span> {user.address}</p>
                                                                <p><span className="font-medium text-foreground">Gender:</span> {user.gender ? "Male" : "Female"}</p>
                                                                <p><span className="font-medium text-foreground">DOB:</span> {user.dob.toDateString()}</p>
                                                                <p><span className="font-medium text-foreground">Age:</span> {user.age}</p>

                                                            </div>

                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Footer */}
                                                {/* <div className="border-t px-6 py-4 flex justify-end gap-3 bg-muted/30">
                                                    <Button variant="outline">Cancel</Button>
                                                    <Button>Save changes</Button>
                                                </div> */}
                                            </DialogContent>

                                        </Dialog>



                                        <span className="text-muted-foreground truncate text-xs">
                                            @{user.role}
                                        </span>
                                    </div>
                                </TableCell>

                                <TableCell>{user.address}</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        {user.phone}
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Copy onClick={() => {
                                                    navigator.clipboard.writeText(user.phone);
                                                }} className="w-4 cursor-pointer" />
                                            </TooltipTrigger>
                                            <TooltipContent >
                                                <p>Copy</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        {user.email}
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Copy onClick={() => {
                                                    navigator.clipboard.writeText(user.email);
                                                }} className="w-4 cursor-pointer" />
                                            </TooltipTrigger>
                                            <TooltipContent >
                                                <p>Copy</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {user.active ? <Badge variant="destructive" className="bg-green-400">Active</Badge> : <Badge variant="destructive">Inactive</Badge>}
                                </TableCell>
                                <TableCell className="text-right">
                                    <BinhDropdownMenuGeneric
                                        data={user}
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
                            <TableCell colSpan={6} className="font-medium">
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
};

export default UserPage;
