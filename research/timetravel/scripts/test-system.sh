#!/bin/bash
# System Test Script - Validate TimeTravel infrastructure

echo "🧪 TimeTravel System Test"
echo "========================"
echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -n "Testing $test_name... "
    if eval "$test_command" > /dev/null 2>&1; then
        echo "✅ PASSED"
        ((TESTS_PASSED++))
        return 0
    else
        echo "❌ FAILED"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Test 1: Project structure
echo "📁 Testing Project Structure"
echo "==========================="
run_test "Project root exists" "[ -d '$PROJECT_ROOT' ]"
run_test "Scripts directory" "[ -d '$PROJECT_ROOT/scripts' ]"
run_test "Contexts directory" "[ -d '$PROJECT_ROOT/contexts' ]"
run_test "Outputs directory" "[ -d '$PROJECT_ROOT/outputs' ]"
run_test "Memory directory" "[ -d '$PROJECT_ROOT/memory' ]"
echo ""

# Test 2: Configuration files
echo "📄 Testing Configuration Files"
echo "============================="
run_test "Project YAML" "[ -f '$PROJECT_ROOT/project.yaml' ]"
run_test "Main script" "[ -x '$PROJECT_ROOT/kingly-sim.sh' ]"
run_test "Execute script" "[ -x '$SCRIPT_DIR/execute-research.sh' ]"
run_test "Context loader" "[ -x '$SCRIPT_DIR/load-context.sh' ]"
run_test "Personality mode" "[ -x '$SCRIPT_DIR/personality-mode.sh' ]"
echo ""

# Test 3: API Keys (if .env exists)
echo "🔑 Testing API Configuration"
echo "==========================="
if [ -f "$PROJECT_ROOT/.env" ]; then
    source "$PROJECT_ROOT/.env"
    run_test "Smithery API key" "[ ! -z '$SMITHERY_API_KEY' ]"
    run_test "Perplexity API key" "[ ! -z '$PERPLEXITY_API_KEY' ]"
    run_test "Tavily API key" "[ ! -z '$TAVILY_API_KEY' ]"
    run_test "Brave API key" "[ ! -z '$BRAVE_API_KEY' ]"
else
    echo "⚠️  No .env file found - skipping API tests"
    echo "   Run ./setup-keys.sh to configure"
fi
echo ""

# Test 4: Core context references
echo "🔗 Testing Core Context References"
echo "================================="

# Test context resolution
test_context_resolution() {
    local ref="$1"
    local expected_path="/Users/jean-patricksmith/digital/mcp-ceo/contexts/${ref#@kingly/core/}"
    [ -e "$expected_path" ] || [ -e "$expected_path/context.yaml" ]
}

run_test "Deep researcher agent" "test_context_resolution '@kingly/core/agents/research/deep-researcher'"
run_test "MCP suite tools" "test_context_resolution '@kingly/core/tools/research/mcp-suite'"
run_test "Three-tier workflow" "test_context_resolution '@kingly/core/workflows/research/three-tier-deep'"
run_test "Personality pattern" "test_context_resolution '@kingly/core/patterns/personality'"
echo ""

# Test 5: Context loading
echo "🔍 Testing Context Loading"
echo "========================"

# Test load-context.sh with a known context
if "$SCRIPT_DIR/load-context.sh" "@kingly/core/agents/research/deep-researcher" > /tmp/context-test.log 2>&1; then
    run_test "Context loader works" "grep -q 'Context Load Summary' /tmp/context-test.log"
    run_test "Finds agent type" "grep -q 'Agent Context Detected' /tmp/context-test.log"
else
    echo "❌ Context loader failed"
    ((TESTS_FAILED++))
fi
echo ""

# Test 6: Personality modes
echo "🎭 Testing Personality Modes"
echo "==========================="

# Test personality mode script
if "$SCRIPT_DIR/personality-mode.sh" visionary > /tmp/personality-test.log 2>&1; then
    run_test "Personality mode works" "grep -q 'Personality mode activated' /tmp/personality-test.log"
    run_test "Creates context file" "[ -f '$PROJECT_ROOT/contexts/active-personality.yaml' ]"
else
    echo "❌ Personality mode failed"
    ((TESTS_FAILED++))
fi
echo ""

# Test 7: Memory system
echo "💾 Testing Memory System"
echo "======================"
run_test "Memory directory exists" "[ -d '$PROJECT_ROOT/memory' ]"

# Create test memory entry
TEST_MEMORY="$PROJECT_ROOT/memory/test-entry-$(date +%s).yaml"
cat > "$TEST_MEMORY" << EOF
metadata:
  timestamp: "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  topic: "system_test"
  
content:
  test: "memory system functional"
EOF

run_test "Can write memory" "[ -f '$TEST_MEMORY' ]"
run_test "Memory readable" "grep -q 'memory system functional' '$TEST_MEMORY'"

# Cleanup test memory
rm -f "$TEST_MEMORY"
echo ""

# Test 8: Output generation
echo "📊 Testing Output Generation"
echo "==========================="
run_test "Output directory exists" "[ -d '$PROJECT_ROOT/outputs' ]"
run_test "Research subdirectory" "[ -d '$PROJECT_ROOT/outputs/research' ]"

# Check for any existing outputs
if ls "$PROJECT_ROOT/outputs/research"/*.md > /dev/null 2>&1; then
    echo "✅ Found existing research outputs"
else
    echo "ℹ️  No research outputs yet (run a research task to generate)"
fi
echo ""

# Test Summary
echo "📊 Test Summary"
echo "=============="
echo "Tests Passed: $TESTS_PASSED"
echo "Tests Failed: $TESTS_FAILED"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo "✅ All tests passed! System is ready for research."
    echo ""
    echo "💡 Next steps:"
    echo "1. Run: ./kingly-sim.sh research 'your topic'"
    echo "2. Or: ./personality-mode.sh all"
    echo "3. Then: ./kingly-sim.sh research 'your topic'"
    exit 0
else
    echo "❌ Some tests failed. Please fix issues before proceeding."
    echo ""
    echo "Common fixes:"
    echo "- Run: ./setup-keys.sh (for API configuration)"
    echo "- Check: Core contexts exist in /digital/mcp-ceo/contexts/"
    echo "- Verify: All scripts have execute permissions"
    exit 1
fi