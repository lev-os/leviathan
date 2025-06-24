# 🚀 Kingly OS Setup Guide

## Quick Start (Local, No API Keys)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Demo
```bash
# Run with simulation (no LLM needed)
npm run demo
```

## 🐍 Alternative: Conda Integration (AI/ML Environment)

If you have the `ai-ml-shared` conda environment:

### 1. Update .env
```bash
PRIMARY_LLM_PROVIDER=transformers
TRANSFORMERS_MODEL_PATH=/Users/jean-patricksmith/i/models
TRANSFORMERS_MODEL_NAME=TinyLlama/TinyLlama-1.1B-Chat-v1.0
CONDA_ENV=ai-ml-shared
```

### 2. Install Transformers (if not already installed)
```bash
source ~/digital/_infra/tools/activate-ai-ml.sh
pip install transformers accelerate
```

### 3. Run with Transformers
```bash
npm run dev
```

Note: First run will download the model (~637MB for TinyLlama)

## 🔌 API Integration Setup

### 1. Copy Environment File
```bash
cp .env.example .env
```

### 2. Choose Your Provider

#### Option A: Groq (Fast & Cheap - $0.10/1M tokens)
```bash
# Add to .env
PRIMARY_LLM_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
```

#### Option B: OpenRouter (Free Tier Available)
```bash
# Add to .env
PRIMARY_LLM_PROVIDER=openrouter
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
```

#### Option C: Local Ollama (Free, No API Key)
```bash
# Already configured in .env
PRIMARY_LLM_PROVIDER=ollama
OLLAMA_MODEL=tinyllama
```

### 3. Run with Real LLM
```bash
pnpm dev
```

## 🌐 MCP Server (Bidirectional Communication)

### 1. Start MCP Server
```bash
pnpm mcp
```

### 2. Connect via WebSocket
- **WebSocket**: `ws://localhost:3001`
- **HTTP API**: `http://localhost:3001/api/process`
- **Health Check**: `http://localhost:3001/health`

### 3. Test MCP Tools
```bash
curl -X POST http://localhost:3001/tools/kingly-process-request \
  -H "Content-Type: application/json" \
  -d '{
    "arguments": {
      "user": "test-user",
      "message": "Write a technical blog post about microservices"
    }
  }'
```

## 🤖 Claude Code Integration

### 1. Use the Adapter
```javascript
import { claudeCodeAdapter } from './claude-code-adapter.js';

// Process a task without using tokens
const result = await claudeCodeAdapter.processTask(
  'Analyze this codebase for performance issues'
);

console.log(result.claudeCode.suggestedApproach);
console.log(result.claudeCode.toolRecommendations);
```

### 2. Get Just Context (No LLM Call)
```javascript
const contextInfo = await claudeCodeAdapter.getContextOnly(
  'Debug the authentication system'
);

// Use contextInfo.context with your own LLM calls
```

## 📊 System Features

### Intelligent Routing
- **Workflow Mode**: Predefined multi-agent sequences
- **Learning Mode**: Parallel experiments for complex tasks  
- **Default Mode**: Single agent with optimal context

### User Preferences
```javascript
// Set your coding style
kinglyOS.setUserPreference('user', 'style', 'technical');
kinglyOS.setUserPreference('user', 'responseFormat', 'numbered');
```

### Custom Workflows
```javascript
// Add development workflow
kinglyOS.addWorkflow('api-dev', {
  trigger: /api.*develop|build.*api/i,
  agents: ['researcher', 'dev', 'qa'],
  sequence: 'sequential'
});
```

### Learning & Feedback
```javascript
// System learns from your feedback
kinglyOS.completeInteraction('user', {
  success: true,
  quality: 0.9,
  feedback: 'Perfect debugging approach!'
});
```

## 🛠️ Available Commands

```bash
# Development
pnpm demo          # Run demo (simulation mode)
pnpm local         # Run with local Ollama
pnpm dev           # Run with API providers
pnpm mcp           # Start MCP server

# Testing
pnpm test          # Run all tests
pnpm test:watch    # Watch mode testing

# Setup
pnpm install-ollama # Install Ollama (macOS/Linux)
```

## 🎯 Model Recommendations

### Ultra-Fast Local Models
- **tinyllama** (637MB) - Extremely fast, good for development
- **smollm2** (80MB) - Fastest inference, minimal resources
- **qwen2:0.5b** (394MB) - Good balance of speed and quality

### Cloud Models (with API keys)
- **Groq/llama-3.1-8b-instant** - Fastest cloud option
- **OpenRouter/llama-3.1-8b-instruct:free** - Free tier
- **OpenAI/gpt-4o-mini** - High quality, reasonable cost

## 🔍 Troubleshooting

### Ollama Issues
```bash
# Check Ollama status
ollama list

# Restart Ollama service
sudo systemctl restart ollama  # Linux
brew services restart ollama   # macOS
```

### API Key Issues
- Verify API keys in `.env` file
- Check provider status at their websites
- Try fallback provider (set `FALLBACK_LLM_PROVIDER`)

### Port Conflicts
```bash
# Change MCP server port
MCP_SERVER_PORT=3002 pnpm mcp
```

## 🎉 You're Ready!

The Kingly OS now gives you:
- ✅ **No Token Usage** with Claude Code Adapter
- ✅ **Real LLM Integration** when you want it
- ✅ **Bidirectional MCP** communication
- ✅ **Learning & Adaptation** from your usage patterns
- ✅ **Intelligent Agent Routing** based on task complexity

Start with `pnpm demo` to see it in action! 🚀