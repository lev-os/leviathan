#!/bin/bash
# Build script for REAL functionality (without JEPA 2 placeholders)

echo "Building Leviathan with REAL pattern detection and predictions..."

cd "$(dirname "$0")"

# Build without jepa_world_model.go which has placeholders
go build -o ../leviathan-real \
    main.go \
    pattern_detector.go \
    simple_predictor.go \
    llm_providers.go \
    leviathan_intelligence.go \
    flowmind_parser.go \
    configuration_applier.go \
    llm_decision_engine.go \
    telemetry_collector_linux.go

if [ $? -eq 0 ]; then
    echo "✅ Build successful! Binary: ../leviathan-real"
    echo "🚀 Run with: ../leviathan-real"
else
    echo "❌ Build failed. Checking for errors..."
fi