/**
 * Test LLM-Driven Task Splitting with 80% Confidence Threshold
 * Demonstrates how LLM assesses confidence and splits tasks accordingly
 */

import { KinglyAgent } from '../src/index.js';

async function testConfidenceSplitting() {
  console.log('🧪 Testing LLM-Driven Confidence-Based Task Splitting...\n');

  const agent = new KinglyAgent({
    agentsPath: './agents',
    workspacePath: './.kingly-test'
  });

  try {
    // 1. Create a complex task
    console.log('1️⃣ Creating complex task...');
    const taskResult = await agent.createTask(
      'Build complete e-commerce platform',
      'Build a full e-commerce platform with user auth, product catalog, shopping cart, payments, and admin dashboard',
      'E-commerce Project',
      { technology: 'Node.js + React', timeline: '3 months' }
    );
    console.log(taskResult);

    // Extract task ID from response
    const taskIdMatch = taskResult.match(/ID: (task_\d+)/);
    if (!taskIdMatch) throw new Error('Could not extract task ID');
    const taskId = taskIdMatch[1];

    // 2. LLM assesses confidence (simulating LLM analysis)
    console.log('\n2️⃣ LLM assesses task confidence...');
    const confidenceResult = await agent.assessTaskConfidence(
      taskId,
      0.3, // Low confidence - too complex
      {
        scope: 'very_large',
        technical_complexity: 'high', 
        time_estimate: 'months',
        dependencies: 'multiple_systems',
        clarity: 'general_requirements'
      },
      'Task is too broad and complex. Multiple technical domains involved (auth, payments, UI, database). Requires breaking into smaller, focused pieces.'
    );
    console.log(confidenceResult.message);
    console.log('Recommendation:', confidenceResult.recommendation);
    console.log('Should split?', confidenceResult.shouldSplit);

    // 3. LLM splits the task (because confidence < 80%)
    console.log('\n3️⃣ LLM splits task into manageable pieces...');
    const splitResult = await agent.splitTask(
      taskId,
      'Task complexity too high (30% confidence). Breaking into domain-focused subtasks.',
      [
        {
          title: 'Set up project infrastructure and database',
          description: 'Initialize Node.js project, set up database schema, basic auth framework',
          confidence: 0.85,
          agent: 'dev'
        },
        {
          title: 'Implement user authentication system',
          description: 'User registration, login, JWT tokens, password reset',
          confidence: 0.9,
          agent: 'dev'
        },
        {
          title: 'Build product catalog system',
          description: 'Product CRUD, categories, search, image uploads',
          confidence: 0.8,
          agent: 'dev'
        },
        {
          title: 'Create shopping cart and checkout',
          description: 'Cart management, order processing, basic checkout flow',
          confidence: 0.75,
          agent: 'dev'
        },
        {
          title: 'Integrate payment processing',
          description: 'Stripe integration, payment validation, order completion',
          confidence: 0.85,
          agent: 'dev'
        }
      ],
      0.3
    );
    console.log(splitResult.message);
    console.log(`Created ${splitResult.subtasks.length} subtasks`);

    // 4. Check if any subtasks need further splitting
    console.log('\n4️⃣ Checking subtask confidence levels...');
    for (const subtask of splitResult.subtasks) {
      if (subtask.confidence < 0.8) {
        console.log(`⚠️  Subtask "${subtask.title}" has ${Math.round(subtask.confidence * 100)}% confidence - may need further splitting`);
        
        // LLM could split this further
        const furtherSplit = await agent.splitTask(
          subtask.id,
          `Confidence ${Math.round(subtask.confidence * 100)}% below threshold`,
          [
            {
              title: 'Design cart data structure and API',
              description: 'Define cart schema, API endpoints for add/remove/update',
              confidence: 0.9,
              agent: 'dev'
            },
            {
              title: 'Implement cart frontend components',
              description: 'Cart UI, quantity controls, item management',
              confidence: 0.85,
              agent: 'dev'
            },
            {
              title: 'Build checkout flow',
              description: 'Multi-step checkout, validation, order summary',
              confidence: 0.8,
              agent: 'dev'
            }
          ],
          subtask.confidence
        );
        console.log(`   🔄 Split into ${furtherSplit.subtasks.length} smaller tasks`);
      } else {
        console.log(`✅ Subtask "${subtask.title}" has ${Math.round(subtask.confidence * 100)}% confidence - ready for execution`);
      }
    }

    // 5. Execute a high-confidence task
    console.log('\n5️⃣ Executing high-confidence task...');
    const readySubtask = splitResult.subtasks.find(t => t.confidence >= 0.8);
    if (readySubtask) {
      const execResult = await agent.executeTask(
        readySubtask.id, 
        'dev', 
        'Start with database schema design, then implement auth endpoints'
      );
      console.log(execResult.message);
    }

    // 6. Show workspace state
    console.log('\n6️⃣ Final workspace state...');
    const workspaceState = await agent.getWorkspaceState();
    console.log('📊 Workspace Statistics:');
    console.log(`   Total tasks: ${workspaceState.tasks.total}`);
    console.log(`   Pending: ${workspaceState.tasks.pending}`);
    console.log(`   Needs splitting: ${workspaceState.tasks.needs_splitting}`);
    console.log(`   In progress: ${workspaceState.tasks.in_progress}`);

    console.log('\n✅ LLM-driven confidence splitting test completed!');
    console.log('\n🎯 Key Insight: LLM evaluates confidence and recursively splits until all tasks ≥ 80% confidence');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testConfidenceSplitting();