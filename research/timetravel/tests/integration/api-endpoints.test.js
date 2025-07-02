const request = require('supertest');
const express = require('express');
const path = require('path');

// Mock dependencies
jest.mock('../../src/api/engine/research');
jest.mock('../../src/api/personalities/manager');
jest.mock('../../src/api/config/manager');

describe('API Endpoints Integration', () => {
  let app;
  let server;

  beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    process.env.DRY_RUN = 'true';
    
    // Import app after setting environment
    app = require('../../src/api/server');
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe('Health Check', () => {
    test('GET /health should return 200', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'healthy',
        timestamp: expect.any(String)
      });
    });
  });

  describe('Research Endpoints', () => {
    beforeEach(() => {
      // Mock research engine
      const mockResearchEngine = require('../../src/api/engine/research');
      mockResearchEngine.executeResearch = jest.fn().mockResolvedValue({
        status: 'completed',
        results: { test: 'data' },
        execution_time: '30s'
      });
    });

    test('POST /api/research should execute research plan', async () => {
      const researchRequest = {
        topic: 'artificial intelligence',
        personality: 'sovereignty_architect',
        horizon: '6mo',
        dry_run: true
      };

      const response = await request(app)
        .post('/api/research')
        .send(researchRequest)
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'completed',
        results: expect.any(Object),
        execution_time: expect.any(String)
      });
    });

    test('POST /api/research should validate required fields', async () => {
      const invalidRequest = {
        personality: 'sovereignty_architect'
        // Missing required 'topic' field
      };

      const response = await request(app)
        .post('/api/research')
        .send(invalidRequest)
        .expect(400);

      expect(response.body).toMatchObject({
        error: expect.stringContaining('topic')
      });
    });

    test('GET /api/research/status should return research status', async () => {
      const response = await request(app)
        .get('/api/research/status')
        .expect(200);

      expect(response.body).toMatchObject({
        active_research: expect.any(Number),
        completed_today: expect.any(Number),
        system_health: expect.any(String)
      });
    });
  });

  describe('Personality Endpoints', () => {
    beforeEach(() => {
      // Mock personality manager
      const mockPersonalityManager = require('../../src/api/personalities/manager');
      mockPersonalityManager.listPersonalities = jest.fn().mockResolvedValue([
        { id: 'sovereignty_architect', name: 'Sovereignty Architect' },
        { id: 'abundance_amplifier', name: 'Abundance Amplifier' }
      ]);
      mockPersonalityManager.getPersonality = jest.fn().mockResolvedValue({
        id: 'sovereignty_architect',
        name: 'Sovereignty Architect',
        traits: ['analytical', 'strategic']
      });
    });

    test('GET /api/personalities should list available personalities', async () => {
      const response = await request(app)
        .get('/api/personalities')
        .expect(200);

      expect(response.body).toEqual([
        { id: 'sovereignty_architect', name: 'Sovereignty Architect' },
        { id: 'abundance_amplifier', name: 'Abundance Amplifier' }
      ]);
    });

    test('GET /api/personalities/:id should return specific personality', async () => {
      const response = await request(app)
        .get('/api/personalities/sovereignty_architect')
        .expect(200);

      expect(response.body).toMatchObject({
        id: 'sovereignty_architect',
        name: 'Sovereignty Architect',
        traits: expect.any(Array)
      });
    });

    test('GET /api/personalities/nonexistent should return 404', async () => {
      const mockPersonalityManager = require('../../src/api/personalities/manager');
      mockPersonalityManager.getPersonality = jest.fn().mockResolvedValue(null);

      await request(app)
        .get('/api/personalities/nonexistent')
        .expect(404);
    });
  });

  describe('Configuration Endpoints', () => {
    beforeEach(() => {
      // Mock config manager
      const mockConfigManager = require('../../src/api/config/manager');
      mockConfigManager.getConfig = jest.fn().mockResolvedValue({
        api_costs: { total_monthly: 150.75 },
        research_settings: { default_personality: 'sovereignty_architect' },
        system_health: 'healthy'
      });
    });

    test('GET /api/config should return system configuration', async () => {
      const response = await request(app)
        .get('/api/config')
        .expect(200);

      expect(response.body).toMatchObject({
        api_costs: expect.any(Object),
        research_settings: expect.any(Object),
        system_health: expect.any(String)
      });
    });

    test('PUT /api/config should update configuration', async () => {
      const mockConfigManager = require('../../src/api/config/manager');
      mockConfigManager.updateConfig = jest.fn().mockResolvedValue({
        success: true,
        updated_fields: ['default_personality']
      });

      const configUpdate = {
        research_settings: {
          default_personality: 'abundance_amplifier'
        }
      };

      const response = await request(app)
        .put('/api/config')
        .send(configUpdate)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        updated_fields: expect.any(Array)
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle 404 for unknown routes', async () => {
      await request(app)
        .get('/api/nonexistent')
        .expect(404);
    });

    test('should handle internal server errors gracefully', async () => {
      // Mock a function to throw an error
      const mockResearchEngine = require('../../src/api/engine/research');
      mockResearchEngine.executeResearch = jest.fn()
        .mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .post('/api/research')
        .send({ topic: 'test', personality: 'test' })
        .expect(500);

      expect(response.body).toMatchObject({
        error: expect.any(String)
      });
    });

    test('should validate JSON payloads', async () => {
      await request(app)
        .post('/api/research')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);
    });
  });

  describe('CORS and Security', () => {
    test('should include CORS headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    test('should handle preflight OPTIONS requests', async () => {
      await request(app)
        .options('/api/research')
        .expect(200);
    });
  });
});