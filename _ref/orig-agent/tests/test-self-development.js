/**
 * Test Kingly Agent Self-Development
 * Demonstrates how the system can manage its own development tasks
 */

import { KinglyAgent } from '../src/index.js';

async function testSelfDevelopment() {
  console.log('🤖 Testing Kingly Agent Self-Development...\n');

  const agent = new KinglyAgent({
    agentsPath: './agents',
    workspacePath: './.kingly-self-dev'
  });

  try {
    // 1. Create a development task for the system itself
    console.log('1️⃣ Creating development task for Kingly Agent...');
    const taskResult = await agent.createTask(
      'Implement project hierarchy system',
      'Add Workspace > Project > Task structure as defined in internal/i-pm.md. This will enable better organization of tasks within projects.',
      'Kingly-Development',
      { 
        requirementDoc: 'internal/i-pm.md',
        complexity: 'medium',
        impactsCore: true,
        priority: 'high'
      }
    );
    console.log(taskResult);

    // Extract task ID
    const taskIdMatch = taskResult.match(/ID: (task_\d+)/);
    if (!taskIdMatch) throw new Error('Could not extract task ID');
    const taskId = taskIdMatch[1];

    // 2. LLM assesses confidence for this development task
    console.log('\n2️⃣ Assessing confidence for development task...');
    const confidenceResult = await agent.assessTaskConfidence(
      taskId,
      0.65, // Medium confidence - needs breaking down
      {
        technical_clarity: 'requirements_defined_in_i_pm',
        scope_complexity: 'multiple_files_affected',
        testing_required: 'integration_testing_needed',
        backward_compatibility: 'must_preserve_existing_api',
        documentation_impact: 'multiple_docs_need_updates'
      },
      'Task has clear requirements from i-pm.md but involves multiple system components. Need to ensure backward compatibility and proper testing. Splitting will make implementation more manageable.'
    );
    console.log(confidenceResult.message);
    console.log('Should split?', confidenceResult.shouldSplit);

    // 3. Split the development task into manageable pieces
    console.log('\n3️⃣ Splitting development task...');
    const splitResult = await agent.splitTask(
      taskId,
      'Development task too complex (65% confidence). Breaking into focused implementation pieces.',
      [
        {
          title: 'Design project data schema and validation',
          description: 'Define project metadata structure, validation rules, and storage format',
          confidence: 0.85,
          agent: 'dev'
        },
        {
          title: 'Add project-level MCP tools',
          description: 'Implement create_project, get_project, list_projects MCP tools',
          confidence: 0.9,
          agent: 'dev'
        },
        {
          title: 'Update task management for project hierarchy',
          description: 'Modify existing task tools to work within project context',
          confidence: 0.8,
          agent: 'dev'
        },
        {
          title: 'Add project context to workspace state',
          description: 'Update workspace management to include project organization',
          confidence: 0.75,
          agent: 'dev'
        },
        {
          title: 'Create project template system',
          description: 'Enable project initialization with templates and defaults',
          confidence: 0.8,
          agent: 'dev'
        }
      ],
      0.65
    );
    console.log(splitResult.message);

    // 4. Check for further splitting if needed
    console.log('\n4️⃣ Checking subtask confidence...');
    for (const subtask of splitResult.subtasks) {
      if (subtask.confidence < 0.8) {
        console.log(`⚠️  "${subtask.title}" at ${Math.round(subtask.confidence * 100)}% - further splitting recommended`);
        
        // Further split the low-confidence task
        const furtherSplit = await agent.splitTask(
          subtask.id,
          `Confidence ${Math.round(subtask.confidence * 100)}% below 80% threshold`,
          [
            {
              title: 'Update get_workspace_state for projects',
              description: 'Modify workspace state API to include project information',
              confidence: 0.85,
              agent: 'dev'
            },
            {
              title: 'Add project filtering to existing tools',
              description: 'Update list_tasks and other tools to filter by project',
              confidence: 0.9,
              agent: 'dev'
            },
            {
              title: 'Test workspace backwards compatibility',
              description: 'Ensure existing workspaces continue to work without projects',
              confidence: 0.8,
              agent: 'dev'
            }
          ],
          subtask.confidence
        );
        console.log(`   🔄 Split into ${furtherSplit.subtasks.length} executable pieces`);
      } else {
        console.log(`✅ "${subtask.title}" at ${Math.round(subtask.confidence * 100)}% - ready for implementation`);
      }
    }

    // 5. Execute a high-confidence development task
    console.log('\n5️⃣ Executing ready development task...');
    const readySubtask = splitResult.subtasks.find(t => t.confidence >= 0.8);
    if (readySubtask) {
      const execResult = await agent.executeTask(
        readySubtask.id,
        'dev',
        'Start with schema design based on i-pm.md requirements, then implement MCP tools'
      );
      console.log(execResult.message);
    }

    // 6. Show development workspace state
    console.log('\n6️⃣ Development workspace state...');
    const workspaceState = await agent.getWorkspaceState();
    console.log('📊 Kingly Development Workspace:');
    console.log(`   Total development tasks: ${workspaceState.tasks.total}`);
    console.log(`   Ready for implementation: ${workspaceState.tasks.pending}`);
    console.log(`   Currently in progress: ${workspaceState.tasks.in_progress}`);
    console.log(`   Needs further splitting: ${workspaceState.tasks.needs_splitting}`);

    // 7. Demonstrate system self-awareness
    console.log('\n7️⃣ System self-awareness check...');
    await agent.rememberContext(
      'current_development_focus',
      'Implementing project hierarchy system to enable better task organization',
      'development'
    );
    
    const selfContext = await agent.recallContext('current_development_focus');
    console.log('🧠 System remembers:', selfContext);

    console.log('\n✅ Kingly Agent self-development test completed!');
    console.log('\n🎯 Key Insight: The system successfully used its own task management tools to organize and execute its development work!');
    console.log('\n🤖 Meta-development: LLM-first system managing LLM-first system development through bidirectional flow');

  } catch (error) {
    console.error('❌ Self-development test failed:', error);
  }
}

testSelfDevelopment();