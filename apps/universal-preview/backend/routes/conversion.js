const express = require('express');
const router = express.Router();

function createConversionRoutes(platform) {
  const { interfaceConverter, metadataDB } = platform;

  // Convert project interface
  router.post('/:projectId/:fromType/:toType', async (req, res) => {
    try {
      const { projectId, fromType, toType } = req.params;
      const { options = {} } = req.body;
      
      const project = await metadataDB.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      console.log(`🔄 Converting ${fromType} → ${toType} for ${project.name}`);
      
      // Perform conversion
      const conversion = await interfaceConverter.convertInterface(project, fromType, toType);
      
      // Track usage
      await metadataDB.trackUsage(projectId, `${fromType}-to-${toType}`, 'interface_converted', {
        fromType,
        toType,
        options
      });

      res.json({
        success: true,
        conversion,
        message: `Successfully converted ${fromType} to ${toType}`
      });

    } catch (error) {
      console.error('❌ Interface conversion failed:', error.message);
      res.status(500).json({
        error: 'Failed to convert interface',
        details: error.message
      });
    }
  });

  // Get available conversion types for a project
  router.get('/:projectId/available', async (req, res) => {
    try {
      const { projectId } = req.params;
      
      const project = await metadataDB.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const interfaces = project.interfaces || {};
      const availableInterfaces = Object.keys(interfaces).filter(key => interfaces[key] !== null);
      
      // Define possible conversions
      const allConversions = [
        'cli-to-api', 'cli-to-mcp',
        'api-to-cli', 'api-to-mcp', 
        'mcp-to-api', 'mcp-to-cli'
      ];
      
      const availableConversions = [];
      
      for (const conversion of allConversions) {
        const [from, to] = conversion.split('-to-');
        
        // Check if source interface exists
        if (availableInterfaces.includes(from)) {
          availableConversions.push({
            from,
            to,
            conversionId: conversion,
            available: true,
            description: this.getConversionDescription(from, to)
          });
        }
      }

      res.json({
        projectId,
        projectName: project.name,
        availableInterfaces,
        availableConversions
      });

    } catch (error) {
      console.error('❌ Failed to get available conversions:', error.message);
      res.status(500).json({
        error: 'Failed to get available conversions',
        details: error.message
      });
    }
  });

  // Generate conversion preview (without actually creating files)
  router.post('/:projectId/:fromType/:toType/preview', async (req, res) => {
    try {
      const { projectId, fromType, toType } = req.params;
      
      const project = await metadataDB.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      console.log(`👁️  Previewing ${fromType} → ${toType} conversion for ${project.name}`);
      
      // Generate conversion (this doesn't create actual files)
      const conversion = await interfaceConverter.convertInterface(project, fromType, toType);
      
      // Extract preview information
      const preview = {
        conversionType: `${fromType}-to-${toType}`,
        projectId,
        projectName: project.name,
        fromInterface: fromType,
        toInterface: toType,
        generatedFiles: this.extractGeneratedFiles(conversion.conversion),
        configuration: this.extractConfiguration(conversion.conversion),
        deployment: this.extractDeploymentInfo(conversion.conversion),
        examples: this.extractExamples(conversion.conversion)
      };

      res.json({
        success: true,
        preview,
        message: 'Conversion preview generated successfully'
      });

    } catch (error) {
      console.error('❌ Conversion preview failed:', error.message);
      res.status(500).json({
        error: 'Failed to generate conversion preview',
        details: error.message
      });
    }
  });

  // Download conversion as zip file
  router.get('/:projectId/:fromType/:toType/download', async (req, res) => {
    try {
      const { projectId, fromType, toType } = req.params;
      
      const project = await metadataDB.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Perform conversion
      const conversion = await interfaceConverter.convertInterface(project, fromType, toType);
      
      // Create zip archive
      const archiver = require('archiver');
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 
        `attachment; filename="${project.name}-${fromType}-to-${toType}.zip"`);
      
      archive.pipe(res);
      
      // Add files to archive based on conversion type
      this.addConversionFilesToArchive(archive, conversion.conversion, project);
      
      archive.finalize();
      
      // Track usage
      await metadataDB.trackUsage(projectId, `${fromType}-to-${toType}`, 'conversion_downloaded');

    } catch (error) {
      console.error('❌ Conversion download failed:', error.message);
      res.status(500).json({
        error: 'Failed to download conversion',
        details: error.message
      });
    }
  });

  // Get conversion templates/examples
  router.get('/templates/:conversionType', async (req, res) => {
    try {
      const { conversionType } = req.params;
      
      const templates = this.getConversionTemplates(conversionType);
      
      if (!templates) {
        return res.status(404).json({ 
          error: `No templates found for conversion type: ${conversionType}` 
        });
      }

      res.json({
        conversionType,
        templates
      });

    } catch (error) {
      console.error('❌ Failed to get conversion templates:', error.message);
      res.status(500).json({
        error: 'Failed to get conversion templates',
        details: error.message
      });
    }
  });

  // Validate conversion requirements
  router.post('/:projectId/:fromType/:toType/validate', async (req, res) => {
    try {
      const { projectId, fromType, toType } = req.params;
      
      const project = await metadataDB.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const validation = this.validateConversionRequirements(project, fromType, toType);
      
      res.json({
        projectId,
        fromType,
        toType,
        validation
      });

    } catch (error) {
      console.error('❌ Conversion validation failed:', error.message);
      res.status(500).json({
        error: 'Failed to validate conversion',
        details: error.message
      });
    }
  });

  // Helper methods (these would be defined on the router or in a utility class)
  
  getConversionDescription(from, to) {
    const descriptions = {
      'cli-api': 'Wrap CLI tool in a REST API',
      'cli-mcp': 'Convert CLI tool to MCP server',
      'api-cli': 'Create CLI wrapper for REST API',
      'api-mcp': 'Bridge REST API to MCP protocol',
      'mcp-api': 'Expose MCP server as REST API',
      'mcp-cli': 'Create CLI interface for MCP server'
    };
    
    return descriptions[`${from}-${to}`] || `Convert ${from} to ${to}`;
  }

  extractGeneratedFiles(conversion) {
    const files = [];
    
    if (conversion.wrapper && conversion.wrapper.code) {
      files.push({
        name: 'wrapper.js',
        type: 'javascript',
        description: 'Main wrapper implementation'
      });
    }
    
    if (conversion.wrapper && conversion.wrapper.dockerfile) {
      files.push({
        name: 'Dockerfile',
        type: 'docker',
        description: 'Docker container configuration'
      });
    }
    
    if (conversion.wrapper && conversion.wrapper.packageJson) {
      files.push({
        name: 'package.json',
        type: 'json',
        description: 'Node.js dependencies'
      });
    }
    
    return files;
  }

  extractConfiguration(conversion) {
    const config = {};
    
    if (conversion.port) {
      config.port = conversion.port;
    }
    
    if (conversion.framework) {
      config.framework = conversion.framework;
    }
    
    if (conversion.protocol) {
      config.protocol = conversion.protocol;
    }
    
    return config;
  }

  extractDeploymentInfo(conversion) {
    const deployment = {
      dockerSupport: !!conversion.wrapper?.dockerfile,
      port: conversion.port,
      environment: [],
      commands: {}
    };
    
    if (conversion.type === 'api-wrapper' || conversion.type === 'api-mcp-bridge') {
      deployment.commands.start = 'npm start';
      deployment.commands.dev = 'npm run dev';
      deployment.environment.push('PORT', 'NODE_ENV');
    }
    
    if (conversion.type === 'mcp-wrapper' || conversion.type === 'mcp-api-bridge') {
      deployment.commands.start = 'node index.js';
      deployment.environment.push('MCP_TRANSPORT');
    }
    
    return deployment;
  }

  extractExamples(conversion) {
    const examples = [];
    
    if (conversion.endpoints) {
      examples.push({
        type: 'curl',
        title: 'API Request Example',
        code: `curl -X POST http://localhost:${conversion.port || 3000}/execute \\
  -H "Content-Type: application/json" \\
  -d '{"command": "help", "args": []}'`
      });
    }
    
    if (conversion.tools) {
      examples.push({
        type: 'mcp',
        title: 'MCP Tool Call Example',
        code: JSON.stringify({
          method: 'tools/call',
          params: {
            name: conversion.tools[0]?.name || 'execute',
            arguments: {}
          }
        }, null, 2)
      });
    }
    
    return examples;
  }

  addConversionFilesToArchive(archive, conversion, project) {
    if (conversion.wrapper?.code) {
      archive.append(conversion.wrapper.code, { name: 'wrapper.js' });
    }
    
    if (conversion.wrapper?.dockerfile) {
      archive.append(conversion.wrapper.dockerfile, { name: 'Dockerfile' });
    }
    
    if (conversion.wrapper?.packageJson) {
      archive.append(JSON.stringify(conversion.wrapper.packageJson, null, 2), { 
        name: 'package.json' 
      });
    }
    
    // Add README with instructions
    const readme = this.generateConversionReadme(conversion, project);
    archive.append(readme, { name: 'README.md' });
    
    // Add docker-compose if applicable
    if (conversion.wrapper?.dockerfile) {
      const dockerCompose = this.generateDockerCompose(conversion, project);
      archive.append(dockerCompose, { name: 'docker-compose.yml' });
    }
  }

  generateConversionReadme(conversion, project) {
    return `# ${project.name} - ${conversion.type}

This is an automatically generated ${conversion.type} for the project "${project.name}".

## Quick Start

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start the service:
   \`\`\`bash
   npm start
   \`\`\`

${conversion.port ? `3. The service will be available at http://localhost:${conversion.port}` : ''}

## Generated Files

- \`wrapper.js\` - Main wrapper implementation
- \`package.json\` - Dependencies and scripts
- \`Dockerfile\` - Container configuration
- \`docker-compose.yml\` - Development setup

## API Documentation

${conversion.documentation ? JSON.stringify(conversion.documentation, null, 2) : 'See the generated OpenAPI documentation.'}

---
Generated by Universal Preview Platform
`;
  }

  generateDockerCompose(conversion, project) {
    return `version: '3.8'

services:
  ${project.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}:
    build: .
    ports:
      - "${conversion.port || 3000}:${conversion.port || 3000}"
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
`;
  }

  getConversionTemplates(conversionType) {
    const templates = {
      'cli-to-api': {
        description: 'Convert CLI tools to REST APIs',
        examples: [
          {
            name: 'Basic CLI Wrapper',
            description: 'Simple REST API wrapper for CLI commands'
          }
        ]
      },
      'cli-to-mcp': {
        description: 'Convert CLI tools to MCP servers',
        examples: [
          {
            name: 'MCP CLI Bridge',
            description: 'MCP server that executes CLI commands'
          }
        ]
      }
      // Add more templates as needed
    };
    
    return templates[conversionType];
  }

  validateConversionRequirements(project, fromType, toType) {
    const validation = {
      valid: true,
      warnings: [],
      errors: [],
      requirements: []
    };
    
    // Check if source interface exists
    if (!project.interfaces || !project.interfaces[fromType]) {
      validation.valid = false;
      validation.errors.push(`Source interface '${fromType}' not available for this project`);
    }
    
    // Check language compatibility
    if (project.analysis?.language !== 'node' && toType === 'api') {
      validation.warnings.push('API wrapper works best with Node.js projects');
    }
    
    // Check for required dependencies
    if (toType === 'api') {
      validation.requirements.push('Express.js framework');
      validation.requirements.push('Docker for containerization');
    }
    
    if (toType === 'mcp') {
      validation.requirements.push('MCP protocol implementation');
      validation.requirements.push('JSON-RPC 2.0 support');
    }
    
    return validation;
  }

  return router;
}

module.exports = createConversionRoutes;