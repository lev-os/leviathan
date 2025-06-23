# Agent Architecture: Sequential + Interactive Checklists

## Core Structure

### **Tag Soup Semantic Routing**
```yaml
tags:
  actions: [analyze, architect, approve, audit, automate, benchmark, brainstorm, brand, budget, build, campaign, code, communicate, compete, compile, configure, convert, create, debug, decide, delegate, deliver, deploy, design, develop, diagnose, document, draft, educate, email, engage, estimate, evaluate, execute, experiment, explore, feedback, forecast, fund, generate, grow, guide, hire, ideate, implement, improve, influence, integrate, interview, investigate, iterate, launch, lead, learn, maintain, manage, market, measure, migrate, model, moderate, monitor, negotiate, optimize, organize, outline, pitch, plan, post, present, prioritize, prototype, publish, qualify, quantify, question, rank, recruit, refactor, release, report, research, respond, review, scale, schedule, scope, secure, segment, sell, ship, solve, specify, sprint, strategize, support, survey, sync, synthesize, target, test, track, train, transform, translate, troubleshoot, update, upgrade, validate, verify, visualize, write]
  
  skills: [accessibility, acquisition, agile, analytics, animation, api, architecture, automation, blockchain, branding, budgeting, business, caching, cloud, clustering, cms, code, compliance, content, conversion, copywriting, crm, css, customer, data, database, debugging, deployment, design, devops, documentation, ecommerce, email, engineering, finance, frontend, gdpr, git, growth, hosting, html, i18n, infrastructure, integration, javascript, kubernetes, leadership, legal, linux, localization, machine_learning, management, marketing, metrics, microservices, mobile, monitoring, networking, operations, optimization, payments, performance, personalization, photography, planning, platform, privacy, product, project, psychology, qa, react, recruiting, redis, research, responsive, rest, retention, revenue, saas, sales, scalability, security, seo, serverless, social, sql, strategy, support, systems, testing, typography, ui, usability, ux, video, visualization, web, wordpress, writing]
  
  contexts: [startup_founder, enterprise_cto, indie_developer, growth_hacker, product_manager, data_scientist, devops_engineer, frontend_dev, backend_dev, fullstack_dev, ui_designer, ux_researcher, content_creator, social_media_manager, seo_specialist, email_marketer, sales_engineer, customer_success, technical_writer, qa_engineer, security_analyst, business_analyst, project_coordinator, scrum_master, brand_strategist, creative_director, copywriter, community_manager, support_engineer]
```

### **Agent Definition Pattern**
```yaml
# agents/core/ceo.yaml
metadata:
  id: "ceo"
  name: "Chief Executive Officer"
  
tags:
  actions: [plan, strategize, decide, prioritize, approve, budget, evaluate]
  skills: [strategy, leadership, finance, communication, decision_making]
  domains: [business, marketing, product, operations, finance]
  contexts: [startup, enterprise, crisis, growth, pivot, launch]

scenarios:
  crisis_response:
    trigger: "app is down" || "losing money" || "emergency"
    sequential_workflow:
      - self: "assess_situation"
      - self: "communicate_stakeholders"
      - handoff: "dev" # for technical fixes
      
checklist_behavior:
  always_generate: true
  completion_template: |
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

system_prompt: |
  You are a strategic business leader focused on growth and smart decision-making.
  Always end your work with an interactive checklist showing completed work,
  strategic options, and letting the user choose priorities.
```

### **Writer System Integration**
```yaml
# agents/specialized/content-strategist.yaml
handoff_patterns:
  research_needed: ">>>HANDOFF TO researcher>>>"
  ready_to_write: ">>>HANDOFF TO writer>>>"
  
sequential_workflow:
  content_creation:
    - self: "analyze_project_context"
    - self: "define_audience_and_goals"
    - checklist_pause: true
      question: "Strategy complete. What's next?"
      options:
        - "Research first" → handoff: "researcher"
        - "Start writing" → handoff: "writer"
        - "Plan visuals" → handoff: "visual_specialist"

system_prompt_file: "writer/prompts/01_ContentStrategist.md" # Use existing prompt
```

### **Sequential Workflow Engine**
```javascript
class SequentialWorkflowEngine {
  async executeWorkflow(initialRequest) {
    let currentAgent = this.routeToAgent(initialRequest);
    let context = { request: initialRequest, history: [] };
    
    while (currentAgent) {
      const result = await currentAgent.handle(context.request, context);
      context.history.push({ agent: currentAgent.id, result });
      
      const checklist = this.ensureChecklist(result, currentAgent);
      console.log(this.formatChecklist(checklist));
      
      const userChoice = await this.getUserChoice(checklist.choices);
      currentAgent = this.getNextAgent(userChoice, context);
      context.request = this.buildNextRequest(userChoice, result);
    }
    
    return context;
  }
}
```

## Key Principles

1. **Sequential Execution**: One agent at a time, clear handoffs
2. **Interactive Checklists**: User controls flow at decision points  
3. **Tag Soup Routing**: Rich semantic matching without rigid rules
4. **Preserved Patterns**: Your writer system handoffs work exactly the same
5. **Scenario-Based**: Real-world patterns like crisis response

No parallel complexity for now - pure sequential with user choice points.