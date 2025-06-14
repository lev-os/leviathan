# AI Self-Learning Research Framework

## Overview

This document describes the revolutionary self-learning system where AI tests theories by creating self-contained research experiments. Each theory becomes a complete folder with YAML definitions, supporting scripts, LLM prompts, and execution environments.

## Architecture Philosophy

### The Research Test Model
Following the ~/c/agents/dev pattern, each AI theory becomes:
- **Self-Contained**: Complete with all necessary files and context
- **Executable**: Contains AI-generated scripts that can run safely
- **Documented**: Rich prompts and rationale for LLM understanding
- **Measurable**: Built-in performance tracking and analysis
- **Evolvable**: Failure analysis leads to improved theories

### "Teaching AI to Teach Itself"
The framework enables AI to:
1. **Generate Theories**: Create novel approaches to system problems
2. **Write Test Code**: Generate scripts to validate theories
3. **Learn from Results**: Analyze successes and failures systematically
4. **Evolve Strategies**: Improve theories based on real-world testing
5. **Share Knowledge**: Create reusable patterns through embeddings

## Theory Structure (Following ~/c Model)

### Folder Organization
```
theories/
├── {theory-name}/
│   ├── context.yaml              # Main theory definition
│   ├── system_prompts/           # LLM instruction files
│   │   ├── execution.md         # How to run this theory
│   │   ├── monitoring.md        # Monitoring approach
│   │   ├── error_handling.md    # Failure recovery
│   │   └── optimization.md      # Performance tuning
│   ├── scripts/                 # AI-generated executable code
│   │   ├── main.py             # Primary implementation
│   │   ├── test.py             # Validation script
│   │   ├── monitor.sh          # System monitoring
│   │   └── cleanup.sh          # Rollback/cleanup
│   ├── docs/                   # Theory documentation
│   │   ├── rationale.md        # Why this approach
│   │   ├── expected_outcomes.md # Predicted results
│   │   ├── learning_log.md     # Discoveries and insights
│   │   └── failure_analysis.md # What went wrong
│   └── results/                # Performance and learning data
│       ├── metrics.json        # Performance measurements
│       ├── embeddings.json     # Generated pattern embeddings
│       ├── success_log.yaml    # Successful executions
│       └── failure_log.yaml    # Failed attempts
```

### Rich YAML Context Format

#### Core Theory Definition
```yaml
# theories/{theory-name}/context.yaml
theory_meta:
  id: "unique_theory_identifier"
  name: "Human-readable theory name"
  version: "1.0"
  confidence: 0.7  # AI's initial confidence (0-1)
  stage: "sandbox"  # sandbox -> testing -> production
  created_by: "llm_reasoning"
  parent_theory: null  # If evolved from another theory
  created_at: "2024-06-14T10:30:00Z"

# LLM execution guidance
llm_hints:
  execution_style: "conservative_safety_first"
  error_handling: "immediate_rollback_on_uncertainty" 
  learning_focus: "response_time_optimization"
  context_awareness: "desktop_environment_assumptions"
  risk_tolerance: "low"  # low, medium, high
  innovation_level: "incremental"  # incremental, moderate, breakthrough
```

#### File Linking System
```yaml
# Link to supporting files for LLM context
system_prompts:
  execution_strategy: "./system_prompts/execution.md"
  monitoring_approach: "./system_prompts/monitoring.md" 
  error_recovery: "./system_prompts/error_handling.md"
  optimization_hints: "./system_prompts/optimization.md"

# AI-generated executable components  
scripts:
  main_implementation: "./scripts/main.py"
  validation_test: "./scripts/test.py"
  system_monitor: "./scripts/monitor.sh"
  cleanup_rollback: "./scripts/cleanup.sh"

# Documentation and learning
docs:
  theory_rationale: "./docs/rationale.md"
  expected_results: "./docs/expected_outcomes.md"
  learning_log: "./docs/learning_log.md"
```

#### Workflow Definition
```yaml
# Executable workflow with script integration
workflow:
  initialization:
    - name: "environment_setup"
      script: "${scripts.system_monitor}"
      llm_guidance: "${system_prompts.execution_strategy}"
      timeout: "10s"
      
  execution:
    - name: "main_theory_test"
      script: "${scripts.main_implementation}"
      llm_guidance: "${system_prompts.monitoring_approach}"
      timeout: "30s"
      success_criteria:
        - "exit_code == 0"
        - "response_time < 1.0s"
        - "no_system_impact"
        
  validation:
    - name: "result_verification"
      script: "${scripts.validation_test}"
      llm_guidance: "${system_prompts.optimization_hints}"
      
  cleanup:
    - name: "safe_rollback"
      script: "${scripts.cleanup_rollback}"
      llm_guidance: "${system_prompts.error_recovery}"
      always_run: true
```

#### Research Parameters
```yaml
# Success/failure criteria for theory evaluation
research_parameters:
  success_criteria:
    response_time: "< 1.0 seconds"
    accuracy: "> 0.95"
    user_satisfaction: "> 0.8"
    system_stability: "no_degradation"
    resource_usage: "< 5% cpu, < 100MB memory"
    
  failure_conditions:
    false_positive_rate: "> 0.1"
    system_crashes: "> 0"
    user_complaints: "> 2"
    security_violations: "> 0"
    
  evolution_triggers:
    promote_to_testing: "success_rate > 0.7 AND trials > 10"
    promote_to_production: "success_rate > 0.85 AND trials > 50"
    revise_theory: "success_rate < 0.6 OR user_satisfaction < 0.7"
    retire_theory: "consecutive_failures > 10 OR security_risk"

# Embedding generation for pattern learning
embedding_config:
  syscall_patterns:
    focus_syscalls: ["getloadavg", "notify_send", "mmap", "select"]
    context_dimensions: ["system_load", "user_presence", "time_of_day"]
    pattern_type: "resource_monitoring"
    
  theory_characteristics:
    innovation_score: 3.2  # 1-10 scale
    complexity_level: 2.1  # 1-10 scale  
    risk_assessment: 1.8   # 1-10 scale
    adaptability: 6.7      # How well it handles different contexts
```

#### Cross-Theory Learning
```yaml
# Relationships with other theories
relationship_map:
  competes_with: ["alternative_theory_1", "alternative_theory_2"]
  collaborates_with: ["complementary_theory_1"]
  evolved_from: "parent_theory_id"  # If this is an evolution
  spawned_theories: []  # Theories that evolved from this one
  
# Learning from other theories
cross_pollination:
  successful_patterns_adopted: ["pattern_1", "pattern_2"]
  failed_patterns_avoided: ["antipattern_1", "antipattern_2"]
  novel_combinations: ["innovation_1"]
```

## Code Execution Environment

### Sandbox Safety
```yaml
execution_environment:
  container: "docker"
  base_image: "alpine:latest"
  resource_limits:
    max_cpu: "5%"      # Maximum CPU usage
    max_memory: "100MB" # Maximum memory allocation
    max_disk: "50MB"   # Maximum disk usage
    max_execution_time: "30s"  # Timeout for safety
    
  allowed_syscalls:
    - "getloadavg"     # CPU monitoring
    - "notify_send"    # User notifications  
    - "file_io"        # Basic file operations
    - "network_basic"  # Limited network access
    
  prohibited_actions:
    - "kernel_modifications"
    - "security_changes"
    - "user_account_changes"
    - "system_service_changes"
    
  rollback_triggers:
    - "timeout_exceeded"
    - "resource_limit_hit"
    - "security_violation"
    - "system_instability_detected"
```

### Script Generation Guidelines
```yaml
ai_script_generation:
  language_preferences:
    primary: "python3"    # Most flexible and safe
    secondary: "bash"     # For system operations
    avoid: ["c", "rust"]  # Compilation complexity
    
  coding_standards:
    error_handling: "comprehensive"  # Try/catch everything
    logging: "verbose"               # Log all operations
    validation: "input_sanitization" # Validate all inputs
    documentation: "inline_comments" # Self-documenting code
    
  safety_patterns:
    - "timeout_all_operations"
    - "validate_before_execute"
    - "log_before_and_after"
    - "graceful_failure_handling"
    - "resource_cleanup_guaranteed"
```

## Theory Evolution Process

### Success Path
1. **Theory Creation**: AI generates complete theory folder
2. **Sandbox Testing**: Safe execution with performance measurement
3. **Result Analysis**: Success rate and user satisfaction tracking
4. **Embedding Generation**: Extract successful patterns to vector store
5. **Promotion**: Move through stages (sandbox → testing → production)
6. **Template Creation**: Successful theories become patterns for new theories

### Failure Path  
1. **Failure Detection**: Performance criteria not met or errors occur
2. **Root Cause Analysis**: AI analyzes logs and failure patterns
3. **Theory Revision**: Generate improved version based on learnings
4. **Cross-Theory Learning**: Share failure patterns to avoid repetition
5. **Retirement Decision**: Persistent failures lead to theory retirement

### Learning Accumulation
```yaml
knowledge_accumulation:
  pattern_library:
    successful_syscall_sequences: "embeddings database"
    effective_error_handling: "prompt library"
    context_adaptation_strategies: "workflow templates"
    
  failure_wisdom:
    common_antipatterns: "what not to do"
    context_limitations: "when approaches fail"
    safety_violations: "absolute avoid list"
    
  innovation_seeds:
    novel_combinations: "unexplored pattern merges"
    breakthrough_opportunities: "high-risk, high-reward ideas"
    adaptation_possibilities: "context-specific optimizations"
```

## Integration with Multi-Provider LLM System

### Provider Routing for Theory Tasks
```yaml
llm_provider_routing:
  theory_generation:
    provider: "claude"  # Best at creative reasoning
    model: "claude-3-5-sonnet"
    context: "breakthrough innovation focus"
    
  script_generation:
    provider: "openai"  # Strong at code generation
    model: "gpt-4"
    context: "safe, well-documented code"
    
  failure_analysis:
    provider: "local_ollama"  # Fast iteration for debugging
    model: "llama3.2:1b"
    context: "systematic error analysis"
    
  pattern_recognition:
    provider: "embedding_model"  # Specialized for similarity
    model: "text-embedding-ada-002"
    context: "pattern matching and clustering"
```

## Research Applications

### Immediate Applications
1. **System Optimization**: CPU, memory, disk, network tuning
2. **User Experience**: Notification strategies, interface adaptation
3. **Security**: Anomaly detection, threat response
4. **Performance**: Predictive optimization, resource allocation

### Research Questions
1. **Can AI discover novel system optimization strategies?**
2. **How quickly can AI adapt to different system contexts?**
3. **What patterns emerge in successful vs failed theories?**
4. **Can AI develop intuition about system behavior?**

### Success Metrics
- **Innovation Rate**: Novel strategies discovered per week
- **Adaptation Speed**: Time to optimize for new contexts  
- **Knowledge Retention**: Reuse of successful patterns
- **Failure Learning**: Reduction in repeated mistakes

## Getting Started

### Creating Your First Theory
1. Use the theory template to create folder structure
2. Define theory in context.yaml with clear success criteria
3. Let AI generate supporting scripts and prompts
4. Execute in sandbox environment with monitoring
5. Analyze results and iterate based on learnings

### Best Practices
- Start with simple, low-risk theories
- Define clear success/failure criteria
- Enable comprehensive logging and monitoring
- Review and learn from both successes and failures
- Share successful patterns across theories

This framework represents a breakthrough in AI self-learning: instead of training on static datasets, the AI learns by doing real experiments and accumulating practical wisdom about system behavior.