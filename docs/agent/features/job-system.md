# Job System Documentation

The Leviathan job system provides AI-driven job orchestration with intelligent breakdown, multi-tab coordination, and callback chains for complex workflow management.

## Overview

**Status**: ✅ **Fully Implemented and Functional**

The job system transforms natural language task descriptions into structured, executable workflows with time estimation, multi-tab coordination, and checkpoint-based execution tracking.

## Usage

### Basic Job Creation
```bash
# Simple task
lev job "implement user authentication"

# Complex task  
lev job "refactor payment system with comprehensive testing and documentation"

# Specific domain task
lev job "analyze security vulnerabilities in API endpoints"
```

### Job Analysis Output
```json
{
  "analysis": {
    "type": "implementation|analysis|research|optimization",
    "complexity": "low|medium|high", 
    "requires_coordination": boolean,
    "estimated_scope": "single-session|multi-session"
  },
  "job_breakdown": {
    "subtasks": [...],
    "complexity_score": 1-10,
    "estimated_components": [...]
  },
  "callback_chain": {
    "stages": [...],
    "checkpoints": [...],
    "rollback_points": [...]
  },
  "estimated_time": {
    "base_time_minutes": number,
    "with_overhead_minutes": number,
    "estimated_range": "X-Y minutes"
  },
  "recommended_tabs": {
    "recommended": 1-3,
    "reasoning": "...",
    "tab_purposes": [...]
  }
}
```

## Core Features

### 1. AI-Powered Complexity Analysis

**Complexity Levels:**
- **Low** (1-3): Single implementation task (~10 minutes)
- **Medium** (4-7): Implementation + validation (~25-35 minutes)  
- **High** (8-10): Multi-stage with analysis, implementation, integration, docs (~90+ minutes)

**Analysis Components:**
- Task type classification (implementation, analysis, research, optimization)
- Coordination requirements assessment
- Scope estimation (single vs multi-session)
- Component identification (analysis, implementation, validation, documentation)

### 2. Intelligent Job Breakdown

**Dynamic Subtask Generation:**

```javascript
// Low Complexity Example
{
  "subtasks": [
    {
      "id": 1,
      "name": "Quick Implementation", 
      "type": "development",
      "estimated_minutes": 10
    }
  ]
}

// Medium Complexity Example  
{
  "subtasks": [
    {
      "id": 1,
      "name": "Implementation",
      "type": "development", 
      "estimated_minutes": 25
    },
    {
      "id": 2,
      "name": "Validation",
      "type": "validation",
      "estimated_minutes": 10
    }
  ]
}

// High Complexity Example
{
  "subtasks": [
    {
      "id": 1,
      "name": "Analysis",
      "type": "analysis",
      "estimated_minutes": 15
    },
    {
      "id": 2, 
      "name": "Implementation",
      "type": "development",
      "estimated_minutes": 45
    },
    {
      "id": 3,
      "name": "Integration",
      "type": "integration", 
      "estimated_minutes": 20
    },
    {
      "id": 4,
      "name": "Documentation",
      "type": "documentation",
      "estimated_minutes": 10
    }
  ]
}
```

### 3. Multi-Tab Coordination Strategy

**Tab Allocation Logic:**
- **1 Tab**: Simple tasks (complexity score < 6)
- **2 Tabs**: Implementation + Testing (complexity 6-7, 2-4 subtasks)
- **3 Tabs**: Research + Implementation + Testing (complexity 8+, 4+ subtasks)

**Tab Purposes:**
- **Implementation Tab**: Primary development work
- **Testing & Validation Tab**: Testing, validation, debugging
- **Research & Documentation Tab**: Analysis, research, documentation

### 4. Callback Chain System

**Stage Structure:**
```javascript
{
  "stages": [
    {
      "stage_id": 1,
      "name": "Implementation",
      "type": "development",
      "callback": "handle_job_stage_1", 
      "checkpoint_after": true,
      "estimated_time": 25
    }
  ],
  "checkpoints": [
    {
      "stage": 1,
      "description": "Complete Implementation",
      "validation_required": false
    },
    {
      "stage": "final", 
      "description": "Job completion rollup",
      "validation_required": true,
      "creates_session_handoff": true
    }
  ]
}
```

**Checkpoint Features:**
- Automatic checkpoint after each stage
- Validation requirements for testing stages  
- Final rollup checkpoint with session handoff creation
- Rollback points for error recovery

### 5. Time Estimation Algorithm

**Base Time Calculation:**
- Sum of all subtask estimated minutes
- Based on complexity score and task type

**Overhead Calculation:**
- 20% overhead added to base time
- Accounts for context switching, debugging, refinement

**Time Range:**
- Lower bound: 95% of base time
- Upper bound: 125% of overhead time
- Provides realistic estimation ranges

## Implementation Architecture

### Core Methods

**Located in**: `src/hybrid-router.js` (lines 1150-1345)

#### `handle_job(args)`
Main job handler that orchestrates the entire job analysis process.

#### `generateJobStructure(analysis)`
Creates intelligent subtask breakdown based on complexity analysis.

#### `createCallbackChain(jobBreakdown)`  
Builds execution pipeline with checkpoints and stage management.

#### `calculateEstimatedTime(jobBreakdown)`
Generates time estimates with overhead calculations.

#### `calculateOptimalTabs(jobBreakdown)`
Determines optimal tab configuration based on job complexity.

#### Helper Methods
- `mapComplexityToScore(complexity)` - Maps complexity levels to numeric scores
- `explainTabStrategy(tabCount, reasoning)` - Provides tab allocation reasoning
- `suggestTabPurposes(tabCount)` - Suggests specific tab purposes

### Integration Points

**Session Management:**
- Auto-registers workspace before job orchestration
- Integrates with checkpoint system for job stage tracking
- Creates session handoffs on job completion

**CEO Intelligence:**
- Uses CEO intelligence for complexity analysis
- Leverages AI-powered task breakdown and coordination

**Whisper System:**
- Provides LLM guidance for job execution
- Offers strategic direction during job stages

## Advanced Features

### Dependency Management
- Tracks dependencies between subtasks
- Ensures proper execution order
- Supports parallel execution where possible

### Validation Framework
- Built-in validation requirements for testing stages
- Automatic validation checkpoints
- Error recovery with rollback capabilities

### Session Continuity
- Integration with session management system
- Cross-session job continuation support
- Session handoff creation for complex jobs

## Examples

### Development Task
```bash
lev job "implement user authentication with JWT tokens"
```
**Output:** 2-tab setup, Implementation + Testing, ~35 minutes

### Analysis Task  
```bash
lev job "security audit of payment processing system"
```
**Output:** 3-tab setup, Research + Analysis + Documentation, ~60 minutes

### Simple Task
```bash
lev job "fix button styling on homepage"
```
**Output:** 1-tab setup, Quick Implementation, ~10 minutes

## Future Enhancements

### Job Persistence (Planned)
- Save jobs to JSON for cross-session continuation
- Job status tracking (pending, in-progress, completed)
- Job history and metrics

### Queue Management (Planned)  
- Handle multiple concurrent jobs
- Priority-based job scheduling
- Resource allocation optimization

### Advanced Coordination (Planned)
- Multi-user job collaboration
- Distributed job execution
- Real-time job status synchronization

## Testing

The job system includes comprehensive testing:

```bash
# Test job creation and analysis
npm run test:components

# Test job system integration
npm run test:smoke

# Test job workflow execution  
npm run test:workflows
```

## Troubleshooting

### Common Issues

**Job analysis fails:**
- Ensure workspace is properly initialized
- Check contexts are loaded correctly
- Verify CEO intelligence is available

**Callback chain execution issues:**
- Check session manager initialization
- Verify checkpoint system is functional
- Ensure proper permissions for session operations

**Multi-tab coordination problems:**
- Verify Claude Code integration
- Check session continuity settings
- Ensure proper tab management configuration

---

The Leviathan job system represents a sophisticated approach to AI-driven workflow orchestration, providing intelligent automation while maintaining human oversight and control through structured checkpoints and multi-tab coordination.