#!/bin/bash

# E2E test script for Claude Code + Leviathan integration
echo "Starting E2E tests..."

# Test 1: New checkpoint
echo "Test 1: Creating new checkpoint"
CONTEXTS_PATH="./contexts" ./bin/lev checkpoint --new "e2e test - new checkpoint"

# Test 2: Progress checkpoint  
echo "Test 2: Creating progress checkpoint"
CONTEXTS_PATH="./contexts" ./bin/lev checkpoint --context "e2e test in progress"

# Test 3: Resume checkpoint (cross-session timeline continuity)
echo "Test 3: Testing resume with cross-session timeline"
CONTEXTS_PATH="./contexts" ./bin/lev checkpoint --resume

# Test 4: Final checkpoint
echo "Test 4: Creating final checkpoint"
CONTEXTS_PATH="./contexts" ./bin/lev checkpoint --final "e2e test complete"

echo "E2E tests completed!"