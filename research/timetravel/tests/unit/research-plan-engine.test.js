const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

// Mock dependencies
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    readdir: jest.fn(),
    stat: jest.fn(),
    mkdir: jest.fn()
  }
}));

jest.mock('js-yaml');
jest.mock('node-cron');
jest.mock('child_process');

// Mock handlers
jest.mock('../../src/handlers/twitter-handler');
jest.mock('../../src/handlers/arxiv-handler');

describe('Research Plan Engine', () => {
  let engine;
  const mockConfig = {
    research_plan: {
      name: 'test-research',
      schedule: '0 9 * * *',
      sources: [
        {
          type: 'arxiv',
          name: 'AI Research',
          categories: ['cs.AI', 'cs.LG'],
          keywords: ['machine learning', 'artificial intelligence']
        }
      ],
      monitoring: {
        output_dir: './test-outputs',
        memory_integration: true,
        personality: 'sovereignty_architect'
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    process.env.DRY_RUN = 'true';
  });

  describe('Configuration Loading', () => {
    test('should load valid YAML configuration', async () => {
      const mockYamlContent = yaml.dump(mockConfig);
      fs.readFile.mockResolvedValue(mockYamlContent);
      yaml.load.mockReturnValue(mockConfig);

      // Import after mocks are set up
      const ResearchPlanEngine = require('../../src/research-plan-engine');
      engine = new ResearchPlanEngine();

      const config = await engine.loadConfig('./test-config.yaml');
      
      expect(fs.readFile).toHaveBeenCalledWith('./test-config.yaml', 'utf8');
      expect(yaml.load).toHaveBeenCalledWith(mockYamlContent);
      expect(config).toEqual(mockConfig);
    });

    test('should throw error for invalid YAML', async () => {
      fs.readFile.mockResolvedValue('invalid: yaml: content:');
      yaml.load.mockImplementation(() => {
        throw new Error('Invalid YAML');
      });

      const ResearchPlanEngine = require('../../src/research-plan-engine');
      engine = new ResearchPlanEngine();

      await expect(engine.loadConfig('./invalid-config.yaml'))
        .rejects.toThrow('Invalid YAML');
    });

    test('should validate required configuration fields', async () => {
      const invalidConfig = { research_plan: { name: 'test' } }; // Missing required fields
      fs.readFile.mockResolvedValue(yaml.dump(invalidConfig));
      yaml.load.mockReturnValue(invalidConfig);

      const ResearchPlanEngine = require('../../src/research-plan-engine');
      engine = new ResearchPlanEngine();

      await expect(engine.loadConfig('./invalid-config.yaml'))
        .rejects.toThrow('Configuration validation failed');
    });
  });

  describe('Source Handlers', () => {
    beforeEach(async () => {
      fs.readFile.mockResolvedValue(yaml.dump(mockConfig));
      yaml.load.mockReturnValue(mockConfig);

      const ResearchPlanEngine = require('../../src/research-plan-engine');
      engine = new ResearchPlanEngine();
      await engine.loadConfig('./test-config.yaml');
    });

    test('should initialize handlers for configured sources', () => {
      expect(engine.handlers).toBeDefined();
      expect(engine.handlers.arxiv).toBeDefined();
    });

    test('should test connections to all configured sources', async () => {
      const mockArxivHandler = require('../../src/handlers/arxiv-handler');
      mockArxivHandler.prototype.testConnection = jest.fn()
        .mockResolvedValue({ status: 'connected', message: 'Connection successful' });

      const connectionResults = await engine.testConnections();
      
      expect(connectionResults).toHaveProperty('arxiv');
      expect(connectionResults.arxiv.status).toBe('connected');
    });

    test('should collect data from all sources', async () => {
      const mockArxivHandler = require('../../src/handlers/arxiv-handler');
      const mockData = [
        { id: '1', title: 'Test Paper', abstract: 'Test abstract' }
      ];
      mockArxivHandler.prototype.collect = jest.fn().mockResolvedValue(mockData);

      const collectedData = await engine.collectData();
      
      expect(collectedData).toHaveProperty('arxiv');
      expect(collectedData.arxiv).toEqual(mockData);
    });
  });

  describe('Research Execution', () => {
    beforeEach(async () => {
      fs.readFile.mockResolvedValue(yaml.dump(mockConfig));
      yaml.load.mockReturnValue(mockConfig);

      const ResearchPlanEngine = require('../../src/research-plan-engine');
      engine = new ResearchPlanEngine();
      await engine.loadConfig('./test-config.yaml');
    });

    test('should execute research plan in dry-run mode', async () => {
      const mockArxivHandler = require('../../src/handlers/arxiv-handler');
      mockArxivHandler.prototype.collect = jest.fn().mockResolvedValue([]);

      fs.mkdir.mockResolvedValue();
      fs.writeFile.mockResolvedValue();

      const result = await engine.execute();
      
      expect(result.status).toBe('completed');
      expect(result.dry_run).toBe(true);
      expect(fs.mkdir).toHaveBeenCalled(); // Output directory created
    });

    test('should handle errors gracefully during execution', async () => {
      const mockArxivHandler = require('../../src/handlers/arxiv-handler');
      mockArxivHandler.prototype.collect = jest.fn()
        .mockRejectedValue(new Error('API Error'));

      const result = await engine.execute();
      
      expect(result.status).toBe('error');
      expect(result.errors).toContain('API Error');
    });
  });

  describe('Memory Integration', () => {
    test('should save results to memory system when enabled', async () => {
      fs.readFile.mockResolvedValue(yaml.dump(mockConfig));
      yaml.load.mockReturnValue(mockConfig);

      const ResearchPlanEngine = require('../../src/research-plan-engine');
      engine = new ResearchPlanEngine();
      await engine.loadConfig('./test-config.yaml');

      const mockData = { arxiv: [{ id: '1', title: 'Test' }] };
      const saveSpy = jest.spyOn(engine, 'saveToMemory').mockResolvedValue();

      await engine.processResults(mockData);
      
      expect(saveSpy).toHaveBeenCalledWith(mockData);
    });

    test('should skip memory integration when disabled', async () => {
      const configWithoutMemory = {
        ...mockConfig,
        research_plan: {
          ...mockConfig.research_plan,
          monitoring: {
            ...mockConfig.research_plan.monitoring,
            memory_integration: false
          }
        }
      };

      fs.readFile.mockResolvedValue(yaml.dump(configWithoutMemory));
      yaml.load.mockReturnValue(configWithoutMemory);

      const ResearchPlanEngine = require('../../src/research-plan-engine');
      engine = new ResearchPlanEngine();
      await engine.loadConfig('./test-config.yaml');

      const mockData = { arxiv: [{ id: '1', title: 'Test' }] };
      const saveSpy = jest.spyOn(engine, 'saveToMemory').mockResolvedValue();

      await engine.processResults(mockData);
      
      expect(saveSpy).not.toHaveBeenCalled();
    });
  });

  describe('Scheduling', () => {
    test('should schedule research execution with cron', async () => {
      const cron = require('node-cron');
      cron.schedule = jest.fn();

      fs.readFile.mockResolvedValue(yaml.dump(mockConfig));
      yaml.load.mockReturnValue(mockConfig);

      const ResearchPlanEngine = require('../../src/research-plan-engine');
      engine = new ResearchPlanEngine();
      await engine.loadConfig('./test-config.yaml');

      engine.schedule();
      
      expect(cron.schedule).toHaveBeenCalledWith(
        mockConfig.research_plan.schedule,
        expect.any(Function)
      );
    });
  });
});