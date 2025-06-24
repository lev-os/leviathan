# 🎨 Kingly OS GUI Interfaces

This directory contains multiple GUI interfaces for the Kingly OS, from simple desktop apps to modern web deployments.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Activate conda environment
source ~/digital/_infra/tools/activate-ai-ml.sh

# Install GUI dependencies
pip install -r requirements-gui.txt
```

### 2. Choose Your Interface

## 🖥️ Option 1: Gooey Desktop GUI (Fastest)

**One-line conversion from CLI to GUI!**

```bash
python kingly-gui.py "Build an API for user authentication"
```

Or launch the interactive GUI:

```bash
python kingly-gui.py
```

**Features:**
- ✅ Zero configuration
- ✅ Native desktop experience
- ✅ Form-based input with dropdowns
- ✅ Progress tracking
- ✅ Save conversations
- ❌ Limited customization

**Screenshot Example:**
```
┌─────────────────────────────────────┐
│ Kingly OS                           │
├─────────────────────────────────────┤
│ Task/Message:                       │
│ ┌─────────────────────────────────┐ │
│ │ Write a blog post about AI      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Response Style: [Technical     ▼]   │
│ Response Format: [Numbered     ▼]   │
│                                     │
│ [Send] [Cancel]                     │
└─────────────────────────────────────┘
```

## 🎯 Option 2: Textual Modern TUI

**Beautiful terminal UI that can deploy to web!**

```bash
# Run as terminal app
python kingly-textual.py

# Deploy to web (in separate terminal)
textual-web --app kingly-textual:app --port 8080
# Then open http://localhost:8080
```

**Features:**
- ✅ Modern, responsive interface
- ✅ Real-time updates
- ✅ Agent status indicators
- ✅ Confidence meters
- ✅ Web deployment ready
- ✅ Dark/light themes

**Interface Preview:**
```
┌─ Kingly OS ─────────────────────────┐
│ 💬 Chat | ⚙️ Settings | 📊 Metrics │
├─────────────────────────────────────┤
│ Active: [Researcher] Writer Dev QA  │
│ Confidence: ████████░░ 80%          │
├─────────────────────────────────────┤
│ 👤 User                             │
│ Build an API for authentication     │
│                                     │
│ 🤖 Agent | Mode: workflow           │
│ Using api-development workflow...   │
│                                     │
│ [Type message...] [Send]            │
└─────────────────────────────────────┘
```

## 🌐 Option 3: Web Server + API

**Full web deployment with REST and WebSocket APIs**

```bash
# Start web server
python web-server.py

# Access at http://localhost:8000
```

**Endpoints:**
- `/` - Web interface with options
- `/docs` - Interactive API documentation
- `/api/process` - REST API endpoint
- `/ws` - WebSocket for real-time communication

**Features:**
- ✅ REST API with FastAPI
- ✅ WebSocket support
- ✅ Auto-generated API docs
- ✅ CORS enabled
- ✅ Multiple client support

## 📋 Usage Examples

### Gooey GUI Examples

```bash
# Basic usage
python kingly-gui.py "Debug this authentication issue"

# With options
python kingly-gui.py "Write documentation" --style creative --format markdown

# Save conversation
python kingly-gui.py "Create API" --save-conversation my-session.json

# Verbose mode
python kingly-gui.py "Analyze code" --verbose
```

### Textual TUI Examples

```python
# The Textual app is fully interactive
# Just run and use the interface:
python kingly-textual.py

# Keyboard shortcuts:
# Ctrl+L - Clear conversation
# Ctrl+S - Save conversation  
# Tab - Switch between input areas
# Ctrl+Tab - Switch tabs
```

### Web API Examples

```python
# Using httpx
import httpx

# REST API
response = httpx.post("http://localhost:8000/api/process", json={
    "user": "dev-user",
    "message": "Create a REST API for user management",
    "style": "technical",
    "response_format": "markdown"
})
print(response.json())

# WebSocket
import websockets
import asyncio

async def chat():
    async with websockets.connect("ws://localhost:8000/ws") as ws:
        await ws.send(json.dumps({
            "type": "process",
            "user": "ws-user",
            "message": "Build a chat application"
        }))
        result = await ws.recv()
        print(json.loads(result))
```

### cURL Examples

```bash
# Health check
curl http://localhost:8000/health

# Process request
curl -X POST http://localhost:8000/api/process \
  -H "Content-Type: application/json" \
  -d '{
    "user": "cli-user",
    "message": "Write unit tests for auth module",
    "style": "technical"
  }'

# List agents
curl http://localhost:8000/api/agents

# List workflows  
curl http://localhost:8000/api/workflows
```

## 🔧 Configuration

### Bridge Modes

The Python bridge (`kingly_bridge.py`) supports two modes:

1. **subprocess** (default) - Runs Node.js directly
   - No additional setup needed
   - Slightly slower startup
   - Good for development

2. **http** - Connects to MCP server
   - Requires `npm run mcp` running
   - Faster responses
   - Better for production

### Environment Variables

```bash
# For HTTP mode
export KINGLY_API_URL=http://localhost:3001

# For custom Node.js path
export NODE_PATH=/usr/local/bin/node
```

## 🚀 Deployment

### Deploy Textual to Web

```bash
# Install textual-web
pip install textual-web

# Deploy with custom port
textual-web --app kingly-textual:app --host 0.0.0.0 --port 8080

# With authentication (production)
textual-web --app kingly-textual:app --auth username:password
```

### Deploy FastAPI Web Server

```bash
# Development
uvicorn web-server:app --reload

# Production with Gunicorn
pip install gunicorn
gunicorn web-server:app -w 4 -k uvicorn.workers.UvicornWorker

# With Docker
docker build -t kingly-web .
docker run -p 8000:8000 kingly-web
```

### Serve with Nginx

```nginx
server {
    listen 80;
    server_name kingly.example.com;
    
    # Main web app
    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # Textual UI
    location /terminal {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 🎨 Customization

### Gooey Themes

Edit `kingly-gui.py` to customize:

```python
@Gooey(
    program_name="My Custom Kingly",
    default_size=(1000, 700),
    image_dir="./images",
    menu_bgcolor="#2a2a2a",
    body_bg_color="#1a1a1a",
    header_bg_color="#4a9eff"
)
```

### Textual Themes

Modify the CSS in `kingly-textual.py`:

```css
.message-container {
    background: $boost;
    border: tall $accent;
}
```

### Web UI Customization

Add custom static files:

```
static/
├── css/
│   └── custom.css
├── js/
│   └── app.js
└── images/
    └── logo.png
```

## 🐛 Troubleshooting

### Common Issues

1. **ImportError: No module named 'gooey'**
   ```bash
   pip install gooey wxPython
   ```

2. **Textual-web not found**
   ```bash
   pip install textual-web
   ```

3. **Node.js connection failed**
   - Check Node.js is installed: `node --version`
   - For HTTP mode, ensure MCP server is running: `npm run mcp`

4. **wxPython installation fails on macOS**
   ```bash
   # Use conda instead
   conda install -c conda-forge wxpython
   ```

5. **WebSocket connection refused**
   - Check firewall settings
   - Ensure port 8000 is not in use

## 📚 Resources

- [Gooey Documentation](https://github.com/chriskiehl/Gooey)
- [Textual Guide](https://textual.textualize.io/)
- [FastAPI Tutorial](https://fastapi.tiangolo.com/)
- [Textual-web Docs](https://github.com/Textualize/textual-web)

## 🎉 Next Steps

1. **Quick Demo**: Try Gooey first for instant GUI
2. **Modern Experience**: Use Textual for production
3. **Web Scale**: Deploy with FastAPI for multi-user access
4. **Customize**: Modify themes and layouts to match your brand

Enjoy your new Kingly OS GUI interfaces! 🚀