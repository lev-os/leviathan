/**
 * Discovery Engine - Domain Logic
 * Domain: Framework discovery and learning path generation
 */

export function createDiscoveryEngine() {
  return {
    async discover(framework, knowledge, options = {}) {
      const frameworkData = findFrameworkData(framework, knowledge);
      
      const discovery = {
        framework,
        overview: generateOverview(frameworkData),
        capabilities: extractCapabilities(frameworkData),
        learning_path: generateLearningPath(frameworkData, options),
        ecosystem: mapEcosystem(frameworkData, knowledge),
        use_cases: identifyUseCases(frameworkData),
        getting_started: generateGettingStarted(frameworkData),
        confidence: calculateDiscoveryConfidence(frameworkData)
      };
      
      return discovery;
    }
  };
}

function findFrameworkData(framework, knowledge) {
  const frameworkLower = framework.toLowerCase();
  
  // Search frameworks category first
  for (const entry of knowledge.frameworks || []) {
    if (entry.metadata?.name?.toLowerCase().includes(frameworkLower)) {
      return entry;
    }
  }
  
  return null;
}

function generateOverview(frameworkData) {
  if (!frameworkData) return 'Framework not found in knowledge base';
  
  return frameworkData.description || 'No overview available';
}

function extractCapabilities(frameworkData) {
  if (!frameworkData?.framework_definition?.capabilities) {
    return ['Information not available'];
  }
  
  return frameworkData.framework_definition.capabilities;
}

function generateLearningPath(frameworkData, options) {
  const depth = options.depth || 'intermediate';
  
  const paths = {
    beginner: [
      'Understand core concepts',
      'Set up development environment',
      'Build first simple project',
      'Learn basic patterns'
    ],
    intermediate: [
      'Master advanced patterns',
      'Integrate with ecosystem tools',
      'Optimize performance',
      'Handle complex use cases'
    ],
    advanced: [
      'Contribute to framework',
      'Build custom extensions',
      'Architect large systems',
      'Mentor others'
    ]
  };
  
  return paths[depth] || paths.intermediate;
}

function mapEcosystem(frameworkData, knowledge) {
  return {
    tools: ['Build tools', 'Testing frameworks', 'Development servers'],
    libraries: ['UI components', 'State management', 'Utilities'],
    community: ['Documentation', 'Forums', 'Examples']
  };
}

function identifyUseCases(frameworkData) {
  if (!frameworkData?.framework_definition?.use_cases) {
    return ['General web development'];
  }
  
  return frameworkData.framework_definition.use_cases;
}

function generateGettingStarted(frameworkData) {
  return {
    installation: 'npm install framework-name',
    basic_setup: 'Follow framework documentation',
    first_steps: 'Create new project and explore examples'
  };
}

function calculateDiscoveryConfidence(frameworkData) {
  return frameworkData ? 90 : 10;
}