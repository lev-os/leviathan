# ADR-001: Background Processing Architecture

**Date**: 2025-01-30  
**Status**: Proposed  
**Context**: Desktop application needs sophisticated background job processing

## Decision

Implement a file-based background job processing system that manages multiple queue types (downloads, iMessage/scraping, general background tasks) with future scalability for consumer applications.

## Architecture Components

### 1. File-Based Job Queue System

**Job Storage Structure**:
```
~/.leviathan/jobs/
├── pending/      # New jobs awaiting processing
├── active/       # Currently processing jobs  
├── completed/    # Finished jobs (archived after 24h)
└── failed/       # Failed jobs with retry information
```

**Job Format** (JSON files with UUID + timestamp):
```json
{
  "id": "job_2025-01-30_uuid",
  "type": "download|imessage-sync|web-scraping|general-task",
  "status": "pending|active|completed|failed",
  "priority": 5,
  "created": "2025-01-30T10:00:00Z",
  "updated": "2025-01-30T10:00:00Z",
  "data": {
    // Job-specific payload
  },
  "metadata": {
    "retries": 0,
    "progress": 0,
    "logs": [],
    "errors": []
  }
}
```

### 2. Service Architecture

Extend `LeviathanServiceManager` with new services:

- **JobQueueService**: Core job processing engine with file watching
- **DownloadService**: Multi-protocol download processor (HTTP, torrents, etc.)
- **ScrapingService**: Web scraping and iMessage queue handler
- **WorkerPoolService**: General background task workers with configurable concurrency

### 3. Processing Pipeline

```typescript
class JobQueueService {
  private watcher: FSWatcher;
  private workers: Map<string, Worker>;
  private activeJobs: Map<string, JobState>;
  
  async processJob(job: Job): Promise<void> {
    // 1. Move from pending/ to active/
    await this.moveJobToActive(job);
    
    // 2. Dispatch to appropriate worker
    const worker = this.getWorkerForType(job.type);
    
    // 3. Execute with progress tracking
    await worker.execute(job, (progress) => {
      this.updateJobProgress(job.id, progress);
    });
    
    // 4. Move to completed/ or failed/
    await this.finalizeJob(job);
  }
}
```

### 4. UI Components

**Dashboard Layout** (Bento Grid):
- Job overview cards by type
- Active job progress bars
- System resource usage
- Queue depth indicators

**Job Management Features**:
- Drag-and-drop prioritization
- Bulk operations (retry, cancel, clear)
- Job templates and presets
- Export/import job definitions

## Implementation Plan

### Phase 1: Core Infrastructure (Week 1)
1. File-based queue system with FSWatcher
2. Basic CRUD operations for jobs
3. State management (pending → active → completed/failed)
4. Retry logic and error handling
5. IPC communication for UI updates

### Phase 2: Service Integration (Week 2)
1. Specialized processors for each job type
2. Health checks and monitoring
3. Priority queue implementation
4. Resource management (CPU/memory limits)
5. Crash recovery mechanisms

### Phase 3: Desktop UI (Week 3)
1. React components with TypeScript
2. Real-time updates via IPC
3. Tailwind + shadcn/ui styling
4. Progress visualization with Recharts
5. Notification system

### Phase 4: Advanced Features (Week 4)
1. Job chaining and dependencies
2. Scheduled jobs (cron-like)
3. Plugin system for custom job types
4. Performance optimization
5. Testing and documentation

## Integration Points

### Existing Kingly Job System
```javascript
// Leverage existing job orchestration
const kinglyJob = await jobSystem.createJob({
  type: 'background-download',
  workflow: downloadWorkflow,
  callbacks: jobCallbacks
});
```

### Memory System Integration
- Use hybrid memory for job persistence
- Track job history in Graphiti
- Enable job pattern learning

### MCP Protocol Exposure
```typescript
// Expose as MCP tools
const jobTools = {
  'create-job': createBackgroundJob,
  'list-jobs': listActiveJobs,
  'cancel-job': cancelJob,
  'get-job-status': getJobStatus
};
```

## Framework Integration

### Activepieces Integration
- Use Activepieces' 280+ integrations as job sources
- Visual workflow builder for complex job chains
- Leverage existing authentication management

### Mastra Patterns
- Adopt Mastra's clean package separation
- Use similar worker architecture
- Compatible API design for migration

### Celery-Inspired Features
- Similar worker/queue architecture
- File-based instead of Redis/RabbitMQ
- Compatible monitoring patterns

## Scalability Considerations

### Consumer Application Ready
1. **Minimal Dependencies**: Pure file-based approach
2. **Offline First**: Works without internet
3. **Privacy Focused**: All processing local
4. **Plugin Architecture**: Extensible job types
5. **Portable Config**: Export/import workflows

### Enterprise Evolution
1. **Multi-machine sync**: Via file sync services
2. **Team collaboration**: Shared job templates  
3. **Advanced scheduling**: Complex time-based rules
4. **Resource pools**: Distributed processing
5. **Audit trails**: Complete job history

## UI/UX Patterns

### Non-Blocking Processing
- Background jobs don't block UI
- Subtle progress in status bar
- Toast notifications for completion

### Visual Feedback (2025 Standards)
- **< 1s**: No indicator needed
- **1-3s**: Indeterminate spinner
- **3-10s**: Determinate progress bar
- **> 10s**: Detailed progress with time remaining

### Queue Visualization
- Real-time queue depth charts
- Job throughput metrics
- Resource utilization graphs
- Historical performance data

## Success Metrics

- Handle 1000+ concurrent jobs without UI lag
- < 100ms job state transitions
- Zero data loss with crash recovery
- Support all common download protocols
- Maintain 60 FPS UI performance

## Consequences

### Positive
- Simple, reliable file-based approach
- No external dependencies (Redis, etc.)
- Easy debugging (inspect job files)
- Natural backup/restore (copy files)
- Cross-platform compatible

### Negative
- File I/O overhead for high-frequency jobs
- Limited to local machine (initially)
- Manual cleanup needed for old jobs
- File system limitations on job count

## Alternatives Considered

1. **Redis-based Queue**: More scalable but adds dependency
2. **SQLite Database**: Better queries but single-writer limitation
3. **In-Memory Only**: Fast but no persistence
4. **Cloud Service**: Scalable but privacy concerns

## References

- Kingly Job System Documentation
- Activepieces Architecture Analysis
- Mastra Worker Patterns
- 2025 UI/UX Queue Management Patterns