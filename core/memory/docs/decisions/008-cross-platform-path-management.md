# ADR-008: Cross-Platform Path Management

**Date:** 2025-06-27  
**Status:** Proposed  
**Context:** Universal path handling across macOS, Linux, Windows for IDE integration

## Decision

Implement **centralized cross-platform path management system** that abstracts platform differences for IDE configuration, memory storage, and file operations.

## Problem Statement

Platform compatibility challenges:
- **IDE Path Differences**: Each IDE stores config in different locations per OS
- **Path Separator Issues**: Windows vs Unix path handling
- **Home Directory Variations**: Different home directory structures
- **Permission Differences**: File access permissions vary by platform

## Architecture Decision

### **Platform-Aware Path Manager**

```typescript
interface PlatformPaths {
  // Core directories
  home: string;
  config: string;
  cache: string;
  data: string;
  
  // IDE-specific paths
  ideConfigs: Map<IDEType, IDEPaths>;
}

interface IDEPaths {
  configDir: string;
  rulesFile: string;
  mcpConfig: string;
  globalRules: string;
}

class CrossPlatformPathManager {
  private platform: NodeJS.Platform;
  private paths: PlatformPaths;
  
  constructor() {
    this.platform = process.platform;
    this.paths = this.initializePlatformPaths();
  }
  
  private initializePlatformPaths(): PlatformPaths {
    const home = os.homedir();
    
    switch (this.platform) {
      case 'darwin': // macOS
        return {
          home,
          config: path.join(home, '.config'),
          cache: path.join(home, 'Library', 'Caches'),
          data: path.join(home, 'Library', 'Application Support'),
          ideConfigs: this.getMacOSIDEPaths(home)
        };
        
      case 'win32': // Windows
        return {
          home,
          config: process.env.APPDATA || path.join(home, 'AppData', 'Roaming'),
          cache: process.env.LOCALAPPDATA || path.join(home, 'AppData', 'Local'),
          data: process.env.APPDATA || path.join(home, 'AppData', 'Roaming'),
          ideConfigs: this.getWindowsIDEPaths(home)
        };
        
      default: // Linux and others
        return {
          home,
          config: process.env.XDG_CONFIG_HOME || path.join(home, '.config'),
          cache: process.env.XDG_CACHE_HOME || path.join(home, '.cache'),
          data: process.env.XDG_DATA_HOME || path.join(home, '.local', 'share'),
          ideConfigs: this.getLinuxIDEPaths(home)
        };
    }
  }
}
```

### **IDE-Specific Path Resolution**

```typescript
// Platform-specific IDE configurations
const IDEConfigurations = {
  'claude-code': {
    darwin: {
      configDir: '~/.claude',
      rulesFile: 'CLAUDE.md',
      mcpConfig: '~/.claude/mcp.json',
      globalRules: '~/.claude/CLAUDE.md'
    },
    win32: {
      configDir: '%APPDATA%\\.claude',
      rulesFile: 'CLAUDE.md',
      mcpConfig: '%APPDATA%\\.claude\\mcp.json',
      globalRules: '%APPDATA%\\.claude\\CLAUDE.md'
    },
    linux: {
      configDir: '~/.config/claude',
      rulesFile: 'CLAUDE.md',
      mcpConfig: '~/.config/claude/mcp.json',
      globalRules: '~/.config/claude/CLAUDE.md'
    }
  },
  
  windsurf: {
    darwin: {
      configDir: '~/.codeium/windsurf',
      rulesFile: '.windsurfrules',
      mcpConfig: '~/.codeium/windsurf/mcp_config.json',
      globalRules: '~/.codeium/windsurf/memories/global_rules.md'
    },
    // ... other platforms
  },
  
  cursor: {
    darwin: {
      configDir: '~/Library/Application Support/Cursor',
      rulesFile: '.cursorrules',
      mcpConfig: '~/Library/Application Support/Cursor/mcp.json',
      globalRules: '~/Library/Application Support/Cursor/global_rules.md'
    },
    // ... other platforms
  }
};
```

### **Safe Path Operations**

```typescript
class SafePathOperations {
  static async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true, mode: 0o755 });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw new PathOperationError(`Cannot create directory: ${dirPath}`, error);
      }
    }
  }
  
  static async safeWrite(filePath: string, content: string): Promise<void> {
    const dir = path.dirname(filePath);
    await this.ensureDirectory(dir);
    
    // Atomic write with temp file
    const tempPath = `${filePath}.tmp`;
    await fs.writeFile(tempPath, content, 'utf8');
    await fs.rename(tempPath, filePath);
  }
  
  static resolvePath(inputPath: string): string {
    // Handle ~ expansion
    if (inputPath.startsWith('~')) {
      return path.join(os.homedir(), inputPath.slice(1));
    }
    
    // Handle environment variables
    if (process.platform === 'win32') {
      return inputPath.replace(/%(\w+)%/g, (match, env) => 
        process.env[env] || match
      );
    }
    
    return path.resolve(inputPath);
  }
}
```

### **ASCII Sanitization Pipeline**

```typescript
class ContentSanitizer {
  static sanitizeForIDE(content: string, ide: IDEType): string {
    // Base ASCII sanitization
    let sanitized = content
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^\x00-\x7F]/g, '?');   // Replace non-ASCII
    
    // IDE-specific sanitization
    switch (ide) {
      case 'windsurf':
        // Windsurf has specific character restrictions
        sanitized = sanitized.replace(/[<>:"|?*]/g, '_');
        break;
        
      case 'cursor':
        // Cursor markdown parsing requirements
        sanitized = this.escapeCursorMarkdown(sanitized);
        break;
    }
    
    return sanitized;
  }
  
  private static escapeCursorMarkdown(content: string): string {
    // Escape problematic markdown characters for Cursor
    return content
      .replace(/\*/g, '\\*')
      .replace(/`/g, '\\`')
      .replace(/~/g, '\\~');
  }
}
```

## Implementation Strategy

### **Phase 1: Core Path Management**
- [ ] Implement cross-platform path detection
- [ ] Create safe file operation utilities
- [ ] Add comprehensive testing across platforms
- [ ] Document platform-specific behaviors

### **Phase 2: IDE Integration**
- [ ] Platform-specific IDE path configurations
- [ ] Automatic IDE detection per platform
- [ ] Content sanitization pipelines
- [ ] Error handling and recovery

## Consequences

### **Positive**
- **Universal Compatibility**: Works identically across all platforms
- **Robust File Operations**: Safe, atomic file operations
- **IDE Independence**: Support for IDE-specific path requirements
- **Error Prevention**: Prevents common cross-platform path issues

### **Negative**
- **Implementation Complexity**: Platform-specific code paths
- **Testing Overhead**: Must test on all target platforms
- **Maintenance Burden**: Platform differences may evolve

### **Risk Mitigation**
- **Comprehensive Testing**: Automated testing on macOS, Linux, Windows
- **Graceful Fallbacks**: Default behaviors when platform detection fails
- **Documentation**: Clear platform-specific behavior documentation

## Success Metrics

- **Platform Coverage**: 100% functionality on macOS, Linux, Windows
- **Path Resolution Accuracy**: 99.9% correct path resolution
- **File Operation Safety**: Zero data loss incidents
- **IDE Compatibility**: Support for all major IDEs per platform

## Platform-Specific Considerations

### **macOS**
- Use `~/Library/Application Support` for app data
- Respect sandboxing restrictions
- Handle case-sensitive file systems

### **Windows**
- Use `%APPDATA%` and `%LOCALAPPDATA%`
- Handle path length limitations (260 chars)
- Manage file locking behaviors

### **Linux**
- Follow XDG Base Directory specification
- Handle various home directory structures
- Respect file permissions properly

## References

- XDG Base Directory Specification: https://specifications.freedesktop.org/basedir-spec/
- Node.js Path Module: https://nodejs.org/api/path.html
- Erasmus Path Management: `~/lev/_ref/erasmus/erasmus/utils/paths.py`

---

**Decision Status**: Proposed  
**Review Date**: 2025-07-04