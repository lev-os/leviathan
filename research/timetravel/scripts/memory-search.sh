#!/bin/bash
# Memory Search Script - Search and retrieve research memories

echo "🔍 Kingly Memory System - Search"
echo "==============================="

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MEMORY_DIR="$PROJECT_ROOT/memory"

# Search query
QUERY="$1"
LIMIT="${2:-10}"

if [ -z "$QUERY" ]; then
    echo "❌ Error: No search query provided"
    echo ""
    echo "Usage: ./memory-search.sh <query> [limit]"
    echo ""
    echo "Examples:"
    echo "  ./memory-search.sh 'attention'"
    echo "  ./memory-search.sh 'breakthrough' 5"
    echo "  ./memory-search.sh 'tag:algorithm'"
    echo ""
    echo "Special queries:"
    echo "  'recent'     - Show most recent memories"
    echo "  'relevant'   - Show highest relevance memories"
    echo "  'tag:X'      - Search by tag"
    exit 1
fi

echo "🔍 Searching for: $QUERY"
echo "Limit: $LIMIT results"
echo ""

# Function to display a memory entry
display_memory() {
    local file="$1"
    local rank="$2"
    
    if [ -f "$file" ]; then
        echo "[$rank] $(basename "$file" .yaml)"
        echo "$(grep -E "^  topic:|^  timestamp:|^  relevance:" "$file" | sed 's/^  /   /')"
        echo "   Summary:"
        # Extract summary (multi-line)
        awk '/summary: \|/{flag=1; next} /^  [^ ]/{flag=0} flag && /^    /' "$file" | head -3
        echo ""
    fi
}

# Handle special queries
case "$QUERY" in
    "recent")
        echo "📅 Most Recent Memories:"
        echo "======================="
        ls -t "$MEMORY_DIR"/*.yaml 2>/dev/null | grep -v index.yaml | head -"$LIMIT" | \
        while IFS= read -r file; do
            display_memory "$file" "$((++i))"
        done
        ;;
        
    "relevant")
        echo "⭐ Highest Relevance Memories:"
        echo "============================="
        # Sort by relevance score
        grep -l "relevance:" "$MEMORY_DIR"/*.yaml 2>/dev/null | grep -v index.yaml | \
        while IFS= read -r file; do
            relevance=$(grep "relevance:" "$file" | awk '{print $2}')
            echo "$relevance $file"
        done | sort -rn | head -"$LIMIT" | \
        while IFS=' ' read -r score file; do
            display_memory "$file" "$((++i))"
        done
        ;;
        
    tag:*)
        TAG="${QUERY#tag:}"
        echo "🏷️  Memories tagged with: $TAG"
        echo "============================"
        grep -l "tags:.*$TAG" "$MEMORY_DIR"/*.yaml 2>/dev/null | head -"$LIMIT" | \
        while IFS= read -r file; do
            display_memory "$file" "$((++i))"
        done
        ;;
        
    *)
        # General text search
        echo "📝 Text Search Results:"
        echo "====================="
        
        # Search in content and metadata
        grep -i -l "$QUERY" "$MEMORY_DIR"/*.yaml 2>/dev/null | grep -v index.yaml | head -"$LIMIT" | \
        while IFS= read -r file; do
            # Show matching lines for context
            echo "[$((++i))] $(basename "$file" .yaml)"
            grep -A2 -B2 -i "$QUERY" "$file" | sed 's/^/   /' | head -10
            echo ""
        done
        ;;
esac

# Search statistics
TOTAL_MEMORIES=$(ls -1 "$MEMORY_DIR"/*.yaml 2>/dev/null | grep -v index.yaml | wc -l)
echo "📊 Search Complete"
echo "================="
echo "Total memories in system: $TOTAL_MEMORIES"

# Suggest related searches
echo ""
echo "💡 Try also:"
case "$QUERY" in
    *attention*)
        echo "  - ./memory-search.sh 'subquadratic'"
        echo "  - ./memory-search.sh 'transformer'"
        ;;
    *algorithm*)
        echo "  - ./memory-search.sh 'tag:breakthrough'"
        echo "  - ./memory-search.sh 'optimization'"
        ;;
    *)
        echo "  - ./memory-search.sh 'recent'"
        echo "  - ./memory-search.sh 'relevant'"
        ;;
esac