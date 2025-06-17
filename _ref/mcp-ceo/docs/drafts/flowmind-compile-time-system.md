# FlowMind Compile-Time System Design

**Date**: January 9, 2025  
**Focus**: Build-time compilation, variable extraction, and RAG preparation

## Overview

FlowMind's performance depends on sophisticated compile-time preparation. This document details how we transform YAML contexts into optimized runtime artifacts.

## Compile-Time Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌────────────────┐
│  YAML Contexts  │ →   │   Compiler   │ →   │   Artifacts    │
│  (.yaml files)  │     │              │     │                │
└─────────────────┘     │  - Scanner   │     │ - Embeddings   │
                        │  - Parser    │     │ - Indices      │
                        │  - Extractor │     │ - Variables    │
                        │  - Optimizer │     │ - Instructions │
                        └──────────────┘     └────────────────┘
```

## Context Scanning & Discovery

### File System Scanner

```javascript
// lib/compiler/scanner.js
import { glob } from 'glob'
import { readFile } from 'fs/promises'
import yaml from 'yaml'

export class ContextScanner {
  constructor(options = {}) {
    this.basePath = options.basePath || './contexts'
    this.patterns = {
      agents: 'agents/**/*.yaml',
      workflows: 'workflows/**/*.yaml',
      patterns: 'patterns/**/*.yaml',
      types: 'types/**/*.yaml',
      tools: 'tools/**/*.yaml',
      themes: 'themes/**/*.yaml'
    }
  }

  async scanAll() {
    const contexts = []
    
    for (const [type, pattern] of Object.entries(this.patterns)) {
      const files = await glob(`${this.basePath}/${pattern}`)
      
      for (const file of files) {
        const context = await this.loadContext(file, type)
        contexts.push(context)
      }
    }
    
    return contexts
  }

  async loadContext(filepath, type) {
    const content = await readFile(filepath, 'utf-8')
    const parsed = yaml.parse(content)
    
    // Generate URI from filepath
    const uri = this.generateURI(filepath, type)
    
    return {
      uri,
      type,
      filepath,
      raw: parsed,
      metadata: this.extractMetadata(parsed, uri)
    }
  }

  generateURI(filepath, type) {
    // contexts/agents/ceo/context.yaml → agent://ceo
    const parts = filepath.split('/')
    const name = parts[parts.length - 2]  // folder name
    return `${type.slice(0, -1)}://${name}`
  }

  extractMetadata(context, uri) {
    return {
      name: context.metadata?.name || uri,
      description: context.metadata?.description || '',
      version: context.metadata?.version || '1.0.0',
      tags: context.metadata?.tags || [],
      dependencies: context.metadata?.dependencies || []
    }
  }
}
```

## Variable Extraction System

### Universal Variable Extractor

```javascript
// lib/compiler/variable-extractor.js
export class VariableExtractor {
  constructor() {
    this.variableRegistry = new Map()
    this.variableTypes = new Set()
  }

  async extractFromContexts(contexts) {
    for (const context of contexts) {
      await this.extractVariables(context)
    }
    
    return {
      registry: this.variableRegistry,
      types: Array.from(this.variableTypes),
      statistics: this.calculateStatistics()
    }
  }

  async extractVariables(context) {
    const variables = new Map()
    
    // Extract from different context types
    switch (context.type) {
      case 'workflows':
        this.extractWorkflowVariables(context, variables)
        break
      case 'agents':
        this.extractAgentVariables(context, variables)
        break
      case 'patterns':
        this.extractPatternVariables(context, variables)
        break
    }
    
    // Extract from activation conditions
    if (context.raw.activation_conditions) {
      this.extractActivationVariables(context.raw.activation_conditions, variables)
    }
    
    // Extract from steps/prompts
    this.extractTemplateVariables(context.raw, variables)
    
    // Register variables
    this.registerVariables(context.uri, variables)
  }

  extractWorkflowVariables(context, variables) {
    const workflow = context.raw
    
    // Extract from flow control
    if (workflow.flow) {
      this.walkFlow(workflow.flow, (node) => {
        if (node.variables) {
          Object.entries(node.variables).forEach(([key, spec]) => {
            variables.set(key, this.normalizeVariableSpec(spec))
          })
        }
      })
    }
    
    // Extract from steps
    if (workflow.steps) {
      workflow.steps.forEach(step => {
        if (step.extract_variables) {
          Object.entries(step.extract_variables).forEach(([key, spec]) => {
            variables.set(key, this.normalizeVariableSpec(spec))
          })
        }
      })
    }
  }

  extractActivationVariables(conditions, variables) {
    // Parse semantic conditions for implied variables
    if (conditions.semantic_if) {
      const implied = this.parseSemanticCondition(conditions.semantic_if)
      implied.forEach(([key, spec]) => variables.set(key, spec))
    }
    
    // Extract explicit variable requirements
    if (conditions.requires_variables) {
      conditions.requires_variables.forEach(varDef => {
        if (typeof varDef === 'string') {
          variables.set(varDef, { type: 'string', required: true })
        } else {
          variables.set(varDef.name, varDef)
        }
      })
    }
  }

  parseSemanticCondition(condition) {
    const variables = []
    
    // Common patterns in semantic conditions
    const patterns = [
      {
        regex: /user (?:reports?|mentions?|says?) (\w+)/i,
        extractor: (match) => ['user_report_type', { 
          type: 'string', 
          inferred: true,
          example: match[1]
        }]
      },
      {
        regex: /(\w+) (?:level|severity|priority) (?:is|equals?|>=?) (\w+)/i,
        extractor: (match) => [match[1] + '_level', {
          type: 'enum',
          values: ['low', 'medium', 'high', 'critical'],
          inferred: true
        }]
      },
      {
        regex: /confidence (?:level|score)? (?:>=?|is) ([\d.]+)/i,
        extractor: (match) => ['confidence_threshold', {
          type: 'number',
          min: 0,
          max: 1,
          inferred: true,
          default: parseFloat(match[1])
        }]
      }
    ]
    
    patterns.forEach(({ regex, extractor }) => {
      const match = condition.match(regex)
      if (match) {
        variables.push(extractor(match))
      }
    })
    
    return variables
  }

  normalizeVariableSpec(spec) {
    if (typeof spec === 'string') {
      return { type: spec, required: false }
    }
    
    if (Array.isArray(spec)) {
      return { type: 'enum', values: spec, required: false }
    }
    
    return {
      type: spec.type || 'string',
      values: spec.values,
      required: spec.required || false,
      default: spec.default,
      description: spec.description,
      validation: spec.validation
    }
  }

  registerVariables(contextURI, variables) {
    this.variableRegistry.set(contextURI, variables)
    
    // Track unique variable types
    variables.forEach((spec, name) => {
      this.variableTypes.add(name)
    })
  }

  calculateStatistics() {
    const stats = {
      totalContexts: this.variableRegistry.size,
      totalUniqueVariables: this.variableTypes.size,
      variablesByType: {},
      mostCommonVariables: []
    }
    
    // Count variable usage
    const variableUsage = new Map()
    
    this.variableRegistry.forEach((variables) => {
      variables.forEach((spec, name) => {
        variableUsage.set(name, (variableUsage.get(name) || 0) + 1)
        
        const type = spec.type
        stats.variablesByType[type] = (stats.variablesByType[type] || 0) + 1
      })
    })
    
    // Find most common variables
    stats.mostCommonVariables = Array.from(variableUsage.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name, count]) => ({ name, count }))
    
    return stats
  }
}
```

## Embedding Generation

### Context Embedding System

```javascript
// lib/compiler/embedder.js
import { pipeline } from '@xenova/transformers'

export class ContextEmbedder {
  constructor(options = {}) {
    this.modelName = options.model || 'sentence-transformers/all-MiniLM-L6-v2'
    this.dimension = options.dimension || 384
  }

  async initialize() {
    this.embedder = await pipeline('feature-extraction', this.modelName)
  }

  async embedContexts(contexts) {
    const embeddings = new Map()
    
    // Batch process for efficiency
    const batchSize = 32
    for (let i = 0; i < contexts.length; i += batchSize) {
      const batch = contexts.slice(i, i + batchSize)
      const batchEmbeddings = await this.embedBatch(batch)
      
      batch.forEach((context, idx) => {
        embeddings.set(context.uri, batchEmbeddings[idx])
      })
    }
    
    return embeddings
  }

  async embedBatch(contexts) {
    // Generate text representations for embedding
    const texts = contexts.map(ctx => this.contextToText(ctx))
    
    // Generate embeddings
    const outputs = await this.embedder(texts, {
      pooling: 'mean',
      normalize: true
    })
    
    return outputs.tolist()
  }

  contextToText(context) {
    const parts = []
    
    // Include metadata
    parts.push(context.metadata.name)
    parts.push(context.metadata.description)
    
    // Include tags
    if (context.metadata.tags?.length) {
      parts.push(`tags: ${context.metadata.tags.join(' ')}`)
    }
    
    // Include activation conditions
    if (context.raw.activation_conditions?.semantic_if) {
      parts.push(`activates when: ${context.raw.activation_conditions.semantic_if}`)
    }
    
    // Include variable names for semantic matching
    if (context.raw.variables) {
      const varNames = Object.keys(context.raw.variables)
      parts.push(`variables: ${varNames.join(' ')}`)
    }
    
    // Include key content based on type
    switch (context.type) {
      case 'agents':
        if (context.raw.personality?.traits) {
          parts.push(`traits: ${context.raw.personality.traits.join(' ')}`)
        }
        break
        
      case 'workflows':
        if (context.raw.steps) {
          const stepDescriptions = context.raw.steps
            .map(s => s.description || s.name)
            .filter(Boolean)
          parts.push(`steps: ${stepDescriptions.join(' ')}`)
        }
        break
        
      case 'patterns':
        if (context.raw.purpose) {
          parts.push(`purpose: ${context.raw.purpose}`)
        }
        break
    }
    
    return parts.filter(Boolean).join(' | ')
  }

  async embedVariable(variableName, variableSpec) {
    const text = [
      variableName,
      variableSpec.description,
      variableSpec.type,
      variableSpec.values?.join(' ')
    ].filter(Boolean).join(' ')
    
    const output = await this.embedder(text, {
      pooling: 'mean',
      normalize: true
    })
    
    return output.tolist()[0]
  }
}
```

## Instruction Compilation

### Natural Language Instruction Generator

```javascript
// lib/compiler/instruction-compiler.js
export class InstructionCompiler {
  constructor() {
    this.templates = this.loadTemplates()
  }

  async compileInstructions(contexts) {
    const instructions = new Map()
    
    for (const context of contexts) {
      const instruction = await this.compileContextInstruction(context)
      instructions.set(context.uri, instruction)
    }
    
    return instructions
  }

  async compileContextInstruction(context) {
    const instruction = {
      activation: this.compileActivationInstruction(context),
      execution: this.compileExecutionInstruction(context),
      completion: this.compileCompletionInstruction(context),
      variables: this.compileVariableInstructions(context)
    }
    
    return instruction
  }

  compileActivationInstruction(context) {
    const conditions = context.raw.activation_conditions
    
    if (!conditions) {
      return {
        instruction: `Execute ${context.uri} when requested`,
        requirements: []
      }
    }
    
    const parts = []
    const requirements = []
    
    if (conditions.semantic_if) {
      parts.push(`ONLY execute this ${context.type} if: ${conditions.semantic_if}`)
      requirements.push({
        type: 'semantic_evaluation',
        condition: conditions.semantic_if
      })
    }
    
    if (conditions.confidence_threshold) {
      parts.push(`Require ${conditions.confidence_threshold * 100}% confidence`)
      requirements.push({
        type: 'confidence_check',
        threshold: conditions.confidence_threshold
      })
    }
    
    if (conditions.requires_variables) {
      const varList = conditions.requires_variables.join(', ')
      parts.push(`Required information: ${varList}`)
      requirements.push({
        type: 'variable_check',
        variables: conditions.requires_variables
      })
    }
    
    return {
      instruction: parts.join('. '),
      requirements
    }
  }

  compileExecutionInstruction(context) {
    switch (context.type) {
      case 'agents':
        return this.compileAgentInstruction(context)
      case 'workflows':
        return this.compileWorkflowInstruction(context)
      case 'patterns':
        return this.compilePatternInstruction(context)
      default:
        return { instruction: `Apply ${context.uri}` }
    }
  }

  compileAgentInstruction(context) {
    const agent = context.raw
    const parts = []
    
    parts.push(`You are ${agent.metadata.name}`)
    
    if (agent.personality?.description) {
      parts.push(agent.personality.description)
    }
    
    if (agent.behavior?.primary_focus) {
      parts.push(`Focus on: ${agent.behavior.primary_focus}`)
    }
    
    if (agent.behavior?.approach) {
      parts.push(`Approach: ${agent.behavior.approach}`)
    }
    
    return {
      instruction: parts.join('. '),
      rolePlay: agent.personality,
      behavior: agent.behavior
    }
  }

  compileWorkflowInstruction(context) {
    const workflow = context.raw
    const parts = []
    
    parts.push(`Execute workflow: ${workflow.metadata.name}`)
    
    if (workflow.metadata.description) {
      parts.push(workflow.metadata.description)
    }
    
    if (workflow.flow?.type === 'recursive_loop') {
      parts.push('This is a RECURSIVE workflow that continues until resolution')
      
      if (workflow.flow.while_semantic) {
        parts.push(`Continue while: ${workflow.flow.while_semantic}`)
      }
      
      if (workflow.flow.max_iterations) {
        parts.push(`Maximum iterations: ${workflow.flow.max_iterations}`)
      }
    }
    
    if (workflow.steps?.length) {
      parts.push(`${workflow.steps.length} steps to execute sequentially`)
    }
    
    return {
      instruction: parts.join('. '),
      flow: workflow.flow,
      stepCount: workflow.steps?.length || 0
    }
  }

  compileVariableInstructions(context) {
    const variables = context.raw.variables || {}
    const instructions = {}
    
    Object.entries(variables).forEach(([name, spec]) => {
      const normalizedSpec = this.normalizeVariableSpec(spec)
      
      instructions[name] = {
        prompt: this.generateVariablePrompt(name, normalizedSpec),
        validation: this.generateValidationRule(name, normalizedSpec),
        extraction: this.generateExtractionHint(name, normalizedSpec)
      }
    })
    
    return instructions
  }

  generateVariablePrompt(name, spec) {
    const parts = [`Extract ${name}`]
    
    if (spec.description) {
      parts.push(`(${spec.description})`)
    }
    
    if (spec.type === 'enum' && spec.values) {
      parts.push(`Options: ${spec.values.join(', ')}`)
    }
    
    if (spec.type === 'number' && (spec.min !== undefined || spec.max !== undefined)) {
      const range = []
      if (spec.min !== undefined) range.push(`min: ${spec.min}`)
      if (spec.max !== undefined) range.push(`max: ${spec.max}`)
      parts.push(`Range: ${range.join(', ')}`)
    }
    
    return parts.join(' ')
  }

  generateValidationRule(name, spec) {
    const rules = []
    
    if (spec.required) {
      rules.push({ type: 'required', message: `${name} is required` })
    }
    
    if (spec.type === 'enum' && spec.values) {
      rules.push({
        type: 'enum',
        values: spec.values,
        message: `${name} must be one of: ${spec.values.join(', ')}`
      })
    }
    
    if (spec.validation) {
      rules.push({
        type: 'custom',
        rule: spec.validation,
        message: spec.validation.message || `${name} validation failed`
      })
    }
    
    return rules
  }

  generateExtractionHint(name, spec) {
    // Hints for Beta LLM on how to extract this variable
    const hints = []
    
    // Common extraction patterns
    const patterns = {
      urgency: 'Look for words like: urgent, ASAP, critical, important, whenever',
      sentiment: 'Analyze emotional tone: frustrated, happy, confused, angry',
      domain: 'Identify area: technical, creative, business, personal',
      technology: 'Extract mentioned technologies, languages, frameworks',
      location: 'Find geographic references: city, state, country, address'
    }
    
    if (patterns[name]) {
      hints.push(patterns[name])
    }
    
    if (spec.extraction_hints) {
      hints.push(...spec.extraction_hints)
    }
    
    return hints
  }
}
```

## Build Orchestrator

### Complete Build Pipeline

```javascript
// lib/compiler/build-orchestrator.js
import { ContextScanner } from './scanner'
import { VariableExtractor } from './variable-extractor'
import { ContextEmbedder } from './embedder'
import { InstructionCompiler } from './instruction-compiler'
import { IndexBuilder } from './index-builder'

export class BuildOrchestrator {
  constructor(config = {}) {
    this.config = {
      contextsPath: './contexts',
      outputPath: './build',
      ...config
    }
    
    this.scanner = new ContextScanner({ basePath: this.config.contextsPath })
    this.variableExtractor = new VariableExtractor()
    this.embedder = new ContextEmbedder()
    this.instructionCompiler = new InstructionCompiler()
    this.indexBuilder = new IndexBuilder()
  }

  async build() {
    console.log('🔨 Starting FlowMind compile process...')
    
    // 1. Scan contexts
    console.log('📂 Scanning contexts...')
    const contexts = await this.scanner.scanAll()
    console.log(`   Found ${contexts.length} contexts`)
    
    // 2. Extract variables
    console.log('🔍 Extracting variables...')
    const variables = await this.variableExtractor.extractFromContexts(contexts)
    console.log(`   Found ${variables.types.length} unique variable types`)
    
    // 3. Generate embeddings
    console.log('🧮 Generating embeddings...')
    await this.embedder.initialize()
    const contextEmbeddings = await this.embedder.embedContexts(contexts)
    const variableEmbeddings = await this.embedVariables(variables)
    console.log(`   Generated ${contextEmbeddings.size} context embeddings`)
    
    // 4. Compile instructions
    console.log('📝 Compiling instructions...')
    const instructions = await this.instructionCompiler.compileInstructions(contexts)
    console.log(`   Compiled ${instructions.size} instruction sets`)
    
    // 5. Build indices
    console.log('🏗️ Building indices...')
    const indices = await this.indexBuilder.buildIndices({
      contexts,
      embeddings: contextEmbeddings,
      variables,
      instructions
    })
    
    // 6. Create artifacts
    console.log('💾 Creating build artifacts...')
    const artifacts = await this.createArtifacts({
      contexts,
      variables,
      embeddings: {
        contexts: contextEmbeddings,
        variables: variableEmbeddings
      },
      instructions,
      indices
    })
    
    // 7. Write output
    console.log('✍️ Writing output files...')
    await this.writeArtifacts(artifacts)
    
    console.log('✅ Build complete!')
    
    return artifacts
  }

  async embedVariables(variables) {
    const embeddings = new Map()
    
    for (const [varName, contexts] of variables.registry) {
      // Create aggregate variable representation
      const varEmbedding = await this.embedder.embedVariable(varName, {
        contexts: Array.from(contexts.keys()),
        types: Array.from(new Set(Array.from(contexts.values()).map(v => v.type)))
      })
      
      embeddings.set(varName, varEmbedding)
    }
    
    return embeddings
  }

  async createArtifacts(buildData) {
    return {
      manifest: {
        version: '1.0.0',
        buildTime: new Date().toISOString(),
        statistics: {
          contexts: buildData.contexts.length,
          variables: buildData.variables.types.length,
          embeddings: buildData.embeddings.contexts.size
        }
      },
      
      contexts: this.serializeContexts(buildData.contexts),
      
      variables: {
        registry: Object.fromEntries(buildData.variables.registry),
        types: buildData.variables.types,
        statistics: buildData.variables.statistics
      },
      
      embeddings: {
        contexts: this.serializeEmbeddings(buildData.embeddings.contexts),
        variables: this.serializeEmbeddings(buildData.embeddings.variables),
        metadata: {
          model: this.embedder.modelName,
          dimension: this.embedder.dimension
        }
      },
      
      instructions: Object.fromEntries(buildData.instructions),
      
      indices: buildData.indices
    }
  }

  serializeContexts(contexts) {
    return contexts.map(ctx => ({
      uri: ctx.uri,
      type: ctx.type,
      metadata: ctx.metadata,
      filepath: ctx.filepath,
      // Don't include raw YAML in build artifacts
      compiled: true
    }))
  }

  serializeEmbeddings(embeddings) {
    const serialized = {}
    embeddings.forEach((embedding, key) => {
      serialized[key] = Array.from(embedding)
    })
    return serialized
  }

  async writeArtifacts(artifacts) {
    const { outputPath } = this.config
    
    // Ensure output directory exists
    await fs.mkdir(outputPath, { recursive: true })
    
    // Write manifest
    await fs.writeFile(
      `${outputPath}/manifest.json`,
      JSON.stringify(artifacts.manifest, null, 2)
    )
    
    // Write each artifact type
    const artifactFiles = {
      'contexts.json': artifacts.contexts,
      'variables.json': artifacts.variables,
      'embeddings.json': artifacts.embeddings,
      'instructions.json': artifacts.instructions,
      'indices.json': artifacts.indices
    }
    
    for (const [filename, data] of Object.entries(artifactFiles)) {
      await fs.writeFile(
        `${outputPath}/${filename}`,
        JSON.stringify(data, null, 2)
      )
    }
    
    // Create optimized binary format for embeddings
    await this.writeBinaryEmbeddings(artifacts.embeddings)
  }

  async writeBinaryEmbeddings(embeddings) {
    // Write embeddings in efficient binary format for fast loading
    const { outputPath } = this.config
    
    // Context embeddings as Float32Array
    const contextArray = new Float32Array(
      Object.values(embeddings.contexts).flat()
    )
    await fs.writeFile(
      `${outputPath}/embeddings-contexts.bin`,
      Buffer.from(contextArray.buffer)
    )
    
    // Variable embeddings as Float32Array
    const variableArray = new Float32Array(
      Object.values(embeddings.variables).flat()
    )
    await fs.writeFile(
      `${outputPath}/embeddings-variables.bin`,
      Buffer.from(variableArray.buffer)
    )
  }
}
```

## Index Building

### Optimized Index Structures

```javascript
// lib/compiler/index-builder.js
export class IndexBuilder {
  async buildIndices(buildData) {
    const indices = {
      vector: await this.buildVectorIndex(buildData),
      variable: await this.buildVariableIndex(buildData),
      semantic: await this.buildSemanticIndex(buildData),
      hierarchy: await this.buildHierarchyIndex(buildData)
    }
    
    return indices
  }

  async buildVectorIndex(buildData) {
    // Using Annoy for approximate nearest neighbors
    const Annoy = require('annoy')
    const index = new Annoy(buildData.embeddings.dimension, 'angular')
    
    // Add all context embeddings
    let idx = 0
    const uriToIndex = new Map()
    const indexToUri = new Map()
    
    buildData.embeddings.contexts.forEach((embedding, uri) => {
      index.addItem(idx, embedding)
      uriToIndex.set(uri, idx)
      indexToUri.set(idx, uri)
      idx++
    })
    
    // Build the index
    index.build(50) // 50 trees for good accuracy
    
    // Save index
    const indexPath = `${buildData.outputPath}/vector-index.ann`
    index.save(indexPath)
    
    return {
      type: 'annoy',
      path: indexPath,
      mappings: {
        uriToIndex: Object.fromEntries(uriToIndex),
        indexToUri: Object.fromEntries(indexToUri)
      },
      metadata: {
        items: idx,
        dimension: buildData.embeddings.dimension,
        trees: 50
      }
    }
  }

  async buildVariableIndex(buildData) {
    const index = {
      byName: {},      // variable name → contexts using it
      byType: {},      // variable type → variable names
      byContext: {},   // context URI → variables defined
      commonalities: {}// variables used together frequently
    }
    
    // Build primary indices
    buildData.variables.registry.forEach((variables, contextUri) => {
      index.byContext[contextUri] = {}
      
      variables.forEach((spec, varName) => {
        // By name index
        if (!index.byName[varName]) {
          index.byName[varName] = []
        }
        index.byName[varName].push(contextUri)
        
        // By type index
        const type = spec.type || 'string'
        if (!index.byType[type]) {
          index.byType[type] = []
        }
        if (!index.byType[type].includes(varName)) {
          index.byType[type].push(varName)
        }
        
        // By context index
        index.byContext[contextUri][varName] = spec
      })
    })
    
    // Find variable commonalities (variables often used together)
    index.commonalities = this.findVariableCommonalities(index.byContext)
    
    return index
  }

  findVariableCommonalities(byContext) {
    const pairs = new Map()
    
    // Count co-occurrences
    Object.values(byContext).forEach(variables => {
      const varNames = Object.keys(variables)
      
      // Generate all pairs
      for (let i = 0; i < varNames.length; i++) {
        for (let j = i + 1; j < varNames.length; j++) {
          const pair = [varNames[i], varNames[j]].sort().join(':')
          pairs.set(pair, (pairs.get(pair) || 0) + 1)
        }
      }
    })
    
    // Find frequent pairs (appear in 3+ contexts)
    const commonalities = {}
    pairs.forEach((count, pair) => {
      if (count >= 3) {
        const [var1, var2] = pair.split(':')
        
        if (!commonalities[var1]) commonalities[var1] = []
        if (!commonalities[var2]) commonalities[var2] = []
        
        commonalities[var1].push({ variable: var2, count })
        commonalities[var2].push({ variable: var1, count })
      }
    })
    
    return commonalities
  }

  async buildSemanticIndex(buildData) {
    // Index for semantic condition matching
    const index = {
      conditions: [],           // All semantic conditions
      conditionEmbeddings: {}, // Condition → embedding
      patterns: {},            // Common semantic patterns
      triggers: {}             // Keyword triggers → conditions
    }
    
    // Extract all semantic conditions
    buildData.contexts.forEach(context => {
      if (context.raw.activation_conditions?.semantic_if) {
        const condition = {
          uri: context.uri,
          text: context.raw.activation_conditions.semantic_if,
          type: 'activation'
        }
        
        index.conditions.push(condition)
        
        // Extract trigger keywords
        this.extractTriggers(condition.text).forEach(trigger => {
          if (!index.triggers[trigger]) {
            index.triggers[trigger] = []
          }
          index.triggers[trigger].push(condition)
        })
      }
      
      // Extract from workflow steps
      if (context.raw.steps) {
        context.raw.steps.forEach((step, idx) => {
          if (step.when_semantic) {
            const condition = {
              uri: `${context.uri}#step${idx}`,
              text: step.when_semantic,
              type: 'step_condition'
            }
            
            index.conditions.push(condition)
          }
        })
      }
    })
    
    // Generate embeddings for conditions
    for (const condition of index.conditions) {
      const embedding = await buildData.embedder.embedText(condition.text)
      index.conditionEmbeddings[condition.uri] = embedding
    }
    
    // Identify common patterns
    index.patterns = this.extractSemanticPatterns(index.conditions)
    
    return index
  }

  extractTriggers(text) {
    // Extract key trigger words from semantic conditions
    const triggers = []
    
    // Common trigger patterns
    const patterns = [
      /user (?:reports?|mentions?|says?|needs?|wants?)/gi,
      /(?:production|system|service) (?:down|issue|problem)/gi,
      /(?:help|assist|support) with/gi,
      /(?:create|build|make|develop)/gi,
      /(?:analyze|investigate|debug|fix)/gi
    ]
    
    patterns.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) {
        triggers.push(...matches.map(m => m.toLowerCase()))
      }
    })
    
    return [...new Set(triggers)]
  }

  extractSemanticPatterns(conditions) {
    // Group conditions by common patterns
    const patterns = {
      user_report: [],
      system_state: [],
      user_need: [],
      threshold_check: []
    }
    
    conditions.forEach(condition => {
      const text = condition.text.toLowerCase()
      
      if (text.includes('user report') || text.includes('user mention')) {
        patterns.user_report.push(condition)
      }
      
      if (text.includes('system') || text.includes('service')) {
        patterns.system_state.push(condition)
      }
      
      if (text.includes('user need') || text.includes('user want')) {
        patterns.user_need.push(condition)
      }
      
      if (text.match(/\d+%|confidence|threshold/)) {
        patterns.threshold_check.push(condition)
      }
    })
    
    return patterns
  }

  async buildHierarchyIndex(buildData) {
    // Build hierarchical index for navigation
    const index = {
      tree: {},
      paths: {},     // URI → path in tree
      children: {},  // URI → child URIs
      parents: {}    // URI → parent URI
    }
    
    buildData.contexts.forEach(context => {
      const parts = context.uri.split('/')
      const type = parts[0].replace(':', '')
      const path = parts.slice(1)
      
      // Build tree structure
      let node = index.tree
      if (!node[type]) node[type] = {}
      node = node[type]
      
      path.forEach((part, idx) => {
        if (!node[part]) node[part] = {}
        node = node[part]
        
        // Track parent-child relationships
        const currentPath = `${type}://${path.slice(0, idx + 1).join('/')}`
        const parentPath = idx > 0 
          ? `${type}://${path.slice(0, idx).join('/')}`
          : `${type}://`
        
        index.paths[currentPath] = path.slice(0, idx + 1)
        
        if (!index.children[parentPath]) {
          index.children[parentPath] = []
        }
        index.children[parentPath].push(currentPath)
        
        index.parents[currentPath] = parentPath
      })
      
      // Store context at leaf
      node._context = context.uri
    })
    
    return index
  }
}
```

## Usage in Development

### Build Script

```json
// package.json
{
  "scripts": {
    "build": "node scripts/build-flowmind.js",
    "build:watch": "nodemon --watch contexts --exec npm run build",
    "build:prod": "NODE_ENV=production npm run build"
  }
}
```

```javascript
// scripts/build-flowmind.js
import { BuildOrchestrator } from '../lib/compiler/build-orchestrator'

async function build() {
  const orchestrator = new BuildOrchestrator({
    contextsPath: './contexts',
    outputPath: './build',
    production: process.env.NODE_ENV === 'production'
  })
  
  try {
    const artifacts = await orchestrator.build()
    
    // Display build summary
    console.log('\n📊 Build Summary:')
    console.log(`   Contexts: ${artifacts.manifest.statistics.contexts}`)
    console.log(`   Variables: ${artifacts.manifest.statistics.variables}`)
    console.log(`   Embeddings: ${artifacts.manifest.statistics.embeddings}`)
    console.log(`   Output: ./build/`)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Build failed:', error)
    process.exit(1)
  }
}

build()
```

### Development Workflow

```bash
# Initial build
npm run build

# Watch mode during development
npm run build:watch

# Production build with optimizations
npm run build:prod

# Clean and rebuild
rm -rf build && npm run build
```

## Performance Considerations

### Optimization Strategies

1. **Incremental Builds**
   - Track file changes
   - Only rebuild affected contexts
   - Reuse unchanged embeddings

2. **Parallel Processing**
   - Embed contexts in parallel batches
   - Use worker threads for CPU-intensive tasks
   - Stream large files

3. **Caching**
   - Cache embeddings by content hash
   - Store intermediate compilation results
   - Reuse vector indices when possible

4. **Binary Formats**
   - Store embeddings as binary Float32Arrays
   - Use memory-mapped files for large indices
   - Compress instruction sets

### Build Time Targets

| Operation | Target Time | Strategy |
|-----------|------------|----------|
| Context scan | <1s | Parallel file reading |
| Variable extraction | <2s | Stream processing |
| Embedding generation | <30s | Batch processing |
| Index building | <10s | Incremental updates |
| Total build | <45s | All optimizations |

## Conclusion

The compile-time system transforms human-readable YAML contexts into optimized runtime artifacts. Through sophisticated extraction, embedding, and indexing, we enable sub-50ms semantic evaluation at runtime while maintaining the flexibility of natural language programming.

Key innovations:
1. Automatic variable extraction from semantic conditions
2. Multi-layer indexing for instant lookup
3. Pre-computed embeddings for all contexts
4. Natural language instruction compilation

This foundation enables FlowMind's real-time semantic programming capabilities.

---

*"Compile once, reason infinitely."*