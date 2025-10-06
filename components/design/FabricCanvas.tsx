import "@/styles/fabricCanvas.css";
import { Canvas, Image as FabricImage, Text, Textbox, IText } from "fabric"; // v6
import { useRef, useEffect, useCallback } from "react";

interface FabricCanvasProps {
  backgroundImageUrl?: string;
  color?: string;
  text?: {
    value: string;
    fontSize?: number;
    color?: string;
    fontWeight?: "normal" | "bold";
    fontStyle?: "normal" | "italic";
    underline?: boolean;
  };
  emoji?: string;
  imageUrl?: string;
  colors?: string[];
  emojis?: string[];
  onSave?: (dataUrl: string) => void;
  onChange?: (payload: { json: string; dataUrl: string }) => void;
  onLayerAdded?: (layer: { type: 'emoji' | 'text' | 'image'; content: string; id: string }) => void;
  addElement?: () => void;
  deleteElement?: () => void;
  addImageElement?: () => void;
  addTextElement?: () => void;
}

export default function FabricCanvas({
  backgroundImageUrl,
  color,
  text,
  emoji,
  imageUrl,
  colors,
  emojis,
  onSave,
  onChange,
  onLayerAdded,
  addElement: customAddElement,
  deleteElement: customDeleteElement,
  addImageElement: customAddImageElement,
  addTextElement: customAddTextElement,
}: FabricCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastEmojiRef = useRef<string | null>(null);
  const lastTextRef = useRef<string | null>(null);
  const onLayerAddedRef = useRef(onLayerAdded);
  
  // Handle text layers through onLayerAdded callback
  const handleLayerAdded = useCallback((layer: { type: 'emoji' | 'text' | 'image'; content: string; id: string }) => {
    const c = fabricCanvasRef.current;
    if (!c) return;
    
    if (layer.type === 'text') {
      const t = new IText(layer.content, {
        left: c.getWidth() / 2,
        top: c.getHeight() / 2,
        originX: "center",
        originY: "center",
        fontSize: 28,
        fill: "#111827",
        selectable: true, // Allow selection for movement
        evented: true, // Allow events
        hoverCursor: 'text', // Show text cursor on hover
        moveCursor: 'move', // Show move cursor when moving
        borderColor: 'transparent', // Hide border
        cornerColor: 'transparent', // Hide corner handles
        cornerSize: 0, // No corner handles
        transparentCorners: true, // Transparent corners
        borderScaleFactor: 0, // No border
        selectionLineWidth: 0, // No selection line
        hasBorders: false, // No borders
        hasControls: false, // No control handles
        hasRotatingPoint: false, // No rotation handle
        lockMovementX: false, // Allow horizontal movement
        lockMovementY: false, // Allow vertical movement
        lockRotation: true, // Disable rotation
        lockScalingX: true, // Disable horizontal scaling
        lockScalingY: true, // Disable vertical scaling
        editable: true, // Allow inline editing
        cursorColor: '#000000', // Cursor color for editing
        cursorWidth: 1, // Cursor width
        cursorDelay: 1000, // Delay before showing cursor
        cursorDuration: 1000, // How long cursor stays visible
      });
      
      // Apply superscript or subscript if specified
      if ((layer as any).superscript) {
        // Apply superscript to the entire text
        t.setSelectionStyles({ fontSize: 20, deltaY: -10 }, 0, layer.content.length);
      } else if ((layer as any).subscript) {
        // Apply subscript to the entire text
        t.setSelectionStyles({ fontSize: 20, deltaY: 10 }, 0, layer.content.length);
      }
      
      (t as any).name = `text-${layer.id}`;
      c.add(t);
      
      // Ensure no selection border is shown
      c.discardActiveObject();
      c.renderAll();
      
      // Force hide any selection borders after rendering
      setTimeout(() => {
        c.discardActiveObject();
        c.renderAll();
      }, 0);
    }
  }, []);

  // Update ref on every render to ensure it's always current
  onLayerAddedRef.current = onLayerAdded;
  
  // Handle layer added events
  useEffect(() => {
    if (onLayerAddedRef.current) {
      const originalCallback = onLayerAddedRef.current;
      onLayerAddedRef.current = (layer) => {
        handleLayerAdded(layer);
        originalCallback(layer);
      };
    }
  }, [handleLayerAdded]);
  const bgUrl =
    backgroundImageUrl && backgroundImageUrl.trim() !== ""
      ? backgroundImageUrl
      : "/photo.png";

  // Debug: Log the background URL
  console.log("Background URL:", bgUrl);

  // Test if image loads
  useEffect(() => {
    if (bgUrl) {
      const img = new Image();
      img.onload = () => console.log("Background image loaded successfully");
      img.onerror = () =>
        console.error("Failed to load background image:", bgUrl);
      img.src = bgUrl;
    }
  }, [bgUrl]);

  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      fabricCanvasRef.current = new Canvas(canvasRef.current);
            // Match canvas size to container (larger dimensions)
            const cw = containerRef.current?.clientWidth ?? 800;
            const ch = containerRef.current?.clientHeight ?? 1000;
      fabricCanvasRef.current.setWidth(cw);
      fabricCanvasRef.current.setHeight(ch);
      
      // Configure canvas to hide selection borders
      fabricCanvasRef.current.selection = false; // Disable multi-selection
      fabricCanvasRef.current.skipTargetFind = false; // Allow object selection
      fabricCanvasRef.current.preserveObjectStacking = true;
      
      // Hide selection borders using CSS
      const upperCanvas = fabricCanvasRef.current.upperCanvasEl;
      if (upperCanvas) {
        upperCanvas.style.outline = 'none';
        upperCanvas.style.border = 'none';
        upperCanvas.style.boxShadow = 'none';
      }
      
      // Override the selection rendering completely
      (fabricCanvasRef.current as any).renderSelection = function() {
        // Do nothing - completely disable selection rendering
        return;
      };
      // propagate change events
      const c = fabricCanvasRef.current;
      const emitChange = () => {
        if (!c || !onChange) return;
        try {
          const json = JSON.stringify(c.toJSON());
          const dataUrl = c.toDataURL({ format: "png", multiplier: 1 });
          onChange({ json, dataUrl });
        } catch (_) {
          // noop
        }
      };
      c.on("object:added", emitChange);
      c.on("object:modified", emitChange);
      c.on("object:removed", emitChange);
            const onResize = () => {
                const nw = containerRef.current?.clientWidth ?? 800;
                const nh = containerRef.current?.clientHeight ?? 1000;
        fabricCanvasRef.current?.setWidth(nw);
        fabricCanvasRef.current?.setHeight(nh);
        fabricCanvasRef.current?.renderAll();
        emitChange();
      };
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("resize", onResize);
        c.off("object:added", emitChange);
        c.off("object:modified", emitChange);
        c.off("object:removed", emitChange);
      };
    }

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, []);

  // Note: Background color is now applied to the container div instead of the canvas

  // Apply or update a single named emoji object from props
  useEffect(() => {
    const c = fabricCanvasRef.current;
    if (!c || !emoji) return;
    
    const existing = c
      .getObjects()
      .find((o) => (o as any).name === "prop-emoji");
    if (existing) c.remove(existing);
    
    const e = new Text(emoji, {
      left: c.getWidth() / 2,
      top: c.getHeight() / 2,
      originX: "center",
      originY: "center",
      fontSize: 96,
    });
    (e as any).name = "prop-emoji";
    c.add(e);
    c.setActiveObject(e);
    c.renderAll();
    
    // Only emit layer added event when emoji actually changes
    if (onLayerAddedRef.current && emoji && emoji !== lastEmojiRef.current) {
      lastEmojiRef.current = emoji;
      onLayerAddedRef.current({
        type: 'emoji',
        content: emoji,
        id: crypto.randomUUID()
      });
    }
  }, [emoji]); // Removed onLayerAdded from dependencies

  // Apply or update a single named image object from props
  useEffect(() => {
    const c = fabricCanvasRef.current;
    if (!c || !imageUrl) return;
    const existing = c
      .getObjects()
      .find((o) => (o as any).name === "prop-image");
    if (existing) c.remove(existing);
    FabricImage.fromURL(String(imageUrl), {}, (img: FabricImage) => {
      if (!img || !c) return;
      const max = Math.min(c.getWidth(), c.getHeight()) * 0.6;
      img.scaleToWidth(max);
      img.set({
        left: c.getWidth() / 2,
        top: c.getHeight() / 2,
        originX: "center",
        originY: "center",
        // Make movable but without visible selection frame
        selectable: true,
        hasBorders: false,
        hasControls: false,
        hoverCursor: 'move',
        moveCursor: 'move',
      });
      (img as any).name = "prop-image";
      c.add(img);
      // Don't show selection border
      c.discardActiveObject();
      c.renderAll();
    });
  }, [imageUrl]);

  const addElement = () => {
    if (customAddElement) {
      customAddElement();
      return;
    }
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const sampleEmojis =
      emojis && emojis.length > 0
        ? emojis
        : ["😀", "😎", "🍕", "🚀", "🐶", "🌸", "🔥", "🎉"];
    const randomEmoji =
      sampleEmojis[Math.floor(Math.random() * sampleEmojis.length)];

    const emojiText = new Text(randomEmoji, {
      left: Math.random() * 200,
      top: Math.random() * 200,
      fontSize: 60,
    });

    canvas.add(emojiText);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const canvas = fabricCanvasRef.current;
    if (!e.target.files || !canvas) return;

    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File too large! Please select an image under 10MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (jpg, png, gif...).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target?.result;
      if (!data || typeof data !== "string") return;

      FabricImage.fromURL(data, {}, (img: FabricImage) => {
        if (!img || !canvas) return;
        img.scaleToWidth(200);
        img.set({
          left: Math.random() * 200,
          top: Math.random() * 200,
          selectable: true,
          hasBorders: false,
          hasControls: false,
          hoverCursor: 'move',
          moveCursor: 'move',
        });
        canvas.add(img);
        canvas.discardActiveObject();
        canvas.renderAll();
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const addImageElement = () => {
    if (customAddImageElement) {
      customAddImageElement();
      return;
    }
    const input = fileInputRef.current;
    if (input) input.click();
  };

  const addTextElement = () => {
    if (customAddTextElement) {
      customAddTextElement();
      return;
    }
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const text = new Textbox("Hello Fabric.js!", {
      left: 150,
      top: 150,
      fontSize: 24,
      fill: colors && colors[0] ? colors[0] : "#333",
      fontFamily: "Arial",
    });

    canvas.add(text);
  };

  const deleteElement = () => {
    if (customDeleteElement) {
      customDeleteElement();
      return;
    }
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
    }
  };

  const saveCanvas = () => {
    const canvas = fabricCanvasRef.current;
    if (canvas && onSave) {
      onSave(canvas.toDataURL());
    }
  };

  return (
    <div
      ref={containerRef}
      className="fabric-container"
      style={{
        backgroundImage: bgUrl ? `url(${bgUrl})` : "none",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
        backgroundSize: "cover",
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "800px",
        userSelect: "none",
        backgroundColor: color || "#ffffff",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "transparent",
          zIndex: 1,
        }}
      />
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*"
        onChange={handleImageUpload}
      />
    </div>
  );
}
