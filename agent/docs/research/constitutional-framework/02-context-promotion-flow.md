# Context Promotion Flow: From Local Innovation to Global Intelligence

## The Promotion vs Share/Globalize Question

**Current Thinking**: Instead of "moving" contexts between levels, we **track and reference** them with intelligent inheritance. This preserves the original innovation while enabling global access.

### Track-and-Reference Model
```yaml
# ~/.kingly/registry/promoted-contexts.yaml
tracked_contexts:
  - source: "/Users/jean/project-alpha/.kingly/contexts/agents/data-analyst"
    global_ref: "personal://agents/data-analyst"  
    promotion_date: "2024-01-15"
    usage_metrics:
      projects_used: 5
      effectiveness_score: 0.92
      constitutional_compliance: 0.98
    
  - source: "/Users/jean/project-beta/.kingly/contexts/workflows/user-research"
    global_ref: "personal://workflows/user-research"
    shared_publicly: true
    community_ref: "@jean/workflow-user-research"
```

**Benefits**:
- Original context stays in place with full history
- Global reference enables cross-project usage
- Source attribution preserved automatically
- Natural versioning through source evolution

## Three-Phase Promotion Pipeline

### Phase 1: Local Validation (Automatic)
**Triggers**: Context usage and effectiveness tracking

```javascript
// Automatic tracking in project usage
const contextMetrics = {
  usage_count: 12,
  success_rate: 0.89,
  user_satisfaction: 0.91,
  constitutional_compliance: 0.95,
  documentation_quality: 0.73
};

// Auto-qualification for promotion consideration
if (contextMetrics.meets_threshold()) {
  suggestPromotion(contextPath);
}
```

**No Barriers**: Any context can be created and used locally without restriction.

### Phase 2: Global Reference (User-Initiated)
**Command**: `kingly share global my-workflow`

```bash
# Share context to global reference
kingly share global ./contexts/agents/researcher
# Creates: personal://agents/researcher

# Use from any project
kingly use personal://agents/researcher

# Semantic discovery across all personal contexts
kingly find "data analysis" --scope personal
```

**Mechanism**:
1. **Effectiveness Validation**: Ensure context has proven value through usage
2. **Constitutional Compliance**: Validate against 6-principle framework
3. **Documentation Check**: Ensure basic usage documentation exists
4. **Reference Creation**: Create global pointer without moving source
5. **Semantic Indexing**: Add to personal semantic search database

### Phase 3: Community Sharing (Opt-in)
**Command**: `kingly share community personal://agents/researcher`

```bash
# Share to community registry
kingly share community personal://agents/researcher --name "@jean/agent-researcher"

# Community discovery
kingly discover "research automation"
# Suggests: @jean/agent-researcher, @community/research-assistant, @core/deep-researcher

# Install from community
kingly install @jean/agent-researcher
# Copies source to current project's .kingly/contexts/
```

**Community Validation Pipeline**:
1. **Multi-User Effectiveness**: Evidence from multiple users/projects
2. **Constitutional Compliance**: Strict 6-principle validation
3. **Community Curation**: Review by community maintainers
4. **Quality Documentation**: Comprehensive usage examples and guides
5. **Semantic Classification**: Proper tagging and categorization

## Intelligent Context Inheritance

### Reference Resolution System
```yaml
# context.yaml can reference any level
name: "enhanced-researcher"
extends: 
  - "personal://agents/researcher"      # Personal global context
  - "@community/agent-researcher"       # Community context
  - "@kingly/core/agents/base"         # Core framework

merge_strategy: "local_precedence"     # Local overrides global
constitutional_compliance: "inherit"   # Inherit compliance from parents
```

### Semantic Context Discovery
```bash
# Natural language discovery across all levels
kingly find "I need help with strategic planning"

# Results with source attribution:
# 1. ./contexts/workflows/strategic-planning    [local, used 3x]
# 2. personal://workflows/strategic-thinking    [global, used 12x] 
# 3. @community/strategic-planning-v2           [community, 89% rating]
# 4. @kingly/core/workflows/strategic-decision  [core, stable]
```

## Usage Flow Examples

### Individual Developer Workflow
```bash
# 1. Create local context for immediate need
cd my-project
kingly create agent data-analyst
# Edit: .kingly/contexts/agents/data-analyst.yaml

# 2. Use and iterate
kingly use ./contexts/agents/data-analyst
# Context proves valuable through repeated use

# 3. Share globally for reuse
kingly share global ./contexts/agents/data-analyst
# Now available as personal://agents/data-analyst

# 4. Use in other projects
cd other-project  
kingly use personal://agents/data-analyst

# 5. Eventually share with community
kingly share community personal://agents/data-analyst --name "@jean/data-analyst"
```

### Team Collaboration Workflow
```bash
# Team member creates valuable context
alice: kingly create workflow code-review
alice: kingly share community ./contexts/workflows/code-review --name "@alice/code-review"

# Other team members discover and use
bob: kingly discover "code review automation"
bob: kingly install @alice/code-review

# Local customization without breaking original
bob: kingly fork @alice/code-review --to ./contexts/workflows/code-review-backend
```

## Quality Gates and Validation

### Local Level: No Restrictions
- Create anything, experiment freely
- Constitutional compliance suggested but not enforced
- Maximum innovation and creativity encouraged

### Global Level: Proven Effectiveness  
```javascript
globalPromotionCriteria = {
  usage_count: >= 3,
  effectiveness_score: >= 0.7,
  constitutional_compliance: >= 0.8,
  documentation_exists: true
}
```

### Community Level: Multi-User Validation
```javascript
communityPromotionCriteria = {
  unique_users: >= 3,
  cross_project_effectiveness: >= 0.8,
  constitutional_compliance: >= 0.95,
  community_review: "approved",
  documentation_quality: >= 0.8
}
```

## Technical Implementation

### Context Registry Database
```javascript
// ~/.kingly/registry/context-registry.json
{
  "contexts": [
    {
      "id": "uuid-1234",
      "source_path": "/Users/jean/project/.kingly/contexts/agents/researcher",
      "global_ref": "personal://agents/researcher",
      "community_ref": "@jean/researcher",
      "created": "2024-01-10",
      "promoted_global": "2024-01-15", 
      "promoted_community": "2024-01-20",
      "usage_metrics": { /* ... */ },
      "semantic_embedding": [0.1, 0.2, /* ... */]
    }
  ]
}
```

### Reference Resolution Engine
```javascript
// Resolve context references across all levels
async function resolveContext(ref) {
  if (ref.startsWith('./')) return resolveLocal(ref);
  if (ref.startsWith('personal://')) return resolvePersonal(ref);
  if (ref.startsWith('@')) return resolveCommunity(ref);
  
  // Semantic fallback
  return await semanticSearch(ref);
}
```

This creates a **natural promotion pipeline** where valuable contexts organically rise from local innovation to community intelligence through proven effectiveness and constitutional compliance.