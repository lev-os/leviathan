#!/bin/bash

# Emerging AI Agent Framework Repository Download Script

set -e

DOWNLOAD_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../findings" && pwd)"
mkdir -p "${DOWNLOAD_DIR}/emerging-repos"

echo "🚀 Downloading Emerging AI Agent Framework Repositories..."

# Emerging Agent Frameworks
EMERGING_FRAMEWORKS=(
  "openai/swarm"
  "crewAI-Inc/crewAI"
  "microsoft/autogen" 
  "geekan/MetaGPT"
  "princeton-nlp/SWE-agent"
  "yoheinakajima/babyagi"
  "reworkd/AgentGPT"
  "TransformerOptimus/SuperAGI"
  "agiresearch/AIOS"
  "microsoft/JARVIS"
  "microsoft/TaskWeaver"
  "microsoft/semantic-kernel"
  "deepset-ai/haystack"
  "phidatahq/phidata"
  "letta-ai/letta"
)

# Local-First / Sovereignty-Focused
SOVEREIGNTY_REPOS=(
  "mudler/LocalAI"
  "ollama/ollama"
  "Mozilla-Ocho/llamafile"
  "lmstudio-ai/models"
  "ggerganov/llama.cpp"
  "huggingface/candle"
  "mlc-ai/mlc-llm"
  "nomic-ai/gpt4all"
  "NVIDIA/TensorRT-LLM"
  "vllm-project/vllm"
)

# Hackable / Simple Agent Systems
HACKABLE_REPOS=(
  "Significant-Gravitas/AutoGPT"
  "AntonOsika/gpt-engineer"
  "smol-ai/developer"
  "gpt-engineer-org/gpt-engineer"
  "paul-gauthier/aider"
  "Pythagora-io/gpt-pilot"
  "e2b-dev/fragments"
  "modal-labs/modal-examples"
  "vercel/ai"
  "BuilderIO/micro-agent"
)

# MCP and Tool Integration
MCP_ECOSYSTEM=(
  "modelcontextprotocol/servers"
  "modelcontextprotocol/python-sdk"
  "modelcontextprotocol/typescript-sdk"
  "punkpeye/awesome-mcp-servers"
  "adhiambovivian/mcp-server-sqlite"
  "ergut/mcp-server-git"
  "tumf/mcp-server-docker"
  "kimtaeyoon83/mcp-server-youtube-transcript"
  "adhiambovivian/mcp-server-fetch"
)

cd "${DOWNLOAD_DIR}/emerging-repos"

# Enhanced download function for emerging frameworks
download_emerging_repo() {
  local repo="$1"
  local category="$2"
  local dir_name=$(echo "$repo" | sed 's/\//-/g')
  
  echo "📥 Downloading $repo ($category)..."
  
  if git clone --depth=1 "https://github.com/${repo}.git" "$dir_name" 2>/dev/null; then
    echo "✅ Successfully downloaded $repo"
    
    cd "$dir_name"
    
    # Analyze for sovereignty patterns
    LOCAL_PATTERNS=$(find . -name "*.py" -o -name "*.ts" -o -name "*.js" -o -name "*.go" | xargs grep -l "local\|offline\|privacy\|self-hosted\|air.gap" 2>/dev/null | wc -l)
    
    # Check for MCP integration
    MCP_PATTERNS=$(find . -name "*.py" -o -name "*.ts" -o -name "*.js" | xargs grep -l "mcp\|model.context.protocol" 2>/dev/null | wc -l)
    
    # Performance indicators
    DIRECT_CALLS=$(find . -name "*.py" -o -name "*.ts" -o -name "*.js" | xargs grep -l "direct\|bypass\|fast\|performance" 2>/dev/null | wc -l)
    
    # YAML-first patterns
    YAML_CONFIG=$(find . -name "*.yaml" -o -name "*.yml" | wc -l)
    CONFIG_DRIVEN=$(find . -name "*.py" -o -name "*.ts" -o -name "*.js" | xargs grep -l "yaml\|config.driven\|declarative" 2>/dev/null | wc -l)
    
    # Stars and activity (if available)
    STARS=$(curl -s "https://api.github.com/repos/$repo" | jq '.stargazers_count // 0' 2>/dev/null || echo "0")
    
    cd ..
    
    # Create comprehensive analysis
    cat > "${dir_name}/emerging-analysis.json" << EOF
{
  "repo": "$repo",
  "category": "$category",
  "downloaded": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "commit": "$(cd "$dir_name" && git rev-parse HEAD)",
  "stars": $STARS,
  "total_files": $(find "$dir_name" -type f | wc -l),
  "local_first_patterns": $LOCAL_PATTERNS,
  "mcp_integration": $MCP_PATTERNS,
  "performance_focus": $DIRECT_CALLS,
  "yaml_configs": $YAML_CONFIG,
  "config_driven_patterns": $CONFIG_DRIVEN,
  "size_kb": $(du -sk "$dir_name" | cut -f1),
  "sovereignty_score": $(echo "scale=2; ($LOCAL_PATTERNS + $YAML_CONFIG) / 2" | bc -l 2>/dev/null || echo "0"),
  "hackability_score": $(echo "scale=2; ($CONFIG_DRIVEN + $YAML_CONFIG) / 2" | bc -l 2>/dev/null || echo "0")
}
EOF
  else
    echo "❌ Failed to download $repo"
  fi
}

# Download emerging frameworks
echo "🎯 Downloading Emerging Agent Frameworks..."
for repo in "${EMERGING_FRAMEWORKS[@]}"; do
  download_emerging_repo "$repo" "emerging_framework"
done

# Download sovereignty-focused repos
echo "🔒 Downloading Sovereignty-Focused Repositories..."
for repo in "${SOVEREIGNTY_REPOS[@]}"; do
  download_emerging_repo "$repo" "sovereignty"
done

# Download hackable systems
echo "🛠️ Downloading Hackable Agent Systems..."
for repo in "${HACKABLE_REPOS[@]}"; do
  download_emerging_repo "$repo" "hackable"
done

# Download MCP ecosystem
echo "🔌 Downloading MCP Ecosystem..."
for repo in "${MCP_ECOSYSTEM[@]}"; do
  download_emerging_repo "$repo" "mcp"
done

# Create comprehensive emerging frameworks summary
echo "📊 Creating Emerging Frameworks Analysis..."
cat > emerging-frameworks-summary.json << EOF
{
  "analysis_completed": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "categories": {
    "emerging_frameworks": ${#EMERGING_FRAMEWORKS[@]},
    "sovereignty_focused": ${#SOVEREIGNTY_REPOS[@]},
    "hackable_systems": ${#HACKABLE_REPOS[@]},
    "mcp_ecosystem": ${#MCP_ECOSYSTEM[@]}
  },
  "total_repos": $((${#EMERGING_FRAMEWORKS[@]} + ${#SOVEREIGNTY_REPOS[@]} + ${#HACKABLE_REPOS[@]} + ${#MCP_ECOSYSTEM[@]})),
  "total_size_mb": $(du -sm . | cut -f1),
  "successful_downloads": $(ls -d */ 2>/dev/null | wc -l),
  "high_sovereignty_repos": $(cat */emerging-analysis.json 2>/dev/null | jq -s 'map(select(.sovereignty_score > 1)) | length' 2>/dev/null || echo "0"),
  "high_hackability_repos": $(cat */emerging-analysis.json 2>/dev/null | jq -s 'map(select(.hackability_score > 1)) | length' 2>/dev/null || echo "0"),
  "mcp_integrated_repos": $(cat */emerging-analysis.json 2>/dev/null | jq -s 'map(select(.mcp_integration > 0)) | length' 2>/dev/null || echo "0"),
  "top_starred_repos": $(cat */emerging-analysis.json 2>/dev/null | jq -s 'sort_by(.stars) | reverse | .[0:5] | map({repo: .repo, stars: .stars})' 2>/dev/null || echo "[]")
}
EOF

echo "🎉 Emerging frameworks download complete!"
echo "📁 Downloaded $(ls -d */ 2>/dev/null | wc -l) repositories"
echo "💾 Total size: $(du -sh . | cut -f1)"
echo "🔒 High sovereignty repos: $(cat */emerging-analysis.json 2>/dev/null | jq -s 'map(select(.sovereignty_score > 1)) | length' 2>/dev/null || echo "0")"
echo "🛠️ High hackability repos: $(cat */emerging-analysis.json 2>/dev/null | jq -s 'map(select(.hackability_score > 1)) | length' 2>/dev/null || echo "0")"