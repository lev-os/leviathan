# Project Management: One Task Per File + Embedded Context

## Core Structure

### **One Task = One File**
```
.memory/fitness-app/
├── tasks/
│   ├── auth-001.yaml       # Complete task with embedded context
│   ├── profile-001.yaml
│   ├── pivot-001.yaml     # Pivot tasks follow same pattern
│   └── dashboard-001.yaml
└── project.yaml            # Project metadata
```

### **Complete Task File Structure**
```yaml
# .memory/fitness-app/tasks/auth-001.yaml
metadata:
  id: "auth-001"
  title: "Implement user registration"
  type: "feature"  # feature | bug | pivot | epic
  created: "2025-01-25T10:00:00.000Z"
  updated: "2025-01-25T15:30:00.000Z"
  
ownership:
  owner: "ceo"          # Always CEO (combined BMAD roles)
  executors: ["dev"]    # Who will implement
  created_by: "ceo"     # Who created this task

business_context:
  goal: "Allow users to create accounts for fitness tracking"
  business_value: "Enable user retention and personalized experience"
  acceptance_criteria:
    - "User can register with email/password"
    - "Email validation required"
    - "Secure password requirements enforced"
    - "Account activation via email"
  success_metrics:
    - "Registration completion rate > 80%"
    - "Account verification rate > 90%"

technical_context:
  architecture_notes: |
    ## Architecture Input (CEO → Dev handoff)
    
    ### Approach
    - Use Firebase Auth for user management
    - Implement custom validation layer
    - Store additional user metadata in Firestore
    
    ### Security Requirements
    - Password: min 8 chars, special chars required
    - Rate limiting on registration endpoints
    - Email verification before account activation
    
    ### Integration Points
    - Connect to user profile system (profile-001)
    - Integrate with analytics for signup tracking
    
  implementation_notes: |
    ## Implementation Log (Dev execution)
    
    ### Progress Notes
    - ✅ Set up Firebase Auth configuration
    - ✅ Created registration form component
    - ⏳ Working on email validation flow
    - ❌ Discovered Firebase SDK compatibility issue with React Native
    
    ### Technical Decisions
    - Using Formik for form handling
    - Yup for validation schema
    - Custom hooks for auth state management
    
    ### Blockers Found
    - Firebase Web SDK required for React Native (not native SDK)
    - Need to resolve before profile integration

workflow:
  current_step: "implementation"
  steps_completed:
    - "business_analysis"     # CEO completed
    - "technical_planning"    # CEO → Dev handoff  
    - "development_started"   # Dev started
  next_steps:
    - "resolve_firebase_sdk"  # Current blocker
    - "complete_email_flow"
    - "testing"
    - "integration_testing"

status:
  current: "blocked"
  progress: 60
  blocked_by: "firebase_sdk_compatibility"
  blocked_since: "2025-01-25T14:00:00.000Z"

dependencies:
  depends_on: []            # No dependencies
  blocks: ["profile-001"]   # Blocks profile work
  related: ["fix-firebase-001"]  # Related tasks

checklist:
  business_requirements:
    - [x] User stories defined
    - [x] Acceptance criteria documented
    - [x] Success metrics identified
    - [ ] Stakeholder approval received
    
  technical_planning:
    - [x] Architecture approach defined
    - [x] Security requirements specified
    - [x] Integration points identified
    - [ ] Technical spike completed
    
  implementation:
    - [x] Development environment setup
    - [x] Basic registration form created
    - [ ] Email validation flow implemented
    - [ ] Password security enforced
    - [ ] Error handling implemented
    
  testing:
    - [ ] Unit tests written
    - [ ] Integration tests written
    - [ ] Manual testing completed
    - [ ] Security testing completed

pivot_history: []  # Track if this task was affected by pivots

decision_log:
  - timestamp: "2025-01-25T10:30:00.000Z"
    role: "ceo"
    decision: "Use Firebase Auth instead of custom auth"
    rationale: "Faster time to market, proven security, handles edge cases"
    impact: "Reduces development time by ~2 weeks"
    
  - timestamp: "2025-01-25T14:00:00.000Z"
    role: "dev"
    decision: "Task blocked due to SDK compatibility"
    rationale: "Firebase Web SDK required for RN, different implementation needed"
    impact: "Need to resolve before continuing profile integration"
    created_task: "fix-firebase-001"
```

## **Pivot Task Example**
```yaml
# .memory/fitness-app/tasks/pivot-001.yaml
metadata:
  id: "pivot-001"
  title: "Switch from React Native to Web-Only"
  type: "pivot"
  created: "2025-01-25T15:00:00.000Z"

ownership:
  owner: "ceo"
  executors: ["dev", "ceo"]  # Both involved in pivot
  created_by: "ceo"

business_context:
  goal: "Simplify technical stack and accelerate development"
  business_value: "Faster time to market, reduced complexity"
  rationale: |
    React Native compatibility issues causing delays.
    Web-first approach allows faster iteration and easier deployment.
    Mobile web experience sufficient for MVP.

pivot_plan:
  scope: "technical"  # technical | strategic | scope
  affected_tasks: ["auth-001", "profile-001", "fix-firebase-001"]
  
  transformations:
    - task: "auth-001"
      action: "transform"
      preserve_business_goal: true
      changes:
        - "React Native → React web components"
        - "Firebase Native SDK → Firebase Web SDK"
        - "Navigation: React Navigation → React Router"
      estimated_effort: "1 day rework"
      
    - task: "profile-001"  
      action: "transform"
      preserve_business_goal: true
      changes:
        - "React Native components → React web components"
        - "Native navigation → web routing"
      estimated_effort: "0.5 day rework"
      
    - task: "fix-firebase-001"
      action: "destroy"
      reason: "Firebase SDK compatibility issue resolved by web-only approach"
      cleanup: "Remove task file, update dependencies"

workflow:
  current_step: "planning"
  steps_completed:
    - "impact_analysis"
    - "transformation_plan_created"
  next_steps:
    - "get_stakeholder_approval"
    - "execute_transformations"
    - "update_affected_tasks"
    - "verify_business_continuity"

status:
  current: "awaiting_approval"
  progress: 40

dependencies:
  depends_on: []
  blocks: ["auth-001", "profile-001"]  # Blocks other work until resolved

checklist:
  planning:
    - [x] Impact analysis completed
    - [x] Affected tasks identified
    - [x] Transformation plan created
    - [ ] Stakeholder approval received
    
  execution:
    - [ ] Task transformations applied
    - [ ] Context files updated
    - [ ] Dependencies adjusted
    - [ ] Business continuity verified
    
  validation:
    - [ ] All affected tasks unblocked
    - [ ] No business requirements lost
    - [ ] Team alignment confirmed

decision_log:
  - timestamp: "2025-01-25T15:00:00.000Z"
    role: "ceo"
    decision: "Initiate technical pivot to web-only"
    rationale: "Firebase RN issues + faster web iteration + simpler deployment"
    impact: "~2 days rework, but eliminates ongoing RN complexity"
```

## **Project File**
```yaml
# .memory/fitness-app/project.yaml
metadata:
  id: "fitness-app"
  title: "Fitness Tracking App"
  created: "2025-01-25T09:00:00.000Z"
  
structure:
  working_directory: "/Users/jean/projects/fitness-app"
  tasks_directory: ".memory/fitness-app/tasks"
  
relationships:
  linked_projects: ["user-auth-service"]
  child_projects: []
  parent_project: null

ownership:
  primary_owner: "ceo"
  stakeholders: ["product_team", "development_team"]

status:
  current: "active"
  phase: "development"
  progress: 45

active_tasks: ["auth-001", "pivot-001"]
completed_tasks: []
blocked_tasks: ["profile-001"]
```

## **Benefits of This Structure**

### **1. Complete Context in One Place**
- Business goals + technical details + execution log
- No separate context files to manage
- Full task history in single file

### **2. Clear Ownership Model**
- CEO owns all tasks (combined BMAD roles)
- CEO provides business context + architecture guidance  
- Dev executes with implementation notes

### **3. Embedded Workflow Tracking**
- Progress through defined steps
- Checklists for each phase
- Decision log preserves reasoning

### **4. Simple Dependency Management**
- Dependencies in same file
- Clear blocking relationships
- Pivot impact tracking

### **5. Role Separation Within Tasks**
```yaml
business_context:     # CEO's domain
  goal: "Business objective"
  acceptance_criteria: [...]
  
technical_context:    # CEO → Dev handoff
  architecture_notes: "CEO's technical guidance"
  implementation_notes: "Dev's execution log"
```

This structure gives us **complete task context** in **one manageable file** with **clear role boundaries** and **embedded workflow tracking**! 🎯

---
**AIForge** | 🟩🟩🟩🟩🟩 | **One task per file with embedded context** | **Clean ownership model** ✨