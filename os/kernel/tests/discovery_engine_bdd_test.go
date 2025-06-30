package main

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

// BDD Test: Discovery Engine Core Behaviors
// Following Given/When/Then pattern for self-documenting specifications

func TestDiscoveryEngine_CanAttemptSolutions(t *testing.T) {
	// Given: A discovery engine and a problem to solve
	engine := NewMockDiscoveryEngine()
	problem := Problem{
		Type:        "memory_leak_pattern",
		Context:     "Memory usage increasing 5MB/min consistently",
		Constraints: []Constraint{{Type: "time_limit", Value: "5m"}},
		TimeLimit:   5 * time.Minute,
	}
	ctx := context.Background()

	// When: Engine attempts to solve the problem
	attempt, err := engine.Attempt(ctx, problem)

	// Then: Engine should return a valid attempt
	assert.NoError(t, err)
	assert.NotNil(t, attempt)
	assert.Equal(t, problem.Type, attempt.Problem.Type)
	assert.NotEmpty(t, attempt.ID)
	assert.NotZero(t, attempt.StartTime)
}

func TestDiscoveryEngine_CanLogOutcomes(t *testing.T) {
	// Given: A discovery engine and a completed attempt
	engine := NewMockDiscoveryEngine()
	attempt := &Attempt{
		ID:        "test_attempt_001",
		Problem:   Problem{Type: "cpu_spike_detection"},
		Success:   true,
		StartTime: time.Now(),
		EndTime:   time.Now().Add(1 * time.Minute),
	}
	outcome := Outcome{
		Success: true,
		Result:  "CPU spike pattern detected successfully",
		Metrics: map[string]float64{"confidence": 0.85},
	}

	// When: Engine logs the outcome
	err := engine.LogOutcome(attempt, outcome)

	// Then: Outcome should be stored successfully
	assert.NoError(t, err)
	
	// And: Engine should remember this outcome for learning
	history := engine.GetAttemptHistory()
	assert.Len(t, history, 1)
	assert.Equal(t, attempt.ID, history[0].ID)
}

func TestDiscoveryEngine_CanLearnFromHistory(t *testing.T) {
	// Given: A discovery engine with multiple attempt histories
	engine := NewMockDiscoveryEngine()
	
	// Create successful and failed attempts
	successfulAttempts := []Attempt{
		{ID: "success_1", Success: true, Strategy: Strategy{Type: "pattern_matching", Confidence: 0.8}},
		{ID: "success_2", Success: true, Strategy: Strategy{Type: "pattern_matching", Confidence: 0.9}},
	}
	failedAttempts := []Attempt{
		{ID: "failed_1", Success: false, Strategy: Strategy{Type: "random_search", Confidence: 0.3}},
		{ID: "failed_2", Success: false, Strategy: Strategy{Type: "random_search", Confidence: 0.2}},
	}
	
	allAttempts := append(successfulAttempts, failedAttempts...)

	// When: Engine learns from the history
	learning, err := engine.Learn(allAttempts)

	// Then: Engine should extract meaningful insights
	assert.NoError(t, err)
	assert.NotNil(t, learning)
	assert.NotEmpty(t, learning.Insights)
	
	// And: Should identify successful patterns
	assert.Contains(t, learning.Insights, "pattern_matching strategies more successful")
	
	// And: Should identify areas for improvement
	assert.Contains(t, learning.WeakAreas, "random_search")
}

func TestDiscoveryEngine_CanOptimizeStrategies(t *testing.T) {
	// Given: A discovery engine with learning insights
	engine := NewMockDiscoveryEngine()
	learning := &Learning{
		Insights: []string{
			"pattern_matching strategies show 90% success rate",
			"random_search strategies show 20% success rate",
		},
		SuccessfulPatterns: []string{"pattern_matching", "derivative_analysis"},
		WeakAreas:         []string{"random_search", "brute_force"},
		Confidence:        0.85,
	}

	// When: Engine optimizes based on learning
	strategy, err := engine.Optimize(learning)

	// Then: Engine should return an improved strategy
	assert.NoError(t, err)
	assert.NotNil(t, strategy)
	assert.Greater(t, strategy.Confidence, 0.8)
	
	// And: Should prefer successful patterns
	assert.Contains(t, strategy.PreferredMethods, "pattern_matching")
	
	// And: Should avoid weak areas
	assert.NotContains(t, strategy.PreferredMethods, "random_search")
}

func TestDiscoveryEngine_HasConfidenceForProblems(t *testing.T) {
	// Given: A discovery engine and different types of problems
	engine := NewMockDiscoveryEngine()
	
	familiarProblem := Problem{Type: "memory_leak_pattern"} // Engine has seen this before
	novelProblem := Problem{Type: "quantum_decoherence"}    // Engine has never seen this

	// When: Engine assesses confidence for each problem
	familiarConfidence := engine.GetConfidence(familiarProblem)
	novelConfidence := engine.GetConfidence(novelProblem)

	// Then: Should have higher confidence for familiar problems
	assert.Greater(t, familiarConfidence, 0.5)
	assert.Less(t, novelConfidence, familiarConfidence)
	
	// And: Confidence should be between 0 and 1
	assert.GreaterOrEqual(t, familiarConfidence, 0.0)
	assert.LessOrEqual(t, familiarConfidence, 1.0)
	assert.GreaterOrEqual(t, novelConfidence, 0.0)
	assert.LessOrEqual(t, novelConfidence, 1.0)
}

func TestDiscoveryEngine_FollowsTELOCycle(t *testing.T) {
	// Given: A discovery engine and a challenging problem
	engine := NewMockDiscoveryEngine()
	problem := Problem{
		Type:    "complex_system_optimization",
		Context: "Multi-variable optimization with constraints",
	}
	ctx := context.Background()

	// When: Running complete TELO cycle
	// TRIAL: Attempt solution
	attempt, err := engine.Attempt(ctx, problem)
	assert.NoError(t, err)

	// ERROR: Log outcome (simulate partial success)
	outcome := Outcome{
		Success:     false,
		PartialWins: []string{"identified bottleneck", "reduced latency 10%"},
		Lessons:     []string{"need more data", "constraint too tight"},
	}
	err = engine.LogOutcome(attempt, outcome)
	assert.NoError(t, err)

	// LEARN: Extract patterns from attempts
	history := []Attempt{*attempt}
	learning, err := engine.Learn(history)
	assert.NoError(t, err)

	// OPTIMIZE: Improve strategy
	newStrategy, err := engine.Optimize(learning)
	assert.NoError(t, err)

	// Then: New strategy should be different and potentially better
	assert.NotEqual(t, attempt.Strategy, newStrategy)
	assert.NotEmpty(t, newStrategy.Improvements)
}

func TestDiscoveryEngine_CanBeHotSwapped(t *testing.T) {
	// Given: A discovery engine manager with multiple engines
	manager := NewDiscoveryEngineManager()
	sealEngine := NewSEALEngine()
	jepaEngine := NewJEPAEngine()
	
	manager.RegisterEngine("seal", sealEngine)
	manager.RegisterEngine("jepa", jepaEngine)

	problem := Problem{Type: "temporal_pattern_prediction"}

	// When: Manager selects best engine for the problem
	selectedEngine := manager.SelectEngine(problem)

	// Then: Should select appropriate engine based on capabilities
	assert.NotNil(t, selectedEngine)
	
	// And: Should be able to switch engines at runtime
	manager.SetActiveEngine("seal")
	engine1 := manager.GetActiveEngine()
	
	manager.SetActiveEngine("jepa")
	engine2 := manager.GetActiveEngine()
	
	assert.NotEqual(t, engine1, engine2)
}

// Mock Implementation for Testing
type MockDiscoveryEngine struct {
	history         []Attempt
	capabilities    Capabilities
	confidenceMap   map[string]float64
}

func NewMockDiscoveryEngine() *MockDiscoveryEngine {
	return &MockDiscoveryEngine{
		history: []Attempt{},
		capabilities: Capabilities{
			SupportedProblemTypes: []string{"memory_leak_pattern", "cpu_spike_detection"},
			LearningMethods:      []string{"pattern_matching", "statistical_analysis"},
		},
		confidenceMap: map[string]float64{
			"memory_leak_pattern": 0.8,
			"cpu_spike_detection": 0.7,
			"quantum_decoherence": 0.1,
		},
	}
}

func (m *MockDiscoveryEngine) Attempt(ctx context.Context, problem Problem) (*Attempt, error) {
	attempt := &Attempt{
		ID:        generateID(),
		Problem:   problem,
		Strategy:  Strategy{Type: "pattern_matching", Confidence: 0.7},
		StartTime: time.Now(),
		EndTime:   time.Now().Add(1 * time.Second),
		Success:   true,
	}
	return attempt, nil
}

func (m *MockDiscoveryEngine) LogOutcome(attempt *Attempt, outcome Outcome) error {
	attempt.Success = outcome.Success
	m.history = append(m.history, *attempt)
	return nil
}

func (m *MockDiscoveryEngine) Learn(history []Attempt) (*Learning, error) {
	successRate := calculateSuccessRate(history)
	
	learning := &Learning{
		Insights: []string{
			"pattern_matching strategies more successful",
		},
		SuccessfulPatterns: []string{"pattern_matching"},
		WeakAreas:         []string{"random_search"},
		Confidence:        successRate,
	}
	
	return learning, nil
}

func (m *MockDiscoveryEngine) Optimize(learning *Learning) (*Strategy, error) {
	strategy := &Strategy{
		Type:             "optimized_pattern_matching",
		Confidence:       learning.Confidence + 0.1,
		PreferredMethods: learning.SuccessfulPatterns,
		Improvements:     []string{"focus on successful patterns", "avoid weak areas"},
	}
	
	return strategy, nil
}

func (m *MockDiscoveryEngine) GetConfidence(problem Problem) float64 {
	if confidence, exists := m.confidenceMap[problem.Type]; exists {
		return confidence
	}
	return 0.2 // Low confidence for unknown problems
}

func (m *MockDiscoveryEngine) GetCapabilities() Capabilities {
	return m.capabilities
}

func (m *MockDiscoveryEngine) GetAttemptHistory() []Attempt {
	return m.history
}

// Helper functions
func generateID() string {
	return "test_" + time.Now().Format("20060102150405")
}

func calculateSuccessRate(attempts []Attempt) float64 {
	if len(attempts) == 0 {
		return 0.0
	}
	
	successful := 0
	for _, attempt := range attempts {
		if attempt.Success {
			successful++
		}
	}
	
	return float64(successful) / float64(len(attempts))
}