package main

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"
)

// SimplePredictor makes actual predictions using LLMs (not fake!)
type SimplePredictor struct {
	llmRouter        *LLMRouter
	patternDetector  *PatternDetector
	predictions      []SimplePrediction
	validationQueue  []SimplePrediction // Predictions waiting to be validated
}

// SimplePrediction represents a concrete, testable prediction
type SimplePrediction struct {
	ID           string    `json:"id"`
	Type         string    `json:"type"` // "memory_exhaustion", "cpu_overload", "crash_likely"
	Description  string    `json:"description"`
	Confidence   float64   `json:"confidence"`   // LLM-provided confidence
	TimeHorizon  string    `json:"time_horizon"` // "5_minutes", "30_minutes", "1_hour"
	CreatedAt    time.Time `json:"created_at"`
	ValidateAt   time.Time `json:"validate_at"`
	WasCorrect   *bool     `json:"was_correct,omitempty"`   // nil = not validated yet
	ActualResult string    `json:"actual_result,omitempty"` // What actually happened
}

// PredictionAccuracy tracks real accuracy metrics
type PredictionAccuracy struct {
	TotalPredictions   int     `json:"total_predictions"`
	ValidatedCount     int     `json:"validated_count"`
	CorrectCount       int     `json:"correct_count"`
	AccuracyPercent    float64 `json:"accuracy_percent"`
	ByType             map[string]*TypeAccuracy `json:"by_type"`
}

type TypeAccuracy struct {
	Total   int     `json:"total"`
	Correct int     `json:"correct"`
	Accuracy float64 `json:"accuracy"`
}

// NewSimplePredictor creates a predictor with real functionality
func NewSimplePredictor(llmRouter *LLMRouter, patternDetector *PatternDetector) *SimplePredictor {
	return &SimplePredictor{
		llmRouter:       llmRouter,
		patternDetector: patternDetector,
		predictions:     []SimplePrediction{},
		validationQueue: []SimplePrediction{},
	}
}

// MakePrediction generates a specific, testable prediction
func (sp *SimplePredictor) MakePrediction(telemetry SystemTelemetry) (*SimplePrediction, error) {
	// Get current patterns and derivatives
	patterns := sp.patternDetector.GetPatterns()
	derivatives := sp.patternDetector.GetDerivatives()
	
	// Build focused prompt for specific predictions
	prompt := sp.buildPredictionPrompt(telemetry, patterns, derivatives)
	
	// Call LLM for prediction
	request := LLMRequest{
		TaskType:    "prediction",
		Prompt:      prompt,
		MaxTokens:   500,
		Temperature: 0.3, // Low temperature for consistent predictions
		Urgent:      false,
	}
	
	response, err := sp.llmRouter.RouteRequest(request)
	if err != nil {
		return nil, fmt.Errorf("LLM prediction failed: %w", err)
	}
	
	// Parse structured prediction
	prediction, err := sp.parsePrediction(response.Content)
	if err != nil {
		return nil, fmt.Errorf("failed to parse prediction: %w", err)
	}
	
	// Add metadata
	prediction.ID = fmt.Sprintf("pred_%d", time.Now().Unix())
	prediction.CreatedAt = time.Now()
	
	// Set validation time based on horizon
	switch prediction.TimeHorizon {
	case "5_minutes":
		prediction.ValidateAt = time.Now().Add(5 * time.Minute)
	case "30_minutes":
		prediction.ValidateAt = time.Now().Add(30 * time.Minute)
	case "1_hour":
		prediction.ValidateAt = time.Now().Add(1 * time.Hour)
	default:
		prediction.ValidateAt = time.Now().Add(10 * time.Minute)
	}
	
	// Store for validation
	sp.predictions = append(sp.predictions, *prediction)
	sp.validationQueue = append(sp.validationQueue, *prediction)
	
	// Keep only last 100 predictions
	if len(sp.predictions) > 100 {
		sp.predictions = sp.predictions[1:]
	}
	
	return prediction, nil
}

// buildPredictionPrompt creates focused prompt for testable predictions
func (sp *SimplePredictor) buildPredictionPrompt(telemetry SystemTelemetry, patterns []DetectedPattern, derivatives []TelemetryDerivative) string {
	prompt := `You are a system performance predictor. Make ONE specific, testable prediction based on current data.

CURRENT SYSTEM STATE:
- CPU: %.1f%% (Load: %.2f, %.2f, %.2f)
- Memory: %d MB used of %d MB (%.1f%%)
- Network: %d active connections

DETECTED PATTERNS:
`
	prompt = fmt.Sprintf(prompt, 
		telemetry.CPU.UsagePercent,
		telemetry.CPU.LoadAvg1, telemetry.CPU.LoadAvg5, telemetry.CPU.LoadAvg15,
		telemetry.Memory.UsedMB, telemetry.Memory.TotalMB, telemetry.Memory.UsagePercent,
		telemetry.Network.Connections)
	
	// Add patterns
	for _, p := range patterns {
		prompt += fmt.Sprintf("- %s (confidence: %.0f%%, seen %d times)\n", 
			p.Type, p.Confidence*100, p.Frequency)
	}
	
	// Add recent derivatives
	if len(derivatives) > 0 {
		latest := derivatives[len(derivatives)-1]
		prompt += fmt.Sprintf("\nRECENT CHANGES:\n")
		prompt += fmt.Sprintf("- CPU change: %.1f%% per minute\n", latest.CPUChangeRate)
		prompt += fmt.Sprintf("- Memory change: %.1f MB per minute\n", latest.MemoryChangeRate)
	}
	
	prompt += `
Make a SPECIFIC prediction in this JSON format:
{
  "type": "memory_exhaustion|cpu_overload|crash_likely|performance_degradation|normal_operation",
  "description": "Specific description of what will happen",
  "confidence": 0.75,
  "time_horizon": "5_minutes|30_minutes|1_hour"
}

Rules:
- Be specific: "Memory will exceed 90% in 30 minutes" not "Memory might increase"
- Use detected patterns as evidence
- Only predict things we can measure
- Confidence should reflect uncertainty (0.5-0.95)

Respond with ONLY valid JSON.`
	
	return prompt
}

// parsePrediction extracts structured prediction from LLM response
func (sp *SimplePredictor) parsePrediction(response string) (*SimplePrediction, error) {
	var prediction SimplePrediction
	err := json.Unmarshal([]byte(response), &prediction)
	if err != nil {
		// Try to extract JSON from response
		start := strings.Index(response, "{")
		end := strings.LastIndex(response, "}")
		if start >= 0 && end > start {
			jsonStr := response[start:end+1]
			err = json.Unmarshal([]byte(jsonStr), &prediction)
		}
	}
	
	if err != nil {
		return nil, err
	}
	
	// Validate required fields
	if prediction.Type == "" || prediction.Description == "" {
		return nil, fmt.Errorf("missing required fields in prediction")
	}
	
	// Ensure reasonable confidence
	if prediction.Confidence <= 0 || prediction.Confidence > 1 {
		prediction.Confidence = 0.7 // Default
	}
	
	return &prediction, nil
}

// ValidatePredictions checks predictions that are due for validation
func (sp *SimplePredictor) ValidatePredictions(currentTelemetry SystemTelemetry) {
	now := time.Now()
	stillPending := []SimplePrediction{}
	
	for _, pred := range sp.validationQueue {
		if now.After(pred.ValidateAt) {
			// Time to validate this prediction
			wasCorrect := sp.validatePrediction(pred, currentTelemetry)
			
			// Update the prediction in our history
			for i, p := range sp.predictions {
				if p.ID == pred.ID {
					sp.predictions[i].WasCorrect = &wasCorrect
					if wasCorrect {
						sp.predictions[i].ActualResult = "Prediction was correct"
					} else {
						sp.predictions[i].ActualResult = sp.getActualState(pred.Type, currentTelemetry)
					}
					break
				}
			}
		} else {
			stillPending = append(stillPending, pred)
		}
	}
	
	sp.validationQueue = stillPending
}

// validatePrediction checks if a prediction came true
func (sp *SimplePredictor) validatePrediction(pred SimplePrediction, telemetry SystemTelemetry) bool {
	switch pred.Type {
	case "memory_exhaustion":
		return telemetry.Memory.UsagePercent > 90
	case "cpu_overload":
		return telemetry.CPU.UsagePercent > 95 || telemetry.CPU.LoadAvg1 > float64(telemetry.CPU.Cores)*1.5
	case "performance_degradation":
		return telemetry.CPU.LoadAvg5 > float64(telemetry.CPU.Cores)
	case "normal_operation":
		return telemetry.CPU.UsagePercent < 80 && telemetry.Memory.UsagePercent < 80
	default:
		return false
	}
}

// getActualState describes what actually happened
func (sp *SimplePredictor) getActualState(predType string, telemetry SystemTelemetry) string {
	switch predType {
	case "memory_exhaustion":
		return fmt.Sprintf("Memory at %.1f%% (not exhausted)", telemetry.Memory.UsagePercent)
	case "cpu_overload":
		return fmt.Sprintf("CPU at %.1f%%, load %.2f (not overloaded)", 
			telemetry.CPU.UsagePercent, telemetry.CPU.LoadAvg1)
	default:
		return "System operating normally"
	}
}

// GetAccuracy calculates REAL accuracy metrics
func (sp *SimplePredictor) GetAccuracy() PredictionAccuracy {
	accuracy := PredictionAccuracy{
		TotalPredictions: len(sp.predictions),
		ByType: make(map[string]*TypeAccuracy),
	}
	
	for _, pred := range sp.predictions {
		if pred.WasCorrect != nil {
			accuracy.ValidatedCount++
			if *pred.WasCorrect {
				accuracy.CorrectCount++
			}
			
			// Track by type
			if _, exists := accuracy.ByType[pred.Type]; !exists {
				accuracy.ByType[pred.Type] = &TypeAccuracy{}
			}
			
			accuracy.ByType[pred.Type].Total++
			if *pred.WasCorrect {
				accuracy.ByType[pred.Type].Correct++
			}
		}
	}
	
	// Calculate percentages
	if accuracy.ValidatedCount > 0 {
		accuracy.AccuracyPercent = float64(accuracy.CorrectCount) / float64(accuracy.ValidatedCount) * 100
	}
	
	for _, typeAcc := range accuracy.ByType {
		if typeAcc.Total > 0 {
			typeAcc.Accuracy = float64(typeAcc.Correct) / float64(typeAcc.Total) * 100
		}
	}
	
	return accuracy
}

// GetRecentPredictions returns last N predictions
func (sp *SimplePredictor) GetRecentPredictions(count int) []SimplePrediction {
	start := len(sp.predictions) - count
	if start < 0 {
		start = 0
	}
	return sp.predictions[start:]
}

// FormatAccuracyReport creates human-readable accuracy report
func (sp *SimplePredictor) FormatAccuracyReport() string {
	acc := sp.GetAccuracy()
	
	if acc.ValidatedCount == 0 {
		return "No predictions validated yet. Waiting for time horizons to pass."
	}
	
	report := fmt.Sprintf("📊 PREDICTION ACCURACY REPORT\n")
	report += fmt.Sprintf("============================\n")
	report += fmt.Sprintf("Total Predictions: %d\n", acc.TotalPredictions)
	report += fmt.Sprintf("Validated: %d\n", acc.ValidatedCount)
	report += fmt.Sprintf("Pending: %d\n", len(sp.validationQueue))
	report += fmt.Sprintf("\n🎯 Overall Accuracy: %.1f%%\n", acc.AccuracyPercent)
	report += fmt.Sprintf("Correct: %d/%d\n", acc.CorrectCount, acc.ValidatedCount)
	
	if len(acc.ByType) > 0 {
		report += "\nAccuracy by Type:\n"
		for pType, typeAcc := range acc.ByType {
			report += fmt.Sprintf("- %s: %.1f%% (%d/%d)\n", 
				pType, typeAcc.Accuracy, typeAcc.Correct, typeAcc.Total)
		}
	}
	
	return report
}