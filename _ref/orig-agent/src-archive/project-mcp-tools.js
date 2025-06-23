/**
 * MCP Tool Handlers for Project Hierarchy System
 * Integrates enhanced project/task management with existing MCP tools
 */

import { ProjectHierarchy } from './project-hierarchy.js';

export class ProjectMCPTools {
  constructor(config = {}) {
    this.projectHierarchy = new ProjectHierarchy(config);
  }

  // Project Management Tools
  async handleCreateProject(args) {
    const { projectId, title, workingDirectory } = args;
    if (!projectId || !title) throw new Error('projectId and title required');
    
    const project = await this.projectHierarchy.createProject(projectId, title, workingDirectory);
    return `✅ Created project: "${title}" (ID: ${projectId})`;
  }

  async handleListProjects(args) {
    const projects = await this.projectHierarchy.listProjects();
    
    if (projects.length === 0) {
      return 'No projects found. Create a project with create_project.';
    }
    
    return projects.map(p => 
      `📁 ${p.metadata.id}: ${p.metadata.title} (${p.status.current}) - ${p.active_tasks.length} active tasks`
    ).join('\n');
  }

  async handleGetProject(args) {
    const { projectId } = args;
    if (!projectId) throw new Error('projectId required');
    
    const project = await this.projectHierarchy.getProject(projectId);
    
    return {
      project: project,
      formatted: this.formatProject(project)
    };
  }

  // Enhanced Task Management Tools
  async handleCreateEnhancedTask(args) {
    const { projectId, taskData } = args;
    if (!projectId || !taskData) throw new Error('projectId and taskData required');
    
    const task = await this.projectHierarchy.createEnhancedTask(projectId, taskData);
    return `✅ Created enhanced task: "${task.metadata.title}" (ID: ${task.metadata.id}) in project ${projectId}`;
  }

  async handleGetEnhancedTask(args) {
    const { projectId, taskId } = args;
    if (!projectId || !taskId) throw new Error('projectId and taskId required');
    
    const task = await this.projectHierarchy.getEnhancedTask(projectId, taskId);
    
    return {
      task: task,
      formatted: this.formatEnhancedTask(task)
    };
  }

  async handleUpdateTaskStatus(args) {
    const { projectId, taskId, status, updates } = args;
    if (!projectId || !taskId || !status) throw new Error('projectId, taskId, and status required');
    
    const task = await this.projectHierarchy.updateTaskStatus(projectId, taskId, status, updates || {});
    return `✅ Updated task ${taskId} status to: ${status}`;
  }

  // Formatting Helpers
  formatProject(project) {
    return `📁 Project: ${project.metadata.title}
📝 ID: ${project.metadata.id}
📊 Status: ${project.status.current} (${project.status.phase})
🏷️ Active Tasks: ${project.active_tasks.length}
✅ Completed Tasks: ${project.completed_tasks.length}`;
  }

  formatEnhancedTask(task) {
    return `📋 Task: ${task.metadata.title}
📝 Type: ${task.metadata.type}
📊 Status: ${task.status.current}
🎯 Goal: ${task.business_context.goal}
🤖 Executors: ${task.ownership.executors.join(', ')}`;
  }

  // Tool Schema for MCP
  getToolSchemas() {
    return [
      {
        name: "create_project",
        description: "Create a new project with enhanced structure",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "string", description: "Unique project identifier" },
            title: { type: "string", description: "Project title" },
            workingDirectory: { type: "string", description: "Working directory path" }
          },
          required: ["projectId", "title"]
        }
      },
      {
        name: "create_enhanced_task",
        description: "Create enhanced task with embedded context",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "string", description: "Project ID" },
            taskData: { type: "object", description: "Enhanced task data" }
          },
          required: ["projectId", "taskData"]
        }
      }
    ];
  }
}