#!/bin/bash
# PDF Tool Comparison Script with Complex CSS Testing

echo "🎨 PDF Generation Comparison Test"
echo "================================="
echo "Testing dark purple gradient theme with light gray text"
echo ""

# Check if required tools are installed
check_tool() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is not installed"
        return 1
    else
        echo "✅ $1 is installed"
        return 0
    fi
}

echo "Checking tools..."
check_tool pandoc
PANDOC_AVAILABLE=$?
check_tool wkhtmltopdf
WKHTMLTOPDF_AVAILABLE=$?
check_tool md-to-pdf
MDTOPDF_AVAILABLE=$?

echo ""
echo "Starting conversions..."
echo ""

# 1. Test with md-to-pdf (original method)
if [ $MDTOPDF_AVAILABLE -eq 0 ]; then
    echo "📄 Generating with md-to-pdf..."
    time md-to-pdf test-styled-document.md \
        --pdf-options '{"format": "Letter", "margin": {"top": "1in", "bottom": "1in", "left": "1.25in", "right": "1.25in"}, "printBackground": true}' \
        --highlight-style github \
        --css test-styles.css
    mv test-styled-document.pdf test-styled-mdtopdf.pdf
    echo "   ✓ Created: test-styled-mdtopdf.pdf"
fi

# 2. Test with Pandoc + HTML intermediate
if [ $PANDOC_AVAILABLE -eq 0 ]; then
    echo ""
    echo "📄 Generating with Pandoc (HTML method)..."
    
    # First create HTML with embedded CSS
    cat > temp-template.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>$title$</title>
<style>
$css$
</style>
</head>
<body>
<div class="container">
$body$
</div>
</body>
</html>
EOF
    
    # Insert CSS into template
    CSS_CONTENT=$(cat test-styles.css)
    time pandoc test-styled-document.md \
        -t html5 \
        --template=temp-template.html \
        --variable css="$CSS_CONTENT" \
        -o test-styled-pandoc.html
    
    # Check if we have wkhtmltopdf for HTML to PDF conversion
    if [ $WKHTMLTOPDF_AVAILABLE -eq 0 ]; then
        time wkhtmltopdf \
            --enable-local-file-access \
            --print-media-type \
            --page-size Letter \
            --margin-top 25mm \
            --margin-bottom 25mm \
            --margin-left 32mm \
            --margin-right 32mm \
            test-styled-pandoc.html \
            test-styled-pandoc.pdf
        echo "   ✓ Created: test-styled-pandoc.pdf"
    fi
    
    rm temp-template.html
fi

# 3. Test with wkhtmltopdf directly
if [ $PANDOC_AVAILABLE -eq 0 ] && [ $WKHTMLTOPDF_AVAILABLE -eq 0 ]; then
    echo ""
    echo "📄 Generating with wkhtmltopdf..."
    
    # Create HTML with inline CSS
    echo '<!DOCTYPE html><html><head><meta charset="utf-8"><style>' > test-styled-wkhtml.html
    cat test-styles.css >> test-styled-wkhtml.html
    echo '</style></head><body><div class="container">' >> test-styled-wkhtml.html
    pandoc test-styled-document.md -t html5 >> test-styled-wkhtml.html
    echo '</div></body></html>' >> test-styled-wkhtml.html
    
    time wkhtmltopdf \
        --enable-local-file-access \
        --print-media-type \
        --page-size Letter \
        --margin-top 25mm \
        --margin-bottom 25mm \
        --margin-left 32mm \
        --margin-right 32mm \
        test-styled-wkhtml.html \
        test-styled-wkhtml.pdf
    echo "   ✓ Created: test-styled-wkhtml.pdf"
fi

# 4. Test with Pandoc + LaTeX (if available)
if [ $PANDOC_AVAILABLE -eq 0 ]; then
    if pandoc --list-output-formats | grep -q "pdf"; then
        echo ""
        echo "📄 Generating with Pandoc (LaTeX method)..."
        time pandoc test-styled-document.md \
            -o test-styled-pandoc-latex.pdf \
            --pdf-engine=xelatex \
            --variable mainfont="Georgia" \
            --variable sansfont="Helvetica Neue" \
            --variable monofont="Monaco" \
            --variable fontsize=12pt \
            --variable geometry:"top=1in, bottom=1in, left=1.25in, right=1.25in" \
            --highlight-style breezedark
        echo "   ✓ Created: test-styled-pandoc-latex.pdf"
    else
        echo ""
        echo "⚠️  Pandoc PDF output not available (LaTeX not installed)"
    fi
fi

# Summary
echo ""
echo "📊 Comparison Results:"
echo "====================="
ls -lh test-styled-*.pdf 2>/dev/null | awk '{print "   " $9 ": " $5}'

echo ""
echo "🔍 CSS Feature Support Summary:"
echo "==============================="
echo "• md-to-pdf: Full CSS support via Chrome (gradients ✓, shadows ✓, custom fonts ✓)"
echo "• wkhtmltopdf: Good CSS support (gradients ✓, shadows ✓, fonts ±)"
echo "• pandoc+html: Depends on wkhtmltopdf for rendering"
echo "• pandoc+latex: Limited CSS (no gradients ✗, basic styling ✓)"

echo ""
echo "💡 Recommendations:"
echo "==================="
echo "1. For complex CSS with gradients → md-to-pdf or wkhtmltopdf"
echo "2. For print-quality typography → pandoc + LaTeX"
echo "3. For automation without Chrome → wkhtmltopdf"
echo "4. For academic papers → pandoc + LaTeX"

# Cleanup
rm -f test-styled-pandoc.html test-styled-wkhtml.html 2>/dev/null

echo ""
echo "✅ Comparison complete! Check the PDF files to see differences."