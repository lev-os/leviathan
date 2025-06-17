# FlowMind Dual LLM Implementation Guide

**Date**: January 9, 2025  
**Focus**: Technical implementation of the Alpha-Beta LLM architecture

## Overview

The dual LLM architecture is FlowMind's key innovation for achieving real-time semantic programming. This document provides complete implementation details for building the system.

## Architecture Overview

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│   User      │ ←→  │   Beta LLM      │ ←→  │  MCP Server │
└─────────────┘     │  (Claude/GPT)   │     │             │
                    └─────────────────┘     │  ┌────────┐ │
                                           │  │ Alpha  │ │
                                           │  │  LLM   │ │
                                           │  └────────┘ │
                                           │  ┌────────┐ │
                                           │  │  RAG   │ │
                                           │  │   DB   │ │
                                           │  └────────┘ │
                                           └─────────────┘
```

## Beta LLM (Conversational Intelligence)

### Role & Responsibilities

**Primary Functions**:
1. User interaction and conversation management
2. Content analysis and summarization  
3. Variable extraction from user input
4. MCP tool orchestration
5. Response synthesis and presentation

### Implementation Requirements

**No special implementation needed** - Beta LLM is the user's chosen LLM (Claude, GPT-4, etc.)

**MCP Tool Definitions for Beta**:

```javascript
// tools.js - MCP tool definitions that shape Beta's behavior
export const FLOWMIND_TOOLS = [
  {
    name: 'field_request',
    description: 'Universal context discovery and semantic matching. Use this when you need to find appropriate workflows, agents, or patterns based on user needs.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { 
          type: 'string', 
          maxLength: 500,
          description: 'Concise 2-sentence summary of user need'
        },
        extracted_variables: {
          type: 'object',
          description: 'Variables extracted from user input',
          properties: {
            domain: { 
              type: 'string',
              enum: ['technical', 'creative', 'regulatory', 'business', 'personal'],
              description: 'Primary domain of the request'
            },
            urgency: { 
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
              description: 'Urgency level of the request'
            },
            complexity: {
              type: 'string', 
              enum: ['simple', 'moderate', 'complex'],
              description: 'Estimated complexity'
            },
            // Dynamic properties based on compile-time extraction
            ...COMPILED_VARIABLES
          }
        },
        confidence_level: { 
          type: 'number', 
          minimum: 0,
          maximum: 1,
          description: 'Your confidence in the extraction (0-1)'
        },
        content_reference: {
          type: 'object',
          properties: {
            has_large_content: { type: 'boolean' },
            content_summary: { type: 'string', maxLength: 1000 },
            content_file_path: { type: 'string' }
          },
          description: 'Reference to large content if applicable'
        }
      },
      required: ['query', 'confidence_level']
    }
  },
  
  {
    name: 'execute_workflow',
    description: 'Execute a specific FlowMind workflow with context switching',
    inputSchema: {
      type: 'object',
      properties: {
        workflow_uri: { 
          type: 'string',
          description: 'Workflow URI (e.g., workflow://incident-response)'
        },
        initial_context: {
          type: 'object',
          description: 'Initial context for workflow execution'
        },
        session_id: {
          type: 'string',
          description: 'Session ID for workflow continuity'
        }
      },
      required: ['workflow_uri']
    }
  },

  {
    name: 'evaluate_semantic_condition',
    description: 'Evaluate a natural language condition against current context',
    inputSchema: {
      type: 'object', 
      properties: {
        condition: {
          type: 'string',
          description: 'Natural language condition to evaluate'
        },
        context_summary: {
          type: 'string',
          maxLength: 1000,
          description: 'Summary of current context'
        }
      },
      required: ['condition', 'context_summary']
    }
  }
]
```

### Beta LLM Best Practices

**Variable Extraction Pattern**:
```javascript
// Beta LLM should extract variables before calling field_request
User: "Our checkout system is down and customers are complaining!"

Beta Analysis:
- Domain: technical (system issue)
- Urgency: critical (customers affected)  
- System: checkout
- Impact: customer-facing

Beta Call:
field_request({
  query: "checkout system down affecting customers",
  extracted_variables: {
    domain: "technical",
    urgency: "critical",
    system_component: "checkout",
    user_impact: "customer-facing"
  },
  confidence_level: 0.95
})
```

## Alpha LLM (Semantic Parser/Interpreter)

### Role & Responsibilities

**Primary Functions**:
1. Parse FlowMind YAML DSL
2. Evaluate semantic conditions
3. Generate embeddings for semantic search
4. Coordinate with RAG database
5. Translate instructions for Beta LLM

### Implementation

**Model Selection**:
```javascript
// config/alpha-llm.js
export const ALPHA_LLM_CONFIG = {
  model: "llama-3.2-1b-instruct",  // Small, fast, local
  temperature: 0.1,                 // Low temperature for consistency
  max_tokens: 500,                  // Keep responses concise
  timeout_ms: 50,                   // Sub-50ms target
  
  // Specialized prompts for each function
  prompts: {
    parse_yaml: "Parse this YAML workflow and extract steps...",
    evaluate_condition: "Evaluate if this condition is met...",
    generate_embedding: "Extract semantic tokens for embedding...",
    translate_instruction: "Convert to natural language instruction..."
  }
}
```

**Alpha LLM Integration**:
```javascript
// lib/alpha-llm.js
import { Llama } from '@llama/node'  // or appropriate binding

class AlphaLLM {
  constructor(config) {
    this.model = new Llama(config.model)
    this.config = config
  }

  async parseWorkflow(yamlContent) {
    const prompt = `${this.config.prompts.parse_yaml}\n\nYAML:\n${yamlContent}`
    const response = await this.model.complete(prompt, {
      temperature: this.config.temperature,
      max_tokens: this.config.max_tokens
    })
    
    return this.extractStructuredData(response)
  }

  async evaluateSemanticCondition(condition, context) {
    const prompt = `
      Evaluate if this condition is met:
      Condition: ${condition}
      Context: ${context}
      
      Respond with JSON: { "met": boolean, "confidence": 0.0-1.0, "reasoning": "..." }
    `
    
    const response = await this.model.complete(prompt, {
      temperature: 0.1,  // Very low for consistency
      max_tokens: 100
    })
    
    return JSON.parse(response)
  }

  async generateSearchEmbedding(query, variables) {
    const prompt = `
      Extract semantic tokens for search:
      Query: ${query}
      Variables: ${JSON.stringify(variables)}
      
      Output semantic tokens as JSON array:
    `
    
    const response = await this.model.complete(prompt)
    const tokens = JSON.parse(response)
    
    // Generate embedding from tokens
    return this.model.embed(tokens.join(' '))
  }

  async translateToInstruction(context, activationRules) {
    const prompt = `
      Translate this context into natural language instruction:
      
      Context: ${context.uri}
      Type: ${context.type}
      Activation: ${activationRules}
      
      Create a clear instruction for the Beta LLM:
    `
    
    return await this.model.complete(prompt)
  }
}

export default AlphaLLM
```

### Alpha LLM Workflow Processing

**Processing a FlowMind Workflow**:
```javascript
// lib/workflow-processor.js
class WorkflowProcessor {
  constructor(alphaLLM, contextDB) {
    this.alpha = alphaLLM
    this.db = contextDB
  }

  async processWorkflowStep(workflow, step, sessionState) {
    // 1. Parse current step
    const stepData = await this.alpha.parseWorkflow(workflow.steps[step])
    
    // 2. Evaluate conditions
    if (stepData.condition) {
      const evaluation = await this.alpha.evaluateSemanticCondition(
        stepData.condition,
        sessionState
      )
      
      if (!evaluation.met) {
        return this.handleConditionNotMet(stepData, evaluation)
      }
    }
    
    // 3. Load appropriate context
    const context = await this.db.loadContext(stepData.context_uri)
    
    // 4. Translate to Beta instruction
    const instruction = await this.alpha.translateToInstruction(
      context,
      stepData.activation_rules
    )
    
    return {
      instruction,
      context,
      next_step: stepData.next,
      session_update: stepData.session_updates
    }
  }
}
```

## RAG Database Implementation

### Compile-Time Preparation

**Build Script**:
```javascript
// scripts/build-rag.js
import { readContexts, extractVariables, generateEmbeddings } from './lib/compiler'

async function buildRAG() {
  // 1. Scan all contexts
  const contexts = await readContexts('./contexts/**/*.yaml')
  
  // 2. Extract variables and compile
  const compiledData = await Promise.all(contexts.map(async (ctx) => {
    const variables = extractVariables(ctx)
    const embedding = await generateEmbedding(ctx.description)
    
    return {
      uri: ctx.uri,
      type: ctx.type,
      embedding,
      variables,
      activation_conditions: ctx.activation_conditions,
      compiled_instruction: compileInstruction(ctx)
    }
  }))
  
  // 3. Build indices
  const vectorIndex = buildVectorIndex(compiledData)
  const variableIndex = buildVariableIndex(compiledData)
  
  // 4. Save compiled artifacts
  await saveArtifacts({
    contexts: compiledData,
    indices: { vector: vectorIndex, variable: variableIndex },
    metadata: { 
      version: '1.0.0',
      compiled_at: new Date(),
      context_count: compiledData.length
    }
  })
}
```

### Runtime RAG Search

**Vector Search Implementation**:
```javascript
// lib/rag-search.js
class RAGSearch {
  constructor(compiledArtifacts) {
    this.contexts = compiledArtifacts.contexts
    this.vectorIndex = compiledArtifacts.indices.vector
    this.variableIndex = compiledArtifacts.indices.variable
  }

  async search(embedding, filters = {}) {
    // 1. Vector similarity search
    const vectorMatches = await this.vectorSearch(embedding, 20)
    
    // 2. Apply variable filters
    const filtered = this.applyFilters(vectorMatches, filters)
    
    // 3. Re-rank based on activation conditions
    const ranked = await this.rankByActivation(filtered, filters)
    
    // 4. Return top matches with metadata
    return ranked.slice(0, 5).map(match => ({
      ...match,
      activation_instruction: this.contexts[match.id].compiled_instruction,
      required_variables: this.contexts[match.id].variables
    }))
  }

  async vectorSearch(embedding, topK) {
    // Use FAISS, Annoy, or similar for fast similarity search
    const similarities = this.vectorIndex.search(embedding, topK)
    return similarities.map(([id, score]) => ({
      id,
      score,
      uri: this.contexts[id].uri
    }))
  }

  applyFilters(matches, filters) {
    return matches.filter(match => {
      const ctx = this.contexts[match.id]
      
      // Check variable compatibility
      for (const [key, value] of Object.entries(filters)) {
        if (ctx.variables[key] && !ctx.variables[key].includes(value)) {
          return false
        }
      }
      
      return true
    })
  }
}
```

## MCP Server Integration

### Complete MCP Handler

```javascript
// lib/mcp-handlers.js
class FlowMindMCPHandler {
  constructor(alphaLLM, ragSearch, workflowProcessor) {
    this.alpha = alphaLLM
    this.rag = ragSearch
    this.workflows = workflowProcessor
  }

  async handleFieldRequest(params) {
    const { query, extracted_variables, confidence_level } = params
    
    try {
      // 1. Generate embedding
      const embedding = await this.alpha.generateSearchEmbedding(
        query, 
        extracted_variables
      )
      
      // 2. Search RAG
      const matches = await this.rag.search(embedding, extracted_variables)
      
      // 3. Evaluate activation conditions
      const evaluatedMatches = await Promise.all(
        matches.map(async (match) => {
          if (match.activation_conditions) {
            const evaluation = await this.alpha.evaluateSemanticCondition(
              match.activation_conditions.semantic_if,
              { query, variables: extracted_variables }
            )
            match.condition_met = evaluation.met
            match.condition_confidence = evaluation.confidence
          }
          return match
        })
      )
      
      // 4. Format response with teaching
      return this.formatFieldResponse(evaluatedMatches, query)
      
    } catch (error) {
      return this.handleError(error, params)
    }
  }

  formatFieldResponse(matches, query) {
    if (matches.length === 0) {
      return {
        status: 'no_matches',
        guidance: 'No matching contexts found. Try rephrasing or adding more details.',
        suggestions: this.generateSuggestions(query)
      }
    }

    if (matches.length === 1 && matches[0].score > 0.9) {
      return {
        status: 'success',
        matches: matches,
        action: 'execute_directly'
      }
    }

    if (matches.filter(m => m.score > 0.7).length > 1) {
      return {
        status: 'multiple_matches',
        matches: matches,
        guidance: 'Multiple relevant contexts found',
        disambiguation_needed: true
      }
    }

    return {
      status: 'success',
      matches: matches,
      confidence_warning: matches[0].score < 0.7
    }
  }

  async handleExecuteWorkflow(params) {
    const { workflow_uri, initial_context, session_id } = params
    
    // Load workflow
    const workflow = await this.loadWorkflow(workflow_uri)
    
    // Initialize session
    const session = this.initSession(session_id, initial_context)
    
    // Process first step
    const result = await this.workflows.processWorkflowStep(
      workflow, 
      0, 
      session
    )
    
    return {
      status: 'workflow_started',
      session_id: session.id,
      current_step: 0,
      instruction: result.instruction,
      context: result.context,
      next_action: 'apply_context_and_respond'
    }
  }
}
```

## Performance Optimization

### Alpha LLM Optimizations

**1. Model Quantization**:
```javascript
// Use 4-bit quantized model for 4x speedup
const alphaConfig = {
  model: "llama-3.2-1b-instruct-q4",
  use_gpu: true,
  context_size: 2048  // Small context for speed
}
```

**2. Prompt Caching**:
```javascript
class CachedAlphaLLM extends AlphaLLM {
  constructor(config) {
    super(config)
    this.cache = new LRUCache({ max: 1000 })
  }

  async evaluateSemanticCondition(condition, context) {
    const cacheKey = `${condition}:${JSON.stringify(context)}`
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }
    
    const result = await super.evaluateSemanticCondition(condition, context)
    this.cache.set(cacheKey, result)
    return result
  }
}
```

**3. Batch Processing**:
```javascript
// Process multiple conditions in parallel
async evaluateMultipleConditions(conditions) {
  const batches = chunk(conditions, 5)  // Process 5 at a time
  
  const results = []
  for (const batch of batches) {
    const batchResults = await Promise.all(
      batch.map(c => this.evaluateSemanticCondition(c.condition, c.context))
    )
    results.push(...batchResults)
  }
  
  return results
}
```

### RAG Optimizations

**1. Hierarchical Index**:
```javascript
// Build multi-level index for faster search
class HierarchicalRAG {
  constructor(contexts) {
    this.domainIndex = this.buildDomainIndex(contexts)
    this.typeIndex = this.buildTypeIndex(contexts)
    this.vectorIndex = this.buildVectorIndex(contexts)
  }

  async search(embedding, filters) {
    // First filter by domain/type (instant)
    let candidates = this.contexts
    
    if (filters.domain) {
      candidates = this.domainIndex[filters.domain] || []
    }
    
    if (filters.type && candidates.length > 100) {
      candidates = candidates.filter(c => c.type === filters.type)
    }
    
    // Then vector search only on candidates
    return this.vectorSearchSubset(embedding, candidates)
  }
}
```

**2. Pre-computed Embeddings**:
```javascript
// At compile time, compute embeddings for common queries
const COMMON_QUERIES = [
  "help with code",
  "character development",
  "workflow automation",
  // ... hundreds more from usage analysis
]

async function precomputeCommonEmbeddings() {
  const embeddings = {}
  
  for (const query of COMMON_QUERIES) {
    embeddings[query] = await generateEmbedding(query)
  }
  
  return embeddings
}
```

## Testing Strategy

### Unit Tests for Alpha LLM

```javascript
// tests/alpha-llm.test.js
describe('AlphaLLM', () => {
  test('evaluates semantic conditions correctly', async () => {
    const result = await alpha.evaluateSemanticCondition(
      'user is frustrated',
      { user_message: 'This is broken and nothing works!' }
    )
    
    expect(result.met).toBe(true)
    expect(result.confidence).toBeGreaterThan(0.8)
  })

  test('parses workflow YAML', async () => {
    const yaml = `
      steps:
        - context: agent://helper
          condition: "user needs help"
          next: complete
    `
    
    const parsed = await alpha.parseWorkflow(yaml)
    expect(parsed.steps).toHaveLength(1)
    expect(parsed.steps[0].context).toBe('agent://helper')
  })
})
```

### Integration Tests

```javascript
// tests/integration.test.js
describe('FlowMind Integration', () => {
  test('field_request returns relevant contexts', async () => {
    const response = await handler.handleFieldRequest({
      query: 'help with Python performance',
      extracted_variables: {
        domain: 'technical',
        technology: 'python'
      },
      confidence_level: 0.9
    })
    
    expect(response.status).toBe('success')
    expect(response.matches[0].uri).toContain('python')
  })
})
```

## Deployment Architecture

### Production Setup

```yaml
# docker-compose.yml
version: '3.8'

services:
  mcp-server:
    build: ./mcp
    ports:
      - "3000:3000"
    volumes:
      - ./compiled-contexts:/app/contexts
    environment:
      - ALPHA_MODEL_PATH=/models/llama-3.2-1b
      
  alpha-llm:
    image: ollama/ollama
    volumes:
      - ./models:/models
    deploy:
      resources:
        reservations:
          devices:
            - capabilities: [gpu]
              
  vector-db:
    image: qdrant/qdrant
    ports:
      - "6333:6333"
    volumes:
      - ./rag-data:/qdrant/storage
```

### Performance Targets

| Operation | Target | Method |
|-----------|--------|--------|
| Semantic evaluation | <50ms | Local quantized model |
| Context search | <20ms | Pre-computed embeddings |
| Workflow step | <100ms | Cached parsing |
| End-to-end field_request | <200ms | All optimizations |

## Conclusion

The dual LLM architecture enables FlowMind's revolutionary semantic programming capabilities. By separating conversational intelligence (Beta) from semantic parsing (Alpha), we achieve both powerful reasoning and real-time performance.

Key success factors:
1. Small, fast Alpha LLM for parsing/evaluation
2. Pre-computed RAG indices for instant search
3. Structured MCP tools that guide Beta behavior
4. Bidirectional teaching through response metadata

This architecture scales from personal use to enterprise deployment while maintaining sub-second semantic evaluation.

---

*"Two LLMs, working in harmony, create intelligence greater than the sum of their parts."*