# Complete Command System Overhaul

**Status:** APPROVED - Ready for Implementation  
**Date:** January 6, 2025  
**Scope:** Universal context search + enhanced cache + command standardization

## Executive Summary

This overhaul addresses all identified issues in the hybrid command system:
1. **Command standardization** - Error recovery + whisper arrays for all commands
2. **Universal search** - Single find command with --type filters, remove combos
3. **Simple slugs** - Replace weird codes (1a, 2a) with meaningful slugs (discord-tool)
4. **Rich embeddings** - Surface detailed YAML content for better semantic search
5. **Dynamic types** - File-system driven type discovery, no hardcoded categories
6. **Command consolidation** - Merge rollup into ping --final

## Phase 1: Command Registry Standardization

### File: `src/command-registry.js`

#### 1.1 Add Error Recovery to ALL Commands
Every command needs error_recovery field with self-talk guidance:

```javascript
find: {
  whisper: {
    // existing fields...
    error_recovery: "No match? Try broader terms, different --type, or 'kingly status --project'"
  }
},
ping: {
  whisper: {
    // existing fields...
    error_recovery: "Checkpoint failed? Check .kingly permissions, simplify context, verify workspace"
  }
},
promote: {
  whisper: {
    // existing fields...
    error_recovery: "Promotion failed? Run 'kingly validate <context>' first, check effectiveness metrics"
  }
},
validate: {
  whisper: {
    // existing fields...
    error_recovery: "Validation failed? Review context structure, check effectiveness thresholds"
  }
},
sync: {
  whisper: {
    // existing fields...
    error_recovery: "Sync failed? Try 'kingly sync --check', verify .kingly structure"
  }
},
status: {
  whisper: {
    // existing fields...
    error_recovery: "Status failed? Check project structure, try 'kingly sync --check'"
  }
},
load: {
  whisper: {
    // existing fields...
    error_recovery: "Load failed? Check session ID in ~/.kingly/sessions/, try without --session"
  }
},
job: {
  whisper: {
    // existing fields...
    error_recovery: "Orchestration failed? Simplify description, break into smaller jobs"
  }
}
```

#### 1.2 Convert Whispers to Strategy Arrays
Replace single whispers with arrays of self-talk strategies:

```javascript
ping: {
  syntax: "kingly ping [<context>] [--final]",
  description: "Save session checkpoint with anti-drift guidance",
  examples: [
    "kingly ping 'working on auth system'",
    "kingly ping 'completed user research'",
    "kingly ping 'session complete' --final"
  ],
  whisper: {
    strategies: [
      "Save checkpoint with rich context metadata",
      "Generate session ID for continuity", 
      "Provide anti-drift guidance rotation"
    ],
    anti_drift_rotation: [
      "Remember to commit changes before session end",
      "Document architectural decisions made",
      "Capture test results and coverage data",
      "Note environment-specific configurations"
    ],
    self_talk: "User saving checkpoint. Acknowledge save, rotate anti-drift advice.",
    error_recovery: "Checkpoint failed? Check .kingly permissions, simplify context"
  }
},

find: {
  syntax: "kingly find <query> [--type=workflow|tool|agent|pattern]",
  description: "Universal context search across all types",
  examples: [
    "kingly find creative brainstorming",
    "kingly find automation --type=tool",
    "kingly find claude --type=agent"
  ],
  whisper: {
    strategies: [
      "Universal search across all context types",
      "Use --type filters to narrow scope",
      "Return slugs with clear next steps"
    ],
    chain_hints: [
      "Complex goals? Suggest combining contexts",
      "No exact match? Offer related contexts",
      "Multiple matches? Show top 3 with confidence"
    ],
    self_talk: "I'm searching contexts. Return what user wants with clear next steps.",
    error_recovery: "No match? Try broader terms, different --type, or 'kingly status --project'"
  }
}
```

#### 1.3 Merge find/combos into Universal Search
```javascript
// REMOVE combos command entirely
// ENHANCE find command to handle all search needs:

find: {
  syntax: "kingly find <query> [--type=workflow|tool|agent|pattern]",
  description: "Universal context search across all types",
  examples: [
    "kingly find creative brainstorming",           // All types
    "kingly find automation --type=tool",          // Just tools
    "kingly find claude --type=agent",             // Just agents
    "kingly find apple --type=pattern"             // Just patterns
  ],
  whisper: {
    strategies: [
      "Universal context discovery - show most relevant matches",
      "Use --type to filter by context type (dynamic from file system)",
      "Suggest chaining contexts for complex scenarios"
    ],
    chain_hints: [
      "Multiple workflows needed? Suggest orchestrateSequence strategy",
      "Tools + patterns? Show how they complement each other",
      "Complex query? Break into specific context searches"
    ],
    self_talk: "Search all contexts, return best matches with usage guidance",
    error_recovery: "No match? Try broader terms, different --type, or 'kingly status --project'"
  }
}
```

#### 1.4 Remove rollup, Add ping --final
```javascript
// REMOVE rollup from COMMAND_REGISTRY
// ADD --final flag support to ping:

ping: {
  syntax: "kingly ping [<context>] [--final]",
  description: "Save session checkpoint with anti-drift guidance",
  examples: [
    "kingly ping 'working on auth system'",        // Regular checkpoint
    "kingly ping 'completed user research'",       // Progress checkpoint  
    "kingly ping 'session complete' --final"       // Rollup functionality
  ],
  whisper: {
    strategies: [
      "Regular checkpoint: save progress with metadata",
      "Final checkpoint: consolidate session into validated learning trace",
      "Anti-drift guidance: rotate contextual reminders"
    ],
    final_flag_behavior: [
      "Consolidate all session pings into summary",
      "Create validated learning trace document", 
      "Provide handoff guidance for next session"
    ],
    self_talk: "Checkpoint save - acknowledge and provide contextual guidance",
    error_recovery: "Checkpoint failed? Check .kingly permissions, simplify context"
  }
}
```

#### 1.5 Add rebuild-cache Command
```javascript
'rebuild-cache': {
  syntax: "kingly rebuild-cache [--provider=openai|claude] [--force]",
  description: "Rebuild embeddings cache with enhanced context data",
  examples: [
    "kingly rebuild-cache",
    "kingly rebuild-cache --provider=claude",
    "kingly rebuild-cache --force"
  ],
  whisper: {
    strategies: [
      "Rebuild semantic embeddings with rich YAML content",
      "Support multiple LLM providers for embeddings",
      "Force rebuild ignores content hashes"
    ],
    enhancement_notes: [
      "Uses rich YAML content: tool_config, pattern_config, mcp_tools",
      "Dynamic type discovery from contexts/ directory structure",
      "Simple slugs instead of weird codes"
    ],
    self_talk: "Rebuilding cache - explain process and estimated time",
    error_recovery: "Cache rebuild failed? Check provider API key, verify contexts/ structure"
  }
}
```

#### 1.6 Clean Up Command Categories
```javascript
// REMOVE unused COMMAND_CATEGORIES export
// Categories become dynamic based on file system discovery
```

## Phase 2: Workflow Loader Enhancement

### File: `src/workflow-loader.js`

#### 2.1 Replace Weird Codes with Simple Slugs
```javascript
// REPLACE generateQuickCode method:
generateSlug(category, dirName, yamlData) {
  // Use directory name as slug: "discord-tool", "reverse-brainstorming"
  return dirName;
  
  // OR use YAML metadata if available:
  // return yamlData.metadata.slug || dirName;
}

// UPDATE loadWorkflow method:
async loadWorkflow(filePath, category) {
  const content = await fs.readFile(filePath, 'utf-8');
  const data = yaml.load(content);
  
  if (!data?.metadata) {
    return null;
  }

  const dirName = path.basename(path.dirname(filePath));
  const slug = this.generateSlug(category, dirName, data); // NEW: Use slug
  
  return {
    id: data.metadata.id || dirName,
    slug,           // NEW: Simple slug instead of weird code
    code: slug,     // Keep for backward compatibility
    name: this.formatName(data.metadata.description || dirName),
    description: data.metadata.description || '',
    category,
    type: category, // NEW: Alias for consistency
    filePath,
    data,
    instructions: this.extractInstructions(data),
    triggers: this.extractTriggers(data),
  };
}
```

#### 2.2 Dynamic Context Type Discovery
```javascript
// REPLACE hardcoded categories with dynamic discovery:
async loadAllWorkflows() {
  console.error('Loading contexts from all types...');
  
  // Dynamic type discovery
  const contextTypes = await this.discoverContextTypes();
  let totalLoaded = 0;

  for (const type of contextTypes) {
    const typePath = path.join(this.contextPath, type);
    if (!await fs.pathExists(typePath)) {
      continue;
    }

    const contextFiles = await glob('**/context.yaml', { 
      cwd: typePath,
      absolute: true 
    });

    for (const filePath of contextFiles) {
      try {
        const context = await this.loadWorkflow(filePath, type);
        if (context) {
          this.cache.set(context.id, context);
          this.quickCodes.set(context.slug, context); // Use slug
          totalLoaded++;
        }
      } catch (error) {
        console.error(`Error loading ${filePath}:`, error.message);
      }
    }
  }

  console.error(`✅ Loaded ${totalLoaded} contexts from ${contextTypes.length} types`);
  this.loaded = true;
}

async discoverContextTypes() {
  const contextsPath = this.contextPath;
  const entries = await fs.readdir(contextsPath, { withFileTypes: true });
  
  return entries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);
}
```

#### 2.3 Enhanced Content Extraction
```javascript
// ENHANCE extractInstructions and extractTriggers to surface more YAML data:
extractInstructions(data) {
  const instructions = [];
  
  // Existing logic
  if (data.workflow_config?.process) {
    instructions.push(data.workflow_config.process);
  }
  if (data.pattern_config?.process) {
    instructions.push(Object.values(data.pattern_config.process).join('\n'));
  }
  
  // NEW: Add tool capabilities and MCP tools
  if (data.tool_config?.capabilities) {
    instructions.push(`Capabilities: ${data.tool_config.capabilities.join(', ')}`);
  }
  if (data.tool_config?.mcp_tools) {
    const toolNames = data.tool_config.mcp_tools.map(t => t.name).join(', ');
    instructions.push(`MCP Tools: ${toolNames}`);
  }
  
  return instructions.length > 0 ? instructions.join('\n') : 'Execute this context with current setup.';
}

extractTriggers(data) {
  const triggers = [];
  
  // Existing trigger extraction
  if (data.workflow_config?.triggers) {
    if (Array.isArray(data.workflow_config.triggers)) {
      triggers.push(...data.workflow_config.triggers);
    } else if (data.workflow_config.triggers.manual) {
      triggers.push(...data.workflow_config.triggers.manual);
    }
  }
  
  if (data.pattern_config?.use_cases) {
    triggers.push(...data.pattern_config.use_cases);
  }
  
  // NEW: Add tool-specific triggers
  if (data.tool_config?.capabilities) {
    triggers.push(...data.tool_config.capabilities);
  }
  
  return triggers.length > 0 ? triggers : ['General purpose context'];
}
```

## Phase 3: Semantic Lookup Enhancement

### File: `src/semantic-lookup.js`

#### 3.1 Enhanced Embedding Text with Rich YAML
```javascript
// ENHANCE getEmbeddingText to include rich YAML content:
getEmbeddingText(context) {
  const parts = [
    context.name,
    context.description,
    context.triggers?.join(' ') || '',
    context.category,
    
    // NEW: Rich YAML content
    context.data.tool_config?.capabilities?.join(' ') || '',
    context.data.tool_config?.philosophy || '',
    context.data.pattern_config?.use_cases?.join(' ') || '',
    context.data.workflow_config?.triggers?.manual?.join(' ') || '',
    
    // MCP tools information
    context.data.tool_config?.mcp_tools?.map(tool => 
      `${tool.name} ${tool.description}`
    ).join(' ') || '',
    
    // Integration notes
    context.data.tool_config?.integration_notes ? 
      Object.values(context.data.tool_config.integration_notes).join(' ') : '',
    
    // Response formatting info for tools
    context.data.tool_config?.response_formatting ? 
      JSON.stringify(context.data.tool_config.response_formatting) : ''
  ];
  
  return parts.filter(Boolean).join(' ').toLowerCase();
}
```

#### 3.2 Slug-Based Storage
```javascript
// UPDATE buildEmbeddings to use slugs:
async buildEmbeddings(contexts) {
  console.error('🔄 Building embeddings with enhanced content...');
  
  const newEmbeddings = new Map();
  const batch = [];
  
  for (const context of contexts) {
    const text = this.getEmbeddingText(context);
    batch.push({
      slug: context.slug,    // Use slug instead of ID
      text,
      context
    });
  }
  
  // Process in batches
  for (let i = 0; i < batch.length; i += 100) {
    const batchSlice = batch.slice(i, i + 100);
    const texts = batchSlice.map(item => item.text);
    
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: texts,
      });
      
      response.data.forEach((embedding, index) => {
        const item = batchSlice[index];
        newEmbeddings.set(item.slug, {    // Use slug as key
          embedding: embedding.embedding,
          text: item.text,
          context: {
            slug: item.context.slug,
            name: item.context.name,
            description: item.context.description,
            type: item.context.category,
            capabilities: item.context.data.tool_config?.capabilities,
            use_cases: item.context.data.pattern_config?.use_cases,
            triggers: item.context.triggers,
            file_path: item.context.filePath
          }
        });
      });
      
      console.error(`✅ Processed batch ${Math.floor(i/100) + 1}/${Math.ceil(batch.length/100)}`);
    } catch (error) {
      console.error(`Error in batch ${i}:`, error.message);
    }
  }
  
  this.embeddings = newEmbeddings;
  await this.saveEmbeddings();
  console.error(`🎯 Built ${this.embeddings.size} embeddings with enhanced content`);
}
```

#### 3.3 Enhanced Search Results
```javascript
// UPDATE findWorkflow to return enhanced results:
async findWorkflow(query) {
  await this.ensureLoaded();
  
  if (this.embeddings.size === 0) {
    throw new Error('No embeddings available. Run: kingly rebuild-cache');
  }
  
  const queryEmbedding = await this.getQueryEmbedding(query);
  
  const similarities = [];
  for (const [slug, data] of this.embeddings) {
    const similarity = this.cosineSimilarity(queryEmbedding, data.embedding);
    similarities.push({
      slug,
      similarity,
      context: data.context,
    });
  }
  
  similarities.sort((a, b) => b.similarity - a.similarity);
  
  const best = similarities[0];
  if (best && best.similarity > 0.5) {
    return {
      found: true,
      slug: best.slug,
      name: best.context.name,
      description: best.context.description,
      type: best.context.type,
      similarity: best.similarity,
      capabilities: best.context.capabilities,
      use_cases: best.context.use_cases,
      file_path: best.context.file_path
    };
  }
  
  return {
    found: false,
    suggestions: similarities.slice(0, 5).map(s => ({
      slug: s.slug,
      name: s.context.name,
      similarity: s.similarity
    }))
  };
}
```

## Phase 4: Router Updates

### File: `src/hybrid-router.js`

#### 4.1 Handle --type Filters in find
```javascript
// UPDATE handle_find to support --type filters:
async handle_find(args) {
  const typeIndex = args.indexOf('--type');
  let typeFilter = null;
  let intent = args.join(' ');
  
  if (typeIndex !== -1 && typeIndex + 1 < args.length) {
    typeFilter = args[typeIndex + 1];
    // Remove --type and value from intent
    const beforeType = args.slice(0, typeIndex);
    const afterType = args.slice(typeIndex + 2);
    intent = [...beforeType, ...afterType].join(' ');
  }
  
  if (!intent) throw new Error("Search query required. Usage: kingly find <query> [--type=workflow|tool|agent|pattern]");
  
  // Use enhanced search with type filter
  const result = await this.adapter.findWorkflow(intent, "full", typeFilter);
  
  if (result.found) {
    const nextActions = await this.adapter.suggestNext(result.slug);
    return {
      success: true,
      context: result,
      next_actions: nextActions.suggestions || [],
      search_type: typeFilter ? `Filtered by type: ${typeFilter}` : 'All types'
    };
  } else {
    return {
      success: false,
      suggestions: result.suggestions?.slice(0, 3) || [],
      search_query: intent,
      type_filter: typeFilter,
      alternative_message: typeFilter ? 
        `No ${typeFilter} contexts found for "${intent}". Try different terms or remove --type filter.` :
        "No exact match found. Try these related contexts:"
    };
  }
}
```

#### 4.2 Handle ping --final Flag
```javascript
// UPDATE handle_ping to support --final flag:
async handle_ping(args) {
  const finalIndex = args.indexOf('--final');
  const isFinal = finalIndex !== -1;
  
  // Remove --final flag from context
  if (isFinal) {
    args.splice(finalIndex, 1);
  }
  
  const context = this.getArgValue(args, '--context') || args.join(' ');
  const files = this.getArgValue(args, '--files');
  const sessionType = isFinal ? 'rollup' : 'general';
  
  if (!context && !isFinal) {
    const autoContext = await this.autoDetectContext();
    return await this.sessionManager.ping(autoContext, files, sessionType);
  }
  
  const result = await this.sessionManager.ping(context, files, sessionType);
  
  // Add rollup-specific enhancements for final checkpoints
  if (isFinal) {
    result.rollup_created = true;
    result.session_consolidated = true;
    result.handoff_ready = true;
  }
  
  return result;
}
```

#### 4.3 Add rebuild-cache Handler
```javascript
// ADD new handler for rebuild-cache:
async handle_rebuild_cache(args) {
  const provider = this.getArgValue(args, '--provider') || 'openai';
  const force = args.includes('--force');
  
  try {
    console.error('🔄 Starting cache rebuild...');
    
    // Clear existing cache if force flag
    if (force) {
      await this.adapter.clearCache();
    }
    
    // Reload all contexts with dynamic type discovery
    await this.adapter.workflowLoader.refreshCache();
    
    // Rebuild embeddings with enhanced content
    const contexts = await this.adapter.workflowLoader.loadAll();
    await this.adapter.semanticLookup.buildEmbeddings(contexts);
    
    return {
      success: true,
      cache_rebuilt: true,
      contexts_processed: contexts.length,
      provider_used: provider,
      enhanced_content: true,
      dynamic_types: true,
      message: `✅ Rebuilt cache with ${contexts.length} contexts using ${provider} embeddings`
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      recovery_suggestions: [
        `Check ${provider} API key configuration`,
        'Verify contexts/ directory structure',
        'Try without --provider flag for default'
      ]
    };
  }
}
```

## Phase 5: Formatter Updates

### File: `src/cli-formatter.js`

#### 5.1 Show Slugs Instead of Codes
```javascript
// UPDATE formatWorkflowResult to show slugs:
function formatWorkflowResult(result) {
  const context = result.context || result.workflow;
  let output = `✅ Found: ${context.slug} - ${context.name}\n`;  // Show slug
  
  if (context.similarity) {
    output += `🎯 Match: ${(context.similarity * 100).toFixed(0)}%\n`;
  }
  
  if (context.description) {
    output += `📋 ${context.description}\n`;
  }
  
  if (context.type) {
    output += `🏷️ Type: ${context.type}\n`;
  }
  
  if (context.capabilities && context.capabilities.length > 0) {
    output += `⚡ Capabilities: ${context.capabilities.slice(0, 3).join(', ')}\n`;
  }
  
  if (result.next_actions && result.next_actions.length > 0) {
    output += `➡️ Next: ${result.next_actions[0]}\n`;
  }

  return output;
}
```

#### 5.2 Enhanced Search Results
```javascript
// UPDATE formatHybridResult for enhanced search:
function formatHybridResult(result) {
  const innerResult = result.result;
  
  // Enhanced context found
  if (innerResult.context && innerResult.success) {
    const context = innerResult.context;
    let output = `✅ Found: ${context.slug} - ${context.name}\n`;
    
    if (context.similarity) {
      output += `🎯 Match: ${(context.similarity * 100).toFixed(0)}%\n`;
    }
    
    if (context.description) {
      output += `📋 ${context.description}\n`;
    }
    
    if (context.type) {
      output += `🏷️ Type: ${context.type}\n`;
    }
    
    if (innerResult.search_type) {
      output += `🔍 Search: ${innerResult.search_type}\n`;
    }
    
    if (innerResult.next_actions && innerResult.next_actions.length > 0) {
      output += `➡️ Next: ${innerResult.next_actions[0]}\n`;
    }

    return output.trim();
  }
  
  // No context found - show suggestions
  if (innerResult.suggestions && innerResult.suggestions.length > 0) {
    let output = `❌ No exact match found`;
    
    if (innerResult.type_filter) {
      output += ` for type: ${innerResult.type_filter}`;
    }
    
    output += `\n\n🔍 Try these related contexts:\n`;
    
    innerResult.suggestions.slice(0, 3).forEach((suggestion, i) => {
      output += `${i + 1}. ${suggestion.slug} - ${suggestion.name}`;
      if (suggestion.similarity) {
        output += ` (${(suggestion.similarity * 100).toFixed(0)}%)`;
      }
      output += '\n';
    });
    
    output += `\n💡 Try: kingly find "<more specific terms>"`;
    if (innerResult.type_filter) {
      output += ` or remove --type filter`;
    }
    
    return output;
  }
  
  // Fallback
  return JSON.stringify(result, null, 2);
}
```

## Implementation Order & Testing

### 1. Phase 1: Command Registry
- Add error_recovery to all commands
- Convert whispers to arrays
- Merge find/combos
- Remove rollup, add ping --final
- Add rebuild-cache command

### 2. Phase 2: Workflow Loader  
- Replace weird codes with slugs
- Dynamic type discovery
- Enhanced content extraction

### 3. Phase 3: Semantic Lookup
- Rich embedding text
- Slug-based storage
- Enhanced search results

### 4. Phase 4: Router
- --type filter support
- ping --final handling
- rebuild-cache handler

### 5. Phase 5: Formatter
- Slug display
- Enhanced result formatting

### Testing Commands
```bash
# Test universal search
kingly find "creative problem solving"
kingly find "automation" --type=tool
kingly find "discord" --type=agent

# Test ping with final
kingly ping "working on auth system"
kingly ping "session complete" --final

# Test cache rebuild
kingly rebuild-cache
kingly rebuild-cache --force

# Test help system
kingly help find
kingly help ping
```

## Expected Results

✅ **Universal Search**: Single find command handles all context types  
✅ **Simple Slugs**: "discord-tool" instead of "1a"  
✅ **Rich Embeddings**: Detailed YAML content improves search accuracy  
✅ **Dynamic Types**: Automatically discovers new context types  
✅ **Error Recovery**: All commands have helpful error guidance  
✅ **Whisper Arrays**: Self-talk strategies for better LLM responses  
✅ **Consolidated Commands**: ping --final replaces rollup  
✅ **Cache Rebuild**: Manual trigger for embedding regeneration  

This creates a unified, intelligent context system with semantic search powered by rich YAML content and simple, memorable command patterns.