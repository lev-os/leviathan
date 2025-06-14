#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';

class KinglyResearchMCP {
  constructor() {
    this.server = new Server(
      {
        name: 'kingly-research-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'perplexity_research',
          description: 'Query Perplexity for technical research',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Research query for Perplexity',
              },
              focus: {
                type: 'string',
                description: 'Focus area (go, kernel, arm, llm, etc.)',
                enum: ['go', 'kernel', 'arm', 'llm', 'mcp', 'general'],
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'go_docs_search',
          description: 'Search Go documentation offline',
          inputSchema: {
            type: 'object',
            properties: {
              package: {
                type: 'string',
                description: 'Go package name (e.g., net, syscall, unsafe)',
              },
              function: {
                type: 'string',
                description: 'Function or type name to look up',
              },
              topic: {
                type: 'string',
                description: 'General topic search in Go docs',
              },
            },
          },
        },
        {
          name: 'research_query',
          description: 'Query our accumulated Kingly OS research',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Query about our research findings',
              },
              area: {
                type: 'string',
                description: 'Research area to focus on',
                enum: ['kernel', 'agent', 'performance', 'architecture', 'go'],
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'import_research',
          description: 'Import and index research documents',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Path to research directory or file',
              },
            },
            required: ['path'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'perplexity_research':
          return this.handlePerplexityResearch(request.params.arguments);
        case 'go_docs_search':
          return this.handleGoDocsSearch(request.params.arguments);
        case 'research_query':
          return this.handleResearchQuery(request.params.arguments);
        case 'import_research':
          return this.handleImportResearch(request.params.arguments);
        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`
          );
      }
    });
  }

  async handlePerplexityResearch(args) {
    const { query, focus = 'general' } = args;
    
    try {
      // Enhanced query based on focus area
      const focusedQuery = this.enhanceQueryWithFocus(query, focus);
      
      // Note: You'll need to add your Perplexity API key
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-huge-128k-online',
          messages: [
            {
              role: 'system',
              content: `You are a technical researcher focused on ${focus}. Provide detailed, implementable insights with code examples when relevant.`
            },
            {
              role: 'user',
              content: focusedQuery
            }
          ],
          max_tokens: 4000,
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.statusText}`);
      }

      const data = await response.json();
      const result = data.choices[0].message.content;

      return {
        content: [
          {
            type: 'text',
            text: `# Perplexity Research: ${query}\n\n${result}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error querying Perplexity: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  enhanceQueryWithFocus(query, focus) {
    const focusEnhancements = {
      go: `${query} - Focus on Go programming language patterns, performance optimization, and cgo integration`,
      kernel: `${query} - Focus on Linux kernel development, system calls, and kernel modules`,
      arm: `${query} - Focus on ARM architecture, Raspberry Pi, and embedded systems`,
      llm: `${query} - Focus on LLM deployment, quantization, and inference optimization`,
      mcp: `${query} - Focus on Model Context Protocol implementation and integration`,
      general: query,
    };
    
    return focusEnhancements[focus] || query;
  }

  async handleGoDocsSearch(args) {
    const { package: pkg, function: fn, topic } = args;
    
    try {
      // This would search locally downloaded Go docs
      // For now, provide structured guidance
      let searchResult = '';
      
      if (pkg) {
        searchResult += `# Go Package: ${pkg}\n\n`;
        searchResult += await this.getGoPackageInfo(pkg);
      }
      
      if (fn) {
        searchResult += `\n\n# Function/Type: ${fn}\n\n`;
        searchResult += await this.getGoFunctionInfo(fn, pkg);
      }
      
      if (topic) {
        searchResult += `\n\n# Topic: ${topic}\n\n`;
        searchResult += await this.getGoTopicInfo(topic);
      }

      return {
        content: [
          {
            type: 'text',
            text: searchResult || 'No Go documentation found. Consider downloading Go docs locally.',
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error searching Go docs: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async getGoPackageInfo(pkg) {
    // Placeholder - would search local Go docs
    const commonPackages = {
      'net': 'Network I/O, including TCP/UDP, DNS resolution, and HTTP client',
      'syscall': 'Low-level operating system primitives and system calls',
      'unsafe': 'Memory management, pointer operations, and type conversions',
      'runtime': 'Go runtime services including GC, goroutines, and scheduling',
      'sync': 'Synchronization primitives like mutexes, channels, and atomic operations',
      'context': 'Request context, cancellation, and deadline management',
    };
    
    return commonPackages[pkg] || `Package ${pkg} - Documentation not locally available`;
  }

  async getGoFunctionInfo(fn, pkg) {
    // Placeholder - would search local Go docs for specific functions
    return `Function ${fn} in package ${pkg || 'unknown'} - Documentation not locally available`;
  }

  async getGoTopicInfo(topic) {
    // Placeholder - would search local Go docs by topic
    return `Topic ${topic} - Documentation not locally available. Consider using perplexity_research tool.`;
  }

  async handleResearchQuery(args) {
    const { query, area } = args;
    
    try {
      // Search through our research files
      const researchPath = '/Users/jean-patricksmith/digital/aiforge/r';
      const files = await fs.readdir(researchPath);
      const mdFiles = files.filter(f => f.endsWith('.md'));
      
      let results = '';
      
      for (const file of mdFiles) {
        const filePath = path.join(researchPath, file);
        const content = await fs.readFile(filePath, 'utf-8');
        
        // Simple text search (could be enhanced with vector search)
        if (content.toLowerCase().includes(query.toLowerCase())) {
          results += `\n## From ${file}:\n`;
          
          // Extract relevant sections
          const lines = content.split('\n');
          const queryLines = lines.filter(line => 
            line.toLowerCase().includes(query.toLowerCase())
          );
          
          queryLines.slice(0, 5).forEach(line => {
            results += `- ${line.trim()}\n`;
          });
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: results || `No research found for query: ${query}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error querying research: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async handleImportResearch(args) {
    const { path: researchPath } = args;
    
    try {
      const stats = await fs.stat(researchPath);
      let imported = [];
      
      if (stats.isDirectory()) {
        const files = await fs.readdir(researchPath);
        const mdFiles = files.filter(f => f.endsWith('.md'));
        imported = mdFiles;
      } else if (researchPath.endsWith('.md')) {
        imported = [path.basename(researchPath)];
      }

      return {
        content: [
          {
            type: 'text',
            text: `Imported ${imported.length} research files:\n${imported.map(f => `- ${f}`).join('\n')}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error importing research: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Kingly Research MCP server running on stdio');
  }
}

const server = new KinglyResearchMCP();
server.run().catch(console.error);