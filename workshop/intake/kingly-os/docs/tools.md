# 🛠️ Development Tools Reference

## REPL Tools

### Language-Specific REPLs

**Python**
- **IPython** - Enhanced Python REPL with syntax highlighting, auto-completion, magic commands
- **bpython** - Syntax highlighting, auto-indentation, inline syntax highlighting
- **ptpython** - Advanced Python REPL built on prompt_toolkit

**JavaScript/Node.js**
- **Node.js REPL** - Built-in REPL
- **Quokka.js** - Live scratchpad with inline results in VS Code
- **RunJS** - Desktop JavaScript playground

**Ruby**
- **Pry** - Powerful alternative to IRB with debugging capabilities
- **IRB** - Default Ruby REPL

**Clojure**
- **nREPL** - Network REPL with hot reloading
- **CIDER** - Clojure IDE for Emacs
- **Calva** - VS Code Clojure extension

**Other Languages**
- **Julia REPL** - Multi-mode REPL with package management
- **GHCi** - Haskell interactive environment
- **JShell** - Java 9+ REPL
- **cling** - C++ interpreter REPL
- **Ammonite** - Enhanced Scala REPL

### Universal/Polyglot REPLs
- **Jupyter** - Notebook interface supporting 40+ languages
- **Replit** - Online IDE with instant REPL for 50+ languages
- **Babel REPL** - JavaScript/TypeScript in browser
- **Google Colab** - Cloud-based Jupyter notebooks

## CLI to GUI Conversion Tools

### Python-Based Solutions

**Gooey**
- Website: https://github.com/chriskiehl/Gooey
- Description: Turn CLI apps into desktop GUIs with one decorator
- Pros: Dead simple, works with argparse/click/optparse
- Cons: Limited customization, wxPython dependency

**Textual**
- Website: https://github.com/Textualize/textual
- Description: Modern TUI framework that can deploy to web
- Pros: Beautiful, responsive, web deployment option
- Cons: More code required than Gooey

**PyWebIO**
- Website: https://github.com/pywebio/PyWebIO
- Description: Build web UIs with Python functions
- Pros: No HTML/JS needed, reactive
- Cons: Less styling control

**PySimpleGUI**
- Website: https://github.com/PySimpleGUI/PySimpleGUI
- Description: Simple Python GUI framework
- Pros: Cross-platform, extensive widgets
- Cons: Requires manual CLI integration

**Typer + FastAPI**
- Website: https://typer.tiangolo.com/
- Description: Modern CLI that can expose as API
- Pros: Same code for CLI/API, auto docs
- Cons: Need separate UI layer

### Web-Based Solutions

**Streamlit**
- Website: https://streamlit.io/
- Description: Data apps in pure Python
- Pros: Rapid prototyping, built-in widgets
- Cons: Opinionated layout

**Gradio**
- Website: https://gradio.app/
- Description: Web UIs for ML models
- Pros: Great for ML demos, shareable links
- Cons: Focused on ML use cases

**Dash**
- Website: https://dash.plotly.com/
- Description: Analytical web apps
- Pros: Rich visualizations, reactive
- Cons: Learning curve, verbose

**Panel**
- Website: https://panel.holoviz.org/
- Description: High-level app framework
- Pros: Works with notebooks, flexible
- Cons: Complex for simple apps

### Cross-Platform Desktop

**Electron + Node.js**
- Wrap any CLI in a desktop app
- Full web tech stack
- Heavy resource usage

**Tauri**
- Rust-based Electron alternative
- Smaller, faster binaries
- Newer ecosystem

**Webview**
- Lightweight native webview wrapper
- Small binaries
- Platform limitations

### CLI Parser Integration

**click-web**
- Auto-generate Flask app from Click CLI
- Simple web forms
- Limited to Click

**fire-web**
- Web UI for Google Fire CLIs
- Automatic interface generation
- Basic styling

**docopt-gui**
- GUI from docopt specifications
- Clean argument parsing
- Limited adoption

## Web Deployment Options

### For Python TUIs/CLIs

**Textual-web**
- Deploy Textual apps to web
- WebSocket-based terminal
- Full TUI features in browser

**FastAPI + HTMX**
- Modern async Python web framework
- Dynamic HTML without JavaScript
- Great for progressive enhancement

**Flask/Django**
- Traditional web frameworks
- Full control over UI
- More boilerplate

### Terminal in Browser

**xterm.js**
- Terminal emulator for web
- Used by VS Code, Jupyter
- Full terminal features

**Terminal.js**
- Lightweight terminal component
- Easy integration
- Basic features

**Wetty**
- Web-based SSH terminal
- Full shell access
- Security considerations

## Quick Decision Matrix

| Need | Tool | Why |
|------|------|-----|
| Python CLI → Desktop GUI NOW | Gooey | One decorator, done |
| Modern TUI with web option | Textual | Beautiful, deploys to web |
| Data science web app | Streamlit | Built for data viz |
| ML model demo | Gradio | Instant shareable UI |
| Full web app from CLI | FastAPI + Frontend | Maximum control |
| Cross-platform desktop | Electron/Tauri | Native-like experience |
| Quick web UI, no frontend | PyWebIO | Python-only web apps |

## Installation Commands

```bash
# Python GUI tools
pip install gooey textual pywebio streamlit gradio pysimplegui

# For Textual web deployment
pip install textual-web

# For web frameworks
pip install fastapi uvicorn flask django

# For terminal in browser
npm install xterm terminal.js
```

## Resources
- Gooey Examples: https://github.com/chriskiehl/Gooey/tree/master/examples
- Textual Tutorial: https://textual.textualize.io/tutorial/
- PyWebIO Demos: https://pywebio.readthedocs.io/en/latest/demos.html
- FastAPI + HTMX: https://github.com/renceInbox/fastapi-htmx