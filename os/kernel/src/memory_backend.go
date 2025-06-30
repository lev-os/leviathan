package main

import (
	"time"
)

// MemoryBackend defines the interface for storing and retrieving discovery engine data
// This will be implemented by GraphitiClient for Neo4j + Graphiti integration
type MemoryBackend interface {
	// Store an attempt with all its context
	StoreAttempt(engineType string, attempt Attempt) error
	
	// Retrieve attempt history for a specific engine and problem type
	GetAttemptHistory(engineType string, problemType string) ([]Attempt, error)
	
	// Store an episode (higher-level memory unit)
	StoreEpisode(episode Episode) error
	
	// Search for similar patterns using embeddings
	SearchSimilar(embedding []float64, limit int) ([]Episode, error)
	
	// Get temporal context for a time range
	GetTemporalContext(timeRange TimeRange) ([]Episode, error)
	
	// Store learning insights
	StoreLearning(engineType string, learning Learning) error
	
	// Retrieve learning history
	GetLearningHistory(engineType string, limit int) ([]Learning, error)
}

// Episode represents a memory episode in Graphiti
type Episode struct {
	ID          string                 `json:"id"`
	Content     string                 `json:"content"`     // Natural language description
	Embedding   []float64              `json:"embedding"`   // High-quality embedding vector
	GroupID     string                 `json:"group_id"`    // Workspace identifier
	EpisodeType string                 `json:"episode_type"` // "attempt", "learning", "insight"
	Timestamp   time.Time              `json:"timestamp"`
	Metadata    map[string]interface{} `json:"metadata"`
	
	// Links to other episodes
	RelatedEpisodes []string `json:"related_episodes,omitempty"`
	ParentEpisode   string   `json:"parent_episode,omitempty"`
}

// Memory represents a retrieved memory from search
type Memory struct {
	Episode    Episode `json:"episode"`
	Similarity float64 `json:"similarity"` // Cosine similarity score
	Relevance  float64 `json:"relevance"`  // Contextual relevance score
}

// EmbeddingService defines the interface for generating high-quality embeddings
type EmbeddingService struct {
	provider   string      // "voyage", "bge", "openai"
	model      string      // Model identifier
	dimension  int         // Embedding dimension
	client     interface{} // Provider-specific client
	apiKey     string      // API key for commercial providers
}

// NewEmbeddingService creates a new embedding service
func NewEmbeddingService(provider string, apiKey string) *EmbeddingService {
	switch provider {
	case "voyage":
		return &EmbeddingService{
			provider:  "voyage",
			model:     "voyage-3-large",
			dimension: 768,
			apiKey:    apiKey,
		}
	case "bge":
		return &EmbeddingService{
			provider:  "bge",
			model:     "bge-en-icl",
			dimension: 768,
		}
	case "openai":
		return &EmbeddingService{
			provider:  "openai",
			model:     "text-embedding-3-large",
			dimension: 768,
			apiKey:    apiKey,
		}
	default:
		// Default to voyage for highest quality
		return NewEmbeddingService("voyage", apiKey)
	}
}

// GetEmbedding generates an embedding for the given text
func (es *EmbeddingService) GetEmbedding(text string) ([]float64, error) {
	switch es.provider {
	case "voyage":
		return es.getVoyageEmbedding(text)
	case "bge":
		return es.getBGEEmbedding(text)
	case "openai":
		return es.getOpenAIEmbedding(text)
	default:
		return es.getFallbackEmbedding(text), nil
	}
}

// GetBatchEmbeddings generates embeddings for multiple texts
func (es *EmbeddingService) GetBatchEmbeddings(texts []string) ([][]float64, error) {
	embeddings := make([][]float64, len(texts))
	
	for i, text := range texts {
		embedding, err := es.GetEmbedding(text)
		if err != nil {
			return nil, err
		}
		embeddings[i] = embedding
	}
	
	return embeddings, nil
}

// CosineSimilarity calculates cosine similarity between two embeddings
func (es *EmbeddingService) CosineSimilarity(a, b []float64) float64 {
	if len(a) != len(b) {
		return 0.0
	}
	
	var dotProduct, normA, normB float64
	for i := 0; i < len(a); i++ {
		dotProduct += a[i] * b[i]
		normA += a[i] * a[i]
		normB += b[i] * b[i]
	}
	
	if normA == 0 || normB == 0 {
		return 0.0
	}
	
	return dotProduct / (normA * normB)
}

// Provider-specific embedding methods (simplified implementations)
func (es *EmbeddingService) getVoyageEmbedding(text string) ([]float64, error) {
	// TODO: Implement actual Voyage API call
	// For now, return a deterministic embedding based on text
	return es.getFallbackEmbedding(text), nil
}

func (es *EmbeddingService) getBGEEmbedding(text string) ([]float64, error) {
	// TODO: Implement actual BGE model inference
	// For now, return a deterministic embedding based on text
	return es.getFallbackEmbedding(text), nil
}

func (es *EmbeddingService) getOpenAIEmbedding(text string) ([]float64, error) {
	// TODO: Implement actual OpenAI API call
	// For now, return a deterministic embedding based on text
	return es.getFallbackEmbedding(text), nil
}

// getFallbackEmbedding creates a deterministic embedding for testing
func (es *EmbeddingService) getFallbackEmbedding(text string) []float64 {
	embedding := make([]float64, es.dimension)
	
	// Simple hash-based embedding for testing
	hash := 0
	for _, char := range text {
		hash = hash*31 + int(char)
	}
	
	for i := range embedding {
		// Create deterministic but varied values
		seed := hash + i*7
		embedding[i] = float64((seed%2000)-1000) / 1000.0 // Range [-1, 1]
	}
	
	// Normalize the embedding
	var norm float64
	for _, val := range embedding {
		norm += val * val
	}
	norm = 1.0 / (norm + 1e-8) // Prevent division by zero
	
	for i := range embedding {
		embedding[i] *= norm
	}
	
	return embedding
}

// MockMemoryBackend provides a simple in-memory implementation for testing
type MockMemoryBackend struct {
	attempts   map[string][]Attempt
	episodes   []Episode
	learnings  map[string][]Learning
}

// NewMockMemoryBackend creates a new mock memory backend
func NewMockMemoryBackend() *MockMemoryBackend {
	return &MockMemoryBackend{
		attempts:  make(map[string][]Attempt),
		episodes:  []Episode{},
		learnings: make(map[string][]Learning),
	}
}

// StoreAttempt stores an attempt in memory
func (m *MockMemoryBackend) StoreAttempt(engineType string, attempt Attempt) error {
	key := engineType + ":" + attempt.Problem.Type
	m.attempts[key] = append(m.attempts[key], attempt)
	return nil
}

// GetAttemptHistory retrieves attempt history
func (m *MockMemoryBackend) GetAttemptHistory(engineType string, problemType string) ([]Attempt, error) {
	key := engineType + ":" + problemType
	if attempts, exists := m.attempts[key]; exists {
		return attempts, nil
	}
	return []Attempt{}, nil
}

// StoreEpisode stores an episode
func (m *MockMemoryBackend) StoreEpisode(episode Episode) error {
	m.episodes = append(m.episodes, episode)
	return nil
}

// SearchSimilar finds similar episodes using embedding similarity
func (m *MockMemoryBackend) SearchSimilar(embedding []float64, limit int) ([]Episode, error) {
	// For mock implementation, return first few episodes
	if limit > len(m.episodes) {
		limit = len(m.episodes)
	}
	
	return m.episodes[:limit], nil
}

// GetTemporalContext retrieves episodes within a time range
func (m *MockMemoryBackend) GetTemporalContext(timeRange TimeRange) ([]Episode, error) {
	var contextEpisodes []Episode
	
	for _, episode := range m.episodes {
		if episode.Timestamp.After(timeRange.Start) && episode.Timestamp.Before(timeRange.End) {
			contextEpisodes = append(contextEpisodes, episode)
		}
	}
	
	return contextEpisodes, nil
}

// StoreLearning stores learning insights
func (m *MockMemoryBackend) StoreLearning(engineType string, learning Learning) error {
	m.learnings[engineType] = append(m.learnings[engineType], learning)
	return nil
}

// GetLearningHistory retrieves learning history
func (m *MockMemoryBackend) GetLearningHistory(engineType string, limit int) ([]Learning, error) {
	if learnings, exists := m.learnings[engineType]; exists {
		if limit > len(learnings) {
			limit = len(learnings)
		}
		return learnings[len(learnings)-limit:], nil // Return most recent
	}
	return []Learning{}, nil
}