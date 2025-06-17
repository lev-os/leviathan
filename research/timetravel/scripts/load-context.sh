#!/bin/bash
# Context Loading Script - Load and validate Kingly contexts

echo "📋 Kingly Context Loader"
echo "======================="

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Context to load
CONTEXT_PATH="$1"

if [ -z "$CONTEXT_PATH" ]; then
    echo "❌ Error: No context path provided"
    echo ""
    echo "Usage: ./load-context.sh <context-reference>"
    echo ""
    echo "Examples:"
    echo "  ./load-context.sh @kingly/core/agents/research/deep-researcher"
    echo "  ./load-context.sh ./contexts/local-override.yaml"
    exit 1
fi

echo "🔍 Loading context: $CONTEXT_PATH"
echo ""

# Function to resolve @kingly/core references
resolve_kingly_reference() {
    local ref="$1"
    if [[ "$ref" == @kingly/core/* ]]; then
        # Strip @kingly/core/ prefix
        local path="${ref#@kingly/core/}"
        # Point to mcp-ceo contexts directory
        echo "/Users/jean-patricksmith/digital/mcp-ceo/contexts/$path"
    else
        # Local reference
        echo "$ref"
    fi
}

# Resolve the context path
RESOLVED_PATH=$(resolve_kingly_reference "$CONTEXT_PATH")

# Check if it's a directory (needs context.yaml) or direct yaml file
if [ -d "$RESOLVED_PATH" ]; then
    CONTEXT_FILE="$RESOLVED_PATH/context.yaml"
elif [ -f "$RESOLVED_PATH" ]; then
    CONTEXT_FILE="$RESOLVED_PATH"
else
    echo "❌ Error: Context not found at $RESOLVED_PATH"
    exit 1
fi

# Validate context file exists
if [ ! -f "$CONTEXT_FILE" ]; then
    echo "❌ Error: No context.yaml found at $CONTEXT_FILE"
    exit 1
fi

echo "✅ Found context file: $CONTEXT_FILE"
echo ""

# Parse and display context metadata
echo "📊 Context Metadata:"
echo "==================="

# Extract metadata using grep/sed (portable approach)
TYPE=$(grep -A5 "^metadata:" "$CONTEXT_FILE" | grep "type:" | sed 's/.*type:[ "]*\([^"]*\).*/\1/')
ID=$(grep -A5 "^metadata:" "$CONTEXT_FILE" | grep "id:" | sed 's/.*id:[ "]*\([^"]*\).*/\1/')
NAME=$(grep -A5 "^metadata:" "$CONTEXT_FILE" | grep "name:" | sed 's/.*name:[ "]*\([^"]*\).*/\1/')
VERSION=$(grep -A5 "^metadata:" "$CONTEXT_FILE" | grep "version:" | sed 's/.*version:[ "]*\([^"]*\).*/\1/')

echo "Type: $TYPE"
echo "ID: $ID"
echo "Name: $NAME"
echo "Version: $VERSION"
echo ""

# Type-specific validation
case "$TYPE" in
    "agent")
        echo "🤖 Agent Context Detected"
        echo "========================"
        
        # Check for prompts directory
        PROMPTS_DIR="$(dirname "$CONTEXT_FILE")/prompts"
        if [ -d "$PROMPTS_DIR" ]; then
            echo "✅ Prompts directory found:"
            ls -la "$PROMPTS_DIR"/*.md 2>/dev/null | awk '{print "   - " $9}'
        fi
        
        # Check for capabilities
        echo ""
        echo "Capabilities:"
        grep -A10 "capabilities:" "$CONTEXT_FILE" | grep "^[ ]*-" | head -5
        ;;
        
    "tool")
        echo "🔧 Tool Context Detected"
        echo "======================="
        
        # Check available tools
        echo "Available tools:"
        grep -A20 "available_tools:" "$CONTEXT_FILE" | grep "name:" | head -5 | sed 's/.*name:[ "]*\([^"]*\).*/   - \1/'
        ;;
        
    "workflow")
        echo "🔄 Workflow Context Detected"
        echo "==========================="
        
        # Check workflow phases
        echo "Workflow structure:"
        grep -E "tier_[0-9]:|phase_[0-9]:|step_[0-9]:" "$CONTEXT_FILE" | head -5
        ;;
        
    "pattern")
        echo "🎯 Pattern Context Detected"
        echo "=========================="
        ;;
        
    *)
        echo "⚠️  Unknown context type: $TYPE"
        ;;
esac

# Check for dependencies
echo ""
echo "🔗 Dependencies:"
echo "==============="

# Look for imports/references
grep -E "import:|@kingly/core" "$CONTEXT_FILE" | head -10 | while read -r line; do
    echo "   - $line"
done

# Validate referenced contexts exist
echo ""
echo "🔍 Validating References:"
echo "========================"

grep -o "@kingly/core/[^\"']*" "$CONTEXT_FILE" | sort -u | while read -r ref; do
    RESOLVED=$(resolve_kingly_reference "$ref")
    if [ -e "$RESOLVED" ]; then
        echo "✅ $ref → Found"
    else
        echo "❌ $ref → Not found at $RESOLVED"
    fi
done

# Summary
echo ""
echo "📊 Context Load Summary"
echo "======================"
echo "Context: $NAME ($ID)"
echo "Type: $TYPE"
echo "Status: Loaded successfully"
echo ""
echo "💡 Next steps:"
echo "- Use this context in your research workflow"
echo "- Override settings in ./contexts/ if needed"
echo "- Run ./kingly-sim.sh research <topic> to use"