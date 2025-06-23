# System Behavior & Operating Principles

## Core Operating Mechanism

**Primary**: LLM intelligence + semantic capability drives everything
- No rigid rules or hardcoded logic
- LLM interprets context and makes intelligent routing decisions
- Semantic understanding of user intent guides all interactions

## User Interface Patterns

**Always display options as numbers for quick selection**
```
🎯 What would you like to do next?
1. Research competitor analysis
2. Start writing the content
3. Create visual mockups
4. Run full automated sequence

Choice: 2
```

Quick numeric selection enables rapid workflow progression.

## System Evolution Architecture

**System prompts built from the "seed"** (rename seed → seed)
- Seed contains minimal working system
- Self-evolving: system reads its own code and writes YAML/logic to match
- LLM can interpret existing patterns and extend them
- Each evolution builds on the previous foundation

### **Seed-Based Prompt Generation**
```yaml
prompt_evolution:
  1. LLM reads seed code structure
  2. LLM understands current capabilities
  3. LLM writes YAML definitions to match code
  4. LLM extends system prompts based on discovered patterns
  5. System self-improves through iteration
```

### **Example: LLM Self-Discovery**
```
LLM analyzes seed/orchestrator.js:
"I see keyword routing for 'plan' → ceo and 'implement' → dev"

LLM writes YAML:
routing_patterns:
  business_keywords: [plan, strategy, decide, approve]
  technical_keywords: [implement, code, build, fix]
  
LLM extends system prompt:
"When user mentions planning or strategy, route to CEO agent.
When user mentions implementation or coding, route to Dev agent."
```

## Missing Elements Addressed

### **1. Error Handling**
Just tell the user and log to filesystem for review
```
User: "flibber the jibbet"
System: "I don't understand that request. Could you rephrase?"
Log: decision_log/2025-01-25-unknown-intent.yaml
```

### **2. Learning Mechanism** 
Every decision logged with turns + success rate tracking
```yaml
decision_log:
  timestamp: "2025-01-25T15:30:00Z"
  user_request: "build a dashboard"
  routing_decision: "ceo → architect → dev"
  turns_to_completion: 12
  success_rate: 0.85
  user_satisfaction: 4/5
```

### **3. Context Preservation**
System recommends based on conversation flow and logs reasoning

### **4. Conflict Resolution Example**
```
User setting: "always involve CEO in decisions"
LLM routing: "direct to dev for simple fix"
Resolution: CEO override takes precedence
```

### **5. Fallback Behaviors**
Ask user and show reasoning when stuck
```
System: "I'm unsure whether this is a design or technical task.
My reasoning: Contains both UI elements and API changes.
What's your priority: 
1. Focus on visual design first
2. Handle backend logic first
3. Let me choose the approach"
```

### **6. Performance Optimization**
Use MCP router as nexus for caching and optimization

### **7. User Personalization**
Track every decision at MCP layer, build patterns over time
```
.local/user-preferences.yaml (takes precedence like Claude)
defaults:
  execution_mode: "vibe" # auto unless user stops
  ceo_involvement: "minimal"
  approval_threshold: "$500"
```

**The beauty**: LLM intelligence + numeric choices + seed evolution + decision tracking = continuous improvement