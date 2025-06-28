# Leviathan Desktop Icons

This directory contains the icon assets for the Leviathan Desktop application.

## Required Icons

- `32x32.png` - Small application icon
- `128x128.png` - Standard application icon  
- `128x128@2x.png` - High-DPI application icon
- `icon.icns` - macOS application icon bundle
- `icon.ico` - Windows application icon
- `tray-icon.png` - System tray icon (should be template-style for macOS)

## Icon Specifications

### System Tray Icon (`tray-icon.png`)
- **Size**: 16x16 or 32x32 pixels
- **Format**: PNG with transparency
- **Style**: Template icon (black silhouette for macOS)
- **Content**: Simplified Kingly brain logo

### Application Icons
- **Sizes**: Multiple sizes for different contexts
- **Format**: PNG with transparency, plus platform-specific formats
- **Style**: Full-color Kingly brain logo with depth and branding

## Design Guidelines

The Kingly logo should represent:
- **Intelligence**: Brain/neural network symbolism
- **AI-Native**: Modern, technological aesthetic  
- **Memory**: Interconnected nodes or synapses
- **System**: Structured, reliable, professional

## Placeholder Icons

Until custom icons are created, we're using:
- 🧠 emoji as placeholder for brain/memory symbolism
- Unicode brain emoji converted to icon formats
- Template-style versions for system tray

## Creating Icons

To generate proper icons from source artwork:

```bash
# Create different sizes from source SVG
inkscape --export-png=32x32.png --export-width=32 --export-height=32 kingly-logo.svg
inkscape --export-png=128x128.png --export-width=128 --export-height=128 kingly-logo.svg
inkscape --export-png=128x128@2x.png --export-width=256 --export-height=256 kingly-logo.svg

# Create macOS icon bundle
iconutil -c icns -o icon.icns icon.iconset/

# Create Windows ICO
convert 32x32.png 128x128.png icon.ico
```

## Current Status

🚧 **Placeholder icons in use** - Need custom Kingly branding icons created by design team.