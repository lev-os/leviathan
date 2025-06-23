/**
 * Task Adapter for Claude Code
 * Direct implementation for task operations with YAML/MD file support
 */

import { Task } from '../../domain/task.js';
import { WorkspaceService } from '../../application/workspace-service.js';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import yaml from 'js-yaml';

export class TaskAdapter {
  constructor(workspaceService) {
    this.workspaceService = workspaceService || new WorkspaceService();
    this.tasksPath = '.kingly/tasks';
  }
  
  async createTask(params) {
    // Create domain entity with intent classification
    const task = new Task(params);
    
    // Save to file system (YAML + MD)
    await this.saveTaskFiles(task);
    
    // For now, just save to file system
    // TODO: Integrate with workspace service when universal context is implemented
    
    return task;
  }
  
  async saveTaskFiles(task) {
    const taskDir = join(this.tasksPath, task.id);
    await mkdir(taskDir, { recursive: true });
    
    // Save YAML metadata
    const yamlContent = yaml.dump({
      version: '1.0',
      id: task.id,
      intent: {
        type: task.intent_type,
        context: task.intent_context,
        candidates: task.intent_candidates
      },
      metadata: {
        created: task.created,
        updated: task.updated,
        status: task.status,
        confidence: task.confidence
      },
      relationships: task.relationships,
      context: task.context
    });
    
    await writeFile(join(taskDir, 'metadata.yaml'), yamlContent);
    
    // Save Markdown with intent-specific template
    const mdContent = this.generateMarkdownTemplate(task);
    await writeFile(join(taskDir, 'implementation.md'), mdContent);
  }
  
  generateMarkdownTemplate(task) {
    const templates = {
      implementation: `# ${task.title}

${task.description || ''}

## Implementation Plan
<!-- Describe the implementation approach -->

## Technical Approach
<!-- Detail the technical solution -->

## Testing Strategy
<!-- Define how to test this -->

## Acceptance Criteria
- [ ] AC-1: ...
- [ ] AC-2: ...
- [ ] AC-3: ...
`,
      research: `# ${task.title}

${task.description || ''}

## Research Goals
<!-- What are we trying to learn? -->

## Options Analysis
<!-- Compare different approaches -->

## Findings
<!-- Document research results -->

## Recommendations
<!-- Based on research findings -->
`,
      planning: `# ${task.title}

${task.description || ''}

## Objectives
<!-- What are we planning to achieve? -->

## Timeline
<!-- Key milestones and dates -->

## Resources
<!-- What's needed -->

## Success Metrics
<!-- How do we measure success? -->
`,
      general: `# ${task.title}

${task.description || ''}

## Overview
<!-- Task overview -->

## Details
<!-- Task details -->

## Next Steps
<!-- What needs to be done -->
`
    };
    
    return templates[task.intent_type] || templates.general;
  }
  
  async getTaskFiles(taskId) {
    const taskDir = join(this.tasksPath, taskId);
    if (!existsSync(taskDir)) {
      return null;
    }
    
    return {
      yaml: join(taskDir, 'metadata.yaml'),
      markdown: join(taskDir, 'implementation.md')
    };
  }
  
  async getTaskMetadata(taskId) {
    const files = await this.getTaskFiles(taskId);
    if (!files) return null;
    
    const yamlContent = await readFile(files.yaml, 'utf-8');
    return yaml.load(yamlContent);
  }
  
  async getTaskContent(taskId) {
    const files = await this.getTaskFiles(taskId);
    if (!files) return null;
    
    return await readFile(files.markdown, 'utf-8');
  }
  
  async getTaskHandler(taskId) {
    const metadata = await this.getTaskMetadata(taskId);
    if (!metadata) return null;
    
    const handlers = {
      implementation: 'implementation-handler',
      research: 'research-handler',
      planning: 'planning-handler',
      general: 'general-handler'
    };
    
    return {
      type: handlers[metadata.intent.type] || 'general-handler',
      intent: metadata.intent
    };
  }
  
  async getTaskWorkflow(taskId) {
    const metadata = await this.getTaskMetadata(taskId);
    if (!metadata) return null;
    
    const workflows = {
      implementation: {
        steps: [
          { type: 'design-review', required: true },
          { type: 'implementation', required: true },
          { type: 'testing', required: true },
          { type: 'code-review', required: true }
        ]
      },
      research: {
        steps: [
          { type: 'research-plan', required: true },
          { type: 'data-gathering', required: true },
          { type: 'analysis', required: true },
          { type: 'recommendations', required: true }
        ]
      }
    };
    
    // Add security review for security domain tasks
    if (metadata.intent.context.domain === 'security') {
      const workflow = workflows[metadata.intent.type] || { steps: [] };
      workflow.steps.push({ type: 'security-review', required: true });
      
      // Add expedited approval for critical priority
      if (metadata.priority === 'critical') {
        workflow.steps.push({ type: 'expedited-approval', required: true });
      }
      
      return workflow;
    }
    
    return workflows[metadata.intent.type] || { steps: [] };
  }
  
  async getTaskDependencies(taskId) {
    const metadata = await this.getTaskMetadata(taskId);
    if (!metadata) return [];
    
    return metadata.relationships.blocked_by.map(depId => ({
      task_id: depId,
      workspace_id: this.extractWorkspaceId(depId),
      type: 'blocks',
      status: 'pending' // Would need to check actual status
    }));
  }
  
  extractWorkspaceId(taskId) {
    // In a real system, would look up the task's workspace
    // For now, return a placeholder
    return taskId.startsWith('task-') ? 'workspace-A' : 'workspace-B';
  }
}