#!/usr/bin/env node

/**
 * Quick test script for arXiv handler
 * Tests basic functionality before full BDD implementation
 */

const ArxivHandler = require('./src/handlers/arxiv-handler')

async function testArxivHandler() {
  console.log('🧪 Testing arXiv Handler\n')

  const handler = new ArxivHandler()

  try {
    // Test 1: Connection test
    console.log('1. Testing connection...')
    const connectionResult = await handler.testConnection({})
    console.log(`   Status: ${connectionResult.status}`)
    if (connectionResult.sample) {
      console.log(`   Sample paper: ${connectionResult.sample.title.substring(0, 80)}...`)
    }
    console.log()

    // Test 2: Category search
    console.log('2. Testing category search (cs.AI)...')
    const categoryConfig = {
      categories: ['cs.AI'],
      max_results: 5,
      sort: 'submittedDate',
    }

    const categoryResults = await handler.collect(categoryConfig)
    console.log(`   Found ${categoryResults.length} papers`)
    if (categoryResults.length > 0) {
      console.log(`   Latest: ${categoryResults[0].title}`)
      console.log(`   Authors: ${categoryResults[0].author.map((a) => a.name).join(', ')}`)
      console.log(`   Categories: ${categoryResults[0].tags.join(', ')}`)
    }
    console.log()

    // Test 3: Keyword search
    console.log('3. Testing keyword search (neural network)...')
    const keywordConfig = {
      keywords: ['neural network'],
      max_results: 3,
    }

    const keywordResults = await handler.collect(keywordConfig)
    console.log(`   Found ${keywordResults.length} papers`)
    if (keywordResults.length > 0) {
      console.log(`   Example: ${keywordResults[0].title}`)
    }
    console.log()

    // Test 4: Data structure validation
    console.log('4. Validating data structure...')
    if (categoryResults.length > 0) {
      const paper = categoryResults[0]
      const requiredFields = ['id', 'title', 'content', 'url', 'author', 'created_at', 'source']
      const missingFields = requiredFields.filter((field) => !paper[field])

      if (missingFields.length === 0) {
        console.log('   ✅ All required fields present')
      } else {
        console.log(`   ❌ Missing fields: ${missingFields.join(', ')}`)
      }

      // Check data types
      console.log(`   ID format: ${paper.id}`)
      console.log(`   Source: ${paper.source}`)
      console.log(`   Date: ${paper.created_at}`)
      console.log(`   URL: ${paper.url}`)
    }
    console.log()

    // Test 5: Multi-category handling
    console.log('5. Testing multi-category collection...')
    const multiConfig = {
      categories: ['cs.AI', 'cs.LG'],
      max_results: 10,
    }

    const multiResults = await handler.collect(multiConfig)
    console.log(`   Total papers: ${multiResults.length}`)

    const categoryBreakdown = {}
    multiResults.forEach((paper) => {
      paper.tags.forEach((tag) => {
        categoryBreakdown[tag] = (categoryBreakdown[tag] || 0) + 1
      })
    })
    console.log('   Category breakdown:', categoryBreakdown)
    console.log()

    console.log('✅ arXiv Handler tests completed successfully!')
    console.log('\nNext steps:')
    console.log('1. Run: node src/research-plan-engine.js dry-run research-plans/timetravel-ai-research.yaml')
    console.log('2. Run: node src/research-plan-engine.js run research-plans/timetravel-ai-research.yaml')
    console.log('3. Test dogfooding: node src/research-plan-engine.js dry-run research-plans/timetravel-dogfood.yaml')
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('\nDebug info:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  testArxivHandler()
}

module.exports = testArxivHandler
