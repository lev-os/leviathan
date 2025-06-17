# FlowMind Complete Programming Lexicon
## Comprehensive Control Flow Language Specification

*Based on research of pypyr, Argo Workflows, GitHub Actions, and JSON Logic*

---

## Core Language Philosophy

FlowMind combines:
1. **YAML's Natural Structure** - Variables, arrays, objects natively supported
2. **Traditional Programming Constructs** - if/else, loops, recursion, functions
3. **Semantic Reasoning** - Natural language conditions mixed with logical operators
4. **Proven Patterns** - Syntax inspired by pypyr, Argo, GitHub Actions

---

## Complete Lexicon

### 1. Variables & Data Types
```yaml
# FlowMind variables - full YAML data type support
flowmind:
  version: "1.0"
  
  variables:
    # Scalars
    user_name: "John Doe"
    urgency_score: 0.8
    is_premium: true
    
    # Arrays/Lists  
    stakeholders: ["engineering", "product", "legal"]
    priorities: [1, 2, 3, 4, 5]
    
    # Objects/Maps
    user_context:
      tier: "premium"
      location: "US"
      sentiment: "positive"
      
    # Dynamic variables from input/context
    emotion_level: "@semantic.analyze(input.text, 'emotional_intensity')"
    complexity_score: "@input.complexity || 0.5"
    
    # Computed variables
    risk_level: "@computed(urgency_score * complexity_score)"
    
    # Environment variables
    api_key: "@env.OPENAI_API_KEY"
    debug_mode: "@env.DEBUG || false"
```

### 2. Traditional Control Flow

#### If/Else/ElseIf
```yaml
flow:
  # Simple if
  - if: "urgency_score > 0.8"
    then:
      include: "ref/patterns/urgent_response.md"
      
  # If/else
  - if: "user_context.tier == 'premium'"
    then:
      include: "ref/patterns/premium_support.md"
    else:
      include: "ref/patterns/standard_support.md"
      
  # If/elif/else chain
  - if: "urgency_score > 0.9"
    then:
      workflow: "crisis_response"
    elif: "urgency_score > 0.7" 
    then:
      workflow: "priority_handling"
    elif: "urgency_score > 0.4"
    then:
      workflow: "standard_process"
    else:
      workflow: "low_priority_queue"
      
  # Complex conditions with logical operators
  - if: "is_premium AND (urgency_score > 0.5 OR stakeholders.length > 3)"
    then:
      include: "ref/patterns/escalated_support.md"
```

#### Semantic If/Else
```yaml
flow:
  # Semantic conditions
  - if_semantic: "user seems frustrated OR angry"
    confidence_threshold: 0.8
    then:
      include: "ref/patterns/de_escalation.md"
      tone: "empathetic"
    else:
      include: "ref/patterns/standard_response.md"
      
  # Mixed traditional + semantic
  - if: "user_context.tier == 'premium'"
    and_semantic: "user expresses dissatisfaction"
    then:
      escalate_to: "senior_support"
      include: "ref/patterns/retention_focus.md"
```

### 3. Loops & Iteration

#### For Loops
```yaml
flow:
  # For each with arrays
  - for_each: "stakeholder in stakeholders"
    do:
      include: "ref/experts/${stakeholder}_expert.md"
      collect: "stakeholder_opinions"
      
  # For each with objects
  - for_each: "key, value in user_context"
    do:
      log: "Processing ${key}: ${value}"
      
  # For each with range
  - for_each: "i in range(1, 5)"
    do:
      include: "ref/patterns/iteration_${i}.md"
      
  # For each with filter
  - for_each: "stakeholder in stakeholders"
    where: "stakeholder.priority > 3"
    do:
      include: "ref/experts/${stakeholder.name}_expert.md"
      
  # Nested for loops
  - for_each: "department in departments"
    do:
      - for_each: "person in department.members"
        do:
          notify: "${person.email}"
          include: "ref/notifications/department_update.md"
```

#### While Loops
```yaml
flow:
  # Basic while loop
  - while: "consensus_score < 0.8"
    max_iterations: 10
    do:
      include: "ref/patterns/consensus_building.md"
      update_variable: "consensus_score"
      
  # While with semantic condition
  - while: "issue_unresolved"
    and_while_semantic: "user remains engaged"
    max_iterations: 5
    timeout: "30 minutes"
    do:
      include: "ref/patterns/iterative_problem_solving.md"
      collect: "solution_attempts"
      
  # While with complex exit conditions
  - while: 
      any_of:
        - "attempts < max_attempts"
        - "confidence_score < target_confidence"
      and_not:
        - "error_count > 3"
        - semantic: "user wants to stop"
    do:
      include: "ref/patterns/retry_logic.md"
      increment: "attempts"
```

#### Do-While Pattern
```yaml
flow:
  # Execute at least once, then check condition
  - do:
      include: "ref/patterns/initial_analysis.md"
      update_variable: "analysis_complete"
    while: "analysis_complete == false AND attempts < 3"
```

### 4. Recursion

#### Simple Recursion
```yaml
flow:
  - name: "recursive_analysis"
    recursive: true
    max_depth: 5
    
    steps:
      - include: "ref/patterns/analyze_layer.md"
      
      - if: "analysis.requires_deeper_dive AND depth < max_depth"
        then:
          call: "recursive_analysis"  # Self-reference
          with:
            input: "analysis.next_level_input"
            depth: "@current_depth + 1"
            
      - else:
        return: "analysis.final_result"
```

#### Recursive Tree Traversal
```yaml
flow:
  - name: "process_decision_tree"
    recursive: true
    
    steps:
      - include: "ref/patterns/process_node.md"
      
      - for_each: "child in current_node.children"
        do:
          call: "process_decision_tree"
          with:
            current_node: "${child}"
            
      - collect_results: "all_child_results"
      - return: "synthesized_result"
```

#### Mutual Recursion
```yaml
flows:
  validate_business_logic:
    steps:
      - include: "ref/patterns/business_validation.md"
      - if: "requires_technical_check"
        then:
          call: "validate_technical_logic"
          
  validate_technical_logic:
    steps:
      - include: "ref/patterns/technical_validation.md"  
      - if: "impacts_business_rules"
        then:
          call: "validate_business_logic"
```

### 5. Functions & Reusability

#### Function Definition
```yaml
functions:
  analyze_sentiment:
    parameters:
      - text: "string"
      - threshold: "number = 0.7"
    returns: "object"
    
    steps:
      - semantic_analysis: "@semantic.analyze(text, 'sentiment')"
      - confidence_check: "semantic_analysis.confidence > threshold"
      - return:
          sentiment: "semantic_analysis.sentiment"
          confidence: "semantic_analysis.confidence"
          is_reliable: "confidence_check"
          
  send_notification:
    parameters:
      - recipient: "string"
      - message: "string"
      - priority: "string = 'normal'"
    
    steps:
      - if: "priority == 'urgent'"
        then:
          channel: "sms"
        else:
          channel: "email"
          
      - action: "send_message"
        to: "${recipient}"
        via: "${channel}"
        content: "${message}"
```

#### Function Calls
```yaml
flow:
  - call: "analyze_sentiment"
    with:
      text: "@input.user_message"
      threshold: 0.8
    store_result: "sentiment_analysis"
    
  - if: "sentiment_analysis.sentiment == 'negative'"
    then:
      call: "send_notification"
      with:
        recipient: "support@company.com"
        message: "Negative sentiment detected: ${input.user_message}"
        priority: "urgent"
```

### 6. Advanced Control Structures

#### Switch/Case Pattern
```yaml
flow:
  - switch: "user_context.tier"
    cases:
      premium:
        include: "ref/patterns/premium_experience.md"
        sla: "1 hour"
        
      business:
        include: "ref/patterns/business_experience.md" 
        sla: "4 hours"
        
      standard:
        include: "ref/patterns/standard_experience.md"
        sla: "24 hours"
        
    default:
      include: "ref/patterns/basic_experience.md"
      sla: "48 hours"
```

#### Try/Catch/Finally
```yaml
flow:
  - try:
      steps:
        - include: "ref/patterns/risky_operation.md"
        - call: "external_api"
          
    catch:
      - error_type: "APIError"
        then:
          include: "ref/patterns/api_fallback.md"
          
      - error_type: "TimeoutError"
        then:
          include: "ref/patterns/timeout_handling.md"
          
      - default:
          include: "ref/patterns/generic_error.md"
          log_error: true
          
    finally:
      include: "ref/patterns/cleanup_operations.md"
```

#### Parallel Execution
```yaml
flow:
  - parallel:
      max_concurrency: 3
      
      tasks:
        - name: "legal_review"
          include: "ref/experts/legal_expert.md"
          
        - name: "technical_analysis"  
          include: "ref/experts/technical_expert.md"
          
        - name: "business_impact"
          include: "ref/experts/business_expert.md"
          
      collect_results: "expert_opinions"
      
  - wait_for: "all_tasks"  # or "any_task" or "2_tasks"
  
  - include: "ref/patterns/synthesize_opinions.md"
    with:
      opinions: "expert_opinions"
```

### 7. Semantic Control Flow Extensions

#### Semantic Loops
```yaml
flow:
  # Loop until semantic condition met
  - while_semantic: "user still has questions"
    confidence_threshold: 0.8
    max_iterations: 10
    do:
      include: "ref/patterns/answer_questions.md"
      collect: "qa_history"
      
  # For each with semantic filtering
  - for_each: "concern in stakeholder_concerns"
    where_semantic: "concern is valid and actionable"
    confidence_threshold: 0.7
    do:
      include: "ref/patterns/address_concern.md"
```

#### Semantic Switch
```yaml
flow:
  - switch_semantic: "primary user intent"
    confidence_threshold: 0.8
    
    cases:
      "wants to make a complaint":
        workflow: "complaint_handling"
        
      "needs technical support":
        workflow: "technical_support"
        
      "asking about billing":
        workflow: "billing_support"
        
    low_confidence_fallback:
      include: "ref/patterns/clarification_request.md"
```

### 8. Variable Scoping & State Management

#### Local vs Global Variables  
```yaml
flowmind:
  # Global variables
  global_variables:
    company_name: "Acme Corp"
    support_email: "support@acme.com"
    
  # Flow-level variables
  variables:
    session_id: "@generate_uuid()"
    start_time: "@now()"
    
flow:
  - name: "process_request"
    local_variables:
      processing_start: "@now()"
      temp_data: {}
      
    steps:
      - action: "log"
        message: "Processing ${session_id} at ${processing_start}"
```

#### State Persistence
```yaml
flow:
  - persist_state:
      key: "session_${session_id}"
      data:
        progress: "step_2_complete"
        results: "analysis_results"
        context: "user_context"
      ttl: "1 hour"
      
  - restore_state:
      key: "session_${session_id}"
      into: "previous_session"
      
  - if: "previous_session.exists"
    then:
      continue_from: "previous_session.progress"
```

### 9. Integration with External Systems

#### API Calls & External Scripts
```yaml
flow:
  # Call external APIs
  - http_request:
      method: "POST"
      url: "https://api.service.com/analyze"
      headers:
        Authorization: "Bearer ${api_key}"
      body:
        text: "${input.text}"
      store_response: "api_result"
      
  # Execute external scripts
  - execute_script:
      language: "python"
      script: "./scripts/data_analysis.py"
      args:
        - "--input"
        - "${input.data_file}"
      capture_output: "analysis_output"
      
  # Call JavaScript/Python functions
  - execute_function:
      runtime: "node"
      file: "./lib/semantic_analyzer.js"
      function: "analyzeText"
      params:
        text: "${input.text}"
        options: { model: "gpt-4" }
      store_result: "js_analysis"
```

### 10. Schema Validation & Type Safety

#### Input/Output Schema Definition
```yaml
flowmind:
  input_schema:
    type: "object"
    required: ["user_message", "context"]
    properties:
      user_message:
        type: "string"
        maxLength: 1000
      context:
        type: "object"
        properties:
          tier: { type: "string", enum: ["basic", "premium", "enterprise"] }
          urgency: { type: "number", minimum: 0, maximum: 1 }
          
  output_schema:
    type: "object"
    required: ["response", "metadata"]
    properties:
      response:
        type: "string"
      metadata:
        type: "object"
        properties:
          confidence: { type: "number" }
          processing_time: { type: "number" }
```

#### Runtime Validation
```yaml
flow:
  - validate_input:
      schema: "@input_schema"
      data: "@input"
      on_error: "return_validation_error"
      
  - validate_variable:
      variable: "urgency_score"
      type: "number"
      range: [0, 1]
      
  - validate_semantic_result:
      result: "sentiment_analysis"
      required_confidence: 0.7
      fallback: "request_human_review"
```

---

## Implementation Library Recommendations

### JavaScript/Node.js
```yaml
recommended_libraries:
  yaml_parsing: "js-yaml"
  schema_validation: "ajv"
  semantic_evaluation: "@anthropic-ai/sdk"
  http_requests: "axios"
  script_execution: "child_process"
  
  # Example integration
  example_usage: |
    import yaml from 'js-yaml'
    import Ajv from 'ajv'
    import { FlowMindEngine } from 'flowsense-js'
    
    const engine = new FlowMindEngine({
      semanticProvider: 'anthropic',
      cache: 'redis://localhost:6379'
    })
```

### Python
```yaml
recommended_libraries:
  yaml_parsing: "PyYAML"
  schema_validation: "jsonschema" 
  semantic_evaluation: "anthropic"
  http_requests: "requests"
  script_execution: "subprocess"
  
  # Example integration  
  example_usage: |
    import yaml
    from jsonschema import validate
    from flowsense import FlowMindEngine
    
    engine = FlowMindEngine(
        semantic_provider='anthropic',
        cache_backend='redis'
    )
```

### Go
```yaml
recommended_libraries:
  yaml_parsing: "gopkg.in/yaml.v3"
  schema_validation: "github.com/xeipuuv/gojsonschema"
  http_requests: "net/http"
  json_logic: "github.com/diegoholiveira/jsonlogic"
```

---

## Complete Example: Customer Support Workflow

```yaml
flowmind:
  version: "1.0"
  name: "intelligent_customer_support"
  
  input_schema:
    type: "object"
    required: ["user_message", "user_context"]
    
  variables:
    session_id: "@generate_uuid()"
    start_time: "@now()"
    max_escalation_attempts: 3
    escalation_count: 0
    
  functions:
    escalate_to_human:
      parameters:
        - reason: "string"
        - priority: "string = 'normal'"
      steps:
        - increment: "escalation_count"
        - if: "escalation_count > max_escalation_attempts"
          then:
            call: "emergency_escalation"
        - action: "assign_to_human"
          reason: "${reason}"
          priority: "${priority}"

flow:
  # Initial analysis
  - validate_input:
      schema: "@input_schema"
      
  - parallel:
      tasks:
        - name: "sentiment_analysis"
          semantic_analysis: "@semantic.analyze(input.user_message, 'sentiment')"
          
        - name: "intent_detection"  
          semantic_analysis: "@semantic.analyze(input.user_message, 'intent')"
          
        - name: "urgency_assessment"
          semantic_analysis: "@semantic.analyze(input.user_message, 'urgency')"
          
  # Main processing flow
  - if_semantic: "user is extremely angry OR threatening"
    confidence_threshold: 0.9
    then:
      call: "escalate_to_human"
      with:
        reason: "high_emotion_detected"
        priority: "urgent"
      stop_processing: true
      
  - switch_semantic: "primary user intent"
    confidence_threshold: 0.8
    
    cases:
      "technical support request":
        workflow: "technical_support_flow"
        
      "billing question":
        workflow: "billing_support_flow"
        
      "complaint or feedback":
        workflow: "complaint_handling_flow"
        
    default:
      include: "ref/patterns/general_inquiry.md"
      
  # Iterative problem solving
  - name: "resolution_loop"
    while: "issue_unresolved"
    and_while_semantic: "user remains engaged"
    max_iterations: 5
    
    do:
      - include: "ref/patterns/iterative_problem_solving.md"
      
      - if_semantic: "user indicates problem is solved"
        then:
          set_variable: "issue_unresolved = false"
          
      - elif_semantic: "user is getting frustrated"
        then:
          call: "escalate_to_human"
          with:
            reason: "user_frustration_detected"
            
  # Final response and feedback
  - include: "ref/patterns/wrap_up_conversation.md"
  
  - try:
      steps:
        - call: "collect_feedback"
    catch:
      - default:
          log: "Feedback collection failed: ${error}"
    finally:
      - persist_state:
          key: "session_${session_id}"
          data:
            resolution_successful: "issue_unresolved == false"
            escalated: "escalation_count > 0"
            user_satisfaction: "@feedback_score || null"
```

This comprehensive lexicon provides all the programming constructs needed for FlowMind while maintaining the semantic reasoning capabilities that make it unique. The syntax draws from proven YAML workflow engines while adding the innovative semantic layer that bridges human intent and machine precision.