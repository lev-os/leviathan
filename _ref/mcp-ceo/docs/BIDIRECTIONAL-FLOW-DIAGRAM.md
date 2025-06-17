# 🔄 BIDIRECTIONAL FLOW DIAGRAM

## **CURRENT STATE (BROKEN)**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     USER        │───▶│      LLM        │───▶│      MCP        │
│ "Run NUKE-001"  │    │   Calls MCP     │    │ Loads workflows │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────┐             │
                       │   HARDCODED     │◀────────────┘
                       │  ceo-config.yaml│
                       │ (static prompts)│
                       └─────────────────┘
                                │
                       ┌─────────────────┐
                       │      LLM        │
                       │  Generic Response│
                       │ (not max power) │
                       └─────────────────┘
                                │
                       ┌─────────────────┐
                       │      USER       │
                       │ Gets mediocre   │
                       │    response     │
                       └─────────────────┘
```

## **TARGET STATE (DYNAMIC)**
```
┌─────────────────┐
│     USER        │
│ "Run NUKE-001"  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐    step 1    ┌─────────────────┐
│      LLM        │──────────────▶│      MCP        │
│   Calls MCP     │               │ Workflow Engine │
└─────────────────┘               └─────────┬───────┘
          ▲                                 │
          │                                 ▼
          │                        ┌─────────────────┐
          │                        │ DYNAMIC LOADER  │
          │                        │ contexts/agents/│
          │                        │ /eeps/nfj-      │
          │                        │ visionary.yaml  │
          │                        └─────────┬───────┘
          │                                  │
          │                                  ▼
          │                        ┌─────────────────┐
          │                        │  PROMPT ASSEMBLER│
          │                        │ Converts YAML   │
          │                        │ to system prompt│
          │                        └─────────┬───────┘
          │                                  │
          │                                  ▼
          │                        ┌─────────────────┐
          │◀───────step response───│ CONTEXT INJECTION│
          │                        │ NFJ-Visionary   │
          │                        │ + Step Instructions│
          │                        └─────────────────┘
          │
          ▼
┌─────────────────┐
│      LLM        │
│ MAXIMUM POWER   │
│ Reasoning as    │
│ NFJ-Visionary   │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐    callback   ┌─────────────────┐
│      LLM        │──────────────▶│      MCP        │
│ Returns insights│               │ Saves + Next    │
└─────────────────┘               └─────────┬───────┘
          ▲                                 │
          │                                 ▼
          │                        ┌─────────────────┐
          │                        │ DYNAMIC LOADER  │
          │                        │ contexts/agents/│
          │                        │ /eeps/stp-      │
          │                        │ adapter.yaml    │
          │                        └─────────┬───────┘
          │                                  │
          │                       [CYCLE REPEATS WITH
          │                        DIFFERENT CONTEXTS]
          │                                  │
          │◀─────────step 2 response─────────┘
          │
          ▼
┌─────────────────┐
│      LLM        │
│ MAXIMUM POWER   │
│ Reasoning as    │
│ STP-Adapter     │
└─────────┬───────┘
          │
      [CONTINUES...]
          │
          ▼
┌─────────────────┐
│     USER        │
│ Receives full   │
│ synthesis from  │
│ multiple deep   │
│ reasoning cycles│
└─────────────────┘
```

## **KEY DIFFERENCES**

### **CURRENT (Broken)**
- ❌ Static hardcoded prompts
- ❌ Same generic context every step  
- ❌ No personality switching
- ❌ Shallow reasoning

### **TARGET (Dynamic)**
- ✅ Dynamic context loading from YAML files
- ✅ Different personality each step
- ✅ True context injection
- ✅ Maximum reasoning power per lens

## **THE BIDIRECTIONAL MAGIC**
Each cycle the LLM gets **COMPLETELY DIFFERENT INSTRUCTIONS** based on:
1. **Which context file** is loaded (NFJ-Visionary vs STP-Adapter)
2. **Which step** in the workflow (define vs analyze vs synthesize)  
3. **Previous results** from earlier steps

This creates **EMERGENT INTELLIGENCE** through context orchestration!