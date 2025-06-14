package main

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strings"
	"time"
	"gopkg.in/yaml.v2"
)

// FlowMindParser - LLM-first natural language to YAML workflow converter
type FlowMindParser struct {
	cognitiveParliament *CognitiveParliament
	patternLibrary      map[string]FlowPattern
	learnedVocabulary   map[string]string
	executionHistory    []ParsedWorkflow
	confidenceThreshold float64
}

// FlowPattern represents a learned natural language pattern
type FlowPattern struct {
	Keywords      []string                `yaml:"keywords"`
	TriggerType   string                  `yaml:"trigger_type"`
	ActionMapping map[string]string       `yaml:"action_mapping"`
	Confidence    float64                 `yaml:"confidence"`
	UsageCount    int                     `yaml:"usage_count"`
	LastUsed      time.Time               `yaml:"last_used"`
	Examples      []string                `yaml:"examples"`
}

// ParsedWorkflow represents the YAML output from natural language parsing
type ParsedWorkflow struct {
	ID                  string                    `yaml:"id"`
	OriginalInstruction string                    `yaml:"original_instruction"`
	ParsedAt            time.Time                 `yaml:"parsed_at"`
	Confidence          float64                   `yaml:"confidence"`
	Trigger             WorkflowTrigger           `yaml:"trigger"`
	CognitiveAssignment CognitiveAssignment       `yaml:"cognitive_assignment"`
	Workflow            []WorkflowStep            `yaml:"workflow"`
	LearningMetadata    LearningMetadata          `yaml:"learning_metadata"`
	RuntimeAdaptation   *RuntimeAdaptation        `yaml:"runtime_adaptation,omitempty"`
}

type WorkflowTrigger struct {
	Condition   string  `yaml:"condition"`
	Urgency     string  `yaml:"urgency"`
	SafetyMode  bool    `yaml:"safety_mode"`
	Confidence  float64 `yaml:"confidence"`
	Timeframe   string  `yaml:"timeframe,omitempty"`
}

type CognitiveAssignment struct {
	PrimaryPersonality string            `yaml:"primary_personality"`
	ConsensusRequired  bool              `yaml:"consensus_required"`
	Reasoning          string            `yaml:"reasoning"`
	PersonalityTasks   map[string]string `yaml:"personality_tasks,omitempty"`
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

type RuntimeAdaptation struct {
	OriginalParams    map[string]interface{} `yaml:"original_params"`
	AdjustedParams    map[string]interface{} `yaml:"adjusted_params"`
	EscalationReason  string                 `yaml:"escalation_reason"`
	PersonalityShift  string                 `yaml:"personality_shift,omitempty"`
	AdaptedAt         time.Time              `yaml:"adapted_at"`
}

// ConflictDetection represents logical contradictions in instructions
type ConflictDetection struct {
	ConflictDetected bool     `yaml:"conflict_detected"`
	ConflictType     string   `yaml:"conflict_type"`
	Elements         []string `yaml:"elements"`
	Suggestions      []string `yaml:"suggestions"`
	ClarificationMsg string   `yaml:"clarification_request"`
}

// NewFlowMindParser creates a new LLM-first natural language parser
func NewFlowMindParser(parliament *CognitiveParliament) *FlowMindParser {
	parser := &FlowMindParser{
		cognitiveParliament: parliament,
		patternLibrary:      make(map[string]FlowPattern),
		learnedVocabulary:   make(map[string]string),
		executionHistory:    make([]ParsedWorkflow, 0),
		confidenceThreshold: 0.7,
	}
	
	// Initialize with core system patterns
	parser.initializeCorePatterns()
	
	return parser
}

// ParseNaturalLanguage - Main entry point for LLM-first parsing
func (fp *FlowMindParser) ParseNaturalLanguage(instruction string) (*ParsedWorkflow, error) {
	fmt.Printf("🧠 FlowMind parsing: \"%s\"\n", instruction)
	
	// Step 1: Conflict detection using logical reasoning
	if conflict := fp.detectLogicalConflicts(instruction); conflict.ConflictDetected {
		return fp.handleConflictedInstruction(instruction, conflict)
	}
	
	// Step 2: Pattern recognition and matching
	matchedPattern, confidence := fp.recognizePatterns(instruction)
	
	// Step 3: Cognitive Parliament analysis for personality assignment
	cognitiveAssignment := fp.analyzeCognitiveRequirements(instruction)
	
	// Step 4: Generate workflow triggers
	trigger := fp.extractTriggerConditions(instruction, matchedPattern)
	
	// Step 5: Generate workflow steps
	workflowSteps := fp.generateWorkflowSteps(instruction, matchedPattern, cognitiveAssignment)
	
	// Step 6: Learning and adaptation metadata
	learningMeta := fp.generateLearningMetadata(instruction, matchedPattern, confidence)
	
	// Create parsed workflow
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
	
	// Step 7: Learn from this parsing for future improvements
	fp.learnFromParsing(workflow)
	
	// Store in execution history
	fp.executionHistory = append(fp.executionHistory, *workflow)
	if len(fp.executionHistory) > 100 {
		fp.executionHistory = fp.executionHistory[1:]
	}
	
	fmt.Printf("✅ FlowMind generated workflow with %.0f%% confidence\n", confidence*100)
	return workflow, nil
}

// detectLogicalConflicts uses reasoning to find contradictions
func (fp *FlowMindParser) detectLogicalConflicts(instruction string) ConflictDetection {
	instruction = strings.ToLower(instruction)
	
	// Common logical contradictions
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
			// Check if they're referring to the same thing
			subject := fp.extractSubjectBetweenConflicts(instruction, pair[0], pair[1])
			if subject != "" {
				return ConflictDetection{
					ConflictDetected: true,
					ConflictType:     "logical_contradiction",
					Elements:         []string{pair[0] + " " + subject, pair[1] + " " + subject},
					Suggestions:      fp.generateConflictSuggestions(pair, subject),
					ClarificationMsg: fmt.Sprintf("These goals conflict: %s vs %s. Please clarify your intent.", pair[0], pair[1]),
				}
			}
		}
	}
	
	return ConflictDetection{ConflictDetected: false}
}

// recognizePatterns uses LLM-first pattern matching
func (fp *FlowMindParser) recognizePatterns(instruction string) (string, float64) {
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
	
	// If no good match found, try to learn a new pattern
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

// analyzeCognitiveRequirements determines which personalities should handle what
func (fp *FlowMindParser) analyzeCognitiveRequirements(instruction string) CognitiveAssignment {
	instruction = strings.ToLower(instruction)
	
	// Analyze instruction for personality cues
	personalityIndicators := map[string][]string{
		"sfj_caregiver":  {"safe", "careful", "protect", "gentle", "save", "backup"},
		"nfp_advocate":   {"aggressive", "innovative", "quickly", "optimize", "improve"},
		"nfj_visionary":  {"future", "predict", "anticipate", "long-term", "strategic"},
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
	
	// Find primary personality
	primaryPersonality := "ntj_strategist" // Default to strategic
	maxScore := 0
	for personality, score := range scores {
		if score > maxScore {
			maxScore = score
			primaryPersonality = personality
		}
	}
	
	// Determine if consensus is needed (for safety-critical operations)
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

// extractTriggerConditions converts natural language to system triggers
func (fp *FlowMindParser) extractTriggerConditions(instruction string, pattern string) WorkflowTrigger {
	instruction = strings.ToLower(instruction)
	
	// Extract resource thresholds
	condition := fp.extractResourceCondition(instruction)
	
	// Determine urgency
	urgency := "medium"
	if strings.Contains(instruction, "emergency") || strings.Contains(instruction, "quickly") {
		urgency = "critical"
	} else if strings.Contains(instruction, "gradual") || strings.Contains(instruction, "slowly") {
		urgency = "low"
	}
	
	// Safety mode detection
	safetyMode := strings.Contains(instruction, "safe") || strings.Contains(instruction, "protect") || 
		           strings.Contains(instruction, "save") || strings.Contains(instruction, "backup")
	
	// Calculate confidence based on clarity of trigger
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

// extractResourceCondition parses resource usage triggers
func (fp *FlowMindParser) extractResourceCondition(instruction string) string {
	// CPU patterns
	cpuPattern := regexp.MustCompile(`cpu.*?(\d+)%`)
	if matches := cpuPattern.FindStringSubmatch(instruction); len(matches) > 1 {
		return fmt.Sprintf("cpu_usage >= %s", matches[1])
	}
	
	// Memory patterns  
	memPattern := regexp.MustCompile(`memory.*?(\d+)%`)
	if matches := memPattern.FindStringSubmatch(instruction); len(matches) > 1 {
		return fmt.Sprintf("memory_usage >= %s", matches[1])
	}
	
	// Disk patterns
	diskPattern := regexp.MustCompile(`disk.*?(\d+)%`)
	if matches := diskPattern.FindStringSubmatch(instruction); len(matches) > 1 {
		return fmt.Sprintf("disk_usage >= %s", matches[1])
	}
	
	// Generic conditions
	if strings.Contains(instruction, "cpu") {
		return "cpu_usage >= ${CPU_THRESHOLD}"
	}
	if strings.Contains(instruction, "memory") {
		return "memory_usage >= ${MEMORY_THRESHOLD}"
	}
	if strings.Contains(instruction, "disk") {
		return "disk_usage >= ${DISK_THRESHOLD}"
	}
	
	return "unspecified_condition"
}

// generateWorkflowSteps creates actionable workflow steps
func (fp *FlowMindParser) generateWorkflowSteps(instruction string, pattern string, cognitive CognitiveAssignment) []WorkflowStep {
	instruction = strings.ToLower(instruction)
	var steps []WorkflowStep
	
	// Document safety step (if mentioned)
	if strings.Contains(instruction, "save") && strings.Contains(instruction, "document") {
		steps = append(steps, WorkflowStep{
			Name:        "emergency_document_save",
			Type:        "document_protection",
			Actions:     []string{"save_all_open_documents", "backup_unsaved_work", "notify_applications_graceful_shutdown"},
			Personality: "sfj_caregiver",
			SafetyCheck: true,
		})
	}
	
	// Resource management step
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
	
	// Communication step (if user notification mentioned)
	if strings.Contains(instruction, "call") || strings.Contains(instruction, "notify") || strings.Contains(instruction, "alert") {
		steps = append(steps, WorkflowStep{
			Name:    "user_notification",
			Type:    "communication",
			Actions: []string{"send_alert", "log_incident_report", "await_user_acknowledgment"},
		})
	}
	
	// Default step if nothing specific was parsed
	if len(steps) == 0 {
		steps = append(steps, WorkflowStep{
			Name:    "generic_optimization",
			Type:    "system_optimization",
			Actions: []string{"analyze_system_state", "apply_appropriate_optimizations"},
		})
	}
	
	return steps
}

// generateLearningMetadata creates learning information for future improvement
func (fp *FlowMindParser) generateLearningMetadata(instruction string, pattern string, confidence float64) LearningMetadata {
	meta := LearningMetadata{
		PatternMatched:    pattern,
		NewVocabulary:     make(map[string]string),
		FeedbackRequested: confidence < fp.confidenceThreshold,
		AdaptationMode:    "active",
	}
	
	// Identify uncertainty markers
	uncertainWords := []string{"smart", "intelligently", "appropriately", "as needed"}
	for _, word := range uncertainWords {
		if strings.Contains(strings.ToLower(instruction), word) {
			meta.UncertaintyMarkers = append(meta.UncertaintyMarkers, word)
		}
	}
	
	return meta
}

// initializeCorePatterns sets up basic system patterns
func (fp *FlowMindParser) initializeCorePatterns() {
	// CPU management pattern
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
	
	// Memory management pattern
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
	
	// Network optimization pattern
	fp.patternLibrary["network_tuning"] = FlowPattern{
		Keywords:      []string{"network", "aggressive", "gentle", "optimize", "processes"},
		TriggerType:   "performance_optimization",
		ActionMapping: map[string]string{
			"aggressive": "intensive_optimization",
			"gentle":     "conservative_approach",
		},
		Confidence: 0.8,
		Examples:   []string{"be aggressive about network optimization but gentle with user processes"},
	}
}

// Additional helper methods...

func (fp *FlowMindParser) calculatePatternMatch(instruction string, pattern FlowPattern) float64 {
	matches := 0
	for _, keyword := range pattern.Keywords {
		if strings.Contains(instruction, keyword) {
			matches++
		}
	}
	return float64(matches) / float64(len(pattern.Keywords))
}

func (fp *FlowMindParser) learnNewPattern(instruction string) *FlowPattern {
	// Simple learning - extract keywords and create pattern
	words := strings.Fields(strings.ToLower(instruction))
	keywords := []string{}
	
	// Filter meaningful words (skip common words)
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
		Keywords:   keywords[:min(len(keywords), 5)], // Max 5 keywords
		Confidence: 0.6, // Lower confidence for new patterns
		UsageCount: 1,
		LastUsed:   time.Now(),
		Examples:   []string{instruction},
	}
}

func (fp *FlowMindParser) learnFromParsing(workflow *ParsedWorkflow) {
	// Update pattern usage statistics
	if workflow.LearningMetadata.PatternMatched != "" {
		if pattern, exists := fp.patternLibrary[workflow.LearningMetadata.PatternMatched]; exists {
			pattern.UsageCount++
			pattern.LastUsed = time.Now()
			pattern.Confidence = minFloat64(pattern.Confidence+0.01, 0.95) // Gradually increase confidence
			fp.patternLibrary[workflow.LearningMetadata.PatternMatched] = pattern
		}
	}
	
	// Learn new vocabulary
	for word, meaning := range workflow.LearningMetadata.NewVocabulary {
		fp.learnedVocabulary[word] = meaning
	}
}

func (fp *FlowMindParser) generateWorkflowID() string {
	return fmt.Sprintf("flowmind_%d", time.Now().UnixNano())
}

func (fp *FlowMindParser) extractSubjectBetweenConflicts(instruction, word1, word2 string) string {
	// Simple subject extraction between conflicting words
	words := strings.Fields(instruction)
	for i, word := range words {
		if strings.Contains(word, word1) || strings.Contains(word, word2) {
			// Look for nouns nearby
			for j := max(0, i-3); j < min(len(words), i+4); j++ {
				if j != i && len(words[j]) > 3 {
					return words[j]
				}
			}
		}
	}
	return ""
}

func (fp *FlowMindParser) generateConflictSuggestions(conflictPair []string, subject string) []string {
	return []string{
		fmt.Sprintf("Optimize %s efficiency (better results per resource)", subject),
		fmt.Sprintf("%s %s only when needed", strings.Title(conflictPair[0]), subject),
		fmt.Sprintf("%s idle %s while maintaining capacity", strings.Title(conflictPair[1]), subject),
	}
}

func (fp *FlowMindParser) handleConflictedInstruction(instruction string, conflict ConflictDetection) (*ParsedWorkflow, error) {
	return &ParsedWorkflow{
		ID:                  fp.generateWorkflowID(),
		OriginalInstruction: instruction,
		ParsedAt:            time.Now(),
		Confidence:          0.0, // Zero confidence for conflicted instructions
		LearningMetadata: LearningMetadata{
			FeedbackRequested: true,
			AdaptationMode:    "clarification_needed",
		},
	}, fmt.Errorf("conflicted instruction detected: %s", conflict.ClarificationMsg)
}

// ToYAML converts parsed workflow to YAML string
func (pw *ParsedWorkflow) ToYAML() (string, error) {
	data, err := yaml.Marshal(pw)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

// ToJSON converts parsed workflow to JSON string  
func (pw *ParsedWorkflow) ToJSON() (string, error) {
	data, err := json.MarshalIndent(pw, "", "  ")
	if err != nil {
		return "", err
	}
	return string(data), nil
}

// Utility functions
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func max(a, b int) int {
	if a > b {
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