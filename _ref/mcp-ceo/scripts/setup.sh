#!/bin/bash

# MCP-CEO Setup Script
# Creates the Architect of Abundance MCP server

echo "🚀 Setting up MCP-CEO: The Architect of Abundance"
echo "================================================="

# Create directory
INSTALL_DIR="$HOME/digital/mcp-ceo"
echo "Creating directory: $INSTALL_DIR"
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

# Check if files exist
if [ ! -f "package.json" ]; then
    echo "❌ Files not found in $INSTALL_DIR"
    echo "Please save the artifacts to this directory first:"
    echo "  - package.json"
    echo "  - server.js" 
    echo "  - ceo-config.yaml"
    echo "  - README.md"
    echo "  - Claude Desktop Project Instructions.md"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Make server executable
echo "🔧 Making server executable..."
chmod +x server.js

# Test server startup
echo "🧪 Testing server startup..."
timeout 3s node server.js > /dev/null 2>&1
if [ $? -eq 124 ]; then
    echo "✅ Server starts successfully"
else
    echo "❌ Server failed to start"
    echo "Try running manually: node server.js"
    exit 1
fi

# Check Claude Desktop config
CLAUDE_CONFIG="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
if [ -f "$CLAUDE_CONFIG" ]; then
    echo "📋 Claude Desktop config found"
    echo "Add this to your configuration:"
    echo '{'
    echo '  "mcpServers": {'
    echo '    "mcp-ceo": {'
    echo '      "command": "node",'
    echo "      \"args\": [\"$INSTALL_DIR/server.js\"]"
    echo '    }'
    echo '  }'
    echo '}'
else
    echo "⚠️  Claude Desktop config not found"
    echo "Make sure Claude Desktop is installed"
fi

echo ""
echo "✅ MCP-CEO Setup Complete!"
echo "=========================="
echo ""
echo "Next steps:"
echo "1. Add MCP server to Claude Desktop configuration"
echo "2. Restart Claude Desktop"
echo "3. Create new project with 'Claude Desktop Project Instructions'"
echo "4. Test with: Use architect_of_abundance with challenge: \"What should I focus on today?\""
echo ""
echo "🧠 The Architect of Abundance is ready to reduce stress and create abundance!"
echo "🥾 Bootstrap Promise: Works from Raspberry Pi to planetary coordination"
echo "🌍 Constitutional Guarantee: Stress reduction, sovereignty preservation, infinite scaling"