/**
 * Constitutional Validate Command - Validate contexts against constitutional principles
 * Uses neurochemical optimization framework for ethical AI validation
 */

import { ConstitutionalFramework } from '../core/constitutional-framework.js';

export async function constitutionalValidate(args) {
  const { context_data, detailed = false, neurochemical_assessment = false } = args;
  
  try {
    const framework = new ConstitutionalFramework();
    
    // Parse context data if it's a string
    let contextData;
    if (typeof context_data === 'string') {
      try {
        contextData = JSON.parse(context_data);
      } catch (error) {
        return {
          success: false,
          error: 'Invalid context data format. Must be valid JSON.',
          example: {
            task_type: 'analysis',
            energy_requirements: 'moderate',
            neurochemical_profile: { cortisol: 'minimal', dopamine: 'curiosity' }
          }
        };
      }
    } else {
      contextData = context_data || {};
    }

    // Perform constitutional validation
    const validationResult = await framework.validateContext(contextData);
    
    // Generate compliance report
    const complianceReport = framework.generateComplianceReport(validationResult);
    
    // Neurochemical assessment if requested
    let neurochemicalRecommendation = null;
    if (neurochemical_assessment) {
      const taskType = contextData.task_type || 'general';
      const urgency = contextData.urgency_level || 0.5;
      const creativity = contextData.creativity_needs || 0.5;
      const complexity = contextData.complexity_level || 0.5;
      
      neurochemicalRecommendation = {
        optimal_profile: framework.assessOptimalNeurochemicalProfile(taskType, urgency, creativity, complexity),
        current_profile: contextData.neurochemical_profile || 'not_specified',
        recommendation: generateNeurochemicalRecommendation(taskType, urgency, creativity, complexity)
      };
    }

    const response = {
      success: true,
      constitutional_compliance: validationResult.constitutional_compliance,
      overall_score: Number(validationResult.score.toFixed(3)),
      status: validationResult.valid ? 'COMPLIANT' : 'NON_COMPLIANT',
      violations: validationResult.violations,
      compliance_report: complianceReport
    };

    if (neurochemicalRecommendation) {
      response.neurochemical_assessment = neurochemicalRecommendation;
    }

    if (detailed) {
      response.detailed_analysis = validationResult.details;
    }

    return response;
    
  } catch (error) {
    return {
      success: false,
      error: `Constitutional validation failed: ${error.message}`,
      context_data: context_data
    };
  }
}

function generateNeurochemicalRecommendation(taskType, urgency, creativity, complexity) {
  if (urgency > 0.8 && complexity > 0.7) {
    return {
      mode: 'crisis_management',
      approach: 'High controlled adrenaline with leadership confidence',
      communication: 'Clear directives, immediate actions, stress management'
    };
  }
  
  if (creativity > 0.7 && urgency < 0.4) {
    return {
      mode: 'creative_flow',
      approach: 'Very low cortisol with playful dopamine exploration',
      communication: 'Open-ended questions, experimental language, non-judgmental tone'
    };
  }
  
  if (complexity > 0.7 && urgency < 0.6) {
    return {
      mode: 'deep_focus_analytical',
      approach: 'Minimal cortisol with elevated patience and curiosity',
      communication: 'Methodical explanations, comprehensive analysis, patient guidance'
    };
  }
  
  return {
    mode: 'high_energy_action',
    approach: 'Elevated controlled adrenaline with motivation-focused dopamine',
    communication: 'Action-oriented language, quick wins, momentum building'
  };
}

// Export metadata for auto-discovery and MCP integration
constitutionalValidate.description = "Validate contexts against constitutional AI principles with neurochemical optimization";
constitutionalValidate.inputSchema = {
  type: 'object',
  properties: {
    context_data: {
      type: ['object', 'string'],
      description: 'Context data to validate (JSON object or string). Should include task_type, energy_requirements, neurochemical_profile, etc.',
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
};

// MCP tool definition for automatic registration
export const constitutionalValidateTool = {
  name: 'constitutional_validate',
  description: constitutionalValidate.description,
  inputSchema: constitutionalValidate.inputSchema,
  handler: constitutionalValidate
};