# Workflow Logging System Improvement Plan

## Overview
This implementation plan details the improvements needed for the MCP-CEO workflow logging system to properly save LLM responses, create organized folder structures, add the execute_workflow tool, and improve research logging.

## Current State Analysis

### 1. SessionManager (ceo-core.js lines 99-204)
- ✅ Already creates session directories with proper structure
- ✅ Saves step data as JSON and Markdown
- ❌ **Issue**: Line 552 saves undefined response data (`stepData.output.response` doesn't exist)
- ❌ **Issue**: Not capturing actual LLM responses from callbacks

### 2. executeWorkflowStep (ceo-core.js lines 470-609)
- ✅ Creates detailed step data structure
- ✅ Returns instructions for LLM
- ❌ **Issue**: Returns instructions instead of processing responses
- ❌ **Issue**: Previous results handling incomplete (lines 502-513)

### 3. server-hot.js
- ✅ Has architect_of_abundance, bootstrap_assessment, list_workflows tools
- ❌ **Missing**: execute_workflow tool for direct workflow execution

## Implementation Steps

### Step 1: Fix Response Saving in executeWorkflowStep

**File**: `/Users/jean-patricksmith/digital/mcp-ceo/ceo-core.js`

**Changes needed at lines 502-513**:

```javascript
// BEFORE (current code)
if (previousResults?.response) {
  // Save the previous step's actual response
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

// AFTER (improved code)
if (previousResults?.response) {
  // Save the previous step's actual response
  const prevStep = step - 1
  if (prevStep > 0) {
    // Store full response in context
    session.context[`step_${prevStep}_response`] = previousResults.response
    
    // Update step with actual response
    session.steps[prevStep] = {
      ...session.steps[prevStep],
      actualResponse: previousResults.response,
      completedAt: new Date().toISOString()
    }
    
    // Save the actual response to the previous step's files
    const prevStepData = {
      step: prevStep,
      name: workflow.steps[prevStep - 1].name,
      timestamp: session.steps[prevStep].timestamp,
      actualResponse: previousResults.response,
      completedAt: new Date().toISOString()
    }
    
    // Update the previous step's saved data
    await this.sessionManager.updateStep(sessionId, prevStep, prevStepData)
  }
}
```

### Step 2: Add updateStep Method to SessionManager

**File**: `/Users/jean-patricksmith/digital/mcp-ceo/ceo-core.js`

**Add after line 149** (after formatStepMarkdown method):

```javascript
async updateStep(sessionId, step, updateData) {
  const sessionDir = await this.ensureSessionDir(sessionId)
  
  // Read existing step data
  const jsonPath = path.join(sessionDir, `step-${step}.json`)
  let stepData = {}
  try {
    const existing = await fs.readFile(jsonPath, 'utf8')
    stepData = JSON.parse(existing)
  } catch (e) {
    // File might not exist yet
  }
  
  // Merge with update data
  stepData = {
    ...stepData,
    ...updateData,
    lastUpdated: new Date().toISOString()
  }
  
  // Save updated JSON
  await fs.writeFile(jsonPath, JSON.stringify(stepData, null, 2))
  
  // Update markdown with response
  const mdPath = path.join(sessionDir, `step-${step}.md`)
  const markdown = this.formatStepMarkdownWithResponse(step, stepData)
  await fs.writeFile(mdPath, markdown)
  
  return { jsonPath, mdPath }
}

formatStepMarkdownWithResponse(step, stepData) {
  let md = this.formatStepMarkdown(step, stepData)
  
  // Add actual response section if available
  if (stepData.actualResponse) {
    md += `\n## Actual LLM Response\n\n`
    md += `**Completed At**: ${stepData.completedAt}\n\n`
    md += `### Full Response\n${stepData.actualResponse}\n\n`
  }
  
  return md
}
```

### Step 3: Fix Response Storage in executeWorkflowStep

**File**: `/Users/jean-patricksmith/digital/mcp-ceo/ceo-core.js`

**Change at line 552**:

```javascript
// BEFORE
session.context = { ...session.context, [`step_${step}`]: stepData.output.response }

// AFTER
session.context = { ...session.context, [`step_${step}_started`]: stepData.timestamp }
```

### Step 4: Add execute_workflow Tool to server-hot.js

**File**: `/Users/jean-patricksmith/digital/mcp-ceo/server-hot.js`

**Add to toolImplementations object after line 147**:

```javascript
execute_workflow: async (args) => {
  const { workflow_type, test_case, session_id } = args
  
  if (!workflow_type) {
    throw new Error('workflow_type is required')
  }
  
  if (!test_case || !test_case.question) {
    throw new Error('test_case with question is required')
  }
  
  const sessionId = session_id || randomUUID()
  const workflowDef = module.WORKFLOWS[workflow_type]
  
  if (!workflowDef) {
    throw new Error(`Unknown workflow: ${workflow_type}`)
  }
  
  // Initialize workflow session
  let currentStep = 1
  let previousResults = null
  const responses = []
  
  ceo.logger.workflow(0, workflowDef.total_steps, `Starting ${workflow_type}`)
  
  // Execute all steps
  while (currentStep <= workflowDef.total_steps) {
    // Prepare request
    const request = currentStep === 1 ? 
      { ...previousResults, challenge: test_case.question } : 
      previousResults
    
    // Execute step
    const stepResult = await ceo.executeWorkflowStep(
      workflow_type, 
      currentStep, 
      sessionId, 
      request
    )
    
    // Extract the instructions/prompt
    const instructions = stepResult.content[0].text
    
    // Simulate LLM processing the instructions
    // In production, this would call the actual LLM
    const simulatedResponse = `[Step ${currentStep} Response]\n${instructions}\n\n[This is where the LLM would provide its actual response based on the instructions above]`
    
    // Store response
    responses.push({
      step: currentStep,
      instructions,
      response: simulatedResponse,
      metadata: stepResult.metadata
    })
    
    // Prepare for next step
    previousResults = {
      response: simulatedResponse,
      step: currentStep
    }
    
    currentStep++
  }
  
  // Load final session data
  const finalSession = await ceo.sessionManager.load(sessionId)
  
  return {
    content: [{
      type: 'text',
      text: `Workflow ${workflow_type} completed with ${responses.length} steps.\nSession ID: ${sessionId}\nView results at: sessions/${sessionId}/`
    }],
    session_id: sessionId,
    workflow: workflow_type,
    steps_completed: responses.length,
    session_data: finalSession
  }
}
```

**Add to tools array in ListToolsRequestSchema handler (after line 242)**:

```javascript
{
  name: 'execute_workflow',
  description: 'Execute a complete workflow end-to-end for testing and research',
  inputSchema: {
    type: 'object',
    properties: {
      workflow_type: {
        type: 'string',
        description: 'The workflow type to execute (e.g., multi_expert_validation)'
      },
      test_case: {
        type: 'object',
        description: 'Test case with question and context',
        properties: {
          question: {
            type: 'string',
            description: 'The main question or challenge'
          },
          constraints: {
            type: 'array',
            items: { type: 'string' }
          },
          stakeholders: {
            type: 'array', 
            items: { type: 'string' }
          }
        },
        required: ['question']
      },
      session_id: {
        type: 'string',
        description: 'Optional session ID (will be generated if not provided)'
      }
    },
    required: ['workflow_type', 'test_case']
  }
}
```

### Step 5: Improve Research Runner Integration

**File**: `/Users/jean-patricksmith/digital/mcp-ceo/test-harness/research-runner-v2.js`

**Changes for better step data capture (lines 223-260)**:

```javascript
// Add after line 224 to capture the actual response
if (response && response.content && response.content[0]) {
  const responseText = response.content[0].text
  
  // Parse for the actual LLM instructions
  stepData.llmInstructions = responseText
  
  // If this is a workflow step response, extract metadata
  if (response.metadata && response.metadata.workflow) {
    stepData.workflowMetadata = response.metadata.workflow
  }
}

// Improve the callback extraction (replace lines 252-259)
if (response && response.content && response.content[0]) {
  const responseText = response.content[0].text
  
  // Look for callback instructions in the response
  const callbackMatch = responseText.match(/Continue with:.*?architect_of_abundance.*?(\{[\s\S]*?\})/m)
  if (callbackMatch) {
    try {
      const callbackParams = JSON.parse(callbackMatch[1])
      previousResults = {
        response: responseText,
        ...callbackParams.previous_results
      }
    } catch (e) {
      // If parsing fails, just pass the response text
      previousResults = {
        response: responseText
      }
    }
  }
}
```

### Step 6: Create Enhanced Session Viewer

Create a new file for viewing session results:

**File**: `/Users/jean-patricksmith/digital/mcp-ceo/test-harness/enhanced-session-viewer.js`

```javascript
#!/usr/bin/env node
/**
 * Enhanced Session Viewer for MCP-CEO Research
 * Provides detailed analysis of workflow sessions
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

class EnhancedSessionViewer {
  viewSession(sessionId) {
    const sessionDir = join(PROJECT_ROOT, 'sessions', sessionId)
    
    if (!existsSync(sessionDir)) {
      console.error(`Session ${sessionId} not found`)
      return
    }
    
    // Load session data
    const sessionData = JSON.parse(
      readFileSync(join(sessionDir, 'session.json'), 'utf8')
    )
    
    console.log('\n' + '='.repeat(80))
    console.log(`📊 SESSION: ${sessionId}`)
    console.log('='.repeat(80))
    console.log(`Workflow: ${sessionData.workflow}`)
    console.log(`Started: ${sessionData.startTime}`)
    console.log(`Challenge: ${sessionData.challenge}`)
    console.log('\nSTEPS:')
    
    // Read all step files
    const stepFiles = readdirSync(sessionDir)
      .filter(f => f.startsWith('step-') && f.endsWith('.json'))
      .sort()
    
    stepFiles.forEach(file => {
      const stepData = JSON.parse(
        readFileSync(join(sessionDir, file), 'utf8')
      )
      
      console.log(`\n${'-'.repeat(60)}`)
      console.log(`Step ${stepData.step}: ${stepData.name}`)
      console.log(`Timestamp: ${stepData.timestamp}`)
      
      if (stepData.actualResponse) {
        console.log('\n✅ ACTUAL RESPONSE CAPTURED:')
        console.log(stepData.actualResponse.substring(0, 200) + '...')
        console.log(`Completed: ${stepData.completedAt}`)
      } else {
        console.log('\n⏳ AWAITING RESPONSE')
      }
      
      console.log(`\nActive Personalities: ${stepData.input.activePersonalities.join(', ')}`)
    })
    
    console.log('\n' + '='.repeat(80))
  }
  
  listSessions() {
    const sessionsDir = join(PROJECT_ROOT, 'sessions')
    const sessions = readdirSync(sessionsDir).filter(d => 
      existsSync(join(sessionsDir, d, 'session.json'))
    )
    
    console.log('\n📁 AVAILABLE SESSIONS:\n')
    sessions.forEach(sessionId => {
      try {
        const data = JSON.parse(
          readFileSync(join(sessionsDir, sessionId, 'session.json'), 'utf8')
        )
        console.log(`${sessionId} - ${data.workflow} - ${data.startTime}`)
      } catch (e) {
        console.log(`${sessionId} - [Error reading session]`)
      }
    })
  }
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const viewer = new EnhancedSessionViewer()
  const sessionId = process.argv[2]
  
  if (sessionId) {
    viewer.viewSession(sessionId)
  } else {
    viewer.listSessions()
    console.log('\nUsage: node enhanced-session-viewer.js [session-id]')
  }
}
```

## Testing Instructions

### 1. Test Response Saving
```bash
# Start the server
node server-hot.js

# In another terminal, test with CLI
node cli.js "architect_of_abundance" '{"challenge": "Test workflow", "workflow_request": {"type": "simple_test", "step": 1}}'

# Continue with response
node cli.js "architect_of_abundance" '{"challenge": "Continue", "workflow_request": {"type": "simple_test", "step": 2, "session_id": "YOUR_SESSION_ID", "previous_results": {"response": "This is my test response"}}}'

# Check saved files
ls sessions/YOUR_SESSION_ID/
cat sessions/YOUR_SESSION_ID/step-1.json
```

### 2. Test execute_workflow Tool
```bash
# Test the new tool
node cli.js "execute_workflow" '{"workflow_type": "simple_test", "test_case": {"question": "How can I reduce stress?"}}'
```

### 3. Test Research Runner
```bash
# Run research with improved logging
cd test-harness
node research-runner-v2.js --max=1
```

### 4. View Enhanced Session Data
```bash
# List all sessions
node test-harness/enhanced-session-viewer.js

# View specific session
node test-harness/enhanced-session-viewer.js SESSION_ID
```

## Expected Outcomes

1. **Response Saving**: All LLM responses will be properly saved in both JSON and Markdown formats
2. **Folder Structure**: Each session maintains organized structure:
   ```
   sessions/{session-id}/
   ├── session.json       # Overall session data
   ├── README.md          # Human-readable summary
   ├── step-1.json        # Step 1 data with response
   ├── step-1.md          # Step 1 markdown with response
   └── ...
   ```
3. **execute_workflow Tool**: Enables complete workflow execution for testing
4. **Research Logging**: Captures all step instructions and responses for analysis

## Implementation Order

1. **First**: Implement Steps 1-3 (fix response saving)
2. **Second**: Implement Step 4 (add execute_workflow tool)
3. **Third**: Implement Step 5 (improve research runner)
4. **Fourth**: Implement Step 6 (create enhanced viewer)
5. **Test**: Run all testing instructions to verify

## Notes for Junior Developers

- Always test changes with `node server-hot.js` - it supports hot reloading
- Use `console.error()` for debug logging (goes to stderr, not stdout)
- The MCP protocol requires specific response formats - don't change the structure
- Session IDs use UUID format - use the `randomUUID()` function
- All file operations should use async methods from `fs/promises`