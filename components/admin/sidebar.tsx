import * as React from "react";
import Link from "next/link";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
    SidebarSeparator,
} from "@/components/ui/sidebar"; // cập nhật path theo dự án bạn
import { HomeIcon, PackageIcon, UserIcon, Shirt } from "lucide-react";
import { Input } from "../ui/input";
import { NavUser } from "./nav-user";
import { Settings, LogOut, User } from "lucide-react"

const data = {
    name: "Admin",
    email: "Admin@gmail.com",
    avatar: "/young-woman-fashion-enthusiast.png"
}

const sidebarItems = [
    { name: "Dashboard", url: "/admin", icon: HomeIcon },
    { name: "Products", url: "/admin/products", icon: Shirt },
    { name: "Users", url: "/admin/users", icon: UserIcon },
];
const sidebarItems2 = [
    { name: "Temp1", url: "/admin", icon: HomeIcon },
];



export function AdminSidebar() {
    return (
        // collapsible="icon" => khi thu gọn chỉ còn icon
        <Sidebar
            collapsible="icon"
            variant="sidebar"
            className="fixed left-0 top-0 h-screen w-64 overflow-x-hidden overflow-y-auto border-r"
        >
            <SidebarHeader className="bg-gray-100  py-5 shadow-lg shadow-gray-300  border-l-2 border-gray-50">
                <div className="flex items-center space-x-2">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-sm">AI</span>
                        </div>
                        <span className="text-xl font-bold text-foreground">FashionAI</span>
                    </Link>
                </div>
            </SidebarHeader>
            <SidebarContent >
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="mt-2">
                            {sidebarItems.map((item) => (
                                <SidebarMenuItem key={item.name}>
                                    <Link href={item.url} className="contents">
                                        <SidebarMenuButton className="w-full truncate">
                                            <item.icon className="size-4" />
                                            <span className="group-data-[collapsible=icon]:hidden">{item.name}</span>
                                        </SidebarMenuButton>

                                    </Link>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator className="max-w-[91%]" />
                {/* ... có thể thêm group khác */}
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="mt-2">
                            {sidebarItems2.map((item) => (
                                <SidebarMenuItem key={item.name}>
                                    <Link href={item.url} className="contents">
                                        <SidebarMenuButton

                                        >
                                            <item.icon className="size-4" />
                                            {/* Ẩn label khi ở trạng thái icon */}
                                            <span className="group-data-[collapsible=icon]:hidden">
                                                {item.name}
                                            </span>
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter >
                <NavUser user={data} />
            </SidebarFooter>
        </Sidebar>
    );
}
