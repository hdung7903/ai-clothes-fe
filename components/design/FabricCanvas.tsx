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
  imageElement?: HTMLImageElement;
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
}

// Interface cho ref methods
export interface CanvasRef {
  addImageDecoration: (imageUrl: string, imageName: string) => void;
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
    const [imageLoaded, setImageLoaded] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
    const [savingDesign, setSavingDesign] = useState(false);
    const [lastClickPosition, setLastClickPosition] = useState<{
      x: number;
      y: number;
    } | null>(null);
    const [clickCount, setClickCount] = useState(0);
    const [imageLoading, setImageLoading] = useState(false);
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

    // Dialog state for missing product params
    const [showMissingParamsDialog, setShowMissingParamsDialog] =
      useState(false);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const printAreaRef = useRef<PrintArea>({
      x: 150,
      y: 200,
      width: 300,
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

    // Persist decorations per side when switching
    useEffect(() => {
      const prevSide = prevSideRef.current;
      if (prevSide !== currentSide) {
        console.log('Switching from side:', prevSide, 'to side:', currentSide);
        console.log('Current decorations before switch:', decorations);
        
        // Save current decorations to previous side
        setSideDecorations(prev => {
          const updated = { ...prev, [prevSide]: decorations };
          console.log('Updated sideDecorations:', updated);
          return updated;
        });
        
        // Load decorations for new side
        const newSideDecorations = sideDecorations[currentSide] || [];
        console.log('Loading decorations for new side:', currentSide, newSideDecorations);
        setDecorations(newSideDecorations);
        setSelectedId(null);
        
        // CRITICAL FIX: Always update base image when switching sides
        const sideImage = shirtImageBySide[currentSide];
        console.log('Force updating base image for new side:', currentSide, 'to:', sideImage);
        // Set immediately without condition to ensure proper update
        setShirtImage(sideImage);
        
        prevSideRef.current = currentSide;
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

    const drawCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas || !imageLoaded) return;

      // Use the current shirtImage instead of imageRef.current
      if (!shirtImage) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create a new image element for the current shirtImage
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        // Draw the current image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Draw decorations
        console.log(
          "🎨 DRAW CANVAS DEBUG - Drawing decorations:",
          decorations.length,
          "decorations"
        );
        decorations.forEach((dec, index) => {
          console.log(`🎨 Drawing decoration ${index}:`, dec);
          if (!dec.visible) {
            console.log(`🎨 Skipping decoration ${index} - not visible`);
            return;
          }

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

          if (dec.id === selectedId) {
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
      img.onerror = () => {
        console.error("Không thể tải hình ảnh cho canvas:", shirtImage);
      };
      img.src = shirtImage;
    };

    const drawResizeHandles = (
      ctx: CanvasRenderingContext2D,
      bounds: Bounds
    ) => {
      const handleSize = 10;
      const handles = [
        { x: -bounds.width / 2, y: -bounds.height / 2 },
        { x: bounds.width / 2, y: -bounds.height / 2 },
        { x: bounds.width / 2, y: bounds.height / 2 },
        { x: -bounds.width / 2, y: bounds.height / 2 },
      ];

      ctx.setLineDash([]);
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;

      handles.forEach((h) => {
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
    };

    const getDecorationBounds = (dec: Decoration): Bounds => {
      if (dec.type === "image") {
        return { width: dec.width, height: dec.height };
      }
      return { width: 50, height: 50 };
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
      console.log("🔄 CANVAS REDRAW TRIGGER");
      console.log("imageLoaded:", imageLoaded);
      console.log("shirtImage:", shirtImage);
      console.log("decorations:", decorations.length, "decorations");
      console.log("selectedId:", selectedId);

      if (imageLoaded && shirtImage) {
        console.log("✅ Drawing canvas...");
        drawCanvas();
      } else {
        console.log("❌ Skipping canvas draw - missing requirements");
      }
    }, [decorations, selectedId, imageLoaded, shirtImage]);

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
        const handles = [
          { x: dec.x - bounds.width / 2, y: dec.y - bounds.height / 2 },
          { x: dec.x + bounds.width / 2, y: dec.y - bounds.height / 2 },
          { x: dec.x + bounds.width / 2, y: dec.y + bounds.height / 2 },
          { x: dec.x - bounds.width / 2, y: dec.y + bounds.height / 2 },
        ];

        let isResizeHandle = false;
        for (const handle of handles) {
          if (
            Math.abs(x - handle.x) <= handleSize &&
            Math.abs(y - handle.y) <= handleSize
          ) {
            const startSize = dec.width;
            setResizing({ startX: x, startY: y, startSize });
            isResizeHandle = true;
            break;
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

      if (resizing && selectedId !== null) {
        const dx = x - resizing.startX;
        const dy = y - resizing.startY;
        const delta = Math.max(dx, dy);
        const newSize = Math.max(20, resizing.startSize + delta);

        setDecorations((prevDecorations) =>
          prevDecorations.map((d) => {
            if (d.id === selectedId) {
              if (d.type === "image") {
                const aspectRatio = d.width / d.height;
                return {
                  ...d,
                  width: newSize,
                  height: newSize / aspectRatio,
                };
              }
            }
            return d;
          })
        );
      } else if (dragging && selectedId !== null) {
        const newX = x - dragOffset.x;
        const newY = y - dragOffset.y;

        setDecorations((prevDecorations) =>
          prevDecorations.map((d) =>
            d.id === selectedId ? { ...d, x: newX, y: newY } : d
          )
        );
      }
    };

    // Thêm global mouse move listener để đảm bảo drag hoạt động
    useEffect(() => {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (dragging && selectedId !== null) {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const rect = canvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          const newX = x - dragOffset.x;
          const newY = y - dragOffset.y;

          setDecorations((prevDecorations) =>
            prevDecorations.map((d) =>
              d.id === selectedId ? { ...d, x: newX, y: newY } : d
            )
          );
        }
      };

      const handleGlobalMouseUp = () => {
        if (dragging) {
          setDragging(false);
          setResizing(null);
        }
      };

      if (dragging) {
        document.addEventListener("mousemove", handleGlobalMouseMove);
        document.addEventListener("mouseup", handleGlobalMouseUp);
      }

      return () => {
        document.removeEventListener("mousemove", handleGlobalMouseMove);
        document.removeEventListener("mouseup", handleGlobalMouseUp);
      };
    }, [dragging, selectedId, dragOffset]);

    const handleMouseUp = () => {
      setDragging(false);
      setResizing(null);
    };

    // Trong hàm addImageDecoration, thay đổi như sau:

    const addImageDecoration = (
      imageUrl: string,
      imageName: string = "Hình Ảnh"
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
        let width = img.width;
        let height = img.height;

        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = width * ratio;
          height = height * ratio;
        }

        const newImageDecoration: ImageDecoration = {
          id: Date.now() + Math.random(),
          type: "image",
          imageUrl: imageUrl,
          imageElement: img,
          x: pa.x + pa.width / 2,
          y: pa.y + pa.height / 2,
          width: width,
          height: height,
          rotation: 0,
          visible: true,
          locked: false,
          shadow: true,
          opacity: 1,
          name: imageName,
        };

        console.log("🎨 New decoration created:", newImageDecoration);
        console.log("Adding to current side:", currentSide);

        // IMPORTANT: Lưu lại background image của khu vực hiện tại
        const currentSideBackground = shirtImageBySide[currentSide];
        console.log("💾 Preserving background image:", currentSideBackground);

        // Add decoration to current side's decorations
        setDecorations((prev) => {
          const newDecorations = [...prev, newImageDecoration];
          console.log(
            "📝 Updated decorations for current side:",
            newDecorations
          );
          return newDecorations;
        });

        // Also update sideDecorations to ensure consistency
        setSideDecorations((prev) => {
          const currentSideDecorations = prev[currentSide] || [];
          const updatedSideDecorations = [
            ...currentSideDecorations,
            newImageDecoration,
          ];
          const updated = { ...prev, [currentSide]: updatedSideDecorations };
          console.log(
            "💾 Updated sideDecorations for side:",
            currentSide,
            "Decorations:",
            updatedSideDecorations
          );
          return updated;
        });

        setSelectedId(newImageDecoration.id);
        setUploadingImage(false);

        // CRITICAL FIX: Đảm bảo background image được restore ngay lập tức
        if (currentSideBackground && currentSideBackground !== shirtImage) {
          console.log(
            "🔄 Immediately restoring background image:",
            currentSideBackground
          );
          // Force immediate update
          setTimeout(() => {
            setShirtImage(currentSideBackground);
          }, 0);
        }

        console.log("✅ Image decoration added successfully");
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
             addImageDecoration(event.target.result as string, file.name);
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
    const captureCanvasAsFile = async (): Promise<File | null> => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File(
                [blob],
                `design-${currentSide}-${Date.now()}.png`,
                {
                  type: "image/png",
                }
              );
              resolve(file);
            } else {
              resolve(null);
            }
          },
          "image/png",
          0.9
        );
      });
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

        // Get image decorations for icons
        const imageDecorations = decorations.filter(
          (d) => d.type === "image"
        ) as ImageDecoration[];
        const icons = imageDecorations.map((d) => ({ imageUrl: d.imageUrl }));

        // Capture canvas for all sides (with or without decorations)
        let designTemplates: any[] = [];

        // Check all sides - capture all sides that have templates available
        const allSides: Side[] = ["front", "back", "leftSleeve", "rightSleeve"];

        for (const side of allSides) {
          // Only capture sides that have template images available
          if (sideHasTemplate[side]) {
            const sideDecorationsList = sideDecorations[side] || [];

            // Temporarily switch to this side to capture canvas
            const originalSide = currentSide;
            const originalDecorations = decorations;

            setCurrentSide(side);
            setDecorations(sideDecorationsList);

            // Wait for state update and canvas redraw
            await new Promise((resolve) => setTimeout(resolve, 100));

            const canvasImageUrl = await uploadCanvasImage();

            if (canvasImageUrl) {
              // Create template object for this side with templateId as null
              const template = {
                templateId: null,
                designImageUrl: canvasImageUrl,
              };
              designTemplates.push(template);
            } else {
              console.warn("Failed to upload canvas image for side:", side);
            }

            // Restore original state
            setCurrentSide(originalSide);
            setDecorations(originalDecorations);
          }
        }

        // If no sides have templates but current side has decorations, capture current side
        if (designTemplates.length === 0 && decorations.length > 0) {
          const canvasImageUrl = await uploadCanvasImage();

          if (canvasImageUrl) {
            const template = {
              templateId: null,
              designImageUrl: canvasImageUrl,
            };
            designTemplates.push(template);
          }
        }

        const payload: CreateOrUpdateProductDesignRequest = {
          productDesignId: null,
          productId: resolvedProductId,
          productOptionValueId: resolvedProductOptionValueId,
          name: designName || `Thiết kế ${getDesignTypeLabel()}`,
          icons,
          templates: designTemplates,
        };

        const res = await createOrUpdateProductDesign(payload);
        if (res.success) {
          toast.success("Lưu thiết kế thành công!");
        } else {
          toast.error("Lưu thiết kế thất bại.");
          console.error("Save design failed:", res);
        }
      } catch (e) {
        console.error("Error saving design:", e);
        toast.error("Có lỗi xảy ra khi lưu thiết kế.");
      } finally {
        setSavingDesign(false);
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

    // Function to navigate to products page
    const handleNavigateToProducts = () => {
      router.push("/products");
    };

    // Save decorations whenever decorations change (but not during side switching)
    useEffect(() => {
      // Only save if we're not in the middle of switching sides
      if (prevSideRef.current === currentSide && !isSwitchingSideRef.current) {
        console.log("💾 AUTO SAVE DECORATIONS");
        console.log("Current side:", currentSide);
        console.log("Current decorations:", decorations);
        console.log("Current decorations length:", decorations.length);

        // Update sideDecorations to keep it in sync
        setSideDecorations((prev) => {
          const updated = { ...prev, [currentSide]: [...decorations] };
          console.log("💾 Updated sideDecorations:", updated);
          console.log("💾 Side decorations count:", {
            front: updated.front.length,
            back: updated.back.length,
            leftSleeve: updated.leftSleeve.length,
            rightSleeve: updated.rightSleeve.length,
          });
          return updated;
        });
      } else if (isSwitchingSideRef.current) {
        console.log("⏸️ AUTO SAVE SKIPPED - switching sides");
      } else {
        console.log("⏸️ AUTO SAVE SKIPPED - side mismatch:", {
          prevSide: prevSideRef.current,
          currentSide: currentSide,
          isSwitching: isSwitchingSideRef.current,
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
      console.log("🔄 BACKGROUND RESTORE EFFECT TRIGGERED");
      console.log("Current side:", currentSide);
      console.log("Current shirtImage:", shirtImage);
      console.log("Side's background image:", shirtImageBySide[currentSide]);
      
      const sideImage = shirtImageBySide[currentSide];
      
      // Always ensure the correct background image is displayed
      if (sideImage && sideImage !== shirtImage) {
        console.log("🔄 BACKGROUND RESTORE - Restoring background image");
        console.log("From:", shirtImage);
        console.log("To:", sideImage);
        setShirtImage(sideImage);
      } else if (sideImage === shirtImage) {
        console.log("✅ Background image already correct");
      } else if (!sideImage) {
        console.log("⚠️ No background image for this side");
      }
      
      console.log("🔄 END BACKGROUND RESTORE EFFECT");
    }, [currentSide, shirtImageBySide]); // Removed decorations dependency

    // Thêm một effect riêng để log khi decorations thay đổi
    useEffect(() => {
      console.log("📝 DECORATIONS CHANGED");
      console.log("Current side:", currentSide);
      console.log("Decorations count:", decorations.length);
      console.log("Current shirtImage:", shirtImage);
      console.log("Expected background:", shirtImageBySide[currentSide]);
    }, [decorations]);

    return (
      <div className="w-full h-full bg-gray-50 flex overflow-hidden">
        <div className="w-64 bg-white border-r overflow-y-auto flex-shrink-0">
          <div className="p-4">
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

          <div className="flex-1 p-4 overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 min-h-0 relative">
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
              width={600}
              height={750}
              className="bg-white shadow-2xl cursor-crosshair rounded max-w-full max-h-full object-contain"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ touchAction: "none" }}
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

              {/* Debug: Show all sides layer count and background images */}
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
                      value={selectedDecoration.width}
                      onChange={(e) => {
                        const newWidth = parseInt(e.target.value);
                        if (maintainAspectRatio) {
                          const aspectRatio =
                            selectedDecoration.width /
                            selectedDecoration.height;
                          updateProperty("width", newWidth);
                          updateProperty("height", newWidth / aspectRatio);
                        } else {
                          updateProperty("width", newWidth);
                        }
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
                      value={selectedDecoration.height}
                      onChange={(e) => {
                        const newHeight = parseInt(e.target.value);
                        if (maintainAspectRatio) {
                          const aspectRatio =
                            selectedDecoration.width /
                            selectedDecoration.height;
                          updateProperty("height", newHeight);
                          updateProperty("width", newHeight * aspectRatio);
                        } else {
                          updateProperty("height", newHeight);
                        }
                      }}
                      className="w-full"
                      disabled={selectedDecoration.locked}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="maintain-aspect-ratio"
                      checked={maintainAspectRatio}
                      onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                      className="rounded"
                    />
                    <label
                      htmlFor="maintain-aspect-ratio"
                      className="text-sm font-medium"
                    >
                      Giữ Tỷ Lệ Khung Hình
                    </label>
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
