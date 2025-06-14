package main

import (
	"fmt"
	"time"
)

// Standalone FlowMind demonstration program
func main() {
	fmt.Println("🧠 FLOWMIND BDD DEMONSTRATION")
	fmt.Println("==============================")
	fmt.Println("🐋 Leviathan OS - Natural Language to YAML Parser")
	fmt.Println("📚 BDD Workflow Showcase\n")

	// Initialize Cognitive Parliament for FlowMind
	parliament := &CognitiveParliament{
		personalities: map[string]PersonalityProfile{
			"sfj_caregiver": {
				Code:             "SFJ",
				Name:             "Caregiver",
				CoreEmotion:      "disgust",
				SurvivalInstinct: "freeze",
				MoralProjection:  "sympathy",
				ThinkingStyle:    "system_2",
				FeedbackType:     "negative",
			},
			"nfp_advocate": {
				Code:             "NFP",
				Name:             "Advocate",
				CoreEmotion:      "stress",
				SurvivalInstinct: "fight",
				MoralProjection:  "compassion",
				ThinkingStyle:    "system_1",
				FeedbackType:     "positive",
			},
			"ntj_strategist": {
				Code:             "NTJ",
				Name:             "Strategist",
				CoreEmotion:      "fear",
				SurvivalInstinct: "flight",
				MoralProjection:  "none",
				ThinkingStyle:    "system_2",
				FeedbackType:     "positive",
			},
		},
		verbosity: "medium",
		enabled:   true,
	}

	// Initialize FlowMind parser
	parser := NewFlowMindParser(parliament)

	// BDD Test Scenarios
	testScenarios := []struct {
		name        string
		instruction string
		description string
	}{
		{
			name:        "Emergency CPU Protection",
			instruction: "if cpu is 90% quickly resolve safely saving all open documents and call me",
			description: "Tests emergency response with document safety prioritization",
		},
		{
			name:        "Memory Optimization Intelligence",
			instruction: "when memory gets tight, be smart about it but don't break anything",
			description: "Tests ambiguous instruction handling and uncertainty detection",
		},
		{
			name:        "Network vs Process Balancing",
			instruction: "be aggressive about network optimization but gentle with user processes",
			description: "Tests dual-personality cognitive assignment",
		},
		{
			name:        "Financial Domain Recognition",
			instruction: "monitor bitcoin price and if it drops 10% quickly secure my trading positions",
			description: "Tests multi-domain parsing and external integration",
		},
		{
			name:        "Conflict Detection",
			instruction: "maximize CPU performance while minimizing CPU usage",
			description: "Tests logical contradiction detection",
		},
		{
			name:        "Kubernetes Domain Extension",
			instruction: "if my kubernetes cluster is unhealthy, scale down the frontend pods",
			description: "Tests domain-specific vocabulary learning",
		},
	}

	// Run each BDD scenario
	for i, scenario := range testScenarios {
		fmt.Printf("═══ SCENARIO %d: %s ═══\n", i+1, scenario.name)
		fmt.Printf("📝 Description: %s\n", scenario.description)
		fmt.Printf("💬 Instruction: \"%s\"\n\n", scenario.instruction)

		// Parse the natural language instruction
		start := time.Now()
		workflow, err := parser.ParseNaturalLanguage(scenario.instruction)
		duration := time.Since(start)

		if err != nil {
			fmt.Printf("❌ Error: %v\n", err)
			if workflow != nil && workflow.LearningMetadata.FeedbackRequested {
				fmt.Printf("💡 Clarification Needed: System detected conflicts or ambiguity\n")
			}
		} else {
			fmt.Printf("✅ Successfully parsed in %v\n", duration)
			fmt.Printf("🎯 Confidence: %.0f%%\n", workflow.Confidence*100)
			fmt.Printf("🧠 Primary Personality: %s\n", workflow.CognitiveAssignment.PrimaryPersonality)
			fmt.Printf("⚡ Trigger: %s (Urgency: %s)\n", workflow.Trigger.Condition, workflow.Trigger.Urgency)
			fmt.Printf("🔧 Workflow Steps: %d\n", len(workflow.Workflow))

			// Show workflow steps
			for j, step := range workflow.Workflow {
				fmt.Printf("   %d. %s (%s) - %d actions\n", j+1, step.Name, step.Type, len(step.Actions))
			}

			// Show uncertainty markers if any
			if len(workflow.LearningMetadata.UncertaintyMarkers) > 0 {
				fmt.Printf("🤔 Uncertainty Markers: %v\n", workflow.LearningMetadata.UncertaintyMarkers)
			}

			// Show new vocabulary learned
			if len(workflow.LearningMetadata.NewVocabulary) > 0 {
				fmt.Printf("📚 New Vocabulary: %v\n", workflow.LearningMetadata.NewVocabulary)
			}

			// Generate and show YAML excerpt
			yaml, yamlErr := workflow.ToYAML()
			if yamlErr == nil {
				fmt.Printf("📄 Generated YAML (excerpt):\n")
				lines := splitLines(yaml, 8) // Show first 8 lines
				for _, line := range lines {
					fmt.Printf("   %s\n", line)
				}
				if len(splitLines(yaml, -1)) > 8 {
					fmt.Printf("   ... (truncated)\n")
				}
			}
		}

		fmt.Printf("\n")
	}

	// Show pattern learning evolution
	fmt.Printf("═══ FLOWMIND LEARNING SUMMARY ═══\n")
	fmt.Printf("📊 Pattern Library: %d learned patterns\n", len(parser.patternLibrary))
	fmt.Printf("📚 Vocabulary: %d learned terms\n", len(parser.learnedVocabulary))
	fmt.Printf("🕒 Execution History: %d parsed workflows\n", len(parser.executionHistory))
	
	// Show pattern statistics
	for patternName, pattern := range parser.patternLibrary {
		fmt.Printf("   • %s: %.0f%% confidence, used %d times\n", 
			patternName, pattern.Confidence*100, pattern.UsageCount)
	}

	fmt.Printf("\n🎯 FlowMind demonstrates LLM-first 0-config try-as-you-go methodology\n")
	fmt.Printf("✨ Self-evolving BDD patterns with cognitive parliament reasoning\n")
	fmt.Printf("🚀 Ready for integration with containerized Leviathan OS!\n")
}

// Helper function to split YAML into lines for display
func splitLines(text string, maxLines int) []string {
	lines := []string{}
	current := ""
	
	for _, char := range text {
		if char == '\n' {
			lines = append(lines, current)
			current = ""
			if maxLines > 0 && len(lines) >= maxLines {
				break
			}
		} else {
			current += string(char)
		}
	}
	
	if current != "" && (maxLines < 0 || len(lines) < maxLines) {
		lines = append(lines, current)
	}
	
	return lines
}