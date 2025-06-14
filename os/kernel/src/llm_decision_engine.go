package main

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"
)

// ConfigurationDecision represents an AI-generated system optimization
type ConfigurationDecision struct {
	Timestamp   time.Time              `json:"timestamp"`
	Reasoning   string                 `json:"reasoning"`
	Priority    DecisionPriority       `json:"priority"`
	Category    DecisionCategory       `json:"category"`
	Actions     []ConfigurationAction  `json:"actions"`
	Confidence  float64               `json:"confidence"`
	ExpectedImpact string             `json:"expected_impact"`
}

type DecisionPriority string
const (
	PriorityCritical DecisionPriority = "critical"
	PriorityHigh     DecisionPriority = "high"
	PriorityMedium   DecisionPriority = "medium"
	PriorityLow      DecisionPriority = "low"
)

type DecisionCategory string
const (
	CategoryMemory    DecisionCategory = "memory"
	CategoryCPU       DecisionCategory = "cpu"
	CategoryNetwork   DecisionCategory = "network"
	CategoryDisk      DecisionCategory = "disk"
	CategoryProcess   DecisionCategory = "process"
	CategorySecurity  DecisionCategory = "security"
)

type ConfigurationAction struct {
	Type        ActionType `json:"type"`
	Target      string     `json:"target"`
	Parameters  map[string]interface{} `json:"parameters"`
	Description string     `json:"description"`
	Reversible  bool       `json:"reversible"`
}

type ActionType string
const (
	ActionKillProcess       ActionType = "kill_process"
	ActionAdjustPriority    ActionType = "adjust_priority"
	ActionSetMemoryLimit    ActionType = "set_memory_limit"
	ActionClearCache        ActionType = "clear_cache"
	ActionAdjustSwappiness  ActionType = "adjust_swappiness"
	ActionOptimizeNetwork   ActionType = "optimize_network"
	ActionCompactMemory     ActionType = "compact_memory"
	ActionSuspendProcess    ActionType = "suspend_process"
)

// LLMDecisionEngine simulates TinyLlama decision making
// In production, this would interface with an actual LLM
type LLMDecisionEngine struct {
	knowledgeBase map[string]DecisionTemplate
	historyWindow []SystemTelemetry
	lastDecisions []ConfigurationDecision
}

type DecisionTemplate struct {
	Condition   func(SystemTelemetry) bool
	Priority    DecisionPriority
	Category    DecisionCategory
	Reasoning   string
	Actions     []ConfigurationAction
	Confidence  float64
}

// NewLLMDecisionEngine creates a new AI decision engine
func NewLLMDecisionEngine() *LLMDecisionEngine {
	engine := &LLMDecisionEngine{
		knowledgeBase: make(map[string]DecisionTemplate),
		historyWindow: make([]SystemTelemetry, 0, 10),
		lastDecisions: make([]ConfigurationDecision, 0, 50),
	}
	
	engine.initializeKnowledgeBase()
	return engine
}

// initializeKnowledgeBase sets up the AI's decision-making rules
func (llm *LLMDecisionEngine) initializeKnowledgeBase() {
	// Critical memory pressure
	llm.knowledgeBase["critical_memory"] = DecisionTemplate{
		Condition: func(t SystemTelemetry) bool {
			return t.Memory.UsagePercent > 95.0
		},
		Priority:   PriorityCritical,
		Category:   CategoryMemory,
		Reasoning:  "Memory usage critically high at %.1f%%. System at risk of thrashing or OOM kills. Immediate intervention required.",
		Confidence: 0.95,
		Actions: []ConfigurationAction{
			{
				Type:        ActionClearCache,
				Target:      "system",
				Parameters:  map[string]interface{}{"force": true},
				Description: "Clear system caches to free memory",
				Reversible:  false,
			},
			{
				Type:        ActionCompactMemory,
				Target:      "kernel",
				Parameters:  map[string]interface{}{"aggressive": true},
				Description: "Trigger memory compaction to reclaim fragmented pages",
				Reversible:  false,
			},
		},
	}

	// High CPU load
	llm.knowledgeBase["high_cpu_load"] = DecisionTemplate{
		Condition: func(t SystemTelemetry) bool {
			return t.CPU.LoadAvg1 > float64(t.CPU.Cores)*0.8
		},
		Priority:   PriorityHigh,
		Category:   CategoryCPU,
		Reasoning:  "CPU load average %.2f exceeds 80%% of core capacity (%d cores). System responsiveness degraded.",
		Confidence: 0.85,
		Actions: []ConfigurationAction{
			{
				Type:        ActionAdjustPriority,
				Target:      "background_processes",
				Parameters:  map[string]interface{}{"nice_level": 10},
				Description: "Lower priority of non-critical background processes",
				Reversible:  true,
			},
		},
	}

	// Memory trending upward
	llm.knowledgeBase["memory_trend_up"] = DecisionTemplate{
		Condition: func(t SystemTelemetry) bool {
			return t.Memory.UsagePercent > 80.0 && llm.getMemoryTrend() > 2.0
		},
		Priority:   PriorityMedium,
		Category:   CategoryMemory,
		Reasoning:  "Memory usage at %.1f%% with upward trend. Proactive optimization recommended.",
		Confidence: 0.75,
		Actions: []ConfigurationAction{
			{
				Type:        ActionClearCache,
				Target:      "applications",
				Parameters:  map[string]interface{}{"gentle": true},
				Description: "Clear application caches before memory becomes critical",
				Reversible:  false,
			},
		},
	}

	// Network connection surge
	llm.knowledgeBase["network_connections"] = DecisionTemplate{
		Condition: func(t SystemTelemetry) bool {
			return t.Network.Connections > 100
		},
		Priority:   PriorityMedium,
		Category:   CategoryNetwork,
		Reasoning:  "High number of network connections (%d). May indicate DDoS or connection leak.",
		Confidence: 0.70,
		Actions: []ConfigurationAction{
			{
				Type:        ActionOptimizeNetwork,
				Target:      "tcp_settings",
				Parameters:  map[string]interface{}{"tcp_fin_timeout": 30, "tcp_keepalive_time": 600},
				Description: "Optimize TCP settings to handle connection load",
				Reversible:  true,
			},
		},
	}

	// Process count explosion
	llm.knowledgeBase["too_many_processes"] = DecisionTemplate{
		Condition: func(t SystemTelemetry) bool {
			return t.LoadAverage.ProcessCount > 1500
		},
		Priority:   PriorityHigh,
		Category:   CategoryProcess,
		Reasoning:  "Excessive process count (%d). System may be under fork bomb attack or process leak.",
		Confidence: 0.80,
		Actions: []ConfigurationAction{
			{
				Type:        ActionSetMemoryLimit,
				Target:      "user_processes",
				Parameters:  map[string]interface{}{"max_processes": 1000},
				Description: "Limit maximum processes per user to prevent system overload",
				Reversible:  true,
			},
		},
	}
}

// AnalyzeAndDecide takes telemetry and returns optimization decisions
func (llm *LLMDecisionEngine) AnalyzeAndDecide(telemetry SystemTelemetry) []ConfigurationDecision {
	// Add to history window
	llm.historyWindow = append(llm.historyWindow, telemetry)
	if len(llm.historyWindow) > 10 {
		llm.historyWindow = llm.historyWindow[1:]
	}

	decisions := make([]ConfigurationDecision, 0)

	// Evaluate each knowledge base rule
	for _, template := range llm.knowledgeBase {
		if template.Condition(telemetry) {
			// Skip if we made this decision recently
			if llm.wasDecisionRecentlyMade(template.Category, template.Priority) {
				continue
			}

			decision := ConfigurationDecision{
				Timestamp:      time.Now(),
				Priority:       template.Priority,
				Category:       template.Category,
				Actions:        template.Actions,
				Confidence:     template.Confidence,
			}

			// Format reasoning with telemetry data
			decision.Reasoning = llm.formatReasoning(template.Reasoning, telemetry)
			decision.ExpectedImpact = llm.calculateExpectedImpact(template, telemetry)

			decisions = append(decisions, decision)
			
			// Log this decision
			llm.lastDecisions = append(llm.lastDecisions, decision)
			if len(llm.lastDecisions) > 50 {
				llm.lastDecisions = llm.lastDecisions[1:]
			}

			fmt.Printf("\n🤖 AI DECISION [%s]: %s\n", strings.ToUpper(string(template.Category)), decision.Reasoning)
			fmt.Printf("   Priority: %s | Confidence: %.0f%%\n", template.Priority, template.Confidence*100)
			for i, action := range decision.Actions {
				fmt.Printf("   Action %d: %s\n", i+1, action.Description)
			}
		}
	}

	return decisions
}

// formatReasoning fills in reasoning template with actual telemetry values
func (llm *LLMDecisionEngine) formatReasoning(template string, telemetry SystemTelemetry) string {
	reasoning := template

	// Replace common placeholders
	reasoning = strings.ReplaceAll(reasoning, "%.1f%%", fmt.Sprintf("%.1f%%", telemetry.Memory.UsagePercent))
	reasoning = strings.ReplaceAll(reasoning, "%.2f", fmt.Sprintf("%.2f", telemetry.CPU.LoadAvg1))
	reasoning = strings.ReplaceAll(reasoning, "%d cores", fmt.Sprintf("%d cores", telemetry.CPU.Cores))
	reasoning = strings.ReplaceAll(reasoning, "(%d)", fmt.Sprintf("(%d)", telemetry.Network.Connections))
	reasoning = strings.ReplaceAll(reasoning, "(%d)", fmt.Sprintf("(%d)", telemetry.LoadAverage.ProcessCount))

	return reasoning
}

// calculateExpectedImpact estimates the benefit of applying the decision
func (llm *LLMDecisionEngine) calculateExpectedImpact(template DecisionTemplate, telemetry SystemTelemetry) string {
	switch template.Category {
	case CategoryMemory:
		if telemetry.Memory.UsagePercent > 95 {
			return "Should free 5-15% memory, prevent OOM conditions"
		}
		return "Should free 2-8% memory, improve responsiveness"
	case CategoryCPU:
		return "Should reduce load average by 0.5-1.5, improve system responsiveness"
	case CategoryNetwork:
		return "Should reduce connection overhead, improve network throughput"
	case CategoryProcess:
		return "Should prevent system overload, maintain stability"
	default:
		return "Should improve overall system performance"
	}
}

// wasDecisionRecentlyMade checks if similar decision was made recently
func (llm *LLMDecisionEngine) wasDecisionRecentlyMade(category DecisionCategory, priority DecisionPriority) bool {
	cutoff := time.Now().Add(-5 * time.Minute) // Don't repeat decisions within 5 minutes
	
	for _, decision := range llm.lastDecisions {
		if decision.Timestamp.After(cutoff) && 
		   decision.Category == category && 
		   decision.Priority == priority {
			return true
		}
	}
	return false
}

// getMemoryTrend calculates memory usage trend from history
func (llm *LLMDecisionEngine) getMemoryTrend() float64 {
	if len(llm.historyWindow) < 3 {
		return 0.0
	}

	// Simple linear trend calculation
	recent := llm.historyWindow[len(llm.historyWindow)-1].Memory.UsagePercent
	older := llm.historyWindow[len(llm.historyWindow)-3].Memory.UsagePercent
	
	return recent - older
}

// GetDecisionSummary returns a human-readable summary of recent decisions
func (llm *LLMDecisionEngine) GetDecisionSummary() string {
	if len(llm.lastDecisions) == 0 {
		return "No recent AI decisions made."
	}

	summary := fmt.Sprintf("Recent AI Decisions (%d total):\n", len(llm.lastDecisions))
	
	// Group by category
	categoryCount := make(map[DecisionCategory]int)
	for _, decision := range llm.lastDecisions {
		categoryCount[decision.Category]++
	}

	for category, count := range categoryCount {
		summary += fmt.Sprintf("  %s: %d decisions\n", category, count)
	}

	// Show most recent decision
	recent := llm.lastDecisions[len(llm.lastDecisions)-1]
	summary += fmt.Sprintf("\nMost Recent: %s (%s priority)\n", recent.Reasoning, recent.Priority)
	summary += fmt.Sprintf("Actions: %d planned optimizations\n", len(recent.Actions))

	return summary
}

// ToJSON converts decision to JSON for logging/debugging
func (d *ConfigurationDecision) ToJSON() (string, error) {
	data, err := json.MarshalIndent(d, "", "  ")
	if err != nil {
		return "", err
	}
	return string(data), nil
}

// Demo removed - see demo_llm_system.go for full system test