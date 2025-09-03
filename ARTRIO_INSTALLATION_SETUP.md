# ArtRio Installation Setup Guide
## Auto-Print Configuration for PRIO Conception App

### 🎯 Overview
This guide configures automatic printing without confirmation dialogs for the PRIO Conception App at ArtRio 2025.

### 🖥️ Browser Setup (Required for Auto-Print)

#### Option 1: Full Kiosk Mode (Recommended)
```bash
# Windows
"C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --kiosk-printing https://prio-conception.thomash-efd.workers.dev

# macOS
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --kiosk --kiosk-printing https://prio-conception.thomash-efd.workers.dev

# Linux
google-chrome --kiosk --kiosk-printing https://prio-conception.thomash-efd.workers.dev
```

#### Option 2: Silent Print Only (Windowed Mode)
```bash
# If you prefer windowed mode but still want silent printing
chrome.exe --kiosk-printing https://prio-conception.thomash-efd.workers.dev
```

### 📋 Installation Steps

#### 1. Create Kiosk Shortcut
1. **Right-click desktop** → "New" → "Shortcut"
2. **Enter target path** (use Option 1 command above)
3. **Name it**: "PRIO ArtRio Kiosk"
4. **Test the shortcut** - should open fullscreen with no browser UI

#### 2. Auto-Startup (Optional)
1. **Copy the shortcut**
2. **Press Win+R** → type `shell:startup` → Enter
3. **Paste shortcut** in startup folder
4. **Restart computer** to test auto-launch

#### 3. Printer Configuration
1. **Set default printer** in Windows/macOS settings
2. **Test print** from any application
3. **Configure paper size** (recommended: A4 or Letter)
4. **Set print quality** (recommended: High/Best)

### 🔧 How It Works

#### Auto-Print Logic
- **Detects kiosk mode** automatically
- **Only prints shareable URLs** (not base64 fallbacks)
- **1.5 second delay** ensures image is fully loaded
- **Invisible iframe** method for clean printing
- **Automatic cleanup** after printing

#### Manual Override
- **Print button** always available for admin/testing
- **Works in any browser mode**
- **Visual feedback** when printing

### 🎨 Print Behavior

#### What Gets Printed
- **Direct image URL** from Cloudflare Images
- **Full resolution** (1024x1536 portrait format)
- **Clean output** - just the artwork, no UI elements
- **Proper scaling** handled by browser

#### What Doesn't Print
- **Base64 fallback images** (only when Cloudflare Images fails)
- **UI elements** (buttons, text, backgrounds)
- **QR codes or links** (image only)

### 🚀 Testing

#### Test Auto-Print
1. **Launch kiosk mode** using the shortcut
2. **Generate an artwork** through normal conversation
3. **Check console** for "Kiosk mode detected - auto-printing" message
4. **Verify print job** appears in print queue

#### Test Manual Print
1. **Click "🖨️ Imprimir" button** on any generated artwork
2. **Button changes** to "✅ Imprimindo..." for 3 seconds
3. **Print job** should appear immediately

### 🛠️ Troubleshooting

#### Auto-Print Not Working
- **Check kiosk mode**: Browser should be fullscreen with no address bar
- **Verify printer**: Test print from another application
- **Check console**: Look for error messages in browser dev tools (F12)
- **Try manual print**: Use the print button to test basic functionality

#### Print Quality Issues
- **Check printer settings**: Ensure high quality mode
- **Verify paper size**: Should match artwork aspect ratio
- **Update printer drivers**: Ensure latest drivers installed
- **Test different browsers**: Try Edge with same flags

#### Browser Issues
- **Clear cache**: Ctrl+Shift+Delete to clear browser data
- **Disable extensions**: Extensions can interfere with kiosk mode
- **Check Chrome version**: Ensure recent version (2024+)
- **Try incognito**: Add `--incognito` flag to shortcut

### 🔐 Security & Admin

#### Exit Kiosk Mode
- **Alt+F4**: Closes kiosk mode
- **Ctrl+Alt+Del**: Opens task manager (Windows)
- **Cmd+Q**: Quit application (macOS)

#### Admin Access
- **F12**: Opens developer tools (if needed for debugging)
- **Ctrl+Shift+I**: Alternative dev tools shortcut
- **Manual print button**: Always available as backup

### 📊 Production Checklist

- [ ] Browser shortcut created with correct flags
- [ ] Kiosk mode launches fullscreen
- [ ] Default printer configured
- [ ] Test auto-print with generated artwork
- [ ] Test manual print button
- [ ] Verify print quality and sizing
- [ ] Test exit procedures (Alt+F4)
- [ ] Optional: Add to startup folder

### 🎯 Expected User Experience

1. **User generates artwork** through conversation with Prio
2. **Artwork appears** on screen with sharing options
3. **Print automatically starts** (in kiosk mode)
4. **User can collect** printed artwork
5. **QR code available** for digital sharing

### 📞 Support

For technical issues during ArtRio:
- **Manual print button** always works as backup
- **Browser restart**: Close and reopen kiosk shortcut
- **Printer restart**: Turn printer off/on if jobs stuck
- **Check paper/ink**: Ensure printer supplies adequate

---

**Installation Complete!** 🎉
The PRIO Conception App is now configured for automatic printing at ArtRio 2025.
