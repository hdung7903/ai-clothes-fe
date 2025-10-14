"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { MessageCircle, Send, X, Bot, User2, Loader2, AlertCircle, RefreshCw, Trash2, LogIn } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { askSimpleQuestion } from "@/services/aiServices"
import type { RootState } from "@/redux"

type ChatMessage = {
  id: string
  text: string
  from: "user" | "bot"
  timestamp: Date
  status?: "sending" | "sent" | "error"
  error?: string
}

interface ChatDialogProps {
  /** Optional: start opened (default false) */
  defaultOpen?: boolean
  /** Optional heading in the chat panel */
  title?: string
}

export default function ChatDialog({
  defaultOpen = false,
  title = "AI Assistant",
}: ChatDialogProps) {
  const router = useRouter()
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  
  const [open, setOpen] = useState(defaultOpen)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Load messages from localStorage on component mount
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('chat-messages')
        if (saved) {
          const parsed = JSON.parse(saved)
          return parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }
      } catch (error) {
        console.error('Error loading chat messages:', error)
      }
    }
    
    // Default welcome message
    return [
      {
        id: crypto.randomUUID(),
        text: "Xin chào! Tôi là trợ lý AI của bạn. Tôi có thể giúp bạn tìm hiểu về sản phẩm, thiết kế quần áo, hoặc trả lời bất kỳ câu hỏi nào. Bạn cần hỗ trợ gì?",
        from: "bot",
        timestamp: new Date(),
        status: "sent",
      },
    ]
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement | null>(null)
  const endRef = useRef<HTMLDivElement | null>(null)

  const canSend = useMemo(() => input.trim().length > 0 && !isLoading && isAuthenticated, [input, isLoading, isAuthenticated])

  useEffect(() => {
    if (!open) return
    // focus input when opening
    const t = setTimeout(() => inputRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [open])

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      try {
        localStorage.setItem('chat-messages', JSON.stringify(messages))
      } catch (error) {
        console.error('Error saving chat messages:', error)
      }
    }
  }, [messages])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, open])

  async function handleSend() {
    if (!canSend) return
    
    // Check authentication before sending
    if (!isAuthenticated) {
      setError("Vui lòng đăng nhập để sử dụng tính năng chat AI.")
      return
    }
    
    const text = input.trim()
    setInput("")
    setError(null)

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      text,
      from: "user",
      timestamp: new Date(),
      status: "sending",
    }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Call the AI API
      const response = await askSimpleQuestion(text)
      
      // Update user message status
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === userMessage.id 
            ? { ...msg, status: "sent" as const }
            : msg
        )
      )

      // Add bot response
      const botMessage: ChatMessage = {
        id: crypto.randomUUID(),
        text: response || "Xin lỗi, tôi không thể trả lời câu hỏi này lúc này. Vui lòng thử lại sau.",
        from: "bot",
        timestamp: new Date(),
        status: "sent",
      }
      setMessages((prev) => [...prev, botMessage])
    } catch (err) {
      console.error("Error calling AI API:", err)
      
      // Update user message status to error
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === userMessage.id 
            ? { 
                ...msg, 
                status: "error" as const,
                error: err instanceof Error ? err.message : "Có lỗi xảy ra"
              }
            : msg
        )
      )

      // Add error message
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        text: "Xin lỗi, có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại sau.",
        from: "bot",
        timestamp: new Date(),
        status: "sent",
      }
      setMessages((prev) => [...prev, errorMessage])
      setError("Không thể kết nối với AI. Vui lòng kiểm tra kết nối mạng và thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  function handleRetry(messageId: string) {
    const message = messages.find(m => m.id === messageId)
    if (!message || message.from !== "user") return
    
    setInput(message.text)
    setMessages((prev) => prev.filter(m => m.id !== messageId))
  }

  function clearChatHistory() {
    const welcomeMessage: ChatMessage = {
      id: crypto.randomUUID(),
      text: "Xin chào! Tôi là trợ lý AI của bạn. Tôi có thể giúp bạn tìm hiểu về sản phẩm, thiết kế quần áo, hoặc trả lời bất kỳ câu hỏi nào. Bạn cần hỗ trợ gì?",
      from: "bot",
      timestamp: new Date(),
      status: "sent",
    }
    setMessages([welcomeMessage])
    setError(null)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="fixed bottom-6 right-6 z-50">
        <PopoverTrigger asChild>
          <Button
            aria-label={open ? "Close chat" : "Open chat"}
            size="icon"
            variant="default"
            className="rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary size-14"
          >
            {open ? (
              <X className="size-6" />
            ) : (
              <div className="relative">
                <MessageCircle className="size-6" />
                <div className="absolute -top-1 -right-1 size-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          side="top"
          align="end"
          className="w-[380px] p-0 overflow-hidden shadow-2xl border-2"
        >
          <div className="flex h-[500px] flex-col bg-gradient-to-b from-background to-muted/20">
            <div className="flex items-center justify-between border-b bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="size-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="font-semibold text-foreground">{title}</div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  aria-label="Clear chat history"
                  size="icon"
                  variant="ghost"
                  className="rounded-full hover:bg-destructive/10"
                  onClick={clearChatHistory}
                  disabled={isLoading}
                >
                  <Trash2 className="size-4" />
                </Button>
                <Button
                  aria-label="Close"
                  size="icon"
                  variant="ghost"
                  className="rounded-full hover:bg-destructive/10"
                  onClick={() => setOpen(false)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            {error && (
              <Alert className="mx-3 mt-3 border-destructive/50 bg-destructive/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <ScrollArea className="flex-1 px-3 py-3">
              <div className="flex flex-col gap-4">
                {!isAuthenticated ? (
                  // Login prompt when not authenticated
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <div className="size-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <LogIn className="size-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Đăng nhập để sử dụng AI</h3>
                    <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                      Vui lòng đăng nhập để có thể trò chuyện với trợ lý AI và nhận hỗ trợ về sản phẩm.
                    </p>
                    <Button 
                      onClick={() => router.push('/auth/login')}
                      className="w-full max-w-xs"
                    >
                      <LogIn className="size-4 mr-2" />
                      Đăng nhập ngay
                    </Button>
                  </div>
                ) : (
                  // Chat messages when authenticated
                  <>
                    {messages.map((m) => (
                      <div key={m.id} className={m.from === "user" ? "flex items-start gap-2 justify-end" : "flex items-start gap-2"}>
                        {m.from === "bot" && (
                          <Avatar className="size-8 ring-2 ring-primary/20">
                            <AvatarImage src="/vercel.svg" alt="AI Assistant" />
                            <AvatarFallback className="bg-primary/10">
                              <Bot className="size-4 text-primary" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex flex-col gap-1">
                          <div
                            className={
                              m.from === "user"
                                ? "max-w-[85%] rounded-2xl bg-gradient-to-r from-primary to-primary/90 px-4 py-3 text-primary-foreground shadow-lg"
                                : "max-w-[85%] rounded-2xl bg-card border px-4 py-3 text-foreground shadow-sm"
                            }
                          >
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">
                              {m.text}
                            </div>
                          </div>
                          <div className={`flex items-center gap-1 text-xs text-muted-foreground ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                            <span>{m.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                            {m.from === "user" && (
                              <div className="flex items-center gap-1">
                                {m.status === "sending" && <Loader2 className="size-3 animate-spin" />}
                                {m.status === "error" && (
                                  <div className="flex items-center gap-1">
                                    <AlertCircle className="size-3 text-destructive" />
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-auto p-0 text-xs text-destructive hover:text-destructive"
                                      onClick={() => handleRetry(m.id)}
                                    >
                                      <RefreshCw className="size-3 mr-1" />
                                      Thử lại
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        {m.from === "user" && (
                          <Avatar className="size-8 ring-2 ring-primary/20">
                            <AvatarImage src="/photo.png" alt="You" />
                            <AvatarFallback className="bg-primary/10">
                              <User2 className="size-4 text-primary" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex items-start gap-2">
                        <Avatar className="size-8 ring-2 ring-primary/20">
                          <AvatarImage src="/vercel.svg" alt="AI Assistant" />
                          <AvatarFallback className="bg-primary/10">
                            <Bot className="size-4 text-primary" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="max-w-[85%] rounded-2xl bg-card border px-4 py-3 shadow-sm">
                          <div className="flex items-center gap-2">
                            <Loader2 className="size-4 animate-spin text-primary" />
                            <span className="text-sm text-muted-foreground">AI đang suy nghĩ...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div ref={endRef} />
              </div>
            </ScrollArea>

            <div className="flex items-center gap-2 border-t bg-muted/30 p-3">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.shiftKey)) return
                  if (e.key === "Enter") handleSend()
                }}
                placeholder={isAuthenticated ? "Nhập câu hỏi của bạn..." : "Vui lòng đăng nhập để sử dụng..."}
                aria-label="Message"
                className="flex-1 border-0 bg-background/50 focus-visible:ring-1"
                disabled={isLoading || !isAuthenticated}
              />
              <Button
                aria-label="Send message"
                size="icon"
                disabled={!canSend}
                onClick={handleSend}
                className="rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </div>
    </Popover>
  )
}


