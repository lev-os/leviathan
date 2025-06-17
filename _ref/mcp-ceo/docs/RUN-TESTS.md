# 🧪 MCP-CEO LLM-First Testing

## How to Test (YOU are the test runner!)

### Quick Test - Just run this:
```bash
cd /Users/jean-patricksmith/digital/mcp-ceo && node -e "import('./ceo-core.js').then(async m => { await m.loadWorkflows(); const ceo = new m.ArchitectOfAbundanceCEO(); await ceo.initialize(); const r = await ceo.executeWorkflowStep('simple_test', 1, crypto.randomUUID(), { challenge: 'How can I reduce stress?' }); console.log(r.content[0].text); })"
```

## Direct Testing

### Using Desktop Commander MCP

```bash
# Test workflow step directly
cd /Users/jean-patricksmith/digital/mcp-ceo && node -e "
import('./ceo-core.js').then(async ({ ArchitectOfAbundanceCEO, loadWorkflows }) => {
  await loadWorkflows();
  const ceo = new ArchitectOfAbundanceCEO();
  await ceo.initialize();
  
  const sessionId = crypto.randomUUID();
  const result = await ceo.executeWorkflowStep('simple_test', 1, sessionId, { 
    challenge: 'How can I improve team productivity?' 
  });
  console.log(result.content[0].text);
});"
```

### Using CLI

```bash
# Interactive CLI
node cli.js

# Clean CLI with ceo-core
node cli-clean.js
```

### Using MCP Server

```bash
# Start hot-reload server
node server-hot.js

# In another terminal, use Claude Desktop or MCP client
```

## Test Data Location

- **Question Bank**: `research/test-cases/question-bank.json`
- **Results**: `research/results/`
- **Sessions**: `sessions/`
- **Insights**: `research/insights/`

## Example Test Run

```bash
# 1. Clean up old files
chmod +x cleanup-project.sh
./cleanup-project.sh

# 2. Run simple validation
node test-harness/simple-stress-test.js

# 3. Run full research suite
node test-harness/research-runner-v2.js

# 4. View results
node test-harness/view-session.js --latest
```

## Expected Output

Each test creates:
- Session directory with timestamped ID
- Step folders with input/output separation
- Complete JSON data for analysis
- Markdown summaries for human review
- Performance metrics and timing data

## Research Questions Available

**Total**: 15 questions across 5 workflows

### High Complexity (20 steps):
- MEV-001: LLM-First vs Hardcoded Logic at Scale
- MEV-002: App Store Distribution & Platform Sovereignty
- MEV-003: Legal Liability & Monetization

### Medium Complexity (5-10 steps):
- TD-001: Platform Migration Timing
- DA-001: Technical Debt vs Innovation
- Various comprehensive synthesis questions

### Low Complexity (3 steps):
- Simple workflow validation
- Basic stress reduction scenarios
- Quick architecture decisions