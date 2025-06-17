# LaTeX Installation Guide for Pandoc PDF Support

## Installation Options

### Option 1: BasicTeX (Recommended - 500MB)
Lightweight LaTeX distribution perfect for Pandoc

**Manual Installation Required:**
```bash
# Download installer from:
# https://www.tug.org/mactex/morepackages.html

# Or use brew (requires password):
brew install --cask basictex

# After installation, restart terminal or run:
eval "$(/usr/libexec/path_helper)"

# Add to PATH (add to ~/.zshrc or ~/.bash_profile):
export PATH="/Library/TeX/texbin:$PATH"
```

### Option 2: TinyTeX (Alternative - 200MB)
Even smaller, designed for R/Pandoc users

```bash
# Install via curl
curl -sL "https://yihui.org/tinytex/install-bin-unix.sh" | sh

# Or with R (if you have R installed):
# R -e "install.packages('tinytex'); tinytex::install_tinytex()"
```

### Option 3: MacTeX (Full - 4GB)
Complete LaTeX distribution (overkill for just Pandoc)

```bash
# Only if you need full LaTeX features:
brew install --cask mactex
```

## Post-Installation Setup

### 1. Verify Installation
```bash
# Check if LaTeX is installed
which pdflatex
which xelatex

# Test Pandoc PDF generation
echo "# Test" | pandoc -o test.pdf
```

### 2. Install Missing Packages (if needed)
```bash
# BasicTeX package manager
sudo tlmgr update --self
sudo tlmgr install collection-fontsrecommended
sudo tlmgr install unicode-math
sudo tlmgr install xcolor
```

### 3. Configure Pandoc for Better PDFs
```bash
# Create Pandoc defaults file
mkdir -p ~/.pandoc
cat > ~/.pandoc/defaults.yaml << 'EOF'
pdf-engine: xelatex
variables:
  geometry: margin=1in
  fontsize: 12pt
  linestretch: 1.5
  mainfont: "Helvetica Neue"
  sansfont: "Helvetica Neue"
  monofont: "Monaco"
EOF
```

## Testing LaTeX + Pandoc

### Basic Test
```bash
# Create test document
cat > latex-test.md << 'EOF'
# LaTeX PDF Test

## Text Formatting
- **Bold** and *italic* text
- `Code formatting`

## Math Support
Inline math: $E = mc^2$

Display math:
$$\int_{0}^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$$

## Colors (LaTeX way)
\textcolor{purple}{This text is purple}
\colorbox{yellow}{Yellow background}
EOF

# Generate PDF
pandoc latex-test.md -o latex-test.pdf
```

### Advanced Styling
```bash
# With custom LaTeX header
cat > custom-header.tex << 'EOF'
\usepackage{xcolor}
\definecolor{darkpurple}{RGB}{60,9,108}
\definecolor{lightpurple}{RGB}{157,78,221}
EOF

pandoc input.md -o output.pdf \
  --include-in-header=custom-header.tex \
  --pdf-engine=xelatex
```

## Pandoc + LaTeX Color Options

### Method 1: Inline LaTeX
```markdown
\textcolor{purple}{Purple text}
\colorbox{yellow}{\textcolor{black}{Highlighted}}
\pagecolor{lightgray}
```

### Method 2: Raw LaTeX Blocks
```markdown
```{=latex}
\begin{tcolorbox}[colback=purple!10,colframe=purple!50]
This is a colored box
\end{tcolorbox}
```
```

### Method 3: Custom Template
Create `purple-theme.latex`:
```latex
\documentclass{article}
\usepackage{xcolor}
\usepackage{pagecolor}
\definecolor{bgpurple}{RGB}{26,0,51}
\definecolor{textgray}{RGB}{208,208,208}
\pagecolor{bgpurple}
\color{textgray}
$if(highlighting-macros)$
$highlighting-macros$
$endif$
\begin{document}
$body$
\end{document}
```

Use with:
```bash
pandoc input.md -o output.pdf --template=purple-theme.latex
```

## Comparison After LaTeX Installation

| Feature | Before (No LaTeX) | After (With LaTeX) |
|---------|-------------------|-------------------|
| PDF Generation | ❌ Not possible | ✅ Works |
| Typography | - | ✅ Professional |
| Math Rendering | - | ✅ Native TeX |
| Basic Colors | - | ✅ Supported |
| Gradients | - | ❌ Limited |
| Custom Fonts | - | ✅ System fonts |
| File Size | - | Small (~150KB) |

## Quick Commands After Installation

```bash
# Simple PDF
pandoc input.md -o output.pdf

# With custom margins and fonts
pandoc input.md -o output.pdf \
  --variable geometry:margin=1.25in \
  --variable mainfont="Georgia" \
  --pdf-engine=xelatex

# With syntax highlighting
pandoc input.md -o output.pdf \
  --highlight-style=breezedark
```

## Troubleshooting

### "pdflatex not found"
- Restart terminal
- Check PATH: `echo $PATH | grep tex`
- Run: `eval "$(/usr/libexec/path_helper)"`

### Missing packages
```bash
sudo tlmgr install [package-name]
# Common ones:
sudo tlmgr install enumitem tcolorbox environ trimspaces
```

### Font issues
Use xelatex instead of pdflatex:
```bash
pandoc input.md -o output.pdf --pdf-engine=xelatex
```