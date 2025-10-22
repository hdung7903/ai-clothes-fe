import { AdminGuard } from '@/components/admin/admin-guard'
import { SidebarProvider } from '@/components/ui/sidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminGuard>
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </AdminGuard>
  )
}
