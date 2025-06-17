# 🚨 DYNAMIC CONTEXT ASSEMBLY AUDIT FINDINGS

## CRITICAL ISSUE: HARDCODED vs DYNAMIC MISMATCH

### THE PROBLEM
We have a **complete disconnect** between the intended dynamic context system and what's actually implemented:

## 🏗️ **WHAT SHOULD BE HAPPENING**
```
User: "Run nuclear test"
  ↓  
LLM: calls MCP with workflow request
  ↓
MCP: loads step config from workflows.yaml
  ↓
MCP: assembleDynamicContext() loads from contexts/agents/[personality]/context.yaml
  ↓
MCP: returns assembled system prompt + step instructions
  ↓
LLM: processes with MAXIMUM reasoning through that specific context
  ↓
[REPEAT for each step with different contexts]
```

## ❌ **WHAT'S ACTUALLY HAPPENING**
```
User: "Run nuclear test"  
  ↓
LLM: calls MCP with workflow request
  ↓
MCP: loads step config from workflows.yaml ✅
  ↓
MCP: assembleDynamicContext() loads from HARDCODED ceo-config.yaml ❌
  ↓
MCP: returns generic personality descriptions + step instructions
  ↓
LLM: processes with hardcoded context (not dynamic)
```

## 🔍 **SPECIFIC MISMATCHES**

### Personality Name Conflicts:
**workflows.yaml references:**
- `cortisol_guardian`
- `abundance_amplifier` 
- `action_catalyst`
- `sovereignty_architect`

**But contexts/agents/ contains:**
- `eeps/nfj-visionary/`
- `eeps/ntj-strategist/`
- `eeps/stp-adapter/`
- etc.

### Code Issues:

#### server.js lines 684-689:
```javascript
stepConfig.personalities.forEach((pName) => {
  const personality = this.personalities[pName]  // ❌ HARDCODED
  if (personality) {
    dynamicPrompt += `### ${pName.toUpperCase()}\n`
    dynamicPrompt += `- Role: ${personality.role}\n`  // ❌ STATIC
```

**Should be:**
```javascript
stepConfig.personalities.forEach((pName) => {
  const contextFile = await loadContextFile(`contexts/agents/${pName}/context.yaml`)  // ✅ DYNAMIC
  const systemPrompt = assembleSystemPrompt(contextFile)  // ✅ DYNAMIC
```

## 📁 **MISSING COMPONENTS**

### 1. Context File Loader
No function to load YAML context files from the contexts/ directory.

### 2. System Prompt Assembler  
No function to convert context YAML into system prompt partials.

### 3. Personality Mapping
No mapping between workflow personality names and context file paths.

### 4. Dynamic Assembly Engine
The assembleDynamicContext() function loads from hardcoded config instead of context files.

## 🎯 **WHAT NEEDS TO BE BUILT**

### Phase 1: Context File Loading
```javascript
async loadContextFile(contextPath) {
  // Load YAML from contexts/agents/[personality]/context.yaml
  // Parse and validate
  // Return structured context object
}
```

### Phase 2: System Prompt Assembly
```javascript
async assembleSystemPrompt(contextConfig) {
  // Convert context YAML into system prompt partial
  // Include: role, cognitive profile, decision patterns, etc.
  // Return formatted prompt string
}
```

### Phase 3: Personality Mapping
```yaml
# personality-mapping.yaml
cortisol_guardian: "agents/eeps/sfj-caregiver"
abundance_amplifier: "agents/eeps/nfp-advocate"  
action_catalyst: "agents/eeps/stp-adapter"
systems_illuminator: "agents/eeps/ntj-strategist"
```

### Phase 4: True Dynamic Assembly
Replace hardcoded personality loading with context file loading in assembleDynamicContext().

## 🚫 **EVERYTHING HARDCODED**

### In server.js:
- Entire `this.personalities` object (lines 395-450)
- System prompt assembly logic (lines 658-729) 
- Personality approach mappings (lines 710-728)
- All prompt formatting templates

### In ceo-config.yaml:
- All personality descriptions
- System prompt
- Constitutional principles  

### Should Be Dynamic:
- All personality context loaded from contexts/agents/
- All prompts assembled from context YAML
- All response patterns configured via contexts/
- Zero hardcoded strings

## 🎯 **SOLUTION STRATEGY**

1. **Audit personality mapping** - Map workflow names to context files
2. **Build context loader** - Dynamic YAML file loading
3. **Create prompt assembler** - Convert context to system prompts  
4. **Replace hardcoded assembly** - Update assembleDynamicContext()
5. **Test with real contexts** - Verify dynamic loading works

**RESULT**: True LLM-first architecture where everything is configurable via context files!