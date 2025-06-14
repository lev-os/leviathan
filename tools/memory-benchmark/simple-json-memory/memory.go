package simplejson

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

// Memory represents the main memory storage system
type Memory struct {
	mu              sync.RWMutex
	preferences     map[string]interface{}
	patterns        map[string]*Pattern
	contextHistory  []ContextEntry
	maxContextSize  int
	storePath       string
	lastSave        time.Time
	autoSaveEnabled bool
}

// Pattern represents a recognized pattern of repeated actions
type Pattern struct {
	Action      string                 `json:"action"`
	Count       int                    `json:"count"`
	LastSeen    time.Time              `json:"last_seen"`
	Context     map[string]interface{} `json:"context"`
	Confidence  float64                `json:"confidence"`
}

// ContextEntry represents a single interaction in history
type ContextEntry struct {
	ID        string                 `json:"id"`
	Timestamp time.Time              `json:"timestamp"`
	Type      string                 `json:"type"`
	Data      map[string]interface{} `json:"data"`
	Tags      []string               `json:"tags"`
}

// NewMemory creates a new memory instance
func NewMemory(storePath string, maxContextSize int) *Memory {
	return &Memory{
		preferences:    make(map[string]interface{}),
		patterns:       make(map[string]*Pattern),
		contextHistory: make([]ContextEntry, 0, maxContextSize),
		maxContextSize: maxContextSize,
		storePath:      storePath,
		autoSaveEnabled: true,
	}
}// SetPreference stores a user preference
func (m *Memory) SetPreference(key string, value interface{}) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	m.preferences[key] = value
	
	if m.autoSaveEnabled {
		return m.save()
	}
	return nil
}

// GetPreference retrieves a user preference
func (m *Memory) GetPreference(key string) (interface{}, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	
	val, exists := m.preferences[key]
	return val, exists
}

// RecordAction records an action and updates patterns
func (m *Memory) RecordAction(action string, context map[string]interface{}) {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	// Update pattern
	pattern, exists := m.patterns[action]
	if !exists {
		pattern = &Pattern{
			Action:  action,
			Count:   0,
			Context: make(map[string]interface{}),
		}
		m.patterns[action] = pattern
	}
	
	pattern.Count++
	pattern.LastSeen = time.Now()
	pattern.Confidence = float64(pattern.Count) / float64(len(m.contextHistory)+1)
	
	// Merge context
	for k, v := range context {
		pattern.Context[k] = v
	}
	
	// Add to context history
	entry := ContextEntry{
		ID:        fmt.Sprintf("%d", time.Now().UnixNano()),
		Timestamp: time.Now(),
		Type:      "action",
		Data: map[string]interface{}{
			"action":  action,
			"context": context,
		},
		Tags: []string{action},
	}
	
	m.addToHistory(entry)
	
	if m.autoSaveEnabled {
		m.save()
	}
}// AddContext adds a context entry to history
func (m *Memory) AddContext(contextType string, data map[string]interface{}, tags []string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	entry := ContextEntry{
		ID:        fmt.Sprintf("%d", time.Now().UnixNano()),
		Timestamp: time.Now(),
		Type:      contextType,
		Data:      data,
		Tags:      tags,
	}
	
	m.addToHistory(entry)
	
	if m.autoSaveEnabled {
		m.save()
	}
}

// addToHistory adds entry to history with size management
func (m *Memory) addToHistory(entry ContextEntry) {
	m.contextHistory = append(m.contextHistory, entry)
	
	// Maintain max size
	if len(m.contextHistory) > m.maxContextSize {
		m.contextHistory = m.contextHistory[len(m.contextHistory)-m.maxContextSize:]
	}
}

// SearchContext searches context history
func (m *Memory) SearchContext(query string, limit int) []ContextEntry {
	m.mu.RLock()
	defer m.mu.RUnlock()
	
	query = strings.ToLower(query)
	results := make([]ContextEntry, 0)
	
	// Search from most recent
	for i := len(m.contextHistory) - 1; i >= 0 && len(results) < limit; i-- {
		entry := m.contextHistory[i]
		
		// Check tags
		for _, tag := range entry.Tags {
			if strings.Contains(strings.ToLower(tag), query) {
				results = append(results, entry)
				break
			}
		}
		
		// Check data
		if len(results) < limit {
			dataStr := fmt.Sprintf("%v", entry.Data)
			if strings.Contains(strings.ToLower(dataStr), query) {
				results = append(results, entry)
			}
		}
	}
	
	return results
}// GetPatterns returns recognized patterns sorted by confidence
func (m *Memory) GetPatterns(minConfidence float64) []*Pattern {
	m.mu.RLock()
	defer m.mu.RUnlock()
	
	patterns := make([]*Pattern, 0)
	for _, p := range m.patterns {
		if p.Confidence >= minConfidence {
			patterns = append(patterns, p)
		}
	}
	
	// Sort by confidence (simple bubble sort for small datasets)
	for i := 0; i < len(patterns)-1; i++ {
		for j := 0; j < len(patterns)-i-1; j++ {
			if patterns[j].Confidence < patterns[j+1].Confidence {
				patterns[j], patterns[j+1] = patterns[j+1], patterns[j]
			}
		}
	}
	
	return patterns
}

// GetRecentContext returns the most recent context entries
func (m *Memory) GetRecentContext(count int) []ContextEntry {
	m.mu.RLock()
	defer m.mu.RUnlock()
	
	if count > len(m.contextHistory) {
		count = len(m.contextHistory)
	}
	
	start := len(m.contextHistory) - count
	result := make([]ContextEntry, count)
	copy(result, m.contextHistory[start:])
	
	return result
}

// Load loads memory from disk
func (m *Memory) Load() error {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	// Create directory if it doesn't exist
	dir := filepath.Dir(m.storePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create directory: %w", err)
	}
	
	// Check if file exists
	if _, err := os.Stat(m.storePath); os.IsNotExist(err) {
		return nil // No file to load
	}
	
	data, err := ioutil.ReadFile(m.storePath)
	if err != nil {
		return fmt.Errorf("failed to read file: %w", err)
	}
	
	var stored struct {
		Preferences    map[string]interface{} `json:"preferences"`
		Patterns       map[string]*Pattern    `json:"patterns"`
		ContextHistory []ContextEntry        `json:"context_history"`
	}
	
	if err := json.Unmarshal(data, &stored); err != nil {
		return fmt.Errorf("failed to unmarshal data: %w", err)
	}
	
	m.preferences = stored.Preferences
	m.patterns = stored.Patterns
	m.contextHistory = stored.ContextHistory
	
	return nil
}// Save saves memory to disk
func (m *Memory) Save() error {
	m.mu.Lock()
	defer m.mu.Unlock()
	return m.save()
}

// save internal save without lock
func (m *Memory) save() error {
	stored := struct {
		Preferences    map[string]interface{} `json:"preferences"`
		Patterns       map[string]*Pattern    `json:"patterns"`
		ContextHistory []ContextEntry        `json:"context_history"`
	}{
		Preferences:    m.preferences,
		Patterns:       m.patterns,
		ContextHistory: m.contextHistory,
	}
	
	data, err := json.MarshalIndent(stored, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal data: %w", err)
	}
	
	// Create directory if it doesn't exist
	dir := filepath.Dir(m.storePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create directory: %w", err)
	}
	
	// Write atomically
	tmpPath := m.storePath + ".tmp"
	if err := ioutil.WriteFile(tmpPath, data, 0644); err != nil {
		return fmt.Errorf("failed to write temp file: %w", err)
	}
	
	if err := os.Rename(tmpPath, m.storePath); err != nil {
		return fmt.Errorf("failed to rename file: %w", err)
	}
	
	m.lastSave = time.Now()
	return nil
}

// Stats returns memory statistics
func (m *Memory) Stats() map[string]interface{} {
	m.mu.RLock()
	defer m.mu.RUnlock()
	
	return map[string]interface{}{
		"preferences_count": len(m.preferences),
		"patterns_count":    len(m.patterns),
		"context_entries":   len(m.contextHistory),
		"last_save":         m.lastSave,
	}
}

// Clear clears all memory
func (m *Memory) Clear() error {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	m.preferences = make(map[string]interface{})
	m.patterns = make(map[string]*Pattern)
	m.contextHistory = make([]ContextEntry, 0, m.maxContextSize)
	
	if m.autoSaveEnabled {
		return m.save()
	}
	return nil
}