# Media Forge - LLM-First Media System

Lev plugin that integrates with existing `homie/yt` automation system for intelligent media downloading and organization.

## Philosophy: LLM-First Architecture

- **Tool does work** - Plugin handles downloads, file operations, metadata extraction
- **LLM does thinking** - All intelligence, classification, and organization decisions made by calling LLM
- **Bi-directional flow** - "job done" signals trigger LLM analysis and follow-up actions

## Integration with Existing System

This plugin wraps the comprehensive `homie/yt` system:
- Uses existing `yt.py` for downloads
- Leverages `auto_manager.py` for queue management  
- Utilizes `transcribe.py` for transcript extraction
- Maintains existing rate limiting and error handling

## Job Types

### media_download
Downloads videos/playlists and extracts metadata for LLM analysis.

```bash
lev post-job --instructions "download this YouTube playlist" --type "media_download" --minutes 20
```

### media_organize  
Executes LLM-generated organization plans.

```bash
# LLM creates organization plan, plugin executes it
lev media organize /path/to/files --plan llm_generated_plan.json
```

### media_transcribe
Extracts transcripts for LLM content analysis.

### media_analyze
Prepares content data for LLM analysis and classification.

## Workflow Example

```bash
# 1. User posts natural language job
lev post-job --instructions "download programming tutorials playlist and organize by language" --type "media_download" --minutes 30

# 2. Tab accepts job
lev accept-job job-media-abc123

# 3. Plugin downloads content
# → Uses existing homie/yt system
# → Extracts metadata
# → Reports "job done" with structured data

# 4. LLM analyzes content
# → Classifies by programming language
# → Creates organization plan
# → Posts follow-up organization job

# 5. Organization job executed
# → Plugin moves files according to LLM plan
# → Reports completion

# 6. System can proactively suggest next actions
# → "Found React tutorials, download related content?"
```

## Plugin Structure

```
media-forge/
├── config/
│   └── plugin.yaml           # Lev plugin configuration
├── media_executor.py         # Core execution wrapper
├── job_handlers/             # Specific job type handlers
├── README.md                 # This file
└── tests/                    # Plugin tests
```

## Benefits

1. **Zero Redundancy** - Uses proven `homie/yt` automation
2. **LLM-First** - All intelligence handled by calling LLM
3. **Job Integration** - Seamless with Lev's job orchestration
4. **Bi-Directional** - System can proactively manage media library
5. **Multi-Tab** - Complex operations coordinated across tabs

## Usage

### Direct Commands
```bash
# Simple download
lev media download "https://youtube.com/watch?v=VIDEO_ID"

# Organize existing folder
lev media organize ~/Downloads/videos
```

### Job-Based Workflow
```bash
# Post complex job
lev media job "download coding bootcamp playlist and organize by technology stack"

# System breaks down into:
# - Download job (15 min)
# - Transcription job (10 min)  
# - Analysis job (5 min)
# - Organization job (5 min)
```

### Natural Language Interface
```bash
# Lev's CEO system handles natural language
lev "download this playlist and organize by topics"
# → System analyzes request
# → Creates appropriate media jobs
# → Coordinates execution
```

This plugin transforms media management from manual work into an intelligent, LLM-driven system that learns and improves over time.