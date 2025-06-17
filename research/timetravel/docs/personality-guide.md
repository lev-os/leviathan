# Personality Mode Customization Guide

## 🧠 Overview

TimeTravel's personality system allows you to create custom analytical perspectives that filter and interpret research findings through specific lenses. Each personality applies unique filters, weights, and prompts to extract insights tailored to different needs.

## 🎭 Core Personality Modes

### 1. Sovereignty Architect
- **Focus**: Independence, self-reliance, autonomous systems
- **Filters**: Decentralization, autonomy, self-governance
- **Use Case**: Building independent capabilities and reducing dependencies

### 2. Abundance Amplifier  
- **Focus**: 10x opportunities, exponential growth, leverage
- **Filters**: Scale potential, exponential indicators, massive markets
- **Use Case**: Identifying breakthrough opportunities and growth potential

### 3. Cortisol Guardian
- **Focus**: Risk assessment, threat identification, failure modes
- **Filters**: Risk indicators, security concerns, regulatory issues
- **Use Case**: Comprehensive risk analysis and threat mitigation

### 4. Visionary Pioneer
- **Focus**: Paradigm shifts, future trends, breakthrough thinking
- **Filters**: Novelty, paradigm changes, visionary concepts
- **Use Case**: Long-term strategic positioning and trend identification

### 5. Strategic Commander
- **Focus**: Competitive positioning, strategic advantage, market dynamics
- **Filters**: Competitive intelligence, strategic positioning, market data
- **Use Case**: Competitive analysis and strategic planning

### 6. Empathetic Connector
- **Focus**: User impact, adoption factors, human-centered design
- **Filters**: User experience, adoption patterns, human factors
- **Use Case**: Understanding user needs and adoption strategies

### 7. Practical Builder
- **Focus**: Implementation requirements, feasibility, execution
- **Filters**: Implementation details, technical feasibility, practical constraints
- **Use Case**: Turning insights into actionable implementation plans

### 8. Systems Thinker
- **Focus**: Interconnections, emergent properties, holistic view
- **Filters**: System dynamics, interconnections, emergent patterns
- **Use Case**: Understanding complex system interactions and implications

## 🛠️ Creating Custom Personalities

### CLI Creation
```bash
# Create new personality interactively
timetravel personality --create

# List all personalities
timetravel personality --list

# Edit existing personality
timetravel personality --edit innovation_hunter

# Test personality on sample data
timetravel personality --test innovation_hunter
```

### Configuration Structure
```yaml
id: "personality_id"
name: "Display Name"
description: "What this personality focuses on"
focus:
  - "key_concept_1"
  - "key_concept_2"
  - "key_concept_3"

filters:
  - type: "content"           # content|source|relevance|temporal|quality
    condition: "contains"     # contains|excludes|equals|greater_than|less_than
    value: "keyword_pattern"  # search pattern or threshold value
    weight: 0.8              # importance weight (0-1)

prompts:
  analysis: "Detailed analysis prompt template"
  synthesis: "Synthesis prompt for combining findings"
  critique: "Critical evaluation prompt"
  recommendation: "Action-oriented recommendation prompt"

weights:
  technical_depth: 0.8
  practical_application: 0.9
  novelty: 0.7
  risk_assessment: 0.6
  opportunity_identification: 0.8
  implementation_feasibility: 0.9
  competitive_advantage: 0.7
  user_impact: 0.6

examples:
  - "Example of what this personality identifies"
  - "Another relevant example"

enabled: true
custom: true
```

## 🎯 Filter Types and Conditions

### Filter Types
- **content**: Matches text within findings
- **source**: Filters by data source (WebSearch, Perplexity, etc.)
- **relevance**: Filters by relevance score threshold
- **temporal**: Filters by time-based criteria
- **quality**: Filters by quality metrics

### Filter Conditions
- **contains**: Text contains pattern (supports regex)
- **excludes**: Text does not contain pattern
- **equals**: Exact match
- **greater_than**: Numeric value greater than threshold
- **less_than**: Numeric value less than threshold

### Filter Examples
```yaml
# Technology focus filter
- type: "content"
  condition: "contains"
  value: "AI|machine learning|neural network|deep learning"
  weight: 0.9

# High relevance only
- type: "relevance"
  condition: "greater_than"
  value: 0.75
  weight: 0.8

# Exclude press releases
- type: "source"
  condition: "excludes"
  value: "press_release"
  weight: 0.6

# Recent findings only
- type: "temporal"
  condition: "greater_than"
  value: "2024-01-01"
  weight: 0.5
```

## ⚖️ Weight Configuration

Personality weights determine how different aspects of findings are prioritized:

### Weight Categories
- **technical_depth**: Emphasis on technical detail and accuracy
- **practical_application**: Focus on real-world implementation
- **novelty**: Preference for new and innovative ideas
- **risk_assessment**: Attention to risks and potential problems
- **opportunity_identification**: Focus on opportunities and potential
- **implementation_feasibility**: Emphasis on practical execution
- **competitive_advantage**: Attention to competitive implications
- **user_impact**: Focus on end-user effects and adoption

### Weight Values
- **1.0**: Maximum emphasis (most important)
- **0.8-0.9**: High importance
- **0.6-0.7**: Moderate importance  
- **0.4-0.5**: Low importance
- **0.0-0.3**: Minimal emphasis

## 📝 Prompt Templates

### Analysis Prompt
Used for initial analysis of individual findings:
```
You are a [PERSONALITY_NAME] - an expert in [EXPERTISE_AREA].

Analyze the following research findings from the perspective of [PERSPECTIVE]:

Key Questions:
- [Question 1 specific to personality]
- [Question 2 specific to personality]
- [Question 3 specific to personality]

Focus on [FOCUS_AREAS].

Research Findings:
{findings}

Provide analysis emphasizing [EMPHASIS_AREAS].
```

### Synthesis Prompt
Used for combining multiple findings into coherent insights:
```
As a [PERSONALITY_NAME], synthesize these findings for [PURPOSE]:

1. **Category 1**: [What to identify in this category]
2. **Category 2**: [What to identify in this category]
3. **Category 3**: [What to identify in this category]

Findings to synthesize:
{findings}

Create a [PERSONALITY]-focused strategic summary.
```

### Available Variables
- `{findings}`: Formatted research findings
- `{topic}`: Original research topic
- `{context}`: Additional context information
- `{personality}`: Personality name/ID

## 🌐 Web Interface Usage

### Personality Manager
1. **Navigate** to Settings → Personalities
2. **View** all available personalities (core + custom)
3. **Create** new personalities with the visual editor
4. **Edit** existing personalities
5. **Test** personalities with sample data
6. **Import/Export** personality configurations

### Visual Customization
- **Drag-and-drop** weight sliders
- **Real-time preview** of filter effects
- **Template library** for common personality types
- **Validation** to ensure configuration correctness

### Integration with Research
- **Select personalities** during research setup
- **Preview** how personalities will filter content
- **Compare** results across different personalities
- **Save** successful personality combinations

## 🔧 Advanced Customization

### Dynamic Filters
Create filters that adapt based on research context:
```yaml
- type: "content"
  condition: "contains"
  value: "{{topic}}_related_keywords"
  weight: 0.8
  dynamic: true
```

### Conditional Weights
Adjust weights based on research phase:
```yaml
weights:
  tier_1:
    technical_depth: 0.6
    novelty: 0.9
  tier_2:
    technical_depth: 0.9
    practical_application: 0.8
  tier_3:
    implementation_feasibility: 1.0
    competitive_advantage: 0.9
```

### Personality Combinations
Combine multiple personalities for comprehensive analysis:
```bash
timetravel research "quantum computing" \
  --personalities "sovereignty_architect,abundance_amplifier,cortisol_guardian" \
  --synthesis-mode "balanced"
```

## 🧪 Testing and Validation

### Test Your Personality
```bash
# Test with sample data
timetravel personality --test my_custom_personality

# Validate configuration
timetravel personality --validate my_custom_personality

# Compare against core personalities
timetravel personality --compare my_custom_personality,sovereignty_architect
```

### Quality Metrics
- **Filter Effectiveness**: How well filters identify relevant content
- **Analysis Depth**: Quality of personality-specific insights
- **Actionability**: Usefulness of recommendations
- **Uniqueness**: Differentiation from other personalities

## 📚 Example Custom Personalities

### Innovation Hunter
Focus: Breakthrough technologies and disruptive innovations
```yaml
focus: ["breakthrough_technology", "disruptive_innovation", "paradigm_shifts"]
key_filters: ["innovation", "breakthrough", "revolutionary"]
weights: { novelty: 1.0, technical_depth: 0.9, opportunity_identification: 0.9 }
```

### Market Validator
Focus: Market viability and commercial potential
```yaml
focus: ["market_validation", "commercial_viability", "customer_demand"]
key_filters: ["market", "customer", "demand", "revenue"]
weights: { practical_application: 1.0, user_impact: 0.9, implementation_feasibility: 0.8 }
```

### Technical Archaeologist
Focus: Understanding technical foundations and historical context
```yaml
focus: ["technical_foundations", "historical_context", "evolution"]
key_filters: ["history", "evolution", "foundation", "development"]
weights: { technical_depth: 1.0, novelty: 0.3, practical_application: 0.6 }
```

## 🚀 Best Practices

### Personality Design
1. **Clear Focus**: Each personality should have a distinct analytical lens
2. **Balanced Weights**: Avoid extreme weights that filter out too much content
3. **Specific Filters**: Use precise patterns to capture relevant content
4. **Actionable Prompts**: Design prompts that generate useful insights

### Usage Strategy
1. **Multiple Perspectives**: Use 3-4 personalities for comprehensive analysis
2. **Context Matching**: Choose personalities that match your research goals
3. **Iterative Refinement**: Test and adjust personalities based on results
4. **Combination Testing**: Experiment with different personality combinations

### Performance Optimization
1. **Filter Efficiency**: Well-designed filters improve processing speed
2. **Weight Balance**: Balanced weights provide better analysis quality
3. **Prompt Length**: Concise prompts are more effective than verbose ones
4. **Regular Updates**: Keep personalities current with changing domains

This comprehensive personality system transforms raw research into targeted, actionable insights tailored to your specific analytical needs.