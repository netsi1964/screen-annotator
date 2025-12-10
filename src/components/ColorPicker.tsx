import { useState, useRef, useEffect, useCallback } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Ban } from "lucide-react";

interface ColorPickerProps {
  strokeColor: string;
  fillColor: string | null;
  strokeOpacity: number;
  fillOpacity: number;
  strokeWidth: number;
  onStrokeChange: (color: string) => void;
  onFillChange: (color: string | null) => void;
  onStrokeOpacityChange: (opacity: number) => void;
  onFillOpacityChange: (opacity: number) => void;
  onStrokeWidthChange: (width: number) => void;
  onUpdateSelectedObjects?: (type: 'stroke' | 'fill', opacity: number) => void;
}

const strokeWidths = [1, 2, 3, 5, 8];

const defaultColors = [
  { value: "#FF5252", name: "Red" },
  { value: "#FF9800", name: "Orange" },
  { value: "#FFEB3B", name: "Yellow" },
  { value: "#4CAF50", name: "Green" },
  { value: "#00BFFF", name: "Blue" },
  { value: "#9C27B0", name: "Purple" },
  { value: "#E91E63", name: "Pink" },
  { value: "#FFFFFF", name: "White" },
  { value: "#000000", name: "Black" },
];

export const ColorPicker = ({ 
  strokeColor, 
  fillColor, 
  strokeOpacity,
  fillOpacity,
  strokeWidth,
  onStrokeChange, 
  onFillChange,
  onStrokeOpacityChange,
  onFillOpacityChange,
  onStrokeWidthChange,
  onUpdateSelectedObjects
}: ColorPickerProps) => {
  const [isDragging, setIsDragging] = useState<'stroke' | 'fill' | 'width' | null>(null);
  const [isAltHovered, setIsAltHovered] = useState(false);
  const [colors, setColors] = useState(defaultColors);
  const startXRef = useRef(0);
  const startOpacityRef = useRef(1);
  const startWidthRef = useRef(3);

  const handleColorClick = (e: React.MouseEvent, color: string) => {
    if (e.metaKey || e.ctrlKey) {
      onFillChange(color);
    } else {
      onStrokeChange(color);
    }
  };

  const handleNoneClick = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey) {
      onFillChange(null);
    } else {
      onFillChange(null);
    }
  };

  const handleIndicatorMouseDown = (e: React.MouseEvent, type: 'stroke' | 'fill') => {
    if (e.altKey) {
      e.preventDefault();
      setIsDragging(type);
      startXRef.current = e.clientX;
      startOpacityRef.current = type === 'stroke' ? strokeOpacity : fillOpacity;
      document.body.style.cursor = 'ew-resize';
    }
  };

  const handleWidthMouseDown = (e: React.MouseEvent) => {
    if (e.altKey) {
      e.preventDefault();
      setIsDragging('width');
      startXRef.current = e.clientX;
      startWidthRef.current = strokeWidth;
      document.body.style.cursor = 'ew-resize';
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startXRef.current;
    
    if (isDragging === 'width') {
      const widthDelta = deltaX / 20;
      const newWidth = Math.max(0.5, Math.min(20, startWidthRef.current + widthDelta));
      onStrokeWidthChange(Math.round(newWidth * 2) / 2);
    } else {
      const opacityDelta = deltaX / 200;
      const newOpacity = Math.max(0.05, Math.min(1, startOpacityRef.current + opacityDelta));
      
      if (isDragging === 'stroke') {
        onStrokeOpacityChange(newOpacity);
        onUpdateSelectedObjects?.('stroke', newOpacity);
      } else {
        onFillOpacityChange(newOpacity);
        onUpdateSelectedObjects?.('fill', newOpacity);
      }
    }
  }, [isDragging, onStrokeOpacityChange, onFillOpacityChange, onStrokeWidthChange, onUpdateSelectedObjects]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
    document.body.style.cursor = '';
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) setIsAltHovered(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.altKey) setIsAltHovered(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const getColorWithOpacity = (color: string, opacity: number) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  return (
    <div className="flex items-center gap-3">
      {/* Stroke/Fill indicator */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className={`relative w-10 h-10 ${isAltHovered ? 'cursor-ew-resize' : 'cursor-pointer'}`}
            >
              {/* Fill square (back) */}
              <div 
                className="absolute bottom-0 right-0 w-7 h-7 rounded border-2 border-border transition-all"
                style={{ 
                  backgroundColor: fillColor ? getColorWithOpacity(fillColor, fillOpacity) : 'transparent',
                  backgroundImage: fillColor === null ? 'linear-gradient(45deg, #333 25%, transparent 25%, transparent 75%, #333 75%), linear-gradient(45deg, #333 25%, transparent 25%, transparent 75%, #333 75%)' : 'none',
                  backgroundSize: '6px 6px',
                  backgroundPosition: '0 0, 3px 3px'
                }}
                onMouseDown={(e) => handleIndicatorMouseDown(e, 'fill')}
              >
                <div className="absolute -bottom-1 left-0 right-0 h-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all" 
                    style={{ width: `${fillOpacity * 100}%` }}
                  />
                </div>
              </div>
              {/* Stroke square (front) */}
              <div 
                className="absolute top-0 left-0 w-7 h-7 rounded border-2 border-border transition-all"
                style={{ 
                  backgroundColor: 'transparent',
                  boxShadow: `inset 0 0 0 3px ${getColorWithOpacity(strokeColor, strokeOpacity)}`
                }}
                onMouseDown={(e) => handleIndicatorMouseDown(e, 'stroke')}
              >
                <div className="absolute -top-1 left-0 right-0 h-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all" 
                    style={{ width: `${strokeOpacity * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <div className="text-xs space-y-1">
              <p><span className="text-muted-foreground">Stroke:</span> {strokeColor} ({Math.round(strokeOpacity * 100)}%)</p>
              <p><span className="text-muted-foreground">Fill:</span> {fillColor || 'None'} {fillColor && `(${Math.round(fillOpacity * 100)}%)`}</p>
              <p className="text-muted-foreground mt-1">⌥ + drag to adjust opacity</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="w-px h-6 bg-border" />

      {/* Stroke width selector */}
      <div className="flex items-center gap-1">
        {strokeWidths.map((width) => (
          <Tooltip key={width}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onStrokeWidthChange(width)}
                onMouseDown={handleWidthMouseDown}
                className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
                  strokeWidth === width 
                    ? 'bg-primary/20 ring-1 ring-primary' 
                    : 'hover:bg-muted'
                } ${isAltHovered ? 'cursor-ew-resize' : 'cursor-pointer'}`}
              >
                <div 
                  className="rounded-full bg-foreground"
                  style={{ 
                    width: Math.min(width * 2 + 2, 16),
                    height: Math.min(width * 2 + 2, 16)
                  }}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <span>{width}px</span>
              <span className="text-muted-foreground text-xs ml-1">(⌥+drag for custom)</span>
            </TooltipContent>
          </Tooltip>
        ))}
        <input
          type="number"
          min="0.5"
          max="50"
          step="0.5"
          value={strokeWidth}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            if (!isNaN(val) && val >= 0.5 && val <= 50) {
              onStrokeWidthChange(val);
            }
          }}
          onKeyDown={(e) => e.stopPropagation()}
          className="w-12 h-7 px-1 text-xs text-center bg-muted border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="w-px h-6 bg-border" />

      {/* Color swatches */}
      <div className="flex items-center gap-1.5">
        {/* None option */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleNoneClick}
              className={`color-swatch flex items-center justify-center bg-muted ${fillColor === null ? "ring-primary ring-2" : ""}`}
            >
              <Ban size={14} className="text-muted-foreground" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <span>None (transparent fill)</span>
          </TooltipContent>
        </Tooltip>

        {colors.map(({ value, name }, index) => {
          const isStroke = strokeColor === value;
          const isFill = fillColor === value;
          
          return (
            <div key={index} className="relative group">
              <button
                onClick={(e) => handleColorClick(e, value)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  // Trigger the hidden color input
                  const input = document.getElementById(`color-input-${index}`);
                  if (input) (input as HTMLInputElement).click();
                }}
                className={`color-swatch relative ${isStroke || isFill ? "scale-110" : ""}`}
                style={{ backgroundColor: value }}
                title={`${name} (⌘+click fill, right-click edit)`}
              >
                {isStroke && (
                  <div 
                    className="absolute -top-0.5 -left-0.5 w-2.5 h-2.5 rounded-full border-2 border-background"
                    style={{ backgroundColor: getColorWithOpacity(strokeColor, strokeOpacity) }}
                  />
                )}
                {isFill && (
                  <div 
                    className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background"
                    style={{ backgroundColor: getColorWithOpacity(fillColor!, fillOpacity) }}
                  />
                )}
              </button>
              {/* Hidden color input for right-click editing */}
              <input
                id={`color-input-${index}`}
                type="color"
                value={value}
                onChange={(e) => {
                  const newColor = e.target.value.toUpperCase();
                  const newColors = [...colors];
                  const oldColor = newColors[index].value;
                  newColors[index] = { ...newColors[index], value: newColor };
                  setColors(newColors);
                  if (strokeColor === oldColor) onStrokeChange(newColor);
                  if (fillColor === oldColor) onFillChange(newColor);
                }}
                className="absolute opacity-0 w-0 h-0 pointer-events-none"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
