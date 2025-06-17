# PDF Generation Alternatives - Complete Guide

## 🚀 Quick Comparison Matrix

| Tool | Chrome-Free | Best For | Setup Complexity | Quality |
|------|-------------|----------|------------------|---------|
| **Pandoc** | ✅ Yes | Technical/Legal docs | Medium (needs LaTeX) | ⭐⭐⭐⭐⭐ |
| **wkhtmltopdf** | ✅ Yes | Web-style PDFs | Low | ⭐⭐⭐⭐ |
| **md-to-pdf** | ❌ No | Quick conversions | Low | ⭐⭐⭐⭐ |
| **grip** | ⚠️ Partial | GitHub preview | Low | ⭐⭐⭐ |
| **mdpdf** | ❌ No | Simple docs | Low | ⭐⭐⭐ |

## 1. Pandoc - The Professional Choice

### Installation
```bash
# Install pandoc and LaTeX (for PDF generation)
brew install pandoc
brew install --cask mactex-no-gui  # Lighter LaTeX distribution
# OR full MacTeX:
brew install --cask mactex
```

### Basic Usage
```bash
# Simple conversion
pandoc input.md -o output.pdf

# With custom formatting
pandoc input.md -o output.pdf \
  --pdf-engine=xelatex \
  --variable geometry:margin=1in \
  --variable fontsize=12pt \
  --variable mainfont="Times New Roman"
```

### Professional Templates
```bash
# Create a template file (template.tex)
cat > template.tex << 'EOF'
\documentclass[11pt,letterpaper]{article}
\usepackage[margin=1in]{geometry}
\usepackage{fancyhdr}
\pagestyle{fancy}
\fancyhead[L]{$title$}
\fancyhead[R]{$date$}
\begin{document}
$body$
\end{document}
EOF

# Use template
pandoc input.md -o output.pdf --template=template.tex
```

### Patent/Legal Document Settings
```bash
pandoc patent.md -o patent.pdf \
  --pdf-engine=xelatex \
  --variable documentclass=article \
  --variable geometry:"top=1in, bottom=1in, left=1.25in, right=1.25in" \
  --variable fontsize=12pt \
  --variable linestretch=1.5 \
  --number-sections \
  --toc
```

## 2. wkhtmltopdf - HTML/CSS Approach

### Installation
```bash
brew install --cask wkhtmltopdf
```

### Usage (requires HTML conversion first)
```bash
# Convert markdown to HTML, then to PDF
pandoc input.md -t html -o temp.html
wkhtmltopdf \
  --margin-top 25mm \
  --margin-bottom 25mm \
  --margin-left 32mm \
  --margin-right 32mm \
  --page-size Letter \
  temp.html output.pdf
rm temp.html
```

### With Custom CSS
```bash
# Create custom.css
cat > custom.css << 'EOF'
body { font-family: "Times New Roman", serif; font-size: 12pt; }
h1 { font-size: 16pt; font-weight: bold; }
code { background-color: #f4f4f4; padding: 2px 4px; }
EOF

# Convert with CSS
pandoc input.md -t html --css=custom.css -o temp.html
wkhtmltopdf temp.html output.pdf
```

## 3. Alternative: Using Python (No Chrome)

### Install markdown2pdf
```bash
pip install markdown2pdf
```

### Usage
```python
# save as convert.py
from markdown2pdf import convert_md_to_pdf

with open('input.md', 'r') as f:
    md_content = f.read()

convert_md_to_pdf('output.pdf', md_content, 
    css='body { font-family: Arial; margin: 1in; }')
```

## 4. Shell Script for Multiple Tools

```bash
#!/bin/bash
# save as md2pdf.sh

usage() {
    echo "Usage: $0 [-t tool] [-o output] input.md"
    echo "Tools: pandoc, wkhtmltopdf, mdtopdf"
    exit 1
}

TOOL="pandoc"
OUTPUT=""
INPUT=""

while getopts "t:o:h" opt; do
    case $opt in
        t) TOOL="$OPTARG" ;;
        o) OUTPUT="$OPTARG" ;;
        h) usage ;;
        *) usage ;;
    esac
done

shift $((OPTIND-1))
INPUT="$1"

if [ -z "$INPUT" ]; then
    usage
fi

if [ -z "$OUTPUT" ]; then
    OUTPUT="${INPUT%.md}.pdf"
fi

case $TOOL in
    pandoc)
        pandoc "$INPUT" -o "$OUTPUT" \
            --pdf-engine=xelatex \
            --variable geometry:margin=1in
        ;;
    wkhtmltopdf)
        TEMP_HTML=$(mktemp).html
        pandoc "$INPUT" -t html -o "$TEMP_HTML"
        wkhtmltopdf --page-size Letter "$TEMP_HTML" "$OUTPUT"
        rm "$TEMP_HTML"
        ;;
    mdtopdf)
        md-to-pdf "$INPUT" \
            --pdf-options '{"format": "Letter", "margin": {"top": "1in"}}'
        ;;
    *)
        echo "Unknown tool: $TOOL"
        exit 1
        ;;
esac

echo "PDF generated: $OUTPUT"
```

## 5. Best Practices by Document Type

### Technical Documentation
```bash
# Pandoc with code highlighting
pandoc tech-doc.md -o tech-doc.pdf \
  --highlight-style=tango \
  --pdf-engine=xelatex \
  --listings \
  --variable urlcolor=blue
```

### Legal Documents
```bash
# Pandoc with strict formatting
pandoc legal-doc.md -o legal-doc.pdf \
  --pdf-engine=xelatex \
  --variable documentclass=report \
  --variable fontsize=12pt \
  --variable geometry:"margin=1.25in" \
  --variable linestretch=2 \
  --number-sections
```

### Quick Presentations
```bash
# Using beamer for slides
pandoc slides.md -t beamer -o presentation.pdf
```

## 6. Troubleshooting

### LaTeX Missing Packages
```bash
# If pandoc complains about missing LaTeX packages
sudo tlmgr update --self
sudo tlmgr install collection-fontsrecommended
```

### Unicode/Font Issues
```bash
# Use XeLaTeX for better Unicode support
pandoc input.md -o output.pdf --pdf-engine=xelatex
```

### Large Files
```bash
# For very large documents, increase memory
pandoc input.md -o output.pdf --pdf-engine-opt=-interaction=nonstopmode
```

## 7. Comparison Script

```bash
#!/bin/bash
# compare-pdf-tools.sh - Generate same PDF with different tools

INPUT="$1"
BASE="${INPUT%.md}"

echo "Generating PDFs with different tools..."

# Pandoc
time pandoc "$INPUT" -o "${BASE}-pandoc.pdf"

# wkhtmltopdf
pandoc "$INPUT" -t html -o temp.html
time wkhtmltopdf temp.html "${BASE}-wkhtmltopdf.pdf"
rm temp.html

# md-to-pdf (if available)
if command -v md-to-pdf &> /dev/null; then
    time md-to-pdf "$INPUT"
    mv "${BASE}.pdf" "${BASE}-mdtopdf.pdf"
fi

echo "Compare file sizes:"
ls -lh "${BASE}"*.pdf
```

## Recommendation Summary

1. **For Professional/Legal Documents**: Use **Pandoc** with LaTeX
2. **For Quick Conversions**: Use **md-to-pdf** (if Chrome is OK)
3. **For Web-Style PDFs**: Use **wkhtmltopdf**
4. **For GitHub-Style Preview**: Use **grip** then print
5. **For Automation**: Create shell scripts with Pandoc

The winner for Chrome-free, professional PDF generation is clearly **Pandoc** - invest time in learning its templates for best results!