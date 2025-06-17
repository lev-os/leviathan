#!/bin/bash
# Validate API Keys Script

echo "🔐 Validating API Keys"
echo "===================="

# Load environment variables
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"

if [ -f "$ENV_FILE" ]; then
  export $(cat "$ENV_FILE" | grep -v '^#' | grep -v '^\s*$' | xargs)
else
  echo "❌ Error: No .env file found at $ENV_FILE"
  exit 1
fi

# Check each required key
required_keys=(
  "SMITHERY_API_KEY"
  "PERPLEXITY_API_KEY"
  "TAVILY_API_KEY"
  "BRAVE_API_KEY"
  "EXA_API_KEY"
  "FIRECRAWL_API_KEY"
)

optional_keys=(
  "OPENAI_API_KEY"
  "ANTHROPIC_API_KEY"
  "BROWSER_CAT_API_KEY"
  "ANTI_CAPTCHA_API_KEY"
  "TWOCAPTCHA_API_KEY"
  "CAPSOLVER_API_KEY"
)

missing_required=()
missing_optional=()

echo ""
echo "Required Keys:"
echo "--------------"
for key in "${required_keys[@]}"; do
  if [ -z "${!key}" ]; then
    missing_required+=($key)
    echo "❌ Missing: $key"
  else
    # Show first 8 chars of key for verification
    key_preview="${!key:0:8}..."
    echo "✅ Found: $key ($key_preview)"
  fi
done

echo ""
echo "Optional Keys:"
echo "--------------"
for key in "${optional_keys[@]}"; do
  if [ -z "${!key}" ]; then
    missing_optional+=($key)
    echo "⚠️  Missing: $key (optional)"
  else
    key_preview="${!key:0:8}..."
    echo "✅ Found: $key ($key_preview)"
  fi
done

echo ""
echo "Summary:"
echo "--------"
if [ ${#missing_required[@]} -eq 0 ]; then
  echo "✅ All required keys present"
else
  echo "❌ Missing ${#missing_required[@]} required keys"
  echo "   Run: ./scripts/setup-keys.sh to configure"
  exit 1
fi

if [ ${#missing_optional[@]} -gt 0 ]; then
  echo "⚠️  Missing ${#missing_optional[@]} optional keys"
  echo "   Some advanced features may be unavailable"
fi

echo ""
echo "🔐 Keys are stored in: $ENV_FILE"
echo "⚠️  Remember: Never commit .env to version control!"