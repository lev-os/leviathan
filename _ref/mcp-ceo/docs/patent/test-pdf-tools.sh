#!/bin/bash
# Comprehensive PDF Tool Testing Script

echo "🧪 Testing PDF Generation Tools"
echo "=============================="
echo ""

# Test document for comparison
TEST_DOC="test-styled-document.md"
CSS_FILE="test-styles.css"

# 1. Test Pandoc with different engines
echo "1️⃣ Testing Pandoc..."
echo "-------------------"

# Try to generate PDF directly (if LaTeX is available)
echo "Attempting Pandoc PDF generation..."
if pandoc --version | grep -q "pdf"; then
    pandoc $TEST_DOC -o pandoc-direct.pdf 2>&1 && echo "✅ pandoc-direct.pdf created" || echo "❌ Direct PDF failed"
fi

# Generate HTML first
echo "Generating Pandoc HTML..."
pandoc $TEST_DOC -s --css=$CSS_FILE -o pandoc-styled.html
echo "✅ pandoc-styled.html created"

# 2. Test WeasyPrint
echo ""
echo "2️⃣ Testing WeasyPrint..."
echo "----------------------"

# Convert markdown to HTML first, then use WeasyPrint
echo "Creating HTML with embedded CSS for WeasyPrint..."
cat > weasyprint-input.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
EOF

cat $CSS_FILE >> weasyprint-input.html

cat >> weasyprint-input.html << 'EOF'
</style>
</head>
<body>
EOF

pandoc $TEST_DOC -t html5 >> weasyprint-input.html

cat >> weasyprint-input.html << 'EOF'
</body>
</html>
EOF

# Generate PDF with WeasyPrint
echo "Generating PDF with WeasyPrint..."
weasyprint weasyprint-input.html weasyprint-output.pdf 2>&1 && echo "✅ weasyprint-output.pdf created" || echo "❌ WeasyPrint failed"

# 3. Test Prince (if available)
echo ""
echo "3️⃣ Testing Prince XML..."
echo "----------------------"
if command -v prince &> /dev/null; then
    prince pandoc-styled.html -o prince-output.pdf && echo "✅ prince-output.pdf created"
else
    echo "⚠️  Prince not installed (commercial tool)"
fi

# 4. Create a simple test without complex CSS
echo ""
echo "4️⃣ Testing basic formatting (no CSS)..."
echo "-------------------------------------"

# Create simple markdown
cat > simple-test.md << 'EOF'
# Simple PDF Test

This tests basic formatting without complex CSS.

## Text Formatting

- **Bold text**
- *Italic text*
- `Code text`
- ~~Strikethrough~~

## Code Block

```javascript
function test() {
    return "Hello, World!";
}
```

## Table

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
| Data 4   | Data 5   | Data 6   |

## Colors (Markdown doesn't support native colors)

This text is plain, but we can use HTML:
<span style="color: purple;">This should be purple</span>
<span style="background-color: yellow;">This has yellow background</span>
EOF

# Generate with each tool
pandoc simple-test.md -o pandoc-simple.pdf 2>&1 && echo "✅ pandoc-simple.pdf created"
weasyprint simple-test.md weasyprint-simple.pdf 2>&1 || echo "⚠️  WeasyPrint needs HTML input"

# Convert to HTML first for WeasyPrint
pandoc simple-test.md -s -o simple-test.html
weasyprint simple-test.html weasyprint-simple.pdf 2>&1 && echo "✅ weasyprint-simple.pdf created"

# 5. Summary
echo ""
echo "📊 Results Summary"
echo "================="
echo ""
echo "Files generated:"
ls -lh *.pdf 2>/dev/null | grep -E "(pandoc|weasy|prince)" | awk '{print "  " $9 ": " $5}'
echo ""
echo "HTML files:"
ls -lh *.html 2>/dev/null | grep -E "(pandoc|weasy|simple)" | awk '{print "  " $9 ": " $5}'

echo ""
echo "🎨 Color Support Analysis:"
echo "========================="
echo "• md-to-pdf: Full CSS colors/gradients ✅ (Chrome-based)"
echo "• WeasyPrint: Good CSS support ✅ (Python-based)"
echo "• Pandoc (LaTeX): Basic colors only ⚠️"
echo "• Prince: Excellent CSS support ✅ (Commercial)"

echo ""
echo "📝 Formatting Quality:"
echo "===================="
echo "• Pandoc: Best typography, professional layout"
echo "• WeasyPrint: Good web-to-print conversion"
echo "• md-to-pdf: Web-accurate rendering"

# Cleanup temp files
rm -f simple-test.md simple-test.html weasyprint-input.html 2>/dev/null

echo ""
echo "✅ Testing complete! Check the PDF files to compare quality."