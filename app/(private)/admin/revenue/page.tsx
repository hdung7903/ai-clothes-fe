"use client"

import { getRevenueStatistics } from '@/services/adminServices';
import type { OrderType } from '@/types/admin';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/redux/hooks';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { DollarSign, ShoppingCart, Package } from 'lucide-react';

function getDefaultMonthYear(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

function yearsRange(center: number, span = 5): number[] {
  const out: number[] = [];
  for (let y = center - span; y <= center + span; y++) out.push(y);
  return out;
}

export default function Page() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAppSelector((s) => s.auth);
  const { month: defM, year: defY } = getDefaultMonthYear();
  const [month, setMonth] = useState<number>(defM);
  const [year, setYear] = useState<number>(defY);
  const [orderType, setOrderType] = useState<OrderType>('ALL');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totals, setTotals] = useState<{ totalRevenue: number; totalOrder: number; totalQuantity: number }>({ totalRevenue: 0, totalOrder: 0, totalQuantity: 0 });

  // Auth guard similar to dashboard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?next=/admin/revenue');
      return;
    }
    if (!authLoading && user && !user.roles?.includes('Administrator')) {
      router.push('/unauthorized');
      return;
    }
  }, [isAuthenticated, user, authLoading, router]);

  // Fetch revenue on client so it appears in browser network and carries localStorage token
  useEffect(() => {
    const fetchRevenue = async () => {
      if (!isAuthenticated || !user?.roles?.includes('Administrator')) return;
      try {
        setLoading(true);
        setError(null);
        const res = await getRevenueStatistics({ month, year, orderType });
        if (res.success && res.data) {
          setTotals({
            totalRevenue: res.data.totalRevenue,
            totalOrder: res.data.totalOrder,
            totalQuantity: res.data.totalQuantity,
          });
        } else {
          const ve = res.validationErrors?.OrderType?.[0] || res.errors?.response?.[0];
          setError(ve || 'Không thể tải dữ liệu doanh thu');
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Có lỗi xảy ra khi tải dữ liệu';
        setError(msg);
        console.error('Error fetching revenue:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchRevenue();
  }, [isAuthenticated, user, month, year, orderType]);

  const { year: currentYear } = getDefaultMonthYear();

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin/dashboard">Bảng điều khiển</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Doanh thu</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Filter card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bộ lọc doanh thu</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget as HTMLFormElement);
                  const m = Number(fd.get('month'));
                  const y = Number(fd.get('year'));
                  const ot = String(fd.get('orderType') ?? 'ALL') as OrderType;
                  setMonth(m);
                  setYear(y);
                  setOrderType(ot);
                }}
              >
                <div className="flex flex-col gap-1">
                  <label htmlFor="month" className="text-sm font-medium">Tháng</label>
                  <select id="month" name="month" value={String(month)} onChange={(e) => setMonth(Number(e.target.value))} className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {Array.from({ length: 12 }).map((_, idx) => {
                      const m = idx + 1;
                      return (
                        <option key={m} value={m}>{m}</option>
                      );
                    })}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="year" className="text-sm font-medium">Năm</label>
                  <select id="year" name="year" value={String(year)} onChange={(e) => setYear(Number(e.target.value))} className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {yearsRange(currentYear, 5).map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="orderType" className="text-sm font-medium">Loại đơn hàng</label>
                  <select id="orderType" name="orderType" value={orderType} onChange={(e) => setOrderType(e.target.value as OrderType)} className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="ALL">Tất cả</option>
                    <option value="ONLINE">Online</option>
                    <option value="COD">COD</option>
                  </select>
                </div>
                <div>
                  <button type="submit" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:opacity-90">
                    Lọc
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Spinner className="h-12 w-12" />
            </div>
          ) : error ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totals.totalRevenue.toLocaleString('vi-VN')} ₫</div>
                  <p className="text-xs text-muted-foreground">Tháng {month}/{year} • {orderType}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tổng đơn hàng đã bán được</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totals.totalOrder.toLocaleString('vi-VN')}</div>
                  <p className="text-xs text-muted-foreground">Tháng {month}/{year} • {orderType}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Số lượng sản phẩm đã bán được</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totals.totalQuantity.toLocaleString('vi-VN')}</div>
                  <p className="text-xs text-muted-foreground">Tháng {month}/{year} • {orderType}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}


