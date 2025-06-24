export interface TaskData {
  title: string;
  description?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  status?: 'Not Started' | 'In Progress' | 'Completed' | 'Blocked';
  project?: string;
  dueDate?: string;
  assignee?: string;
  tags?: string[];
  effort?: number;
}

export interface Task extends TaskData {
  id: string;
  created?: string;
  updated?: string;
}

export interface TaskFilters {
  status?: string;
  project?: string;
  assignee?: string;
  priority?: string;
  limit?: number;
}

export interface ProjectOverview {
  total: number;
  notStarted: number;
  inProgress: number;
  completed: number;
  blocked: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  completionRate: number;
  overdue: number;
}

export interface Memory {
  value: any;
  timestamp: string;
  category?: string;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}
