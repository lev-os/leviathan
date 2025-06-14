# Comprehensive Context Analysis - Replication Guide

## Power Combo Overview

**What it does**: Systematically analyzes complex topics through multiple Kingly contexts, synthesizes insights, and generates high-confidence decisions through cognitive parliament.

**When to use**: Complex strategic/technical decisions requiring multi-perspective validation and comprehensive risk assessment.

**Time savings**: 90% reduction vs sequential analysis (15 min vs 150+ min)

## Step-by-Step Replication

### Step 1: Discovery & Setup (2-3 minutes)

```bash
# 1. Count available contexts
find ~/c -name "context.yaml" | wc -l

# 2. Create workspace
mkdir -p ~/k/core/{topic}/tmp/

# 3. Inventory contexts by category
ls ~/c/agents/ ~/c/patterns/ ~/c/workflows/
```

**Expected Output**: Complete catalog of available analytical frameworks

### Step 2: Context Selection & Analysis (8-10 minutes)

**Select 8-12 Most Relevant Contexts:**
- 2-3 Agent perspectives (ceo, dev, domain-specific)
- 4-6 Thinking patterns (first-principles, systems, design-thinking, etc.)
- 2-3 Synthesis workflows (document-synthesis, cognitive-parliament)

**Parallel Analysis Process:**
```markdown
For each selected context:
1. Read context.yaml to understand framework
2. Apply framework to your topic
3. Generate unique insights from that perspective
4. Save to tmp/{context-name}.md
5. Focus on what this framework reveals that others don't
```

**Analysis Template:**
```markdown
# {Context Name} Analysis for {Topic}

## {Framework} Perspective

### Key Contributions to {Topic}
- Unique insights from this framework
- What this perspective reveals
- How it changes understanding

### Implementation Implications
- Specific recommendations
- Framework-specific considerations
- Integration with topic requirements

### Risk/Opportunity Assessment
- Risks identified by this framework
- Opportunities revealed
- Mitigation strategies
```

### Step 3: Document Synthesis (2-3 minutes)

**Load All Analyses:**
```bash
ls tmp/*.md  # Verify all analyses completed
```

**Synthesis Process:**
1. **Pattern Identification**: Look for themes across analyses
2. **Convergence Analysis**: Where do frameworks agree?
3. **Conflict Resolution**: Where do they disagree and why?
4. **Insight Amplification**: What emerges from combination?

**Synthesis Output Structure:**
```markdown
# Comprehensive Synthesis: {Topic}

## Cross-Framework Validation Matrix
| Framework | Key Insight | Risk Identified | Recommendation |

## Convergent Patterns
- Pattern 1: Universal agreements
- Pattern 2: Consistent risk factors  
- Pattern 3: Aligned strategies

## Synthesis Insights
- Insight 1: Novel understanding from combination
- Insight 2: Amplified confidence from convergence
- Insight 3: Implementation strategy consensus

## Unified Recommendations
- Technical: Implementation approach
- Strategic: Business/adoption strategy
- Risk: Mitigation approaches
```

### Step 4: Cognitive Parliament (1-2 minutes)

**Parliament Process:**
1. Load synthesis results into parliament framework
2. Apply 8-personality analysis to synthesized insights
3. Identify conflicts and build consensus
4. Generate final decision with confidence rating

**Parliament Output:**
```markdown
# Cognitive Parliament Decision

## 8-Personality Analysis
- SFJ Caregiver: Stakeholder/safety perspective
- NFP Advocate: Innovation/change perspective  
- NFJ Visionary: Future/strategic perspective
- STP Adapter: Practical/implementation perspective
- STJ Leader: Structure/governance perspective
- NTP Innovator: Technical/experimental perspective
- NTJ Strategist: Competitive/control perspective
- SFP Connector: Community/relationship perspective

## Parliament Consensus
- Vote count: X/8 personalities support
- Confidence level: High/Medium/Low
- Decision: Proceed/Modify/Abandon
- Implementation authorization: Immediate/Conditional/Delayed
```

### Step 5: Power Combo Capture (1-2 minutes)

**Create Power Combo Record:**
```yaml
# Save to ~/c/workflows/power/{topic-analysis}/context.yaml
metadata:
  type: "workflow"
  id: "{topic-analysis}"
  description: "Comprehensive analysis pattern for {topic}"

workflow_config:
  contexts_used: [list of contexts]
  time_investment: "X minutes"
  convergence_rate: "X% agreement"
  decision_confidence: "High/Medium/Low"
  breakthrough_insights: [list key insights]
  
  replication_success_factors:
    - Context selection criteria
    - Analysis quality indicators
    - Synthesis pattern effectiveness
    - Parliament consensus building
```

## Quality Indicators

### Excellent Analysis (Target Standards)
- **Convergence Rate**: >85% agreement across frameworks
- **Novel Insights**: 3+ insights not available from single framework
- **Decision Confidence**: High confidence with clear implementation path
- **Time Efficiency**: <20 minutes for comprehensive analysis
- **Actionability**: Clear next steps and success metrics

### Warning Signs (Quality Issues)
- Low convergence rate (<60% agreement)
- Superficial framework application
- Conflicting recommendations without resolution
- Generic insights available from any single framework
- Unclear or conflicting implementation guidance

## Advanced Techniques

### Context Selection Optimization
- **Strategic Decisions**: CEO + Systems + First Principles + Parliament
- **Technical Decisions**: Dev + First Principles + Reversibility + Extremes
- **User Experience**: Design Thinking + Extremes + Systems + Parliament
- **Innovation**: First Principles + Extremes + Innovation + Parliament

### Synthesis Enhancement
- Look for **non-obvious connections** between frameworks
- Identify **emergent properties** from framework combination
- Focus on **amplified confidence** from convergent validation
- Highlight **unique insights** not available individually

### Parliament Optimization
- Use parliament for **conflict resolution** between frameworks
- Leverage **personality diversity** for comprehensive perspective
- Build **consensus** through systematic perspective integration
- Generate **high-confidence decisions** through democratic validation

## Troubleshooting Common Issues

**Issue**: Frameworks produce conflicting recommendations
**Solution**: Use parliament analysis to identify perspective differences and build synthesis

**Issue**: Analysis feels superficial or generic
**Solution**: Go deeper into unique framework contributions, avoid overlap

**Issue**: Synthesis doesn't reveal new insights
**Solution**: Focus on framework interactions and emergent properties

**Issue**: Parliament reaches no consensus
**Solution**: Identify fundamental conflicts and design compromise approaches

## Success Stories

### Go OS Kernel Analysis
- **Contexts Used**: 9 (CEO, Dev, First Principles, Systems, Parliament, Design, Synthesis, Extremes, Reversibility)
- **Time Investment**: 15 minutes
- **Convergence Rate**: 100% (unprecedented)
- **Decision**: Unanimous proceed with immediate implementation
- **Key Insight**: AI-first OS design validated across all frameworks
- **Implementation**: Clear 3-phase roadmap with risk mitigation

## Continuous Improvement

**After Each Use:**
1. Document what worked well
2. Identify framework selection improvements
3. Note synthesis pattern effectiveness
4. Update replication guide with lessons learned
5. Share successful patterns with community

This replication guide enables systematic application of comprehensive context analysis to any complex topic requiring multi-perspective validation and high-confidence decision making.