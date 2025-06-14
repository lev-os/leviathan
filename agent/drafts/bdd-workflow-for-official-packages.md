# BDD Workflow for Official Package Creation

## 🎯 Purpose
Use existing BDD specification workflow for creating **official core packages** and **community plugin guidelines**.

## 📍 Location of BDD Workflow
`/digital/kingly/core/agent/contexts/workflows/bdd-specification/context.yaml`

## 🔄 How It Works
6-step LLM personality-driven process:

1. **ADR Decomposition** (doc-shepherd) - Break down requirements into features
2. **Acceptance Criteria Definition** (stj-leader) - Clear success metrics  
3. **Scenario Development** (stp-adapter) - Concrete Gherkin scenarios
4. **Test Strategy Design** (nfj-visionary) - Holistic test approach
5. **Implementation Guidance** (nfp-advocate) - Developer experience
6. **Spec Compilation** (doc-shepherd) - Final specification document

## 🎯 When to Use

### Official Core Packages (High Stakes)
- Memory systems (@kingly/memory)
- Authentication (@kingly/auth) 
- Security packages
- Performance-critical packages
- Packages other packages depend on

### Community Plugin Guidelines
- Plugin marketplace standards
- Community developer onboarding
- Plugin certification process
- Quality assurance for community plugins

## 🚫 When NOT to Use
- Quick utility packages (like debug/cmd we just built)
- Internal tools and experiments
- Rapid prototyping
- Simple integrations

## 💡 Usage Pattern
```bash
# Load BDD workflow via existing WorkflowLoader
const loader = new WorkflowLoader();
const bddWorkflow = await loader.loadContext('workflows', 'bdd-specification');

# Apply to ADR for serious packages
const specs = await bddWorkflow.execute({
  adr: 'memory-system-architecture',
  focus: 'multi-backend memory with LLM reasoning integration'
});
```

## 🎯 Benefits
- **LLM-driven specification** through agent personalities
- **Comprehensive coverage** of requirements → implementation
- **Quality assurance** for official packages
- **Community standards** for plugin development
- **Constitutional AI compliance** built into process

## 📝 Integration with Core Packages
The BDD workflow can generate specs that integrate with our core packages:
- Use @kingly/debug for tracing specification compliance
- Use @kingly/cmd for testing process management
- Use existing agent personalities for requirement analysis

---
*Note: For rapid development like @kingly/debug and @kingly/cmd, skip BDD and code directly. For official packages and community standards, use BDD workflow for comprehensive specification.*