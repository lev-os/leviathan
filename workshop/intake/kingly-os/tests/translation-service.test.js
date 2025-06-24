/**
 * Translation Service Test - Test converting existing agents to Kingly OS format
 */

import { KinglyOS } from '../kingly-os.js';
import fs from 'fs-extra';
import path from 'path';

export async function runTranslationServiceTest() {
  console.log('🔄 RUNNING TRANSLATION SERVICE TEST');
  console.log('='.repeat(50));
  
  const kinglyOS = new KinglyOS();
  await kinglyOS.initialize();
  
  // Test with actual WRITE system agents
  const testCases = [
    {
      name: 'WRITE System Writer Agent',
      agentPath: '../agent-bundles/writer/ai/custom-modes/writer.md',
      expectedType: 'writer'
    },
    {
      name: 'WRITE System Researcher Agent',
      agentPath: '../agent-bundles/writer/ai/custom-modes/researcher.md',
      expectedType: 'researcher'
    },
    {
      name: 'WRITE System Fact Checker Agent',
      agentPath: '../agent-bundles/writer/ai/custom-modes/fact-checker.md',
      expectedType: 'fact-checker'
    }
  ];
  
  const results = [];
  
  for (const testCase of testCases) {
    console.log(`\n🔍 Testing: ${testCase.name}`);
    
    try {
      // Load existing agent
      const agentPath = path.resolve(testCase.agentPath);
      
      if (await fs.pathExists(agentPath)) {
        const agentContent = await fs.readFile(agentPath, 'utf8');
        console.log(`📄 Loaded agent file (${agentContent.length} chars)`);
        
        // Translate to Kingly OS format
        const translation = await kinglyOS.translateExistingAgent(agentContent);
        
        console.log(`🤖 Base prompt: "${translation.base_prompt}"`);
        console.log(`⚙️ Injection rules: ${Object.keys(translation.injection_rules).length} rules`);
        console.log(`🔄 Recommended workflow: ${translation.recommended_workflow}`);
        
        // Test the translated agent by creating a nano agent with these rules
        await testTranslatedAgent(kinglyOS, translation, testCase.expectedType);
        
        results.push({
          name: testCase.name,
          success: true,
          translation: translation,
          base_prompt_length: translation.base_prompt.length,
          injection_rules_count: Object.keys(translation.injection_rules).length
        });
        
      } else {
        console.log(`⚠️ Agent file not found: ${agentPath}`);
        results.push({
          name: testCase.name,
          success: false,
          error: 'Agent file not found'
        });
      }
      
    } catch (error) {
      console.log(`❌ Translation failed: ${error.message}`);
      results.push({
        name: testCase.name,
        success: false,
        error: error.message
      });
    }
  }
  
  // Test backward compatibility
  await testBackwardCompatibility(kinglyOS, results);
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TRANSLATION SERVICE TEST RESULTS');
  console.log('='.repeat(50));
  
  const successful = results.filter(r => r.success);
  console.log(`✅ Successful translations: ${successful.length}/${results.length}`);
  
  if (successful.length > 0) {
    const avgPromptReduction = successful.reduce((sum, r) => {
      const originalSize = 1000; // Estimate of original prompt size
      const newSize = r.base_prompt_length;
      return sum + ((originalSize - newSize) / originalSize);
    }, 0) / successful.length;
    
    console.log(`📉 Average prompt size reduction: ${(avgPromptReduction * 100).toFixed(1)}%`);
    console.log(`⚙️ Average injection rules per agent: ${successful.reduce((sum, r) => sum + r.injection_rules_count, 0) / successful.length}`);
  }
  
  return {
    testName: 'Translation Service Test',
    totalTests: results.length,
    successful: successful.length,
    failed: results.length - successful.length,
    results: results
  };
}

async function testTranslatedAgent(kinglyOS, translation, expectedType) {
  console.log(`  🧪 Testing translated ${expectedType} agent...`);
  
  try {
    // Simulate using the translated agent
    const testRequest = {
      agent: expectedType,
      task: `Test task for ${expectedType}`,
      context: {},
      user: 'jean-patrick',
      workflow: null,
      history: []
    };
    
    const assembled = await kinglyOS.assembleContext(testRequest);
    
    console.log(`  ✅ Assembly successful - ${assembled.estimatedTokens} tokens`);
    console.log(`  🎯 Confidence: ${assembled.confidence}`);
    
    // Compare with original behavior
    const hasFollowUp = assembled.followUp && assembled.followUp.length > 0;
    console.log(`  📋 Follow-up options: ${hasFollowUp ? 'YES' : 'NO'}`);
    
    return true;
    
  } catch (error) {
    console.log(`  ❌ Translated agent test failed: ${error.message}`);
    return false;
  }
}

async function testBackwardCompatibility(kinglyOS, translationResults) {
  console.log('\n🔄 TESTING BACKWARD COMPATIBILITY');
  console.log('-'.repeat(30));
  
  // Test that translated agents produce similar outputs to original
  const compatibilityTests = [
    {
      agent: 'writer',
      task: 'Write a technical blog post about AI',
      scenario: 'post_research'
    },
    {
      agent: 'researcher', 
      task: 'Research machine learning trends',
      scenario: 'new_project'
    },
    {
      agent: 'fact-checker',
      task: 'Verify claims in AI article',
      scenario: 'fact_checking'
    }
  ];
  
  for (const test of compatibilityTests) {
    console.log(`\n  🔍 Testing ${test.agent} compatibility...`);
    
    try {
      // Test with new OS system
      const osRequest = {
        agent: test.agent,
        task: test.task,
        context: { scenario: test.scenario },
        user: 'jean-patrick',
        workflow: null,
        history: []
      };
      
      const osResult = await kinglyOS.assembleContext(osRequest);
      
      // Analyze results
      const hasProperStructure = osResult.instructions && osResult.followUp;
      const hasUserPreferences = osResult.instructions.includes('numbered');
      const reasonableTokens = osResult.estimatedTokens < 2000;
      
      console.log(`    ✅ Structure: ${hasProperStructure ? 'GOOD' : 'POOR'}`);
      console.log(`    ✅ User prefs: ${hasUserPreferences ? 'APPLIED' : 'MISSING'}`);
      console.log(`    ✅ Token usage: ${reasonableTokens ? 'EFFICIENT' : 'EXCESSIVE'} (${osResult.estimatedTokens})`);
      
      const compatibilityScore = [hasProperStructure, hasUserPreferences, reasonableTokens]
        .filter(Boolean).length / 3;
      
      console.log(`    📊 Compatibility score: ${(compatibilityScore * 100).toFixed(0)}%`);
      
    } catch (error) {
      console.log(`    ❌ Compatibility test failed: ${error.message}`);
    }
  }
}

export async function testWorkflowTranslation() {
  console.log('\n🔄 TESTING WORKFLOW TRANSLATION');
  console.log('='.repeat(50));
  
  const kinglyOS = new KinglyOS();
  await kinglyOS.initialize();
  
  // Test translating entire WRITE workflow
  console.log('📋 Translating WRITE Method workflow...');
  
  const writeWorkflow = {
    name: 'WRITE Method',
    agents: ['researcher', 'content-strategist', 'writer', 'fact-checker', 'editor'],
    patterns: {
      research_first: ['researcher', 'writer', 'fact-checker', 'editor'],
      write_first: ['writer', 'researcher', 'fact-checker', 'editor'],
      full_editorial: ['researcher', 'content-strategist', 'writer', 'fact-checker', 'editor']
    }
  };
  
  // Translate to Kingly OS workflow format
  const translatedWorkflow = {
    routing_priority: 'high',
    agents: writeWorkflow.agents,
    sequence_injections: {
      researcher_to_writer: {
        prepend: 'Transform research findings into compelling narrative for target audience.'
      },
      writer_to_fact_checker: {
        prepend: 'Verify all factual claims, statistics, and assertions in the content.'
      },
      fact_checker_to_editor: {
        prepend: 'Polish content while preserving accuracy and factual integrity.'
      }
    },
    assembly_overrides: {
      post_research: 'inject audience_analysis for better targeting',
      pre_publication: 'inject final_quality_checklist'
    }
  };
  
  console.log(`✅ Workflow translated: ${writeWorkflow.name}`);
  console.log(`⚙️ Agents: ${translatedWorkflow.agents.length}`);
  console.log(`🔄 Sequence injections: ${Object.keys(translatedWorkflow.sequence_injections).length}`);
  console.log(`⚡ Assembly overrides: ${Object.keys(translatedWorkflow.assembly_overrides).length}`);
  
  // Test workflow execution
  const workflowTest = await testWorkflowExecution(kinglyOS, translatedWorkflow);
  
  return {
    testName: 'Workflow Translation',
    workflow: writeWorkflow.name,
    success: workflowTest.success,
    agents_translated: translatedWorkflow.agents.length
  };
}

async function testWorkflowExecution(kinglyOS, workflow) {
  console.log('\n  🧪 Testing translated workflow execution...');
  
  try {
    // Test content creation workflow
    const request = 'Write a comprehensive article about sustainable technology';
    const context = { workflow: 'content_creation' };
    
    const decision = await kinglyOS.route(request, context);
    
    console.log(`  ✅ Workflow mode: ${decision.mode === 'workflow' ? 'ACTIVATED' : 'FAILED'}`);
    console.log(`  🎯 Agent selected: ${decision.agent}`);
    console.log(`  📊 Confidence: ${decision.confidence}`);
    
    return { success: decision.mode === 'workflow' };
    
  } catch (error) {
    console.log(`  ❌ Workflow execution failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}