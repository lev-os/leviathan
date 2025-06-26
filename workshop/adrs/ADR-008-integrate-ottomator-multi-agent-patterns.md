# ADR-008: Integrate Ottomator Multi-Agent Orchestration Patterns

## Status
APPROVED - Pattern Extraction

## Context
Leviathan currently has a critical gap in multi-agent orchestration. The capability matrix shows:
- **Current**: Limited to 3-tab coordination
- **Gap**: No true swarm intelligence, agent specialization, or work delegation
- **Problem**: LLM overwhelm when too many tools are available to a single agent

Ottomator-agents provides a proven solution through the "mcp-agent-army" pattern.

## Decision
Extract and adapt the Ottomator multi-agent orchestration pattern for Leviathan:

### 1. Primary Orchestrator + Specialized Subagents Pattern
```python
# Ottomator Pattern (Simplified)
class PrimaryAgent:
    subagents = {
        "github": GitHubAgent(mcp_tools=["repo", "issues", "pr"]),
        "slack": SlackAgent(mcp_tools=["message", "channel", "user"]),
        "filesystem": FileAgent(mcp_tools=["read", "write", "search"]),
        # ... 6 specialized agents total
    }
    
    async def process_request(self, user_input):
        analysis = await self.analyze_intent(user_input)
        target_agent = self.route_to_agent(analysis.domain)
        return await target_agent.execute(user_input, analysis)
```

### 2. Leviathan Adaptation Strategy
- **Keep**: Orchestration pattern, agent specialization, tool isolation
- **Adapt**: Use @lev-os plugin architecture instead of direct MCP servers
- **Enhance**: Add Leviathan's constitutional AI and bidirectional flow

### 3. Integration Architecture
```yaml
leviathan_multi_agent:
  orchestrator: "@lev-os/orchestrator"
  specialized_agents:
    - "@lev-os/github-agent"
    - "@lev-os/memory-agent" 
    - "@lev-os/filesystem-agent"
    - "@lev-os/web-agent"
    - "@lev-os/workflow-agent"
    - "@lev-os/intelligence-agent"
```

## Rationale

### Advantages
1. **Solves LLM Overwhelm**: Each agent has focused tool set (3-8 tools max)
2. **Proven Pattern**: Ottomator demonstrates this works in production
3. **Leviathan Compatible**: Fits @lev-os plugin architecture perfectly
4. **Educational Value**: 50+ reference implementations for patterns

### Alignment with Leviathan Principles
- **LLM-First**: Each subagent optimized for LLM reasoning
- **Bootstrap Sovereignty**: Self-contained agent specializations
- **Maximum Extensibility**: Plugin-based agent architecture
- **Constitutional Framework**: Values-based routing and decision making

## Implementation Plan

### Phase 1: Core Orchestrator (Week 1)
- Extract orchestration logic from mcp-agent-army
- Adapt for @lev-os plugin loading
- Implement intent analysis and routing

### Phase 2: Essential Agents (Week 2)  
- GitHub agent (repository operations)
- Memory agent (unified memory interface)
- Filesystem agent (file operations)

### Phase 3: Advanced Agents (Week 3)
- Web agent (search, scraping, API calls)
- Workflow agent (task orchestration)
- Intelligence agent (analysis, reasoning)

### Phase 4: Integration (Week 4)
- MCP protocol compliance
- Constitutional AI integration
- Bidirectional flow support

## Alternatives Considered

### Alternative 1: Build from Scratch
- **Rejected**: Ottomator pattern is proven and saves 4-6 weeks development
- **Risk**: Unknown edge cases and LLM overwhelm patterns

### Alternative 2: Adopt Ottomator Directly
- **Rejected**: Not aligned with Leviathan's @lev-os architecture
- **Issue**: Docker-heavy, not sovereignty-focused

### Alternative 3: Wait for External Solutions
- **Rejected**: Multi-agent orchestration is core to Leviathan's value proposition
- **Timing**: Critical gap needs immediate solution

## Success Metrics

### Technical Metrics
- **Tool Distribution**: Max 8 tools per specialized agent
- **Response Quality**: Maintain or improve vs single-agent baseline
- **Latency**: <2x overhead for agent routing
- **Reliability**: 99%+ successful task delegation

### Strategic Metrics
- **LLM Overwhelm Reduction**: Measured via prompt token reduction
- **Capability Expansion**: Support for 30+ specialized tools across agents
- **Plugin Ecosystem**: Enable third-party agent development

## Risks and Mitigations

### Risk 1: Complexity Increase
- **Mitigation**: Start with 3 essential agents, expand gradually
- **Fallback**: Single-agent mode for simple tasks

### Risk 2: Agent Coordination Overhead
- **Mitigation**: Async orchestration, minimal inter-agent communication
- **Monitoring**: Track delegation success rates

### Risk 3: Leviathan Architecture Mismatch
- **Mitigation**: Prototype integration with existing @lev-os patterns
- **Validation**: Constitutional compliance testing

## Next Actions

1. **Create @lev-os/orchestrator package** (Jean-Patrick)
2. **Extract mcp-agent-army core logic** (Development team)
3. **Design agent specification schema** (Architecture team)
4. **Prototype with 2-3 specialized agents** (Implementation team)

---

**Approval**: Architectural Decision Committee  
**Implementation Owner**: Leviathan Core Team  
**Review Date**: 2025-07-10