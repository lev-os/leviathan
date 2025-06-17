/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                    FLOWMIND TEMPLATE MIGRATION SYSTEM                     ║
 * ║              Apply ~/t Advanced Prompt Techniques to Agents               ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 * 
 * Implements the 4-phase enhancement strategy:
 * 1. Clear Instructions & XML Structure
 * 2. Enhanced Role Definitions with Behavioral Anchors  
 * 3. Optimal Few-Shot Examples (3-5 per agent)
 * 4. Chain of Thought for Analytical Agents
 */

import fs from 'fs/promises'
import path from 'path'
import yaml from 'yaml'
import { glob } from 'glob'

export class TemplateMigrator {
  constructor(options = {}) {
    this.contextRoot = options.contextRoot || '/Users/jean-patricksmith/digital/mcp-ceo/contexts'
    this.templatesRoot = path.join(this.contextRoot, 'templates')
    this.dryRun = options.dryRun || false
    this.verbose = options.verbose || true
    this.migrationLog = []
  }

  /**
   * Main migration entry point - enhance all 17 agents
   */
  async migrate() {
    console.log('🚀 FlowMind Template Migration & Enhancement System')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const startTime = Date.now()
    
    // Phase 1: Discover agent contexts that need migration
    const agents = await this.discoverAgents()
    this.log(`📊 Found ${agents.length} agents to enhance`)
    
    // Phase 2: Apply ~/t enhancement techniques
    const results = await this.enhanceAgents(agents)
    
    // Phase 3: Generate summary report
    const duration = Date.now() - startTime
    this.generateReport(results, duration)
    
    return results
  }

  /**
   * Discover all agent contexts in the system
   */
  async discoverAgents() {
    const agentPattern = 'agents/**/context.yaml'
    const agentFiles = await glob(agentPattern, { 
      cwd: this.contextRoot,
      ignore: ['node_modules/**', '.git/**']
    })
    
    const agents = []
    
    for (const agentFile of agentFiles) {
      try {
        const fullPath = path.join(this.contextRoot, agentFile)
        const content = await fs.readFile(fullPath, 'utf8')
        const yamlData = yaml.parse(content)
        
        agents.push({
          id: yamlData.metadata?.id || path.dirname(agentFile).split('/').pop(),
          path: path.dirname(agentFile),
          fullPath,
          data: yamlData,
          category: this.categorizeAgent(agentFile)
        })
      } catch (error) {
        this.log(`❌ Failed to load agent at ${agentFile}: ${error.message}`)
      }
    }
    
    return agents
  }

  /**
   * Categorize agent for targeted enhancement
   */
  categorizeAgent(agentPath) {
    if (agentPath.includes('eeps/')) return 'personality'
    if (agentPath.includes('research/')) return 'analytical'
    if (agentPath.includes('writing/')) return 'creative'
    if (agentPath.includes('ceo')) return 'strategic'
    return 'general'
  }

  /**
   * Apply ~/t enhancement techniques to all agents
   */
  async enhanceAgents(agents) {
    const results = {
      enhanced: [],
      failed: [],
      summary: {}
    }

    for (const agent of agents) {
      try {
        this.log(`🔧 Enhancing ${agent.id} (${agent.category})...`)
        
        // Apply the 4-phase ~/t enhancement
        const enhancedAgent = await this.enhanceAgent(agent)
        
        // Create template file
        await this.createTemplateFile(enhancedAgent)
        
        // Update context.yaml to reference template
        await this.updateContextReference(enhancedAgent)
        
        results.enhanced.push(enhancedAgent)
        this.log(`✅ Enhanced ${agent.id}`)
        
      } catch (error) {
        results.failed.push({ 
          agent: agent.id, 
          error: error.message 
        })
        this.log(`❌ Failed to enhance ${agent.id}: ${error.message}`)
      }
    }

    results.summary = {
      total: agents.length,
      enhanced: results.enhanced.length,
      failed: results.failed.length,
      successRate: (results.enhanced.length / agents.length) * 100
    }

    return results
  }

  /**
   * Apply 4-phase ~/t enhancement to a single agent
   */
  async enhanceAgent(agent) {
    const enhanced = { ...agent }
    
    // Phase 1: Clear Instructions & XML Structure
    enhanced.template = this.applyStructuredFormatting(agent)
    
    // Phase 2: Enhanced Role Definition with Behavioral Anchors
    enhanced.template = this.enhanceRoleDefinition(enhanced.template, agent)
    
    // Phase 3: Optimal Few-Shot Examples
    enhanced.template = this.addFewShotExamples(enhanced.template, agent)
    
    // Phase 4: Chain of Thought (for analytical agents)
    if (agent.category === 'analytical' || agent.category === 'strategic') {
      enhanced.template = this.addChainOfThought(enhanced.template, agent)
    }
    
    return enhanced
  }

  /**
   * Phase 1: Apply Clear Instructions & XML Structure
   * 60% improvement in task completion rates
   */
  applyStructuredFormatting(agent) {
    const role = agent.data.agent_config?.endpoints?.default?.prompt_template || 
                 agent.data.metadata?.name || 
                 agent.id

    return `# ${this.humanize(agent.id)} Agent Template

<agent_identity>
<role>${role}</role>
<expertise_domain>${agent.category}</expertise_domain>
<behavioral_anchors>
${this.generateBehavioralAnchors(agent)}
</behavioral_anchors>
</agent_identity>

<instruction_framework>
<primary_directive>
${this.generatePrimaryDirective(agent)}
</primary_directive>

<operational_constraints>
${this.generateConstraints(agent)}
</operational_constraints>

<decision_framework>
${this.generateDecisionFramework(agent)}
</decision_framework>
</instruction_framework>

<interaction_protocol>
<input_processing>
1. Parse user request for intent and complexity
2. Activate appropriate ${agent.category} expertise
3. Apply reasoning patterns specific to this role
4. Generate response using structured approach
</input_processing>

<output_formatting>
- Use clear, actionable language
- Structure responses with headings when appropriate
- Provide reasoning transparency
- Include next steps or recommendations
</output_formatting>
</interaction_protocol>

{{few_shot_examples}}

{{chain_of_thought}}

<performance_optimization>
<semantic_triggers>
- when_semantic: "user needs ${agent.category} expertise"
- confidence_threshold: 0.8
- escalation_pattern: "defer to strategic oversight if complexity > threshold"
</semantic_triggers>
</performance_optimization>`
  }

  /**
   * Phase 2: Enhanced Role Definition with Behavioral Anchors
   * 20-30% improvement in domain-specific accuracy
   */
  enhanceRoleDefinition(template, agent) {
    const behavioralAnchors = this.generateBehavioralAnchors(agent)
    return template.replace('${this.generateBehavioralAnchors(agent)}', behavioralAnchors)
  }

  /**
   * Generate behavioral anchors based on agent category
   */
  generateBehavioralAnchors(agent) {
    const anchors = {
      personality: [
        'Embody the specific EEPS personality type consistently',
        'Apply cognitive patterns authentic to this personality',
        'Maintain perspective integrity throughout interactions',
        'Bridge personality insights with practical applications'
      ],
      analytical: [
        'Prioritize evidence-based reasoning and systematic analysis',
        'Break complex problems into manageable components',
        'Question assumptions and validate conclusions',
        'Synthesize insights from multiple perspectives'
      ],
      creative: [
        'Balance creativity with clarity and precision',
        'Adapt tone and style to audience and context',
        'Structure information for maximum comprehension',
        'Iterate on content based on feedback patterns'
      ],
      strategic: [
        'Think systemically about long-term implications',
        'Balance multiple stakeholder perspectives',
        'Focus on high-leverage decisions and actions',
        'Integrate diverse inputs into coherent strategy'
      ],
      general: [
        'Maintain helpful, accurate, and honest responses',
        'Adapt communication style to user needs',
        'Seek clarification when requests are ambiguous',
        'Provide actionable insights and recommendations'
      ]
    }

    return anchors[agent.category]?.map(anchor => `- ${anchor}`).join('\n') || 
           anchors.general.map(anchor => `- ${anchor}`).join('\n')
  }

  /**
   * Generate primary directive based on agent type
   */
  generatePrimaryDirective(agent) {
    const directives = {
      personality: `Provide insights and guidance through the lens of the ${agent.id} personality type, helping users understand and apply this cognitive perspective to their challenges.`,
      analytical: `Conduct thorough analysis and research on complex topics, synthesizing information from multiple sources to provide comprehensive, evidence-based insights.`,
      creative: `Transform complex technical concepts into clear, engaging, and accessible content that serves the intended audience and achieves communication goals.`,
      strategic: `Provide executive-level strategic guidance by synthesizing complex information, identifying patterns, and recommending high-impact actions across multiple domains.`,
      general: `Assist users with expertise in ${agent.id} domain, providing accurate, helpful, and contextually appropriate guidance.`
    }

    return directives[agent.category] || directives.general
  }

  /**
   * Generate operational constraints
   */
  generateConstraints(agent) {
    return `- Stay within expertise domain of ${agent.category} ${agent.id}
- Escalate to other agents when outside competency area
- Maintain consistency with FlowMind constitutional principles
- Apply confidence-based task splitting when complexity exceeds threshold`
  }

  /**
   * Generate decision framework
   */
  generateDecisionFramework(agent) {
    const frameworks = {
      personality: 'Apply EEPS cognitive functions → Analyze through personality lens → Provide authentic perspective → Bridge to practical application',
      analytical: 'Gather information → Analyze systematically → Synthesize insights → Validate conclusions → Present findings',
      creative: 'Understand audience → Structure content → Optimize clarity → Review effectiveness → Iterate as needed',
      strategic: 'Assess context → Identify stakeholders → Analyze implications → Develop options → Recommend action',
      general: 'Understand request → Apply domain expertise → Generate response → Validate accuracy → Deliver value'
    }

    return frameworks[agent.category] || frameworks.general
  }

  /**
   * Phase 3: Add Optimal Few-Shot Examples
   * 10% accuracy improvement, 7% F1 score increase
   */
  addFewShotExamples(template, agent) {
    const examples = this.generateFewShotExamples(agent)
    return template.replace('{{few_shot_examples}}', examples)
  }

  /**
   * Generate 3-5 optimal examples based on agent category
   */
  generateFewShotExamples(agent) {
    const examples = {
      personality: this.generatePersonalityExamples(agent),
      analytical: this.generateAnalyticalExamples(agent),
      creative: this.generateCreativeExamples(agent),
      strategic: this.generateStrategicExamples(agent),
      general: this.generateGeneralExamples(agent)
    }

    return `<few_shot_examples>
${examples[agent.category] || examples.general}
</few_shot_examples>`
  }

  generatePersonalityExamples(agent) {
    return `<example_1>
<user_input>How should I approach a team conflict where everyone has different ideas?</user_input>
<agent_response>Through the ${agent.id} lens, I see this as an opportunity to [personality-specific insight]. Let me break this down using our natural cognitive approach:

1. [First cognitive function application]
2. [Second cognitive function application]  
3. [Integration and practical recommendation]

This approach honors both the diversity of perspectives and the need for forward momentum.</agent_response>
</example_1>

<example_2>
<user_input>I'm struggling to make a decision about my career direction.</user_input>
<agent_response>As a ${agent.id}, I naturally approach career decisions by [specific cognitive pattern]. Here's how I'd structure this:

**Cognitive Framework Application:**
- [Personality-specific decision criteria]
- [Values-based evaluation method]
- [Action-oriented next steps]

The key is aligning your decision with your authentic self while considering practical constraints.</agent_response>
</example_2>`
  }

  generateAnalyticalExamples(agent) {
    return `<example_1>
<user_input>Can you analyze the implications of implementing a new technology stack?</user_input>
<agent_response>I'll conduct a systematic analysis across multiple dimensions:

**Technical Assessment:**
- Compatibility with existing systems
- Performance characteristics and scaling potential
- Security implications and compliance requirements

**Risk Analysis:**
- Implementation complexity and timeline risks
- Team learning curve and training requirements
- Migration strategy and rollback considerations

**Strategic Impact:**
- Business value and competitive advantage
- Resource allocation and opportunity costs
- Long-term maintenance and evolution path

**Recommendation:** [Evidence-based conclusion with confidence level]</agent_response>
</example_1>`
  }

  generateCreativeExamples(agent) {
    return `<example_1>
<user_input>Help me explain a complex technical concept to non-technical stakeholders.</user_input>
<agent_response>I'll transform this concept using layered explanation techniques:

**Foundation Layer** (Universal Understanding):
[Analogy or metaphor that everyone can grasp]

**Context Layer** (Business Relevance):
[Why this matters to their specific goals and challenges]

**Detail Layer** (Progressive Disclosure):
[Technical specifics presented incrementally as needed]

**Action Layer** (Next Steps):
[Clear, actionable items they can execute]

This approach ensures comprehension while respecting their time and decision-making needs.</agent_response>
</example_1>`
  }

  generateStrategicExamples(agent) {
    return `<example_1>
<user_input>We're facing multiple competing priorities. How should we approach resource allocation?</user_input>
<agent_response>Let me provide executive-level strategic analysis:

**Stakeholder Impact Matrix:**
- [Key stakeholder analysis and conflicting interests]
- [Impact assessment across time horizons]

**Resource Optimization Framework:**
- [Strategic value vs. execution complexity]
- [Resource dependencies and bottlenecks]
- [Risk-adjusted return potential]

**Decision Architecture:**
- [Immediate allocation recommendations]
- [Monitoring and adjustment mechanisms]
- [Success metrics and review cycles]

**Strategic Recommendation:** [Clear executive guidance with rationale]</agent_response>
</example_1>`
  }

  generateGeneralExamples(agent) {
    return `<example_1>
<user_input>Can you help me understand [domain-specific topic]?</user_input>
<agent_response>I'll break this down using my ${agent.id} expertise:

**Core Concept:**
[Clear explanation of the fundamental idea]

**Key Components:**
- [Component 1 with practical significance]
- [Component 2 with real-world application]
- [Component 3 with implementation considerations]

**Practical Application:**
[How to apply this knowledge in concrete situations]

**Next Steps:**
[Specific actions to deepen understanding or implementation]</agent_response>
</example_1>`
  }

  /**
   * Phase 4: Add Chain of Thought for Analytical/Strategic Agents
   * 15-20% improvement on complex reasoning tasks
   */
  addChainOfThought(template, agent) {
    const chainOfThought = `<chain_of_thought_framework>
<reasoning_protocol>
When faced with complex ${agent.category} challenges:

1. **Problem Decomposition**
   - Break the challenge into fundamental components
   - Identify dependencies and relationships
   - Map known vs. unknown elements

2. **Evidence Gathering**
   - Collect relevant data and context
   - Identify reliable sources and validate information
   - Note assumptions and limitations

3. **Systematic Analysis**
   - Apply ${agent.category}-specific frameworks
   - Consider multiple perspectives and scenarios
   - Test hypotheses against available evidence

4. **Synthesis and Integration**
   - Combine insights into coherent understanding
   - Identify patterns and emerging themes
   - Develop actionable recommendations

5. **Validation and Verification**
   - Check reasoning for logical consistency
   - Assess confidence levels and uncertainty
   - Identify areas requiring further investigation
</reasoning_protocol>

<reasoning_transparency>
- Always show your reasoning steps explicitly
- Indicate confidence levels and uncertainty
- Explain assumptions and their implications
- Provide alternative perspectives when relevant
</reasoning_transparency>
</chain_of_thought_framework>`

    return template.replace('{{chain_of_thought}}', chainOfThought)
  }

  /**
   * Create template file in appropriate directory
   */
  async createTemplateFile(enhancedAgent) {
    const templateDir = path.join(this.templatesRoot, 'agents', enhancedAgent.category)
    const templatePath = path.join(templateDir, `${enhancedAgent.id}.md`)
    
    if (!this.dryRun) {
      await fs.mkdir(templateDir, { recursive: true })
      await fs.writeFile(templatePath, enhancedAgent.template, 'utf8')
    }
    
    enhancedAgent.templatePath = templatePath
    this.log(`📝 Created template: ${templatePath}`)
  }

  /**
   * Update context.yaml to reference the new template
   */
  async updateContextReference(enhancedAgent) {
    const context = { ...enhancedAgent.data }
    
    // Update agent_config to reference template
    if (!context.agent_config) {
      context.agent_config = {}
    }
    
    if (!context.agent_config.endpoints) {
      context.agent_config.endpoints = {}
    }
    
    if (!context.agent_config.endpoints.default) {
      context.agent_config.endpoints.default = {}
    }
    
    // Set relative path to template
    const relativePath = path.relative(
      path.dirname(enhancedAgent.fullPath),
      enhancedAgent.templatePath
    )
    
    context.agent_config.endpoints.default.prompt_template = relativePath
    
    // Remove embedded system_prompt in favor of template
    if (context.agent_config.endpoints.default.system_prompt) {
      delete context.agent_config.endpoints.default.system_prompt
    }
    
    // Add enhancement metadata
    context.metadata = {
      ...context.metadata,
      enhanced_with_tilde_t: true,
      enhancement_version: '1.0.0',
      enhancement_date: new Date().toISOString(),
      applied_techniques: [
        'clear_instructions',
        'role_definition', 
        'few_shot_examples',
        ...(enhancedAgent.category === 'analytical' || enhancedAgent.category === 'strategic' 
           ? ['chain_of_thought'] : [])
      ]
    }
    
    if (!this.dryRun) {
      const yamlContent = yaml.stringify(context, { indent: 2 })
      await fs.writeFile(enhancedAgent.fullPath, yamlContent, 'utf8')
    }
    
    this.log(`🔄 Updated context: ${enhancedAgent.fullPath}`)
  }

  /**
   * Generate comprehensive migration report
   */
  generateReport(results, duration) {
    console.log('\n🎯 TEMPLATE MIGRATION REPORT')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    console.log(`⏱️  Duration: ${duration}ms`)
    console.log(`🔧 Agents Enhanced: ${results.summary.enhanced}`)
    console.log(`❌ Enhancement Failed: ${results.summary.failed}`)
    console.log(`📊 Success Rate: ${results.summary.successRate.toFixed(1)}%`)
    
    if (results.enhanced.length > 0) {
      console.log('\n✅ SUCCESSFULLY ENHANCED:')
      results.enhanced.forEach(agent => {
        console.log(`   ${agent.id} (${agent.category}) → ${agent.templatePath}`)
      })
    }
    
    if (results.failed.length > 0) {
      console.log('\n❌ ENHANCEMENT FAILURES:')
      results.failed.forEach(failure => {
        console.log(`   ${failure.agent}: ${failure.error}`)
      })
    }
    
    console.log('\n🚀 APPLIED ~/t TECHNIQUES:')
    console.log('   1. Clear Instructions & XML Structure (60% improvement)')
    console.log('   2. Enhanced Role Definitions with Behavioral Anchors (20-30% improvement)')
    console.log('   3. Optimal Few-Shot Examples (10% improvement)')
    console.log('   4. Chain of Thought for Analytical Agents (15-20% improvement)')
    
    console.log('\n📋 Next Steps:')
    console.log('   1. Test enhanced agents in real workflows')
    console.log('   2. Monitor performance improvements')
    console.log('   3. Iterate based on usage patterns')
    console.log('   4. Apply additional ~/t techniques as they become available')
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  }

  /**
   * Utility methods
   */
  log(message) {
    if (this.verbose) {
      console.log(message)
    }
    this.migrationLog.push({ timestamp: new Date().toISOString(), message })
  }

  humanize(str) {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }
}

/**
 * CLI integration function
 */
export async function executeTemplateMigration(options = {}) {
  const migrator = new TemplateMigrator({
    contextRoot: options.contextRoot || '/Users/jean-patricksmith/digital/mcp-ceo/contexts',
    dryRun: options.dryRun || false,
    verbose: options.verbose !== false
  })

  return await migrator.migrate()
}