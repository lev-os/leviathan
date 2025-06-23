import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';

const Database = sqlite3.verbose().Database;

function findFiles(dir, pattern) {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findFiles(fullPath, pattern));
    } else if (pattern.test(item)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Create in-memory SQLite database
const db = new Database(':memory:');

// Initialize schema
db.serialize(() => {
  // Create tables for different file types
  db.run(`CREATE TABLE configs (
    id INTEGER PRIMARY KEY,
    path TEXT UNIQUE,
    content TEXT,
    size INTEGER,
    type TEXT,
    created DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE INDEX idx_configs_path ON configs(path)`);
  db.run(`CREATE INDEX idx_configs_type ON configs(type)`);
  
  // Load YAML files into database
  const yamlFiles = findFiles('.', /\.yaml$/).slice(0, 50); // Limit for test
  console.log('Loading', yamlFiles.length, 'files into SQLite...');
  
  const stmt = db.prepare(`INSERT INTO configs (path, content, size, type) VALUES (?, ?, ?, ?)`);
  
  const loadStart = process.hrtime.bigint();
  
  yamlFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const type = file.includes('contexts') ? 'context' : 
                   file.includes('agents') ? 'agent' : 'config';
      stmt.run(file, content, content.length, type);
    } catch (e) {
      // Skip errors
    }
  });
  
  stmt.finalize();
  
  const loadEnd = process.hrtime.bigint();
  console.log('SQLite bulk load:', Number(loadEnd - loadStart) / 1000000, 'ms');
  
  // Test read performance
  console.log('\n=== READ PERFORMANCE TESTS ===');
  
  // Single record read by path
  const singleStart = process.hrtime.bigint();
  db.get("SELECT content FROM configs WHERE path = ? LIMIT 1", [yamlFiles[0]], (err, row) => {
    const singleEnd = process.hrtime.bigint();
    console.log('Single record read:', Number(singleEnd - singleStart) / 1000000, 'ms');
    
    // Bulk read by type
    const bulkStart = process.hrtime.bigint();
    db.all("SELECT path, size FROM configs WHERE type = ?", ['context'], (err, rows) => {
      const bulkEnd = process.hrtime.bigint();
      console.log('Bulk read by type (' + rows.length + ' records):', Number(bulkEnd - bulkStart) / 1000000, 'ms');
      
      // Search by content (simulation)
      const searchStart = process.hrtime.bigint();
      db.all("SELECT path FROM configs WHERE content LIKE ?", ['%metadata%'], (err, rows) => {
        const searchEnd = process.hrtime.bigint();
        console.log('Content search (' + rows.length + ' matches):', Number(searchEnd - searchStart) / 1000000, 'ms');
        
        // Full table scan
        const scanStart = process.hrtime.bigint();
        db.all("SELECT COUNT(*) as count, AVG(size) as avg_size FROM configs", (err, rows) => {
          const scanEnd = process.hrtime.bigint();
          console.log('Full table scan:', Number(scanEnd - scanStart) / 1000000, 'ms');
          console.log('Total records:', rows[0].count, 'Average size:', rows[0].avg_size);
          
          db.close();
        });
      });
    });
  });
});