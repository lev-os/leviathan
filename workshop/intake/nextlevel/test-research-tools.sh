#!/bin/bash

# Test Research Tools - Validate approach before full execution

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "🧪 Testing NEXTLEVEL Research Tools"
echo "===================================="

# Test 1: Claude CLI availability and basic functionality
echo "📋 Test 1: Claude CLI"
if command -v claude &> /dev/null; then
    echo "✅ Claude CLI found: $(which claude)"
    # Test basic claude functionality
    echo "Testing claude help..."
    claude --help | head -5
else
    echo "❌ Claude CLI not found"
    echo "💡 Available commands: $(ls /Users/jean-patricksmith/.bun/bin/ | grep claude || echo 'none')"
fi

echo ""

# Test 2: Perplexity integration
echo "📋 Test 2: Perplexity Integration"
if command -v perplexity &> /dev/null; then
    echo "✅ Perplexity CLI found"
else
    echo "⚠️ Perplexity CLI not found - will use web interface"
fi

echo ""

# Test 3: Basic research prompt execution
echo "📋 Test 3: Basic Prompt Test"
echo "Testing simple research prompt..."

# Create a minimal test prompt
TEST_PROMPT="Quickly identify 3 key trends in AI agent orchestration for 2024-2025. Format as:
1. Trend Name - Brief description
2. Trend Name - Brief description  
3. Trend Name - Brief description"

echo "Test prompt: $TEST_PROMPT"

# Try the actual command that would work
echo "Command would be: claude '$TEST_PROMPT'"

echo ""

# Test 4: Repository download capabilities
echo "📋 Test 4: Repository Download Test"

# Test creating directories
TEST_DIR="${PROJECT_DIR}/test-downloads"
mkdir -p "$TEST_DIR"
echo "✅ Created test directory: $TEST_DIR"

# Test git clone capability
cd "$TEST_DIR"
echo "Testing git clone..."
if git clone --depth=1 "https://github.com/microsoft/autogen.git" test-repo 2>/dev/null; then
    echo "✅ Git clone successful"
    echo "📊 Repository stats:"
    echo "   Files: $(find test-repo -type f | wc -l)"
    echo "   Size: $(du -sh test-repo | cut -f1)"
    
    # Test file analysis
    echo "   Python files: $(find test-repo -name "*.py" | wc -l)"
    echo "   TypeScript files: $(find test-repo -name "*.ts" | wc -l)"
    
    # Cleanup
    rm -rf test-repo
else
    echo "❌ Git clone failed"
fi

cd "$PROJECT_DIR"
rm -rf "$TEST_DIR"

echo ""

# Test 5: File extraction and analysis
echo "📋 Test 5: Text Processing"

# Test prompt template extraction
echo "Testing prompt template extraction..."
if grep -A 5 "RESEARCH_PROMPT_L1_AGENTIC" 00-project-context/meta-prompts-library.md > /dev/null; then
    echo "✅ Prompt template extraction works"
    echo "Sample extracted prompt:"
    grep -A 5 "RESEARCH_PROMPT_L1_AGENTIC" 00-project-context/meta-prompts-library.md | head -3
else
    echo "❌ Prompt template extraction failed"
fi

echo ""

# Test 6: Output directory structure
echo "📋 Test 6: Output Directory Creation"
for dir in "01-research-execution/level-1-base" "02-repo-intelligence/findings" "03-synthesis" "04-deliverables"; do
    if [[ -d "$dir" ]]; then
        echo "✅ Directory exists: $dir"
    else
        echo "❌ Directory missing: $dir"
        mkdir -p "$dir"
        echo "   Created: $dir"
    fi
done

echo ""

# Test 7: Research methodology validation
echo "📋 Test 7: Research Methodology"
echo "Checking research prompt templates..."

PROMPT_COUNT=$(grep -c "RESEARCH_PROMPT_L" 00-project-context/meta-prompts-library.md)
echo "✅ Found $PROMPT_COUNT research prompt templates"

echo "Checking context files..."
CONTEXT_FILES=(
    "00-project-context/research-methodology.md"
    "00-project-context/kingly-principles-context.md"
    "00-project-context/competitive-landscape-context.md"
)

for file in "${CONTEXT_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        echo "✅ Context file exists: $file ($(wc -l < "$file") lines)"
    else
        echo "❌ Context file missing: $file"
    fi
done

echo ""
echo "🎯 Test Summary"
echo "==============="
echo "If all tests pass, we can proceed with:"
echo "1. Manual research execution (since automated spawning needs work)"
echo "2. Repository downloads (git clone works)"
echo "3. Results synthesis (file processing works)"
echo ""
echo "Recommended approach:"
echo "1. Use perplexity manually with our L1 prompts"
echo "2. Run repo downloads in parallel"
echo "3. Manually execute L2/L3 analysis"
echo "4. Synthesize results into deliverables"