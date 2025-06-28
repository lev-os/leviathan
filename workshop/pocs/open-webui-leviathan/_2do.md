# Open WebUI + Leviathan Integration POC - TODO

## 🧠 5-Type Memory System
The adapter implements a cognitive memory model based on human memory:

1. **Semantic Memory** (Facts & Knowledge)
   - What: Stores facts, concepts, API docs, language knowledge
   - Example: "React hooks are functions that let you use state"
   - Storage: Vector embeddings in Graphiti for semantic search

2. **Episodic Memory** (Experiences & Events)
   - What: Past conversations, session history, user interactions
   - Example: "In our last session, user struggled with useEffect"
   - Storage: Time-stamped session records with outcomes

3. **Procedural Memory** (How-To & Skills)
   - What: Step-by-step workflows, coding patterns, best practices
   - Example: "To create a React component: 1) Create file 2) Define props..."
   - Storage: Pattern library with success rates

4. **Working Memory** (Current Context)
   - What: Active conversation, current variables, immediate context
   - Example: Current task, conversation thread, active files
   - Storage: In-memory session state (ephemeral)

5. **Temporal Memory** (Patterns Over Time)
   - What: Time-based patterns, trends, usage analytics
   - Example: "User codes best in morning, makes more errors after 6pm"
   - Storage: Time-series data with pattern recognition

## ✅ Completed

- [x] Day 1: Architecture analysis and integration strategy
- [x] Day 2: Core adapter implementation with smart routing
- [x] Day 3: 5-type memory system integration with visualization
- [x] Port management: Auto-increment from 7893/7894 base
- [x] PID lock: Single instance enforcement
- [x] Unified start script: `start-all.sh` for complete system
- [x] E2E test suites: API and MCP BDD tests

## 🚀 To Run Everything

```bash
# Complete system startup (Docker + Adapter + Leviathan)
./start-all.sh

# Just the adapter
./run_adapter.sh

# Run E2E tests
pytest tests/test_api_e2e.py -v
pytest tests/test_mcp_e2e.py -v
```

## 📋 Remaining Tasks

### Day 4: Plugin Bridge & Production
- [ ] Implement @lev-os plugin discovery
- [ ] Create Python → Node.js plugin execution bridge
- [ ] Add plugin management UI endpoints
- [ ] Performance optimization (caching, connection pooling)
- [ ] Production deployment guide

### Day 5: Integration & Decision
- [ ] Configure Open WebUI to use adapter
- [ ] Full system integration testing
- [ ] Performance benchmarking under load
- [ ] Create ADR for integration decision
- [ ] Final GO/NO-GO decision

### Production Readiness
- [ ] Docker Compose for entire stack
- [ ] Environment-based configuration
- [ ] Comprehensive logging and monitoring
- [ ] Security: API key validation
- [ ] Rate limiting and throttling
- [ ] Backup and recovery procedures

### Documentation
- [ ] Complete API documentation
- [ ] Memory system usage guide
- [ ] Plugin development guide
- [ ] Troubleshooting guide
- [ ] Performance tuning guide

## 🔧 Configuration

### Ports
- Base Port: 7893 (Leviathan MCP)
- Adapter Port: 7894 (auto-increments if taken)
- Open WebUI: 3000 (Docker container)

### Memory Dashboard
Access at: `http://localhost:7894/v1/memory/dashboard`

Shows:
- Health scores for all 5 memory types
- Recent queries and response times
- System recommendations
- Performance metrics

### Integration Points
1. Open WebUI → Adapter: HTTP/REST API
2. Adapter → Leviathan: MCP Protocol
3. Memory System: 5-type cognitive model
4. Session Management: Cross-tab continuity

## 🧪 Testing

### Run All Tests
```bash
cd ~/lev/workshop/pocs/open-webui-leviathan
source venv/bin/activate
pytest tests/ -v
```

### Test Coverage
- API endpoints (health, chat, memory)
- MCP protocol translation
- Memory type routing
- Error handling
- Performance (<500ms requirement)
- Session management

## 📊 Success Metrics

- [x] Architecture validated ✅
- [x] Core adapter working ✅
- [x] Memory system integrated ✅
- [x] Performance < 500ms ✅
- [ ] Plugin bridge functional
- [ ] Production deployment ready

## 🎯 Decision Criteria

**Current Status**: 95% confidence for GO
- Technical feasibility proven
- Performance requirements met
- Memory system fully integrated
- Clear path to production

**Remaining Validation**:
- Plugin system compatibility
- Production load testing
- Security review