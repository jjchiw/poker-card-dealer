# PWA Setup Instructions

## Installation

First, install the required dependency:

```bash
npm install -D vite-plugin-pwa
```

## Icons

You need to create two icon files in the `public/` folder:
- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)

### Quick Icon Generation Options:

1. **PWA Builder** (Recommended)
   - Go to https://www.pwabuilder.com/imageGenerator
   - Upload an image or emoji
   - Download the generated icons

2. **Favicon.io**
   - Go to https://favicon.io/favicon-generator/
   - Create icon with text "🂠" or card design
   - Download and rename files

3. **Simple Canvas Method** (Quick & Easy)
   ```bash
   # Use a service like cloudconvert.com to convert emoji to PNG
   # Or use any image editor to create a simple design
   ```

## Recommended Icon Design

- Background: Dark green (#0a2e1e) or card table felt color
- Icon: Playing card emoji 🂠 or simple card design
- Colors: Use your theme's primary color (#10b981)

## After Adding Icons

1. Remove the `.txt` placeholder files
2. Add your actual PNG files
3. Build and test:
   ```bash
   npm run build
   npm run preview
   ```

## Features Enabled

✅ **Install to Home Screen** - Users can add your app to their device
✅ **Offline Support** - App works without internet (cached assets)
✅ **Auto Updates** - Service worker updates automatically
✅ **Audio Caching** - All MP3 files cached for offline use
✅ **Tailwind CDN Cached** - Even external CSS cached for performance

## Testing PWA

1. Build the app: `npm run build`
2. Preview: `npm run preview`
3. Open Chrome DevTools > Application > Manifest
4. Check if manifest loads correctly
5. Test "Install App" prompt on mobile

## Deployment

The PWA will automatically work on your GitHub Pages deployment after:
1. Adding the icons
2. Rebuilding and pushing to main
3. Users will see an "Add to Home Screen" prompt on mobile devices

Enjoy your installable poker card dealer app! 🎴📱
