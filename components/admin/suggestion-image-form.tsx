"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2, Upload } from "lucide-react"
import { createSuggestionImage, updateSuggestionImage, getSuggestionImageById } from "@/services/suggestionImageService"
import { uploadImage } from "@/services/storageService"
import type { SuggestionImage } from "@/types/suggestionImage"

const formSchema = z.object({
  name: z.string().min(1, "Tên ảnh là bắt buộc"),
  imageUrl: z.string().url("URL ảnh không hợp lệ").min(1, "URL ảnh là bắt buộc"),
  description: z.string().optional(),
  category: z.string().optional(),
  isActive: z.boolean().default(true),
  displayOrder: z.coerce.number().int().min(0, "Thứ tự hiển thị phải >= 0").default(0),
})

type FormValues = z.infer<typeof formSchema>

interface SuggestionImageFormProps {
  mode: "create" | "edit"
  imageId?: string
}

export function SuggestionImageForm({ mode, imageId }: SuggestionImageFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [successMessage, setSuccessMessage] = React.useState("")
  const [errorMessage, setErrorMessage] = React.useState("")
  const [imagePreview, setImagePreview] = React.useState<string>("")
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
      description: "",
      category: "",
      isActive: true,
      displayOrder: 0,
    },
  })

  // Load existing data for edit mode
  React.useEffect(() => {
    if (mode === "edit" && imageId) {
      const loadData = async () => {
        setIsLoading(true)
        try {
          const res = await getSuggestionImageById(imageId)
          if (res.success && res.data) {
            const data = res.data
            form.reset({
              name: data.name,
              imageUrl: data.imageUrl,
              description: data.description || "",
              category: data.category || "",
              isActive: data.isActive,
              displayOrder: data.displayOrder,
            })
            setImagePreview(data.imageUrl)
          } else {
            setErrorMessage("Không thể tải dữ liệu ảnh")
          }
        } catch (error) {
          setErrorMessage("Đã xảy ra lỗi khi tải dữ liệu")
        } finally {
          setIsLoading(false)
        }
      }
      loadData()
    }
  }, [mode, imageId, form])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Vui lòng chọn file ảnh hợp lệ')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Kích thước file không được vượt quá 10MB')
      return
    }

    setIsUploading(true)
    setErrorMessage("")

    try {
      const res = await uploadImage(file)
      if (res.success && res.data) {
        form.setValue('imageUrl', res.data)
        setImagePreview(res.data)
        setSuccessMessage("Upload ảnh thành công!")
        setTimeout(() => setSuccessMessage(""), 3000)
      } else {
        setErrorMessage("Upload ảnh thất bại")
      }
    } catch (error) {
      setErrorMessage("Đã xảy ra lỗi khi upload ảnh")
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)
    setErrorMessage("")
    setSuccessMessage("")

    try {
      if (mode === "create") {
        const res = await createSuggestionImage(values)
        if (res.success) {
          setSuccessMessage("Tạo ảnh đề xuất thành công!")
          setTimeout(() => {
            router.push("/admin/images")
          }, 1500)
        } else {
          setErrorMessage(res.errors ? Object.values(res.errors).flat().join(", ") : "Tạo ảnh đề xuất thất bại")
        }
      } else if (mode === "edit" && imageId) {
        const res = await updateSuggestionImage({ ...values, id: imageId })
        if (res.success) {
          setSuccessMessage("Cập nhật ảnh đề xuất thành công!")
          setTimeout(() => {
            router.push("/admin/images")
          }, 1500)
        } else {
          setErrorMessage(res.errors ? Object.values(res.errors).flat().join(", ") : "Cập nhật ảnh đề xuất thất bại")
        }
      }
    } catch (error) {
      setErrorMessage("Đã xảy ra lỗi. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "Tạo ảnh đề xuất mới" : "Chỉnh sửa ảnh đề xuất"}</CardTitle>
        <CardDescription>
          {mode === "create" 
            ? "Thêm ảnh đề xuất mới cho quá trình thiết kế" 
            : "Cập nhật thông tin ảnh đề xuất"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-2">
              <FormLabel>Ảnh đề xuất</FormLabel>
              <div className="flex items-center gap-4">
                {imagePreview && (
                  <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || isLoading}
                    className="w-full"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang upload...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        {imagePreview ? "Thay đổi ảnh" : "Upload ảnh"}
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Định dạng: JPG, PNG, GIF, WebP. Tối đa 10MB
                  </p>
                </div>
              </div>
            </div>

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên ảnh *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: Logo vintage, Pattern hoa" {...field} />
                  </FormControl>
                  <FormDescription>Tên mô tả cho ảnh đề xuất</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image URL */}
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL ảnh *</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormDescription>
                    URL của ảnh (tự động điền khi upload)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Mô tả chi tiết về ảnh..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>Mô tả thêm về ảnh (tùy chọn)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Danh mục</FormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: Logo, Pattern, Icon, Text" {...field} />
                  </FormControl>
                  <FormDescription>
                    Phân loại ảnh theo danh mục (tùy chọn)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Display Order */}
            <FormField
              control={form.control}
              name="displayOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thứ tự hiển thị</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormDescription>
                    Số thứ tự hiển thị (số nhỏ hơn hiển thị trước)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Is Active */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Kích hoạt</FormLabel>
                    <FormDescription>
                      Ảnh có được hiển thị trong danh sách đề xuất không
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Success Message */}
            {successMessage && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
              </Alert>
            )}

            {/* Error Message */}
            {errorMessage && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {/* Form Actions */}
            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading || isUploading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : mode === "create" ? (
                  "Tạo ảnh đề xuất"
                ) : (
                  "Cập nhật"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Hủy
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
