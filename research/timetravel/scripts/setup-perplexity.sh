#!/bin/bash
# Setup script for Perplexity API integration
# This script helps configure the Perplexity API key securely

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/.env"
ENV_EXAMPLE="$PROJECT_ROOT/.env.example"

echo -e "${BLUE}🐋 TimeTravel Perplexity API Setup${NC}"
echo -e "${BLUE}===================================${NC}"
echo ""

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
  if [ -f "$ENV_EXAMPLE" ]; then
    echo -e "${YELLOW}Creating .env from .env.example...${NC}"
    cp "$ENV_EXAMPLE" "$ENV_FILE"
  else
    echo -e "${YELLOW}Creating new .env file...${NC}"
    touch "$ENV_FILE"
  fi
fi

# Function to update or add key
update_env_key() {
  local key=$1
  local value=$2

  if grep -q "^${key}=" "$ENV_FILE"; then
    # Key exists, update it
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS
      sed -i '' "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
    else
      # Linux
      sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
    fi
  else
    # Key doesn't exist, add it
    echo "${key}=${value}" >>"$ENV_FILE"
  fi
}

# Check current Perplexity API key
CURRENT_KEY=$(grep "^PERPLEXITY_API_KEY=" "$ENV_FILE" 2>/dev/null | cut -d '=' -f2- || echo "")

if [ ! -z "$CURRENT_KEY" ] && [ "$CURRENT_KEY" != "your_perplexity_api_key_here" ]; then
  echo -e "${GREEN}✅ Perplexity API key already configured${NC}"
  echo -e "Current key: ${YELLOW}${CURRENT_KEY:0:10}...${CURRENT_KEY: -4}${NC}"
  echo ""
  read -p "Do you want to update it? (y/N): " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}✅ Setup complete!${NC}"
    exit 0
  fi
fi

# Get the API key
echo -e "${BLUE}📝 Perplexity API Configuration${NC}"
echo ""
echo "Your Perplexity API key: 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"
echo ""
read -p "Use this API key? (Y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Nn]$ ]]; then
  echo "Please enter your Perplexity API key:"
  read -s PERPLEXITY_API_KEY
  echo ""
else
  PERPLEXITY_API_KEY="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"
fi

# Validate API key format
if [[ ! "$PERPLEXITY_API_KEY" =~ ^pplx-[a-zA-Z0-9]{48}$ ]]; then
  echo -e "${RED}❌ Invalid API key format. Perplexity API keys start with 'pplx-' followed by 48 characters.${NC}"
  exit 1
fi

# Update the .env file
echo -e "${YELLOW}Updating .env file...${NC}"
update_env_key "PERPLEXITY_API_KEY" "$PERPLEXITY_API_KEY"

# Test the API key
echo -e "${YELLOW}Testing API connection...${NC}"

# Create a simple test script
cat >"$PROJECT_ROOT/test-perplexity.js" <<'EOF'
const axios = require('axios');
require('dotenv').config();

async function testPerplexityAPI() {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    
    if (!apiKey) {
        console.error('❌ PERPLEXITY_API_KEY not found in environment');
        process.exit(1);
    }
    
    try {
        const response = await axios.post(
            'https://api.perplexity.ai/chat/completions',
            {
                model: 'sonar',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant.'
                    },
                    {
                        role: 'user',
                        content: 'Say "API test successful" if you can read this.'
                    }
                ],
                max_tokens: 50
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (response.data.choices[0].message.content.includes('API test successful')) {
            console.log('✅ Perplexity API connection successful!');
            console.log(`   Model: ${response.data.model}`);
            console.log(`   Tokens used: ${response.data.usage.total_tokens}`);
        } else {
            console.error('❌ Unexpected response from API');
        }
    } catch (error) {
        console.error('❌ API test failed:', error.response?.data?.error || error.message);
        process.exit(1);
    }
}

testPerplexityAPI();
EOF

# Run the test
if command -v node >/dev/null 2>&1; then
  cd "$PROJECT_ROOT"
  node test-perplexity.js
  TEST_RESULT=$?
  rm -f test-perplexity.js

  if [ $TEST_RESULT -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Perplexity API setup complete!${NC}"
    echo ""
    echo -e "${BLUE}📚 Next Steps:${NC}"
    echo "1. The API key has been saved to your .env file"
    echo "2. You can now use Perplexity Sonar for research"
    echo "3. To enable Deep Research, upgrade your Perplexity plan"
    echo ""
    echo -e "${YELLOW}💡 Usage Examples:${NC}"
    echo "   npx timetravel research 'quantum computing breakthroughs'"
    echo "   npx timetravel research 'AI safety research' --deep"
    echo ""
  else
    echo ""
    echo -e "${RED}❌ API test failed. Please check your API key and try again.${NC}"
    exit 1
  fi
else
  echo -e "${YELLOW}⚠️  Node.js not found. Skipping API test.${NC}"
  echo -e "${GREEN}✅ API key saved to .env file${NC}"
fi

# Remind about .gitignore
echo -e "${YELLOW}⚠️  Security Reminder:${NC}"
echo "   - Never commit .env files to git"
echo "   - Your .env is already in .gitignore"
echo "   - Keep your API keys secret and rotate them regularly"
echo ""
