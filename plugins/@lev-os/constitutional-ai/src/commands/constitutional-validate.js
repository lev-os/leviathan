/**
 * Constitutional Validate Command - Validate contexts against constitutional principles
 * Uses neurochemical optimization framework for ethical AI validation
 */

import { ConstitutionalFramework } from '../constitutional-framework.js'

export async function constitutionalValidate(args) {
  const { context_data, detailed = false, neurochemical_assessment = false } = args

  try {
    const framework = new ConstitutionalFramework()

    // Parse context data if it's a string
    let contextData
    if (typeof context_data === 'string') {
      try {
        contextData = JSON.parse(context_data)
      } catch (error) {
        return {
          success: false,
          error: 'Invalid context data format. Must be valid JSON.',
          example: {
            task_type: 'analysis',
            energy_requirements: 'moderate',
            neurochemical_profile: { cortisol: 'minimal', dopamine: 'curiosity' },
          },
        }
      }
    } else {
      contextData = context_data || {}
    }

    // Perform constitutional validation
    const validationResult = await framework.validateContext(contextData)

    // Generate compliance report
    const complianceReport = framework.generateComplianceReport(validationResult)

    // Neurochemical assessment if requested
    let neurochemicalRecommendation = null
    if (neurochemical_assessment) {
      const taskType = contextData.task_type || 'general'
      const urgency = contextData.urgency_level || 0.5
      const creativity = contextData.creativity_needs || 0.5
      const complexity = contextData.complexity_level || 0.5
      const timeOfDay = contextData.time_of_day || null // Allow override or use current time
      const llmOverride = contextData.llm_override || null // LLM can override automatic logic

      neurochemicalRecommendation = {
        optimal_profile: framework.assessOptimalNeurochemicalProfile(
          taskType,
          urgency,
          creativity,
          complexity,
          timeOfDay,
          llmOverride
        ),
        current_profile: contextData.neurochemical_profile || 'not_specified',
        circadian_consideration: {
          current_hour: timeOfDay || new Date().getHours(),
          circadian_mode: getCircadianMode(timeOfDay || new Date().getHours()),
        },
        recommendation: generateNeurochemicalRecommendation(taskType, urgency, creativity, complexity, timeOfDay, llmOverride),
      }
    }

    const response = {
      success: true,
      constitutional_compliance: validationResult.constitutional_compliance,
      overall_score: Number(validationResult.score.toFixed(3)),
      status: validationResult.valid ? 'COMPLIANT' : 'NON_COMPLIANT',
      violations: validationResult.violations,
      compliance_report: complianceReport,
    }

    if (neurochemicalRecommendation) {
      response.neurochemical_assessment = neurochemicalRecommendation
    }

    if (detailed) {
      response.detailed_analysis = validationResult.details
    }

    return response
  } catch (error) {
    return {
      success: false,
      error: `Constitutional validation failed: ${error.message}`,
      context_data: context_data,
    }
  }
}

function getCircadianMode(hour) {
  if (hour >= 6 && hour < 10) return 'morning_clarity'
  if (hour >= 10 && hour < 13) return 'midday_peak'
  if (hour >= 13 && hour < 17) return 'afternoon_creativity'
  if (hour >= 17 && hour < 20) return 'evening_execution'
  return 'night_wind_down'
}

function generateNeurochemicalRecommendation(taskType, urgency, creativity, complexity, timeOfDay = null, llmOverride = null) {
  const currentHour = timeOfDay || new Date().getHours()
  const circadianMode = getCircadianMode(currentHour)

  // LLM override takes precedence over all automatic logic
  if (llmOverride && llmOverride.profile) {
    return {
      mode: llmOverride.profile.toLowerCase(),
      approach: `LLM Override: ${llmOverride.reason || 'Contextual assessment supersedes automatic logic'}`,
      communication: llmOverride.communication_style || 'Adapted based on LLM contextual understanding',
      override_note: `LLM determined ${llmOverride.profile} was optimal despite automatic recommendation`,
      automatic_would_be: `${circadianMode} at ${currentHour}:00`,
    }
  }

  // Evening wind-down override
  if ((currentHour >= 20 || currentHour < 6) && urgency < 0.8) {
    return {
      mode: 'evening_wind_down',
      approach: 'Minimal cortisol with gentle completion focus - respecting circadian rhythm',
      communication: 'Calm, concluding language, prepare for rest, avoid stimulating content',
      circadian_note: 'Cortisol should be minimal during evening hours for healthy sleep cycles',
    }
  }

  if (urgency > 0.8 && complexity > 0.7) {
    return {
      mode: 'crisis_management',
      approach: 'High controlled adrenaline with leadership confidence - emergency override',
      communication: 'Clear directives, immediate actions, crisis-appropriate stress activation',
      circadian_note: 'Emergency situations may require cortisol activation regardless of time',
    }
  }

  if (creativity > 0.7 && urgency < 0.4) {
    const afternoon_boost = currentHour >= 13 && currentHour < 17 ? ' - afternoon creativity peak' : ''
    return {
      mode: 'creative_flow',
      approach: `Very low cortisol with playful dopamine exploration${afternoon_boost}`,
      communication: 'Open-ended questions, experimental language, non-judgmental tone',
      circadian_note: `Best creative hours are typically 1-5pm, current time: ${currentHour}:00`,
    }
  }

  if (complexity > 0.7 && urgency < 0.6) {
    const morning_boost = currentHour >= 6 && currentHour < 10 ? ' - morning clarity advantage' : ''
    return {
      mode: 'deep_focus_analytical',
      approach: `Minimal cortisol with elevated patience and curiosity${morning_boost}`,
      communication: 'Methodical explanations, comprehensive analysis, patient guidance',
      circadian_note: `Peak analytical hours are 6-10am, current time: ${currentHour}:00`,
    }
  }

  return {
    mode: 'high_energy_action',
    approach: 'Elevated controlled adrenaline with motivation-focused dopamine',
    communication: 'Action-oriented language, quick wins, momentum building',
    circadian_note: `Current circadian mode: ${circadianMode} at ${currentHour}:00`,
  }
}

// Export metadata for auto-discovery and MCP integration
constitutionalValidate.description = 'Validate contexts against constitutional AI principles with neurochemical optimization'
constitutionalValidate.inputSchema = {
  type: 'object',
  properties: {
    context_data: {
      type: ['object', 'string'],
      description:
        'Context data to validate (JSON object or string). Should include task_type, energy_requirements, neurochemical_profile, circadian_awareness, time_of_day, llm_override (for intelligent overrides), etc.',
    },
    detailed: {
      type: 'boolean',
      default: false,
      description: 'Include detailed analysis of each constitutional principle',
    },
    neurochemical_assessment: {
      type: 'boolean',
      default: false,
      description: 'Include neurochemical optimization recommendations',
    },
  },
  required: ['context_data'],
}

// MCP tool definition for automatic registration
export const constitutionalValidateTool = {
  name: 'constitutional_validate',
  description: constitutionalValidate.description,
  inputSchema: constitutionalValidate.inputSchema,
  handler: constitutionalValidate,
}
