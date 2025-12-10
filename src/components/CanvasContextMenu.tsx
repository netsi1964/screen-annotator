import { 
  Copy, 
  Clipboard, 
  Trash2, 
  FlipHorizontal, 
  FlipVertical,
  Group,
  Ungroup,
  ArrowUp,
  ArrowDown,
  ArrowUpToLine,
  ArrowDownToLine,
  FileImage,
  FileCode,
  Layers
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuShortcut,
} from "@/components/ui/context-menu";

interface CanvasContextMenuProps {
  children: React.ReactNode;
  hasSelection: boolean;
  isGroup: boolean;
  canGroup: boolean;
  onCopy: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;
  onGroup: () => void;
  onUngroup: () => void;
  onBringToFront: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onSendToBack: () => void;
  onCopyAsPng: () => void;
  onCopyAsSvg: () => void;
}

export const CanvasContextMenu = ({
  children,
  hasSelection,
  isGroup,
  canGroup,
  onCopy,
  onPaste,
  onDelete,
  onDuplicate,
  onFlipHorizontal,
  onFlipVertical,
  onGroup,
  onUngroup,
  onBringToFront,
  onBringForward,
  onSendBackward,
  onSendToBack,
  onCopyAsPng,
  onCopyAsSvg,
}: CanvasContextMenuProps) => {
  return (
    <ContextMenu>
      {children}
      <ContextMenuContent className="w-56">
        {hasSelection ? (
          <>
            <ContextMenuItem onClick={onCopy}>
              <Copy className="mr-2 h-4 w-4" />
              Copy
              <ContextMenuShortcut>⌘C</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={onDuplicate}>
              <Clipboard className="mr-2 h-4 w-4" />
              Duplicate
              <ContextMenuShortcut>⌘D</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
              <ContextMenuShortcut>⌫</ContextMenuShortcut>
            </ContextMenuItem>
            
            <ContextMenuSeparator />
            
            <ContextMenuItem onClick={onFlipHorizontal}>
              <FlipHorizontal className="mr-2 h-4 w-4" />
              Flip Horizontal
            </ContextMenuItem>
            <ContextMenuItem onClick={onFlipVertical}>
              <FlipVertical className="mr-2 h-4 w-4" />
              Flip Vertical
            </ContextMenuItem>
            
            <ContextMenuSeparator />
            
            {isGroup ? (
              <ContextMenuItem onClick={onUngroup}>
                <Ungroup className="mr-2 h-4 w-4" />
                Ungroup
                <ContextMenuShortcut>⌘⇧G</ContextMenuShortcut>
              </ContextMenuItem>
            ) : (
              <ContextMenuItem onClick={onGroup} disabled={!canGroup}>
                <Group className="mr-2 h-4 w-4" />
                Group
                <ContextMenuShortcut>⌘G</ContextMenuShortcut>
              </ContextMenuItem>
            )}
            
            <ContextMenuSeparator />
            
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <Layers className="mr-2 h-4 w-4" />
                Arrange
              </ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem onClick={onBringToFront}>
                  <ArrowUpToLine className="mr-2 h-4 w-4" />
                  Bring to Front
                  <ContextMenuShortcut>⌘⇧]</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem onClick={onBringForward}>
                  <ArrowUp className="mr-2 h-4 w-4" />
                  Bring Forward
                  <ContextMenuShortcut>⌘]</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem onClick={onSendBackward}>
                  <ArrowDown className="mr-2 h-4 w-4" />
                  Send Backward
                  <ContextMenuShortcut>⌘[</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem onClick={onSendToBack}>
                  <ArrowDownToLine className="mr-2 h-4 w-4" />
                  Send to Back
                  <ContextMenuShortcut>⌘⇧[</ContextMenuShortcut>
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            
            <ContextMenuSeparator />
            
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <FileImage className="mr-2 h-4 w-4" />
                Copy as...
              </ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem onClick={onCopyAsPng}>
                  <FileImage className="mr-2 h-4 w-4" />
                  Copy as PNG
                </ContextMenuItem>
                <ContextMenuItem onClick={onCopyAsSvg}>
                  <FileCode className="mr-2 h-4 w-4" />
                  Copy as SVG
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
          </>
        ) : (
          <>
            <ContextMenuItem onClick={onPaste}>
              <Clipboard className="mr-2 h-4 w-4" />
              Paste
              <ContextMenuShortcut>⌘V</ContextMenuShortcut>
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};
