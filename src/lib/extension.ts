// Declare chrome as a global to avoid TypeScript errors
declare const chrome: any;

// Utility to detect if running as Chrome extension
export const isExtension = (): boolean => {
  try {
    return typeof chrome !== 'undefined' && 
           chrome?.runtime?.id !== undefined;
  } catch {
    return false;
  }
};

// Get pending screenshot from extension storage
export const getExtensionScreenshot = async (): Promise<{
  screenshot: string | null;
  url: string | null;
  capturedAt: string | null;
}> => {
  if (!isExtension()) {
    return { screenshot: null, url: null, capturedAt: null };
  }

  return new Promise((resolve) => {
    chrome.storage.local.get(['pendingScreenshot', 'capturedUrl', 'capturedAt'], (result: any) => {
      resolve({
        screenshot: result.pendingScreenshot || null,
        url: result.capturedUrl || null,
        capturedAt: result.capturedAt || null
      });
    });
  });
};

// Clear pending screenshot from storage
export const clearExtensionScreenshot = async (): Promise<void> => {
  if (!isExtension()) return;
  
  return new Promise((resolve) => {
    chrome.storage.local.remove(['pendingScreenshot', 'capturedUrl', 'capturedAt'], () => {
      resolve();
    });
  });
};

// Store screenshot metadata for later use
export const getExtensionMetadata = async (): Promise<{
  url: string | null;
  capturedAt: string | null;
}> => {
  if (!isExtension()) {
    return { url: null, capturedAt: null };
  }

  return new Promise((resolve) => {
    chrome.storage.local.get(['capturedUrl', 'capturedAt'], (result: any) => {
      resolve({
        url: result.capturedUrl || null,
        capturedAt: result.capturedAt || null
      });
    });
  });
};
