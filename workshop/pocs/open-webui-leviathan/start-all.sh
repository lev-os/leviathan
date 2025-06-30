#!/bin/bash
# Unified start script for complete Open WebUI + Leviathan integration

set -e

echo "🚀 LEVIATHAN + OPEN WEBUI UNIFIED STARTUP"
echo "=========================================="
echo ""

# Configuration
OPEN_WEBUI_PORT=3000
ADAPTER_BASE_PORT=7893

# Find available port for Open WebUI if default is taken
find_available_port() {
    local port=$1
    while lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; do
        echo "Port $port is in use, trying next..."
        ((port++))
    done
    echo $port
}
LEVIATHAN_DIR="$HOME/lev/agent"
POC_DIR="$(cd "$(dirname "$0")" && pwd)"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is required but not installed${NC}"
        echo "   Install from: https://docs.docker.com/get-docker/"
        exit 1
    fi
    echo -e "${GREEN}✅ Docker found${NC}"
}

# Check if Leviathan agent is running
check_leviathan() {
    echo -e "\n${YELLOW}Checking Leviathan agent...${NC}"
    
    if curl -s --fail "http://localhost:3001/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Leviathan agent already running${NC}"
        return 0
    fi
    
    # Try to start Leviathan
    if [ -d "$LEVIATHAN_DIR" ]; then
        echo -e "${YELLOW}Starting Leviathan agent...${NC}"
        cd "$LEVIATHAN_DIR"
        npm run dev > "$POC_DIR/leviathan.log" 2>&1 &
        LEVIATHAN_PID=$!
        echo "   Leviathan PID: $LEVIATHAN_PID"
        
        # Wait for startup
        for i in {1..30}; do
            if curl -s --fail "http://localhost:3001/health" > /dev/null 2>&1; then
                echo -e "${GREEN}✅ Leviathan agent started${NC}"
                return 0
            fi
            sleep 1
        done
        
        echo -e "${RED}❌ Leviathan failed to start (check leviathan.log)${NC}"
        return 1
    else
        echo -e "${YELLOW}⚠️  Leviathan not found at $LEVIATHAN_DIR${NC}"
        echo "   Adapter will work with mock data"
        return 0
    fi
}

# Start Open WebUI in Docker
start_open_webui() {
    echo -e "\n${YELLOW}Starting Open WebUI...${NC}"
    
    # Check if already running
    if docker ps | grep -q open-webui; then
        echo -e "${GREEN}✅ Open WebUI already running${NC}"
        # Get the actual port it's using
        OPEN_WEBUI_PORT=$(docker port open-webui 8080 2>/dev/null | cut -d: -f2 || echo "3000")
        echo -e "   Using port: ${OPEN_WEBUI_PORT}"
        return 0
    fi
    
    # Find available port
    OPEN_WEBUI_PORT=$(find_available_port $OPEN_WEBUI_PORT)
    echo "   Using port: $OPEN_WEBUI_PORT"
    
    # Check if container exists but stopped
    if docker ps -a | grep -q open-webui; then
        echo "   Removing old container..."
        docker rm -f open-webui
    fi
    
    echo "   Creating new container..."
    docker run -d \
        --name open-webui \
        -p "${OPEN_WEBUI_PORT}:8080" \
        -v open-webui:/app/backend/data \
        -e WEBUI_AUTH=False \
        --restart always \
        ghcr.io/open-webui/open-webui:main
    
    # Wait for startup
    echo "   Waiting for Open WebUI to start..."
    for i in {1..60}; do
        if curl -s --fail "http://localhost:${OPEN_WEBUI_PORT}" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Open WebUI started${NC}"
            echo -e "   ${GREEN}URL: http://localhost:${OPEN_WEBUI_PORT}${NC}"
            return 0
        fi
        sleep 1
    done
    
    echo -e "${RED}❌ Open WebUI failed to start${NC}"
    return 1
}

# Start the adapter
start_adapter() {
    echo -e "\n${YELLOW}Starting Leviathan Adapter...${NC}"
    
    cd "$POC_DIR"
    
    # Check virtual environment
    if [ ! -d "venv" ]; then
        echo -e "${RED}❌ Virtual environment not found${NC}"
        echo "   Run: ./scripts/setup.sh first"
        exit 1
    fi
    
    # Activate venv and start adapter
    source venv/bin/activate
    
    # Export base port for adapter
    export BASE_PORT=$ADAPTER_BASE_PORT
    
    # Run adapter (it will find available ports)
    python src/leviathan_adapter.py > adapter.log 2>&1 &
    ADAPTER_PID=$!
    echo "   Adapter PID: $ADAPTER_PID"
    
    # Wait for startup
    sleep 3
    
    # Find which port it actually started on
    ADAPTER_PORT=$(grep -o "Uvicorn running on.*:[0-9]*" adapter.log | grep -o "[0-9]*$" || echo "7894")
    
    if kill -0 $ADAPTER_PID 2>/dev/null; then
        echo -e "${GREEN}✅ Adapter started${NC}"
        echo -e "   ${GREEN}URL: http://localhost:${ADAPTER_PORT}${NC}"
        return 0
    else
        echo -e "${RED}❌ Adapter failed to start (check adapter.log)${NC}"
        return 1
    fi
}

# Configuration instructions
show_configuration() {
    echo -e "\n${GREEN}🎉 ALL SYSTEMS RUNNING!${NC}"
    echo "=================="
    echo ""
    echo "📍 URLs:"
    echo "   Open WebUI:        http://localhost:${OPEN_WEBUI_PORT}"
    echo "   Leviathan Adapter: http://localhost:${ADAPTER_PORT:-7894}"
    echo "   Leviathan Agent:   http://localhost:3001"
    echo ""
    echo "🔧 Configure Open WebUI:"
    echo "   1. Go to http://localhost:${OPEN_WEBUI_PORT}"
    echo "   2. Create account (first user is admin)"
    echo "   3. Go to Settings → Connections"
    echo "   4. Add custom OpenAI API endpoint:"
    echo "      URL: http://localhost:${ADAPTER_PORT:-7894}/v1"
    echo "      Key: any-key-works"
    echo "   5. Select 'leviathan-agent' as model"
    echo ""
    echo "🧠 Memory Features Available:"
    echo "   - Semantic Memory: Facts and knowledge"
    echo "   - Episodic Memory: Session history"
    echo "   - Procedural Memory: Workflows and patterns"
    echo "   - Working Memory: Current context"
    echo "   - Temporal Memory: Time-based patterns"
    echo ""
    echo "📊 Test Endpoints:"
    echo "   curl http://localhost:${ADAPTER_PORT:-7894}/health"
    echo "   curl http://localhost:${ADAPTER_PORT:-7894}/v1/memory/dashboard"
    echo ""
    echo "🛑 To stop all services:"
    echo "   Press Ctrl+C or run: ./stop-all.sh"
    echo ""
}

# Create stop script
create_stop_script() {
    cat > "$POC_DIR/stop-all.sh" << 'EOF'
#!/bin/bash
echo "🛑 Stopping all services..."

# Stop adapter
if [ -f /tmp/leviathan_adapter.pid ]; then
    PID=$(cat /tmp/leviathan_adapter.pid)
    kill $PID 2>/dev/null && echo "✅ Stopped adapter"
    rm -f /tmp/leviathan_adapter.pid
fi

# Stop Open WebUI
docker stop open-webui 2>/dev/null && echo "✅ Stopped Open WebUI"

# Stop Leviathan (if we started it)
pkill -f "node.*lev.*agent" 2>/dev/null && echo "✅ Stopped Leviathan agent"

echo "✅ All services stopped"
EOF
    chmod +x "$POC_DIR/stop-all.sh"
}

# Signal handler for cleanup
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"
    ./stop-all.sh
    exit 0
}

trap cleanup INT TERM

# Main execution
main() {
    echo "Starting unified Leviathan + Open WebUI system..."
    echo ""
    
    # Run all checks and starts
    check_docker || exit 1
    check_leviathan
    start_open_webui || exit 1
    start_adapter || exit 1
    create_stop_script
    
    # Show success and configuration
    show_configuration
    
    # Keep script running
    echo -e "${YELLOW}Services running. Press Ctrl+C to stop all.${NC}"
    
    # Monitor services
    while true; do
        sleep 5
        
        # Check if adapter is still running
        if [ ! -z "$ADAPTER_PID" ] && ! kill -0 $ADAPTER_PID 2>/dev/null; then
            echo -e "${RED}⚠️  Adapter stopped unexpectedly${NC}"
            break
        fi
    done
}

# Run main
main