import { 
  MousePointer2, 
  Pencil, 
  Square, 
  Circle, 
  ArrowRight, 
  Minus, 
  Type,
  Highlighter,
  Trash2,
  Undo2,
  Redo2,
  Crop
} from "lucide-react";
import { Tool } from "./ScreenshotEditor";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ToolbarProps {
  activeTool: Tool;
  onToolClick: (tool: Tool) => void;
  onDelete: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const tools: { tool: Tool; icon: React.ReactNode; label: string; shortcut?: string }[] = [
  { tool: "select", icon: <MousePointer2 size={18} />, label: "Select", shortcut: "V" },
  { tool: "crop", icon: <Crop size={18} />, label: "Crop", shortcut: "X" },
  { tool: "draw", icon: <Pencil size={18} />, label: "Draw", shortcut: "P" },
  { tool: "highlight", icon: <Highlighter size={18} />, label: "Highlight", shortcut: "H" },
  { tool: "rectangle", icon: <Square size={18} />, label: "Rectangle", shortcut: "R" },
  { tool: "circle", icon: <Circle size={18} />, label: "Circle", shortcut: "C" },
  { tool: "arrow", icon: <ArrowRight size={18} />, label: "Arrow", shortcut: "A" },
  { tool: "line", icon: <Minus size={18} />, label: "Line", shortcut: "L" },
  { tool: "text", icon: <Type size={18} />, label: "Text", shortcut: "T" },
];

export const Toolbar = ({ 
  activeTool, 
  onToolClick, 
  onDelete,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}: ToolbarProps) => {
  return (
    <div className="flex items-center gap-1">
      {/* Undo/Redo */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="toolbar-btn disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Undo2 size={18} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="flex items-center gap-2">
          <span>Undo</span>
          <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded font-mono">⌘Z</kbd>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="toolbar-btn disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Redo2 size={18} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="flex items-center gap-2">
          <span>Redo</span>
          <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded font-mono">⌘⇧Z</kbd>
        </TooltipContent>
      </Tooltip>
      
      <div className="w-px h-8 bg-border mx-1" />

      {tools.map(({ tool, icon, label, shortcut }) => (
        <Tooltip key={tool}>
          <TooltipTrigger asChild>
            <button
              onClick={() => onToolClick(tool)}
              className={`toolbar-btn ${activeTool === tool ? "toolbar-btn-active" : ""}`}
            >
              {icon}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="flex items-center gap-2">
            <span>{label}</span>
            {shortcut && (
              <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded font-mono">
                {shortcut}
              </kbd>
            )}
          </TooltipContent>
        </Tooltip>
      ))}
      
      <div className="w-px h-8 bg-border mx-1" />
      
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onDelete}
            className="toolbar-btn hover:bg-destructive/20 hover:text-destructive"
          >
            <Trash2 size={18} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="flex items-center gap-2">
          <span>Delete</span>
          <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded font-mono">Del</kbd>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
