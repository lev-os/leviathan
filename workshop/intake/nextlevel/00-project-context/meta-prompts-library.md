# META-PROMPTS LIBRARY

## 🎯 LEVEL 1 RESEARCH PROMPTS (Base Intelligence)

### Stream 1: Agentic Architecture Intelligence
```
RESEARCH_PROMPT_L1_AGENTIC = """
Analyze the latest breakthrough patterns in multi-agent orchestration (2024-2025). Focus on: 
1) What specific architectural patterns are emerging beyond basic LLM chains? 
2) How are teams solving agent coordination, memory sharing, and state management? 
3) What performance bottlenecks are appearing at scale? 
4) Which approaches prioritize local control vs cloud orchestration? 
5) What are the actual production deployment patterns vs demos?

Include specific frameworks, but focus on underlying architectural principles that will persist beyond current tooling.

OUTPUT_FORMAT:
- Pattern Name
- Key Innovation  
- Architecture Impact
- Sovereignty Implications
- Speed/Performance Factors
- Production Readiness Score (1-10)
"""
```

### Stream 2: Post-Agentic Paradigm Shift Analysis
```
RESEARCH_PROMPT_L1_ROBOTICS = """
What comes after the current agentic AI wave? Research:
1) Embodied AI + robotics integration patterns - how are AI agents connecting to physical systems?
2) Brain-computer interfaces + AI orchestration - what's emerging in direct neural control?
3) Autonomous swarm intelligence - multi-robot coordination patterns
4) AI-native operating systems - what would an OS built for AI agents look like?
5) Post-human-in-the-loop workflows - fully autonomous business processes

Focus on technical patterns and sovereignty implications, not speculation.

OUTPUT_FORMAT:
- Paradigm Name
- Technical Foundation
- Timeline to Viability
- Sovereignty Impact
- Infrastructure Requirements
- Kingly Positioning Opportunity
"""
```

### Stream 3: Hacker Sovereignty Movement Analysis
```
RESEARCH_PROMPT_L1_HACKERS = """
Research the underground AI sovereignty movement. What are hackers and privacy-focused developers actually building?
1) Local-first AI orchestration projects that reject cloud dependencies
2) Decentralized agent networks and peer-to-peer AI coordination
3) Anti-surveillance AI tools and privacy-preserving agent architectures
4) Open-source alternatives to enterprise AI platforms
5) Mesh networks and edge AI coordination systems

Focus on GitHub projects with <1000 stars but high technical innovation. Include homelab and raspberry pi AI orchestration projects.

OUTPUT_FORMAT:
- Project Name
- Core Innovation
- Technical Architecture
- Sovereignty Score (1-10)
- Performance Characteristics  
- Community Size/Activity
- Kingly Alignment Potential
"""
```

### Stream 4: Enterprise vs Sovereignty Battle Analysis
```
RESEARCH_PROMPT_L1_ENTERPRISE = """
Analyze the emerging divide between enterprise AI platforms and sovereignty-focused solutions:
1) What are the specific lock-in mechanisms in current enterprise AI platforms?
2) How do performance characteristics differ between cloud-heavy vs local-first approaches?
3) What are the actual costs (performance, complexity, dependency) of framework-heavy solutions?
4) Where are enterprises hitting walls with vendor-dependent AI orchestration?
5) What patterns emerge from teams who've migrated away from complex AI frameworks?

Include specific case studies and performance benchmarks where available.

OUTPUT_FORMAT:
- Enterprise Platform
- Lock-in Mechanisms
- Performance Costs
- Migration Stories
- White Space Opportunities
- Kingly Advantage Potential
"""
```

## 🔍 LEVEL 2 DYNAMIC PROMPTS (Deep-Dive Templates)

### Template: Technical Deep-Dive
```
RESEARCH_PROMPT_L2_TECHNICAL = """
Based on Level 1 finding: "{L1_FINDING}"

Deep technical analysis:
1) What are the specific implementation patterns being used?
2) What are the millisecond-level performance characteristics?
3) What are the failure modes and reliability patterns?
4) How does this scale in terms of resource usage?
5) What would a simpler implementation look like?

Compare against Kingly's principles:
- YAML-first configuration
- Direct adapter performance  
- Local sovereignty
- LLM-native orchestration

OUTPUT_FORMAT:
- Technical Architecture Details
- Performance Benchmarks
- Complexity Analysis
- Kingly Comparison
- Implementation Opportunity
"""
```

### Template: Competitive Analysis
```
RESEARCH_PROMPT_L2_COMPETITIVE = """
Based on Level 1 finding: "{L1_FINDING}"

Competitive landscape analysis:
1) Who are the key players in this space?
2) What are their specific technical approaches?
3) Where are they failing to serve user needs?
4) What would "Linux-style" approach look like here?
5) What are the underserved market segments?

Focus on positioning opportunities for Kingly.

OUTPUT_FORMAT:
- Player Analysis
- Technical Approaches
- Market Gaps
- Positioning Opportunities
- Strategic Recommendations
"""
```

### Template: Sovereignty Analysis
```
RESEARCH_PROMPT_L2_SOVEREIGNTY = """
Based on Level 1 finding: "{L1_FINDING}"

Sovereignty and local-control analysis:
1) What data leaves local control in current solutions?
2) What are the cloud dependencies that can't be avoided?
3) How would this work in air-gapped environments?
4) What would true local-first implementation require?
5) Where are the privacy and control vulnerabilities?

Assess Kingly's advantages in sovereignty-focused scenarios.

OUTPUT_FORMAT:
- Data Flow Analysis
- Dependency Mapping
- Air-Gap Viability
- Local-First Requirements
- Kingly Sovereignty Advantages
"""
```

## ✅ LEVEL 3 VALIDATION PROMPTS (Competitive Intelligence)

### Template: White Space Identification
```
RESEARCH_PROMPT_L3_WHITESPACE = """
Based on comprehensive research findings: {L1_AND_L2_RESULTS}

White space opportunity analysis:
1) What patterns are missing from current solutions that Kingly could dominate?
2) Where do speed-first, sovereignty-focused solutions have unfair advantages?
3) What would 'Linux for AI orchestration' actually look like in practice?
4) Which market segments are underserved by current complex frameworks?
5) What would be the most impactful positioning strategy?

Focus on strategic opportunities with technical backing.

OUTPUT_FORMAT:
- White Space Opportunities (ranked)
- Unfair Advantage Analysis
- Market Segment Assessment
- Strategic Positioning Recommendations
- Technical Roadmap Implications
"""
```

### Template: Advantage Validation
```
RESEARCH_PROMPT_L3_ADVANTAGES = """
Given Kingly's core principles:
- YAML-first configuration
- Direct adapters (10x performance)
- LLM-native orchestration  
- Local sovereignty focus
- Plugin-based architecture

And research findings: {RESEARCH_RESULTS}

Validate specific competitive advantages:
1) Where does Kingly's approach create 10x+ improvements?
2) What technical differentiators are hardest to replicate?
3) Which principles resonate most with sovereignty-focused users?
4) What would competitors need to change to match Kingly's advantages?
5) How sustainable are these advantages over time?

OUTPUT_FORMAT:
- Validated Advantages (ranked by defensibility)
- Technical Differentiation Analysis
- User Resonance Assessment
- Competitive Response Prediction
- Sustainability Analysis
"""
```

### Template: Technical Roadmap Input
```
RESEARCH_PROMPT_L3_ROADMAP = """
Based on all research findings: {COMPREHENSIVE_RESULTS}

Technical roadmap recommendations:
1) What capabilities should Kingly prioritize based on market gaps?
2) Which technical patterns should be adopted from competitive analysis?
3) What sovereignty features would create the strongest differentiation?
4) Which performance optimizations would have highest impact?
5) What integration points would maximize ecosystem value?

Focus on actionable technical decisions.

OUTPUT_FORMAT:
- Priority Capabilities (with rationale)
- Technical Pattern Recommendations
- Sovereignty Feature Priorities
- Performance Optimization Targets
- Ecosystem Integration Strategy
"""
```

## 🔧 PROMPT VARIABLES

### Dynamic Variable Substitution
```bash
# Level 1 Results Processing
L1_AGENTIC_RESULTS=${level-1-base}/agentic-findings.md
L1_ROBOTICS_RESULTS=${level-1-base}/robotics-findings.md
L1_HACKERS_RESULTS=${level-1-base}/hackers-findings.md
L1_ENTERPRISE_RESULTS=${level-1-base}/enterprise-findings.md

# Level 2 Dynamic Generation
L1_FINDINGS=$(cat ${L1_*_RESULTS} | extract_key_findings)
L2_PROMPTS=$(generate_l2_prompts ${L1_FINDINGS})

# Level 3 Comprehensive Input
L1_AND_L2_RESULTS=$(cat ${level-1-base}/* ${level-2-deep}/*)
RESEARCH_RESULTS=${L1_AND_L2_RESULTS}
COMPREHENSIVE_RESULTS=${L1_AND_L2_RESULTS}
```

### Execution Templates
```bash
# Level 1 Execution
claude-code --spawn research --prompt "${RESEARCH_PROMPT_L1_AGENTIC}" --output level-1-base/agentic-findings.md

# Level 2 Dynamic Execution  
for finding in ${L1_KEY_FINDINGS}; do
  prompt=$(substitute_template "${RESEARCH_PROMPT_L2_TECHNICAL}" "${finding}")
  claude-code --spawn research --prompt "${prompt}" --output level-2-deep/${finding}-analysis.md
done

# Level 3 Synthesis
claude-code --spawn research --prompt "${RESEARCH_PROMPT_L3_WHITESPACE}" --input level-{1,2}*/* --output level-3-validation/whitespace-analysis.md
```

**All prompts are variabilized and ready for dynamic execution with Claude Code spawning.**