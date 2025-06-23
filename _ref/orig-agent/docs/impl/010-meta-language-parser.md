# Implementation Ticket: 010 - Meta Language Parser

## 📋 Overview
Build the meta-language parser that converts natural language workflows into structured YAML definitions.

## 🔗 References
- **Previous**: [009 - Workflow Execution](009-workflow-execution.md)
- **Related**: Workflow Engine, Intent Recognition

## 🎯 Scope
Create parser that:
- Converts natural language to workflow YAML
- Recognizes common patterns
- Handles ambiguity gracefully
- Learns from corrections

## ✅ Acceptance Criteria

### AC-010-1: Basic Parsing
```yaml
Given: Natural language workflow description
When: Parser processes it
Then: Generates valid workflow YAML
And: Preserves intent and steps
And: Handles common variations
```

### AC-010-2: Pattern Recognition
```yaml
Given: Common workflow patterns
When: Similar language detected
Then: Applies known pattern
And: Adapts to specifics
And: Suggests alternatives
```

### AC-010-3: Ambiguity Resolution
```yaml
Given: Ambiguous instructions
When: Parser uncertain
Then: Generates options
And: Requests clarification
And: Learns from choice
```

### AC-010-4: Learning System
```yaml
Given: User corrections to generated workflow
When: Correction applied
Then: Pattern is learned
And: Future parsing improves
And: Similar cases handled better
```

## 🧪 Test Cases

### Unit Tests
1. **Simple workflow** - Basic parsing works
2. **Complex workflow** - Multi-step parsing
3. **Pattern matching** - Known patterns applied
4. **Ambiguity handling** - Options generated
5. **Learning** - Patterns improve

### Integration Tests
1. **End-to-end** - Natural language to execution
2. **Correction flow** - Learning from fixes
3. **Pattern library** - Common patterns work

## 💻 Implementation

### Meta Language Parser
```javascript
// src/application/meta-language-parser.js
export class MetaLanguageParser {
  constructor(options = {}) {
    this.llmAdapter = options.llmAdapter;
    this.patternLibrary = options.patternLibrary || new PatternLibrary();
    this.learningStore = options.learningStore;
  }
  
  async parseToWorkflow(naturalLanguage, context = {}) {
    // Step 1: Analyze intent and structure
    const analysis = await this.analyzeStructure(naturalLanguage, context);
    
    // Step 2: Match against known patterns
    const patterns = await this.findMatchingPatterns(analysis);
    
    // Step 3: Generate workflow options
    const options = await this.generateWorkflowOptions(
      analysis,
      patterns,
      context
    );
    
    // Step 4: Resolve ambiguities if needed
    if (options.length > 1 && !context.autoSelect) {
      return {
        requiresChoice: true,
        options: options,
        analysis: analysis
      };
    }
    
    // Step 5: Select best option
    const selected = await this.selectBestOption(options, analysis, context);
    
    return {
      workflow: selected,
      confidence: analysis.confidence,
      patterns: patterns.map(p => p.name)
    };
  }
  
  async analyzeStructure(text, context) {
    const prompt = `Analyze this workflow description and extract structure:

"${text}"

Context: ${JSON.stringify(context, null, 2)}

Extract:
1. Overall intent/goal
2. Individual steps (in order)
3. Any conditions or branches
4. Any parallel operations
5. Required tools/resources
6. Success criteria

Format as JSON with these fields:
{
  "intent": "...",
  "steps": [...],
  "conditions": [...],
  "parallel": [...],
  "resources": [...],
  "success": "...",
  "confidence": 0.0-1.0
}`;

    const response = await this.llmAdapter.complete({
      prompt: prompt,
      temperature: 0.3,
      responseFormat: 'json'
    });
    
    return JSON.parse(response);
  }
  
  async findMatchingPatterns(analysis) {
    const matches = [];
    
    // Check each pattern in library
    for (const pattern of this.patternLibrary.getPatterns()) {
      const similarity = await this.calculateSimilarity(
        analysis,
        pattern.structure
      );
      
      if (similarity > 0.7) {
        matches.push({
          pattern: pattern,
          similarity: similarity
        });
      }
    }
    
    // Sort by similarity
    matches.sort((a, b) => b.similarity - a.similarity);
    
    // Also check learned patterns
    if (this.learningStore) {
      const learnedMatches = await this.learningStore.findSimilar(
        analysis.intent
      );
      matches.push(...learnedMatches);
    }
    
    return matches.slice(0, 5); // Top 5 matches
  }
  
  async calculateSimilarity(analysis, patternStructure) {
    // Use LLM for semantic similarity
    const prompt = `Compare these two workflow structures:

Structure 1:
${JSON.stringify(analysis, null, 2)}

Structure 2:
${JSON.stringify(patternStructure, null, 2)}

Rate their similarity from 0.0 to 1.0 considering:
- Intent alignment
- Step similarity
- Overall structure

Return only the numeric score.`;

    const response = await this.llmAdapter.complete({
      prompt: prompt,
      temperature: 0.1
    });
    
    return parseFloat(response.trim());
  }
  
  async generateWorkflowOptions(analysis, patterns, context) {
    const options = [];
    
    // Option 1: Direct translation
    const direct = await this.generateDirectTranslation(analysis);
    options.push({
      name: 'Direct Translation',
      workflow: direct,
      confidence: analysis.confidence
    });
    
    // Option 2: Pattern-based variations
    for (const match of patterns.slice(0, 3)) {
      const adapted = await this.adaptPattern(
        match.pattern,
        analysis,
        context
      );
      
      options.push({
        name: `Based on: ${match.pattern.name}`,
        workflow: adapted,
        confidence: match.similarity
      });
    }
    
    // Option 3: Enhanced version with best practices
    if (analysis.confidence < 0.8) {
      const enhanced = await this.generateEnhancedVersion(analysis, patterns);
      options.push({
        name: 'Enhanced with Best Practices',
        workflow: enhanced,
        confidence: 0.9
      });
    }
    
    return options;
  }
  
  async generateDirectTranslation(analysis) {
    const workflow = {
      name: this.generateWorkflowName(analysis.intent),
      description: analysis.intent,
      steps: []
    };
    
    // Convert each analyzed step
    for (const [index, step] of analysis.steps.entries()) {
      const workflowStep = {
        name: `step_${index + 1}`,
        type: 'tool',
        tool: await this.inferTool(step),
        params: await this.inferParams(step)
      };
      
      // Add conditions if detected
      const condition = analysis.conditions.find(c => c.stepIndex === index);
      if (condition) {
        workflowStep.condition = condition.condition;
      }
      
      workflow.steps.push(workflowStep);
    }
    
    // Handle parallel operations
    if (analysis.parallel.length > 0) {
      workflow.steps = this.restructureForParallel(
        workflow.steps,
        analysis.parallel
      );
    }
    
    return workflow;
  }
  
  async adaptPattern(pattern, analysis, context) {
    const prompt = `Adapt this workflow pattern to the specific requirements:

Pattern:
${JSON.stringify(pattern.workflow, null, 2)}

Requirements:
${JSON.stringify(analysis, null, 2)}

Context:
${JSON.stringify(context, null, 2)}

Generate the adapted workflow that:
1. Maintains the pattern's structure
2. Incorporates the specific requirements
3. Uses appropriate tools and parameters

Return as valid workflow YAML structure.`;

    const response = await this.llmAdapter.complete({
      prompt: prompt,
      temperature: 0.4,
      responseFormat: 'yaml'
    });
    
    return yaml.load(response);
  }
  
  async generateEnhancedVersion(analysis, patterns) {
    // Identify missing best practices
    const enhancements = [];
    
    if (!analysis.steps.some(s => s.includes('validate') || s.includes('test'))) {
      enhancements.push('Add validation steps');
    }
    
    if (!analysis.success) {
      enhancements.push('Add success criteria checks');
    }
    
    if (analysis.steps.length > 5 && analysis.parallel.length === 0) {
      enhancements.push('Identify parallelizable steps');
    }
    
    const prompt = `Enhance this workflow with best practices:

Original Analysis:
${JSON.stringify(analysis, null, 2)}

Suggested Enhancements:
${enhancements.join('\n')}

Pattern Examples:
${patterns.slice(0, 2).map(p => p.pattern.name).join(', ')}

Generate an enhanced workflow that includes:
1. All original requirements
2. Best practice enhancements
3. Proper error handling
4. Clear success criteria

Return as workflow YAML structure.`;

    const response = await this.llmAdapter.complete({
      prompt: prompt,
      temperature: 0.5,
      responseFormat: 'yaml'
    });
    
    return yaml.load(response);
  }
  
  async selectBestOption(options, analysis, context) {
    // Auto-selection logic
    if (context.preferPatterns && options.some(o => o.name.includes('Based on'))) {
      // Prefer pattern-based if requested
      return options.find(o => o.name.includes('Based on')).workflow;
    }
    
    if (context.preferEnhanced && options.some(o => o.name.includes('Enhanced'))) {
      // Prefer enhanced version
      return options.find(o => o.name.includes('Enhanced')).workflow;
    }
    
    // Default: highest confidence
    const sorted = options.sort((a, b) => b.confidence - a.confidence);
    return sorted[0].workflow;
  }
  
  async learnFromCorrection(original, corrected, context) {
    if (!this.learningStore) return;
    
    // Extract what changed
    const changes = await this.analyzeChanges(original, corrected);
    
    // Store the pattern
    await this.learningStore.addPattern({
      original: original,
      corrected: corrected,
      changes: changes,
      context: context,
      timestamp: Date.now()
    });
    
    // Update pattern library if significant
    if (changes.significance > 0.7) {
      await this.patternLibrary.addLearnedPattern({
        name: `Learned: ${context.description || 'Custom Pattern'}`,
        structure: corrected,
        source: 'user_correction',
        usage_count: 1
      });
    }
  }
  
  generateWorkflowName(intent) {
    // Convert intent to snake_case workflow name
    return intent
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
      .substring(0, 50);
  }
  
  async inferTool(stepDescription) {
    // Common tool mappings
    const toolMappings = {
      'create': ['create_file', 'create_directory', 'create_project'],
      'test': ['run_tests', 'test_runner', 'validate'],
      'deploy': ['deploy', 'publish', 'release'],
      'analyze': ['analyze', 'inspect', 'evaluate'],
      'generate': ['generate_code', 'create_template', 'scaffold']
    };
    
    // Find matching tool
    for (const [keyword, tools] of Object.entries(toolMappings)) {
      if (stepDescription.toLowerCase().includes(keyword)) {
        return tools[0]; // Return most common
      }
    }
    
    // Fallback to LLM inference
    return 'execute_task'; // Generic tool
  }
  
  restructureForParallel(steps, parallelGroups) {
    // Restructure steps to include parallel blocks
    const restructured = [];
    const parallelized = new Set();
    
    for (const group of parallelGroups) {
      const parallelSteps = group.stepIndices.map(i => {
        parallelized.add(i);
        return steps[i];
      });
      
      restructured.push({
        name: `parallel_${group.name || 'block'}`,
        type: 'parallel',
        parallel: parallelSteps
      });
    }
    
    // Add non-parallel steps
    steps.forEach((step, index) => {
      if (!parallelized.has(index)) {
        restructured.push(step);
      }
    });
    
    return restructured;
  }
}

// Pattern Library
export class PatternLibrary {
  constructor() {
    this.patterns = this.loadDefaultPatterns();
    this.learnedPatterns = new Map();
  }
  
  loadDefaultPatterns() {
    return [
      {
        name: 'feature_implementation',
        description: 'Standard feature implementation flow',
        structure: {
          intent: 'implement new feature',
          steps: ['analyze', 'design', 'implement', 'test', 'document']
        },
        workflow: {
          name: 'implement_feature',
          steps: [
            { name: 'analyze', type: 'tool', tool: 'analyze_requirements' },
            { name: 'design', type: 'tool', tool: 'create_design' },
            { name: 'implement', type: 'tool', tool: 'generate_code' },
            { name: 'test', type: 'tool', tool: 'run_tests' },
            { name: 'document', type: 'tool', tool: 'generate_docs' }
          ]
        }
      },
      {
        name: 'bug_fix',
        description: 'Bug investigation and fix flow',
        structure: {
          intent: 'fix bug',
          steps: ['reproduce', 'diagnose', 'fix', 'test', 'verify']
        },
        workflow: {
          name: 'fix_bug',
          steps: [
            { name: 'reproduce', type: 'tool', tool: 'reproduce_issue' },
            { name: 'diagnose', type: 'tool', tool: 'analyze_logs' },
            { name: 'fix', type: 'tool', tool: 'apply_fix' },
            { name: 'test', type: 'tool', tool: 'run_tests' },
            { name: 'verify', type: 'tool', tool: 'verify_fix' }
          ]
        }
      }
    ];
  }
  
  getPatterns() {
    return [
      ...this.patterns,
      ...Array.from(this.learnedPatterns.values())
    ];
  }
  
  addLearnedPattern(pattern) {
    this.learnedPatterns.set(pattern.name, pattern);
  }
}
```

### Integration Example
```javascript
// src/tools/workflow-from-text.js
export const workflowFromTextTool = {
  name: 'create_workflow_from_text',
  description: 'Convert natural language to executable workflow',
  inputSchema: {
    type: 'object',
    properties: {
      description: { type: 'string' },
      context: { type: 'object' },
      autoSelect: { type: 'boolean', default: true }
    }
  },
  handler: async (params) => {
    const parser = new MetaLanguageParser({
      llmAdapter: llmAdapter,
      patternLibrary: patternLibrary,
      learningStore: learningStore
    });
    
    const result = await parser.parseToWorkflow(
      params.description,
      params.context
    );
    
    if (result.requiresChoice) {
      // Return options for user to choose
      return {
        success: true,
        requiresChoice: true,
        options: result.options,
        _llm_instructions: `Multiple workflow interpretations possible:
        
${result.options.map((opt, i) => 
  `${i + 1}. ${opt.name} (confidence: ${opt.confidence})`
).join('\n')}

Please choose which interpretation to use.`
      };
    }
    
    // Save the generated workflow
    const workflowPath = await saveWorkflow(result.workflow);
    
    return {
      success: true,
      workflowPath: workflowPath,
      workflow: result.workflow,
      confidence: result.confidence,
      patterns: result.patterns
    };
  }
};
```

## 🧪 Test Implementation
```javascript
// tests/unit/meta-language-parser.test.js
describe('MetaLanguageParser', () => {
  let parser;
  let mockLLM;
  
  beforeEach(() => {
    mockLLM = {
      complete: jest.fn()
    };
    
    parser = new MetaLanguageParser({
      llmAdapter: mockLLM,
      patternLibrary: new PatternLibrary()
    });
  });
  
  it('should parse simple workflow', async () => {
    const text = "Create a new feature that adds user authentication";
    
    mockLLM.complete.mockResolvedValueOnce(JSON.stringify({
      intent: "add user authentication feature",
      steps: [
        "create authentication module",
        "add login endpoint",
        "add logout endpoint",
        "create user session management",
        "add tests"
      ],
      conditions: [],
      parallel: [],
      resources: ["auth library", "session store"],
      success: "users can login and logout",
      confidence: 0.9
    }));
    
    const result = await parser.parseToWorkflow(text);
    
    expect(result.workflow).toBeDefined();
    expect(result.workflow.steps).toHaveLength(5);
    expect(result.confidence).toBe(0.9);
  });
  
  it('should recognize patterns', async () => {
    const text = "Fix the bug where users can't login";
    
    mockLLM.complete.mockResolvedValueOnce(JSON.stringify({
      intent: "fix login bug",
      steps: ["investigate issue", "find root cause", "apply fix", "test"],
      confidence: 0.85
    }));
    
    // Mock similarity check to match bug_fix pattern
    mockLLM.complete.mockResolvedValueOnce("0.9");
    
    const result = await parser.parseToWorkflow(text);
    
    expect(result.patterns).toContain('bug_fix');
  });
});
```

## 🔧 Dependencies
- Uses LLM adapter for parsing
- Pattern library for common workflows
- Learning store for improvements

## 📊 Effort Estimate
- Implementation: 4 hours
- Testing: 2 hours
- Total: 6 hours

## 🚀 Next Steps
After this ticket:
- Phase 4: Core Features
- Memory Context implementation

## 📝 Notes
- Natural language to structured workflow
- Pattern matching improves accuracy
- Learning system gets smarter over time
- Ambiguity handled through options