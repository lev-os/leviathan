# ADR Checklist - AI/ML Research & Integration Tools

Based on the intake analysis completed on 2025-06-24, the following ADRs should be created:

## High Priority ADRs

### 1. ADR-001-visual-memory-architecture

**Title**: Adding Vision Capabilities to Leviathan Memory System  
**Context**: Integration of JEPA models for visual understanding  
**Decision Driver**: No current vision/image processing capabilities  
**Key Points**:

- Add visual memory type to existing 5 memory types
- Use JEPA latent space representations (not pixels)
- Integration with v-jepa and ijepa patterns from \_ref/ml-research/
- Enable screenshot/image/video memory storage

### 2. ADR-002-browser-automation-integration

**Title**: Browser Control Patterns for AI Agents  
**Context**: Integration of browser-use patterns  
**Decision Driver**: No browser automation beyond test harnesses  
**Key Points**:

- Add browser control MCP tools
- Integrate browser-use patterns from \_ref/integration-tools/
- Memory integration for web interaction history
- Multi-tab coordination with existing job system

### 3. ADR-003-continual-learning-framework

**Title**: Agent Adaptation and Learning Over Time  
**Context**: Integration of Avalanche continual learning  
**Decision Driver**: No agent evolution or adaptation capabilities  
**Key Points**:

- Add learning metrics to episodic memory
- Integrate Avalanche strategies from \_ref/ml-research/
- Performance tracking and adaptation
- Prevent catastrophic forgetting

## Medium Priority ADRs

### 4. ADR-004-mcp-server-enhancement

**Title**: Advanced MCP Server Patterns Adoption  
**Context**: Integration of FastMCP patterns  
**Decision Driver**: Basic MCP tools lack advanced features  
**Key Points**:

- Add session management to MCP server
- Standard Schema support (Zod, ArkType, Valibot)
- HTTP streaming and SSE compatibility
- Auth and progress notification patterns

### 5. ADR-005-agent-orchestration-patterns

**Title**: Capability-Based Agent Architecture Enhancement  
**Context**: Integration of agent-cli patterns  
**Decision Driver**: Limited agent orchestration beyond 3-tab system  
**Key Points**:

- Capability registration system
- Natural language request routing
- Interactive terminal UI improvements
- Context maintenance patterns

## Implementation Order

1. **Vision Memory** - Enables new class of capabilities
2. **Browser Automation** - Immediate practical value
3. **Continual Learning** - Long-term agent improvement
4. **MCP Enhancement** - Developer experience improvement
5. **Agent Orchestration** - Architecture refinement

## Success Metrics

- [ ] Agents can process and remember visual content
- [ ] Browser automation available via MCP tools
- [ ] Agents adapt and improve over time
- [ ] Enhanced MCP server with sessions/auth
- [ ] More flexible agent orchestration

## Resources

- Extracted patterns in `_ref/ml-research/` and `_ref/integration-tools/`
- Full analysis in `workshop/analysis/ml.md`
- Original intake projects cleaned from `workshop/intake/`
