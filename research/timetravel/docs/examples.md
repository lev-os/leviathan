# TimeTravel Examples & Use Cases

## 🎯 Quick Start Examples

### 1. Basic Research
```bash
# Simple research with default settings
timetravel research "quantum computing breakthrough 2024"

# Quick 15-minute scan
timetravel research "AI regulation changes" --depth quick --time 15

# Deep research with specific personalities
timetravel research "blockchain scalability" \
  --depth deep \
  --personalities "sovereignty_architect,systems_thinker" \
  --time 120
```

### 2. Multi-Source Research  
```bash
# Research using specific data sources
timetravel research "sustainable energy storage" \
  --sources "academic,industry,patents" \
  --output json

# Web interface for complex topics
timetravel research "consciousness in AI" --web
```

### 3. Configuration Management
```bash
# Interactive API key setup
timetravel config --setup

# Validate all configured services
timetravel config --validate

# List current configuration
timetravel config --list
```

## 🔬 Research Methodologies

### Three-Tier Deep Research

**Example: "Subquadratic Attention Mechanisms"**

**Tier 1 Results:**
```markdown
## Architecture Revolution Stream
- LoLCATs linearization approach (relevance: 0.92)
- Hyena operators for long sequences (relevance: 0.87)
- State space models evolution (relevance: 0.83)

## World Models Stream  
- Memory-efficient architectures (relevance: 0.79)
- Context window limitations (relevance: 0.76)
- Hardware acceleration implications (relevance: 0.71)

## Reasoning Evolution Stream
- Competitive landscape analysis (relevance: 0.68)
- Patent filings and IP trends (relevance: 0.65)

## Efficiency Innovations Stream
- Cost reduction potential (relevance: 0.94)
- Training efficiency gains (relevance: 0.81)
```

**Tier 2 Dynamic Deep Dives** (Generated from >0.7 relevance findings):
1. LoLCATs implementation details and benchmarks
2. Hyena vs Transformer performance comparison  
3. State space model mathematical foundations
4. Memory-efficient attention patterns
5. Hardware optimization strategies
6. Cost reduction business models

**Tier 3 Strategic Positioning:**
- Competitive advantage: Early adoption of hybrid architectures
- White space: Enterprise deployment tools
- Technical differentiation: Custom hardware optimization
- Implementation: 6-month development timeline

### Personality Synthesis Example

**Topic: "AI Safety Regulations"**

**sovereignty_architect perspective:**
"Regulatory uncertainty threatens AI development independence. Focus on self-governing systems and distributed architectures that minimize regulatory surface area."

**abundance_amplifier perspective:**  
"Regulation creates massive opportunity for compliance tools, safety verification systems, and audit platforms. 10x market potential in safety-tech."

**cortisol_guardian perspective:**
"Identify regulatory risks: liability exposure, compliance costs, development delays. Prepare contingency plans for restrictive scenarios."

**visionary_pioneer perspective:**
"Regulation will drive innovation in interpretable AI, safety verification, and human-AI collaboration. Pioneer next-generation safety paradigms."

## 🌐 Web Interface Examples

### Dashboard Overview
- **Active Research**: Real-time progress indicators
- **Recent Findings**: High-relevance discoveries
- **Quality Metrics**: Research effectiveness scores
- **Usage Statistics**: API calls, costs, time spent

### Research Execution
1. **Topic Input**: Natural language query with suggestions
2. **Configuration**: Depth, duration, personalities, sources
3. **Live Progress**: Tier-by-tier execution with findings
4. **Interactive Results**: Expandable findings, relevance filtering
5. **Export Options**: Multiple formats, sharing capabilities

### Research History
- **Timeline View**: Chronological research progression
- **Topic Clustering**: Related research groupings  
- **Trend Analysis**: Topic evolution over time
- **Quality Tracking**: Research improvement metrics

## 🔧 Advanced Configuration

### Custom Personality Modes
```yaml
# ~/.timetravel/personalities/custom.yaml
custom_analyst:
  name: "Domain Expert"
  focus: "Technical accuracy and implementation details"
  filters:
    - "peer_reviewed_sources"
    - "technical_specifications"
    - "benchmarking_data"
  weight_factors:
    technical_depth: 0.8
    practical_application: 0.7
    novelty: 0.6
```

### Research Templates
```yaml
# ~/.timetravel/templates/competitor_analysis.yaml
name: "Competitor Analysis"
description: "Systematic competitive intelligence research"
config:
  depth: "deep"
  duration: 90
  personalities: 
    - "strategic_commander"
    - "cortisol_guardian"
    - "abundance_amplifier"
  sources: ["industry", "patents", "financial"]
workflow:
  tier_1_focus:
    - "competitive_landscape"
    - "market_positioning" 
    - "technology_differentiation"
    - "financial_performance"
  tier_2_triggers:
    - relevance > 0.75
    - competitive_threat_level > 0.6
  tier_3_validation:
    - "strategic_response_options"
    - "competitive_advantage_assessment"
```

### API Integration Examples

#### JavaScript/Node.js
```javascript
import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: { 'Authorization': `Bearer ${API_TOKEN}` }
});

// Start research
const research = await client.post('/research/execute', {
  topic: 'neural architecture search',
  depth: 'standard',
  personalities: ['visionary_pioneer', 'practical_builder']
});

// Monitor progress  
const status = await client.get(`/research/${research.data.id}`);

// Get results
if (status.data.status === 'completed') {
  const results = status.data.findings;
  console.log(`Found ${results.length} insights`);
}
```

#### Python
```python
import requests
import time

class TimeTravelClient:
    def __init__(self, base_url="http://localhost:3000/api"):
        self.base_url = base_url
        
    def research(self, topic, **kwargs):
        response = requests.post(f"{self.base_url}/research/execute", 
                               json={"topic": topic, **kwargs})
        return response.json()
        
    def wait_for_completion(self, research_id, timeout=3600):
        start_time = time.time()
        while time.time() - start_time < timeout:
            status = requests.get(f"{self.base_url}/research/{research_id}")
            data = status.json()
            if data["status"] in ["completed", "failed"]:
                return data
            time.sleep(10)
        raise TimeoutError("Research timed out")

# Usage
client = TimeTravelClient()
research = client.research("quantum machine learning", depth="deep")
results = client.wait_for_completion(research["id"])
```

## 📊 Output Format Examples

### Structured JSON Output
```json
{
  "id": "research_20250612_143022",
  "topic": "sustainable energy storage",
  "timestamp": "2025-06-12T14:30:22Z",
  "status": "completed",
  "metadata": {
    "executionTime": 3420,
    "toolsUsed": ["WebSearch", "perplexity_ask", "fetch_url"],
    "apiCalls": 47,
    "costEstimate": 2.34,
    "quality": 0.87
  },
  "findings": [
    {
      "id": "finding_001",
      "source": "perplexity_ask",
      "content": "Lithium-ion battery energy density improvements...",
      "relevance": 0.92,
      "tier": 1,
      "url": "https://example.com/battery-research",
      "timestamp": "2025-06-12T14:35:15Z"
    }
  ],
  "synthesis": "# Research Synthesis\n\n## sovereignty_architect\nFrom a independence perspective..."
}
```

### HTML Report
```html
<!DOCTYPE html>
<html>
<head>
    <title>Research Report: Sustainable Energy Storage</title>
    <link rel="stylesheet" href="report.css">
</head>
<body>
    <header>
        <h1>Sustainable Energy Storage</h1>
        <div class="metadata">
            <span class="quality">Quality: 87%</span>
            <span class="duration">Duration: 57m</span>
        </div>
    </header>
    
    <section class="executive-summary">
        <h2>Executive Summary</h2>
        <p>Key breakthrough in solid-state battery technology...</p>
    </section>
    
    <section class="findings">
        <h2>Key Findings</h2>
        <div class="finding high-relevance">
            <h3>Tier 1: Architecture Revolution</h3>
            <p class="content">Lithium-ion density improvements...</p>
            <span class="relevance">92%</span>
        </div>
    </section>
</body>
</html>
```

## 🎛️ CLI Workflow Examples

### Research Pipeline
```bash
#!/bin/bash
# research_pipeline.sh

TOPIC="$1"
OUTPUT_DIR="./research_outputs"

echo "🔬 Starting research pipeline for: $TOPIC"

# Quick scan first
timetravel research "$TOPIC" \
  --depth quick \
  --time 15 \
  --output json > "$OUTPUT_DIR/quick_scan.json"

# Analyze quick scan results
RELEVANCE=$(jq '.metadata.quality' "$OUTPUT_DIR/quick_scan.json")

if (( $(echo "$RELEVANCE > 0.7" | bc -l) )); then
  echo "✅ High relevance detected, proceeding with deep research"
  
  # Deep research with all personalities
  timetravel research "$TOPIC" \
    --depth deep \
    --time 120 \
    --personalities "sovereignty_architect,abundance_amplifier,visionary_pioneer,cortisol_guardian" \
    --output markdown > "$OUTPUT_DIR/deep_research.md"
    
  echo "🎯 Research complete: $OUTPUT_DIR/deep_research.md"
else
  echo "⚠️ Low relevance ($RELEVANCE), skipping deep research"
fi
```

### Batch Research
```bash
#!/bin/bash
# batch_research.sh

TOPICS=(
  "quantum error correction"
  "neuromorphic computing"
  "photonic neural networks"
  "DNA data storage"
)

for topic in "${TOPICS[@]}"; do
  echo "📊 Researching: $topic"
  timetravel research "$topic" \
    --depth standard \
    --time 60 \
    --output json > "research_${topic// /_}.json"
  
  # Wait between requests to respect rate limits
  sleep 30
done

echo "✅ Batch research complete"
```

This provides comprehensive examples covering CLI usage, API integration, output formats, and automation workflows.