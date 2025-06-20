# Media Forge + Lev Job System Integration Plan

## Key Discovery: Lev's Complete Job Orchestration System

Based on research, Lev already has a sophisticated job system that perfectly fits our LLM-first media approach:

### Existing Job System Architecture:
```bash
# Job lifecycle that media-forge can leverage
lev post-job --instructions "download playlist X and organize by topic" --type "content" --minutes 30
lev jobs                    # Check status across tabs
lev accept-job job-abc123   # Accept in specialized tab
lev complete-job job-abc123 # Report completion with results
```

### LLM-First Media Integration Plan:

#### Phase 1: Plugin as Job Executor
Create `/lev/plugins/@lev-os/media-forge/` that integrates with existing job system:

**Plugin Structure:**
```yaml
plugin:
  name: media-forge
  type: content_plugin
  job_types: [download, organize, classify, batch]
  
commands:
  media_job:
    syntax: "lev media job <description>"
    job_integration: true  # Uses Lev's job system
    whisper:
      llm_guidance: "Break down media task, use job system for coordination"
```

#### Phase 2: Job-Driven Workflow
```bash
# User posts natural language job
lev post-job --instructions "download this YouTube playlist and organize by programming topics" --type "content" --minutes 45

# System breaks down into subtasks using existing job analysis
# Tab A accepts: lev accept-job job-download-123
# Tab B accepts: lev accept-job job-organize-124  
# Tab C accepts: lev accept-job job-classify-125

# Each tab completes with structured results
lev complete-job job-download-123 --summary "Downloaded 15 videos, metadata extracted"
```

#### Phase 3: Bi-Directional Intelligence
Leverage Lev's callback system for proactive media management:

**Auto-Generated Follow-up Jobs:**
- Download completes → System creates organization job
- Organization completes → System suggests related content jobs
- Pattern detection → System proposes workflow templates

## Technical Implementation

### Integration Points:
1. **Job Analysis**: Extend Lev's complexity analysis for media tasks
2. **Callback Chains**: Use existing callback system for media workflows  
3. **Multi-Tab**: Leverage Lev's tab coordination for parallel processing
4. **Session Management**: Use Lev's checkpoints for long-running downloads

### LLM-First Approach:
- Tool downloads/extracts → "job done" signal → LLM analyzes
- LLM creates organization plan → Tool executes plan
- Tool reports completion → LLM decides next actions
- System can proactively suggest improvements via callback chains

### Implementation Steps:
1. Create media-forge plugin in Lev's plugin system
2. Add media-specific job types to Lev's analysis engine
3. Implement simple download/organize commands that report to job system
4. Test with natural language job posting
5. Add bi-directional callbacks for proactive media management

## Benefits:
- **Zero Redundancy**: Uses Lev's existing sophisticated job orchestration
- **LLM-First**: All intelligence handled by calling LLM, tool just executes
- **Multi-Tab**: Automatic coordination for complex media workflows
- **Bi-Directional**: System can proactively manage media library
- **Session Continuity**: Long downloads survive tab switches via Lev's sessions

This approach leverages Lev's mature job system rather than rebuilding workflow orchestration.