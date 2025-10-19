'use client';

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { createOrUpdateProductDesign } from '@/services/productDesignServices';
import { searchTemplates, type SearchTemplatesQuery } from '@/services/templateServices';
import { toast } from 'sonner';
import { Trash2, Eye, EyeOff, Lock, Unlock, MoveUp, MoveDown, Upload, Smile } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { TemplateSummaryItem } from '@/types/template';

// Dynamic import for emoji-picker-react - proper way
const EmojiPicker = dynamic(
  () => import('emoji-picker-react'),
  { 
    ssr: false,
    loading: () => <div className="p-4 text-center">Loading emoji picker...</div>
  }
);

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

interface EmojiDecoration extends BaseDecoration {
  type: 'emoji';
  content: string;
  size: number;
}

interface ImageDecoration extends BaseDecoration {
  type: 'image';
  imageUrl: string;
  width: number;
  height: number;
  imageElement?: HTMLImageElement;
}

type Decoration = EmojiDecoration | ImageDecoration;

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
  initialImage?: string;
  imageSource?: 'local' | 'url';
  designType?: 'tshirt' | 'hoodie' | 'polo' | 'tank' | 'longsleeve' | 'custom';
  productId?: string;
  productOptionValueId?: string;
  designName?: string;
}

const TShirtDesigner = forwardRef<CanvasRef, TShirtDesignerProps>(({ 
  initialImage = '/photo.png',
  imageSource = 'local',
  designType: initialDesignType = 'tshirt',
  productId,
  productOptionValueId,
  designName,
}, ref) => {
  const [shirtImage, setShirtImage] = useState<string>(
    imageSource === 'local' ? initialImage : initialImage
  );
  const [designType, setDesignType] = useState(initialDesignType);
  const [shirtColor, setShirtColor] = useState<ShirtColor>({ hex: '#ffffff' });
  const [decorations, setDecorations] = useState<Decoration[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState<ResizeState | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [savingDesign, setSavingDesign] = useState(false);
  const [lastClickPosition, setLastClickPosition] = useState<{x: number, y: number} | null>(null);
  const [clickCount, setClickCount] = useState(0);
  
  // Template selection states
  const [templates, setTemplates] = useState<TemplateSummaryItem[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const printAreaRef = useRef<PrintArea>({ x: 150, y: 200, width: 300, height: 400 });
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);

  const selectedDecoration = decorations.find(d => d.id === selectedId);

  // Get design type label
  const getDesignTypeLabel = () => {
    switch(designType) {
      case 'tshirt': return 'Áo Thun';
      case 'hoodie': return 'Áo Hoodie';
      case 'polo': return 'Áo Polo';
      case 'tank': return 'Áo Tank Top';
      case 'longsleeve': return 'Áo Dài Tay';
      case 'custom': return 'Trang Phục';
      default: return 'Quần Áo';
    }
  };

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
    };
    img.onerror = () => {
      console.error('Không thể tải hình ảnh:', shirtImage);
      img.src = 'https://i.imgur.com/5QKxXXp.png';
    };
    img.src = shirtImage;
  }, [shirtImage]);

  // Fetch templates on component mount
  useEffect(() => {
    const fetchTemplates = async () => {
      setTemplatesLoading(true);
      try {
        const query: SearchTemplatesQuery = {
          PageNumber: 1,
          PageSize: 50,
        };
        const response = await searchTemplates(query);
        if (response.success && response.data) {
          setTemplates(response.data.items);
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
      } finally {
        setTemplatesLoading(false);
      }
    };

    fetchTemplates();
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

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded || !imageRef.current) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw base image with color overlay
    ctx.save();
    
    // Apply color tint using color blend mode
    if (shirtColor.hex !== '#ffffff') {
      // First draw the base image
      ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
      
      // Apply color tint using color blend mode for accurate color replacement
      ctx.globalCompositeOperation = 'color';
      ctx.fillStyle = shirtColor.hex;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Restore blend mode
      ctx.globalCompositeOperation = 'source-over';
    } else {
      // Draw original image without color tint
      ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
    }
    ctx.restore();
    
    
    // Draw decorations
    decorations.forEach(dec => {
      if (!dec.visible) return;
      
      ctx.save();
      ctx.translate(dec.x, dec.y);
      ctx.rotate(dec.rotation * Math.PI / 180);
      ctx.globalAlpha = dec.opacity || 1;
      
      if (dec.type === 'emoji') {
        ctx.font = `${dec.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (dec.shadow) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
        }
        
        ctx.fillText(dec.content, 0, 0);
      } else if (dec.type === 'image' && dec.imageElement) {
        if (dec.shadow) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
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
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 4]);
        const bounds = getDecorationBounds(dec);
        ctx.strokeRect(-bounds.width / 2, -bounds.height / 2, bounds.width, bounds.height);
        drawResizeHandles(ctx, bounds);
      }
      
      // Debug: Vẽ bounds cho tất cả emoji (chỉ khi debug)
      if (dec.type === 'emoji' && process.env.NODE_ENV === 'development') {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        const bounds = getDecorationBounds(dec);
        ctx.strokeRect(-bounds.width / 2, -bounds.height / 2, bounds.width, bounds.height);
        ctx.setLineDash([]);
      }
      
      ctx.restore();
    });
  };

  const drawResizeHandles = (ctx: CanvasRenderingContext2D, bounds: Bounds) => {
    const handleSize = 10;
    const handles = [
      { x: -bounds.width / 2, y: -bounds.height / 2 },
      { x: bounds.width / 2, y: -bounds.height / 2 },
      { x: bounds.width / 2, y: bounds.height / 2 },
      { x: -bounds.width / 2, y: bounds.height / 2 },
    ];
    
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    
    handles.forEach(h => {
      ctx.fillRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
    });
  };

  const getDecorationBounds = (dec: Decoration): Bounds => {
    if (dec.type === 'emoji') {
      // Bounds thực tế của emoji dựa trên size
      // Emoji thường chiếm khoảng 70-80% của font size
      const actualSize = dec.size * 0.8;
      return { width: actualSize, height: actualSize };
    } else if (dec.type === 'image') {
      return { width: dec.width, height: dec.height };
    }
    return { width: 50, height: 50 };
  };
  
  // Debug function để kiểm tra collision
  const isPointInDecoration = (x: number, y: number, dec: Decoration): boolean => {
    const bounds = getDecorationBounds(dec);
    const dx = x - dec.x;
    const dy = y - dec.y;
    const isInside = Math.abs(dx) <= bounds.width / 2 && Math.abs(dy) <= bounds.height / 2;
    
    // Debug log cho emoji
    if (dec.type === 'emoji') {
      console.log(`Checking emoji ${dec.content} at (${dec.x}, ${dec.y}) with bounds ${bounds.width}x${bounds.height}`);
      console.log(`Click at (${x}, ${y}), offset (${dx}, ${dy}), isInside: ${isInside}`);
      
      // Nếu emoji và click gần nhau (trong vòng 50px), coi như click được
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 50) {
        console.log(`Emoji ${dec.content} is close enough (distance: ${distance})`);
        return true;
      }
    }
    
    return isInside;
  };

  useEffect(() => {
    if (imageLoaded) {
      drawCanvas();
    }
  }, [decorations, selectedId, shirtColor, imageLoaded]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    console.log('Mouse down at:', x, y);
    console.log('Decorations:', decorations.map(d => ({ id: d.id, x: d.x, y: d.y, visible: d.visible, locked: d.locked })));
    
    // Kiểm tra xem có phải click ở cùng vị trí không (để cycle qua decorations)
    const isSamePosition = lastClickPosition && 
      Math.abs(x - lastClickPosition.x) < 5 && 
      Math.abs(y - lastClickPosition.y) < 5;
    
    if (isSamePosition) {
      setClickCount(prev => prev + 1);
    } else {
      setClickCount(1);
      setLastClickPosition({ x, y });
    }
    
    // Tìm tất cả decorations có thể click được tại vị trí này
    const clickableDecorations = decorations
      .map((dec, index) => ({ dec, index }))
      .filter(({ dec }) => !dec.locked && dec.visible)
      .filter(({ dec }) => isPointInDecoration(x, y, dec));
    
    console.log('Clickable decorations:', clickableDecorations.map(({ dec, index }) => ({ id: dec.id, index })));
    console.log('Click count:', clickCount);
    
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
      console.log(`Selected decoration ${dec.id} at index ${index} (selected index: ${selectedIndex})`);
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
        if (Math.abs(x - handle.x) <= handleSize && Math.abs(y - handle.y) <= handleSize) {
          const startSize = dec.type === 'emoji' ? dec.size : dec.width;
          setResizing({ startX: x, startY: y, startSize });
          isResizeHandle = true;
          console.log('Resize handle clicked');
          break;
        }
      }
      
      if (!isResizeHandle) {
        // Nếu không phải resize handle thì bắt đầu drag
        const dx = x - dec.x;
        const dy = y - dec.y;
        setDragging(true);
        setDragOffset({ x: dx, y: dy });
        console.log('Started dragging with offset:', dx, dy);
        
        // Force re-render để đảm bảo dragging state được cập nhật
        setTimeout(() => {
          console.log('Dragging state after timeout:', dragging);
        }, 100);
      }
    } else {
      // Nếu không click vào decoration nào thì bỏ chọn
      console.log('No decoration clicked, deselecting');
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
    
    console.log('Mouse move:', { x, y, dragging, resizing, selectedId });
    
    if (resizing && selectedId !== null) {
      const dx = x - resizing.startX;
      const dy = y - resizing.startY;
      const delta = Math.max(dx, dy);
      const newSize = Math.max(20, resizing.startSize + delta);
      
      console.log('Resizing to:', newSize);
      setDecorations(prevDecorations => prevDecorations.map(d => {
        if (d.id === selectedId) {
          if (d.type === 'emoji') {
            return { ...d, size: newSize };
          } else if (d.type === 'image') {
            const aspectRatio = d.width / d.height;
            return { 
              ...d, 
              width: newSize, 
              height: newSize / aspectRatio 
            };
          }
        }
        return d;
      }));
    } else if (dragging && selectedId !== null) {
      const newX = x - dragOffset.x;
      const newY = y - dragOffset.y;
      console.log('Dragging to:', { newX, newY, dragOffset });
      
      setDecorations(prevDecorations => prevDecorations.map(d => 
        d.id === selectedId 
          ? { ...d, x: newX, y: newY }
          : d
      ));
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
        console.log('Global mouse move dragging to:', { newX, newY, dragOffset });
        
        setDecorations(prevDecorations => prevDecorations.map(d => 
          d.id === selectedId 
            ? { ...d, x: newX, y: newY }
            : d
        ));
      }
    };

    const handleGlobalMouseUp = () => {
      if (dragging) {
        console.log('Global mouse up, stopping drag');
        setDragging(false);
        setResizing(null);
      }
    };

    if (dragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [dragging, selectedId, dragOffset]);

  const handleMouseUp = () => {
    console.log('Mouse up:', { dragging, resizing, selectedId });
    setDragging(false);
    setResizing(null);
  };

  const addEmojiDecoration = (emojiObject: any) => {
    // Đặt emoji ở trung tâm canvas thay vì print area
    const canvas = canvasRef.current;
    const centerX = canvas ? canvas.width / 2 : 300;
    const centerY = canvas ? canvas.height / 2 : 375;
    
    const newDecoration: EmojiDecoration = {
      id: Date.now(),
      type: 'emoji',
      content: emojiObject.emoji,
      x: centerX,
      y: centerY,
      size: 80, // Tăng size mặc định để dễ click hơn
      rotation: 0,
      visible: true,
      locked: false,
      shadow: true,
      opacity: 1,
      name: emojiObject.names?.[0] || 'Emoji'
    };
    
    console.log('Adding emoji decoration at center:', newDecoration);
    setDecorations([...decorations, newDecoration]);
    setSelectedId(newDecoration.id);
    setShowEmojiPicker(false);
  };

  const addImageDecoration = (imageUrl: string, imageName: string = 'Hình Ảnh') => {
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
        id: Date.now(),
        type: 'image',
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
        name: imageName
      };
      
      setDecorations(prev => [...prev, newImageDecoration]);
      setSelectedId(newImageDecoration.id);
      setUploadingImage(false);
    };
    
    img.onerror = () => {
      console.error('Không thể tải hình ảnh');
      setUploadingImage(false);
      alert('Không thể tải hình ảnh. Vui lòng thử hình ảnh khác.');
    };
    
    img.src = imageUrl;
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    addImageDecoration
  }));

  const handleDecorationImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingImage(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          addImageDecoration(event.target.result as string, file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleVisibility = (id: number) => {
    setDecorations(decorations.map(d => 
      d.id === id ? { ...d, visible: !d.visible } : d
    ));
  };

  const toggleLock = (id: number) => {
    setDecorations(decorations.map(d => 
      d.id === id ? { ...d, locked: !d.locked } : d
    ));
  };

  const deleteDecoration = (id: number) => {
    setDecorations(decorations.filter(d => d.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const moveLayer = (id: number, direction: 'up' | 'down') => {
    const index = decorations.findIndex(d => d.id === id);
    if (direction === 'up' && index < decorations.length - 1) {
      const newDecorations = [...decorations];
      [newDecorations[index], newDecorations[index + 1]] = [newDecorations[index + 1], newDecorations[index]];
      setDecorations(newDecorations);
    } else if (direction === 'down' && index > 0) {
      const newDecorations = [...decorations];
      [newDecorations[index], newDecorations[index - 1]] = [newDecorations[index - 1], newDecorations[index]];
      setDecorations(newDecorations);
    }
  };

  const updateProperty = <K extends keyof (EmojiDecoration & ImageDecoration)>(
    property: K, 
    value: any
  ) => {
    setDecorations(decorations.map(d => 
      d.id === selectedId ? { ...d, [property]: value } as Decoration : d
    ));
  };

  const saveDesign = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!productId || !productOptionValueId) {
      toast.error('Thiếu productId hoặc productOptionValueId để lưu thiết kế.');
      return;
    }

    try {
      setSavingDesign(true);
      const imageDecorations = decorations.filter(d => d.type === 'image') as ImageDecoration[];
      const icons = imageDecorations.map(d => ({ imageUrl: d.imageUrl }));

      const payload = {
        productDesignId: '',
        productId,
        productOptionValueId,
        name: designName || `Thiết kế ${getDesignTypeLabel()}`,
        icons,
        templates: [],
      };

      const res = await createOrUpdateProductDesign(payload);
      if (res.success) {
        toast.success('Lưu thiết kế thành công!');
      } else {
        toast.error('Lưu thiết kế thất bại.');
      }
    } catch (e) {
      console.error(e);
      toast.error('Có lỗi xảy ra khi lưu thiết kế.');
    } finally {
      setSavingDesign(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setShirtImage(event.target.result as string);
          setShowTemplateDialog(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlSubmit = () => {
    if (tempImageUrl.trim()) {
      setShirtImage(tempImageUrl.trim());
      setShowTemplateDialog(false);
      setTempImageUrl('');
    }
  };

  return (
    <div className="w-full h-full bg-gray-50 flex overflow-hidden">
      <div className="w-64 bg-white border-r overflow-y-auto flex-shrink-0">
        <div className="p-4">
          <div className="mb-4">
            <h3 className="font-semibold mb-2 text-sm">Mẫu Áo</h3>
            <button
              onClick={() => setShowTemplateDialog(true)}
              className="w-full bg-purple-500 text-white px-3 py-2 rounded hover:bg-purple-600 flex items-center justify-center gap-2 font-medium text-sm"
            >
              <Upload size={16} /> Chọn Mẫu Áo
            </button>
          </div>
          
          <div className="mb-4">
            <h3 className="font-semibold mb-2 text-sm">Màu Sắc Áo</h3>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-600">Màu: {shirtColor.hex}</label>
                <input
                  type="color"
                  value={shirtColor.hex}
                  onChange={(e) => setShirtColor({hex: e.target.value})}
                  className="w-full h-10 rounded border-2 border-gray-300"
                />
              </div>
              <button
                onClick={() => setShirtColor({ hex: '#ffffff' })}
                className="text-xs text-blue-600 hover:underline"
              >
                Đặt Lại Màu Gốc
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="font-semibold mb-2 text-sm">Thêm Emoji</h3>
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="w-full bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 flex items-center justify-center gap-2 font-medium text-sm"
            >
              <Smile size={16} /> {showEmojiPicker ? 'Đóng' : 'Mở'} Bộ Chọn Emoji
            </button>
            
            {showEmojiPicker && (
              <div ref={emojiPickerRef} className="mt-2 relative z-50 shadow-lg rounded-lg overflow-hidden">
                {/* @ts-ignore - emoji-picker-react type issue with dynamic import */}
                <EmojiPicker
                  onEmojiClick={addEmojiDecoration}
                  width={256}
                  height={400}
                />
              </div>
            )}
          </div>
          
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
                onClick={() => document.getElementById('decoration-image-upload')?.click()}
                disabled={uploadingImage}
                className="w-full bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 flex items-center justify-center gap-2 font-medium text-sm disabled:opacity-50"
              >
                <Upload size={16} /> {uploadingImage ? 'Đang Tải...' : 'Tải Hình Ảnh'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white border-b p-3 flex items-center justify-between flex-shrink-0">
          <h1 className="text-xl font-bold">Thiết Kế Áo</h1>
          <button
            onClick={saveDesign}
            disabled={savingDesign}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 font-medium text-sm disabled:opacity-60"
          >
            💾 {savingDesign ? 'Đang lưu...' : 'Lưu Thiết Kế'}
          </button>
        </div>
        
        <div className="flex-1 p-4 overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 min-h-0">
          <canvas
            ref={canvasRef}
            width={600}
            height={750}
            className="bg-white shadow-2xl cursor-crosshair rounded max-w-full max-h-full object-contain"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ touchAction: 'none' }}
          />
        </div>
      </div>
      
      <div className="w-64 bg-white border-l overflow-y-auto flex-shrink-0">
        <div className="p-4">
          <h2 className="text-lg font-bold mb-4">📚 Lớp</h2>
          
          <div className="mb-3 p-3 bg-blue-50 border-2 border-blue-200 rounded">
            <div className="flex items-center gap-2">
              <span className="text-xl">👔</span>
              <span className="font-semibold text-sm">Nền {getDesignTypeLabel()}</span>
              <Lock size={14} className="ml-auto text-gray-500" />
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            {[...decorations].reverse().map((dec, reversedIndex) => {
              const actualIndex = decorations.length - 1 - reversedIndex;
              return (
                <div
                  key={dec.id}
                  className={`p-2 border-2 rounded flex items-center gap-2 cursor-pointer transition ${
                    selectedId === dec.id ? 'bg-blue-100 border-blue-500 shadow' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedId(dec.id)}
                >
                  <span className="text-lg">
                    {dec.type === 'emoji' ? dec.content : '🖼️'}
                  </span>
                  <span className="flex-1 text-sm font-medium truncate">{dec.name}</span>
                  
                  <button onClick={(e) => { e.stopPropagation(); moveLayer(dec.id, 'up'); }} 
                          disabled={actualIndex === decorations.length - 1}
                          className="p-1 hover:bg-gray-300 rounded disabled:opacity-30 transition">
                    <MoveUp size={14} />
                  </button>
                  
                  <button onClick={(e) => { e.stopPropagation(); moveLayer(dec.id, 'down'); }}
                          disabled={actualIndex === 0}
                          className="p-1 hover:bg-gray-300 rounded disabled:opacity-30 transition">
                    <MoveDown size={14} />
                  </button>
                  
                  <button onClick={(e) => { e.stopPropagation(); toggleVisibility(dec.id); }} 
                          className="p-1 hover:bg-gray-300 rounded transition">
                    {dec.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  
                  <button onClick={(e) => { e.stopPropagation(); toggleLock(dec.id); }}
                          className="p-1 hover:bg-gray-300 rounded transition">
                    {dec.locked ? <Lock size={14} /> : <Unlock size={14} />}
                  </button>
                  
                  <button onClick={(e) => { e.stopPropagation(); deleteDecoration(dec.id); }}
                          className="p-1 hover:bg-red-200 rounded text-red-600 transition">
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
            
            {decorations.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                Chưa có trang trí nào.<br/>Thêm từ bảng điều khiển bên trái!
              </div>
            )}
          </div>
          
          {selectedDecoration && (
            <div className="border-t-2 pt-4">
              <h3 className="font-bold mb-3 text-lg">⚙️ Thuộc Tính</h3>
              
              <div className="space-y-3">
                {selectedDecoration.type === 'emoji' && (
                  <div>
                    <label className="text-sm font-semibold block mb-1">Kích Thước: {selectedDecoration.size}px</label>
                    <input
                      type="range"
                      min="30"
                      max="300"
                      value={selectedDecoration.size}
                      onChange={(e) => updateProperty('size', parseInt(e.target.value))}
                      className="w-full"
                      disabled={selectedDecoration.locked}
                    />
                  </div>
                )}
                
                {selectedDecoration.type === 'image' && (
                  <>
                    <div>
                      <label className="text-sm font-semibold block mb-1">Chiều Rộng: {Math.round(selectedDecoration.width)}px</label>
                      <input
                        type="range"
                        min="50"
                        max="500"
                        value={selectedDecoration.width}
                        onChange={(e) => {
                          const newWidth = parseInt(e.target.value);
                          if (maintainAspectRatio) {
                            const aspectRatio = selectedDecoration.width / selectedDecoration.height;
                            updateProperty('width', newWidth);
                            updateProperty('height', newWidth / aspectRatio);
                          } else {
                            updateProperty('width', newWidth);
                          }
                        }}
                        className="w-full"
                        disabled={selectedDecoration.locked}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-semibold block mb-1">Chiều Cao: {Math.round(selectedDecoration.height)}px</label>
                      <input
                        type="range"
                        min="50"
                        max="500"
                        value={selectedDecoration.height}
                        onChange={(e) => {
                          const newHeight = parseInt(e.target.value);
                          if (maintainAspectRatio) {
                            const aspectRatio = selectedDecoration.width / selectedDecoration.height;
                            updateProperty('height', newHeight);
                            updateProperty('width', newHeight * aspectRatio);
                          } else {
                            updateProperty('height', newHeight);
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
                      <label htmlFor="maintain-aspect-ratio" className="text-sm font-medium">
                        Giữ Tỷ Lệ Khung Hình
                      </label>
                    </div>
                  </>
                )}
                
                <div>
                  <label className="text-sm font-semibold block mb-1">Xoay: {selectedDecoration.rotation}°</label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={selectedDecoration.rotation}
                    onChange={(e) => updateProperty('rotation', parseInt(e.target.value))}
                    className="w-full"
                    disabled={selectedDecoration.locked}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-semibold block mb-1">Độ Trong Suốt: {Math.round(selectedDecoration.opacity * 100)}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedDecoration.opacity * 100}
                    onChange={(e) => updateProperty('opacity', parseInt(e.target.value) / 100)}
                    className="w-full"
                    disabled={selectedDecoration.locked}
                  />
                </div>
                
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedDecoration.shadow}
                      onChange={(e) => updateProperty('shadow', e.target.checked)}
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
      
      {/* Template Selection Dialog */}
      {showTemplateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowTemplateDialog(false)}>
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Chọn Mẫu Áo</h3>
            
            {templatesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
                  <p className="text-gray-600">Đang tải mẫu áo...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold mb-3">Mẫu Áo Có Sẵn</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => {
                          setShirtImage(template.imageUrl);
                          setDesignType('tshirt'); // Default to tshirt, could be enhanced to detect from template
                          setShowTemplateDialog(false);
                        }}
                        className="p-4 bg-gray-50 hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-300 rounded-lg text-center transition-all group"
                      >
                        <div className="mb-3">
                          <img 
                            src={template.imageUrl} 
                            alt={template.productName}
                            className="w-full h-24 object-cover rounded shadow-sm group-hover:shadow-md transition-shadow"
                          />
                        </div>
                        <div className="text-sm font-medium text-gray-800 truncate">
                          {template.productName}
                        </div>
                        <div className="text-xs text-gray-500 truncate mt-1">
                          {template.productOptionValue}
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {templates.length === 0 && !templatesLoading && (
                    <div className="text-center py-8 text-gray-500">
                      <p>Không có mẫu áo nào được tìm thấy.</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-3">Tùy Chỉnh</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Tải Lên Từ Máy Tính</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full border-2 border-gray-300 rounded p-2 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-2">Sử Dụng URL Hình Ảnh</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={tempImageUrl}
                          onChange={(e) => setTempImageUrl(e.target.value)}
                          placeholder="https://example.com/image.png"
                          className="flex-1 border-2 border-gray-300 rounded px-3 py-2 text-sm"
                          onKeyPress={(e) => e.key === 'Enter' && handleImageUrlSubmit()}
                        />
                        <button
                          onClick={handleImageUrlSubmit}
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 font-medium text-sm"
                        >
                          Tải
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <button
              onClick={() => setShowTemplateDialog(false)}
              className="w-full mt-6 bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded font-medium text-sm"
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
})

export default TShirtDesigner;