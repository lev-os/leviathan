# Screenpipe Deep Dive Analysis Framework

## Performance Optimization Nugget

**Proper Engineering Method for Performance Tuning:**
1. **Define performance targets** (CPU %, memory, latency)
2. **Baseline current performance** 
3. **Systematically degrade settings** (FPS, quality, features)
4. **Measure until targets are NOT met**
5. **Back off one step** = optimal configuration

*Not: speculation like "this would be 90% less CPU" without measurement*

## Deep Dive Analysis: User Activity Reconstruction

### What Screenpipe Actually Captures (2 days running)
- **808 video files** = 1.7GB of screen recordings
- **15,681 OCR records** = Every screen change captured
- **114 audio transcriptions** = Voice + system audio
- **580MB database** = All indexed content

### Most Active Apps Captured
1. **iTerm** (3,968 captures) - Terminal work
2. **Cursor** (3,747 captures) - Coding sessions  
3. **Discord** (448 captures) - @Max conversations
4. Recent audio: "Fork, fork", "All right, I have this ID", "I know I'll put it down"

### Analysis Framework for User Activity Reconstruction

#### Data Sources
1. **OCR text captures** - What was on screen
2. **App/window transitions** - Context switching patterns
3. **Audio transcriptions** - Speech and system audio
4. **Timestamps** - Sequence and duration

#### Analysis Structure
1. **Timeline reconstruction** (chronological activity flow)
2. **Context switching patterns** (workflow across apps)
3. **Focus periods** (sustained work blocks)
4. **Decision points** (direction changes)
5. **Productivity insights** (accomplishments)

#### Query Strategy
```sql
-- Get last hour activity blocks
SELECT 
  datetime(timestamp) as time,
  app_name,
  window_name,
  COUNT(*) as frame_count
FROM frames 
WHERE timestamp > datetime('now', '-1 hour')
  AND app_name IS NOT NULL
GROUP BY app_name, window_name, strftime('%Y-%m-%d %H:%M', timestamp)
ORDER BY timestamp DESC;

-- Correlate with audio
SELECT 
  transcription,
  timestamp
FROM audio_transcriptions 
WHERE timestamp > datetime('now', '-1 hour')
ORDER BY timestamp DESC;

-- Get OCR content for context
SELECT 
  f.timestamp,
  f.app_name,
  f.window_name,
  o.text
FROM frames f
JOIN ocr_text o ON f.id = o.frame_id
WHERE f.timestamp > datetime('now', '-1 hour')
ORDER BY f.timestamp DESC;
```

### Optimization Observations

#### Current Screenpipe Issues
- **Recording full video** (H.264 encoding = CPU heavy)
- **0.5 FPS still generates 808 files** in 2 days
- **1.7GB storage** for screen understanding

#### Max Requirements (Lighter Alternative)
- **OCR text only** (no video storage)
- **App/window metadata** (context tracking)
- **Audio transcripts** (conversation understanding)
- **Event-driven capture** (only on changes)

#### Potential Optimization Settings
```bash
screenpipe \
  --fps 0.1 \                    # Ultra low: 1 frame per 10 seconds
  --disable-telemetry \
  --vad-sensitivity low \        # Less sensitive audio detection
  --ignored-windows "Spotify" \  # Skip media apps
  --video-chunk-duration 300     # 5-minute chunks
```

### Implementation for Max

#### What Max Actually Needs
1. **Screen understanding** - OCR text extraction
2. **Context awareness** - App/window state tracking
3. **Conversation memory** - Audio transcription
4. **Timeline continuity** - When things happened

#### Lightweight Alternative Architecture
- **Event-driven screenshots** (only on app/window changes)
- **OCR extraction without video storage**
- **Audio transcription** (keep this feature)
- **SQLite for searchable timeline**
- **Result: ~50MB vs 1.7GB** (95% reduction)

### Performance Engineering Methodology

Instead of guessing optimization impact:
1. **Baseline measurement** of current CPU/memory usage
2. **Define acceptable targets** (e.g., <10% CPU, <500MB RAM)
3. **Systematic degradation testing**:
   - Test FPS: 0.5 → 0.2 → 0.1 → event-driven
   - Test features: full → OCR-only → selective
   - Test quality: high → medium → low
4. **Measure at each step** until targets are missed
5. **Optimal = last configuration that met targets**

This approach ensures we build exactly what Max needs without over-engineering or under-delivering.