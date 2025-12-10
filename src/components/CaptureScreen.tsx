import defaultScreenshot from "@/assets/default-screenshot.jpg";
import { Button } from "@/components/ui/button";
import { clearExtensionScreenshot, getExtensionScreenshot, isExtension } from "@/lib/extension";
import { Camera, Chrome, Image, Monitor, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface CaptureScreenProps {
  onCapture: (screenshot: string, metadata?: { url?: string; capturedAt?: string }) => void;
}

export const CaptureScreen = ({ onCapture }: CaptureScreenProps) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isLoadingExtension, setIsLoadingExtension] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const runningAsExtension = isExtension();
  
  // Detect platform for keyboard shortcut display
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPod|iPad/i.test(navigator.platform);
  const shortcutKey = isMac ? '⌘⇧S' : 'Ctrl+Shift+S';

  // Check for pending screenshot from extension capture
  useEffect(() => {
    const checkExtensionScreenshot = async () => {
      if (!runningAsExtension) {
        setIsLoadingExtension(false);
        return;
      }

      try {
        const { screenshot, url, capturedAt } = await getExtensionScreenshot();
        if (screenshot) {
          // Clear the stored screenshot so it doesn't reload on refresh
          await clearExtensionScreenshot();
          onCapture(screenshot, { url: url || undefined, capturedAt: capturedAt || undefined });
        }
      } catch (error) {
        console.error("Failed to load extension screenshot:", error);
      } finally {
        setIsLoadingExtension(false);
      }
    };

    checkExtensionScreenshot();
  }, [onCapture, runningAsExtension]);

  const captureScreen = async () => {
    setIsCapturing(true);
    
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "browser" } as MediaTrackConstraints,
        audio: false,
      });

      const video = document.createElement("video");
      video.srcObject = stream;
      
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => {
          video.play();
          resolve();
        };
      });

      // Wait a frame for the video to render
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0);

      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());

      const dataUrl = canvas.toDataURL("image/png");
      onCapture(dataUrl);
    } catch (error) {
      console.error("Screen capture failed:", error);
      toast.error("Screen capture cancelled or failed");
    } finally {
      setIsCapturing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onCapture(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const loadDemoImage = () => {
    onCapture(defaultScreenshot);
  };

  // Show loading state while checking for extension screenshot
  if (isLoadingExtension && runningAsExtension) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="glass-panel p-8 max-w-md w-full text-center animate-scale-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mb-6">
            <Camera className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground">Loading screenshot...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="glass-panel p-8 max-w-md w-full text-center animate-scale-in">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mb-6">
            <Camera className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-gradient">Screen Annotator</h1>
          <p className="text-muted-foreground">
            {runningAsExtension 
              ? `Click the extension icon or press ${shortcutKey} to capture`
              : "Capture your screen or upload an image to start annotating"
            }
          </p>
        </div>

        <div className="space-y-3">
          {!runningAsExtension && (
            <>
              <Button
                onClick={loadDemoImage}
                size="lg"
                className="w-full gap-3 h-14 text-base bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
              >
                <Image size={20} />
                Try Demo Image
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <Button
                onClick={captureScreen}
                disabled={isCapturing}
                variant="secondary"
                size="lg"
                className="w-full gap-3 h-14 text-base"
              >
                <Monitor size={20} />
                {isCapturing ? "Select a window..." : "Capture Screen"}
              </Button>
            </>
          )}

          {runningAsExtension && (
            <div className="py-6 space-y-4">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Chrome size={24} />
                <span className="font-medium">Extension Mode</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground text-center">
                  Go to any webpage and capture it using:
                </p>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-muted-foreground">• Click extension icon in toolbar</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-muted-foreground">• Press keyboard shortcut:</span>
                    <kbd className="px-2 py-1 text-xs bg-muted rounded font-mono border border-border">
                      {shortcutKey}
                    </kbd>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            size="lg"
            onClick={() => fileInputRef.current?.click()}
            className="w-full gap-3 h-12 text-base text-muted-foreground hover:text-foreground"
          >
            <Upload size={18} />
            Upload Image
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Draw shapes, add text, highlight areas, and export as PNG
          </p>
        </div>
      </div>
    </div>
  );
};
