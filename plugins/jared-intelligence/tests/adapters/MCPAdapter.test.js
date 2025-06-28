/**
 * MCPAdapter Test Suite
 * Tests the MCP Protocol to Domain transformation
 */

import { describe, it, expect, jest } from '@jest/globals';
import { MCPAdapter } from '../../src/adapters/input/protocols/MCPAdapter.js';

describe('MCPAdapter', () => {
  let mcpAdapter;
  let mockConversationPort;
  let mockIntelligencePort;

  beforeEach(() => {
    // Mock the port implementations
    mockConversationPort = {
      processMessage: jest.fn().mockResolvedValue({
        message: 'Hello! How can I help you today?',
        suggestions: ['Check project status', 'Gather intelligence'],
        context: { sessionId: 'test-session' }
      })
    };

    mockIntelligencePort = {
      gatherIntelligence: jest.fn().mockResolvedValue([
        {
          title: 'New MCP Protocol Released',
          source: 'hackernews',
          url: 'https://example.com/mcp'
        }
      ])
    };