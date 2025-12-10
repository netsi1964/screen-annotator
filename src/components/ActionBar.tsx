import { Link, Clock, Download, Copy, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ActionBarProps {
  onAddUrl: () => void;
  onAddDateTime: () => void;
  onDownload: () => void;
  onCopy: () => void;
  onClear: () => void;
  showUrl: boolean;
  showDateTime: boolean;
}

export const ActionBar = ({
  onAddUrl,
  onAddDateTime,
  onDownload,
  onCopy,
  onClear,
  showUrl,
  showDateTime,
}: ActionBarProps) => {
  return (
    <div className="glass-panel p-2 flex items-center gap-2 animate-slide-up">
      {/* Metadata actions */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddUrl}
              disabled={showUrl}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              {showUrl ? <Check size={16} className="text-success" /> : <Link size={16} />}
              <span className="text-sm">URL</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add current URL to screenshot</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddDateTime}
              disabled={showDateTime}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              {showDateTime ? <Check size={16} className="text-success" /> : <Clock size={16} />}
              <span className="text-sm">Date/Time</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add date and time to screenshot</TooltipContent>
        </Tooltip>
      </div>

      <div className="w-px h-8 bg-border" />

      {/* Export actions */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              onClick={onDownload}
              className="gap-2"
            >
              <Download size={16} />
              <span className="text-sm">Download</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Download as PNG</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              size="sm"
              onClick={onCopy}
              className="gap-2"
            >
              <Copy size={16} />
              <span className="text-sm">Copy</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy to clipboard</TooltipContent>
        </Tooltip>
      </div>

      <div className="w-px h-8 bg-border" />

      {/* Clear */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <RotateCcw size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Take new screenshot</TooltipContent>
      </Tooltip>
    </div>
  );
};
