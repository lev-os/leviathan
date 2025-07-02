# 🏗️ CLEAN FRACTAL ORGANIZATION ARCHITECTURE

**Final Architecture Decision - Clean Component vs Global Separation**

## 🎯 THE PROBLEM SOLVED

**Mixed Concerns**: I was incorrectly putting global infrastructure (templates, tooling) into component-local fractal specs.

**Solution**: Clean separation between component-local and global concerns.

## 📁 COMPONENT-LOCAL (Fractal Pattern)

**Every component follows this structure**:

```
core/schema/                    # Example component
├── specs/                      # Component-specific specifications
│   ├── bdd/                   # BDD features for this component only
│   │   ├── schema-validation.feature
│   │   └── constitutional-framework.feature
│   └── adr/                   # Component architectural decisions
│       ├── 001-schema-inheritance.md
│       └── 002-validation-pipeline.md
├── docs/                      # Component documentation (user-facing)
│   ├── README.md              # Component overview
│   ├── api.md                 # API documentation
│   └── examples/              # Usage examples
└── drafts/                    # Temporary research/intake for this component
    ├── new-schema-types.md    # Research notes
    ├── performance-ideas.md   # Draft improvements
    └── integration-notes.md   # Exploration work
```

**Applied to our packages**:
- `core/schema/specs/`, `core/schema/docs/`, `core/schema/drafts/`
- `core/legos/specs/`, `core/legos/docs/`, `core/legos/drafts/`
- `agent/specs/`, `agent/docs/`, `agent/drafts/`

## 📁 ROOT-LEVEL (Global Infrastructure)

**System-wide concerns live at project root**:

```
# Global Architecture
docs/
├── README.md                  # Project overview
├── architecture/              # Synthesized from all component ADRs
│   ├── system-overview.md     # High-level architecture
│   ├── component-integration.md
│   └── design-principles.md
└── guides/                    # User guides and tutorials

# Global Specifications  
specs/                         # System-wide specifications only
├── bdd/                      # Cross-component BDD features
│   ├── system-integration.feature
│   └── end-to-end-workflows.feature
├── adr/                      # Global architectural decisions
│   ├── 001-fractal-organization.md
│   └── 002-specification-system.md
├── registry.yaml             # Component discovery index
└── tooling/                  # Spec validation and generation tools

# Research Workspace
drafts/                       # Global research/intake workspace
├── competitive-analysis.md   # Industry research
├── integration-experiments/  # Cross-component explorations
└── future-architecture.md    # Long-term planning
```

## 🧙‍♂️ WIZARD INTEGRATION PATTERN

**Draft Management Workflow**:

1. **Wizard scans drafts/** (both component and global)
2. **Prompts for decisions**: "What should we do with this research?"
   - **Formalize** → Move to appropriate specs/ or docs/
   - **Archive** → Move to organized storage
   - **Continue** → Keep in drafts for ongoing work
   - **Delete** → Remove outdated research

3. **Periodic cleanup** → Wizard automatically suggests stale draft cleanup

## 🎯 KEY PRINCIPLES

### Clean Separation
- **Component concerns** stay in component directories
- **Global infrastructure** stays at root level
- **No mixing** of local vs global specifications

### Fractal Consistency  
- **Every component** follows same specs/, docs/, drafts/ pattern
- **Predictable locations** for all development artifacts
- **Scalable pattern** that works for any number of components

### Draft Management
- **drafts/** for on-the-fly research and exploration
- **Automatic cleanup prompts** via wizard integration
- **Clear formalization path** from draft → spec → implementation

### Alternative Naming
- Could use **tmp/** instead of **drafts/** if preferred
- **drafts/** conveys "working research" better than temporary files

## 🔧 IMPLEMENTATION CHANGES NEEDED

1. **Update specs/README.md** - Remove template/tooling confusion from component specs
2. **Establish component drafts/** directories  
3. **Move global concerns** to root specs/ and docs/
4. **Document wizard draft workflow**
5. **Create clean component spec templates**

---

**Status**: Architecture finalized - ready for implementation  
**Pattern**: Component fractal (specs/docs/drafts) + Global infrastructure (root specs/docs)  
**Next**: Update existing specifications to follow this clean pattern