// @claude-code: Semantic search engine for context discovery using OpenAI embeddings
// @claude-code: Enhanced with rich YAML content extraction and type filtering
// @claude-code: Returns slug-based results for clean context identification
import OpenAI from 'openai'
import fs from 'fs-extra'
import path from 'path'

export class SemanticLookup {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    this.embeddingsPath = path.join(process.cwd(), 'embeddings.json')
    this.embeddings = new Map()
    this.loaded = false
  }

  async ensureLoaded() {
    if (!this.loaded) {
      await this.loadEmbeddings()
    }
  }

  async loadEmbeddings() {
    try {
      if (await fs.pathExists(this.embeddingsPath)) {
        const data = await fs.readJson(this.embeddingsPath)
        this.embeddings = new Map(Object.entries(data))
        console.error(`📚 Loaded ${this.embeddings.size} embeddings from cache`)
      } else {
        console.error('🔄 No embeddings cache found, will build on first use')
      }
      this.loaded = true
    } catch (error) {
      console.error('Error loading embeddings:', error.message)
      this.embeddings = new Map()
      this.loaded = true
    }
  }

  async buildEmbeddings(contexts) {
    console.error('🔄 Building embeddings with enhanced content...')

    const newEmbeddings = new Map()
    const batch = []

    for (const context of contexts) {
      const text = this.getEmbeddingText(context)
      batch.push({
        slug: context.slug, // Use slug instead of ID
        text,
        context,
      })
    }

    // Process in batches of 100
    for (let i = 0; i < batch.length; i += 100) {
      const batchSlice = batch.slice(i, i + 100)
      const texts = batchSlice.map((item) => item.text)

      try {
        const response = await this.openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: texts,
        })

        response.data.forEach((embedding, index) => {
          const item = batchSlice[index]
          newEmbeddings.set(item.slug, {
            // Use slug as key
            embedding: embedding.embedding,
            text: item.text,
            context: {
              slug: item.context.slug,
              name: item.context.name,
              description: item.context.description,
              type: item.context.category,
              capabilities: item.context.data.tool_config?.capabilities,
              use_cases: item.context.data.pattern_config?.use_cases,
              triggers: item.context.triggers,
              file_path: item.context.filePath,
            },
          })
        })

        console.error(`✅ Processed batch ${Math.floor(i / 100) + 1}/${Math.ceil(batch.length / 100)}`)
      } catch (error) {
        console.error(`Error in batch ${i}:`, error.message)
      }
    }

    this.embeddings = newEmbeddings
    await this.saveEmbeddings()
    console.error(`🎯 Built ${this.embeddings.size} embeddings`)
  }

  // @claude-code: Enhanced embedding text extraction with rich YAML content
  // @claude-code: Extracts capabilities, MCP tools, use cases, and integration notes for better semantic matching
  getEmbeddingText(context) {
    const parts = [
      context.name,
      context.description,
      context.triggers?.join(' ') || '',
      context.category,

      // @claude-code: Rich YAML content extraction - this is key for better semantic search
      context.data.tool_config?.capabilities?.join(' ') || '',
      context.data.tool_config?.philosophy || '',
      context.data.pattern_config?.use_cases?.join(' ') || '',
      context.data.workflow_config?.triggers?.manual?.join(' ') || '',

      // @claude-code: MCP tools information for tool-specific contexts
      context.data.tool_config?.mcp_tools?.map((tool) => `${tool.name} ${tool.description}`).join(' ') || '',

      // @claude-code: Integration notes provide implementation context
      context.data.tool_config?.integration_notes ? Object.values(context.data.tool_config.integration_notes).join(' ') : '',

      // @claude-code: Response formatting info helps with tool usage patterns
      context.data.tool_config?.response_formatting ? JSON.stringify(context.data.tool_config.response_formatting) : '',
    ]

    return parts.filter(Boolean).join(' ').toLowerCase()
  }

  async saveEmbeddings() {
    const data = Object.fromEntries(this.embeddings)
    await fs.writeJson(this.embeddingsPath, data, { spaces: 2 })
  }

  async findWorkflow(query, typeFilter = null) {
    await this.ensureLoaded()

    if (this.embeddings.size === 0) {
      throw new Error('No embeddings available. Run: lev rebuild-cache')
    }

    const queryEmbedding = await this.getQueryEmbedding(query)

    const similarities = []
    for (const [slug, data] of this.embeddings) {
      // Apply type filter if specified
      if (typeFilter && data.context.type !== typeFilter) {
        continue
      }

      const similarity = this.cosineSimilarity(queryEmbedding, data.embedding)
      similarities.push({
        slug,
        similarity,
        context: data.context,
      })
    }

    similarities.sort((a, b) => b.similarity - a.similarity)

    const best = similarities[0]
    if (best && best.similarity > 0.5) {
      return {
        found: true,
        slug: best.slug,
        name: best.context.name,
        description: best.context.description,
        type: best.context.type,
        similarity: best.similarity,
        capabilities: best.context.capabilities,
        use_cases: best.context.use_cases,
        file_path: best.context.file_path,
      }
    }

    return {
      found: false,
      suggestions: similarities.slice(0, 5).map((s) => ({
        slug: s.slug,
        name: s.context.name,
        similarity: s.similarity,
      })),
    }
  }

  async getSuggestions(query, limit = 5, typeFilter = null) {
    await this.ensureLoaded()

    if (this.embeddings.size === 0) {
      // Fallback to simple text matching
      return Array.from(this.embeddings.values())
        .slice(0, limit)
        .map((data) => data.context)
    }

    const queryEmbedding = await this.getQueryEmbedding(query)

    const similarities = []
    for (const [slug, data] of this.embeddings) {
      // Apply type filter if specified
      if (typeFilter && data.context.type !== typeFilter) {
        continue
      }

      const similarity = this.cosineSimilarity(queryEmbedding, data.embedding)
      similarities.push({
        similarity,
        context: data.context,
      })
    }

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map((item) => ({
        slug: item.context.slug,
        name: item.context.name,
        similarity: item.similarity,
        type: item.context.type,
      }))
  }

  async getQueryEmbedding(query) {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query.toLowerCase(),
    })

    return response.data[0].embedding
  }

  cosineSimilarity(a, b) {
    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  async rebuildEmbeddings() {
    // This will be called by refresh_cache
    this.embeddings.clear()
    if (await fs.pathExists(this.embeddingsPath)) {
      await fs.remove(this.embeddingsPath)
    }
    console.error('🔄 Embeddings cache cleared, will rebuild on next workflow load')
  }
}
