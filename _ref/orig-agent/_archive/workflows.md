# 🔄 KINGLY AGENT WORKFLOWS

*LLM-first workflows for intelligent system operations*

## 🔮 **INSIGHT BUBBLING WORKFLOW**

### **Purpose**
Capture breakthrough insights and propagate them across the system for maximum impact.

### **Triggers**
- User says "whatever you just did, I want that repeatable"
- Breakthrough emerges during problem-solving
- Novel pattern proves highly effective
- Multiple contexts could benefit from same approach

### **Process**
```yaml
workflow: insight_bubbling
version: "1.0"

steps:
  1_capture:
    llm_call: "extract_insight_pattern"
    prompt: |
      Extract the reusable pattern from this breakthrough:
      - What specific approach worked?
      - What made it effective?
      - What contexts could benefit?
      - How should it be codified?
    
  2_codify:
    llm_call: "create_context_pattern"
    prompt: |
      Create a reusable context pattern:
      - Pattern name and description
      - Trigger conditions
      - Implementation steps
      - Success criteria
    
  3_bubble:
    llm_call: "identify_bubble_targets"
    prompt: |
      Identify where this pattern should propagate:
      - Similar contexts in current workspace
      - Related contexts in other workspaces
      - Universal applicability assessment
    
  4_evolve:
    llm_call: "pattern_evolution_plan"
    prompt: |
      How should this pattern evolve?
      - Feedback mechanisms
      - Improvement opportunities
      - Integration with existing patterns
```

### **Example Implementation**
```javascript
// LLM-first insight bubbling
const insightBubbler = {
  async bubbleInsight(breakthrough, context) {
    // Step 1: Extract pattern (dedicated MCP call)
    const pattern = await this.llm.reason({
      type: 'extract_insight_pattern',
      breakthrough,
      context,
      instruction: 'What reusable pattern emerged here?'
    });
    
    // Step 2: Codify as context (dedicated MCP call)
    const contextPattern = await this.llm.reason({
      type: 'create_context_pattern',
      pattern,
      instruction: 'Create a reusable context.yaml pattern'
    });
    
    // Step 3: Identify bubble targets (dedicated MCP call)
    const targets = await this.llm.reason({
      type: 'identify_bubble_targets',
      pattern,
      current_context: context,
      instruction: 'Where should this pattern propagate?'
    });
    
    // Step 4: Propagate and evolve
    return await this.propagatePattern(contextPattern, targets);
  }
};
```

## ✂️ **AUTO SPEC COMPLEXITY SPLITTING**

### **Purpose**
Automatically detect when specs become too complex and split them into focused, manageable pieces.

### **Complexity Triggers**
- Spec exceeds 500 lines
- More than 5 acceptance criteria
- Multiple unrelated concerns
- Cognitive load assessment by LLM

### **Process**
```yaml
workflow: auto_spec_splitting
version: "1.0"

steps:
  1_detect:
    llm_call: "assess_complexity"
    prompt: |
      Analyze this specification for complexity:
      - How many distinct concerns?
      - Cognitive load level (1-10)?
      - Natural split boundaries?
      - Dependency relationships?
    
  2_split:
    llm_call: "generate_split_plan"
    prompt: |
      Create a splitting plan:
      - Core spec (essential elements)
      - Sub-specs (focused areas)
      - Dependency relationships
      - Integration points
    
  3_validate:
    llm_call: "validate_split_coherence"
    prompt: |
      Validate the split maintains coherence:
      - All concerns covered?
      - Clear boundaries?
      - Proper dependencies?
      - Reduced complexity achieved?
```

## 🔍 **SPEC COHERENCE AND REVIEW WORKFLOW**

### **Purpose**
Systematically validate all specs for consistency, architecture alignment, and principle adherence.

### **Process**
```yaml
workflow: spec_coherence_review
version: "1.0"

phases:
  incremental_scan:
    llm_call: "scan_spec_batch"
    prompt: |
      Analyze this batch of specs for:
      - Core principle alignment
      - Architecture consistency  
      - Context inheritance patterns
      - LLM-first implementation
    
  stress_test:
    llm_call: "stress_test_specs"
    prompt: |
      Stress test these specifications:
      - Edge case handling
      - Scalability concerns
      - Integration complexity
      - Implementation feasibility
    
  roadmap_generation:
    llm_call: "generate_implementation_roadmap"
    prompt: |
      Create implementation roadmap:
      - Dependency order
      - Complexity priorities
      - Resource requirements
      - Risk assessments
    
  coherence_validation:
    llm_call: "validate_overall_coherence"
    prompt: |
      Validate overall system coherence:
      - Consistent patterns across specs
      - Proper abstraction levels
      - Clear integration points
      - Principle alignment
```

## 🐛 **DEBUGGING WORKFLOW**

### **Purpose**
LLM-first approach to debugging issues across the system.

### **Process**
```yaml
workflow: llm_debugging
version: "1.0"

steps:
  symptom_analysis:
    llm_call: "analyze_symptoms"
    prompt: |
      Analyze these debugging symptoms:
      - What behaviors are observed?
      - What was expected?
      - What contexts are involved?
      - What recent changes occurred?
    
  hypothesis_generation:
    llm_call: "generate_hypotheses"
    prompt: |
      Generate debugging hypotheses:
      - Most likely root causes
      - Contributing factors
      - Test strategies
      - Fix approaches
    
  investigation_plan:
    llm_call: "create_investigation_plan"
    prompt: |
      Create systematic investigation plan:
      - Hypothesis testing order
      - Data gathering needs
      - Reproduction steps
      - Validation criteria
```

## 📚 **DOCUMENT SYNTHESIS WORKFLOW**

### **Purpose**
Synthesize insights across multiple documents and contexts into coherent understanding.

### **Process**
```yaml
workflow: document_synthesis
version: "1.0"

steps:
  content_analysis:
    llm_call: "analyze_document_set"
    prompt: |
      Analyze this set of documents for:
      - Key themes and patterns
      - Contradictions or conflicts
      - Knowledge gaps
      - Synthesis opportunities
    
  insight_extraction:
    llm_call: "extract_cross_document_insights"
    prompt: |
      Extract insights that emerge from the document set:
      - Patterns visible across documents
      - Emergent conclusions
      - Integration opportunities
      - Action implications
    
  synthesis_creation:
    llm_call: "create_synthesis_document"
    prompt: |
      Create synthesis document:
      - Unified understanding
      - Key insights
      - Implementation implications
      - Next steps
```

---

*All workflows use bidirectional MCP architecture with dedicated reasoning calls for maximum intelligence application.*