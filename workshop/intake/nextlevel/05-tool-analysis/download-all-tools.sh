#!/bin/bash

# Download All AI Tools for Comprehensive Analysis
# Based on NEXTLEVEL research findings

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOOLS_DIR="${PROJECT_DIR}/repositories"

echo "🔧 COMPREHENSIVE AI TOOLS DOWNLOAD"
echo "=================================="

# Create tools directory
mkdir -p "$TOOLS_DIR"
cd "$TOOLS_DIR"

echo "📦 Downloading Tier 1: Core Sovereignty Tools..."

# Tier 1: Core Sovereignty Tools
echo "1. Downloading Ollama..."
git clone --depth=1 https://github.com/ollama/ollama.git || echo "⚠️ Ollama clone failed"

echo "2. Downloading LocalAI..."
git clone --depth=1 https://github.com/mudler/LocalAI.git || echo "⚠️ LocalAI clone failed"

echo "3. Downloading PrivateGPT..."
git clone --depth=1 https://github.com/imartinez/privateGPT.git || echo "⚠️ PrivateGPT clone failed"

echo "4. Downloading Agent-LLM..."
git clone --depth=1 https://github.com/Josh-XT/Agent-LLM.git || echo "⚠️ Agent-LLM clone failed"

echo "5. Downloading OpenDevin..."
git clone --depth=1 https://github.com/OpenDevin/OpenDevin.git || echo "⚠️ OpenDevin clone failed"

echo ""
echo "📦 Downloading Tier 2: Multi-Agent Frameworks..."

# Tier 2: Multi-Agent Frameworks
echo "6. Downloading AutoGen..."
git clone --depth=1 https://github.com/microsoft/autogen.git || echo "⚠️ AutoGen clone failed"

echo "7. Downloading CrewAI..."
git clone --depth=1 https://github.com/joaomdmoura/crewAI.git || echo "⚠️ CrewAI clone failed"

echo "8. Downloading SuperAGI..."
git clone --depth=1 https://github.com/TransformerOptimus/SuperAGI.git || echo "⚠️ SuperAGI clone failed"

echo "9. Downloading MetaGPT..."
git clone --depth=1 https://github.com/geekan/MetaGPT.git || echo "⚠️ MetaGPT clone failed"

echo "10. Downloading OpenAI Swarm..."
git clone --depth=1 https://github.com/openai/swarm.git || echo "⚠️ Swarm clone failed"

echo ""
echo "📦 Downloading Tier 3: Enterprise Competitive Analysis..."

# Tier 3: Enterprise Platforms (if not already downloaded)
echo "11. Downloading LangChain..."
if [[ ! -d "langchain" ]]; then
    git clone --depth=1 https://github.com/langchain-ai/langchain.git || echo "⚠️ LangChain clone failed"
else
    echo "✅ LangChain already exists"
fi

echo "12. Downloading LangGraph..."
git clone --depth=1 https://github.com/langchain-ai/langgraph.git || echo "⚠️ LangGraph clone failed"

echo "13. Downloading Temporal..."
if [[ ! -d "temporal" ]]; then
    git clone --depth=1 https://github.com/temporalio/temporal.git || echo "⚠️ Temporal clone failed"
else
    echo "✅ Temporal already exists"
fi

echo "14. Downloading Semantic Kernel..."
git clone --depth=1 https://github.com/microsoft/semantic-kernel.git || echo "⚠️ Semantic Kernel clone failed"

echo ""
echo "📦 Downloading Tier 4: Research/Experimental..."

# Tier 4: Research/Experimental  
echo "15. Downloading SWE-agent..."
git clone --depth=1 https://github.com/princeton-nlp/SWE-agent.git || echo "⚠️ SWE-agent clone failed"

echo "16. Downloading AIOS..."
git clone --depth=1 https://github.com/agiresearch/AIOS.git || echo "⚠️ AIOS clone failed"

echo "17. Downloading BabyAGI..."
git clone --depth=1 https://github.com/yoheinakajima/babyagi.git || echo "⚠️ BabyAGI clone failed"

echo "18. Downloading TaskWeaver..."
git clone --depth=1 https://github.com/microsoft/TaskWeaver.git || echo "⚠️ TaskWeaver clone failed"

echo "19. Downloading JARVIS..."
git clone --depth=1 https://github.com/microsoft/JARVIS.git || echo "⚠️ JARVIS clone failed"

echo "20. Downloading AgentGPT..."
git clone --depth=1 https://github.com/reworkd/AgentGPT.git || echo "⚠️ AgentGPT clone failed"

echo ""
echo "📊 Download Summary..."

# Generate download summary
echo "=== DOWNLOAD SUMMARY ==="
for dir in */; do
    if [[ -d "$dir" ]]; then
        repo_name=$(basename "$dir")
        file_count=$(find "$dir" -type f | wc -l)
        size=$(du -sh "$dir" | cut -f1)
        echo "✅ $repo_name: $file_count files, $size"
    fi
done

echo ""
echo "📁 All repositories downloaded to: $TOOLS_DIR"
echo ""
echo "🔍 Next Steps:"
echo "1. Run analysis script: ./analyze-tools.sh"
echo "2. Generate comparison matrices: ./compare-architectures.sh"  
echo "3. Extract integration patterns: ./extract-patterns.sh"

echo ""
echo "🎉 Download complete! Ready for comprehensive analysis."