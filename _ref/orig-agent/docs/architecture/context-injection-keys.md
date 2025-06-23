# Context Injection Key Mapping

## The Context Assembly Structure

When we say `include: "recent_error_patterns"`, this maps to a context injection system:

### 1. Without Kingly OS (MCP Only)
```javascript
// The LLM must request additional context
const contextRequest = {
  tool: "requestContext",
  params: {
    keys: ["recent_error_patterns"],
    reason: "debugging"
  }
};

// MCP server responds with context
const contextResponse = {
  recent_error_patterns: [
    {
      timestamp: "2024-01-15T10:30:00Z",
      error: "JWT token expired",
      context: "auth_middleware.js:45",
      resolution: "Implemented refresh token flow"
    }
  ]
};
```

### 2. With Kingly OS (Automatic Injection)
```yaml
# Context assembly rules in OS
context_mappings:
  recent_error_patterns:
    source: "memory.errors"
    filter: "last_24_hours"
    format: "summary"
    
  methodology_selection:
    source: "contexts/patterns/methodology/*.md"
    selection: "based_on_project_type"
    
  previous_research_results:
    source: "workspace.research"
    filter: "related_to_current_task"
```

### 3. Boundary Definition for Dual LLM
```javascript
class ContextBoundaries {
  // Frontend LLM has access to
  frontend_context = {
    user_preferences: true,
    recent_interactions: true,
    ui_state: true,
    // But NOT full error details
    recent_error_patterns: "summary_only"
  };
  
  // Backend LLM has access to
  backend_context = {
    recent_error_patterns: "full_details",
    system_logs: true,
    performance_metrics: true,
    code_context: true
  };
}
```

### 4. MCP-Only Callback Pattern
```javascript
// Without OS, LLM must explicitly request context
async function debugWithContext(error) {
  // Step 1: Request error context
  const context = await mcp.call('requestContext', {
    keys: ['recent_error_patterns', 'similar_errors'],
    filters: {
      timeframe: 'last_week',
      similarity: 0.8
    }
  });
  
  // Step 2: Reason with context
  return await mcp.call('continueReasoning', {
    task: 'debug_error',
    error: error,
    context: context
  });
}
```

### 5. Context Key Registry
```yaml
# All available context keys
context_registry:
  # Error/Debug contexts
  recent_error_patterns:
    description: "Recent errors in current workspace"
    requires_permission: false
    
  system_logs:
    description: "System-wide logs"
    requires_permission: true
    
  # Methodology contexts
  methodology_selection:
    description: "Available methodologies for project type"
    dynamic: true  # Generated based on project
    
  # Memory contexts
  working_memory:
    description: "Current task working memory"
    provider: "configurable"  # PathRAG, Neural Graffit, etc.
    
  semantic_memory:
    description: "Long-term semantic associations"
    provider: "configurable"
```

## Implementation for MCP-Only

Since we don't have dual LLM yet, here's the pure MCP approach:

```javascript
// MCP Tool: requestContext
async function requestContext(params) {
  const { keys, filters } = params;
  const context = {};
  
  for (const key of keys) {
    switch(key) {
      case 'recent_error_patterns':
        context[key] = await getRecentErrors(filters);
        break;
      case 'methodology_selection':
        context[key] = await selectMethodology(currentProject);
        break;
      // ... other keys
    }
  }
  
  // Include hint for next step
  return {
    context,
    hint: "Use continueReasoning with this context"
  };
}
```

This way, the LLM knows to:
1. First call `requestContext` with needed keys
2. Then call `continueReasoning` with the context
3. Each call gets full model capacity