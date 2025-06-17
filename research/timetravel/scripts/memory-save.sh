#!/bin/bash
# Memory Save Script - Save research findings to memory

echo "💾 Kingly Memory System - Save"
echo "============================="

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MEMORY_DIR="$PROJECT_ROOT/memory"

# Ensure memory directory exists
mkdir -p "$MEMORY_DIR"

# Parse arguments
TOPIC="$1"
CONTENT="$2"
RELEVANCE="${3:-0.8}"
TAGS="${4:-research}"

if [ -z "$TOPIC" ] || [ -z "$CONTENT" ]; then
    echo "❌ Error: Missing required arguments"
    echo ""
    echo "Usage: ./memory-save.sh <topic> <content> [relevance] [tags]"
    echo ""
    echo "Example:"
    echo "  ./memory-save.sh 'subquadratic attention' 'LoLCATs algorithm achieves O(n^1.5)' 0.9 'algorithm,breakthrough'"
    exit 1
fi

# Generate memory ID
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
MEMORY_ID="${TOPIC//[^a-zA-Z0-9]/_}_${TIMESTAMP}"
MEMORY_FILE="$MEMORY_DIR/${MEMORY_ID}.yaml"

# Create memory entry
cat > "$MEMORY_FILE" << EOF
# Memory Entry: $MEMORY_ID
metadata:
  id: "$MEMORY_ID"
  timestamp: "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  topic: "$TOPIC"
  relevance: $RELEVANCE
  tags: [$(echo "$TAGS" | sed 's/,/, /g' | sed 's/\([^,]*\)/"\1"/g')]
  
content:
  summary: |
    $CONTENT
    
  context:
    research_phase: "${RESEARCH_PHASE:-unknown}"
    source_type: "${SOURCE_TYPE:-direct_input}"
    confidence: "${CONFIDENCE:-high}"
    
  connections:
    related_topics: []
    builds_on: []
    contradicts: []
    validates: []
    
indexing:
  keywords: [$(echo "$TOPIC $TAGS" | tr ' ,' '\n' | sort -u | grep -v '^$' | sed 's/.*/"&"/' | tr '\n' ',' | sed 's/,$//' | sed 's/,/, /g')]
  semantic_category: "${SEMANTIC_CATEGORY:-general}"
  search_weight: $RELEVANCE
EOF

echo "✅ Memory saved: $MEMORY_ID"
echo "   File: $MEMORY_FILE"
echo ""

# Update memory index
INDEX_FILE="$MEMORY_DIR/index.yaml"

# Create index if it doesn't exist
if [ ! -f "$INDEX_FILE" ]; then
    cat > "$INDEX_FILE" << EOF
# TimeTravel Memory Index
metadata:
  created: "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  version: "1.0.0"
  
entries: []
EOF
fi

# Add entry to index (simplified append)
echo "" >> "$INDEX_FILE"
echo "  - id: \"$MEMORY_ID\"" >> "$INDEX_FILE"
echo "    topic: \"$TOPIC\"" >> "$INDEX_FILE"
echo "    timestamp: \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"" >> "$INDEX_FILE"
echo "    relevance: $RELEVANCE" >> "$INDEX_FILE"
echo "    file: \"${MEMORY_ID}.yaml\"" >> "$INDEX_FILE"

echo "✅ Index updated"
echo ""

# Show memory statistics
TOTAL_MEMORIES=$(ls -1 "$MEMORY_DIR"/*.yaml 2>/dev/null | grep -v index.yaml | wc -l)
echo "📊 Memory Statistics:"
echo "   Total memories: $TOTAL_MEMORIES"
echo "   Latest topic: $TOPIC"
echo "   Relevance: $RELEVANCE"
echo ""

echo "💡 Use ./memory-search.sh to find related memories"