"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, Package, Tags, ShoppingCart, Users, TicketPercent, Settings, Image as ImageIcon } from "lucide-react";

import { NavAdmin } from "@/components/admin/nav-admin";
import { NavUser } from "@/components/admin/nav-user";
import { useAppSelector } from "@/redux/hooks";
// TeamSwitcher removed from header; re-add if needed
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem, 
  SidebarRail,
} from "@/components/ui/sidebar";

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAppSelector((s) => s.auth);
  const data = {
    user: {
      name: "Quản trị viên TEECRAFT",
      email: user?.fullName || user?.email || "",
			avatar: "",
    },

    navMain: [
      {
        title: "Bảng điều khiển",
        url: "/admin/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Quản lý người dùng",
        url: "/admin/users",
        icon: Users,
        items: [
          { title: "Tất cả người dùng", url: "/admin/users" },
        ],
      },
      {
        title: "Quản lý sản phẩm",
        url: "/admin/products",
        icon: Package,
        items: [
          { title: "Tất cả sản phẩm", url: "/admin/products" },
          { title: "Thêm sản phẩm", url: "/admin/products/new" },
        ],
      },
      {
        title: "Quản lý danh mục",
        url: "/admin/categories",
        icon: Tags,
        items: [
          { title: "Tất cả danh mục", url: "/admin/categories" },
          { title: "Thêm danh mục", url: "/admin/categories/new" },
        ],
      },
      {
        title: "Quản lý voucher",
        url: "/admin/vouchers",
        icon: TicketPercent,
        items: [
          { title: "Tất cả voucher", url: "/admin/vouchers" },
          { title: "Thêm voucher", url: "/admin/vouchers/new" },
        ],
      },
      {
        title: "Quản lý đơn hàng",
        url: "/admin/orders",
        icon: ShoppingCart,
        items: [
          { title: "Tất cả đơn hàng", url: "/admin/orders" },
        ],
      },
      {
        title: "Quản lý ảnh",
        url: "/admin/images",
        icon: ImageIcon,
      },
      {
        title: "Quản lý thanh toán",
        url: "/admin/payments",
        icon: ShoppingCart,
      },
      {
        title: "Cài đặt API",
        url: "/admin/api-settings",
        icon: Settings,
      },
    ],
  };
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/admin/dashboard">
                <Image src="/branch.png" alt="logo" width={32} height={32} />
                <span className="text-base font-semibold">TEECRAFT</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavAdmin items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
