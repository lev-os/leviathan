const express = require('express');
const router = express.Router();

function createProjectRoutes(platform) {
  const { ingestEngine, metadataDB, testHarnessGenerator, interfaceConverter } = platform;

  // Ingest a new project from repository URL
  router.post('/ingest', async (req, res) => {
    try {
      const { repoUrl, options = {} } = req.body;
      
      if (!repoUrl) {
        return res.status(400).json({ error: 'Repository URL is required' });
      }

      console.log(`🔍 Starting ingestion of ${repoUrl}`);
      
      // Ingest the repository
      const project = await ingestEngine.ingestRepository(repoUrl, options);
      
      // Save to database
      const savedProject = await metadataDB.saveProject(project);
      
      // Track usage
      await metadataDB.trackUsage(project.id, null, 'project_ingested', {
        repoUrl,
        language: project.analysis?.language,
        type: project.analysis?.type
      });

      res.json({
        success: true,
        project: savedProject,
        message: 'Project ingested successfully'
      });

    } catch (error) {
      console.error('❌ Ingestion failed:', error.message);
      res.status(500).json({
        error: 'Failed to ingest project',
        details: error.message
      });
    }
  });

  // Get project by ID
  router.get('/:projectId', async (req, res) => {
    try {
      const { projectId } = req.params;
      
      const project = await metadataDB.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json(project);

    } catch (error) {
      console.error('❌ Failed to get project:', error.message);
      res.status(500).json({
        error: 'Failed to retrieve project',
        details: error.message
      });
    }
  });

  // Search/list projects
  router.get('/', async (req, res) => {
    try {
      const filters = {
        type: req.query.type,
        language: req.query.language,
        framework: req.query.framework,
        search: req.query.search,
        category: req.query.category,
        limit: parseInt(req.query.limit) || 20,
        offset: parseInt(req.query.offset) || 0,
        orderBy: req.query.orderBy || 'ingested_at',
        orderDirection: req.query.orderDirection || 'DESC'
      };

      const projects = await metadataDB.searchProjects(filters);
      
      res.json({
        projects,
        filters,
        total: projects.length
      });

    } catch (error) {
      console.error('❌ Failed to search projects:', error.message);
      res.status(500).json({
        error: 'Failed to search projects',
        details: error.message
      });
    }
  });

  // Update project metadata
  router.put('/:projectId', async (req, res) => {
    try {
      const { projectId } = req.params;
      const updates = req.body;
      
      const project = await metadataDB.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Merge updates
      const updatedProject = {
        ...project,
        ...updates,
        updated_at: new Date().toISOString()
      };

      const savedProject = await metadataDB.saveProject(updatedProject);
      
      res.json({
        success: true,
        project: savedProject
      });

    } catch (error) {
      console.error('❌ Failed to update project:', error.message);
      res.status(500).json({
        error: 'Failed to update project',
        details: error.message
      });
    }
  });

  // Delete project
  router.delete('/:projectId', async (req, res) => {
    try {
      const { projectId } = req.params;
      
      // TODO: Implement project deletion
      // Should also clean up associated harnesses, conversions, and sandbox data
      
      res.json({
        success: true,
        message: 'Project deletion not yet implemented'
      });

    } catch (error) {
      console.error('❌ Failed to delete project:', error.message);
      res.status(500).json({
        error: 'Failed to delete project',
        details: error.message
      });
    }
  });

  // Re-analyze project (re-run ingestion)
  router.post('/:projectId/reanalyze', async (req, res) => {
    try {
      const { projectId } = req.params;
      
      const existingProject = await metadataDB.getProject(projectId);
      if (!existingProject) {
        return res.status(404).json({ error: 'Project not found' });
      }

      console.log(`🔄 Re-analyzing project ${projectId}`);
      
      // Re-ingest the repository
      const project = await ingestEngine.ingestRepository(existingProject.url);
      project.id = projectId; // Keep the same ID
      
      // Save updated analysis
      const savedProject = await metadataDB.saveProject(project);
      
      // Track usage
      await metadataDB.trackUsage(projectId, null, 'project_reanalyzed');

      res.json({
        success: true,
        project: savedProject,
        message: 'Project re-analyzed successfully'
      });

    } catch (error) {
      console.error('❌ Re-analysis failed:', error.message);
      res.status(500).json({
        error: 'Failed to re-analyze project',
        details: error.message
      });
    }
  });

  // Generate test harness for project
  router.post('/:projectId/harness/:interfaceType', async (req, res) => {
    try {
      const { projectId, interfaceType } = req.params;
      
      const project = await metadataDB.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      console.log(`🧪 Generating ${interfaceType} harness for ${project.name}`);
      
      // Generate test harness
      const harness = await testHarnessGenerator.generateTestHarness(project, interfaceType);
      
      // Save to database
      const savedHarness = await metadataDB.saveTestHarness(harness);
      
      // Track usage
      await metadataDB.trackUsage(projectId, interfaceType, 'harness_generated');

      res.json({
        success: true,
        harness: savedHarness,
        message: 'Test harness generated successfully'
      });

    } catch (error) {
      console.error('❌ Harness generation failed:', error.message);
      res.status(500).json({
        error: 'Failed to generate test harness',
        details: error.message
      });
    }
  });

  // Convert interface for project
  router.post('/:projectId/convert/:fromType/:toType', async (req, res) => {
    try {
      const { projectId, fromType, toType } = req.params;
      
      const project = await metadataDB.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      console.log(`🔄 Converting ${fromType} → ${toType} for ${project.name}`);
      
      // Perform conversion
      const conversion = await interfaceConverter.convertInterface(project, fromType, toType);
      
      // Save to database (if we add conversions table)
      // const savedConversion = await metadataDB.saveConversion(conversion);
      
      // Track usage
      await metadataDB.trackUsage(projectId, `${fromType}-to-${toType}`, 'interface_converted');

      res.json({
        success: true,
        conversion,
        message: 'Interface converted successfully'
      });

    } catch (error) {
      console.error('❌ Interface conversion failed:', error.message);
      res.status(500).json({
        error: 'Failed to convert interface',
        details: error.message
      });
    }
  });

  // Get project statistics
  router.get('/:projectId/stats', async (req, res) => {
    try {
      const { projectId } = req.params;
      const { days = 30 } = req.query;
      
      const project = await metadataDB.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const stats = await metadataDB.getUsageStats({ 
        projectId, 
        days: parseInt(days) 
      });

      res.json({
        projectId,
        period: `${days} days`,
        stats
      });

    } catch (error) {
      console.error('❌ Failed to get project stats:', error.message);
      res.status(500).json({
        error: 'Failed to retrieve project statistics',
        details: error.message
      });
    }
  });

  // Get available interface types for project
  router.get('/:projectId/interfaces', async (req, res) => {
    try {
      const { projectId } = req.params;
      
      const project = await metadataDB.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const interfaces = project.interfaces || {};
      const availableInterfaces = Object.keys(interfaces).filter(key => interfaces[key] !== null);

      res.json({
        projectId,
        availableInterfaces,
        interfaces
      });

    } catch (error) {
      console.error('❌ Failed to get project interfaces:', error.message);
      res.status(500).json({
        error: 'Failed to retrieve project interfaces',
        details: error.message
      });
    }
  });

  // Bulk ingest multiple repositories
  router.post('/bulk-ingest', async (req, res) => {
    try {
      const { repositories, options = {} } = req.body;
      
      if (!Array.isArray(repositories) || repositories.length === 0) {
        return res.status(400).json({ error: 'Repositories array is required' });
      }

      console.log(`📦 Starting bulk ingestion of ${repositories.length} repositories`);
      
      const results = [];
      
      // Process repositories in parallel (with concurrency limit)
      const concurrency = options.concurrency || 3;
      const batches = [];
      
      for (let i = 0; i < repositories.length; i += concurrency) {
        batches.push(repositories.slice(i, i + concurrency));
      }
      
      for (const batch of batches) {
        const batchPromises = batch.map(async (repoUrl) => {
          try {
            const project = await ingestEngine.ingestRepository(repoUrl, options);
            const savedProject = await metadataDB.saveProject(project);
            await metadataDB.trackUsage(project.id, null, 'bulk_ingested');
            
            return { success: true, repoUrl, project: savedProject };
          } catch (error) {
            return { success: false, repoUrl, error: error.message };
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }

      const successful = results.filter(r => r.success).length;
      const failed = results.length - successful;

      res.json({
        success: true,
        results,
        summary: {
          total: repositories.length,
          successful,
          failed
        }
      });

    } catch (error) {
      console.error('❌ Bulk ingestion failed:', error.message);
      res.status(500).json({
        error: 'Failed to perform bulk ingestion',
        details: error.message
      });
    }
  });

  return router;
}

module.exports = createProjectRoutes;