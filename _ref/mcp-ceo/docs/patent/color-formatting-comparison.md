# PDF Color & Formatting Comparison

## Tool Capabilities Summary

### 1. md-to-pdf (Chrome-based)
**Color Support:** ✅ EXCELLENT
- Full CSS gradients (linear, radial)
- RGBA transparency
- Box shadows with blur
- Text shadows
- CSS variables
- Gradient text (-webkit-background-clip)

**Formatting:** ✅ EXCELLENT
- Web-accurate rendering
- Custom fonts work perfectly
- Respects all CSS properties
- Good code syntax highlighting

**File Size:** Large (362KB for test doc)

### 2. WeasyPrint (Python-based)
**Color Support:** ✅ GOOD
- Solid colors work perfectly
- Linear gradients supported
- RGBA transparency works
- ⚠️ Limited shadow support (warnings shown)
- ⚠️ No text-shadow support

**Formatting:** ✅ VERY GOOD
- Professional layout
- Custom fonts supported
- Most CSS works
- Some properties ignored (see warnings)

**File Size:** Medium-Large (512KB)

**Warnings from WeasyPrint:**
```
WARNING: Ignored `box-shadow` - unknown property
WARNING: Ignored `text-shadow` - unknown property
WARNING: Ignored `text-fill-color` - unknown property
WARNING: Ignored `overflow-x: auto` - unknown property
```

### 3. Pandoc (Direct)
**Color Support:** ❌ NONE (without LaTeX)
- Requires LaTeX for any PDF output
- With LaTeX: basic colors only
- No gradients
- No shadows

**Formatting:** ✅ EXCELLENT (with LaTeX)
- Best typography
- Professional layouts
- Academic quality
- Smaller file sizes

**Status:** Needs LaTeX installation

## Visual Comparison Results

| Feature | md-to-pdf | WeasyPrint | Pandoc+LaTeX |
|---------|-----------|------------|--------------|
| **Basic Colors** | ✅ Perfect | ✅ Perfect | ⚠️ Basic |
| **Gradients** | ✅ All types | ✅ Linear only | ❌ None |
| **Shadows** | ✅ Box & text | ⚠️ Limited | ❌ None |
| **Custom Fonts** | ✅ All work | ✅ Most work | ✅ System fonts |
| **Code Highlighting** | ✅ GitHub style | ✅ Basic | ✅ Native |
| **Tables** | ✅ Complex | ✅ Good | ✅ Excellent |
| **Math Rendering** | ✅ MathJax | ⚠️ Basic | ✅ Native TeX |
| **Page Breaks** | ✅ CSS control | ✅ CSS control | ✅ LaTeX control |

## Recommendations

### For Your Patent (Dark Purple Theme):
1. **First Choice:** md-to-pdf 
   - Only tool that renders gradients perfectly
   - Handles complex CSS theme
   
2. **Second Choice:** WeasyPrint
   - Good compromise
   - Loses some visual effects but maintains colors
   - No Chrome dependency

3. **Not Suitable:** Pandoc without heavy modification
   - Can't handle gradient theme
   - Would need complete redesign

### For Different Use Cases:

**Web-style documents with rich CSS:**
```bash
md-to-pdf input.md --css styles.css
```

**Professional documents with good CSS support:**
```bash
weasyprint input.html output.pdf
```

**Academic papers (install LaTeX first):**
```bash
pandoc input.md -o output.pdf --pdf-engine=xelatex
```

## Quick Test Commands

Test color support with each tool:
```bash
# Create test file with colors
echo '# Color Test
<span style="color: red;">Red</span>
<span style="color: #9d4edd;">Purple</span>
<div style="background: linear-gradient(45deg, purple, black);">Gradient</div>' > color-test.md

# Test with each tool
md-to-pdf color-test.md
pandoc color-test.md -s -o color-test.html && weasyprint color-test.html color-weasy.pdf
```

## Conclusion

- **md-to-pdf** wins for complex CSS and colors
- **WeasyPrint** is a good Chrome-free alternative with decent CSS support
- **Pandoc** needs LaTeX and is best for typography over visual effects

Your observation is correct: md-to-pdf has the best color/CSS support, while Pandoc (would) have the best typography if LaTeX were installed.