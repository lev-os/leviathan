/**
 * FlowMind Principle: BIDIRECTIONAL FLOW = INTELLIGENCE
 * This file ENABLES context switching for emergent intelligence.
 * Each workflow step loads a different context, enabling the LLM
 * to reason from different perspectives = emergent intelligence.
 */

/**
 * Execute a workflow step with FlowMind context switching
 * 
 * @param {Object} params - Workflow execution parameters
 * @param {string} params.workflowId - Workflow identifier (e.g., 'deep-analysis')
 * @param {string} params.challenge - The challenge to analyze (step 1 only)
 * @param {number} params.step - Current workflow step (1, 2, 3...)
 * @param {string} params.sessionId - Session identifier for persistence
 * @param {Object} params.previousResults - Results from previous step
 * @param {Object} deps - Dependency injection for testing
 * @param {ContextRegistry} deps.registry - Context discovery system
 * @param {ContextAssembler} deps.assembler - Recipe assembly system
 * @returns {Object} Step execution result with context and next step info
 */
export async function executeWorkflow(params, deps = null) {
  const { workflowId, challenge, step = 1, sessionId, previousResults } = params
  
  // Dependency injection for testing, or use global registry/assembler
  const { registry, assembler } = deps || {}
  
  try {
    // Load workflow context using workflow ID
    const workflowContext = await registry?.getContext(workflowId) || 
                           { metadata: { name: workflowId }, steps: [] }
    
    // Get current step configuration - check both locations
    const steps = workflowContext.steps || workflowContext.workflow_config?.steps || []
    const stepConfig = steps[step - 1] || { agent: 'ceo' }
    
    // Load agent context for this step (enables context switching)
    const agentContext = await registry?.getContext(stepConfig.agent) ||
                        { metadata: { name: stepConfig.agent || 'ceo' } }
    
    // Assemble recipe for this step (combines workflow + agent + challenge)
    const assemblyContext = {
      workflow: workflowContext,
      agent: agentContext,
      challenge,
      step,
      previousResults
    }
    
    const assembledRecipe = await assembler?.assemble?.(assemblyContext) || assemblyContext
    
    // Build LLM instructions for this context
    const llmInstructions = buildLLMInstructions(agentContext, challenge, step, previousResults)
    
    // Determine if there are more steps
    const hasNextStep = step < (workflowContext.steps?.length || 1)
    
    return {
      context: assembledRecipe,
      step,
      hasNextStep,
      nextStep: hasNextStep ? step + 1 : null,
      llm_instructions: llmInstructions,
      results: null, // Will be populated by LLM response
      previousResults: previousResults, // Preserve previous results
      sessionId
    }
    
  } catch (error) {
    // Graceful fallback for v0.1.0
    console.log(`ERROR in executeWorkflow: ${error.message}`)
    
    // Build fallback instructions with same logic as main function
    let fallbackInstructions = `You are the CEO agent. `
    if (step === 1 && challenge) {
      fallbackInstructions += `Analyze this challenge: ${challenge}`
    } else if (previousResults) {
      const challengeText = challenge || 'the current situation'
      fallbackInstructions += `Analyze: ${challengeText}\n\nBuild on these previous results:\n\n`
      fallbackInstructions += `Previous Results: ${JSON.stringify(previousResults, null, 2)}`
    } else {
      fallbackInstructions += `Analyze: ${challenge}`
    }
    
    return {
      context: { 
        metadata: { name: workflowId },
        agent: { metadata: { name: 'ceo' } }
      },
      step,
      hasNextStep: false,
      llm_instructions: fallbackInstructions,
      previousResults: previousResults, // Preserve even in fallback
      error: error.message
    }
  }
}

/**
 * Build LLM instructions for context switching
 * FlowMind Principle: LLM IS THE RUNTIME
 */
function buildLLMInstructions(agentContext, challenge, step, previousResults) {
  const agentName = agentContext.metadata?.name || 'CEO'
  
  let instructions = `You are the ${agentName} agent. `
  
  if (step === 1 && challenge) {
    instructions += `Analyze this challenge: ${challenge}\n\n`
  } else if (previousResults) {
    const challengeText = challenge || 'the current situation'
    instructions += `Analyze: ${challengeText}\n\nBuild on these previous results:\n\n`
    instructions += `Previous Results: ${JSON.stringify(previousResults, null, 2)}\n\n`
  } else {
    instructions += `Analyze: ${challenge}\n\n`
  }
  
  instructions += `Provide your ${agentName} perspective on this challenge.`
  
  return instructions
}