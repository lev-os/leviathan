#!/bin/bash

# NEXTLEVEL RESEARCH EXECUTION - HYBRID APPROACH
# Combines automated repository downloads with guided manual research

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTEXT_DIR="${PROJECT_DIR}/00-project-context"
RESEARCH_DIR="${PROJECT_DIR}/01-research-execution"
REPO_DIR="${PROJECT_DIR}/02-repo-intelligence"

echo "🚀 NEXTLEVEL RESEARCH PROJECT - HYBRID EXECUTION"
echo "================================================="

# Phase 1: Automated Repository Downloads (Parallel)
echo "📦 Phase 1: Starting Repository Downloads..."

cd "${REPO_DIR}/findings"

# Background repository downloads
echo "Launching parallel repository downloads..."

# LangChain ecosystem
echo "📥 Starting LangChain download..."
../download-scripts/download-langchain.sh &
LANGCHAIN_PID=$!

# Temporal ecosystem  
echo "📥 Starting Temporal download..."
../download-scripts/download-temporal.sh &
TEMPORAL_PID=$!

# Emerging frameworks
echo "📥 Starting Emerging frameworks download..."
../download-scripts/download-emerging.sh &
EMERGING_PID=$!

echo "⏳ Repository downloads running in background..."
echo "   LangChain PID: $LANGCHAIN_PID"
echo "   Temporal PID: $TEMPORAL_PID" 
echo "   Emerging PID: $EMERGING_PID"

cd "$PROJECT_DIR"

# Phase 2: Research Prompt Preparation
echo ""
echo "📋 Phase 2: Preparing Research Prompts..."

# Extract L1 prompts for manual execution
mkdir -p "${RESEARCH_DIR}/level-1-base/prompts"

echo "Extracting Level 1 research prompts..."

# Extract agentic prompt
sed -n '/RESEARCH_PROMPT_L1_AGENTIC/,/"""/p' "${CONTEXT_DIR}/meta-prompts-library.md" | \
    sed '1d;$d' > "${RESEARCH_DIR}/level-1-base/prompts/agentic-research.txt"

# Extract robotics prompt  
sed -n '/RESEARCH_PROMPT_L1_ROBOTICS/,/"""/p' "${CONTEXT_DIR}/meta-prompts-library.md" | \
    sed '1d;$d' > "${RESEARCH_DIR}/level-1-base/prompts/robotics-research.txt"

# Extract hackers prompt
sed -n '/RESEARCH_PROMPT_L1_HACKERS/,/"""/p' "${CONTEXT_DIR}/meta-prompts-library.md" | \
    sed '1d;$d' > "${RESEARCH_DIR}/level-1-base/prompts/hackers-research.txt"

# Extract enterprise prompt
sed -n '/RESEARCH_PROMPT_L1_ENTERPRISE/,/"""/p' "${CONTEXT_DIR}/meta-prompts-library.md" | \
    sed '1d;$d' > "${RESEARCH_DIR}/level-1-base/prompts/enterprise-research.txt"

echo "✅ Level 1 prompts extracted to: ${RESEARCH_DIR}/level-1-base/prompts/"

# Create research execution guide
cat > "${RESEARCH_DIR}/level-1-base/RESEARCH_GUIDE.md" << 'EOF'
# LEVEL 1 RESEARCH EXECUTION GUIDE

## 📋 RESEARCH STREAMS TO EXECUTE

Execute these 4 research prompts using Perplexity (or Claude):

### Stream 1: Agentic Architecture Intelligence
**Prompt File**: `prompts/agentic-research.txt`
**Output File**: `agentic-findings.md`
**Focus**: Multi-agent orchestration breakthrough patterns

### Stream 2: Post-Agentic Paradigm Analysis  
**Prompt File**: `prompts/robotics-research.txt`
**Output File**: `robotics-findings.md`
**Focus**: What comes after agentic AI (robotics, embodied AI)

### Stream 3: Hacker Sovereignty Movement
**Prompt File**: `prompts/hackers-research.txt`
**Output File**: `hackers-findings.md`
**Focus**: Underground AI sovereignty projects

### Stream 4: Enterprise vs Sovereignty Battle
**Prompt File**: `prompts/enterprise-research.txt`
**Output File**: `enterprise-findings.md`
**Focus**: Enterprise AI platforms vs local-first solutions

## 🎯 EXECUTION INSTRUCTIONS

1. **Copy each prompt** from the .txt files
2. **Execute in Perplexity** (recommended) or Claude
3. **Save results** as specified .md files in this directory
4. **Use structured format** as specified in prompts

## 📊 OUTPUT FORMAT REQUIRED

Each findings file should include:
- Pattern Name
- Key Innovation
- Architecture Impact  
- Sovereignty Implications
- Speed/Performance Factors
- Kingly Positioning Opportunity

## ⏭️ NEXT STEPS

After completing Level 1 research:
1. Run `generate-level-2-prompts.sh` for dynamic deep-dive generation
2. Execute Level 2 research streams
3. Proceed to Level 3 validation
4. Synthesize final deliverables
EOF

echo "✅ Research guide created: ${RESEARCH_DIR}/level-1-base/RESEARCH_GUIDE.md"

# Phase 3: Check Repository Download Progress
echo ""
echo "📊 Phase 3: Checking Repository Download Progress..."

# Function to check if process is still running
check_download_status() {
    local pid=$1
    local name=$2
    
    if kill -0 $pid 2>/dev/null; then
        echo "⏳ $name download still running (PID: $pid)"
        return 1
    else
        echo "✅ $name download completed"
        return 0
    fi
}

# Wait for downloads with status updates
echo "Monitoring download progress..."
while true; do
    all_done=true
    
    if ! check_download_status $LANGCHAIN_PID "LangChain"; then
        all_done=false
    fi
    
    if ! check_download_status $TEMPORAL_PID "Temporal"; then  
        all_done=false
    fi
    
    if ! check_download_status $EMERGING_PID "Emerging"; then
        all_done=false
    fi
    
    if $all_done; then
        break
    fi
    
    sleep 10
done

echo "🎉 All repository downloads completed!"

# Phase 4: Repository Analysis Preparation
echo ""
echo "📊 Phase 4: Repository Analysis Summary..."

cd "${REPO_DIR}/findings"

# Check download results
echo "Download Summary:"
for category in langchain-repos temporal-repos emerging-repos; do
    if [[ -d "$category" ]]; then
        repo_count=$(ls -d $category/*/ 2>/dev/null | wc -l)
        total_size=$(du -sh "$category" 2>/dev/null | cut -f1)
        echo "✅ $category: $repo_count repositories, $total_size total"
    else
        echo "❌ $category: download failed"
    fi
done

cd "$PROJECT_DIR"

# Phase 5: Create Analysis Scripts
echo ""
echo "🔧 Phase 5: Creating Analysis Tools..."

# Create Level 2 prompt generator
cat > generate-level-2-prompts.sh << 'EOF'
#!/bin/bash

# Generate Level 2 prompts based on Level 1 findings

RESEARCH_DIR="01-research-execution"
L1_DIR="${RESEARCH_DIR}/level-1-base"
L2_DIR="${RESEARCH_DIR}/level-2-deep"

echo "🔍 Generating Level 2 Deep-Dive Prompts..."

# Check if L1 findings exist
if [[ ! -f "${L1_DIR}/agentic-findings.md" ]]; then
    echo "❌ Level 1 findings not found. Please complete Level 1 research first."
    exit 1
fi

mkdir -p "$L2_DIR"

# Extract key findings from L1 results
echo "Analyzing Level 1 findings..."

# This would need manual implementation based on actual L1 results
echo "📋 Manual L2 prompt generation required:"
echo "1. Review L1 findings for high-impact patterns"
echo "2. Create specific deep-dive prompts for interesting discoveries"
echo "3. Focus on technical details affecting Kingly positioning"

echo "✅ Level 2 setup ready in: $L2_DIR"
EOF

chmod +x generate-level-2-prompts.sh

echo "✅ Level 2 prompt generator created"

# Final Instructions
echo ""
echo "🎯 EXECUTION SUMMARY"
echo "===================="
echo ""
echo "✅ **Repository downloads completed** - Check ${REPO_DIR}/findings/"
echo "✅ **Research prompts extracted** - Ready for manual execution"
echo "✅ **Research guide created** - See ${RESEARCH_DIR}/level-1-base/RESEARCH_GUIDE.md"
echo ""
echo "📋 **NEXT STEPS:**"
echo "1. **Execute Level 1 Research** (manual with Perplexity/Claude)"
echo "   - Use prompts in: ${RESEARCH_DIR}/level-1-base/prompts/"
echo "   - Save results as: ${RESEARCH_DIR}/level-1-base/{stream}-findings.md"
echo ""
echo "2. **Generate Level 2 Prompts** (after L1 complete)"
echo "   - Run: ./generate-level-2-prompts.sh"
echo ""
echo "3. **Repository Analysis** (parallel with research)"
echo "   - Analyze downloaded repos for competitive patterns"
echo ""
echo "4. **Synthesis & Deliverables** (after L2/L3 complete)"
echo "   - Founder blog post"
echo "   - Strategic recommendations"
echo "   - Technical manifesto"
echo ""
echo "🚀 **Ready to begin Level 1 research execution!**"