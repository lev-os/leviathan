# Research Workflow POC - Ultimate Bi-Directional Orchestration

This POC demonstrates how the workflow orchestrator guides Claude through a sophisticated multi-step research process using bi-directional context injection.

## 🎯 Research Workflow Architecture

### Step 0: QnA Wizard
- Progressive discovery through initial web search
- Ask clarifying questions based on search results
- Build focused research parameters
- Generate 5 discovery search queries

### Step 1: Discovery Phase
- Execute 5 auto-generated related topic searches
- Use available web search tools (WebSearch, perplexity_ask)
- Gather broad context and identify key themes
- Track all search results and insights

### Step 2: Deep Research Prompt Building
- Apply techniques from ~/t (chain-of-thought, tree-of-thoughts)
- Generate 10 sophisticated research prompts
- Each prompt targets specific aspects discovered in Step 1
- Structure prompts for maximum insight extraction

### Step 3: Deep Research Execution
- Execute each research prompt systematically
- Expect perplexity deep research or similar tools
- Track all outputs comprehensively
- Build knowledge graph from results

### Step 4: Multi-Angle Synthesis
- Apply doc-shepherd synthesis patterns
- Use cognitive parliament for multi-perspective analysis
- Extreme brainstorming for creative insights
- Generate comprehensive research report

## 🔄 Bi-Directional Flow Implementation

```yaml
metadata:
  id: ultimate-research-workflow
  type: workflow
  name: Advanced Research with Progressive Discovery
  version: 1.0.0
  description: Multi-tier research with QnA wizard, discovery, deep research, and synthesis

workflow_config:
  philosophy: "Progressive discovery through guided research orchestration"
  
  steps:
    - id: qna_wizard
      name: "Progressive Discovery Wizard"
      instruction: |
        You are a research discovery wizard. Your role:
        
        1. Execute an initial web search based on the user's request
        2. Analyze the results to identify:
           - Key themes and concepts
           - Areas needing clarification
           - Potential research directions
        3. Ask 3-5 clarifying questions to focus the research
        4. Based on answers, generate 5 discovery search queries
        
        Use whatever web search tool is available (WebSearch, perplexity_ask, etc.)
        
        Output format:
        - Initial findings summary
        - Clarifying questions
        - Proposed discovery searches
      
    - id: discovery_phase
      name: "Broad Discovery Searches"
      parallel:
        - id: discovery_1
          name: "Discovery Search 1"
          instruction: "Execute first discovery search and extract key insights"
        - id: discovery_2
          name: "Discovery Search 2"
          instruction: "Execute second discovery search and extract key insights"
        - id: discovery_3
          name: "Discovery Search 3"
          instruction: "Execute third discovery search and extract key insights"
        - id: discovery_4
          name: "Discovery Search 4"
          instruction: "Execute fourth discovery search and extract key insights"
        - id: discovery_5
          name: "Discovery Search 5"
          instruction: "Execute fifth discovery search and extract key insights"
          
    - id: deep_prompt_building
      name: "Build Deep Research Prompts"
      instruction: |
        Based on discovery phase results, build 10 deep research prompts using:
        
        Chain-of-Thought Technique:
        - Break down complex topics into logical steps
        - Each prompt should explore one aspect deeply
        
        Tree-of-Thoughts Pattern:
        - Create branching exploration paths
        - Consider multiple perspectives and hypotheses
        
        Research Prompt Structure:
        1. Context from discovery phase
        2. Specific investigation angle
        3. Expected insight types
        4. Validation criteria
        
        Generate 10 sophisticated prompts that will extract maximum insight.
        
    - id: deep_research_execution
      name: "Execute Deep Research"
      parallel:
        - id: research_1
          name: "Deep Research 1"
          instruction: "Execute research prompt 1 using deep research tools"
        - id: research_2
          name: "Deep Research 2"
          instruction: "Execute research prompt 2 using deep research tools"
        - id: research_3
          name: "Deep Research 3"
          instruction: "Execute research prompt 3 using deep research tools"
        - id: research_4
          name: "Deep Research 4"
          instruction: "Execute research prompt 4 using deep research tools"
        - id: research_5
          name: "Deep Research 5"
          instruction: "Execute research prompt 5 using deep research tools"
        - id: research_6
          name: "Deep Research 6"
          instruction: "Execute research prompt 6 using deep research tools"
        - id: research_7
          name: "Deep Research 7"
          instruction: "Execute research prompt 7 using deep research tools"
        - id: research_8
          name: "Deep Research 8"
          instruction: "Execute research prompt 8 using deep research tools"
        - id: research_9
          name: "Deep Research 9"
          instruction: "Execute research prompt 9 using deep research tools"
        - id: research_10
          name: "Deep Research 10"
          instruction: "Execute research prompt 10 using deep research tools"
          
    - id: synthesis_preparation
      name: "Prepare Multi-Angle Synthesis"
      instruction: |
        Organize all research outputs for comprehensive synthesis:
        
        1. Categorize findings by theme
        2. Identify patterns and contradictions
        3. Map knowledge connections
        4. Prepare for multi-perspective analysis
        
        Structure data for:
        - Doc-shepherd synthesis
        - Cognitive parliament deliberation
        - Extreme brainstorming
        
    - id: multi_angle_synthesis
      name: "Multi-Perspective Analysis"
      parallel:
        - id: doc_shepherd_synthesis
          name: "Documentation Synthesis"
          agent: doc-shepherd
          instruction: |
            Apply document synthesis patterns:
            - Executive summary of findings
            - Detailed analysis sections
            - Implementation recommendations
            - Knowledge gaps identified
            
        - id: cognitive_parliament
          name: "Multi-Personality Deliberation"
          pattern: cognitive-parliament
          instruction: |
            Analyze research through 8 personality lenses:
            - Each personality examines findings
            - Identify unique insights per perspective
            - Find consensus and conflicts
            - Synthesize emergent understanding
            
        - id: extreme_brainstorm
          name: "Creative Expansion"
          pattern: extreme-examples
          instruction: |
            Push findings to extremes:
            - What if we 10x this approach?
            - What's the opposite conclusion?
            - How would aliens interpret this?
            - What breaks if we're wrong?
            
    - id: final_synthesis
      name: "Generate Comprehensive Report"
      instruction: |
        Create final research synthesis combining all perspectives:
        
        ## Executive Summary
        - Key findings (3-5 bullet points)
        - Strategic recommendations
        - Confidence levels
        
        ## Detailed Findings
        - Discovery phase insights
        - Deep research revelations
        - Multi-perspective analysis
        
        ## Knowledge Graph
        - Core concepts and relationships
        - Supporting evidence
        - Contradictions and uncertainties
        
        ## Implementation Roadmap
        - Immediate actions
        - Further research needed
        - Risk considerations
        
        ## Appendices
        - All search queries used
        - Source quality assessment
        - Methodology notes
        
        Save report as: research_synthesis_[timestamp].md
```

## 🚀 How Claude Uses This Workflow

```javascript
// Claude calls the workflow orchestrator
await workflow_execute({
  workflow: 'ultimate-research-workflow',
  input: {
    topic: "AI workflow orchestration patterns",
    initial_context: "Looking for cutting-edge approaches to bi-directional orchestration"
  }
});

// The orchestrator then guides Claude through each step:

// Step 0: QnA Wizard
// Orchestrator injects: "You are a research discovery wizard..."
// Claude: Performs initial search, asks clarifying questions
// Claude: Generates 5 discovery searches based on user responses

// Step 1: Discovery Phase (Parallel)
// Orchestrator injects 5 parallel contexts
// Claude: Executes each discovery search simultaneously
// Claude: Extracts and returns key insights from each

// Step 2: Deep Prompt Building
// Orchestrator injects: "Build 10 deep research prompts using CoT..."
// Claude: Applies prompting techniques to generate sophisticated queries
// Claude: Returns structured research prompts

// Step 3: Deep Research (Parallel)
// Orchestrator injects 10 parallel research contexts
// Claude: Executes each deep research prompt
// Claude: Returns comprehensive findings

// Step 4: Multi-Angle Synthesis (Parallel)
// Orchestrator injects 3 different synthesis contexts
// Claude: Performs doc-shepherd synthesis
// Claude: Conducts cognitive parliament analysis
// Claude: Does extreme brainstorming

// Step 5: Final Report
// Orchestrator injects: "Create comprehensive report..."
// Claude: Synthesizes everything into final deliverable
// Claude: Saves report and returns summary
```

## 📊 Output Tracking

The orchestrator tracks ALL outputs:
- Search results from discovery phase
- Generated research prompts
- Deep research findings
- Synthesis perspectives
- Final report location

## 🧪 Testing the POC

1. **Simple Test**: Basic research on a straightforward topic
2. **Complex Test**: Multi-faceted topic requiring all capabilities
3. **Stress Test**: Highly ambiguous topic testing QnA wizard

## 🎯 Key Innovations

1. **Progressive Discovery**: QnA wizard adapts research based on initial findings
2. **Parallel Execution**: Massive parallelization for speed
3. **Multi-Tool Integration**: Works with any available search/research tools
4. **Technique Application**: Leverages ~/t prompting techniques
5. **Pattern Reuse**: Incorporates ~/c workflows and agents
6. **Comprehensive Tracking**: Every output preserved and synthesized

This represents the ultimate demonstration of bi-directional orchestration where the CLI guides Claude through a sophisticated research journey, with Claude processing each injected context with maximum intelligence.