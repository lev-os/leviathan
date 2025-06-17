# Workspace Routing Syntax - Revolutionary Discovery

## The Breakthrough
Universal syntax for agent-to-agent communication using workspace routing:

```
workspace://project#agent?context=value&param=value
```

## Examples

### Basic Agent Routing
```
workspace://mcp-ceo#doc-shepherd
workspace://aiforge#technical-writer  
workspace://kingly#nfj-visionary
```

### Context-Aware Routing
```
workspace://mcp-ceo#doc-shepherd?mode=audit&focus=adr
workspace://aiforge#technical-writer?format=api&style=concise
workspace://kingly#cognitive-parliament?depth=deep&timeout=300
```

### Multi-Agent Workflows
```
workspace://mcp-ceo#doc-shepherd?handoff=workspace://kingly#nfj-visionary
workspace://project#agent1?callback=workspace://project#agent2?context=result
```

## Protocol Benefits

1. **Universal**: Works across all FlowMind systems
2. **Semantic**: Human-readable agent intentions
3. **Composable**: Chain workflows naturally
4. **Context-Aware**: Pass state between agents
5. **Discoverable**: Self-documenting protocol

## Implementation Notes

- URI-based routing maps to context files
- Query parameters become context variables
- Fragment (#) indicates specific agent/workflow
- Enables agent-to-agent handoffs with context preservation

## Future Vision

This syntax could become the standard for:
- Inter-agent communication
- Workflow orchestration  
- Context switching protocols
- Distributed AI coordination

---

*Captured: Workspace routing breakthrough - for future implementation after constitutional framework is stable*