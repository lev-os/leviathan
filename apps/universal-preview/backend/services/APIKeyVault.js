const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class APIKeyVault {
  constructor(vaultPath = './vault') {
    this.vaultPath = vaultPath;
    this.masterKey = null;
    this.keyStore = new Map();
    this.algorithm = 'aes-256-gcm';
    this.keyDerivationIterations = 100000;
    
    this.ensureVaultDirectory();
  }

  async ensureVaultDirectory() {
    try {
      await fs.access(this.vaultPath);
    } catch {
      await fs.mkdir(this.vaultPath, { recursive: true, mode: 0o700 }); // Restricted permissions
    }
  }

  async initialize(masterPassword) {
    console.log('🔐 Initializing API Key Vault...');
    
    try {
      // Derive master key from password
      this.masterKey = await this.deriveKey(masterPassword);
      
      // Load existing vault if it exists
      await this.loadVault();
      
      console.log('✅ API Key Vault initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize vault:', error.message);
      throw error;
    }
  }

  async deriveKey(password, salt = null) {
    if (!salt) {
      salt = crypto.randomBytes(32);
    }
    
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, this.keyDerivationIterations, 32, 'sha256', (err, derivedKey) => {
        if (err) reject(err);
        else resolve({ key: derivedKey, salt });
      });
    });
  }

  async storeKey(service, keyName, keyValue, metadata = {}) {
    if (!this.masterKey) {
      throw new Error('Vault not initialized');
    }

    console.log(`🔑 Storing API key for ${service}:${keyName}`);

    const keyId = this.generateKeyId(service, keyName);
    const encryptedKey = this.encrypt(keyValue);
    
    const keyEntry = {
      id: keyId,
      service,
      keyName,
      encryptedValue: encryptedKey,
      metadata: {
        ...metadata,
        createdAt: new Date().toISOString(),
        lastUsed: null,
        usageCount: 0
      }
    };

    this.keyStore.set(keyId, keyEntry);
    await this.saveVault();
    
    console.log(`✅ API key stored: ${service}:${keyName}`);
    return keyId;
  }

  async getKey(service, keyName) {
    if (!this.masterKey) {
      throw new Error('Vault not initialized');
    }

    const keyId = this.generateKeyId(service, keyName);
    const keyEntry = this.keyStore.get(keyId);
    
    if (!keyEntry) {
      return null;
    }

    try {
      const decryptedValue = this.decrypt(keyEntry.encryptedValue);
      
      // Update usage statistics
      keyEntry.metadata.lastUsed = new Date().toISOString();
      keyEntry.metadata.usageCount++;
      await this.saveVault();
      
      return {
        value: decryptedValue,
        metadata: keyEntry.metadata
      };
    } catch (error) {
      console.error(`❌ Failed to decrypt key ${keyId}:`, error.message);
      throw new Error('Failed to decrypt API key');
    }
  }

  async listKeys(service = null) {
    const keys = [];
    
    for (const [keyId, keyEntry] of this.keyStore) {
      if (service && keyEntry.service !== service) {
        continue;
      }
      
      keys.push({
        id: keyId,
        service: keyEntry.service,
        keyName: keyEntry.keyName,
        metadata: {
          ...keyEntry.metadata,
          // Don't include the encrypted value in listings
          hasValue: !!keyEntry.encryptedValue
        }
      });
    }
    
    return keys.sort((a, b) => a.service.localeCompare(b.service));
  }

  async deleteKey(service, keyName) {
    const keyId = this.generateKeyId(service, keyName);
    const deleted = this.keyStore.delete(keyId);
    
    if (deleted) {
      await this.saveVault();
      console.log(`🗑️  Deleted API key: ${service}:${keyName}`);
    }
    
    return deleted;
  }

  async updateKey(service, keyName, newValue, newMetadata = {}) {
    const keyId = this.generateKeyId(service, keyName);
    const keyEntry = this.keyStore.get(keyId);
    
    if (!keyEntry) {
      throw new Error(`API key not found: ${service}:${keyName}`);
    }

    keyEntry.encryptedValue = this.encrypt(newValue);
    keyEntry.metadata = {
      ...keyEntry.metadata,
      ...newMetadata,
      updatedAt: new Date().toISOString()
    };

    await this.saveVault();
    console.log(`✅ Updated API key: ${service}:${keyName}`);
    
    return keyId;
  }

  // Bulk operations for project setup
  async storeProjectKeys(projectId, keys) {
    console.log(`📦 Storing ${keys.length} API keys for project ${projectId}`);
    
    const results = [];
    
    for (const key of keys) {
      try {
        const keyId = await this.storeKey(
          projectId,
          key.name,
          key.value,
          {
            ...key.metadata,
            projectId,
            keyType: key.type || 'api'
          }
        );
        results.push({ success: true, keyId, name: key.name });
      } catch (error) {
        results.push({ success: false, error: error.message, name: key.name });
      }
    }
    
    return results;
  }

  async getProjectKeys(projectId) {
    return this.listKeys(projectId);
  }

  async deleteProjectKeys(projectId) {
    const projectKeys = await this.listKeys(projectId);
    let deleted = 0;
    
    for (const key of projectKeys) {
      if (await this.deleteKey(key.service, key.keyName)) {
        deleted++;
      }
    }
    
    console.log(`🗑️  Deleted ${deleted} API keys for project ${projectId}`);
    return deleted;
  }

  // Environment variable generation
  async generateEnvFile(projectId, format = 'dotenv') {
    const keys = await this.getProjectKeys(projectId);
    
    if (format === 'dotenv') {
      return this.generateDotenvFormat(keys);
    } else if (format === 'docker') {
      return this.generateDockerFormat(keys);
    } else if (format === 'json') {
      return this.generateJsonFormat(keys);
    }
    
    throw new Error(`Unsupported format: ${format}`);
  }

  async generateDotenvFormat(keys) {
    const lines = ['# Generated API keys'];
    
    for (const key of keys) {
      const keyData = await this.getKey(key.service, key.keyName);
      if (keyData) {
        const envName = this.convertToEnvName(key.keyName);
        lines.push(`${envName}=${keyData.value}`);
      }
    }
    
    return lines.join('\n');
  }

  async generateDockerFormat(keys) {
    const envVars = [];
    
    for (const key of keys) {
      const keyData = await this.getKey(key.service, key.keyName);
      if (keyData) {
        const envName = this.convertToEnvName(key.keyName);
        envVars.push(`${envName}=${keyData.value}`);
      }
    }
    
    return envVars;
  }

  async generateJsonFormat(keys) {
    const keyMap = {};
    
    for (const key of keys) {
      const keyData = await this.getKey(key.service, key.keyName);
      if (keyData) {
        keyMap[key.keyName] = keyData.value;
      }
    }
    
    return JSON.stringify(keyMap, null, 2);
  }

  convertToEnvName(keyName) {
    return keyName
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toUpperCase();
  }

  // Encryption/Decryption methods
  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.masterKey.key);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      iv: iv.toString('hex'),
      data: encrypted,
      authTag: authTag.toString('hex')
    };
  }

  decrypt(encryptedData) {
    const decipher = crypto.createDecipher(this.algorithm, this.masterKey.key);
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // Vault persistence
  async saveVault() {
    const vaultFile = path.join(this.vaultPath, 'keys.vault');
    
    const vaultData = {
      version: '1.0',
      salt: this.masterKey.salt.toString('hex'),
      keys: Array.from(this.keyStore.entries()).map(([id, entry]) => ({
        id,
        service: entry.service,
        keyName: entry.keyName,
        encryptedValue: entry.encryptedValue,
        metadata: entry.metadata
      }))
    };
    
    const encryptedVault = this.encrypt(JSON.stringify(vaultData));
    await fs.writeFile(vaultFile, JSON.stringify(encryptedVault), { mode: 0o600 });
  }

  async loadVault() {
    const vaultFile = path.join(this.vaultPath, 'keys.vault');
    
    try {
      const encryptedVault = JSON.parse(await fs.readFile(vaultFile, 'utf8'));
      const vaultData = JSON.parse(this.decrypt(encryptedVault));
      
      // Restore key store
      this.keyStore.clear();
      for (const keyEntry of vaultData.keys) {
        this.keyStore.set(keyEntry.id, keyEntry);
      }
      
      console.log(`📥 Loaded ${vaultData.keys.length} API keys from vault`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.warn('⚠️  Failed to load existing vault:', error.message);
      }
    }
  }

  // Key validation and testing
  async testKey(service, keyName, testFunction) {
    const keyData = await this.getKey(service, keyName);
    if (!keyData) {
      throw new Error(`API key not found: ${service}:${keyName}`);
    }

    try {
      const result = await testFunction(keyData.value);
      
      // Update metadata with test result
      const keyId = this.generateKeyId(service, keyName);
      const keyEntry = this.keyStore.get(keyId);
      keyEntry.metadata.lastTested = new Date().toISOString();
      keyEntry.metadata.testResult = result.success ? 'passed' : 'failed';
      
      await this.saveVault();
      
      return result;
    } catch (error) {
      console.error(`❌ API key test failed for ${service}:${keyName}:`, error.message);
      throw error;
    }
  }

  // Built-in test functions for common services
  getBuiltinTestFunction(service) {
    const testFunctions = {
      'openai': async (apiKey) => {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        return { success: response.ok };
      },
      'anthropic': async (apiKey) => {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 
            'x-api-key': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1,
            messages: [{ role: 'user', content: 'test' }]
          })
        });
        return { success: response.ok };
      },
      'github': async (apiKey) => {
        const response = await fetch('https://api.github.com/user', {
          headers: { 'Authorization': `token ${apiKey}` }
        });
        return { success: response.ok };
      }
    };
    
    return testFunctions[service.toLowerCase()];
  }

  // Utility methods
  generateKeyId(service, keyName) {
    return crypto
      .createHash('sha256')
      .update(`${service}:${keyName}`)
      .digest('hex')
      .substring(0, 16);
  }

  async exportVault(password) {
    if (!this.masterKey) {
      throw new Error('Vault not initialized');
    }

    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      keys: []
    };

    for (const [keyId, keyEntry] of this.keyStore) {
      const decryptedValue = this.decrypt(keyEntry.encryptedValue);
      exportData.keys.push({
        service: keyEntry.service,
        keyName: keyEntry.keyName,
        value: decryptedValue,
        metadata: keyEntry.metadata
      });
    }

    // Encrypt with export password
    const exportKey = await this.deriveKey(password);
    const encryptedExport = this.encrypt(JSON.stringify(exportData));
    
    return {
      data: encryptedExport,
      salt: exportKey.salt.toString('hex')
    };
  }

  async importVault(exportData, password) {
    const importKey = await this.deriveKey(password, Buffer.from(exportData.salt, 'hex'));
    const decryptedData = JSON.parse(this.decrypt(exportData.data));
    
    let imported = 0;
    
    for (const keyEntry of decryptedData.keys) {
      try {
        await this.storeKey(
          keyEntry.service,
          keyEntry.keyName,
          keyEntry.value,
          keyEntry.metadata
        );
        imported++;
      } catch (error) {
        console.warn(`⚠️  Failed to import key ${keyEntry.service}:${keyEntry.keyName}:`, error.message);
      }
    }
    
    console.log(`📥 Imported ${imported} API keys`);
    return imported;
  }

  async healthCheck() {
    return {
      status: this.masterKey ? 'healthy' : 'uninitialized',
      keyCount: this.keyStore.size,
      vaultPath: this.vaultPath
    };
  }
}

module.exports = APIKeyVault;