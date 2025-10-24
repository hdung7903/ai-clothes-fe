"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X, Check } from "lucide-react"
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { uploadImage } from "@/services/storageService"
import { createSuggestionImage } from "@/services/suggestionImageService"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ImageUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

type CropAspect = "square" | "rectangle" | "free"

export function ImageUploadDialog({ open, onOpenChange, onSuccess }: ImageUploadDialogProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string>("")
  const [crop, setCrop] = React.useState<Crop>()
  const [completedCrop, setCompletedCrop] = React.useState<PixelCrop>()
  const [cropAspect, setCropAspect] = React.useState<CropAspect>("square")
  const [isUploading, setIsUploading] = React.useState(false)
  const [isCropping, setIsCropping] = React.useState(false)
  const [croppedImageUrl, setCroppedImageUrl] = React.useState<string>("")
  
  const imgRef = React.useRef<HTMLImageElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setCroppedImageUrl("")
      setIsCropping(true)
      
      // Set default crop based on aspect
      const aspect = getAspectRatio()
      setCrop({
        unit: "%",
        width: 50,
        height: aspect === 1 ? 50 : 25,
        x: 25,
        y: aspect === 1 ? 25 : 37.5,
      })
    }
  }

  const getAspectRatio = () => {
    if (cropAspect === "square") return 1
    if (cropAspect === "rectangle") return 16 / 9
    return undefined
  }

  const handleCropComplete = async () => {
    if (!completedCrop || !imgRef.current || !selectedFile) return

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const image = imgRef.current
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    canvas.width = completedCrop.width * scaleX
    canvas.height = completedCrop.height * scaleY

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    )

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        setCroppedImageUrl(url)
        
        // Create new file from blob
        const croppedFile = new File([blob], selectedFile.name, {
          type: selectedFile.type,
        })
        setSelectedFile(croppedFile)
        setIsCropping(false)
      }
    }, selectedFile.type)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return

    setIsUploading(true)
    try {
      // Upload image first
      const uploadRes = await uploadImage(selectedFile)
      
      if (!uploadRes.success || !uploadRes.data) {
        throw new Error("Upload failed")
      }

      // Create suggestion image with the uploaded URL
      const createRes = await createSuggestionImage({
        imageUrl: uploadRes.data,
      })

      if (!createRes.success) {
        throw new Error("Failed to create suggestion image")
      }
      
      // Reset form and notify success
      handleReset()
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Lỗi khi tải ảnh lên")
    } finally {
      setIsUploading(false)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setPreviewUrl("")
    setCroppedImageUrl("")
    setIsCropping(false)
    setCrop(undefined)
    setCompletedCrop(undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleOpenChangeWrapper = (open: boolean) => {
    if (!open) {
      handleReset()
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChangeWrapper}>
      <DialogContent className="max-w-[90vw] w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tải ảnh lên</DialogTitle>
          <DialogDescription>
            Chọn ảnh, crop và điền thông tin để tải lên hệ thống
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file-upload">Chọn ảnh</Label>
              <div className="flex items-center gap-2">
                <Input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                {selectedFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Image Preview and Crop */}
            {selectedFile && (
              <div className="space-y-4">
                <Tabs defaultValue="crop" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="crop">Crop ảnh</TabsTrigger>
                    <TabsTrigger value="preview" disabled={!croppedImageUrl}>
                      Xem trước
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="crop" className="space-y-4">
                    {/* Crop Aspect Selector */}
                    <div className="flex items-center gap-4 flex-wrap">
                      <Label className="shrink-0">Tỷ lệ crop:</Label>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          type="button"
                          variant={cropAspect === "square" ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setCropAspect("square")
                            setCrop({
                              unit: "%",
                              width: 50,
                              height: 50,
                              x: 25,
                              y: 25,
                            })
                          }}
                        >
                          Vuông (1:1)
                        </Button>
                        <Button
                          type="button"
                          variant={cropAspect === "rectangle" ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setCropAspect("rectangle")
                            setCrop({
                              unit: "%",
                              width: 50,
                              height: 28.125,
                              x: 25,
                              y: 35.9375,
                            })
                          }}
                        >
                          Chữ nhật (16:9)
                        </Button>
                        <Button
                          type="button"
                          variant={cropAspect === "free" ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setCropAspect("free")
                            setCrop({
                              unit: "%",
                              width: 50,
                              height: 50,
                              x: 25,
                              y: 25,
                            })
                          }}
                        >
                          Tự do
                        </Button>
                      </div>
                      {isCropping && (
                        <Button
                          type="button"
                          onClick={handleCropComplete}
                          variant="secondary"
                          size="sm"
                          className="ml-auto"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Áp dụng crop
                        </Button>
                      )}
                    </div>

                    {/* Crop Tool */}
                    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900 flex items-center justify-center min-h-[500px] w-full overflow-auto">
                      <ReactCrop
                        crop={crop}
                        onChange={(c) => setCrop(c)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={getAspectRatio()}
                        className="max-w-full"
                      >
                        <img
                          ref={imgRef}
                          src={previewUrl}
                          alt="Preview"
                          style={{ maxHeight: "500px", maxWidth: "100%", display: "block" }}
                        />
                      </ReactCrop>
                    </div>
                  </TabsContent>

                  <TabsContent value="preview">
                    {croppedImageUrl && (
                      <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900 flex items-center justify-center min-h-[500px]">
                        <img
                          src={croppedImageUrl}
                          alt="Cropped preview"
                          className="max-h-[500px] max-w-full rounded"
                        />
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}

          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChangeWrapper(false)}
              disabled={isUploading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={!selectedFile || isUploading || isCropping}>
              {isUploading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Đang tải lên...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Tải lên
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}