# Lazy Loading Command Architecture

## Problem with Current Approach
```
/idea new my-concept
├── Creates 5+ directories immediately
├── Generates multiple empty files
├── Assumes structure before knowing needs
└── Wastes time on filesystem operations
```

## Lazy Loading Solution
```
/idea new my-concept
└── ideas/my-concept/readme.yaml  # ONLY THIS
```

## Benefits

### 1. Speed
- Single file creation vs multiple directories
- No wasted filesystem operations
- Instant concept initialization

### 2. Flexibility
- Structure emerges from actual use
- No assumptions about what's needed
- User-driven directory creation

### 3. Clarity
- Clear intent from user commands
- No confusion about pre-created dirs
- Matches actual workflow patterns

## Intent-Based File Creation

| User Says | Creates |
|-----------|---------|
| "new idea" | `ideas/{slug}/readme.yaml` |
| "research this" | `ideas/{slug}/research-{date}.md` |
| "create poc" | `ideas/{slug}/pocs/{name}/` |
| "add specs" | `ideas/{slug}/specs/` |
| "document architecture" | `ideas/{slug}/architecture.md` |

## Core Principle
**"Don't create it until you need it"**

- Files have content before they exist
- Directories have purpose before creation
- Structure reflects actual work done
- No empty scaffolding to confuse