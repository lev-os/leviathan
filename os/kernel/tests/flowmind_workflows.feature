# FlowMind BDD Workflows - Leviathan OS AI-Native System
# Natural language system instructions that self-evolve into executable YAML

Feature: FlowMind Natural Language System Instructions
  As an AI-native operating system
  I want to understand natural language instructions
  So that I can autonomously manage system resources with human-like reasoning

  Background:
    Given Leviathan OS is running with Cognitive Parliament active
    And FlowMind natural language parser is initialized
    And the system has baseline metrics: CPU 10%, Memory 15%, Load 0.5

  @critical @cpu-management
  Scenario: Emergency CPU Protection with Document Safety
    Given the user instruction: "if cpu is 90% quickly resolve safely saving all open documents and call me"
    When FlowMind parses this natural language instruction
    Then it should generate the following YAML workflow:
      """
      trigger:
        condition: "cpu_usage >= 90"
        urgency: "critical"
        safety_mode: true
      
      cognitive_parliament:
        primary_personality: "sfj_caregiver"  # Safety-first approach
        consensus_required: false  # Emergency override
        reasoning: "User prioritizes document safety over performance"
      
      workflow:
        - name: "emergency_document_save"
          type: "document_protection"
          actions:
            - save_all_open_documents
            - backup_unsaved_work
            - notify_applications_graceful_shutdown
          
        - name: "intelligent_cpu_reduction"
          type: "resource_management"
          actions:
            - suspend_non_critical_processes
            - reduce_background_services
            - throttle_cpu_intensive_tasks
            
        - name: "user_notification"
          type: "communication"
          actions:
            - send_alert: "CPU emergency resolved, documents saved"
            - log_incident_report
            - await_user_acknowledgment
      """

  @stress-testing @flowmind-evolution
  Scenario: FlowMind Self-Improving Language Understanding
    Given a new natural language instruction: "when memory gets tight, be smart about it but don't break anything"
    When FlowMind encounters this ambiguous instruction
    Then it should:
      - Use Cognitive Parliament to interpret "tight" and "smart"
      - Generate multiple workflow interpretations
      - Ask for clarification through the dashboard
      - Learn from user feedback to improve future parsing
    And the generated YAML should include uncertainty markers:
      """
      trigger:
        condition: "memory_usage >= ${TIGHT_THRESHOLD}"  # Learning parameter
        confidence: 0.7  # Uncertainty about "tight"
      
      interpretation_options:
        conservative: "memory_usage >= 80"
        moderate: "memory_usage >= 85" 
        aggressive: "memory_usage >= 90"
      
      learning_feedback:
        request_clarification: true
        adaptation_mode: "active"
      """

  @personality-driven @decision-making
  Scenario: Cognitive Parliament Workflow Interpretation
    Given the instruction: "be aggressive about network optimization but gentle with user processes"
    When FlowMind analyzes personality requirements
    Then it should assign:
      - Network optimization to "nfp_advocate" (aggressive innovation)
      - Process management to "sfj_caregiver" (gentle user focus)
    And generate dual-personality workflow:
      """
      cognitive_assignment:
        network_tasks:
          personality: "nfp_advocate"
          approach: "aggressive"
          reasoning: "Innovation-focused for optimization"
        
        process_tasks:
          personality: "sfj_caregiver" 
          approach: "gentle"
          reasoning: "User experience protection"
      """

  @real-time @adaptive
  Scenario: Dynamic Workflow Evolution During Execution
    Given an active workflow: "gradually reduce memory usage over 5 minutes"
    When system conditions change mid-execution
    And new instruction arrives: "actually, speed this up, emergency situation"
    Then FlowMind should:
      - Pause current workflow
      - Re-evaluate with new urgency context
      - Dynamically adjust timing parameters
      - Continue with modified approach
    And the workflow YAML should self-modify:
      """
      runtime_adaptation:
        original_duration: "5 minutes"
        adjusted_duration: "30 seconds"
        escalation_reason: "emergency_override"
        personality_shift: "sfj_caregiver -> nfp_advocate"
      """

  @learning @zero-config
  Scenario: Zero-Config Learning from Natural Language Patterns
    Given FlowMind has processed these instructions over time:
      - "if disk space is low, clean up temporary files"
      - "when disk gets full, remove temp files and caches"  
      - "clean temporary files if storage runs out"
    When a new similar instruction arrives: "handle low disk space intelligently"
    Then FlowMind should automatically recognize the pattern
    And generate workflow without explicit instructions:
      """
      pattern_recognition:
        learned_pattern: "disk_space_cleanup"
        confidence: 0.95
        auto_generated: true
        
      inferred_workflow:
        trigger: "disk_usage >= 85"
        actions:
          - clean_temporary_files
          - clear_system_caches  
          - remove_old_logs
          - compress_unused_files
      """

  @integration @end-to-end
  Scenario: Complete Natural Language to System Action Pipeline
    Given the user types: "monitor bitcoin price and if it drops 10% quickly secure my trading positions"
    When FlowMind processes this complex multi-domain instruction
    Then it should:
      - Parse multiple triggers (price monitoring + percentage drop)
      - Identify external API requirements (bitcoin price)
      - Recognize domain-specific actions (trading positions)
      - Generate safety-first approach via Cognitive Parliament
    And produce executable YAML:
      """
      external_integrations:
        - name: "bitcoin_price_monitor"
          api: "coinbase_pro"
          interval: "10_seconds"
          
      triggers:
        - condition: "bitcoin_price_drop >= 10%"
          timeframe: "5_minutes"  # Avoid false positives
          
      cognitive_analysis:
        primary_concern: "financial_safety"
        personality: "ntj_strategist"  # Strategic financial decisions
        risk_assessment: "high"
        
      workflow:
        - secure_trading_positions
        - stop_active_orders
        - calculate_portfolio_impact
        - notify_user_with_options
      """

  @error-handling @robust
  Scenario: Handling Impossible or Conflicting Instructions
    Given conflicting instruction: "maximize CPU performance while minimizing CPU usage"
    When FlowMind detects logical contradictions
    Then it should:
      - Identify the conflict using logical reasoning
      - Generate clarification request
      - Suggest alternative interpretations
      - Refuse to create impossible workflows
    And provide helpful feedback:
      """
      conflict_detected:
        type: "logical_contradiction"
        elements: ["maximize CPU performance", "minimize CPU usage"]
        
      suggestions:
        - "Optimize CPU efficiency (better performance per watt)"
        - "Maximize performance only when needed"
        - "Minimize idle CPU usage while maintaining performance capacity"
        
      clarification_request:
        message: "These goals conflict. Did you mean CPU efficiency optimization?"
      """

  @performance @real-time
  Scenario: FlowMind Performance Under Load
    Given Leviathan OS is under heavy system load
    And FlowMind receives: "emergency optimize everything now"
    When parsing occurs during high CPU/memory pressure
    Then FlowMind should:
      - Complete parsing in under 100ms
      - Use cached pattern recognition
      - Generate minimal but effective workflow
      - Prioritize immediate system relief
    And maintain response time SLA of <100ms for emergency instructions

  @extensibility @plugin-system
  Scenario: Domain-Specific Language Extensions
    Given a user instruction contains domain-specific terms: "if my kubernetes cluster is unhealthy, scale down the frontend pods"
    When FlowMind encounters unknown domain vocabulary
    Then it should:
      - Recognize this as a domain extension opportunity
      - Query available plugins or knowledge bases
      - Learn the domain-specific mappings
      - Generate appropriate YAML workflow
    And extend its vocabulary:
      """
      domain_extension:
        domain: "kubernetes"
        learned_terms:
          - "cluster": "system_group"
          - "unhealthy": "resource_exhausted" 
          - "scale_down": "reduce_instance_count"
          - "frontend_pods": "user_facing_services"
          
      generated_workflow:
        trigger: "kubernetes_cluster_health < threshold"
        actions:
          - reduce_frontend_pod_count
          - maintain_backend_services
          - monitor_recovery_status
      """