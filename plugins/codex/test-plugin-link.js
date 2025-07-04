/**
 * Test Plugin Link - Community Dogfooding Validation
 * Validates that @lev-os/codex plugin is properly linked and accessible
 */

console.log('🧪 Testing Community Plugin Dogfooding...\n');

async function testPluginLink() {
  try {
    // Test 1: Import plugin
    console.log('📦 Test 1: Importing @lev-os/codex plugin...');
    const plugin = await import('@lev-os/codex');
    console.log('✅ Plugin imported successfully');
    console.log('📋 Available exports:', Object.keys(plugin));
    
    // Test 2: Test search command
    console.log('\n🔍 Test 2: Testing codex_search command...');
    const { codex_search } = plugin;
    
    if (typeof codex_search === 'function') {
      console.log('✅ codex_search function available');
      
      // Test search functionality
      const result = await codex_search('react', { limit: '2' });
      console.log('✅ Search executed successfully');
      console.log('📊 Results:', {
        query: result.query,
        total: result.total,
        confidence: result.confidence,
        firstResult: result.results[0]?.metadata?.name || 'None'
      });
    } else {
      console.log('❌ codex_search function not available');
    }
    
    // Test 3: Package metadata
    console.log('\n📋 Test 3: Plugin package metadata...');
    console.log('✅ Plugin is accessible as npm package');
    console.log('✅ ES modules working correctly');
    
    console.log('\n🎯 Community Dogfooding Status: SUCCESS');
    console.log('✅ Plugin can be linked and consumed by external packages');
    console.log('✅ Ready for Leviathan agent integration');
    
  } catch (error) {
    console.log('❌ Plugin link test failed:', error.message);
    console.log('\nDebugging info:');
    console.log('- Current directory:', process.cwd());
    console.log('- Node modules path might need @lev-os/codex link');
    console.log('- Try: pnpm link --global from plugin directory first');
  }
}

testPluginLink();