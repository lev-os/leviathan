#!/bin/bash

echo "🚀 Kingly OS RAG Stack - Quick Start"
echo "===================================="

# Phase 1: Set up existing infrastructure
echo "📊 Phase 1: Setting up existing MCP servers..."

mkdir -p ~/digital/aiforge/tools/{qdrant,neural-graffiti,research}
cd ~/digital/aiforge/tools

# Clone existing Qdrant MCP servers
echo "  Cloning Qdrant MCP servers..."
git clone https://github.com/qdrant/mcp-server-qdrant qdrant/official
git clone https://github.com/delorenj/mcp-qdrant-memory qdrant/knowledge-graph

# Start Qdrant database
echo "  Starting Qdrant database..."
docker run -d --name qdrant-db -p 6333:6333 -v qdrant_storage:/qdrant/storage qdrant/qdrant

# Install MCP server dependencies
echo "  Installing dependencies..."
cd qdrant/official && npm install && cd ../..
cd qdrant/knowledge-graph && npm install && cd ../..

# Phase 2: Neural Graffiti research  
echo "🧠 Phase 2: Studying Neural Graffiti..."
git clone https://github.com/babycommando/neuralgraffiti neural-graffiti/original

echo "✅ Infrastructure setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure MCP servers in Claude Desktop"
echo "2. Test Qdrant connection: curl http://localhost:6333/health"
echo "3. Start building Go documentation indexer"
echo "4. Create Neural Graffiti MCP wrapper"