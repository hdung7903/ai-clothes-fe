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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import * as React from "react"
import { getProductDesignById } from "@/services/productDesignServices"
import type { ProductDesignDetail } from "@/types/productDesign"
import { useAppSelector } from "@/redux/hooks"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Calendar, 
  Package, 
  Palette,
  Image as ImageIcon,
  ArrowLeft,
  Download
} from "lucide-react"
import { jsPDF } from "jspdf"
import { toast } from "sonner"

interface PageProps {
  params: Promise<{
    id: string
    designId: string
  }>
}

export default function AdminDesignDetailPage({ params }: PageProps) {
  const router = useRouter()
  const { isAuthenticated, user, tokens, isLoading } = useAppSelector((state) => state.auth)
  
  const [design, setDesign] = React.useState<ProductDesignDetail | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Unwrap params using React.use()
  const { id: orderId, designId } = React.use(params)

  // Check authentication and redirect if needed
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?next=/admin/orders')
      return
    }
    
    if (!isLoading && user && !user.roles?.includes('Administrator')) {
      router.push('/unauthorized')
      return
    }
  }, [isAuthenticated, user, isLoading, router])

  // Fetch design details
  React.useEffect(() => {
    const fetchDesign = async () => {
      if (!isAuthenticated || !tokens?.accessToken) return
      
      try {
        setLoading(true)
        setError(null)
        
        const response = await getProductDesignById(designId)
        
        if (response.success && response.data) {
          setDesign(response.data)
        } else {
          setError('Không thể tải thông tin thiết kế')
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && tokens?.accessToken) {
      fetchDesign()
    }
  }, [designId, isAuthenticated, tokens])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Function to remove Vietnamese diacritics and special characters
  const removeVietnameseTones = (str: string): string => {
    str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    str = str.replace(/đ/g, 'd').replace(/Đ/g, 'D')
    str = str.replace(/[^a-zA-Z0-9\s]/g, '')
    str = str.replace(/\s+/g, '_')
    return str
  }

  // Function to load image as base64
  const loadImageAsBase64 = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      console.error('Error loading image:', error)
      return ''
    }
  }

  // Function to export design as PDF
  const exportDesignToPDF = async () => {
    if (!design) return

    try {
      toast.info('Đang tạo file PDF...')
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 20
      const contentWidth = pageWidth - (margin * 2)
      
      // Page 1: Design Information
      pdf.setFontSize(24)
      pdf.setFont('helvetica', 'bold')
      pdf.text('DESIGN INFORMATION', pageWidth / 2, 30, { align: 'center' })
      
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')
      
      let yPos = 50
      
      // Design Name
      pdf.setFont('helvetica', 'bold')
      pdf.text('Design Name:', margin, yPos)
      pdf.setFont('helvetica', 'normal')
      // Remove Vietnamese tones for PDF text
      pdf.text(removeVietnameseTones(design.name), margin + 40, yPos)
      yPos += 10
      
      // Product Name
      pdf.setFont('helvetica', 'bold')
      pdf.text('Product:', margin, yPos)
      pdf.setFont('helvetica', 'normal')
      pdf.text(removeVietnameseTones(design.product.name), margin + 40, yPos)
      yPos += 10
      
      // Product Variant
      pdf.setFont('helvetica', 'bold')
      pdf.text('Variant:', margin, yPos)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`${removeVietnameseTones(design.productOptionValueDetail.optionName)}: ${removeVietnameseTones(design.productOptionValueDetail.value)}`, margin + 40, yPos)
      yPos += 10
      
      // Quantity (assuming quantity = 1 for design preview)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Quantity:', margin, yPos)
      pdf.setFont('helvetica', 'normal')
      pdf.text('1', margin + 40, yPos)
      yPos += 15
      
      // Separator line
      pdf.setDrawColor(200)
      pdf.line(margin, yPos, pageWidth - margin, yPos)
      yPos += 15
      
      // Design Details
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Design Details:', margin, yPos)
      yPos += 10
      
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Created: ${formatDate(design.createdAt)}`, margin, yPos)
      yPos += 7
      pdf.text(`Last Modified: ${formatDate(design.lastModifiedAt)}`, margin, yPos)
      yPos += 7
      pdf.text(`Print Areas: ${design.templates.length}`, margin, yPos)
      yPos += 7
      pdf.text(`Icons Used: ${design.icons.length}`, margin, yPos)
      yPos += 15
      
      // Add product image if available
      if (design.product.imageUrl) {
        try {
          const imgData = await loadImageAsBase64(design.product.imageUrl)
          if (imgData) {
            const imgWidth = 60
            const imgHeight = 60
            pdf.addImage(imgData, 'JPEG', margin, yPos, imgWidth, imgHeight)
            yPos += imgHeight + 10
          }
        } catch (error) {
          console.error('Error adding product image:', error)
        }
      }

      // Pages 2+: Design Templates (one per area)
      for (let i = 0; i < design.templates.length; i++) {
        const template = design.templates[i]
        
        // Add new page for each template
        pdf.addPage()
        yPos = 30
        
        // Template header
        pdf.setFontSize(18)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`Print Area: ${removeVietnameseTones(template.printAreaName)}`, pageWidth / 2, yPos, { align: 'center' })
        yPos += 15
        
        // Template info
        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`Template ID: ${template.templateId}`, margin, yPos)
        yPos += 15
        
        // Separator
        pdf.setDrawColor(200)
        pdf.line(margin, yPos, pageWidth - margin, yPos)
        yPos += 15
        
        // Design image for this area
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Design:', margin, yPos)
        yPos += 10
        
        try {
          const designImgData = await loadImageAsBase64(template.designImageUrl)
          if (designImgData) {
            // Calculate image dimensions to fit page
            const maxImgWidth = contentWidth
            const maxImgHeight = 120
            
            pdf.addImage(designImgData, 'PNG', margin, yPos, maxImgWidth, maxImgHeight)
            yPos += maxImgHeight + 15
          }
        } catch (error) {
          console.error('Error adding template design image:', error)
          pdf.setFont('helvetica', 'italic')
          pdf.text('Unable to load design image', margin, yPos)
          yPos += 10
        }
      }
      
      // Add icons section - one icon per page (after all templates)
      if (design.icons.length > 0) {
        for (let j = 0; j < design.icons.length; j++) {
          const icon = design.icons[j]
          
          // Add new page for each icon
          pdf.addPage()
          yPos = 30
          
          // Icon header
          pdf.setFontSize(18)
          pdf.setFont('helvetica', 'bold')
          pdf.text(`Icon ${j + 1} of ${design.icons.length}`, pageWidth / 2, yPos, { align: 'center' })
          yPos += 10
          
          pdf.setFontSize(11)
          pdf.setFont('helvetica', 'normal')
          pdf.text(`Icon ID: ${icon.id}`, pageWidth / 2, yPos, { align: 'center' })
          yPos += 15
          
          // Separator
          pdf.setDrawColor(200)
          pdf.line(margin, yPos, pageWidth - margin, yPos)
          yPos += 20
          
          // Display large icon centered on page
          try {
            const iconImgData = await loadImageAsBase64(icon.imageUrl)
            if (iconImgData) {
              // Create temp image to get dimensions
              const tempImg = new Image()
              tempImg.src = iconImgData
              
              await new Promise((resolve) => {
                tempImg.onload = resolve
              })
              
              const imgWidth = tempImg.width
              const imgHeight = tempImg.height
              const aspectRatio = imgWidth / imgHeight
              
              // Calculate max size to fit page (leave margins)
              const maxWidth = contentWidth
              const maxHeight = pageHeight - yPos - margin - 20 // Leave space for header and bottom margin
              
              let finalWidth = maxWidth
              let finalHeight = finalWidth / aspectRatio
              
              // If height is too large, scale based on height instead
              if (finalHeight > maxHeight) {
                finalHeight = maxHeight
                finalWidth = finalHeight * aspectRatio
              }
              
              // Center the image horizontally
              const xPos = (pageWidth - finalWidth) / 2
              
              // Add image with proper aspect ratio (no cropping)
              pdf.addImage(iconImgData, 'PNG', xPos, yPos, finalWidth, finalHeight)
              
              // Add caption below image
              const captionYPos = yPos + finalHeight + 10
              pdf.setFontSize(10)
              pdf.setFont('helvetica', 'italic')
              pdf.text(`Original size: ${imgWidth}x${imgHeight}px`, pageWidth / 2, captionYPos, { align: 'center' })
            }
          } catch (error) {
            console.error('Error adding icon image:', error)
            pdf.setFont('helvetica', 'italic')
            pdf.text('Unable to load icon image', pageWidth / 2, yPos + 50, { align: 'center' })
          }
        }
      }
      
      // Save PDF with Vietnamese-safe filename
      const sanitizedName = removeVietnameseTones(design.name)
      const fileName = `Design_${sanitizedName}_${new Date().getTime()}.pdf`
      pdf.save(fileName)
      
      toast.success('Đã tải xuống file PDF thành công!')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Có lỗi xảy ra khi tạo file PDF')
    }
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-64">
            <Spinner className="h-12 w-12" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (error || !design) {
    return (
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Palette className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-xl font-semibold mb-2">
                {error || "Không tìm thấy thiết kế"}
              </p>
              <p className="text-muted-foreground mb-6">
                Thiết kế này có thể đã bị xóa hoặc bạn không có quyền truy cập.
              </p>
              <Button onClick={() => router.push(`/admin/orders/${orderId}`)} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại đơn hàng
              </Button>
            </div>
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
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin/dashboard">Quản trị</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin/orders">Đơn hàng</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href={`/admin/orders/${orderId}`}>Chi tiết đơn hàng</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Thiết kế sản phẩm</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">{design.name}</h1>
              <p className="text-muted-foreground">
                Thiết kế cho sản phẩm: {design.product.name}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="default" onClick={exportDesignToPDF}>
                <Download className="mr-2 h-4 w-4" />
                Tải xuống PDF
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/admin/orders/${orderId}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quay lại đơn hàng
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    Thông tin sản phẩm
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <img
                      src={design.product.imageUrl || "/placeholder.svg"}
                      alt={design.product.name}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {design.product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {design.product.description}
                      </p>
                      <Badge variant="secondary">
                        {design.productOptionValueDetail.optionName}: {design.productOptionValueDetail.value}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Design Templates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Palette className="mr-2 h-5 w-5" />
                    Thiết kế ({design.templates.length} vùng in)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {design.templates.length === 0 ? (
                    <p className="text-muted-foreground text-center py-6">
                      Chưa có thiết kế nào được áp dụng
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {design.templates.map((template) => (
                        <div key={template.templateId} className="relative group">
                          <div className="border rounded-lg overflow-hidden bg-gray-50">
                            <img
                              src={template.designImageUrl}
                              alt={template.printAreaName}
                              className="w-full h-64 object-contain"
                            />
                          </div>
                          <div className="mt-2">
                            <p className="font-medium">{template.printAreaName}</p>
                            <p className="text-sm text-muted-foreground">
                              Template ID: {template.templateId}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Icons Used */}
              {design.icons.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ImageIcon className="mr-2 h-5 w-5" />
                      Biểu tượng đã sử dụng ({design.icons.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                      {design.icons.map((icon, index) => (
                        <div key={icon.id} className="relative group">
                          <div className="border rounded-lg p-2 bg-white hover:shadow-md transition-shadow">
                            <img
                              src={icon.imageUrl}
                              alt={`Icon ${index + 1}`}
                              className="w-full h-16 object-contain"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Design Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin thiết kế</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center text-sm text-muted-foreground mb-1">
                      <Calendar className="mr-2 h-4 w-4" />
                      Ngày tạo
                    </div>
                    <p className="text-sm font-medium">
                      {formatDate(design.createdAt)}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <div className="flex items-center text-sm text-muted-foreground mb-1">
                      <Calendar className="mr-2 h-4 w-4" />
                      Chỉnh sửa lần cuối
                    </div>
                    <p className="text-sm font-medium">
                      {formatDate(design.lastModifiedAt)}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Design ID</p>
                    <p className="text-xs font-mono break-all">{design.id}</p>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Product ID</p>
                    <p className="text-xs font-mono break-all">{design.productId}</p>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Vùng in
                    </p>
                    <p className="text-sm font-medium">
                      {design.templates.length} vùng
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Biểu tượng
                    </p>
                    <p className="text-sm font-medium">
                      {design.icons.length} biểu tượng
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Hành động nhanh</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full" onClick={exportDesignToPDF}>
                    <Download className="mr-2 h-4 w-4" />
                    Tải xuống PDF
                  </Button>
                  
                  <Button className="w-full" variant="outline" asChild>
                    <Link href={`/admin/orders/${orderId}`}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Quay lại đơn hàng
                    </Link>
                  </Button>
                  
                  <Button className="w-full" variant="outline" asChild>
                    <Link href={`/products/${design.productId}`}>
                      <Package className="mr-2 h-4 w-4" />
                      Xem sản phẩm
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
