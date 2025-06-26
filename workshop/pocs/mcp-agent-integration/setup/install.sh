#!/bin/bash

# MCP Agent Integration POC - Installation Script
# Sets up MCP Agent within Lev ecosystem

set -e

echo "🚀 Setting up MCP Agent Integration POC..."

# Check if we're in the right directory
if [[ ! -f "README.md" ]] || [[ ! -d "setup" ]]; then
    echo "❌ Please run from POC root directory"
    exit 1
fi

# Create Python virtual environment
echo "📦 Creating Python environment..."
python3 -m venv venv
source venv/bin/activate

# Install MCP Agent and dependencies
echo "📦 Installing MCP Agent..."
pip install mcp-agent

# Install additional dependencies for integration
echo "📦 Installing integration dependencies..."
pip install -r setup/requirements.txt

# Verify installation
echo "✅ Verifying installation..."
python -c "import mcp_agent; print(f'MCP Agent version: {mcp_agent.__version__}')"

# Create basic MCP server configuration
echo "⚙️ Creating MCP server configuration..."
cp setup/mcp_config.yaml.template setup/mcp_config.yaml

# Set up basic MCP servers (fetch, filesystem)
echo "🔧 Installing basic MCP servers..."
# Fetch server
npm install -g @modelcontextprotocol/server-fetch

# Filesystem server  
npm install -g @modelcontextprotocol/server-filesystem

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Activate environment: source venv/bin/activate"
echo "2. Run basic test: python examples/basic_agent.py"
echo "3. Run integration test: python examples/ceo_endpoint_test.py"