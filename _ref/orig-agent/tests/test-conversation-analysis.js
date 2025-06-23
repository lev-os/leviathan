#!/usr/bin/env node

import { ConversationAnalyzer } from '../src/conversation-analyzer.js';

const analyzer = new ConversationAnalyzer();

const testMessages = [
  // Should detect tasks
  "I need to build a user authentication system with JWT tokens",
  "Can you help me create a dashboard for analytics",
  "The login page isn't working and needs to be fixed",
  "We should implement real-time notifications",
  
  // Should NOT detect tasks
  "What is the best way to structure a React app?",
  "How does JWT authentication work?",
  "Thanks for the help!",
  "yes",
  "3"
];

console.log('🧪 TESTING CONVERSATION ANALYSIS\n');

testMessages.forEach((msg, idx) => {
  console.log(`${idx + 1}. Message: "${msg}"`);
  
  const analysis = analyzer.analyzeMessage(msg);
  
  console.log(`   Task Potential: ${analysis.hasTaskPotential ? '✅' : '❌'} (${Math.round(analysis.confidence * 100)}% confidence)`);
  
  if (analysis.potentialTasks && analysis.potentialTasks.length > 0) {
    console.log('   Detected Tasks:');
    analysis.potentialTasks.forEach(task => {
      console.log(`   - "${task.title}" (${Math.round(task.confidence * 100)}%)`);
    });
  }
  
  console.log('');
});