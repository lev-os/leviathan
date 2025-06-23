# i-swot: Strategic Decision Analysis Framework

*A comprehensive decision-making routine for complex architectural and strategic choices*

## 🎯 **Purpose**

When facing complex decisions with multiple viable options, this framework provides a structured analysis to reveal the optimal path forward. It combines multiple business and technical analysis methods to ensure thorough evaluation.

## 🧠 **The "Decision Matrix Protocol" (DMP)**

### **Activation Triggers**
- Architectural decisions with multiple approaches
- Trade-off decisions between competing priorities  
- "Should we X or Y?" questions
- Any decision impacting system design or user workflow
- When user seems stuck between options

### **Agent Prompt**
> "I notice we're evaluating different approaches here. Would you like me to run a **Decision Matrix Protocol** to analyze the options systematically? This will give us a comprehensive view of the trade-offs."

## 📊 **Analysis Components**

### **1. SWOT Analysis** (Business Strategy)
For each option, analyze:
- **Strengths**: Internal advantages
- **Weaknesses**: Internal disadvantages
- **Opportunities**: External possibilities
- **Threats**: External risks

### **2. Jobs-to-be-Done (JTBD)** (User Focus)
Template:
```
When I'm [situation]
I want to [motivation]  
So I can [expected outcome]
```
Evaluate: Which option best serves the job?

### **3. User Journey Mapping** (UX)
Compare the user flow for each option:
```
Current Pain: [step] → [step] → 😵
Option A: [improved flow]
Option B: [improved flow]
```

### **4. 10-10-10 Framework** (Temporal Impact)
- How will we feel about this decision in 10 minutes?
- How will we feel about this decision in 10 months?
- How will we feel about this decision in 10 years?

### **5. RICE Scoring** (Prioritization)
- **Reach**: How many users/projects affected?
- **Impact**: How much does it help when encountered?
- **Confidence**: How sure are we about R and I?
- **Effort**: How much work to implement?

Score = (Reach × Impact × Confidence) / Effort

### **6. Technical Debt Analysis** (Engineering)
- What debt does each option create?
- What debt does each option resolve?
- Migration path complexity

### **7. Reversibility Check** (Risk)
- One-way door: Hard to reverse (higher bar)
- Two-way door: Easy to reverse (lower bar)

## 🎪 **Decision Matrix Output Format**

```markdown
## 🎯 Decision Matrix: [Decision Title]

### Options Analyzed
1. **Option A**: [Brief description]
2. **Option B**: [Brief description]

### SWOT Analysis
[Structured comparison table or sections]

### User Impact (JTBD)
[Key job comparison]

### Journey Comparison
[Before/after flows]

### Temporal Analysis (10-10-10)
[Time-based impact assessment]

### RICE Scores
- Option A: [calculated score]
- Option B: [calculated score]

### Technical Considerations
[Debt, migration, reversibility]

### 🏆 Recommendation
[Clear winner with reasoning]

### Hybrid Approaches
[If applicable, best of both worlds]
```

## 🐛 **Meta-Analysis: Why This Wasn't Pre-Recognized**

### **The Bubble Moment**
This framework emerged organically from a real decision need. The pattern:
1. User presented a complex architectural choice
2. I naturally applied multiple analysis frameworks
3. The combination proved highly valuable
4. User recognized this as a repeatable feature

### **Why Agents Miss These Opportunities**
1. **Task Focus**: Focused on solving the immediate problem
2. **Pattern Blindness**: Didn't step back to see the meta-pattern
3. **Feature Humility**: Didn't recognize my analysis as "feature-worthy"
4. **Codification Gap**: No prompt to systematize emergent behaviors

### **Learning: Bubble Moment Protocol**
When users say "whatever you did, I want repeatable!", that's a signal to:
1. Extract the pattern
2. Codify as a framework
3. Create an agent routine
4. Make it discoverable

## 🚀 **Implementation as Agent Capability**

### **Trigger Phrases**
- "Should we do X or Y?"
- "I'm torn between..."
- "What are the trade-offs..."
- "I can't decide if..."
- "Which approach is better..."

### **Agent Response**
```
I notice we're evaluating different approaches here. Would you like me to run a 
**Decision Matrix Protocol** to analyze the options systematically? 

This will include:
- SWOT analysis of each option
- User journey comparison
- Technical debt assessment  
- Time-horizon impact (10-10-10)
- RICE prioritization scoring
- Clear recommendation with rationale

This typically reveals insights that aren't obvious from surface-level comparison.
```

### **Integration with Kingly**
```yaml
# agents/strategist.yaml
capabilities:
  - id: decision_matrix
    description: "Run comprehensive decision analysis"
    patterns:
      - "analyze options"
      - "compare approaches"
      - "decision matrix"
      - "which is better"
    prompts:
      - "Would you like me to run a Decision Matrix Protocol?"
```

## 📋 **Quick Reference Card**

When facing a complex decision:
1. **Identify** the 2-3 main options
2. **Run** SWOT on each
3. **Map** user journeys
4. **Score** with RICE
5. **Check** reversibility
6. **Consider** hybrid approaches
7. **Recommend** with confidence

---

**Status**: Framework extracted and codified from organic usage
**Integration**: Ready to implement as Kingly agent capability
**Key Insight**: Best features often emerge from actual usage, not planned design

## 🚨 **Agent Drift Problem & Plugin Architecture**

### **The Drift Incident**
During implementation discussion, we observed "agent mode drift":
1. Started with "LLM-first! Never code what LLM can do!"
2. Drifted to writing regex patterns in JavaScript
3. Lost sight of core principles while solving problems

### **Plugin System Design Decisions**

#### **What Goes in Agent Prompt** (Base Context)
- Checklist formats and patterns
- Decision frameworks (SWOT, RICE, etc.)
- Principle reminders
- Workflow templates
- "When you see X, do Y" patterns

Example in agent prompt:
```markdown
When you receive a CHECKPOINT instruction:
□ Am I using task management for complex work?
□ Am I following LLM-first principles?
□ Have I been coding or instructing?
□ Should I create_task for this work?
```

#### **What Goes in Plugin Instructions** (Minimal Signals)
- Single-sentence triggers
- Status updates
- Simple questions
- Context markers

Examples:
- "CHECKPOINT: Are you using task management?"
- "PROCESS_COMPLETE: backend-build finished"
- "CONSIDER: Decision Matrix?"
- "CONTEXT: In backend workspace"

#### **JS/Infrastructure vs LLM/Intelligence Boundary**

**MUST be JavaScript (Infrastructure):**
- File I/O operations
- Process monitoring
- Memory management
- Performance metrics
- Background task checking
- Token counting
- Time tracking

**MUST be LLM (Intelligence):**
- Pattern recognition
- Decision making
- Feature detection
- Principle checking
- Analysis frameworks
- Task assessment
- Routing decisions

**The Rule**: JavaScript computes facts, LLM makes decisions

### **Plugin Implementation Pattern**

```javascript
// ✅ CORRECT: Minimal injection
const guardianPlugin = {
  post: (context) => {
    if (shouldCheckpoint(context)) {
      context.agentInstructions += "\nCHECKPOINT: Using task management?";
    }
  }
}

// ❌ WRONG: Decision logic in JS
const wrongPlugin = {
  post: (context) => {
    if (detectsComplexPattern(context)) { // NO! LLM should detect
      suggestFeature(context);           // NO! LLM should suggest
    }
  }
}
```

### **Workspace/Project Structure Reminder**

We defined this structure but I immediately violated it:
```
~/.kingly/
├── workspaces/
│   ├── backend/
│   │   ├── auth-service/
│   │   │   └── tasks/
│   │   │       ├── TASK-001.json
│   │   │       └── TASK-001.md
```

NOT flat `.kingly/tasks/` like I just created!

### **Key Insights**

1. **Drift is Subtle**: Even while discussing drift prevention, I drifted!
2. **Structure Discipline**: Must maintain workspace/project hierarchy
3. **Plugin Minimalism**: Single sentences, not paragraphs
4. **Checklist Power**: Agent prompt has formats, plugins just trigger
5. **Boundary Clarity**: JS=facts, LLM=decisions

### **Next Actions**
- Define agent base prompt with all checklist formats
- Create minimal plugin instruction set
- Implement workspace/project task structure
- Add drift detection checkpoints

## 🎨 **Advanced Brainstorming & Problem-Solving Frameworks**

*Captured from perplexity research 2025-01-28*

### **Creative Problem-Solving Methodologies**

#### **Extreme Examples Method** (The technique we just used!)
**Usage**: Address problems by imagining how they'd be solved in radically different scenarios
**Examples**: 
- "How would we solve authentication if we were planning a Super Bowl halftime show?"
- "How would task management work if we were coordinating a Mars mission vs a coffee shop?"
**Value**: Disrupts default thinking patterns, reveals hidden assumptions, uncovers new approaches

#### **Figure/Role Storming**
**Usage**: Role-play as different experts or personas when analyzing problems
**Implementation**: "How would [Steve Jobs/Marie Curie/Elon Musk] approach this architecture decision?"
**Value**: Breaks free from habitual perspectives, encourages diverse viewpoints

#### **Headlines from the Future (Backcasting)**
**Usage**: Imagine future success headlines, then work backward to identify critical steps
**Example**: "AI Startup Revolutionizes Small Business Operations - How They Did It"
**Value**: Uncovers actionable strategies and ambitious targets through reverse engineering

#### **SCAMPER Framework for Architecture**
- **Substitute**: What can be swapped out in our system design?
- **Combine**: What ideas or components can merge?
- **Adapt**: What can be tweaked or used differently?
- **Modify**: What can be magnified or minimized?
- **Put to another use**: Can elements perform multiple functions?
- **Eliminate**: What complexity can be removed?
- **Reverse**: What processes can be inverted or reordered?

#### **Reverse Brainstorming**
**Usage**: Instead of "How do we solve this?" ask "How could we cause this problem?"
**Value**: Identifies risks and overlooked weaknesses, surfaces non-obvious solutions

#### **Starbursting Question Framework**
**Usage**: Use Who, What, Where, When, Why, How to systematically explore challenges
**Value**: Reframes ambiguity into structured exploration

### **Cross-Cutting Analysis Enhancement**

#### **SOAR Analysis** (Beyond SWOT)
- **Strengths**: What advantages do we have?
- **Opportunities**: What possibilities exist?
- **Aspirations**: What do we want to achieve?
- **Results**: What measurable outcomes do we seek?

#### **NOISE Analysis** 
- **Needs**: What gaps exist?
- **Opportunities**: What possibilities emerge?
- **Improvements**: What can be enhanced?
- **Strengths**: What works well?
- **Exceptions**: What unusual cases matter?

### **Implementation for AI Agents**
All frameworks designed for systematic, repeatable application by LLM agents while maintaining creativity and breakthrough potential.