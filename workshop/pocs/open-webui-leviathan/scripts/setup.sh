#!/bin/bash
set -e

# Setup script for Leviathan Adapter POC
# Prepares development environment and dependencies

echo "🚀 Setting up Leviathan Adapter POC environment..."

# Check if we're in the right directory
if [[ ! -f "README.md" ]]; then
    echo "❌ Please run this script from the POC root directory"
    exit 1
fi

# Create virtual environment
echo "📦 Creating Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install dependencies
echo "📥 Installing Python dependencies..."
pip install --upgrade pip
pip install -r src/requirements.txt

# Check if Leviathan agent is running
echo "🔍 Checking Leviathan agent connection..."
LEVIATHAN_URL="http://localhost:3001"

if curl -s --fail "$LEVIATHAN_URL/health" > /dev/null 2>&1; then
    echo "✅ Leviathan agent is running at $LEVIATHAN_URL"
else
    echo "⚠️  Leviathan agent not detected at $LEVIATHAN_URL"
    echo "   Please start the Leviathan agent first:"
    echo "   cd ~/lev/agent && npm run dev"
fi

# Create configuration file
echo "⚙️  Creating configuration file..."
cat > config.env << EOF
# Leviathan Adapter Configuration
LEVIATHAN_MCP_URL=http://localhost:3001
ADAPTER_PORT=8081
LOG_LEVEL=INFO
ENABLE_CACHING=true
CACHE_TTL_SECONDS=300
MAX_RETRIES=3
TIMEOUT_SECONDS=30

# Open WebUI Integration
OPENWEBUI_URL=http://localhost:8080
OPENWEBUI_API_KEY=

# Development settings
DEBUG=true
ENABLE_CORS=true
EOF

echo "✅ Configuration saved to config.env"

# Run tests to validate setup
echo "🧪 Running validation tests..."
python -m pytest src/test_adapter.py::TestLeviathanAdapter::test_translate_openwebui_to_mcp_chat -v

if [[ $? -eq 0 ]]; then
    echo "✅ Setup validation passed!"
else
    echo "❌ Setup validation failed. Please check dependencies."
    exit 1
fi

# Create run script
echo "📝 Creating run script..."
cat > run_adapter.sh << 'EOF'
#!/bin/bash
# Activate virtual environment and run adapter

set -e

# Load configuration
if [[ -f "config.env" ]]; then
    source config.env
fi

# Activate virtual environment
source venv/bin/activate

echo "🚀 Starting Leviathan Adapter..."
echo "   Adapter URL: http://localhost:${ADAPTER_PORT:-8081}"
echo "   Leviathan URL: ${LEVIATHAN_MCP_URL:-http://localhost:3001}"
echo "   Logs: adapter.log"

# Run adapter with logging
python src/leviathan_adapter.py 2>&1 | tee adapter.log
EOF

chmod +x run_adapter.sh

echo ""
echo "🎉 Setup complete! Next steps:"
echo ""
echo "1. Start Leviathan agent (if not running):"
echo "   cd ~/lev/agent && npm run dev"
echo ""
echo "2. Start the adapter:"
echo "   ./run_adapter.sh"
echo ""
echo "3. Test the integration:"
echo "   curl -X POST http://localhost:8081/v1/chat/completions \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"messages\":[{\"role\":\"user\",\"content\":\"Hello\"}],\"model\":\"leviathan-agent\"}'"
echo ""
echo "4. View adapter health:"
echo "   curl http://localhost:8081/health"
echo ""
echo "📁 Files created:"
echo "   - venv/ (Python virtual environment)"
echo "   - config.env (Configuration file)"
echo "   - run_adapter.sh (Start script)"
echo "   - adapter.log (Runtime logs)"
echo ""