#!/bin/bash

# MCP-CEO Project Cleanup Script
# Removes old/unused files while preserving core functionality

echo "🧹 MCP-CEO Project Cleanup"
echo "========================="

# Create archive directory
mkdir -p archive/old-servers
mkdir -p archive/old-tests
mkdir -p archive/old-outputs

# Move old server files
echo "📦 Archiving old server files..."
mv server-old.js archive/old-servers/ 2>/dev/null
mv server-backup.js archive/old-servers/ 2>/dev/null
mv server-clean.js archive/old-servers/ 2>/dev/null

# Move old test files
echo "📦 Archiving old test files..."
mv test-direct-mcp.js archive/old-tests/ 2>/dev/null
mv test-jsonrpc-workflow.js archive/old-tests/ 2>/dev/null
mv test-server-direct.js archive/old-tests/ 2>/dev/null
mv test-simple-workflow.sh archive/old-tests/ 2>/dev/null
mv test-workflow-demo.js archive/old-tests/ 2>/dev/null
mv test-harness/quick-stress-test.js archive/old-tests/ 2>/dev/null
mv test-harness/research-runner.js archive/old-tests/ 2>/dev/null
mv test-harness/simple-mcp-test.js archive/old-tests/ 2>/dev/null

# Move old workflow outputs
echo "📦 Archiving old workflow outputs..."
mv workflow-output.txt archive/old-outputs/ 2>/dev/null
mv workflow-response.json archive/old-outputs/ 2>/dev/null
mv workflow-step2-clean.json archive/old-outputs/ 2>/dev/null
mv workflow-step2-response.json archive/old-outputs/ 2>/dev/null
mv workflow-demo-results.md archive/old-outputs/ 2>/dev/null

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📁 Current structure:"
echo "  Core Files:"
echo "    - server.js (main MCP server)"
echo "    - ceo-core.js (business logic)"
echo "    - server-hot.js (dev server with hot reload)"
echo "    - cli.js, cli-clean.js (CLI tools)"
echo "    - mcp-client.js (MCP client)"
echo ""
echo "  Configuration:"
echo "    - ceo-config.yaml"
echo "    - workflows.yaml"
echo "    - package.json"
echo ""
echo "  Test Infrastructure:"
echo "    - test-harness/research-runner-v2.js (main research suite)"
echo "    - test-harness/simple-stress-test.js (quick validation)"
echo "    - test-harness/spawn-runner.js (parallel execution)"
echo "    - test-harness/view-session.js (session viewer)"
echo ""
echo "  Research Data:"
echo "    - research/test-cases/question-bank.json"
echo "    - research/results/"
echo "    - sessions/"
echo ""
echo "🗑️  Archived files moved to: ./archive/"