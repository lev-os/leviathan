import fs from 'fs';
import path from 'path';

// Simulate bulk task loading (current pattern in json-storage.js)
const start = process.hrtime.bigint();

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

// Find all YAML files (metadata search simulation)
const yamlFiles = findFiles('.', /\.yaml$/);
console.log('Found', yamlFiles.length, 'YAML files');

const mid = process.hrtime.bigint();

// Load first 20 for parsing test
const loaded = [];
for (let i = 0; i < Math.min(20, yamlFiles.length); i++) {
  try {
    const content = fs.readFileSync(yamlFiles[i], 'utf8');
    loaded.push({ file: yamlFiles[i], size: content.length });
  } catch (e) {
    // Skip errors
  }
}

const end = process.hrtime.bigint();

console.log('Directory scan:', Number(mid - start) / 1000000, 'ms');
console.log('Loading 20 files:', Number(end - mid) / 1000000, 'ms');  
console.log('Total:', Number(end - start) / 1000000, 'ms');
console.log('Average file size:', loaded.reduce((sum, f) => sum + f.size, 0) / loaded.length, 'bytes');

// Test concurrent access pattern
const concurrentStart = process.hrtime.bigint();
const promises = [];

for (let i = 0; i < 5; i++) {
  promises.push(new Promise(resolve => {
    setImmediate(() => {
      const files = yamlFiles.slice(i * 4, (i + 1) * 4);
      const loaded = [];
      for (const file of files) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          loaded.push(content.length);
        } catch (e) {}
      }
      resolve(loaded.length);
    });
  }));
}

Promise.all(promises).then(results => {
  const concurrentEnd = process.hrtime.bigint();
  console.log('Concurrent access (5 workers):', Number(concurrentEnd - concurrentStart) / 1000000, 'ms');
  console.log('Files loaded per worker:', results);
});