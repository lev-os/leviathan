#!/bin/bash

# LangChain Ecosystem Repository Download Script

set -e

DOWNLOAD_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../findings" && pwd)"
mkdir -p "${DOWNLOAD_DIR}/langchain-repos"

echo "📦 Downloading LangChain Ecosystem Repositories..."

# Core LangChain Repositories
LANGCHAIN_REPOS=(
  "langchain-ai/langchain"
  "langchain-ai/langchain-core"  
  "langchain-ai/langchain-community"
  "langchain-ai/langchain-experimental"
  "langchain-ai/langgraph"
  "langchain-ai/langsmith-sdk"
  "langchain-ai/langchain-benchmarks"
  "langchain-ai/langchain-aws"
  "langchain-ai/langchain-google"
  "langchain-ai/langchain-openai"
  "langchain-ai/langchain-anthropic"
  "langchain-ai/langchain-mistral"
  "langchain-ai/opengpts"
  "langchain-ai/chat-langchain"
  "langchain-ai/langchain-academy"
)

# High-Value LangChain Projects  
COMMUNITY_REPOS=(
  "run-llama/llama_index"
  "microsoft/autogen" 
  "crewAI-Inc/crewAI"
  "microsoft/semantic-kernel"
  "Significant-Gravitas/AutoGPT"
  "reworkd/AgentGPT"
  "TransformerOptimus/SuperAGI"
  "ShishirPatil/gorilla"
  "guidance-ai/guidance"
  "hwchase17/langchain-hub"
  "langchain-ai/langserve"
  "langchain-ai/langchain-nextjs-template"
  "langchain-ai/streamlit-agent"
  "langchain-ai/langchain-extract"
  "microsoft/promptflow"
)

cd "${DOWNLOAD_DIR}/langchain-repos"

# Download function with error handling
download_repo() {
  local repo="$1"
  local dir_name=$(echo "$repo" | sed 's/\//-/g')
  
  echo "📥 Downloading $repo..."
  
  if git clone --depth=1 "https://github.com/${repo}.git" "$dir_name" 2>/dev/null; then
    echo "✅ Successfully downloaded $repo"
    
    # Create analysis metadata
    cat > "${dir_name}/repo-metadata.json" << EOF
{
  "repo": "$repo",
  "downloaded": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "commit": "$(cd "$dir_name" && git rev-parse HEAD)",
  "files": $(find "$dir_name" -type f | wc -l),
  "size_kb": $(du -sk "$dir_name" | cut -f1)
}
EOF
  else
    echo "❌ Failed to download $repo"
  fi
}

# Download core LangChain repos
echo "🎯 Downloading Core LangChain Repositories..."
for repo in "${LANGCHAIN_REPOS[@]}"; do
  download_repo "$repo"
done

# Download community repos  
echo "🌟 Downloading High-Value Community Repositories..."
for repo in "${COMMUNITY_REPOS[@]}"; do
  download_repo "$repo"
done

# Create summary
echo "📊 Creating Download Summary..."
cat > download-summary.json << EOF
{
  "download_completed": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "total_repos": $((${#LANGCHAIN_REPOS[@]} + ${#COMMUNITY_REPOS[@]})),
  "core_langchain": ${#LANGCHAIN_REPOS[@]},
  "community_repos": ${#COMMUNITY_REPOS[@]},
  "total_size_mb": $(du -sm . | cut -f1),
  "successful_downloads": $(ls -d */ 2>/dev/null | wc -l)
}
EOF

echo "🎉 LangChain ecosystem download complete!"
echo "📁 Downloaded $(ls -d */ 2>/dev/null | wc -l) repositories"
echo "💾 Total size: $(du -sh . | cut -f1)"