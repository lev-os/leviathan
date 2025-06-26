#!/bin/bash
# Quick start script for POC adapter

POC_DIR="/Users/jean-patricksmith/lev/workshop/pocs/open-webui-leviathan"

echo "🚀 Starting Leviathan Adapter POC..."
echo ""
echo "📁 POC Directory: $POC_DIR"
echo ""

# Check if virtual environment exists
if [ ! -d "$POC_DIR/venv" ]; then
    echo "❌ Virtual environment not found. Please run setup first:"
    echo "   cd $POC_DIR && ./scripts/setup.sh"
    exit 1
fi

# Check if Leviathan agent is running
if curl -s --fail "http://localhost:3001/health" > /dev/null 2>&1; then
    echo "✅ Leviathan agent is running at http://localhost:3001"
else
    echo "⚠️  Leviathan agent not detected. The adapter will still work with mock data."
fi

echo ""
echo "🔧 Starting adapter..."
echo "   URL: http://localhost:8081"
echo "   Logs will appear below:"
echo "   Press Ctrl+C to stop"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Run the adapter
cd "$POC_DIR" && source venv/bin/activate && python src/leviathan_adapter.py