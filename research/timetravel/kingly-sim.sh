#!/bin/bash
# Kingly Research System Simulation
# This script simulates how the Kingly CLI would work for research workflows

echo "🧠 Kingly Research System (Simulation Mode)"
echo "=========================================="
echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Check if we're in the right directory
if [[ ! -f "$SCRIPT_DIR/project.yaml" ]]; then
    echo "❌ Error: Must run from TimeTravel project directory"
    echo "Expected: ~/.kingly/projects/timetravel/"
    exit 1
fi

# Load environment variables if available
ENV_FILE="$SCRIPT_DIR/.env"
if [ -f "$ENV_FILE" ]; then
    export $(cat "$ENV_FILE" | grep -v '^#' | grep -v '^\s*$' | xargs)
    echo "✅ API keys loaded from .env"
else
    echo "⚠️  No .env file found - API features may be limited"
    echo "   Run: ./scripts/setup-keys.sh to configure"
fi

case $1 in
    "research")
        echo "🔬 Initiating Research Workflow"
        echo "Topic: $2"
        ./scripts/execute-research.sh "$2"
        ;;
    "strategic-research")
        echo "🧠 Initiating Strategic Research Workflow"
        echo "Topic: $2, Horizon: $3, Personality: $4"
        ./scripts/strategic-research.sh "$2" "$3" "$4"
        ;;
    "load-context")
        echo "📋 Loading Context: $2"
        ./scripts/load-context.sh "$2"
        ;;
    "personality")
        echo "🎭 Setting Personality Mode: $2"
        ./scripts/personality-mode.sh "$2"
        ;;
    "status")
        echo "📊 Current Status"
        echo "=================="
        if [[ -f "execution-log.md" ]]; then
            tail -20 execution-log.md
        else
            echo "No execution log found. Run 'research <topic>' to start."
        fi
        ;;
    "test")
        echo "🧪 Running System Test"
        ./scripts/test-system.sh
        ;;
    *)
        echo "Available commands:"
        echo ""
        echo "  research <topic>                    - Run three-tier research workflow"
        echo "  strategic-research <topic> [horizon] [personality] - Strategic multi-horizon research"
        echo "  load-context <path>                 - Load and validate a context file"
        echo "  personality <mode>                  - Set personality analysis mode"
        echo "  status                             - Show recent research activity"
        echo "  test                               - Test all system components"
        echo ""
        echo "Strategic Research Examples:"
        echo "  ./kingly-sim.sh strategic-research 'subquadratic attention' 1yr abundance_amplifier"
        echo "  ./kingly-sim.sh strategic-research 'world models' 2yr sovereignty_architect"
        echo "  ./kingly-sim.sh strategic-research 'reasoning models' 6mo cortisol_guardian"
        echo ""
        echo "Standard Research Examples:"
        echo "  ./kingly-sim.sh research 'subquadratic attention'"
        echo "  ./kingly-sim.sh personality sovereignty_architect"
        echo "  ./kingly-sim.sh status"
        ;;
esac