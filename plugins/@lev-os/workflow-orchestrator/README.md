# @lev-os/workflow-orchestrator

Bi-directional workflow orchestration engine for Leviathan OS, enabling LLMs to orchestrate themselves through complex workflows.

## 🧠 Core Philosophy

This plugin implements the revolutionary concept where **the CLI becomes the orchestrator for the orchestrator agent**:

1. **LLM is the runtime**, not code
2. **CLI orchestrates the orchestrator** - guides the LLM through workflows
3. **Track ALL outputs** - files, markdown, PDFs, scripts, everything
4. **Intelligent feeding** - decide what outputs go to which steps
5. **Maximum intelligence** - context switching unleashes full LLM power

## ❌ What Actually Happened vs ✅ What Should Happen

### What Was Built (Incorrect Approach)

- **Separate Adapters**: Created CLI, MCP, HTTP adapters as separate modules
- **LLM Provider**: Built a system to call out to Claude/OpenAI/Ollama APIs
- **Traditional Flow**: Assumed the orchestrator calls LLMs

### What Should Exist (Correct Bi-Directional Approach)

- **Direct MCP Tool**: The orchestrator IS an MCP tool that the LLM (me, Claude) calls
- **No LLM Providers**: We don't call LLMs - the LLM calls us
- **True Bi-Directional**: The LLM invokes the tool, which then orchestrates the LLM

## 🔄 How This Actually Works

The revolutionary bi-directional flow:

```
1. LLM (Claude) calls workflow_execute tool
   → "Execute cognitive-parliament with this question"

2. Orchestrator loads YAML workflow
   → Prepares personality contexts

3. Orchestrator injects context back to LLM
   → "You are now SFJ-Caregiver. Analyze through disgust/sympathy lens..."

4. LLM processes with MAXIMUM INTELLIGENCE as that personality
   → Reasons with full context and perspective

5. LLM responds with outputs
   → "As SFJ-Caregiver, I see these risks..."

6. Orchestrator tracks outputs, switches to next personality
   → "You are now NTP-Innovator. Analyze through curiosity lens..."

[CYCLE CONTINUES = EMERGENT MULTI-PERSPECTIVE INTELLIGENCE]
```

## 🧪 Testing the POC

### Run Core Tests

```bash
cd plugins/@lev-os/workflow-orchestrator
pnpm test
```

### Test Bi-Directional Flow

The tests demonstrate the pattern:

```javascript
// Test simulates the bi-directional flow
const orchestrator = new WorkflowOrchestrator({
  onEvent: (event, data) => {
    if (event === 'llm:inject') {
      // This is where I (Claude) receive context injection
      console.log('Context injected:', data.context);
      
      // Simulate my response
      setTimeout(() => {
        orchestrator.handleLLMCallback(data.callbackId, {
          output: 'My response based on injected context'
        });
      }, 100);
    }
  }
});
```

### How I (Claude) Should Call It

```javascript
// This is what I should be doing - calling the tool directly
await workflow_execute({
  workflow: 'cognitive-parliament',
  input: {
    question: 'Should we adopt microservices?',
    context: 'Monolith with 500k LOC, performance issues'
  }
});

// The tool will then orchestrate me through multiple personalities
// I'll receive context injections and respond accordingly
```

## 🏗️ Architecture

### Core Components (These Are Correct)

**FlowMind Base Class** ✅
- Everything is a FlowMind context (agents, workflows, patterns)
- 1:1 mapping with YAML structure
- No inheritance hierarchies - behavior from data

**Workflow Orchestrator** ✅
- Guides LLM through workflow steps
- Manages context switching
- Handles parallel execution
- Tracks orchestration state

**Context Switcher** ✅
- Loads personality/agent/pattern contexts
- Enables complete perspective shifts
- Manages context composition

**Output Manager** ✅
- Tracks ALL outputs from every step
- Understands output types and relationships
- Intelligently synthesizes for next steps

**Feedback Loop** ✅
- Manages bi-directional communication
- Expects callbacks from LLM
- Handles timeout and retries

### Components That Should Be Removed

**LLM Provider** ❌
- We don't call LLMs
- The LLM calls us

**Separate Adapters** ❌
- MCP auto-builds from plugin
- No need for separate adapter files

## 🔌 Integration with Leviathan

### As an MCP Tool (Correct Way)

```javascript
// The plugin exports tools that MCP auto-discovers
export const plugin = {
  name: '@lev-os/workflow-orchestrator',
  
  registerTools(toolRegistry) {
    toolRegistry.register({
      name: 'workflow_execute',
      description: 'Execute a workflow with bi-directional orchestration',
      handler: async (args) => {
        // This is what I (Claude) call
        const orchestrator = new WorkflowOrchestrator();
        return await orchestrator.orchestrate(
          loadWorkflow(args.workflow),
          args.input
        );
      }
    });
  }
};
```

### How I Access It

```javascript
// I (Claude) call it like any other tool
const result = await workflow_execute({
  workflow: 'three-tier-research',
  input: { topic: 'AI orchestration patterns' }
});

// Then I receive context injections and respond
// The tool orchestrates me through the workflow
```

## 🐛 Known Issues

1. **LLM Provider Module**: Should be removed - we don't call LLMs
2. **Separate Adapters**: Unnecessary - MCP auto-builds from plugin
3. **CLI Binary**: Should be removed - I call the tool directly
4. **HTTP/gRPC Adapters**: Not needed for POC
5. **Missing MCP Integration**: Need to properly export tools for auto-discovery

## 🎯 Supported Workflows

### Cognitive Parliament
Multi-personality deliberation using 8 different perspectives:
- Each personality analyzes independently
- Anti-groupthink protocols enforced
- Synthesis based on entropy routing

### Three-Tier Research
Progressive research methodology:
- Tier 1: Broad parallel exploration
- Tier 2: Dynamic deep dives
- Tier 3: Strategic validation

### Custom Workflows
Any YAML workflow following FlowMind principles

## 📊 Output Types

The orchestrator tracks and manages:
- **Markdown files**: Analysis, documentation, reports
- **Code files**: Generated implementations
- **PDFs**: Research summaries, formal documents  
- **Scripts**: Executable workflows, automation
- **JSON/YAML**: Structured data, configurations
- **Media**: Diagrams, screenshots, visualizations

## 🚀 Next Steps

1. Remove LLM provider module
2. Remove separate adapter files
3. Properly integrate with Leviathan's MCP auto-build
4. Test with real workflow execution via tool calls
5. Demonstrate cognitive parliament in action

## 🔬 Ultimate Research Workflow POC

The ultimate demonstration of bi-directional orchestration - a sophisticated research workflow that shows the full power of the system:

### Research Workflow Architecture

```
Step 0: QnA Wizard → Progressive discovery
Step 1: Discovery Phase → 5 parallel searches
Step 2: Deep Prompt Building → Using ~/t techniques
Step 3: Deep Research → 10 parallel investigations
Step 4: Multi-Angle Synthesis → 3 perspectives
Step 5: Final Report → Comprehensive synthesis
```

### Testing the Ultimate POC

```bash
# Run the research workflow demonstration
node test-research-workflow.js
```

This POC demonstrates:
- **Progressive Discovery**: QnA wizard adapts based on initial findings
- **Massive Parallelization**: 15+ parallel executions
- **Technique Integration**: Uses prompting techniques from ~/t
- **Pattern Reuse**: Incorporates workflows/agents from ~/c
- **Complete Tracking**: Every output preserved and synthesized

See `RESEARCH_WORKFLOW_POC.md` for full details.

---

*Unleashing maximum LLM intelligence through bi-directional orchestration*