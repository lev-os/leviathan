# 🎯 Professional YAML-Driven Automation Pipeline

## Architecture: Fractal + Global + Source Tracking

### 📁 Standardized Directory Structure:
```
ROOT-LEVEL (Global)
├── docs/architecture/           # System-wide synthesized architecture
├── specs/
│   ├── bdd/                    # Global BDD features
│   └── adr/                    # Global architectural decisions
└── drafts/                     # Global research workspace (wizard scans here)

COMPONENT-LOCAL (Fractal)
└── core/schema/
    ├── specs/
    │   ├── bdd/               # Component BDD features
    │   └── adr/               # Component ADRs
    ├── docs/                  # Component documentation
    └── drafts/                # Component-specific research
```

### 🔄 Professional Pipeline: INTAKE → WIZARD → ADR → BDD SPEC

### 📋 YAML Schema for Source Tracking:
```yaml
# Global: specs/registry.yaml
intake_item:
  id: "leviathan-001"
  status: "wizard_analysis" | "adr_draft" | "bdd_spec" | "implemented"
  source:
    type: "article" | "repo" | "perplexity_research" | "social_media"
    url: "https://example.com/article"
    local_file: "drafts/content/article-cache.md"
    timestamp: "2025-07-01T14:30:00Z"
  target_component: "core/schema" | "global"
  wizard_analysis: "drafts/wizard/leviathan-001-analysis.yaml"
  artifacts:
    adr: "specs/adr/014-component-schema-architecture.md"
    bdd_spec: "specs/bdd/component-schema.feature"
```

### 🧙‍♂️ Wizard YAML Configuration:
```yaml
# docs/workflows/wizard-experience/config.yaml
wizard_config:
  inputs:
    required:
      - source_material
      - target_component
      - analysis_depth
    optional:
      - domain_context
      - integration_requirements
  
  outputs:
    primary:
      - wizard_analysis_yaml
      - component_routing
      - adr_draft
    secondary:
      - bdd_spec_outline
      - implementation_guidance
  
  templates:
    analysis: "docs/templates/wizard-analysis.yaml"
    adr: "docs/templates/adr-template.md"
    bdd: "docs/templates/bdd-feature.yaml"
    component: "docs/templates/component-spec.yaml"
  
  processing:
    five_fold_path: true
    domain_questions: "docs/workflows/wizard-experience/domain-questions.yaml"
    constitutional_validation: true
    
  automation:
    auto_trigger_on:
      - download_complex_content
      - intake_repository
      - perplexity_research_completion
    scan_schedule:
      drafts_cleanup: "weekly"
      formalization_prompt: "daily"
```

### ⚡ Enhanced Intake Commands:

#### 1. `/download` Enhancement:
```yaml
download_integration:
  wizard_trigger: 
    threshold: "complex_content"
    auto_analyze: true
  source_tracking:
    cache_content: true
    preserve_metadata: true
  template_routing:
    article: "docs/templates/article-analysis.yaml"
    repository: "docs/templates/repo-analysis.yaml"
    research: "docs/templates/research-synthesis.yaml"
```

#### 2. `lev/intake` Enhancement:
```yaml
intake_pipeline:
  phase_1: 
    template: "docs/templates/content-acquisition.yaml"
    wizard_prep: true
  phase_2:
    template: "docs/templates/wizard-analysis.yaml"
    component_routing: true
  phase_3:
    template: "docs/templates/adr-generation.yaml"
    bdd_spec_creation: true
```

#### 3. Perplexity Research Formalization:
```yaml
perplexity_automation:
  trigger: "/research [topic]"
  config:
    auto_calls: 10
    synthesis_template: "docs/templates/research-synthesis.yaml"
    wizard_integration: true
  output_structure:
    source_tracking: "perplexity_research"
    analysis_file: "drafts/research/{topic}-synthesis.yaml"
    wizard_routing: true
```

### 📊 Template System Enhancement:

#### Available Templates (docs/templates/):
```yaml
template_registry:
  existing:
    - component-spec.yaml          # ✅ Component architecture template
    - IMPLEMENTATION.md           # ✅ Implementation guidance
    - component-docs-readme.hbs   # ✅ Documentation template
  
  needed:
    wizard_templates:
      - wizard-analysis.yaml       # Wizard output structure
      - domain-questions.yaml      # Domain analysis template
      - synthesis-report.yaml      # Concept synthesis template
    
    intake_templates:
      - content-acquisition.yaml   # Source tracking template
      - article-analysis.yaml      # Article intake template
      - repo-analysis.yaml         # Repository intake template
      - research-synthesis.yaml    # Perplexity research template
    
    pipeline_templates:
      - adr-template.md            # ADR generation template
      - bdd-feature.yaml           # BDD spec template
      - component-routing.yaml     # Component decision template
```

### 🎛️ Professional Automation Features:

#### 1. Source Material Preservation:
```yaml
source_management:
  retention_policy: "6_months"
  storage_structure:
    articles: "drafts/content/articles/"
    repositories: "drafts/content/repos/"
    research: "drafts/research/"
    social_media: "drafts/content/social/"
  
  metadata_tracking:
    url: true
    timestamp: true
    content_hash: true
    analysis_status: true
```

#### 2. Status Progression Tracking:
```yaml
pipeline_states:
  flow: "drafts → wizard_analysis → adr_draft → bdd_spec → implemented"
  automation:
    cleanup_completed: true
    archive_old_items: true
    cross_reference_validation: true
  
  registry: "specs/registry.yaml"
  dashboard: "workshop/pipeline-status.yaml"
```

#### 3. Component Intelligence:
```yaml
component_routing:
  ai_driven: true
  decision_factors:
    - content_domain
    - architectural_impact
    - dependency_analysis
    - integration_requirements
  
  routing_templates:
    global: "specs/"
    core_component: "core/{component}/specs/"
    plugin: "plugins/{plugin}/specs/"
    app: "apps/{app}/specs/"
```

### 🚀 Implementation Deliverables:

1. **Enhanced Download/Intake Commands** with YAML-driven templates
2. **Wizard Config System** (docs/workflows/wizard-experience/config.yaml)
3. **Template Registry** with all intake/analysis templates
4. **Pipeline Status Dashboard** (workshop/pipeline-status.yaml)
5. **Constitutional Validation** at each pipeline stage
6. **Claude Code Hook Integration** for seamless automation

### 🔄 Wizard Integration Points:

#### Claude Code Hooks:
```yaml
hooks_integration:
  perplexity_mcp: 
    trigger: "research_completion"
    action: "auto_wizard_analysis"
  
  web_search:
    trigger: "content_acquisition"
    action: "auto_source_tracking"
  
  file_creation:
    trigger: "new_draft"
    action: "auto_registry_entry"
```

#### Auto-Scanning Schedule:
```yaml
wizard_automation:
  daily_scan:
    - drafts/ directories (global + component)
    - prompt_formalization_opportunities
    - suggest_adr_creation
  
  weekly_cleanup:
    - archive_completed_pipelines
    - consolidate_duplicate_research
    - update_component_documentation
```

## Key Benefits:

✅ **Professional source tracking** with YAML schemas
✅ **Template-driven consistency** across all pipeline stages  
✅ **Zero dangling files** through automated pipeline management
✅ **Fractal + Global architecture** for infinite scalability
✅ **Wizard YAML configuration** for inputs/outputs/templates
✅ **Constitutional quality assurance** throughout pipeline
✅ **Claude Code hooks** for seamless automation

---

**Status**: Ready for implementation - all pieces coherent and professional