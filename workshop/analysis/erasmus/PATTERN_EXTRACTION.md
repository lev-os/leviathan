# ERASMUS PATTERN EXTRACTION

## Executive Summary

Erasmus provides a sophisticated IDE auto-injection system with real-time file monitoring, template-based context management, and cross-platform IDE support. The patterns below represent essential architectural components that can be enhanced with Leviathan's fractal memory architecture.

## 1. WATCHDOG FILE MONITORING PATTERNS

### Core Architecture
```python
class FileEventHandler(FileSystemEventHandler):
    """Handles file system events with debouncing."""
    
    def __init__(self, debounce_time: float = 0.1):
        self.debounce_time = debounce_time
        self.last_processed = {}
        
    def _should_process_event(self, event: FileSystemEvent) -> bool:
        """Debouncing logic with duplicate event filtering."""
        current_time = time.time()
        event_key = f"{event.event_type}:{event.src_path}"
        
        if event_key in self.last_processed:
            if current_time - self.last_processed[event_key] < self.debounce_time:
                return False
                
        self.last_processed[event_key] = current_time
        return True
```

### Event Processing Pipeline
```python
def _handle_context_change(self, event: FileSystemEvent) -> None:
    """Handle changes to context files with merge debouncing."""
    if self._matches_rules_file(event.src_path):
        return  # Ignore rules file changes to prevent loops
        
    if self._should_merge_rules():
        _merge_rules_file()  # Template merge operation
```

### Pattern Filtering System
```python
def _matches_ignore_pattern(self, file_path: str) -> bool:
    """Pattern matching for ignore rules."""
    return any(fnmatch.fnmatch(file_path, pattern) for pattern in self.ignore_patterns)

def _matches_rules_file(self, file_path: str) -> bool:
    """IDE rules file detection."""
    rules_patterns = [
        r"\.codex\.md$", r"\.cursorrules$", 
        r"\.windsurfrules$", r"CLAUDE\.md$"
    ]
    return any(re.search(pattern, file_path) for pattern in rules_patterns)
```

### Cross-Platform Implementation
- **Observer Pattern**: Uses watchdog library for cross-platform file watching
- **Recursive Monitoring**: Configurable per-path recursive watching
- **Error Recovery**: Graceful degradation when paths don't exist
- **Context Manager**: `with FileMonitor() as monitor:` pattern for lifecycle management

## 2. TEMPLATE SYSTEM ARCHITECTURE

### Meta-Template Structure
```python
def _merge_rules_file() -> None:
    """Template-based content merging with placeholder replacement."""
    # Step 1: Read context files
    architecture = path_manager.architecture_file.read_text()
    progress = path_manager.progress_file.read_text()
    tasks = path_manager.tasks_file.read_text()
    
    # Step 2: Load protocol content
    protocol = protocol_path.read_text()
    
    # Step 3: Process template
    template = template_path.read_text()
    merged_content = template
    merged_content = merged_content.replace("<!-- Architecture content -->", architecture)
    merged_content = merged_content.replace("<!-- Progress content -->", progress)
    merged_content = merged_content.replace("<!-- Tasks content -->", tasks)
    merged_content = merged_content.replace("<!-- Protocol content -->", protocol)
    
    # Step 4: ASCII sanitization
    sanitized_content = _sanitize_for_ascii(merged_content)
    
    # Step 5: Write to IDE rules file
    rules_file_path.write_text(sanitized_content)
```

### Template Inheritance Patterns
```
.erasmus/templates/
├── meta_rules.md          # Root template with placeholders
├── architecture.md        # Component structure template
├── progress.md           # Status tracking template
├── tasks.md              # Task management template
├── protocol.md           # Behavior protocol template
└── protocols/            # Protocol variations
    ├── developer.md
    ├── researcher.md
    └── reviewer.md
```

### Content Merge Engine
- **Placeholder System**: `<!-- Content Type -->` markers for injection points
- **ASCII Sanitization**: Cross-platform compatibility enforcement
- **Template Hierarchies**: Protocol-specific template variations
- **Real-time Updates**: File change triggers immediate template reprocessing

## 3. CONTEXT FILE STRUCTURE PATTERNS

### Current Erasmus Structure
```
Project Root/
├── .ctx.architecture.md   # Component architecture and principles
├── .ctx.progress.md       # Development status and milestones
├── .ctx.tasks.md          # Current tasks and test specifications
└── .erasmus/
    ├── context/           # Named context storage
    ├── protocol/          # Behavior protocol definitions
    └── templates/         # Template definitions
```

### Enhanced Leviathan Structure (Proposed)
```
Project Root/
├── .ctx.architecture.md   # Core component structure
├── .ctx.progress.md       # Development milestones
├── .ctx.tasks.md          # Current work items
├── drafts/                # Work-in-progress research
├── research/              # Validated research outputs
├── adrs/                  # Architectural decision records
├── specs/                 # BDD/TDD specifications
│   ├── bdd/              # Behavior-driven specs
│   ├── tdd/              # Test-driven specs
│   └── integration/      # Integration test specs
└── .lev/
    ├── memory/           # Local memory persistence
    │   ├── procedural/   # How-to knowledge
    │   ├── semantic/     # Concept relationships
    │   ├── temporal/     # Time-based context
    │   ├── working/      # Active session state
    │   └── episodic/     # Experience memories
    └── templates/        # Template definitions
```

### File Naming Conventions
- **Context Files**: `.ctx.{type}.md` for immediate context
- **Memory Files**: `.lev/memory/{type}/{timestamp}-{context}.md`
- **Research Files**: `research/{domain}/{date}-{topic}.md`
- **Specification Files**: `specs/{type}/{feature}-{scenario}.md`

## 4. IDE INTEGRATION PATTERNS

### IDE Detection and Metadata
```python
class IDEMetadata(NamedTuple):
    """IDE environment configuration."""
    name: str
    rules_file: str
    global_rules_path: Path
    mcp_config_path: Path

class IDE(Enum):
    windsurf = IDEMetadata(
        name="windsurf",
        rules_file=".windsurfrules",
        global_rules_path=Path.home() / ".codeium" / "windsurf" / "memories" / "global_rules.md",
        mcp_config_path=Path.home() / ".codeium" / "windsurf" / "mcp_config.json"
    )
    # ... additional IDE definitions
```

### Rules File Injection Mechanism
```python
def link_rules_file(self) -> bool:
    """Create symbolic link between IDE rules and context files."""
    if not self.rules_file.is_symlink():
        if self.rules_file.exists():
            self.rules_file.unlink()
        self.rules_file.symlink_to(self.context_file)
    return True
```

### Environment Detection and Persistence
```python
def detect_ide_from_env() -> Optional[IDE]:
    """Multi-strategy IDE detection."""
    # Skip detection in remote environments
    if "VSCODE_REMOTE" in os.environ or "REMOTE_CONTAINERS" in os.environ:
        return None
        
    # Environment variable detection
    ide_env = os.environ.get("IDE_ENV")
    if ide_env:
        return IDE[ide_env]
        
    # Interactive prompting with persistence
    return prompt_for_ide()

def _save_ide_to_env_file(ide: IDE) -> None:
    """Persist IDE selection to .env file."""
    env_file = Path.cwd() / ".env"
    # Update or append IDE_ENV setting
```

### Cross-Platform Path Resolution
```python
class PathMngrModel(BaseModel):
    """Centralized path management with IDE-specific resolution."""
    
    def __init__(self, ide: IDE):
        self.ide = ide
        self.root_dir = Path.cwd()
        self.rules_file = Path(self.root_dir / self.ide.metadata.rules_file)
        self.global_rules_file = Path(self.ide.metadata.global_rules_path)
        self.mcp_config_path = self.ide.metadata.mcp_config_path
```

## 5. ERROR HANDLING AND RESILIENCE PATTERNS

### Safe File Operations
```python
def _ensure_directory_exists(self, directory: Path) -> None:
    """Ensure directory exists with error handling."""
    if not directory.exists():
        try:
            directory.mkdir(parents=True, exist_ok=True)
            console.debug(f"Created directory: {directory}")
        except Exception as e:
            console.error(f"Failed to create directory {directory}: {e}")
            raise
```

### Graceful Degradation
```python
def start(self) -> None:
    """Start monitoring with error recovery."""
    for watch_path, recursive in self.watch_paths.items():
        if not os.path.exists(watch_path):
            console.warning(f"Watch path does not exist, creating: {watch_path}")
            os.makedirs(os.path.dirname(watch_path), exist_ok=True)
            Path(watch_path).touch()
            
        try:
            self.observer.schedule(self.event_handler, os.path.dirname(watch_path), recursive)
        except Exception as error:
            console.error(f"Failed to schedule watch for {watch_path}: {error}")
```

### User Feedback and Logging
```python
class RichConsoleLogger(logging.Logger, Console):
    """Unified logging and console output with rich formatting."""
    
    def _configure_from_environment(self) -> None:
        """Environment-based configuration with interactive fallback."""
        self.log_level_str = os.getenv("ERASMUS_LOG_LEVEL", "INFO").upper()
        if not self.log_level_str:
            self.log_level_str = self._interactive_prompt_for_level()
            self._save_log_level_to_env()
```

## 6. LEVIATHAN ENHANCEMENT PATTERNS

### Fractal Memory Architecture Integration

#### Global vs Project Memory Inheritance
```python
class LeviathanPathManager(PathMngrModel):
    """Enhanced path manager with fractal memory integration."""
    
    def __init__(self):
        super().__init__()
        self.global_memory_dir = Path.home() / ".lev" / "memory"
        self.project_memory_dir = self.root_dir / ".lev" / "memory"
        
    def resolve_memory_path(self, memory_type: str, context: str) -> Path:
        """Resolve memory path with inheritance priority."""
        project_path = self.project_memory_dir / memory_type / f"{context}.md"
        global_path = self.global_memory_dir / memory_type / f"{context}.md"
        
        # Project memory takes precedence over global
        return project_path if project_path.exists() else global_path
```

#### 5-Type Memory System Integration
```python
class MemoryType(Enum):
    PROCEDURAL = "procedural"    # How-to knowledge
    SEMANTIC = "semantic"        # Concept relationships  
    TEMPORAL = "temporal"        # Time-based context
    WORKING = "working"          # Active session state
    EPISODIC = "episodic"        # Experience memories

class MemoryAwareFileMonitor(FileMonitor):
    """File monitor with memory system integration."""
    
    def _handle_context_change(self, event: FileSystemEvent) -> None:
        """Enhanced context change handling with memory updates."""
        super()._handle_context_change(event)
        
        # Update memory based on file change
        self._update_memory_from_change(event)
        
    def _update_memory_from_change(self, event: FileSystemEvent) -> None:
        """Update appropriate memory type based on file change."""
        file_path = Path(event.src_path)
        
        if file_path.name.startswith('.ctx.architecture'):
            self._update_semantic_memory(file_path)
        elif file_path.name.startswith('.ctx.progress'):
            self._update_temporal_memory(file_path)
        elif file_path.name.startswith('.ctx.tasks'):
            self._update_working_memory(file_path)
```

#### Bi-Directional Flow Between Files and Memory
```python
class BidirectionalMemorySync:
    """Synchronize file changes with memory system."""
    
    def sync_file_to_memory(self, file_path: Path, content: str) -> None:
        """Update memory when file changes."""
        memory_type = self._infer_memory_type(file_path)
        context_key = self._extract_context_key(file_path, content)
        
        memory_path = self.memory_manager.get_memory_path(memory_type, context_key)
        self._merge_content_to_memory(memory_path, content)
        
    def sync_memory_to_file(self, memory_type: MemoryType, context: str) -> None:
        """Update file when memory changes."""
        memory_content = self.memory_manager.read_memory(memory_type, context)
        target_file = self._determine_target_file(memory_type, context)
        self._merge_memory_to_file(target_file, memory_content)
```

#### Session Continuity and State Management
```python
class SessionAwareContext:
    """Context management with session continuity."""
    
    def __init__(self):
        self.session_id = self._generate_session_id()
        self.session_memory_path = self.memory_dir / "working" / f"session-{self.session_id}.md"
        
    def checkpoint_session(self, context: str) -> None:
        """Create session checkpoint in working memory."""
        checkpoint_data = {
            "timestamp": datetime.now().isoformat(),
            "context": context,
            "active_files": self._get_active_files(),
            "ide_state": self._capture_ide_state()
        }
        self._write_to_working_memory("checkpoint", checkpoint_data)
        
    def restore_session(self, session_id: str) -> bool:
        """Restore session state from working memory."""
        session_path = self.memory_dir / "working" / f"session-{session_id}.md"
        if session_path.exists():
            session_data = self._read_from_working_memory(session_path)
            return self._restore_session_state(session_data)
        return False
```

## IMPLEMENTATION ROADMAP

### Phase 1: Core File Monitoring Enhancement
1. Integrate Erasmus' debounced file watching with Leviathan's MCP system
2. Add memory-aware event processing
3. Implement cross-platform path resolution

### Phase 2: Template System Evolution  
1. Enhance template inheritance with memory integration
2. Add dynamic placeholder resolution from memory
3. Implement bidirectional content synchronization

### Phase 3: Memory Architecture Integration
1. Implement 5-type memory system
2. Add global/project memory inheritance
3. Create session continuity framework

### Phase 4: Advanced IDE Integration
1. Expand IDE detection to include VSCode, JetBrains, etc.
2. Implement MCP-based IDE communication
3. Add real-time context injection

This pattern extraction provides the essential components for building a sophisticated IDE auto-injection system with enhanced context files, leveraging Leviathan's fractal memory architecture for unprecedented developer intelligence and workflow automation.