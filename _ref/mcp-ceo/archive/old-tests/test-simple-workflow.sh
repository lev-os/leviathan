#!/bin/bash

# Test simple 3-step workflow with MCP-CEO server
# This demonstrates console logging, file-based results, and callback instructions

echo "🚀 Testing MCP-CEO Simple 3-Step Workflow"
echo "========================================="
echo ""

# Create a unique session ID for this test
SESSION_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')
echo "📍 Session ID: $SESSION_ID"
echo ""

# Step 1: Define Challenge
echo "📋 Step 1: Define Challenge"
echo "----------------------------"
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"architect_of_abundance","arguments":{"challenge":"What is the meaning of life?","workflow_request":{"type":"simple_test","step":1}}},"id":1}' | node server.js 2>&1

echo ""
echo "⏸️  Press Enter to continue to Step 2..."
read

# Step 2: Explore Solutions (with session ID)
echo ""
echo "📋 Step 2: Explore Solutions"
echo "----------------------------"
echo "{\"jsonrpc\":\"2.0\",\"method\":\"tools/call\",\"params\":{\"name\":\"architect_of_abundance\",\"arguments\":{\"challenge\":\"Continue analysis\",\"workflow_request\":{\"type\":\"simple_test\",\"step\":2,\"session_id\":\"$SESSION_ID\"}}},\"id\":2}" | node server.js 2>&1

echo ""
echo "⏸️  Press Enter to continue to Step 3..."
read

# Step 3: Create Action Plan (with session ID)
echo ""
echo "📋 Step 3: Create Action Plan"
echo "----------------------------"
echo "{\"jsonrpc\":\"2.0\",\"method\":\"tools/call\",\"params\":{\"name\":\"architect_of_abundance\",\"arguments\":{\"challenge\":\"Continue analysis\",\"workflow_request\":{\"type\":\"simple_test\",\"step\":3,\"session_id\":\"$SESSION_ID\"}}},\"id\":3}" | node server.js 2>&1

echo ""
echo "✅ Workflow Complete!"
echo ""
echo "📁 Check session file at: ./sessions/$SESSION_ID-simple_test.json"
echo ""

# Show the session file if it exists
if [ -f "./sessions/$SESSION_ID-simple_test.json" ]; then
    echo "📄 Session Contents:"
    echo "-------------------"
    cat "./sessions/$SESSION_ID-simple_test.json" | head -50
    echo ""
    echo "... (truncated if longer)"
fi