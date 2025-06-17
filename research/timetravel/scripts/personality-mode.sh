#!/bin/bash
# Personality Mode Script - Switch between personality analysis modes

echo "🎭 Kingly Personality Mode Selector"
echo "=================================="

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Mode selection
MODE="$1"

# Available personalities
declare -A PERSONALITIES=(
    ["visionary"]="NFJ-Visionary"
    ["strategist"]="NTJ-Strategist"
    ["innovator"]="NTP-Innovator"
    ["leader"]="STJ-Leader"
    ["adapter"]="STP-Adapter"
    ["connector"]="SFP-Connector"
    ["caregiver"]="SFJ-Caregiver"
    ["advocate"]="NFP-Advocate"
)

# Personality descriptions
declare -A DESCRIPTIONS=(
    ["visionary"]="Long-term implications and paradigm shifts"
    ["strategist"]="Competitive positioning and market dynamics"
    ["innovator"]="Novel combinations and creative applications"
    ["leader"]="Practical implementation and resource management"
    ["adapter"]="Flexibility and rapid response capabilities"
    ["connector"]="Stakeholder impact and relationship dynamics"
    ["caregiver"]="Ethical considerations and protective measures"
    ["advocate"]="Mission alignment and values integration"
)

# Show available modes if no argument
if [ -z "$MODE" ]; then
    echo "Available personality modes:"
    echo ""
    for key in "${!PERSONALITIES[@]}"; do
        echo "  $key - ${PERSONALITIES[$key]}"
        echo "         ${DESCRIPTIONS[$key]}"
        echo ""
    done
    echo "Usage: ./personality-mode.sh <mode>"
    echo "Example: ./personality-mode.sh visionary"
    echo ""
    echo "Special modes:"
    echo "  all      - Apply all 8 personalities sequentially"
    echo "  team     - Balanced team perspective"
    echo "  innovate - Innovation focus (visionary + innovator)"
    echo "  execute  - Execution focus (leader + adapter)"
    exit 0
fi

# Function to apply a personality
apply_personality() {
    local mode="$1"
    local personality="${PERSONALITIES[$mode]}"
    local description="${DESCRIPTIONS[$mode]}"
    
    echo "🎭 Activating: $personality"
    echo "Focus: $description"
    echo ""
    
    # Create personality context file
    cat > "$PROJECT_ROOT/contexts/active-personality.yaml" << EOF
# Active Personality Context
metadata:
  type: "personality"
  active_mode: "$mode"
  personality: "$personality"
  
personality_config:
  mode: "$mode"
  name: "$personality"
  description: "$description"
  
  prompts:
    analysis: "@kingly/core/patterns/personality/prompts/$mode.md"
    
  focus_areas:
$(case "$mode" in
    "visionary")
        cat << FOCUS
    - paradigm_shifts
    - long_term_implications
    - transformative_potential
    - systemic_change
FOCUS
        ;;
    "strategist")
        cat << FOCUS
    - competitive_advantage
    - market_positioning
    - power_dynamics
    - strategic_moves
FOCUS
        ;;
    "innovator")
        cat << FOCUS
    - creative_combinations
    - lateral_connections
    - unconventional_solutions
    - experimental_approaches
FOCUS
        ;;
    "leader")
        cat << FOCUS
    - implementation_plans
    - resource_allocation
    - team_structure
    - measurable_outcomes
FOCUS
        ;;
    "adapter")
        cat << FOCUS
    - tactical_flexibility
    - quick_wins
    - pivot_strategies
    - tool_optimization
FOCUS
        ;;
    "connector")
        cat << FOCUS
    - stakeholder_mapping
    - relationship_building
    - community_dynamics
    - engagement_strategies
FOCUS
        ;;
    "caregiver")
        cat << FOCUS
    - risk_mitigation
    - safety_protocols
    - ethical_guidelines
    - protective_measures
FOCUS
        ;;
    "advocate")
        cat << FOCUS
    - mission_alignment
    - values_integration
    - purpose_validation
    - inspiration_generation
FOCUS
        ;;
esac)
    
  output_style:
    tone: "$(get_tone $mode)"
    structure: "$(get_structure $mode)"
    emphasis: "$(get_emphasis $mode)"
EOF

    echo "✅ Personality mode activated: $personality"
}

# Helper functions
get_tone() {
    case "$1" in
        "visionary") echo "inspirational and forward-looking" ;;
        "strategist") echo "analytical and decisive" ;;
        "innovator") echo "playful and exploratory" ;;
        "leader") echo "authoritative and direct" ;;
        "adapter") echo "pragmatic and flexible" ;;
        "connector") echo "warm and relational" ;;
        "caregiver") echo "careful and protective" ;;
        "advocate") echo "passionate and value-driven" ;;
    esac
}

get_structure() {
    case "$1" in
        "visionary") echo "vision_to_reality" ;;
        "strategist") echo "situation_analysis_to_strategy" ;;
        "innovator") echo "exploration_to_synthesis" ;;
        "leader") echo "goal_to_execution" ;;
        "adapter") echo "challenge_to_solution" ;;
        "connector") echo "individual_to_collective" ;;
        "caregiver") echo "risk_to_mitigation" ;;
        "advocate") echo "values_to_action" ;;
    esac
}

get_emphasis() {
    case "$1" in
        "visionary") echo "transformative_potential" ;;
        "strategist") echo "competitive_advantage" ;;
        "innovator") echo "creative_possibilities" ;;
        "leader") echo "practical_execution" ;;
        "adapter") echo "flexible_response" ;;
        "connector") echo "human_impact" ;;
        "caregiver") echo "safety_first" ;;
        "advocate") echo "purpose_driven" ;;
    esac
}

# Handle special modes
case "$MODE" in
    "all")
        echo "🎭 Applying ALL personality modes"
        echo "================================"
        echo ""
        
        # Create multi-personality context
        cat > "$PROJECT_ROOT/contexts/active-personality.yaml" << EOF
# Multi-Personality Analysis Context
metadata:
  type: "personality"
  active_mode: "all"
  personality: "Full Spectrum Analysis"
  
personality_config:
  mode: "all"
  sequence: ["visionary", "strategist", "innovator", "leader", "adapter", "connector", "caregiver", "advocate"]
  synthesis: true
  
  output_format:
    per_personality: true
    synthesis_report: true
    consensus_points: true
    creative_tensions: true
EOF
        
        echo "✅ All personalities activated for comprehensive analysis"
        ;;
        
    "team")
        echo "🎭 Balanced Team Perspective"
        echo ""
        cat > "$PROJECT_ROOT/contexts/active-personality.yaml" << EOF
# Balanced Team Context
metadata:
  type: "personality"
  active_mode: "team"
  personality: "Balanced Team"
  
personality_config:
  mode: "team"
  balance: "equal_weight"
  personalities: ["visionary", "strategist", "innovator", "leader", "adapter", "connector", "caregiver", "advocate"]
EOF
        echo "✅ Balanced team perspective activated"
        ;;
        
    "innovate")
        echo "🎭 Innovation Focus Mode"
        echo ""
        cat > "$PROJECT_ROOT/contexts/active-personality.yaml" << EOF
# Innovation Focus Context
metadata:
  type: "personality"
  active_mode: "innovate"
  personality: "Innovation Team"
  
personality_config:
  mode: "innovate"
  primary: ["visionary", "innovator"]
  secondary: ["strategist", "adapter"]
  focus: "breakthrough_innovation"
EOF
        echo "✅ Innovation focus activated"
        ;;
        
    "execute")
        echo "🎭 Execution Focus Mode"
        echo ""
        cat > "$PROJECT_ROOT/contexts/active-personality.yaml" << EOF
# Execution Focus Context
metadata:
  type: "personality"
  active_mode: "execute"
  personality: "Execution Team"
  
personality_config:
  mode: "execute"
  primary: ["leader", "adapter"]
  secondary: ["strategist", "caregiver"]
  focus: "practical_implementation"
EOF
        echo "✅ Execution focus activated"
        ;;
        
    *)
        # Single personality mode
        if [[ -n "${PERSONALITIES[$MODE]}" ]]; then
            apply_personality "$MODE"
        else
            echo "❌ Unknown personality mode: $MODE"
            echo "Run without arguments to see available modes"
            exit 1
        fi
        ;;
esac

echo ""
echo "💡 Personality mode is now active!"
echo "Run your research to see analysis through this lens"