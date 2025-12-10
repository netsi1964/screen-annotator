import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  ArrowRight, 
  ArrowLeftRight, 
  Minus,
  Circle,
  Diamond,
  ChevronRight
} from "lucide-react";

export type ArrowEndType = "none" | "arrow" | "circle" | "diamond";

export interface ArrowSettings {
  startType: ArrowEndType;
  endType: ArrowEndType;
  size: number;
  strokeWidth: number;
}

interface ArrowControlsProps {
  settings: ArrowSettings;
  onChange: (settings: ArrowSettings) => void;
  disabled?: boolean;
}

const endTypes: { type: ArrowEndType; icon: React.ReactNode; label: string }[] = [
  { type: "none", icon: <Minus size={14} />, label: "None" },
  { type: "arrow", icon: <ChevronRight size={14} />, label: "Arrow" },
  { type: "circle", icon: <Circle size={14} />, label: "Circle" },
  { type: "diamond", icon: <Diamond size={14} />, label: "Diamond" },
];

export const ArrowControls = ({ settings, onChange, disabled }: ArrowControlsProps) => {
  const handleStartTypeChange = (type: ArrowEndType) => {
    onChange({ ...settings, startType: type });
  };

  const handleEndTypeChange = (type: ArrowEndType) => {
    onChange({ ...settings, endType: type });
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...settings, size: parseFloat(e.target.value) });
  };

  const handleStrokeWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...settings, strokeWidth: parseFloat(e.target.value) });
  };

  return (
    <div className={`flex items-center gap-3 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Start end type */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground mr-1">Start</span>
        <div className="flex rounded-md overflow-hidden border border-border">
          {endTypes.map(({ type, icon, label }) => (
            <Tooltip key={type}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleStartTypeChange(type)}
                  className={`w-7 h-7 flex items-center justify-center transition-colors ${
                    settings.startType === type
                      ? 'bg-primary/20 text-primary'
                      : 'hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <span className="rotate-180">{icon}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* End type */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground mr-1">End</span>
        <div className="flex rounded-md overflow-hidden border border-border">
          {endTypes.map(({ type, icon, label }) => (
            <Tooltip key={type}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleEndTypeChange(type)}
                  className={`w-7 h-7 flex items-center justify-center transition-colors ${
                    settings.endType === type
                      ? 'bg-primary/20 text-primary'
                      : 'hover:bg-muted text-muted-foreground'
                  }`}
                >
                  {icon}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      <div className="w-px h-6 bg-border" />

      {/* Size */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Size</span>
            <input
              type="range"
              min="8"
              max="30"
              value={settings.size}
              onChange={handleSizeChange}
              className="w-14 h-1 accent-primary"
            />
            <span className="text-xs w-5 text-center">{settings.size}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">Arrow head size</TooltipContent>
      </Tooltip>

      {/* Stroke width */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Width</span>
            <input
              type="range"
              min="1"
              max="10"
              value={settings.strokeWidth}
              onChange={handleStrokeWidthChange}
              className="w-14 h-1 accent-primary"
            />
            <span className="text-xs w-4 text-center">{settings.strokeWidth}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">Line width</TooltipContent>
      </Tooltip>
    </div>
  );
};

// Helper to generate arrow path
export const generateArrowPath = (
  x1: number, 
  y1: number, 
  x2: number, 
  y2: number, 
  settings: ArrowSettings
): string => {
  const { startType, endType, size } = settings;
  
  // Calculate angle
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  
  let pathParts: string[] = [];
  
  // Adjust line endpoints based on decorations
  let lineStartX = x1;
  let lineStartY = y1;
  let lineEndX = x2;
  let lineEndY = y2;
  
  // Draw start decoration
  if (startType === "arrow") {
    const tipX = x1;
    const tipY = y1;
    const leftX = tipX + cos * size - sin * (size * 0.5);
    const leftY = tipY + sin * size + cos * (size * 0.5);
    const rightX = tipX + cos * size + sin * (size * 0.5);
    const rightY = tipY + sin * size - cos * (size * 0.5);
    pathParts.push(`M ${leftX} ${leftY} L ${tipX} ${tipY} L ${rightX} ${rightY}`);
    lineStartX = x1 + cos * (size * 0.3);
    lineStartY = y1 + sin * (size * 0.3);
  } else if (startType === "circle") {
    const radius = size * 0.4;
    const cx = x1 + cos * radius;
    const cy = y1 + sin * radius;
    pathParts.push(`M ${cx + radius} ${cy} A ${radius} ${radius} 0 1 0 ${cx - radius} ${cy} A ${radius} ${radius} 0 1 0 ${cx + radius} ${cy}`);
    lineStartX = x1 + cos * (radius * 2);
    lineStartY = y1 + sin * (radius * 2);
  } else if (startType === "diamond") {
    const dSize = size * 0.5;
    const cx = x1 + cos * dSize;
    const cy = y1 + sin * dSize;
    const topX = cx - sin * dSize;
    const topY = cy + cos * dSize;
    const bottomX = cx + sin * dSize;
    const bottomY = cy - cos * dSize;
    const rightX = cx + cos * dSize;
    const rightY = cy + sin * dSize;
    pathParts.push(`M ${x1} ${y1} L ${topX} ${topY} L ${rightX} ${rightY} L ${bottomX} ${bottomY} Z`);
    lineStartX = x1 + cos * (dSize * 2);
    lineStartY = y1 + sin * (dSize * 2);
  }
  
  // Draw end decoration
  if (endType === "arrow") {
    const tipX = x2;
    const tipY = y2;
    const leftX = tipX - cos * size - sin * (size * 0.5);
    const leftY = tipY - sin * size + cos * (size * 0.5);
    const rightX = tipX - cos * size + sin * (size * 0.5);
    const rightY = tipY - sin * size - cos * (size * 0.5);
    pathParts.push(`M ${leftX} ${leftY} L ${tipX} ${tipY} L ${rightX} ${rightY}`);
    lineEndX = x2 - cos * (size * 0.3);
    lineEndY = y2 - sin * (size * 0.3);
  } else if (endType === "circle") {
    const radius = size * 0.4;
    const cx = x2 - cos * radius;
    const cy = y2 - sin * radius;
    pathParts.push(`M ${cx + radius} ${cy} A ${radius} ${radius} 0 1 0 ${cx - radius} ${cy} A ${radius} ${radius} 0 1 0 ${cx + radius} ${cy}`);
    lineEndX = x2 - cos * (radius * 2);
    lineEndY = y2 - sin * (radius * 2);
  } else if (endType === "diamond") {
    const dSize = size * 0.5;
    const cx = x2 - cos * dSize;
    const cy = y2 - sin * dSize;
    const topX = cx - sin * dSize;
    const topY = cy + cos * dSize;
    const bottomX = cx + sin * dSize;
    const bottomY = cy - cos * dSize;
    const leftX = cx - cos * dSize;
    const leftY = cy - sin * dSize;
    pathParts.push(`M ${x2} ${y2} L ${topX} ${topY} L ${leftX} ${leftY} L ${bottomX} ${bottomY} Z`);
    lineEndX = x2 - cos * (dSize * 2);
    lineEndY = y2 - sin * (dSize * 2);
  }
  
  // Main line
  pathParts.unshift(`M ${lineStartX} ${lineStartY} L ${lineEndX} ${lineEndY}`);
  
  return pathParts.join(' ');
};