# 🎯 DECISION-MAKING PATTERNS SPECIFICATION

*Structured analytical frameworks as reusable context patterns*

## 📋 **BUSINESS CASE**

**Goal**: Transform proven analytical frameworks into reusable context patterns for systematic decision-making
**Value**: Consistent, high-quality decision processes across personal, business, and strategic contexts using structured methodologies
**Priority**: High - Critical for intelligent decision support at all scales

## 🎯 **ACCEPTANCE CRITERIA**

### **AC-DECISION-001: Pattern Framework Library**
```yaml
Given: Complex decision or analysis requirement
When: User selects decision-making pattern (SWOT, RICE, Jobs-to-be-Done, etc.)
Then: Pattern context provides structured analytical framework
And: Pattern guides systematic evaluation of factors and options
And: Pattern generates consistent, comparable decision outputs
```

### **AC-DECISION-002: Multi-Scale Pattern Application**
```yaml
Given: Decision-making pattern proven at one scale (personal choice)
When: Similar decision structure appears at different scale (business strategy)
Then: Same pattern applies with scale-appropriate adaptation
And: Pattern maintains analytical rigor while adapting to context
And: Decision quality remains consistent across complexity levels
```

### **AC-DECISION-003: Pattern Composition and Workflow**
```yaml
Given: Complex decision requiring multiple analytical perspectives
When: Multiple decision patterns need to be combined
Then: Patterns compose seamlessly (SWOT + RICE + 10-10-10)
And: Combined analysis provides comprehensive decision support
And: Workflow orchestrates pattern sequence and synthesis
```

## Pattern Categories

### Strategic Analysis Patterns

#### SWOT Analysis
- **Purpose**: Comprehensive internal/external assessment
- **Components**: Strengths, Weaknesses, Opportunities, Threats
- **Output**: Strategic action matrix
- **Location**: `contexts/patterns/swot-analysis/`

#### SOAR Analysis  
- **Purpose**: Positive-focused strategic planning
- **Components**: Strengths, Opportunities, Aspirations, Results
- **Philosophy**: Build on strengths vs fix weaknesses
- **Location**: `contexts/patterns/soar-analysis/`

#### NOISE Analysis
- **Purpose**: Holistic five-dimensional assessment
- **Components**: Needs, Opportunities, Improvements, Strengths, Exceptions
- **Unique**: Captures edge cases and outliers
- **Location**: `contexts/patterns/noise-analysis/`

### Prioritization Patterns

#### RICE Scoring
- **Purpose**: Quantitative project prioritization
- **Formula**: (Reach × Impact × Confidence) / Effort
- **Output**: Ranked initiative list
- **Location**: `contexts/patterns/rice-scoring/`

#### Jobs-to-be-Done (JTBD)
- **Purpose**: Understanding user motivations
- **Format**: When [situation] I want [job] So I can [outcome]
- **Categories**: Functional, Emotional, Social jobs
- **Location**: `contexts/patterns/jobs-to-be-done/`

### Temporal Analysis Patterns

#### 10-10-10 Framework
- **Purpose**: Decision impact across time horizons
- **Horizons**: 10 minutes, 10 months, 10 years
- **Focus**: Avoiding short-term thinking traps
- **Location**: `contexts/patterns/10-10-10-framework/`

### Risk Assessment Patterns

#### Reversibility Check
- **Purpose**: Calibrate decision-making speed
- **Categories**: One-way doors vs Two-way doors
- **Principle**: High bar for irreversible, low bar for reversible
- **Location**: `contexts/patterns/reversibility-check/`

### Composite Analysis Pattern

#### Decision Matrix (Meta-Pattern)
- **Purpose**: Combines multiple frameworks
- **Components**: SWOT + JTBD + RICE + 10-10-10 + Reversibility
- **Use**: Complex decisions requiring comprehensive analysis
- **Location**: `contexts/patterns/decision-matrix/`

## Implementation Architecture

### Pattern Activation Methods

```yaml
# 1. Direct pattern execution
kingly analyze swot --context "new market entry"

# 2. Composite analysis
kingly analyze decision-matrix --context "platform migration"

# 3. Agent integration
agent://ceo.strategist --pattern soar-analysis

# 4. Workflow embedding
workflow:
  pre_decision:
    - pattern: reversibility-check
    - if: one_way_door
      then: pattern: decision-matrix
```

### Pattern Composition

```yaml
# Patterns can reference each other
strategic_decision:
  patterns:
    - swot-analysis          # Current state
    - soar-analysis          # Future vision
    - 10-10-10-framework     # Time impact
    - rice-scoring           # If multiple options
    
  synthesis: "Comprehensive strategic recommendation"
```

### Pattern Learning

```yaml
pattern_effectiveness:
  track:
    - Decision outcomes
    - Time to decision
    - Confidence levels
    - Reversal rates
    
  optimize:
    - Pattern combinations
    - Weight adjustments
    - Context matching
```

## Use Case Examples

### Startup Pivot Decision
```yaml
patterns_used:
  - swot-analysis: "Current position"
  - jobs-to-be-done: "Customer needs"
  - reversibility-check: "Can we go back?"
  - 10-10-10-framework: "Long-term impact"
  
outcome: "Clear pivot strategy with milestones"
```

### Feature Prioritization
```yaml
patterns_used:
  - rice-scoring: "All feature requests"
  - jobs-to-be-done: "User motivations"
  - noise-analysis: "Edge case consideration"
  
outcome: "Prioritized roadmap with rationale"
```

### Enterprise Technology Decision
```yaml
patterns_used:
  - decision-matrix: "Full analysis"
  - reversibility-check: "Migration complexity"
  - soar-analysis: "Future state vision"
  
outcome: "Phased implementation plan"
```

## Benefits

### For Decision Quality
- **Systematic thinking** reduces blind spots
- **Multiple perspectives** prevent bias
- **Quantitative elements** add objectivity
- **Time horizons** prevent short-termism

### For Team Alignment
- **Shared frameworks** create common language
- **Transparent process** builds buy-in
- **Documented rationale** aids communication
- **Reusable patterns** ensure consistency

### For Organizational Learning
- **Pattern effectiveness** tracking
- **Decision outcome** correlation
- **Best practice** emergence
- **Continuous improvement** culture

## Integration with Other Systems

### With Brainstorming Patterns
- Use brainstorming to generate options
- Apply decision patterns to evaluate
- Iterate between creative and analytical

### With Agent System
- Agents can invoke decision patterns
- Different endpoints use different patterns
- CEO uses strategic patterns
- Dev uses technical decision patterns

### With Workflow System
- Embed patterns in approval workflows
- Trigger patterns based on thresholds
- Chain patterns for complex decisions

## Future Enhancements

### AI-Enhanced Analysis
```yaml
ai_features:
  - Automated SWOT generation
  - Historical pattern matching
  - Outcome prediction
  - Bias detection
```

### Real-time Collaboration
```yaml
collaborative_features:
  - Multi-stakeholder input
  - Live pattern sessions
  - Consensus tracking
  - Conflict resolution
```

---

*Decision-making patterns transform one-time analysis into repeatable, improvable, and shareable strategic thinking tools. Every decision makes the next one better.*