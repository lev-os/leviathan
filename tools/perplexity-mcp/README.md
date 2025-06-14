# Kingly Research MCP Server

Enhanced DX tools for Kingly OS development with instant access to research, Go docs, and Perplexity.

## Quick Setup

```bash
cd /Users/jean-patricksmith/digital/aiforge/tools/perplexity-mcp
chmod +x setup.sh
./setup.sh
```

## Features

### 🔍 Perplexity Research
```
perplexity_research query="Go goroutine pools for LLM inference" focus="go"
```

### 📚 Go Documentation Search  
```
go_docs_search package="unsafe" function="Pointer"
```

### 🧠 Research Query
```
research_query query="ARM performance" area="kernel"
```

### 📥 Import Research
```
import_research path="/Users/jean-patricksmith/digital/aiforge/r"
```

## Download Go Documentation Offline

```bash
# Method 1: Clone Go source (includes docs)
git clone https://github.com/golang/go.git /tmp/go-docs
cd /tmp/go-docs/doc
python3 -m http.server 8080  # Serve locally

# Method 2: Use go doc command
go doc -all net/http > net_http_docs.txt
go doc -all syscall > syscall_docs.txt
go doc -all unsafe > unsafe_docs.txt

# Method 3: Download godoc site mirror
wget -r -np -k https://pkg.go.dev/std
```

## Enhanced MCP Integration

Add to your Claude Desktop config:

```json
{
  "mcpServers": {
    "kingly-research": {
      "command": "node",
      "args": ["/Users/jean-patricksmith/digital/aiforge/tools/perplexity-mcp/index.js"],
      "env": {
        "PERPLEXITY_API_KEY": "your_key_here"
      }
    }
  }
}
```

## Usage Examples

### For Kingly OS Development:

**Query specific Go patterns:**
```
perplexity_research query="Go zero-allocation patterns for high-performance networking" focus="go"
```

**Search our research:**
```
research_query query="TinyLlama inference latency" area="performance"
```

**Go cgo integration:**
```
go_docs_search package="C" topic="cgo memory management"
```

## Next: Neural Graffiti Integration

The MCP server is ready to help research Neural Graffiti implementation:

```
perplexity_research query="Neural Graffiti spray layer implementation in Go" focus="llm"
```

This will give you 5x faster research capability for the prototype phase! 🚀