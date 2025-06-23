#!/bin/bash

# Token-efficient batch coherence checking using Claude Code SDK
# Processes files one at a time to avoid token explosion

echo "🔍 Batch Coherence Check - Token Efficient Mode"
echo "============================================="

# Configuration
REPORT_DIR="coherence-reports"
mkdir -p "$REPORT_DIR"

# Find all JavaScript files that might have violations
FILES=$(find src -name "*.js" -type f | grep -E "(classifier|validator|parser|scoring)")

# Process each file individually to keep tokens low
for file in $FILES; do
    echo -e "\n📄 Checking: $file"
    
    # Use Claude to analyze single file (keeps tokens minimal)
    claude -p "Check this file for LLM-first violations. List only actual violations with line numbers. Be concise." < "$file" > "$REPORT_DIR/$(basename $file).report" 2>/dev/null
    
    # Check if violations found
    if [ -s "$REPORT_DIR/$(basename $file).report" ]; then
        echo "❌ Violations found:"
        cat "$REPORT_DIR/$(basename $file).report" | head -5
        echo "   ... (see full report in $REPORT_DIR/)"
    else
        echo "✅ No violations found"
    fi
done

# Generate summary
echo -e "\n📊 Generating summary report..."
cat > "$REPORT_DIR/summary.md" << EOF
# Coherence Check Summary
Generated: $(date)

## Files Checked
EOF

# Add file summaries
for report in "$REPORT_DIR"/*.report; do
    if [ -s "$report" ]; then
        echo "- $(basename $report .report): VIOLATIONS FOUND" >> "$REPORT_DIR/summary.md"
    fi
done

echo -e "\n✅ Batch check complete! Reports saved to $REPORT_DIR/"