# FlowMind MCP Tool API Design

**Date**: January 9, 2025  
**Focus**: Complete MCP tool interface design for FlowMind

## Overview

The MCP (Model Context Protocol) tools are the critical interface between Beta LLM and the FlowMind system. This document provides comprehensive tool designs that enforce proper usage patterns.

## Core Design Principles

1. **Structured Input Enforcement** - Tools require specific formats
2. **Size Constraints** - Prevent overwhelming Alpha LLM
3. **Progressive Disclosure** - Tools guide toward better usage
4. **Bidirectional Teaching** - Responses include metadata for learning
5. **Graceful Degradation** - Handle errors with helpful guidance

## Primary Tool: field_request

### Purpose
Universal context discovery and semantic matching. The main entry point when Beta LLM doesn't know exactly what to execute.

### Complete Schema

```javascript
{
  name: 'field_request',
  description: `Universal context discovery for workflows, agents, patterns, and tools. 
                Use this when you need to find appropriate contexts based on user needs.
                The system will match based on semantic similarity and variables.`,
  
  inputSchema: {
    type: 'object',
    properties: {
      // Core request (required)
      query: { 
        type: 'string', 
        minLength: 10,
        maxLength: 500,
        description: 'Concise 2-sentence summary of what the user needs. Be specific about domain and intent.'
      },
      
      // Extracted variables (strongly recommended)
      extracted_variables: {
        type: 'object',
        description: 'Variables extracted from user input. The more you provide, the better the match.',
        properties: {
          // Universal variables (always applicable)
          domain: { 
            type: 'string',
            enum: ['technical', 'creative', 'business', 'regulatory', 'personal', 'emergency'],
            description: 'Primary domain of the request'
          },
          urgency: { 
            type: 'string',
            enum: ['low', 'medium', 'high', 'critical', 'emergency'],
            description: 'How urgent is this request?'
          },
          complexity: {
            type: 'string', 
            enum: ['simple', 'moderate', 'complex', 'expert'],
            description: 'Estimated complexity of the task'
          },
          user_sentiment: {
            type: 'string',
            enum: ['neutral', 'positive', 'frustrated', 'confused', 'urgent'],
            description: 'Detected user emotional state'
          },
          
          // Domain-specific variables (provide when relevant)
          // Technical domain
          technology: { 
            type: 'string',
            description: 'Primary technology mentioned (e.g., python, react, aws)'
          },
          error_type: {
            type: 'string',
            enum: ['syntax', 'runtime', 'logic', 'performance', 'security'],
            description: 'Type of technical error if applicable'
          },
          system_component: {
            type: 'string',
            description: 'System component affected (e.g., database, api, frontend)'
          },
          
          // Creative domain
          creative_type: {
            type: 'string',
            enum: ['writing', 'design', 'music', 'art', 'video'],
            description: 'Type of creative work'
          },
          genre: {
            type: 'string',
            description: 'Genre for creative work (e.g., romance, fantasy, mystery)'
          },
          audience: {
            type: 'string',
            enum: ['children', 'young_adult', 'adult', 'professional', 'general'],
            description: 'Target audience'
          },
          
          // Business domain
          business_area: {
            type: 'string',
            enum: ['strategy', 'operations', 'finance', 'marketing', 'hr', 'sales'],
            description: 'Business function involved'
          },
          stakeholder_count: {
            type: 'number',
            minimum: 1,
            maximum: 1000,
            description: 'Number of people affected'
          },
          
          // Regulatory domain
          jurisdiction: {
            type: 'string',
            description: 'Geographic jurisdiction (e.g., US, EU, California, Austin-TX)'
          },
          compliance_type: {
            type: 'string',
            enum: ['data_privacy', 'financial', 'healthcare', 'environmental', 'safety'],
            description: 'Type of compliance concern'
          }
        },
        additionalProperties: true  // Allow custom variables
      },
      
      // Confidence and context
      confidence_level: { 
        type: 'number', 
        minimum: 0,
        maximum: 1,
        description: 'Your confidence in the variable extraction (0-1). Be honest - lower confidence gets better guidance.'
      },
      
      // Optional context filters
      context_preferences: {
        type: 'object',
        properties: {
          type_filter: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['workflow', 'agent', 'pattern', 'tool']
            },
            description: 'Limit search to specific context types'
          },
          max_results: {
            type: 'number',
            minimum: 1,
            maximum: 10,
            default: 5,
            description: 'Maximum number of results to return'
          },
          include_explanations: {
            type: 'boolean',
            default: true,
            description: 'Include detailed explanations for matches'
          }
        }
      },
      
      // Content reference for large inputs
      content_reference: {
        type: 'object',
        properties: {
          has_large_content: { 
            type: 'boolean',
            description: 'True if user provided large content (>1000 chars)'
          },
          content_type: {
            type: 'string',
            enum: ['document', 'code', 'data', 'mixed'],
            description: 'Type of large content'
          },
          content_summary: { 
            type: 'string', 
            maxLength: 1000,
            description: 'Brief summary of the large content'
          },
          content_file_path: { 
            type: 'string',
            description: 'Path where large content was saved'
          },
          key_entities: {
            type: 'array',
            items: { type: 'string' },
            maxItems: 20,
            description: 'Key entities extracted from content (e.g., character names, function names)'
          }
        },
        required: ['has_large_content']
      }
    },
    required: ['query', 'confidence_level'],
    
    // Validation rules
    allOf: [
      {
        // If domain is technical, encourage technology specification
        if: {
          properties: { 
            extracted_variables: {
              properties: { domain: { const: 'technical' } }
            }
          }
        },
        then: {
          properties: {
            extracted_variables: {
              required: ['technology']
            }
          }
        }
      },
      {
        // If urgency is critical/emergency, require domain
        if: {
          properties: {
            extracted_variables: {
              properties: { 
                urgency: { enum: ['critical', 'emergency'] }
              }
            }
          }
        },
        then: {
          properties: {
            extracted_variables: {
              required: ['domain']
            }
          }
        }
      }
    ]
  }
}
```

### Response Format

```javascript
{
  // Status indicates next action
  status: 'success' | 'disambiguation_needed' | 'refinement_suggested' | 'no_matches' | 'content_processing_required',
  
  // Matched contexts (if any)
  matches: [
    {
      uri: 'workflow://incident-response',
      type: 'workflow',
      confidence: 0.92,
      
      // Why this matched
      match_reasoning: {
        semantic_similarity: 0.89,
        variable_alignment: 0.95,
        domain_match: true,
        explanation: 'Strong match for technical emergency with system component specified'
      },
      
      // Activation requirements
      activation: {
        condition: 'User reports production impact with high urgency',
        confidence_required: 0.75,
        your_confidence: 0.92,
        can_execute: true
      },
      
      // Required/optional variables
      variables: {
        required: ['system_component', 'error_description'],
        optional: ['affected_users', 'duration'],
        provided: ['system_component'],
        missing: ['error_description']
      },
      
      // Execution preview
      execution_preview: {
        type: 'recursive_workflow',
        estimated_steps: '5-15 depending on complexity',
        contexts_involved: ['agent://debugger', 'agent://communicator'],
        stopping_condition: 'Issue resolved or escalated'
      },
      
      // How to execute
      next_action: {
        tool: 'execute_workflow',
        parameters: {
          workflow_uri: 'workflow://incident-response',
          initial_variables: {
            system_component: 'checkout',
            urgency: 'critical'
          }
        }
      }
    }
  ],
  
  // Guidance for improvement
  guidance: {
    message: 'Good variable extraction! Missing error_description would improve matching.',
    suggestions: [
      'Ask user: "What specific error or behavior are you seeing?"',
      'Common patterns: timeout, 500 error, data inconsistency'
    ],
    teaching: {
      insight: 'Technical issues match better with error_type specified',
      better_query_example: 'Checkout system throwing 500 errors on payment processing',
      variables_that_would_help: ['error_type', 'affected_users', 'start_time']
    }
  },
  
  // Disambiguation if needed
  disambiguation: {
    needed: true,
    reason: 'Multiple workflows match with similar confidence',
    questions: [
      {
        question: 'Is this affecting current users?',
        why: 'Determines incident vs. investigation workflow',
        variable_captured: 'active_impact'
      }
    ]
  },
  
  // System metadata for learning
  _metadata: {
    search_time_ms: 23,
    contexts_searched: 1847,
    indices_used: ['domain_filtered', 'vector_similarity'],
    cache_hit: false,
    alpha_llm_calls: 2
  }
}
```

## Secondary Tool: execute_workflow

### Purpose
Direct workflow execution when the specific workflow is known.

### Complete Schema

```javascript
{
  name: 'execute_workflow',
  description: `Execute a specific FlowMind workflow. Use this when you know exactly which 
                workflow to run, either from field_request results or user specification.`,
  
  inputSchema: {
    type: 'object',
    properties: {
      // Workflow identifier (required)
      workflow_uri: { 
        type: 'string',
        pattern: '^(workflow|agent|pattern)://[a-z0-9-]+(/[a-z0-9-]+)*$',
        description: 'Workflow URI (e.g., workflow://incident-response, agent://technical-advisor)'
      },
      
      // Initial context
      initial_variables: {
        type: 'object',
        description: 'Variables to initialize the workflow with',
        additionalProperties: true
      },
      
      // Execution control
      execution_mode: {
        type: 'string',
        enum: ['interactive', 'autonomous', 'step_confirm'],
        default: 'interactive',
        description: `Execution mode:
          - interactive: Pause for user input when needed
          - autonomous: Run to completion without interaction
          - step_confirm: Confirm before each major step`
      },
      
      // Session management
      session_id: {
        type: 'string',
        description: 'Session ID to continue existing workflow (leave empty for new session)'
      },
      
      // Confidence threshold override
      confidence_override: {
        type: 'object',
        properties: {
          min_confidence: {
            type: 'number',
            minimum: 0,
            maximum: 1,
            description: 'Minimum confidence for autonomous decisions'
          },
          require_confirmation_below: {
            type: 'number',
            minimum: 0,
            maximum: 1,
            description: 'Require confirmation for actions below this confidence'
          }
        }
      },
      
      // Safety constraints
      constraints: {
        type: 'object',
        properties: {
          max_steps: {
            type: 'number',
            minimum: 1,
            maximum: 100,
            default: 50,
            description: 'Maximum steps before requiring confirmation'
          },
          max_duration_ms: {
            type: 'number',
            minimum: 1000,
            maximum: 600000,
            default: 300000,
            description: 'Maximum execution time (ms) before timeout'
          },
          require_approval_for: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['external_api_calls', 'file_modifications', 'context_switches']
            },
            description: 'Actions requiring explicit approval'
          }
        }
      }
    },
    required: ['workflow_uri']
  }
}
```

## Utility Tool: evaluate_semantic_condition

### Purpose
Evaluate natural language conditions for workflow branching.

### Complete Schema

```javascript
{
  name: 'evaluate_semantic_condition',
  description: `Evaluate a natural language condition against current context. 
                Use for workflow branching decisions or understanding activation conditions.`,
  
  inputSchema: {
    type: 'object',
    properties: {
      condition: {
        type: 'string',
        maxLength: 200,
        description: 'Natural language condition to evaluate (e.g., "user seems frustrated")'
      },
      
      context: {
        type: 'object',
        properties: {
          user_message: {
            type: 'string',
            maxLength: 1000,
            description: 'Recent user message to evaluate against'
          },
          conversation_summary: {
            type: 'string',
            maxLength: 500,
            description: 'Summary of conversation context'
          },
          session_variables: {
            type: 'object',
            description: 'Current session variables',
            additionalProperties: true
          }
        },
        required: ['user_message']
      },
      
      evaluation_type: {
        type: 'string',
        enum: ['boolean', 'confidence', 'detailed'],
        default: 'confidence',
        description: `Evaluation type:
          - boolean: Simple true/false
          - confidence: Boolean + confidence score
          - detailed: Full analysis with reasoning`
      }
    },
    required: ['condition', 'context']
  }
}
```

## Discovery Tool: list_available_contexts

### Purpose
Browse available contexts when exploring options.

### Complete Schema

```javascript
{
  name: 'list_available_contexts',
  description: 'List available contexts with filtering. Use to explore what workflows, agents, and patterns are available.',
  
  inputSchema: {
    type: 'object',
    properties: {
      filter: {
        type: 'object',
        properties: {
          type: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['workflow', 'agent', 'pattern', 'tool']
            },
            description: 'Filter by context type'
          },
          domain: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['technical', 'creative', 'business', 'regulatory', 'personal']
            },
            description: 'Filter by domain'
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
            description: 'Filter by tags'
          },
          complexity: {
            type: 'string',
            enum: ['simple', 'moderate', 'complex', 'expert'],
            description: 'Filter by complexity level'
          }
        }
      },
      
      sort: {
        type: 'object',
        properties: {
          by: {
            type: 'string',
            enum: ['name', 'popularity', 'recent', 'relevance'],
            default: 'relevance'
          },
          order: {
            type: 'string',
            enum: ['asc', 'desc'],
            default: 'desc'
          }
        }
      },
      
      pagination: {
        type: 'object',
        properties: {
          offset: {
            type: 'number',
            minimum: 0,
            default: 0
          },
          limit: {
            type: 'number',
            minimum: 1,
            maximum: 50,
            default: 20
          }
        }
      }
    }
  }
}
```

## Advanced Tool: compose_workflow

### Purpose
Create custom workflows by combining existing contexts.

### Complete Schema

```javascript
{
  name: 'compose_workflow',
  description: 'Compose a custom workflow from multiple contexts. Use for complex multi-domain scenarios.',
  
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        pattern: '^[a-z0-9-]+$',
        description: 'Name for the composed workflow'
      },
      
      description: {
        type: 'string',
        maxLength: 500,
        description: 'What this workflow accomplishes'
      },
      
      components: {
        type: 'array',
        minItems: 2,
        maxItems: 10,
        items: {
          type: 'object',
          properties: {
            uri: {
              type: 'string',
              description: 'Context URI to include'
            },
            role: {
              type: 'string',
              enum: ['primary', 'support', 'validation', 'synthesis'],
              description: 'Role of this component'
            },
            when: {
              type: 'string',
              description: 'Condition for including this component'
            },
            configuration: {
              type: 'object',
              description: 'Component-specific configuration',
              additionalProperties: true
            }
          },
          required: ['uri', 'role']
        }
      },
      
      flow_type: {
        type: 'string',
        enum: ['sequential', 'parallel', 'conditional', 'iterative'],
        description: 'How components are executed'
      },
      
      variables: {
        type: 'object',
        properties: {
          required: {
            type: 'array',
            items: { type: 'string' },
            description: 'Required variables for this workflow'
          },
          optional: {
            type: 'array',
            items: { type: 'string' },
            description: 'Optional variables'
          }
        }
      },
      
      save: {
        type: 'boolean',
        default: false,
        description: 'Save this workflow for future use'
      }
    },
    required: ['name', 'components', 'flow_type']
  }
}
```

## Error Handling Tool: get_help

### Purpose
Get help when confused or encountering errors.

### Complete Schema

```javascript
{
  name: 'get_help',
  description: 'Get help with FlowMind usage, error resolution, or best practices.',
  
  inputSchema: {
    type: 'object',
    properties: {
      help_type: {
        type: 'string',
        enum: ['error', 'usage', 'best_practices', 'concept'],
        description: 'Type of help needed'
      },
      
      context: {
        type: 'object',
        properties: {
          error_message: {
            type: 'string',
            description: 'Error message if applicable'
          },
          attempted_action: {
            type: 'string',
            description: 'What you were trying to do'
          },
          current_state: {
            type: 'object',
            description: 'Current workflow state',
            additionalProperties: true
          }
        }
      },
      
      specific_question: {
        type: 'string',
        maxLength: 500,
        description: 'Specific question about FlowMind'
      }
    },
    required: ['help_type']
  }
}
```

## MCP Tool Response Patterns

### Success Response Pattern

```javascript
{
  success: true,
  result: { /* tool-specific result */ },
  
  // Always include teaching
  teaching: {
    tip: 'Next time, include error_type for faster matching',
    pattern: 'technical + error_type + system = great match',
    confidence_calibration: 'Your 0.7 was actually 0.85 - be more confident!'
  },
  
  // Suggest next actions
  next_actions: [
    {
      tool: 'execute_workflow',
      reason: 'High confidence match ready to execute',
      parameters: { /* pre-filled */ }
    }
  ],
  
  // Performance metadata
  _performance: {
    total_time_ms: 47,
    alpha_llm_time_ms: 23,
    search_time_ms: 18,
    assembly_time_ms: 6
  }
}
```

### Error Response Pattern

```javascript
{
  success: false,
  error: {
    code: 'INVALID_VARIABLES',
    message: 'Domain "technical" requires technology to be specified',
    
    // Always educational
    fix: {
      instruction: 'Add technology to extracted_variables',
      example: { technology: 'python' },
      why: 'Technical workflows are organized by technology stack'
    }
  },
  
  // Still provide guidance
  guidance: {
    common_technologies: ['python', 'javascript', 'java', 'react', 'aws'],
    detection_hint: 'Look for language names, frameworks, or platforms in user message'
  },
  
  // Partial results if available
  partial_results: {
    message: 'Would have found 3 Python debugging workflows',
    blocked_by: 'missing_technology_variable'
  }
}
```

### Progressive Teaching Pattern

```javascript
// First attempt
{
  teaching: {
    level: 'beginner',
    message: 'Good start! Try adding domain next time.',
    example: { domain: 'technical' }
  }
}

// Second attempt  
{
  teaching: {
    level: 'intermediate',
    message: 'Much better! Now you understand domains. Consider urgency too.',
    example: { urgency: 'high' }
  }
}

// Later attempts
{
  teaching: {
    level: 'advanced',
    message: 'Excellent variable extraction! You could use compose_workflow for this multi-domain case.',
    unlock: 'compose_workflow tool now available'
  }
}
```

## Tool Authorization & Limits

### Rate Limiting

```javascript
{
  rate_limits: {
    field_request: {
      per_minute: 60,
      burst: 10,
      penalty: 'progressive_backoff'
    },
    execute_workflow: {
      per_minute: 20,
      concurrent: 5,
      queue_overflow: 'reject_with_guidance'
    },
    evaluate_semantic_condition: {
      per_minute: 100,
      cache_ttl_ms: 5000
    }
  }
}
```

### Progressive Authorization

```javascript
{
  authorization_levels: {
    beginner: {
      tools: ['field_request', 'get_help'],
      limits: { max_complexity: 'simple' }
    },
    intermediate: {
      tools: ['field_request', 'execute_workflow', 'evaluate_semantic_condition', 'get_help'],
      limits: { max_complexity: 'moderate' }
    },
    advanced: {
      tools: ['all'],
      limits: { max_complexity: 'expert' }
    }
  },
  
  progression: {
    trigger: 'successful_tool_usage_count',
    thresholds: {
      intermediate: 10,
      advanced: 50
    }
  }
}
```

## Implementation Notes

### Tool Validation Middleware

```javascript
class ToolValidator {
  async validateFieldRequest(params) {
    const errors = []
    
    // Validate query quality
    if (params.query.split(' ').length < 3) {
      errors.push({
        field: 'query',
        issue: 'Too brief',
        suggestion: 'Add more context: what, why, or how'
      })
    }
    
    // Validate variable consistency
    if (params.extracted_variables?.domain === 'technical' 
        && !params.extracted_variables?.technology) {
      errors.push({
        field: 'extracted_variables.technology',
        issue: 'Technical domain requires technology',
        suggestion: 'Specify the primary technology involved'
      })
    }
    
    // Validate confidence honesty
    if (params.confidence_level > 0.9 
        && Object.keys(params.extracted_variables || {}).length < 3) {
      errors.push({
        field: 'confidence_level',
        issue: 'High confidence with few variables',
        suggestion: 'Lower confidence or extract more variables'
      })
    }
    
    return errors
  }
}
```

### Response Enhancement

```javascript
class ResponseEnhancer {
  enhance(baseResponse, request, performanceMetrics) {
    return {
      ...baseResponse,
      
      // Add contextual teaching
      teaching: this.generateTeaching(baseResponse, request),
      
      // Add next action suggestions
      next_actions: this.suggestNextActions(baseResponse),
      
      // Add performance insights
      _insights: this.generateInsights(performanceMetrics),
      
      // Add progressive unlocks
      _unlocks: this.checkUnlocks(request.user_progress)
    }
  }
}
```

## Conclusion

The MCP Tool API design enforces structured communication between Beta LLM and FlowMind while maintaining flexibility. Key features:

1. **Progressive Complexity** - Simple tools unlock advanced features
2. **Bidirectional Teaching** - Every response improves future usage
3. **Structured Extraction** - Forces proper variable identification
4. **Graceful Errors** - Failures become learning opportunities
5. **Performance Visibility** - Users understand system behavior

This design ensures that Beta LLMs learn to use FlowMind effectively while maintaining the system's performance and reliability goals.

---

*"Great tools teach their users how to become experts."*