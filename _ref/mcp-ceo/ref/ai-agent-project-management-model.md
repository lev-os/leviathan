# AI Agent Project Management Model

## Overview
A universal project management system designed for AI agents that can handle software development, design, legal, content, and marketing work. Features dynamic task management, feature discovery, evolving requirements, and multi-agent orchestration.

## Core Concepts

### Work Types
All project activities are categorized as WorkItems with specific types:
- **Feature**: New functionality
- **Maintenance**: Cleanup, refactoring, dependency updates
- **Infrastructure**: CI/CD, testing, tooling
- **Design**: UI/UX work
- **Legal**: Compliance, contracts
- **Content**: Copy, documentation
- **Marketing**: Campaigns, analytics
- **Research**: User research, experiments

### Decision Records (DR) & Conventions
- DRs capture architectural and process decisions
- DRs can be promoted to Conventions when they establish patterns
- Conventions form a graph of project rules and guidelines
- Features are tied to DRs, creating traceable decision history

## YAML Configuration Files

### Work Types Configuration
```yaml
# .project/config/work-types.yaml
workTypes:
  feature:
    name: "Feature"
    requiresADR: true
    deliverables: ["code", "tests", "documentation"]
    reviewTypes: ["code", "design", "product"]
    
  maintenance:
    name: "Maintenance"
    requiresADR: false
    subtypes:
      - file-deletion
      - refactor
      - dependency-update
      - test-improvement
    fastTrack: true
    
  infrastructure:
    name: "Infrastructure"
    requiresADR: sometimes # Only when establishing patterns
    categories:
      - testing
      - ci-cd
      - monitoring
      - tooling
      
  design:
    name: "Design"
    requiresADR: true # For design system decisions
    deliverables: ["components", "guidelines", "assets"]
    reviewTypes: ["design", "accessibility"]
    
  legal:
    name: "Legal"
    requiresADR: true # Creates compliance constraints
    deliverables: ["requirements", "constraints", "approvals"]
    reviewTypes: ["legal", "compliance"]
    
  content:
    name: "Content"
    requiresADR: false
    deliverables: ["copy", "documentation", "assets"]
    reviewTypes: ["editorial", "brand"]
    
  marketing:
    name: "Marketing"
    requiresADR: false
    deliverables: ["campaigns", "analytics", "materials"]
    reviewTypes: ["brand", "strategy"]
```

### Conventions Configuration
```yaml
# .project/conventions/technical-conventions.yaml
conventions:
  - id: CONV-001
    fromDR: DR-042
    name: "API Error Handling"
    rule: "All APIs return errors in Result<T,E> format"
    scope: global
    appliesTo: ["feature", "infrastructure"]
    enforcement: "build-time"
    createdAt: 2024-01-15
    
  - id: CONV-002
    fromDR: DR-051
    name: "Testing Strategy"
    rule: "All features require unit and integration tests"
    scope: global
    appliesTo: ["feature"]
    enforcement: "ci-cd"

# .project/conventions/design-conventions.yaml  
conventions:
  - id: DCONV-001
    fromDR: DR-089
    name: "Loading States"
    rule: "All async operations show skeleton screens"
    scope: global
    appliesTo: ["design", "feature"]
    
  - id: DCONV-002
    fromDR: DR-095
    name: "Grid System"
    rule: "8px spacing grid for all layouts"
    scope: global
    appliesTo: ["design", "feature"]

# .project/conventions/content-conventions.yaml
conventions:
  - id: CCONV-001
    fromDR: DR-101
    name: "Error Messages"
    rule: "All errors use friendly, actionable language"
    scope: global
    appliesTo: ["content", "feature"]
```

### Work Item Templates
```yaml
# .project/templates/work-item.yaml
templates:
  quickActions:
    cleanup:
      type: maintenance
      subtype: file-deletion
      title: "Code cleanup in {{path}}"
      fastTrack: true
      
    addTests:
      type: infrastructure
      category: testing
      title: "Add tests for {{component}}"
      deliverables: ["tests"]
      
    updateDeps:
      type: maintenance
      subtype: dependency-update
      title: "Update {{dependency}} to {{version}}"
      requiresApproval: false
      
    refactor:
      type: maintenance
      subtype: refactor
      title: "Refactor {{component}}"
      requiresDR: sometimes
```

## TypeScript Core Abstractions

### Type Definitions
```typescript
// config/types.ts
interface WorkItem {
  id: string;
  type: string;
  title: string;
  triggeredDRs?: string[];
  constrainedByDRs?: string[];
  applicableConventions: Convention[];
  dependencies: Dependency[];
  deliverables: Deliverable[];
  fastTrack?: boolean;
}

interface DecisionRecord {
  id: string;
  title: string;
  status: 'proposed' | 'accepted' | 'deprecated' | 'superseded';
  content: string;
  scope: 'local' | 'package' | 'global';
  establishesConvention?: ConventionCandidate;
  supersedes?: string[];
  relatedTo?: string[];
  createdAt: Date;
}

interface Convention {
  id: string;
  fromDR: string;
  name: string;
  rule: string;
  scope: 'local' | 'package' | 'global';
  appliesTo: string[];
  enforcement?: 'build-time' | 'linting' | 'review' | 'ci-cd' | 'automated';
  createdAt: string;
}

interface ConventionCandidate {
  dr: DecisionRecord;
  suggestedConvention: {
    name: string;
    rule: string;
  };
  confidence: number;
  scope: 'local' | 'package' | 'global';
}
```

### Configuration Loader
```typescript
// core/ConfigLoader.ts
import { parse } from 'yaml';
import { readFileSync, existsSync } from 'fs';

export class ConfigLoader {
  private cache = new Map<string, any>();
  private basePath: string;
  
  constructor(projectPath: string) {
    this.basePath = projectPath;
  }
  
  load<T>(configPath: string): T {
    const fullPath = `${this.basePath}/${configPath}`;
    
    if (!this.cache.has(fullPath)) {
      if (!existsSync(fullPath)) {
        throw new Error(`Config file not found: ${fullPath}`);
      }
      const content = readFileSync(fullPath, 'utf-8');
      this.cache.set(fullPath, parse(content));
    }
    return this.cache.get(fullPath);
  }
  
  loadWorkTypes(): WorkTypeConfig {
    return this.load<WorkTypeConfig>('.project/config/work-types.yaml');
  }
  
  loadConventions(domain: string): Convention[] {
    const config = this.load<{ conventions: Convention[] }>(
      `.project/conventions/${domain}-conventions.yaml`
    );
    return config.conventions || [];
  }
}
```

### Work Item Factory
```typescript
// core/WorkItemFactory.ts
export class WorkItemFactory {
  constructor(
    private config: ConfigLoader,
    private conventionMatcher: ConventionMatcher
  ) {}
  
  create(type: string, params: WorkItemParams): WorkItem {
    const workTypes = this.config.loadWorkTypes();
    const definition = workTypes.workTypes[type];
    
    if (!definition) {
      throw new Error(`Unknown work type: ${type}`);
    }
    
    const conventions = this.conventionMatcher.findApplicable(type);
    
    return {
      id: this.generateId(),
      type,
      title: params.title,
      requiresDR: this.shouldRequireDR(definition, params),
      applicableConventions: conventions,
      deliverables: definition.deliverables || [],
      fastTrack: definition.fastTrack || false
    };
  }
  
  fromTemplate(templateName: string, vars: Record<string, string>): WorkItem {
    const templates = this.config.load<any>('.project/templates/work-item.yaml');
    const template = templates.templates.quickActions[templateName];
    
    if (!template) {
      throw new Error(`Unknown template: ${templateName}`);
    }
    
    const title = this.interpolate(template.title, vars);
    
    return this.create(template.type, {
      ...template,
      title
    });
  }
  
  private interpolate(template: string, vars: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || '');
  }
  
  private generateId(): string {
    return `WI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

### Decision Analyzer
```typescript
// core/DecisionAnalyzer.ts
export class DecisionAnalyzer {
  detectConventionPotential(dr: DecisionRecord): ConventionCandidate | null {
    const indicators = [
      /all \w+ (should|must|will)/i,
      /every \w+ (should|must|will)/i,
      /standard approach/i,
      /going forward/i,
      /team convention/i,
      /always use/i,
      /never use/i
    ];
    
    const score = this.calculateConventionScore(dr, indicators);
    
    if (score > 0.7) {
      return {
        dr,
        suggestedConvention: this.extractConvention(dr),
        confidence: score,
        scope: this.inferScope(dr)
      };
    }
    
    return null;
  }
  
  private calculateConventionScore(dr: DecisionRecord, indicators: RegExp[]): number {
    let score = 0;
    const content = `${dr.title} ${dr.content}`.toLowerCase();
    
    for (const indicator of indicators) {
      if (indicator.test(content)) {
        score += 0.2;
      }
    }
    
    // Boost score for global scope indicators
    if (/entire (project|codebase|team)/i.test(content)) {
      score += 0.3;
    }
    
    return Math.min(score, 1);
  }
  
  private extractConvention(dr: DecisionRecord): { name: string; rule: string } {
    // Extract the core rule from the decision
    const content = dr.content;
    const ruleMatch = content.match(/(?:should|must|will) (.+?)(?:\.|$)/i);
    
    return {
      name: dr.title,
      rule: ruleMatch ? ruleMatch[1] : dr.title
    };
  }
}
```

### Convention Promoter
```typescript
// core/ConventionPromoter.ts
export class ConventionPromoter {
  constructor(
    private analyzer: DecisionAnalyzer,
    private config: ConfigLoader,
    private ui: UserInterface
  ) {}
  
  async handleNewDR(dr: DecisionRecord): Promise<void> {
    const candidate = this.analyzer.detectConventionPotential(dr);
    
    if (candidate) {
      const response = await this.ui.prompt(
        `📋 New DR: "${dr.title}"\n` +
        `🎯 Looks like a convention: "${candidate.suggestedConvention.rule}"\n` +
        `Promote to ${candidate.scope} convention? [Y/n/edit]`
      );
      
      if (response === 'Y') {
        await this.promoteToConvention(candidate);
      } else if (response === 'edit') {
        const edited = await this.editConvention(candidate);
        await this.promoteToConvention(edited);
      }
    }
  }
  
  private async promoteToConvention(candidate: ConventionCandidate) {
    const domain = this.determineDomain(candidate);
    const file = `.project/conventions/${domain}-conventions.yaml`;
    
    const convention: Convention = {
      id: this.generateConventionId(domain),
      fromDR: candidate.dr.id,
      name: candidate.suggestedConvention.name,
      rule: candidate.suggestedConvention.rule,
      scope: candidate.scope,
      appliesTo: this.determineApplicableTypes(candidate),
      createdAt: new Date().toISOString()
    };
    
    await this.appendToYaml(file, convention);
    await this.ui.notify(`✅ Convention ${convention.id} created`);
  }
  
  private determineDomain(candidate: ConventionCandidate): string {
    const content = candidate.dr.content.toLowerCase();
    
    if (/api|code|technical|architecture/.test(content)) return 'technical';
    if (/design|ui|ux|visual/.test(content)) return 'design';
    if (/content|copy|documentation/.test(content)) return 'content';
    if (/legal|compliance|gdpr/.test(content)) return 'legal';
    
    return 'general';
  }
}
```

### Context Capture System
```typescript
// core/ContextCapture.ts
export enum CaptureMode {
  FULL = 'full',       // Entire conversation, code diffs, analysis
  DEFAULT = 'default', // Decision summary, rationale, key refs
  MINIMAL = 'minimal'  // Just decision and DR reference
}

export class ContextCaptureSystem {
  private mode: CaptureMode = CaptureMode.DEFAULT;
  private threshold = 0.7;
  
  setMode(mode: CaptureMode) {
    this.mode = mode;
  }
  
  async captureDecision(
    decision: DecisionPoint,
    conversation: ConversationTurn[]
  ): Promise<DecisionRecord> {
    const context = this.extractContext(decision, conversation);
    
    switch (this.mode) {
      case CaptureMode.FULL:
        return this.captureFullContext(decision, context, conversation);
      case CaptureMode.MINIMAL:
        return this.captureMinimalContext(decision);
      default:
        return this.captureDefaultContext(decision, context);
    }
  }
  
  private extractContext(
    decision: DecisionPoint,
    conversation: ConversationTurn[]
  ): Context {
    // Extract relevant context based on decision type
    const relevantTurns = this.findRelevantTurns(decision, conversation);
    const codeRefs = this.extractCodeReferences(relevantTurns);
    
    return {
      summary: this.summarize(relevantTurns),
      rationale: this.extractRationale(relevantTurns),
      alternatives: this.extractAlternatives(relevantTurns),
      codeRefs
    };
  }
}
```

## CLI Usage Examples

```bash
# Quick developer actions
work cleanup src/old-components
work add-tests UserService
work update-deps react 18.3.0
work refactor AuthModule

# Create new work items
work create feature "User authentication"
work create design "Dashboard redesign"
work create legal "GDPR compliance audit"

# Decision records
work dr create "Use tRPC for all new APIs"
# System: "Looks like a convention. Promote to global convention? [Y/n/edit]"

# View conventions
work conventions list
work conventions check  # Validate current work against conventions
```

## Project Structure

```
.project/
├── config/
│   └── work-types.yaml
├── conventions/
│   ├── technical-conventions.yaml
│   ├── design-conventions.yaml
│   ├── content-conventions.yaml
│   └── legal-conventions.yaml
├── templates/
│   └── work-item.yaml
├── decisions/
│   └── DR-{id}.md
└── context/
    └── captures/
```

## Key Features

1. **Universal Work Item Model**: Handles all types of project work (code, design, legal, etc.)
2. **Decision → Convention Pipeline**: Automatically detects when DRs should become conventions
3. **Context-Aware Capture**: Three modes (full/default/minimal) for capturing decision context
4. **Convention Enforcement**: Validates work against established conventions
5. **Fast-Track Options**: Streamlined workflows for routine maintenance tasks
6. **Cross-Functional Support**: Works for engineering, design, legal, and content teams
7. **YAML-Based Configuration**: Easy to modify without code changes
8. **Template System**: Quick actions for common tasks