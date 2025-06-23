# 🧠 BRAINSTORMING PATTERNS SPECIFICATION

*Structured creativity techniques as reusable context patterns*

## 📋 **BUSINESS CASE**

**Goal**: Transform proven creativity methodologies into reusable context patterns for breakthrough thinking
**Value**: Systematic access to innovation techniques - same patterns work for product design, problem-solving, strategic planning
**Priority**: Medium - Enhances creative capabilities across all contexts

## 🎯 **ACCEPTANCE CRITERIA**

### **AC-BRAINSTORM-001: Pattern Context Library**
```yaml
Given: Need for structured creative problem-solving approach
When: User selects brainstorming pattern (Decision Matrix, Extreme Examples, Figure Storming, etc.)
Then: Pattern context is assembled with specific methodology and prompts
And: Pattern provides step-by-step guidance for creative process
And: Pattern can be composed with other contexts (agents, themes, workflows)
```

### **AC-BRAINSTORM-002: Cross-Context Pattern Reuse**
```yaml
Given: Successful brainstorming pattern used in one domain
When: Similar creative challenge arises in different context
Then: Pattern can be adapted and reused across domains
And: Pattern maintains methodology while adapting to context specifics
And: Pattern success propagates via memory bubbling workflows
```

### **AC-BRAINSTORM-003: Interactive Pattern Execution**
```yaml
Given: Brainstorming pattern selected for active session
When: Pattern is executed with current challenge/context
Then: Interactive session guides user through methodology steps
And: Pattern prompts adapt to challenge domain and complexity
And: Session captures insights for memory and pattern refinement
```

## Pattern Library

### Decision Matrix Pattern
- **Purpose**: Comprehensive multi-factor analysis
- **Components**: SWOT, JTBD, RICE scoring, temporal analysis
- **Use cases**: Architecture decisions, trade-offs, strategic choices
- **Location**: `contexts/patterns/decision-matrix/`

### Extreme Examples Pattern  
- **Purpose**: Break mental models through radical scenarios
- **Components**: Scale extremes, domain extremes, constraint extremes
- **Use cases**: Innovation, problem reframing, assumption breaking
- **Location**: `contexts/patterns/extreme-examples/`

### Figure Storming Pattern
- **Purpose**: Channel expert perspectives  
- **Components**: Tech leaders, scientists, custom figures
- **Use cases**: Design reviews, strategic planning, creativity blocks
- **Location**: `contexts/patterns/figure-storming/`

### Reverse Brainstorming Pattern
- **Purpose**: Find solutions by exploring problem causes
- **Components**: Problem inversion, negative ideation, solution flipping
- **Use cases**: Risk analysis, debugging, team exercises
- **Location**: `contexts/patterns/reverse-brainstorming/`

### SCAMPER Framework Pattern
- **Purpose**: Systematic innovation through transformations
- **Components**: Substitute, Combine, Adapt, Modify, Put to use, Eliminate, Reverse
- **Use cases**: Product development, feature ideation, process improvement
- **Location**: `contexts/patterns/scamper-framework/`

## Implementation Architecture

### Pattern as Context Structure
```yaml
contexts/patterns/{pattern-name}/
  context.yaml         # Pattern definition
  examples/           # Usage examples
  templates/          # Output templates
  workflows/          # Automated flows
```

### Pattern Activation
```yaml
# Patterns can be activated multiple ways:

# 1. Direct invocation
kingly run pattern decision-matrix --input "Should we use SQL or NoSQL?"

# 2. Agent integration  
agent://ceo --pattern figure-storming

# 3. Workflow embedding
workflows:
  steps:
    - pattern: extreme-examples
      context: "scaling problem"
      
# 4. Natural language trigger
"Let's use reverse brainstorming to figure out why users churn"
```

### Pattern Composition
```yaml
# Patterns can be combined
composite_analysis:
  patterns:
    - decision-matrix     # Structure
    - figure-storming    # Perspectives
    - extreme-examples   # Edge cases
    
  output: "comprehensive_analysis"
```

## Benefits

### For Problem Solving
- **Structured approaches** to complex problems
- **Reproducible** creative processes
- **Team alignment** through shared methods
- **AI enhancement** of human creativity

### For Knowledge Capture
- **Codified expertise** in reusable form
- **Organizational memory** of what works
- **Training tools** for new team members
- **Continuous improvement** through pattern evolution

### For System Intelligence
- **Context-aware** pattern selection
- **Learning** from pattern usage
- **Adaptation** based on results
- **Emergent combinations** of patterns

## Future Enhancements

### Pattern Learning
```yaml
pattern_evolution:
  - Track success rates
  - Learn optimal combinations
  - Generate new patterns
  - Personalize to users
```

### Interactive Pattern Sessions
```yaml
interactive_mode:
  - Real-time facilitation
  - Visual pattern guides
  - Collaborative brainstorming
  - Result synthesis
```

---

*Brainstorming patterns transform one-time creative insights into repeatable, shareable, and evolvable problem-solving tools.*