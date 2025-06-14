#!/bin/bash

echo "🚀 Setting up Kingly OS RAG Stack with existing MCP servers..."

# Create tools directory structure
mkdir -p /Users/jean-patricksmith/digital/aiforge/tools/{qdrant,neural-graffiti,go-analysis}
cd /Users/jean-patricksmith/digital/aiforge/tools

# 1. Clone existing Qdrant MCP servers
echo "📊 Cloning Qdrant MCP servers..."
git clone https://github.com/qdrant/mcp-server-qdrant qdrant/official
git clone https://github.com/delorenj/mcp-qdrant-memory qdrant/knowledge-graph
git clone https://github.com/gergelyszerovay/mcp-server-qdrant-retrieve qdrant/semantic-search

# 2. Clone Neural Graffiti for study
echo "🧠 Cloning Neural Graffiti..."
git clone https://github.com/babycommando/neuralgraffiti neural-graffiti/original

# 3. Start Qdrant locally
echo "🔍 Starting Qdrant vector database..."
docker run -d -p 6333:6333 -p 6334:6334 -v ./qdrant_storage:/qdrant/storage qdrant/qdrant

# 4. Install dependencies for MCP servers
echo "📦 Installing MCP server dependencies..."
cd qdrant/official && npm install && cd ../..
cd qdrant/knowledge-graph && npm install && cd ../..
cd qdrant/semantic-search && npm install && cd ../..

echo "✅ RAG stack setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure MCP servers in Claude Desktop"
echo "2. Build Go documentation indexer"
echo "3. Create Neural Graffiti MCP wrapper"
echo "4. Integrate with Kingly Agent"