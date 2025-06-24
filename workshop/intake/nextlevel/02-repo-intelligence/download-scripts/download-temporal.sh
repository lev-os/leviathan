#!/bin/bash

# Temporal Workflow Orchestration Repository Download Script

set -e

DOWNLOAD_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../findings" && pwd)"
mkdir -p "${DOWNLOAD_DIR}/temporal-repos"

echo "⏰ Downloading Temporal Ecosystem Repositories..."

# Core Temporal Repositories
TEMPORAL_CORE=(
  "temporalio/temporal"
  "temporalio/sdk-typescript"
  "temporalio/sdk-python"
  "temporalio/sdk-go"
  "temporalio/sdk-java"
  "temporalio/samples-typescript"
  "temporalio/samples-python"
  "temporalio/samples-go"
  "temporalio/documentation"
  "temporalio/temporal-web"
  "temporalio/cli"
  "temporalio/docker-compose"
)

# Temporal AI/Agent Projects
TEMPORAL_AI_REPOS=(
  "temporalio/samples-ai"
  "temporalio/temporal-ai-samples"
  "cretz/temporal-ai-examples"
  "temporalio/background-check"
  "temporalio/money-transfer-project-template-typescript"
  "temporalio/ecommerce-web"
  "temporalio/temporal-polyglot"
  "temporalio/temporal-jumpstart-typescript"
  "temporalio/temporal-jumpstart-python"
)

# Community Temporal Projects
TEMPORAL_COMMUNITY=(
  "bergundy/temporal-pendulum"
  "temporalio/tcld"
  "temporalio/ui-server"
  "temporalio/temporal-aws-sdk"
  "temporalio/temporal-gcp-sdk"
  "firdaus/temporal-examples"
  "Quinn-With-Two-Ns/temporal-examples"
  "anthonywong/temporal-samples"
)

cd "${DOWNLOAD_DIR}/temporal-repos"

# Download function with Temporal-specific analysis
download_temporal_repo() {
  local repo="$1"
  local dir_name=$(echo "$repo" | sed 's/\//-/g')
  
  echo "📥 Downloading $repo..."
  
  if git clone --depth=1 "https://github.com/${repo}.git" "$dir_name" 2>/dev/null; then
    echo "✅ Successfully downloaded $repo"
    
    # Temporal-specific analysis
    cd "$dir_name"
    
    # Count workflow definitions
    WORKFLOW_FILES=$(find . -name "*.ts" -o -name "*.py" -o -name "*.go" | xargs grep -l "@workflow\|@WorkflowMethod\|workflow.defn" 2>/dev/null | wc -l)
    
    # Count activity definitions  
    ACTIVITY_FILES=$(find . -name "*.ts" -o -name "*.py" -o -name "*.go" | xargs grep -l "@activity\|@ActivityMethod\|activity.defn" 2>/dev/null | wc -l)
    
    # Check for AI/LLM patterns
    AI_PATTERNS=$(find . -name "*.ts" -o -name "*.py" -o -name "*.go" | xargs grep -l "openai\|anthropic\|llm\|agent\|embedding" 2>/dev/null | wc -l)
    
    cd ..
    
    # Create enhanced metadata
    cat > "${dir_name}/temporal-analysis.json" << EOF
{
  "repo": "$repo",
  "downloaded": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "commit": "$(cd "$dir_name" && git rev-parse HEAD)",
  "total_files": $(find "$dir_name" -type f | wc -l),
  "workflow_files": $WORKFLOW_FILES,
  "activity_files": $ACTIVITY_FILES,
  "ai_pattern_files": $AI_PATTERNS,
  "size_kb": $(du -sk "$dir_name" | cut -f1),
  "has_docker": $(test -f "$dir_name/Dockerfile" && echo "true" || echo "false"),
  "has_ai_examples": $(test $AI_PATTERNS -gt 0 && echo "true" || echo "false")
}
EOF
  else
    echo "❌ Failed to download $repo"
  fi
}

# Download core Temporal repos
echo "🎯 Downloading Core Temporal Repositories..."
for repo in "${TEMPORAL_CORE[@]}"; do
  download_temporal_repo "$repo"
done

# Download Temporal AI repos
echo "🤖 Downloading Temporal AI/Agent Repositories..."  
for repo in "${TEMPORAL_AI_REPOS[@]}"; do
  download_temporal_repo "$repo"
done

# Download community repos
echo "🌟 Downloading Temporal Community Repositories..."
for repo in "${TEMPORAL_COMMUNITY[@]}"; do
  download_temporal_repo "$repo"
done

# Create Temporal-specific summary
echo "📊 Creating Temporal Analysis Summary..."
cat > temporal-ecosystem-summary.json << EOF
{
  "analysis_completed": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "total_repos": $((${#TEMPORAL_CORE[@]} + ${#TEMPORAL_AI_REPOS[@]} + ${#TEMPORAL_COMMUNITY[@]})),
  "core_temporal": ${#TEMPORAL_CORE[@]},
  "ai_focused_repos": ${#TEMPORAL_AI_REPOS[@]},
  "community_repos": ${#TEMPORAL_COMMUNITY[@]},
  "total_size_mb": $(du -sm . | cut -f1),
  "successful_downloads": $(ls -d */ 2>/dev/null | wc -l),
  "total_workflows": $(cat */temporal-analysis.json 2>/dev/null | jq -s 'map(.workflow_files) | add'),
  "total_activities": $(cat */temporal-analysis.json 2>/dev/null | jq -s 'map(.activity_files) | add'),
  "ai_enabled_repos": $(cat */temporal-analysis.json 2>/dev/null | jq -s 'map(select(.has_ai_examples == true)) | length')
}
EOF

echo "🎉 Temporal ecosystem download complete!"
echo "📁 Downloaded $(ls -d */ 2>/dev/null | wc -l) repositories"
echo "💾 Total size: $(du -sh . | cut -f1)"
echo "🤖 AI-enabled repos: $(cat */temporal-analysis.json 2>/dev/null | jq -s 'map(select(.has_ai_examples == true)) | length' 2>/dev/null || echo "0")"