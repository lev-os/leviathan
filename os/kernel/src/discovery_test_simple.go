package main

import (
	"context"
	"fmt"
	"time"
)

// Simple test to validate our discovery engine interfaces
func TestDiscoveryEngineInterface() {
	fmt.Println("🧪 Testing Discovery Engine Interface...")

	// Test SEAL Engine
	sealEngine := NewSEALEngine()
	testEngine("SEAL", sealEngine)

	// Test JEPA Engine  
	jepaEngine := NewJEPAEngine()
	testEngine("JEPA", jepaEngine)

	// Test Engine Manager
	manager := NewDiscoveryEngineManager()
	manager.RegisterEngine("seal", sealEngine)
	manager.RegisterEngine("jepa", jepaEngine)

	problem := Problem{
		Type:    "memory_leak_pattern",
		Context: "Memory usage increasing 5MB/min",
	}

	selectedEngine := manager.SelectEngine(problem)
	fmt.Printf("✅ Manager selected engine for %s\n", problem.Type)
	fmt.Printf("   Engine confidence: %.2f\n", selectedEngine.GetConfidence(problem))

	fmt.Println("🎯 Discovery Engine Interface Test Complete!")
}

func testEngine(name string, engine DiscoveryEngine) {
	fmt.Printf("\n🔧 Testing %s Engine:\n", name)

	// Test capabilities
	caps := engine.GetCapabilities()
	fmt.Printf("   Supported problems: %v\n", caps.SupportedProblemTypes)

	// Test confidence
	problem := Problem{Type: "memory_leak_pattern"}
	confidence := engine.GetConfidence(problem)
	fmt.Printf("   Confidence for memory_leak_pattern: %.2f\n", confidence)

	// Test attempt
	ctx := context.Background()
	attempt, err := engine.Attempt(ctx, problem)
	if err != nil {
		fmt.Printf("   ❌ Attempt failed: %v\n", err)
		return
	}
	fmt.Printf("   ✅ Attempt successful: %s\n", attempt.ID)

	// Test outcome logging
	outcome := Outcome{
		Success: attempt.Success,
		Result:  "Test result",
		Metrics: map[string]float64{"confidence": 0.8},
	}
	err = engine.LogOutcome(attempt, outcome)
	if err != nil {
		fmt.Printf("   ❌ LogOutcome failed: %v\n", err)
		return
	}
	fmt.Printf("   ✅ Outcome logged successfully\n")

	// Test learning
	history := []Attempt{*attempt}
	learning, err := engine.Learn(history)
	if err != nil {
		fmt.Printf("   ❌ Learning failed: %v\n", err)
		return
	}
	fmt.Printf("   ✅ Learning extracted: %d insights\n", len(learning.Insights))

	// Test optimization
	strategy, err := engine.Optimize(learning)
	if err != nil {
		fmt.Printf("   ❌ Optimization failed: %v\n", err)
		return
	}
	fmt.Printf("   ✅ Strategy optimized: %s (confidence: %.2f)\n", strategy.Type, strategy.Confidence)
}

func main() {
	TestDiscoveryEngineInterface()
}