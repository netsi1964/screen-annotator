
## Building for Safari (macOS)

> Your're on your own here! I did it but... it can be hard and no support... sorry

Want to use Screen Annotator in Safari? Since Safari extensions must be distributed through the Mac App Store, you'll need to build it yourself. Don't worry – it's easier than it sounds!

### Prerequisites

- **macOS 10.15.6** (Catalina) or later
- **Xcode 12** or later (free from the Mac App Store)
- **Safari 14** or later

### Step 1: Set up Xcode

If this is your first time using Xcode, open Terminal and run:

```bash
sudo xcodebuild -runFirstLaunch
sudo xcodebuild -license accept
```

### Step 2: Clone the repository

```bash
git clone https://github.com/user/screen-annotator.git
cd screen-annotator
```

### Step 3: Convert to Safari extension

Run the Safari Web Extension Converter:

```bash
xcrun safari-web-extension-converter ./dist --app-name "Screen Annotator"
```

For macOS only (skip iOS):
```bash
xcrun safari-web-extension-converter ./dist --app-name "Screen Annotator" --macos-only
```

This will generate an Xcode project and open it automatically.

### Step 4: Build in Xcode

1. In Xcode, make sure **"Screen Annotator (macOS)"** is selected as the build target (top left dropdown)
2. Click **Product** → **Build** (or press `⌘+B`)
3. Wait for the build to complete (you should see "Build Succeeded")

### Step 5: Enable unsigned extensions in Safari

Safari doesn't allow unsigned extensions by default. To enable them:

1. Open **Safari**
2. Go to **Safari** → **Settings** (or press `⌘+,`)
3. Click the **Advanced** tab
4. Check **"Show Develop menu in menu bar"**
5. Close Settings
6. Click **Develop** in the menu bar
7. Check **"Allow Unsigned Extensions"**
8. Enter your Mac password when prompted

> ⚠️ **Note:** You'll need to repeat steps 6-8 every time you restart your Mac – Safari disables unsigned extensions on reboot for security reasons.

### Step 6: Enable the extension

1. Go to **Safari** → **Settings** → **Extensions**
2. Find **"Screen Annotator"** in the list
3. Check the box to enable it
4. Grant the necessary permissions when prompted

### Done! 🎉

You should now see the Screen Annotator icon in Safari's toolbar.

### Troubleshooting

**"A required plugin failed to load"**

Run these commands and try again:
```bash
sudo xcodebuild -runFirstLaunch
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

**Extension not showing in Safari**

- Make sure you've enabled "Allow Unsigned Extensions" in the Develop menu
- Try rebuilding in Xcode with `⌘+Shift+K` (clean) then `⌘+B` (build)

**"Library not loaded: CoreSimulator"**

Open Xcode → Settings → Platforms → Download at least one iOS Simulator, or use the `--macos-only` flag when converting.

