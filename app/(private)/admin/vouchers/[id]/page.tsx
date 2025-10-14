"use client"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import * as React from "react"
import { useRouter } from "next/navigation"
import { getVoucherById } from "@/services/voucherService"
import type { Voucher } from "@/types/voucher"
import { formatCurrency } from "../../../../../utils/format"

interface VoucherViewPageProps {
  params: {
    id: string;
  };
}

export default function VoucherViewPage({ params }: VoucherViewPageProps) {
  const router = useRouter()
  const [voucher, setVoucher] = React.useState<Voucher | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const loadVoucher = async () => {
      try {
        setIsLoading(true)
        const response = await getVoucherById(params.id)
        if (response.success && response.data) {
          setVoucher(response.data)
        } else {
          setError(response.message || 'Failed to load voucher')
        }
      } catch (err) {
        setError('Failed to load voucher')
      } finally {
        setIsLoading(false)
      }
    }
    loadVoucher()
  }, [params.id])

  const formatDiscountValue = (voucher: Voucher) => {
    if (voucher.discountType === 'PERCENTAGE') {
      return `${voucher.discountValue}%`
    }
    return formatCurrency(voucher.discountValue, 'VND', 'vi-VN')
  }

  const formatUsage = (voucher: Voucher) => {
    if (voucher.usageLimit) {
      return `${voucher.usedCount}/${voucher.usageLimit}`
    }
    return `${voucher.usedCount}`
  }

  const isExpired = (validTo: string) => {
    return new Date(validTo) < new Date()
  }

  const isActive = (voucher: Voucher) => {
    const now = new Date()
    const validFrom = new Date(voucher.validFrom)
    const validTo = new Date(voucher.validTo)
    return voucher.isActive && now >= validFrom && now <= validTo
  }

  if (isLoading) {
    return (
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-64">
            <div>Loading voucher...</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (error || !voucher) {
    return (
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-64">
            <Alert variant="destructive" className="max-w-md">
              <AlertDescription>{error || 'Voucher not found'}</AlertDescription>
            </Alert>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

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
                  <BreadcrumbLink href="/admin/dashboard">Admin</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin/vouchers">Vouchers</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{voucher.code}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">{voucher.name}</h1>
              <p className="text-muted-foreground font-mono">{voucher.code}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.back()}>
                Back
              </Button>
              <Button asChild>
                <a href={`/admin/vouchers/${voucher.voucherId}/edit`}>Edit</a>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={isActive(voucher) ? "default" : "secondary"}>
                  {isActive(voucher) ? "Active" : isExpired(voucher.validTo) ? "Expired" : "Inactive"}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Discount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatDiscountValue(voucher)}</div>
                <p className="text-sm text-muted-foreground">
                  {voucher.discountType === 'PERCENTAGE' ? 'Percentage discount' : 'Fixed amount discount'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatUsage(voucher)}</div>
                <p className="text-sm text-muted-foreground">
                  {voucher.usageLimit ? 'Limited usage' : 'Unlimited usage'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Voucher Details</CardTitle>
                <CardDescription>Basic information about this voucher</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="text-sm">{voucher.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Code</label>
                  <p className="text-sm font-mono">{voucher.code}</p>
                </div>
                {voucher.description && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="text-sm">{voucher.description}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Discount Type</label>
                  <p className="text-sm">
                    {voucher.discountType === 'PERCENTAGE' ? 'Percentage' : 'Fixed Amount'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Discount Value</label>
                  <p className="text-sm">{formatDiscountValue(voucher)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage & Limits</CardTitle>
                <CardDescription>Usage statistics and limitations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Usage Count</label>
                  <p className="text-sm">{voucher.usedCount}</p>
                </div>
                {voucher.usageLimit && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Usage Limit</label>
                    <p className="text-sm">{voucher.usageLimit}</p>
                  </div>
                )}
                {voucher.minOrderAmount && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Minimum Order Amount</label>
                    <p className="text-sm">{formatCurrency(voucher.minOrderAmount, 'VND', 'vi-VN')}</p>
                  </div>
                )}
                {voucher.maxDiscountAmount && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Maximum Discount Amount</label>
                    <p className="text-sm">{formatCurrency(voucher.maxDiscountAmount, 'VND', 'vi-VN')}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Active Status</label>
                  <p className="text-sm">{voucher.isActive ? 'Yes' : 'No'}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Validity Period</CardTitle>
              <CardDescription>When this voucher is valid</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Valid From</label>
                  <p className="text-sm">{new Date(voucher.validFrom).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Valid To</label>
                  <p className="text-sm">{new Date(voucher.validTo).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {voucher.createdBy && (
            <Card>
              <CardHeader>
                <CardTitle>Created By</CardTitle>
                <CardDescription>Information about who created this voucher</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-sm">{voucher.createdBy.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-sm">{voucher.createdBy.email}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-sm font-medium text-muted-foreground">Created At</label>
                  <p className="text-sm">{new Date(voucher.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
