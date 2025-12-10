import { CaptureScreen } from "@/components/CaptureScreen";
import { ScreenshotEditor } from "@/components/ScreenshotEditor";
import { useState } from "react";

const Index = () => {
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [capturedUrl, setCapturedUrl] = useState<string | undefined>(undefined);

  const handleCapture = (dataUrl: string, metadata?: { url?: string; capturedAt?: string }) => {
    setScreenshot(dataUrl);
    setCapturedUrl(metadata?.url);
  };

  const handleClear = () => {
    setScreenshot(null);
    setCapturedUrl(undefined);
  };

  return (
    <div className="min-h-screen bg-background">
      {!screenshot ? (
        <CaptureScreen onCapture={handleCapture} />
      ) : (
        <ScreenshotEditor screenshot={screenshot} onClear={handleClear} capturedUrl={capturedUrl} />
      )}
    </div>
  );
};

export default Index;
