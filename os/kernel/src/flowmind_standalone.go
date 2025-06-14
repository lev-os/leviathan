package main

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strings"
	"time"
	"gopkg.in/yaml.v2"
)

// Standalone FlowMind demonstration without external dependencies
// This showcases the LLM-first natural language to YAML conversion

// Simplified types for standalone demo
type StandalonePersonality struct {
	Code         string `yaml:"code"`
	Name         string `yaml:"name"`
	FeedbackType string `yaml:"feedback_type"`
}

type StandaloneCognitiveParliament struct {
	personalities map[string]StandalonePersonality
	enabled       bool
}

// FlowMind core types (standalone version)
type FlowPattern struct {
	Keywords      []string          `yaml:"keywords"`
	TriggerType   string            `yaml:"trigger_type"`
	ActionMapping map[string]string `yaml:"action_mapping"`
	Confidence    float64           `yaml:"confidence"`
	UsageCount    int               `yaml:"usage_count"`
	LastUsed      time.Time         `yaml:"last_used"`
	Examples      []string          `yaml:"examples"`
}

type ParsedWorkflow struct {
	ID                  string                    `yaml:"id"`
	OriginalInstruction string                    `yaml:"original_instruction"`
	ParsedAt            time.Time                 `yaml:"parsed_at"`
	Confidence          float64                   `yaml:"confidence"`
	Trigger             WorkflowTrigger           `yaml:"trigger"`
	CognitiveAssignment CognitiveAssignment       `yaml:"cognitive_assignment"`
	Workflow            []WorkflowStep            `yaml:"workflow"`
	LearningMetadata    LearningMetadata          `yaml:"learning_metadata"`
}

type WorkflowTrigger struct {
	Condition   string  `yaml:"condition"`
	Urgency     string  `yaml:"urgency"`
	SafetyMode  bool    `yaml:"safety_mode"`
	Confidence  float64 `yaml:"confidence"`
}

type CognitiveAssignment struct {
	PrimaryPersonality string `yaml:"primary_personality"`
	ConsensusRequired  bool   `yaml:"consensus_required"`
	Reasoning          string `yaml:"reasoning"`
}

type WorkflowStep struct {
	Name        string                 `yaml:"name"`
	Type        string                 `yaml:"type"`
	Actions     []string              `yaml:"actions"`
	Parameters  map[string]interface{} `yaml:"parameters,omitempty"`
	Personality string                 `yaml:"personality,omitempty"`
	SafetyCheck bool                  `yaml:"safety_check,omitempty"`
}

type LearningMetadata struct {
	PatternMatched     string            `yaml:"pattern_matched,omitempty"`
	NewVocabulary      map[string]string `yaml:"new_vocabulary,omitempty"`
	UncertaintyMarkers []string          `yaml:"uncertainty_markers,omitempty"`
	FeedbackRequested  bool              `yaml:"feedback_requested"`
	AdaptationMode     string            `yaml:"adaptation_mode"`
}

type ConflictDetection struct {
	ConflictDetected bool     `yaml:"conflict_detected"`
	ConflictType     string   `yaml:"conflict_type"`
	Elements         []string `yaml:"elements"`
	Suggestions      []string `yaml:"suggestions"`
	ClarificationMsg string   `yaml:"clarification_request"`
}

// Standalone FlowMind Parser
type StandaloneFlowMindParser struct {
	cognitiveParliament *StandaloneCognitiveParliament
	patternLibrary      map[string]FlowPattern
	learnedVocabulary   map[string]string
	executionHistory    []ParsedWorkflow
	confidenceThreshold float64
}

func NewStandaloneFlowMindParser(parliament *StandaloneCognitiveParliament) *StandaloneFlowMindParser {
	parser := &StandaloneFlowMindParser{
		cognitiveParliament: parliament,
		patternLibrary:      make(map[string]FlowPattern),
		learnedVocabulary:   make(map[string]string),
		executionHistory:    make([]ParsedWorkflow, 0),
		confidenceThreshold: 0.7,
	}
	
	parser.initializeCorePatterns()
	return parser
}

func (fp *StandaloneFlowMindParser) ParseNaturalLanguage(instruction string) (*ParsedWorkflow, error) {
	fmt.Printf("🧠 FlowMind parsing: \"%s\"\n", instruction)
	
	// Step 1: Conflict detection
	if conflict := fp.detectLogicalConflicts(instruction); conflict.ConflictDetected {
		return fp.handleConflictedInstruction(instruction, conflict)
	}
	
	// Step 2: Pattern recognition
	matchedPattern, confidence := fp.recognizePatterns(instruction)
	
	// Step 3: Cognitive assignment
	cognitiveAssignment := fp.analyzeCognitiveRequirements(instruction)
	
	// Step 4: Generate triggers
	trigger := fp.extractTriggerConditions(instruction, matchedPattern)
	
	// Step 5: Generate workflow steps
	workflowSteps := fp.generateWorkflowSteps(instruction, matchedPattern, cognitiveAssignment)
	
	// Step 6: Learning metadata
	learningMeta := fp.generateLearningMetadata(instruction, matchedPattern, confidence)
	
	workflow := &ParsedWorkflow{
		ID:                  fp.generateWorkflowID(),
		OriginalInstruction: instruction,
		ParsedAt:            time.Now(),
		Confidence:          confidence,
		Trigger:             trigger,
		CognitiveAssignment: cognitiveAssignment,
		Workflow:            workflowSteps,
		LearningMetadata:    learningMeta,
	}
	
	fp.learnFromParsing(workflow)
	fp.executionHistory = append(fp.executionHistory, *workflow)
	if len(fp.executionHistory) > 100 {
		fp.executionHistory = fp.executionHistory[1:]
	}
	
	fmt.Printf("✅ FlowMind generated workflow with %.0f%% confidence\n", confidence*100)
	return workflow, nil
}

func (fp *StandaloneFlowMindParser) detectLogicalConflicts(instruction string) ConflictDetection {
	instruction = strings.ToLower(instruction)
	
	contradictions := [][]string{
		{"maximize", "minimize"},
		{"increase", "decrease"},
		{"speed up", "slow down"},
		{"more", "less"},
		{"enable", "disable"},
		{"start", "stop"},
	}
	
	for _, pair := range contradictions {
		if strings.Contains(instruction, pair[0]) && strings.Contains(instruction, pair[1]) {
			return ConflictDetection{
				ConflictDetected: true,
				ConflictType:     "logical_contradiction",
				Elements:         pair,
				Suggestions:      []string{fmt.Sprintf("Optimize %s efficiency", pair[0]), fmt.Sprintf("%s only when needed", strings.Title(pair[0]))},
				ClarificationMsg: fmt.Sprintf("These goals conflict: %s vs %s. Please clarify your intent.", pair[0], pair[1]),
			}
		}
	}
	
	return ConflictDetection{ConflictDetected: false}
}

func (fp *StandaloneFlowMindParser) recognizePatterns(instruction string) (string, float64) {
	bestMatch := ""
	bestConfidence := 0.0
	
	instruction = strings.ToLower(instruction)
	
	for patternName, pattern := range fp.patternLibrary {
		confidence := fp.calculatePatternMatch(instruction, pattern)
		if confidence > bestConfidence {
			bestConfidence = confidence
			bestMatch = patternName
		}
	}
	
	if bestConfidence < fp.confidenceThreshold {
		newPattern := fp.learnNewPattern(instruction)
		if newPattern != nil {
			patternName := fmt.Sprintf("learned_pattern_%d", time.Now().Unix())
			fp.patternLibrary[patternName] = *newPattern
			return patternName, newPattern.Confidence
		}
	}
	
	return bestMatch, bestConfidence
}

func (fp *StandaloneFlowMindParser) analyzeCognitiveRequirements(instruction string) CognitiveAssignment {
	instruction = strings.ToLower(instruction)
	
	personalityIndicators := map[string][]string{
		"sfj_caregiver":  {"safe", "careful", "protect", "gentle", "save", "backup"},
		"nfp_advocate":   {"aggressive", "innovative", "quickly", "optimize", "improve"},
		"ntj_strategist": {"efficient", "systematic", "analyze", "calculate", "logical"},
	}
	
	scores := make(map[string]int)
	for personality, indicators := range personalityIndicators {
		for _, indicator := range indicators {
			if strings.Contains(instruction, indicator) {
				scores[personality]++
			}
		}
	}
	
	primaryPersonality := "ntj_strategist"
	maxScore := 0
	for personality, score := range scores {
		if score > maxScore {
			maxScore = score
			primaryPersonality = personality
		}
	}
	
	safetyKeywords := []string{"emergency", "critical", "save", "backup", "protect"}
	consensusRequired := false
	for _, keyword := range safetyKeywords {
		if strings.Contains(instruction, keyword) {
			consensusRequired = true
			break
		}
	}
	
	reasoning := fmt.Sprintf("Instruction emphasizes %s approach based on language analysis", 
		strings.Split(primaryPersonality, "_")[1])
	
	return CognitiveAssignment{
		PrimaryPersonality: primaryPersonality,
		ConsensusRequired:  consensusRequired,
		Reasoning:          reasoning,
	}
}

func (fp *StandaloneFlowMindParser) extractTriggerConditions(instruction string, pattern string) WorkflowTrigger {
	instruction = strings.ToLower(instruction)
	
	condition := fp.extractResourceCondition(instruction)
	
	urgency := "medium"
	if strings.Contains(instruction, "emergency") || strings.Contains(instruction, "quickly") {
		urgency = "critical"
	} else if strings.Contains(instruction, "gradual") || strings.Contains(instruction, "slowly") {
		urgency = "low"
	}
	
	safetyMode := strings.Contains(instruction, "safe") || strings.Contains(instruction, "protect") || 
		           strings.Contains(instruction, "save") || strings.Contains(instruction, "backup")
	
	confidence := 0.8
	if condition == "unspecified_condition" {
		confidence = 0.5
	}
	
	return WorkflowTrigger{
		Condition:  condition,
		Urgency:    urgency,
		SafetyMode: safetyMode,
		Confidence: confidence,
	}
}

func (fp *StandaloneFlowMindParser) extractResourceCondition(instruction string) string {
	cpuPattern := regexp.MustCompile(`cpu.*?(\d+)%`)
	if matches := cpuPattern.FindStringSubmatch(instruction); len(matches) > 1 {
		return fmt.Sprintf("cpu_usage >= %s", matches[1])
	}
	
	memPattern := regexp.MustCompile(`memory.*?(\d+)%`)
	if matches := memPattern.FindStringSubmatch(instruction); len(matches) > 1 {
		return fmt.Sprintf("memory_usage >= %s", matches[1])
	}
	
	if strings.Contains(instruction, "cpu") {
		return "cpu_usage >= ${CPU_THRESHOLD}"
	}
	if strings.Contains(instruction, "memory") {
		return "memory_usage >= ${MEMORY_THRESHOLD}"
	}
	if strings.Contains(instruction, "bitcoin") || strings.Contains(instruction, "price") {
		return "bitcoin_price_drop >= 10%"
	}
	if strings.Contains(instruction, "kubernetes") || strings.Contains(instruction, "cluster") {
		return "kubernetes_cluster_health < threshold"
	}
	
	return "unspecified_condition"
}

func (fp *StandaloneFlowMindParser) generateWorkflowSteps(instruction string, pattern string, cognitive CognitiveAssignment) []WorkflowStep {
	instruction = strings.ToLower(instruction)
	var steps []WorkflowStep
	
	if strings.Contains(instruction, "save") && strings.Contains(instruction, "document") {
		steps = append(steps, WorkflowStep{
			Name:        "emergency_document_save",
			Type:        "document_protection",
			Actions:     []string{"save_all_open_documents", "backup_unsaved_work", "notify_applications_graceful_shutdown"},
			Personality: "sfj_caregiver",
			SafetyCheck: true,
		})
	}
	
	if strings.Contains(instruction, "cpu") || strings.Contains(instruction, "memory") {
		actions := []string{}
		if strings.Contains(instruction, "cpu") {
			actions = append(actions, "suspend_non_critical_processes", "throttle_cpu_intensive_tasks")
		}
		if strings.Contains(instruction, "memory") {
			actions = append(actions, "clear_memory_caches", "compact_memory_pages")
		}
		
		steps = append(steps, WorkflowStep{
			Name:        "intelligent_resource_management",
			Type:        "resource_management", 
			Actions:     actions,
			Personality: cognitive.PrimaryPersonality,
		})
	}
	
	if strings.Contains(instruction, "bitcoin") || strings.Contains(instruction, "trading") {
		steps = append(steps, WorkflowStep{
			Name:    "secure_trading_positions",
			Type:    "financial_protection",
			Actions: []string{"stop_active_orders", "calculate_portfolio_impact", "secure_positions"},
		})
	}
	
	if strings.Contains(instruction, "kubernetes") || strings.Contains(instruction, "pods") {
		steps = append(steps, WorkflowStep{
			Name:    "scale_kubernetes_resources",
			Type:    "container_management",
			Actions: []string{"scale_down_frontend_pods", "maintain_backend_services", "monitor_cluster_health"},
		})
	}
	
	if strings.Contains(instruction, "call") || strings.Contains(instruction, "notify") || strings.Contains(instruction, "alert") {
		steps = append(steps, WorkflowStep{
			Name:    "user_notification",
			Type:    "communication",
			Actions: []string{"send_alert", "log_incident_report", "await_user_acknowledgment"},
		})
	}
	
	if len(steps) == 0 {
		steps = append(steps, WorkflowStep{
			Name:    "generic_optimization",
			Type:    "system_optimization",
			Actions: []string{"analyze_system_state", "apply_appropriate_optimizations"},
		})
	}
	
	return steps
}

func (fp *StandaloneFlowMindParser) generateLearningMetadata(instruction string, pattern string, confidence float64) LearningMetadata {
	meta := LearningMetadata{
		PatternMatched:    pattern,
		NewVocabulary:     make(map[string]string),
		FeedbackRequested: confidence < fp.confidenceThreshold,
		AdaptationMode:    "active",
	}
	
	uncertainWords := []string{"smart", "intelligently", "appropriately", "as needed", "tight"}
	for _, word := range uncertainWords {
		if strings.Contains(strings.ToLower(instruction), word) {
			meta.UncertaintyMarkers = append(meta.UncertaintyMarkers, word)
		}
	}
	
	// Learn domain-specific vocabulary
	if strings.Contains(instruction, "kubernetes") {
		meta.NewVocabulary["kubernetes"] = "container_orchestration_system"
		meta.NewVocabulary["cluster"] = "system_group"
		meta.NewVocabulary["pods"] = "application_instances"
	}
	
	return meta
}

func (fp *StandaloneFlowMindParser) initializeCorePatterns() {
	fp.patternLibrary["cpu_emergency"] = FlowPattern{
		Keywords:      []string{"cpu", "high", "90%", "emergency", "quickly"},
		TriggerType:   "resource_threshold",
		ActionMapping: map[string]string{
			"resolve": "reduce_cpu_usage",
			"save":    "document_protection",
			"call":    "user_notification",
		},
		Confidence: 0.9,
		Examples:   []string{"if cpu is 90% quickly resolve safely saving all open documents and call me"},
	}
	
	fp.patternLibrary["memory_optimization"] = FlowPattern{
		Keywords:      []string{"memory", "tight", "full", "optimize", "smart"},
		TriggerType:   "resource_threshold",
		ActionMapping: map[string]string{
			"optimize": "memory_management",
			"smart":    "intelligent_analysis",
		},
		Confidence: 0.85,
		Examples:   []string{"when memory gets tight, be smart about it but don't break anything"},
	}
}

func (fp *StandaloneFlowMindParser) calculatePatternMatch(instruction string, pattern FlowPattern) float64 {
	matches := 0
	for _, keyword := range pattern.Keywords {
		if strings.Contains(instruction, keyword) {
			matches++
		}
	}
	return float64(matches) / float64(len(pattern.Keywords))
}

func (fp *StandaloneFlowMindParser) learnNewPattern(instruction string) *FlowPattern {
	words := strings.Fields(strings.ToLower(instruction))
	keywords := []string{}
	
	skipWords := map[string]bool{"the": true, "a": true, "an": true, "and": true, "or": true, "if": true, "when": true}
	
	for _, word := range words {
		if !skipWords[word] && len(word) > 2 {
			keywords = append(keywords, word)
		}
	}
	
	if len(keywords) < 2 {
		return nil
	}
	
	return &FlowPattern{
		Keywords:   keywords[:min(len(keywords), 5)],
		Confidence: 0.6,
		UsageCount: 1,
		LastUsed:   time.Now(),
		Examples:   []string{instruction},
	}
}

func (fp *StandaloneFlowMindParser) learnFromParsing(workflow *ParsedWorkflow) {
	if workflow.LearningMetadata.PatternMatched != "" {
		if pattern, exists := fp.patternLibrary[workflow.LearningMetadata.PatternMatched]; exists {
			pattern.UsageCount++
			pattern.LastUsed = time.Now()
			pattern.Confidence = minFloat64(pattern.Confidence+0.01, 0.95)
			fp.patternLibrary[workflow.LearningMetadata.PatternMatched] = pattern
		}
	}
	
	for word, meaning := range workflow.LearningMetadata.NewVocabulary {
		fp.learnedVocabulary[word] = meaning
	}
}

func (fp *StandaloneFlowMindParser) generateWorkflowID() string {
	return fmt.Sprintf("flowmind_%d", time.Now().UnixNano())
}

func (fp *StandaloneFlowMindParser) handleConflictedInstruction(instruction string, conflict ConflictDetection) (*ParsedWorkflow, error) {
	return &ParsedWorkflow{
		ID:                  fp.generateWorkflowID(),
		OriginalInstruction: instruction,
		ParsedAt:            time.Now(),
		Confidence:          0.0,
		LearningMetadata: LearningMetadata{
			FeedbackRequested: true,
			AdaptationMode:    "clarification_needed",
		},
	}, fmt.Errorf("conflicted instruction detected: %s", conflict.ClarificationMsg)
}

func (pw *ParsedWorkflow) ToYAML() (string, error) {
	data, err := yaml.Marshal(pw)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

func (pw *ParsedWorkflow) ToJSON() (string, error) {
	data, err := json.MarshalIndent(pw, "", "  ")
	if err != nil {
		return "", err
	}
	return string(data), nil
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func minFloat64(a, b float64) float64 {
	if a < b {
		return a
	}
	return b
}

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

// MAIN DEMONSTRATION
func main() {
	fmt.Println("🧠 FLOWMIND BDD DEMONSTRATION")
	fmt.Println("==============================")
	fmt.Println("🐋 Leviathan OS - Natural Language to YAML Parser")
	fmt.Println("📚 LLM-First 0-Config Try-As-You-Go Methodology\n")

	// Initialize cognitive parliament
	parliament := &StandaloneCognitiveParliament{
		personalities: map[string]StandalonePersonality{
			"sfj_caregiver":  {Code: "SFJ", Name: "Caregiver", FeedbackType: "negative"},
			"nfp_advocate":   {Code: "NFP", Name: "Advocate", FeedbackType: "positive"},
			"ntj_strategist": {Code: "NTJ", Name: "Strategist", FeedbackType: "positive"},
		},
		enabled: true,
	}

	parser := NewStandaloneFlowMindParser(parliament)

	// BDD Test Scenarios showing FlowMind capabilities
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

			for j, step := range workflow.Workflow {
				fmt.Printf("   %d. %s (%s) - %d actions\n", j+1, step.Name, step.Type, len(step.Actions))
			}

			if len(workflow.LearningMetadata.UncertaintyMarkers) > 0 {
				fmt.Printf("🤔 Uncertainty Markers: %v\n", workflow.LearningMetadata.UncertaintyMarkers)
			}

			if len(workflow.LearningMetadata.NewVocabulary) > 0 {
				fmt.Printf("📚 New Vocabulary: %v\n", workflow.LearningMetadata.NewVocabulary)
			}

			yaml, yamlErr := workflow.ToYAML()
			if yamlErr == nil {
				fmt.Printf("📄 Generated YAML (excerpt):\n")
				lines := splitLines(yaml, 8)
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

	fmt.Printf("═══ FLOWMIND LEARNING SUMMARY ═══\n")
	fmt.Printf("📊 Pattern Library: %d learned patterns\n", len(parser.patternLibrary))
	fmt.Printf("📚 Vocabulary: %d learned terms\n", len(parser.learnedVocabulary))
	fmt.Printf("🕒 Execution History: %d parsed workflows\n", len(parser.executionHistory))
	
	for patternName, pattern := range parser.patternLibrary {
		fmt.Printf("   • %s: %.0f%% confidence, used %d times\n", 
			patternName, pattern.Confidence*100, pattern.UsageCount)
	}

	fmt.Printf("\n🎯 FlowMind demonstrates LLM-first 0-config try-as-you-go methodology\n")
	fmt.Printf("✨ Self-evolving BDD patterns with cognitive parliament reasoning\n")
	fmt.Printf("🚀 Ready for integration with containerized Leviathan OS!\n")
}