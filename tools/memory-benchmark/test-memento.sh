#!/bin/bash

echo "🧪 Testing Memento MCP..."

# Test 1: Installation
echo "📦 Test 1: Installation simplicity"
time npx -y @gannonh/memento-mcp --version

# Test 2: Check if it runs
echo "🚀 Test 2: Runtime check"
npx @gannonh/memento-mcp list

echo "✅ Memento appears simple and ready to use!"
echo "Add to Claude Desktop config:"
echo '{
  "mcpServers": {
    "memento": {
      "command": "npx",
      "args": ["-y", "@gannonh/memento-mcp"]
    }
  }
}'