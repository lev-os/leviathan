# Test Fixtures for Kingly Context System

This directory contains test fixtures for the Kingly context system, including production contexts, mock data, and test scenarios.

## Directory Structure

```
fixtures/
├── contexts/          # Production context templates
│   ├── types/         # Core context types (workspace, project, task, etc.)
│   ├── agents/        # Agent contexts (CEO, Dev)
│   ├── workflows/     # Workflow contexts (insight-bubbling, etc.)
│   └── patterns/      # Decision patterns (SWOT, decision-matrix, etc.)
│
├── mock-data/         # Example domain contexts
│   └── contexts/
│       └── types/     # Domain examples (wedding, legal, game, etc.)
│
└── test-scenarios/    # Complex test scenarios
    ├── agile-sprint-setup.yaml
    ├── wedding-vendor-conflicts.yaml
    ├── cross-domain-integration.yaml
    └── multiverse-project-coordination.yaml
```

## Usage Scenarios

### 1. Testing Context Inheritance
```javascript
// Test cascading from workspace → project → task
const workspace = await loader.loadContextTemplate('workspace');
const project = await loader.loadContextTemplate('project');
const task = await loader.loadContextTemplate('task');
```

### 2. Testing Agent Routing
```javascript
// Load CEO and Dev agents for routing tests
const ceoAgent = await loader.loadContextTemplate('agents/ceo');
const devAgent = await loader.loadContextTemplate('agents/dev');
```

### 3. Testing Workflow Execution
```javascript
// Test insight bubbling workflow
const workflow = await loader.loadContextTemplate('workflows/insight-bubbling');
```

### 4. Testing Relationship System
```javascript
// Use mock-data for domain-specific relationships
const epic = await loader.loadContextTemplate('mock-data/contexts/types/epic');
const wedding = await loader.loadContextTemplate('mock-data/contexts/types/wedding_event');
```

### 5. Testing Complex Scenarios
```javascript
// Load complete test scenarios
const scenario = await loader.loadTestScenario('agile-sprint-setup');
await scenario.execute();
```

## Test Categories

### Core Functionality Tests
- Context loading and inheritance
- Hierarchical storage patterns
- Containment rules validation
- YAML parsing and validation

### Relationship System Tests
- Universal relationships (from base)
- Domain-specific relationships
- Bidirectional sync
- Property schema validation
- Cross-domain relationship queries

### Agent System Tests
- Agent capability matching
- Multi-lens reasoning (CEO)
- Agent handoff patterns

### Workflow Tests
- Workflow loading and execution
- Pattern application
- Cross-context operations

### Integration Tests
- End-to-end scenario execution
- Batch operations with relationships
- Cross-domain interactions
- Quantum/multiverse coordination

## Key Test Files

### Essential Types
- `workspace` - Root container
- `project` - Project organization
- `task` - Task management
- `folder` - Generic container
- `emergent` - Self-organizing contexts

### Key Agents
- `ceo` - Strategic reasoning, multi-lens
- `dev` - Technical implementation

### Important Workflows
- `insight-bubbling` - Pattern extraction
- `document-synthesis` - Multi-doc analysis
- `cross-context-learning` - Knowledge transfer

### Decision Patterns
- `decision-matrix` - Structured decisions
- `extreme-examples` - Breaking assumptions
- `swot-analysis` - Strategic analysis