#!/bin/bash
# Install Research MCPs for TimeTravel

echo "🚀 Installing Research MCP Servers..."

# Check if Smithery CLI is installed
if ! command -v smithery &>/dev/null; then
  echo "❌ Smithery CLI not found. Installing..."
  npm install -g @smithery/cli
fi

# 1. Academic Research
echo "📚 Installing Academic Research Tools..."

# Simple Arxiv (Free, no API needed)
echo "Installing Simple Arxiv..."
npx @smithery/cli install simple-arxiv

# BioMCP for medical research (Requires API key)
echo "Installing BioMCP (PubMed access)..."
npx @smithery/cli install biomcp

# 2. Search & Discovery
echo "🔍 Installing Search Tools..."

# Exa Search (Premium semantic search)
echo "Installing Exa Search..."
npx @smithery/cli install exa

# Context7 (Documentation search)
echo "Installing Context7..."
npx @smithery/cli install @upstash/context7-mcp

# DuckDuckGo (Free alternative)
echo "Installing DuckDuckGo Search..."
npx @smithery/cli install duckduckgo-search-server

# 3. Development & Code
echo "💻 Installing Development Tools..."

# GitHub MCP
echo "Installing GitHub MCP..."
npx @smithery/cli install @smithery-ai/github

# 4. Memory & Analysis
echo "🧠 Installing Memory Tools..."

# Memory Tool
echo "Installing Memory Tool..."
npx @smithery/cli install @mem0ai/mem0-memory-mcp

# Knowledge Graph Memory
echo "Installing Knowledge Graph Memory..."
npx @smithery/cli install knowledge-graph-memory-server

# 5. Data Processing
echo "📊 Installing Data Tools..."

# Excel for data manipulation
echo "Installing Excel MCP..."
npx @smithery/cli install excel

# 6. Utility
echo "🔧 Installing Utility Tools..."

# Desktop Commander (Terminal/Files)
echo "Installing Desktop Commander..."
npx @smithery/cli install @wonderwhy-er/desktop-commander

echo "✅ Installation complete!"
echo ""
echo "📝 Next steps:"
echo "1. Configure API keys for:"
echo "   - BioMCP (PubMed access)"
echo "   - Exa Search"
echo "   - Context7"
echo "   - GitHub"
echo ""
echo "2. Test installations:"
echo "   smithery run simple-arxiv --help"
echo "   smithery run biomcp --help"
echo ""
echo "3. Set up daily research collection (see daily-research.sh)"
