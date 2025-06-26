# Agentic Development Process & Guidelines

## Core Development Philosophy

### LLM-First Methodology
**Always ask "Can an LLM do this?"** before writing traditional code:
1. Use prompts, context, and system patterns instead of rigid frameworks
2. Design for autonomous operation and self-improvement  
3. Enable LLM ↔ System feedback loops (bi-directional communication)
4. Implement confidence-based task routing (80% threshold for task splitting)

### TELO Cycle Development
All development follows the **Trial-Error-Learn-Optimize** pattern:
1. **Trial**: Attempt implementation based on requirements
2. **Error**: Log failures, partial successes, and lessons learned
3. **Learn**: Extract patterns from attempts and document insights
4. **Optimize**: Improve approach for next iteration

## BDD/TDD Process

### Behavior-First Development
1. **Define the behavior**: What should the system do?
2. **Write the test**: Express behavior as Given/When/Then
3. **Implement minimal solution**: Make the test pass
4. **Refactor**: Clean up while keeping tests green

### Example Workflow
```bash
# 1. Define behavior (write failing test)
echo "TestDiscoveryEngine_CanSwapEngines" >> tests/discovery_test.go

# 2. Run test (should fail - RED)
go test ./tests/ -run TestDiscoveryEngine_CanSwapEngines

# 3. Implement minimal solution (GREEN)
# Edit src/discovery_engine.go to make test pass

# 4. Refactor (keep tests GREEN)
# Clean up implementation while tests pass
```

## Project Status Assessment Protocol

### Before Starting Work
1. **Read CLAUDE.md**: Understand current principles and guidelines
2. **Check pm/tracker.csv**: Review current todo items and priorities
3. **Read docs/_arch.md & docs/_mem.md**: Understand architecture decisions
4. **Run tests**: Ensure current system state is known

### During Development
1. **Use semantic search**: Query Go documentation for language patterns
2. **Follow BDD process**: Define behavior → test → implement → refactor
3. **Update tracker**: Mark todos as in_progress/completed
4. **Document decisions**: Add to appropriate docs/ directory

### After Completing Work
1. **Run all tests**: Ensure no regressions
2. **Update documentation**: Keep docs current with implementation
3. **Update tracker**: Mark todos completed, add new discoveries
4. **Commit with semantic messages**: Use conventional commit format

## Discovery Engine Development

### Engine Implementation Pattern
```go
// 1. Define interface behavior with test
func TestNewEngine_ImplementsDiscoveryInterface(t *testing.T) {
    engine := NewSEALEngine()
    
    // Should implement all required methods
    var _ DiscoveryEngine = engine
}

// 2. Implement minimal interface
type SEALEngine struct {
    // minimal fields
}

func (s *SEALEngine) Attempt(ctx Context, problem Problem) (*Attempt, error) {
    // minimal implementation
}

// 3. Add behaviors incrementally with tests
func TestSEALEngine_CanLearnFromFailures(t *testing.T) {
    // Define learning behavior
}
```

### Hot-Swapping Pattern
1. **Interface consistency**: All engines implement DiscoveryEngine
2. **Configuration-driven**: Engine selection via YAML/config
3. **Runtime switching**: Change engines without restart
4. **Metrics tracking**: Measure engine performance over time

## Memory Integration Guidelines

### Graphiti Integration Pattern
1. **Workspace isolation**: Each engine gets separate group_id
2. **High-quality embeddings**: Use Voyage-3-large for research
3. **Temporal awareness**: Store episodes with time context
4. **Cross-engine learning**: Enable shared insights when appropriate

### Embedding Strategy
```go
// 1. Convert events to natural language
description := formatAttemptAsText(attempt)

// 2. Get high-quality embedding
embedding := embeddingService.GetEmbedding(description)

// 3. Store in appropriate workspace
episode := Episode{
    Content:   description,
    Embedding: embedding,
    GroupID:   "discovery-" + engineName,
}
```

## Quality Gates

### Before Merging Code
- [ ] All tests pass (`go test ./...`)
- [ ] BDD scenarios documented
- [ ] Architecture documented in appropriate docs/ file
- [ ] Semantic search used for Go patterns
- [ ] Memory integration follows workspace isolation
- [ ] TELO cycle considerations documented

### Architecture Reviews
- [ ] Discovery engine follows pluggable pattern
- [ ] Memory backend uses Graphiti appropriately  
- [ ] Embedding strategy documented
- [ ] Hot-swapping capabilities preserved
- [ ] Cross-engine learning strategy defined

## Common Patterns

### Error Handling
```go
// Follow Go idiomatic error handling
attempt, err := engine.Attempt(ctx, problem)
if err != nil {
    // Log for learning, don't just return
    engine.LogOutcome(attempt, Outcome{
        Success: false,
        Error:   err,
        Lessons: []string{"Failed at attempt stage"},
    })
    return nil, fmt.Errorf("attempt failed: %w", err)
}
```

### Logging for Learning
```go
// All failures should contribute to learning
func (e *Engine) logFailure(attempt *Attempt, err error) {
    outcome := Outcome{
        Success: false,
        Error:   err,
        Context: attempt.Problem.Context,
        Lessons: e.extractLessons(attempt, err),
    }
    
    // Store in memory for future learning
    e.memory.StoreOutcome(outcome)
}
```

### Configuration Management
```yaml
# Use YAML for engine configuration
engines:
  active: "jepa"  # Current active engine
  
  jepa:
    confidence_threshold: 0.7
    memory_workspace: "discovery-jepa-predictions"
    
  seal:
    learning_rate: 0.1
    memory_workspace: "discovery-seal-attempts"
```

This process ensures consistent, learning-oriented development that aligns with our AI-first principles!