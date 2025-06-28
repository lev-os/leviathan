#!/bin/bash
# Install Real MCP Agent for LLM-First Integration

set -e

echo "🚀 Installing Real MCP Agent for Leviathan Integration"
echo "=" * 60

# Create and activate virtual environment
echo "📦 Creating Python environment..."
python3 -m venv venv
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install MCP Agent and dependencies
echo "📦 Installing MCP Agent..."
pip install mcp-agent

# Install additional dependencies for Lev integration
echo "📦 Installing integration dependencies..."
pip install pyyaml aiofiles neo4j

# Install MCP servers (note: some packages may not exist yet)
echo "🔧 Installing MCP servers..."
npm install -g @modelcontextprotocol/server-filesystem@latest || echo "Note: filesystem server install failed"
npm install -g @modelcontextprotocol/server-everything@latest || echo "Note: everything server install failed"

echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. source venv/bin/activate"
echo "2. Set API keys in environment or config"
echo "3. Run: python bi_directional_bridge.py"