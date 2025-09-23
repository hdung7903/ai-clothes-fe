"use client"

import type React from "react"

import type { ReactElement } from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, ImageIcon, Save, Download, Eye, GripVertical, Shirt, Palette, Wand2, Move, Maximize2, RotateCw } from "lucide-react"
import { MessageSkeleton } from "@/components/ui/loading/message-skeleton"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  designImage?: string
}

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour12: true,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  })
}

type LayerType = "image" | "icon" | "text"

interface DesignLayer {
  id: string
  type: LayerType
  side: "front" | "back"
  visible: boolean
  x: number
  y: number
  scale: number
  rotation: number
  src?: string
  text?: string
  fontSize?: number
  color?: string
}

export default function DesignToolPage(): ReactElement {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! I'm your AI fashion designer. Describe the clothing design you'd like to create, or upload an image for inspiration. I can help you design t-shirts, hoodies, dresses, and more!",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentDesign, setCurrentDesign] = useState<string | null>(null)
  const [artTransform, setArtTransform] = useState<TransformState>({ x: 0, y: 0, scale: 1, rotation: 0 })
  const [side, setSide] = useState<"front" | "back">("front")
  const [garmentColor, setGarmentColor] = useState<string>("#ffffff")
  const [layers, setLayers] = useState<DesignLayer[]>([])
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null)
  const [textDraft, setTextDraft] = useState<{ text: string; fontSize: number; color: string }>({ text: "", fontSize: 32, color: "#000000" })
  const [leftWidth, setLeftWidth] = useState(50) // Percentage
  const [isDragging, setIsDragging] = useState(false)
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100

      // Constrain between 30% and 70%
      const constrainedWidth = Math.max(30, Math.min(70, newLeftWidth))
      setLeftWidth(constrainedWidth)
    },
    [isDragging],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100

      // Constrain between 30% and 70%
      const constrainedWidth = Math.max(30, Math.min(70, newLeftWidth))
      setLeftWidth(constrainedWidth)
    }

    const handleGlobalMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleGlobalMouseMove)
      document.addEventListener("mouseup", handleGlobalMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove)
      document.removeEventListener("mouseup", handleGlobalMouseUp)
    }
  }, [isDragging])

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No reader available")

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      const decoder = new TextDecoder()
      let done = false

      while (!done) {
        const { value, done: streamDone } = await reader.read()
        done = streamDone

        if (value) {
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6)
              if (data === "[DONE]") continue

              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  assistantMessage.content += parsed.content
                  setMessages((prev) =>
                    prev.map((m) => (m.id === assistantMessage.id ? { ...m, content: assistantMessage.content } : m)),
                  )
                }
              } catch (e) {
                // Ignore parsing errors
              }
            }
          }
        }
      }

      if (
        assistantMessage.content.toLowerCase().includes("design") ||
        assistantMessage.content.toLowerCase().includes("create")
      ) {
        setTimeout(() => {
          const designImages = [
            "/custom-t-shirt-design.jpg",
            "/floral-t-shirt-design.jpg",
            "/geometric-hoodie-design.jpg",
          ]
          const randomDesign = designImages[Math.floor(Math.random() * designImages.length)]
          setCurrentDesign(randomDesign)
        }, 2000)
      }
    } catch (error) {
      console.error("Error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        const message: Message = {
          id: Date.now().toString(),
          role: "user",
          content: `I've uploaded an image for inspiration. Please help me create a clothing design based on this image.`,
          timestamp: new Date(),
          designImage: imageUrl,
        }
        setMessages((prev) => [...prev, message])
      }
      reader.readAsDataURL(file)
    }
  }

  const addImageLayer = (src: string) => {
    const id = crypto.randomUUID()
    setLayers((prev) => [
      ...prev,
      { id, type: "icon", side, visible: true, x: 0, y: 0, scale: 1, rotation: 0, src },
    ])
    setSelectedLayerId(id)
  }

  const handleAddUploadLayer = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const id = crypto.randomUUID()
      setLayers((prev) => [
        ...prev,
        { id, type: "image", side, visible: true, x: 0, y: 0, scale: 1, rotation: 0, src: String(ev.target?.result || "") },
      ])
      setSelectedLayerId(id)
    }
    reader.readAsDataURL(file)
  }

  const addTextLayer = () => {
    if (!textDraft.text.trim()) return
    const id = crypto.randomUUID()
    setLayers((prev) => [
      ...prev,
      { id, type: "text", side, visible: true, x: 0, y: 0, scale: 1, rotation: 0, text: textDraft.text, fontSize: textDraft.fontSize, color: textDraft.color },
    ])
    setSelectedLayerId(id)
    setTextDraft((d) => ({ ...d, text: "" }))
  }

  const updateLayer = (id: string, partial: Partial<DesignLayer>) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...partial } : l)))
  }

  const moveLayer = (fromIndex: number, toIndex: number) => {
    const relevant = layers.filter((l) => l.side === side)
    if (toIndex < 0 || toIndex >= relevant.length) return
    const other = layers.filter((l) => l.side !== side)
    const reordered = [...relevant]
    const [moved] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, moved)
    setLayers([...other, ...reordered])
  }

  const removeLayer = (id: string) => {
    setLayers((prev) => prev.filter((l) => l.id !== id))
    if (selectedLayerId === id) setSelectedLayerId(null)
  }

  const adjustSelected = (mutator: (l: DesignLayer) => DesignLayer) => {
    if (!selectedLayerId) return
    setLayers((prev) => prev.map((l) => (l.id === selectedLayerId ? mutator(l) : l)))
  }

  return (
    <div className="h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-primary" />
            AI Fashion Designer
          </h1>
          <p className="text-muted-foreground">Create custom clothing designs with AI assistance</p>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 flex overflow-hidden">
        {/* Chat Section */}
        <div style={{ width: `${leftWidth}%` }} className="flex flex-col border-r">
          {/* Sidebar with options */}
          <div className="p-4 border-b bg-muted/30">
            <div className="space-y-4">
              {/* Garment Types */}
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Shirt className="h-4 w-4" />
                  Garment Types
                </h3>
                <div className="flex flex-wrap gap-2">
                  {garmentTypes.map((type) => (
                    <Badge
                      key={type.name}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    >
                      {type.icon} {type.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Style Preferences */}
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Styles
                </h3>
                <div className="flex flex-wrap gap-2">
                  {stylePreferences.map((style) => (
                    <Badge
                      key={style}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    >
                      {style}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {message.designImage && (
                      <img
                        src={message.designImage || "/placeholder.svg"}
                        alt="Uploaded inspiration"
                        className="w-full max-w-xs rounded-lg mb-2"
                      />
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {mounted && <p className="text-xs opacity-70 mt-1">{formatTimestamp(message.timestamp)}</p>}
                  </div>
                </div>
              ))}
              {isLoading && <MessageSkeleton />}
            </div>
          </ScrollArea>

          {/* Quick Prompts */}
          <div className="p-4 border-t bg-muted/30">
            <h4 className="text-sm font-medium mb-2">Quick Ideas:</h4>
            <div className="grid grid-cols-1 gap-2">
              {quickPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="justify-start text-left h-auto p-2 text-xs"
                  onClick={() => setInput(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <div className="flex-1">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe your clothing design idea..."
                  className="min-h-[60px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
                <Button variant="outline" size="icon" onClick={() => document.getElementById("image-upload")?.click()}>
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Button onClick={handleSendMessage} disabled={!input.trim() || isLoading} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div
          className="w-1 bg-border hover:bg-primary/50 cursor-col-resize flex items-center justify-center group"
          onMouseDown={handleMouseDown}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
        </div>

        {/* Preview Section */}
        <div style={{ width: `${100 - leftWidth}%` }} className="flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Design Preview
            </h2>
          </div>

          <div className="flex-1 p-4">
            <Card className="h-full">
              <CardContent className="p-6 h-full grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                <div className="relative flex items-center justify-center rounded-lg overflow-hidden" style={{ backgroundColor: garmentColor }}>
                  <img
                    src="/custom-t-shirt-design.jpg"
                    alt="T-shirt mockup"
                    className="max-h-[560px] w-auto object-contain select-none pointer-events-none"
                  />

                  {layers
                    .filter((l) => l.side === side && l.visible)
                    .map((layer, idx) => (
                      <DraggableLayer
                        key={layer.id}
                        layer={layer}
                        selected={selectedLayerId === layer.id}
                        onSelect={() => setSelectedLayerId(layer.id)}
                        onChange={(updated) => updateLayer(updated.id, updated)}
                      />
                    ))}
                </div>

                {/* Editor Tabs */}
                <div className="space-y-4">
                  <Tabs defaultValue="customize" className="w-full">
                    <TabsList className="grid grid-cols-5">
                      <TabsTrigger value="customize">Customize</TabsTrigger>
                      <TabsTrigger value="design">Design</TabsTrigger>
                      <TabsTrigger value="text">Text</TabsTrigger>
                      <TabsTrigger value="upload">Upload</TabsTrigger>
                      <TabsTrigger value="layers">Layers</TabsTrigger>
                    </TabsList>

                    <TabsContent value="customize" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant={side === "front" ? "default" : "outline"} onClick={() => setSide("front")}>Front</Button>
                        <Button variant={side === "back" ? "default" : "outline"} onClick={() => setSide("back")}>Back</Button>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Garment Color</label>
                        <input type="color" value={garmentColor} onChange={(e) => setGarmentColor(e.target.value)} className="h-10 w-full rounded border" />
                      </div>

                      {selectedLayerId && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Selected Layer Controls</label>
                          <div className="grid grid-cols-3 gap-2">
                            <Button variant="outline" size="sm" onClick={() => adjustSelected((l) => ({ ...l, rotation: 0 }))}>
                              <RotateCw className="h-4 w-4 mr-2" /> Reset
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => adjustSelected((l) => ({ ...l, scale: Math.min(3, l.scale + 0.1) }))}>
                              <Maximize2 className="h-4 w-4 mr-2" /> Scale +
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => adjustSelected((l) => ({ ...l, scale: Math.max(0.2, l.scale - 0.1) }))}>
                              <Maximize2 className="h-4 w-4 mr-2 rotate-180" /> Scale -
                            </Button>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="design" className="space-y-3 mt-4">
                      <div className="grid grid-cols-4 gap-2">
                        {presetIcons.map((icon) => (
                          <button key={icon.src} className="border rounded p-2 hover:bg-muted" onClick={() => addImageLayer(icon.src)}>
                            <img src={icon.src} alt={icon.label} className="h-12 w-12 object-contain mx-auto" />
                            <div className="text-xs text-center mt-1">{icon.label}</div>
                          </button>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="text" className="space-y-3 mt-4">
                      <div className="space-y-2">
                        <Input placeholder="Add text" value={textDraft.text} onChange={(e) => setTextDraft((d) => ({ ...d, text: e.target.value }))} />
                        <div className="grid grid-cols-2 gap-2">
                          <Input type="number" min={8} max={120} value={textDraft.fontSize} onChange={(e) => setTextDraft((d) => ({ ...d, fontSize: Number(e.target.value) }))} />
                          <input type="color" value={textDraft.color} onChange={(e) => setTextDraft((d) => ({ ...d, color: e.target.value }))} className="h-10 w-full rounded border" />
                        </div>
                        <Button onClick={addTextLayer} disabled={!textDraft.text.trim()}>Add Text</Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="upload" className="space-y-3 mt-4">
                      <Input type="file" accept="image/*" onChange={handleAddUploadLayer} />
                    </TabsContent>

                    <TabsContent value="layers" className="space-y-3 mt-4">
                      <div className="space-y-2">
                        {layers.filter((l) => l.side === side).map((l, idx, arr) => (
                          <div key={l.id} className={`flex items-center justify-between border rounded p-2 ${selectedLayerId === l.id ? "bg-muted" : ""}`}>
                            <div className="flex items-center gap-2">
                              <input type="checkbox" checked={l.visible} onChange={(e) => updateLayer(l.id, { visible: e.target.checked })} />
                              <button className="text-left" onClick={() => setSelectedLayerId(l.id)}>
                                <div className="text-sm font-medium">{layerTitle(l)}</div>
                                <div className="text-xs text-muted-foreground">{l.type}</div>
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => moveLayer(idx, idx - 1)} disabled={idx === 0}>Up</Button>
                              <Button variant="outline" size="sm" onClick={() => moveLayer(idx, idx + 1)} disabled={idx === arr.length - 1}>Down</Button>
                              <Button variant="destructive" size="sm" onClick={() => removeLayer(l.id)}>Delete</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="pt-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline">
                        <Save className="h-4 w-4 mr-2" /> Save
                      </Button>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" /> Download
                      </Button>
                    </div>
                    <Button className="w-full mt-2">Add to Cart - $29.99</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

const garmentTypes = [
  { name: "T-Shirt", icon: "👕" },
  { name: "Hoodie", icon: "🧥" },
  { name: "Dress", icon: "👗" },
  { name: "Tank Top", icon: "🎽" },
  { name: "Sweatshirt", icon: "👔" },
]

const stylePreferences = ["Minimalist", "Vintage", "Streetwear", "Bohemian", "Modern", "Retro"]

const quickPrompts = [
  "Design a minimalist t-shirt with geometric patterns",
  "Create a vintage-style hoodie with retro colors",
  "Make a floral dress with summer vibes",
  "Design a streetwear jacket with bold graphics",
]

interface TransformState {
  x: number
  y: number
  scale: number
  rotation: number
}

function DraggableLayer({ layer, selected, onSelect, onChange }: {
  layer: DesignLayer
  selected: boolean
  onSelect: () => void
  onChange: (l: DesignLayer) => void
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    onSelect()
    setIsDragging(true)
    setDragStart({ x: e.clientX - layer.x, y: e.clientY - layer.y })
  }

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStart) return
    onChange({ ...layer, x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }

  const onMouseUp = () => setIsDragging(false)

  const baseStyle = {
    transform: `translate(-50%, -50%) translate(${layer.x}px, ${layer.y}px) rotate(${layer.rotation}deg) scale(${layer.scale})`,
  } as React.CSSProperties

  return (
    <div
      className={`absolute left-1/2 top-1/3 cursor-move ${selected ? "ring-2 ring-primary" : ""}`}
      style={baseStyle}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {layer.type !== "text" && layer.src && (
        <img src={layer.src} alt="Layer" className="max-w-[320px] w-[40vw] max-h-[320px] object-contain drop-shadow" />
      )}
      {layer.type === "text" && (
        <div
          className="select-none"
          style={{ fontSize: layer.fontSize || 32, color: layer.color || "#000000" }}
        >
          {layer.text}
        </div>
      )}
    </div>
  )
}

function layerTitle(l: DesignLayer): string {
  if (l.type === "text") return l.text ? `Text: ${l.text.slice(0, 12)}` : "Text"
  if (l.type === "icon") return "Icon"
  return "Image"
}

const presetIcons = [
  { src: "/globe.svg", label: "Globe" },
  { src: "/file.svg", label: "File" },
  { src: "/next.svg", label: "Next" },
  { src: "/vercel.svg", label: "Vercel" },
]

const newLayerBase = (side: "front" | "back") => ({
  side,
  visible: true,
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0,
})
