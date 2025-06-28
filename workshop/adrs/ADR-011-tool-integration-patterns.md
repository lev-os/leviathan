# ADR-011: Tool Integration Patterns for Workshop Plugin

## Status

Proposed

## Context

During OSINT tools analysis, we discovered clear patterns for identifying which repositories are suitable for tool integration vs reference material. The workshop plugin needs automated patterns for:

1. Detecting tool-worthy repositories
2. Generating MCP adapters
3. Creating bi-directional workflows
4. Packaging as Leviathan plugins

## Decision

Establish clear patterns for tool integration based on repository characteristics:

### Tool Detection Criteria

A repository is suitable for tool integration if it has:

- **Clear Input/Output Interface** - Well-defined parameters and return values
- **Valuable Transformation** - Does more than just scraping/fetching
- **Programmatic API** - Can be called from code, not just UI
- **Stateless Operations** - Each call is independent

### Integration Categories

#### 1. Simple Command Tools

- Direct wrapper around CLI/function
- Example: OSINTai crawler

```javascript
export const toolName = {
  name: 'tool_name',
  description: 'What it does',
  inputSchema: {
    /* parameters */
  },
  handler: async (args, deps) => {
    /* wrapper */
  },
}
```

#### 2. Service Tools

- Require background process/server
- Example: Neo4j, Qdrant

```javascript
export const serviceTool = {
  start: async () => {
    /* launch service */
  },
  stop: async () => {
    /* cleanup */
  },
  healthCheck: async () => {
    /* verify running */
  },
}
```

#### 3. Workflow Tools

- Multi-step with LLM callbacks
- Example: Research workflows

```javascript
export const workflowTool = {
  steps: ['crawl', 'analyze', 'synthesize'],
  contextInjection: {
    /* per-step prompts */
  },
  callbacks: {
    /* LLM decision points */
  },
}
```

### Auto-Generation Patterns

#### Python → MCP Adapter

```javascript
// Analyze Python class
const pythonClass = await analyzePythonCode(repoPath)

// Generate MCP tool
const tool = {
  name: pythonClass.name.toLowerCase(),
  description: pythonClass.docstring,
  inputSchema: generateSchemaFromInit(pythonClass.init),
  handler: generatePythonBridge(pythonClass.mainMethod),
}
```

#### Repository Structure Detection

```javascript
const patterns = {
  python: {
    mainFile: ['main.py', 'cli.py', '__main__.py'],
    classPattern: /class\s+(\w+).*:/,
    initPattern: /def\s+__init__\s*\(self,\s*([^)]+)\)/,
  },
  javascript: {
    mainFile: ['index.js', 'main.js', 'cli.js'],
    exportPattern: /export\s+(async\s+)?function\s+(\w+)/,
  },
}
```

### Integration Workflow

1. **Analyze Repository**

   ```bash
   lev workshop analyze <repo-path>
   # Outputs: tool-potential.json
   ```

2. **Generate Adapter**

   ```bash
   lev workshop integrate <repo-path> --type=tool
   # Creates: adapters/repo-name/
   ```

3. **Test Integration**

   ```bash
   lev workshop test <adapter-path>
   # Validates: MCP compatibility
   ```

4. **Package Plugin**
   ```bash
   lev workshop package <adapter-path>
   # Creates: @lev-os/repo-name
   ```

## Examples from OSINT Analysis

### Moved to Reference (Not Tools)

- **mitaka**: Browser extension, UI-only
- **Photon**: Traditional scraper, no unique value
- **theHarvester**: Data scraper, similar to many others
- **OSINT-Framework**: Documentation only

### Kept for Tool Integration

- **OSINTai**: AI-enhanced analysis, clear API, valuable transformation

## Consequences

### Positive

- Clear criteria for tool selection
- Automated adapter generation
- Consistent integration patterns
- Reduced manual work

### Negative

- May miss edge cases
- Initial setup complexity
- Language-specific adapters needed

## Implementation Notes

### Workshop Commands

```javascript
// src/commands/analyze-tool-potential.js
export async function analyzeToolPotential(repoPath) {
  const score = {
    hasApi: checkForApi(repoPath),
    hasValueTransform: checkForTransformation(repoPath),
    isStateless: checkForStatelessness(repoPath),
    complexity: estimateIntegrationComplexity(repoPath),
  }

  return {
    viable: score.hasApi && score.hasValueTransform,
    score,
    suggestedType: determineToolType(score),
  }
}
```

### Auto-Wrapper Generation

```javascript
// src/commands/generate-wrapper.js
export async function generateWrapper(repoPath, toolType) {
  const analysis = await analyzeRepository(repoPath)

  switch (toolType) {
    case 'python-class':
      return generatePythonClassWrapper(analysis)
    case 'cli-tool':
      return generateCliWrapper(analysis)
    case 'service':
      return generateServiceWrapper(analysis)
    default:
      throw new Error(`Unknown tool type: ${toolType}`)
  }
}
```

## Future Considerations

1. **Multi-Language Support**: Extend beyond Python/JS
2. **Dependency Resolution**: Auto-install required packages
3. **Version Management**: Handle tool updates
4. **Security Scanning**: Validate tools before integration
5. **Performance Profiling**: Measure tool efficiency

## References

- OSINT tools analysis session
- Leviathan hexagonal architecture patterns
- MCP protocol specification
- Plugin development guidelines
