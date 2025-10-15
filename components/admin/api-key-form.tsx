"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Key, CheckCircle, AlertCircle, MessageSquare, Image } from "lucide-react"
import { updateApiKey } from "@/services/aiServices"
import type { ApiAi } from "@/types/ai"

interface ApiKeyRequest {
  api_chatbot: string;
  api_image: string;
  provider?: string;
  model?: string;
}

const apiKeySchema = z.object({
  chatbot_key: z.string().min(1, "Chatbot API key là bắt buộc"),
  image_key: z.string().min(1, "Image API key là bắt buộc"),
})

type ApiKeyFormData = z.infer<typeof apiKeySchema>

export function ApiKeyForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const form = useForm<ApiKeyFormData>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      chatbot_key: "",
      image_key: "",
    },
  })

  const onSubmit = async (data: ApiKeyFormData) => {
    setIsLoading(true)
    setSuccessMessage("")
    setErrorMessage("")

    try {
      // Gửi cả hai API keys trong một request
      const requestData: ApiKeyRequest = {
        api_chatbot: data.chatbot_key,
        api_image: data.image_key,
        provider: "openai",
        model: "gpt-4"
      }
      
      const response = await updateApiKey(requestData as ApiAi)
      
      if (response?.success !== false) {
        setSuccessMessage("Tất cả API keys đã được cập nhật thành công!")
        form.reset()
      } else {
        setErrorMessage("Có lỗi xảy ra khi cập nhật API keys. Vui lòng kiểm tra lại.")
      }
    } catch (error) {
      console.error("Error updating API keys:", error)
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : "Có lỗi không xác định xảy ra khi cập nhật API keys."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Cấu hình API Keys
          </CardTitle>
          <CardDescription>
            Cập nhật API keys cho chatbot và tạo ảnh AI. Hệ thống sẽ sử dụng các keys này để kết nối với các dịch vụ AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Chatbot Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Chatbot API Key</h3>
                    <p className="text-sm text-muted-foreground">GPT-4, GPT-3.5 Turbo cho trò chuyện</p>
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="chatbot_key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Chatbot API Key *</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="sk-..."
                          {...field}
                          disabled={isLoading}
                          className="h-12"
                        />
                      </FormControl>
                      <FormDescription>
                        API key để sử dụng cho chatbot và trò chuyện AI
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Image Generation Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Image className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Image API Key</h3>
                    <p className="text-sm text-muted-foreground">DALL-E 3, DALL-E 2 cho tạo ảnh</p>
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="image_key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Image API Key *</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="sk-..."
                          {...field}
                          disabled={isLoading}
                          className="h-12"
                        />
                      </FormControl>
                      <FormDescription>
                        API key để sử dụng cho tạo ảnh AI và thiết kế
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {successMessage && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {successMessage}
                  </AlertDescription>
                </Alert>
              )}

              {errorMessage && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {errorMessage}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1 h-12 text-base"
                  size="lg"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? "Đang cập nhật..." : "Cập nhật API Keys"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    form.reset()
                    setSuccessMessage("")
                    setErrorMessage("")
                  }}
                  disabled={isLoading}
                  className="h-12 px-6"
                >
                  Đặt lại
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
