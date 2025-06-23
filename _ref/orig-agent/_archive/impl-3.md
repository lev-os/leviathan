# Decision Record 3: Perfect Agent Structure (Tag Soup + Interactive Checklists)

**Date**: 2025-01-25  
**Decision**: Combine proven tag soup structure with interactive checklist workflow control

## The Perfect Structure We Already Designed

### **Agent Definition with Tag Soup**
```yaml
# agents/core/ceo.yaml
metadata:
  id: "ceo"
  name: "Chief Executive Officer" 
  version: "1.0.0"

# Rich semantic tagging (our tag soup approach)
tags:
  actions: [plan, strategize, decide, prioritize, approve, budget, evaluate]
  skills: [strategy, leadership, finance, communication, decision_making]
  domains: [business, marketing, product, operations, finance]
  contexts: [startup, enterprise, crisis, growth, pivot, launch]
  personas: [startup_founder, enterprise_cto, product_manager]

# Scenario-based routing (our proven pattern)
scenarios:
  crisis_response:
    trigger: "app is down" || "losing money" || "emergency"
    workflow:
      - self: "assess_situation"
      - parallel: ["communicate_stakeholders", "coordinate_response"]
      - handoff: "dev" # for technical fixes
      
  competitive_threat:
    trigger: "competitor launched" || "market threat"
    workflow:
      - self: "competitive_analysis"
      - handoff: "marketing" # for market research
      - handoff: "design" # for differentiation
      
  strategic_planning:
    trigger: "plan *" || "strategy for *" || "roadmap"
    workflow:
      - self: "analyze_context"
      - checklist_pause: true # Let user choose next steps
      - options: ["research_phase", "design_phase", "implementation"]

# Interactive checklist configuration
checklist_behavior:
  always_generate: true
  pause_points: ["after_analysis", "before_major_decisions"]
  user_choices:
    - timing: "after_strategy_creation"
      question: "What should we tackle first?"
      options:
        - "Deep market research" → handoff: "research"
        - "Technical feasibility" → handoff: "dev" 
        - "Start prototyping" → handoff: "design"
        - "Plan marketing approach" → handoff: "marketing"
        
    - timing: "before_budget_decisions"  
      question: "Budget approach?"
      options:
        - "Conservative (validate first)"
        - "Aggressive (speed to market)"
        - "Let me review the numbers first"

# Tools integration (our MCP approach)
tools:
  analytics: { type: "mcp", package: "@analytics/mcp" }
  financial_modeling: { type: "api", endpoint: "/financial" }
  communication: { type: "mcp", package: "@slack/mcp" }

system_prompt: |
  You are a strategic business leader focused on growth and smart decision-making.
  
  Always end your work with an interactive checklist:
  
  ## ✅ Analysis Complete
  [What you accomplished]
  
  ## 🎯 Strategic Options
  [Present 3-4 strategic choices with reasoning]
  
  ## ❓ What's Your Priority?
  1. **Market Position**: Research competitors and positioning
  2. **Technical Validation**: Verify feasibility with dev team  
  3. **Resource Planning**: Budget and timeline analysis
  4. **Risk Assessment**: Identify and mitigate key risks
  
  **Your choice shapes the next phase of work.**
```

### **Real-World Scenario Workflows**
```yaml
# workflows/scenarios/app-crisis.yaml
scenario: "app_crisis"
triggers:
  - "app is down"
  - "losing $* per hour"
  - "emergency"
  - "critical issue"

workflow:
  - agent: "dev"
    action: "diagnose_issue"
    tools: ["monitoring", "logs", "metrics"]
    urgency: "immediate"
    
  - parallel:
    - agent: "dev" 
      action: "implement_hotfix"
      tools: ["git", "deployment"]
      
    - agent: "ceo"
      action: "stakeholder_communication"
      tools: ["slack", "email"]
      template: "crisis_communication"
      
    - agent: "marketing"
      action: "public_response"
      tools: ["twitter", "status_page"]
      condition: "public_facing_issue"
      
  - agent: "content"
    action: "incident_report"
    tools: ["docs", "wiki"]
    timing: "post_resolution"
    
  # Interactive checkpoint
  - checklist_pause: true
    question: "Crisis resolved. What's next?"
    options:
      - "Post-mortem analysis" → workflow: "post_mortem"
      - "Prevent recurrence" → agent: "dev", action: "add_monitoring"
      - "Customer communication" → agent: "marketing", action: "damage_control"
      - "All of the above" → parallel: [post_mortem, prevention, communication]
```

### **Tag Soup Routing Engine**
```javascript
class TagSoupRouter {
  constructor() {
    this.tagSoup = {
      actions: new Set(['analyze', 'architect', 'approve', 'audit', 'automate', 'benchmark', 'brainstorm', 'brand', 'budget', 'build', 'campaign', 'code', 'communicate', 'compete', 'compile', 'configure', 'convert', 'create', 'debug', 'decide', 'delegate', 'deliver', 'deploy', 'design', 'develop', 'diagnose', 'document', 'draft', 'educate', 'email', 'engage', 'estimate', 'evaluate', 'execute', 'experiment', 'explore', 'feedback', 'forecast', 'fund', 'generate', 'grow', 'guide', 'hire', 'ideate', 'implement', 'improve', 'influence', 'integrate', 'interview', 'investigate', 'iterate', 'launch', 'lead', 'learn', 'maintain', 'manage', 'market', 'measure', 'migrate', 'model', 'moderate', 'monitor', 'negotiate', 'optimize', 'organize', 'outline', 'pitch', 'plan', 'post', 'present', 'prioritize', 'prototype', 'publish', 'qualify', 'quantify', 'question', 'rank', 'recruit', 'refactor', 'release', 'report', 'research', 'respond', 'review', 'scale', 'schedule', 'scope', 'secure', 'segment', 'sell', 'ship', 'solve', 'specify', 'sprint', 'strategize', 'support', 'survey', 'sync', 'synthesize', 'target', 'test', 'track', 'train', 'transform', 'translate', 'troubleshoot', 'update', 'upgrade', 'validate', 'verify', 'visualize', 'write']),
      
      skills: new Set(['accessibility', 'acquisition', 'agile', 'analytics', 'animation', 'api', 'architecture', 'automation', 'blockchain', 'branding', 'budgeting', 'business', 'caching', 'cloud', 'clustering', 'cms', 'code', 'compliance', 'content', 'conversion', 'copywriting', 'crm', 'css', 'customer', 'data', 'database', 'debugging', 'deployment', 'design', 'devops', 'documentation', 'ecommerce', 'email', 'engineering', 'finance', 'frontend', 'gdpr', 'git', 'growth', 'hosting', 'html', 'i18n', 'infrastructure', 'integration', 'javascript', 'kubernetes', 'leadership', 'legal', 'linux', 'localization', 'machine_learning', 'management', 'marketing', 'metrics', 'microservices', 'mobile', 'monitoring', 'networking', 'operations', 'optimization', 'payments', 'performance', 'personalization', 'photography', 'planning', 'platform', 'privacy', 'product', 'project', 'psychology', 'qa', 'react', 'recruiting', 'redis', 'research', 'responsive', 'rest', 'retention', 'revenue', 'saas', 'sales', 'scalability', 'security', 'seo', 'serverless', 'social', 'sql', 'strategy', 'support', 'systems', 'testing', 'typography', 'ui', 'usability', 'ux', 'video', 'visualization', 'web', 'wordpress', 'writing']),
      
      contexts: new Set(['startup_founder', 'enterprise_cto', 'indie_developer', 'growth_hacker', 'product_manager', 'data_scientist', 'devops_engineer', 'frontend_dev', 'backend_dev', 'fullstack_dev', 'ui_designer', 'ux_researcher', 'content_creator', 'social_media_manager', 'seo_specialist', 'email_marketer', 'sales_engineer', 'customer_success', 'technical_writer', 'qa_engineer', 'security_analyst', 'business_analyst', 'project_coordinator', 'scrum_master', 'brand_strategist', 'creative_director', 'copywriter', 'community_manager', 'support_engineer'])
    };
  }
  
  extractTags(request) {
    const words = request.toLowerCase().split(/\s+/);
    return {
      actions: words.filter(word => this.tagSoup.actions.has(word)),
      skills: words.filter(word => this.tagSoup.skills.has(word)),
      contexts: words.filter(word => this.tagSoup.contexts.has(word))
    };
  }
  
  findBestAgent(request, availableAgents) {
    const requestTags = this.extractTags(request);
    
    // Score each agent based on tag overlap
    const scored = availableAgents.map(agent => ({
      agent,
      score: this.calculateTagMatch(requestTags, agent.tags),
      reasoning: this.explainMatch(requestTags, agent.tags)
    }));
    
    // Sort by score, return top matches
    return scored.sort((a, b) => b.score - a.score);
  }
  
  calculateTagMatch(requestTags, agentTags) {
    let score = 0;
    
    // Action match (high weight - what they want to do)
    const actionMatches = requestTags.actions.filter(action => 
      agentTags.actions?.includes(action)
    ).length;
    score += actionMatches * 3;
    
    // Skill match (medium weight - what's needed)
    const skillMatches = requestTags.skills.filter(skill =>
      agentTags.skills?.includes(skill)  
    ).length;
    score += skillMatches * 2;
    
    // Context match (low weight - situational)
    const contextMatches = requestTags.contexts.filter(context =>
      agentTags.contexts?.includes(context)
    ).length;
    score += contextMatches * 1;
    
    return score;
  }
}
```

### **Interactive Workflow Engine**
```javascript
class InteractiveWorkflowEngine {
  async executeAgent(agent, request, context) {
    // Execute agent's core work
    const result = await agent.handle(request, context);
    
    // Always generate interactive checklist
    if (result.type !== 'checklist') {
      result = this.convertToChecklist(result, agent);
    }
    
    // Present to user
    await this.presentChecklist(result);
    
    // Get user choices
    const userChoices = await this.getUserChoices(result.choices);
    
    // Update workflow based on choices
    const nextSteps = this.buildNextSteps(userChoices, result);
    
    // Continue or pause
    return nextSteps;
  }
  
  async presentChecklist(result) {
    console.log(chalk.green('\n✅ Work Completed:'));
    result.completed.forEach(item => console.log(`  - ${item}`));
    
    console.log(chalk.blue('\n📋 Next Steps Available:'));
    result.next_steps.forEach((step, i) => 
      console.log(`  ${i+1}. ${step.description} (${step.agent}, ~${step.time})`)
    );
    
    if (result.choices) {
      console.log(chalk.yellow('\n❓ Your Choice:'));
      result.choices.forEach((choice, i) => 
        console.log(`  ${i+1}. ${choice.description}`)
      );
    }
  }
  
  convertToChecklist(result, agent) {
    // Convert any agent result to interactive checklist format
    return {
      type: 'checklist',
      completed: [result.summary || `${agent.name} completed work`],
      next_steps: this.generateNextSteps(result, agent),
      choices: this.generateChoices(result, agent),
      result: result // Original result preserved
    };
  }
}
```

### **Your Writer System Integration**
```yaml
# Migration path for your proven writer system
# agents/specialized/content-strategist.yaml (from your writer/prompts/01_ContentStrategist.md)

metadata:
  id: "content_strategist" 
  name: "Content Strategist"
  migrated_from: "writer/prompts/01_ContentStrategist.md"

tags:
  actions: [analyze, plan, strategize, define, research]
  skills: [content, strategy, audience_analysis, goal_setting, planning]
  domains: [content_marketing, publishing, education, communication]
  contexts: [startup, enterprise, personal_brand, thought_leadership]

scenarios:
  content_planning:
    trigger: "write *" || "create content" || "blog post" || "article"
    workflow:
      - self: "analyze_project_context"
      - self: "define_audience_and_goals" 
      - checklist_pause: true
      - user_choice: "research_depth"
      - conditional_handoff: "researcher" # based on user choice

checklist_behavior:
  # Preserve your exact workflow pattern
  completion_template: |
    ## ✅ Content Strategy Complete
    - Project context analyzed 
    - Target audience defined: {{audience}}
    - Content goals established: {{goals}}
    - Content plan outlined: {{plan}}
    
    ## 📋 Recommended Next Steps
    1. 🔍 **Research Phase** (researcher, 1-2 hours)
       - Gather supporting information
       - Competitive content analysis
       - Fact-checking preparation
       
    2. ✍️ **Writing Phase** (writer, 2-4 hours)
       - Create detailed outline
       - Write first draft
       - Include placeholder for research
       
    3. 🎨 **Content Enhancement** (visual_specialist, 30 min)
       - Plan supporting visuals
       - Create content templates
       
    ## ❓ What's Your Approach?
    - **Research first**: Deep dive before writing
    - **Write first**: Start writing, research specific gaps
    - **Parallel work**: Research and writing simultaneously
    - **Skip research**: Use existing knowledge only
    
    **Your choice shapes the workflow and timeline.**

# Preserve your exact handoff pattern
handoff_patterns:
  research_needed: ">>>HANDOFF TO researcher>>>"
  ready_to_write: ">>>HANDOFF TO writer>>>"
  need_visuals: ">>>HANDOFF TO visual_specialist>>>"

system_prompt_file: "writer/prompts/01_ContentStrategist.md" # Use your exact prompt
```

## Key Innovations Preserved

1. **Tag Soup Routing**: Rich semantic understanding without rigid rules
2. **Scenario-Based Workflows**: Real-world patterns, not abstract flows  
3. **Interactive Checklists**: User control at key decision points
4. **Dynamic Tool Integration**: Any MCP/API/CLI becomes available
5. **Proven Writer Pattern**: Your successful handoff system preserved

This combines the **semantic intelligence** of tag soup with the **user control** of interactive checklists and the **proven workflow patterns** from your writer system.

The result: Intelligent routing + User control + Real-world workflows! 🎯