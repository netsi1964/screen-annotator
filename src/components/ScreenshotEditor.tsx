import { ContextMenuTrigger } from "@/components/ui/context-menu";
import { isExtension } from "@/lib/extension";
import {
  ActiveSelection,
  Circle,
  Control,
  controlsUtils,
  Canvas as FabricCanvas,
  FabricImage,
  FabricObject,
  Group,
  IText,
  Line,
  Path,
  PencilBrush,
  Rect,
  TPointerEvent,
  Transform
} from "fabric";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ActionBar } from "./ActionBar";
import { ArrowControls, ArrowSettings, generateArrowPath } from "./ArrowControls";
import { CanvasContextMenu } from "./CanvasContextMenu";
import { ColorPicker } from "./ColorPicker";
import { ShadowControls, ShadowSettings } from "./ShadowControls";
import { Toolbar } from "./Toolbar";

export type Tool = "select" | "draw" | "rectangle" | "circle" | "arrow" | "line" | "text" | "highlight" | "crop";

interface ScreenshotEditorProps {
  screenshot: string | null;
  onClear: () => void;
  capturedUrl?: string;
}

// Helper to check for Cmd (Mac) or Ctrl (PC)
const isModifierKey = (e: TPointerEvent) => {
  const mouseEvent = e as MouseEvent;
  return mouseEvent.metaKey || mouseEvent.ctrlKey;
};

// Rotate cursor as data URL (SVG encoded)
const rotateCursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8'/%3E%3Cpath d='M21 3v5h-5'/%3E%3C/svg%3E") 12 12, crosshair`;

// Custom control action handlers
const customCornerAction = (eventData: TPointerEvent, transform: Transform, x: number, y: number) => {
  const e = eventData as MouseEvent;
  if (e.metaKey || e.ctrlKey) {
    // Rotate when Cmd/Ctrl is held
    return controlsUtils.rotationWithSnapping(eventData, transform, x, y);
  }
  // Always use uniform scaling from corners - Shift constraint handled via object:scaling event
  return controlsUtils.scalingEqually(eventData, transform, x, y);
};

const customSideActionX = (eventData: TPointerEvent, transform: Transform, x: number, y: number) => {
  if (isModifierKey(eventData)) {
    return controlsUtils.skewHandlerX(eventData, transform, x, y);
  }
  return controlsUtils.scalingXOrSkewingY(eventData, transform, x, y);
};

const customSideActionY = (eventData: TPointerEvent, transform: Transform, x: number, y: number) => {
  if (isModifierKey(eventData)) {
    return controlsUtils.skewHandlerY(eventData, transform, x, y);
  }
  return controlsUtils.scalingYOrSkewingX(eventData, transform, x, y);
};

// Setup custom controls on an object
const setupCustomControls = (obj: FabricObject) => {
  // Corner controls - rotate on Cmd/Ctrl
  obj.controls.tl = new Control({
    x: -0.5,
    y: -0.5,
    actionHandler: customCornerAction,
    cursorStyleHandler: (eventData) => {
      return isModifierKey(eventData) ? rotateCursor : 'nwse-resize';
    },
    actionName: 'scale',
  });
  
  obj.controls.tr = new Control({
    x: 0.5,
    y: -0.5,
    actionHandler: customCornerAction,
    cursorStyleHandler: (eventData) => {
      return isModifierKey(eventData) ? rotateCursor : 'nesw-resize';
    },
    actionName: 'scale',
  });
  
  obj.controls.bl = new Control({
    x: -0.5,
    y: 0.5,
    actionHandler: customCornerAction,
    cursorStyleHandler: (eventData) => {
      return isModifierKey(eventData) ? rotateCursor : 'nesw-resize';
    },
    actionName: 'scale',
  });
  
  obj.controls.br = new Control({
    x: 0.5,
    y: 0.5,
    actionHandler: customCornerAction,
    cursorStyleHandler: (eventData) => {
      return isModifierKey(eventData) ? rotateCursor : 'nwse-resize';
    },
    actionName: 'scale',
  });

  // Side controls - skew/distort on Cmd/Ctrl
  obj.controls.mt = new Control({
    x: 0,
    y: -0.5,
    actionHandler: customSideActionY,
    cursorStyleHandler: (eventData) => {
      return isModifierKey(eventData) ? 'ew-resize' : 'ns-resize';
    },
    actionName: 'scale',
  });
  
  obj.controls.mb = new Control({
    x: 0,
    y: 0.5,
    actionHandler: customSideActionY,
    cursorStyleHandler: (eventData) => {
      return isModifierKey(eventData) ? 'ew-resize' : 'ns-resize';
    },
    actionName: 'scale',
  });
  
  obj.controls.ml = new Control({
    x: -0.5,
    y: 0,
    actionHandler: customSideActionX,
    cursorStyleHandler: (eventData) => {
      return isModifierKey(eventData) ? 'ns-resize' : 'ew-resize';
    },
    actionName: 'scale',
  });
  
  obj.controls.mr = new Control({
    x: 0.5,
    y: 0,
    actionHandler: customSideActionX,
    cursorStyleHandler: (eventData) => {
      return isModifierKey(eventData) ? 'ns-resize' : 'ew-resize';
    },
    actionName: 'scale',
  });

  return obj;
};

export const ScreenshotEditor = ({ screenshot, onClear, capturedUrl }: ScreenshotEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [strokeColor, setStrokeColor] = useState("#00BFFF");
  const [fillColor, setFillColor] = useState<string | null>(null);
  const [strokeOpacity, setStrokeOpacity] = useState(1);
  const [fillOpacity, setFillOpacity] = useState(1);
  const [strokeWidth, setStrokeWidth] = useState(3);
  // Start with highlight tool in extension mode, select otherwise
  const [activeTool, setActiveTool] = useState<Tool>(isExtension() ? "highlight" : "select");
  const [showUrlDateTime, setShowUrlDateTime] = useState({ url: false, datetime: false });
  const [hasSelection, setHasSelection] = useState(false);
  const [isGroup, setIsGroup] = useState(false);
  const [shadowSettings, setShadowSettings] = useState<ShadowSettings>({
    enabled: false,
    color: "#000000",
    blur: 10,
    offsetX: 4,
    offsetY: 4,
  });
  const [arrowSettings, setArrowSettings] = useState<ArrowSettings>({
    startType: "none",
    endType: "arrow",
    size: 15,
    strokeWidth: 3,
  });
  const [selectedArrow, setSelectedArrow] = useState<Path | null>(null);
  const clipboardRef = useRef<FabricObject | null>(null);
  
  // Crop state
  const [isCropping, setIsCropping] = useState(false);
  const cropRectRef = useRef<Rect | null>(null);
  
  // Undo/Redo history
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const isUndoRedoRef = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Helper to convert hex color to rgba with opacity
  const hexToRgba = (hex: string, opacity: number) => {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Update selected objects' opacity (including image opacity via fill opacity control)
  const handleUpdateSelectedObjects = useCallback((type: 'stroke' | 'fill', opacity: number) => {
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    activeObjects.forEach(obj => {
      // For images, use fill opacity to control image opacity
      if (type === 'fill' && obj instanceof FabricImage) {
        obj.set('opacity', opacity);
      } else if (type === 'stroke' && 'stroke' in obj) {
        const currentStroke = (obj as any).stroke;
        if (currentStroke && typeof currentStroke === 'string') {
          // Extract base color and apply new opacity
          const baseColor = currentStroke.startsWith('rgba') 
            ? strokeColor 
            : currentStroke;
          (obj as any).set('stroke', hexToRgba(baseColor.startsWith('#') ? baseColor : strokeColor, opacity));
        }
      } else if (type === 'fill' && 'fill' in obj) {
        const currentFill = (obj as any).fill;
        if (currentFill && typeof currentFill === 'string' && currentFill !== 'transparent') {
          const baseColor = currentFill.startsWith('rgba')
            ? (fillColor || strokeColor)
            : currentFill;
          (obj as any).set('fill', hexToRgba(baseColor.startsWith('#') ? baseColor : (fillColor || strokeColor), opacity));
        }
      }
    });
    fabricCanvas.renderAll();
  }, [fabricCanvas, strokeColor, fillColor]);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || !screenshot) return;

    let canvas: FabricCanvas | null = null;

    const initCanvas = async () => {
      try {
        // Load image first to get dimensions
        const fabricImg = await FabricImage.fromURL(screenshot, { crossOrigin: 'anonymous' });
        
        const imgWidth = fabricImg.width || 800;
        const imgHeight = fabricImg.height || 600;
        
        const maxWidth = window.innerWidth - 160;
        const maxHeight = window.innerHeight - 200;
        
        let width = imgWidth;
        let height = imgHeight;
        
        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = height * ratio;
        }
        
        if (height > maxHeight) {
          const ratio = maxHeight / height;
          height = maxHeight;
          width = width * ratio;
        }

        canvas = new FabricCanvas(canvasRef.current!, {
          width,
          height,
          backgroundColor: "#1a1a2e",
          selection: true,
        });

        // Scale and set background
        fabricImg.scaleX = width / imgWidth;
        fabricImg.scaleY = height / imgHeight;
        canvas.backgroundImage = fabricImg;
        canvas.renderAll();

        // Initialize drawing brush
        canvas.freeDrawingBrush = new PencilBrush(canvas);
        canvas.freeDrawingBrush.color = strokeColor;
        canvas.freeDrawingBrush.width = 3;

        // Track selection changes
        canvas.on('selection:created', () => {
          setHasSelection(true);
          const active = canvas.getActiveObject();
          setIsGroup(active instanceof Group);
          if (active && active.shadow) {
            const shadow = active.shadow as { color?: string; blur?: number; offsetX?: number; offsetY?: number };
            setShadowSettings({
              enabled: true,
              color: shadow.color || "#000000",
              blur: shadow.blur || 10,
              offsetX: shadow.offsetX || 4,
              offsetY: shadow.offsetY || 4,
            });
          } else {
            setShadowSettings(prev => ({ ...prev, enabled: false }));
          }
          // Check if selected object is an arrow
          const data = (active as any)?.data;
          if (data?.type === 'arrow' && active instanceof Path) {
            setSelectedArrow(active);
            if (data.settings) {
              setArrowSettings(data.settings);
            }
          } else {
            setSelectedArrow(null);
          }
        });
        canvas.on('selection:updated', () => {
          setHasSelection(true);
          const active = canvas.getActiveObject();
          setIsGroup(active instanceof Group);
          if (active && active.shadow) {
            const shadow = active.shadow as { color?: string; blur?: number; offsetX?: number; offsetY?: number };
            setShadowSettings({
              enabled: true,
              color: shadow.color || "#000000",
              blur: shadow.blur || 10,
              offsetX: shadow.offsetX || 4,
              offsetY: shadow.offsetY || 4,
            });
          } else {
            setShadowSettings(prev => ({ ...prev, enabled: false }));
          }
          // Check if selected object is an arrow
          const data = (active as any)?.data;
          if (data?.type === 'arrow' && active instanceof Path) {
            setSelectedArrow(active);
            if (data.settings) {
              setArrowSettings(data.settings);
            }
          } else {
            setSelectedArrow(null);
          }
        });
        canvas.on('selection:cleared', () => {
          setHasSelection(false);
          setIsGroup(false);
          setShadowSettings(prev => ({ ...prev, enabled: false }));
          setSelectedArrow(null);
        });

        // Track object removal to update URL/DateTime toggle state
        canvas.on('object:removed', (e) => {
          const obj = e.target as any;
          if (obj?.data?.type === 'url') {
            setShowUrlDateTime(prev => ({ ...prev, url: false }));
          }
          if (obj?.data?.type === 'datetime') {
            setShowUrlDateTime(prev => ({ ...prev, datetime: false }));
          }
        });

        setFabricCanvas(canvas);
        
        // Save initial state after a short delay to let canvas fully render
        setTimeout(() => {
          if (canvas) {
            const state = {
              json: canvas.toJSON(),
              width: canvas.width,
              height: canvas.height,
            };
            historyRef.current = [JSON.stringify(state)];
            historyIndexRef.current = 0;
          }
        }, 100);
        
        toast.success("Screenshot loaded! Start annotating.");
      } catch (error) {
        console.error("Failed to load image:", error);
        toast.error("Failed to load image");
      }
    };

    initCanvas();

    return () => {
      if (canvas) {
        canvas.dispose();
      }
    };
  }, [screenshot]);

  // Update tool mode
  useEffect(() => {
    if (!fabricCanvas) return;
    fabricCanvas.isDrawingMode = activeTool === "draw" || activeTool === "highlight";
    
    if (fabricCanvas.freeDrawingBrush) {
      if (activeTool === "highlight") {
        const highlightColor = fillColor || strokeColor;
        fabricCanvas.freeDrawingBrush.color = hexToRgba(highlightColor, 0.5);
        fabricCanvas.freeDrawingBrush.width = 20;
      } else {
        fabricCanvas.freeDrawingBrush.color = hexToRgba(strokeColor, strokeOpacity);
        fabricCanvas.freeDrawingBrush.width = 3;
      }
    }
    
    // Cancel crop mode when switching tools
    if (activeTool !== "crop" && isCropping) {
      handleCancelCrop();
    }
  }, [activeTool, strokeColor, strokeOpacity, fillColor, fabricCanvas, hexToRgba]);

  const addShape = useCallback((tool: Tool) => {
    if (!fabricCanvas) return;

    const centerX = fabricCanvas.width! / 2;
    const centerY = fabricCanvas.height! / 2;

    let shape: FabricObject | null = null;

    switch (tool) {
      case "rectangle":
        shape = new Rect({
          left: centerX - 50,
          top: centerY - 30,
          width: 100,
          height: 60,
          fill: fillColor ? hexToRgba(fillColor, fillOpacity) : "transparent",
          stroke: hexToRgba(strokeColor, strokeOpacity),
          strokeWidth: strokeWidth,
          strokeUniform: true,
          rx: 4,
          ry: 4,
        });
        break;

      case "circle":
        shape = new Circle({
          left: centerX - 40,
          top: centerY - 40,
          radius: 40,
          fill: fillColor ? hexToRgba(fillColor, fillOpacity) : "transparent",
          stroke: hexToRgba(strokeColor, strokeOpacity),
          strokeWidth: strokeWidth,
          strokeUniform: true,
        });
        break;

      case "line":
        shape = new Line([centerX - 50, centerY, centerX + 50, centerY], {
          stroke: hexToRgba(strokeColor, strokeOpacity),
          strokeWidth: strokeWidth,
          strokeUniform: true,
        });
        break;

      case "arrow":
        // Create arrow as a single Path
        const arrowLength = 100;
        const startX = centerX - arrowLength / 2;
        const endX = centerX + arrowLength / 2;
        
        const pathData = generateArrowPath(startX, centerY, endX, centerY, arrowSettings);
        
        const arrowPath = new Path(pathData, {
          stroke: hexToRgba(strokeColor, strokeOpacity),
          strokeWidth: arrowSettings.strokeWidth,
          fill: 'transparent',
          strokeLineCap: 'round',
          strokeLineJoin: 'round',
          data: { 
            type: 'arrow',
            x1: startX,
            y1: centerY,
            x2: endX,
            y2: centerY,
            settings: { ...arrowSettings }
          },
        });
        
        setupCustomControls(arrowPath);
        fabricCanvas.add(arrowPath);
        fabricCanvas.setActiveObject(arrowPath);
        fabricCanvas.renderAll();
        setActiveTool("select");
        return;

      case "text":
        shape = new IText("Double-click to edit", {
          left: centerX - 80,
          top: centerY - 15,
          fontSize: 20,
          fill: hexToRgba(strokeColor, strokeOpacity),
          fontFamily: "Inter, sans-serif",
          fontWeight: "600",
        });
        break;
    }

    if (shape) {
      setupCustomControls(shape);
      fabricCanvas.add(shape);
      fabricCanvas.setActiveObject(shape);
      fabricCanvas.renderAll();
    }
    
    setActiveTool("select");
  }, [fabricCanvas, strokeColor, fillColor, strokeOpacity, fillOpacity, strokeWidth, hexToRgba]);

  // Save canvas state to history (including dimensions)
  const saveHistory = useCallback(() => {
    if (!fabricCanvas || isUndoRedoRef.current) return;
    
    // Include canvas dimensions in the saved state
    const state = {
      json: fabricCanvas.toJSON(),
      width: fabricCanvas.width,
      height: fabricCanvas.height,
    };
    const stateString = JSON.stringify(state);
    
    // Truncate redo history
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(stateString);
    historyIndexRef.current = historyRef.current.length - 1;
    
    // Limit history size
    if (historyRef.current.length > 50) {
      historyRef.current.shift();
      historyIndexRef.current--;
    }
    
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, [fabricCanvas]);

  const handleToolClick = (tool: Tool) => {
    setActiveTool(tool);
    if (tool === "crop") {
      startCropping();
    } else if (tool !== "select" && tool !== "draw" && tool !== "highlight") {
      addShape(tool);
    }
  };

  // Start crop mode
  const startCropping = useCallback(() => {
    if (!fabricCanvas) return;
    
    // Clear any existing crop rect
    if (cropRectRef.current) {
      fabricCanvas.remove(cropRectRef.current);
    }
    
    const canvasWidth = fabricCanvas.width || 800;
    const canvasHeight = fabricCanvas.height || 600;
    
    // Create crop area with margin
    const margin = 40;
    const cropRect = new Rect({
      left: margin,
      top: margin,
      width: canvasWidth - margin * 2,
      height: canvasHeight - margin * 2,
      fill: 'transparent',
      stroke: '#00BFFF',
      strokeWidth: 2,
      strokeDashArray: [6, 3],
      cornerColor: '#00BFFF',
      cornerStrokeColor: '#ffffff',
      cornerSize: 10,
      transparentCorners: false,
      data: { type: 'crop-rect' },
    });
    
    // Setup custom controls for crop rect (allows rotation with Cmd/Ctrl+drag)
    setupCustomControls(cropRect);
    
    cropRectRef.current = cropRect;
    fabricCanvas.add(cropRect);
    fabricCanvas.setActiveObject(cropRect);
    fabricCanvas.renderAll();
    setIsCropping(true);
    toast.info("Adjust crop area. Hold ⌘/Ctrl on corners to rotate.");
  }, [fabricCanvas]);

  // Cancel crop
  const handleCancelCrop = useCallback(() => {
    if (!fabricCanvas) return;
    
    if (cropRectRef.current) {
      fabricCanvas.remove(cropRectRef.current);
      cropRectRef.current = null;
    }
    
    setIsCropping(false);
    setActiveTool("select");
    fabricCanvas.renderAll();
  }, [fabricCanvas]);

  // Apply crop
  const handleApplyCrop = useCallback(() => {
    if (!fabricCanvas || !cropRectRef.current) return;
    
    const cropRect = cropRectRef.current;
    const angle = cropRect.angle || 0;
    const scaleX = cropRect.scaleX || 1;
    const scaleY = cropRect.scaleY || 1;
    const width = (cropRect.width || 100) * scaleX;
    const height = (cropRect.height || 100) * scaleY;
    
    // Get the bounding rect (accounts for rotation)
    const boundingRect = cropRect.getBoundingRect();
    
    // Remove crop rect before export
    fabricCanvas.remove(cropRect);
    cropRectRef.current = null;
    fabricCanvas.discardActiveObject();
    fabricCanvas.renderAll();
    
    // If rotated, we need to handle differently
    if (Math.abs(angle) > 0.1) {
      // Create a temporary canvas to handle rotated crop
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d')!;
      
      // Export the bounding area first
      const boundingDataUrl = fabricCanvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 1,
        left: boundingRect.left,
        top: boundingRect.top,
        width: boundingRect.width,
        height: boundingRect.height,
      });
      
      // Load the bounding area image
      const img = new Image();
      img.onload = () => {
        // Set temp canvas to final crop size
        tempCanvas.width = width;
        tempCanvas.height = height;
        
        // Calculate center offset
        const centerX = boundingRect.width / 2;
        const centerY = boundingRect.height / 2;
        
        // Transform to counter-rotate and crop
        tempCtx.translate(width / 2, height / 2);
        tempCtx.rotate(-angle * Math.PI / 180);
        tempCtx.translate(-centerX, -centerY);
        tempCtx.drawImage(img, 0, 0);
        
        // Get the cropped result
        const croppedDataUrl = tempCanvas.toDataURL('image/png');
        
        // Clear canvas and load cropped image
        fabricCanvas.clear();
        
        FabricImage.fromURL(croppedDataUrl, { crossOrigin: 'anonymous' }).then((fabricImg) => {
          fabricCanvas.setWidth(width);
          fabricCanvas.setHeight(height);
          fabricCanvas.backgroundImage = fabricImg;
          fabricCanvas.renderAll();
          
          setIsCropping(false);
          setActiveTool("select");
          toast.success("Image cropped!");
          saveHistory();
        });
      };
      img.src = boundingDataUrl;
    } else {
      // No rotation - simple crop
      const left = cropRect.left || 0;
      const top = cropRect.top || 0;
      
      const croppedDataUrl = fabricCanvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 1,
        left: left,
        top: top,
        width: width,
        height: height,
      });
      
      fabricCanvas.clear();
      
      FabricImage.fromURL(croppedDataUrl, { crossOrigin: 'anonymous' }).then((img) => {
        fabricCanvas.setWidth(width);
        fabricCanvas.setHeight(height);
        fabricCanvas.backgroundImage = img;
        fabricCanvas.renderAll();
        
        setIsCropping(false);
        setActiveTool("select");
        toast.success("Image cropped!");
        saveHistory();
      });
    }
  }, [fabricCanvas, saveHistory]);

  const handleAddUrl = () => {
    if (!fabricCanvas) return;
    // Use captured URL if available, otherwise fall back to current window location
    const url = capturedUrl || window.location.href;
    const canvasHeight = fabricCanvas.height || 600;
    const text = new IText(`URL: ${url}`, {
      left: 20,
      top: canvasHeight - 60,
      fontSize: 12,
      fill: "#ffffff",
      fontFamily: "JetBrains Mono, monospace",
      backgroundColor: "rgba(0,0,0,0.7)",
      padding: 8,
      data: { type: 'url' },
    });
    setupCustomControls(text);
    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    fabricCanvas.renderAll();
    setShowUrlDateTime(prev => ({ ...prev, url: true }));
    toast.success("URL added to screenshot");
  };

  const handleAddDateTime = () => {
    if (!fabricCanvas) return;
    const now = new Date();
    const datetime = now.toISOString().replace("T", " ").slice(0, 19);
    const canvasHeight = fabricCanvas.height || 600;
    const text = new IText(`Date: ${datetime}`, {
      left: 20,
      top: canvasHeight - 90,
      fontSize: 12,
      fill: "#ffffff",
      fontFamily: "JetBrains Mono, monospace",
      backgroundColor: "rgba(0,0,0,0.7)",
      padding: 8,
      data: { type: 'datetime' },
    });
    setupCustomControls(text);
    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    fabricCanvas.renderAll();
    setShowUrlDateTime(prev => ({ ...prev, datetime: true }));
    toast.success("Date/time added to screenshot");
  };

  // Track if user has seen the image paste tip
  const hasSeenImageTipRef = useRef(false);

  // Paste image from system clipboard
  const handlePasteFromClipboard = useCallback(async () => {
    if (!fabricCanvas) return;
    
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        // Check for image types
        const imageType = item.types.find(type => type.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          
          // Convert blob to data URL so it persists for cloning
          const reader = new FileReader();
          const dataUrl = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          
          const img = await FabricImage.fromURL(dataUrl, { crossOrigin: 'anonymous' });
          
          // Scale down if too large
          const maxSize = Math.min(fabricCanvas.width! * 0.8, fabricCanvas.height! * 0.8);
          const scale = Math.min(1, maxSize / Math.max(img.width!, img.height!));
          
          img.set({
            left: (fabricCanvas.width! - img.width! * scale) / 2,
            top: (fabricCanvas.height! - img.height! * scale) / 2,
            scaleX: scale,
            scaleY: scale,
          });
          
          setupCustomControls(img);
          fabricCanvas.add(img);
          fabricCanvas.setActiveObject(img);
          fabricCanvas.renderAll();
          
          // Show tip on first image paste
          if (!hasSeenImageTipRef.current) {
            hasSeenImageTipRef.current = true;
            toast.success("Image pasted! Tip: ⌥+drag on fill square to adjust opacity", {
              duration: 5000,
            });
          } else {
            toast.success("Image pasted");
          }
          return true;
        }
      }
    } catch (error) {
      // Clipboard API not available or no permission
      console.log("Clipboard read failed:", error);
    }
    return false;
  }, [fabricCanvas]);

  const handleDownload = () => {
    if (!fabricCanvas) return;
    const dataUrl = fabricCanvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 2,
    });
    
    const link = document.createElement("a");
    link.download = `screenshot-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    toast.success("Screenshot downloaded!");
  };

  const handleCopy = async () => {
    if (!fabricCanvas) return;
    
    try {
      const dataUrl = fabricCanvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 2,
      });
      
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob })
      ]);
      
      toast.success("Copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy. Try downloading instead.");
    }
  };

  const handleDelete = useCallback(() => {
    if (!fabricCanvas) return;
    const active = fabricCanvas.getActiveObjects();
    if (active.length) {
      active.forEach(obj => fabricCanvas.remove(obj));
      fabricCanvas.discardActiveObject();
      fabricCanvas.renderAll();
      saveHistory();
    }
  }, [fabricCanvas]);

  // Undo action
  const handleUndo = useCallback(() => {
    if (!fabricCanvas || historyIndexRef.current <= 0) return;
    
    isUndoRedoRef.current = true;
    historyIndexRef.current--;
    
    const stateString = historyRef.current[historyIndexRef.current];
    const state = JSON.parse(stateString);
    
    // Restore canvas dimensions if saved
    if (state.width && state.height) {
      fabricCanvas.setWidth(state.width);
      fabricCanvas.setHeight(state.height);
    }
    
    const jsonToLoad = state.json || state; // Support both old and new format
    fabricCanvas.loadFromJSON(jsonToLoad).then(() => {
      fabricCanvas.renderAll();
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
      isUndoRedoRef.current = false;
    });
  }, [fabricCanvas]);

  // Redo action
  const handleRedo = useCallback(() => {
    if (!fabricCanvas || historyIndexRef.current >= historyRef.current.length - 1) return;
    
    isUndoRedoRef.current = true;
    historyIndexRef.current++;
    
    const stateString = historyRef.current[historyIndexRef.current];
    const state = JSON.parse(stateString);
    
    // Restore canvas dimensions if saved
    if (state.width && state.height) {
      fabricCanvas.setWidth(state.width);
      fabricCanvas.setHeight(state.height);
    }
    
    const jsonToLoad = state.json || state; // Support both old and new format
    fabricCanvas.loadFromJSON(jsonToLoad).then(() => {
      fabricCanvas.renderAll();
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
      isUndoRedoRef.current = false;
    });
  }, [fabricCanvas]);

  // Track canvas changes for history
  useEffect(() => {
    if (!fabricCanvas) return;
    
    const handleObjectModified = () => saveHistory();
    const handleObjectAdded = () => saveHistory();
    const handlePathCreated = () => saveHistory();
    
    fabricCanvas.on('object:modified', handleObjectModified);
    fabricCanvas.on('object:added', handleObjectAdded);
    fabricCanvas.on('path:created', handlePathCreated);
    
    return () => {
      fabricCanvas.off('object:modified', handleObjectModified);
      fabricCanvas.off('object:added', handleObjectAdded);
      fabricCanvas.off('path:created', handlePathCreated);
    };
  }, [fabricCanvas, saveHistory]);
  const handleBringToFront = () => {
    if (!fabricCanvas) return;
    const active = fabricCanvas.getActiveObject();
    if (active) {
      fabricCanvas.bringObjectToFront(active);
      fabricCanvas.renderAll();
    }
  };

  const handleSendToBack = () => {
    if (!fabricCanvas) return;
    const active = fabricCanvas.getActiveObject();
    if (active) {
      fabricCanvas.sendObjectToBack(active);
      fabricCanvas.renderAll();
    }
  };

  const handleBringForward = () => {
    if (!fabricCanvas) return;
    const active = fabricCanvas.getActiveObject();
    if (active) {
      fabricCanvas.bringObjectForward(active);
      fabricCanvas.renderAll();
    }
  };

  const handleSendBackward = () => {
    if (!fabricCanvas) return;
    const active = fabricCanvas.getActiveObject();
    if (active) {
      fabricCanvas.sendObjectBackwards(active);
      fabricCanvas.renderAll();
    }
  };

  // Context menu handlers
  const handleCopyObject = useCallback(() => {
    if (!fabricCanvas) return;
    const active = fabricCanvas.getActiveObject();
    if (active) {
      active.clone().then((cloned: FabricObject) => {
        clipboardRef.current = cloned;
        toast.success("Copied to clipboard");
      });
    }
  }, [fabricCanvas]);

  const handlePaste = useCallback(() => {
    if (!fabricCanvas || !clipboardRef.current) return;
    clipboardRef.current.clone().then((cloned: FabricObject) => {
      cloned.set({
        left: (cloned.left || 0) + 20,
        top: (cloned.top || 0) + 20,
      });
      setupCustomControls(cloned);
      fabricCanvas.add(cloned);
      fabricCanvas.setActiveObject(cloned);
      fabricCanvas.renderAll();
    });
  }, [fabricCanvas]);

  const handleDuplicate = useCallback(() => {
    if (!fabricCanvas) return;
    const active = fabricCanvas.getActiveObject();
    if (active) {
      active.clone().then((cloned: FabricObject) => {
        cloned.set({
          left: (active.left || 0) + 20,
          top: (active.top || 0) + 20,
        });
        setupCustomControls(cloned);
        fabricCanvas.add(cloned);
        fabricCanvas.setActiveObject(cloned);
        fabricCanvas.renderAll();
      });
    }
  }, [fabricCanvas]);

  const handleFlipHorizontal = useCallback(() => {
    if (!fabricCanvas) return;
    const active = fabricCanvas.getActiveObject();
    if (active) {
      active.set('flipX', !active.flipX);
      fabricCanvas.renderAll();
    }
  }, [fabricCanvas]);

  const handleFlipVertical = useCallback(() => {
    if (!fabricCanvas) return;
    const active = fabricCanvas.getActiveObject();
    if (active) {
      active.set('flipY', !active.flipY);
      fabricCanvas.renderAll();
    }
  }, [fabricCanvas]);

  const handleGroup = useCallback(() => {
    if (!fabricCanvas) return;
    const activeSelection = fabricCanvas.getActiveObject();
    if (activeSelection && activeSelection instanceof ActiveSelection) {
      const objects = activeSelection.getObjects();
      if (objects.length > 1) {
        fabricCanvas.discardActiveObject();
        const group = new Group(objects, {
          canvas: fabricCanvas,
        });
        objects.forEach(obj => fabricCanvas.remove(obj));
        fabricCanvas.add(group);
        fabricCanvas.setActiveObject(group);
        fabricCanvas.renderAll();
        setIsGroup(true);
        toast.success("Objects grouped");
      }
    }
  }, [fabricCanvas]);

  const handleUngroup = useCallback(() => {
    if (!fabricCanvas) return;
    const active = fabricCanvas.getActiveObject();
    if (active && active instanceof Group) {
      const items = active.removeAll();
      fabricCanvas.remove(active);
      items.forEach(item => {
        setupCustomControls(item);
        fabricCanvas.add(item);
      });
      fabricCanvas.discardActiveObject();
      const sel = new ActiveSelection(items, { canvas: fabricCanvas });
      fabricCanvas.setActiveObject(sel);
      fabricCanvas.renderAll();
      setIsGroup(false);
      toast.success("Objects ungrouped");
    }
  }, [fabricCanvas]);

  const handleCopyAsPng = useCallback(async () => {
    if (!fabricCanvas) return;
    const active = fabricCanvas.getActiveObject();
    if (active) {
      const dataUrl = active.toDataURL({
        format: 'png',
        multiplier: 2,
      });
      try {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob })
        ]);
        toast.success("Copied as PNG");
      } catch (error) {
        toast.error("Failed to copy as PNG");
      }
    }
  }, [fabricCanvas]);

  const handleCopyAsSvg = useCallback(() => {
    if (!fabricCanvas) return;
    const active = fabricCanvas.getActiveObject();
    if (active) {
      const svgContent = active.toSVG();
      const bbox = active.getBoundingRect();
      const now = new Date();
      const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      const completeSvg = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated with Screen Annotator: ${timestamp} -->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="${Math.ceil(bbox.width)}" height="${Math.ceil(bbox.height)}" viewBox="0 0 ${Math.ceil(bbox.width)} ${Math.ceil(bbox.height)}">
  <g transform="translate(${-bbox.left}, ${-bbox.top})">
    ${svgContent}
  </g>
</svg>`;
      
      navigator.clipboard.writeText(completeSvg).then(() => {
        toast.success("Copied as SVG");
      }).catch(() => {
        toast.error("Failed to copy as SVG");
      });
    }
  }, [fabricCanvas]);

  // Apply color changes to selected objects
  const handleStrokeColorChange = useCallback((color: string) => {
    setStrokeColor(color);
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach(obj => {
        if ('stroke' in obj) {
          (obj as any).set('stroke', hexToRgba(color, strokeOpacity));
        }
      });
      fabricCanvas.renderAll();
    }
  }, [fabricCanvas, strokeOpacity, hexToRgba]);

  const handleStrokeWidthChange = useCallback((width: number) => {
    setStrokeWidth(width);
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach(obj => {
        if ('strokeWidth' in obj) {
          (obj as any).set('strokeWidth', width);
        }
      });
      fabricCanvas.renderAll();
    }
  }, [fabricCanvas]);

  const handleFillColorChange = useCallback((color: string | null) => {
    setFillColor(color);
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach(obj => {
        if ('fill' in obj) {
          (obj as any).set('fill', color ? hexToRgba(color, fillOpacity) : 'transparent');
        }
      });
      fabricCanvas.renderAll();
    }
  }, [fabricCanvas, fillOpacity, hexToRgba]);

  const handleStrokeOpacityChange = useCallback((opacity: number) => {
    setStrokeOpacity(opacity);
    handleUpdateSelectedObjects('stroke', opacity);
  }, [handleUpdateSelectedObjects]);

  const handleFillOpacityChange = useCallback((opacity: number) => {
    setFillOpacity(opacity);
    handleUpdateSelectedObjects('fill', opacity);
  }, [handleUpdateSelectedObjects]);

  const handleShadowChange = useCallback((newShadow: ShadowSettings) => {
    setShadowSettings(newShadow);
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach(obj => {
        if (newShadow.enabled) {
          obj.set('shadow', {
            color: newShadow.color,
            blur: newShadow.blur,
            offsetX: newShadow.offsetX,
            offsetY: newShadow.offsetY,
          });
        } else {
          obj.set('shadow', null);
        }
      });
      fabricCanvas.renderAll();
    }
  }, [fabricCanvas]);

  // Handle arrow settings change
  const handleArrowSettingsChange = useCallback((newSettings: ArrowSettings) => {
    setArrowSettings(newSettings);
    
    if (!fabricCanvas || !selectedArrow) return;
    
    const data = (selectedArrow as any).data;
    if (data?.type !== 'arrow') return;
    
    // Regenerate path with new settings
    const pathData = generateArrowPath(
      data.x1, data.y1, data.x2, data.y2, newSettings
    );
    
    // Update the path
    selectedArrow.set({
      path: new Path(pathData).path,
      strokeWidth: newSettings.strokeWidth,
      data: { ...data, settings: { ...newSettings } }
    });
    
    fabricCanvas.renderAll();
  }, [fabricCanvas, selectedArrow]);

  // Alt+drag to clone - instant cloning
  useEffect(() => {
    if (!fabricCanvas) return;

    let hasCloned = false;

    const handleBeforeTransform = (opt: any) => {
      const e = opt.e as MouseEvent;
      if (e.altKey && !hasCloned) {
        const activeObj = fabricCanvas.getActiveObject();
        if (activeObj) {
          hasCloned = true;
          // Store original position
          const origLeft = activeObj.left;
          const origTop = activeObj.top;
          
          // Clone the object (works for all types including images)
          activeObj.clone().then((cloned: FabricObject) => {
            setupCustomControls(cloned);
            // Place clone at original position (it stays there)
            cloned.set({
              left: origLeft,
              top: origTop,
            });
            fabricCanvas.add(cloned);
            // The original continues to be dragged
            fabricCanvas.renderAll();
          });
        }
      }
    };

    const handleMouseUp = () => {
      hasCloned = false;
    };

    // Track alt key for cursor
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && fabricCanvas.getActiveObject()) {
        fabricCanvas.defaultCursor = 'copy';
        fabricCanvas.hoverCursor = 'copy';
        fabricCanvas.moveCursor = 'copy';
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.altKey) {
        fabricCanvas.defaultCursor = 'default';
        fabricCanvas.hoverCursor = 'move';
        fabricCanvas.moveCursor = 'move';
      }
    };

    fabricCanvas.on('object:moving', handleBeforeTransform);
    fabricCanvas.on('mouse:up', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      fabricCanvas.off('object:moving', handleBeforeTransform);
      fabricCanvas.off('mouse:up', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [fabricCanvas]);

  // Hover effect - show bounding box on hover
  useEffect(() => {
    if (!fabricCanvas) return;

    let hoverRect: Rect | null = null;
    
    const handleMouseOver = (opt: any) => {
      const target = opt.target as FabricObject;
      if (!target) return;
      
      // Skip hover rect and already selected objects
      if ((target as any).data?.type === 'hover-rect' ||
          fabricCanvas.getActiveObjects().includes(target)) {
        return;
      }
      
      // Remove existing hover rect
      if (hoverRect) {
        fabricCanvas.remove(hoverRect);
        hoverRect = null;
      }
      
      // Get bounding rect of target
      const bound = target.getBoundingRect();
      
      hoverRect = new Rect({
        left: bound.left - 2,
        top: bound.top - 2,
        width: bound.width + 4,
        height: bound.height + 4,
        fill: 'transparent',
        stroke: 'rgba(59, 130, 246, 0.7)',
        strokeWidth: 1.5,
        strokeDashArray: [4, 4],
        selectable: false,
        evented: false,
        data: { type: 'hover-rect' },
      });
      
      fabricCanvas.add(hoverRect);
      fabricCanvas.renderAll();
    };

    const handleMouseOut = () => {
      if (hoverRect) {
        fabricCanvas.remove(hoverRect);
        hoverRect = null;
        fabricCanvas.renderAll();
      }
    };

    // Remove hover rect when dragging starts or object is removed
    const clearHoverRect = () => {
      if (hoverRect) {
        fabricCanvas.remove(hoverRect);
        hoverRect = null;
        fabricCanvas.renderAll();
      }
    };

    fabricCanvas.on('mouse:over', handleMouseOver);
    fabricCanvas.on('mouse:out', handleMouseOut);
    fabricCanvas.on('object:moving', clearHoverRect);
    fabricCanvas.on('object:removed', clearHoverRect);

    return () => {
      fabricCanvas.off('mouse:over', handleMouseOver);
      fabricCanvas.off('mouse:out', handleMouseOut);
      fabricCanvas.off('object:moving', clearHoverRect);
      fabricCanvas.off('object:removed', clearHoverRect);
      if (hoverRect) {
        fabricCanvas.remove(hoverRect);
      }
    };
  }, [fabricCanvas]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in text or IText is being edited
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      // Check if currently editing text in fabric canvas
      const activeObject = fabricCanvas?.getActiveObject();
      if (activeObject instanceof IText && activeObject.isEditing) return;
      
      // Tool shortcuts (single keys without modifiers)
      if (!e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'v':
            e.preventDefault();
            setActiveTool("select");
            return;
          case 'p':
            e.preventDefault();
            handleToolClick("draw");
            return;
          case 'h':
            e.preventDefault();
            handleToolClick("highlight");
            return;
          case 'r':
            e.preventDefault();
            handleToolClick("rectangle");
            return;
          case 'c':
            e.preventDefault();
            handleToolClick("circle");
            return;
          case 'x':
            e.preventDefault();
            handleToolClick("crop");
            return;
          case 'a':
            e.preventDefault();
            handleToolClick("arrow");
            return;
          case 'l':
            e.preventDefault();
            handleToolClick("line");
            return;
          case 't':
            e.preventDefault();
            handleToolClick("text");
            return;
        }
      }
      
      // Enter to apply crop
      if (e.key === "Enter" && isCropping) {
        e.preventDefault();
        handleApplyCrop();
        return;
      }
      
      if (e.key === "Delete" || e.key === "Backspace") {
        handleDelete();
      }
      if (e.key === "Escape") {
        if (isCropping) {
          handleCancelCrop();
        } else {
          setActiveTool("select");
          fabricCanvas?.discardActiveObject();
          fabricCanvas?.renderAll();
        }
      }
      // Undo
      if (e.key === "z" && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Redo
      if ((e.key === "z" && (e.metaKey || e.ctrlKey) && e.shiftKey) || 
          (e.key === "y" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        handleRedo();
      }
      // Copy
      if (e.key === "c" && (e.metaKey || e.ctrlKey)) {
        handleCopyObject();
      }
      // Paste - try clipboard image first, then internal paste
      if (e.key === "v" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handlePasteFromClipboard().then((pastedImage) => {
          if (!pastedImage) {
            handlePaste();
          }
        });
      }
      // Duplicate
      if (e.key === "d" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleDuplicate();
      }
      // Group
      if (e.key === "g" && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
        e.preventDefault();
        handleGroup();
      }
      // Ungroup
      if (e.key === "g" && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        handleUngroup();
      }
      // Layer shortcuts
      if (e.key === "]" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (e.shiftKey) {
          handleBringToFront();
        } else {
          handleBringForward();
        }
      }
      if (e.key === "[" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (e.shiftKey) {
          handleSendToBack();
        } else {
          handleSendBackward();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fabricCanvas, handleCopyObject, handlePaste, handlePasteFromClipboard, handleDuplicate, handleGroup, handleUngroup, handleUndo, handleRedo, handleDelete, handleToolClick, isCropping, handleApplyCrop, handleCancelCrop]);

  if (!screenshot) return null;

  return (
    <div className="flex flex-col items-center gap-4 p-4 animate-fade-in">
      {/* Top toolbar */}
      <div className="glass-panel p-2 flex items-center gap-2">
        <Toolbar 
          activeTool={activeTool} 
          onToolClick={handleToolClick} 
          onDelete={handleDelete}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
        <div className="w-px h-8 bg-border" />
        <ColorPicker 
          strokeColor={strokeColor} 
          fillColor={fillColor}
          strokeOpacity={strokeOpacity}
          fillOpacity={fillOpacity}
          strokeWidth={strokeWidth}
          onStrokeChange={handleStrokeColorChange} 
          onFillChange={handleFillColorChange}
          onStrokeOpacityChange={handleStrokeOpacityChange}
          onFillOpacityChange={handleFillOpacityChange}
          onStrokeWidthChange={handleStrokeWidthChange}
          onUpdateSelectedObjects={handleUpdateSelectedObjects}
        />
        <div className="w-px h-8 bg-border" />
        <ShadowControls
          shadowSettings={shadowSettings}
          onShadowChange={handleShadowChange}
          disabled={!hasSelection}
        />
      </div>

      {/* Arrow controls - show when arrow is selected */}
      {selectedArrow && (
        <div className="glass-panel p-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <ArrowControls
            settings={arrowSettings}
            onChange={handleArrowSettingsChange}
          />
        </div>
      )}

      {/* Crop controls - show when cropping */}
      {isCropping && (
        <div className="glass-panel p-2 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="text-sm text-muted-foreground">Adjust crop area, then:</span>
          <button
            onClick={handleApplyCrop}
            className="px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Apply (Enter)
          </button>
          <button
            onClick={handleCancelCrop}
            className="px-3 py-1.5 text-sm font-medium bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors"
          >
            Cancel (Esc)
          </button>
        </div>
      )}

      {/* Canvas with context menu */}
      <CanvasContextMenu
        hasSelection={hasSelection}
        isGroup={isGroup}
        canGroup={hasSelection && fabricCanvas?.getActiveObjects()?.length > 1}
        onCopy={handleCopyObject}
        onPaste={handlePaste}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onFlipHorizontal={handleFlipHorizontal}
        onFlipVertical={handleFlipVertical}
        onGroup={handleGroup}
        onUngroup={handleUngroup}
        onBringToFront={handleBringToFront}
        onBringForward={handleBringForward}
        onSendBackward={handleSendBackward}
        onSendToBack={handleSendToBack}
        onCopyAsPng={handleCopyAsPng}
        onCopyAsSvg={handleCopyAsSvg}
      >
        <ContextMenuTrigger asChild>
          <div ref={containerRef} className="canvas-container animate-scale-in">
            <canvas ref={canvasRef} />
          </div>
        </ContextMenuTrigger>
      </CanvasContextMenu>

      {/* Bottom action bar */}
      <ActionBar
        onAddUrl={handleAddUrl}
        onAddDateTime={handleAddDateTime}
        onDownload={handleDownload}
        onCopy={handleCopy}
        onClear={onClear}
        showUrl={showUrlDateTime.url}
        showDateTime={showUrlDateTime.datetime}
      />
    </div>
  );
};
