package main

import (
	"fmt"
	"strings"
	"time"
)

// LeviathanIntelligence integrates FlowMind patterns into system decisions
type LeviathanIntelligence struct {
	cognitiveParliament *CognitiveParliament
	decisionHistory     []IntelligentDecision
	currentPersonality  string
	entropyLevel        float64
}

// CognitiveParliament represents the 8-personality decision framework
type CognitiveParliament struct {
	personalities map[string]PersonalityProfile
	verbosity     string // "off", "silent", "medium", "verbose"
	enabled       bool
}

// PersonalityProfile represents EEPS personality mapping
type PersonalityProfile struct {
	Code             string  `json:"code"`
	Name             string  `json:"name"`
	CoreEmotion      string  `json:"core_emotion"`
	SurvivalInstinct string  `json:"survival_instinct"`
	MoralProjection  string  `json:"moral_projection"`
	IGTStrategy      string  `json:"igt_strategy"`
	Neurotransmitter string  `json:"neurotransmitter"`
	ThinkingStyle    string  `json:"thinking_style"`
	FeedbackType     string  `json:"feedback_type"`
}

// IntelligentDecision represents AI decision with personality analysis
type IntelligentDecision struct {
	Timestamp           time.Time                    `json:"timestamp"`
	SystemContext       SystemTelemetry              `json:"system_context"`
	TriggerCondition    string                       `json:"trigger_condition"`
	PersonalityAnalysis map[string]string            `json:"personality_analysis"`
	ConflictResolution  string                       `json:"conflict_resolution"`
	EntropyWeighting    float64                      `json:"entropy_weighting"`
	FinalDecision       string                       `json:"final_decision"`
	ConfidenceLevel     float64                      `json:"confidence_level"`
	Actions             []ConfigurationAction        `json:"actions"`
	Reasoning           string                       `json:"reasoning"`
}

// NewLeviathanIntelligence creates the AI-native decision engine
func NewLeviathanIntelligence() *LeviathanIntelligence {
	personalities := map[string]PersonalityProfile{
		"sfj_caregiver": {
			Code:             "SFJ",
			Name:             "Caregiver",
			CoreEmotion:      "disgust",
			SurvivalInstinct: "freeze",
			MoralProjection:  "sympathy",
			IGTStrategy:      "win_win",
			Neurotransmitter: "serotonin",
			ThinkingStyle:    "system_2",
			FeedbackType:     "negative",
		},
		"nfp_advocate": {
			Code:             "NFP",
			Name:             "Advocate",
			CoreEmotion:      "stress",
			SurvivalInstinct: "fight",
			MoralProjection:  "compassion",
			IGTStrategy:      "win_lose",
			Neurotransmitter: "adrenaline",
			ThinkingStyle:    "system_1",
			FeedbackType:     "positive",
		},
		"nfj_visionary": {
			Code:             "NFJ",
			Name:             "Visionary",
			CoreEmotion:      "fear",
			SurvivalInstinct: "flight",
			MoralProjection:  "empathy",
			IGTStrategy:      "lose_lose",
			Neurotransmitter: "dopamine",
			ThinkingStyle:    "system_2",
			FeedbackType:     "positive",
		},
		"ntj_strategist": {
			Code:             "NTJ",
			Name:             "Strategist",
			CoreEmotion:      "fear",
			SurvivalInstinct: "flight",
			MoralProjection:  "none",
			IGTStrategy:      "lose_lose",
			Neurotransmitter: "dopamine",
			ThinkingStyle:    "system_2",
			FeedbackType:     "positive",
		},
	}

	parliament := &CognitiveParliament{
		personalities: personalities,
		verbosity:     "medium",
		enabled:       true,
	}

	return &LeviathanIntelligence{
		cognitiveParliament: parliament,
		decisionHistory:     make([]IntelligentDecision, 0),
		currentPersonality:  "ntj_strategist", // Default to strategic thinking
		entropyLevel:        0.5,
	}
}

// AnalyzeWithCognitiveParliament performs multi-personality analysis
func (li *LeviathanIntelligence) AnalyzeWithCognitiveParliament(telemetry SystemTelemetry) IntelligentDecision {
	if !li.cognitiveParliament.enabled {
		return li.fallbackAnalysis(telemetry)
	}

	// Calculate system entropy
	li.entropyLevel = li.calculateSystemEntropy(telemetry)
	
	// Gather perspectives from each personality
	personalityAnalysis := make(map[string]string)
	
	for code, personality := range li.cognitiveParliament.personalities {
		analysis := li.analyzeFromPersonality(telemetry, personality)
		personalityAnalysis[code] = analysis
	}
	
	// Synthesize decision based on entropy weighting
	decision := li.synthesizeDecision(telemetry, personalityAnalysis)
	
	// Store decision in history
	li.decisionHistory = append(li.decisionHistory, decision)
	if len(li.decisionHistory) > 100 {
		li.decisionHistory = li.decisionHistory[1:]
	}
	
	return decision
}

// analyzeFromPersonality analyzes situation from specific personality perspective
func (li *LeviathanIntelligence) analyzeFromPersonality(telemetry SystemTelemetry, personality PersonalityProfile) string {
	switch personality.Code {
	case "SFJ": // Caregiver - Focus on system stability and user impact
		if telemetry.CPU.UsagePercent > 80 {
			return "High CPU usage could impact user experience. Prioritize stability over performance."
		}
		return "System appears stable. Monitor for user impact indicators."
		
	case "NFP": // Advocate - Focus on innovation and adaptation
		if telemetry.Memory.UsagePercent > 70 {
			return "Memory pressure detected. Consider innovative memory management approaches."
		}
		return "System running normally. Look for optimization opportunities."
		
	case "NFJ": // Visionary - Focus on future implications
		loadTrend := telemetry.CPU.LoadAvg1 / float64(telemetry.CPU.Cores)
		if loadTrend > 0.8 {
			return "Rising load average suggests future bottlenecks. Proactive scaling needed."
		}
		return "Current metrics suggest stable future trajectory."
		
	case "NTJ": // Strategist - Focus on systematic optimization
		efficiency := (100 - telemetry.CPU.UsagePercent) * (100 - telemetry.Memory.UsagePercent) / 100
		if efficiency < 50 {
			return "System efficiency below optimal. Implement systematic resource optimization."
		}
		return "System operating within acceptable efficiency parameters."
		
	default:
		return "Standard analysis perspective"
	}
}

// calculateSystemEntropy determines system chaos/stability level
func (li *LeviathanIntelligence) calculateSystemEntropy(telemetry SystemTelemetry) float64 {
	// Simple entropy calculation based on system variability
	cpuVariability := telemetry.CPU.UsagePercent / 100.0
	memoryVariability := telemetry.Memory.UsagePercent / 100.0
	loadVariability := telemetry.CPU.LoadAvg1 / float64(telemetry.CPU.Cores)
	
	// Normalize to 0-1 range
	entropy := (cpuVariability + memoryVariability + loadVariability) / 3.0
	if entropy > 1.0 {
		entropy = 1.0
	}
	
	return entropy
}

// synthesizeDecision combines personality perspectives based on entropy
func (li *LeviathanIntelligence) synthesizeDecision(telemetry SystemTelemetry, analyses map[string]string) IntelligentDecision {
	var primaryPerspective string
	var reasoning strings.Builder
	var actions []ConfigurationAction
	
	// Weight perspectives based on entropy level
	if li.entropyLevel < 0.3 {
		// Low entropy - prioritize stability (Yin personalities)
		primaryPerspective = "sfj_caregiver"
		reasoning.WriteString("🛡️ STABILITY MODE: Low system entropy detected. Prioritizing stability and user experience.\n")
	} else if li.entropyLevel > 0.7 {
		// High entropy - prioritize adaptation (Yang personalities)
		primaryPerspective = "nfp_advocate"
		reasoning.WriteString("⚡ ADAPTATION MODE: High system entropy detected. Prioritizing innovation and rapid response.\n")
	} else {
		// Medium entropy - strategic analysis
		primaryPerspective = "ntj_strategist"
		reasoning.WriteString("🎯 STRATEGIC MODE: Balanced system entropy. Applying systematic optimization.\n")
	}
	
	// Add personality perspectives to reasoning
	reasoning.WriteString("\n📊 PERSONALITY PERSPECTIVES:\n")
	for code, analysis := range analyses {
		personality := li.cognitiveParliament.personalities[code]
		reasoning.WriteString(fmt.Sprintf("• %s (%s): %s\n", personality.Name, personality.Code, analysis))
	}
	
	// Generate actions based on primary perspective
	actions = li.generateActions(telemetry, primaryPerspective)
	
	// Calculate confidence based on agreement between personalities
	confidence := li.calculateConsensusConfidence(analyses)
	
	return IntelligentDecision{
		Timestamp:           time.Now(),
		SystemContext:       telemetry,
		TriggerCondition:    li.identifyTrigger(telemetry),
		PersonalityAnalysis: analyses,
		ConflictResolution:  li.resolveConflicts(analyses),
		EntropyWeighting:    li.entropyLevel,
		FinalDecision:       primaryPerspective,
		ConfidenceLevel:     confidence,
		Actions:             actions,
		Reasoning:           reasoning.String(),
	}
}

// identifyTrigger determines what triggered this analysis
func (li *LeviathanIntelligence) identifyTrigger(telemetry SystemTelemetry) string {
	if telemetry.CPU.UsagePercent > 90 {
		return "critical_cpu_usage"
	}
	if telemetry.Memory.UsagePercent > 85 {
		return "high_memory_pressure"
	}
	if telemetry.CPU.LoadAvg1 > float64(telemetry.CPU.Cores)*1.5 {
		return "high_load_average"
	}
	return "routine_monitoring"
}

// generateActions creates configuration actions based on perspective
func (li *LeviathanIntelligence) generateActions(telemetry SystemTelemetry, perspective string) []ConfigurationAction {
	var actions []ConfigurationAction
	
	switch perspective {
	case "sfj_caregiver":
		if telemetry.CPU.UsagePercent > 80 {
			actions = append(actions, ConfigurationAction{
				Type:        "cpu_throttle", 
				Target:      "process_scheduler",
				Description: "Prioritize system stability over performance",
			})
		}
		
	case "nfp_advocate":
		if telemetry.Memory.UsagePercent > 70 {
			actions = append(actions, ConfigurationAction{
				Type:        "memory_optimization",
				Target:      "buffer_cache", 
				Description: "Implement innovative memory management",
			})
		}
		
	case "ntj_strategist":
		if telemetry.CPU.LoadAvg1 > float64(telemetry.CPU.Cores) {
			actions = append(actions, ConfigurationAction{
				Type:        "load_balancing",
				Target:      "scheduler_policy",
				Description: "Systematic optimization for efficiency", 
			})
		}
	}
	
	return actions
}

// calculateConsensusConfidence measures agreement between personalities
func (li *LeviathanIntelligence) calculateConsensusConfidence(analyses map[string]string) float64 {
	// Simple confidence calculation based on analysis similarity
	// In a real implementation, this would use NLP similarity metrics
	concernCount := 0
	totalAnalyses := len(analyses)
	
	for _, analysis := range analyses {
		if strings.Contains(strings.ToLower(analysis), "concern") ||
		   strings.Contains(strings.ToLower(analysis), "issue") ||
		   strings.Contains(strings.ToLower(analysis), "problem") {
			concernCount++
		}
	}
	
	// Higher consensus when personalities agree on concern level
	if concernCount == 0 || concernCount == totalAnalyses {
		return 0.9 // High confidence in unanimous assessment
	} else if concernCount == totalAnalyses/2 {
		return 0.5 // Medium confidence in split decision
	} else {
		return 0.7 // Good confidence in majority opinion
	}
}

// resolveConflicts identifies and resolves personality conflicts
func (li *LeviathanIntelligence) resolveConflicts(analyses map[string]string) string {
	// Check for Yin vs Yang conflicts (stability vs change)
	yinCount := 0
	yangCount := 0
	
	for code := range analyses {
		personality := li.cognitiveParliament.personalities[code]
		if personality.FeedbackType == "negative" {
			yinCount++
		} else {
			yangCount++
		}
	}
	
	if yinCount > yangCount {
		return "Stability-focused consensus with minor change advocacy"
	} else if yangCount > yinCount {
		return "Change-focused consensus with stability considerations"
	} else {
		return "Balanced perspective with no significant conflicts"
	}
}

// fallbackAnalysis provides simple analysis when parliament is disabled
func (li *LeviathanIntelligence) fallbackAnalysis(telemetry SystemTelemetry) IntelligentDecision {
	actions := make([]ConfigurationAction, 0)
	reasoning := "Standard single-perspective analysis"
	
	if telemetry.CPU.UsagePercent > 80 {
		actions = append(actions, ConfigurationAction{
			Type:        "cpu_optimization",
			Target:      "process_scheduler",
			Description: "High CPU usage detected",
		})
	}
	
	return IntelligentDecision{
		Timestamp:           time.Now(),
		SystemContext:       telemetry,
		TriggerCondition:    li.identifyTrigger(telemetry),
		PersonalityAnalysis: map[string]string{"default": "Single perspective analysis"},
		ConflictResolution:  "No conflicts - single perspective",
		EntropyWeighting:    li.entropyLevel,
		FinalDecision:       "default",
		ConfidenceLevel:     0.6,
		Actions:             actions,
		Reasoning:           reasoning,
	}
}

// GetDecisionHistory returns recent intelligent decisions
func (li *LeviathanIntelligence) GetDecisionHistory(limit int) []IntelligentDecision {
	if limit <= 0 || limit > len(li.decisionHistory) {
		return li.decisionHistory
	}
	return li.decisionHistory[len(li.decisionHistory)-limit:]
}

// SetVerbosity configures cognitive parliament output level
func (li *LeviathanIntelligence) SetVerbosity(level string) {
	li.cognitiveParliament.verbosity = level
}

// EnableParliament toggles cognitive parliament analysis
func (li *LeviathanIntelligence) EnableParliament(enabled bool) {
	li.cognitiveParliament.enabled = enabled
}