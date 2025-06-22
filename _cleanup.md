# Leviathan Core Cleanup Plan

## Current Problem:
Constitutional principles and EEPS psychological modes are embedded throughout Leviathan core documentation and architecture, making the technical platform unnecessarily complex.

## Extraction Strategy:

### Step 1: Create Separate Packages
```
plugins/@lev-os/
├── constitutional-framework/     # 10 Constitutional principles
├── eeps-system/                 # 8-Mode psychological system  
└── constitutional-compliance/   # Optional compliance checking
```

### Step 2: Clean Core Documentation
- Remove constitutional principles from core CLAUDE.md
- Remove EEPS modes from core architecture  
- Remove constitutional compliance requirements from plugin standards
- Focus core on pure technical capabilities

### Step 3: Make These Optional
- Constitutional framework becomes an optional plugin
- EEPS system becomes an optional enhancement
- Plugin development standards become purely technical
- Core Leviathan works without business logic

### Step 4: Update Architecture
- Core: Pure technical AI-native OS capabilities
- Plugins: Optional business logic and frameworks
- Clean separation of concerns

## Outcome:
Clean technical core that anyone can use, with optional business frameworks for those who want them.

## What's Currently Mixed Into Core:

### 1. **Constitutional Framework** (10 Principles)
Currently in core CLAUDE.md:
- Hormonal/Emotional Balance Optimization
- Quantum Context Entanglement  
- Bootstrap Sovereignty
- LLM-First Constitutional Architecture
- Maximum Extensibility
- Full Brain Sovereignty
- Human-AI-Business State Correlation
- Emergent Intelligence
- Bi-Directional Communication
- Natural AI Alignment

### 2. **EEPS (8-Mode Psychological System)**
Currently embedded in core:
- Balance Guardian
- Abundance Amplifier  
- Sovereignty Architect
- Harmony Weaver
- Systems Illuminator
- Resilience Guardian
- Flow Creator
- Action Catalyst

### 3. **Constitutional Compliance Requirements**
Currently required for all plugins:
- "Constitutional Compliance": Follow all 10 core constitutional principles
- Plugin development standards mention constitutional compliance

## Execution Plan:

### Phase 1: Create Constitutional Framework Package
- Create `plugins/@lev-os/constitutional-framework/`
- Extract 10 principles from core CLAUDE.md
- Document as optional plugin

### Phase 2: Create EEPS System Package  
- Create `plugins/@lev-os/eeps-system/`
- Extract 8 psychological modes from core
- Document as optional enhancement

### Phase 3: Clean Core Documentation
- Remove business logic from core CLAUDE.md
- Update plugin development standards to be purely technical
- Focus on technical capabilities only

### Phase 4: Update Architecture References
- Update all mentions of constitutional compliance as optional
- Remove EEPS references from core architecture
- Clean separation between technical core and business plugins

---

*Goal: Clean technical core that anyone can hack, with optional business frameworks for those who want them.*