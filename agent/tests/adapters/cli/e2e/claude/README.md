# Claude Code Adapter E2E Tests

End-to-end tests for Claude Code slash commands integration with Leviathan framework.

## Test Coverage

### Individual Command Tests
- **`doc-command.test.js`** - Tests `/project:doc` (Documentation Shepherd)
- **`sitrep-command.test.js`** - Tests `/project:sitrep` (Situation Report)  
- **`validate-command.test.js`** - Tests `/project:validate` (Anti-Hallucination)

### Test Architecture
- Each command gets comprehensive individual testing
- Tests verify command file structure, content quality, and Claude Code integration
- Validates argument handling (`$ARGUMENTS` substitution)
- Checks for required personality elements and framework components

## Running Tests

### All Claude E2E Tests
```bash
npm run test:e2e:claude
# or
node tests/run-tests.js e2e:claude
```

### Individual Command Tests
```bash
npm run test:single:doc       # Test /project:doc
npm run test:single:sitrep    # Test /project:sitrep  
npm run test:single:validate  # Test /project:validate

# or direct execution
node tests/e2e/claude/doc-command.test.js
node tests/e2e/claude/sitrep-command.test.js
node tests/e2e/claude/validate-command.test.js
```

### Test Suite Orchestrator
```bash
node tests/e2e/claude/run-all.js          # All Claude tests
node tests/e2e/claude/run-all.js doc      # Single test
```

## Test Structure

Each test file follows the same pattern:

1. **File Existence** - Command markdown file exists and has sufficient content
2. **Content Quality** - Required elements, personality, framework components
3. **Integration** - Claude Code compatibility (arguments, structure)
4. **Functionality** - Mode switching, analysis frameworks, output requirements

## Command Details

### `/project:doc` - Documentation Shepherd
- **Personality**: INTJ - The Architect
- **Modes**: analyze, synthesize, consolidate, specify, organize
- **Focus**: Documentation lifecycle management

### `/project:sitrep` - Situation Report  
- **Purpose**: Comprehensive project health assessment
- **Coverage**: Documentation, dependencies, code quality, structure, workflow
- **Output**: Executive summary with health scores and recommendations

### `/project:validate` - Anti-Hallucination
- **Framework**: Evidence-based validation protocols
- **Coverage**: Fact verification, consistency analysis, logic validation
- **Output**: Confidence levels, evidence sources, validation requirements

## Integration Points

### Claude Code Native Features
- **Slash Commands**: `/project:commandname` pattern
- **Argument Handling**: `$ARGUMENTS` placeholder substitution
- **Markdown Structure**: Clean, readable command definitions
- **Auto-completion**: Tab completion support

### Leviathan Framework
- **Agent Personalities**: Rich personality injection (INTJ, etc.)
- **Mode Switching**: Natural language mode transitions
- **Context Awareness**: Project-specific analysis frameworks
- **Validation**: Anti-hallucination protocols

## Success Criteria

All tests must pass with 100% success rate for production deployment:
- ✅ **19 Total Tests**
- ✅ **3 Command Files** 
- ✅ **Claude Code Integration**
- ✅ **Framework Compliance**

## Future Expansion

This architecture supports easy addition of new commands:
1. Create `new-command.test.js` 
2. Add command to `run-all.js`
3. Update package.json scripts
4. Create corresponding `.claude/commands/new-command.md`

The modular design scales naturally as more Claude Code commands are added to the Leviathan framework.