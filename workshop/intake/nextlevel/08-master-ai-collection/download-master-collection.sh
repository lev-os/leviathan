#!/bin/bash

# MASTER AI COLLECTION DOWNLOAD SCRIPT
# Downloads 35+ AI/ML repositories organized by strategic priority

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 MASTER AI COLLECTION DOWNLOAD"
echo "================================="
echo "Downloading 35+ AI/ML repositories across 4 priority tiers"
echo ""

# =============================================================================
# TIER 1: REVOLUTIONARY (Must Download)
# =============================================================================
echo "🔥 TIER 1: REVOLUTIONARY REPOSITORIES"
echo "====================================="
cd "$PROJECT_DIR/tier-1-revolutionary"

echo "1. DeepSeek-R1 - 671B parameter reasoning model..."
git clone --depth=1 https://github.com/deepseek-ai/DeepSeek-R1.git || echo "⚠️ DeepSeek-R1 clone failed"

echo "2. HuggingFace Open-R1 - Open reproduction..."
git clone --depth=1 https://github.com/huggingface/open-r1.git || echo "⚠️ Open-R1 clone failed"

echo "3. MiniCPM-o 2.6 - Mobile GPT-4o level..."
git clone --depth=1 https://github.com/OpenBMB/MiniCPM-o.git || echo "⚠️ MiniCPM-o clone failed"

echo "4. Anything-LLM - All-in-one platform..."
git clone --depth=1 https://github.com/Mintplex-Labs/anything-llm.git || echo "⚠️ Anything-LLM clone failed"

echo "5. TensorZero - LLM optimization..."
git clone --depth=1 https://github.com/tensorzero/tensorzero.git || echo "⚠️ TensorZero clone failed"

echo "6. AI PR Watcher - Performance tracking..."
git clone --depth=1 https://github.com/aavetis/ai-pr-watcher.git || echo "⚠️ AI PR Watcher clone failed"

echo ""

# =============================================================================
# TIER 2: STRATEGIC ANALYSIS
# =============================================================================
echo "🎯 TIER 2: STRATEGIC ANALYSIS"
echo "=============================="
cd "$PROJECT_DIR/tier-2-strategic"

echo "7. Devika AI - AI software engineer..."
git clone --depth=1 https://github.com/stitionai/devika.git || echo "⚠️ Devika clone failed"

echo "8. AutoGPT - Semi-autonomous agent..."
git clone --depth=1 https://github.com/Significant-Gravitas/AutoGPT.git || echo "⚠️ AutoGPT clone failed"

echo "9. OpenDevin - Autonomous dev agent..."
if [[ ! -d "OpenDevin" ]]; then
    git clone --depth=1 https://github.com/OpenDevin/OpenDevin.git || echo "⚠️ OpenDevin clone failed"
else
    echo "✅ OpenDevin already exists"
fi

echo "10. Dify - Agentic AI platform..."
if [[ ! -d "dify" ]]; then
    git clone --depth=1 https://github.com/langgenius/dify.git || echo "⚠️ Dify clone failed"
else
    echo "✅ Dify already exists"
fi

echo "11. Agent-LLM - Privacy-focused agents..."
git clone --depth=1 https://github.com/Josh-XT/Agent-LLM.git || echo "⚠️ Agent-LLM clone failed"

echo "12. CrewAI - Multi-agent collaboration..."
git clone --depth=1 https://github.com/joaomdmoura/crewAI.git || echo "⚠️ CrewAI clone failed"

echo "13. SuperAGI - Advanced AGI platform..."
git clone --depth=1 https://github.com/TransformerOptimus/SuperAGI.git || echo "⚠️ SuperAGI clone failed"

echo "14. MetaGPT - Multi-agent software company..."
git clone --depth=1 https://github.com/geekan/MetaGPT.git || echo "⚠️ MetaGPT clone failed"

echo "15. BabyAGI - Simple AGI prototype..."
git clone --depth=1 https://github.com/yoheinakajima/babyagi.git || echo "⚠️ BabyAGI clone failed"

echo "16. SWE-agent - Software engineering agent..."
git clone --depth=1 https://github.com/princeton-nlp/SWE-agent.git || echo "⚠️ SWE-agent clone failed"

echo ""# =============================================================================
# TIER 3: ARCHITECTURE STUDY  
# =============================================================================
echo "🏗️ TIER 3: ARCHITECTURE STUDY"
echo "==============================="
cd "$PROJECT_DIR/tier-3-architecture"

echo "17. LMQL - Query language for LLMs..."
if [[ ! -d "lmql" ]]; then
    git clone --depth=1 https://github.com/eth-sri/lmql.git || echo "⚠️ LMQL clone failed"
else
    echo "✅ LMQL already exists"
fi

echo "18. LangChain - Python LLM framework..."
if [[ ! -d "langchain" ]]; then
    git clone --depth=1 https://github.com/langchain-ai/langchain.git || echo "⚠️ LangChain clone failed"
else
    echo "✅ LangChain already exists"
fi

echo "19. LangGraph - Graph-based workflows..."
git clone --depth=1 https://github.com/langchain-ai/langgraph.git || echo "⚠️ LangGraph clone failed"

echo "20. LangChain4j - Java implementation..."
if [[ ! -d "langchain4j" ]]; then
    git clone --depth=1 https://github.com/langchain4j/langchain4j.git || echo "⚠️ LangChain4j clone failed"
else
    echo "✅ LangChain4j already exists"
fi

echo "21. LangChain Rust - Rust implementation..."
git clone --depth=1 https://github.com/Abraxas-365/langchain-rust.git || echo "⚠️ LangChain Rust clone failed"

echo "22. Llama.cpp - C++ LLM inference..."
if [[ ! -d "llama.cpp" ]]; then
    git clone --depth=1 https://github.com/ggerganov/llama.cpp.git || echo "⚠️ Llama.cpp clone failed"
else
    echo "✅ Llama.cpp already exists"
fi

echo "23. Ollama - Local LLM runner..."
git clone --depth=1 https://github.com/ollama/ollama.git || echo "⚠️ Ollama clone failed"

echo "24. LocalAI - OpenAI-compatible local..."
git clone --depth=1 https://github.com/mudler/LocalAI.git || echo "⚠️ LocalAI clone failed"

echo "25. PrivateGPT - Privacy-focused inference..."
git clone --depth=1 https://github.com/imartinez/privateGPT.git || echo "⚠️ PrivateGPT clone failed"

echo "26. Open-WebUI - Local LLM interface..."
if [[ ! -d "open-webui" ]]; then
    git clone --depth=1 https://github.com/open-webui/open-webui.git || echo "⚠️ Open-WebUI clone failed"
else
    echo "✅ Open-WebUI already exists"
fi

echo "27. Tome - Local MCP manager..."
if [[ ! -d "tome" ]]; then
    git clone --depth=1 https://github.com/runebookai/tome.git || echo "⚠️ Tome clone failed"
else
    echo "✅ Tome already exists"
fi

echo "28. MCP Servers - Official implementations..."
if [[ ! -d "servers" ]]; then
    git clone --depth=1 https://github.com/modelcontextprotocol/servers.git || echo "⚠️ MCP Servers clone failed"
else
    echo "✅ MCP Servers already exists"
fi

echo ""

# =============================================================================
# TIER 4: COLLECTIONS & REFERENCE
# =============================================================================
echo "📚 TIER 4: COLLECTIONS & REFERENCE"
echo "==================================="
cd "$PROJECT_DIR/tier-4-collections"

echo "29. Awesome-LLM - Curated LLM resources..."
git clone --depth=1 https://github.com/Hannibal046/Awesome-LLM.git || echo "⚠️ Awesome-LLM clone failed"

echo "30. Awesome Data Science - Data science resources..."
git clone --depth=1 https://github.com/academic/awesome-datascience.git || echo "⚠️ Awesome Data Science clone failed"

echo "31. Trending Deep Learning - Top 100 trending..."
git clone --depth=1 https://github.com/mbadry1/Trending-Deep-Learning.git || echo "⚠️ Trending Deep Learning clone failed"

echo "32. Build-Your-Own-X - Learning by building..."
git clone --depth=1 https://github.com/codecrafters-io/build-your-own-x.git || echo "⚠️ Build-Your-Own-X clone failed"

echo "33. End-to-End Gen AI - Industry projects..."
git clone --depth=1 https://github.com/GURPREETKAURJETHRA/END-TO-END-GENERATIVE-AI-PROJECTS.git || echo "⚠️ Gen AI Projects clone failed"

echo "34. Lightning PyTorch - ML framework..."
git clone --depth=1 https://github.com/Lightning-AI/lightning.git || echo "⚠️ Lightning clone failed"

echo "35. Repomix - Repo to LLM format..."
git clone --depth=1 https://github.com/yamadashy/repomix.git || echo "⚠️ Repomix clone failed"

echo ""

# =============================================================================
# DOWNLOAD SUMMARY
# =============================================================================
echo "📊 DOWNLOAD SUMMARY"
echo "==================="

cd "$PROJECT_DIR"

# Count repositories in each tier
tier1_count=$(find tier-1-revolutionary -mindepth 1 -maxdepth 1 -type d | wc -l)
tier2_count=$(find tier-2-strategic -mindepth 1 -maxdepth 1 -type d | wc -l)
tier3_count=$(find tier-3-architecture -mindepth 1 -maxdepth 1 -type d | wc -l)
tier4_count=$(find tier-4-collections -mindepth 1 -maxdepth 1 -type d | wc -l)
total_count=$((tier1_count + tier2_count + tier3_count + tier4_count))

echo "✅ Tier 1 Revolutionary: $tier1_count repositories"
echo "✅ Tier 2 Strategic: $tier2_count repositories"  
echo "✅ Tier 3 Architecture: $tier3_count repositories"
echo "✅ Tier 4 Collections: $tier4_count repositories"
echo ""
echo "🎯 Total Downloaded: $total_count repositories"

# Calculate total size
total_size=$(du -sh . | cut -f1)
echo "💾 Total Size: $total_size"

echo ""
echo "🔍 Next Steps:"
echo "1. Run analysis script: ./analyze-master-collection.sh"
echo "2. Generate strategic report: ./generate-master-report.sh"
echo "3. Extract integration patterns: ./extract-patterns.sh"

echo ""
echo "🎉 Master AI Collection download complete!"
echo "📁 Location: $PROJECT_DIR"