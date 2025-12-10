# Screenshot Editor - Product Requirements Document

## Overview

A professional-grade, browser-based screenshot annotation tool built with React, Fabric.js, and TypeScript. Available as both a **web application** and a **Chrome extension**. The application enables users to capture screens, upload images, and annotate them with shapes, text, arrows, and drawings before exporting.

---

## Table of Contents

1. [Chrome Extension Installation](#chrome-extension-installation)
2. [Using the Extension](#using-the-extension)
3. [Core Features](#core-features)
4. [User Interface](#user-interface)
5. [Tools & Instruments](#tools--instruments)
6. [Color & Styling System](#color--styling-system)
7. [Object Manipulation](#object-manipulation)
8. [Keyboard Shortcuts](#keyboard-shortcuts)
9. [Export Options](#export-options)
10. [Technical Architecture](#technical-architecture)
11. [Design System](#design-system)

---

## Chrome Extension Installation

### Building the Extension

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd screenshot-editor
   npm install
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **The `dist/` folder** will contain everything needed for the extension.

### Installing in Chrome (Developer Mode)

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `dist/` folder from your project
5. The extension icon will appear in your toolbar

### Extension Files Structure

```
dist/
├── manifest.json          # Extension manifest (Manifest V3)
├── background.js          # Service worker for capture logic
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── index.html             # Editor page
└── assets/                # Bundled JS/CSS
```

### Extension Permissions

| Permission | Purpose |
|------------|---------|
| `activeTab` | Capture the currently active tab |
| `tabs` | Access tab URL for metadata |
| `storage` | Temporarily store captured screenshot |

---

## Using the Extension

### Capture Methods

| Action | How |
|--------|-----|
| **Capture via icon** | Click the extension icon in your toolbar |
| **Capture via shortcut** | Press `Ctrl+Shift+S` (Windows/Linux) or `⌘+Shift+S` (Mac) |
| **Result** | Screenshot opens in a new tab for editing |

### Web App Usage

1. Open the web application in your browser
2. Choose an input method:
   - **Capture Screen**: Share your screen, window, or tab
   - **Upload Image**: Select an image file from your device
   - **Try Demo**: Load a sample image
3. Use the annotation tools to mark up your screenshot
4. Export via Download or Copy to clipboard

---

## Core Features

### Image Input Methods

| Method | Description |
|--------|-------------|
| **Screen Capture** | Uses `navigator.mediaDevices.getDisplayMedia` to capture any screen, window, or browser tab |
| **File Upload** | Supports all standard image formats (PNG, JPG, GIF, WebP, etc.) |
| **Demo Image** | Built-in sample image for quick testing |
| **Clipboard Paste** | Paste images directly from system clipboard with `Cmd/Ctrl+V` |

### Canvas System

- **Responsive sizing**: Auto-scales to fit viewport while maintaining aspect ratio
- **Background grid**: Subtle grid pattern for visual alignment
- **Selection system**: Multi-select with Shift+click, bounding box on hover
- **Z-index management**: Layer ordering for overlapping objects

---

## User Interface

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                        Top Toolbar                           │
│  [Toolbar] [ColorPicker] [ShadowControls] [ArrowControls]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                     Canvas Area                              │
│                  (with context menu)                         │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                      Action Bar                              │
│        [URL] [DateTime] [Download] [Copy] [Clear]           │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
Index
├── CaptureScreen (initial screen)
│   ├── Demo Image Button
│   ├── Capture Screen Button
│   └── Upload Image Button
│
└── ScreenshotEditor (main editor)
    ├── Toolbar
    ├── ColorPicker
    ├── ShadowControls (context-sensitive)
    ├── ArrowControls (context-sensitive, for arrows)
    ├── CanvasContextMenu
    └── ActionBar
```

---

## Tools & Instruments

### Drawing Tools

| Tool | Shortcut | Description |
|------|----------|-------------|
| **Select** | `V` | Default selection/move tool. Click to select, drag to move. |
| **Crop** | `X` | Crop the canvas to a selected area. Adjust the crop rectangle, then press Enter to apply or Escape to cancel. |
| **Draw** | `P` | Freehand pencil drawing with current stroke color and width |
| **Highlight** | `H` | Semi-transparent (50% opacity) freehand highlighting, 20px width |
| **Rectangle** | `R` | Creates rounded rectangles with stroke and optional fill |
| **Circle** | `C` | Creates circles/ellipses with stroke and optional fill |
| **Arrow** | `A` | Creates configurable arrows as single Path objects |
| **Line** | `L` | Creates simple straight lines |
| **Text** | `T` | Creates editable IText objects, double-click to edit |

### Arrow Configuration

When an arrow is selected, the **ArrowControls** panel appears with:

| Setting | Options | Description |
|---------|---------|-------------|
| **Start Type** | None, Arrow, Circle, Diamond | Shape at the starting point |
| **End Type** | None, Arrow, Circle, Diamond | Shape at the ending point |
| **Size** | 8-30 | Arrow head size in pixels |
| **Width** | 1-10 | Line stroke width |

### Delete Tool

- Located in toolbar after separator
- Shortcut: `Delete` / `Backspace`
- Removes all selected objects

---

## Color & Styling System

### Color Picker

#### Stroke & Fill

- **Visual indicator**: Overlapping squares showing current stroke (front) and fill (back)
- **Click**: Sets stroke color
- **Cmd/Ctrl+Click**: Sets fill color
- **Right-click on swatch**: Opens native color picker to customize that swatch

#### Default Color Palette

```
Red (#FF5252) | Orange (#FF9800) | Yellow (#FFEB3B) | Green (#4CAF50)
Blue (#00BFFF) | Purple (#9C27B0) | Pink (#E91E63) | White (#FFFFFF) | Black (#000000)
```

#### Opacity Control

- **Alt+Drag** on stroke indicator: Adjusts stroke opacity (5%-100%)
- **Alt+Drag** on fill indicator: Adjusts fill opacity (5%-100%)
- Visual opacity bar displayed on each indicator

#### Stroke Width

- Preset buttons: 1px, 2px, 3px, 5px, 8px
- Numeric input: 0.5px - 50px with 0.5px step
- **Alt+Drag** on width button: Continuous adjustment

### Shadow Controls

Appears for selected objects:

| Setting | Range | Default |
|---------|-------|---------|
| **Toggle** | On/Off | Off |
| **Color** | Any hex color | #000000 |
| **Blur** | 0-50px | 10px |
| **Offset X** | -30 to 30px | 4px |
| **Offset Y** | -30 to 30px | 4px |

---

## Object Manipulation

### Selection

- **Click**: Select single object
- **Shift+Click**: Add to selection
- **Hover**: Shows dashed blue bounding box preview
- **Drag on empty area**: Marquee selection

### Transform Controls

| Control | Normal | With Cmd/Ctrl |
|---------|--------|---------------|
| **Corner handles** | Scale uniformly | Rotate |
| **Side handles** | Scale on one axis | Skew/Distort |

### Cloning

- **Alt+Drag**: Instant clone - leaves copy at original position while dragging
- Cursor changes to "copy" indicator when Alt is held

### Context Menu (Right-Click)

When object(s) selected:

| Action | Shortcut | Description |
|--------|----------|-------------|
| Copy | `⌘C` | Copy to internal clipboard |
| Duplicate | `⌘D` | Create offset copy |
| Delete | `⌫` | Remove object |
| Flip Horizontal | - | Mirror horizontally |
| Flip Vertical | - | Mirror vertically |
| Group | `⌘G` | Group selected objects |
| Ungroup | `⌘⇧G` | Ungroup selected group |
| **Arrange** | | Submenu |
| → Bring to Front | `⌘⇧]` | Move to top layer |
| → Bring Forward | `⌘]` | Move up one layer |
| → Send Backward | `⌘[` | Move down one layer |
| → Send to Back | `⌘⇧[` | Move to bottom layer |
| **Copy as...** | | Submenu |
| → Copy as PNG | - | Copy rasterized to clipboard |
| → Copy as SVG | - | Copy vector markup |

When no selection:

| Action | Shortcut |
|--------|----------|
| Paste | `⌘V` |

---

## Keyboard Shortcuts

### Tool Selection

| Key | Tool |
|-----|------|
| `V` | Select |
| `X` | Crop |
| `P` | Draw |
| `H` | Highlight |
| `R` | Rectangle |
| `C` | Circle |
| `A` | Arrow |
| `L` | Line |
| `T` | Text |

### Editing

| Shortcut | Action |
|----------|--------|
| `⌘C` | Copy |
| `⌘V` | Paste (objects or images from clipboard) |
| `⌘D` | Duplicate |
| `⌘G` | Group |
| `⌘⇧G` | Ungroup |
| `Delete` / `Backspace` | Delete selected |
| `Escape` | Deselect all |

### Layer Management

| Shortcut | Action |
|----------|--------|
| `⌘]` | Bring Forward |
| `⌘[` | Send Backward |
| `⌘⇧]` | Bring to Front |
| `⌘⇧[` | Send to Back |

---

## Export Options

### Action Bar Features

| Action | Description |
|--------|-------------|
| **Add URL** | Inserts current page URL as text overlay (bottom-left) |
| **Add Date/Time** | Inserts ISO timestamp as text overlay |
| **Download** | Exports canvas as PNG file (2x resolution) |
| **Copy** | Copies canvas to system clipboard as PNG |
| **Clear/New** | Returns to capture screen to start fresh |

### Export Specifications

- **Format**: PNG
- **Quality**: 100%
- **Resolution**: 2x multiplier for retina displays
- **Filename**: `screenshot-{timestamp}.png`

---

## Technical Architecture

### Dependencies

| Package | Purpose |
|---------|---------|
| `fabric` | Canvas rendering and object manipulation |
| `react` | UI framework |
| `lucide-react` | Icon library |
| `sonner` | Toast notifications |
| `tailwindcss` | Styling |
| `@radix-ui/*` | UI primitives (tooltips, context menus, etc.) |

### Key Components

| Component | File | Purpose |
|-----------|------|---------|
| `ScreenshotEditor` | `ScreenshotEditor.tsx` | Main editor with Fabric.js canvas |
| `Toolbar` | `Toolbar.tsx` | Tool selection buttons |
| `ColorPicker` | `ColorPicker.tsx` | Color, opacity, and stroke width controls |
| `ArrowControls` | `ArrowControls.tsx` | Arrow end type and size settings |
| `ShadowControls` | `ShadowControls.tsx` | Drop shadow configuration |
| `ActionBar` | `ActionBar.tsx` | Export and metadata actions |
| `CanvasContextMenu` | `CanvasContextMenu.tsx` | Right-click context menu |
| `CaptureScreen` | `CaptureScreen.tsx` | Initial capture/upload screen |

### State Management

- Component-level state with `useState` and `useCallback`
- No external state library (keeps it simple)
- Fabric.js manages canvas object state

### Custom Fabric.js Extensions

- **Custom controls**: Corner/side handles with modifier key behavior
- **Hover preview**: Temporary bounding box on mouse over
- **Arrow paths**: Generated SVG paths for arrow decorations

---

## Design System

### Color Tokens (HSL)

```css
--background: 220 20% 10%      /* Dark blue-gray */
--foreground: 210 20% 95%      /* Near white */
--primary: 200 100% 50%        /* Bright cyan blue */
--accent: 280 80% 60%          /* Purple */
--destructive: 0 75% 55%       /* Red */
--success: 145 70% 45%         /* Green */
--warning: 40 90% 55%          /* Orange-yellow */
```

### Typography

- **Sans-serif**: Inter
- **Monospace**: JetBrains Mono (for URL/datetime overlays)

### Component Classes

| Class | Usage |
|-------|-------|
| `.toolbar-btn` | Standard toolbar button |
| `.toolbar-btn-active` | Active tool state |
| `.color-swatch` | Color palette circles |
| `.glass-panel` | Frosted glass card effect |
| `.canvas-container` | Canvas wrapper with grid background |
| `.text-gradient` | Primary gradient text |

### Animations

- `fadeIn`: 0.3s opacity transition
- `slideUp`: 0.3s translate + opacity
- `scaleIn`: 0.2s scale + opacity

---

## Future Considerations

### Potential Enhancements

- [x] Undo/Redo history
- [x] Crop tool
- [ ] Zoom and pan controls
- [ ] Custom shape presets
- [ ] Template system
- [ ] Cloud save/load
- [ ] Collaboration features
- [ ] More export formats (JPEG, WebP, PDF)
- [ ] Annotation templates
- [ ] Blur/Pixelate tool for redaction
- [ ] Measurement/dimension tools

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024 | Initial release with core annotation tools |
| 1.1.0 | 2024 | Added arrow configuration, shadow controls, hover preview |
| 1.2.0 | 2024 | Added Chrome extension support, improved documentation |
| 1.3.0 | 2024 | Added undo/redo history and crop tool |
