# Complete Kingly OS RAG Setup Guide

## 🎯 **What We're Building**

A complete documentation RAG system leveraging existing MCP infrastructure:

1. **Qdrant Vector DB** (existing MCP servers)
2. **Go Documentation Indexer** (custom)
3. **Neural Graffiti Integration** (first MCP implementation!)
4. **Research Database** (our accumulated knowledge)

## 🚀 **Phase 1: Set Up Existing Infrastructure**

### Install Existing MCP Servers

```bash
# Create tools structure
mkdir -p ~/digital/aiforge/tools/{qdrant,neural-graffiti,research}

# Clone existing Qdrant MCP servers
git clone https://github.com/qdrant/mcp-server-qdrant ~/digital/aiforge/tools/qdrant/official
git clone https://github.com/delorenj/mcp-qdrant-memory ~/digital/aiforge/tools/qdrant/knowledge-graph

# Install dependencies
cd ~/digital/aiforge/tools/qdrant/official && npm install
cd ~/digital/aiforge/tools/qdrant/knowledge-graph && npm install

# Start Qdrant
docker run -d -p 6333:6333 -v qdrant_storage:/qdrant/storage qdrant/qdrant
```

### Configure MCP in Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "qdrant-official": {
      "command": "node",
      "args": ["~/digital/aiforge/tools/qdrant/official/dist/index.js"],
      "env": {
        "QDRANT_URL": "http://localhost:6333"
      }
    },
    "qdrant-knowledge": {
      "command": "node", 
      "args": ["~/digital/aiforge/tools/qdrant/knowledge-graph/dist/index.js"],
      "env": {
        "QDRANT_URL": "http://localhost:6333"
      }
    }
  }
}
```

## 🧠 **Phase 2: Build Go Documentation Indexer**

```bash
# Create Go indexer
mkdir -p ~/digital/aiforge/tools/go-indexer
cd ~/digital/aiforge/tools/go-indexer

# Initialize Go module
go mod init go-docs-indexer
go get github.com/qdrant/go-client
```

Simple Go implementation that extracts docs and sends to Qdrant via API.

## 🎨 **Phase 3: Neural Graffiti MCP (First Implementation!)**

```bash
# Study original implementation
git clone https://github.com/babycommando/neuralgraffiti ~/digital/aiforge/tools/neural-graffiti/original

# Create our MCP wrapper
mkdir -p ~/digital/aiforge/tools/neural-graffiti/mcp-server
cd ~/digital/aiforge/tools/neural-graffiti/mcp-server

npm init -y
npm install @modelcontextprotocol/sdk
```

Build the first Neural Graffiti MCP server - we'll be first to market!

## 📚 **Phase 4: Research Database Integration**

Index our accumulated research:

```bash
# Create research indexer
cd ~/digital/aiforge/tools/research
node index.js ~/digital/aiforge/r
```

This will:
- Parse all our .md research files
- Chunk by semantic boundaries
- Embed and store in Qdrant
- Expose via MCP for instant query

## ✅ **Result: Complete RAG Stack**

You'll have instant access to:
- ✅ Go standard library documentation
- ✅ Our Kingly OS research findings  
- ✅ Neural Graffiti spray layer integration
- ✅ Vector semantic search
- ✅ All via native MCP tools

## 🚀 **Next: Integration with Kingly Prototype**

Once this RAG stack is running, we can:
1. Build the Go prototype with instant doc lookup
2. Implement Neural Graffiti patterns in our agent layer
3. Query our research for implementation guidance
4. Test performance optimizations in real-time

**Time to build! Which phase should we start with?**