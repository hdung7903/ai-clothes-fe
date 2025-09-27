"use client"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/sidebar"
import { usePathname } from "next/navigation";
import CurrentPath from "./utility/path/current-path";
export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AdminSidebar />
            <main className="flex flex-col w-full min-h-screen">
                {/* SidebarTrigger nằm bên trái */}

                <div className="w-full flex items-center gap-x-2 py-2 mb-5 rounded-none border-b-4 text-start">
                    <SidebarTrigger />
                    <p className="text-sm font-medium">

                    </p>
                    <CurrentPath />
                </div>


                {/* Children sẽ tự dãn ra và có padding để căn giữa nội dung */}
                <div className="flex-1 flex justify-center items-start p-4">
                    <div className="w-full max-w-6xl">
                        {children}
                    </div>
                </div>
            </main>
        </SidebarProvider>
    )
}
