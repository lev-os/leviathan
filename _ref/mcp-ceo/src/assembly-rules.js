/**
 * Assembly Rules System - COMMENTED OUT FOR v0.1.0
 * 
 * STATUS: Sophisticated implementation premature for current scope
 * REASON: Only used in tests, not connected to production code
 * ACTION: Keep structure, disable functionality until auto-discovery needed
 * 
 * FUTURE FEATURES (when uncommented):
 * - Priority-based context ordering
 * - Conflict resolution between personalities
 * - Relevance filtering with semantic similarity
 * - Token optimization and intelligent truncation
 */

// import { ContextTracker } from './context-tracker.js'

// // Base priority definitions
// const DEFAULT_PRIORITIES = {
//   core_principles: 100,
//   active_personality: 90,
//   workflow_context: 80,
//   previous_responses: 70,
//   memory_context: 60,
//   supporting_personality: 50,
//   metadata: 30
// }

// // Assembly Rules Engine
// export class AssemblyRules {
//   constructor(config = {}) {
//     this.basePriorities = config.basePriorities || DEFAULT_PRIORITIES
//     this.tokenLimit = config.tokenLimit || 4000
//     this.tokenCounter = config.tokenCounter || new TokenCounter()
//     this.conflictStrategy = config.conflictStrategy || 'weighted_merge'
//     this.relevanceThreshold = config.relevanceThreshold || 0.6
//   }
  
//   applyPriorities(contexts, stageConfig = {}) {
//     return contexts.map(context => {
//       let priority = context.priority || 
//                     this.basePriorities[context.type] || 
//                     50
      
//       // Apply stage-specific adjustments
//       if (stageConfig.lead === context.source) {
//         priority = Math.max(priority, 95)
//       }
      
//       // Apply role-based adjustments
//       if (context.role === 'primary' && stageConfig.stage === 'decision') {
//         priority += 10
//       }
      
//       // Apply workflow-specific boosts
//       if (stageConfig.workflow_focus && context.capabilities?.includes(stageConfig.workflow_focus)) {
//         priority += 5
//       }
      
//       return { ...context, effectivePriority: priority }
//     }).sort((a, b) => b.effectivePriority - a.effectivePriority)
//   }
  
//   assembleWithPriority(contexts, tokenLimit) {
//     const prioritized = this.applyPriorities(contexts)
//     const assembled = []
//     let tokenCount = 0
    
//     for (const context of prioritized) {
//       const contextTokens = this.tokenCounter.count(context.text)
      
//       if (tokenCount + contextTokens <= tokenLimit) {
//         assembled.push(context)
//         tokenCount += contextTokens
//       } else if (context.effectivePriority >= 90) {
//         // High priority content must be included - truncate if necessary
//         const availableTokens = tokenLimit - tokenCount
//         const truncated = this.tokenCounter.truncate(context.text, availableTokens)
//         if (truncated.length > 0) {
//           assembled.push({ ...context, text: truncated, truncated: true })
//           tokenCount += this.tokenCounter.count(truncated)
//         }
//         break
//       }
//     }
    
//     return { assembled, tokenCount, truncated: assembled.some(c => c.truncated) }
//   }
// }

// // Conflict Resolution System
// export class ConflictResolver {
//   constructor(strategy = 'weighted_merge', options = {}) {
//     this.strategy = strategy
//     this.synthesizer = options.synthesizer || new TextSynthesizer()
//     this.semanticAnalyzer = options.semanticAnalyzer || new SemanticAnalyzer()
//     this.tracker = options.tracker || new ContextTracker()
//   }
  
//   async resolveConflicts(contexts) {
//     const conflicts = await this.detectConflicts(contexts)
    
//     if (conflicts.length === 0) {
//       return this.simpleMerge(contexts)
//     }
    
//     // Track the conflict resolution process
//     const resolutionId = this.tracker.trackContribution(
//       'conflict_resolver',
//       `Resolving ${conflicts.length} conflicts using ${this.strategy}`,
//       { conflicts: conflicts.length, strategy: this.strategy }
//     )
    
//     switch (this.strategy) {
//       case 'weighted_merge':
//         return this.weightedMerge(contexts, conflicts)
      
//       case 'synthesis':
//         return this.synthesizeResolution(contexts, conflicts)
        
//       case 'escalate':
//         return this.escalateConflicts(contexts, conflicts)
        
//       case 'personality_lead':
//         return this.personalityLead(contexts, conflicts)
        
//       default:
//         return this.simpleMerge(contexts)
//     }
//   }
  
//   async detectConflicts(contexts) {
//     const conflicts = []
    
//     for (let i = 0; i < contexts.length; i++) {
//       for (let j = i + 1; j < contexts.length; j++) {
//         const context1 = contexts[i]
//         const context2 = contexts[j]
        
//         // Calculate semantic similarity
//         const similarity = await this.semanticAnalyzer.similarity(
//           context1.text, 
//           context2.text
//         )
        
//         // High similarity but different sources might indicate conflict
//         if (similarity > 0.7 && context1.source !== context2.source) {
//           const sentiment1 = await this.semanticAnalyzer.sentiment(context1.text)
//           const sentiment2 = await this.semanticAnalyzer.sentiment(context2.text)
          
//           // Opposite sentiments indicate conflict
//           if (Math.abs(sentiment1 - sentiment2) > 0.6) {
//             conflicts.push({
//               sources: [context1.source, context2.source],
//               contexts: [context1, context2],
//               type: 'direct_contradiction',
//               confidence: similarity,
//               sentimentGap: Math.abs(sentiment1 - sentiment2)
//             })
//           }
//         }
//       }
//     }
    
//     return conflicts
//   }
  
//   async synthesizeResolution(contexts, conflicts) {
//     const contextSummaries = contexts.map(c => `${c.source}: "${c.text.substring(0, 100)}..."`).join('\n')
//     const conflictSummaries = conflicts.map(c => `${c.sources.join(' vs ')}: ${c.type}`).join('\n')
    
//     const synthesisPrompt = `
// Given these perspectives:
// ${contextSummaries}

// Conflicts detected:
// ${conflictSummaries}

// Create a balanced synthesis that acknowledges all perspectives while resolving conflicts constructively.
// Focus on finding common ground and creating actionable compromise solutions.
// `
    
//     const synthesis = await this.synthesizer.generate(synthesisPrompt, contexts)
    
//     // Track the synthesis
//     const synthesisId = this.tracker.trackSynthesis(
//       contexts.map(c => c.id || this.tracker.generateId()),
//       synthesis,
//       'conflict_resolution_synthesis',
//       { conflicts, originalContexts: contexts.length }
//     )
    
//     return {
//       text: synthesis,
//       conflictsResolved: conflicts.length,
//       strategy: 'synthesis',
//       synthesisId
//     }
//   }
  
//   weightedMerge(contexts, conflicts) {
//     // Weight contexts by priority and confidence
//     const weighted = contexts.map(context => {
//       let weight = context.effectivePriority || 50
      
//       // Reduce weight if involved in conflicts
//       const contextConflicts = conflicts.filter(c => 
//         c.sources.includes(context.source)
//       )
//       weight *= Math.pow(0.9, contextConflicts.length)
      
//       return { ...context, weight }
//     })
    
//     // Sort by weight and combine
//     weighted.sort((a, b) => b.weight - a.weight)
//     const merged = weighted.map(c => `[${c.source}]: ${c.text}`).join('\n\n')
    
//     return {
//       text: merged,
//       conflictsResolved: conflicts.length,
//       strategy: 'weighted_merge',
//       weights: weighted.map(c => ({ source: c.source, weight: c.weight }))
//     }
//   }
  
//   simpleMerge(contexts) {
//     const merged = contexts.map(c => `[${c.source}]: ${c.text}`).join('\n\n')
//     return {
//       text: merged,
//       conflictsResolved: 0,
//       strategy: 'simple_merge'
//     }
//   }
// }

// // Relevance Filtering System
// export class RelevanceFilter {
//   constructor(config = {}) {
//     this.threshold = config.threshold || 0.6
//     this.decayFactor = config.decayFactor || 0.9
//     this.boostRules = config.boostRules || {}
//     this.embedder = config.embedder || new TextEmbedder()
//     this.semanticAnalyzer = new SemanticAnalyzer()
//   }
  
//   async filterByRelevance(contexts, currentTask) {
//     const taskEmbedding = await this.embedder.embed(currentTask.description)
    
//     const scored = await Promise.all(contexts.map(async context => {
//       let relevance = await this.calculateSemanticRelevance(
//         context.text, 
//         taskEmbedding
//       )
      
//       // Apply temporal decay
//       if (context.timestamp) {
//         relevance *= this.applyTemporalDecay(context.timestamp)
//       }
      
//       // Apply contextual boosting
//       relevance *= this.applyBoostRules(context, currentTask)
      
//       return { ...context, relevance }
//     }))
    
//     // Filter and sort
//     return scored
//       .filter(c => c.relevance >= this.threshold)
//       .sort((a, b) => b.relevance - a.relevance)
//   }
  
//   async calculateSemanticRelevance(text, taskEmbedding) {
//     const textEmbedding = await this.embedder.embed(text)
//     return this.cosineSimilarity(textEmbedding, taskEmbedding)
//   }
  
//   cosineSimilarity(vecA, vecB) {
//     // Simple cosine similarity calculation
//     if (!vecA || !vecB || vecA.length !== vecB.length) return 0
    
//     const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0)
//     const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0))
//     const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0))
    
//     return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0
//   }
  
//   applyTemporalDecay(timestamp) {
//     const ageInDays = (Date.now() - timestamp) / (1000 * 60 * 60 * 24)
//     return Math.pow(this.decayFactor, ageInDays)
//   }
  
//   applyBoostRules(context, task) {
//     let boost = 1.0
    
//     // Check if source matches task focus
//     if (task.focus && this.boostRules[task.focus]) {
//       const rule = this.boostRules[task.focus]
//       if (rule.sources && rule.sources.includes(context.source)) {
//         boost *= rule.multiplier || 1.5
//       }
//     }
    
//     // Keyword matching
//     const keywords = task.keywords || []
//     const matches = keywords.filter(k => 
//       context.text.toLowerCase().includes(k.toLowerCase())
//     ).length
//     boost *= (1 + 0.1 * matches)
    
//     // Type-based boosting
//     if (task.preferred_types && task.preferred_types.includes(context.type)) {
//       boost *= 1.2
//     }
    
//     return boost
//   }
// }// Token Optimization System
// export class TokenOptimizer {
//   constructor(config = {}) {
//     this.tokenizer = config.tokenizer || new GPTTokenizer()
//     this.compressionRules = config.compressionRules || this.getDefaultRules()
//     this.maxTokens = config.maxTokens || 4000
//   }
  
//   optimizeAssembly(contexts, totalLimit) {
//     const allocations = this.calculateAllocations(contexts, totalLimit)
//     const optimized = []
    
//     for (const context of contexts) {
//       const allocation = allocations[context.type] || 
//                         totalLimit / contexts.length
      
//       let optimizedText = context.text
//       let compressed = false
      
//       // Apply compression if needed
//       if (this.tokenizer.count(optimizedText) > allocation) {
//         optimizedText = this.compress(optimizedText, allocation)
//         compressed = true
//       }
      
//       optimized.push({
//         ...context,
//         text: optimizedText,
//         tokens: this.tokenizer.count(optimizedText),
//         compressed,
//         allocatedTokens: allocation
//       })
//     }
    
//     return optimized
//   }
  
//   calculateAllocations(contexts, totalLimit) {
//     const allocations = {}
//     const typeGroups = this.groupByType(contexts)
    
//     // Default allocation percentages
//     const allocationRules = {
//       core_principles: 0.10,
//       active_personality: 0.40,
//       workflow_context: 0.30,
//       previous_responses: 0.15,
//       metadata: 0.05
//     }
    
//     Object.entries(allocationRules).forEach(([type, percentage]) => {
//       if (typeGroups[type]) {
//         allocations[type] = Math.floor(totalLimit * percentage)
//       }
//     })
    
//     return allocations
//   }
  
//   groupByType(contexts) {
//     const groups = {}
//     contexts.forEach(context => {
//       const type = context.type || 'other'
//       if (!groups[type]) groups[type] = []
//       groups[type].push(context)
//     })
//     return groups
//   }
  
//   compress(text, targetTokens) {
//     let compressed = text
    
//     // Remove redundancy
//     compressed = this.removeRedundancy(compressed)
    
//     // If still too long, intelligently truncate
//     if (this.tokenizer.count(compressed) > targetTokens) {
//       compressed = this.intelligentTruncate(compressed, targetTokens)
//     }
    
//     return compressed
//   }
  
//   removeRedundancy(text) {
//     // Split into sentences
//     const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
//     const unique = []
//     const seen = new Set()
    
//     for (const sentence of sentences) {
//       const normalized = sentence.toLowerCase().trim()
//       const hash = this.semanticHash(normalized)
      
//       if (!seen.has(hash)) {
//         seen.add(hash)
//         unique.push(sentence.trim())
//       }
//     }
    
//     return unique.join(' ')
//   }
  
//   intelligentTruncate(text, targetTokens) {
//     const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
//     let result = ''
//     let tokenCount = 0
    
//     for (const sentence of sentences) {
//       const sentenceTokens = this.tokenizer.count(sentence)
//       if (tokenCount + sentenceTokens <= targetTokens) {
//         result += sentence + ' '
//         tokenCount += sentenceTokens
//       } else {
//         // Add truncation indicator
//         if (result.length > 0) {
//           result += '... [truncated]'
//         }
//         break
//       }
//     }
    
//     return result.trim()
//   }
  
//   semanticHash(text) {
//     // Simple hash for duplicate detection
//     const words = text.split(/\W+/).filter(w => w.length > 3).sort()
//     return words.slice(0, 5).join('|')
//   }
  
//   getDefaultRules() {
//     return {
//       removeDuplicates: true,
//       preserveStructure: true,
//       maintainCoherence: true
//     }
//   }
// }

// // Supporting utility classes
// export class TokenCounter {
//   count(text) {
//     if (!text) return 0
//     // Rough approximation: 1 token ≈ 4 characters for English
//     return Math.ceil(text.length / 4)
//   }
  
//   truncate(text, maxTokens) {
//     const maxChars = maxTokens * 4
//     if (text.length <= maxChars) return text
    
//     // Truncate at word boundary
//     const truncated = text.substring(0, maxChars)
//     const lastSpace = truncated.lastIndexOf(' ')
//     return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...'
//   }
// }

// export class GPTTokenizer extends TokenCounter {
//   count(text) {
//     // More accurate token counting for GPT models
//     if (!text) return 0
    
//     // Rough approximation based on GPT tokenization patterns
//     const words = text.split(/\s+/)
//     const specialChars = (text.match(/[^\w\s]/g) || []).length
    
//     // Each word ≈ 1.3 tokens, special chars ≈ 1 token each
//     return Math.ceil(words.length * 1.3 + specialChars * 0.5)
//   }
// }

// export class TextSynthesizer {
//   async generate(prompt, contexts) {
//     // Mock implementation - in real system would call LLM
//     const contextSources = contexts.map(c => c.source).join(', ')
    
//     return `Synthesized perspective integrating insights from ${contextSources}: 
    
// Based on the analysis, a balanced approach emerges that addresses the key concerns while maintaining forward momentum. The synthesis preserves the core insights from each perspective while finding constructive middle ground on points of disagreement.

// Key elements of the unified strategy:
// - Acknowledge the valid concerns from all perspectives
// - Create a phased approach that balances competing priorities  
// - Establish clear success metrics and feedback loops
// - Maintain flexibility for course correction as needed

// This integrated approach leverages the strengths of each perspective while mitigating their individual limitations.`
//   }
// }

// export class SemanticAnalyzer {
//   async similarity(text1, text2) {
//     // Mock semantic similarity - in real system would use embeddings
//     const words1 = new Set(text1.toLowerCase().split(/\W+/).filter(w => w.length > 2))
//     const words2 = new Set(text2.toLowerCase().split(/\W+/).filter(w => w.length > 2))
    
//     const intersection = new Set([...words1].filter(x => words2.has(x)))
//     const union = new Set([...words1, ...words2])
    
//     return intersection.size / union.size // Jaccard similarity
//   }
  
//   async sentiment(text) {
//     // Mock sentiment analysis - returns -1 to 1
//     const positiveWords = ['good', 'great', 'excellent', 'positive', 'benefit', 'advantage', 'success']
//     const negativeWords = ['bad', 'terrible', 'negative', 'problem', 'issue', 'risk', 'danger']
    
//     const words = text.toLowerCase().split(/\W+/)
//     const positive = words.filter(w => positiveWords.includes(w)).length
//     const negative = words.filter(w => negativeWords.includes(w)).length
    
//     if (positive + negative === 0) return 0
//     return (positive - negative) / (positive + negative)
//   }
// }

// export class TextEmbedder {
//   async embed(text) {
//     // Mock embedding - in real system would use actual embedding model
//     const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 2)
//     const embedding = new Array(100).fill(0)
    
//     // Simple hash-based mock embedding
//     words.forEach((word, i) => {
//       const hash = this.simpleHash(word)
//       embedding[hash % 100] += 1 / words.length
//     })
    
//     return embedding
//   }
  
//   simpleHash(str) {
//     let hash = 0
//     for (let i = 0; i < str.length; i++) {
//       const char = str.charCodeAt(i)
//       hash = ((hash << 5) - hash) + char
//       hash = hash & hash // Convert to 32-bit integer
//     }
//     return Math.abs(hash)
//   }
// }

// // Main Dynamic Context Assembler with Rules
// export class DynamicContextAssembler {
//   constructor(config = {}) {
//     // Import base assembler and tracker
//     this.config = config
//     this.rules = new AssemblyRules(config.rules)
//     this.conflictResolver = new ConflictResolver(
//       config.conflictStrategy, 
//       { tracker: config.tracker }
//     )
//     this.relevanceFilter = new RelevanceFilter(config.relevance)
//     this.tokenOptimizer = new TokenOptimizer(config.tokens)
//     this.tracker = config.tracker || new ContextTracker()
//   }
  
//   async assemble(recipe) {
//     const assemblyId = this.tracker.generateId()
    
//     // Step 1: Load contexts (delegated to base assembler)
//     let contexts = await this.loadContexts(recipe.sources)
    
//     // Step 2: Apply relevance filtering
//     if (recipe.task) {
//       contexts = await this.relevanceFilter.filterByRelevance(contexts, recipe.task)
//       this.tracker.trackContribution(
//         'relevance_filter',
//         `Filtered to ${contexts.length} relevant contexts`,
//         { step: 'relevance_filtering', relevanceThreshold: this.relevanceFilter.threshold }
//       )
//     }
    
//     // Step 3: Apply priority rules
//     contexts = this.rules.applyPriorities(contexts, recipe.stageConfig)
//     this.tracker.trackContribution(
//       'priority_engine',
//       `Applied priority ordering for ${recipe.stageConfig?.stage || 'default'} stage`,
//       { step: 'priority_ordering', leadPersonality: recipe.stageConfig?.lead }
//     )
    
//     // Step 4: Resolve conflicts
//     const conflictResolution = await this.conflictResolver.resolveConflicts(contexts)
    
//     // If conflicts were resolved, replace with synthesis; otherwise keep original contexts
//     if (conflictResolution.conflictsResolved > 0) {
//       contexts = [{ 
//         ...conflictResolution, 
//         source: 'conflict_resolver',
//         type: 'synthesized',
//         effectivePriority: 95,
//         id: this.tracker.generateId()
//       }]
//     }
    
//     // Step 5: Optimize for tokens
//     const optimized = this.tokenOptimizer.optimizeAssembly(contexts, recipe.tokenLimit)
    
//     // Step 6: Final assembly
//     const finalText = optimized.map(c => c.text).join('\n\n')
    
//     // Track the complete assembly
//     const finalAssemblyId = this.tracker.trackSynthesis(
//       contexts.map(c => c.id || assemblyId),
//       finalText,
//       'dynamic_assembly',
//       {
//         recipe,
//         conflictsResolved: conflictResolution.conflictsResolved,
//         tokensUsed: optimized.reduce((sum, c) => sum + c.tokens, 0),
//         contextsFiltered: recipe.sources.length - contexts.length
//       }
//     )
    
//     return {
//       assembled: finalText,
//       metadata: {
//         assemblyId: finalAssemblyId,
//         contextsUsed: optimized.length,
//         tokensUsed: optimized.reduce((sum, c) => sum + c.tokens, 0),
//         conflictsResolved: conflictResolution.conflictsResolved,
//         compressionApplied: optimized.some(c => c.compressed)
//       },
//       tracking: this.tracker.exportTracking()
//     }
//   }
  
//   async loadContexts(sources) {
//     // Mock implementation - in real system would use actual context loader
//     return sources.map(source => ({
//       id: this.tracker.generateId(),
//       source: source.name,
//       type: source.type,
//       text: `Context from ${source.name}: ${source.mockContent || 'Mock context content for testing'}`,
//       timestamp: Date.now()
//     }))
//   }
// }