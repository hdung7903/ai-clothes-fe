"use client";

import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { createOrUpdateProductDesign } from "@/services/productDesignServices";
import {
  getTemplateById,
  getTemplatesByProduct,
} from "@/services/templateServices";
import { uploadImage } from "@/services/storageService";
import { getSampleImages, type SampleImage } from "@/services/sampleImageService";
import { toast } from "sonner";
import {
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  MoveUp,
  MoveDown,
  Upload,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";
import type { CreateOrUpdateProductDesignRequest } from "@/types/productDesign";
import { useSearchParams, useRouter } from "next/navigation";

// Types
interface ShirtColor {
  hex: string;
}

interface BaseDecoration {
  id: number;
  x: number;
  y: number;
  rotation: number;
  visible: boolean;
  locked: boolean;
  shadow: boolean;
  opacity: number;
  name: string;
}

interface ImageDecoration extends BaseDecoration {
  type: "image";
  imageUrl: string;
  width: number;
  height: number;
  originalAspectRatio: number; // Store original image aspect ratio
  imageElement?: HTMLImageElement;
  sampleImageId?: string; // Store shop photo ID if this is a shop photo
}

type Decoration = ImageDecoration;

interface PrintArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Bounds {
  width: number;
  height: number;
}

interface ResizeState {
  startX: number;
  startY: number;
  startSize: number;
  handlePosition: 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left' | 'top' | 'right' | 'bottom' | 'left';
  startWidth: number;
  startHeight: number;
  startDecorationX: number;
  startDecorationY: number;
}

// Interface cho ref methods
export interface CanvasRef {
  addImageDecoration: (imageUrl: string, imageName: string, imageId?: string) => void;
}

interface TShirtDesignerProps {
  imageUrl?: string;
  designType?: "tshirt" | "hoodie" | "polo" | "tank" | "longsleeve" | "custom";
  productId?: string;
  productOptionValueId?: string;
  designName?: string;
  onImageChange?: (newImageUrl: string) => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

type Side = "front" | "back" | "leftSleeve" | "rightSleeve";

const TShirtDesigner = forwardRef<CanvasRef, TShirtDesignerProps>(
  (
    {
      imageUrl,
      designType: initialDesignType = "tshirt",
  productId,
  productOptionValueId,
  designName,
      onImageChange,
      onLoadingChange,
    },
    ref
  ) => {
  const searchParams = useSearchParams();
    const router = useRouter();
    const templateIdFromUrl = searchParams?.get("templateId") || undefined;
    const productIdFromUrl = searchParams?.get("productId") || undefined;
    const productOptionValueIdFromUrl =
      searchParams?.get("productOptionValueId") || undefined;
    const [resolvedProductId, setResolvedProductId] = useState<
      string | undefined
    >(productIdFromUrl || productId);
    const [resolvedProductOptionValueId, setResolvedProductOptionValueId] =
      useState<string | undefined>(
        productOptionValueIdFromUrl || productOptionValueId
      );
    const [shirtImage, setShirtImage] = useState<string>("");
  const [designType, setDesignType] = useState(initialDesignType);
    const [currentSide, setCurrentSide] = useState<Side>("front");
    const [shirtImageBySide, setShirtImageBySide] = useState<
      Record<Side, string>
    >({
      front: "",
      back: "",
      leftSleeve: "",
      rightSleeve: "",
    });
    const prevSideRef = useRef<Side>("front");
    const [resolvedTemplateId, setResolvedTemplateId] = useState<
      string | undefined
    >(templateIdFromUrl);
    const isSwitchingSideRef = useRef(false);
    const isCapturingCanvasRef = useRef(false); // Flag to track canvas capture process
    const lastDrawTimeRef = useRef<number>(0); // For throttling canvas redraws
    const backgroundImageCache = useRef<HTMLImageElement | null>(null); // Cache background image
    const currentBackgroundUrl = useRef<string>(""); // Track current background URL
  
  const [decorations, setDecorations] = useState<Decoration[]>([]);
    const [sideDecorations, setSideDecorations] = useState<
      Record<Side, Decoration[]>
    >({
    front: [],
    back: [],
    leftSleeve: [],
    rightSleeve: [],
  });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState<ResizeState | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [canvasCursor, setCanvasCursor] = useState<string>('default');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(false);
  const [savingDesign, setSavingDesign] = useState(false);
    const [lastClickPosition, setLastClickPosition] = useState<{
      x: number;
      y: number;
    } | null>(null);
  const [clickCount, setClickCount] = useState(0);
    const [imageLoading, setImageLoading] = useState(false);
  
  // Performance optimization refs
  const rafIdRef = useRef<number | null>(null); // RequestAnimationFrame ID
  const isDraggingRef = useRef(false); // Track dragging without triggering re-render
  
  // Image library states
  const [uploadedImages, setUploadedImages] = useState<Array<{url: string, name: string}>>([]);
  const [suggestedImages, setSuggestedImages] = useState<Array<{id?: string, url: string, name: string}>>([]);
  const [loadingSampleImages, setLoadingSampleImages] = useState(false);
  
  // Track which sides actually have template images returned from API
    const [sideHasTemplate, setSideHasTemplate] = useState<
      Record<Side, boolean>
    >({
    front: false,
    back: false,
    leftSleeve: false,
    rightSleeve: false,
  });
  
    // Track the order of sides based on API response
    const [sideOrder, setSideOrder] = useState<Side[]>([]);
    
    // Store template IDs for each side from API response
    const [sideTemplateIds, setSideTemplateIds] = useState<Record<Side, string | null>>({
      front: null,
      back: null,
      leftSleeve: null,
      rightSleeve: null,
    });
  
    // Dialog state for missing product params
    const [showMissingParamsDialog, setShowMissingParamsDialog] =
      useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const printAreaRef = useRef<PrintArea>({
      x: 107.5,
      y: 107.5,
      width: 400,
      height: 400,
    });

    const selectedDecoration = decorations.find((d) => d.id === selectedId);

  // Get design type label
  const getDesignTypeLabel = () => {
      switch (designType) {
        case "tshirt":
          return "Áo Thun";
        case "hoodie":
          return "Áo Hoodie";
        case "polo":
          return "Áo Polo";
        case "tank":
          return "Áo Tank Top";
        case "longsleeve":
          return "Áo Dài Tay";
        case "custom":
          return "Trang Phục";
        default:
          return "Quần Áo";
      }
    };

    // Helper function to map printAreaName to side
    const mapPrintAreaToSide = (
      printAreaName: string,
      index: number = 0
    ): Side => {
      const name = printAreaName?.toLowerCase().trim() || "";

      // Exact matching for Vietnamese printAreaName from API
      if (name === "mặt trước" || name === "front") {
        return "front";
      } else if (name === "mặt sau" || name === "back") {
        return "back";
      } else if (
        name === "tay trái" ||
        name === "left sleeve" ||
        name === "left"
      ) {
        return "leftSleeve";
      } else if (
        name === "tay phải" ||
        name === "right sleeve" ||
        name === "right"
      ) {
        return "rightSleeve";
      }

      // Fallback to partial matching for variations
      if (
        name.includes("mặt trước") ||
        name.includes("front") ||
        name.includes("trước") ||
        name.includes("chest") ||
        name.includes("ngực") ||
        name.includes("breast")
      ) {
        return "front";
      } else if (
        name.includes("mặt sau") ||
        name.includes("back") ||
        name.includes("sau") ||
        name.includes("rear") ||
        name.includes("lưng") ||
        name.includes("spine")
      ) {
        return "back";
      } else if (
        name.includes("tay trái") ||
        name.includes("left") ||
        name.includes("left sleeve") ||
        name.includes("cánh tay trái") ||
        name.includes("left arm")
      ) {
        return "leftSleeve";
      } else if (
        name.includes("tay phải") ||
        name.includes("right") ||
        name.includes("right sleeve") ||
        name.includes("cánh tay phải") ||
        name.includes("right arm")
      ) {
        return "rightSleeve";
      }

      // If no specific side found, try to infer from index
      const fallbackSides: Side[] = [
        "front",
        "back",
        "leftSleeve",
        "rightSleeve",
      ];
      const fallbackSide = fallbackSides[index] || "front";
      return fallbackSide;
    };

    // Effect to handle initial imageUrl prop
  useEffect(() => {
      if (imageUrl) {
        setShirtImage(imageUrl);
        setShirtImageBySide((prev) => ({
          ...prev,
          [currentSide]: imageUrl,
        }));
      }
    }, []);

    // Effect to check if product params are missing
    useEffect(() => {
      const hasProductParams =
        resolvedProductId && resolvedProductOptionValueId;
      const hasImageUrlProp = imageUrl;

      // Show dialog if no product params and no imageUrl prop
      if (!hasProductParams && !hasImageUrlProp) {
        setShowMissingParamsDialog(true);
      } else {
        setShowMissingParamsDialog(false);
      }
    }, [resolvedProductId, resolvedProductOptionValueId, imageUrl]);

    // Effect to handle imageUrl prop changes
    useEffect(() => {
      if (imageUrl && imageUrl !== shirtImage) {
        setImageLoading(true);
        onLoadingChange?.(true);
        setShirtImage(imageUrl);
        setShirtImageBySide((prev) => ({
          ...prev,
          [currentSide]: imageUrl,
        }));
      }
    }, [imageUrl]);

    useEffect(() => {
      // Don't load image if shirtImage is empty or if missing product params
      if (!shirtImage || shirtImage === "") {
        return;
      }

      // Don't load image if missing required params
      const hasProductParams =
        resolvedProductId && resolvedProductOptionValueId;
      const hasImageUrlProp = imageUrl;
      if (!hasProductParams && !hasImageUrlProp) {
        return;
      }

      setImageLoading(true);
      onLoadingChange?.(true);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImageLoaded(true);
        setImageLoading(false);
        onLoadingChange?.(false);
    };
    img.onerror = () => {
        console.error("Không thể tải hình ảnh:", shirtImage);
        img.src = "https://i.imgur.com/5QKxXXp.png";
    };
    img.src = shirtImage;
  }, [shirtImage]);

  // Switch base image when side changes
  useEffect(() => {
      const sideImage = shirtImageBySide[currentSide];
      // Always switch to the side image, even if it's empty
      if (sideImage !== shirtImage) {
        setShirtImage(sideImage);
      }
  }, [currentSide, shirtImageBySide]);

  // Load sample images from server
  const loadSampleImages = async () => {
    setLoadingSampleImages(true);
    try {
      const response = await getSampleImages();
      if (response.success && response.data) {
        const formattedImages = response.data.map((image: SampleImage, index: number) => {
          console.log(`Sample image ${index + 1}:`, image.imageUrl);
          return {
            id: image.sampleImageId, // Preserve the original ID
            url: image.imageUrl,
            name: `Ảnh mẫu ${index + 1}`
          };
        });
        setSuggestedImages(formattedImages);
        console.log("Formatted sample images:", formattedImages);
      }
    } catch (error) {
      console.error("Error loading sample images:", error);
      toast.error("Không thể tải ảnh mẫu từ server");
    } finally {
      setLoadingSampleImages(false);
    }
  };

  // Load sample images on component mount
  useEffect(() => {
    loadSampleImages();
  }, []);

  // Persist decorations per side when switching
  useEffect(() => {
    const prevSide = prevSideRef.current;
    if (prevSide !== currentSide) {
        // Skip if we're capturing canvas to prevent corruption
        if (isCapturingCanvasRef.current) {
          console.log('⏸️ SKIPPING side switch save - capturing canvas');
          prevSideRef.current = currentSide;
          return;
        }
        
        console.log('🔄 SIDE SWITCH: Switching from side:', prevSide, 'to side:', currentSide);
        console.log('📊 Current decorations before switch:', decorations.length, 'decorations');
        decorations.forEach(d => console.log(`  - ${d.name} (ID: ${d.id})`));
        
        // Save current decorations to previous side ONLY
        setSideDecorations(prev => {
          const updated = { ...prev, [prevSide]: [...decorations] }; // Use spread to create new array
          console.log('💾 Saved decorations to', prevSide, ':', updated[prevSide].length, 'decorations');
          console.log('📊 Side decorations summary after save:', {
            front: updated.front.length,
            back: updated.back.length,
            leftSleeve: updated.leftSleeve.length,
            rightSleeve: updated.rightSleeve.length,
          });
          return updated;
        });
        
        // Load decorations for new side
        const newSideDecorations = sideDecorations[currentSide] || [];
        console.log('📂 Loading decorations for new side:', currentSide, '-', newSideDecorations.length, 'decorations');
        newSideDecorations.forEach(d => console.log(`  - ${d.name} (ID: ${d.id})`));
        setDecorations(newSideDecorations);
      setSelectedId(null);
        
        // CRITICAL FIX: Always update base image when switching sides
        const sideImage = shirtImageBySide[currentSide];
        console.log('🖼️ Force updating base image for new side:', currentSide, 'to:', sideImage ? sideImage.substring(0, 50) + '...' : 'EMPTY');
        // Set immediately without condition to ensure proper update
        setShirtImage(sideImage);
        
      prevSideRef.current = currentSide;
        console.log('✅ SIDE SWITCH COMPLETE');
    }
  }, [currentSide]);
  // If templateId is provided, fetch template detail to resolve product context and base image
  useEffect(() => {
    const resolveFromTemplate = async () => {
      const tid = resolvedTemplateId;
      if (!tid) return;
      try {
        const res = await getTemplateById(tid);
        const data: any = (res as any)?.data ?? (res as any);
        if (data) {
          const pid = data.productId || data.product?.id;
            const pov =
              data.productOptionValueId || data.productOptionValueDetail?.id;
          const img = data.imageUrl;
          if (pid) setResolvedProductId(pid);
          if (pov) setResolvedProductOptionValueId(pov);
          if (img) {
              setShirtImageBySide((prev) => ({ ...prev, [currentSide]: img }));
            setShirtImage(img);
              onImageChange?.(img);
          }
        }
      } catch (e) {
          console.error("Failed to load template by id", e);
      }
    };
    resolveFromTemplate();
    }, [resolvedTemplateId, currentSide, onImageChange]);

    // Load templates from API and set base images for all sides
  useEffect(() => {
      const loadTemplates = async () => {
        // Only load from API if we have product params and no imageUrl prop
        if (!resolvedProductId || !resolvedProductOptionValueId || imageUrl) {
          return;
        }

        try {
          const response = await getTemplatesByProduct(
            resolvedProductId,
            resolvedProductOptionValueId
          );
        
        const items = (response as any)?.data ?? [];

          // Initialize with empty strings for all sides
          const newShirtImageBySide = {
            front: "",
            back: "",
            leftSleeve: "",
            rightSleeve: "",
          };
          const newSideHasTemplate = {
            front: false,
            back: false,
            leftSleeve: false,
            rightSleeve: false,
          };
          const newSideTemplateIds = {
            front: null,
            back: null,
            leftSleeve: null,
            rightSleeve: null,
          };
        
        if (!Array.isArray(items) || items.length === 0) {
            setShirtImageBySide(newShirtImageBySide);
            setSideHasTemplate(newSideHasTemplate);
          return;
        }

          // Process all template items and map them to appropriate sides
          // Create a mapping array to track the order of sides based on API response
          const sideOrder: Side[] = [];
          let firstTemplateSet = false;

          // Process items in the exact order they come from API
          items.forEach((item: any, index: number) => {
            if (!item?.imageUrl) return;

            // Use helper function to map printAreaName to side
            const targetSide = mapPrintAreaToSide(
              item.printAreaName || "",
              index
            );
          
          // Set the template image for the target side
            newShirtImageBySide[targetSide] = item.imageUrl;
            newSideHasTemplate[targetSide] = true;
            newSideTemplateIds[targetSide] = item.id || item.templateId || null;

            // Track the order of sides based on API response order
            // This ensures tabs appear in the same order as API response
            sideOrder.push(targetSide);

            // Set the first template as the current display
            if (!firstTemplateSet) {
              setCurrentSide(targetSide);
              setShirtImage(item.imageUrl);
              onImageChange?.(item.imageUrl);
              firstTemplateSet = true;
            }
          });

          // Update state with all template mappings
          setShirtImageBySide(newShirtImageBySide);
          setSideHasTemplate(newSideHasTemplate);
          setSideTemplateIds(newSideTemplateIds);
          setSideOrder(sideOrder);
      } catch (error) {
          console.error("Error loading templates:", error);
          // Keep empty state on API error
          setShirtImageBySide({
            front: "",
            back: "",
            leftSleeve: "",
            rightSleeve: "",
          });
          setSideHasTemplate({
            front: false,
            back: false,
            leftSleeve: false,
            rightSleeve: false,
          });
        }
      };

      loadTemplates();
    }, [
      resolvedProductId,
      resolvedProductOptionValueId,
      imageUrl,
      onImageChange,
    ]);

  const drawCanvas = (forceSelectedId?: number | null) => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded) return;
    
    // Use the current shirtImage instead of imageRef.current
    if (!shirtImage) return;
    
    const ctx = canvas.getContext("2d", { 
      alpha: false, // Disable alpha for better performance
      desynchronized: true // Allow async rendering
    });
    if (!ctx) return;
    
    // Use forced selectedId if provided, otherwise use state
    const currentSelectedId = forceSelectedId !== undefined ? forceSelectedId : selectedId;
    
    // Use cached background image if URL hasn't changed
    if (currentBackgroundUrl.current !== shirtImage) {
      // Load new background image
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        backgroundImageCache.current = img;
        currentBackgroundUrl.current = shirtImage;
        renderCanvasContent(ctx, canvas, img, currentSelectedId);
      };
      img.onerror = () => {
        console.error("Không thể tải hình ảnh cho canvas:", shirtImage);
      };
      img.src = shirtImage;
    } else if (backgroundImageCache.current) {
      // Use cached image for instant rendering
      renderCanvasContent(ctx, canvas, backgroundImageCache.current, currentSelectedId);
    }
  };
  
  // Separate rendering function for better performance
  const renderCanvasContent = (
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement, 
    backgroundImg: HTMLImageElement,
    currentSelectedId: number | null = null
  ) => {
    // Clear and draw background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
    
      // Draw decorations on top
      decorations.forEach((dec, index) => {
      if (!dec.visible) return;
      
      ctx.save();
      ctx.translate(dec.x, dec.y);
        ctx.rotate((dec.rotation * Math.PI) / 180);
      ctx.globalAlpha = dec.opacity || 1;
      
        if (dec.type === "image" && dec.imageElement) {
        if (dec.shadow) {
            ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 3;
          ctx.shadowOffsetY = 3;
        }
        
        ctx.drawImage(
          dec.imageElement,
          -dec.width / 2,
          -dec.height / 2,
          dec.width,
          dec.height
        );
      }
      
      if (dec.id === currentSelectedId) {
          ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
          ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 4]);
        const bounds = getDecorationBounds(dec);
          ctx.strokeRect(
            -bounds.width / 2,
            -bounds.height / 2,
            bounds.width,
            bounds.height
          );
        drawResizeHandles(ctx, bounds);
      }
      
      ctx.restore();
    });
  };

    const drawResizeHandles = (
      ctx: CanvasRenderingContext2D,
      bounds: Bounds
    ) => {
    const handleSize = 10;
    
    // Corner handles for proportional scaling
    const cornerHandles = [
      { x: -bounds.width / 2, y: -bounds.height / 2, position: 'top-left' },
      { x: bounds.width / 2, y: -bounds.height / 2, position: 'top-right' },
      { x: bounds.width / 2, y: bounds.height / 2, position: 'bottom-right' },
      { x: -bounds.width / 2, y: bounds.height / 2, position: 'bottom-left' },
    ];
    
    // Edge handles for width/height only scaling
    const edgeHandles = [
      { x: 0, y: -bounds.height / 2, position: 'top' },
      { x: bounds.width / 2, y: 0, position: 'right' },
      { x: 0, y: bounds.height / 2, position: 'bottom' },
      { x: -bounds.width / 2, y: 0, position: 'left' },
    ];
    
    ctx.setLineDash([]);
    ctx.lineWidth = 2;
    
    // Draw corner handles (squares)
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#3b82f6";
    cornerHandles.forEach((h) => {
      ctx.fillRect(
        h.x - handleSize / 2,
        h.y - handleSize / 2,
        handleSize,
        handleSize
      );
      ctx.strokeRect(
        h.x - handleSize / 2,
        h.y - handleSize / 2,
        handleSize,
        handleSize
      );
    });
    
    // Draw edge handles (circles)
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#10b981";
    edgeHandles.forEach((h) => {
      ctx.beginPath();
      ctx.arc(h.x, h.y, handleSize / 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    });
  };

  const getDecorationBounds = (dec: Decoration): Bounds => {
      if (dec.type === "image") {
      return { width: dec.width, height: dec.height };
    }
    return { width: 50, height: 50 };
  };

  const getCursorForHandle = (position: string): string => {
    switch (position) {
      case 'top-left':
      case 'bottom-right':
        return 'nw-resize';
      case 'top-right':
      case 'bottom-left':
        return 'ne-resize';
      case 'top':
      case 'bottom':
        return 'n-resize';
      case 'left':
      case 'right':
        return 'e-resize';
      default:
        return 'default';
    }
  };
  
  // Debug function để kiểm tra collision
    const isPointInDecoration = (
      x: number,
      y: number,
      dec: Decoration
    ): boolean => {
    const bounds = getDecorationBounds(dec);
    const dx = x - dec.x;
    const dy = y - dec.y;
      const isInside =
        Math.abs(dx) <= bounds.width / 2 && Math.abs(dy) <= bounds.height / 2;
    
    return isInside;
  };

  useEffect(() => {
    if (imageLoaded && shirtImage) {
      // Remove requestAnimationFrame - direct call for better performance
      drawCanvas();
    }
  }, [decorations, selectedId, imageLoaded, shirtImage]);
  
  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Kiểm tra xem có phải click ở cùng vị trí không (để cycle qua decorations)
      const isSamePosition =
        lastClickPosition &&
      Math.abs(x - lastClickPosition.x) < 5 && 
      Math.abs(y - lastClickPosition.y) < 5;
    
    if (isSamePosition) {
        setClickCount((prev) => prev + 1);
    } else {
      setClickCount(1);
      setLastClickPosition({ x, y });
    }
    
    // Tìm tất cả decorations có thể click được tại vị trí này
    const clickableDecorations = decorations
      .map((dec, index) => ({ dec, index }))
      .filter(({ dec }) => !dec.locked && dec.visible)
      .filter(({ dec }) => isPointInDecoration(x, y, dec));
    
    if (clickableDecorations.length > 0) {
      // Nếu có nhiều decorations và click nhiều lần, cycle qua chúng
      let selectedIndex;
      if (clickableDecorations.length > 1 && isSamePosition) {
        selectedIndex = (clickCount - 1) % clickableDecorations.length;
      } else {
        // Chọn decoration có z-index cao nhất (index cao nhất trong mảng)
        selectedIndex = clickableDecorations.length - 1;
      }
      
      const { dec, index } = clickableDecorations[selectedIndex];
      setSelectedId(dec.id);
      
      // Kiểm tra resize handles trước
      const bounds = getDecorationBounds(dec);
      const handleSize = 10;
      
      // Corner handles for proportional scaling
      const cornerHandles = [
        { x: dec.x - bounds.width / 2, y: dec.y - bounds.height / 2, position: 'top-left' as const },
        { x: dec.x + bounds.width / 2, y: dec.y - bounds.height / 2, position: 'top-right' as const },
        { x: dec.x + bounds.width / 2, y: dec.y + bounds.height / 2, position: 'bottom-right' as const },
        { x: dec.x - bounds.width / 2, y: dec.y + bounds.height / 2, position: 'bottom-left' as const },
      ];
      
      // Edge handles for width/height only scaling
      const edgeHandles = [
        { x: dec.x, y: dec.y - bounds.height / 2, position: 'top' as const },
        { x: dec.x + bounds.width / 2, y: dec.y, position: 'right' as const },
        { x: dec.x, y: dec.y + bounds.height / 2, position: 'bottom' as const },
        { x: dec.x - bounds.width / 2, y: dec.y, position: 'left' as const },
      ];
      
      let isResizeHandle = false;
      
      // Check corner handles first
      for (const handle of cornerHandles) {
        if (
          Math.abs(x - handle.x) <= handleSize &&
          Math.abs(y - handle.y) <= handleSize
        ) {
          setResizing({ 
            startX: x, 
            startY: y, 
            startSize: dec.width,
            handlePosition: handle.position,
            startWidth: dec.width,
            startHeight: dec.height,
            startDecorationX: dec.x,
            startDecorationY: dec.y
          });
          isResizeHandle = true;
          break;
        }
      }
      
      // If no corner handle, check edge handles
      if (!isResizeHandle) {
        for (const handle of edgeHandles) {
          if (
            Math.abs(x - handle.x) <= handleSize &&
            Math.abs(y - handle.y) <= handleSize
          ) {
            setResizing({ 
              startX: x, 
              startY: y, 
              startSize: dec.width,
              handlePosition: handle.position,
              startWidth: dec.width,
              startHeight: dec.height,
              startDecorationX: dec.x,
              startDecorationY: dec.y
            });
            isResizeHandle = true;
            break;
          }
        }
      }
      
      if (!isResizeHandle) {
        // Nếu không phải resize handle thì bắt đầu drag
        const dx = x - dec.x;
        const dy = y - dec.y;
        setDragging(true);
        setDragOffset({ x: dx, y: dy });
      }
    } else {
      // Nếu không click vào decoration nào thì bỏ chọn
      setSelectedId(null);
      setClickCount(0);
      setLastClickPosition(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update cursor based on hover position when not dragging/resizing
    if (!dragging && !resizing && selectedId !== null) {
      const selectedDec = decorations.find(d => d.id === selectedId);
      if (selectedDec) {
        const bounds = getDecorationBounds(selectedDec);
        const handleSize = 10;
        
        // Check all handles for cursor update
        const allHandles = [
          { x: selectedDec.x - bounds.width / 2, y: selectedDec.y - bounds.height / 2, position: 'top-left' },
          { x: selectedDec.x + bounds.width / 2, y: selectedDec.y - bounds.height / 2, position: 'top-right' },
          { x: selectedDec.x + bounds.width / 2, y: selectedDec.y + bounds.height / 2, position: 'bottom-right' },
          { x: selectedDec.x - bounds.width / 2, y: selectedDec.y + bounds.height / 2, position: 'bottom-left' },
          { x: selectedDec.x, y: selectedDec.y - bounds.height / 2, position: 'top' },
          { x: selectedDec.x + bounds.width / 2, y: selectedDec.y, position: 'right' },
          { x: selectedDec.x, y: selectedDec.y + bounds.height / 2, position: 'bottom' },
          { x: selectedDec.x - bounds.width / 2, y: selectedDec.y, position: 'left' },
        ];
        
        let newCursor = 'default';
        for (const handle of allHandles) {
          if (Math.abs(x - handle.x) <= handleSize && Math.abs(y - handle.y) <= handleSize) {
            newCursor = getCursorForHandle(handle.position);
            break;
          }
        }
        
        // Check if over decoration body for move cursor
        if (newCursor === 'default') {
          const dx = x - selectedDec.x;
          const dy = y - selectedDec.y;
          if (Math.abs(dx) <= bounds.width / 2 && Math.abs(dy) <= bounds.height / 2) {
            newCursor = 'move';
          }
        }
        
        setCanvasCursor(newCursor);
      }
    }
    
    if (resizing && selectedId !== null) {
      const dx = x - resizing.startX;
      const dy = y - resizing.startY;
      
      // Update directly for better performance - removed requestAnimationFrame
      setDecorations((prevDecorations) =>
        prevDecorations.map((d) => {
          if (d.id === selectedId && d.type === "image") {
            const { handlePosition, startWidth, startHeight, startDecorationX, startDecorationY } = resizing;
            let newWidth = startWidth;
            let newHeight = startHeight;
            let newX = startDecorationX;
            let newY = startDecorationY;
              
              // Calculate new dimensions based on handle position
              switch (handlePosition) {
                case 'top-left':
                  newWidth = Math.max(20, startWidth - dx);
                  if (maintainAspectRatio) {
                    newHeight = newWidth / d.originalAspectRatio;
                  } else {
                    newHeight = Math.max(20, startHeight - dy);
                  }
                  newX = startDecorationX + dx / 2;
                  newY = startDecorationY + (maintainAspectRatio ? (startHeight - newHeight) / 2 : dy / 2);
                  break;
                  
                case 'top-right':
                  newWidth = Math.max(20, startWidth + dx);
                  if (maintainAspectRatio) {
                    newHeight = newWidth / d.originalAspectRatio;
                  } else {
                    newHeight = Math.max(20, startHeight - dy);
                  }
                  newX = startDecorationX + dx / 2;
                  newY = startDecorationY + (maintainAspectRatio ? (startHeight - newHeight) / 2 : dy / 2);
                  break;
                  
                case 'bottom-right':
                  newWidth = Math.max(20, startWidth + dx);
                  if (maintainAspectRatio) {
                    newHeight = newWidth / d.originalAspectRatio;
                  } else {
                    newHeight = Math.max(20, startHeight + dy);
                  }
                  newX = startDecorationX + dx / 2;
                  newY = startDecorationY + (maintainAspectRatio ? (newHeight - startHeight) / 2 : dy / 2);
                  break;
                  
                case 'bottom-left':
                  newWidth = Math.max(20, startWidth - dx);
                  if (maintainAspectRatio) {
                    newHeight = newWidth / d.originalAspectRatio;
                  } else {
                    newHeight = Math.max(20, startHeight + dy);
                  }
                  newX = startDecorationX + dx / 2;
                  newY = startDecorationY + (maintainAspectRatio ? (newHeight - startHeight) / 2 : dy / 2);
                  break;
                  
                case 'top':
                  newHeight = Math.max(20, startHeight - dy);
                  if (maintainAspectRatio) {
                    newWidth = newHeight * d.originalAspectRatio;
                    newX = startDecorationX + (newWidth - startWidth) / 2;
                  }
                  newY = startDecorationY + dy / 2;
                  break;
                  
                case 'right':
                  newWidth = Math.max(20, startWidth + dx);
                  if (maintainAspectRatio) {
                    newHeight = newWidth / d.originalAspectRatio;
                    newY = startDecorationY + (newHeight - startHeight) / 2;
                  }
                  newX = startDecorationX + dx / 2;
                  break;
                  
                case 'bottom':
                  newHeight = Math.max(20, startHeight + dy);
                  if (maintainAspectRatio) {
                    newWidth = newHeight * d.originalAspectRatio;
                    newX = startDecorationX + (newWidth - startWidth) / 2;
                  }
                  newY = startDecorationY + dy / 2;
                  break;
                  
                case 'left':
                  newWidth = Math.max(20, startWidth - dx);
                  if (maintainAspectRatio) {
                    newHeight = newWidth / d.originalAspectRatio;
                    newY = startDecorationY + (newHeight - startHeight) / 2;
                  }
                  newX = startDecorationX + dx / 2;
                  break;
              }
              
              return { 
                ...d, 
                width: newWidth,
                height: newHeight,
                x: newX,
                y: newY
              };
            }
            return d;
          })
        );
    } else if (dragging && selectedId !== null) {
      const newX = x - dragOffset.x;
      const newY = y - dragOffset.y;

      // Use RAF to batch updates and prevent excessive re-renders
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      
      rafIdRef.current = requestAnimationFrame(() => {
        setDecorations((prevDecorations) =>
          prevDecorations.map((d) =>
            d.id === selectedId ? { ...d, x: newX, y: newY } : d
          )
        );
      });
    }
  };

  // Thêm global mouse move listener để đảm bảo drag hoạt động
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (resizing && selectedId !== null) {
        const dx = x - resizing.startX;
        const dy = y - resizing.startY;
        
        // Use requestAnimationFrame for smooth updates
        requestAnimationFrame(() => {
          setDecorations((prevDecorations) =>
            prevDecorations.map((d) => {
              if (d.id === selectedId && d.type === "image") {
                const { handlePosition, startWidth, startHeight, startDecorationX, startDecorationY } = resizing;
                let newWidth = startWidth;
                let newHeight = startHeight;
                let newX = startDecorationX;
                let newY = startDecorationY;
                
                // Calculate new dimensions based on handle position
                switch (handlePosition) {
                  case 'top-left':
                    newWidth = Math.max(20, startWidth - dx);
                    if (maintainAspectRatio) {
                      newHeight = newWidth / d.originalAspectRatio;
                    } else {
                      newHeight = Math.max(20, startHeight - dy);
                    }
                    newX = startDecorationX + dx / 2;
                    newY = startDecorationY + (maintainAspectRatio ? (startHeight - newHeight) / 2 : dy / 2);
                    break;
                    
                  case 'top-right':
                    newWidth = Math.max(20, startWidth + dx);
                    if (maintainAspectRatio) {
                      newHeight = newWidth / d.originalAspectRatio;
                    } else {
                      newHeight = Math.max(20, startHeight - dy);
                    }
                    newX = startDecorationX + dx / 2;
                    newY = startDecorationY + (maintainAspectRatio ? (startHeight - newHeight) / 2 : dy / 2);
                    break;
                    
                  case 'bottom-right':
                    newWidth = Math.max(20, startWidth + dx);
                    if (maintainAspectRatio) {
                      newHeight = newWidth / d.originalAspectRatio;
                    } else {
                      newHeight = Math.max(20, startHeight + dy);
                    }
                    newX = startDecorationX + dx / 2;
                    newY = startDecorationY + (maintainAspectRatio ? (newHeight - startHeight) / 2 : dy / 2);
                    break;
                    
                  case 'bottom-left':
                    newWidth = Math.max(20, startWidth - dx);
                    if (maintainAspectRatio) {
                      newHeight = newWidth / d.originalAspectRatio;
                    } else {
                      newHeight = Math.max(20, startHeight + dy);
                    }
                    newX = startDecorationX + dx / 2;
                    newY = startDecorationY + (maintainAspectRatio ? (newHeight - startHeight) / 2 : dy / 2);
                    break;
                    
                  case 'top':
                    newHeight = Math.max(20, startHeight - dy);
                    if (maintainAspectRatio) {
                      newWidth = newHeight * d.originalAspectRatio;
                      newX = startDecorationX + (newWidth - startWidth) / 2;
                    }
                    newY = startDecorationY + dy / 2;
                    break;
                    
                  case 'right':
                    newWidth = Math.max(20, startWidth + dx);
                    if (maintainAspectRatio) {
                      newHeight = newWidth / d.originalAspectRatio;
                      newY = startDecorationY + (newHeight - startHeight) / 2;
                    }
                    newX = startDecorationX + dx / 2;
                    break;
                    
                  case 'bottom':
                    newHeight = Math.max(20, startHeight + dy);
                    if (maintainAspectRatio) {
                      newWidth = newHeight * d.originalAspectRatio;
                      newX = startDecorationX + (newWidth - startWidth) / 2;
                    }
                    newY = startDecorationY + dy / 2;
                    break;
                    
                  case 'left':
                    newWidth = Math.max(20, startWidth - dx);
                    if (maintainAspectRatio) {
                      newHeight = newWidth / d.originalAspectRatio;
                      newY = startDecorationY + (newHeight - startHeight) / 2;
                    }
                    newX = startDecorationX + dx / 2;
                    break;
                }
                
                return { 
                  ...d, 
                  width: newWidth,
                  height: newHeight,
                  x: newX,
                  y: newY
                };
              }
              return d;
            })
          );
        });
      } else if (dragging && selectedId !== null) {
        const newX = x - dragOffset.x;
        const newY = y - dragOffset.y;

        // Use requestAnimationFrame to prevent white flicker during drag
        requestAnimationFrame(() => {
          setDecorations((prevDecorations) =>
            prevDecorations.map((d) =>
              d.id === selectedId ? { ...d, x: newX, y: newY } : d
            )
          );
        });
      }
    };

    const handleGlobalMouseUp = () => {
      if (dragging || resizing) {
        setDragging(false);
        setResizing(null);
      }
    };

    if (dragging || resizing) {
        document.addEventListener("mousemove", handleGlobalMouseMove);
        document.addEventListener("mouseup", handleGlobalMouseUp);
    }

    return () => {
        document.removeEventListener("mousemove", handleGlobalMouseMove);
        document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [dragging, resizing, selectedId, dragOffset, maintainAspectRatio]);

  const handleMouseUp = () => {
    setDragging(false);
    setResizing(null);
  };

    // Trong hàm addImageDecoration, thay đổi như sau:

    const addImageDecoration = (
      imageUrl: string,
      imageName: string = "Hình Ảnh",
      imageId?: string
    ) => {
      console.log("🖼️ ADD IMAGE DECORATION DEBUG");
      console.log("Current side:", currentSide);
      console.log("Image URL:", imageUrl);
      console.log("Image name:", imageName);
      console.log("Current decorations before add:", decorations);
      console.log("sideDecorations before add:", sideDecorations);
      console.log("Current shirtImage:", shirtImage);
      console.log(
        "Current side's background image:",
        shirtImageBySide[currentSide]
      );

    const pa = printAreaRef.current;
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      const maxSize = 200;
      
      // Calculate ORIGINAL aspect ratio from the loaded image
      const originalAspectRatio = img.naturalWidth / img.naturalHeight;
      
      // Calculate new dimensions while MAINTAINING aspect ratio
      let width = img.naturalWidth;
      let height = img.naturalHeight;
      
      if (width > maxSize || height > maxSize) {
        // Scale proportionally - ALWAYS maintain aspect ratio
        const scaleFactor = Math.min(maxSize / width, maxSize / height);
        width = width * scaleFactor;
        height = height * scaleFactor;
      }
      
      // Double check aspect ratio is maintained
      const calculatedHeight = width / originalAspectRatio;
      if (Math.abs(calculatedHeight - height) > 0.1) {
        height = calculatedHeight; // Force correct height
      }
      
      const newImageDecoration: ImageDecoration = {
          id: imageId ? parseInt(imageId) || Date.now() + Math.random() : Date.now() + Math.random(),
          type: "image",
        imageUrl: imageUrl,
        imageElement: img,
        x: pa.x + pa.width / 2,
        y: pa.y + pa.height / 2,
        width: width,
        height: height,
        originalAspectRatio: originalAspectRatio, // Store CORRECT aspect ratio
        rotation: 0,
        visible: true,
        locked: false,
        shadow: true,
        opacity: 1,
          name: imageName,
          sampleImageId: imageId, // Store the shop photo ID if provided
        };

        console.log("🎨 NEW DECORATION CREATED");
        console.log("  - ID:", newImageDecoration.id);
        console.log("  - Name:", newImageDecoration.name);
        console.log("  - Adding to ONLY current side:", currentSide);
        console.log("  - Current decorations count before add:", decorations.length);

        // IMPORTANT: Lưu lại background image của side hiện tại
        const currentSideBackground = shirtImageBySide[currentSide];
        console.log("💾 Preserving background image for", currentSide, ":", currentSideBackground ? currentSideBackground.substring(0, 50) + '...' : 'EMPTY');

        // Add decoration ONLY to current side's decorations in state
        setDecorations((prev) => {
          const newDecorations = [...prev, newImageDecoration];
          console.log("📝 Updated decorations array for", currentSide, "- New count:", newDecorations.length);
          return newDecorations;
        });

        // Also update sideDecorations to ensure consistency - ONLY for current side
        setSideDecorations((prev) => {
          const currentSideDecorations = prev[currentSide] || [];
          const updatedSideDecorations = [
            ...currentSideDecorations,
            newImageDecoration,
          ];
          // CRITICAL: Only update the current side, keep all other sides unchanged
          const updated = { 
            ...prev, 
            [currentSide]: updatedSideDecorations 
          };
          console.log("💾 Updated sideDecorations - ONLY for", currentSide);
          console.log("📊 Side decorations summary:", {
            front: updated.front.length,
            back: updated.back.length,
            leftSleeve: updated.leftSleeve.length,
            rightSleeve: updated.rightSleeve.length,
          });
          return updated;
        });

      setSelectedId(newImageDecoration.id);
      setUploadingImage(false);

        // CRITICAL FIX: Đảm bảo background image được restore ngay lập tức
        if (currentSideBackground && currentSideBackground !== shirtImage) {
          console.log("🔄 Immediately restoring background image for", currentSide);
          // Force immediate update
          setTimeout(() => {
            setShirtImage(currentSideBackground);
          }, 0);
        }

        console.log("✅ Image decoration added successfully to", currentSide);
        console.log("🖼️ END ADD IMAGE DECORATION DEBUG");
    };
    
    img.onerror = () => {
        console.error("Không thể tải hình ảnh");
      setUploadingImage(false);
        alert("Không thể tải hình ảnh. Vui lòng thử hình ảnh khác.");
    };
    
    img.src = imageUrl;
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
      addImageDecoration,
    }));

    const handleDecorationImageUpload = (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      console.log("📁 IMAGE UPLOAD DEBUG");
      console.log("Current side:", currentSide);
      console.log("File input changed");
      console.log("Event:", e);
      console.log("Target:", e.target);
      console.log("Files:", e.target.files);

    const file = e.target.files?.[0];
    if (file) {
         console.log("📄 File selected:", file.name, "Size:", file.size);
         console.log("📄 File type:", file.type);
      setUploadingImage(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
             console.log(
               "📖 File read successfully, calling addImageDecoration"
             );
             console.log(
               "📖 Result length:",
               (event.target.result as string).length
             );
          const imageUrl = event.target.result as string;
          addImageDecoration(imageUrl, file.name);
          
          // Add to uploaded images library
          setUploadedImages(prev => [...prev, { url: imageUrl, name: file.name }]);
           } else {
             console.error("❌ File read failed - no result");
        }
      };
         reader.onerror = (error) => {
           console.error("❌ FileReader error:", error);
           setUploadingImage(false);
      };
      reader.readAsDataURL(file);
       } else {
         console.log("❌ No file selected");
       }
       
       // Reset file input value to allow selecting the same file again
       e.target.value = '';
       console.log("🔄 File input value reset");
       
       console.log("📁 END IMAGE UPLOAD DEBUG");
  };

  const toggleVisibility = (id: number) => {
      setDecorations(
        decorations.map((d) =>
      d.id === id ? { ...d, visible: !d.visible } : d
        )
      );
  };

  const toggleLock = (id: number) => {
      setDecorations(
        decorations.map((d) => (d.id === id ? { ...d, locked: !d.locked } : d))
      );
  };

  const deleteDecoration = (id: number) => {
      setDecorations(decorations.filter((d) => d.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

    const moveLayer = (id: number, direction: "up" | "down") => {
      const index = decorations.findIndex((d) => d.id === id);
      if (direction === "up" && index < decorations.length - 1) {
      const newDecorations = [...decorations];
        [newDecorations[index], newDecorations[index + 1]] = [
          newDecorations[index + 1],
          newDecorations[index],
        ];
      setDecorations(newDecorations);
      } else if (direction === "down" && index > 0) {
      const newDecorations = [...decorations];
        [newDecorations[index], newDecorations[index - 1]] = [
          newDecorations[index - 1],
          newDecorations[index],
        ];
      setDecorations(newDecorations);
    }
  };

    const updateProperty = <K extends keyof ImageDecoration>(
    property: K, 
    value: any
  ) => {
      setDecorations(
        decorations.map((d) =>
          d.id === selectedId ? ({ ...d, [property]: value } as Decoration) : d
        )
      );
    };

    // Function to capture canvas as image and convert to File
    const captureCanvasAsFile = async (side?: Side): Promise<File | null> => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      // Log current state before capture
      console.log('📸 CAPTURE DEBUG:');
      console.log('- selectedId:', selectedId);
      console.log('- decorations count:', decorations.length);
      console.log('- shirtImage:', shirtImage);
      
      // Force canvas redraw with NO selection (pass null explicitly)
      console.log('🔄 Forcing canvas redraw WITHOUT selection...');
      drawCanvas(null); // Force selectedId to be null
      
      // Add small delay to ensure canvas is fully rendered
      await new Promise(resolve => setTimeout(resolve, 100));

      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const sideName = side || currentSide;
              const file = new File(
                [blob],
                `design-${sideName}-${Date.now()}.png`,
                {
                  type: "image/png",
                }
              );
              console.log('✅ Canvas blob created, size:', blob.size);
              resolve(file);
            } else {
              console.error('❌ Failed to create canvas blob');
              resolve(null);
            }
          },
          "image/png",
          0.9
        );
      });
    };

    // Function to capture icon image with cropped size (width x height)
    // Function to capture icon image with aspect ratio from canvas applied to original image
    const captureIconAsCroppedImage = async (decoration: ImageDecoration): Promise<File | null> => {
      try {
        console.log(`✂️ Capturing icon with aspect ratio applied: ${decoration.name}`);
        console.log(`  Current size on canvas: ${decoration.width}x${decoration.height}px`);
        
        // Load the original image to get its natural dimensions
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        return new Promise((resolve) => {
          img.onload = () => {
            // Get original image dimensions
            const originalWidth = img.naturalWidth;
            const originalHeight = img.naturalHeight;
            console.log(`  Original image size: ${originalWidth}x${originalHeight}px`);
            
            // Calculate aspect ratio from canvas decoration (current display size)
            const canvasAspectRatio = decoration.width / decoration.height;
            console.log(`  Canvas aspect ratio: ${canvasAspectRatio.toFixed(4)} (${decoration.width}:${decoration.height})`);
            
            // Calculate aspect ratio of original image
            const originalAspectRatio = originalWidth / originalHeight;
            console.log(`  Original aspect ratio: ${originalAspectRatio.toFixed(4)} (${originalWidth}:${originalHeight})`);
            
            // Apply canvas aspect ratio to original image dimensions
            let targetWidth: number;
            let targetHeight: number;
            
            if (canvasAspectRatio > originalAspectRatio) {
              // Canvas is wider -> keep original width, adjust height
              targetWidth = originalWidth;
              targetHeight = Math.round(originalWidth / canvasAspectRatio);
            } else {
              // Canvas is taller -> keep original height, adjust width
              targetHeight = originalHeight;
              targetWidth = Math.round(originalHeight * canvasAspectRatio);
            }
            
            console.log(`  Target output size: ${targetWidth}x${targetHeight}px`);
            console.log(`  Output aspect ratio: ${(targetWidth / targetHeight).toFixed(4)}`);
            
            // Create a temporary canvas with the calculated dimensions
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = targetWidth;
            tempCanvas.height = targetHeight;
            const tempCtx = tempCanvas.getContext('2d');
            
            if (!tempCtx) {
              console.error('❌ Failed to get 2D context for temp canvas');
              resolve(null);
              return;
            }
            
            // Draw the original image scaled to target size
            tempCtx.drawImage(img, 0, 0, targetWidth, targetHeight);
            
            // Convert canvas to blob
            tempCanvas.toBlob(
              (blob) => {
                if (blob) {
                  const file = new File(
                    [blob],
                    `${decoration.name}-scaled-${Date.now()}.png`,
                    { type: 'image/png' }
                  );
                  console.log(`✅ Icon captured with canvas aspect ratio: ${targetWidth}x${targetHeight}px, file size: ${blob.size} bytes`);
                  resolve(file);
                } else {
                  console.error('❌ Failed to create blob from temp canvas');
                  resolve(null);
                }
              },
              'image/png',
              0.9
            );
          };
          
          img.onerror = () => {
            console.error('❌ Failed to load image for scaling');
            resolve(null);
          };
          
          img.src = decoration.imageUrl;
        });
      } catch (error) {
        console.error(`❌ Error capturing scaled icon:`, error);
        return null;
      }
    };

    // Function to upload decoration image to storage
    const uploadDecorationImage = async (imageUrl: string, imageName: string): Promise<string | null> => {
      try {
        console.log(`☁️ Uploading decoration image: ${imageName}`);
        
        // Convert base64 to blob
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        
        // Create file from blob
        const file = new File([blob], imageName, { type: blob.type });
        
        // Upload to storage
        const uploadResponse = await uploadImage(file);
        
        if (uploadResponse.success && uploadResponse.data) {
          console.log(`✅ Decoration image uploaded: ${uploadResponse.data}`);
          return uploadResponse.data;
        } else {
          console.error(`❌ Failed to upload decoration image:`, uploadResponse);
          return null;
        }
      } catch (error) {
        console.error(`❌ Error uploading decoration image:`, error);
        return null;
      }
    };

    // Function to capture canvas for a specific side with all decorations
    const captureSideCanvas = async (side: Side, sideDecorationsData?: Record<Side, Decoration[]>): Promise<string | null> => {
      console.log(`🎨 CAPTURING CANVAS FOR SIDE: ${side}`);
      
      // Set flag to prevent auto-save during capture
      isCapturingCanvasRef.current = true;
      
      // Store original state
      const originalSide = currentSide;
      const originalDecorations = decorations;
      const originalShirtImage = shirtImage;
      const originalSelectedId = selectedId; // Store selected ID
      
      // Use provided sideDecorationsData or fallback to current state
      const decorationsToUse = sideDecorationsData || sideDecorations;
      
      try {
        // CRITICAL: Clear selection to avoid capturing border
        console.log('🚫 Clearing selection before capture');
        setSelectedId(null);
        
        // Wait a bit for selection to clear and trigger redraw
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Switch to target side
        console.log(`🔄 Switching to side: ${side}`);
        setCurrentSide(side);
        
        // Load decorations for this side
        const sideDecorationsList = decorationsToUse[side] || [];
        console.log(`📂 Loading decorations for ${side}:`, sideDecorationsList.length, 'decorations');
        console.log(`📂 Decorations details:`, sideDecorationsList.map(d => ({ id: d.id, name: d.name })));
        setDecorations(sideDecorationsList);
        
        // Load background image for this side
        const sideImage = shirtImageBySide[side];
        console.log(`🖼️ Loading background image for ${side}:`, sideImage);
        setShirtImage(sideImage);
        
        // Wait for state updates to complete
        console.log('⏳ Waiting for state to update...');
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // CRITICAL: Wait for background image to load by checking if it's cached or loading it
        if (sideImage && currentBackgroundUrl.current !== sideImage) {
          console.log('🖼️ Background image needs loading, waiting...');
          await new Promise<void>((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
              console.log('✅ Background image loaded successfully');
              backgroundImageCache.current = img;
              currentBackgroundUrl.current = sideImage;
              resolve();
            };
            img.onerror = () => {
              console.error('❌ Failed to load background image');
              resolve(); // Resolve anyway to continue
            };
            img.src = sideImage;
          });
          
          // Wait a bit more for React to process and redraw
          await new Promise(resolve => setTimeout(resolve, 300));
        } else {
          console.log('✅ Background image already cached, waiting for redraw...');
          // Still wait for useEffect to trigger
          await new Promise(resolve => setTimeout(resolve, 400));
        }
        
        console.log('✅ Canvas should be ready for capture');
        console.log('📊 Current state before capture:');
        console.log(`  - Decorations to use: ${sideDecorationsList.length}`);
        console.log(`  - Background image: ${sideImage ? 'Set' : 'Not set'}`);
        
        // Capture canvas
        console.log('📸 Capturing canvas now...');
        const file = await captureCanvasAsFile(side);
        if (!file) {
          console.error(`❌ Failed to capture canvas for side: ${side}`);
          return null;
        }
        
        console.log(`📸 Canvas captured for ${side}, file size:`, file.size);
        
        // Upload to storage
        console.log(`☁️ Uploading canvas for ${side} to storage...`);
        const response = await uploadImage(file);
        
        if (response.success && response.data) {
          console.log(`✅ Canvas uploaded successfully for ${side}:`, response.data);
          return response.data;
        } else {
          console.error(`❌ Upload failed for side ${side}:`, response);
          return null;
        }
        
      } catch (error) {
        console.error(`❌ Error capturing canvas for side ${side}:`, error);
        return null;
      } finally {
        // Restore original state
        console.log(`🔄 Restoring original state...`);
        console.log(`🔄 Original side: ${originalSide}`);
        console.log(`🔄 Original decorations count: ${originalDecorations.length}`);
        console.log(`🔄 Original shirt image: ${originalShirtImage}`);
        
        setCurrentSide(originalSide);
        setDecorations(originalDecorations);
        setShirtImage(originalShirtImage);
        setSelectedId(originalSelectedId); // Restore selection
        
        // Wait for state to update
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log(`✅ State restored - Side: ${originalSide}, Decorations: ${originalDecorations.length}`);
        
        // Reset flag after capture is complete
        isCapturingCanvasRef.current = false;
      }
    };

    // Function to upload canvas image to server
    const uploadCanvasImage = async (): Promise<string | null> => {
      try {
        const file = await captureCanvasAsFile();
        if (!file) {
          console.error("Failed to capture canvas as file");
          return null;
        }

        const response = await uploadImage(file);

        if (response.success && response.data) {
          return response.data; // data is already the URL string
        } else {
          console.error("Upload failed:", response);
          return null;
        }
      } catch (error) {
        console.error("Error uploading canvas image:", error);
        return null;
      }
  };

  const saveDesign = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!resolvedProductId || !resolvedProductOptionValueId) {
        toast.error("Thiếu thông tin sản phẩm từ template để lưu thiết kế.");
      return;
    }

    try {
      setSavingDesign(true);
      console.log("💾 STARTING SAVE DESIGN PROCESS");

      // CRITICAL: Save current decorations to current side BEFORE collecting
      console.log("💾 Saving current decorations to current side before collecting...");
      console.log("Current side:", currentSide);
      console.log("Current decorations count:", decorations.length);
      
      // Update sideDecorations with current decorations
      const updatedSideDecorations = {
        ...sideDecorations,
        [currentSide]: [...decorations]
      };
      
      console.log("💾 Updated side decorations count:", {
        front: updatedSideDecorations.front.length,
        back: updatedSideDecorations.back.length,
        leftSleeve: updatedSideDecorations.leftSleeve.length,
        rightSleeve: updatedSideDecorations.rightSleeve.length,
      });

      // Collect all image decorations from all sides for icons
      const allImageDecorations: ImageDecoration[] = [];
      const allSides: Side[] = ["front", "back", "leftSleeve", "rightSleeve"];
      
      console.log("📋 Collecting all image decorations from all sides...");
      allSides.forEach(side => {
        const sideDecorationsList = updatedSideDecorations[side] || [];
        const imageDecorations = sideDecorationsList.filter(d => d.type === "image") as ImageDecoration[];
        console.log(`📂 ${side}: ${imageDecorations.length} image decorations`);
        allImageDecorations.push(...imageDecorations);
      });
      
      console.log(`📊 Total image decorations collected: ${allImageDecorations.length}`);
      
      // Upload all decoration images to storage and create icons
      console.log("☁️ Uploading all decoration images to storage...");
      const icons = [];
      
      for (const decoration of allImageDecorations) {
        // Find which side this decoration belongs to
        const decorationSide = Object.keys(updatedSideDecorations).find(side => 
          updatedSideDecorations[side as Side]?.some(dec => dec.id === decoration.id)
        ) as Side || currentSide; // Use currentSide as fallback instead of "front"
        
        console.log(`🔍 Decoration "${decoration.name}" (ID: ${decoration.id}) belongs to side: ${decorationSide}`);
        
        // Check if this is a shop photo (has sampleImageId)
        if (decoration.sampleImageId) {
          // This is a shop photo, capture cropped version and upload
          console.log(`📸 Shop photo detected (sampleImageId: ${decoration.sampleImageId}), capturing cropped version`);
          
          const croppedFile = await captureIconAsCroppedImage(decoration);
          if (croppedFile) {
            const uploadedUrl = await uploadImage(croppedFile);
            
            if (uploadedUrl.success && uploadedUrl.data) {
              icons.push({
                imageUrl: uploadedUrl.data, // Use uploaded cropped image URL
                sampleImageId: decoration.sampleImageId,
              });
              console.log(`✅ Shop photo cropped icon uploaded for ${decoration.name}: ${uploadedUrl.data}`);
            } else {
              console.warn(`⚠️ Failed to upload cropped shop photo: ${decoration.name}`);
            }
          } else {
            console.warn(`⚠️ Failed to capture cropped shop photo: ${decoration.name}`);
          }
        } else {
          // This is a user-uploaded image, capture cropped version and upload
          console.log(`📤 User-uploaded image, capturing cropped version`);
          
          const croppedFile = await captureIconAsCroppedImage(decoration);
          if (croppedFile) {
            const uploadedUrl = await uploadImage(croppedFile);
            
            if (uploadedUrl.success && uploadedUrl.data) {
              icons.push({
                imageUrl: uploadedUrl.data, // Use uploaded cropped image URL
              });
              console.log(`✅ Cropped icon uploaded for ${decoration.name} on ${decorationSide}: ${uploadedUrl.data}`);
            } else {
              console.warn(`⚠️ Failed to upload cropped icon: ${decoration.name}`);
            }
          } else {
            console.warn(`⚠️ Failed to capture cropped icon: ${decoration.name}`);
          }
        }
      }
      
      console.log("🎨 Icons created with storage URLs:", icons);

      // CRITICAL: Update sideDecorations state before capturing canvas
      setSideDecorations(updatedSideDecorations);
      
      // Wait a bit for state to update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capture canvas for all sides that have templates and upload them
      const designTemplates: any[] = [];
      
      console.log("📸 Capturing canvas for all sides with templates...");
      for (const side of allSides) {
        // Only capture sides that have template images available
        if (sideHasTemplate[side]) {
          console.log(`🎯 Processing side: ${side}`);
          
          // Get the original template ID for this side from API data
          // We need to find the templateId from the original API response
          const sideTemplateId = getTemplateIdForSide(side);
          console.log(`🔍 Template ID for ${side}:`, sideTemplateId);
          
          // Pass updatedSideDecorations to ensure correct decorations are used
          const canvasImageUrl = await captureSideCanvas(side, updatedSideDecorations);
          
          if (canvasImageUrl) {
            // Create template object for this side with correct templateId
            const template = {
              templateId: sideTemplateId, // Use actual templateId instead of null
              designImageUrl: canvasImageUrl,
            };
            designTemplates.push(template);
            console.log(`✅ Template created for ${side}:`, template);
          } else {
            console.warn(`⚠️ Failed to capture canvas for side: ${side}`);
          }
        } else {
          console.log(`⏭️ Skipping ${side} - no template available`);
        }
      }

      console.log(`📊 Total templates created: ${designTemplates.length}`);

      // Log detailed information about what we're sending
      console.log("📊 DETAILED PAYLOAD INFORMATION:");
      console.log("Icons count:", icons.length);
      icons.forEach((icon, index) => {
        console.log(`  Icon ${index + 1}:`, {
          imageUrl: icon.imageUrl.substring(0, 50) + '...',
          sampleImageId: icon.sampleImageId || 'N/A (user upload)'
        });
      });
      
      console.log("Templates count:", designTemplates.length);
      designTemplates.forEach((template, index) => {
        console.log(`  Template ${index + 1}:`, {
          templateId: template.templateId,
          designImageUrl: template.designImageUrl.substring(0, 50) + '...'
        });
      });

      const payload: CreateOrUpdateProductDesignRequest = {
        productDesignId: null,
        productId: resolvedProductId,
        productOptionValueId: resolvedProductOptionValueId,
        name: designName || `Thiết kế ${getDesignTypeLabel()}`,
        icons: icons, // Send icons with imageUrl and optional sampleImageId
        templates: designTemplates,
      };

      console.log("📤 Sending payload to API:", payload);

      const res = await createOrUpdateProductDesign(payload);
      if (res.success) {
          toast.success("Lưu thiết kế thành công!");
          console.log("✅ Design saved successfully!");
      } else {
          toast.error("Lưu thiết kế thất bại.");
          console.error("❌ Save design failed:", res);
      }
    } catch (e) {
        console.error("❌ Error saving design:", e);
        toast.error("Có lỗi xảy ra khi lưu thiết kế.");
    } finally {
      setSavingDesign(false);
      console.log("💾 SAVE DESIGN PROCESS COMPLETED");
      
      // Force redraw canvas to ensure decorations are visible
      console.log("🔄 Force redraw canvas after save...");
      await new Promise(resolve => setTimeout(resolve, 100));
      drawCanvas();
      console.log("✅ Canvas redrawn after save");
    }
  };

    // Helper function to get side label
    const getSideLabel = (side: Side): string => {
      switch (side) {
        case "front":
          return "Mặt Trước";
        case "back":
          return "Mặt Sau";
        case "leftSleeve":
          return "Tay Trái";
        case "rightSleeve":
          return "Tay Phải";
        default:
          return "Mặt Trước";
      }
    };

    // Helper function to get template ID for a side
    const getTemplateIdForSide = (side: Side): string | null => {
      return sideTemplateIds[side];
    };

    // Function to navigate to products page
    const handleNavigateToProducts = () => {
      router.push("/products");
    };

    // Save decorations whenever decorations change (but not during side switching)
    useEffect(() => {
      // Skip if we're capturing canvas to prevent corruption
      if (isCapturingCanvasRef.current) {
        return;
      }
      
      // Only save if we're not in the middle of switching sides
      if (prevSideRef.current === currentSide && !isSwitchingSideRef.current) {
        // Update sideDecorations to keep it in sync - ONLY for current side
        setSideDecorations((prev) => {
          const updated = { ...prev, [currentSide]: [...decorations] };
          return updated;
        });
      }
    }, [decorations, currentSide]);

    // Function to save current decorations to current side
    const saveCurrentDecorationsToSide = () => {
      console.log("💾 SAVE DECORATIONS DEBUG");
      console.log("Current side:", currentSide);
      console.log("Current decorations:", decorations);
      console.log("Current sideDecorations:", sideDecorations);

      setSideDecorations((prev) => {
        const updated = { ...prev, [currentSide]: [...decorations] };
        console.log("💾 Updated sideDecorations:", updated);
        return updated;
      });

      console.log("💾 END SAVE DECORATIONS DEBUG");
    };

    // Thay thế effect hook restore background image hiện tại bằng version này:
    useEffect(() => {
      const sideImage = shirtImageBySide[currentSide];
      
      // Always ensure the correct background image is displayed
      if (sideImage && sideImage !== shirtImage) {
        setShirtImage(sideImage);
      }
    }, [currentSide, shirtImageBySide]); // Removed decorations dependency

    // Thêm một effect riêng để log khi decorations thay đổi
    useEffect(() => {
      // Silent effect - no logs to prevent console spam
    }, [decorations]);

    return (
      <div className="w-full h-full bg-gray-50 flex overflow-hidden">
        <div className="w-64 bg-white border-r flex-shrink-0 flex flex-col overflow-hidden">
          <div className="p-4 flex-shrink-0">
          <div className="mb-4">
            <h3 className="font-semibold mb-2 text-sm">Thêm Hình Ảnh</h3>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleDecorationImageUpload}
                className="hidden"
                id="decoration-image-upload"
              />
              <button
                  onClick={() => {
                    console.log("🔘 UPLOAD BUTTON CLICKED");
                    console.log("Current side:", currentSide);
                    console.log("Current decorations:", decorations);
                    console.log("sideDecorations:", sideDecorations);

                    const fileInput = document.getElementById(
                      "decoration-image-upload"
                    );
                    console.log("📁 File input element:", fileInput);

                    if (fileInput) {
                      console.log("📁 Clicking file input...");
                      (fileInput as HTMLInputElement).click();
                    } else {
                      console.error("❌ File input not found!");
                    }
                  }}
                disabled={uploadingImage}
                className="w-full bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 flex items-center justify-center gap-2 font-medium text-sm disabled:opacity-50"
              >
                  <Upload size={16} />{" "}
                  {uploadingImage ? "Đang Tải..." : "Tải Hình Ảnh"}
              </button>
            </div>
          </div>
          </div>

          {/* Image Library - Suggested Images */}
          <div className="flex-1 overflow-hidden flex flex-col px-4 pb-4 min-h-0">
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-purple-600" />
                <h3 className="font-semibold text-sm">
                  Ảnh Đề Xuất ({loadingSampleImages ? "..." : suggestedImages.length})
                </h3>
                {loadingSampleImages && (
                  <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
              <button
                onClick={loadSampleImages}
                disabled={loadingSampleImages}
                className="p-1 text-gray-500 hover:text-purple-600 disabled:opacity-50"
                title="Làm mới ảnh mẫu"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            {loadingSampleImages ? (
              <div className="text-center py-4 text-gray-400 text-xs bg-gray-50 rounded border border-dashed border-gray-300">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  Đang tải ảnh mẫu...
                </div>
              </div>
            ) : suggestedImages.length === 0 ? (
              <div className="text-center py-4 text-gray-400 text-xs bg-gray-50 rounded border border-dashed border-gray-300">
                Chưa có ảnh đề xuất
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 overflow-y-auto flex-1 min-h-0 content-start">
                {suggestedImages.map((img, index) => (  
                  <button
                    key={index}
                    onClick={() => addImageDecoration(img.url, img.name, img.id)}
                    className="aspect-square rounded overflow-hidden border-2 border-gray-200 hover:border-purple-500 transition-colors hover:shadow-md group relative bg-gray-50 flex-shrink-0"
                    title={`${img.name} - ${img.url}`}
                  >
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error("Failed to load sample image:", img.url);
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        // Show fallback text
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.fallback-text')) {
                          const fallback = document.createElement('div');
                          fallback.className = 'fallback-text absolute inset-0 flex flex-col items-center justify-center text-xs text-gray-500 p-1';
                          fallback.innerHTML = `<span class="text-center">❌</span><span class="text-center mt-1">${img.name}</span>`;
                          parent.appendChild(fallback);
                        }
                      }}
                      onLoad={() => {
                        console.log("Successfully loaded sample image:", img.url);
                      }}
                      crossOrigin="anonymous"
                    />
                    <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-10 transition-opacity flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium">
                        Thêm
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      
      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white border-b p-3 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">Thiết Kế Áo</h1>
            <div className="flex items-center gap-2">
                {/* Dropdown selector for sides */}
                <div className="relative">
                  <select
                    value={currentSide}
                    onChange={(e) => {
                      console.log("🔄 DROPDOWN SIDE CHANGE");
                      console.log(
                        "From side:",
                        currentSide,
                        "To side:",
                        e.target.value
                      );
                      console.log("Current decorations:", decorations);
                      console.log("sideDecorations:", sideDecorations);
                      setCurrentSide(e.target.value as Side);
                    }}
                    className="px-3 py-1.5 rounded text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8"
                    disabled={sideOrder.length === 0}
                  >
                    {(sideOrder.length > 0
                      ? sideOrder
                      : ([
                          "front",
                          "back",
                          "leftSleeve",
                          "rightSleeve",
                        ] as Side[])
                    ).map((key: Side) => {
                      const sideLabels: Record<Side, string> = {
                        front: "Mặt Trước",
                        back: "Mặt Sau",
                        leftSleeve: "Tay Trái",
                        rightSleeve: "Tay Phải",
                      };
                      const label = sideLabels[key];
                      const hasTemplate = sideHasTemplate[key];

                      // Only show options that have templates from API
                      if (!hasTemplate) {
                        return null;
                      }

                      return (
                        <option key={key} value={key}>
                    {label}
                        </option>
                );
              })}
                  </select>
                  {/* Custom dropdown arrow */}
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Current side info */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">
                    {(() => {
                      const sideLabels: Record<Side, string> = {
                        front: "Mặt Trước",
                        back: "Mặt Sau",
                        leftSleeve: "Tay Trái",
                        rightSleeve: "Tay Phải",
                      };
                      return sideLabels[currentSide];
                    })()}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span>{sideOrder.length} khu vực</span>
                </div>
            </div>
          </div>
          <button
            onClick={saveDesign}
            disabled={savingDesign}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 font-medium text-sm disabled:opacity-60"
          >
              💾 {savingDesign ? "Đang lưu..." : "Lưu Thiết Kế"}
          </button>
        </div>
        
          <div className="flex-1 p-4 overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 min-h-0 min-w-0 flex-shrink-0 relative">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">
                    Đang tải hình ảnh...
                  </p>
                </div>
              </div>
            )}
          <canvas
            ref={canvasRef}
            width={615}
            height={615}
            className="bg-white shadow-2xl rounded flex-shrink-0"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ 
              touchAction: "none",
              cursor: canvasCursor,
              width: '615px',
              height: '615px',
              willChange: 'contents', // Optimize rendering
              imageRendering: 'auto' // Better image quality
            }}
          />
        </div>
      </div>
      
      <div className="w-64 bg-white border-l overflow-y-auto flex-shrink-0">
        <div className="p-4">
          <h2 className="text-lg font-bold mb-4">📚 Lớp</h2>
          
            {/* Current Side Info */}
          <div className="mb-3 p-3 bg-blue-50 border-2 border-blue-200 rounded">
            <div className="flex items-center gap-2">
              <span className="text-xl">👔</span>
                <span className="font-semibold text-sm">
                  Nền {getDesignTypeLabel()}
                </span>
              <Lock size={14} className="ml-auto text-gray-500" />
            </div>
              <div className="text-xs text-gray-600 mt-1">
                Khu vực: {getSideLabel(currentSide)} ({decorations.length}{" "}
                layer)
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Ảnh nền: {shirtImage ? "Có" : "Không"}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Ảnh khu vực: {shirtImageBySide[currentSide] ? "Có" : "Không"}
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            {[...decorations].reverse().map((dec, reversedIndex) => {
              const actualIndex = decorations.length - 1 - reversedIndex;
              return (
                <div
                  key={dec.id}
                  className={`p-2 border-2 rounded flex items-center gap-2 cursor-pointer transition ${
                      selectedId === dec.id
                        ? "bg-blue-100 border-blue-500 shadow"
                        : "bg-gray-50 hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedId(dec.id)}
                >
                    <span className="text-lg">🖼️</span>
                    <span className="flex-1 text-sm font-medium truncate">
                      {dec.name}
                  </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveLayer(dec.id, "up");
                      }}
                          disabled={actualIndex === decorations.length - 1}
                      className="p-1 hover:bg-gray-300 rounded disabled:opacity-30 transition"
                    >
                    <MoveUp size={14} />
                  </button>
                  
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveLayer(dec.id, "down");
                      }}
                          disabled={actualIndex === 0}
                      className="p-1 hover:bg-gray-300 rounded disabled:opacity-30 transition"
                    >
                    <MoveDown size={14} />
                  </button>
                  
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVisibility(dec.id);
                      }}
                      className="p-1 hover:bg-gray-300 rounded transition"
                    >
                    {dec.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLock(dec.id);
                      }}
                      className="p-1 hover:bg-gray-300 rounded transition"
                    >
                    {dec.locked ? <Lock size={14} /> : <Unlock size={14} />}
                  </button>
                  
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDecoration(dec.id);
                      }}
                      className="p-1 hover:bg-red-200 rounded text-red-600 transition"
                    >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
            
            {decorations.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                  Chưa có trang trí nào.
                  <br />
                  Thêm từ bảng điều khiển bên trái!
              </div>
            )}

              {/* Debug info - Hidden in production */}
              {false && (
                <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
                  <div className="font-semibold mb-1">Tất cả khu vực:</div>
                  {(["front", "back", "leftSleeve", "rightSleeve"] as Side[]).map(
                    (side) => (
                      <div key={side} className="flex justify-between">
                        <span>{getSideLabel(side)}:</span>
                        <span
                          className={
                            side === currentSide ? "font-bold text-blue-600" : ""
                          }
                        >
                          {sideDecorations[side]?.length || 0} layer
                        </span>
                      </div>
                    )
                  )}
                  <div className="mt-2 pt-2 border-t border-gray-300">
                    <div className="font-semibold mb-1">Ảnh nền:</div>
                    {(
                      ["front", "back", "leftSleeve", "rightSleeve"] as Side[]
                    ).map((side) => (
                      <div key={side} className="flex justify-between">
                        <span>{getSideLabel(side)}:</span>
                        <span
                          className={
                            side === currentSide ? "font-bold text-blue-600" : ""
                          }
                        >
                          {shirtImageBySide[side] ? "Có" : "Không"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
          
          {selectedDecoration && (
            <div className="border-t-2 pt-4">
              <h3 className="font-bold mb-3 text-lg">⚙️ Thuộc Tính</h3>
              
              <div className="space-y-3">
                  <div>
                    <label className="text-sm font-semibold block mb-1">
                      Chiều Rộng: {Math.round(selectedDecoration.width)}px
                    </label>
                      <input
                        type="range"
                        min="50"
                        max="500"
                        value={Math.round(selectedDecoration.width)}
                        onChange={(e) => {
                          const newWidth = parseInt(e.target.value);
                          // Only update width, keep height unchanged
                          setDecorations(
                            decorations.map((d) =>
                              d.id === selectedId 
                                ? ({ ...d, width: newWidth } as Decoration) 
                                : d
                            )
                          );
                        }}
                        className="w-full"
                        disabled={selectedDecoration.locked}
                      />
                    </div>
                    
                    <div>
                    <label className="text-sm font-semibold block mb-1">
                      Chiều Cao: {Math.round(selectedDecoration.height)}px
                    </label>
                      <input
                        type="range"
                        min="50"
                        max="500"
                        value={Math.round(selectedDecoration.height)}
                        onChange={(e) => {
                          const newHeight = parseInt(e.target.value);
                          // Only update height, keep width unchanged
                          setDecorations(
                            decorations.map((d) =>
                              d.id === selectedId 
                                ? ({ ...d, height: newHeight } as Decoration) 
                                : d
                            )
                          );
                        }}
                        className="w-full"
                        disabled={selectedDecoration.locked}
                      />
                    </div>
                
                <div>
                    <label className="text-sm font-semibold block mb-1">
                      Xoay: {selectedDecoration.rotation}°
                    </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={selectedDecoration.rotation}
                      onChange={(e) =>
                        updateProperty("rotation", parseInt(e.target.value))
                      }
                    className="w-full"
                    disabled={selectedDecoration.locked}
                  />
                </div>
                
                <div>
                    <label className="text-sm font-semibold block mb-1">
                      Độ Trong Suốt:{" "}
                      {Math.round(selectedDecoration.opacity * 100)}%
                    </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedDecoration.opacity * 100}
                      onChange={(e) =>
                        updateProperty(
                          "opacity",
                          parseInt(e.target.value) / 100
                        )
                      }
                    className="w-full"
                    disabled={selectedDecoration.locked}
                  />
                </div>
                
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedDecoration.shadow}
                        onChange={(e) =>
                          updateProperty("shadow", e.target.checked)
                        }
                      disabled={selectedDecoration.locked}
                    />
                    <span className="text-sm font-semibold">Bóng Đổ</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
        {/* Missing Product Params Dialog */}
        {showMissingParamsDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                        </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Thiếu Thông Tin Sản Phẩm
                </h3>
                <p className="text-gray-600">
                  Để sử dụng công cụ thiết kế, bạn cần chọn một sản phẩm trước.
                  <br />
                  Vui lòng chọn sản phẩm từ danh sách để tiếp tục.
                </p>
                  </div>
                  
                  <div className="space-y-3">
                        <button
                  onClick={handleNavigateToProducts}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                        >
                  🛍️ Chọn Sản Phẩm
                        </button>

                <p className="text-sm text-gray-500">
                  Bạn sẽ được chuyển đến trang danh sách sản phẩm
                </p>
                  </div>
          </div>
        </div>
      )}
    </div>
  );
  }
);

export default TShirtDesigner;