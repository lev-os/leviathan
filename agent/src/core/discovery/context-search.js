/**
 * Context Search - Core context discovery and matching
 * Pure business logic for universal context search across workflows, agents, patterns
 * Part of Leviathan Core SDK
 */

import { SemanticLookup } from '../../semantic-lookup.js'
import { ContextLoader } from '../../context-loader.js'
import fs from 'fs-extra'
import path from 'path'

/**
 * Find contexts matching a query with optional type filtering
 * @param {string} query - Search query or intent
 * @param {Object} options - Search options
 * @returns {Promise<Object>} Search results with contexts
 */
export async function findContexts(query, options = {}) {
  const {
    type = null,
    mode = 'full',
    limit = 10,
    contextsPath = process.env.CONTEXTS_PATH || '../core/contexts',
    threshold = 0.3,
  } = options

  try {
    // Initialize lookup components
    const semanticLookup = new SemanticLookup()
    const contextLoader = new ContextLoader()

    await contextLoader.loadAll()
    await semanticLookup.ensureLoaded()

    // Quick code lookup first (fastest) - only if no type filter
    if (!type) {
      const quickResult = await contextLoader.getByCode(query)
      if (quickResult) {
        return {
          found: true,
          query: query,
          type_filter: type,
          match_type: 'exact_code',
          context: formatContext(quickResult, mode),
          confidence: 1.0,
        }
      }
    }

    // Semantic search with optional type filter
    const semanticResult = await semanticLookup.findWorkflow(query, type)
    if (semanticResult && semanticResult.found) {
      return {
        found: true,
        query: query,
        type_filter: type,
        match_type: 'semantic',
        context: semanticResult, // The result itself contains all the context data
        confidence: semanticResult.similarity || 0.8,
      }
    }

    // Universal context search across all types
    const universalResults = await searchAllContextTypes(query, {
      contextsPath,
      type,
      limit,
      threshold,
    })

    if (universalResults.length > 0) {
      return {
        found: true,
        query: query,
        type_filter: type,
        match_type: 'universal',
        contexts: universalResults,
        total_matches: universalResults.length,
      }
    }

    // Return suggestions if no exact match
    const suggestions = await semanticLookup.getSuggestions(query, 5, type)
    return {
      found: false,
      query: query,
      type_filter: type,
      suggestions: suggestions,
      search_attempted: ['code_lookup', 'semantic_search', 'universal_search'],
    }
  } catch (error) {
    throw new Error(`Context search failed: ${error.message}`)
  }
}

/**
 * Score context relevance against a query
 * @param {Object} context - Context object to score
 * @param {string} query - Search query
 * @param {Object} options - Scoring options
 * @returns {Promise<number>} Confidence score (0-1)
 */
export async function scoreContext(context, query, options = {}) {
  const { algorithm = 'semantic', weights = {} } = options

  try {
    const defaultWeights = {
      title: 0.4,
      description: 0.3,
      content: 0.2,
      keywords: 0.1,
    }

    const finalWeights = { ...defaultWeights, ...weights }

    let totalScore = 0
    let maxPossibleScore = 0

    // Score title match
    if (context.name || context.title) {
      const titleScore = calculateTextScore(context.name || context.title, query)
      totalScore += titleScore * finalWeights.title
      maxPossibleScore += finalWeights.title
    }

    // Score description match
    if (context.description) {
      const descScore = calculateTextScore(context.description, query)
      totalScore += descScore * finalWeights.description
      maxPossibleScore += finalWeights.description
    }

    // Score content match
    if (context.content || context.context) {
      const contentScore = calculateTextScore(context.content || context.context, query)
      totalScore += contentScore * finalWeights.content
      maxPossibleScore += finalWeights.content
    }

    // Score keywords match
    if (context.keywords || context.tags) {
      const keywords = Array.isArray(context.keywords) ? context.keywords.join(' ') : context.keywords || context.tags || ''
      const keywordScore = calculateTextScore(keywords, query)
      totalScore += keywordScore * finalWeights.keywords
      maxPossibleScore += finalWeights.keywords
    }

    // Normalize score
    const normalizedScore = maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0

    return Math.min(1.0, Math.max(0.0, normalizedScore))
  } catch (error) {
    console.warn(`Context scoring failed: ${error.message}`)
    return 0
  }
}

/**
 * List all available context types
 * @param {Object} options - Listing options
 * @returns {Promise<Array>} Array of context type summaries
 */
export async function listContextTypes(options = {}) {
  const { contextsPath = process.env.CONTEXTS_PATH || '../core/contexts' } = options

  try {
    if (!(await fs.pathExists(contextsPath))) {
      return []
    }

    const types = []
    const items = await fs.readdir(contextsPath)

    for (const item of items) {
      const itemPath = path.join(contextsPath, item)
      const stat = await fs.stat(itemPath)

      if (stat.isDirectory()) {
        const typeInfo = await analyzeContextType(itemPath, item)
        if (typeInfo.count > 0) {
          types.push(typeInfo)
        }
      }
    }

    return types.sort((a, b) => b.count - a.count)
  } catch (error) {
    throw new Error(`Failed to list context types: ${error.message}`)
  }
}

/**
 * Get context combinations and relationships
 * @param {string} query - Base query
 * @param {Object} options - Combo options
 * @returns {Promise<Array>} Array of context combinations
 */
export async function findContextCombos(query, options = {}) {
  const { count = 3, contextsPath = process.env.CONTEXTS_PATH || '../core/contexts' } = options

  try {
    // This would integrate with the existing combo system from claude-code-adapter
    // For now, return basic related contexts
    const baseResults = await findContexts(query, { limit: count * 2 })

    if (!baseResults.found || !baseResults.contexts) {
      return []
    }

    // Group related contexts
    const combos = baseResults.contexts.slice(0, count).map((context) => ({
      primary: context,
      supporting: baseResults.contexts.filter((c) => c.id !== context.id).slice(0, 2),
      synergy_score: calculateSynergy(context, baseResults.contexts),
    }))

    return combos
  } catch (error) {
    throw new Error(`Failed to find context combos: ${error.message}`)
  }
}

// Helper Functions

/**
 * Search across all context types (agents, workflows, patterns, etc.)
 */
async function searchAllContextTypes(query, options) {
  const { contextsPath, type, limit, threshold } = options
  const results = []

  try {
    const contextTypes = ['agents', 'workflows', 'patterns', 'tools', 'types']

    for (const contextType of contextTypes) {
      // Skip if type filter doesn't match
      if (type && contextType !== type) continue

      const typePath = path.join(contextsPath, contextType)
      if (!(await fs.pathExists(typePath))) continue

      const typeResults = await searchContextType(typePath, contextType, query, { threshold })
      results.push(...typeResults)
    }

    // Sort by confidence and limit results
    return results.sort((a, b) => b.confidence - a.confidence).slice(0, limit)
  } catch (error) {
    console.warn(`Universal search failed: ${error.message}`)
    return []
  }
}

/**
 * Search within a specific context type directory
 */
async function searchContextType(typePath, contextType, query, options) {
  const { threshold = 0.3 } = options
  const results = []

  try {
    const items = await fs.readdir(typePath)

    for (const item of items) {
      const itemPath = path.join(typePath, item)
      const stat = await fs.stat(itemPath)

      if (stat.isDirectory()) {
        const contextPath = path.join(itemPath, 'context.yaml')

        if (await fs.pathExists(contextPath)) {
          const context = await loadContextFile(contextPath)
          const confidence = await scoreContext(context, query)

          if (confidence >= threshold) {
            results.push({
              id: item,
              type: contextType,
              name: context.name || item,
              description: context.description || 'No description available',
              confidence: confidence,
              path: contextPath,
              context: context,
            })
          }
        }
      }
    }
  } catch (error) {
    console.warn(`Search in ${contextType} failed: ${error.message}`)
  }

  return results
}

/**
 * Load and parse context YAML file
 */
async function loadContextFile(contextPath) {
  try {
    const content = await fs.readFile(contextPath, 'utf-8')
    const yaml = await import('js-yaml')
    return yaml.load(content) || {}
  } catch (error) {
    console.warn(`Failed to load context: ${contextPath} - ${error.message}`)
    return {}
  }
}

/**
 * Calculate text similarity score
 */
function calculateTextScore(text, query) {
  if (!text || !query) return 0

  const textLower = String(text).toLowerCase()
  const queryLower = String(query).toLowerCase()

  // Exact match
  if (textLower === queryLower) return 1.0

  // Contains match
  if (textLower.includes(queryLower)) return 0.8

  // Word overlap
  const textWords = textLower.split(/\s+/)
  const queryWords = queryLower.split(/\s+/)

  const overlap = queryWords.filter((word) =>
    textWords.some((textWord) => textWord.includes(word) || word.includes(textWord))
  ).length

  return (overlap / queryWords.length) * 0.6
}

/**
 * Format context for output
 */
function formatContext(context, mode) {
  if (mode === 'menu') {
    return {
      name: context.name,
      description: context.description,
      type: context.type || 'workflow',
    }
  }

  return context
}

/**
 * Analyze context type directory
 */
async function analyzeContextType(typePath, typeName) {
  try {
    const items = await fs.readdir(typePath)
    let count = 0

    for (const item of items) {
      const itemPath = path.join(typePath, item)
      const stat = await fs.stat(itemPath)

      if (stat.isDirectory()) {
        const contextPath = path.join(itemPath, 'context.yaml')
        if (await fs.pathExists(contextPath)) {
          count++
        }
      }
    }

    return {
      type: typeName,
      name: typeName.charAt(0).toUpperCase() + typeName.slice(1),
      count: count,
      path: typePath,
    }
  } catch (error) {
    return {
      type: typeName,
      name: typeName,
      count: 0,
      path: typePath,
    }
  }
}

/**
 * Calculate synergy between contexts
 */
function calculateSynergy(primary, contexts) {
  // Simple synergy calculation based on shared keywords/themes
  // This could be enhanced with more sophisticated analysis
  return Math.random() * 0.5 + 0.5 // Placeholder
}