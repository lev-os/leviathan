# MCP-CEO Workflow Logging Implementation Plan

## Overview
This plan details the implementation steps to fix workflow logging and add the execute_workflow tool to enable proper research-grade data capture for dynamic context assembly experiments.

## Current Issues
1. LLM responses are not being saved (showing as "undefined" in step markdown files)
2. No execute_workflow tool to initialize workflows
3. File structure doesn't separate input/output clearly
4. Research runner doesn't extract responses properly

## Implementation Steps

### Step 1: Fix Response Saving in ceo-core.js

**File**: `/Users/jean-patricksmith/digital/mcp-ceo/ceo-core.js`

#### 1.1 Fix the response capture bug (Line ~552)

**Current Code (Line 552)**:
```javascript
session.context = { ...session.context, [`step_${step}`]: stepData.output.response }
```

**Change To**:
```javascript
// Don't save undefined response here - this is for the instructions phase
// Response will be saved when we get the callback with previous_results
```

#### 1.2 Update the callback handling (Lines 502-513)

**Current Code**:
```javascript
if (previousResults?.response) {
  const prevStep = step - 1
  if (prevStep > 0) {
    session.context[`step_${prevStep}_response`] = previousResults.response
    session.steps[prevStep] = {
      ...session.steps[prevStep],
      actualResponse: previousResults.response,
      completedAt: new Date().toISOString()
    }
  }
}
```

**Add After This Block**:
```javascript
// Also save the response to the step file
if (previousResults?.response && prevStep > 0) {
  await this.sessionManager.updateStep(sessionId, prevStep, {
    response: previousResults.response,
    completedAt: new Date().toISOString()
  })
}
```

#### 1.3 Add updateStep method to SessionManager (After line 150)

**Add New Method**:
```javascript
async updateStep(sessionId, step, updateData) {
  const sessionDir = await this.ensureSessionDir(sessionId)
  
  // Load existing step data
  const jsonPath = path.join(sessionDir, `step-${step}.json`)
  let stepData = {}
  try {
    const content = await fs.readFile(jsonPath, 'utf8')
    stepData = JSON.parse(content)
  } catch (e) {
    // Step file might not exist yet
  }
  
  // Update with new data
  stepData = {
    ...stepData,
    output: {
      ...stepData.output,
      ...updateData
    }
  }
  
  // Save updated JSON
  await fs.writeFile(jsonPath, JSON.stringify(stepData, null, 2))
  
  // Update markdown if response is included
  if (updateData.response) {
    const mdPath = path.join(sessionDir, `step-${step}.md`)
    const markdown = this.formatStepMarkdownWithResponse(step, stepData)
    await fs.writeFile(mdPath, markdown)
  }
  
  return { jsonPath, mdPath }
}
```

#### 1.4 Add formatStepMarkdownWithResponse method (After formatStepMarkdown)

**Add New Method**:
```javascript
formatStepMarkdownWithResponse(step, stepData) {
  let md = `# Step ${step}: ${stepData.name}\n\n`
  md += `**Timestamp**: ${stepData.timestamp}\n`
  md += `**Completed**: ${stepData.output.completedAt || 'In Progress'}\n\n`
  
  md += `## Input (What MCP Asked)\n\n`
  md += `### Task\n${stepData.input.stepPrompt}\n\n`
  md += `### Active Personalities\n${stepData.input.activePersonalities.map(p => `- ${p}`).join('\n')}\n\n`
  
  md += `## Output (What LLM Responded)\n\n`
  if (stepData.output.response) {
    md += `### Response\n${stepData.output.response}\n\n`
  } else {
    md += `### Response\n*Awaiting LLM response...*\n\n`
  }
  
  md += `## Next Step Instructions\n`
  if (stepData.output.callbackInstruction) {
    md += `${stepData.output.callbackInstruction}\n`
  }
  
  return md
}
```

### Step 2: Create Folder Structure for Each Step

**File**: `/Users/jean-patricksmith/digital/mcp-ceo/ceo-core.js`

#### 2.1 Modify saveStep method (Lines 110-124)

**Replace Current saveStep Method With**:
```javascript
async saveStep(sessionId, step, stepData) {
  const sessionDir = await this.ensureSessionDir(sessionId)
  const stepDir = path.join(sessionDir, `step-${step}`)
  await fs.mkdir(stepDir, { recursive: true })
  
  // Save complete data as JSON
  const jsonPath = path.join(stepDir, 'complete.json')
  await fs.writeFile(jsonPath, JSON.stringify(stepData, null, 2))
  
  // Save input (what MCP asked LLM to do)
  const inputPath = path.join(stepDir, 'input.md')
  const inputMd = this.formatStepInput(step, stepData)
  await fs.writeFile(inputPath, inputMd)
  
  // Save instructions for LLM
  const instructionsPath = path.join(stepDir, 'instructions.md')
  const instructionsMd = this.formatStepInstructions(step, stepData)
  await fs.writeFile(instructionsPath, instructionsMd)
  
  // Response will be saved later when LLM calls back
  const responsePath = path.join(stepDir, 'response.md')
  await fs.writeFile(responsePath, '*Awaiting LLM response...*')
  
  // Save summary
  const summaryPath = path.join(stepDir, 'summary.md')
  const summaryMd = this.formatStepSummary(step, stepData)
  await fs.writeFile(summaryPath, summaryMd)
  
  // Keep legacy format for backward compatibility
  const legacyJsonPath = path.join(sessionDir, `step-${step}.json`)
  const legacyMdPath = path.join(sessionDir, `step-${step}.md`)
  await fs.writeFile(legacyJsonPath, JSON.stringify(stepData, null, 2))
  await fs.writeFile(legacyMdPath, this.formatStepMarkdown(step, stepData))
  
  return { stepDir, jsonPath, inputPath, responsePath, summaryPath }
}
```

#### 2.2 Add new formatting methods (After formatStepMarkdown)

```javascript
formatStepInput(step, stepData) {
  let md = `# Step ${step} Input: ${stepData.name}\n\n`
  md += `**Generated at**: ${stepData.timestamp}\n\n`
  md += `## Task for This Step\n\n`
  md += `${stepData.input.stepPrompt}\n\n`
  md += `## Active Personalities\n\n`
  stepData.input.activePersonalities.forEach(p => {
    md += `### ${p.replace(/_/g, ' ').toUpperCase()}\n`
    md += `Role: ${this.personalities?.[p]?.role || 'Unknown'}\n\n`
  })
  md += `## Previous Context Available\n\n`
  md += `\`\`\`json\n${JSON.stringify(stepData.input.previousContext, null, 2)}\n\`\`\`\n`
  return md
}

formatStepInstructions(step, stepData) {
  let md = `# Instructions for Step ${step}\n\n`
  md += `${stepData.output.instructions || stepData.input.contextPrompt}\n\n`
  md += `## How to Continue\n\n`
  md += `After processing the above, call:\n\n`
  md += `\`\`\`\n${stepData.output.callbackInstruction || 'See instructions above'}\n\`\`\`\n`
  return md
}

formatStepSummary(step, stepData) {
  let md = `# Step ${step} Summary: ${stepData.name}\n\n`
  md += `**Status**: ${stepData.output.response ? '✅ Complete' : '⏳ Awaiting Response'}\n\n`
  md += `## Quick Overview\n\n`
  md += `- **Task**: ${stepData.input.stepPrompt.split('\n')[0]}...\n`
  md += `- **Personalities**: ${stepData.input.activePersonalities.join(', ')}\n`
  md += `- **Started**: ${stepData.timestamp}\n`
  if (stepData.output.completedAt) {
    md += `- **Completed**: ${stepData.output.completedAt}\n`
  }
  return md
}
```

#### 2.3 Update updateStep to handle new structure

```javascript
async updateStep(sessionId, step, updateData) {
  const sessionDir = await this.ensureSessionDir(sessionId)
  const stepDir = path.join(sessionDir, `step-${step}`)
  
  // Load existing step data
  const jsonPath = path.join(stepDir, 'complete.json')
  let stepData = {}
  try {
    const content = await fs.readFile(jsonPath, 'utf8')
    stepData = JSON.parse(content)
  } catch (e) {
    // Try legacy location
    try {
      const legacyPath = path.join(sessionDir, `step-${step}.json`)
      const content = await fs.readFile(legacyPath, 'utf8')
      stepData = JSON.parse(content)
    } catch (e2) {
      console.error('Could not load step data:', e2)
    }
  }
  
  // Update with new data
  stepData.output = {
    ...stepData.output,
    ...updateData
  }
  
  // Save updated complete data
  await fs.writeFile(jsonPath, JSON.stringify(stepData, null, 2))
  
  // Update response file if response is included
  if (updateData.response) {
    const responsePath = path.join(stepDir, 'response.md')
    let responseMd = `# Step ${step} Response\n\n`
    responseMd += `**Completed at**: ${updateData.completedAt}\n\n`
    responseMd += `## LLM Response\n\n`
    responseMd += `${updateData.response}\n`
    await fs.writeFile(responsePath, responseMd)
    
    // Update summary
    const summaryPath = path.join(stepDir, 'summary.md')
    const summaryMd = this.formatStepSummary(step, stepData)
    await fs.writeFile(summaryPath, summaryMd)
  }
  
  // Update legacy files
  const legacyJsonPath = path.join(sessionDir, `step-${step}.json`)
  const legacyMdPath = path.join(sessionDir, `step-${step}.md`)
  await fs.writeFile(legacyJsonPath, JSON.stringify(stepData, null, 2))
  await fs.writeFile(legacyMdPath, this.formatStepMarkdownWithResponse(step, stepData))
  
  return { stepDir, jsonPath, responsePath }
}
```

### Step 3: Add execute_workflow Tool

**File**: `/Users/jean-patricksmith/digital/mcp-ceo/server-hot.js`

#### 3.1 Add tool implementation (After list_workflows, around line 147)

```javascript
execute_workflow: async (args) => {
  const { workflow_type, challenge } = args
  
  // Validate workflow exists
  const workflows = ceo.getAvailableWorkflows()
  const workflow = workflows.find(w => w.key === workflow_type)
  if (!workflow) {
    throw new Error(`Unknown workflow: ${workflow_type}. Available: ${workflows.map(w => w.key).join(', ')}`)
  }
  
  // Create session
  const sessionId = randomUUID()
  
  // Initialize session by calling step 1 internally
  const step1Result = await ceo.executeWorkflowStep(workflow_type, 1, sessionId, { challenge })
  
  // Create initialization message
  let response = `## Workflow Initialized: ${workflow.name}\n\n`
  response += `**Session ID**: ${sessionId}\n`
  response += `**Challenge**: ${challenge}\n`
  response += `**Total Steps**: ${workflow.steps}\n\n`
  
  response += `### Description\n${workflow.description}\n\n`
  
  response += `### To Begin\n`
  response += `Execute the first step by calling:\n\n`
  response += `\`\`\`\n`
  response += `architect_of_abundance with workflow_request: {\n`
  response += `  type: "${workflow_type}",\n`
  response += `  step: 1,\n`
  response += `  session_id: "${sessionId}"\n`
  response += `}\n`
  response += `\`\`\`\n\n`
  
  response += `### What Will Happen\n`
  response += `1. You'll receive specific instructions for each step\n`
  response += `2. Process those instructions and generate a response\n`
  response += `3. Call back with your response to get the next step\n`
  response += `4. Continue until all ${workflow.steps} steps are complete\n\n`
  
  response += `### Session Files\n`
  response += `Results will be saved to: \`./sessions/${sessionId}/\`\n`
  
  return {
    content: [{
      type: 'text',
      text: response
    }],
    metadata: {
      sessionId,
      workflowType: workflow_type,
      challenge
    }
  }
},
```

#### 3.2 Add tool to schema (In ListToolsRequestSchema handler, after list_workflows, around line 242)

```javascript
{
  name: 'execute_workflow',
  description: 'Initialize a workflow session for step-by-step execution',
  inputSchema: {
    type: 'object',
    properties: {
      workflow_type: {
        type: 'string',
        description: 'The workflow to execute (e.g. simple_test, deep_analysis)',
        enum: Object.keys(coreModule.WORKFLOWS)
      },
      challenge: {
        type: 'string',
        description: 'The challenge or question to analyze through the workflow'
      }
    },
    required: ['workflow_type', 'challenge']
  }
},
```

### Step 4: Fix Research Runner Response Extraction

**File**: `/Users/jean-patricksmith/digital/mcp-ceo/test-harness/research-runner-v2.js`

#### 4.1 Update processWorkflowStep (Lines 223-260)

**Find the section where it extracts response** (around line 240):
```javascript
// Extract response from result
let response = 'No response captured'
if (result.content && result.content[0]) {
  response = result.content[0].text || result.content[0]
}
```

**Replace with**:
```javascript
// For step 1, we don't have a previous response
// For steps 2+, we need to simulate the LLM processing
let response = null
if (step === 1) {
  // First step - just need to initialize
  console.log(`Step 1 initialized - ready for LLM processing`)
} else {
  // Simulate LLM processing the previous step's instructions
  // In real usage, this would be the actual LLM response
  response = `[Simulated LLM response for step ${step-1}]`
  
  // Call again with the response to save it
  const saveResult = await this.client.callTool('architect_of_abundance', {
    challenge: challenge,
    workflow_request: {
      type: workflowType,
      step: step,
      session_id: sessionId,
      previous_results: {
        response: response
      }
    }
  })
}
```

### Step 5: Create Enhanced Session Viewer

**New File**: `/Users/jean-patricksmith/digital/mcp-ceo/test-harness/enhanced-session-viewer.js`

```javascript
#!/usr/bin/env node

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function viewSession(sessionId) {
  const sessionDir = path.join(__dirname, '..', 'sessions', sessionId)
  
  console.log(`\n📁 Session: ${sessionId}`)
  console.log('=' + '='.repeat(70))
  
  // Load session overview
  try {
    const sessionData = JSON.parse(
      await fs.readFile(path.join(sessionDir, 'session.json'), 'utf8')
    )
    
    console.log(`\n📋 Workflow: ${sessionData.workflow}`)
    console.log(`🎯 Challenge: ${sessionData.challenge}`)
    console.log(`⏰ Started: ${sessionData.startTime}`)
    console.log(`📊 Steps: ${Object.keys(sessionData.steps).length}`)
    
    // Check each step
    for (let i = 1; i <= Object.keys(sessionData.steps).length; i++) {
      console.log(`\n${'─'.repeat(70)}`)
      console.log(`Step ${i}: ${sessionData.steps[i]?.name || 'Unknown'}`)
      
      const stepDir = path.join(sessionDir, `step-${i}`)
      try {
        // Try new structure first
        const dirs = await fs.readdir(stepDir)
        console.log(`  📁 Files: ${dirs.join(', ')}`)
        
        // Check if response exists
        try {
          const response = await fs.readFile(
            path.join(stepDir, 'response.md'), 
            'utf8'
          )
          if (response.includes('Awaiting')) {
            console.log(`  ⏳ Status: Awaiting LLM response`)
          } else {
            console.log(`  ✅ Status: Response captured`)
            console.log(`  📝 Response preview: ${response.slice(0, 100)}...`)
          }
        } catch (e) {
          console.log(`  ❓ Status: No response file`)
        }
      } catch (e) {
        // Fall back to legacy structure
        try {
          const stepFile = path.join(sessionDir, `step-${i}.json`)
          const stepData = JSON.parse(await fs.readFile(stepFile, 'utf8'))
          if (stepData.output?.response) {
            console.log(`  ✅ Status: Response captured (legacy)`)
          } else {
            console.log(`  ⏳ Status: Awaiting response (legacy)`)
          }
        } catch (e2) {
          console.log(`  ❌ Status: Step file not found`)
        }
      }
    }
    
    console.log(`\n${'='.repeat(70)}\n`)
    
  } catch (error) {
    console.error(`❌ Error loading session: ${error.message}`)
  }
}

// Handle command line args
const sessionId = process.argv[2]
if (!sessionId) {
  console.log('Usage: node enhanced-session-viewer.js <session-id>')
  process.exit(1)
}

viewSession(sessionId)
```

## Testing Instructions

### 1. Test Response Capture
```bash
# Start the server
node server-hot.js

# In another terminal, test with Claude Desktop
# 1. Call execute_workflow
# 2. Follow the instructions to call step 1
# 3. When you get instructions, respond with actual analysis
# 4. Call step 2 with your response in previous_results
# 5. Check that response was saved

# View the session
node test-harness/enhanced-session-viewer.js <session-id>
```

### 2. Verify File Structure
```bash
# After running a workflow, check the session directory
ls -la sessions/<session-id>/step-1/

# Should see:
# - complete.json
# - input.md
# - instructions.md
# - response.md
# - summary.md
```

### 3. Test Research Runner
```bash
# Run automated research
node test-harness/research-runner-v2.js

# Check that responses are properly captured
# Look for non-empty response files in sessions/
```

## Expected Outcomes

1. **Proper Response Capture**: No more "undefined" in response fields
2. **Clear File Organization**: Each step has its own folder with separated concerns
3. **Execute Workflow Tool**: Easy workflow initialization
4. **Research-Ready Data**: Complete input/output pairs for analysis

## Implementation Order

1. First: Fix response saving bug in ceo-core.js (Step 1.1-1.2)
2. Second: Add updateStep method (Step 1.3-1.4)
3. Third: Test that responses are being saved
4. Fourth: Implement new folder structure (Step 2)
5. Fifth: Add execute_workflow tool (Step 3)
6. Sixth: Test complete workflow execution
7. Last: Update research runner if needed (Step 4)

## Notes for Junior Developer

- Make changes incrementally and test after each step
- The hot reload server means you don't need to restart after changing ceo-core.js
- Use enhanced-session-viewer.js to debug what's being saved
- If something breaks, check the git diff to see what changed
- The key bug is in line 552 - that's the most important fix