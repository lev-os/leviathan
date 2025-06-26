# Memory Integration for Discovery Engines

## Unified Memory Architecture

### Memory Backend Interface
```go
type MemoryBackend interface {
    StoreAttempt(engine string, attempt Attempt) error
    GetAttemptHistory(engine string, problemType string) ([]Attempt, error)
    StoreEpisode(episode Episode) error
    SearchSimilar(embedding []float64, limit int) ([]Episode, error)
    GetTemporalContext(timeRange TimeRange) ([]Episode, error)
}
```

### Neo4j + Graphiti Integration
```go
type UnifiedMemory struct {
    graphiti       *GraphitiClient
    embeddings     *EmbeddingService
    
    // Separate workspaces for each engine
    workspaces     map[string]string
}

// Store attempt with embeddings
func (m *UnifiedMemory) StoreAttempt(engine string, attempt Attempt) error {
    // 1. Convert attempt to natural language
    description := m.attemptToText(attempt)
    
    // 2. Get high-quality embedding
    embedding := m.embeddings.GetEmbedding(description)
    
    // 3. Store in engine-specific workspace
    episode := Episode{
        Content:   description,
        Embedding: embedding,
        Metadata:  attempt,
        GroupID:   m.workspaces[engine],
    }
    
    return m.graphiti.AddEpisode(episode)
}

// Search for similar past attempts
func (m *UnifiedMemory) SearchSimilar(embedding []float64, limit int) ([]Episode, error) {
    // Use Graphiti's semantic search with high-quality embeddings
    return m.graphiti.SearchMemory(embedding, limit)
}
```

### Graphiti Client for Go
```go
type GraphitiClient struct {
    neo4jURI    string
    username    string
    password    string
    mcpClient   *MCPClient // Use Graphiti's MCP tools
}

// Core operations using Graphiti's temporal awareness
func (gc *GraphitiClient) AddEpisode(episode Episode) error {
    // Use Graphiti MCP server to store episode
    return gc.mcpClient.Call("add_episode", map[string]interface{}{
        "content":      episode.Content,
        "group_id":     episode.GroupID,
        "episode_type": "discovery_attempt",
        "metadata":     episode.Metadata,
    })
}

func (gc *GraphitiClient) SearchMemory(query string, limit int) ([]Memory, error) {
    // Use Graphiti's semantic search
    response, err := gc.mcpClient.Call("search_memory", map[string]interface{}{
        "query":     query,
        "group_ids": []string{"discovery-*"}, // Search all discovery workspaces
        "limit":     limit,
    })
    // Parse response and return memories
}

func (gc *GraphitiClient) GetTemporalContext(timeRange TimeRange) ([]Episode, error) {
    // Get relevant context for current situation
    response, err := gc.mcpClient.Call("get_context", map[string]interface{}{
        "situation":       timeRange.Description,
        "group_id":        "discovery-shared-learnings",
        "include_related": true,
    })
    // Parse and return temporal episodes
}
```

### Embedding Service
```go
type EmbeddingService struct {
    provider  string // "voyage" or "bge"
    dimension int    // 768 for most models
    client    interface{}
}

func NewEmbeddingService(provider string) *EmbeddingService {
    switch provider {
    case "voyage":
        return &EmbeddingService{
            provider:  "voyage",
            dimension: 768,
            client:    NewVoyageClient(),
        }
    case "bge":
        return &EmbeddingService{
            provider:  "bge", 
            dimension: 768,
            client:    NewBGEClient(),
        }
    default:
        return NewEmbeddingService("voyage") // Default to highest quality
    }
}

func (es *EmbeddingService) GetEmbedding(text string) ([]float64, error) {
    switch es.provider {
    case "voyage":
        return es.client.(*VoyageClient).Embed(text)
    case "bge":
        return es.client.(*BGEClient).Embed(text)
    }
}

func (es *EmbeddingService) GetBatchEmbeddings(texts []string) ([][]float64, error) {
    // Batch processing for efficiency
}

func (es *EmbeddingService) CosineSimilarity(a, b []float64) float64 {
    // Calculate similarity between embeddings
}
```

### Workspace Isolation Strategy
```yaml
# Graphiti workspaces for discovery engines
workspaces:
  discovery_engines:
    seal: "discovery-seal-attempts"
    jepa: "discovery-jepa-predictions" 
    brute: "discovery-brute-trials"
    shared: "discovery-shared-learnings"
    
  pattern_storage:
    telemetry: "patterns-telemetry"
    predictions: "patterns-predictions"
    validations: "patterns-validations"
    
  temporal_memory:
    short_term: "memory-short-term"    # Last 24 hours
    medium_term: "memory-medium-term"  # Last 7 days
    long_term: "memory-long-term"      # Historical patterns
```

### Memory Integration Patterns

#### Pattern Storage with Embeddings
```go
func (epd *EnhancedPatternDetector) StorePattern(pattern DetectedPattern) error {
    // 1. Convert pattern to natural language description
    description := fmt.Sprintf(
        "Pattern: %s detected with confidence %.0f%%. Evidence: %s. Frequency: %d occurrences.",
        pattern.Type,
        pattern.Confidence*100,
        strings.Join(pattern.Evidence, "; "),
        pattern.Frequency,
    )
    
    // 2. Get embedding from high-quality service
    embedding, err := epd.embeddingService.GetEmbedding(description)
    if err != nil {
        return err
    }
    
    // 3. Store in Graphiti with temporal context
    episode := Episode{
        Content:   description,
        Embedding: embedding,
        Metadata: map[string]interface{}{
            "pattern_type": pattern.Type,
            "confidence":   pattern.Confidence,
            "first_seen":   pattern.FirstDetected,
            "last_seen":    pattern.LastSeen,
            "frequency":    pattern.Frequency,
        },
        GroupID: "patterns-telemetry",
    }
    
    // 4. Link to previous similar patterns
    similar, err := epd.graphitiClient.SearchSimilar(embedding, 5)
    if err == nil && len(similar) > 0 {
        episode.Metadata["similar_patterns"] = similar
    }
    
    return epd.graphitiClient.AddEpisode(episode)
}
```

#### Historical Pattern Lookup
```go
func (epd *EnhancedPatternDetector) FindSimilarPatterns(embedding []float64) ([]HistoricalPattern, error) {
    // Search for similar patterns across all workspaces
    episodes, err := epd.graphitiClient.SearchSimilar(embedding, 10)
    if err != nil {
        return nil, err
    }
    
    var patterns []HistoricalPattern
    for _, episode := range episodes {
        pattern := HistoricalPattern{
            Description: episode.Content,
            Similarity:  epd.embeddingService.CosineSimilarity(embedding, episode.Embedding),
            Timestamp:   episode.CreatedAt,
            Metadata:    episode.Metadata,
        }
        patterns = append(patterns, pattern)
    }
    
    return patterns, nil
}
```

### Benefits of This Memory Architecture

1. **High-Quality Embeddings**: Use Voyage-3-large for best pattern recognition
2. **Temporal Awareness**: Graphiti's episodic memory for time series
3. **Workspace Isolation**: Separate concerns but allow cross-engine learning
4. **Semantic Search**: Find similar patterns even if not exactly seen before
5. **Persistent Learning**: All attempts stored for future reference
6. **Graph Relationships**: Neo4j enables complex temporal relationships

### Configuration
```yaml
# memory_config.yaml
embedding_service:
  provider: "voyage"  # or "bge" for open source
  model: "voyage-3-large"
  api_key: "${VOYAGE_API_KEY}"
  batch_size: 32
  
graphiti:
  neo4j_uri: "bolt://localhost:7687"
  neo4j_user: "neo4j"
  neo4j_password: "${NEO4J_PASSWORD}"
  mcp_endpoint: "http://localhost:8080"
  
workspaces:
  auto_create: true
  isolation_level: "strict"
  cross_workspace_search: true
```

This memory architecture enables true learning across discovery engines while maintaining clean separation of concerns!