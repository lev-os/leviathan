# Session Storage - LLM-First Freestyle Architecture

## Philosophy

Sessions are **LLM mental state preservation** - not rigid programmer structures. Each session creates its own needed structure based on the intelligence generated.

## Required Structure

```
tmp/{YYYY-MM-DD-session-name}/
├── readme.yaml              # REQUIRED - LLM restoration intelligence
└── [freestyle folders]      # Created as needed by LLM
```

## Freestyle Guidelines

**Create folders only if needed**:
- `synths/` - If evolving or creating synths
- `insights/` - If breakthrough moments captured  
- `checkpoints/` - If complex timeline needed
- `templates/` - If creating smartdown templates
- `artifacts/` - If significant outputs generated

## Smartdown Protocol (.smart.md)

Inspired by BMAD `[[LLM:]]` pattern, our intelligent markdown format:

```markdown
# Title

[[LLM: This template does X. When using:
1. Fill in the Y sections
2. Remember that Z is critical
3. The goal is to achieve W]]

Regular markdown content here...

## Section
More content with embedded intelligence...
```

## Session Intelligence Format

**readme.yaml** contains everything an LLM needs to restore mental state:
- session_id & semantic_summary
- key breakthroughs & mental models  
- synths created/evolved
- files touched & why
- confidence restoration instructions

## Anti-Patterns

❌ Don't recreate concept folder structure in sessions  
❌ Don't create folders "just in case"  
❌ Don't over-structure - sessions are temporary intelligence  
❌ Don't store persistent ideas here (use ideas/ for that)

Sessions are **mental snapshots**, not **project storage**.