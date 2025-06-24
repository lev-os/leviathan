import { describe, test, expect } from '@jest/globals';

// Mock command parser functions (these would be imported from your actual implementation)
const parseCommand = (input: string): { command: string; args: string[]; options: Record<string, any> } => {
  const parts = input.trim().split(/\s+/);
  const command = parts[0];
  const args: string[] = [];
  const options: Record<string, any> = {};
  
  for (let i = 1; i < parts.length; i++) {
    if (parts[i].startsWith('--')) {
      const key = parts[i].substring(2);
      if (i + 1 < parts.length && !parts[i + 1].startsWith('-')) {
        options[key] = parts[i + 1];
        i++;
      } else {
        options[key] = true;
      }
    } else if (parts[i].startsWith('-')) {
      const key = parts[i].substring(1);
      options[key] = true;
    } else {
      args.push(parts[i]);
    }
  }
  
  return { command, args, options };
};

const parseTaskCommand = (input: string): { title: string; priority?: string; agent?: string } => {
  if (!input.startsWith('!task ')) {
    throw new Error('Invalid task command');
  }
  
  const content = input.substring(6).trim();
  const match = content.match(/^(.+?)(?:\s+--priority\s+(\w+))?(?:\s+--agent\s+(\w+))?$/);
  
  if (!match) {
    throw new Error('Invalid task command format');
  }
  
  return {
    title: match[1].trim(),
    priority: match[2],
    agent: match[3]
  };
};

const parseSaveCommand = (input: string): { purpose: string; content?: string } => {
  if (!input.startsWith('!save ')) {
    throw new Error('Invalid save command');
  }
  
  const content = input.substring(6).trim();
  const parts = content.split(/\s+/);
  
  return {
    purpose: parts[0],
    content: parts.slice(1).join(' ')
  };
};

describe('Command Parser Integration Tests', () => {
  describe('parseCommand', () => {
    test('parses simple command', () => {
      const result = parseCommand('!task Create new feature');
      expect(result).toEqual({
        command: '!task',
        args: ['Create', 'new', 'feature'],
        options: {}
      });
    });
    
    test('parses command with options', () => {
      const result = parseCommand('!task Create auth --priority high --agent codecatalyst');
      expect(result).toEqual({
        command: '!task',
        args: ['Create', 'auth'],
        options: {
          priority: 'high',
          agent: 'codecatalyst'
        }
      });
    });
    
    test('parses command with boolean flags', () => {
      const result = parseCommand('!status --verbose -a');
      expect(result).toEqual({
        command: '!status',
        args: [],
        options: {
          verbose: true,
          a: true
        }
      });
    });
    
    test('handles empty input', () => {
      const result = parseCommand('');
      expect(result).toEqual({
        command: '',
        args: [],
        options: {}
      });
    });
  });
  
  describe('parseTaskCommand', () => {
    test('parses basic task command', () => {
      const result = parseTaskCommand('!task Implement user authentication');
      expect(result).toEqual({
        title: 'Implement user authentication',
        priority: undefined,
        agent: undefined
      });
    });
    
    test('parses task with priority', () => {
      const result = parseTaskCommand('!task Fix critical bug --priority high');
      expect(result).toEqual({
        title: 'Fix critical bug',
        priority: 'high',
        agent: undefined
      });
    });
    
    test('parses task with agent', () => {
      const result = parseTaskCommand('!task Design new UI --agent designer');
      expect(result).toEqual({
        title: 'Design new UI',
        priority: undefined,
        agent: 'designer'
      });
    });
    
    test('parses task with both options', () => {
      const result = parseTaskCommand('!task Build API endpoint --priority medium --agent codecatalyst');
      expect(result).toEqual({
        title: 'Build API endpoint',
        priority: 'medium',
        agent: 'codecatalyst'
      });
    });
    
    test('throws error for invalid command', () => {
      expect(() => parseTaskCommand('!wrong command')).toThrow('Invalid task command');
    });
    
    test('handles task titles with special characters', () => {
      const result = parseTaskCommand('!task Implement OAuth2.0 with JWT tokens');
      expect(result).toEqual({
        title: 'Implement OAuth2.0 with JWT tokens',
        priority: undefined,
        agent: undefined
      });
    });
  });
  
  describe('parseSaveCommand', () => {
    test('parses save command with purpose only', () => {
      const result = parseSaveCommand('!save architecture');
      expect(result).toEqual({
        purpose: 'architecture',
        content: ''
      });
    });
    
    test('parses save command with content', () => {
      const result = parseSaveCommand('!save implementation Added user service');
      expect(result).toEqual({
        purpose: 'implementation',
        content: 'Added user service'
      });
    });
    
    test('throws error for invalid command', () => {
      expect(() => parseSaveCommand('!context save')).toThrow('Invalid save command');
    });
  });
  
  describe('Command validation', () => {
    test('validates priority values', () => {
      const validPriorities = ['low', 'medium', 'high'];
      const isValidPriority = (priority: string) => validPriorities.includes(priority);
      
      expect(isValidPriority('high')).toBe(true);
      expect(isValidPriority('urgent')).toBe(false);
    });
    
    test('validates agent names', () => {
      const validAgents = ['codecatalyst', 'designer', 'analyst'];
      const isValidAgent = (agent: string) => validAgents.includes(agent);
      
      expect(isValidAgent('codecatalyst')).toBe(true);
      expect(isValidAgent('unknown')).toBe(false);
    });
    
    test('validates purpose types', () => {
      const validPurposes = ['architecture', 'implementation', 'testing', 'design'];
      const isValidPurpose = (purpose: string) => validPurposes.includes(purpose);
      
      expect(isValidPurpose('architecture')).toBe(true);
      expect(isValidPurpose('random')).toBe(false);
    });
  });
  
  describe('Edge cases', () => {
    test('handles commands with extra whitespace', () => {
      const result = parseTaskCommand('!task   Create   feature   --priority   high  ');
      expect(result).toEqual({
        title: 'Create   feature',
        priority: 'high',
        agent: undefined
      });
    });
    
    test('handles empty task title', () => {
      expect(() => parseTaskCommand('!task ')).toThrow('Invalid task command format');
    });
    
    test('handles malformed options', () => {
      const result = parseCommand('!task Create --priority --agent codecatalyst');
      expect(result).toEqual({
        command: '!task',
        args: ['Create'],
        options: {
          priority: true,
          agent: 'codecatalyst'
        }
      });
    });
  });
});