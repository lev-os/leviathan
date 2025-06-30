#!/bin/bash
# Development start script - run components separately

set -e

echo "🚀 LEVIATHAN POC DEV START GUIDE"
echo "================================"
echo ""
echo "This script shows how to run each component."
echo "Run each command in a separate terminal tab."
echo ""

# Configuration
POC_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "📁 Working directory: $POC_DIR"
echo ""

echo "1️⃣ TERMINAL 1 - Leviathan Agent (if not already running):"
echo "   cd ~/lev/agent && npm run dev"
echo ""

echo "2️⃣ TERMINAL 2 - Open WebUI Docker:"
echo "   docker run -d --name open-webui -p 3002:8080 -v open-webui:/app/backend/data -e WEBUI_AUTH=False ghcr.io/open-webui/open-webui:main"
echo "   # Or if already exists: docker start open-webui"
echo ""

echo "3️⃣ TERMINAL 3 - Leviathan Adapter:"
echo "   cd $POC_DIR"
echo "   source venv/bin/activate"
echo "   python src/leviathan_adapter.py"
echo ""

echo "📊 Check status:"
echo "   Leviathan:  curl http://localhost:3001/health"
echo "   Adapter:    curl http://localhost:7894/health"
echo "   Open WebUI: http://localhost:3002"
echo ""

echo "🔧 Configure Open WebUI:"
echo "   1. Go to http://localhost:3002"
echo "   2. Create account (first user is admin)"
echo "   3. Settings → Connections → Add OpenAI API"
echo "   4. URL: http://localhost:7894/v1"
echo "   5. API Key: any-key-works"
echo "   6. Select model: leviathan-agent"
echo ""

echo "🧠 Memory Dashboard:"
echo "   http://localhost:7894/v1/memory/dashboard"
echo ""

echo "🛑 To stop everything:"
echo "   1. Ctrl+C in adapter terminal"
echo "   2. docker stop open-webui"
echo "   3. Ctrl+C in Leviathan terminal (if you started it)"
echo ""

# Quick status check
echo "Current status:"
echo -n "  Leviathan agent: "
if curl -s --fail http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Running"
else
    echo "❌ Not running"
fi

echo -n "  Adapter: "
if curl -s --fail http://localhost:7894/health > /dev/null 2>&1; then
    echo "✅ Running"
else
    echo "❌ Not running (or another instance with PID lock)"
fi

echo -n "  Open WebUI: "
if docker ps | grep -q open-webui; then
    echo "✅ Running"
    WEBUI_PORT=$(docker port open-webui 8080 2>/dev/null | cut -d: -f2 || echo "unknown")
    echo "     Port: $WEBUI_PORT"
else
    echo "❌ Not running"
fi

echo ""
echo "💡 TIP: The adapter has PID lock protection."
echo "   If it says another instance is running, check:"
echo "   cat /tmp/leviathan_adapter.pid"
echo "   ps aux | grep leviathan_adapter"