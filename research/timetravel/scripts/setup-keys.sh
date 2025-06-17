#!/bin/bash
# Setup API Keys Script - Interactive key configuration

echo "🔐 Kingly TimeTravel API Key Setup"
echo "=================================="
echo ""
echo "This wizard will help you configure API keys for TimeTravel research."
echo "Keys will be stored in .env file (development mode)."
echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"

# Check if .env already exists
if [ -f "$ENV_FILE" ]; then
  echo "⚠️  Warning: .env file already exists!"
  read -p "Overwrite existing configuration? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
  fi
fi

# Function to read key with optional default
read_key() {
  local key_name=$1
  local description=$2
  local required=$3
  local current_value="${!key_name}"
  
  echo ""
  echo "📝 $description"
  if [ ! -z "$current_value" ]; then
    echo "   Current value: ${current_value:0:8}..."
  fi
  
  if [ "$required" == "true" ]; then
    read -p "   Enter $key_name (required): " value
    while [ -z "$value" ]; do
      echo "   ❌ This key is required!"
      read -p "   Enter $key_name: " value
    done
  else
    read -p "   Enter $key_name (optional, press Enter to skip): " value
  fi
  
  if [ ! -z "$value" ]; then
    eval "$key_name='$value'"
  fi
}

echo "Setting up required API keys..."
echo "==============================="

# Required keys
read_key "SMITHERY_API_KEY" "Smithery - Universal MCP Access" "true"
read_key "PERPLEXITY_API_KEY" "Perplexity - AI-powered search" "true"
read_key "TAVILY_API_KEY" "Tavily - Web search API" "true"
read_key "BRAVE_API_KEY" "Brave - Privacy-focused search" "true"
read_key "EXA_API_KEY" "Exa - Neural search engine" "true"
read_key "FIRECRAWL_API_KEY" "Firecrawl - Web scraping" "true"

echo ""
echo "Optional API keys (press Enter to skip)..."
echo "=========================================="

# Optional keys
read_key "OPENAI_API_KEY" "OpenAI - GPT models" "false"
read_key "ANTHROPIC_API_KEY" "Anthropic - Claude API" "false"
read_key "BROWSER_CAT_API_KEY" "BrowserCat - Browser automation" "false"
read_key "GEMINI_API_KEY" "Google Gemini" "false"

# Write .env file
echo ""
echo "📝 Writing configuration to $ENV_FILE..."

cat > "$ENV_FILE" << EOF
# Research API Keys for TimeTravel Infrastructure
# Generated on $(date)
# WARNING: Never commit this file to version control!

# Smithery - Universal MCP Access
SMITHERY_API_KEY=$SMITHERY_API_KEY

# Primary Research APIs
PERPLEXITY_API_KEY=$PERPLEXITY_API_KEY
TAVILY_API_KEY=$TAVILY_API_KEY
BRAVE_API_KEY=$BRAVE_API_KEY
EXA_API_KEY=$EXA_API_KEY

# Web Scraping & Automation
FIRECRAWL_API_KEY=$FIRECRAWL_API_KEY
${BROWSER_CAT_API_KEY:+BROWSER_CAT_API_KEY=$BROWSER_CAT_API_KEY}

# AI Model APIs
${OPENAI_API_KEY:+OPENAI_API_KEY=$OPENAI_API_KEY}
${ANTHROPIC_API_KEY:+ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY}
${GEMINI_API_KEY:+GEMINI_API_KEY=$GEMINI_API_KEY}
EOF

echo "✅ Configuration saved!"
echo ""

# Run validation
echo "🔍 Validating configuration..."
"$SCRIPT_DIR/validate-keys.sh"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Test research workflow: ./kingly-sim.sh research 'your topic'"
echo "2. For production, migrate to macOS Keychain: ./scripts/migrate-to-keychain.sh"
echo "3. Review security ADR: ../docs/adr/001-multi-platform-secure-key-management.md"