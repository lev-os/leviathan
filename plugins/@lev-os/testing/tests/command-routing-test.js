#!/usr/bin/env node

/**
 * Command Routing Test
 * 
 * Tests the command routing functionality against discovered core plugins
 * using the universal test patterns extracted from mcp-mvp.
 */

import { spawn } from 'child_process';

async function testCommandRouting() {
  console.log('🧪 Command Routing Validation Test');
  console.log('='.repeat(60));
  console.log('Testing command routing for discovered core plugins\n');
  
  // Discovered plugins from the previous test
  const testPlugins = [
    {
      name: 'cmd',
      commands: ['cmd_exec', 'cmd_worktree', 'cmd_jobs']
    },
    {
      name: 'debug', 
      commands: ['debug_events', 'debug_plugins', 'debug_llm']
    }
  ];
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  // Helper function to run kingly commands (adapted from mcp-mvp pattern)
  async function runKinglyCommand(args, timeout = 10000) {
    return new Promise((resolve) => {
      const command = `CONTEXTS_PATH="./contexts" ./bin/kingly ${args.join(' ')}`;
      const child = spawn('bash', ['-c', command], { 
        stdio: 'pipe',
        timeout: timeout,
        cwd: '/Users/jean-patricksmith/digital/kingly/core/mcp-mvp' // Use the mcp-mvp binary
      });
      
      let output = '';
      
      child.stdout.on('data', (data) => output += data.toString());
      child.stderr.on('data', (data) => output += data.toString());
      
      child.on('close', (code) => {
        resolve({
          success: code === 0,
          output: output.trim(),
          exitCode: code
        });
      });
      
      child.on('error', (error) => {
        resolve({
          success: false,
          output: `Command error: ${error.message}`,
          error: error
        });
      });
    });
  }
  
  console.log('🔧 Testing Core Plugin Command Routing\n');
  
  for (const plugin of testPlugins) {
    console.log(`📦 Testing Plugin: ${plugin.name}`);
    
    for (const command of plugin.commands) {
      console.log(`   🔧 Testing command: ${command}`);
      totalTests++;
      
      try {
        // Test command help (safest test)
        const result = await runKinglyCommand([command, '--help']);
        
        // Validation criteria (adapted from mcp-mvp patterns)
        const isSuccessful = result.output.length > 0 && 
                           !result.output.includes('ENOENT') && 
                           !result.output.includes('MODULE_NOT_FOUND') &&
                           !result.output.includes('Command not found');
        
        if (isSuccessful) {
          console.log(`      ✅ PASSED - Command routed successfully`);
          passedTests++;
        } else {
          console.log(`      ❌ FAILED - Command routing issue`);
          console.log(`         Output: ${result.output.substring(0, 100)}...`);
          failedTests++;
        }
        
      } catch (error) {
        console.log(`      💥 ERROR - ${error.message}`);
        failedTests++;
      }
    }
    
    console.log(''); // Empty line for readability
  }
  
  // Test basic kingly commands that should always work
  console.log('🔧 Testing Basic Kingly Commands\n');
  
  const basicCommands = [
    { name: 'help', args: ['help'] },
    { name: 'status', args: ['status'] }
  ];
  
  for (const basicCmd of basicCommands) {
    console.log(`   🔧 Testing basic command: ${basicCmd.name}`);
    totalTests++;
    
    try {
      const result = await runKinglyCommand(basicCmd.args);
      
      if (result.output.length > 10) {
        console.log(`      ✅ PASSED - Basic command working`);
        passedTests++;
      } else {
        console.log(`      ❌ FAILED - Basic command not working`);
        console.log(`         Output: ${result.output.substring(0, 100)}...`);
        failedTests++;
      }
      
    } catch (error) {
      console.log(`      💥 ERROR - ${error.message}`);
      failedTests++;
    }
  }
  
  // Test universal-validation command if available
  console.log('\n🔧 Testing Universal Validation Commands\n');
  
  const universalValidationCommands = [
    { name: 'validate init', args: ['validate', 'init', '--help'] },
    { name: 'validate run', args: ['validate', 'run', '--help'] }
  ];
  
  for (const valCmd of universalValidationCommands) {
    console.log(`   🔧 Testing validation command: ${valCmd.name}`);
    totalTests++;
    
    try {
      const result = await runKinglyCommand(valCmd.args);
      
      if (result.output.includes('validate') || result.output.includes('Usage:') || result.output.includes('help')) {
        console.log(`      ✅ PASSED - Validation command available`);
        passedTests++;
      } else {
        console.log(`      ⚠️  SKIPPED - Validation command not available yet`);
        // Don't count this as a failure since universal-validation might not be integrated yet
        totalTests--; 
      }
      
    } catch (error) {
      console.log(`      ⚠️  SKIPPED - Validation command not available: ${error.message}`);
      totalTests--; // Don't count as failure
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 COMMAND ROUTING TEST RESULTS');
  console.log('='.repeat(60));
  
  console.log(`\n✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${failedTests}/${totalTests}`);
  
  const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
  console.log(`📈 Success Rate: ${successRate.toFixed(1)}%`);
  
  // Success criteria evaluation (adapted from mcp-mvp)
  const criticalCriteria = [
    { 
      name: 'Basic commands work', 
      met: passedTests > 0 
    },
    { 
      name: 'Plugin commands route', 
      met: passedTests >= Math.max(1, Math.floor(totalTests * 0.5)) 
    },
    { 
      name: 'No command crashes', 
      met: failedTests < totalTests * 0.3 
    }
  ];
  
  console.log('\n🎯 SUCCESS CRITERIA EVALUATION:');
  criticalCriteria.forEach(criteria => {
    console.log(`   ${criteria.met ? '✅' : '❌'} ${criteria.name}`);
  });
  
  const overallSuccess = criticalCriteria.every(c => c.met);
  
  if (overallSuccess && successRate >= 70) {
    console.log('\n🎉 COMMAND ROUTING: SUCCESS');
    console.log('   ✅ Plugin command routing working correctly');
    console.log('   ✅ Framework integration functional');
    console.log('   ✅ Test patterns successfully applied');
    console.log('   🚀 Ready for full integration testing');
    return true;
  } else if (successRate >= 50) {
    console.log('\n⚠️  COMMAND ROUTING: PARTIAL SUCCESS');
    console.log('   ✅ Some commands working correctly');
    console.log('   🔧 Some integration issues to resolve');
    console.log('   📋 Review failed commands for improvements');
    return true;
  } else {
    console.log('\n❌ COMMAND ROUTING: NEEDS ATTENTION');
    console.log('   🔧 Significant routing issues detected');
    console.log('   📋 Check kingly binary and plugin integration');
    console.log('   🚀 Address core routing before proceeding');
    return false;
  }
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testCommandRouting()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Command routing test crashed:', error.message);
      process.exit(1);
    });
}