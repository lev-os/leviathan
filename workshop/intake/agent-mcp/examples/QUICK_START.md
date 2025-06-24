# Quick Dashboard Setup Guide

## Option 1: Tremor (Fastest - 5 minutes)

```bash
# Create Next.js app
npx create-next-app@latest dashboard-app --typescript --tailwind --app
cd dashboard-app

# Install Tremor
npm install @tremor/react

# Copy the example dashboard
cp ../agent-mcp/examples/quick-dashboard.tsx app/page.tsx

# Run it
npm run dev
```

## Option 2: Streamlit-style with Evidence.dev

```bash
# Install Evidence
npm install -g @evidence-dev/evidence

# Create new project
npx degit evidence-dev/template my-dashboard
cd my-dashboard

# Install and run
npm install
npm run dev
```

Then create markdown files with SQL queries and charts!

## Option 3: No-Code Options

### Retool
- Drag-and-drop interface
- Connect to any API/database
- Embed in React apps
- Free tier available

### Polymer
- AI-powered dashboard builder
- Beautiful templates
- Real-time data
- Export as embeddable widgets

## Option 4: For Agent-MCP Integration

```bash
# Use Vite + React + Tremor
npm create vite@latest agent-dashboard -- --template react-ts
cd agent-dashboard
npm install @tremor/react axios

# Add MCP client
npm install @modelcontextprotocol/sdk
```

Then integrate with your MCP server for real-time task/memory data!

## Comparison

| Solution | Setup Time | Coding Required | Best For |
|----------|-----------|----------------|----------|
| Tremor | 5 min | Minimal | React developers |
| Evidence | 10 min | SQL + Markdown | Data analysts |
| Retool | 15 min | No code | Business users |
| Polymer | 5 min | No code | Quick prototypes |

## Resources
- [Tremor Docs](https://tremor.so)
- [Evidence Docs](https://evidence.dev)
- [Retool](https://retool.com)
- [Polymer](https://polymersearch.com)