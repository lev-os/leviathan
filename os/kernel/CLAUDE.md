# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Go OS Kernel** project within the Kingly ecosystem—a research and development initiative to create a hybrid C/Go operating system kernel with AI-first design principles. The project aims to balance kernel performance requirements with Go's developer productivity and safety features.

## Architecture

### Revolutionary AI-Native Kernel Design
- **C Foundation**: Performance-critical kernel components (interrupt handling, memory management, scheduling)
- **Go Services**: System services, device drivers, and intelligent configuration management
- **AI Integration**: TinyLlama-driven decision engine for autonomous system management
- **Dynamic Extensions**: AI-generated eBPF programs for real-time optimization
- **Safe Plugins**: WASM-based kernel extensions with capability isolation
- **Target Platform**: ARM-based systems (Raspberry Pi 4/5, development boards)

### World's First AI→Verification→Execution Pipeline
The kernel features a revolutionary extensibility framework:
1. **TinyLlama Code Generation**: AI synthesizes eBPF optimization programs
2. **Multi-Layer Verification**: AI self-review → static analysis → eBPF verifier → runtime monitoring
3. **ARM64 JIT Compilation**: Hardware-optimized native code generation
4. **Zero-Downtime Deployment**: Live kernel adaptation with automatic rollback

### Four-Layer Extensibility Stack
- **Layer 4**: AI Decision Engine (TinyLlama) - autonomous optimization and code generation
- **Layer 3**: Verified Dynamic Extensions (eBPF) - AI-generated performance optimizations
- **Layer 2**: Safe Plugin System (WASM) - portable device drivers and system services
- **Layer 1**: Static Kernel Core (C + Go) - hardware abstraction and extension management

### Memory Management Strategy
- Dual memory domains with static allocation pools for Go kernel components
- DMA-safe memory management for hardware interaction
- Zero-copy buffers for C/Go communication
- Type-safe memory access with compile-time and runtime validation

## Development Status

**Current Phase**: Early research and architecture design
**Implementation Status**: Documentation and design phase (no code implementation yet)
**Risk Assessment**: High-risk R&D project with staged validation approach

### Staged Development Plan
1. **Phase 1** (Months 1-2): Technical feasibility validation - prove Go can run in kernel context
2. **Phase 2** (Months 3-5): Core kernel subsystems - memory management, device drivers, syscalls
3. **Phase 3** (Months 6-8): AI integration - TinyLlama kernel integration and intelligent resource management
4. **Phase 4** (Months 9-12): Ecosystem development - developer tools, application framework, optimization

## Key Technical Challenges

### Go Runtime Modifications Required
- Disable garbage collector for kernel context
- Custom stack management with fixed-size stacks
- Static memory allocation instead of heap management
- Cooperative scheduling model for deterministic behavior
- ARM64-specific optimizations

### Performance Targets (Realistic Post-Validation)
- System call overhead: <200ns (vs Linux baseline)
- Memory allocation: <100ns for pool allocations  
- Interrupt handling: <5μs end-to-end latency
- Boot time: <10 seconds on Raspberry Pi 4
- AI code generation: <100ms per optimization
- eBPF verification: <10ms per program
- Live adaptation: <1 second end-to-end
- Accept 3-5x overhead vs C for non-critical paths

## Critical Insights from Adversarial Analysis

This project underwent systematic adversarial validation that exposed several critical realities:

### Original vs. Validated Approach
- **Timeline Reality**: 2-3 years R&D (not 3 months) to prove basic feasibility
- **Performance Reality**: 3-5x overhead expected (not optimistic 2x)
- **Resource Reality**: $15-25M total investment (not initial $500K estimate)
- **Success Probability**: 60% chance of development hell, 25% technical impossibility

### Risk Mitigation
- Staged validation approach with clear go/no-go criteria
- Hybrid architecture provides fallback if pure Go proves infeasible
- Limited initial investment ($75K) before major commitment

## Project Management Structure

**This CLAUDE.md serves as the master configuration** - it contains core principles, development guidelines, and references to all other documentation.

### File Organization
- **`CLAUDE.md`**: Master configuration (this file) - core principles, Go search, BDD/TDD philosophy
- **`pm/agent.md`**: Agentic development process and guidelines
- **`pm/tracker.csv`**: Current todo list and project tracking
- **`docs/_arch.md`**: Discovery engine architecture documentation  
- **`docs/_mem.md`**: Memory integration and embedding systems
- **`docs/{research|adrs|specs|experiments}/`**: Organized documentation by type

### Documentation Structure

- `docs/architecture/`: Core architectural decisions and design principles
  - `01-hybrid-design-fundamentals.md`: Basic C/Go hybrid architecture
  - `02-memory-management-design.md`: Memory safety and allocation strategies
  - `03-ai-extensibility-framework.md`: **Revolutionary AI-driven extensibility system**
  - `_arch.md`: **Discovery engine architecture (SEAL/JEPA/TELO)**
  - `_mem.md`: **Memory integration with Neo4j/Graphiti**
- `docs/implementation/`: Development phases and implementation strategy
- `docs/validation/`: Adversarial analysis insights and risk assessment
- `docs/research/`: Research materials and technical investigations
- `docs/roadmap/`: Project timeline and milestone planning
- `docs/specs/`: BDD specifications and behavioral requirements
- `docs/experiments/`: Discovery engine experiments and results

## Go Development Guidelines

### Semantic Search for Go Development
When developing Go kernel components, use the semantic search API for language assistance:

```bash
# Start semantic search API (if not running)
cd /Users/jean-patricksmith/digital/leviathan/os/agent && python search_api.py

# Search for Go stdlib functions and patterns
curl -X POST "http://localhost:8000/search" \
  -H "Content-Type: application/json" \
  -d '{"query": "HTTP client server networking", "limit": 5}'

# Example searches for common Go patterns:
curl -X POST "http://localhost:8000/search" \
  -H "Content-Type: application/json" \
  -d '{"query": "error handling patterns", "limit": 3}'

curl -X POST "http://localhost:8000/search" \
  -H "Content-Type: application/json" \
  -d '{"query": "goroutines channels concurrency", "limit": 5}'

curl -X POST "http://localhost:8000/search" \
  -H "Content-Type: application/json" \
  -d '{"query": "JSON parsing encoding", "limit": 3}'
```

**When to Use Semantic Search:**
- Finding Go stdlib functions and packages
- Code pattern discovery  
- API exploration
- Architecture research
- Documentation lookup

**Available Documentation**: 23,541+ indexed Go documentation entries in Qdrant

### BDD/TDD Development Philosophy

**Behavior-Driven Development (BDD) Approach:**
We use BDD to define and implement system behaviors through self-documenting tests.

```go
// Example: Define behavior as a test first
func TestDiscoveryEngine_CanDetectMemoryLeaks(t *testing.T) {
    // Given: A discovery engine with telemetry data showing memory growth
    engine := NewJEPAEngine()
    telemetry := []TelemetrySnapshot{
        {MemoryUsed: 100, Timestamp: time.Now()},
        {MemoryUsed: 150, Timestamp: time.Now().Add(1 * time.Minute)},
        {MemoryUsed: 200, Timestamp: time.Now().Add(2 * time.Minute)},
    }
    
    // When: Engine analyzes the pattern
    problem := Problem{Type: "memory_pattern", Context: telemetry}
    attempt, err := engine.Attempt(context.Background(), problem)
    
    // Then: Engine should detect memory leak pattern
    assert.NoError(t, err)
    assert.Contains(t, attempt.Strategy.Type, "memory_leak")
    assert.True(t, attempt.Strategy.Confidence > 0.7)
}
```

**BDD Guidelines:**
1. **Define behavior first**: Write the test describing what should happen
2. **Use Given/When/Then**: Structure tests as scenarios
3. **Self-documenting intent**: Tests serve as living documentation
4. **Focus on behavior, not implementation**: Test outcomes, not internals
5. **Keep tests readable**: Anyone should understand the intended behavior

**Test-Driven Development (TDD) Cycle:**
1. **Red**: Write a failing test that defines desired behavior
2. **Green**: Write minimal code to make the test pass
3. **Refactor**: Clean up code while keeping tests green

```bash
# Run tests
go test ./...

# Run specific behavior tests
go test -run TestDiscoveryEngine

# Run with verbose output
go test -v ./tests/
```

## Development Commands

### Current Build System
```bash
# Build the kernel system
cd /Users/jean-patricksmith/digital/leviathan/os/kernel/src
go build -o ../leviathan-kernel .

# Run with development flags
go run . --verbose --dry-run

# Test pattern detection
go test ./tests/ -v

# Build specific components
go build ./src/pattern_detector.go
go build ./src/simple_predictor.go
```

### Future build system will include:
- Cross-compilation for ARM64 targets
- Custom Go runtime compilation
- Kernel image generation
- QEMU testing infrastructure

## AI Integration Philosophy

The project embodies "AI-first" design principles:
- Replace traditional configuration files with LLM-driven adaptation
- Predictive resource management based on usage pattern analysis
- Zero-configuration operation through hardware and workload intelligence
- Autonomous system optimization and self-tuning parameters

## Competitive Context

Key alternatives that informed the design:
- **Zephyr RTOS**: Mature, proven real-time OS
- **Rust-based kernels (Redox)**: Actual memory safety without GC overhead
- **eBPF**: Safe kernel programming without kernel modifications
- **WebAssembly System Interface**: Portable, safe system programming

**Revolutionary Differentiation**: Go OS is the **world's first AI-native kernel** with autonomous code generation, verified AI-driven extensions, and zero-downtime adaptation capabilities. No existing OS combines AI code synthesis with verified kernel extensibility.

## Important Warnings

1. **High-Risk Research Project**: This is experimental R&D with significant technical and market risks
2. **No Production Use**: Not intended for production systems—research and educational purposes only
3. **Resource Intensive**: Requires expert systems programming knowledge and significant time investment
4. **Uncertain Feasibility**: Core technical assumptions require validation before proceeding

## AI-First Development Methodology

### The "Hallucinate Greatness, Try It" Workflow
This project follows an AI-first development approach that embraces ambitious theoretical frameworks followed by rapid prototyping and honest validation.

#### Core Process:
1. **Hallucinate Greatness**: Use LLM training to envision 10x breakthrough systems
2. **Try It**: Build working prototypes quickly, aim for 30%+ functionality 
3. **Validate Reality**: Use systematic "devil's advocate" analysis
4. **Iterate Bigger**: Use working foundation for next ambitious leap

#### Why This Works:
- Traditional: Plan → Build → Test (slow, conservative)
- AI-First: Dream → Prototype → Measure → Dream Bigger (fast, breakthrough-oriented)
- 30% working on first ambitious attempt = massive success, not failure

### Mandatory Reality Check Protocol

Before claiming ANY feature works, follow this validation process:

#### Step 1: Build and Test
```bash
# Run the actual system
docker-compose up --build
# Test the specific feature you're claiming
docker logs llm-config-system
# Check if it actually works at http://localhost:4322
```

#### Step 2: Devil's Advocate Analysis
Ask yourself these questions systematically:
- What percentage of this claim is hardcoded vs intelligent?
- If I stress test this, where will it break?
- What would a senior engineer say about these claims?
- Show me the actual working code, not just interfaces
- Is there actual LLM/AI integration running, or just string matching?

#### Step 3: Honest Documentation
Create a feature reality matrix:
```yaml
feature: "AI-native operating system"
claimed_capabilities:
  - "Autonomous decision making"
  - "Self-learning optimization"
  - "Zero-config operation"
  
reality_check:
  autonomous_decisions: "FAIL - hardcoded if/else logic"
  self_learning: "PARTIAL - counter increments only"
  zero_config: "FAIL - requires manual Docker setup"
  
working_percentage: "30%"
actual_working_parts:
  - "Basic Docker containerization"
  - "Telemetry collection"
  - "YAML generation from natural language"
```

#### Step 4: Roadmap to Claims
For each failed validation, provide specific steps:
```yaml
roadmap_to_autonomous_decisions:
  step1: "Add actual LLM integration (Ollama/Claude API)"
  step2: "Implement decision execution pipeline"
  step3: "Prove unsupervised operation for 24 hours"
```

### Case Study: Our "Hype vs Reality" Learning

**What We Claimed**: "AI-native operating system with cognitive parliament and self-evolving BDD patterns"
**What Actually Worked**: Basic containerized system with natural language parsing demos
**Reality Score**: ~30% functional
**Key Learning**: This 30% is actually massive progress using AI-first methodology

**The Pattern We Fell Into**:
- Got excited about impressive-sounding architecture
- Mixed working demos with non-functional claims  
- Used phrases like "AI-native" without actual AI integration
- Built sophisticated string matching and called it "cognitive reasoning"

**How to Avoid This**:
1. Build each component and prove it works with actual tests
2. Use the devil's advocate questions systematically
3. Document gaps honestly before moving forward
4. Celebrate 30% working as success, not failure
5. Be specific about what "AI" means (LLM calls vs hardcoded logic)

### AI Controls OS (Not Assists)

This is a key architectural principle: The LLM IS the operating system's decision engine, not a tool used by the OS.

#### Traditional OS Architecture:
```
Hardware → Kernel → System Calls → Applications
```

#### AI-First OS Architecture:
```
Hardware → LLM Decision Engine → Dynamic Code Generation → Execution
```

**The LLM controls**:
- Memory allocation strategies
- CPU scheduling decisions
- Network optimization approaches
- I/O patterns and caching strategies
- Security policy enforcement

#### Multi-Tier Intelligence Cache:
- **Level 0**: AI-generated compiled code (nanosecond execution)
- **Level 1**: Vector embedding strategy cache (microsecond lookup)
- **Level 2**: LLM trial & error learning (second-scale reasoning)

### Testing Your Claims

When you think something works, prove it with these exact steps:

1. **Start the system**: 
   ```bash
   cd /path/to/kernel
   docker-compose up --build
   ```

2. **Test the specific feature**: 
   ```bash
   # Check logs for actual behavior
   docker logs llm-config-system
   # Visit dashboard to see what's really working
   open http://localhost:4322
   ```

3. **Run devil's advocate analysis**: Use the questions above systematically

4. **Update the reality matrix**: Be honest about what percentage actually works

5. **Create roadmap**: List specific technical steps to achieve full claims

### Anti-Analysis-Paralysis Rules

- ✅ Always start with ambitious theoretical frameworks
- ✅ Build working prototypes rapidly (don't perfect before testing)
- ✅ Measure honestly but celebrate progress (30% = massive success!)
- ❌ Don't over-validate before building (kills innovation velocity)
- ❌ Don't pessimize based on conservative estimates

**Remember**: This methodology got us 30% working functionality on the first ambitious attempt. That's the correct approach for AI-first development. The goal is breakthrough innovation, not incremental improvement.

### Provider Switching for Real AI Integration

When you're ready to add actual LLM integration (not just demos), use this multi-provider approach:

```yaml
# ai_providers.yaml
providers:
  fast_local:
    type: "ollama"
    model: "llama3.2:1b"
    endpoint: "localhost:11434"
    use_for: ["simple_decisions", "pattern_matching"]
    
  smart_cloud:
    type: "claude"
    model: "claude-3-5-sonnet"
    endpoint: "api.anthropic.com"
    use_for: ["novel_problems", "complex_reasoning"]
```

## AI Self-Learning Research Framework

### Revolutionary Theory Testing System
This project includes a breakthrough **self-learning research framework** where AI tests theories by creating self-contained experiments. Each theory becomes a complete folder with YAML definitions, AI-generated scripts, LLM prompts, and execution environments.

**Key Innovation**: AI teaches itself by writing YAML workflows, testing them safely, and evolving successful patterns through embedding-based learning.

### Framework Structure (Following ~/c Model)
```
theories/
├── {theory-name}/
│   ├── context.yaml              # Rich YAML with LLM hints & file links
│   ├── system_prompts/           # LLM instruction files
│   ├── scripts/                 # AI-generated executable code
│   ├── docs/                   # Theory rationale and learning logs
│   └── results/                # Performance data and embeddings
```

### Multi-Tier Intelligence Cache
- **Level 0**: AI-generated compiled code (nanosecond execution)
- **Level 1**: Vector embedding strategy cache (microsecond lookup)
- **Level 2**: LLM trial & error learning (second-scale reasoning)

### Complete Documentation
See `docs/SELF_LEARNING_FRAMEWORK.md` for comprehensive documentation on:
- Theory creation and structure
- AI script generation guidelines
- Embedding-based pattern learning
- Success/failure evolution mechanics
- Integration with multi-provider LLM system

### Example Theory
See `theories/cpu_alert_basic/` for a complete example of:
- Self-contained research experiment
- AI-generated monitoring scripts with WATCH MY SIX validation
- Rich YAML context with file linking
- Comprehensive testing and measurement

## Cross-References

This kernel project is part of the broader Kingly ecosystem. See parent project documentation for:
- Overall Kingly architecture and AI-first principles
- MCP integration and agent system design
- Universal context system and workflow patterns