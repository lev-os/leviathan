# 🚀 Quick Start Guide - Run the POC

## Option 1: Automated Setup (Recommended)

### Step 1: Navigate to POC Directory
```bash
cd ~/lev/workshop/pocs/open-webui-leviathan
```

### Step 2: Run Setup Script
```bash
./scripts/setup.sh
```
This will:
- Create Python virtual environment
- Install all dependencies
- Check if Leviathan agent is running
- Create configuration files
- Run validation tests

### Step 3: Start the Adapter
```bash
./run_adapter.sh
```

## Option 2: Manual Setup

### Step 1: Navigate and Setup Python Environment
```bash
cd ~/lev/workshop/pocs/open-webui-leviathan

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r src/requirements.txt
```

### Step 2: Start Leviathan Agent (if not running)
```bash
# In a separate terminal
cd ~/lev/agent
npm run dev
```

### Step 3: Start the Adapter
```bash
# Back in POC directory
source venv/bin/activate
python src/leviathan_adapter.py
```

## 🧪 Testing the POC

### Test 1: Basic Health Check
```bash
curl http://localhost:8081/health
```
**Expected Response:**
```json
{
  "adapter_status": "healthy",
  "leviathan_connection": "healthy",
  "config": {...},
  "cache_stats": {...}
}
```

### Test 2: Chat Completion (Basic)
```bash
curl -X POST http://localhost:8081/v1/chat/completions \
  -H 'Content-Type: application/json' \
  -d '{
    "messages": [{"role": "user", "content": "Hello, how are you?"}],
    "model": "leviathan-agent",
    "session_id": "test-123"
  }'
```

### Test 3: Memory Query (Semantic)
```bash
curl -X POST http://localhost:8081/v1/chat/completions \
  -H 'Content-Type: application/json' \
  -d '{
    "messages": [{"role": "user", "content": "What do you remember about React hooks?"}],
    "model": "leviathan-agent",
    "session_id": "test-memory"
  }'
```

### Test 4: Memory Dashboard
```bash
curl http://localhost:8081/v1/memory/dashboard
```

### Test 5: Memory Graph
```bash
curl "http://localhost:8081/v1/memory/graph?center_concept=React&max_nodes=20"
```

## 🎨 Available Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | System health check |
| `/v1/models` | GET | List available models |
| `/v1/chat/completions` | POST | Main chat interface |
| `/v1/memory/dashboard` | GET | Memory system dashboard |
| `/v1/memory/graph` | GET | Memory relationship graph |
| `/v1/memory/types/{type}` | GET | Individual memory type details |
| `/v1/memory/query` | POST | Direct memory queries |
| `/v1/session/checkpoint` | POST | Session state management |

## 🐛 Troubleshooting

### Adapter Won't Start
```bash
# Check Python virtual environment
source venv/bin/activate
pip list | grep fastapi

# Check if port is in use
lsof -i :8081
```

### Leviathan Connection Failed
```bash
# Check if Leviathan agent is running
curl http://localhost:3001/health

# Start Leviathan agent
cd ~/lev/agent && npm run dev
```

### Memory Queries Return Errors
- **Expected**: Memory queries will return mock data when Leviathan agent is not fully configured
- **Solution**: This is normal for POC - the adapter handles errors gracefully

### Performance Testing
```bash
# Run performance benchmarks
cd ~/lev/workshop/pocs/open-webui-leviathan
source venv/bin/activate
python -m pytest src/test_memory_integration.py::test_memory_performance_benchmarks -v
```

## 📊 What You'll See

### Successful Startup
```
🚀 Starting Leviathan Adapter...
   Adapter URL: http://localhost:8081
   Leviathan URL: http://localhost:3001
   Logs: adapter.log

INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8081
```

### Memory Query Translation
```
INFO:     Calling Leviathan MCP tool: memory_query
INFO:     Request translated: OpenWebUI → memory_query (semantic)
INFO:     Response processed: 150ms total latency
```

### Dashboard Data
```json
{
  "memory_types": {
    "semantic": {"total_entries": 1247, "health_score": 0.94},
    "episodic": {"total_sessions": 156, "success_rate": 0.89},
    "procedural": {"total_patterns": 67, "avg_success_rate": 0.91},
    "working": {"active_context_size": "3.2KB"},
    "temporal": {"tracked_patterns": 34}
  },
  "system_health": {"overall_score": 0.93}
}
```

## 🎯 Success Indicators

✅ **Adapter starts without errors**  
✅ **Health endpoint returns 200**  
✅ **Chat completions work (with or without Leviathan)**  
✅ **Memory queries route correctly**  
✅ **Dashboard returns structured data**  
✅ **Performance under 500ms**  

## 🔧 Advanced Configuration

### Environment Variables
Create `.env` file:
```bash
LEVIATHAN_MCP_URL=http://localhost:3001
ADAPTER_PORT=8081
DEBUG=true
ENABLE_CACHING=true
TIMEOUT_SECONDS=30
```

### Custom Memory Configuration
Edit `src/leviathan_adapter.py`:
```python
# Adjust memory query routing
def translate_openwebui_to_mcp(self, request):
    # Custom logic for your use case
    pass
```

---

**Ready to run!** The POC demonstrates all major features even if Leviathan agent isn't fully configured.