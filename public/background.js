// Background service worker for Screen Annotator extension

// Capture the visible tab and open editor
async function captureAndEdit(tab) {
  try {
    // Capture the visible tab as a data URL
    const dataUrl = await chrome.tabs.captureVisibleTab(null, {
      format: 'png',
      quality: 100
    });
    
    // Store the screenshot temporarily
    await chrome.storage.local.set({ 
      pendingScreenshot: dataUrl,
      capturedUrl: tab.url,
      capturedAt: new Date().toISOString()
    });
    
    // Open the editor in a new tab
    const editorUrl = chrome.runtime.getURL('index.html');
    await chrome.tabs.create({ url: editorUrl });
    
  } catch (error) {
    console.error('Failed to capture screenshot:', error);
  }
}

// Listen for extension icon click
chrome.action.onClicked.addListener((tab) => {
  captureAndEdit(tab);
});

// Listen for keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === '_execute_action') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        captureAndEdit(tabs[0]);
      }
    });
  }
});
