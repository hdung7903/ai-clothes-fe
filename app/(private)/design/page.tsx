"use client";

import type React from "react";
import type { ReactElement } from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Send, ImageIcon, ArrowLeft, Upload, Sparkles, Loader2, Download } from "lucide-react";
import Link from "next/link";
import TShirtDesigner, { type CanvasRef } from "@/components/design/FabricCanvas";
import { transformImageAi, generateNewImage, askSimpleQuestion } from "@/services/aiServices";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { fetchUserProfile } from "@/redux/authSlice";
import { base64ToDataUrl } from "@/utils/image";

// Interface cho pending images (chờ lưu vào canvas)
interface PendingImage {
  id: string;
  url: string;
  name: string;
  style?: string;
  quality?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  designImage?: string; // Chỉ cho AI chat generate, không phải upload
  style?: string;
  quality?: string;
}

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour12: true,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

// Interface cho canvas ref

export default function DesignToolPage(): ReactElement {
  const dispatch = useAppDispatch();
  const authUserId = useAppSelector((s) => s.auth.user?.id);
  const user = useAppSelector((s) => s.auth.user);
  const tokens = useAppSelector((s) => s.auth.tokens);
  const tokenCount = user?.tokenCount ?? 0;
  const hasTokens = tokenCount > 0;
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Xin chào! Tôi là nhà thiết kế TEECRAFT của bạn. Mô tả thiết kế trang phục bạn muốn tạo, hoặc upload ảnh để transform với AI (ghibli, anime, etc.). Tôi có thể giúp bạn thiết kế áo thun, áo hoodie, váy và nhiều hơn nữa!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [style, setStyle] = useState("ghibli");
  const [quality, setQuality] = useState("high");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null); // Chỉ preview upload
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]); // Ảnh AI chờ lưu
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [imageLoading, setImageLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<CanvasRef>(null); // Ref để gọi addImageDecoration

  // Fetch latest user profile on mount to get updated token count
  useEffect(() => {
    setMounted(true);
    
    // Refresh user profile to get latest token count
    if (tokens?.accessToken) {
      dispatch(fetchUserProfile(tokens.accessToken));
    }
  }, [dispatch, tokens?.accessToken]);

  // Refresh profile after AI operations to update token count
  const refreshUserProfile = async () => {
    if (tokens?.accessToken) {
      try {
        await dispatch(fetchUserProfile(tokens.accessToken)).unwrap();
      } catch (error) {
        console.error('Failed to refresh user profile:', error);
      }
    }
  };

  

  // Gửi message chat - Call AI service directly
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    // Check if user has tokens
    if (!hasTokens) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "⚠️ Bạn đã hết token! Vui lòng mua gói token để tiếp tục sử dụng tính năng AI Chat. Truy cập trang Packages để mua thêm token.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput("");
    setIsLoading(true);

    try {
      // Call AI service directly instead of Next.js API route
      const response = await askSimpleQuestion(userInput);
      
      // Extract answer from AI response
      let answerText = "";
      if (typeof response === "string") {
        answerText = response;
      } else if (response && typeof response === "object") {
        const anyRes: any = response;
        answerText = anyRes.answer || anyRes.data?.answer || anyRes.message || JSON.stringify(response);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: answerText || "Xin lỗi, tôi không thể trả lời câu hỏi này lúc này.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Refresh profile to update token count after AI usage
      await refreshUserProfile();
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: error instanceof Error ? error.message : "Xin lỗi, tôi gặp lỗi. Vui lòng thử lại.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Transform/Generate AI Image
  const handleTransformImage = async (isGenerate: boolean = false) => {
    if (isLoading) return;
    
    // Check if user has tokens
    if (!hasTokens) {
      alert("⚠️ Bạn đã hết token! Vui lòng mua gói token để tiếp tục sử dụng tính năng AI Transform/Generate. Truy cập trang Packages để mua thêm token.");
      return;
    }
    
    if (!input.trim() && !uploadedImage) {
      alert("Vui lòng nhập prompt hoặc upload ảnh.");
      return;
    }

    setIsLoading(true);
    const prompt = input.trim() || "Generate T-shirt design inspiration";
    const base64Payload = uploadedImage ? uploadedImage.split(",")[1] : undefined;
    const uuid = authUserId || crypto.randomUUID();

    try {
      // Call AI service directly
      let imageUrl = "";
      const action = isGenerate ? "generate" : "transform";
      if (isGenerate) {
        const res = await generateNewImage({ uuid, prompt, style, quality });
        // Support both AIResponse shape and raw result fields
        const anyRes: any = res as any;
        const base64Result = res?.data?.generated_image_base64
          ?? anyRes?.result_base64
          ?? anyRes?.generated_image_base64
          ?? null;
        const urlResult = res?.data?.generated_image_url
          ?? anyRes?.result_url
          ?? anyRes?.generated_image_url
          ?? null;
        imageUrl = base64Result ? base64ToDataUrl(base64Result) : (urlResult ?? "");
      } else {
        if (!base64Payload) {
          throw new Error("Thiếu dữ liệu ảnh để transform. Vui lòng upload ảnh và thử lại.");
        }
        const res = await transformImageAi({ uuid, image_base64: base64Payload, prompt, style, quality });
        // Support both AIResponse shape and raw result fields
        const anyRes: any = res as any;
        const base64Result = res?.data?.transformed_image_base64
          ?? anyRes?.result_base64
          ?? anyRes?.transformed_image_base64
          ?? null;
        const urlResult = res?.data?.transformed_image_url
          ?? anyRes?.result_url
          ?? anyRes?.transformed_image_url
          ?? null;
        imageUrl = base64Result ? base64ToDataUrl(base64Result) : (urlResult ?? "");
      }
      
      // Thêm message thông báo vào chat
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `Tôi đã ${action} thành công ảnh với style ${style}! Xem preview bên dưới và nhấn "Lưu vào áo" để thêm vào thiết kế.`,
        timestamp: new Date(),
        style,
        quality,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Thêm vào pending images (thumbnail chờ lưu)
      if (!imageUrl) throw new Error("Phản hồi AI không có dữ liệu hình ảnh");

      const pendingImage: PendingImage = {
        id: Date.now().toString(),
        url: imageUrl,
        name: `${action === "transform" ? "Transformed" : "Generated"} Image`,
        style,
        quality,
      };
      setPendingImages((prev) => [...prev, pendingImage]);

      setInput("");
      if (!isGenerate) setUploadedImage(null); // Clear upload preview
      
      // Refresh profile to update token count after AI usage
      await refreshUserProfile();
    } catch (error) {
      console.error(`Error ${isGenerate ? "generating" : "transforming"} image:`, error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `Có lỗi xảy ra khi ${isGenerate ? "generate" : "transform"} ảnh. Vui lòng thử lại.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Upload ảnh (chỉ preview ở prompt, không vào chat)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string); // Chỉ preview, không push message
        // Reset input value to allow re-uploading the same file or another file with same name
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      };
      reader.readAsDataURL(file);
    }
    // If user cancels selection, also ensure input is reset
    else if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Lưu ảnh pending vào canvas (gọi ref method)
  const handleSaveToCanvas = (imageUrl: string, imageName: string) => {
    if (canvasRef.current) {
      canvasRef.current.addImageDecoration(imageUrl, imageName); // Gọi method của canvas
      // Xóa khỏi pending sau khi lưu
      setPendingImages((prev) => prev.filter(img => img.url !== imageUrl));
    }
  };

  // Xóa pending image
  const handleRemovePending = (id: string) => {
    setPendingImages((prev) => prev.filter(img => img.id !== id));
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        {/* Header */}
        <div className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 p-4 flex-shrink-0 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center">
                  <img 
                    src="/branch.png" 
                    alt="TEECRAFT Logo" 
                    className="h-8 w-8 object-contain"
                  />
                </div>
                <span className="text-xl font-bold">
                  <span className="text-green-600">TEE</span>
                  <span className="text-yellow-500">CRAFT</span>
                </span>
            </Link>
            <span className="text-xl font-bold text-gray-600">Designer</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/packages">
              <Badge 
                variant={hasTokens ? "default" : "destructive"} 
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                {tokenCount} Tokens
              </Badge>
            </Link>
            <Badge variant="secondary">Beta</Badge>
          </div>
        </div>
      </div>

      {/* Main Content: Chat (30%) + Canvas (70%) */}
      <div className="flex-1 flex overflow-auto w-full">
        {/* Chat Section */}
        <div className="w-[30%] flex flex-col border-r bg-white flex-shrink-0 max-h-full">
          <ScrollArea className="flex-1 p-4 h-0">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-purple-500 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {message.designImage && ( // Chỉ show nếu là AI chat image, không phải upload
                      <div className="mb-2">
                        <img
                          src={message.designImage}
                          alt="AI Design"
                          className="w-full max-w-xs rounded-lg shadow-md"
                        />
                      </div>
                    )}
                    {message.style && (
                      <Badge variant="outline" className="mb-1 text-xs">
                        Style: {message.style} | Quality: {message.quality}
                      </Badge>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {mounted && (
                      <p className="text-xs opacity-70 mt-1">
                        {formatTimestamp(message.timestamp)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-3 bg-gray-100">
                    <Skeleton className="h-4 w-[250px] mb-2" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t flex-shrink-0 bg-gray-50">
            {/* Pending Images (thumbnails chờ lưu) - Moved above input */}
            {pendingImages.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border">
                <h4 className="font-medium text-sm mb-2 text-blue-800">Ảnh AI sẵn sàng thêm vào thiết kế:</h4>
                <div className="flex flex-wrap gap-2">
                  {pendingImages.map((img) => (
                    <div key={img.id} className="bg-white rounded-lg p-2 shadow-sm border flex flex-col items-center">
                      <img 
                        src={img.url} 
                        alt={img.name} 
                        className="w-16 h-16 rounded object-cover mb-1"
                      />
                      <div className="text-center">
                        <p className="text-xs text-gray-600 truncate w-16">{img.name}</p>
                        <Badge variant="outline" className="text-xs mt-1">{img.style}</Badge>
                      </div>
                      <div className="flex gap-1 mt-1">
                        <Button
                          size="sm"
                          onClick={() => handleSaveToCanvas(img.url, img.name)}
                          className="h-6 px-2 text-xs"
                        >
                          Lưu vào áo
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Mô tả ý tưởng thiết kế hoặc prompt cho AI image..."
                  className="min-h-[60px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isLoading}
                />
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!input.trim() || isLoading || !hasTokens}
                      size="icon"
                      className="shrink-0"
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </span>
                </TooltipTrigger>
                {!hasTokens && (
                  <TooltipContent>
                    <p>Bạn cần mua token để sử dụng AI Chat</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>

            {/* Upload Preview (chỉ ở đây, không vào chat) */}
            {uploadedImage && (
              <div className="flex items-center gap-2 mb-2 p-2 bg-white rounded border">
                <img src={uploadedImage} alt="Upload preview" className="w-12 h-12 rounded object-cover" />
                <span className="text-xs text-gray-600 truncate flex-1">Ảnh upload sẵn sàng transform</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUploadedImage(null)}
                  className="h-6 w-6 p-0"
                >
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            )}

            <Input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="w-full mb-2 flex items-center gap-2"
              disabled={isLoading}
            >
              <Upload className="h-4 w-4" />
              Upload Ảnh Để Transform
            </Button>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <Select value={style} onValueChange={setStyle} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ghibli">Ghibli</SelectItem>
                  <SelectItem value="modern anime">Modern Anime</SelectItem>
                  <SelectItem value="disney">Disney</SelectItem>
                  <SelectItem value="marvel">Marvel</SelectItem>
                  <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
                  <SelectItem value="others">Others</SelectItem>
                </SelectContent>
              </Select>
              <Select value={quality} onValueChange={setQuality} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex-1">
                    <Button
                      onClick={() => handleTransformImage(false)}
                      disabled={isLoading || !uploadedImage || !hasTokens}
                      className="w-full"
                      variant="default"
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ImageIcon className="h-4 w-4 mr-2" />}
                      Transform
                    </Button>
                  </span>
                </TooltipTrigger>
                {!hasTokens && (
                  <TooltipContent>
                    <p>Bạn cần mua token để sử dụng AI Transform</p>
                  </TooltipContent>
                )}
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex-1">
                    <Button
                      onClick={() => handleTransformImage(true)}
                      disabled={isLoading || !input.trim() || !hasTokens}
                      className="w-full"
                      variant="secondary"
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                      Generate
                    </Button>
                  </span>
                </TooltipTrigger>
                {!hasTokens && (
                  <TooltipContent>
                    <p>Bạn cần mua token để sử dụng AI Generate</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Design Canvas Section */}
        <div className="flex-1 relative overflow-auto bg-gray-50">
          <div className="w-full flex items-center justify-center p-4 min-h-full">
            <TShirtDesigner 
              ref={canvasRef} // ForwardRef để gọi addImageDecoration
              imageUrl={currentImageUrl || undefined}
              designType="tshirt"
              onImageChange={(newImageUrl) => {
                setCurrentImageUrl(newImageUrl);
                console.log('Image changed to:', newImageUrl);
              }}
              onLoadingChange={(loading) => {
                setImageLoading(loading);
                console.log('Image loading:', loading);
              }}
            />
          </div>
        </div>
      </div>
      </div>
    </TooltipProvider>
  );
}