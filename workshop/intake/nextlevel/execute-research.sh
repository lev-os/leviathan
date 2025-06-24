#!/bin/bash

# NEXTLEVEL RESEARCH EXECUTION SCRIPT
# Spawns Claude Code processes for recursive research

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTEXT_DIR="${PROJECT_DIR}/00-project-context"
RESEARCH_DIR="${PROJECT_DIR}/01-research-execution"
REPO_DIR="${PROJECT_DIR}/02-repo-intelligence"

echo "🚀 NEXTLEVEL RESEARCH PROJECT EXECUTION"
echo "========================================"

# Phase 1: Level 1 Base Research (Parallel)
echo "📊 Phase 1: Launching Level 1 Research Streams..."

# Stream 1: Agentic Architecture Intelligence
claude-code \
  --spawn "agentic-research" \
  --prompt "$(cat ${CONTEXT_DIR}/meta-prompts-library.md | grep -A 20 'RESEARCH_PROMPT_L1_AGENTIC')" \
  --output "${RESEARCH_DIR}/level-1-base/agentic-findings.md" &

# Stream 2: Post-Agentic Paradigm Analysis  
claude-code \
  --spawn "robotics-research" \
  --prompt "$(cat ${CONTEXT_DIR}/meta-prompts-library.md | grep -A 20 'RESEARCH_PROMPT_L1_ROBOTICS')" \
  --output "${RESEARCH_DIR}/level-1-base/robotics-findings.md" &

# Stream 3: Hacker Sovereignty Movement
claude-code \
  --spawn "hackers-research" \
  --prompt "$(cat ${CONTEXT_DIR}/meta-prompts-library.md | grep -A 20 'RESEARCH_PROMPT_L1_HACKERS')" \
  --output "${RESEARCH_DIR}/level-1-base/hackers-findings.md" &

# Stream 4: Enterprise vs Sovereignty Battle
claude-code \
  --spawn "enterprise-research" \
  --prompt "$(cat ${CONTEXT_DIR}/meta-prompts-library.md | grep -A 20 'RESEARCH_PROMPT_L1_ENTERPRISE')" \
  --output "${RESEARCH_DIR}/level-1-base/enterprise-findings.md" &

# Parallel Repository Downloads
echo "📦 Launching Repository Downloads..."

# LangChain Ecosystem
claude-code \
  --spawn "langchain-download" \
  --script "${REPO_DIR}/download-scripts/download-langchain.sh" &

# Temporal Repos
claude-code \
  --spawn "temporal-download" \
  --script "${REPO_DIR}/download-scripts/download-temporal.sh" &

# Emerging Frameworks
claude-code \
  --spawn "emerging-download" \
  --script "${REPO_DIR}/download-scripts/download-emerging.sh" &

echo "⏳ Waiting for Level 1 research to complete..."
wait

# Phase 2: Dynamic Level 2 Generation
echo "🔍 Phase 2: Analyzing Level 1 results and generating Level 2 prompts..."

# Extract key findings from Level 1
KEY_FINDINGS=$(cat ${RESEARCH_DIR}/level-1-base/*.md | \
  grep -E "(Pattern Name|Key Innovation|Core Innovation)" | \
  head -20)

echo "📋 Key findings identified: $(echo "$KEY_FINDINGS" | wc -l) patterns"

# Generate Level 2 prompts dynamically
python3 ${PROJECT_DIR}/generate-level2-prompts.py \
  --input "${RESEARCH_DIR}/level-1-base/" \
  --output "${RESEARCH_DIR}/level-2-deep/" \
  --template "${CONTEXT_DIR}/meta-prompts-library.md"

# Launch Level 2 Research Streams
echo "🎯 Launching Level 2 Deep-Dive Research..."

for prompt_file in ${RESEARCH_DIR}/level-2-deep/prompt-*.md; do
  if [[ -f "$prompt_file" ]]; then
    output_file="${prompt_file/prompt-/analysis-}"
    claude-code \
      --spawn "level2-$(basename $prompt_file .md)" \
      --prompt "$(cat $prompt_file)" \
      --output "$output_file" &
  fi
done

wait

# Phase 3: Level 3 Validation
echo "✅ Phase 3: Launching Level 3 Competitive Validation..."

# Comprehensive results input
COMPREHENSIVE_RESULTS="${RESEARCH_DIR}/level-1-base/*.md ${RESEARCH_DIR}/level-2-deep/analysis-*.md"

# White Space Analysis
claude-code \
  --spawn "whitespace-analysis" \
  --prompt "$(cat ${CONTEXT_DIR}/meta-prompts-library.md | grep -A 15 'RESEARCH_PROMPT_L3_WHITESPACE')" \
  --input "${COMPREHENSIVE_RESULTS}" \
  --output "${RESEARCH_DIR}/level-3-validation/whitespace-analysis.md" &

# Advantage Validation
claude-code \
  --spawn "advantage-validation" \
  --prompt "$(cat ${CONTEXT_DIR}/meta-prompts-library.md | grep -A 15 'RESEARCH_PROMPT_L3_ADVANTAGES')" \
  --input "${COMPREHENSIVE_RESULTS}" \
  --output "${RESEARCH_DIR}/level-3-validation/advantage-validation.md" &

# Technical Roadmap Input
claude-code \
  --spawn "roadmap-analysis" \
  --prompt "$(cat ${CONTEXT_DIR}/meta-prompts-library.md | grep -A 15 'RESEARCH_PROMPT_L3_ROADMAP')" \
  --input "${COMPREHENSIVE_RESULTS}" \
  --output "${RESEARCH_DIR}/level-3-validation/roadmap-analysis.md" &

wait

# Phase 4: Synthesis and Deliverables
echo "📝 Phase 4: Creating Strategic Synthesis and Deliverables..."

# Pattern Synthesis
claude-code \
  --spawn "pattern-synthesis" \
  --script "${PROJECT_DIR}/synthesize-patterns.sh" \
  --input "${RESEARCH_DIR}/**/*.md" \
  --output "${PROJECT_DIR}/03-synthesis/pattern-extraction.md" &

# Founder Blog Post
claude-code \
  --spawn "blog-writing" \
  --script "${PROJECT_DIR}/write-founder-blog.sh" \
  --input "${PROJECT_DIR}/03-synthesis/" \
  --output "${PROJECT_DIR}/04-deliverables/founder-blog-post.md" &

# Strategic Recommendations  
claude-code \
  --spawn "strategic-recommendations" \
  --script "${PROJECT_DIR}/create-recommendations.sh" \
  --input "${RESEARCH_DIR}/level-3-validation/" \
  --output "${PROJECT_DIR}/04-deliverables/strategic-recommendations.md" &

wait

echo "🎉 NEXTLEVEL Research Project Complete!"
echo "📋 Results available in:"
echo "   - 03-synthesis/ (Pattern analysis)"
echo "   - 04-deliverables/ (Blog post, recommendations)"
echo "   - 01-research-execution/ (Raw research data)"
echo "   - 02-repo-intelligence/ (Repository analysis)"

# Final summary
echo "📊 Research Summary:"
echo "   Level 1 findings: $(ls ${RESEARCH_DIR}/level-1-base/*.md | wc -l) streams"
echo "   Level 2 analyses: $(ls ${RESEARCH_DIR}/level-2-deep/analysis-*.md 2>/dev/null | wc -l) deep-dives"  
echo "   Level 3 validations: $(ls ${RESEARCH_DIR}/level-3-validation/*.md 2>/dev/null | wc -l) validations"
echo "   Repository analyses: $(ls ${REPO_DIR}/findings/*.md 2>/dev/null | wc -l) repo studies"