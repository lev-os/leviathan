#!/bin/bash

# Download Bleeding-Edge AI Tools - Top Innovation Targets
# Based on discovery research prioritizing 9-10 innovation score projects

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOOLS_DIR="${PROJECT_DIR}/bleeding-edge-repositories"

echo "🚀 BLEEDING-EDGE AI TOOLS DOWNLOAD"
echo "=================================="
echo "Downloading 25 experimental projects with innovation scores 7-10"

# Create tools directory
mkdir -p "$TOOLS_DIR"
cd "$TOOLS_DIR"

echo ""
echo "📦 Downloading Revolutionary Projects (Innovation Score 9-10)..."

# Revolutionary Paradigm Projects
echo "1. Downloading LMQL - Query Language for LLMs..."
git clone --depth=1 https://github.com/eth-sri/lmql.git || echo "⚠️ LMQL clone failed"

echo "2. Downloading ChainGPT - Decentralized AI Agent Network..."
git clone --depth=1 https://github.com/ChainGPT/chaingpt.git || echo "⚠️ ChainGPT clone failed"

echo "3. Downloading Twin-Server - P2P Agent Coordination..."
git clone --depth=1 https://github.com/tebbes/twin-server.git || echo "⚠️ Twin-Server clone failed"

echo "4. Downloading Llama.cpp - Base for Swarm Modifications..."
git clone --depth=1 https://github.com/ggerganov/llama.cpp.git || echo "⚠️ Llama.cpp clone failed"

echo ""
echo "📦 Downloading High-Innovation Projects (Innovation Score 8)..."

# High Innovation Score Projects
echo "5. Downloading OSLlama - Unix Philosophy LLM..."
git clone --depth=1 https://github.com/donomii/osllama.git || echo "⚠️ OSLlama clone failed"

echo "6. Downloading Minichain - Embeddable Edge LLM..."
git clone --depth=1 https://github.com/aidangomez/minichain.git || echo "⚠️ Minichain clone failed"

echo "7. Downloading OCD-AI - Event-Driven Orchestration..."
git clone --depth=1 https://github.com/jeffreytse/ocd-ai.git || echo "⚠️ OCD-AI clone failed"

echo "8. Downloading Swarmflow - Emergent Intelligence..."
git clone --depth=1 https://github.com/zph/swarmflow.git || echo "⚠️ Swarmflow clone failed"

echo "9. Downloading Runebook Tome - Local MCP Manager..."
git clone --depth=1 https://github.com/runebookai/tome.git || echo "⚠️ Tome clone failed"

echo "10. Downloading Twenty - Edge AI Coordination..."
git clone --depth=1 https://github.com/epfml/20.git || echo "⚠️ Twenty clone failed"

echo "11. Downloading LLM-Chain - Type-Safe Pipelines..."
git clone --depth=1 https://github.com/samber/llm-chain.git || echo "⚠️ LLM-Chain clone failed"

echo "12. Downloading Agent-Protocol - Multi-Agent Protocol..."
git clone --depth=1 https://github.com/Conner1115/agent-protocol.git || echo "⚠️ Agent-Protocol clone failed"

echo "13. Downloading LLM-Swarm - Collective Intelligence..."
git clone --depth=1 https://github.com/smol-ai/llm-swarm.git || echo "⚠️ LLM-Swarm clone failed"

echo "14. Downloading Self-Hosted-GPT - Air-Gapped Sovereignty..."
git clone --depth=1 https://github.com/stiankn/self-hosted-gpt.git || echo "⚠️ Self-Hosted-GPT clone failed"

echo ""
echo "📦 Downloading MCP & Infrastructure Projects (Innovation Score 7-8)..."

# MCP and Infrastructure Projects
echo "15. Downloading Model Context Protocol Servers..."
git clone --depth=1 https://github.com/modelcontextprotocol/servers.git || echo "⚠️ MCP Servers clone failed"

echo "16. Downloading Awesome MCP Servers..."
git clone --depth=1 https://github.com/punkpeye/awesome-mcp-servers.git || echo "⚠️ Awesome MCP clone failed"

echo "17. Downloading OpenDevin - Autonomous Dev Agent..."
if [[ ! -d "OpenDevin" ]]; then
    git clone --depth=1 https://github.com/OpenDevin/OpenDevin.git || echo "⚠️ OpenDevin clone failed"
else
    echo "✅ OpenDevin already exists"
fi

echo "18. Downloading Open-WebUI - Local LLM Interface..."
git clone --depth=1 https://github.com/open-webui/open-webui.git || echo "⚠️ Open-WebUI clone failed"

echo "19. Downloading Dify - Self-Hosted LLMOps..."
git clone --depth=1 https://github.com/langgenius/dify.git || echo "⚠️ Dify clone failed"

echo "20. Downloading AI-CLI - Command Line Interface..."
git clone --depth=1 https://github.com/abhagsain/ai-cli.git || echo "⚠️ AI-CLI clone failed"

echo "21. Downloading LangChain4j - JVM AI Orchestration..."
git clone --depth=1 https://github.com/langchain4j/langchain4j.git || echo "⚠️ LangChain4j clone failed"

echo "22. Downloading Llama-Node - JavaScript Backend..."
git clone --depth=1 https://github.com/wordcab/llama-node.git || echo "⚠️ Llama-Node clone failed"

echo "23. Downloading MQTT-LLM-Gateway - IoT Bridge..."
git clone --depth=1 https://github.com/norbertbede/mqtt-llm-gateway.git || echo "⚠️ MQTT-Gateway clone failed"

echo "24. Downloading Apify Tester MCP Client..."
git clone --depth=1 https://github.com/apify/tester-mcp-client.git || echo "⚠️ Tester Client clone failed"

echo "25. Downloading Alternative MCP Curation..."
git clone --depth=1 https://github.com/appcypher/awesome-mcp-servers.git appcypher-mcp-servers || echo "⚠️ Alternative MCP clone failed"

echo ""
echo "📊 Download Summary..."

# Generate download summary
echo "=== DOWNLOAD SUMMARY ==="
total_repos=0
total_size=0

for dir in */; do
    if [[ -d "$dir" ]]; then
        repo_name=$(basename "$dir")
        file_count=$(find "$dir" -type f | wc -l)
        size_mb=$(du -sm "$dir" | cut -f1)
        total_repos=$((total_repos + 1))
        total_size=$((total_size + size_mb))
        echo "✅ $repo_name: $file_count files, ${size_mb}MB"
    fi
done

echo ""
echo "📈 Total Statistics:"
echo "🗂️  Repositories: $total_repos"
echo "💾 Total Size: ${total_size}MB"
echo "🎯 Innovation Focus: Revolutionary paradigms, P2P coordination, local-first architecture"

echo ""
echo "📁 All repositories downloaded to: $TOOLS_DIR"
echo ""
echo "🔍 Next Steps:"
echo "1. Run innovation validation: ./validate-innovation.sh"
echo "2. Generate technical analysis: ./analyze-bleeding-edge.sh"  
echo "3. Extract patterns: ./extract-patterns.sh"
echo "4. Create strategic synthesis: ./synthesize-insights.sh"

echo ""
echo "🎉 Bleeding-edge download complete! Ready for comprehensive innovation analysis."