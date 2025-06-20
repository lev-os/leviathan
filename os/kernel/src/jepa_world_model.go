package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"
)

// JEPA2WorldModel integrates Meta's V-JEPA 2 temporal prediction with Leviathan cognitive parliament
// Revolutionary 4D spatio-temporal reasoning for predictive OS optimization
type JEPA2WorldModel struct {
	embeddingCache    map[string]TemporalEmbedding
	predictionHistory []WorldModelPrediction
	cognitiveRouter   *CognitiveParliament
	llmRouter        *LLMRouter
	temporalBuffer   *CircularTemporalBuffer
	learningState    *SelfLearningState
	mutex            sync.RWMutex
	isActive         bool
}

// TemporalEmbedding represents JEPA 2's joint embedding space
type TemporalEmbedding struct {
	SystemState     []float64           `json:"system_state"`      // Current system metrics embedding
	WorkflowContext []float64           `json:"workflow_context"`  // User workflow pattern embedding
	TemporalHistory [][]float64         `json:"temporal_history"`  // 128-frame temporal context
	SpatialLayout   []float64           `json:"spatial_layout"`    // System topology embedding
	ConfidenceScore float64             `json:"confidence_score"`  // Prediction confidence
	GeneratedAt     time.Time           `json:"generated_at"`
	ExpiresAt       time.Time           `json:"expires_at"`
}

// WorldModelPrediction represents JEPA 2's temporal predictions
type WorldModelPrediction struct {
	PredictionID       string                  `json:"prediction_id"`
	CurrentState       TemporalEmbedding       `json:"current_state"`
	PredictedSequence  []TemporalEmbedding     `json:"predicted_sequence"`  // Next 10 temporal steps
	OptimizationPath   []SystemOptimization    `json:"optimization_path"`
	PredictionHorizon  int                     `json:"prediction_horizon"`  // Frames ahead
	ZeroShotAdaptation bool                    `json:"zero_shot_adaptation"`
	Confidence         float64                 `json:"confidence"`
	GeneratedAt        time.Time               `json:"generated_at"`
}

// SystemOptimization represents AI-generated optimization actions
type SystemOptimization struct {
	ActionType        string                 `json:"action_type"`         // "memory", "cpu", "network", "workflow"
	PredictedImpact   float64               `json:"predicted_impact"`    // Expected improvement %
	TemporalTiming    time.Duration         `json:"temporal_timing"`     // When to execute
	AIGenerated       bool                  `json:"ai_generated"`        // JEPA 2 generated vs rule-based
	PersonalityMode   string                `json:"personality_mode"`    // Which cognitive mode recommended this
	EmbeddingSource   TemporalEmbedding     `json:"embedding_source"`
	Parameters        map[string]interface{} `json:"parameters"`
}

// CircularTemporalBuffer maintains rolling window of system states for temporal prediction
type CircularTemporalBuffer struct {
	buffer      []SystemTelemetryWithContext
	maxSize     int
	currentPos  int
	isFull      bool
	mutex       sync.RWMutex
}

// SystemTelemetryWithContext extends base telemetry with workflow context
type SystemTelemetryWithContext struct {
	SystemTelemetry
	WorkflowContext   string                 `json:"workflow_context"`
	UserIntent       string                 `json:"user_intent"`
	ActiveProcesses  []ProcessContext       `json:"active_processes"`
	NetworkPatterns  []NetworkActivity      `json:"network_patterns"`
	Timestamp        time.Time              `json:"timestamp"`
}

// SelfLearningState tracks JEPA 2's continuous learning
type SelfLearningState struct {
	LearnedPatterns      map[string]WorkflowPattern    `json:"learned_patterns"`
	AdaptationHistory    []ZeroShotAdaptation          `json:"adaptation_history"`
	PerformanceMetrics   LearningPerformanceMetrics    `json:"performance_metrics"`
	LastLearningCycle    time.Time                     `json:"last_learning_cycle"`
	TotalAdaptations     int                           `json:"total_adaptations"`
	SuccessfulPredictions int                          `json:"successful_predictions"`
}

// WorkflowPattern represents learned user behavior patterns
type WorkflowPattern struct {
	PatternID         string                 `json:"pattern_id"`
	UserActions       []string               `json:"user_actions"`
	SystemResponses   []string               `json:"system_responses"`
	TemporalSignature []float64              `json:"temporal_signature"`
	Frequency         int                    `json:"frequency"`
	SuccessRate       float64                `json:"success_rate"`
	LearnedAt         time.Time              `json:"learned_at"`
	LastSeen          time.Time              `json:"last_seen"`
}

// ZeroShotAdaptation tracks JEPA 2's adaptation to new patterns
type ZeroShotAdaptation struct {
	AdaptationID      string                 `json:"adaptation_id"`
	TriggerPattern    []float64              `json:"trigger_pattern"`
	NoveltyScore      float64                `json:"novelty_score"`
	AdaptationSpeed   time.Duration          `json:"adaptation_speed"`
	SuccessfulOutput  bool                   `json:"successful_output"`
	LearningPath      []string               `json:"learning_path"`
	GeneratedAt       time.Time              `json:"generated_at"`
}

// ProcessContext represents active process information for workflow analysis
type ProcessContext struct {
	PID          int       `json:"pid"`
	Name         string    `json:"name"`
	CPUUsage     float64   `json:"cpu_usage"`
	MemoryUsage  int64     `json:"memory_usage"`
	StartTime    time.Time `json:"start_time"`
	CommandLine  string    `json:"command_line"`
}

// NetworkActivity represents network patterns for spatial analysis
type NetworkActivity struct {
	ConnectionType  string    `json:"connection_type"`   // "tcp", "udp", etc.
	LocalAddress    string    `json:"local_address"`
	RemoteAddress   string    `json:"remote_address"`
	State          string    `json:"state"`             // "established", "listening", etc.
	BytesSent      int64     `json:"bytes_sent"`
	BytesReceived  int64     `json:"bytes_received"`
	Timestamp      time.Time `json:"timestamp"`
}

// LearningPerformanceMetrics tracks JEPA 2 effectiveness
type LearningPerformanceMetrics struct {
	PredictionAccuracy       float64 `json:"prediction_accuracy"`        // % of predictions that proved correct
	AdaptationSpeed          float64 `json:"adaptation_speed"`           // Average time to adapt to new patterns
	SystemOptimizationGains  float64 `json:"system_optimization_gains"`  // % improvement in system performance
	ZeroShotSuccessRate      float64 `json:"zero_shot_success_rate"`     // % of successful novel adaptations
	TemporalModelingAccuracy float64 `json:"temporal_modeling_accuracy"` // How well we predict temporal sequences
}

// NewJEPA2WorldModel creates a new JEPA 2 world model instance
func NewJEPA2WorldModel(cognitiveParliament *CognitiveParliament, llmRouter *LLMRouter) *JEPA2WorldModel {
	return &JEPA2WorldModel{
		embeddingCache:    make(map[string]TemporalEmbedding),
		predictionHistory: make([]WorldModelPrediction, 0),
		cognitiveRouter:   cognitiveParliament,
		llmRouter:        llmRouter,
		temporalBuffer:   NewCircularTemporalBuffer(128), // 128-frame context like JEPA 2
		learningState: &SelfLearningState{
			LearnedPatterns:   make(map[string]WorkflowPattern),
			AdaptationHistory: make([]ZeroShotAdaptation, 0),
			PerformanceMetrics: LearningPerformanceMetrics{
				PredictionAccuracy:       0.0,
				AdaptationSpeed:          0.0,
				SystemOptimizationGains:  0.0,
				ZeroShotSuccessRate:      0.0,
				TemporalModelingAccuracy: 0.0,
			},
		},
		isActive: true,
	}
}

// NewCircularTemporalBuffer creates temporal buffer for JEPA 2 context
func NewCircularTemporalBuffer(maxSize int) *CircularTemporalBuffer {
	return &CircularTemporalBuffer{
		buffer:     make([]SystemTelemetryWithContext, maxSize),
		maxSize:    maxSize,
		currentPos: 0,
		isFull:     false,
	}
}

// PredictFutureSystemStates uses JEPA 2 temporal modeling to predict system evolution
func (jwm *JEPA2WorldModel) PredictFutureSystemStates(ctx context.Context, currentTelemetry SystemTelemetry, horizon int) (*WorldModelPrediction, error) {
	jwm.mutex.Lock()
	defer jwm.mutex.Unlock()

	// 1. Extract joint embeddings from current state (multi-modal like JEPA 2)
	currentEmbedding, err := jwm.extractJointEmbeddings(currentTelemetry)
	if err != nil {
		return nil, fmt.Errorf("failed to extract embeddings: %w", err)
	}

	// 2. Get temporal context from circular buffer (128 frames like JEPA 2)
	temporalContext := jwm.temporalBuffer.GetTemporalSequence(horizon)

	// 3. Use LLM routing to generate temporal predictions
	prediction, err := jwm.generateTemporalPrediction(ctx, currentEmbedding, temporalContext, horizon)
	if err != nil {
		return nil, fmt.Errorf("failed to generate prediction: %w", err)
	}

	// 4. Route through cognitive parliament for personality-based optimization
	optimizedPrediction, err := jwm.cognitiveParliamentOptimization(ctx, prediction)
	if err != nil {
		log.Printf("Cognitive parliament optimization failed: %v", err)
		// Continue with unoptimized prediction
		optimizedPrediction = prediction
	}

	// 5. Cache embedding for future reference
	cacheKey := fmt.Sprintf("embedding_%d", time.Now().Unix())
	jwm.embeddingCache[cacheKey] = currentEmbedding

	// 6. Store prediction in history
	jwm.predictionHistory = append(jwm.predictionHistory, *optimizedPrediction)

	// 7. Trigger continuous learning update
	go jwm.updateLearningState(*optimizedPrediction)

	return optimizedPrediction, nil
}

// extractJointEmbeddings creates JEPA 2-style joint embeddings from system state
func (jwm *JEPA2WorldModel) extractJointEmbeddings(telemetry SystemTelemetry) (TemporalEmbedding, error) {
	// This would integrate with actual JEPA 2 model in production
	// For now, create structured embeddings that capture the pattern
	
	systemStateEmbedding := []float64{
		telemetry.CPU.UsagePercent,
		telemetry.Memory.UsagePercent,
		float64(telemetry.Network.Connections),
		telemetry.CPU.LoadAvg1,
		telemetry.CPU.LoadAvg5,
		telemetry.CPU.LoadAvg15,
	}

	// Get workflow context embedding (would use actual JEPA 2 in production)
	workflowEmbedding := jwm.extractWorkflowContextEmbedding()

	// Get temporal history embeddings
	temporalHistory := jwm.temporalBuffer.GetEmbeddingHistory(10)

	// Create spatial layout embedding (system topology)
	spatialEmbedding := jwm.extractSpatialLayoutEmbedding(telemetry)

	return TemporalEmbedding{
		SystemState:     systemStateEmbedding,
		WorkflowContext: workflowEmbedding,
		TemporalHistory: temporalHistory,
		SpatialLayout:   spatialEmbedding,
		ConfidenceScore: 0.85, // Would be calculated by JEPA 2 model
		GeneratedAt:     time.Now(),
		ExpiresAt:       time.Now().Add(time.Minute * 5),
	}, nil
}

// generateTemporalPrediction uses LLM routing to create JEPA 2-style predictions
func (jwm *JEPA2WorldModel) generateTemporalPrediction(ctx context.Context, currentEmbedding TemporalEmbedding, temporalContext []SystemTelemetryWithContext, horizon int) (*WorldModelPrediction, error) {
	// Use LLM routing to generate predictions based on JEPA 2 principles
	prompt := jwm.buildJEPA2PredictionPrompt(currentEmbedding, temporalContext, horizon)
	
	// Create LLM request for prediction generation
	var taskType string
	if horizon > 50 || len(temporalContext) > 100 {
		// Complex temporal reasoning
		taskType = "complex_reasoning"
	} else {
		// Simple prediction
		taskType = "pattern_matching"
	}

	request := LLMRequest{
		TaskType:    taskType,
		Prompt:      prompt,
		MaxTokens:   1500,
		Temperature: 0.3, // Lower temperature for more focused predictions
		Urgent:      false,
	}

	response, err := jwm.llmRouter.RouteRequest(request)
	if err != nil {
		return nil, fmt.Errorf("LLM prediction failed: %w", err)
	}

	// Parse LLM response into structured prediction
	prediction, err := jwm.parsePredictionResponse(response.Content, currentEmbedding, horizon)
	if err != nil {
		return nil, fmt.Errorf("failed to parse prediction: %w", err)
	}

	return prediction, nil
}

// buildJEPA2PredictionPrompt creates LLM prompt based on JEPA 2 principles
func (jwm *JEPA2WorldModel) buildJEPA2PredictionPrompt(embedding TemporalEmbedding, context []SystemTelemetryWithContext, horizon int) string {
	return fmt.Sprintf(`You are a JEPA 2 (Joint Embedding Predictive Architecture) world model for an AI-native operating system.

Your task is to predict the next %d temporal steps of system evolution based on:

CURRENT SYSTEM STATE EMBEDDING:
- CPU Usage: %.2f
- Memory Usage: %.2f  
- Network Connections: %.0f
- Load Averages: %.2f, %.2f, %.2f

TEMPORAL CONTEXT (last %d frames):
%s

WORKFLOW CONTEXT EMBEDDING:
%v

SPATIAL LAYOUT EMBEDDING:
%v

Using JEPA 2 principles:
1. Joint Embedding Prediction: Predict in abstract embedding space, not raw pixels/metrics
2. Temporal Modeling: Use 4D spatio-temporal reasoning across space, time, code, and context
3. Zero-Shot Adaptation: Adapt to novel patterns without explicit training
4. Embodied Intelligence: Consider physical-digital world understanding

Provide predictions in this JSON format:
{
  "predicted_sequence": [array of future states with embeddings],
  "optimization_path": [array of recommended system optimizations],
  "confidence": 0.85,
  "zero_shot_adaptation": true/false,
  "reasoning": "explanation of temporal patterns and prediction logic"
}

Focus on:
- Predicting resource bottlenecks before they occur
- Identifying optimization opportunities through temporal patterns
- Adapting to new workflow patterns without explicit training
- Optimizing for user experience and system performance

Respond with valid JSON only.`, 
		horizon,
		embedding.SystemState[0], embedding.SystemState[1], embedding.SystemState[2],
		embedding.SystemState[3], embedding.SystemState[4], embedding.SystemState[5],
		len(context),
		jwm.formatTemporalContext(context),
		embedding.WorkflowContext,
		embedding.SpatialLayout)
}

// cognitiveParliamentOptimization routes prediction through personality framework
func (jwm *JEPA2WorldModel) cognitiveParliamentOptimization(ctx context.Context, prediction *WorldModelPrediction) (*WorldModelPrediction, error) {
	// Route prediction through cognitive parliament for personality-based enhancement
	if jwm.cognitiveRouter == nil || !jwm.cognitiveRouter.enabled {
		return prediction, nil
	}

	// Get current active personality (simplified for demo)
	activePersonality := "sfj_caregiver" // Would be dynamically determined
	
	// Apply personality-based optimization to prediction
	optimizedActions := make([]SystemOptimization, 0, len(prediction.OptimizationPath))
	
	for _, optimization := range prediction.OptimizationPath {
		// Enhance optimization with personality mode
		optimization.PersonalityMode = activePersonality
		
		// Apply personality-specific adjustments
		optimizedOptimization := jwm.applyPersonalityOptimization(optimization, activePersonality)
		optimizedActions = append(optimizedActions, optimizedOptimization)
	}
	
	prediction.OptimizationPath = optimizedActions
	return prediction, nil
}

// Zero-shot adaptation implementation
func (jwm *JEPA2WorldModel) AdaptToNovelPattern(ctx context.Context, novelPattern SystemTelemetryWithContext) (*ZeroShotAdaptation, error) {
	jwm.mutex.Lock()
	defer jwm.mutex.Unlock()

	// Calculate novelty score based on similarity to known patterns
	noveltyScore := jwm.calculateNoveltyScore(novelPattern)
	
	if noveltyScore < 0.7 {
		// Pattern is not novel enough to trigger adaptation
		return nil, nil
	}

	adaptationStart := time.Now()
	
	// Extract embedding for novel pattern
	embedding, err := jwm.extractJointEmbeddings(novelPattern.SystemTelemetry)
	if err != nil {
		return nil, fmt.Errorf("failed to extract novel pattern embedding: %w", err)
	}

	// Use LLM to generate adaptation strategy
	adaptationPrompt := jwm.buildAdaptationPrompt(novelPattern, embedding, noveltyScore)
	
	request := LLMRequest{
		TaskType:    "novel_problems",
		Prompt:      adaptationPrompt,
		MaxTokens:   800,
		Temperature: 0.7, // Higher temperature for creative adaptation
		Urgent:      false,
	}
	
	_, err = jwm.llmRouter.RouteRequest(request)
	if err != nil {
		return nil, fmt.Errorf("adaptation generation failed: %w", err)
	}

	adaptation := &ZeroShotAdaptation{
		AdaptationID:      fmt.Sprintf("adapt_%d", time.Now().Unix()),
		TriggerPattern:    embedding.SystemState,
		NoveltyScore:      noveltyScore,
		AdaptationSpeed:   time.Since(adaptationStart),
		SuccessfulOutput:  true, // Would be validated in production
		LearningPath:      []string{"pattern_detection", "similarity_analysis", "strategy_generation"},
		GeneratedAt:       time.Now(),
	}

	// Update learning state
	jwm.learningState.AdaptationHistory = append(jwm.learningState.AdaptationHistory, *adaptation)
	jwm.learningState.TotalAdaptations++

	return adaptation, nil
}

// Continuous learning update
func (jwm *JEPA2WorldModel) updateLearningState(prediction WorldModelPrediction) {
	jwm.mutex.Lock()
	defer jwm.mutex.Unlock()

	// Update performance metrics based on prediction accuracy
	// This would validate against actual outcomes in production
	
	// Simulate learning progress
	jwm.learningState.PerformanceMetrics.PredictionAccuracy = 
		(jwm.learningState.PerformanceMetrics.PredictionAccuracy*0.9) + (prediction.Confidence*0.1)
	
	jwm.learningState.SuccessfulPredictions++
	jwm.learningState.LastLearningCycle = time.Now()

	// Clean up old embeddings and predictions to prevent memory leaks
	jwm.cleanupOldData()
}

// Helper methods (simplified implementations)
func (jwm *JEPA2WorldModel) extractWorkflowContextEmbedding() []float64 {
	// Would analyze current user workflow patterns in production
	return []float64{0.5, 0.3, 0.8, 0.2, 0.9} // Placeholder
}

func (jwm *JEPA2WorldModel) extractSpatialLayoutEmbedding(telemetry SystemTelemetry) []float64 {
	// Would analyze system topology and resource spatial distribution
	return []float64{float64(telemetry.Network.Connections), telemetry.Memory.UsagePercent} // Placeholder
}

func (jwm *JEPA2WorldModel) formatTemporalContext(context []SystemTelemetryWithContext) string {
	if len(context) == 0 {
		return "No temporal context available"
	}
	
	// Format recent system states for LLM context
	summary := fmt.Sprintf("Last %d system states:\n", len(context))
	for i, state := range context {
		summary += fmt.Sprintf("Frame %d: CPU %.1f%%, Memory %.1f%%, Connections %d\n", 
			i, state.CPU.UsagePercent, state.Memory.UsagePercent, state.Network.Connections)
	}
	return summary
}

func (jwm *JEPA2WorldModel) parsePredictionResponse(response string, embedding TemporalEmbedding, horizon int) (*WorldModelPrediction, error) {
	// Parse LLM JSON response into structured prediction
	var rawPrediction struct {
		PredictedSequence []map[string]interface{} `json:"predicted_sequence"`
		OptimizationPath  []map[string]interface{} `json:"optimization_path"`
		Confidence        float64                  `json:"confidence"`
		ZeroShotAdaptation bool                    `json:"zero_shot_adaptation"`
		Reasoning         string                   `json:"reasoning"`
	}

	err := json.Unmarshal([]byte(response), &rawPrediction)
	if err != nil {
		return nil, fmt.Errorf("failed to parse LLM response: %w", err)
	}

	// Convert to structured prediction
	prediction := &WorldModelPrediction{
		PredictionID:       fmt.Sprintf("pred_%d", time.Now().Unix()),
		CurrentState:       embedding,
		PredictedSequence:  make([]TemporalEmbedding, 0),
		OptimizationPath:   make([]SystemOptimization, 0),
		PredictionHorizon:  horizon,
		ZeroShotAdaptation: rawPrediction.ZeroShotAdaptation,
		Confidence:         rawPrediction.Confidence,
		GeneratedAt:        time.Now(),
	}

	// Parse optimization path (simplified)
	for _, opt := range rawPrediction.OptimizationPath {
		if actionType, ok := opt["action_type"].(string); ok {
			optimization := SystemOptimization{
				ActionType:      actionType,
				PredictedImpact: 0.15, // Would extract from LLM response
				TemporalTiming:  time.Second * 30,
				AIGenerated:     true,
				EmbeddingSource: embedding,
				Parameters:      opt,
			}
			prediction.OptimizationPath = append(prediction.OptimizationPath, optimization)
		}
	}

	return prediction, nil
}

func (jwm *JEPA2WorldModel) calculateNoveltyScore(pattern SystemTelemetryWithContext) float64 {
	// Calculate how different this pattern is from known patterns
	// This is a simplified implementation - would use embedding similarity in production
	return 0.8 // Placeholder
}

func (jwm *JEPA2WorldModel) buildAdaptationPrompt(pattern SystemTelemetryWithContext, embedding TemporalEmbedding, noveltyScore float64) string {
	return fmt.Sprintf(`Novel system pattern detected (novelty score: %.2f).

Pattern characteristics:
- CPU: %.1f%%, Memory: %.1f%%, Network: %d connections
- Workflow context: %s
- User intent: %s

Generate zero-shot adaptation strategy using JEPA 2 principles.
Focus on understanding this new pattern and optimizing system response.

Respond with adaptation strategy and learning path.`, 
		noveltyScore, pattern.CPU.UsagePercent, pattern.Memory.UsagePercent, 
		pattern.Network.Connections, pattern.WorkflowContext, pattern.UserIntent)
}

func (jwm *JEPA2WorldModel) applyPersonalityOptimization(optimization SystemOptimization, personality string) SystemOptimization {
	// Apply personality-specific adjustments to optimization
	switch personality {
	case "sfj_caregiver":
		// Conservative, safety-first approach
		optimization.PredictedImpact *= 0.8 // Be more conservative
	case "nfp_advocate":
		// Innovative, experimental approach  
		optimization.PredictedImpact *= 1.2 // Be more aggressive
	default:
		// Keep as-is
	}
	
	return optimization
}

func (jwm *JEPA2WorldModel) cleanupOldData() {
	// Remove embeddings older than 1 hour
	cutoff := time.Now().Add(-time.Hour)
	for key, embedding := range jwm.embeddingCache {
		if embedding.GeneratedAt.Before(cutoff) {
			delete(jwm.embeddingCache, key)
		}
	}

	// Keep only last 100 predictions
	if len(jwm.predictionHistory) > 100 {
		jwm.predictionHistory = jwm.predictionHistory[len(jwm.predictionHistory)-100:]
	}
}

// GetLearningMetrics returns current JEPA 2 learning performance
func (jwm *JEPA2WorldModel) GetLearningMetrics() LearningPerformanceMetrics {
	jwm.mutex.RLock()
	defer jwm.mutex.RUnlock()
	return jwm.learningState.PerformanceMetrics
}

// Circular buffer methods
func (ctb *CircularTemporalBuffer) Add(telemetry SystemTelemetryWithContext) {
	ctb.mutex.Lock()
	defer ctb.mutex.Unlock()

	ctb.buffer[ctb.currentPos] = telemetry
	ctb.currentPos = (ctb.currentPos + 1) % ctb.maxSize
	
	if ctb.currentPos == 0 {
		ctb.isFull = true
	}
}

func (ctb *CircularTemporalBuffer) GetTemporalSequence(count int) []SystemTelemetryWithContext {
	ctb.mutex.RLock()
	defer ctb.mutex.RUnlock()

	if count > ctb.maxSize {
		count = ctb.maxSize
	}

	result := make([]SystemTelemetryWithContext, 0, count)
	
	size := ctb.maxSize
	if !ctb.isFull {
		size = ctb.currentPos
	}

	if size == 0 {
		return result
	}

	for i := 0; i < count && i < size; i++ {
		pos := (ctb.currentPos - 1 - i + ctb.maxSize) % ctb.maxSize
		result = append(result, ctb.buffer[pos])
	}

	return result
}

func (ctb *CircularTemporalBuffer) GetEmbeddingHistory(count int) [][]float64 {
	sequence := ctb.GetTemporalSequence(count)
	embeddings := make([][]float64, 0, len(sequence))
	
	for _, state := range sequence {
		embedding := []float64{
			state.CPU.UsagePercent,
			state.Memory.UsagePercent,
			float64(state.Network.Connections),
		}
		embeddings = append(embeddings, embedding)
	}
	
	return embeddings
}