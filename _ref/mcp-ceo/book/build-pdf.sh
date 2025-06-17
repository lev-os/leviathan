#!/bin/bash

# Build PDF from markdown chapters
# Requires: npm install -g md-to-pdf

echo "📚 Building 'The Semantic Computing Revolution' PDF..."

# Create output directory
mkdir -p output

# Combine all chapters into single markdown file
echo "📝 Combining chapters..."
cat > output/combined.md << EOF
# The Semantic Computing Revolution
## Building Intelligence-First Systems with MCP-CEO

### From Configuration to Consciousness - The Architectural Blueprint for Human-AI Collaboration

---

EOF

# Add table of contents
echo "## Table of Contents" >> output/combined.md
echo "" >> output/combined.md

# Add each chapter
for chapter in chapters/*.md; do
    if [ -f "$chapter" ]; then
        # Extract chapter title for TOC
        title=$(head -n 1 "$chapter" | sed 's/# //')
        filename=$(basename "$chapter" .md)
        number=$(echo "$filename" | cut -d'-' -f1)
        
        echo "- Chapter $number: $title" >> output/combined.md
    fi
done

echo "" >> output/combined.md
echo "---" >> output/combined.md
echo "" >> output/combined.md

# Append all chapters
for chapter in chapters/*.md; do
    if [ -f "$chapter" ]; then
        echo "📄 Adding $(basename "$chapter")..."
        cat "$chapter" >> output/combined.md
        echo "" >> output/combined.md
        echo "---" >> output/combined.md
        echo "" >> output/combined.md
    fi
done

# Generate PDF with custom styling
echo "🎨 Generating styled PDF..."
cd output
md-to-pdf combined.md \
    --pdf-options '{"format": "A4", "margin": {"top": "20mm", "bottom": "20mm", "left": "20mm", "right": "20mm"}}' \
    --stylesheet ../book-style.css
mv combined.pdf semantic-computing-revolution.pdf
cd ..

# Alternative: Generate with pandoc if available
if command -v pandoc &> /dev/null; then
    echo "📚 Also generating pandoc version..."
    pandoc output/combined.md \
        -o output/semantic-computing-revolution-pandoc.pdf \
        --toc \
        --toc-depth=2 \
        --highlight-style=tango \
        --pdf-engine=xelatex \
        -V geometry:margin=1in \
        -V fontsize=11pt \
        -V documentclass=report
fi

echo "✅ PDF generation complete!"
echo "📖 Output: output/semantic-computing-revolution.pdf"

# Clean up
rm output/combined.md