#!/bin/bash

echo "🚀 Setting up Kingly Research MCP Server..."

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Create environment file
echo "🔧 Creating environment configuration..."
cat > .env << EOF
# Add your Perplexity API key here
PERPLEXITY_API_KEY=your_perplexity_api_key_here

# Optional: Add other API keys for enhanced functionality
OPENAI_API_KEY=your_openai_key_here
EOF

# Download Go documentation (if needed)
echo "📚 Setting up Go documentation..."
if ! command -v go &> /dev/null; then
    echo "⚠️  Go not found. Install Go first: https://golang.org/doc/install"
else
    echo "✅ Go found. Documentation will be available at: $(go env GOROOT)/doc"
fi

# Make the script executable
chmod +x index.js

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add your Perplexity API key to .env file"
echo "2. Test the server: npm start"
echo "3. Add to your MCP client configuration"
echo ""
echo "MCP Configuration for Claude Desktop:"
echo '{
  "mcpServers": {
    "kingly-research": {
      "command": "node",
      "args": ["'$(pwd)'/index.js"],
      "env": {
        "PERPLEXITY_API_KEY": "your_key_here"
      }
    }
  }
}'