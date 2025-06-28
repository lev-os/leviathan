# Current POC Status

## ✅ What's Working

1. **Leviathan Adapter** - Running on port 7894
   - PID lock protection (only one instance)
   - Auto-incrementing port pairs (7893/7894)
   - Health endpoint functional
   - 5-type memory system architecture implemented

2. **Leviathan Agent** - Can be started separately
   - MCP tools registered (18 commands)
   - Auto-bootstrapped from command registry
   - Constitutional AI plugin loaded

3. **Infrastructure**
   - Virtual environment configured
   - All Python dependencies installed
   - Test suites created (BDD format)
   - Documentation complete

## 🚀 To Run Everything

### Option 1: Dev Mode (Recommended)
Run each in a separate terminal:

```bash
# Terminal 1 - Leviathan Agent
cd ~/lev/agent && npm run dev

# Terminal 2 - Docker Open WebUI
docker run -d --name open-webui -p 3002:8080 -v open-webui:/app/backend/data ghcr.io/open-webui/open-webui:main

# Terminal 3 - Adapter (already running with PID 61486)
cd ~/lev/workshop/pocs/open-webui-leviathan
source venv/bin/activate
python src/leviathan_adapter.py
```

### Option 2: Unified Script (Fixed)
```bash
./start-all.sh
```

## 📊 Access Points

- **Open WebUI**: http://localhost:3002
- **Adapter API**: http://localhost:7894
- **Memory Dashboard**: http://localhost:7894/v1/memory/dashboard
- **Health Check**: http://localhost:7894/health

## 🔧 Configuration for Open WebUI

1. Go to http://localhost:3002
2. Create account (first user is admin)
3. Settings → Connections → Add OpenAI API
4. URL: `http://localhost:7894/v1`
5. API Key: `any-key-works`
6. Select model: `leviathan-agent`

## 📁 Key Files

- `dev-start.sh` - Development guide showing how to run each component
- `start-all.sh` - Unified startup (Docker command now fixed)
- `test-adapter.sh` - Quick test script for adapter endpoints
- `_2do.md` - Complete task list and memory system documentation

## 🧪 Run Tests

```bash
cd ~/lev/workshop/pocs/open-webui-leviathan
source venv/bin/activate

# API tests
pytest tests/test_api_e2e.py -v

# MCP tests  
pytest tests/test_mcp_e2e.py -v
```

## 🛑 Stop Everything

```bash
# Stop adapter
kill $(cat /tmp/leviathan_adapter.pid)

# Stop Open WebUI
docker stop open-webui

# Stop Leviathan (if you started it)
# Ctrl+C in the terminal running npm run dev
```

## 📈 Next Steps

1. Start Open WebUI Docker container
2. Configure Open WebUI to use the adapter
3. Test the 5-type memory system integration
4. Complete Day 4 & 5 tasks from _2do.md