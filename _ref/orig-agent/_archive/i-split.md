# Recursive Task Splitting Based on Confidence

## Core Concept

**Complexity = Confidence to finish in 1 shot (1-10 scale)**
- 8+ = Execute directly
- Under 8 = Split recursively until all subtasks are 8+

**CEO Exception**: CEO creates tasks but doesn't split them. If CEO says "build dashboard with 20 features", it's 1 root task with 8 sub-tasks. Keep it simple.

## The Confidence Prompt Pattern

### **Agent Analysis Mode System Prompt**
```yaml
analysis_mode_instructions: |
  When analyzing any request, always assess your confidence to complete it in one shot:
  
  Confidence Scale (1-10):
  10: "I could do this with my eyes closed"
  9: "Very straightforward, clear path forward"
  8: "I'm confident I can complete this without issues" ← EXECUTION THRESHOLD
  7: "Mostly clear but has 1-2 uncertain areas"
  6: "Several unknowns or dependencies"
  5: "Multiple complex parts, high coordination needed"
  4: "Significant unknowns, many moving pieces"
  3: "Very complex, many dependencies and uncertainties"
  2: "Extremely complex, unclear requirements"
  1: "No idea how to approach this"
  
  RULE: If confidence < 8, you MUST split the task into smaller pieces.
  
  For each subtask, re-assess confidence. Continue splitting until all pieces are 8+.
  
  When splitting, think:
  - What's the smallest unit I can complete with high confidence?
  - What dependencies exist between pieces?
  - What unknown requirements need clarification first?
  - What technical spikes or research are needed?
```

## Example: Complex Request Flow

### **User Request**: "Build a user dashboard with real-time analytics"

### **CEO Analysis**
```yaml
ceo_task_creation:
  request: "Build user dashboard with real-time analytics"
  
  analysis: |
    Complex dashboard with multiple features:
    - User authentication
    - Real-time data display
    - Analytics charts
    - Data filtering
    - Export functionality
    - Mobile responsive
    - Performance optimization
    - User preferences
    
  action: "CREATE SINGLE TASK"
  
  task_created:
    title: "Build user dashboard with real-time analytics"
    features: [authentication, real-time_data, charts, filtering, export, responsive, performance, preferences]
    assigned_to: "architect" # Architect will assess and split if needed
```

### **Architect Receives Task and Splits**
```yaml
architect_confidence_assessment:
  task: "Build user dashboard with real-time analytics"
  confidence: 4/10
  reasoning: "Too many features and unknowns for single implementation"
  
  action: "SPLIT INTO MANAGEABLE PIECES"
  
  subtasks:
    - "Research and choose dashboard tech stack"
    - "Set up basic dashboard layout and navigation"  
    - "Implement user authentication system"
    - "Create real-time data streaming backend"
    - "Build analytics chart components"
    - "Add data filtering and search"
    - "Implement export functionality"
    - "Make dashboard mobile responsive"
    
  # Each subtask gets confidence check
  confidence_recheck:
    "Research and choose dashboard tech stack": 9/10 # Ready
    "Set up basic dashboard layout": 8/10 # Ready
    "Implement user authentication": 6/10 # Needs further split
```

### **Architect Analysis of Split Tasks**
```yaml
architect_assessment:
  task: "Choose UI framework and component library"
  confidence: 8/10
  reasoning: "Straightforward technology evaluation task"
  action: "READY FOR EXECUTION"
  
  estimated_time: "2 hours"
  deliverables:
    - "Framework comparison analysis"
    - "Recommendation with rationale"
    - "Setup instructions"
```

## Recursive Splitting System Prompt

### **Universal Agent Splitting Instructions**
```yaml
splitting_protocol: |
  # MANDATORY CONFIDENCE CHECK
  
  Before starting any task, you MUST assess:
  
  ## Confidence Assessment
  Rate your confidence to complete this task in one focused session (1-10):
  
  **If confidence < 8:**
  1. Identify what makes this complex:
     - Multiple distinct work streams?
     - Unknown requirements or dependencies?
     - Technical unknowns that need research?
     - Integration points with unclear interfaces?
     - Large scope that could be broken down?
  
  2. Split into smaller, more confident pieces:
     - Each piece should be completable in 1-4 hours
     - Each piece should have clear inputs and outputs
     - Each piece should minimize dependencies
     - Research/spike tasks should be separate from implementation
  
  3. Re-assess each piece:
     - Rate confidence for each subtask
     - If any subtask < 8, split it further
     - Continue until all pieces are 8+ confidence
  
  ## Splitting Examples
  
  **Complex Task**: "Implement user authentication"
  **Confidence**: 5/10 (many approaches, integration unclear)
  
  **Split Into**:
  - "Research authentication approaches and choose strategy" (9/10)
  - "Set up authentication provider (Firebase/Auth0)" (8/10)
  - "Create login/signup UI components" (9/10)
  - "Implement protected route middleware" (8/10)
  - "Add user session management" (8/10)
  - "Test authentication flow end-to-end" (8/10)
  
  **Complex Task**: "Build real-time chat"
  **Confidence**: 4/10 (many technical unknowns)
  
  **Split Into**:
  - "Research WebSocket vs Server-Sent Events approach" (9/10)
  - "Create basic chat UI components" (9/10)
  - "Implement message sending/receiving backend" (7/10) → SPLIT FURTHER
    - "Set up WebSocket server" (8/10)
    - "Create message persistence layer" (8/10)
    - "Implement real-time message broadcasting" (8/10)
  - "Add typing indicators and online status" (8/10)
  - "Implement chat history and pagination" (8/10)
  
  ## Output Format
  
  When splitting, always output:
  ```yaml
  original_task: "..."
  confidence: X/10
  split_reasoning: "Why this needed to be split"
  
  subtasks:
    - id: "subtask-1"
      title: "..."
      confidence: X/10
      estimated_time: "X hours"
      dependencies: [...]
      ready_for_execution: true/false
      
    - id: "subtask-2"
      title: "..."
      confidence: X/10
      # ... continue for each subtask
  ```
```

## Agent-Specific Splitting Patterns

### **Architect Splitting**
```yaml
architect_patterns:
  low_confidence_triggers:
    - "Multiple architectural decisions needed"
    - "Integration points unclear"
    - "Performance requirements undefined"
    - "Technology choices not made"
    
  typical_splits:
    - "Research and spike tasks first"
    - "Architecture decisions before implementation"
    - "Foundation before features"
    - "Integration points defined before building"
```

### **Dev Splitting** 
```yaml
dev_patterns:
  low_confidence_triggers:
    - "Multiple features in one task"
    - "Complex business logic"
    - "Many edge cases to handle"
    - "Integration with multiple systems"
    
  typical_splits:
    - "Happy path implementation first"
    - "Error handling as separate tasks"
    - "Each integration point as separate task"
    - "Testing as parallel tasks"
```

### **UX Splitting**
```yaml
ux_patterns:
  low_confidence_triggers:
    - "Multiple user flows in one task"
    - "Complex interaction patterns"
    - "Multiple devices/screen sizes"
    - "Accessibility requirements unclear"
    
  typical_splits:
    - "User research before design"
    - "Wireframes before high-fidelity"
    - "Each user flow as separate task"
    - "Responsive design as follow-up tasks"
```

## Recursive Split Example

### **Initial Request**: "Add social login to the app"

```yaml
# First Pass - Architect Analysis
confidence: 4/10
reasoning: "Many unknowns about providers, security, integration"

split_1:
  - "Research social login providers (Google, Facebook, GitHub)"
  - "Choose authentication strategy and provider"
  - "Design user data merge strategy for existing users"
  - "Implement social login backend integration"
  - "Create social login UI components"
  - "Test social login flow end-to-end"

# Second Pass - Check Each Subtask
subtask_analysis:
  "Research social login providers":
    confidence: 9/10 → READY
    
  "Implement social login backend integration":
    confidence: 6/10 → SPLIT FURTHER
    
    further_split:
      - "Set up OAuth provider credentials and config"
      - "Implement OAuth callback handlers"
      - "Create user account linking logic"
      - "Add social profile data sync"
      
  "Create social login UI components":
    confidence: 7/10 → SPLIT FURTHER
    
    further_split:
      - "Design social login button components"
      - "Implement provider selection UI"
      - "Add loading states and error handling"
      - "Style social login forms to match app design"

# Third Pass - Final Confidence Check
all_subtasks_8_plus: true
ready_for_execution: true
```

## Benefits of Confidence-Based Splitting

1. **Objective measure**: "Can I finish this confidently?" vs subjective complexity
2. **Recursive until ready**: Keeps splitting until everything is executable
3. **Agent-specific patterns**: Each agent develops splitting expertise
4. **Reduces failed attempts**: High confidence = higher success rate
5. **Better time estimates**: 8+ confidence tasks have predictable duration
6. **Natural task boundaries**: Splits align with logical work units

This approach ensures every task handed to an executor has high confidence of success, while the recursive splitting handles arbitrarily complex initial requests! 🎯