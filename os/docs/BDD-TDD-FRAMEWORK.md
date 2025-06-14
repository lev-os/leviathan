# BDD/TDD Framework for Go Dual-Binary Architecture
*Behavior-Driven Development & Test-Driven Development Specifications*

## Overview

Complete testing framework covering both go-agent and go-kernal with BDD scenarios, TDD cycles, and comprehensive validation strategies.

**Testing Philosophy**: Test-first development with behavior specification ensuring both semantic intelligence and syscall execution meet user expectations.

---

## BDD Scenario Specifications

### go-kernal Behavior Scenarios

#### File System Operations
```gherkin
Feature: File System Operations
  As a developer using go-kernal
  I want reliable file operations
  So that I can manage project files efficiently

Scenario: Create a new file successfully
  Given the go-kernal is running
  And the path "/tmp/test.txt" does not exist
  When I execute "go-kernal --subsystem=fs --operation=create --path=/tmp/test.txt --content=hello"
  Then the file should be created successfully
  And the file content should be "hello"
  And the operation should complete in less than 1ms

Scenario: Handle permission denied gracefully
  Given the go-kernal is running
  And I do not have write permission to "/root/"
  When I execute "go-kernal --subsystem=fs --operation=create --path=/root/test.txt --content=data"
  Then I should receive a "permission denied" error
  And the error should be retryable=false
  And no file should be created

Scenario: Batch file operations
  Given the go-kernal is running
  When I execute "go-kernal --batch=fs.create:/tmp/file1.txt:content1,fs.create:/tmp/file2.txt:content2"
  Then both files should be created successfully
  And the batch operation should complete in less than 10ms
  And each file should contain the correct content
```

#### Process Management
```gherkin
Feature: Process Management
  As a developer using go-kernal
  I want to control system processes
  So that I can automate development workflows

Scenario: Start a simple process
  Given the go-kernal is running
  When I execute "go-kernal --subsystem=proc --operation=start --cmd=echo --args=hello"
  Then a new process should be started
  And the process should output "hello"
  And the process should exit with code 0
  And the operation should complete in less than 50ms

Scenario: Start a background process
  Given the go-kernal is running
  When I execute "go-kernal --subsystem=proc --operation=background --cmd=sleep --args=10"
  Then a background process should be started
  And the command should return immediately
  And the process should be listed in active processes
  And I should receive a process ID

Scenario: Kill a running process
  Given the go-kernal is running
  And I have started a background process with PID 1234
  When I execute "go-kernal --subsystem=proc --operation=kill --pid=1234"
  Then the process should be terminated
  And the process should no longer be listed in active processes
  And the operation should complete in less than 100ms
```

### go-agent Behavior Scenarios

#### Semantic Workflow Discovery
```gherkin
Feature: Semantic Workflow Discovery
  As a developer using go-agent
  I want to find workflows using natural language
  So that I can quickly discover relevant automation

Scenario: Quick code lookup
  Given the go-agent is running with warm cache
  When I request workflow "1a"
  Then I should receive the workflow immediately
  And the response time should be less than 1ms
  And the workflow should contain valid instructions

Scenario: Semantic intent matching
  Given the go-agent is running
  When I request workflow for "create a React project"
  Then I should receive relevant React setup workflows
  And the similarity score should be above 0.7
  And the response time should be less than 50ms
  And the workflows should include TypeScript configuration

Scenario: Power combo suggestions
  Given the go-agent is running
  When I request combos for "strategic decision making"
  Then I should receive the strategic-decision power combo
  And it should include porter-five-forces, swot-analysis, business-model-canvas
  And each workflow should have effectiveness scores
  And the total response time should be less than 100ms
```

#### Bidirectional LLM Flow
```gherkin
Feature: Bidirectional LLM Flow
  As a system integrating with LLMs
  I want intelligent context switching
  So that I can provide optimized responses for different scenarios

Scenario: Router personality selection
  Given the bidirectional flow system is active
  When the router evaluates intent "user seems frustrated with technical issues"
  Then it should select cortisol-guardian personality
  And the confidence score should be above 0.8
  And constitutional constraints should include stress-reduction

Scenario: Dynamic personality switching
  Given the beta LLM is embodying nfj-visionary personality
  When the router detects "need practical implementation details"
  Then it should switch beta LLM to stp-adapter personality
  And the context should be preserved during the switch
  And the transition should complete in less than 200ms

Scenario: Constitutional validation
  Given a workflow request with destructive operations
  When the constitutional validator processes the request
  Then it should require user confirmation
  And it should log the validation attempt
  And it should preserve user agency
```

### Integration Behavior Scenarios

#### End-to-End Workflow Execution
```gherkin
Feature: Complete Workflow Execution
  As a developer using the integrated system
  I want seamless workflow execution
  So that natural language intents become automated actions

Scenario: React project setup workflow
  Given both go-agent and go-kernal are running
  When I request "Set up a new React TypeScript project with testing"
  Then go-agent should find the appropriate workflow
  And go-kernal should execute the file system operations
  And a complete project structure should be created
  And package.json should include TypeScript and testing dependencies
  And the total workflow should complete in less than 30 seconds

Scenario: Error handling and recovery
  Given both systems are running
  And the target directory has permission issues
  When I request "Create a project in restricted directory"
  Then go-agent should identify the workflow
  And go-kernal should detect the permission error
  And the system should suggest alternative locations
  And no partial state should be left behind

Scenario: Performance optimization workflow
  Given both systems are running
  When I request "Optimize this React application for production"
  Then go-agent should find optimization workflows
  And go-kernal should execute build and analysis tools
  And performance metrics should be generated
  And optimization recommendations should be provided
```

---

## TDD Test Specifications

### go-kernal TDD Cycles

#### Cycle 1: Core File Operations
```go
// Red Phase: Write failing test
func TestCreateFile(t *testing.T) {
    kernel := NewKernel()
    
    err := kernel.FS().Create("/tmp/test.txt", []byte("hello"))
    
    assert.NoError(t, err)
    
    // Verify file exists and has correct content
    content, err := os.ReadFile("/tmp/test.txt")
    assert.NoError(t, err)
    assert.Equal(t, "hello", string(content))
}

// Green Phase: Implement minimal code
func (fs *fileSystem) Create(path string, content []byte) error {
    return os.WriteFile(path, content, 0644)
}

// Refactor Phase: Add error handling and optimization
func (fs *fileSystem) Create(path string, content []byte) error {
    // Validate path
    if path == "" {
        return ErrInvalidPath
    }
    
    // Create directory if needed
    dir := filepath.Dir(path)
    if err := os.MkdirAll(dir, 0755); err != nil {
        return fmt.Errorf("failed to create directory: %w", err)
    }
    
    // Write file atomically
    tempFile := path + ".tmp"
    if err := os.WriteFile(tempFile, content, 0644); err != nil {
        return fmt.Errorf("failed to write temp file: %w", err)
    }
    
    return os.Rename(tempFile, path)
}
```

#### Cycle 2: Process Management
```go
// Red Phase: Write failing test
func TestStartProcess(t *testing.T) {
    kernel := NewKernel()
    
    proc, err := kernel.Proc().Start("echo", []string{"hello"})
    
    assert.NoError(t, err)
    assert.NotNil(t, proc)
    
    // Wait for completion
    err = proc.Wait()
    assert.NoError(t, err)
    
    // Check output
    output, err := proc.Output()
    assert.NoError(t, err)
    assert.Equal(t, "hello\n", string(output))
}

// Green Phase: Basic implementation
func (pm *processManager) Start(cmd string, args []string) (*Process, error) {
    osCmd := exec.Command(cmd, args...)
    return &Process{cmd: osCmd}, osCmd.Start()
}

// Refactor Phase: Add monitoring and resource management
func (pm *processManager) Start(cmd string, args []string) (*Process, error) {
    // Validate command
    if !pm.isAllowed(cmd) {
        return nil, ErrCommandNotAllowed
    }
    
    // Set up command with resource limits
    osCmd := exec.Command(cmd, args...)
    osCmd.SysProcAttr = &syscall.SysProcAttr{
        Setpgid: true, // Create new process group
    }
    
    // Capture output
    stdout, err := osCmd.StdoutPipe()
    if err != nil {
        return nil, err
    }
    
    stderr, err := osCmd.StderrPipe()
    if err != nil {
        return nil, err
    }
    
    proc := &Process{
        cmd:    osCmd,
        stdout: stdout,
        stderr: stderr,
        pid:    0, // Will be set after start
    }
    
    if err := osCmd.Start(); err != nil {
        return nil, err
    }
    
    proc.pid = osCmd.Process.Pid
    
    // Register for monitoring
    pm.registerProcess(proc)
    
    return proc, nil
}
```

#### Cycle 3: Security and Validation
```go
// Red Phase: Security validation test
func TestSecurityPolicyEnforcement(t *testing.T) {
    policy := &SecurityPolicy{
        AllowedPaths: []string{"/tmp/*", "/home/user/*"},
        ForbiddenCommands: []string{"rm", "sudo", "chmod"},
        MaxMemory: 100 * 1024 * 1024, // 100MB
    }
    
    kernel := NewKernelWithPolicy(policy)
    
    // Should succeed - allowed path
    err := kernel.FS().Create("/tmp/allowed.txt", []byte("test"))
    assert.NoError(t, err)
    
    // Should fail - forbidden path
    err = kernel.FS().Create("/etc/passwd", []byte("hack"))
    assert.Error(t, err)
    assert.Contains(t, err.Error(), "path not allowed")
    
    // Should fail - forbidden command
    _, err = kernel.Proc().Start("rm", []string{"-rf", "/"})
    assert.Error(t, err)
    assert.Contains(t, err.Error(), "command not allowed")
}

// Green Phase: Basic policy checking
func (k *Kernel) validateOperation(op Operation) error {
    if !k.policy.AllowPath(op.Path) {
        return ErrPathNotAllowed
    }
    if !k.policy.AllowCommand(op.Command) {
        return ErrCommandNotAllowed
    }
    return nil
}

// Refactor Phase: Comprehensive security framework
func (k *Kernel) validateOperation(op Operation) error {
    // Path validation with glob patterns
    allowed := false
    for _, pattern := range k.policy.AllowedPaths {
        if matched, _ := filepath.Match(pattern, op.Path); matched {
            allowed = true
            break
        }
    }
    if !allowed {
        k.auditLogger.LogViolation("path_denied", op.Path)
        return ErrPathNotAllowed
    }
    
    // Command validation with regex patterns
    for _, forbidden := range k.policy.ForbiddenCommands {
        if matched, _ := regexp.MatchString(forbidden, op.Command); matched {
            k.auditLogger.LogViolation("command_denied", op.Command)
            return ErrCommandNotAllowed
        }
    }
    
    // Resource limit validation
    if op.EstimatedMemory > k.policy.MaxMemory {
        return ErrMemoryLimitExceeded
    }
    
    return nil
}
```

### go-agent TDD Cycles

#### Cycle 1: Semantic Lookup
```go
// Red Phase: Semantic search test
func TestSemanticWorkflowSearch(t *testing.T) {
    agent := NewAgent()
    
    result, err := agent.FindWorkflow("create react project", "full")
    
    assert.NoError(t, err)
    assert.True(t, result.Found)
    assert.GreaterOrEqual(t, result.Similarity, 0.7)
    assert.Contains(t, result.Name, "React")
}

// Green Phase: Basic embedding search
func (a *Agent) FindWorkflow(intent string, mode string) (*WorkflowResult, error) {
    embedding, err := a.computeEmbedding(intent)
    if err != nil {
        return nil, err
    }
    
    best := &WorkflowResult{Found: false}
    bestSimilarity := 0.0
    
    for _, workflow := range a.workflows {
        similarity := a.cosineSimilarity(embedding, workflow.Embedding)
        if similarity > bestSimilarity {
            bestSimilarity = similarity
            best = &WorkflowResult{
                Found: true,
                Code: workflow.Code,
                Name: workflow.Name,
                Similarity: similarity,
            }
        }
    }
    
    return best, nil
}

// Refactor Phase: Optimized caching and ranking
func (a *Agent) FindWorkflow(intent string, mode string) (*WorkflowResult, error) {
    // Check cache first
    if cached, ok := a.cache.Get(intent); ok {
        return cached.(*WorkflowResult), nil
    }
    
    // Quick mode - use pre-computed quick lookup
    if mode == "quick" && len(intent) <= 3 {
        if workflow, ok := a.quickLookup[intent]; ok {
            result := &WorkflowResult{
                Found: true,
                Code: workflow.Code,
                Name: workflow.Name,
                Similarity: 1.0,
            }
            a.cache.Set(intent, result)
            return result, nil
        }
    }
    
    // Full semantic search with optimized ranking
    embedding, err := a.computeEmbedding(intent)
    if err != nil {
        return nil, err
    }
    
    candidates := a.findCandidates(embedding, 10) // Pre-filter top 10
    ranked := a.rankByContext(candidates, intent)
    
    if len(ranked) == 0 || ranked[0].Similarity < 0.5 {
        return &WorkflowResult{Found: false}, nil
    }
    
    result := ranked[0]
    a.cache.Set(intent, result)
    
    return result, nil
}
```

#### Cycle 2: Context Management
```go
// Red Phase: Context switching test
func TestContextSwitching(t *testing.T) {
    agent := NewAgent()
    
    // Load initial context
    err := agent.LoadContext("nfj-visionary")
    assert.NoError(t, err)
    
    current := agent.GetCurrentPersonality()
    assert.Equal(t, "nfj-visionary", current.ID)
    
    // Switch to different context
    err = agent.SwitchPersonality("stp-adapter")
    assert.NoError(t, err)
    
    current = agent.GetCurrentPersonality()
    assert.Equal(t, "stp-adapter", current.ID)
    
    // Verify context is properly loaded
    assert.NotEmpty(t, current.Capabilities)
    assert.NotEmpty(t, current.Constitutional)
}

// Green Phase: Basic context loading
func (a *Agent) LoadContext(contextID string) error {
    context, ok := a.contexts[contextID]
    if !ok {
        return ErrContextNotFound
    }
    
    a.currentContext = context
    return nil
}

// Refactor Phase: Full context assembly and validation
func (a *Agent) LoadContext(contextID string) error {
    // Load base context
    context, ok := a.contexts[contextID]
    if !ok {
        return ErrContextNotFound
    }
    
    // Apply context assembly rules
    assembledContext, err := a.assembler.AssembleContext(context, a.userConstraints)
    if err != nil {
        return fmt.Errorf("context assembly failed: %w", err)
    }
    
    // Validate constitutional compatibility
    if err := a.validator.ValidateConstitutional(assembledContext); err != nil {
        return fmt.Errorf("constitutional validation failed: %w", err)
    }
    
    // Apply context with transition management
    if err := a.transitionToContext(assembledContext); err != nil {
        return fmt.Errorf("context transition failed: %w", err)
    }
    
    a.currentContext = assembledContext
    
    return nil
}
```

---

## Performance Testing Framework

### Load Testing Specifications
```go
func BenchmarkConcurrentSyscalls(b *testing.B) {
    kernel := NewKernel()
    
    b.RunParallel(func(pb *testing.PB) {
        for pb.Next() {
            err := kernel.FS().Create(
                fmt.Sprintf("/tmp/bench_%d.txt", rand.Int()),
                []byte("test data"),
            )
            if err != nil {
                b.Fatalf("syscall failed: %v", err)
            }
        }
    })
}

func BenchmarkSemanticLookupLatency(b *testing.B) {
    agent := NewAgent()
    agent.WarmCache()
    
    intents := []string{
        "create react project",
        "setup development environment",
        "deploy to production",
        "run tests and build",
        "optimize performance",
    }
    
    b.ResetTimer()
    
    for i := 0; i < b.N; i++ {
        intent := intents[i%len(intents)]
        
        start := time.Now()
        result, err := agent.FindWorkflow(intent, "quick")
        latency := time.Since(start)
        
        if err != nil {
            b.Fatalf("lookup failed: %v", err)
        }
        
        if !result.Found {
            b.Fatalf("workflow not found for: %s", intent)
        }
        
        if latency > 50*time.Millisecond {
            b.Fatalf("latency too high: %v", latency)
        }
    }
}
```

### Memory Profiling Tests
```go
func TestMemoryUsage(t *testing.T) {
    var m1, m2 runtime.MemStats
    
    // Baseline measurement
    runtime.GC()
    runtime.ReadMemStats(&m1)
    
    // Run operations
    agent := NewAgent()
    kernel := NewKernel()
    
    for i := 0; i < 1000; i++ {
        workflow, _ := agent.FindWorkflow("test workflow", "quick")
        kernel.FS().Create(fmt.Sprintf("/tmp/test%d.txt", i), []byte("data"))
    }
    
    // Final measurement
    runtime.GC()
    runtime.ReadMemStats(&m2)
    
    memUsed := m2.Alloc - m1.Alloc
    
    // Should use less than 50MB for 1000 operations
    assert.Less(t, memUsed, uint64(50*1024*1024))
}
```

---

## Quality Assurance Framework

### Code Coverage Requirements
- **go-kernal**: >95% coverage for all syscall operations
- **go-agent**: >90% coverage for semantic logic
- **Integration**: >85% coverage for end-to-end scenarios
- **Error Handling**: 100% coverage for all error paths

### Automated Testing Pipeline
```yaml
testing_pipeline:
  unit_tests:
    - go test ./... -v -race -coverprofile=coverage.out
    - go tool cover -html=coverage.out -o coverage.html
    
  integration_tests:
    - go test -tags=integration ./tests/integration/...
    
  performance_tests:
    - go test -bench=. -benchmem ./...
    - go test -cpuprofile=cpu.prof -memprofile=mem.prof
    
  security_tests:
    - gosec ./...
    - nancy sleuth
    - trivy fs .
    
  quality_gates:
    coverage_minimum: 90%
    performance_regression_threshold: 10%
    security_vulnerabilities: 0
    memory_leak_tolerance: 0
```

### Acceptance Criteria
Every feature must pass:
1. **BDD Scenarios**: All Gherkin scenarios pass
2. **TDD Cycles**: All unit tests pass  
3. **Performance Benchmarks**: Meet latency requirements
4. **Security Validation**: No vulnerabilities detected
5. **Memory Efficiency**: No memory leaks or excessive usage
6. **Integration Testing**: End-to-end workflows complete successfully

This comprehensive BDD/TDD framework ensures robust, performant, and secure implementation of the Go dual-binary architecture while maintaining high code quality and user experience standards.