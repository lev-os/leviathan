# ADR-001: Multi-Platform Secure Key Management for Kingly

## Status
Accepted (January 2025)

## Context
Kingly needs to securely manage API keys and sensitive credentials across multiple platforms:
- macOS desktop (development primary)
- Linux servers (deployment)
- Mobile devices (iOS/Android for remote management)
- Web interfaces (browser-based access)

Current state: API keys are exposed in plain text during development, creating security risks.

## Decision

### Three-Tier Security Model

#### Tier 1: Development (File-Based with .env)
- Use `.env` files for local development
- Never commit to version control
- Kingly contexts reference env variables
- Simple migration path for existing projects

#### Tier 2: Desktop Production (OS Native)
- **macOS**: Keychain Services with Touch ID
- **Linux**: Secret Service API (GNOME Keyring/KWallet)
- **Windows**: Windows Credential Manager

#### Tier 3: Mobile & Distributed (Secure Protocols)
- Mobile apps use platform keychains
- Remote access via secure proxy
- Optional blockchain-based identity layer

## Implementation

### 1. File-Based (.env) Integration with Kingly

```yaml
# contexts/project.yaml
security:
  env_source:
    development:
      type: "file"
      path: ".env"
      encrypted: false
      
    production:
      type: "keychain"
      provider: "${OS_KEYCHAIN}"
      require_auth: true
      
  api_keys:
    - name: "PERPLEXITY_API_KEY"
      required: true
      context_injection: true
    - name: "SMITHERY_API_KEY"
      required: true
      context_injection: true
```

### 2. Context-Aware Key Loading

```javascript
// src/security/key-loader.js
class KinglyKeyLoader {
  async loadKeys(environment) {
    switch (environment) {
      case 'development':
        return this.loadFromEnvFile();
      case 'production':
        return this.loadFromKeychain();
      case 'mobile':
        return this.loadFromSecureProxy();
    }
  }
  
  async loadFromEnvFile() {
    // Simple .env loading for dev
    const envPath = path.join(process.cwd(), '.env');
    require('dotenv').config({ path: envPath });
    return process.env;
  }
  
  async loadFromKeychain() {
    // Platform-specific keychain access
    const platform = os.platform();
    switch (platform) {
      case 'darwin':
        return this.loadFromMacKeychain();
      case 'linux':
        return this.loadFromSecretService();
      case 'win32':
        return this.loadFromWindowsCredential();
    }
  }
}
```

### 3. Platform-Specific Implementations

#### macOS (Primary Development Platform)
```bash
# Store key with Touch ID protection
security add-generic-password \
  -a "kingly" \
  -s "com.kingly.${SERVICE}" \
  -w "${API_KEY}" \
  -T /usr/bin/security \
  -U

# Retrieve with biometric auth
security find-generic-password \
  -a "kingly" \
  -s "com.kingly.${SERVICE}" \
  -w
```

#### Linux (Server Deployment)
```javascript
// Using node-keytar for cross-platform keychain
const keytar = require('keytar');

async function storeLinuxKey(service, key) {
  // Uses Secret Service API (D-Bus)
  await keytar.setPassword('kingly', service, key);
}

async function getLinuxKey(service) {
  // Prompts for system auth if configured
  return await keytar.getPassword('kingly', service);
}
```

#### Mobile Access Pattern
```javascript
// Mobile apps don't store keys directly
class MobileKeyAccess {
  constructor() {
    this.proxyUrl = 'https://secure.kingly.ai/keys';
    this.deviceId = this.getDeviceId();
  }
  
  async getKey(service) {
    // 1. Authenticate with biometrics
    await this.authenticateBiometric();
    
    // 2. Request key from secure proxy
    const response = await fetch(`${this.proxyUrl}/${service}`, {
      headers: {
        'X-Device-ID': this.deviceId,
        'X-Auth-Token': await this.getAuthToken()
      }
    });
    
    // 3. Key is used in memory only
    return response.json().key;
  }
}
```

### 4. Kingly Context Integration

```yaml
# contexts/tools/research/secure-api-access/context.yaml
metadata:
  type: "tool"
  id: "secure-api-access"
  
security:
  key_requirements:
    - service: "perplexity"
      env_var: "PERPLEXITY_API_KEY"
      fallback_methods: ["keychain", "env_file", "secure_proxy"]
      
    - service: "smithery"
      env_var: "SMITHERY_API_KEY"
      fallback_methods: ["keychain", "env_file", "secure_proxy"]
      
  platform_config:
    macos:
      primary: "keychain"
      auth: "touch_id"
      
    linux:
      primary: "secret_service"
      auth: "system_password"
      
    mobile:
      primary: "secure_proxy"
      auth: "biometric"
```

### 5. Migration Path

#### Phase 1: Current State (Immediate)
- Store keys in `.env` file
- Add to .gitignore
- Document in README

#### Phase 2: Desktop Security (Next Sprint)
- Implement keychain integration
- Create migration wizard
- Add biometric authentication

#### Phase 3: Mobile Support (Q2 2025)
- Build secure proxy service
- Implement mobile SDKs
- Add remote management

#### Phase 4: Decentralized Identity (Future)
- Evaluate mature DID solutions
- Implement as optional layer
- Maintain backward compatibility

## Consequences

### Positive
- Immediate improvement over plain text storage
- Gradual migration path
- Platform-native security
- Future-proof architecture

### Negative
- Additional complexity for key management
- Platform-specific code required
- Mobile requires proxy infrastructure

### Neutral
- Different security levels for different environments
- Users choose their security/convenience tradeoff

## Security Considerations

1. **Development**: Accept lower security for ease of use
2. **Production**: Enforce platform security features
3. **Mobile**: Never store keys on device
4. **Backup**: Encrypted export/import functionality

## Usage Examples

### Development Mode
```bash
# Just works with .env file
cd ~/.kingly/projects/timetravel
./kingly-sim.sh research "AI trends"
# Reads from .env automatically
```

### Production Mode (macOS)
```bash
# First time setup
kingly security import-keys --from-env

# Usage triggers Touch ID
./kingly-sim.sh research "AI trends"
# Touch ID prompt appears
# Keys loaded from keychain
```

### Mobile Usage
```javascript
// React Native app
const kingly = new KinglyMobile({
  proxyUrl: 'https://secure.kingly.ai',
  deviceId: DeviceInfo.getUniqueId()
});

// Triggers Face ID/Touch ID
await kingly.authenticate();

// Keys fetched securely
const result = await kingly.research('AI trends');
```

## References
- [macOS Keychain Services](https://developer.apple.com/documentation/security/keychain_services)
- [Linux Secret Service API](https://specifications.freedesktop.org/secret-service/)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [React Native Keychain](https://github.com/oblador/react-native-keychain)