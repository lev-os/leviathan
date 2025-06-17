# ADR-006: Protocol Auto-Discovery System

## Status
Approved

## Context  
Protocol analysis revealed that auto-discovery eliminates need for personality mappings by having contexts self-describe their addressing.

## Decision
Implement intelligent auto-discovery where contexts declare their own protocols via metadata.

## Architecture

### Context Self-Description
```yaml
# contexts/agents/eeps/sfj-caregiver/context.yaml
metadata:
  type: "agent"
  id: "sfj-caregiver"
  protocols:
    - "agent://cortisol_guardian"
    - "agent://stress_reduction"
    - "agent://eeps/sfj-caregiver"
  aliases: ["cortisol_guardian", "stress_guardian"]
```

### Agent Protocol Auto-Discovery
```javascript
class AgentProtocol {
  constructor() {
    this.index = new Map() // Query → context path
    this.aliases = new Map() // Alias → canonical path
    this.buildIndex()
  }
  
  async buildIndex() {
    const contexts = await this.scanContexts('./contexts/agents')
    for (const context of contexts) {
      const metadata = context.metadata
      for (const protocol of metadata.protocols || []) {
        this.index.set(protocol, context.path)
      }
      for (const alias of metadata.aliases || []) {
        this.aliases.set(alias, context.path)
      }
    }
  }
  
  async resolve(path, fragment) {
    const contextPath = this.index.get(`agent://${path}`) || 
                        this.aliases.get(path) ||
                        await this.fuzzyMatch(path)
    
    if (!contextPath) throw new Error(`Agent not found: ${path}`)
    return this.loadContext(contextPath, fragment)
  }
}
```

### Discovery Benefits
1. **Zero Configuration** - No mapping files needed
2. **Multiple Addresses** - One context, many ways to reach it
3. **Fuzzy Matching** - `cortisol` matches `cortisol_guardian`
4. **Self-Organizing** - System discovers structure automatically

## Implementation
Agent protocol scans contexts/ on startup, builds index from metadata, provides fast resolution with fallback to fuzzy matching.