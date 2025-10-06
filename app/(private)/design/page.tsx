"use client";

import type React from "react";

import type { ReactElement } from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Send,
  ImageIcon,
  Save,
  Download,
  Eye,
  GripVertical,
  Shirt,
  Palette,
  Wand2,
  Move,
  Maximize2,
  RotateCw,
} from "lucide-react";
import { MessageSkeleton } from "@/components/ui/loading/message-skeleton";
import FabricCanvas from "@/components/design/FabricCanvas";
import dynamic from "next/dynamic";
// Emoji picker is client-only and React 19 compatible
const EmojiPicker: any = dynamic(() => import("emoji-picker-react"), { ssr: false });

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  designImage?: string;
}

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour12: true,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

type LayerType = "image" | "icon" | "text";
type Garment = "tshirt" | "hoodie" | "polo";

interface DesignLayer {
  id: string;
  type: LayerType;
  side: "front" | "back";
  visible: boolean;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  src?: string;
  text?: string;
  fontSize?: number;
  color?: string;
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
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentDesign, setCurrentDesign] = useState<string | null>(null);
  const [artTransform, setArtTransform] = useState<TransformState>({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
  });
  const [side, setSide] = useState<"front" | "back">("front");
  const [garmentColor, setGarmentColor] = useState<string>("#ffffff");
  const [garmentType, setGarmentType] = useState<Garment>("tshirt");
  const [layers, setLayers] = useState<DesignLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [textDraft, setTextDraft] = useState<{
    text: string;
    fontSize: number;
    color: string;
    fontWeight: "normal" | "bold";
    fontStyle: "normal" | "italic";
    underline: boolean;
    superscript: boolean;
    subscript: boolean;
  }>({ text: "", fontSize: 32, color: "#000000", fontWeight: "normal", fontStyle: "normal", underline: false, superscript: false, subscript: false });
  const [selectedEmoji, setSelectedEmoji] = useState<string | undefined>(undefined);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [leftWidth, setLeftWidth] = useState(50); // Percentage
  const [isDragging, setIsDragging] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth =
        ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // Constrain between 30% and 70%
      const constrainedWidth = Math.max(30, Math.min(70, newLeftWidth));
      setLeftWidth(constrainedWidth);
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth =
        ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // Constrain between 30% and 70%
      const constrainedWidth = Math.max(30, Math.min(70, newLeftWidth));
      setLeftWidth(constrainedWidth);
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

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
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;

        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  assistantMessage.content += parsed.content;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMessage.id
                        ? { ...m, content: assistantMessage.content }
                        : m
                    )
                  );
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
          ];
          const randomDesign =
            designImages[Math.floor(Math.random() * designImages.length)];
          setCurrentDesign(randomDesign);
        }, 2000);
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const message: Message = {
          id: Date.now().toString(),
          role: "user",
          content: `I've uploaded an image for inspiration. Please help me create a clothing design based on this image.`,
          timestamp: new Date(),
          designImage: imageUrl,
        };
        setMessages((prev) => [...prev, message]);
      };
      reader.readAsDataURL(file);
    }
  };

  const addImageLayer = (src: string) => {
    const id = crypto.randomUUID();
    setLayers((prev) => [
      ...prev,
      {
        id,
        type: "icon",
        side,
        visible: true,
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        src,
      },
    ]);
    setSelectedLayerId(id);
  };

  const handleAddUploadLayer = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const id = crypto.randomUUID();
      setLayers((prev) => [
        ...prev,
        {
          id,
          type: "image",
          side,
          visible: true,
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          src: String(ev.target?.result || ""),
        },
      ]);
      setSelectedLayerId(id);
    };
    reader.readAsDataURL(file);
  };

  // addTextLayer removed as requested

  const handleLayerAdded = useCallback((layer: { type: 'emoji' | 'text' | 'image'; content: string; id: string }) => {
    if (layer.type === 'emoji') {
      // Check if emoji layer already exists to prevent duplicates
      setLayers((prev) => {
        const existingEmoji = prev.find(l => l.type === 'icon' && l.text === layer.content && l.side === side);
        if (existingEmoji) return prev; // Don't add duplicate
        
        const id = crypto.randomUUID();
        return [
          ...prev,
          {
            id,
            type: "icon" as LayerType,
            side,
            visible: true,
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            text: layer.content, // Store emoji as text for display
          },
        ];
      });
    } else if (layer.type === 'text') {
      // Check if text layer already exists to prevent duplicates
      setLayers((prev) => {
        const existingText = prev.find(l => l.type === 'text' && l.text === layer.content && l.side === side);
        if (existingText) return prev; // Don't add duplicate
        
        const id = crypto.randomUUID();
        return [
          ...prev,
          {
            id,
            type: "text" as LayerType,
            side,
            visible: true,
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            text: layer.content,
          },
        ];
      });
    }
  }, [side]);

  const updateLayer = (id: string, partial: Partial<DesignLayer>) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...partial } : l))
    );
  };

  const moveLayer = (fromIndex: number, toIndex: number) => {
    const relevant = layers.filter((l) => l.side === side);
    if (toIndex < 0 || toIndex >= relevant.length) return;
    const other = layers.filter((l) => l.side !== side);
    const reordered = [...relevant];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    setLayers([...other, ...reordered]);
  };

  const moveLayerById = (layerId: string, direction: 'up' | 'down') => {
    const relevant = layers.filter((l) => l.side === side);
    const currentIndex = relevant.findIndex((l) => l.id === layerId);
    
    if (currentIndex === -1) return;
    
    let newIndex: number;
    if (direction === 'up') {
      if (currentIndex === 0) {
        // Already at top - could show a toast notification here
        return;
      }
      newIndex = currentIndex - 1;
    } else {
      if (currentIndex === relevant.length - 1) {
        // Already at bottom - could show a toast notification here
        return;
      }
      newIndex = currentIndex + 1;
    }
    
    const other = layers.filter((l) => l.side !== side);
    const reordered = [...relevant];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(newIndex, 0, moved);
    setLayers([...other, ...reordered]);
  };

  const removeLayer = (id: string) => {
    setLayers((prev) => prev.filter((l) => l.id !== id));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  const adjustSelected = (mutator: (l: DesignLayer) => DesignLayer) => {
    if (!selectedLayerId) return;
    setLayers((prev) =>
      prev.map((l) => (l.id === selectedLayerId ? mutator(l) : l))
    );
  };

  return (
    <div className="min-h-screen overflow-auto bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-primary" />
            AI Fashion Designer
          </h1>
          <p className="text-muted-foreground">
            Create custom clothing designs with AI assistance
          </p>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 flex overflow-x-hidden overflow-y-auto">
        {/* Chat Section */}
        <div
          style={{ width: `33.3333%` }}
          className="flex flex-col border-r"
        >
         {/* Sidebar with options */}
          {/* <div className="p-4 border-b bg-muted/30">

          </div> */}

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.designImage && (
                      <img
                        src={message.designImage || "/placeholder.svg"}
                        alt="Uploaded inspiration"
                        className="w-full max-w-xs rounded-lg mb-2"
                      />
                    )}
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                    {mounted && (
                      <p className="text-xs opacity-70 mt-1">
                        {formatTimestamp(message.timestamp)}
                      </p>
                    )}
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
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    document.getElementById("image-upload")?.click()
                  }
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed layout: divider removed */}

        {/* Preview Section */}
        <div style={{ width: `66.6667%` }} className="flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Design Preview
            </h2>
          </div>

          <div className="flex-1 p-4">
            <Card className="h-full">
              <CardContent className="p-6 h-full">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 h-full">
                  {/* Canvas Area */}
                  <div className="relative flex items-center justify-center min-h-[800px] p-8">
                    <div className="w-full max-w-5xl aspect-[4/3]">
                      <FabricCanvas
                        backgroundImageUrl="/photo.png"
                        color={garmentColor}
                        emoji={selectedEmoji}
                        onLayerAdded={handleLayerAdded}
                        onChange={(payload) => {
                          console.log("Canvas changed:", payload);
                        }}
                      />
                    </div>

                    {/* Draggable Layers */}
                    {layers
                      .filter((l) => l.side === side)
                      .map((layer, index) => (
                        <DraggableLayer
                          key={layer.id}
                          layer={layer}
                          zIndex={index}
                          selected={selectedLayerId === layer.id}
                          onSelect={() => setSelectedLayerId(layer.id)}
                          onChange={(updatedLayer) =>
                            updateLayer(layer.id, updatedLayer)
                          }
                        />
                      ))}
                  </div>

                  {/* Side Panel */}
                  <div className="border-l pl-6 space-y-6">
                    {/* Garment Controls */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Shirt className="h-4 w-4" />
                        Garment
                      </h3>
                      <Tabs
                        value={side}
                        onValueChange={(v) => setSide(v as "front" | "back")}
                      >
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="front">Front</TabsTrigger>
                          <TabsTrigger value="back">Back</TabsTrigger>
                        </TabsList>
                      </Tabs>
                      <div className="mt-3 space-y-3">
                        <div>
                          <label className="text-sm font-medium">
                            Garment Type:
                          </label>
                          <select
                            value={garmentType}
                            onChange={(e) =>
                              setGarmentType(e.target.value as Garment)
                            }
                            className="mt-1 w-full p-2 border rounded-md"
                          >
                            <option value="tshirt">T-Shirt</option>
                            <option value="hoodie">Hoodie</option>
                            <option value="polo">Polo</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Color:</label>
                          <Input
                            type="color"
                            value={garmentColor}
                            onChange={(e) => setGarmentColor(e.target.value)}
                            className="mt-1 h-8"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Add Elements */}
                    <div>
                      <h3 className="font-semibold mb-3">Add Elements</h3>
                      <div className="space-y-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleAddUploadLayer}
                          className="hidden"
                          id="layer-upload"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() =>
                            document.getElementById("layer-upload")?.click()
                          }
                        >
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Upload Image
                        </Button>
                        {/* Text UI removed as requested */}

                  <div className="space-y-2">
                          <div className="relative" ref={emojiPickerRef}>
                            <Button variant="outline" size="sm" className="w-full" onClick={() => setShowEmojiPicker((s) => !s)}>
                              {selectedEmoji ? `Emoji: ${selectedEmoji}` : "Add Emoji"}
                            </Button>
                            {showEmojiPicker && (
                              <div className="absolute bottom-full right-0 mb-2 z-50 border rounded-lg shadow-lg bg-background p-2 w-80">
                                {EmojiPicker && (
                                  <EmojiPicker
                                    onEmojiClick={(e: any) => {
                                      const native = e?.emoji || e?.Unicode || undefined;
                                      setSelectedEmoji(native);
                                      setShowEmojiPicker(false);
                                    }}
                                    lazyLoadEmojis
                                    width="100%"
                                    height="400px"
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                  </div>

                    {/* Layers List */}
                    <div>
                      <h3 className="font-semibold mb-3">Layers ({side})</h3>
                      <ScrollArea className="h-32">
                        <div className="space-y-1">
                          {layers
                            .filter((l) => l.side === side)
                            .map((layer, index) => (
                              <DraggableLayerItem
                                key={layer.id}
                                layer={layer}
                                index={index}
                                selected={selectedLayerId === layer.id}
                                onSelect={() => setSelectedLayerId(layer.id)}
                                onRemove={() => removeLayer(layer.id)}
                                onMove={(fromIndex, toIndex) => moveLayer(fromIndex, toIndex)}
                              />
                            ))}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Selected Layer Controls */}
                    {selectedLayerId && (
                      <div>
                        <h3 className="font-semibold mb-3">Transform</h3>
                        <div className="grid grid-cols-2 gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              adjustSelected((l) => ({
                                ...l,
                                scale: l.scale * 1.1,
                              }))
                            }
                          >
                            <Maximize2 className="h-3 w-3 mr-1" />
                            Bigger
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              adjustSelected((l) => ({
                                ...l,
                                scale: Math.max(0.1, l.scale * 0.9),
                              }))
                            }
                          >
                            Smaller
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              adjustSelected((l) => ({
                                ...l,
                                x: l.x + 10,
                              }))
                            }
                          >
                            Move Right
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              adjustSelected((l) => ({
                                ...l,
                                x: Math.max(0, l.x - 10),
                              }))
                            }
                          >
                            Move Left
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (selectedLayerId) {
                                moveLayerById(selectedLayerId, 'up');
                              }
                            }}
                          >
                            Move Up
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (selectedLayerId) {
                                moveLayerById(selectedLayerId, 'down');
                              }
                            }}
                          >
                            Move Down
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              adjustSelected((l) => ({
                                ...l,
                                rotation: l.rotation + 15,
                              }))
                            }
                          >
                            <RotateCw className="h-3 w-3 mr-1" />
                            Rotate
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeLayer(selectedLayerId)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
      </div>
    </div>
  );
}

const quickPrompts = [
  "Design a minimalist t-shirt with geometric patterns",
  "Create a vintage-style hoodie with retro colors",
  "Make a floral dress with summer vibes",
  "Design a streetwear jacket with bold graphics",
];

interface TransformState {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

function DraggableLayer({
  layer,
  zIndex,
  selected,
  onSelect,
  onChange,
}: {
  layer: DesignLayer;
  zIndex: number;
  selected: boolean;
  onSelect: () => void;
  onChange: (l: DesignLayer) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    onSelect();
    setIsDragging(true);
    setDragStart({ x: e.clientX - layer.x, y: e.clientY - layer.y });
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStart) return;
    onChange({
      ...layer,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const onMouseUp = () => setIsDragging(false);

  const baseStyle = {
    transform: `translate(-50%, -50%) translate(${layer.x}px, ${layer.y}px) rotate(${layer.rotation}deg) scale(${layer.scale})`,
    zIndex: zIndex,
  } as React.CSSProperties;

  return (
    <div
      className={`absolute left-1/2 top-1/3 cursor-move ${
        selected ? "ring-2 ring-primary" : ""
      }`}
      style={baseStyle}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {layer.type !== "text" && layer.src && (
        <img
          src={layer.src}
          alt="Layer"
          className="max-w-[320px] w-[40vw] max-h-[320px] object-contain drop-shadow"
        />
      )}
      {layer.type === "text" && (
        <div
          className="select-none"
          style={{
            fontSize: layer.fontSize || 32,
            color: layer.color || "#000000",
          }}
        >
          {layer.text}
        </div>
      )}
    </div>
  );
}

function layerTitle(l: DesignLayer): string {
  if (l.type === "text")
    return l.text ? `Text: ${l.text.slice(0, 12)}` : "Text";
  if (l.type === "icon") 
    return l.text ? `Emoji: ${l.text}` : "Icon";
  return "Image";
}

// presetIcons removed in favor of emoji picker

const newLayerBase = (side: "front" | "back") => ({
  side,
  visible: true,
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0,
});

function DraggableLayerItem({
  layer,
  index,
  selected,
  onSelect,
  onRemove,
  onMove,
}: {
  layer: DesignLayer;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onMove: (fromIndex: number, toIndex: number) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", index.toString());
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const draggedIndex = parseInt(e.dataTransfer.getData("text/plain"));
    if (draggedIndex !== index) {
      onMove(draggedIndex, index);
    }
  };

  return (
    <div
      ref={itemRef}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex items-center gap-2 p-2 rounded text-sm cursor-move select-none ${
        selected
          ? "bg-primary/10 border border-primary/20"
          : "hover:bg-muted"
      } ${
        isDragging ? "opacity-50" : ""
      } ${
        dragOver ? "border-2 border-dashed border-primary" : ""
      }`}
      onClick={onSelect}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      <span className="flex-1 truncate">
        {layerTitle(layer)}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="h-6 w-6 p-0"
      >
        ×
      </Button>
    </div>
  );
}
