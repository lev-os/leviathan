/**
 * Direct test for intent classification
 * Run with: node tests/direct/test-intent-classification.js
 */

import { IntentClassifier } from '../../src/domain/services/intent-classifier.js';
import { Task } from '../../src/domain/task.js';
import { ClaudeCodeAdapter } from '../../src/adapters/primary/claude-adapter.js';

console.log('🧪 Testing Intent Classification...\n');

// Test 1: Intent Classifier
console.log('1️⃣ Testing IntentClassifier directly:');
const implementationIntent = IntentClassifier.classifyTaskIntent(
  'Implement user authentication',
  'Add JWT-based auth with refresh tokens'
);
console.log('Implementation:', implementationIntent);

const researchIntent = IntentClassifier.classifyTaskIntent(
  'Research graph database options',
  'Compare Neo4j vs DGraph for our use case'
);
console.log('Research:', researchIntent);

// Test 2: Task Entity
console.log('\n2️⃣ Testing Task entity with intent:');
const task = new Task({
  title: 'Implement user authentication',
  description: 'Add JWT-based auth with refresh tokens',
  workspace_id: 'test-workspace'
});
console.log('Task intent:', task.intent_type);
console.log('Task context:', task.intent_context);
console.log('Task confidence:', task.confidence);

// Test 3: Claude Adapter
console.log('\n3️⃣ Testing ClaudeCodeAdapter:');
try {
  const adapter = new ClaudeCodeAdapter();
  const createdTask = await adapter.createTask({
    title: 'Plan Q2 product roadmap',
    description: 'Define features and timeline for next quarter',
    workspace_id: 'planning-workspace'
  });
  
  console.log('Created task:', createdTask.id);
  console.log('Intent type:', createdTask.intent_type);
  console.log('Files created:', await adapter.getTaskFiles(createdTask.id));
  
  // Read back the files
  const metadata = await adapter.getTaskMetadata(createdTask.id);
  console.log('\nTask metadata:', JSON.stringify(metadata, null, 2));
  
  const content = await adapter.getTaskContent(createdTask.id);
  console.log('\nTask markdown preview:');
  console.log(content.split('\n').slice(0, 10).join('\n'));
  console.log('...');
  
} catch (error) {
  console.error('Error testing adapter:', error);
}

console.log('\n✅ Intent classification tests complete!');