package main

import (
	"context"
	"fmt"
	"time"
)

// SEALEngine implements the MIT SEAL (Self-Evolving Architectures for Learning) approach
// Core principle: Generate synthetic training data to target weaknesses and continuously self-improve
type SEALEngine struct {
	memory          MemoryBackend
	syntheticGen    *SyntheticDataGenerator
	selfCritique    *SelfCritiqueModule
	notesTaken      []LearningNote
	capabilities    Capabilities
	attemptHistory  []Attempt
}

// SyntheticDataGenerator creates targeted training scenarios
type SyntheticDataGenerator struct {
	patterns []PatternTemplate
}

// SelfCritiqueModule analyzes failures and identifies improvement areas
type SelfCritiqueModule struct {
	critiqueMethods []string
}

// LearningNote represents a "note" that SEAL takes to improve itself
type LearningNote struct {
	ID          string                 `json:"id"`
	Content     string                 `json:"content"`
	Category    string                 `json:"category"`    // "weakness", "strength", "pattern"
	Confidence  float64                `json:"confidence"`
	CreatedAt   time.Time              `json:"created_at"`
	AppliedAt   *time.Time             `json:"applied_at,omitempty"`
	Metadata    map[string]interface{} `json:"metadata"`
}

// PatternTemplate for generating synthetic scenarios
type PatternTemplate struct {
	Name        string   `json:"name"`
	Variables   []string `json:"variables"`
	Template    string   `json:"template"`
	Difficulty  float64  `json:"difficulty"`
}

// NewSEALEngine creates a new SEAL discovery engine
func NewSEALEngine() *SEALEngine {
	return &SEALEngine{
		syntheticGen: &SyntheticDataGenerator{
			patterns: []PatternTemplate{
				{
					Name:       "memory_leak_scenario",
					Variables:  []string{"growth_rate", "duration", "initial_usage"},
					Template:   "Memory growing at {growth_rate} MB/min for {duration} minutes",
					Difficulty: 0.6,
				},
				{
					Name:       "cpu_spike_scenario", 
					Variables:  []string{"spike_percentage", "frequency", "duration"},
					Template:   "CPU spikes to {spike_percentage}% every {frequency} seconds for {duration}",
					Difficulty: 0.4,
				},
			},
		},
		selfCritique: &SelfCritiqueModule{
			critiqueMethods: []string{"failure_analysis", "pattern_identification", "confidence_assessment"},
		},
		capabilities: Capabilities{
			SupportedProblemTypes: []string{
				"memory_leak_pattern",
				"cpu_spike_detection", 
				"performance_degradation",
				"resource_optimization",
				"novel_problems", // SEAL's strength - adapting to new problems
			},
			LearningMethods: []string{
				"synthetic_data_generation",
				"self_critique",
				"permanent_learning",
				"weakness_targeting",
			},
			OptimizationMethods: []string{
				"note_taking",
				"strategy_evolution",
				"confidence_refinement",
			},
			RequiredResources:     []string{"memory_backend", "llm_access"},
			MaxConcurrentAttempts: 5,
		},
		notesTaken:     []LearningNote{},
		attemptHistory: []Attempt{},
	}
}

// Attempt implements the Trial phase of TELO cycle
func (s *SEALEngine) Attempt(ctx context.Context, problem Problem) (*Attempt, error) {
	// SEAL's approach: Use previous notes and synthetic scenarios to inform strategy
	strategy := s.buildStrategyFromNotes(problem)
	
	attempt := &Attempt{
		ID:        fmt.Sprintf("seal_%d", time.Now().Unix()),
		Problem:   problem,
		Strategy:  strategy,
		StartTime: time.Now(),
		Actions:   []Action{},
		Metadata:  map[string]interface{}{
			"engine_type": "seal",
			"notes_used":  len(s.notesTaken),
		},
	}
	
	// Execute strategy (simplified for now)
	success := s.executeStrategy(ctx, attempt)
	attempt.Success = success
	attempt.EndTime = time.Now()
	
	return attempt, nil
}

// LogOutcome implements the Error phase of TELO cycle  
func (s *SEALEngine) LogOutcome(attempt *Attempt, outcome Outcome) error {
	// Store attempt in history for learning
	s.attemptHistory = append(s.attemptHistory, *attempt)
	
	// SEAL immediately creates learning notes from outcomes
	if !outcome.Success {
		note := s.createFailureNote(attempt, outcome)
		s.notesTaken = append(s.notesTaken, note)
	} else {
		note := s.createSuccessNote(attempt, outcome)
		s.notesTaken = append(s.notesTaken, note)
	}
	
	// Store in memory backend if available
	if s.memory != nil {
		return s.memory.StoreAttempt("seal", *attempt)
	}
	
	return nil
}

// Learn implements the Learn phase of TELO cycle
func (s *SEALEngine) Learn(history []Attempt) (*Learning, error) {
	// SEAL's unique learning: Generate synthetic scenarios targeting weaknesses
	weaknesses := s.selfCritique.AnalyzeFailures(history)
	
	// Generate synthetic data to address weaknesses
	syntheticScenarios := s.syntheticGen.CreateTargetedScenarios(weaknesses)
	
	// Create learning notes for permanent improvement
	notes := s.createLearningNotes(syntheticScenarios)
	s.notesTaken = append(s.notesTaken, notes...)
	
	// Extract insights from notes and history
	insights := s.extractInsights(history, notes)
	
	learning := &Learning{
		Insights:           insights,
		SuccessfulPatterns: s.identifySuccessfulPatterns(history),
		WeakAreas:          weaknesses,
		Confidence:         s.calculateLearningConfidence(history),
		SampleSize:         len(history),
		TimeRange: TimeRange{
			Start:       history[0].StartTime,
			End:         history[len(history)-1].EndTime,
			Description: fmt.Sprintf("SEAL learning from %d attempts", len(history)),
		},
	}
	
	return learning, nil
}

// Optimize implements the Optimize phase of TELO cycle
func (s *SEALEngine) Optimize(learning *Learning) (*Strategy, error) {
	// SEAL's optimization: Use accumulated notes to create better strategies
	
	strategy := &Strategy{
		Type:       "seal_optimized",
		Confidence: learning.Confidence + 0.1, // SEAL gains confidence through notes
		PreferredMethods: append(learning.SuccessfulPatterns, "synthetic_scenario_application"),
		AvoidMethods:     learning.WeakAreas,
		Improvements: []string{
			"Applied " + fmt.Sprintf("%d", len(s.notesTaken)) + " learning notes",
			"Generated synthetic scenarios for weak areas",
			"Enhanced self-critique mechanisms",
		},
		Parameters: map[string]interface{}{
			"notes_count":              len(s.notesTaken),
			"synthetic_scenarios_used": len(learning.WeakAreas),
			"learning_confidence":      learning.Confidence,
		},
	}
	
	return strategy, nil
}

// GetCapabilities returns SEAL engine capabilities
func (s *SEALEngine) GetCapabilities() Capabilities {
	return s.capabilities
}

// GetConfidence returns confidence for solving a specific problem type
func (s *SEALEngine) GetConfidence(problem Problem) float64 {
	// SEAL's confidence grows with notes taken about similar problems
	baseConfidence := 0.5
	
	// Check if we have notes about this problem type
	relevantNotes := 0
	for _, note := range s.notesTaken {
		if note.Category == problem.Type {
			relevantNotes++
		}
	}
	
	// Confidence increases with relevant experience
	experienceBoost := float64(relevantNotes) * 0.1
	confidence := baseConfidence + experienceBoost
	
	// SEAL is particularly good at novel problems (its key strength)
	if problem.Type == "novel_problems" || problem.Type == "unknown_pattern" {
		confidence += 0.3
	}
	
	// Cap confidence at 1.0
	if confidence > 1.0 {
		confidence = 1.0
	}
	
	return confidence
}

// Helper methods for SEAL-specific functionality

func (s *SEALEngine) buildStrategyFromNotes(problem Problem) Strategy {
	// Use accumulated notes to inform strategy
	relevantNotes := []LearningNote{}
	for _, note := range s.notesTaken {
		if note.Category == problem.Type || note.Category == "general" {
			relevantNotes = append(relevantNotes, note)
		}
	}
	
	confidence := 0.6
	if len(relevantNotes) > 0 {
		confidence += float64(len(relevantNotes)) * 0.05
	}
	
	return Strategy{
		Type:       "seal_note_based",
		Confidence: confidence,
		PreferredMethods: []string{"note_application", "synthetic_scenario_usage"},
		Parameters: map[string]interface{}{
			"relevant_notes": len(relevantNotes),
		},
	}
}

func (s *SEALEngine) executeStrategy(ctx context.Context, attempt *Attempt) bool {
	// Simplified execution - real implementation would apply learned strategies
	// For now, simulate success/failure based on confidence
	return attempt.Strategy.Confidence > 0.7
}

func (s *SEALEngine) createFailureNote(attempt *Attempt, outcome Outcome) LearningNote {
	return LearningNote{
		ID:         fmt.Sprintf("failure_note_%d", time.Now().Unix()),
		Content:    fmt.Sprintf("Failed attempt on %s: %v", attempt.Problem.Type, outcome.Lessons),
		Category:   "weakness",
		Confidence: 0.8,
		CreatedAt:  time.Now(),
		Metadata: map[string]interface{}{
			"problem_type": attempt.Problem.Type,
			"strategy":     attempt.Strategy.Type,
			"lessons":      outcome.Lessons,
		},
	}
}

func (s *SEALEngine) createSuccessNote(attempt *Attempt, outcome Outcome) LearningNote {
	return LearningNote{
		ID:         fmt.Sprintf("success_note_%d", time.Now().Unix()),
		Content:    fmt.Sprintf("Successful approach for %s: %s", attempt.Problem.Type, attempt.Strategy.Type),
		Category:   "strength",
		Confidence: 0.9,
		CreatedAt:  time.Now(),
		Metadata: map[string]interface{}{
			"problem_type": attempt.Problem.Type,
			"strategy":     attempt.Strategy.Type,
			"result":       outcome.Result,
		},
	}
}

func (s *SEALEngine) createLearningNotes(scenarios []SyntheticScenario) []LearningNote {
	notes := []LearningNote{}
	for _, scenario := range scenarios {
		note := LearningNote{
			ID:         fmt.Sprintf("synthetic_note_%d", time.Now().Unix()),
			Content:    fmt.Sprintf("Synthetic scenario for %s: %s", scenario.ProblemType, scenario.Description),
			Category:   "pattern",
			Confidence: scenario.Confidence,
			CreatedAt:  time.Now(),
			Metadata: map[string]interface{}{
				"scenario_type": scenario.ProblemType,
				"synthetic":     true,
			},
		}
		notes = append(notes, note)
	}
	return notes
}

func (s *SEALEngine) extractInsights(history []Attempt, notes []LearningNote) []string {
	insights := []string{
		fmt.Sprintf("SEAL analyzed %d attempts and created %d learning notes", len(history), len(notes)),
		"Synthetic data generation targeting weak areas",
		"Self-critique mechanism active and learning",
	}
	
	// Add insights based on success patterns
	successCount := 0
	for _, attempt := range history {
		if attempt.Success {
			successCount++
		}
	}
	
	if len(history) > 0 {
		successRate := float64(successCount) / float64(len(history))
		insights = append(insights, fmt.Sprintf("Success rate: %.0f%% across %d attempts", successRate*100, len(history)))
	}
	
	return insights
}

func (s *SEALEngine) identifySuccessfulPatterns(history []Attempt) []string {
	patterns := []string{}
	strategySuccess := make(map[string]int)
	strategyTotal := make(map[string]int)
	
	for _, attempt := range history {
		strategyTotal[attempt.Strategy.Type]++
		if attempt.Success {
			strategySuccess[attempt.Strategy.Type]++
		}
	}
	
	for strategy, successes := range strategySuccess {
		total := strategyTotal[strategy]
		if total > 0 && float64(successes)/float64(total) > 0.6 {
			patterns = append(patterns, strategy)
		}
	}
	
	return patterns
}

func (s *SEALEngine) calculateLearningConfidence(history []Attempt) float64 {
	if len(history) == 0 {
		return 0.5
	}
	
	// SEAL's confidence increases with the number of notes taken
	baseConfidence := 0.6
	noteBoost := float64(len(s.notesTaken)) * 0.02
	
	return baseConfidence + noteBoost
}

// SyntheticScenario represents a generated scenario for learning
type SyntheticScenario struct {
	ProblemType string  `json:"problem_type"`
	Description string  `json:"description"`
	Confidence  float64 `json:"confidence"`
	Variables   map[string]interface{} `json:"variables"`
}

// SEAL-specific methods for SyntheticDataGenerator
func (sg *SyntheticDataGenerator) CreateTargetedScenarios(weaknesses []string) []SyntheticScenario {
	scenarios := []SyntheticScenario{}
	
	for _, weakness := range weaknesses {
		for _, template := range sg.patterns {
			if template.Name == weakness+"_scenario" {
				scenario := SyntheticScenario{
					ProblemType: weakness,
					Description: template.Template,
					Confidence:  template.Difficulty,
					Variables:   map[string]interface{}{},
				}
				scenarios = append(scenarios, scenario)
			}
		}
	}
	
	return scenarios
}

// SEAL-specific methods for SelfCritiqueModule  
func (sc *SelfCritiqueModule) AnalyzeFailures(history []Attempt) []string {
	weaknesses := []string{}
	
	// Analyze failed attempts to identify patterns
	failedStrategies := make(map[string]int)
	for _, attempt := range history {
		if !attempt.Success {
			failedStrategies[attempt.Strategy.Type]++
		}
	}
	
	// Identify strategies that fail frequently
	for strategy, failures := range failedStrategies {
		if failures > 2 { // If a strategy failed more than twice
			weaknesses = append(weaknesses, strategy)
		}
	}
	
	return weaknesses
}