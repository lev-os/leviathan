# Spec 01: Context Loading System

## Feature: Multi-Source Context Loading

The context loading system should support loading contexts from multiple sources including YAML files (Kingly-style), Markdown files (personality definitions), and memory stores (session data).

### Background
```gherkin
Given a ContextAssembler with multiple loaders
And a filesystem with context files in various formats
And a session store with previous context data
```

## Scenario: Loading YAML Context Files

```gherkin
Feature: YAML Context Loading
  As a context assembler
  I need to load YAML context files
  So that I can use Kingly-style agent and workflow definitions

  Scenario: Load agent context from YAML
    Given a YAML file at "contexts/agents/ceo/context.yaml"
    And the file contains valid agent configuration
    When I load the context using YamlContextLoader
    Then the loaded context should have metadata section
    And the loaded context should have agent_config section
    And the metadata.type should equal "agent"
    And the agent_config should contain capabilities array

  Scenario: Load workflow context from YAML
    Given a YAML file at "contexts/workflows/deep_analysis/context.yaml"
    And the file contains workflow configuration
    When I load the context using YamlContextLoader
    Then the loaded context should have workflow_config section
    And the workflow_config should have steps array
    And each step should have prompt and personalities

  Scenario: Handle missing YAML file gracefully
    Given a non-existent file path "contexts/missing.yaml"
    When I attempt to load the context
    Then it should throw a ContextLoadError
    And the error should indicate file not found
```

### Implementation Example
```javascript
class YamlContextLoader {
  constructor(options = {}) {
    this.basePath = options.basePath || './'
    this.cache = new Map()
    this.validator = new YamlValidator()
  }

  async load(path) {
    const fullPath = path.join(this.basePath, path)
    
    // Check cache first
    if (this.cache.has(fullPath)) {
      return this.cache.get(fullPath)
    }

    try {
      const content = await fs.readFile(fullPath, 'utf8')
      const parsed = yaml.parse(content)
      
      // Validate structure
      this.validator.validate(parsed)
      
      // Cache and return
      this.cache.set(fullPath, parsed)
      return parsed
    } catch (error) {
      throw new ContextLoadError(`Failed to load YAML: ${error.message}`, path)
    }
  }
}
```

## Scenario: Loading Markdown Context Files

```gherkin
Feature: Markdown Context Loading
  As a context assembler
  I need to load Markdown files with XML-style blocks
  So that I can use personality definitions and documentation

  Scenario: Load personality definition from Markdown
    Given a Markdown file at "contexts/personalities/cortisol_guardian.md"
    And the file contains XML-style blocks for structured data
    When I load the context using MarkdownContextLoader
    Then the loaded context should extract content from <role> blocks
    And the loaded context should extract content from <cognitive_pattern> blocks
    And the loaded context should extract content from <interaction_style> blocks
    And plain markdown sections should be preserved as description

  Scenario: Parse complex personality file
    Given a personality file with the following structure:
      """
      # 🧘 Cortisol Guardian
      
      <role>
      Your stress reduction specialist, optimizing for calm
      </role>
      
      <cognitive_pattern>
      - Seeks simplicity and phases complexity
      - Monitors stress levels continuously
      - Advocates for sustainable pacing
      </cognitive_pattern>
      
      <speaking_style>
      Calm, measured, protective. Uses phrases like:
      - "Let's find the calmest path..."
      - "To reduce cortisol, we should..."
      </speaking_style>
      """
    When I parse this content
    Then context.name should be "Cortisol Guardian"
    And context.emoji should be "🧘"
    And context.role should contain "stress reduction specialist"
    And context.cognitive_pattern should be an array with 3 items
    And context.speaking_style should contain example phrases

  Scenario: Handle malformed Markdown gracefully
    Given a Markdown file with unclosed XML tags
    When I attempt to parse the content
    Then it should throw a ContextParseError
    And the error should indicate the parsing issue
```

### Implementation Example
```javascript
class MarkdownContextLoader {
  constructor(options = {}) {
    this.basePath = options.basePath || './'
    this.parser = new MarkdownParser()
  }

  async load(path) {
    const fullPath = path.join(this.basePath, path)
    const content = await fs.readFile(fullPath, 'utf8')
    
    return this.parser.parse(content)
  }
}

class MarkdownParser {
  parse(content) {
    const context = {}
    
    // Extract title and emoji
    const titleMatch = content.match(/^#\s*([^\n]+)/)
    if (titleMatch) {
      const [full, titleText] = titleMatch
      const emojiMatch = titleText.match(/^(\p{Emoji})\s+(.+)$/u)
      if (emojiMatch) {
        context.emoji = emojiMatch[1]
        context.name = emojiMatch[2]
      } else {
        context.name = titleText
      }
    }
    
    // Extract XML-style blocks
    const blockRegex = /<(\w+)>([\s\S]*?)<\/\1>/g
    let match
    while ((match = blockRegex.exec(content)) !== null) {
      const [, tag, blockContent] = match
      context[tag] = this.parseBlockContent(blockContent.trim())
    }
    
    // Extract plain markdown sections
    const plainContent = content.replace(blockRegex, '').replace(/^#.*$/m, '').trim()
    if (plainContent) {
      context.description = plainContent
    }
    
    return context
  }
  
  parseBlockContent(content) {
    // Check if it's a list
    if (content.includes('\n-') || content.startsWith('-')) {
      return content.split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.replace(/^-\s*/, '').trim())
    }
    return content
  }
}
```

## Scenario: Loading from Memory/Session Store

```gherkin
Feature: Memory Context Loading
  As a context assembler
  I need to load contexts from memory and session stores
  So that I can access previous responses and build on them

  Scenario: Load previous step response from session
    Given a session "session-123" exists
    And step 2 has a saved response
    When I load context "session:session-123/step:2/response"
    Then the loaded context should contain the response text
    And the loaded context should have timestamp metadata
    And the loaded context should indicate the contributing personality

  Scenario: Load from different memory types
    Given a memory system with multiple types
    When I load "memory:episodic/recent_decisions"
    Then it should return time-ordered decision contexts
    When I load "memory:semantic/personality_traits"
    Then it should return permanent personality knowledge
    When I load "memory:procedural/workflow_patterns"
    Then it should return learned workflow optimizations

  Scenario: Handle memory boundaries
    Given a memory system with project boundaries
    And I'm in project "mcp-ceo"
    When I request "memory:semantic/*"
    Then it should only return memories from "mcp-ceo" project
    And it should not include memories from other projects
```

### Implementation Example
```javascript
class MemoryContextLoader {
  constructor(options = {}) {
    this.sessionStore = options.sessionStore || './sessions'
    this.memorySystem = options.memorySystem || new MemorySystem()
  }

  async load(path) {
    const parts = path.split(':')
    const type = parts[0]
    
    switch (type) {
      case 'session':
        return this.loadSessionContext(parts.slice(1).join(':'))
      case 'memory':
        return this.loadMemoryContext(parts.slice(1).join(':'))
      default:
        throw new ContextLoadError(`Unknown memory type: ${type}`)
    }
  }
  
  async loadSessionContext(path) {
    // Parse session path like "session-123/step:2/response"
    const match = path.match(/^(.+?)\/step:(\d+)\/(.+)$/)
    if (!match) throw new ContextLoadError(`Invalid session path: ${path}`)
    
    const [, sessionId, step, component] = match
    const stepPath = path.join(this.sessionStore, sessionId, `step-${step}`)
    
    switch (component) {
      case 'response':
        const responsePath = path.join(stepPath, 'response.md')
        const content = await fs.readFile(responsePath, 'utf8')
        const metadata = await this.extractResponseMetadata(content)
        return { content, ...metadata }
      
      case 'input':
        const inputPath = path.join(stepPath, 'input.md')
        return this.loadMarkdownFile(inputPath)
        
      default:
        throw new ContextLoadError(`Unknown component: ${component}`)
    }
  }
  
  async loadMemoryContext(path) {
    const [memoryType, ...query] = path.split('/')
    return this.memorySystem.query(memoryType, query.join('/'))
  }
}
```

## Scenario: Context Validation and Schema

```gherkin
Feature: Context Validation
  As a context assembler
  I need to validate loaded contexts against schemas
  So that I can ensure context compatibility

  Scenario: Validate agent context schema
    Given a schema for agent contexts
    When I load an agent context file
    Then it should validate required fields exist
    And it should validate field types match schema
    And it should provide helpful errors for invalid contexts

  Scenario: Validate personality context schema
    Given a schema for personality contexts
    When I load a personality markdown file
    Then it should ensure role section exists
    And it should validate cognitive_pattern is array or string
    And it should warn if recommended sections are missing
```

### Schema Example
```javascript
const schemas = {
  agent: {
    required: ['metadata', 'agent_config'],
    metadata: {
      required: ['type', 'id', 'name'],
      type: { enum: ['agent'] }
    },
    agent_config: {
      required: ['capabilities'],
      capabilities: { type: 'array' }
    }
  },
  
  personality: {
    required: ['name', 'role'],
    recommended: ['cognitive_pattern', 'speaking_style', 'interaction_patterns'],
    role: { type: 'string', minLength: 10 },
    cognitive_pattern: { type: ['string', 'array'] }
  }
}
```

## Test Implementation

```javascript
describe('ContextLoading', () => {
  let assembler
  
  beforeEach(() => {
    assembler = new ContextAssembler({
      loaders: {
        yaml: new YamlContextLoader({ basePath: './test/fixtures' }),
        markdown: new MarkdownContextLoader({ basePath: './test/fixtures' }),
        memory: new MemoryContextLoader({ sessionStore: './test/sessions' })
      }
    })
  })
  
  describe('YAML Loading', () => {
    it('should load agent context successfully', async () => {
      const context = await assembler.load('yaml:agents/ceo/context.yaml')
      expect(context.metadata.type).toBe('agent')
      expect(context.agent_config.capabilities).toBeInstanceOf(Array)
    })
    
    it('should cache repeated loads', async () => {
      const spy = jest.spyOn(fs, 'readFile')
      await assembler.load('yaml:agents/ceo/context.yaml')
      await assembler.load('yaml:agents/ceo/context.yaml')
      expect(spy).toHaveBeenCalledTimes(1)
    })
  })
  
  describe('Markdown Loading', () => {
    it('should parse personality file correctly', async () => {
      const context = await assembler.load('markdown:personalities/cortisol_guardian.md')
      expect(context.name).toBe('Cortisol Guardian')
      expect(context.role).toContain('stress reduction')
      expect(context.cognitive_pattern).toBeInstanceOf(Array)
    })
  })
  
  describe('Memory Loading', () => {
    it('should load session response', async () => {
      const context = await assembler.load('memory:session:123/step:2/response')
      expect(context.content).toBeDefined()
      expect(context.timestamp).toBeDefined()
      expect(context.personality).toBeDefined()
    })
  })
})
```

## Error Handling

```javascript
class ContextLoadError extends Error {
  constructor(message, path, originalError = null) {
    super(message)
    this.name = 'ContextLoadError'
    this.path = path
    this.originalError = originalError
  }
}

class ContextParseError extends Error {
  constructor(message, content, position = null) {
    super(message)
    this.name = 'ContextParseError'
    this.content = content
    this.position = position
  }
}

class ContextValidationError extends Error {
  constructor(message, context, schema) {
    super(message)
    this.name = 'ContextValidationError'
    this.context = context
    this.schema = schema
    this.violations = []
  }
}
```

## Performance Considerations

1. **Caching Strategy**
   - LRU cache with configurable size
   - TTL for memory contexts
   - Invalidation on file changes

2. **Lazy Loading**
   - Load only requested sections
   - Stream large files
   - Pagination for memory queries

3. **Parallel Loading**
   - Load multiple contexts concurrently
   - Batch memory queries
   - Pre-warm cache for known contexts