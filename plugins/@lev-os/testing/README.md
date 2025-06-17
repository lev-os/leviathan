# @kingly/testing

Universal testing framework for Kingly core packages and community plugins.

## 🎯 Purpose

The `@kingly/testing` package provides comprehensive testing capabilities for the entire Kingly plugin ecosystem, including:

- **Plugin Discovery** - Automatic detection of core and community plugins
- **Validation Testing** - YAML configuration, command routing, and capability validation  
- **Integration Testing** - Cross-plugin compatibility and interaction testing
- **Performance Benchmarking** - Command execution, memory usage, and capability performance
- **Community Support** - Compatibility validation for community plugins

## 📦 Installation

```bash
# Install as dependency
pnpm add @kingly/testing

# Or install globally for CLI usage
pnpm add -g @kingly/testing
```

## 🚀 Quick Start

### Basic Plugin Testing

```javascript
import { KinglyTestingFramework } from '@kingly/testing';

const framework = new KinglyTestingFramework();

// Discover all plugins
const plugins = await framework.discoverPlugins();

// Test specific plugin
const result = await framework.testPlugin('universal-validation');
console.log(`Plugin test: ${result.success ? 'PASSED' : 'FAILED'}`);

// Run integration tests
const integrationResult = await framework.testIntegration();
console.log(`Integration: ${integrationResult.success ? 'PASSED' : 'FAILED'}`);
```

### CLI Usage

```bash
# Discover plugins
kingly test discover

# Test specific plugin
kingly test plugin universal-validation

# Run integration tests
kingly test integration

# Benchmark plugin performance
kingly test benchmark cmd --type execution,memory

# Validate community plugins
kingly test community --repository github.com/user/kingly-plugin

# Generate ecosystem health report
kingly test ecosystem
```

## 🧪 Test Types

### 1. Plugin Validation Tests

**YAML Configuration Validation**
- Valid plugin metadata (name, version, type)
- Proper capabilities definition
- Command syntax and descriptions
- Whisper guidance patterns

**Command Routing Tests**
- Commands route correctly through CLI
- Help text generation
- Syntax recognition
- Error handling

**Capability Tests**
- Declared capabilities function correctly
- Related commands accessible
- Integration with core system

**Smoke Tests**
- Basic commands don't crash
- Essential functionality works
- Quick validation for CI/CD

### 2. Integration Tests

**Plugin Compatibility**
- No command name conflicts
- Capability sharing handled correctly
- Load order independence

**Command Interactions**
- Cross-plugin command coordination
- Help system consistency
- Status reporting integration

**Data Flow**
- Plugin state isolation
- Shared context handling
- Output format compatibility

**Capability Composition**
- Multi-plugin capability usage
- Complementary functionality
- Integrated workflows

### 3. Performance Benchmarks

**Command Execution**
- Average execution times
- Performance regression detection
- Timeout handling

**Memory Usage**
- Memory footprint analysis
- Leak detection
- Resource cleanup validation

**Load Performance**
- Plugin initialization times
- Configuration loading speed
- Dependency resolution

### 4. Community Plugin Validation

**Repository Scanning**
- GitHub plugin discovery
- Local plugin detection
- Configuration validation

**API Compatibility**
- Core API compatibility checks
- Breaking change detection
- Version compatibility

**Convention Compliance**
- Naming conventions
- Directory structure
- YAML configuration standards

## 📊 Success Criteria

### Plugin-Level Criteria
- ✅ All commands route correctly
- ✅ YAML configuration valid
- ✅ Basic smoke tests pass
- ✅ No critical failures

### Ecosystem-Level Criteria
- ✅ No plugin conflicts
- ✅ Integration tests pass
- ✅ Performance within thresholds
- ✅ Community plugins compatible

## 🔧 Configuration

### Plugin Manifest Example

```yaml
# tests/plugin-manifest.yaml
plugins:
  - name: "@kingly/universal-validation"
    path: "../../packages/@kingly/universal-validation"
    test_types: ["command", "capability", "integration"]
  - name: "community/awesome-plugin"
    repository: "github.com/user/awesome-kingly-plugin"
    test_types: ["command", "compatibility"]
```

### Test Configuration

```javascript
const framework = new KinglyTestingFramework();

// Configure test discovery
const plugins = await framework.discoverPlugins({
  type: 'core',           // 'core', 'community', or undefined for all
  path: '/specific/path'  // Filter by path
});

// Configure plugin testing
const result = await framework.testPlugin('plugin-name', {
  suite: ['yaml', 'smoke', 'commands', 'capabilities', 'integration']
});

// Configure integration testing
const integrationResult = await framework.testIntegration({
  type: ['compatibility', 'commands', 'dataflow', 'composition', 'conflicts'],
  plugins: specificPluginList
});

// Configure benchmarking
const benchmarkResult = await framework.benchmarkPlugin('plugin-name', {
  type: ['execution', 'memory', 'capabilities', 'load'],
  iterations: 5
});
```

## 🏗️ Architecture

### Core Components

- **PluginDiscovery** - Finds testable plugins via YAML manifests and repository scanning
- **PluginValidator** - Comprehensive validation for individual plugins
- **IntegrationTester** - Cross-plugin integration and compatibility testing
- **CommunityValidator** - Community plugin compatibility validation
- **PerformanceBenchmark** - Plugin performance monitoring and benchmarking
- **UniversalTestPatterns** - Reusable test patterns extracted from successful implementations

### Test Patterns

The framework uses proven test patterns extracted from the mcp-mvp testing success:

- **Command Routing Pattern** - Validates CLI command integration
- **YAML Validation Pattern** - Ensures configuration correctness
- **Capability Testing Pattern** - Verifies plugin capabilities work
- **Smoke Test Pattern** - Quick validation for basic functionality
- **Success Criteria Pattern** - Standardized evaluation across plugins

## 🌍 Community Plugin Support

### Discovery Methods

1. **Local Scanning** - Scans `community/` directory for plugin.yaml files
2. **GitHub Scanning** - Searches GitHub for repositories with `kingly-plugin` topic
3. **Specific Repository** - Validates individual community plugin repositories

### Validation Process

1. **Configuration Analysis** - Validates plugin.yaml structure and content
2. **API Compatibility** - Tests against current core API
3. **Convention Compliance** - Ensures plugin follows Kingly standards
4. **Breaking Change Detection** - Identifies potential compatibility issues

## 📈 Performance Monitoring

### Metrics Tracked

- **Command Execution Times** - Average, min, max execution times per command
- **Memory Usage** - RSS, heap usage, and memory deltas during operation
- **Capability Performance** - Time to access and use plugin capabilities
- **Load Performance** - Plugin initialization and configuration loading times

### Performance Scoring

- **100 points** - Perfect performance baseline
- **Penalties applied for:**
  - Slow command execution (>1000ms)
  - High memory usage (>50MB delta)
  - Slow capability access (>500ms)
  - Slow loading (>100ms)

### Regression Detection

- Automatic baseline tracking
- Performance regression alerts (>10 point decrease)
- Historical performance comparison
- CI/CD integration ready

## 🔍 Example Usage

### Complete Plugin Ecosystem Test

```javascript
import { KinglyTestingFramework } from '@kingly/testing';

const framework = new KinglyTestingFramework();

// Generate comprehensive ecosystem report
const report = await framework.generateEcosystemReport();

console.log(`Ecosystem Health: ${report.health.overall}`);
console.log(`Total Plugins: ${report.ecosystem.totalPlugins}`);
console.log(`Integration Status: ${report.integration.success ? 'HEALTHY' : 'ISSUES'}`);
console.log(`Community Status: ${report.community.success ? 'COMPATIBLE' : 'CONFLICTS'}`);

// Recommendations for improvements
report.health.recommendations.forEach(rec => {
  console.log(`📋 ${rec}`);
});
```

### CI/CD Integration

```bash
#!/bin/bash
# ci-test-plugins.sh

echo "🧪 Running Kingly Plugin Tests"

# Validate all core plugins
kingly test discover --type=core | while read plugin; do
  echo "Testing: $plugin"
  kingly test plugin "$plugin" || exit 1
done

# Run integration tests
kingly test integration || exit 1

# Generate ecosystem report
kingly test ecosystem > ecosystem-report.json

echo "✅ All plugin tests passed"
```

## 🤝 Contributing

### Adding New Test Patterns

1. Create test pattern in `src/universal-test-patterns.js`
2. Add pattern to `PluginValidator` integration
3. Update pattern documentation
4. Add validation tests

### Supporting New Plugin Types

1. Add plugin type detection in `PluginDiscovery`
2. Create type-specific validation in `PluginValidator`
3. Add integration patterns in `IntegrationTester`
4. Update configuration documentation

## 📚 API Reference

### KinglyTestingFramework

**Methods:**
- `discoverPlugins(options)` - Discover testable plugins
- `testPlugin(name, options)` - Test specific plugin
- `testIntegration(options)` - Run integration tests
- `testCommunity(options)` - Validate community plugins
- `benchmarkPlugin(name, options)` - Benchmark plugin performance
- `generateEcosystemReport()` - Generate comprehensive health report

### UniversalTestPatterns

**Methods:**
- `testCommandRouting(plugin, commands)` - Test command routing
- `testYamlValidation(plugin)` - Validate YAML configuration
- `testCapabilityValidation(plugin)` - Test plugin capabilities
- `testSmokeTest(plugin)` - Run smoke tests
- `evaluateSuccessCriteria(results)` - Evaluate test success

## 🏷️ License

MIT - See LICENSE file for details

---

*Universal testing framework for the Kingly plugin ecosystem - ensuring quality, compatibility, and performance across core and community plugins.*