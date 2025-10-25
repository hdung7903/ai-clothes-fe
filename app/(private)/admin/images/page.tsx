"use client"
import Link from "next/link"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Upload, RefreshCw, Trash2, Check } from "lucide-react"
import * as React from "react"
import { getSampleImages, deleteSampleImage, type SampleImage } from "@/services/sampleImageService"
import { SampleImageUploadDialog } from "@/components/admin/sample-image-upload-dialog"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"

export default function SampleImagesPage() {
  const [images, setImages] = React.useState<SampleImage[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false)
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false)
  const [selectedImage, setSelectedImage] = React.useState<SampleImage | null>(null)
  const [selectedImages, setSelectedImages] = React.useState<string[]>([])
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [selectionMode, setSelectionMode] = React.useState(false)

  const loadImages = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await getSampleImages()
      if (response.success && response.data) {
        setImages(response.data)
      } else {
        toast.error("Không thể tải danh sách ảnh")
      }
    } catch (error) {
      console.error("Error loading images:", error)
      toast.error("Đã xảy ra lỗi khi tải ảnh")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadImages()
  }, [loadImages])

  const handleViewImage = (image: SampleImage) => {
    setSelectedImage(image)
    setViewDialogOpen(true)
  }

  const handleUploadSuccess = async () => {
    await loadImages()
    toast.success("Ảnh đã được tải lên thành công!")
  }

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages(prev => {
      if (prev.includes(imageId)) {
        return prev.filter(id => id !== imageId)
      } else {
        return [...prev, imageId]
      }
    })
  }

  const toggleSelectAll = () => {
    if (selectedImages.length === images.length) {
      setSelectedImages([])
    } else {
      setSelectedImages(images.map(img => img.sampleImageId))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedImages.length === 0) {
      toast.error("Vui lòng chọn ít nhất một ảnh để xóa")
      return
    }

    const confirmDelete = confirm(`Bạn có chắc chắn muốn xóa ${selectedImages.length} ảnh đã chọn?`)
    if (!confirmDelete) return

    setIsDeleting(true)
    
    try {
      const deletePromises = selectedImages.map(imageId => deleteSampleImage(imageId))
      const results = await Promise.allSettled(deletePromises)
      
      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length
      
      if (successful > 0) {
        toast.success(`Đã xóa thành công ${successful} ảnh`)
        await loadImages()
        setSelectedImages([])
        setSelectionMode(false)
      }
      
      if (failed > 0) {
        toast.error(`Không thể xóa ${failed} ảnh`)
      }
    } catch (error) {
      console.error("Error deleting images:", error)
      toast.error("Đã xảy ra lỗi khi xóa ảnh")
    } finally {
      setIsDeleting(false)
    }
  }

  const exitSelectionMode = () => {
    setSelectionMode(false)
    setSelectedImages([])
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
                  <BreadcrumbLink href="/admin/dashboard">Quản trị</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Ảnh mẫu</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-xl font-semibold">Quản lý ảnh mẫu</h1>
            <div className="flex gap-2">
              {selectionMode ? (
                <>
                  <Button variant="outline" onClick={exitSelectionMode}>
                    Hủy chọn
                  </Button>
                  {selectedImages.length > 0 && (
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteSelected}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Xóa đã chọn ({selectedImages.length})
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={loadImages} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Làm mới
                  </Button>
                  {images.length > 0 && (
                    <Button variant="outline" onClick={() => setSelectionMode(true)}>
                      <Check className="h-4 w-4 mr-2" />
                      Chọn để xóa
                    </Button>
                  )}
                  <Button onClick={() => setUploadDialogOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Tải ảnh lên
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Images Grid */}
          <div className="rounded-xl border bg-background p-6">
            {isLoading && (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Đang tải ảnh...</p>
              </div>
            )}
            
            {!isLoading && images.length === 0 && (
              <div className="text-center py-12">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Chưa có ảnh nào</h3>
                <p className="text-muted-foreground mb-4">Tải ảnh đầu tiên lên hệ thống</p>
                <Button onClick={() => setUploadDialogOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Tải ảnh lên
                </Button>
              </div>
            )}
            
            {!isLoading && images.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    Tổng cộng: {images.length} ảnh
                    {selectionMode && selectedImages.length > 0 && (
                      <span className="ml-2 text-primary">
                        • Đã chọn: {selectedImages.length}
                      </span>
                    )}
                  </p>
                  {selectionMode && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleSelectAll}
                    >
                      {selectedImages.length === images.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {images.map((image, index) => (
                    <div key={image.sampleImageId} className="relative group">
                      <div className={`aspect-square rounded-lg border overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors ${
                        selectionMode && selectedImages.includes(image.sampleImageId) ? 'ring-2 ring-primary' : ''
                      }`}>
                        <img
                          src={image.imageUrl}
                          alt={`Sample ${index + 1}`}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => selectionMode ? toggleImageSelection(image.sampleImageId) : handleViewImage(image)}
                        />
                      </div>
                      
                      {/* Selection checkbox */}
                      {selectionMode && (
                        <div className="absolute top-2 left-2 z-10">
                          <Checkbox
                            checked={selectedImages.includes(image.sampleImageId)}
                            onCheckedChange={() => toggleImageSelection(image.sampleImageId)}
                            className="bg-white border-2 border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                        </div>
                      )}
                      
                      {/* Hover overlay - only show when not in selection mode */}
                      {!selectionMode && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleViewImage(image)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Xem
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upload Dialog */}
        <SampleImageUploadDialog 
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          onSuccess={handleUploadSuccess}
        />

        {/* View Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Xem ảnh mẫu</DialogTitle>
            </DialogHeader>
            {selectedImage && (
              <div className="space-y-4">
                <div className="rounded-lg border overflow-hidden bg-gray-50">
                  <img 
                    src={selectedImage.imageUrl} 
                    className="w-full h-auto max-h-[70vh] object-contain mx-auto"
                    alt="Sample image"
                  />
                </div>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="break-all">
                      <span className="font-medium">ID:</span> {selectedImage.sampleImageId}
                    </div>
                    <div className="break-all">
                      <span className="font-medium">URL:</span> {selectedImage.imageUrl}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => navigator.clipboard.writeText(selectedImage.imageUrl)}
                    >
                      Sao chép URL
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={async () => {
                        const confirmDelete = confirm("Bạn có chắc chắn muốn xóa ảnh này?")
                        if (!confirmDelete) return
                        
                        try {
                          await deleteSampleImage(selectedImage.sampleImageId)
                          toast.success("Đã xóa ảnh thành công")
                          await loadImages()
                          setViewDialogOpen(false)
                        } catch (error) {
                          console.error("Error deleting image:", error)
                          toast.error("Không thể xóa ảnh")
                        }
                      }}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Xóa ảnh
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
