# Watch2gether Favicon Guide

## SVG Favicon (Current Implementation)

The favicon is located at `/public/favicon.svg` and features the Global Connect logo design with:
- Globe with gradient (purple to blue)
- Play button in the center
- Orange user dots representing connected viewers
- Orange "2" badge
- Optimized for small sizes (16x16 to 64x64 pixels)

## Using the Favicon

The SVG favicon is already linked in `/index.html`:
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
```

## Converting to .ico Format

Since `.ico` files are binary image files, you'll need to convert the SVG using one of these methods:

### Online Tools (Recommended):
1. **RealFaviconGenerator** (https://realfavicongenerator.net/)
   - Upload the `/public/favicon.svg` file
   - Generate all favicon formats automatically
   - Download and place in `/public/` folder

2. **Favicon.io** (https://favicon.io/favicon-converter/)
   - Upload the SVG
   - Download the generated .ico file

3. **CloudConvert** (https://cloudconvert.com/svg-to-ico)
   - Convert SVG to ICO format directly

### Command Line (ImageMagick):
```bash
# Install ImageMagick first
# Then run:
convert /public/favicon.svg -define icon:auto-resize=16,32,48,64 /public/favicon.ico
```

## Recommended Favicon Package

For best browser support, generate these files and add to `/public/`:
- `favicon.ico` (16x16, 32x32, 48x48)
- `favicon-16x16.png`
- `favicon-32x32.png`
- `apple-touch-icon.png` (180x180)
- `android-chrome-192x192.png`
- `android-chrome-512x512.png`

Then update `/index.html` with all formats:
```html
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
```

## Current SVG Code

The SVG source code is available in `/public/favicon.svg` and can be edited directly if you need to make adjustments to colors, size, or elements.
