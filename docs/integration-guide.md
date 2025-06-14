# Core Packages Integration Guide

## 🎯 Integration Overview
This guide shows how to integrate @kingly/debug and @kingly/cmd with the existing Kingly agent system at `/digital/kingly/core/agent`.

## 🔄 Integration Steps

### Step 1: Add Core Package Dependencies

Update the agent system's package.json:
```json
{
  "dependencies": {
    "@kingly/debug": "workspace:../../../k/core/packages/debug",
    "@kingly/cmd": "workspace:../../../k/core/packages/cmd"
  }
}
```

### Step 2: Enhance Existing Plugins

#### Enhanced parallel.yaml Plugin
```yaml
# /digital/kingly/core/agent/contexts/plugins/parallel.yaml
plugin:
  name: parallel
  version: 2.0.0
  type: core_plugin
  description: LLM-first parallel development with enhanced debugging and process management
  
dependencies:
  core_packages:
    - "@kingly/debug"    # Universal debugging and tracing
    - "@kingly/cmd"      # Process management and git worktree

capabilities:
  - session_management
  - workflow_orchestration  
  - command_routing
  - constitutional_ai
  - context_synthesis
  - enhanced_debugging     # NEW: Full debug tracing
  - process_management     # NEW: Git worktree + process control

commands:
  para_init:
    syntax: "kingly para init <session-id> [streams...]"
    description: "Initialize parallel development with enhanced debugging"
    integration:
      debug: "Trace all agent personality switches and confidence scores"
      cmd: "Create git worktrees and spawn Claude Code instances"
    whisper:
      strategies:
        - "Create git worktrees using @kingly/cmd for isolation"
        - "Setup @kingly/debug tracing for all agent personality switches"
        - "Generate Claude Code spawn commands with agent context injection"
        - "Constitutional AI validation with full debug logging"
      llm_guidance: "Use enhanced debugging and process management for parallel orchestration"

# Integration with core systems
core_integration:
  debug_integration:
    - "Trace all FlowMind context switches with confidence scores"
    - "Log constitutional AI validation steps with reasoning paths"
    - "Monitor agent personality performance and optimization opportunities"
    
  cmd_integration:
    - "Git worktree creation for agent isolation"
    - "Claude Code process spawning with context injection"
    - "Process cleanup and resource management"
    - "Job integration with existing workflow system"
```

### Step 3: Command Registry Integration

Update command registry to include core package commands:
```javascript
// /digital/kingly/core/agent/src/command-registry.js enhancement
import { logger, tracer, monitor } from '@kingly/debug';
import { processManager, worktreeManager } from '@kingly/cmd';

// Enhanced command registry with core package integration
export const ENHANCED_COMMAND_REGISTRY = {
  // Existing commands...
  
  // Debug commands
  debug_events: {
    syntax: "kingly debug events [filter]",
    description: "Show all system events with agent personality context",
    handler: async (args) => {
      const trace = tracer.start('debug-events-query');
      const events = tracer.getRecentTraces(100);
      
      // Filter events by agent personality if specified
      const filtered = args.filter ? 
        events.filter(e => e.metadata.personality?.includes(args.filter)) : 
        events;
        
      trace.end({ eventsFound: filtered.length });
      return { events: filtered, personality_context: true };
    }
  },
  
  debug_llm: {
    syntax: "kingly debug llm [trace-id]", 
    description: "Show LLM reasoning traces across agent personalities",
    handler: async (args) => {
      const llmTraces = monitor.getMetricsByType('llm');
      return {
        traces: llmTraces,
        personality_breakdown: llmTraces.reduce((acc, t) => {
          const personality = t.personality || 'unknown';
          acc[personality] = (acc[personality] || 0) + 1;
          return acc;
        }, {})
      };
    }
  },
  
  // Process management commands  
  cmd_worktree: {
    syntax: "kingly cmd worktree <action> [args]",
    description: "Manage git worktrees for agent isolation",
    handler: async (args) => {
      const trace = tracer.start('worktree-management');
      
      switch (args.action) {
        case 'create':
          const worktree = await worktreeManager.createWorktree(args.name, {
            context: args.agentContext
          });
          trace.addEvent('worktree-created', { name: args.name });
          return worktree;
          
        case 'list':
          const worktrees = await worktreeManager.listWorktrees();
          trace.addEvent('worktrees-listed', { count: worktrees.length });
          return worktrees;
          
        default:
          throw new Error(`Unknown worktree action: ${args.action}`);
      }
    }
  }
};
```

### Step 4: Agent Personality Integration

Enhance agent personalities to use core packages:

```yaml
# /digital/kingly/core/agent/contexts/agents/eeps/nfj-visionary/context.yaml
metadata:
  id: nfj-visionary
  type: agent
  personality: NFJ-Visionary
  
integration:
  debug_context:
    trace_personality: true
    confidence_tracking: true
    reasoning_depth: "deep"
    
  process_context:
    isolation_preference: "high"
    parallel_capability: true
    worktree_naming: "visionary-{timestamp}"

# Enhanced prompt with debug integration
core_prompt: |
  You are the NFJ-Visionary agent with enhanced debugging and process management.
  
  ENHANCED CAPABILITIES:
  - All your reasoning is traced via @kingly/debug with confidence scores
  - You can request isolated git worktrees via @kingly/cmd for parallel work
  - Your context switches are logged for optimization analysis
  
  When working:
  1. Your confidence scores are automatically tracked
  2. Long-running operations can use isolated worktrees
  3. All constitutional AI validations are logged
  4. Performance metrics guide optimization
  
  Leverage these capabilities for enhanced visionary analysis.
```

### Step 5: MCP Server Enhancement

Update MCP server to expose core package functionality:

```javascript
// /digital/kingly/core/agent/src/mcp-server.js enhancement
import { logger, tracer, monitor } from '@kingly/debug';
import { processManager, jobIntegration, worktreeManager } from '@kingly/cmd';

// Enhanced MCP tools
const ENHANCED_MCP_TOOLS = [
  // Existing tools...
  
  {
    name: "debug_trace_agent_switch",
    description: "Trace agent personality switches with confidence",
    inputSchema: {
      type: "object",
      properties: {
        fromAgent: { type: "string" },
        toAgent: { type: "string" },
        contextPath: { type: "string" },
        confidence: { type: "number" }
      }
    },
    handler: async ({ fromAgent, toAgent, contextPath, confidence }) => {
      const trace = tracer.start('agent-personality-switch');
      
      logger.llm('Agent personality switch', {
        from: fromAgent,
        to: toAgent,
        context: contextPath,
        confidence
      });
      
      trace.addEvent('personality-switch', {
        from: fromAgent,
        to: toAgent,
        confidence
      });
      
      monitor.trackLLM('personality-switch', {
        confidence,
        duration: 0 // Will be set on trace.end()
      });
      
      trace.end({ success: true });
      
      return {
        traced: true,
        traceId: trace.id,
        confidenceTracked: confidence
      };
    }
  },
  
  {
    name: "parallel_dev_session",
    description: "Initialize parallel development session with agent isolation",
    inputSchema: {
      type: "object", 
      properties: {
        sessionId: { type: "string" },
        agents: { 
          type: "array",
          items: {
            type: "object",
            properties: {
              personality: { type: "string" },
              context: { type: "string" },
              focus: { type: "string" }
            }
          }
        }
      }
    },
    handler: async ({ sessionId, agents }) => {
      const trace = tracer.start('parallel-session-init');
      const worktrees = [];
      
      for (const agent of agents) {
        const worktreeName = `${sessionId}-${agent.personality.toLowerCase()}`;
        
        const worktree = await worktreeManager.createWorktree(worktreeName, {
          context: agent.context,
          agentPersonality: agent.personality
        });
        
        worktrees.push(worktree);
        
        logger.plugin('parallel', 'Agent worktree created', {
          sessionId,
          personality: agent.personality,
          worktree: worktree.path
        });
      }
      
      trace.addEvent('session-initialized', { 
        sessionId, 
        agentsCount: agents.length,
        worktreesCreated: worktrees.length 
      });
      
      trace.end({ success: true });
      
      return {
        sessionId,
        worktrees,
        agentCount: agents.length,
        debugTracing: true
      };
    }
  }
];
```

## 🧪 Testing Integration

### BDD Workflow Integration
Use existing BDD specification workflow to test core packages:

```bash
# Generate BDD specs for core package integration
kingly workflow bdd-specification \
  --adr="core-packages-integration" \
  --focus="agent personality integration" \
  --personality="doc-shepherd"
```

### Integration Test Scenarios
```gherkin
Feature: Core Package Integration with Agent System

Scenario: Debug tracing across agent personalities
  Given the parallel development system is initialized
  And @kingly/debug tracing is enabled
  When an agent switches from NFJ-Visionary to STP-Adapter
  Then the debug trace captures the personality switch
  And confidence scores are logged for both agents
  And performance metrics are updated

Scenario: Isolated agent workspaces
  Given multiple agent personalities need parallel work
  When @kingly/cmd creates worktrees for each agent
  Then each agent operates in an isolated git worktree
  And context switching maintains workspace isolation
  And cleanup occurs automatically on session end

Scenario: Constitutional AI with enhanced debugging
  Given constitutional AI validation is active
  When agents perform reasoning operations
  Then all validation steps are logged via @kingly/debug
  And constitutional compliance is traced
  And stress reduction metrics are monitored
```

## ✅ Validation Checklist

- [ ] Core packages installed as dependencies
- [ ] parallel.yaml plugin enhanced with core package integration
- [ ] Command registry includes debug and cmd commands
- [ ] Agent personalities configured for debug tracing
- [ ] MCP server exposes core package functionality
- [ ] BDD specifications generated for integration testing
- [ ] Constitutional AI validation enhanced with debugging
- [ ] Performance monitoring active across all agent operations

---
*Integration guide for @kingly/debug and @kingly/cmd with existing LLM-first agent system*