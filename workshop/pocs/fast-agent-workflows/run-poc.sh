#!/bin/bash

# Fast-Agent Workflows POC Runner
# This script helps run different aspects of the POC

echo "🚀 Fast-Agent Workflows POC"
echo "=========================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from the POC directory"
    echo "   cd workshop/pocs/fast-agent-workflows"
    exit 1
fi

# Display menu
echo "Choose what to run:"
echo "1) Basic chain example"
echo "2) Real chain example (Research → Analyze → Synthesize)"
echo "3) Practical use cases (Docs, Bug, Feature, Performance)"
echo "4) Integration tests"
echo "5) All examples"
echo ""

read -p "Enter choice (1-5): " choice

case $choice in
    1)
        echo "Running basic chain example..."
        node examples/chain-example.js
        ;;
    2)
        echo "Running real chain example..."
        node examples/real-chain-example.js
        ;;
    3)
        echo "Which use case?"
        echo "a) Documentation generation"
        echo "b) Bug investigation"
        echo "c) Feature implementation"
        echo "d) Performance optimization"
        echo "e) All use cases"
        read -p "Enter choice (a-e): " usecase
        
        case $usecase in
            a) node examples/practical-use-cases.js docs ;;
            b) node examples/practical-use-cases.js bug ;;
            c) node examples/practical-use-cases.js feature ;;
            d) node examples/practical-use-cases.js perf ;;
            e) node examples/practical-use-cases.js all ;;
            *) echo "Invalid choice" ;;
        esac
        ;;
    4)
        echo "Running integration tests..."
        npm test
        ;;
    5)
        echo "Running all examples..."
        echo ""
        echo "=== Basic Chain ==="
        node examples/chain-example.js
        echo ""
        echo "=== Real Chain ==="
        node examples/real-chain-example.js
        echo ""
        echo "=== Practical Use Cases ==="
        node examples/practical-use-cases.js all
        echo ""
        echo "=== Tests ==="
        npm test
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✅ POC run complete!"
echo ""
echo "📊 Next steps:"
echo "- Review execution logs above"
echo "- Check performance metrics"
echo "- Compare with 3-tab system"
echo "- Update integration guide based on findings"