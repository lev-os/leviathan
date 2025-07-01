/**
 * Edge Memory Manager - Privacy-preserving local-first memory for Max
 * Implements edge-cloud hybrid architecture from research synthesis
 */

import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

export class EdgeMemoryManager {
  constructor(config = {}) {
    this.localFirst = config.localFirst || true;
    this.privacyPreserving = config.privacyPreserving || true;
    this.cloudSync = config.cloudSync || false;
    this.encryptionKey = config.encryptionKey || this._generateEncryptionKey();
    this.storagePath = config.storagePath || './memory-store';
    this.maxLocalSize = config.maxLocalSize || 1024 * 1024 * 100; // 100MB default
    this.compressionEnabled = config.compressionEnabled || true;
    
    // Initialize storage
    this._initializeStorage();
  }

  async storeLocal(data, encrypted = true) {
    const timestamp = Date.now();
    const id = this._generateId();
    
    let processedData = {
      id,
      data,
      timestamp,
      encrypted,
      compressed: false
    };

    // Apply compression if enabled
    if (this.compressionEnabled) {
      processedData = await this._compressData(processedData);
    }

    // Apply encryption if requested
    if (encrypted && this.privacyPreserving) {
      processedData = await this._encryptData(processedData);
    }

    // Store to local filesystem
    const filePath = this._getStoragePath(id);
    await this._ensureDirectory(path.dirname(filePath));
    await fs.writeFile(filePath, JSON.stringify(processedData));

    // Check storage limits
    await this._enforceStorageLimits();

    return {
      id,
      stored: true,
      encrypted,
      compressed: processedData.compressed,
      timestamp,
      path: filePath
    };
  }

  async retrieveLocal(query, fuzzyMatch = true) {
    const startTime = Date.now();
    const results = [];

    try {
      // List all stored files
      const files = await this._listStorageFiles();
      
      for (const file of files) {
        const data = await this._loadStorageFile(file);
        
        if (data && this._matchesQuery(data, query, fuzzyMatch)) {
          // Decrypt if necessary
          const decrypted = data.encrypted ? 
            await this._decryptData(data) : data;
          
          // Decompress if necessary
          const decompressed = decrypted.compressed ? 
            await this._decompressData(decrypted) : decrypted;
          
          results.push({
            id: decompressed.id,
            data: decompressed.data,
            timestamp: decompressed.timestamp,
            relevance: this._calculateRelevance(decompressed.data, query)
          });
        }
      }
    } catch (error) {
      console.error('Error retrieving local memory:', error);
    }

    const queryTime = Date.now() - startTime;
    
    // Sort by relevance and timestamp
    results.sort((a, b) => {
      if (a.relevance !== b.relevance) {
        return b.relevance - a.relevance;
      }
      return b.timestamp - a.timestamp;
    });

    return {
      results,
      queryTime,
      query,
      totalFound: results.length
    };
  }

  async syncToCloud(data, differentialPrivacy = true) {
    if (!this.cloudSync) {
      throw new Error('Cloud sync is disabled');
    }

    let syncData = { ...data };
    
    // Apply differential privacy if enabled
    if (differentialPrivacy) {
      syncData = await this._applyDifferentialPrivacy(syncData);
    }

    // Encrypt for cloud storage
    const encrypted = await this._encryptData(syncData);
    
    // Mock cloud sync (to be implemented with actual cloud provider)
    const cloudResult = await this._mockCloudSync(encrypted);
    
    return {
      synced: true,
      cloudId: cloudResult.id,
      timestamp: Date.now(),
      differentialPrivacy,
      encrypted: true
    };
  }

  async getStorageStats() {
    const files = await this._listStorageFiles();
    let totalSize = 0;
    
    for (const file of files) {
      try {
        const stats = await fs.stat(file);
        totalSize += stats.size;
      } catch (error) {
        // Ignore missing files
      }
    }

    return {
      totalFiles: files.length,
      totalSize,
      maxSize: this.maxLocalSize,
      utilizationPercent: (totalSize / this.maxLocalSize) * 100,
      remainingSpace: this.maxLocalSize - totalSize
    };
  }

  async cleanup(olderThanMs = 7 * 24 * 60 * 60 * 1000) { // 7 days default
    const cutoffTime = Date.now() - olderThanMs;
    const files = await this._listStorageFiles();
    let deletedCount = 0;

    for (const file of files) {
      try {
        const data = await this._loadStorageFile(file);
        
        if (data && data.timestamp < cutoffTime) {
          await fs.unlink(file);
          deletedCount++;
        }
      } catch (error) {
        // Ignore errors, file might already be deleted
      }
    }

    return {
      deletedFiles: deletedCount,
      cutoffTime,
      remainingFiles: files.length - deletedCount
    };
  }

  // Private helper methods
  async _initializeStorage() {
    try {
      await this._ensureDirectory(this.storagePath);
    } catch (error) {
      console.error('Failed to initialize storage:', error);
    }
  }

  _generateEncryptionKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  _generateId() {
    return crypto.randomBytes(16).toString('hex');
  }

  _getStoragePath(id) {
    // Use first 2 chars for subdirectory to avoid too many files in one dir
    const subdir = id.substring(0, 2);
    return path.join(this.storagePath, subdir, `${id}.json`);
  }

  async _ensureDirectory(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  async _compressData(data) {
    // Mock compression (to be implemented with actual compression library)
    const compressed = {
      ...data,
      data: JSON.stringify(data.data), // Simulate compression
      compressed: true,
      originalSize: JSON.stringify(data.data).length
    };
    
    return compressed;
  }

  async _decompressData(data) {
    if (!data.compressed) return data;
    
    return {
      ...data,
      data: JSON.parse(data.data),
      compressed: false
    };
  }

  async _encryptData(data) {
    if (!this.privacyPreserving) return data;
    
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    const dataStr = JSON.stringify(data.data);
    let encrypted = cipher.update(dataStr, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      ...data,
      data: encrypted,
      encrypted: true
    };
  }

  async _decryptData(data) {
    if (!data.encrypted) return data;
    
    const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
    let decrypted = decipher.update(data.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return {
      ...data,
      data: JSON.parse(decrypted),
      encrypted: false
    };
  }

  async _listStorageFiles() {
    const files = [];
    
    try {
      const entries = await fs.readdir(this.storagePath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const subFiles = await fs.readdir(path.join(this.storagePath, entry.name));
          for (const subFile of subFiles) {
            if (subFile.endsWith('.json')) {
              files.push(path.join(this.storagePath, entry.name, subFile));
            }
          }
        }
      }
    } catch (error) {
      // Directory might not exist yet
    }
    
    return files;
  }

  async _loadStorageFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`Error loading storage file ${filePath}:`, error);
      return null;
    }
  }

  _matchesQuery(data, query, fuzzyMatch) {
    const searchText = JSON.stringify(data.data).toLowerCase();
    const queryLower = query.toLowerCase();
    
    if (fuzzyMatch) {
      // Simple fuzzy matching
      return searchText.includes(queryLower) || 
             this._levenshteinDistance(searchText, queryLower) < queryLower.length * 0.5;
    } else {
      return searchText.includes(queryLower);
    }
  }

  _calculateRelevance(data, query) {
    const dataStr = JSON.stringify(data).toLowerCase();
    const queryLower = query.toLowerCase();
    
    // Simple relevance scoring
    if (dataStr.includes(queryLower)) {
      return 1.0;
    }
    
    const distance = this._levenshteinDistance(dataStr, queryLower);
    return Math.max(0, 1 - (distance / Math.max(dataStr.length, queryLower.length)));
  }

  _levenshteinDistance(str1, str2) {
    const matrix = Array(str2.length + 1).fill(null).map(() => 
      Array(str1.length + 1).fill(null)
    );
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + cost
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  async _enforceStorageLimits() {
    const stats = await this.getStorageStats();
    
    if (stats.totalSize > this.maxLocalSize) {
      // Remove oldest files to free up space
      const files = await this._listStorageFiles();
      const fileStats = [];
      
      for (const file of files) {
        try {
          const data = await this._loadStorageFile(file);
          if (data) {
            fileStats.push({ file, timestamp: data.timestamp });
          }
        } catch (error) {
          // Ignore errors
        }
      }
      
      // Sort by timestamp (oldest first)
      fileStats.sort((a, b) => a.timestamp - b.timestamp);
      
      // Delete oldest files until under limit
      let currentSize = stats.totalSize;
      for (const { file } of fileStats) {
        if (currentSize <= this.maxLocalSize * 0.8) break; // Leave 20% buffer
        
        try {
          const fileSize = (await fs.stat(file)).size;
          await fs.unlink(file);
          currentSize -= fileSize;
        } catch (error) {
          // Ignore errors
        }
      }
    }
  }

  async _applyDifferentialPrivacy(data) {
    // Mock differential privacy implementation
    // In a real implementation, this would add noise to protect privacy
    return {
      ...data,
      differentialPrivacy: true,
      noiseAdded: Math.random() * 0.1 // Mock noise level
    };
  }

  async _mockCloudSync(data) {
    // Mock cloud sync implementation
    return {
      id: this._generateId(),
      uploaded: true,
      timestamp: Date.now(),
      size: JSON.stringify(data).length
    };
  }
}