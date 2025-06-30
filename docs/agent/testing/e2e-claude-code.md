# Claude Code E2E Testing Suite

## Overview

This document describes the E2E testing suite for Claude Code + Leviathan integration. The system allows Claude Code to spawn subprocesses and test the Leviathan agent system, providing comprehensive validation of cross-session timeline continuity, session management, and hexagonal architecture integration.

**Part of Leviathan's simplified testing framework** following the "Fast Iteration → Lock Down When Working" philosophy.

## What We Built

### Claude Code CLI Integration
- **Environment Detection** - System detects when running inside Claude Code via `CLAUDECODE=1` and `CLAUDE_CODE_ENTRYPOINT=cli`
- **Subprocess Spawning** - Claude Code can spawn other Claude Code instances to test Leviathan
- **Automated Testing** - Uses Claude Code flags for non-interactive execution
- **E2E Validation** - Tests real user workflow (Claude Code → Leviathan CLI Adapter → Core SDK)
- **Hexagonal Testing** - Validates complete architectural flow through all layers

### Test Infrastructure
- **E2E Test Script** - `./test-e2e.sh` tests all checkpoint modes
- **Cross-Session Timeline** - Validates timeline continuity across sessions  
- **Response Formatting** - Confirms clean markdown output (no JSON debug)
- **Session Management** - Tests session creation, discovery, and progression
- **Integration with Testing Framework** - Uses `@lev-os/testing` framework and `npm run test:e2e`
- **Plugin Ecosystem Testing** - Validates plugin commands work through Claude Code

## How to Use

### 1. Run the Full E2E Test Suite

#### Using Monorepo Test Orchestration
```bash
# Complete E2E validation (includes Claude Code integration)
npm run test:e2e

# Full system validation (all layers + plugins + E2E)
npm run test:all
```

#### Legacy E2E Script (Direct Testing)
```bash
./test-e2e.sh
```

This script tests:
- **New checkpoint** - Creates fresh session (CLI Adapter → Core SDK)
- **Progress checkpoint** - Shows active development state  
- **Resume checkpoint** - Tests cross-session timeline continuity
- **Final checkpoint** - Session completion
- **Plugin integration** - Tests workshop plugin commands via Claude Code

### 2. Claude Code CLI Flags

#### Key Flags for Automation
```bash
--dangerously-skip-permissions  # Bypass all permission checks
--print                        # Print response and exit (non-interactive)
--output-format json          # Get structured JSON output
--output-format text          # Get clean text output (default)
```

#### Basic Usage Pattern
```bash
# Have Claude Code run a Leviathan command
claude --print --dangerously-skip-permissions "Execute this bash command: ./bin/lev checkpoint --new \"test session\""

# With JSON output for automation
claude --print --dangerously-skip-permissions --output-format json "run: ./bin/lev status"

# Test plugin commands through Claude Code
claude --print --dangerously-skip-permissions "./bin/lev workshop status"
```

### 3. Test Specific Functionality

#### Test Cross-Session Timeline Continuity
```bash
claude --print --dangerously-skip-permissions "./bin/lev checkpoint --resume"
```

#### Test Session Management
```bash
claude --print --dangerously-skip-permissions "./bin/lev checkpoint --new \"automated test session\""
```

#### Test Plugin Ecosystem via Claude Code
```bash
# Test workshop plugin
claude --print --dangerously-skip-permissions "./bin/lev workshop status"

# Test debug plugin  
claude --print --dangerously-skip-permissions "./bin/lev debug info"
```

#### Run Full Test Suite via Claude Code
```bash
# Using new monorepo orchestration
claude --print --dangerously-skip-permissions "npm run test:e2e"

# Using legacy script
claude --print --dangerously-skip-permissions "./test-e2e.sh"
```

### 4. Automated Testing Scenarios

#### Test Individual Commands
```bash
# Test new checkpoint (CLI Adapter → Core SDK)
claude --print --dangerously-skip-permissions "./bin/lev checkpoint --new \"e2e test\""

# Test progress checkpoint
claude --print --dangerously-skip-permissions "./bin/lev checkpoint --context \"testing in progress\""

# Test resume (cross-session timeline)
claude --print --dangerously-skip-permissions "./bin/lev checkpoint --resume"

# Test final checkpoint
claude --print --dangerously-skip-permissions "./bin/lev checkpoint --final \"testing complete\""

# Test plugin commands
claude --print --dangerously-skip-permissions "./bin/lev workshop list --tier=1"
```

## What This Validates

### ✅ Session Management
- Session creation with unique IDs
- Session discovery and tracking
- Workspace isolation and auto-registration
- Multi-tab session coordination

### ✅ Cross-Session Timeline Continuity
- Discovers previous sessions in same workspace
- Reconstructs timeline progression across sessions
- Analyzes work patterns (e.g., "development → testing cycle")
- Provides continuity context for resume operations

### ✅ Response Formatting
- Clean markdown output (not JSON debug)
- Consistent formatting across all checkpoint modes
- Proper whisper guidance and follow-up suggestions
- Error handling and recovery suggestions

### ✅ CLI Integration
- Claude Code successfully spawns and calls Leviathan
- Permission handling works correctly
- Background operations complete without user intervention
- JSON output for automation scenarios

### ✅ Hexagonal Architecture Flow
- **External Interface** (Claude Code) → **CLI Adapter** → **Core SDK**
- Plugin commands work through adapter pattern
- Complete architectural validation from external to core

## Current Test Results

Based on successful E2E test runs:

- **34 sessions discovered** across 3 days
- **Pattern detection working** - "development → testing cycle"  
- **All checkpoint modes functioning** - new, progress, resume, final
- **Timeline continuity verified** - Context loads properly across sessions
- **Response formatting consistent** - Clean markdown, no JSON bleed

## Test Script Details

### `./test-e2e.sh` Contents
```bash
#!/bin/bash

# E2E test script for Claude Code + Leviathan integration
echo "Starting E2E tests..."

# Test 1: New checkpoint (CLI Adapter → Core SDK)
echo "Test 1: Creating new checkpoint"
./bin/lev checkpoint --new "e2e test - new checkpoint"

# Test 2: Progress checkpoint  
echo "Test 2: Creating progress checkpoint"
./bin/lev checkpoint --context "e2e test in progress"

# Test 3: Resume checkpoint (cross-session timeline continuity)
echo "Test 3: Testing resume with cross-session timeline"
./bin/lev checkpoint --resume

# Test 4: Final checkpoint
echo "Test 4: Creating final checkpoint"
./bin/lev checkpoint --final "e2e test complete"

# Test 5: Plugin integration
echo "Test 5: Testing plugin commands"
./bin/lev workshop status

echo "E2E tests completed!"
```

### Integration with Testing Framework

The E2E testing integrates with the new simplified testing framework:

```bash
# E2E tests run via npm scripts (includes Claude Code integration)
npm run test:e2e

# This combines:
# - CLI adapter E2E tests
# - Plugin integration tests  
# - Cross-session timeline validation
# - Claude Code subprocess execution
```

## Environment Detection

### Auto-Detection in Global CLAUDE.md
The global CLAUDE.md now includes:

```markdown
## Claude Code Detection & E2E Testing

**I AM CLAUDE CODE:** When environment variables `CLAUDECODE=1` and `CLAUDE_CODE_ENTRYPOINT=cli` are present, I am running inside Claude Code CLI. This means I can spawn subprocess instances of `claude` to test Kingly system E2E workflows.

**E2E Testing Pattern:**
```bash
# Spawn Claude Code subprocess to test Leviathan
claude "run lev checkpoint --new 'e2e test scenario'"
```
```

## Troubleshooting

### Common Issues

#### Permission Errors
- Use `--dangerously-skip-permissions` flag for automated testing
- Ensure Claude Code has bash permissions if running interactively

#### JSON Output Instead of Clean Text
- Use `--output-format text` (default) for clean output
- Avoid `--output-format json` unless automation requires structured data

#### Session Not Found
- Check that session directories exist with proper permissions
- Verify session files are properly formatted JSON

#### Timeline Continuity Not Working
- Ensure multiple sessions exist in the same workspace
- Check that session files are properly formatted JSON
- Verify workspace detection is working correctly

### Debugging Commands

```bash
# Check Claude Code version and help
claude --help
claude --version

# Test basic Claude Code functionality
claude --print "echo 'Claude Code working'"

# Check environment variables
env | grep -i claude

# Verify Leviathan can run directly
./bin/lev status
```

## Benefits

### Real-World Testing
- Tests actual user workflow (Claude Code → Leviathan CLI Adapter → Core SDK)
- Validates hexagonal architecture integration points
- Catches issues in real usage scenarios
- Tests plugin ecosystem compatibility

### Automated Validation
- No manual intervention required
- Consistent test execution
- Repeatable across different environments

### Confidence Building
- Proves cross-session timeline continuity works
- Validates session management robustness
- Confirms response formatting consistency

## Future Enhancements

### Potential Additions
- **Error scenario testing** - Test failure modes and recovery
- **Performance benchmarking** - Measure response times and resource usage
- **Multi-workspace testing** - Validate workspace isolation
- **Concurrent session testing** - Test multiple Claude Code instances
- **CI/CD integration** - Automated testing in deployment pipeline

This E2E testing suite provides comprehensive validation that the Claude Code + Leviathan integration works seamlessly for real user scenarios, following the simplified testing framework principles and validating the complete hexagonal architecture flow.