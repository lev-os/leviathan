# SPEC-013: Hot Reload Implementation
*Comprehensive hot reload system for MCP-CEO development*

## Session Context
- **Current Phase**: Specification and planning
- **Last Session**: Completed MCP server rebuild and testing validation
- **This Session Target**: Hot reload implementation specification
- **Next Session**: Phase 1 implementation (Context YAML hot reload)

## Architecture Context
- **Key Constraint**: MCP tools not hot-reloadable (restart required for tool schema changes)
- **Foundation**: Existing server-hot.js with proven module cache busting pattern
- **Dependencies**: Rebuilt MCP server architecture (MCPServer.js, tools/, session/)
- **Related**: [ADR-008: LLM-First Bidirectional Control](../adr/008-llm-first-flowmind-bidirectional-control.md)

## Problem Statement
Current development workflow requires full server restart for most changes:
- Context YAML modifications → Restart required
- Core module changes → Restart required  
- Active sessions lost → Development flow interrupted
- Slow iteration cycles → Reduced development velocity

## Solution Overview
Extend existing server-hot.js pattern to comprehensive hot reload system:
- **Context YAML Hot Reload**: Instant context updates without restart
- **Core Module Hot Reload**: FlowMind component updates with session preservation  
- **Development Experience**: Real-time feedback and validation
- **Production Safety**: Controlled deployment with rollback capabilities

## Decision Tree

### Change Type Classification
```
File Change Detected
├── contexts/**/*.yaml
│   ├── Validation passes → Hot reload context
│   └── Validation fails → Show error, no reload
├── src/mcp/tools/*.js (implementation only)
│   ├── Tool schema unchanged → Hot reload tool logic
│   └── Tool schema changed → Restart required
├── src/flowmind.js, src/context-*.js
│   ├── Breaking changes → Restart recommended
│   └── Non-breaking → Hot reload with state preservation
└── server-hot.js, package.json
    └── Always requires restart
```

### Environment-Specific Policies
```
Development Environment
├── All hot reloads enabled
├── Immediate feedback
└── Automatic validation

Production Environment  
├── Context hot reload only
├── Manual approval required
└── Rollback capability mandatory
```

## Critical Behaviors (BDD)

```gherkin
Feature: Context YAML Hot Reload
  As a developer working on FlowMind contexts
  I want automatic context reloading when I modify YAML files
  So that I can see changes immediately without losing session state

  Scenario: Context file modification during active workflow
    Given MCP server is running with active workflow sessions
    And I have a cognitive-parliament workflow in progress at step 2
    When I modify contexts/agents/ceo/context.yaml
    Then the context reloads within 500ms
    And the active workflow session is preserved
    And the next workflow step uses the updated context
    And I see a success notification in the terminal

  Scenario: Invalid YAML modification
    Given MCP server is running
    When I save invalid YAML syntax to a context file
    Then the hot reload is prevented
    And I see a clear error message
    And the previous valid context remains loaded
    And active sessions continue uninterrupted

Feature: Core Module Hot Reload
  As a developer working on FlowMind core logic
  I want automatic module reloading for non-breaking changes
  So that I can iterate on core functionality efficiently

  Scenario: FlowMind core modification
    Given MCP server is running with active sessions
    When I modify src/flowmind.js with non-breaking changes
    Then the FlowMind module reloads
    And active session state is preserved
    And new instances use the updated logic
    And existing instances migrate gracefully

Feature: Development Workflow Integration
  As a developer using the hot reload system
  I want clear feedback about what reloaded and why
  So that I understand the impact of my changes

  Scenario: Multi-file change cascade
    Given MCP server is running
    When I modify a workflow that references multiple agents
    Then dependent contexts reload in correct order
    And I see a summary of what reloaded
    And performance metrics are displayed
    And any conflicts are clearly reported
```

## Implementation Phases

### Phase 1: Context YAML Hot Reload (Days 1-2)
**Objective**: Extend server-hot.js to watch and reload context YAML files

#### 1.1 File Watching Enhancement
- Add recursive watching for `contexts/**/*.yaml`
- Implement debounced reload (avoid rapid-fire changes)
- Filter relevant files (ignore .git, node_modules, etc.)

#### 1.2 Context Validation Pipeline
- YAML syntax validation before reload
- FlowMind schema validation
- Dependency chain validation
- Rollback on validation failure

#### 1.3 Context Cache Management
- Clear specific context from ContextRegistry
- Preserve session state during reload
- Update active FlowMind instances
- Notify components of context changes

**Success Criteria:**
- Context YAML changes reload within 500ms
- Invalid YAML is rejected with clear errors
- Active sessions continue uninterrupted
- Terminal shows clear reload feedback

### Phase 2: Core Module Hot Reload (Days 3-4)
**Objective**: Hot reload FlowMind core modules with state preservation

#### 2.1 Module Dependency Tracking
- Map dependencies between core modules
- Determine reload order for cascading changes
- Identify breaking vs non-breaking changes
- Implement staged reload process

#### 2.2 State Preservation Protocol
- Serialize active session state before reload
- Migrate state to new module instances
- Validate state integrity after reload
- Graceful degradation on migration failure

#### 2.3 Enhanced Error Handling
- Detect reload failures early
- Automatic rollback to previous version
- Session recovery mechanisms
- Clear error reporting and remediation steps

**Success Criteria:**
- Core module changes reload with preserved sessions
- Breaking changes are detected and require restart
- Failed reloads automatically rollback
- Performance impact is minimal (< 2s reload time)

### Phase 3: Development Experience Enhancement (Days 5-6)
**Objective**: Rich developer feedback and debugging capabilities

#### 3.1 Enhanced Terminal Feedback
- Real-time change notifications with diff summaries
- Performance metrics for reload operations
- Context dependency visualization
- Reload history and analytics

#### 3.2 Validation and Debug Tools
- Pre-reload change impact analysis
- Context conflict detection
- Session state inspection
- Hot reload performance profiling

#### 3.3 Development Workflow Integration
- Package.json scripts for different hot reload modes
- IDE integration hints and markers
- Test suite integration for hot-reloaded changes
- Documentation with examples and troubleshooting

**Success Criteria:**
- Rich, actionable feedback on all changes
- Clear visualization of reload impacts
- Integrated development workflow
- Comprehensive troubleshooting guides

### Phase 4: Production Safety and Deployment (Days 7-8)
**Objective**: Enterprise-safe hot reload with proper controls

#### 4.1 Environment-Aware Policies
- Development vs production reload policies
- Change approval workflows for critical systems
- Automated validation gates
- Compliance audit trails

#### 4.2 Rollback and Recovery
- Automatic backup of working configurations
- One-click rollback to previous versions
- Health checks after deployment
- Session continuity guarantees

#### 4.3 Monitoring and Observability
- Hot reload success/failure metrics
- Performance impact monitoring
- Change audit logging
- Alert integration for failures

**Success Criteria:**
- Production deployments are safe and controlled
- Instant rollback capability
- Complete audit trails for compliance
- Zero unplanned downtime from hot reloads

## File Structure Changes

### New Files
```
src/hot-reload/
├── HotReloadManager.js          # Central orchestration
├── ContextWatcher.js            # YAML file watching and validation
├── ModuleReloader.js            # Core module hot reload
├── StatePreserver.js            # Session state management
├── ValidationPipeline.js        # Pre-reload validation
├── ReloadDebugger.js            # Developer tools and feedback
└── ProductionSafeReload.js      # Production deployment controls

config/
├── hot-reload-config.yaml       # Hot reload configuration
└── environment-policies.yaml    # Environment-specific controls

docs/specs/
└── hot-reload-usage-guide.md    # Developer guide and examples
```

### Enhanced Files
```
server-hot.js                    # Extended with new managers
src/flowmind.js                  # Add reload hooks and state preservation
src/context-assembler.js         # Add reload-safe initialization
src/context-registry.js          # Add cache invalidation methods
```

## Configuration

### Hot Reload Configuration (hot-reload-config.yaml)
```yaml
hot_reload:
  enabled: true
  environment: development
  
  file_watching:
    patterns:
      - "contexts/**/*.yaml"
      - "src/flowmind.js"
      - "src/context-*.js"
    exclude:
      - "node_modules/**"
      - ".git/**"
      - "sessions/**"
    debounce_ms: 300
    
  validation:
    yaml_syntax: true
    schema_validation: true
    dependency_check: true
    breaking_change_detection: true
    
  performance:
    max_reload_time_ms: 2000
    session_preservation: true
    rollback_on_failure: true
    
  feedback:
    terminal_notifications: true
    performance_metrics: true
    change_summaries: true
    error_details: verbose
```

### Environment Policies (environment-policies.yaml)
```yaml
development:
  auto_reload: true
  validation_level: standard
  approval_required: false
  rollback_automatic: true
  
staging:
  auto_reload: true
  validation_level: strict
  approval_required: false
  rollback_automatic: true
  audit_logging: true
  
production:
  auto_reload: false
  validation_level: strict
  approval_required: true
  rollback_automatic: true
  audit_logging: true
  health_checks: true
```

## Risk Analysis

### Technical Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Memory leaks from incomplete cleanup | High | Medium | Comprehensive testing, monitoring |
| Race conditions during reload | Medium | Medium | Atomic operations, proper locking |
| State corruption on reload failure | High | Low | State backup, rollback mechanisms |
| Performance degradation | Medium | Medium | Performance monitoring, optimization |

### Business Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Production instability | High | Low | Environment policies, approval workflows |
| Development productivity loss | Medium | Low | Graceful degradation, manual fallback |
| Security exposure | Medium | Low | Validation pipelines, audit trails |

## Success Metrics

### Development Experience
- **Reload Performance**: < 500ms for context changes, < 2s for core modules
- **Session Preservation**: 99%+ success rate
- **Error Recovery**: < 5s rollback time
- **Developer Satisfaction**: Measured via feedback and adoption

### Production Impact
- **Deployment Success**: 99%+ successful hot reloads
- **Rollback Time**: < 10s when needed
- **Service Availability**: 99.9%+ during updates
- **Audit Compliance**: 100% change tracking

### System Reliability
- **Memory Stability**: No memory leaks over 8-hour sessions
- **Performance Impact**: < 5% overhead during normal operation
- **Error Rate**: < 1% reload failures
- **Recovery Time**: < 30s for any hot reload issues

## Session Handoff

### Completed This Session
- ✅ Architecture analysis and design
- ✅ Comprehensive specification with BDD scenarios
- ✅ Implementation phases with clear deliverables
- ✅ Risk analysis and mitigation strategies
- ✅ Configuration and file structure planning

### Next Session Target
- 🎯 **Phase 1 Implementation**: Context YAML hot reload
- 🎯 **Specific Deliverable**: Working context file watching with validation
- 🎯 **Success Criteria**: Edit context YAML → See change within 500ms

### Implementation Notes for Next Session
1. Start with enhancing existing server-hot.js
2. Add `contexts/**/*.yaml` to watch patterns
3. Implement basic validation pipeline
4. Test with contexts/agents/ceo/context.yaml modifications
5. Ensure session preservation during reload

### Dependencies and Blockers
- **Dependency**: Current MCP server architecture (✅ Complete)
- **Potential Blocker**: Node.js module cache behavior with ES6 imports
- **Mitigation**: Use timestamp-based cache busting (proven pattern)

---

*This specification provides the complete roadmap for implementing comprehensive hot reload capabilities that will transform the FlowMind development experience while maintaining production-grade safety and reliability.*