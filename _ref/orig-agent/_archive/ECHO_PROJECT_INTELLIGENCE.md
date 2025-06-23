# Echo: Autonomous Project Intelligence System

> "Your project's second brain. Autonomous. Always in sync."

## Overview

Echo is an autonomous project intelligence system that scans digital workspaces, extracts structured context from documentation and codebases, and provides comprehensive project status insights. It serves as a centralized intelligence hub for understanding project health, progress, and classification.

## Core Concepts

### 1. Dual-Mode Analysis

Echo operates in two complementary modes:

- **Analyst Mode** 🎯: Focuses on business goals and requirements
  - Extracts content from PRDs, epics, and project briefs
  - Aligns with PM/PO perspectives
  - Generates business-level summaries

- **Architect Mode** 🏗️: Focuses on technical implementation
  - Analyzes codebase structure
  - Tracks implementation progress
  - Provides technical component assessment

### 2. Project Classification System

Projects are classified into two types:

#### AGENT_READY Projects
Requirements:
1. Has `prd.md` OR `project-brief.md` in project root
2. Has at least one `epic*.md` file (root or docs/)
3. Has `docs/agents/` directory with at least one `.md` file

#### CUSTOM Projects
- Any project not meeting all three AGENT_READY criteria
- Can be bootstrapped to agent-ready status

### 3. Project Stage Detection

Echo uses hierarchical evaluation to determine project stage:

```
INITIALIZING → Default state, no documentation
     ↓
CONCEPT → Has project-brief.md, no PRD, no epics
     ↓
PLANNING → Has PRD + <3 epics + <10% code activity
     ↓
ACTIVE_DEVELOPMENT → Has PRD + ≥3 epics + ≥10% code activity
```

Code activity is measured by:
- Content hash changes
- Timestamps within 7 days
- Percentage of code files with changes

### 4. Intelligence Extraction

**Scanning Process:**
1. Recursive directory traversal
2. Identify markdown files (`.md`)
3. Identify code files by extension
4. Extract metadata (path, hash, timestamps)
5. Store in centralized database

**Document Parsing:**
1. Priority: `prd.md` → `project-brief.md`
2. Extract first H1/H2 as project name
3. Store summaries and relationships
4. Track file modifications

## Implementation Architecture

### Technology Stack
- **Go**: Fast file scanning and CLI
- **Python**: NLP and content analysis
- **TypeScript**: Web interface and orchestration
- **SQLite**: Local intelligence storage
- **Prisma**: Type-safe database access

### Database Schema
```sql
-- Core tables
Projects (id, name, path, classification, stage)
ProjectFiles (id, project_id, path, type, hash, last_modified)
ProjectIntelligence (id, project_id, summary_text, extracted_at)

-- Enums
ClassificationType: AGENT_READY | CUSTOM
ProjectStage: INITIALIZING | CONCEPT | PLANNING | ACTIVE_DEVELOPMENT
```

### CLI Commands
```bash
echo init              # Initialize Echo in workspace
echo scan [path]       # Scan projects in directory
echo summarize [id]    # Generate project summary
echo config            # Manage configuration
```

## Project Analysis Outputs

### 1. Project Summary
```json
{
  "project_name": "MyApp",
  "classification": "AGENT_READY",
  "stage": "ACTIVE_DEVELOPMENT",
  "tech_stack": ["typescript", "react", "postgres"],
  "last_activity": "2024-01-15",
  "health_status": "active",
  "file_counts": {
    "markdown": 15,
    "code": 127,
    "total": 142
  }
}
```

### 2. Workspace Intelligence Report
- Total projects scanned
- Classification breakdown
- Stage distribution
- Dead project identification (>30 days inactive)
- Tech stack summary
- Agent-ready conversion opportunities

## Configuration

`.echo/config.json`:
```json
{
  "database": {
    "path": ".echo/db/echo.sqlite"
  },
  "logging": {
    "level": "info",
    "path": ".echo/logs/echo.log"
  },
  "scanning": {
    "codeFileExtensions": [".js", ".ts", ".py", ".go", ".rs"],
    "excludePaths": ["node_modules", ".git", "dist", "build"]
  }
}
```

## Use Cases

1. **Project Health Monitoring**: Identify inactive or abandoned projects
2. **Documentation Compliance**: Ensure projects meet agent-ready standards
3. **Progress Tracking**: Compare documented plans vs implementation
4. **Tech Stack Analysis**: Understand technology distribution
5. **Automated Reporting**: Generate status updates for stakeholders

## Future Enhancements

- Git integration for deeper activity analysis
- NLP-powered Q&A over project context
- Automated project bootstrapping
- Web dashboard with visualizations
- Slack/Discord integration for notifications
- Multi-workspace federation

## Integration with Kingly OS

Echo serves as the project intelligence layer for the Kingly ecosystem:
- Provides context for AI agents
- Enables automated project management
- Facilitates cross-project insights
- Supports compound intelligence capabilities

---

*Echo: Making project intelligence autonomous, centralized, and always in sync.*