# Self-Reflection - Iterative Critique and Improvement Workflow

## Overview
Self-Reflection enables LLMs to **critique and improve their own outputs** through iterative cycles of generation, evaluation, and refinement. This meta-cognitive approach significantly improves accuracy, reduces bias, and enhances output quality through structured self-improvement.

## Core Mechanism
- **Generate**: Create initial response to user query
- **Critique**: Identify flaws, errors, or improvement opportunities
- **Improve**: Revise output based on self-critique
- **Validate**: Verify improved response meets quality standards
- **Iterate**: Repeat until stopping criteria met

## Performance Benefits
- **75.8% reduction in toxicity** and 77% reduction in gender bias
- **Improved accuracy** on complex reasoning tasks
- **Enhanced factual correctness** through error detection
- **Better logical consistency** via iterative refinement
- **Reduced hallucinations** through self-verification

## MCP Workflow Implementation

### YAML Configuration
```yaml
name: self_reflection_improvement
description: "Iterative self-critique and improvement workflow"
version: "1.0"

parameters:
  max_iterations: 5              # Maximum reflection cycles
  improvement_threshold: 0.1     # Minimum improvement to continue
  quality_threshold: 0.9         # Target quality score
  critique_criteria: ["accuracy", "completeness", "logical_consistency", "bias_detection", "factual_correctness"]

memory:
  working:
    - iteration_count: 0           # Current reflection cycle
    - response_history: []         # All generated responses
    - critique_history: []         # All self-critiques
    - improvement_tracking: []     # Quality progression
    - change_log: []              # Documentation of changes made
  
  episodic:
    - effective_critiques: []      # Successful critique patterns
    - improvement_strategies: []   # Effective refinement approaches
    - quality_patterns: []        # Quality progression insights

steps:
  # Step 1: Generate initial response
  - name: initial_generation
    mcp_call: generate_initial_response
    inputs:
      user_query: "{{ query }}"
      context: "{{ context }}"
      generation_guidelines: "comprehensive, accurate, well-structured"
    outputs:
      initial_response: "{{ response.content }}"
      generation_metadata: "{{ response.metadata }}"
    memory_update:
      working.response_history: ["{{ initial_response }}"]
      working.iteration_count: 1

  # Step 2: Self-critique analysis
  - name: critique_response
    mcp_call: perform_self_critique
    inputs:
      target_response: "{{ working.response_history[-1] }}"
      original_query: "{{ query }}"
      critique_criteria: "{{ parameters.critique_criteria }}"
      critique_instructions: |
        Critically assess the response for:
        1. Factual accuracy and evidence support
        2. Logical consistency and reasoning quality
        3. Completeness and coverage of key points
        4. Potential bias or unfair assumptions
        5. Clarity and organization of information
        6. Relevance to the original question
    outputs:
      critique_analysis: "{{ response.critique }}"
      identified_issues: "{{ response.issues }}"
      improvement_suggestions: "{{ response.suggestions }}"
      quality_assessment: "{{ response.quality_score }}"
    memory_update:
      working.critique_history: "append({{ critique_analysis }})"
      working.improvement_tracking: "append({{ quality_assessment }})"

  # Step 3: Determine if improvement needed
  - name: assess_improvement_need
    mcp_call: evaluate_improvement_necessity
    inputs:
      critique_results: "{{ critique_analysis }}"
      quality_score: "{{ quality_assessment }}"
      quality_threshold: "{{ parameters.quality_threshold }}"
      iteration_count: "{{ working.iteration_count }}"
      max_iterations: "{{ parameters.max_iterations }}"
    outputs:
      needs_improvement: "{{ response.should_improve }}"
      improvement_priority: "{{ response.priority_areas }}"
      stopping_reason: "{{ response.stop_reason }}"

  # Step 4: Improve response (if needed)
  - name: improve_response
    condition: "needs_improvement == true"
    mcp_call: refine_response_based_on_critique
    inputs:
      original_response: "{{ working.response_history[-1] }}"
      critique_feedback: "{{ critique_analysis }}"
      improvement_suggestions: "{{ improvement_suggestions }}"
      priority_areas: "{{ improvement_priority }}"
      user_query: "{{ query }}"
    outputs:
      improved_response: "{{ response.content }}"
      changes_made: "{{ response.changes }}"
      improvement_rationale: "{{ response.rationale }}"
    memory_update:
      working.response_history: "append({{ improved_response }})"
      working.change_log: "append({{ changes_made }})"
      working.iteration_count: "{{ working.iteration_count + 1 }}"

  # Step 5: Validate improvement quality
  - name: validate_improvement
    condition: "needs_improvement == true"
    mcp_call: assess_improvement_quality
    inputs:
      original_response: "{{ working.response_history[-2] }}"
      improved_response: "{{ improved_response }}"
      changes_made: "{{ changes_made }}"
      quality_criteria: "{{ parameters.critique_criteria }}"
    outputs:
      improvement_score: "{{ response.improvement }}"
      validation_assessment: "{{ response.validation }}"
      quality_comparison: "{{ response.comparison }}"

  # Step 6: Continue or finalize
  - name: iteration_control
    condition: "needs_improvement == true AND improvement_score > parameters.improvement_threshold"
    action: "jump_to_step:critique_response"

# Final output preparation
finalization:
  - name: prepare_final_response
    mcp_call: synthesize_final_output
    inputs:
      response_history: "{{ working.response_history }}"
      critique_history: "{{ working.critique_history }}"
      improvement_tracking: "{{ working.improvement_tracking }}"
      change_log: "{{ working.change_log }}"
    outputs:
      final_response: "{{ response.final }}"
      reflection_summary: "{{ response.process_summary }}"
      confidence_score: "{{ response.confidence }}"
      transparency_report: "{{ response.transparency }}"

# Learning integration
learning:
  pattern_recognition:
    - critique_effectiveness: "analyze(episodic.effective_critiques)"
    - improvement_strategies: "analyze(episodic.improvement_strategies)"
    - quality_progression: "analyze(episodic.quality_patterns)"
  
  cross_context_sharing:
    - self_critique_patterns → "contexts/patterns/quality-assessment/"
    - improvement_strategies → "contexts/workflows/iterative-refinement/"
    - bias_detection → "contexts/tools/fairness-validation/"
```

## MCP Tool Calls Required

### 1. `generate_initial_response`
- Create comprehensive initial response to user query
- Apply standard generation guidelines and best practices
- Return response with generation metadata

### 2. `perform_self_critique`
- Systematically analyze response using specified criteria
- Identify specific issues, gaps, or improvement opportunities
- Provide actionable suggestions for enhancement

### 3. `evaluate_improvement_necessity`
- Determine if response meets quality thresholds
- Assess whether additional refinement would be beneficial
- Control iteration flow and stopping decisions

### 4. `refine_response_based_on_critique`
- Implement improvements based on self-critique feedback
- Document specific changes made and rationale
- Maintain response coherence while addressing issues

### 5. `assess_improvement_quality`
- Compare improved response to original version
- Quantify improvement across quality dimensions
- Validate that changes actually enhance response quality

### 6. `synthesize_final_output`
- Prepare final response incorporating all improvements
- Generate transparency report showing reflection process
- Provide confidence assessment based on iteration history

## Reflection Criteria Framework

### Accuracy Assessment
- **Factual Correctness**: Verify claims against knowledge base
- **Evidence Support**: Ensure assertions backed by appropriate evidence
- **Source Reliability**: Assess credibility of referenced information

### Logical Consistency
- **Reasoning Validity**: Check logical flow and argument structure
- **Internal Coherence**: Identify contradictions or inconsistencies
- **Causal Relationships**: Verify cause-and-effect claims

### Completeness Evaluation
- **Coverage Breadth**: Assess whether key aspects addressed
- **Depth Analysis**: Determine if sufficient detail provided
- **Question Alignment**: Verify response fully answers user query

### Bias and Fairness
- **Perspective Balance**: Check for one-sided viewpoints
- **Demographic Fairness**: Identify potential gender, racial, or cultural biases
- **Assumption Validation**: Question underlying assumptions and premises

## Scaling Benefits with MCP

### Traditional Single-Call Approach
- LLM simulates entire reflection process internally
- Limited working memory constrains reflection depth
- No external validation of self-critique quality
- Black-box improvement process

### MCP Multi-Call Approach
- **5x Power Scaling**: Each reflection step gets full LLM attention
- **External Validation**: Each critique and improvement externally verifiable
- **Iterative Learning**: System learns from reflection patterns over time
- **Quality Assurance**: Early detection of self-critique errors
- **Transparency**: Complete audit trail of improvement process
- **Adaptive Stopping**: Dynamic quality thresholds based on task complexity

## Integration with Other Techniques

### Chain of Thought Enhancement
- Apply self-reflection to improve reasoning steps
- Critique logical flow and identify reasoning gaps
- Iteratively refine complex multi-step solutions

### Tree of Thoughts Validation
- Use self-reflection to evaluate branch quality
- Critique branch selection and pruning decisions
- Improve tree exploration strategies

### Graph of Thoughts Refinement
- Apply reflection to graph construction decisions
- Critique relationship identification and edge creation
- Iteratively improve graph-based reasoning quality

## Research Foundation
Based on 2024-2025 research demonstrating significant benefits:
- 75.8% reduction in toxic responses through self-reflection
- 77% reduction in gender bias with minimal quality loss
- Improved accuracy on complex reasoning tasks
- Enhanced factual correctness through iterative verification
- Better alignment with human preferences and values