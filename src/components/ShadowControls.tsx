import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sun, SunDim } from "lucide-react";

export interface ShadowSettings {
  enabled: boolean;
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

interface ShadowControlsProps {
  shadowSettings: ShadowSettings;
  onShadowChange: (settings: ShadowSettings) => void;
  disabled?: boolean;
}

export const ShadowControls = ({ shadowSettings, onShadowChange, disabled }: ShadowControlsProps) => {
  const handleToggle = () => {
    onShadowChange({ ...shadowSettings, enabled: !shadowSettings.enabled });
  };

  const handleBlurChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onShadowChange({ ...shadowSettings, blur: parseFloat(e.target.value) });
  };

  const handleOffsetXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onShadowChange({ ...shadowSettings, offsetX: parseFloat(e.target.value) });
  };

  const handleOffsetYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onShadowChange({ ...shadowSettings, offsetY: parseFloat(e.target.value) });
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onShadowChange({ ...shadowSettings, color: e.target.value });
  };

  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleToggle}
            disabled={disabled}
            className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
              shadowSettings.enabled 
                ? 'bg-primary/20 ring-1 ring-primary text-primary' 
                : 'hover:bg-muted text-muted-foreground'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {shadowSettings.enabled ? <Sun size={18} /> : <SunDim size={18} />}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <span>{shadowSettings.enabled ? 'Disable' : 'Enable'} shadow</span>
        </TooltipContent>
      </Tooltip>

      {shadowSettings.enabled && !disabled && (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
          {/* Shadow color */}
          <Tooltip>
            <TooltipTrigger asChild>
              <input
                type="color"
                value={shadowSettings.color.startsWith('rgba') ? '#000000' : shadowSettings.color}
                onChange={handleColorChange}
                className="w-6 h-6 rounded cursor-pointer border border-border"
              />
            </TooltipTrigger>
            <TooltipContent side="bottom">Shadow color</TooltipContent>
          </Tooltip>

          {/* Blur */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Blur</span>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={shadowSettings.blur}
                  onChange={handleBlurChange}
                  className="w-16 h-1 accent-primary"
                />
                <span className="text-xs w-6 text-center">{shadowSettings.blur}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">Shadow blur radius</TooltipContent>
          </Tooltip>

          {/* Offset X */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">X</span>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  value={shadowSettings.offsetX}
                  onChange={handleOffsetXChange}
                  className="w-12 h-1 accent-primary"
                />
                <span className="text-xs w-6 text-center">{shadowSettings.offsetX}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">Horizontal offset</TooltipContent>
          </Tooltip>

          {/* Offset Y */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Y</span>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  value={shadowSettings.offsetY}
                  onChange={handleOffsetYChange}
                  className="w-12 h-1 accent-primary"
                />
                <span className="text-xs w-6 text-center">{shadowSettings.offsetY}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">Vertical offset</TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  );
};
