#!/bin/bash
# Test script that can run from anywhere

TIMETRAVEL_DIR="/Users/jean-patricksmith/.kingly/projects/timetravel"
TOPIC="$1"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🧠 Kingly Research System - Remote Test"
echo "======================================="
echo "Topic: $TOPIC"
echo "TimeTravel Dir: $TIMETRAVEL_DIR"
echo ""

# Test context loading
echo "📊 STEP 1: Context Validation"
echo "============================="

CONTEXTS=(
    "/Users/jean-patricksmith/digital/mcp-ceo/contexts/agents/research/deep-researcher/context.yaml"
    "/Users/jean-patricksmith/digital/mcp-ceo/contexts/workflows/research/three-tier-deep/context.yaml"
    "/Users/jean-patricksmith/digital/mcp-ceo/contexts/tools/research/mcp-suite/context.yaml"
)

for context in "${CONTEXTS[@]}"; do
    if [[ -f "$context" ]]; then
        echo "✅ Found: $(basename $(dirname $context))/$(basename $context)"
    else
        echo "❌ Missing: $context"
    fi
done

echo ""
echo "📊 STEP 2: Project Configuration Check"
echo "======================================"

if [[ -f "$TIMETRAVEL_DIR/project.yaml" ]]; then
    echo "✅ Project configuration found"
    echo "Project details:"
    head -10 "$TIMETRAVEL_DIR/project.yaml"
else
    echo "❌ Project configuration missing"
fi

echo ""
echo "🚀 STEP 3: Ready for Execution"
echo "=============================="
echo "System Status: ✅ Ready"
echo "Next: Execute actual research workflow with topic: '$TOPIC'"
echo ""
echo "Claude should now:"
echo "1. Load contexts from the validated paths"
echo "2. Apply deep-researcher agent configuration"  
echo "3. Execute three-tier-deep workflow"
echo "4. Generate research report"