# Browser-Use Integration for Leviathan

_Based on A5-Browser-Use analysis_

## Overview

Browser-Use is a Python library that enables AI-controlled browser automation. The A5-Browser-Use project demonstrates how to integrate it with a Chrome extension and FastAPI server.

## Installation Options

### Option 1: Python Bridge (Recommended)

Since browser-use is a Python library, we can create a Python MCP server that wraps it:

```bash
# In a new Python MCP server
pip install browser-use langchain-openai
```

### Option 2: Direct Integration via Subprocess

Create a command tool that calls Python scripts:

```javascript
// agent/src/commands/browser-automation.js
export async function browserAutomation(args, dependencies) {
  const { task, provider = 'openai' } = args

  // Call Python script that uses browser-use
  const result = await dependencies.shell.exec(`python -m browser_use_wrapper "${task}" --provider ${provider}`)

  return {
    success: true,
    data: result,
  }
}
```

1. 📋 Direct Translation - Port Erasmus Python patterns to Leviathan Node.js ecosystem (safe, proven)
2. 🎯 Enhanced Integration - Combine Erasmus IDE monitoring with Lev's 5-type memory system (hybrid power)
3. 💎 Core Pattern Extraction - Distill the essential patterns and rebuild natively in Leviathan (purist approach)

### Option 3: Port Patterns to JavaScript

Extract the browser automation patterns and implement using Playwright or Puppeteer:

```javascript
// Using playwright for similar functionality
import { chromium } from 'playwright'

export async function browserTask(task, llm) {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  // Use LLM to determine actions
  const actions = await llm.planBrowserActions(task, page.url())

  // Execute actions
  for (const action of actions) {
    await executeBrowserAction(page, action)
  }
}
```

## Key Patterns from A5-Browser-Use

1. **LLM-Controlled Browser**: Let the LLM decide browser actions
2. **Multi-Provider Support**: OpenAI, Gemini, Ollama
3. **Background Task Execution**: Non-blocking browser automation
4. **Chrome DevTools Protocol**: Direct browser control

## MCP Tool Implementation

```javascript
export const browserUseTool = {
  name: 'browser_automation',
  description: 'Control a browser using natural language instructions',
  inputSchema: {
    type: 'object',
    properties: {
      task: {
        type: 'string',
        description: 'Natural language description of browser task',
      },
      url: {
        type: 'string',
        description: 'Starting URL (optional)',
      },
    },
    required: ['task'],
  },
  handler: browserAutomation,
}
```

## Next Steps

1. Create Python MCP server for browser-use: `plugins/@lev-os/browser-automation/`
2. Implement subprocess bridge in agent
3. Add browser automation to capability matrix
4. Test with common browser tasks (search, form filling, data extraction)
