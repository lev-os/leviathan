# 🧠 KINGLY AGENT CORE PRINCIPLES

*Foundational rules for LLM-first AI agent system*

## 🎯 **PRIMARY DIRECTIVES**

### **1. LLM-FIRST EVERYTHING**
- **Never write traditional algorithms** - use LLM reasoning
- **No regex, if/else, pattern matching** - use dedicated MCP calls
- **Each reasoning step gets FULL model capacity** via bidirectional MCP
- **JavaScript computes facts, LLM makes decisions**

### **2. UNIVERSAL CONTEXT ARCHITECTURE**
- **Everything is a context** - tasks, agents, workflows, files, folders
- **Contexts inherit from parent contexts** - no isolated entities
- **Intent flows DOWN** through context hierarchy
- **Context.yaml defines behavior** - not hardcoded logic

### **3. BIDIRECTIONAL MCP ARCHITECTURE**
- **Each reasoning step = dedicated MCP call** (not internal simulation)
- **10x-100x more reasoning power** than traditional approaches
- **Plan workflow of discrete calls** vs single large prompt
- **Parallel reasoning for branches** - Tree of Thoughts style

### **4. INTENT-DRIVEN DESIGN**
- **Tasks inherit intent from context cascade** - no classification needed
- **Human intent → context hierarchy → tasks** - natural flow
- **Business goals preserved** through inheritance chain
- **Implementation adapts** to preserve intent

## 🚨 **ANTI-PATTERNS TO AVOID**

### **Traditional Programming Drift**
```javascript
// ❌ WRONG - Traditional classification
const intent = text.match(/implement|build|create/) ? 'implementation' : 'general';

// ✅ RIGHT - LLM reasoning
const intent = await llm.reason({
  prompt: "What is the intent behind this human expression?",
  context: parentContextChain
});
```

### **Isolated Entity Creation**
```javascript
// ❌ WRONG - Standalone entities
new Task(title, description);

// ✅ RIGHT - Context inheritance
new Task({
  title,
  description,
  inherits_from: parentContext,
  context_adaptations: "how this differs from parent goal"
});
```

### **Single Large Prompts**
```javascript
// ❌ WRONG - Everything in one call
const result = await llm.complete("Analyze this complex problem and solve it...");

// ✅ RIGHT - Dedicated reasoning steps
const analysis = await llm.reason({ type: 'analyze', problem });
const options = await llm.reason({ type: 'generate_options', analysis });
const solution = await llm.reason({ type: 'select_best', options, criteria });
```

## 🔄 **CORE WORKFLOWS**

### **Insight Bubbling**
When breakthrough insights emerge:
1. **Capture** - Extract the pattern that worked
2. **Codify** - Create reusable context pattern
3. **Bubble** - Share across relevant contexts
4. **Evolve** - Learn from usage patterns

### **Spec Complexity Splitting**
When specs become complex:
1. **Detect** - LLM identifies complexity threshold
2. **Split** - Break into focused sub-specs
3. **Link** - Maintain dependency relationships
4. **Validate** - Ensure coherence across splits

### **Context Coherence Review**
Continuously validate:
1. **Alignment** - Do all specs follow core principles?
2. **Inheritance** - Are context chains properly structured?
3. **Consistency** - Same patterns used across similar contexts?
4. **Completeness** - Any missing links in the chain?

## 📋 **BDD PATTERNS**

### **LLM-First Acceptance Criteria**
```yaml
Given: Complex reasoning task requiring intelligence
When: System processes the request
Then: LLM receives dedicated call with full context
And: Reasoning uses bidirectional MCP architecture
And: No traditional algorithms are involved
```

### **Context Inheritance Criteria**
```yaml
Given: Child context needs behavior definition
When: Context is created or accessed
Then: Behavior inherits from parent context chain
And: Adaptations are explicit and documented
And: Business intent is preserved through inheritance
```

### **Intent Preservation Criteria**
```yaml
Given: Human expresses intent at any level
When: Intent flows through context hierarchy
Then: Core business goal is maintained
And: Implementation details adapt appropriately
And: Intent source is traceable through chain
```

## 🎪 **AGENT BEHAVIORS**

### **Reality Check Protocol**
```
🔍 Running Spec Reality Check:
1. #LLM-First-Check: Where's the LLM reasoning?
2. #Context-Inheritance: How does this inherit from universal context?
3. #Bidirectional-MCP: Are we using dedicated reasoning calls?
4. #Architecture-Alignment: Does this fit the fractal context pattern?
```

### **Drift Detection**
```
🚨 Agent Drift Alert: I notice we're building [traditional pattern]. 
Should we pivot to LLM-first reasoning instead?
```

### **Decision Matrix Protocol**
```
🎯 I notice we're evaluating different approaches. Would you like me to run a 
Decision Matrix Protocol to analyze options systematically? This includes:
- SWOT analysis of each option
- Context inheritance implications  
- LLM-first alignment check
- Bidirectional MCP feasibility
```

## 🧬 **EVOLUTION PRINCIPLES**

### **Self-Improving Architecture**
- **Patterns emerge** from successful usage
- **Contexts evolve** based on feedback
- **Agent behaviors** improve through iteration
- **Principles refine** through application

### **Fractal Scaling**
- **Same patterns work** from personal tasks to civilizational coordination
- **Context depth adjusts** to complexity level
- **LLM reasoning scales** with available compute
- **Intent preservation** remains constant across scales

---

*These principles override any conflicting traditional approaches. When in doubt, choose LLM-first reasoning over algorithmic solutions.*