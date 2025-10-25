"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Upload, X, Check, Loader2, ImagePlus, FileImage, AlertCircle, Camera, FolderOpen } from "lucide-react"
import { uploadSampleImage } from "@/services/sampleImageService"
import { toast } from "sonner"

interface SampleImageUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function SampleImageUploadDialog({ open, onOpenChange, onSuccess }: SampleImageUploadDialogProps) {
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)
  const [previewUrls, setPreviewUrls] = React.useState<string[]>([])
  const [uploadedCount, setUploadedCount] = React.useState(0)
  const [activeTab, setActiveTab] = React.useState("single")
  const [dragActive, setDragActive] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const multiFileInputRef = React.useRef<HTMLInputElement>(null)

  const validateFile = (file: File): boolean => {
    if (!file.type.startsWith('image/')) {
      toast.error(`File ${file.name} không phải là ảnh hợp lệ`)
      return false
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error(`File ${file.name} có kích thước quá lớn (tối đa 10MB)`)
      return false
    }
    
    return true
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(validateFile)
    
    if (validFiles.length === 0) return

    setSelectedFiles(validFiles)
    
    // Create previews
    const previews: string[] = []
    validFiles.forEach((file, index) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        previews[index] = e.target?.result as string
        if (previews.length === validFiles.length) {
          setPreviewUrls([...previews])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    const newPreviews = previewUrls.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    setPreviewUrls(newPreviews)
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Vui lòng chọn ít nhất một ảnh để tải lên')
      return
    }

    setIsUploading(true)
    setUploadedCount(0)
    setUploadProgress(0)
    
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        await uploadSampleImage(file)
        
        const newUploadedCount = i + 1
        setUploadedCount(newUploadedCount)
        setUploadProgress((newUploadedCount / selectedFiles.length) * 100)
      }
      
      toast.success(`Đã tải lên thành công ${selectedFiles.length} ảnh!`)
      onSuccess()
      handleReset()
      onOpenChange(false)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Đã xảy ra lỗi khi tải ảnh lên')
    } finally {
      setIsUploading(false)
    }
  }

  const handleReset = () => {
    setSelectedFiles([])
    setPreviewUrls([])
    setUploadProgress(0)
    setUploadedCount(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    if (multiFileInputRef.current) {
      multiFileInputRef.current.value = ""
    }
  }

  React.useEffect(() => {
    if (!open) {
      handleReset()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImagePlus className="h-5 w-5" />
            Tải ảnh mẫu lên hệ thống
          </DialogTitle>
          <DialogDescription>
            Chọn một hoặc nhiều ảnh để tải lên. Hỗ trợ: JPG, PNG, GIF (tối đa 10MB/file)
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single" className="flex items-center gap-2">
              <FileImage className="h-4 w-4" />
              Tải một ảnh
            </TabsTrigger>
            <TabsTrigger value="multiple" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Tải nhiều ảnh
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-4">
            <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
              <CardContent className="p-6">
                <div
                  className={`relative ${dragActive ? 'bg-primary/10' : ''} rounded-lg p-6 text-center transition-colors`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Kéo thả ảnh vào đây</p>
                  <p className="text-sm text-muted-foreground mb-4">hoặc</p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Chọn ảnh từ máy tính
                  </Button>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="multiple" className="space-y-4">
            <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
              <CardContent className="p-6">
                <div
                  className={`relative ${dragActive ? 'bg-primary/10' : ''} rounded-lg p-6 text-center transition-colors`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Kéo thả nhiều ảnh vào đây</p>
                  <p className="text-sm text-muted-foreground mb-4">hoặc</p>
                  <Button
                    variant="outline"
                    onClick={() => multiFileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Chọn nhiều ảnh từ máy tính
                  </Button>
                  <Input
                    ref={multiFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* File Preview Section */}
        {selectedFiles.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-sm font-medium">
                  Ảnh đã chọn ({selectedFiles.length})
                </Label>
                <Button variant="ghost" size="sm" onClick={handleReset} disabled={isUploading}>
                  <X className="h-4 w-4 mr-2" />
                  Xóa tất cả
                </Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-64 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square border rounded-lg overflow-hidden bg-gray-50">
                      {previewUrls[index] ? (
                        <img
                          src={previewUrls[index]}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0"
                      onClick={() => removeFile(index)}
                      disabled={isUploading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    
                    <div className="mt-1 text-xs text-muted-foreground truncate">
                      <p className="font-medium truncate">{file.name}</p>
                      <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* File Summary */}
              <Separator className="my-4" />
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <Badge variant="secondary">
                    {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
                  </Badge>
                  <span className="text-muted-foreground">
                    Tổng: {(selectedFiles.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                
                {selectedFiles.some(file => !validateFile(file)) && (
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>Một số file không hợp lệ</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Đang tải lên...</span>
                  <span className="text-muted-foreground">
                    {uploadedCount}/{selectedFiles.length}
                  </span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-xs text-muted-foreground">
                  Đã tải lên {uploadedCount} / {selectedFiles.length} ảnh
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
            Hủy
          </Button>
          <Button onClick={handleUpload} disabled={selectedFiles.length === 0 || isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tải lên ({uploadedCount}/{selectedFiles.length})
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Tải lên {selectedFiles.length > 0 ? `${selectedFiles.length} ảnh` : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
