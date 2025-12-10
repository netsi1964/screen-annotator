# Chrome Web Store Distribution Guide

This guide will walk you through the process of publishing your Screen Annotator extension to the Chrome Web Store.

## Prerequisites

1. **Chrome Web Store Developer Account**
   - Visit [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Sign in with your Google account
   - Pay the one-time registration fee of **$5 USD** (one-time payment, not recurring)
   - This fee is required to publish extensions to the Chrome Web Store

2. **Prepare Your Extension Package**
   - Build your extension: `npm run build`
   - Ensure the `dist/` folder contains all necessary files
   - Test the extension thoroughly before submission

## Required Assets

### 1. Extension Icons ✅ (Already have)
You need icons in these sizes:
- `icon16.png` - 16x16 pixels
- `icon32.png` - 32x32 pixels  
- `icon48.png` - 48x48 pixels
- `icon128.png` - 128x128 pixels

**Status**: ✅ You already have these in `public/icons/`

### 2. Store Listing Images

You'll need to create these images for the Chrome Web Store listing:

#### Small Promotional Tile (440x280px) - **REQUIRED**
- Used in the Chrome Web Store homepage and category pages
- Should showcase your extension's main features
- Format: PNG or JPG

#### Large Promotional Tile (920x680px) - **REQUIRED**
- Used in the Chrome Web Store header
- Should be visually appealing and represent your extension
- Format: PNG or JPG

#### Screenshots (1280x800px or 640x400px) - **REQUIRED**
- At least 1 screenshot, up to 5 screenshots
- Show your extension in action
- Should demonstrate key features
- Format: PNG or JPG
- Tip: You can use your existing `screen-annotator.png` as a base

### 3. Privacy Policy - **REQUIRED**

Since your extension uses the `storage` permission, you **must** provide a privacy policy URL.

**Options:**
- Host a privacy policy page on your website
- Use GitHub Pages to host a simple privacy policy
- Use a free hosting service

**Privacy Policy Template:**

Create a file `PRIVACY_POLICY.md` or `privacy-policy.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Privacy Policy - Screenshot Editor</title>
</head>
<body>
    <h1>Privacy Policy for Screenshot Editor Chrome Extension</h1>
    <p><strong>Last updated:</strong> [Date]</p>
    
    <h2>Data Collection</h2>
    <p>Screenshot Editor respects your privacy. We do not collect, store, or transmit any personal data.</p>
    
    <h2>Local Storage</h2>
    <p>The extension uses Chrome's local storage API to temporarily store screenshots and metadata (URL, timestamp) on your device. This data:</p>
    <ul>
        <li>Is stored only on your local device</li>
        <li>Is never transmitted to external servers</li>
        <li>Is cleared when you close the editor tab</li>
        <li>Can be cleared manually via Chrome's storage settings</li>
    </ul>
    
    <h2>Permissions</h2>
    <p>The extension requires the following permissions:</p>
    <ul>
        <li><strong>activeTab</strong>: To capture screenshots of the current tab</li>
        <li><strong>tabs</strong>: To access the URL of the captured tab for metadata</li>
        <li><strong>storage</strong>: To temporarily store screenshot data locally</li>
    </ul>
    
    <h2>Third-Party Services</h2>
    <p>This extension does not use any third-party analytics, tracking, or data collection services.</p>
    
    <h2>Contact</h2>
    <p>If you have questions about this privacy policy, please open an issue on our GitHub repository.</p>
</body>
</html>
```

## Step-by-Step Submission Process

### Step 1: Prepare Your Package

1. **Build the extension:**
   ```bash
   npm run build
   ```

2. **Create a ZIP file:**
   - Navigate to the `dist/` folder
   - Select all files and folders inside `dist/`
   - Create a ZIP archive (not the `dist` folder itself, but its contents)
   - Name it something like `screenshot-editor-v1.0.0.zip`

3. **Verify the ZIP contents:**
   ```
   screenshot-editor-v1.0.0.zip
   ├── manifest.json
   ├── background.js
   ├── index.html
   ├── icons/
   │   ├── icon16.png
   │   ├── icon32.png
   │   ├── icon48.png
   │   └── icon128.png
   └── assets/
       ├── index-[hash].js
       ├── index-[hash].css
       └── default-screenshot-[hash].jpg
   ```

### Step 2: Create Store Listing

1. **Go to Chrome Web Store Developer Dashboard:**
   - Visit: https://chrome.google.com/webstore/devconsole
   - Click "New Item"

2. **Upload Your Package:**
   - Click "Choose file" and select your ZIP file
   - Wait for upload and validation to complete
   - Fix any errors if they appear

3. **Fill in Store Listing Details:**

   **Basic Information:**
   - **Name**: Screen Annotator
   - **Summary** (132 characters max): 
     ```
     Capture and annotate screenshots with shapes, arrows, text, and more. 
     Professional screenshot editing tool with crop, draw, and export features.
     ```
   
   **Description** (up to 16,000 characters):
   ```
   Screen Annotator is a professional-grade browser extension for capturing 
   and annotating screenshots. Perfect for creating tutorials, bug reports, 
   design mockups, and visual documentation.
   
   ✨ Key Features:
   
   🎨 Rich Annotation Tools
   - Draw freehand with customizable brush
   - Add shapes: rectangles, circles, arrows, lines
   - Highlight areas with semi-transparent overlay
   - Add text annotations with custom fonts
   
   ✂️ Image Cropping
   - Crop images with precision
   - Rotate crop area with Cmd/Ctrl+drag
   - Adjust crop boundaries easily
   
   🎯 Professional Editing
   - Transform controls: scale, rotate, skew
   - Layer management: bring forward/backward
   - Group and ungroup objects
   - Undo/redo support
   
   🎨 Customizable Styling
   - Choose any color for strokes and fills
   - Adjust opacity for transparency effects
   - Customize stroke width
   - Add drop shadows to objects
   - Configure arrow endpoints
   
   ⌨️ Keyboard Shortcuts
   - Fast tool selection (V, P, H, R, C, A, L, T, X)
   - Quick editing (Cmd/Ctrl+C, V, D, G, Z)
   - Efficient workflow
   
   💾 Export Options
   - Download as high-resolution PNG
   - Copy to clipboard for instant sharing
   - Add URL and timestamp metadata
   
   🚀 Easy to Use
   - Click extension icon or press Ctrl+Shift+S (Cmd+Shift+S on Mac)
   - Intuitive interface
   - No account required
   - Works offline
   
   Perfect for developers, designers, content creators, and anyone who needs 
   to quickly annotate and share screenshots.
   ```

   **Category**: Choose "Productivity" or "Developer Tools"
   
   **Language**: English (United States)
   
   **Privacy Practices:**
   - Check "This item uses your data"
   - Provide your Privacy Policy URL
   - Select "Uses local storage" (since you use chrome.storage.local)

4. **Upload Images:**

   **Icons:**
   - Upload your 128x128 icon (already have this)

   **Screenshots:**
   - Upload at least 1 screenshot (1280x800px recommended)
   - You can use your `screen-annotator.png` as a base
   - Add more screenshots showing different features

   **Promotional Images:**
   - Small tile: 440x280px
   - Large tile: 920x680px
   - These are optional but recommended for better visibility

5. **Additional Information:**

   **Support URL** (optional but recommended):
   - Your GitHub repository URL
   - Or a support email/website

   **Homepage URL** (optional):
   - Your GitHub repository URL
   - Or a dedicated website

### Step 3: Submit for Review

1. **Review your listing:**
   - Double-check all information
   - Ensure privacy policy URL is accessible
   - Verify all images are uploaded correctly

2. **Submit:**
   - Click "Submit for Review"
   - You'll receive a confirmation email

3. **Review Process:**
   - Typically takes 1-3 business days
   - Google will review for:
     - Policy compliance
     - Functionality
     - Security
     - User experience

4. **After Approval:**
   - Your extension will be live on the Chrome Web Store
   - Users can install it with one click
   - You'll receive notifications about reviews and ratings

## Post-Publication

### Updating Your Extension

1. **Make changes and rebuild:**
   ```bash
   npm run build
   ```

2. **Update version in manifest.json:**
   ```json
   {
     "version": "1.0.1"
   }
   ```

3. **Create new ZIP file**

4. **Upload new version:**
   - Go to your extension in the developer dashboard
   - Click "Upload Updated Package"
   - Upload the new ZIP
   - Add release notes describing changes
   - Submit for review

### Best Practices

1. **Version Numbering:**
   - Use semantic versioning: `MAJOR.MINOR.PATCH`
   - Example: `1.0.0`, `1.0.1`, `1.1.0`, `2.0.0`

2. **Release Notes:**
   - Always include release notes for updates
   - Describe new features, bug fixes, improvements

3. **Respond to Reviews:**
   - Monitor user reviews
   - Respond to feedback
   - Address issues quickly

4. **Analytics** (Optional):
   - Consider adding basic analytics to understand usage
   - Respect user privacy
   - Make it opt-in if possible

## Checklist Before Submission

- [ ] Extension builds successfully (`npm run build`)
- [ ] Extension works correctly when loaded unpacked
- [ ] All icons are present (16, 32, 48, 128px)
- [ ] Privacy policy is hosted and accessible
- [ ] Store listing description is complete
- [ ] Screenshots are prepared (at least 1)
- [ ] Promotional tiles are prepared (optional but recommended)
- [ ] Version number is set correctly in manifest.json
- [ ] No console errors in production build
- [ ] Extension works in incognito mode (if applicable)
- [ ] All permissions are justified in description

## Resources

- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [Chrome Web Store Developer Documentation](https://developer.chrome.com/docs/webstore/)
- [Chrome Extension Best Practices](https://developer.chrome.com/docs/extensions/mv3/devguide/)
- [Privacy Policy Requirements](https://developer.chrome.com/docs/webstore/user-data/)

## Need Help?

If you encounter issues during submission:
1. Check the Chrome Web Store documentation
2. Review the error messages in the developer dashboard
3. Ensure your manifest.json follows Manifest V3 requirements
4. Verify all required fields are filled

Good luck with your submission! 🚀

