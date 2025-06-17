#!/bin/bash

# Simple demonstration of MCP-CEO workflow
echo "🚀 MCP-CEO Workflow Demo"
echo "========================"
echo ""
echo "This demonstrates:"
echo "• Dynamic context assembly"
echo "• Personality activation per step"
echo "• Session persistence"
echo "• File-based results"
echo ""

# Create a session ID
SESSION_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')
echo "📍 Session ID: $SESSION_ID"
echo ""

# Show the workflow configuration
echo "📋 Workflow: simple_test (3 steps)"
echo "From workflows.yaml:"
echo ""
grep -A 10 "simple_test:" workflows.yaml | head -15
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📁 Session file will be saved at:"
echo "   ./sessions/$SESSION_ID-simple_test.json"
echo ""
echo "🧠 Watch for personality activations in the console!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if session directory exists
if [ -d "./sessions" ]; then
    echo "✅ Sessions directory exists"
else
    echo "📁 Creating sessions directory..."
    mkdir -p sessions
fi

echo ""
echo "To run the workflow, use the MCP tool in Claude:"
echo ""
echo "Step 1:"
echo 'architect_of_abundance({'
echo '  challenge: "What is the meaning of life?",'
echo '  workflow_request: { type: "simple_test", step: 1 }'
echo '})'
echo ""
echo "Then continue with steps 2 and 3 using the session_id!"