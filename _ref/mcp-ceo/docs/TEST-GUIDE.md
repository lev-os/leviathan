# 🧪 MCP-CEO Test Guide (LLM-First)

## Quick Test Commands

### 1. Test Simple Workflow (3 steps)
```javascript
// Step 1: Initialize
await loadWorkflows(); const ceo = new ArchitectOfAbundanceCEO(); await ceo.initialize(); const sessionId = crypto.randomUUID(); const result1 = await ceo.executeWorkflowStep('simple_test', 1, sessionId, { challenge: 'How can I reduce stress?' }); console.log(result1.content[0].text);

// Step 2: Continue with response
const result2 = await ceo.executeWorkflowStep('simple_test', 2, sessionId, { response: 'My main stress is from unclear priorities and constant interruptions.' }); console.log(result2.content[0].text);

// Step 3: Final step
const result3 = await ceo.executeWorkflowStep('simple_test', 3, sessionId, { response: 'I could use time blocking and clear communication boundaries.' }); console.log(result3.content[0].text);
```

### 2. Test Deep Analysis (5 steps)
```javascript
// Initialize and run deep_analysis workflow
const sessionId = crypto.randomUUID();
await ceo.executeWorkflowStep('deep_analysis', 1, sessionId, { challenge: 'Should we rebuild our platform or iterate?' });
```

### 3. Test Multi-Expert Validation (20 steps)
```javascript
// Use question from question bank
const sessionId = crypto.randomUUID();
await ceo.executeWorkflowStep('multi_expert_validation', 1, sessionId, { 
  challenge: 'How should a CEO balance LLM-first reasoning with hardcoded logic in a million-agent system?' 
});
```

## Test Questions Available

### From research/test-cases/question-bank.json:

**High Complexity (MEV)**
- MEV-001: LLM-First vs Hardcoded Logic at Scale
- MEV-002: App Store Distribution & Platform Sovereignty  
- MEV-003: Legal Liability & Monetization

**Medium Complexity**
- TD-001: Platform Migration Timing
- DA-001: Technical Debt vs Innovation

**Simple Tests**
- Basic stress reduction
- Team productivity
- Architecture decisions

## Verification Commands

```bash
# Check session was created
ls -la sessions/[SESSION_ID]/

# Verify response was saved
cat sessions/[SESSION_ID]/step-1/response.md

# View session structure
find sessions/[SESSION_ID] -type f -name "*.md" | sort
```

## Full Test Sequence

1. **Basic Test**: Run simple_test workflow
2. **Check Files**: Verify folder structure created
3. **Response Test**: Confirm responses are saved
4. **Complex Test**: Run multi_expert_validation
5. **Performance**: Time the execution

## Direct Execution in Terminal

```bash
cd /Users/jean-patricksmith/digital/mcp-ceo && node -e "import('./ceo-core.js').then(async m => { await m.loadWorkflows(); const ceo = new m.ArchitectOfAbundanceCEO(); await ceo.initialize(); const r = await ceo.executeWorkflowStep('simple_test', 1, crypto.randomUUID(), { challenge: 'test' }); console.log(r.content[0].text); })"
```

That's it! The LLM runs the tests directly using these commands.