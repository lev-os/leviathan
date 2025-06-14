const { Pool } = require('pg');

class MetadataDB {
  constructor(connectionConfig) {
    this.pool = new Pool({
      host: connectionConfig.host || 'localhost',
      port: connectionConfig.port || 5432,
      database: connectionConfig.database || 'universal_preview',
      user: connectionConfig.user || 'postgres',
      password: connectionConfig.password || 'postgres',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.initializeDatabase();
  }

  async initializeDatabase() {
    console.log('🗄️  Initializing MetadataDB...');
    
    try {
      await this.createTables();
      console.log('✅ MetadataDB initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize MetadataDB:', error.message);
      throw error;
    }
  }

  async createTables() {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Projects table
      await client.query(`
        CREATE TABLE IF NOT EXISTS projects (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          url TEXT NOT NULL,
          local_path TEXT,
          type VARCHAR(100),
          language VARCHAR(100),
          framework VARCHAR(100),
          package_manager VARCHAR(100),
          metadata JSONB,
          analysis JSONB,
          interfaces JSONB,
          ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Test harnesses table
      await client.query(`
        CREATE TABLE IF NOT EXISTS test_harnesses (
          id VARCHAR(255) PRIMARY KEY,
          project_id VARCHAR(255) REFERENCES projects(id) ON DELETE CASCADE,
          interface_type VARCHAR(100) NOT NULL,
          harness JSONB NOT NULL,
          metadata JSONB,
          generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Interface conversions table
      await client.query(`
        CREATE TABLE IF NOT EXISTS interface_conversions (
          id VARCHAR(255) PRIMARY KEY,
          project_id VARCHAR(255) REFERENCES projects(id) ON DELETE CASCADE,
          from_type VARCHAR(100) NOT NULL,
          to_type VARCHAR(100) NOT NULL,
          conversion JSONB NOT NULL,
          converted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Execution logs table
      await client.query(`
        CREATE TABLE IF NOT EXISTS execution_logs (
          id SERIAL PRIMARY KEY,
          sandbox_id VARCHAR(255) NOT NULL,
          project_id VARCHAR(255) REFERENCES projects(id) ON DELETE CASCADE,
          command TEXT,
          exit_code INTEGER,
          stdout TEXT,
          stderr TEXT,
          execution_time INTEGER,
          started_at TIMESTAMP,
          completed_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Categories table
      await client.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL,
          description TEXT,
          color VARCHAR(7),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Project categories junction table
      await client.query(`
        CREATE TABLE IF NOT EXISTS project_categories (
          project_id VARCHAR(255) REFERENCES projects(id) ON DELETE CASCADE,
          category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
          PRIMARY KEY (project_id, category_id)
        )
      `);

      // Tags table
      await client.query(`
        CREATE TABLE IF NOT EXISTS tags (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Project tags junction table
      await client.query(`
        CREATE TABLE IF NOT EXISTS project_tags (
          project_id VARCHAR(255) REFERENCES projects(id) ON DELETE CASCADE,
          tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
          PRIMARY KEY (project_id, tag_id)
        )
      `);

      // Usage statistics table
      await client.query(`
        CREATE TABLE IF NOT EXISTS usage_stats (
          id SERIAL PRIMARY KEY,
          project_id VARCHAR(255) REFERENCES projects(id) ON DELETE CASCADE,
          interface_type VARCHAR(100),
          event_type VARCHAR(100) NOT NULL,
          metadata JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create indexes for better performance
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);
        CREATE INDEX IF NOT EXISTS idx_projects_language ON projects(language);
        CREATE INDEX IF NOT EXISTS idx_projects_ingested_at ON projects(ingested_at);
        CREATE INDEX IF NOT EXISTS idx_test_harnesses_project_id ON test_harnesses(project_id);
        CREATE INDEX IF NOT EXISTS idx_test_harnesses_interface_type ON test_harnesses(interface_type);
        CREATE INDEX IF NOT EXISTS idx_execution_logs_project_id ON execution_logs(project_id);
        CREATE INDEX IF NOT EXISTS idx_execution_logs_sandbox_id ON execution_logs(sandbox_id);
        CREATE INDEX IF NOT EXISTS idx_usage_stats_project_id ON usage_stats(project_id);
        CREATE INDEX IF NOT EXISTS idx_usage_stats_created_at ON usage_stats(created_at);
      `);

      // Insert default categories
      await client.query(`
        INSERT INTO categories (name, description, color) VALUES
        ('MCP Server', 'Model Context Protocol servers', '#FF6B6B'),
        ('Browser Automation', 'Web scraping and automation tools', '#4ECDC4'),
        ('API', 'REST and GraphQL APIs', '#45B7D1'),
        ('CLI Tool', 'Command line utilities', '#96CEB4'),
        ('Library', 'Code libraries and SDKs', '#FFEAA7'),
        ('Financial', 'Financial data and trading tools', '#DDA0DD'),
        ('Research', 'Research and analysis tools', '#98D8C8')
        ON CONFLICT (name) DO NOTHING
      `);

      await client.query('COMMIT');
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Project operations
  async saveProject(project) {
    const client = await this.pool.connect();
    
    try {
      const query = `
        INSERT INTO projects (
          id, name, url, local_path, type, language, framework, 
          package_manager, metadata, analysis, interfaces, ingested_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          url = EXCLUDED.url,
          local_path = EXCLUDED.local_path,
          type = EXCLUDED.type,
          language = EXCLUDED.language,
          framework = EXCLUDED.framework,
          package_manager = EXCLUDED.package_manager,
          metadata = EXCLUDED.metadata,
          analysis = EXCLUDED.analysis,
          interfaces = EXCLUDED.interfaces,
          ingested_at = EXCLUDED.ingested_at,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;
      
      const values = [
        project.id,
        project.name,
        project.url,
        project.localPath,
        project.analysis?.type,
        project.analysis?.language,
        project.analysis?.framework,
        project.analysis?.packageManager,
        JSON.stringify(project.metadata),
        JSON.stringify(project.analysis),
        JSON.stringify(project.interfaces),
        project.ingestedAt
      ];
      
      const result = await client.query(query, values);
      
      // Auto-categorize project
      await this.autoCategorizeProject(client, project);
      
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async getProject(projectId) {
    const client = await this.pool.connect();
    
    try {
      const query = `
        SELECT p.*, 
               array_agg(DISTINCT c.name) as categories,
               array_agg(DISTINCT t.name) as tags
        FROM projects p
        LEFT JOIN project_categories pc ON p.id = pc.project_id
        LEFT JOIN categories c ON pc.category_id = c.id
        LEFT JOIN project_tags pt ON p.id = pt.project_id
        LEFT JOIN tags t ON pt.tag_id = t.id
        WHERE p.id = $1
        GROUP BY p.id
      `;
      
      const result = await client.query(query, [projectId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const project = result.rows[0];
      project.metadata = JSON.parse(project.metadata || '{}');
      project.analysis = JSON.parse(project.analysis || '{}');
      project.interfaces = JSON.parse(project.interfaces || '{}');
      project.categories = project.categories.filter(c => c !== null);
      project.tags = project.tags.filter(t => t !== null);
      
      return project;
    } finally {
      client.release();
    }
  }

  async searchProjects(filters = {}) {
    const client = await this.pool.connect();
    
    try {
      let query = `
        SELECT p.*, 
               array_agg(DISTINCT c.name) as categories,
               array_agg(DISTINCT t.name) as tags
        FROM projects p
        LEFT JOIN project_categories pc ON p.id = pc.project_id
        LEFT JOIN categories c ON pc.category_id = c.id
        LEFT JOIN project_tags pt ON p.id = pt.project_id
        LEFT JOIN tags t ON pt.tag_id = t.id
      `;
      
      const conditions = [];
      const values = [];
      let paramCount = 0;
      
      if (filters.type) {
        paramCount++;
        conditions.push(`p.type = $${paramCount}`);
        values.push(filters.type);
      }
      
      if (filters.language) {
        paramCount++;
        conditions.push(`p.language = $${paramCount}`);
        values.push(filters.language);
      }
      
      if (filters.framework) {
        paramCount++;
        conditions.push(`p.framework = $${paramCount}`);
        values.push(filters.framework);
      }
      
      if (filters.search) {
        paramCount++;
        conditions.push(`(p.name ILIKE $${paramCount} OR p.metadata->>'description' ILIKE $${paramCount})`);
        values.push(`%${filters.search}%`);
      }
      
      if (filters.category) {
        paramCount++;
        conditions.push(`c.name = $${paramCount}`);
        values.push(filters.category);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' GROUP BY p.id';
      
      if (filters.orderBy) {
        query += ` ORDER BY ${filters.orderBy}`;
        if (filters.orderDirection) {
          query += ` ${filters.orderDirection}`;
        }
      } else {
        query += ' ORDER BY p.ingested_at DESC';
      }
      
      if (filters.limit) {
        paramCount++;
        query += ` LIMIT $${paramCount}`;
        values.push(filters.limit);
      }
      
      if (filters.offset) {
        paramCount++;
        query += ` OFFSET $${paramCount}`;
        values.push(filters.offset);
      }
      
      const result = await client.query(query, values);
      
      return result.rows.map(project => {
        project.metadata = JSON.parse(project.metadata || '{}');
        project.analysis = JSON.parse(project.analysis || '{}');
        project.interfaces = JSON.parse(project.interfaces || '{}');
        project.categories = project.categories.filter(c => c !== null);
        project.tags = project.tags.filter(t => t !== null);
        return project;
      });
    } finally {
      client.release();
    }
  }

  // Test harness operations
  async saveTestHarness(harness) {
    const client = await this.pool.connect();
    
    try {
      const query = `
        INSERT INTO test_harnesses (id, project_id, interface_type, harness, metadata, generated_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          harness = EXCLUDED.harness,
          metadata = EXCLUDED.metadata,
          generated_at = EXCLUDED.generated_at
        RETURNING *
      `;
      
      const values = [
        harness.id,
        harness.projectId,
        harness.interfaceType,
        JSON.stringify(harness.harness),
        JSON.stringify(harness.metadata),
        harness.generatedAt
      ];
      
      const result = await client.query(query, values);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async getTestHarness(harnessId) {
    const client = await this.pool.connect();
    
    try {
      const query = `SELECT * FROM test_harnesses WHERE id = $1`;
      const result = await client.query(query, [harnessId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const harness = result.rows[0];
      harness.harness = JSON.parse(harness.harness);
      harness.metadata = JSON.parse(harness.metadata || '{}');
      
      return harness;
    } finally {
      client.release();
    }
  }

  // Execution logs
  async logExecution(execution) {
    const client = await this.pool.connect();
    
    try {
      const query = `
        INSERT INTO execution_logs (
          sandbox_id, project_id, command, exit_code, stdout, stderr,
          execution_time, started_at, completed_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      
      const values = [
        execution.sandboxId,
        execution.projectId,
        execution.command,
        execution.exitCode,
        execution.stdout,
        execution.stderr,
        execution.executionTime,
        execution.startedAt,
        execution.completedAt
      ];
      
      const result = await client.query(query, values);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // Usage statistics
  async trackUsage(projectId, interfaceType, eventType, metadata = {}) {
    const client = await this.pool.connect();
    
    try {
      const query = `
        INSERT INTO usage_stats (project_id, interface_type, event_type, metadata)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      
      const values = [
        projectId,
        interfaceType,
        eventType,
        JSON.stringify(metadata)
      ];
      
      const result = await client.query(query, values);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async getUsageStats(filters = {}) {
    const client = await this.pool.connect();
    
    try {
      let query = `
        SELECT 
          event_type,
          interface_type,
          COUNT(*) as count,
          DATE_TRUNC('day', created_at) as date
        FROM usage_stats
      `;
      
      const conditions = [];
      const values = [];
      let paramCount = 0;
      
      if (filters.projectId) {
        paramCount++;
        conditions.push(`project_id = $${paramCount}`);
        values.push(filters.projectId);
      }
      
      if (filters.days) {
        paramCount++;
        conditions.push(`created_at >= NOW() - INTERVAL '${filters.days} days'`);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' GROUP BY event_type, interface_type, DATE_TRUNC(\'day\', created_at)';
      query += ' ORDER BY date DESC';
      
      const result = await client.query(query, values);
      return result.rows;
    } finally {
      client.release();
    }
  }

  // Categories and tags
  async autoCategorizeProject(client, project) {
    const categories = [];
    
    // Auto-categorize based on project type
    if (project.analysis?.type === 'mcp-server') {
      categories.push('MCP Server');
    }
    
    if (project.analysis?.type === 'browser-automation') {
      categories.push('Browser Automation');
    }
    
    if (project.analysis?.framework === 'express' || project.analysis?.framework === 'fastify') {
      categories.push('API');
    }
    
    if (project.metadata?.scripts && Object.keys(project.metadata.scripts).length > 0) {
      categories.push('CLI Tool');
    }
    
    // Check for financial keywords
    const description = project.metadata?.description?.toLowerCase() || '';
    const name = project.name?.toLowerCase() || '';
    
    if (description.includes('finance') || description.includes('trading') || 
        description.includes('stock') || name.includes('trade')) {
      categories.push('Financial');
    }
    
    if (description.includes('research') || description.includes('analysis') || 
        description.includes('data')) {
      categories.push('Research');
    }
    
    // Add categories to project
    for (const categoryName of categories) {
      try {
        const categoryResult = await client.query(
          'SELECT id FROM categories WHERE name = $1',
          [categoryName]
        );
        
        if (categoryResult.rows.length > 0) {
          await client.query(
            'INSERT INTO project_categories (project_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [project.id, categoryResult.rows[0].id]
          );
        }
      } catch (error) {
        console.warn(`Failed to add category ${categoryName}:`, error.message);
      }
    }
  }

  async getCategories() {
    const client = await this.pool.connect();
    
    try {
      const query = `
        SELECT c.*, COUNT(pc.project_id) as project_count
        FROM categories c
        LEFT JOIN project_categories pc ON c.id = pc.category_id
        GROUP BY c.id
        ORDER BY c.name
      `;
      
      const result = await client.query(query);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async close() {
    await this.pool.end();
  }

  async healthCheck() {
    try {
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();
      
      return {
        status: 'healthy',
        totalConnections: this.pool.totalCount,
        idleConnections: this.pool.idleCount,
        waitingClients: this.pool.waitingCount
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}

module.exports = MetadataDB;