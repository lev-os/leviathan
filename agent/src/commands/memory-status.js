/**
 * Memory Status Command - Health monitoring and configuration status
 * Part of Memory Core Package integration with Universal Command Registry
 */

export async function memoryStatus(args, dependencies) {
  const { memoryManager } = dependencies || {};
  const { 
    detailed = false,
    include_config = false,
    include_stats = true,
    check_services = true
  } = args;

  if (!memoryManager) {
    return {
      success: false,
      error: 'Memory system not initialized',
      content: [{
        type: 'text',
        text: '❌ **Memory System Not Available**\n\nMemory system is not initialized. Check CoreInitializer integration.'
      }]
    };
  }

  try {
    // Get system status from memory manager
    const systemStatus = await memoryManager.getSystemStatus();
    
    // Build status response
    let responseText = `🧠 **Memory System Status**\n\n`;
    
    // Core system status
    responseText += `**System Mode:** ${systemStatus.fallback_mode ? 'Fallback (File Only)' : 'Hybrid (File + Graphiti)'}\n`;
    responseText += `**Timestamp:** ${systemStatus.timestamp}\n\n`;

    // Component status
    responseText += `**Components:**\n`;
    
    // Graphiti status
    const graphiti = systemStatus.components.graphiti;
    const graphitiStatus = graphiti.connected ? '✅ Connected' : '❌ Disconnected';
    responseText += `  • **Graphiti:** ${graphitiStatus}\n`;
    if (detailed) {
      responseText += `    - URI: ${graphiti.uri}\n`;
      responseText += `    - gRPC: ${graphiti.grpc_address}\n`;
      if (graphiti.session_id) {
        responseText += `    - Session: ${graphiti.session_id}\n`;
      }
    }

    // File system status
    const fileSystem = systemStatus.components.file_system;
    const fsStatus = fileSystem.accessible ? '✅ Accessible' : '❌ Inaccessible';
    responseText += `  • **File System:** ${fsStatus}\n`;
    if (detailed) {
      responseText += `    - Sessions: ${fileSystem.sessions_path}\n`;
      responseText += `    - Contexts: ${fileSystem.contexts_path}\n`;
    }

    // Memory types status
    responseText += `\n**Memory Types:**\n`;
    Object.entries(systemStatus.memory_types).forEach(([type, status]) => {
      const typeStatus = status.operational ? '✅ Operational' : '❌ Down';
      responseText += `  • **${type.charAt(0).toUpperCase() + type.slice(1)}:** ${typeStatus}\n`;
    });

    // Service checks if requested
    if (check_services) {
      responseText += `\n**Service Health:**\n`;
      
      try {
        // Check Neo4j connectivity
        const neo4jHealth = await checkNeo4jHealth(memoryManager);
        responseText += `  • **Neo4j:** ${neo4jHealth.status}\n`;
        if (detailed && neo4jHealth.details) {
          responseText += `    - ${neo4jHealth.details}\n`;
        }

        // Check gRPC service
        const grpcHealth = await checkGRPCHealth(memoryManager);
        responseText += `  • **gRPC Service:** ${grpcHealth.status}\n`;
        if (detailed && grpcHealth.details) {
          responseText += `    - ${grpcHealth.details}\n`;
        }

      } catch (error) {
        responseText += `  • **Service Check Failed:** ${error.message}\n`;
      }
    }

    // Memory statistics if requested
    if (include_stats) {
      try {
        const stats = await getMemoryStatistics(memoryManager);
        responseText += `\n**Memory Statistics:**\n`;
        Object.entries(stats).forEach(([type, count]) => {
          responseText += `  • **${type}:** ${count} memories\n`;
        });
      } catch (error) {
        responseText += `\n**Statistics:** Unable to retrieve (${error.message})\n`;
      }
    }

    // Configuration details if requested
    if (include_config) {
      try {
        const config = await getMemoryConfiguration(memoryManager);
        responseText += `\n**Configuration:**\n`;
        responseText += `  • **Deployment Mode:** ${config.deploymentMode || 'unknown'}\n`;
        responseText += `  • **Auto-Detection:** ${config.autoDetection ? 'Enabled' : 'Disabled'}\n`;
        responseText += `  • **Fallback Mode:** ${config.fallbackMode ? 'Enabled' : 'Disabled'}\n`;
        responseText += `  • **Cache Size:** ${config.cacheSize || 'default'}\n`;
      } catch (error) {
        responseText += `\n**Configuration:** Unable to retrieve (${error.message})\n`;
      }
    }

    // Overall health assessment
    const overallHealth = assessOverallHealth(systemStatus);
    responseText += `\n**Overall Health:** ${overallHealth.status}\n`;
    if (overallHealth.recommendations.length > 0) {
      responseText += `\n**Recommendations:**\n`;
      overallHealth.recommendations.forEach((rec, index) => {
        responseText += `${index + 1}. ${rec}\n`;
      });
    }

    return {
      success: true,
      system_status: systemStatus,
      overall_health: overallHealth.status,
      fallback_mode: systemStatus.fallback_mode,
      components_healthy: overallHealth.components_healthy,
      content: [{
        type: 'text',
        text: responseText
      }]
    };

  } catch (error) {
    return {
      success: false,
      error: `Memory status check failed: ${error.message}`,
      content: [{
        type: 'text',
        text: `❌ **Memory Status Check Failed**\n\n**Error:** ${error.message}\n\nCheck memory system initialization and dependencies.`
      }]
    };
  }
}

// Helper functions for health checks
async function checkNeo4jHealth(memoryManager) {
  try {
    if (memoryManager.graphiti && memoryManager.graphiti.connected) {
      return { status: '✅ Connected', details: 'gRPC connection active' };
    } else {
      return { status: '❌ Disconnected', details: 'No active gRPC connection' };
    }
  } catch (error) {
    return { status: '❌ Error', details: error.message };
  }
}

async function checkGRPCHealth(memoryManager) {
  try {
    if (memoryManager.graphiti) {
      // Attempt a simple ping operation
      const result = await memoryManager.graphiti.ping?.() || { status: 'unknown' };
      return { status: '✅ Responsive', details: `Response: ${result.status}` };
    } else {
      return { status: '❌ Not initialized', details: 'gRPC client not created' };
    }
  } catch (error) {
    return { status: '❌ Error', details: error.message };
  }
}

async function getMemoryStatistics(memoryManager) {
  try {
    const stats = {};
    
    // Query each memory type for counts
    const memoryTypes = ['procedural', 'semantic', 'temporal', 'working', 'episodic'];
    
    for (const type of memoryTypes) {
      try {
        const result = await memoryManager.query({
          query: '*',
          type: type,
          limit: 1000  // Get count, not actual results
        });
        stats[type] = result.merged?.items?.length || 0;
      } catch (error) {
        stats[type] = 'error';
      }
    }
    
    return stats;
  } catch (error) {
    throw new Error(`Statistics retrieval failed: ${error.message}`);
  }
}

async function getMemoryConfiguration(memoryManager) {
  try {
    // Access configuration through memory manager
    const config = memoryManager.config || memoryManager.options || {};
    
    return {
      deploymentMode: config.deploymentMode,
      autoDetection: config.auto_detection?.enabled,
      fallbackMode: config.fallbackMode,
      cacheSize: config.cache_size || config.cacheSize,
      enableGraphiti: config.enableGraphiti
    };
  } catch (error) {
    throw new Error(`Configuration access failed: ${error.message}`);
  }
}

function assessOverallHealth(systemStatus) {
  const issues = [];
  const recommendations = [];
  let components_healthy = 0;
  let total_components = 0;

  // Check Graphiti connection
  total_components++;
  if (systemStatus.components.graphiti.connected) {
    components_healthy++;
  } else {
    issues.push('Graphiti disconnected');
    recommendations.push('Check Neo4j service and gRPC server status');
  }

  // Check file system
  total_components++;
  if (systemStatus.components.file_system.accessible) {
    components_healthy++;
  } else {
    issues.push('File system inaccessible');
    recommendations.push('Verify file system permissions and paths');
  }

  // Check memory types
  Object.entries(systemStatus.memory_types).forEach(([type, status]) => {
    total_components++;
    if (status.operational) {
      components_healthy++;
    } else {
      issues.push(`${type} memory type not operational`);
      recommendations.push(`Check ${type} memory implementation`);
    }
  });

  // Determine overall status
  let status;
  if (components_healthy === total_components) {
    status = '✅ Healthy';
  } else if (components_healthy >= total_components * 0.7) {
    status = '⚠️ Degraded';
  } else {
    status = '❌ Critical';
  }

  // Add fallback mode recommendation if active
  if (systemStatus.fallback_mode) {
    recommendations.push('System is in fallback mode - consider restoring Graphiti connection for full functionality');
  }

  return {
    status,
    components_healthy,
    total_components,
    issues,
    recommendations
  };
}

// Export metadata for Universal Command Registry auto-discovery
memoryStatus.description = "Check memory system health, configuration, and service status";
memoryStatus.inputSchema = {
  type: 'object',
  properties: {
    detailed: {
      type: 'boolean',
      default: false,
      description: 'Include detailed component information'
    },
    include_config: {
      type: 'boolean',
      default: false,
      description: 'Include configuration details in status report'
    },
    include_stats: {
      type: 'boolean',
      default: true,
      description: 'Include memory statistics (counts by type)'
    },
    check_services: {
      type: 'boolean',
      default: true,
      description: 'Perform active health checks on external services'
    }
  }
};

// Tool export for Universal Command Registry
export const memoryStatusTool = {
  name: 'memory_status',
  description: memoryStatus.description,
  inputSchema: memoryStatus.inputSchema,
  handler: memoryStatus
};