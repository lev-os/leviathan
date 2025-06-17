# Text Expansion Solutions for ~/c Shortcut

Based on research, here are the optimal solutions for both zsh and Claude Code:

## 1. Environment Variable + CDPATH Approach

### Setup in ~/.zshrc:
```bash
# Set up CDPATH for smart directory navigation
export CDPATH=".:~:~/digital/kingly/core/mcp-mvp"

# Context path environment variable
export CONTEXTS_PATH="/Users/jean-patricksmith/digital/kingly/core/mcp-mvp/contexts"

# Smart aliases for common navigation
alias c='cd ~/digital/kingly/core/mcp-mvp/contexts'
alias cx='cd contexts'  # From any project root
alias kc='cd $CONTEXTS_PATH'

# Function for context operations
function ctx() {
  case "$1" in
    "edit"|"e")
      cd $CONTEXTS_PATH && code .
      ;;
    "find"|"f")
      find $CONTEXTS_PATH -name "*.yaml" | grep -i "$2"
      ;;
    "load"|"l")
      node ~/digital/kingly/core/mcp-mvp/src/workflow-loader.js
      ;;
    *)
      cd $CONTEXTS_PATH
      ;;
  esac
}
```

## 2. Claude Code / VS Code Snippets

### Global Snippets (settings.json):
```json
{
  "Context Path Expansion": {
    "prefix": "~/c",
    "body": [
      "/Users/jean-patricksmith/digital/kingly/core/mcp-mvp/contexts"
    ],
    "description": "Expand ~/c to full contexts path"
  },
  "Context File": {
    "prefix": "ctx:",
    "body": [
      "/Users/jean-patricksmith/digital/kingly/core/mcp-mvp/contexts/${1:type}/${2:name}/context.yaml"
    ],
    "description": "Full context file path template"
  },
  "Kingly Project": {
    "prefix": "~/k",
    "body": [
      "/Users/jean-patricksmith/digital/kingly/core/mcp-mvp"
    ],
    "description": "Expand ~/k to kingly project root"
  }
}
```

## 3. Advanced: ZSH Auto-completion

### Add to ~/.zshrc:
```bash
# Context-aware completion for ctx command
function _ctx_complete() {
  local context_types=("agents" "workflows" "patterns" "tools" "themes" "preferences" "types" "instances")
  
  if [[ $CURRENT == 2 ]]; then
    _values 'ctx commands' \
      'edit[Edit contexts in VS Code]' \
      'find[Find context files]' \
      'load[Load contexts]' \
      ${context_types[@]}
  elif [[ $CURRENT == 3 && ${words[2]} != "edit" && ${words[2]} != "load" ]]; then
    # Complete context names for the selected type
    local type_dir="$CONTEXTS_PATH/${words[2]}"
    if [[ -d "$type_dir" ]]; then
      _path_files -W "$type_dir" -/
    fi
  fi
}

compdef _ctx_complete ctx
```

## 4. Environment-Based Project Integration

### .env.local files to create:

#### ~/digital/kingly/core/agent/.env.local:
```bash
CONTEXTS_PATH=/Users/jean-patricksmith/digital/kingly/core/mcp-mvp/contexts
```

#### ~/ceo/.env.local:
```bash
CONTEXTS_PATH=/Users/jean-patricksmith/digital/kingly/core/mcp-mvp/contexts
```

## 5. Modern CLI Integration

### Optional: Install modern tools
```bash
# Fast directory navigation
brew install zoxide

# Then use 'z' for intelligent cd
z contexts  # Will go to contexts directory from anywhere

# Or use 'cd' replacement
alias cd='z'
```

## Implementation Priority

1. **Immediate**: Set up CDPATH + aliases in ~/.zshrc
2. **VS Code**: Add global snippets for path expansion
3. **Environment**: Create .env.local files in target projects
4. **Advanced**: Add zsh completions and modern tools

## Benefits

- **Fast**: `c` command for instant navigation
- **Context-aware**: `ctx` function for common operations
- **Cross-platform**: Works in terminal and Claude Code
- **Minimal tokens**: Snippets expand without AI overhead
- **Future-proof**: Environment variables support project migration

## Testing

```bash
# Test navigation
c  # Should go to contexts directory
ctx edit  # Should open contexts in VS Code
ctx find "agent"  # Should find agent contexts

# Test in Claude Code
# Type "~/c" and it should suggest expansion
# Type "ctx:" and it should provide path template
```

This solution provides the "short and sweet" experience you want while maintaining compatibility across both environments.