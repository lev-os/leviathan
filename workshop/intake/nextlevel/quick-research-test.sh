#!/bin/bash

# Quick Research Test - Single stream to validate approach

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESEARCH_DIR="${PROJECT_DIR}/01-research-execution/level-1-base"

echo "🧪 Quick Research Test with Claude CLI"
echo "======================================"

mkdir -p "$RESEARCH_DIR"

# Test with a shorter, focused prompt
TEST_PROMPT="List the top 5 breakthrough patterns in AI agent orchestration for 2024-2025. For each pattern, provide:

1. Pattern Name
2. Key Innovation (1 sentence)
3. Performance Impact (1 sentence)

Keep response under 500 words total."

echo "🎯 Testing with focused prompt..."
echo "Command: claude --print \"$TEST_PROMPT\""

# Execute with timeout monitoring
timeout 60s claude --print "$TEST_PROMPT" > "${RESEARCH_DIR}/test-findings.md"

if [[ $? -eq 0 ]]; then
    echo "✅ Test completed successfully!"
    echo "📄 Result preview:"
    head -10 "${RESEARCH_DIR}/test-findings.md"
    echo ""
    echo "📊 Full result: $(wc -l < "${RESEARCH_DIR}/test-findings.md") lines in ${RESEARCH_DIR}/test-findings.md"
else
    echo "❌ Test failed or timed out"
    echo "💡 Consider shorter prompts or alternative execution method"
fi