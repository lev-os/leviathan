package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

// Multi-Provider LLM System for AI-Controlled OS
// Routes different tasks to optimal LLM providers

// Provider types and configurations
type LLMProvider struct {
	Name         string            `json:"name"`
	Type         string            `json:"type"`         // "ollama", "claude", "openai"
	Model        string            `json:"model"`
	Endpoint     string            `json:"endpoint"`
	APIKey       string            `json:"api_key,omitempty"`
	UseFor       []string          `json:"use_for"`      // Task types this provider handles
	MaxTokens    int               `json:"max_tokens"`
	Temperature  float64           `json:"temperature"`
	Timeout      time.Duration     `json:"timeout"`
	Headers      map[string]string `json:"headers,omitempty"`
}

// LLM request and response structures
type LLMRequest struct {
	TaskType    string            `json:"task_type"`     // "theory_generation", "script_generation", etc.
	Prompt      string            `json:"prompt"`
	Context     map[string]string `json:"context,omitempty"`
	MaxTokens   int               `json:"max_tokens,omitempty"`
	Temperature float64           `json:"temperature,omitempty"`
	Urgent      bool              `json:"urgent"`        // For fast local routing
}

type LLMResponse struct {
	Content   string        `json:"content"`
	Provider  string        `json:"provider"`
	Model     string        `json:"model"`
	Duration  time.Duration `json:"duration"`
	TokensUsed int          `json:"tokens_used,omitempty"`
	Cost      float64       `json:"cost,omitempty"`
	Error     string        `json:"error,omitempty"`
}

// Multi-provider router
type LLMRouter struct {
	providers       map[string]LLMProvider
	routingRules    []RoutingRule
	fallbackChain   []string
	httpClient      *http.Client
	requestLog      []LLMRequest
	responseLog     []LLMResponse
}

type RoutingRule struct {
	Condition   string `json:"condition"`    // "task_type == theory_generation"
	Provider    string `json:"provider"`
	Priority    int    `json:"priority"`
	Description string `json:"description"`
}

// Initialize LLM Router with providers
func NewLLMRouter() *LLMRouter {
	router := &LLMRouter{
		providers:     make(map[string]LLMProvider),
		routingRules:  []RoutingRule{},
		fallbackChain: []string{},
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		requestLog:  make([]LLMRequest, 0),
		responseLog: make([]LLMResponse, 0),
	}
	
	// Load default providers
	router.loadDefaultProviders()
	router.loadDefaultRoutingRules()
	
	return router
}

// Load provider configurations
func (r *LLMRouter) loadDefaultProviders() {
	// Fast Local Provider (Ollama)
	r.providers["fast_local"] = LLMProvider{
		Name:        "fast_local",
		Type:        "ollama", 
		Model:       "llama3.2:1b",
		Endpoint:    "http://localhost:11434/api/generate",
		UseFor:      []string{"simple_decisions", "pattern_matching", "quick_analysis"},
		MaxTokens:   1000,
		Temperature: 0.3,
		Timeout:     5 * time.Second,
		Headers: map[string]string{
			"Content-Type": "application/json",
		},
	}
	
	// Smart Cloud Provider (Claude)
	r.providers["smart_cloud"] = LLMProvider{
		Name:        "smart_cloud",
		Type:        "claude",
		Model:       "claude-3-5-sonnet-20241022",
		Endpoint:    "https://api.anthropic.com/v1/messages",
		APIKey:      os.Getenv("ANTHROPIC_API_KEY"),
		UseFor:      []string{"theory_generation", "complex_reasoning", "novel_problems"},
		MaxTokens:   4000,
		Temperature: 0.7,
		Timeout:     30 * time.Second,
		Headers: map[string]string{
			"Content-Type":      "application/json",
			"anthropic-version": "2023-06-01",
		},
	}
	
	// Code Generation Provider (OpenAI)
	r.providers["code_generator"] = LLMProvider{
		Name:        "code_generator", 
		Type:        "openai",
		Model:       "gpt-4",
		Endpoint:    "https://api.openai.com/v1/chat/completions",
		APIKey:      os.Getenv("OPENAI_API_KEY"),
		UseFor:      []string{"script_generation", "code_optimization", "debugging"},
		MaxTokens:   2000,
		Temperature: 0.2,
		Timeout:     20 * time.Second,
		Headers: map[string]string{
			"Content-Type": "application/json",
		},
	}
}

// Load default routing rules for intelligent provider selection
func (r *LLMRouter) loadDefaultRoutingRules() {
	r.routingRules = []RoutingRule{
		{
			Condition:   "urgent == true",
			Provider:    "phi3_local", 
			Priority:    1,
			Description: "Use local Phi-3-mini for urgent OS-native requests",
		},
		{
			Condition:   "task_type == theory_generation",
			Provider:    "phi3_local",
			Priority:    1,
			Description: "Use local Phi-3-mini for fast theory generation",
		},
		{
			Condition:   "task_type == theory_generation && max_tokens > 300",
			Provider:    "smart_cloud",
			Priority:    2,
			Description: "Use Claude for complex theory generation",
		},
		{
			Condition:   "task_type == script_generation",
			Provider:    "code_generator",
			Priority:    2,
			Description: "Use GPT-4 for code generation tasks",
		},
		{
			Condition:   "task_type == failure_analysis",
			Provider:    "fast_local",
			Priority:    3,
			Description: "Use local LLM for quick failure analysis",
		},
		{
			Condition:   "task_type == pattern_recognition",
			Provider:    "fast_local",
			Priority:    3,
			Description: "Use local LLM for pattern matching",
		},
		{
			Condition:   "task_type == complex_reasoning",
			Provider:    "smart_cloud",
			Priority:    4,
			Description: "Use Claude for complex reasoning tasks",
		},
	}
	
	// Fallback chain: phi3_local -> fast_local -> smart_cloud -> code_generator
	r.fallbackChain = []string{"phi3_local", "fast_local", "smart_cloud", "code_generator"}
}

// Route request to optimal provider
func (r *LLMRouter) RouteRequest(request LLMRequest) (*LLMResponse, error) {
	startTime := time.Now()
	
	// Log the request
	r.requestLog = append(r.requestLog, request)
	if len(r.requestLog) > 100 {
		r.requestLog = r.requestLog[1:] // Keep last 100 requests
	}
	
	// Select provider based on routing rules
	providerName := r.selectProvider(request)
	provider, exists := r.providers[providerName]
	
	if !exists {
		return nil, fmt.Errorf("provider %s not found", providerName)
	}
	
	fmt.Printf("🧠 Routing %s request to %s (%s)\n", 
		request.TaskType, provider.Name, provider.Model)
	
	// Make LLM request
	response, err := r.callProvider(provider, request)
	if err != nil {
		// Try fallback providers
		for _, fallbackName := range r.fallbackChain {
			if fallbackName == providerName {
				continue // Skip the one that just failed
			}
			
			fallbackProvider, exists := r.providers[fallbackName]
			if !exists {
				continue
			}
			
			fmt.Printf("⚠️  Falling back to %s after %s failed\n", 
				fallbackName, providerName)
			
			response, err = r.callProvider(fallbackProvider, request)
			if err == nil {
				break
			}
		}
	}
	
	if response != nil {
		response.Duration = time.Since(startTime)
		
		// Log the response
		r.responseLog = append(r.responseLog, *response)
		if len(r.responseLog) > 100 {
			r.responseLog = r.responseLog[1:]
		}
	}
	
	return response, err
}

// Select optimal provider based on routing rules
func (r *LLMRouter) selectProvider(request LLMRequest) string {
	// Check routing rules in priority order
	for _, rule := range r.routingRules {
		if r.evaluateCondition(rule.Condition, request) {
			// Verify provider supports this task type
			provider := r.providers[rule.Provider]
			for _, taskType := range provider.UseFor {
				if taskType == request.TaskType || taskType == "all" {
					return rule.Provider
				}
			}
		}
	}
	
	// Default to first provider in fallback chain
	return r.fallbackChain[0]
}// Evaluate routing rule conditions
func (r *LLMRouter) evaluateCondition(condition string, request LLMRequest) bool {
	switch {
	case condition == "urgent == true":
		return request.Urgent
	case strings.HasPrefix(condition, "task_type == "):
		taskType := strings.TrimPrefix(condition, "task_type == ")
		return request.TaskType == taskType
	default:
		return false
	}
}

// Call specific LLM provider
func (r *LLMRouter) callProvider(provider LLMProvider, request LLMRequest) (*LLMResponse, error) {
	switch provider.Type {
	case "ollama":
		return r.callOllama(provider, request)
	case "claude":
		return r.callClaude(provider, request)
	case "openai":
		return r.callOpenAI(provider, request)
	default:
		return nil, fmt.Errorf("unsupported provider type: %s", provider.Type)
	}
}

// Call Ollama local LLM
func (r *LLMRouter) callOllama(provider LLMProvider, request LLMRequest) (*LLMResponse, error) {
	start := time.Now()
	
	// Detect if this is llama.cpp server (phi3_local) or real Ollama
	isLlamaCpp := strings.Contains(provider.Name, "phi3") || strings.Contains(provider.Endpoint, "11434")
	
	var jsonData []byte
	var endpoint string
	var err error
	
	if isLlamaCpp {
		// llama.cpp server completion API format
		llamaRequest := map[string]interface{}{
			"prompt":      request.Prompt,
			"max_tokens":  request.MaxTokens,
			"temperature": request.Temperature,
			"stream":      false,
		}
		endpoint = provider.Endpoint + "/completion"
		jsonData, err = json.Marshal(llamaRequest)
	} else {
		// Standard Ollama API format
		ollamaRequest := map[string]interface{}{
			"model":  provider.Model,
			"prompt": request.Prompt,
			"stream": false,
			"options": map[string]interface{}{
				"temperature": provider.Temperature,
				"num_predict": provider.MaxTokens,
			},
		}
		endpoint = provider.Endpoint + "/api/generate"
		jsonData, err = json.Marshal(ollamaRequest)
	}
	
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %v", err)
	}
	
	// Create HTTP request
	ctx, cancel := context.WithTimeout(context.Background(), provider.Timeout)
	defer cancel()
	
	req, err := http.NewRequestWithContext(ctx, "POST", endpoint, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}
	
	req.Header.Set("Content-Type", "application/json")
	for key, value := range provider.Headers {
		req.Header.Set(key, value)
	}
	
	// Make request
	resp, err := r.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %v", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API error %d: %s", resp.StatusCode, string(body))
	}
	
	// Parse response based on provider type
	var content string
	if isLlamaCpp {
		// llama.cpp response format
		var llamaResponse map[string]interface{}
		if err := json.NewDecoder(resp.Body).Decode(&llamaResponse); err != nil {
			return nil, fmt.Errorf("failed to decode llama.cpp response: %v", err)
		}
		
		if contentField, ok := llamaResponse["content"].(string); ok {
			content = contentField
		} else {
			return nil, fmt.Errorf("invalid llama.cpp response format - no content field")
		}
	} else {
		// Standard Ollama response format
		var ollamaResponse map[string]interface{}
		if err := json.NewDecoder(resp.Body).Decode(&ollamaResponse); err != nil {
			return nil, fmt.Errorf("failed to decode Ollama response: %v", err)
		}
		
		if responseField, ok := ollamaResponse["response"].(string); ok {
			content = responseField
		} else {
			return nil, fmt.Errorf("invalid Ollama response format - no response field")
		}
	}
	
	// Clean up content (remove any system tokens)
	content = strings.TrimSpace(content)
	if strings.HasPrefix(content, "\n<|assistant|>") {
		content = strings.TrimPrefix(content, "\n<|assistant|>")
	}
	content = strings.TrimSpace(content)
	
	return &LLMResponse{
		Content:  content,
		Provider: provider.Name,
		Model:    provider.Model,
		Duration: time.Since(start),
	}, nil
}

// Call Claude API
func (r *LLMRouter) callClaude(provider LLMProvider, request LLMRequest) (*LLMResponse, error) {
	if provider.APIKey == "" {
		return nil, fmt.Errorf("Claude API key not configured")
	}
	
	// Claude API request format
	claudeRequest := map[string]interface{}{
		"model":      provider.Model,
		"max_tokens": provider.MaxTokens,
		"messages": []map[string]string{
			{
				"role":    "user",
				"content": request.Prompt,
			},
		},
	}
	
	if provider.Temperature > 0 {
		claudeRequest["temperature"] = provider.Temperature
	}
	
	jsonData, err := json.Marshal(claudeRequest)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal Claude request: %v", err)
	}
	
	// Create HTTP request
	ctx, cancel := context.WithTimeout(context.Background(), provider.Timeout)
	defer cancel()
	
	req, err := http.NewRequestWithContext(ctx, "POST", provider.Endpoint, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create Claude request: %v", err)
	}
	
	req.Header.Set("Authorization", "Bearer "+provider.APIKey)
	for key, value := range provider.Headers {
		req.Header.Set(key, value)
	}
	
	// Make request
	resp, err := r.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("Claude request failed: %v", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("Claude API error %d: %s", resp.StatusCode, string(body))
	}
	
	// Parse response
	var claudeResponse map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&claudeResponse); err != nil {
		return nil, fmt.Errorf("failed to decode Claude response: %v", err)
	}
	
	// Extract content from Claude response
	content := ""
	if contentArray, ok := claudeResponse["content"].([]interface{}); ok && len(contentArray) > 0 {
		if contentObj, ok := contentArray[0].(map[string]interface{}); ok {
			if text, ok := contentObj["text"].(string); ok {
				content = text
			}
		}
	}
	
	if content == "" {
		return nil, fmt.Errorf("no content in Claude response")
	}
	
	// Extract usage information
	tokensUsed := 0
	if usage, ok := claudeResponse["usage"].(map[string]interface{}); ok {
		if outputTokens, ok := usage["output_tokens"].(float64); ok {
			tokensUsed = int(outputTokens)
		}
	}
	
	return &LLMResponse{
		Content:    content,
		Provider:   provider.Name,
		Model:      provider.Model,
		TokensUsed: tokensUsed,
	}, nil
}// Call OpenAI API
func (r *LLMRouter) callOpenAI(provider LLMProvider, request LLMRequest) (*LLMResponse, error) {
	if provider.APIKey == "" {
		return nil, fmt.Errorf("OpenAI API key not configured")
	}
	
	// OpenAI API request format
	openaiRequest := map[string]interface{}{
		"model":      provider.Model,
		"max_tokens": provider.MaxTokens,
		"messages": []map[string]string{
			{
				"role":    "user",
				"content": request.Prompt,
			},
		},
	}
	
	if provider.Temperature > 0 {
		openaiRequest["temperature"] = provider.Temperature
	}
	
	jsonData, err := json.Marshal(openaiRequest)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal OpenAI request: %v", err)
	}
	
	// Create HTTP request
	ctx, cancel := context.WithTimeout(context.Background(), provider.Timeout)
	defer cancel()
	
	req, err := http.NewRequestWithContext(ctx, "POST", provider.Endpoint, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create OpenAI request: %v", err)
	}
	
	req.Header.Set("Authorization", "Bearer "+provider.APIKey)
	for key, value := range provider.Headers {
		req.Header.Set(key, value)
	}
	
	// Make request
	resp, err := r.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("OpenAI request failed: %v", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("OpenAI API error %d: %s", resp.StatusCode, string(body))
	}
	
	// Parse response
	var openaiResponse map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&openaiResponse); err != nil {
		return nil, fmt.Errorf("failed to decode OpenAI response: %v", err)
	}
	
	// Extract content from OpenAI response
	content := ""
	if choices, ok := openaiResponse["choices"].([]interface{}); ok && len(choices) > 0 {
		if choice, ok := choices[0].(map[string]interface{}); ok {
			if message, ok := choice["message"].(map[string]interface{}); ok {
				if text, ok := message["content"].(string); ok {
					content = text
				}
			}
		}
	}
	
	if content == "" {
		return nil, fmt.Errorf("no content in OpenAI response")
	}
	
	// Extract usage information
	tokensUsed := 0
	if usage, ok := openaiResponse["usage"].(map[string]interface{}); ok {
		if completionTokens, ok := usage["completion_tokens"].(float64); ok {
			tokensUsed = int(completionTokens)
		}
	}
	
	return &LLMResponse{
		Content:    content,
		Provider:   provider.Name,
		Model:      provider.Model,
		TokensUsed: tokensUsed,
	}, nil
}

// Get provider statistics and health
func (r *LLMRouter) GetProviderStats() map[string]interface{} {
	stats := make(map[string]interface{})
	
	// Count requests by provider
	providerCounts := make(map[string]int)
	totalRequests := len(r.responseLog)
	
	for _, response := range r.responseLog {
		providerCounts[response.Provider]++
	}
	
	// Calculate average response times
	providerTimes := make(map[string]time.Duration)
	for _, response := range r.responseLog {
		providerTimes[response.Provider] += response.Duration
	}
	
	for provider, totalTime := range providerTimes {
		if count := providerCounts[provider]; count > 0 {
			avgTime := totalTime / time.Duration(count)
			stats[provider+"_avg_response_time"] = avgTime.String()
		}
	}
	
	stats["total_requests"] = totalRequests
	stats["provider_usage"] = providerCounts
	stats["available_providers"] = len(r.providers)
	
	return stats
}

// Test provider connectivity
func (r *LLMRouter) TestProviders() map[string]error {
	results := make(map[string]error)
	
	testRequest := LLMRequest{
		TaskType: "connectivity_test",
		Prompt:   "Test connection. Respond with 'OK'.",
		Urgent:   false,
	}
	
	for name, provider := range r.providers {
		fmt.Printf("🔍 Testing provider %s...\n", name)
		
		response, err := r.callProvider(provider, testRequest)
		if err != nil {
			results[name] = err
			fmt.Printf("❌ %s failed: %v\n", name, err)
		} else if response != nil {
			results[name] = nil
			fmt.Printf("✅ %s connected: %s\n", name, 
				strings.TrimSpace(response.Content)[:min(50, len(response.Content))])
		}
	}
	
	return results
}

// Add new provider at runtime
func (r *LLMRouter) AddProvider(provider LLMProvider) {
	r.providers[provider.Name] = provider
	fmt.Printf("➕ Added provider: %s (%s)\n", provider.Name, provider.Model)
}

// Remove provider
func (r *LLMRouter) RemoveProvider(name string) {
	delete(r.providers, name)
	fmt.Printf("➖ Removed provider: %s\n", name)
}

// Helper function for min removed - already defined in flowmind_parser.go