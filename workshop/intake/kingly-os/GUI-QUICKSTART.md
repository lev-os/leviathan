# 🚀 Kingly OS GUI Quick Start

## Option 1: Tkinter GUI (Built-in, No Dependencies!)

**This is the easiest option - tkinter comes with Python!**

```bash
python kingly-gui-tk.py
```

**Features:**
- ✅ No external dependencies
- ✅ Works on all platforms
- ✅ Clean, native interface
- ✅ All features included

## Option 2: Textual TUI (Modern Terminal UI)

```bash
# Already installed!
python kingly-textual.py
```

**Features:**
- ✅ Beautiful terminal interface
- ✅ Can be deployed to web
- ✅ Keyboard shortcuts
- ✅ Real-time updates

**Controls:**
- `Tab` - Navigate between fields
- `Enter` - Send message (in input field)
- `Ctrl+Tab` - Switch tabs
- `Ctrl+Q` - Quit

## Option 3: Web Deployment

### A. Run Textual in Browser

```bash
# Install textual-web
pip install textual-web

# Deploy to browser
textual-web --app kingly-textual:app --port 8080

# Open http://localhost:8080
```

### B. Run FastAPI Web Server

```bash
# Install dependencies
pip install fastapi uvicorn

# Start server
python web-server.py

# Open http://localhost:8000
```

## 🎯 Which Should I Use?

- **Quick Desktop GUI**: Use `kingly-gui-tk.py` - it just works!
- **Terminal Power User**: Use `kingly-textual.py`
- **Share with Others**: Use web deployment options
- **API Integration**: Use `web-server.py`

## 🐛 Troubleshooting

### Tkinter GUI Issues
```bash
# On macOS, if tkinter is missing:
brew install python-tk

# On Ubuntu/Debian:
sudo apt-get install python3-tk
```

### Textual Issues
```bash
# Update to latest version
pip install --upgrade textual

# Run in debug mode
textual run --dev kingly-textual.py
```

### All GUIs
```bash
# Make sure you're in the right directory
cd /Users/jean-patricksmith/digital/kingly/core/agent/workshop/kingly-os

# Check Node.js is working (for subprocess mode)
node --version

# Or start MCP server first (for http mode)
npm run mcp
```

## 🚀 Start Now!

The easiest way to get started:

```bash
python kingly-gui-tk.py
```

Type your message and hit Send! 🎉