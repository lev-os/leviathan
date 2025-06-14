const express = require('express');
const router = express.Router();

function createVaultRoutes(platform) {
  const { apiKeyVault, metadataDB } = platform;

  // Store API key
  router.post('/keys', async (req, res) => {
    try {
      const { service, keyName, keyValue, metadata = {} } = req.body;
      
      if (!service || !keyName || !keyValue) {
        return res.status(400).json({ 
          error: 'Service, keyName, and keyValue are required' 
        });
      }

      console.log(`🔑 Storing API key: ${service}:${keyName}`);
      
      const keyId = await apiKeyVault.storeKey(service, keyName, keyValue, metadata);
      
      res.json({
        success: true,
        keyId,
        message: 'API key stored successfully'
      });

    } catch (error) {
      console.error('❌ Failed to store API key:', error.message);
      res.status(500).json({
        error: 'Failed to store API key',
        details: error.message
      });
    }
  });

  // Get API key (returns metadata only, not the actual key)
  router.get('/keys/:service/:keyName', async (req, res) => {
    try {
      const { service, keyName } = req.params;
      
      const keyData = await apiKeyVault.getKey(service, keyName);
      
      if (!keyData) {
        return res.status(404).json({ error: 'API key not found' });
      }

      // Return metadata only, not the actual key value
      res.json({
        service,
        keyName,
        metadata: keyData.metadata,
        hasValue: true
      });

    } catch (error) {
      console.error('❌ Failed to get API key:', error.message);
      res.status(500).json({
        error: 'Failed to retrieve API key',
        details: error.message
      });
    }
  });

  // List API keys for a service
  router.get('/keys/:service', async (req, res) => {
    try {
      const { service } = req.params;
      
      const keys = await apiKeyVault.listKeys(service);
      
      res.json({
        service,
        keys,
        total: keys.length
      });

    } catch (error) {
      console.error('❌ Failed to list API keys:', error.message);
      res.status(500).json({
        error: 'Failed to list API keys',
        details: error.message
      });
    }
  });

  // List all API keys
  router.get('/keys', async (req, res) => {
    try {
      const keys = await apiKeyVault.listKeys();
      
      // Group by service
      const groupedKeys = keys.reduce((acc, key) => {
        if (!acc[key.service]) {
          acc[key.service] = [];
        }
        acc[key.service].push(key);
        return acc;
      }, {});

      res.json({
        keys: groupedKeys,
        total: keys.length,
        services: Object.keys(groupedKeys)
      });

    } catch (error) {
      console.error('❌ Failed to list API keys:', error.message);
      res.status(500).json({
        error: 'Failed to list API keys',
        details: error.message
      });
    }
  });

  // Update API key
  router.put('/keys/:service/:keyName', async (req, res) => {
    try {
      const { service, keyName } = req.params;
      const { keyValue, metadata = {} } = req.body;
      
      if (!keyValue) {
        return res.status(400).json({ error: 'keyValue is required' });
      }

      console.log(`🔄 Updating API key: ${service}:${keyName}`);
      
      const keyId = await apiKeyVault.updateKey(service, keyName, keyValue, metadata);
      
      res.json({
        success: true,
        keyId,
        message: 'API key updated successfully'
      });

    } catch (error) {
      console.error('❌ Failed to update API key:', error.message);
      res.status(500).json({
        error: 'Failed to update API key',
        details: error.message
      });
    }
  });

  // Delete API key
  router.delete('/keys/:service/:keyName', async (req, res) => {
    try {
      const { service, keyName } = req.params;
      
      console.log(`🗑️  Deleting API key: ${service}:${keyName}`);
      
      const deleted = await apiKeyVault.deleteKey(service, keyName);
      
      if (!deleted) {
        return res.status(404).json({ error: 'API key not found' });
      }

      res.json({
        success: true,
        message: 'API key deleted successfully'
      });

    } catch (error) {
      console.error('❌ Failed to delete API key:', error.message);
      res.status(500).json({
        error: 'Failed to delete API key',
        details: error.message
      });
    }
  });

  // Test API key
  router.post('/keys/:service/:keyName/test', async (req, res) => {
    try {
      const { service, keyName } = req.params;
      const { testFunction } = req.body;
      
      console.log(`🧪 Testing API key: ${service}:${keyName}`);
      
      // Use built-in test function if available
      const builtinTest = apiKeyVault.getBuiltinTestFunction(service);
      const testFunc = testFunction || builtinTest;
      
      if (!testFunc) {
        return res.status(400).json({ 
          error: 'No test function available for this service' 
        });
      }

      const result = await apiKeyVault.testKey(service, keyName, testFunc);
      
      res.json({
        success: true,
        testResult: result,
        message: result.success ? 'API key test passed' : 'API key test failed'
      });

    } catch (error) {
      console.error('❌ API key test failed:', error.message);
      res.status(500).json({
        error: 'Failed to test API key',
        details: error.message
      });
    }
  });

  // Store multiple keys for a project
  router.post('/projects/:projectId/keys', async (req, res) => {
    try {
      const { projectId } = req.params;
      const { keys } = req.body;
      
      if (!Array.isArray(keys) || keys.length === 0) {
        return res.status(400).json({ error: 'Keys array is required' });
      }

      console.log(`📦 Storing ${keys.length} API keys for project ${projectId}`);
      
      const results = await apiKeyVault.storeProjectKeys(projectId, keys);
      
      const successful = results.filter(r => r.success).length;
      const failed = results.length - successful;

      res.json({
        success: true,
        results,
        summary: {
          total: keys.length,
          successful,
          failed
        }
      });

    } catch (error) {
      console.error('❌ Failed to store project keys:', error.message);
      res.status(500).json({
        error: 'Failed to store project keys',
        details: error.message
      });
    }
  });

  // Get keys for a project
  router.get('/projects/:projectId/keys', async (req, res) => {
    try {
      const { projectId } = req.params;
      
      const keys = await apiKeyVault.getProjectKeys(projectId);
      
      res.json({
        projectId,
        keys,
        total: keys.length
      });

    } catch (error) {
      console.error('❌ Failed to get project keys:', error.message);
      res.status(500).json({
        error: 'Failed to get project keys',
        details: error.message
      });
    }
  });

  // Delete all keys for a project
  router.delete('/projects/:projectId/keys', async (req, res) => {
    try {
      const { projectId } = req.params;
      
      console.log(`🗑️  Deleting all API keys for project ${projectId}`);
      
      const deleted = await apiKeyVault.deleteProjectKeys(projectId);
      
      res.json({
        success: true,
        deleted,
        message: `Deleted ${deleted} API keys`
      });

    } catch (error) {
      console.error('❌ Failed to delete project keys:', error.message);
      res.status(500).json({
        error: 'Failed to delete project keys',
        details: error.message
      });
    }
  });

  // Generate environment file for project
  router.get('/projects/:projectId/env/:format', async (req, res) => {
    try {
      const { projectId, format } = req.params;
      
      if (!['dotenv', 'docker', 'json'].includes(format)) {
        return res.status(400).json({ 
          error: 'Format must be one of: dotenv, docker, json' 
        });
      }

      console.log(`📋 Generating ${format} environment for project ${projectId}`);
      
      const envData = await apiKeyVault.generateEnvFile(projectId, format);
      
      // Set appropriate content type
      const contentTypes = {
        'dotenv': 'text/plain',
        'docker': 'application/json',
        'json': 'application/json'
      };
      
      const filenames = {
        'dotenv': `${projectId}.env`,
        'docker': `${projectId}-env.json`,
        'json': `${projectId}-keys.json`
      };

      res.setHeader('Content-Type', contentTypes[format]);
      res.setHeader('Content-Disposition', `attachment; filename="${filenames[format]}"`);
      
      if (format === 'docker') {
        res.json(envData);
      } else {
        res.send(envData);
      }

    } catch (error) {
      console.error('❌ Failed to generate environment file:', error.message);
      res.status(500).json({
        error: 'Failed to generate environment file',
        details: error.message
      });
    }
  });

  // Export vault (encrypted)
  router.post('/export', async (req, res) => {
    try {
      const { password } = req.body;
      
      if (!password) {
        return res.status(400).json({ error: 'Password is required for export' });
      }

      console.log('📤 Exporting API key vault');
      
      const exportData = await apiKeyVault.exportVault(password);
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="vault-export.json"');
      
      res.json({
        version: '1.0',
        exportedAt: new Date().toISOString(),
        ...exportData
      });

    } catch (error) {
      console.error('❌ Failed to export vault:', error.message);
      res.status(500).json({
        error: 'Failed to export vault',
        details: error.message
      });
    }
  });

  // Import vault (encrypted)
  router.post('/import', async (req, res) => {
    try {
      const { exportData, password } = req.body;
      
      if (!exportData || !password) {
        return res.status(400).json({ 
          error: 'Export data and password are required' 
        });
      }

      console.log('📥 Importing API key vault');
      
      const imported = await apiKeyVault.importVault(exportData, password);
      
      res.json({
        success: true,
        imported,
        message: `Imported ${imported} API keys`
      });

    } catch (error) {
      console.error('❌ Failed to import vault:', error.message);
      res.status(500).json({
        error: 'Failed to import vault',
        details: error.message
      });
    }
  });

  // Initialize vault with master password
  router.post('/initialize', async (req, res) => {
    try {
      const { masterPassword } = req.body;
      
      if (!masterPassword) {
        return res.status(400).json({ error: 'Master password is required' });
      }

      console.log('🔐 Initializing API key vault');
      
      const initialized = await apiKeyVault.initialize(masterPassword);
      
      res.json({
        success: true,
        initialized,
        message: 'Vault initialized successfully'
      });

    } catch (error) {
      console.error('❌ Failed to initialize vault:', error.message);
      res.status(500).json({
        error: 'Failed to initialize vault',
        details: error.message
      });
    }
  });

  // Vault health check
  router.get('/health', async (req, res) => {
    try {
      const health = await apiKeyVault.healthCheck();
      
      res.json({
        timestamp: new Date().toISOString(),
        ...health
      });

    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Get supported services and their test functions
  router.get('/services', async (req, res) => {
    try {
      const services = {
        'openai': {
          name: 'OpenAI',
          description: 'OpenAI API for GPT models',
          hasBuiltinTest: true,
          commonKeyNames: ['api_key', 'openai_api_key'],
          environmentVariables: ['OPENAI_API_KEY']
        },
        'anthropic': {
          name: 'Anthropic',
          description: 'Anthropic Claude API',
          hasBuiltinTest: true,
          commonKeyNames: ['api_key', 'anthropic_api_key'],
          environmentVariables: ['ANTHROPIC_API_KEY']
        },
        'github': {
          name: 'GitHub',
          description: 'GitHub API',
          hasBuiltinTest: true,
          commonKeyNames: ['token', 'github_token'],
          environmentVariables: ['GITHUB_TOKEN']
        },
        'stripe': {
          name: 'Stripe',
          description: 'Stripe payment processing',
          hasBuiltinTest: false,
          commonKeyNames: ['secret_key', 'publishable_key'],
          environmentVariables: ['STRIPE_SECRET_KEY', 'STRIPE_PUBLISHABLE_KEY']
        },
        'custom': {
          name: 'Custom Service',
          description: 'Custom API service',
          hasBuiltinTest: false,
          commonKeyNames: ['api_key', 'token'],
          environmentVariables: ['API_KEY']
        }
      };
      
      res.json({
        services,
        supportedServices: Object.keys(services)
      });

    } catch (error) {
      console.error('❌ Failed to get services:', error.message);
      res.status(500).json({
        error: 'Failed to get supported services',
        details: error.message
      });
    }
  });

  return router;
}

module.exports = createVaultRoutes;