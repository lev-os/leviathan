# POC: Open WebUI Leviathan Integration

## Hypothesis
Open WebUI can serve as the missing web platform layer for Leviathan, providing a visual interface for our agent system, memory management, and workflow orchestration while maintaining LLM-first principles.

## Approach
1. **Phase 1**: Create Leviathan adapter for Open WebUI backend
2. **Phase 2**: Bridge Open WebUI plugins to @lev-os ecosystem  
3. **Phase 3**: Implement memory visualization for 5-type system
4. **Phase 4**: Add MCP tool interface

## Success Criteria
- [ ] Open WebUI can communicate with Leviathan agent via MCP
- [ ] Memory system visualization shows all 5 types
- [ ] Workflow YAML files can be edited visually
- [ ] Plugin bridge allows @lev-os plugin usage
- [ ] Session management UI works with existing sessions
- [ ] Performance acceptable (<500ms added latency)

## Timeline
- Day 1: Architecture analysis and adapter design
- Day 2: Basic Leviathan adapter implementation
- Day 3: Memory visualization prototype
- Day 4: Plugin bridge exploration
- Day 5: Performance testing and decision

## Technical Approach

### Architecture Alignment
```
Open WebUI Frontend (SvelteKit)
         ↓
Open WebUI Backend (Python/FastAPI)
         ↓
[NEW] Leviathan Adapter Layer
         ↓
Leviathan Agent (Node.js/MCP)
```

### Key Integration Points
1. **API Bridge**: Python FastAPI → Node.js MCP server
2. **Plugin System**: Open WebUI plugins → @lev-os plugins
3. **Memory Viz**: Graphiti queries → UI components
4. **Session State**: File system sessions → UI state

### Risk Mitigation
- **Python/Node.js Bridge**: Use HTTP/WebSocket for communication
- **Performance**: Cache frequently accessed data
- **Type Safety**: Generate TypeScript types from Python schemas

## Results
[To be documented during POC]

## Decision
[GO/NO-GO with rationale after POC completion]

## Next Steps
[ADR creation if GO, archive if NO-GO]