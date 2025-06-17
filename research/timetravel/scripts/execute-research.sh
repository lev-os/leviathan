#!/bin/bash
# Research Execution Script - Simulates Kingly research workflow

# Load environment variables if .env exists
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"

if [ -f "$ENV_FILE" ]; then
  echo "📋 Loading API keys from .env file..."
  export $(cat "$ENV_FILE" | grep -v '^#' | grep -v '^\s*$' | xargs)
else
  echo "⚠️  Warning: No .env file found at $ENV_FILE"
  echo "   API-dependent features may not work properly"
fi

TOPIC="$1"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_FILE="outputs/research/${TOPIC//[^a-zA-Z0-9]/_}_${TIMESTAMP}.md"

# Create output directory if it doesn't exist
mkdir -p outputs/research

echo "🔬 Three-Tier Deep Research Workflow"
echo "===================================="
echo "Topic: $TOPIC"
echo "Started: $(date)"
echo "Output: $OUTPUT_FILE"
echo ""

# Log the execution
echo "## Research Execution: $TOPIC" >> execution-log.md
echo "**Timestamp**: $(date)" >> execution-log.md
echo "**Workflow**: @kingly/core/workflows/research/three-tier-deep" >> execution-log.md
echo "" >> execution-log.md

# STEP 1: Context Loading Simulation
echo "📊 STEP 1: Loading Contexts"
echo "==========================="
cat << EOF
✅ Loaded Agent: @kingly/core/agents/research/deep-researcher
✅ Loaded Workflow: @kingly/core/workflows/research/three-tier-deep  
✅ Loaded Pattern: @kingly/core/patterns/personality
✅ Loaded Tools: @kingly/core/tools/research/mcp-suite

Context Resolution:
- Agent Config: /digital/mcp-ceo/contexts/agents/research/deep-researcher/context.yaml
- Workflow Config: /digital/mcp-ceo/contexts/workflows/research/three-tier-deep/context.yaml
- Tool Suite: perplexity_ask, WebSearch, fetch_url, desktop_commander

EOF

# STEP 2: Execution Plan Display  
echo "📊 STEP 2: Execution Plan"
echo "========================"
cat << EOF
🎯 TIER 1 (30 min): Parallel Base Exploration
   Stream 1: Architecture Revolution (WebSearch, perplexity_ask)
   Stream 2: World Models (fetch_url, WebSearch) 
   Stream 3: Reasoning Evolution (WebSearch, desktop_commander)
   Stream 4: Efficiency Innovations (perplexity_ask, WebSearch)

🔍 TIER 2 (45 min): Dynamic Deep Dives  
   Generated from Tier 1 findings with >0.7 relevance
   Expected: 6-8 focused investigations
   
🎯 TIER 3 (30 min): Strategic Positioning
   Validation against Kingly/FlowMind objectives:
   - Competitive advantage opportunities
   - White space identification  
   - Technical differentiation potential
   - Implementation feasibility

🎭 PERSONALITY SYNTHESIS: Apply 8 perspectives
   sovereignty_architect, abundance_amplifier, visionary_pioneer,
   cortisol_guardian, strategic_commander, empathetic_connector,
   practical_builder, systems_thinker

📄 OUTPUT: $OUTPUT_FILE

EOF

# STEP 3: Execution Instruction for Claude
echo "🚀 STEP 3: Claude/Kingly Execution"
echo "=================================="
cat << EOF

🎯 CLAUDE INSTRUCTION:
Execute the above three-tier research plan for topic: "$TOPIC"

Use your available tools in this sequence:
1. Start with WebSearch for broad landscape scanning
2. Use perplexity_ask for specific technical details  
3. Use fetch_url for deep content analysis
4. Apply personality pattern analysis for 8 perspectives
5. Generate synthesis report in the specified output file

Follow the deep-researcher agent prompts and three-tier workflow exactly as defined in the contexts.

END OF SIMULATION - READY FOR CLAUDE EXECUTION
EOF

echo ""
echo "Research workflow simulation complete."
echo "Next: Claude should execute the actual research using the loaded contexts."