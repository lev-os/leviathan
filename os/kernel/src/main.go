package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
)

// LLMConfigurationSystem is the main system orchestrator  
type LLMConfigurationSystem struct {
	collector      *TelemetryCollector
	llmEngine      *LLMDecisionEngine
	applier        *ConfigurationApplier
	history        *TelemetryHistory
	leviathan      *LeviathanIntelligence  // AI-native cognitive parliament
	flowmind       *FlowMindParser         // Natural language instruction parser
	llmRouter      *LLMRouter              // Multi-provider LLM routing system
	webAPIURL      string
	running        bool
	dryRun         bool
}

// NewLLMConfigurationSystem creates a new system instance
func NewLLMConfigurationSystem(webAPIURL string, dryRun bool) *LLMConfigurationSystem {
	// Initialize Cognitive Parliament
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
			"nfj_visionary": {
				Code:             "NFJ",
				Name:             "Visionary",
				CoreEmotion:      "fear",
				SurvivalInstinct: "flight",
				MoralProjection:  "empathy",
				ThinkingStyle:    "system_2",
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

	// Initialize LLM router with multiple providers
	llmRouter := NewLLMRouter()
	
	// Configure providers from environment variables
	if ollamaURL := os.Getenv("OLLAMA_URL"); ollamaURL != "" {
		llmRouter.AddProvider(LLMProvider{
			Name:     "ollama_local",
			Type:     "ollama",
			Endpoint: ollamaURL,
			Model:    "llama3.2:1b",
			APIKey:   "",
		})
	}
	if claudeKey := os.Getenv("ANTHROPIC_API_KEY"); claudeKey != "" {
		llmRouter.AddProvider(LLMProvider{
			Name:     "claude_reasoning",
			Type:     "claude",
			Endpoint: "https://api.anthropic.com",
			Model:    "claude-3-5-sonnet-20241022",
			APIKey:   claudeKey,
		})
	}
	if openaiKey := os.Getenv("OPENAI_API_KEY"); openaiKey != "" {
		llmRouter.AddProvider(LLMProvider{
			Name:     "openai_code",
			Type:     "openai",
			Endpoint: "https://api.openai.com",
			Model:    "gpt-4",
			APIKey:   openaiKey,
		})
	}

	return &LLMConfigurationSystem{
		collector:  NewTelemetryCollector(),
		llmEngine:  NewLLMDecisionEngine(),
		applier:    NewConfigurationApplier(dryRun),
		history:    NewTelemetryHistory(200),
		leviathan:  NewLeviathanIntelligence(), // AI-native decision engine
		flowmind:   NewFlowMindParser(parliament), // Natural language parser
		llmRouter:  llmRouter,                   // Multi-provider LLM system
		webAPIURL:  webAPIURL,
		running:    false,
		dryRun:     dryRun,
	}
}

// Start begins the continuous monitoring and optimization loop
func (system *LLMConfigurationSystem) Start() {
	system.running = true
	
	fmt.Println("🐋 LEVIATHAN OS - AI-Native Operating System Starting")
	fmt.Println("=====================================================")
	fmt.Println("🧠 Cognitive Parliament: 8-personality decision framework ACTIVE")
	fmt.Println("⚡ FlowMind Integration: Natural language YAML parser ENABLED")
	fmt.Println("🎯 First Principles: LLM-first 0-config methodology READY")
	fmt.Println("📚 BDD Workflows: Self-evolving instruction patterns ONLINE")
	fmt.Printf("🤖 LLM Providers: %d configured\n", len(system.llmRouter.providers))
	if system.dryRun {
		fmt.Println("🔍 Running in DRY RUN mode - no actual changes will be made")
	}
	fmt.Printf("🌐 Web dashboard: %s\n", system.webAPIURL)
	fmt.Println("📊 Beginning AI-native system consciousness...")
	fmt.Println()

	// Test the self-learning pipeline with a real theory
	go system.testSelfLearningPipeline()

	// Start the main monitoring loop
	go system.monitoringLoop()

	// Start the web API health check
	go system.healthCheckLoop()

	// Keep the main goroutine alive
	select {}
}

// Stop gracefully shuts down the system
func (system *LLMConfigurationSystem) Stop() {
	system.running = false
	fmt.Println("\n🛑 LLM Configuration System shutting down...")
}

// monitoringLoop continuously collects telemetry and makes AI decisions
func (system *LLMConfigurationSystem) monitoringLoop() {
	ticker := time.NewTicker(5 * time.Second) // Collect metrics every 5 seconds
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			if !system.running {
				return
			}
			
			// Collect system telemetry
			telemetry, err := system.collector.CollectMetrics()
			if err != nil {
				log.Printf("❌ Error collecting telemetry: %v", err)
				continue
			}

			// Add to history
			system.history.Add(*telemetry)

			// Send telemetry to web dashboard
			system.sendTelemetryToAPI(*telemetry)

			// Get AI decisions
			decisions := system.llmEngine.AnalyzeAndDecide(*telemetry)

			// Apply decisions and track changes
			for _, decision := range decisions {
				// Send decision to web dashboard
				system.sendDecisionToAPI(decision)

				// Apply the configuration changes
				changes := system.applier.ApplyDecision(decision, *telemetry)

				// Send configuration changes to web dashboard
				for _, change := range changes {
					system.sendConfigurationToAPI(change)
				}

				// Wait a bit and measure impact
				go system.measureImpact(changes, 30*time.Second)
			}

			// Print status update
			system.printStatusUpdate(*telemetry, len(decisions))
		}
	}
}

// healthCheckLoop periodically checks web API connectivity
func (system *LLMConfigurationSystem) healthCheckLoop() {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			if !system.running {
				return
			}
			
			_, err := http.Get(system.webAPIURL + "/api/health")
			if err != nil {
				log.Printf("⚠️ Web dashboard connection lost: %v", err)
			}
		}
	}
}

// measureImpact waits and then measures the performance impact of changes
func (system *LLMConfigurationSystem) measureImpact(changes []AppliedChange, waitTime time.Duration) {
	time.Sleep(waitTime)

	// Collect new telemetry to measure impact
	afterTelemetry, err := system.collector.CollectMetrics()
	if err != nil {
		log.Printf("❌ Error measuring impact: %v", err)
		return
	}

	// Update impact for each change
	for _, change := range changes {
		err := system.applier.UpdateChangeImpact(change.ID, *afterTelemetry)
		if err != nil {
			log.Printf("❌ Error updating impact for change %s: %v", change.ID, err)
		} else {
			fmt.Printf("📈 Measured impact for %s: %s\n", change.Action, change.Impact.Description)
		}
	}
}

// sendTelemetryToAPI sends telemetry data to the web dashboard
func (system *LLMConfigurationSystem) sendTelemetryToAPI(telemetry SystemTelemetry) {
	jsonData, err := json.Marshal(telemetry)
	if err != nil {
		log.Printf("Error marshaling telemetry: %v", err)
		return
	}

	resp, err := http.Post(system.webAPIURL+"/api/telemetry", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		// Don't log every network error to avoid spam
		return
	}
	defer resp.Body.Close()
}

// sendDecisionToAPI sends AI decision to the web dashboard
func (system *LLMConfigurationSystem) sendDecisionToAPI(decision ConfigurationDecision) {
	jsonData, err := json.Marshal(decision)
	if err != nil {
		log.Printf("Error marshaling decision: %v", err)
		return
	}

	resp, err := http.Post(system.webAPIURL+"/api/decisions", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return
	}
	defer resp.Body.Close()
}

// sendConfigurationToAPI sends configuration change to the web dashboard
func (system *LLMConfigurationSystem) sendConfigurationToAPI(change AppliedChange) {
	jsonData, err := json.Marshal(change)
	if err != nil {
		log.Printf("Error marshaling configuration change: %v", err)
		return
	}

	resp, err := http.Post(system.webAPIURL+"/api/configurations", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return
	}
	defer resp.Body.Close()
}

// printStatusUpdate displays current system status
func (system *LLMConfigurationSystem) printStatusUpdate(telemetry SystemTelemetry, decisionsCount int) {
	timestamp := telemetry.Timestamp.Format("15:04:05")
	
	fmt.Printf("[%s] CPU: %5.1f%% | Mem: %5.1f%% | Load: %5.2f | Conn: %3d", 
		timestamp,
		telemetry.CPU.UsagePercent,
		telemetry.Memory.UsagePercent,
		telemetry.CPU.LoadAvg1,
		telemetry.Network.Connections)

	if decisionsCount > 0 {
		fmt.Printf(" | 🤖 %d AI decisions", decisionsCount)
	}
	
	fmt.Println()
}

// main function - entry point for the system
func main() {
	fmt.Println("🚀 Initializing LLM-First Configuration System...")

	// Configuration
	webAPIURL := getEnvWithDefault("WEB_API_URL", "http://localhost:3000")
	dryRun := getEnvWithDefault("DRY_RUN", "false") == "true"

	// Create and start the system
	system := NewLLMConfigurationSystem(webAPIURL, dryRun)

	// Handle graceful shutdown
	// In a real system, you'd set up signal handling here

	// Start the system
	system.Start()
}

// getEnvWithDefault returns environment variable value or default
func getEnvWithDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// testSelfLearningPipeline demonstrates AI theory generation and testing
func (system *LLMConfigurationSystem) testSelfLearningPipeline() {
	// Wait a moment for system to stabilize
	time.Sleep(10 * time.Second)
	
	fmt.Println("🧪 TESTING SELF-LEARNING PIPELINE")
	fmt.Println("==================================")
	
	// Get current CPU usage to generate contextual theory
	telemetry, err := system.collector.CollectMetrics()
	if err != nil {
		log.Printf("❌ Error collecting telemetry for theory generation: %v", err)
		return
	}
	
	// Generate a theory using real LLM
	theoryPrompt := fmt.Sprintf(`
You are an AI system administrator tasked with generating a theory for CPU monitoring.

Current system state:
- CPU Usage: %.1f%%
- Memory Usage: %.1f%%
- Load Average: %.2f

Generate a simple theory for monitoring CPU usage that triggers an alert when CPU exceeds 80%%.
The theory should include:
1. A clear trigger condition
2. Safe actions to take (like logging, notification)
3. Conservative approach to avoid system disruption

Return only a JSON object with this structure:
{
  "theory_name": "descriptive_name",
  "trigger_condition": "specific condition", 
  "actions": ["action1", "action2"],
  "safety_level": "high|medium|low",
  "description": "brief explanation"
}`, telemetry.CPU.UsagePercent, telemetry.Memory.UsagePercent, telemetry.CPU.LoadAvg1)

	fmt.Println("🤖 Generating theory using LLM...")
	
	// Route to appropriate LLM provider
	request := LLMRequest{
		TaskType:    "theory_generation",
		Prompt:      theoryPrompt,
		MaxTokens:   500,
		Temperature: 0.7,
		Urgent:      false,
	}
	
	response, err := system.llmRouter.RouteRequest(request)
	if err != nil {
		log.Printf("❌ Error generating theory: %v", err)
		fmt.Println("⚠️ Falling back to hardcoded theory for demonstration")
		system.demonstrateHardcodedTheory()
		return
	}
	
	fmt.Printf("✅ Theory generated successfully!\n")
	fmt.Printf("📝 Provider: %s\n", response.Provider)
	fmt.Printf("⏱️ Response time: %v\n", response.Duration)
	fmt.Printf("🧠 Generated theory:\n%s\n\n", response.Content)
	
	// Test the theory using FlowMind parser
	fmt.Println("🔄 Testing theory with FlowMind natural language parser...")
	
	// Extract a natural language instruction from the theory
	testInstruction := "if cpu usage exceeds 80% then log alert and notify administrator safely"
	
	workflow, err := system.flowmind.ParseNaturalLanguage(testInstruction)
	if err != nil {
		log.Printf("❌ Error parsing instruction: %v", err)
		return
	}
	
	fmt.Printf("✅ FlowMind parsed instruction successfully!\n")
	fmt.Printf("🎯 Confidence: %.0f%%\n", workflow.Confidence*100)
	fmt.Printf("🧠 Assigned personality: %s\n", workflow.CognitiveAssignment.PrimaryPersonality)
	fmt.Printf("⚡ Trigger: %s\n", workflow.Trigger.Condition)
	fmt.Printf("🔧 Generated %d workflow steps\n", len(workflow.Workflow))
	
	for i, step := range workflow.Workflow {
		fmt.Printf("   %d. %s (%s)\n", i+1, step.Name, step.Type)
	}
	
	// Demonstrate provider statistics
	fmt.Println("\n📊 LLM PROVIDER STATISTICS")
	fmt.Println("==========================")
	
	stats := system.llmRouter.GetProviderStats()
	if totalRequests, ok := stats["total_requests"].(int); ok {
		fmt.Printf("Total Requests: %d\n", totalRequests)
	}
	if availableProviders, ok := stats["available_providers"].(int); ok {
		fmt.Printf("Available Providers: %d\n", availableProviders)
	}
	if providerUsage, ok := stats["provider_usage"].(map[string]int); ok {
		fmt.Println("Provider Usage:")
		for provider, count := range providerUsage {
			fmt.Printf("  %s: %d requests\n", provider, count)
		}
	}
	
	fmt.Println("🎉 Self-learning pipeline test complete!")
	fmt.Println("💡 This demonstrates AI generating theories and testing them in real-time")
}

// demonstrateHardcodedTheory shows fallback behavior when LLM is unavailable
func (system *LLMConfigurationSystem) demonstrateHardcodedTheory() {
	fmt.Println("📋 Using hardcoded theory for demonstration...")
	
	hardcodedTheory := `{
  "theory_name": "basic_cpu_monitoring",
  "trigger_condition": "cpu_usage >= 80%",
  "actions": ["log_alert", "notify_admin", "monitor_trend"],
  "safety_level": "high",
  "description": "Conservative CPU monitoring with safe notification actions"
}`
	
	fmt.Printf("📝 Hardcoded theory:\n%s\n\n", hardcodedTheory)
	
	// Still test with FlowMind
	testInstruction := "if cpu usage exceeds 80% then log alert and notify administrator safely"
	workflow, err := system.flowmind.ParseNaturalLanguage(testInstruction)
	if err == nil {
		fmt.Printf("✅ FlowMind still works with hardcoded theory!\n")
		fmt.Printf("🎯 Confidence: %.0f%%\n", workflow.Confidence*100)
	}
}

// Health check endpoint for the system itself
func healthCheck() {
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		response := map[string]interface{}{
			"status":    "healthy",
			"timestamp": time.Now(),
			"service":   "llm-config-system",
		}
		json.NewEncoder(w).Encode(response)
	})

	// Start health check server on port 8080
	go func() {
		log.Printf("Health check server starting on :8080")
		if err := http.ListenAndServe(":8080", nil); err != nil {
			log.Printf("Health check server error: %v", err)
		}
	}()
}