#!/bin/bash
# Strategic Research Script - Enhanced TimeTravel research with multi-horizon analysis
# Integrates strategic methodology with existing three-tier workflow

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load environment variables if available
ENV_FILE="$PROJECT_ROOT/.env"
if [ -f "$ENV_FILE" ]; then
    export $(cat "$ENV_FILE" | grep -v '^#' | grep -v '^\s*$' | xargs)
    echo "✅ API keys loaded from .env"
else
    echo "⚠️  No .env file found - some strategic features may be limited"
fi

# Parse command line arguments
TOPIC="$1"
HORIZON="${2:-1yr}"  # Default to 1-year horizon
PERSONALITY="${3:-strategic_commander}"  # Default strategic personality
PERSPECTIVE="${4:-comprehensive}"  # Default to comprehensive analysis

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_BASE="strategic_${TOPIC//[^a-zA-Z0-9]/_}_${HORIZON}_${TIMESTAMP}"
OUTPUT_DIR="$PROJECT_ROOT/outputs/strategic/$OUTPUT_BASE"

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "🧠 Strategic Research System - TimeTravel Enhanced"
echo "================================================="
echo "Topic: $TOPIC"
echo "Horizon: $HORIZON"
echo "Personality: $PERSONALITY"
echo "Perspective: $PERSPECTIVE"
echo "Output: $OUTPUT_DIR"
echo ""

# Log the execution
echo "## Strategic Research Execution: $TOPIC ($HORIZON)" >> "$PROJECT_ROOT/execution-log.md"
echo "**Timestamp**: $(date)" >> "$PROJECT_ROOT/execution-log.md"
echo "**Workflow**: Strategic Multi-Horizon Research" >> "$PROJECT_ROOT/execution-log.md"
echo "**Horizon**: $HORIZON" >> "$PROJECT_ROOT/execution-log.md"
echo "**Personality**: $PERSONALITY" >> "$PROJECT_ROOT/execution-log.md"
echo "" >> "$PROJECT_ROOT/execution-log.md"

# STEP 1: Strategic Context Loading
echo "📊 STEP 1: Strategic Context Loading"
echo "====================================="
cat << EOF
✅ Loaded Strategic Framework: Multi-Horizon Analysis
✅ Loaded Horizon: $HORIZON strategic analysis
✅ Loaded Personality: $PERSONALITY strategic mode
✅ Loaded Methodology: 5-perspective comprehensive research

Strategic Context Resolution:
- Horizon Config: strategic/horizons/$HORIZON/
- Workflow Config: workflows/strategic-research.yaml
- Personality Config: personalities/core/$PERSONALITY.yaml
- Research Tools: perplexity_sonar, elicit, deepseek, claude_3.5

EOF

# STEP 2: Strategic Scope Analysis
echo "📊 STEP 2: Strategic Scope Analysis"
echo "===================================="

# Determine research scope based on horizon
case $HORIZON in
    "6mo")
        SCOPE="immediate_tactical"
        DEPTH="implementation_ready"
        FOCUS="threats_and_quick_wins"
        PERSONALITIES="cortisol_guardian,practical_builder"
        ;;
    "1yr")
        SCOPE="strategic_positioning"
        DEPTH="comprehensive_analysis"
        FOCUS="competitive_differentiation"
        PERSONALITIES="abundance_amplifier,strategic_commander"
        ;;
    "2yr")
        SCOPE="paradigm_preparation"
        DEPTH="scenario_planning"
        FOCUS="defensive_strategies"
        PERSONALITIES="sovereignty_architect,visionary_pioneer"
        ;;
    "5yr")
        SCOPE="transformation_vision"
        DEPTH="visionary_analysis"
        FOCUS="industry_redefinition"
        PERSONALITIES="visionary_pioneer,systems_thinker"
        ;;
    *)
        echo "❌ Invalid horizon: $HORIZON"
        echo "Valid horizons: 6mo, 1yr, 2yr, 5yr"
        exit 1
        ;;
esac

cat << EOF
🎯 STRATEGIC SCOPE ANALYSIS FOR $HORIZON HORIZON

Research Scope: $SCOPE
Analysis Depth: $DEPTH
Strategic Focus: $FOCUS
Recommended Personalities: $PERSONALITIES

Horizon-Specific Research Protocol:
- Time Frame: $HORIZON strategic planning cycle
- Decision Style: Based on $HORIZON certainty levels
- Risk Profile: Appropriate for $HORIZON planning horizon
- Implementation Timeline: Aligned with $HORIZON execution window

EOF

# STEP 3: Multi-Perspective Strategic Research Plan
echo "📊 STEP 3: Multi-Perspective Strategic Research Plan"
echo "===================================================="
cat << EOF

🔍 5-PERSPECTIVE STRATEGIC RESEARCH EXECUTION

Perspective 1: Technical Implementation Analysis
   Tool Suite: perplexity_sonar, github_search, technical_apis
   Focus: Architecture implications, implementation complexity
   Validation: Code availability, technical feasibility
   Strategic Angle: $HORIZON technology readiness assessment
   
Perspective 2: Academic Research Validation  
   Tool Suite: elicit, arxiv_search, semantic_scholar
   Focus: Research foundation, theoretical validation
   Validation: Peer review status, citation analysis
   Strategic Angle: $HORIZON scientific trajectory analysis
   
Perspective 3: Market & Industry Intelligence
   Tool Suite: perplexity_sonar, company_research, market_apis
   Focus: Competitive landscape, adoption patterns
   Validation: Market data, financial analysis
   Strategic Angle: $HORIZON competitive positioning analysis
   
Perspective 4: User Impact & Adoption Analysis
   Tool Suite: perplexity_sonar, social_sentiment, user_research
   Focus: User needs, adoption barriers, value perception
   Validation: Usage metrics, satisfaction data
   Strategic Angle: $HORIZON user evolution assessment
   
Perspective 5: Future Implications & Strategic Risk
   Tool Suite: deepseek, trend_analysis, scenario_planning
   Focus: Long-term trajectories, strategic risks
   Validation: Expert consensus, scenario robustness
   Strategic Angle: $HORIZON strategic risk assessment

🎭 STRATEGIC PERSONALITY INTEGRATION: $PERSONALITY

Personality-Specific Analysis Focus:
- Strategic Lens: Applying $PERSONALITY perspective to all research
- Decision Bias: $PERSONALITY-specific strategic priorities
- Risk Assessment: $PERSONALITY approach to strategic uncertainty
- Opportunity Identification: $PERSONALITY-driven strategic opportunities

📄 STRATEGIC OUTPUT STRUCTURE: $OUTPUT_DIR/

1. Executive Strategic Summary ($HORIZON-specific)
2. Multi-Perspective Analysis (5 comprehensive perspectives)
3. Competitive Intelligence Report
4. Strategic Risk Assessment
5. $HORIZON Action Plan & Recommendations
6. Cross-Horizon Strategic Implications
7. Strategic Memory Update

EOF

# STEP 4: Strategic Research Execution Instruction
echo "🚀 STEP 4: Strategic Research Execution"
echo "======================================"
cat << EOF

🎯 CLAUDE STRATEGIC EXECUTION INSTRUCTION:

Execute comprehensive strategic research for: "$TOPIC"
Using strategic horizon: $HORIZON
Through personality lens: $PERSONALITY

STRATEGIC RESEARCH PROTOCOL:
1. Apply $HORIZON-specific research depth and focus areas
2. Execute 5-perspective analysis with strategic validation
3. Integrate competitive intelligence and risk assessment
4. Generate $HORIZON-appropriate strategic recommendations
5. Update strategic memory with insights and implications

USE YOUR AVAILABLE TOOLS IN THIS STRATEGIC SEQUENCE:
1. Start with WebSearch for broad strategic landscape scanning
2. Use perplexity_ask for specific strategic intelligence gathering
3. Apply $PERSONALITY analytical framework throughout
4. Focus on $HORIZON strategic implications and actionability
5. Generate comprehensive strategic analysis report

STRATEGIC OUTPUT REQUIREMENTS:
- Executive summary optimized for $HORIZON planning
- Competitive intelligence relevant to $HORIZON timeframe
- Strategic recommendations with $HORIZON implementation timeline
- Risk assessment appropriate for $HORIZON uncertainty levels
- Cross-horizon implications for broader strategic planning

STRATEGIC MEMORY INTEGRATION:
- Update strategic intelligence database
- Cross-reference with previous $HORIZON analyses
- Identify strategic pattern evolution
- Flag strategic assumptions for validation

END OF STRATEGIC SIMULATION - READY FOR ENHANCED CLAUDE EXECUTION
EOF

echo ""
echo "Strategic research workflow prepared."
echo "Output directory: $OUTPUT_DIR"
echo "Next: Enhanced Claude should execute strategic research using strategic methodology."

# Create strategic research template files
mkdir -p "$OUTPUT_DIR/perspectives"
mkdir -p "$OUTPUT_DIR/intelligence"

# Create template files for strategic output
cat > "$OUTPUT_DIR/STRATEGIC_RESEARCH_TEMPLATE.md" << 'EOF'
# Strategic Research Report: [TOPIC] - [HORIZON] Analysis

## Executive Strategic Summary ([HORIZON] Horizon)
*2-3 paragraphs summarizing strategic implications for the specified time horizon*

## Multi-Perspective Strategic Analysis

### Perspective 1: Technical Implementation
- Architecture implications
- Implementation complexity
- Technical readiness assessment
- Strategic technical risks

### Perspective 2: Academic Foundation
- Research validation
- Theoretical framework
- Scientific trajectory
- Academic strategic signals

### Perspective 3: Market Intelligence
- Competitive landscape
- Market positioning
- Industry dynamics
- Commercial strategic implications

### Perspective 4: User Evolution
- User impact analysis
- Adoption patterns
- Value proposition evolution
- User-driven strategic opportunities

### Perspective 5: Strategic Risk Assessment
- Future scenarios
- Strategic risks and mitigations
- Long-term implications
- Cross-horizon dependencies

## Competitive Intelligence
- Direct competitive threats
- Indirect competitive pressures
- Strategic positioning opportunities
- Defensive strategies

## Strategic Recommendations ([HORIZON] Timeline)
1. **Immediate Actions** (Next 30 days)
2. **Strategic Initiatives** ([HORIZON] timeframe)
3. **Defensive Measures** (Risk mitigation)
4. **Opportunity Capture** (Strategic advantage)

## Strategic Risk Assessment
- **High Priority Risks**: Immediate attention required
- **Medium Priority Risks**: Monitor and prepare
- **Low Priority Risks**: Awareness and contingency
- **Opportunity Risks**: Risk of missing opportunities

## Cross-Horizon Implications
- Impact on other strategic horizons
- Dependencies and prerequisites
- Strategic timeline considerations
- Resource allocation implications

## Strategic Memory Updates
- Key insights for strategic database
- Pattern recognition updates
- Assumption validations
- Strategic learning integration

---
*Strategic Analysis Generated: [TIMESTAMP]*
*Horizon: [HORIZON] | Personality: [PERSONALITY] | Confidence: [SCORE]*
EOF

echo "✅ Strategic research template created at: $OUTPUT_DIR/STRATEGIC_RESEARCH_TEMPLATE.md"