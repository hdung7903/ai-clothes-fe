"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { MessageCircle, Send, X, Bot, User2, Loader2, AlertCircle, RefreshCw, Trash2, LogIn } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { askSimpleQuestion } from "@/services/aiServices"

type ChatMessage = {
  id: string
  text: string
  from: "user" | "bot"
  timestamp: Date
  status?: "sending" | "sent" | "error"
  error?: string
}

interface ChatDialogProps {
  defaultOpen?: boolean
  title?: string
}


// Client-side only UUID generator with fallback
const generateId = () => {
  if (typeof window === 'undefined') return 'temp-id'
  
  // Try to use crypto.randomUUID() if available
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  
  // Fallback UUID generation for older browsers/environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Client-side only date generator
const getCurrentDate = () => {
  if (typeof window === 'undefined') return new Date(0) // Use epoch for SSR
  return new Date()
}

export default function ChatDialog({
  defaultOpen = false,
  title = "TEECRAFT AI Assistant",
}: ChatDialogProps) {
  const router = useRouter()
  const { isAuthenticated, user } = useSelector((state: any) => state.auth)
  
  const [open, setOpen] = useState(defaultOpen)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const canSend = useMemo(() => input.trim().length > 0 && !isLoading && isAuthenticated, [input, isLoading, isAuthenticated])

  // Initialize messages only on client side
  useEffect(() => {
    if (!isInitialized) {
      setMessages([
        {
          id: generateId(),
          text: "Xin chào! Tôi là trợ lý AI của bạn. Tôi có thể giúp bạn tìm hiểu về sản phẩm, thiết kế quần áo, hoặc trả lời bất kỳ câu hỏi nào. Bạn cần hỗ trợ gì?",
          from: "bot",
          timestamp: getCurrentDate(),
          status: "sent",
        },
      ])
      setIsInitialized(true)
    }
  }, [isInitialized])

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => inputRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [open])

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, open])

  async function handleSend() {
    if (!canSend) return
    
    if (!isAuthenticated) {
      setError("Vui lòng đăng nhập để sử dụng tính năng chat AI.")
      return
    }
    
    const text = input.trim()
    setInput("")
    setError(null)

    const userMessage: ChatMessage = {
      id: generateId(),
      text,
      from: "user",
      timestamp: getCurrentDate(),
      status: "sending",
    }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await askSimpleQuestion(text)
      // Handle different response formats
      let replyText: string
      if (typeof response === "string") {
        replyText = response
      } else if (response && typeof response === "object") {
        // If response is an object, try to extract the message or text field
        replyText = (response as any).message || (response as any).text || (response as any).answer || JSON.stringify(response)
      } else {
        replyText = String(response)
      }
      
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === userMessage.id 
            ? { ...msg, status: "sent" as const }
            : msg
        )
      )

      const botMessage: ChatMessage = {
        id: generateId(),
        text: replyText || "Xin lỗi, tôi không thể trả lời câu hỏi này lúc này.",
        from: "bot",
        timestamp: getCurrentDate(),
        status: "sent",
      }
      setMessages((prev) => [...prev, botMessage])
    } catch (err) {
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

      const errorMessage: ChatMessage = {
        id: generateId(),
        text: "Xin lỗi, có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại sau.",
        from: "bot",
        timestamp: getCurrentDate(),
        status: "sent",
      }
      setMessages((prev) => [...prev, errorMessage])
      setError("Không thể kết nối với AI.")
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
      id: generateId(),
      text: "Xin chào! Tôi là trợ lý AI của bạn. Tôi có thể giúp bạn tìm hiểu về sản phẩm, thiết kế quần áo, hoặc trả lời bất kỳ câu hỏi nào. Bạn cần hỗ trợ gì?",
      from: "bot",
      timestamp: getCurrentDate(),
      status: "sent",
    }
    setMessages([welcomeMessage])
    setError(null)
  }

  // Don't render until initialized to prevent hydration mismatch
  if (!isInitialized) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-700 w-14 h-14 flex items-center justify-center text-white"
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </button>
      ) : (
        <div className="w-[380px] h-[600px] bg-white rounded-lg shadow-2xl border flex flex-col overflow-hidden">
          {/* HEADER - Fixed */}
                      <div className="flex items-center justify-between border-b bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              <div className="font-semibold text-white">{title}</div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChatHistory}
                disabled={isLoading}
                className="p-2 rounded-full hover:bg-green-800 transition-colors disabled:opacity-50"
                title="Xóa lịch sử chat"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-full hover:bg-green-800 transition-colors"
                title="Đóng"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* ERROR ALERT - Fixed */}
          {error && (
            <div className="mx-3 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 shrink-0">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* CONTENT - Scrollable */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-3 py-3 bg-gray-50"
            style={{ 
              scrollBehavior: 'smooth',
              overflowY: 'auto'
            }}
          >
            {!isAuthenticated ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center h-full">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <LogIn className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Đăng nhập để sử dụng AI</h3>
                <p className="text-sm text-gray-600 mb-4 max-w-xs">
                  Vui lòng đăng nhập để có thể trò chuyện với trợ lý AI và nhận hỗ trợ về sản phẩm.
                </p>
                <button 
                  onClick={() => router.push('/auth/login')}
                  className="w-full max-w-xs bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Đăng nhập ngay
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {messages.map((m) => (
                  <div 
                    key={m.id} 
                    className={`flex items-start gap-2 ${m.from === "user" ? "flex-row-reverse" : ""}`}
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 ring-2 ring-green-200">
                      {m.from === "bot" ? (
                        <Bot className="w-4 h-4 text-green-700" />
                      ) : (
                        <User2 className="w-4 h-4 text-green-700" />
                      )}
                    </div>

                    {/* Message bubble */}
                    <div className="flex flex-col gap-1 max-w-[75%]">
                      <div
                        className={`rounded-2xl px-4 py-3 shadow-sm ${
                          m.from === "user"
                            ? "bg-gradient-to-r from-green-700 to-green-600 text-white"
                            : "bg-white border text-gray-900"
                        }`}
                      >
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {m.text}
                        </div>
                      </div>
                      
                      {/* Timestamp and status */}
                      <div className={`flex items-center gap-1 text-xs text-gray-500 ${m.from === "user" ? "justify-end" : ""}`}>
                        <span>{m.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                        {m.from === "user" && m.status === "sending" && (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        )}
                        {m.from === "user" && m.status === "error" && (
                          <button
                            onClick={() => handleRetry(m.id)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                          >
                            <AlertCircle className="w-3 h-3" />
                            <RefreshCw className="w-3 h-3" />
                            <span>Thử lại</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center ring-2 ring-green-200">
                      <Bot className="w-4 h-4 text-green-700" />
                    </div>
                    <div className="rounded-2xl bg-white border px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-green-700" />
                        <span className="text-sm text-gray-600">AI đang suy nghĩ...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* FOOTER - Fixed */}
          <div className="flex items-center gap-2 border-t bg-white p-3 shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder={isAuthenticated ? "Nhập câu hỏi của bạn..." : "Vui lòng đăng nhập..."}
              className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50"
              disabled={isLoading || !isAuthenticated}
            />
            <button
              onClick={handleSend}
              disabled={!canSend}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-green-600 to-green-500 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:from-green-500 hover:to-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}