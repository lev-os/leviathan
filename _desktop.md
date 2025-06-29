# Leviathan Desktop Migration & Reorganization Master Plan

## Migration Strategy: Copy-First, Modify-Second Approach

### Core Philosophy:
1. **Copy existing working code** (no recreation/hallucination)
2. **Rsync to merge** when targets exist
3. **Systematic file-by-file modifications** with checklists
4. **Verify each step** before proceeding
5. **Rollback capability** at each phase
6. **NO rm commands** - Use `mv` to archive everything for manual review

## Phase 1: Desktop App Migration (IMMEDIATE) 🚀

### 1.1 Copy MPUP-Labs Electron Structure
```bash
# Create temp workspace
mkdir -p /tmp/leviathan-desktop-base

# Copy sophisticated Electron setup
rsync -av ~/d/homie/mpup-labs/trader-stack/packages/ /tmp/leviathan-desktop-base/packages/
rsync -av ~/d/homie/mpup-labs/trader-stack/forge.config.js /tmp/leviathan-desktop-base/
rsync -av ~/d/homie/mpup-labs/trader-stack/package.json /tmp/leviathan-desktop-base/
rsync -av ~/d/homie/mpup-labs/trader-stack/buildResources/ /tmp/leviathan-desktop-base/buildResources/
rsync -av ~/d/homie/mpup-labs/trader-stack/scripts/ /tmp/leviathan-desktop-base/scripts/
rsync -av ~/d/homie/mpup-labs/trader-stack/forge-start.js /tmp/leviathan-desktop-base/
rsync -av ~/d/homie/mpup-labs/trader-stack/start-dev.js /tmp/leviathan-desktop-base/
```

**Checklist:**
- [ ] `/tmp/leviathan-desktop-base/` directory created
- [ ] `packages/` directory copied with all subdirectories
- [ ] `forge.config.js` copied
- [ ] `package.json` copied
- [ ] `buildResources/` with icons copied
- [ ] Build scripts copied

### 1.2 Create apps/desktop Structure
```bash
# Navigate to Leviathan root
cd /Users/jean-patricksmith/digital/leviathan

# Archive current simple desktop setup (NO rm commands)
mkdir -p _archive
mv packages/desktop _archive/desktop-$(date +%Y%m%d-%H%M%S)

# Create new apps/desktop
mkdir -p apps/desktop

# Copy sophisticated structure
rsync -av /tmp/leviathan-desktop-base/ apps/desktop/
```

**Checklist:**
- [ ] `packages/desktop` moved to `_archive/desktop-TIMESTAMP`
- [ ] `apps/desktop/` created
- [ ] All MPUP-Labs structure copied to `apps/desktop/`
- [ ] Verify packages/ subdirectories exist in apps/desktop/

### 1.3 Systematic File Modifications (Checklist)

#### A. Main Package.json Updates (`apps/desktop/package.json`):
```json
{
  "name": "@lev-os/desktop",
  "description": "Leviathan AI-Native Desktop Service Manager",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "packages/entry-point.js",
  "workspaces": [
    "packages/*"
  ]
}
```

**Checklist:**
- [ ] Change `"name": "@trader/root"` → `"name": "@lev-os/desktop"`
- [ ] Update `"description"` to "Leviathan AI-Native Desktop Service Manager"
- [ ] Change version to "0.1.0"
- [ ] Keep `"main": "packages/entry-point.js"`
- [ ] Remove trader-specific scripts: `test:devnet:*`, `legacy:*`
- [ ] Keep forge scripts: `start:forge`, `dev`, `build`, `package`, `make`
- [ ] Update workspace paths if needed

#### B. Forge Config Updates (`apps/desktop/forge.config.js`):
```javascript
export default {
  packagerConfig: {
    asar: true,
    name: 'Leviathan',
    executableName: 'leviathan-desktop',
    appBundleId: 'com.leviathan.desktop',
    icon: './buildResources/icon',
    // Remove trader-specific extraResource
    extraResource: [],
    osxSign: false,
    osxNotarize: false,
    ignore: [
      // Update ignore patterns for Leviathan
      /^\/\.git$/,
      /^\/\.vscode$/,
      /^\/docs$/,
      /^\/agent$/,
      /^\/os$/,
      /^\/workshop$/,
      /\.md$/,
      /\.map$/,
      /\.ts$/,
      /\.tsx$/,
      'node_modules/.cache',
      'node_modules/.vite',
      /\.DS_Store$/
    ]
  }
}
```

**Checklist:**
- [ ] Change `appBundleId: 'com.mpup.traderstack'` → `'com.leviathan.desktop'`
- [ ] Update `name: 'TraderStack'` → `'Leviathan'`
- [ ] Change `executableName: 'trader-stack'` → `'leviathan-desktop'`
- [ ] Update ignore patterns for Leviathan structure
- [ ] Remove trader-specific extraResources
- [ ] Keep icon path: `'./buildResources/icon'`

#### C. Main Process Migration (`apps/desktop/packages/main/`):

**Keep As-Is (Direct Copy):**
- [ ] `src/ModuleRunner.ts` - Module system
- [ ] `src/AppInitConfig.ts` - Configuration types
- [ ] `src/AppModule.ts` - Module interface
- [ ] `src/ModuleContext.ts` - Context management

**Modify During Copy:**
- [ ] `src/index.ts` - Update app initialization
- [ ] `src/modules/ServiceManager.ts` - Adapt for Leviathan services
- [ ] `src/modules/WindowManager.ts` - Update window settings

**Remove (Trader-Specific):**
- [ ] `src/modules/CryptoHedgeFund.ts`
- [ ] `src/modules/PythonRuntime.ts` (if trader-specific)
- [ ] Any wallet/trading modules

**Create New (Based on Patterns):**
- [ ] `src/modules/LeviathanServiceManager.ts` - Neo4j, Graphiti, Agent services
- [ ] `src/modules/SystemTrayManager.ts` - Leviathan-specific tray menu

#### D. Renderer Process (`apps/desktop/packages/renderer/`):

**Keep Structure (Modify Content):**
- [ ] Next.js setup and configuration
- [ ] `src/components/ui/` - Keep UI components
- [ ] `src/components/theme-provider.tsx` - Keep theming
- [ ] `src/contexts/dev-mode-context.tsx` - Keep dev mode

**Replace Content:**
- [ ] `src/app/page.tsx` - Service management dashboard
- [ ] `src/app/services/page.tsx` - Main services page
- [ ] `src/components/sidebar.tsx` - Leviathan navigation
- [ ] API routes - Replace trading routes with service routes

**Remove (Trader-Specific):**
- [ ] `src/app/trading/` directory
- [ ] `src/app/wallet/` directory  
- [ ] `src/app/channels/` directory (if trading-specific)

#### E. Preload Bridge (`apps/desktop/packages/preload/`):

**Keep As-Is:**
- [ ] `src/index.ts` - Main preload entry
- [ ] `src/exposed.ts` - IPC exposure patterns
- [ ] `src/versions.ts` - Electron versions
- [ ] Security setup

**Modify:**
- [ ] `src/walletBridge.ts` → `src/serviceBridge.ts` - Service management IPC

**Remove:**
- [ ] Any crypto/wallet specific modules

### 1.4 Icon and Asset Setup

**Copy Leviathan Icons:**
```bash
# Copy brain icons to buildResources
cp /Users/jean-patricksmith/digital/leviathan/packages/desktop/assets/* apps/desktop/buildResources/ 2>/dev/null || true

# Create icon bundle if needed
# macOS: iconutil -c icns -o apps/desktop/buildResources/icon.icns icon.iconset/
# Windows: magick apps/desktop/buildResources/icon.png apps/desktop/buildResources/icon.ico
```

**Checklist:**
- [ ] Brain icon copied to `buildResources/icon.png`
- [ ] macOS icon bundle created: `buildResources/icon.icns`
- [ ] Windows icon created: `buildResources/icon.ico`
- [ ] Linux icon available: `buildResources/icon.png`

### 1.5 Service Integration

**Create Service Definitions (`apps/desktop/packages/main/src/services/`):**

```typescript
// LeviathnanServices.ts
export const LEVIATHAN_SERVICES = {
  neo4j: {
    name: 'Neo4j Database',
    command: 'neo4j',
    args: ['console'],
    cwd: process.env.NEO4J_HOME || '/usr/local/neo4j',
    healthCheck: 'http://localhost:7474'
  },
  graphiti: {
    name: 'Graphiti Memory',
    command: 'python',
    args: ['src/memory_service.py'],
    cwd: path.join(__dirname, '../../../memory/graphiti-service'),
    healthCheck: 'http://localhost:50051'
  },
  agent: {
    name: 'Leviathan Agent',
    command: 'node',
    args: ['src/index.js'],
    cwd: path.join(__dirname, '../../../agent'),
    healthCheck: 'http://localhost:3001'
  }
};
```

**Checklist:**
- [ ] Service definitions created
- [ ] Health check endpoints defined
- [ ] Process management logic adapted
- [ ] System tray menu items updated

## Phase 2: Core Package Reorganization (LATER) 📦

### 2.1 Preparation Steps
```bash
# Create core directory structure
mkdir -p core/

# Plan the migration mapping
echo "packages/memory     → core/memory" > /tmp/core-migration-map.txt
echo "packages/db         → core/db" >> /tmp/core-migration-map.txt
echo "packages/auth       → core/auth" >> /tmp/core-migration-map.txt
echo "packages/ui         → core/ui" >> /tmp/core-migration-map.txt
echo "packages/api        → core/api" >> /tmp/core-migration-map.txt
echo "packages/validators → core/validators" >> /tmp/core-migration-map.txt

# Move packages to core (NO rm commands)
mkdir -p _archive/packages-backup-$(date +%Y%m%d-%H%M%S)
cp -r packages/* _archive/packages-backup-$(date +%Y%m%d-%H%M%S)/
mv packages/memory core/memory
mv packages/db core/db
mv packages/auth core/auth
mv packages/ui core/ui
mv packages/api core/api
mv packages/validators core/validators
```

### 2.2 Automated Import Refactoring Strategy

#### A. Create Migration Script:
```javascript
// scripts/migrate-imports.js
const jscodeshift = require('jscodeshift');
const fs = require('fs');
const path = require('path');

const MIGRATION_MAP = {
  'packages/memory': 'core/memory',
  'packages/db': 'core/db',
  'packages/auth': 'core/auth',
  'packages/ui': 'core/ui',
  'packages/api': 'core/api',
  'packages/validators': 'core/validators'
};

// Transform function for imports
function transform(source, api) {
  const j = api.jscodeshift;
  
  return j(source)
    .find(j.ImportDeclaration)
    .forEach(path => {
      const source = path.node.source.value;
      for (const [oldPath, newPath] of Object.entries(MIGRATION_MAP)) {
        if (source.includes(oldPath)) {
          path.node.source.value = source.replace(oldPath, newPath);
        }
      }
    })
    .toSource();
}
```

#### B. File Types to Process:
```bash
# Find all files that need import updates
find . -name "*.ts" -not -path "./node_modules/*" > /tmp/files-to-update.txt
find . -name "*.tsx" -not -path "./node_modules/*" >> /tmp/files-to-update.txt
find . -name "*.js" -not -path "./node_modules/*" >> /tmp/files-to-update.txt
find . -name "*.jsx" -not -path "./node_modules/*" >> /tmp/files-to-update.txt
find . -name "package.json" -not -path "./node_modules/*" >> /tmp/files-to-update.txt
```

#### C. Documentation Update Strategy:
```bash
# Find all documentation with package references
find . -name "*.md" -exec grep -l "packages/" {} \; > /tmp/docs-to-update.txt
find . -name "CLAUDE.md" -exec grep -l "packages/" {} \; >> /tmp/docs-to-update.txt

# Batch replace strategy (to be done manually with review)
# packages/memory → core/memory
# packages/db → core/db
# etc.
```

### 2.3 Configuration Updates Checklist:

**Workspace Configuration:**
- [ ] `pnpm-workspace.yaml` - Add `"core/*"` to workspace patterns
- [ ] `turbo.json` - Update pipeline references from packages/* to core/*
- [ ] Root `package.json` - Update any direct package references

**TypeScript Configuration:**
- [ ] Root `tsconfig.json` - Update path mappings
- [ ] Individual `tsconfig.json` files - Update references
- [ ] Any custom path aliases

**Build Configuration:**
- [ ] ESLint configs - Update import rules for core/*
- [ ] Prettier configs - Update ignore patterns if needed
- [ ] Any custom build scripts

**Documentation:**
- [ ] README files with import examples
- [ ] CLAUDE.md files with package references
- [ ] Architecture documentation
- [ ] Plugin development guides

### 2.4 Validation Checklist:
- [ ] All workspaces build successfully: `pnpm build`
- [ ] All imports resolve correctly: `pnpm typecheck`
- [ ] All tests pass: `pnpm test`
- [ ] Documentation links work
- [ ] Development tools (ESLint, Prettier) work
- [ ] Agent system still works independently
- [ ] OS system still works independently

## Implementation Protocol 🛡️

### Step-by-Step Execution Pattern:
1. **📋 Pre-step checklist** - Verify prerequisites
2. **📁 Copy operation** - Use rsync/cp with verification
3. **✅ Verification** - Confirm files exist with correct structure  
4. **✏️ Modification** - Systematic find/replace with checklist
5. **🧪 Validation** - Build/test specific component
6. **💾 Commit checkpoint** - Git commit with clear message
7. **➡️ Next step** - Move to next item

### Rollback Strategy:
- **Git branches** for each major phase
- **Backup copies** before destructive changes
- **Incremental commits** with detailed messages
- **Testing at each checkpoint** before proceeding
- **Clear rollback procedure** documented for each step

### Merge Conflict Resolution:
- **Use rsync --backup** for existing files
- **Manual review** of all conflicts
- **Prefer existing Leviathan patterns** over MPUP-Labs where conflicts exist
- **Document decisions** in commit messages

## Detailed File Mapping 📁

### MPUP-Labs → Leviathan Direct Mappings:

#### Keep As-Is (Direct Copy):
```
~/d/homie/mpup-labs/trader-stack/forge.config.js 
  → apps/desktop/forge.config.js

~/d/homie/mpup-labs/trader-stack/packages/main/src/ModuleRunner.ts 
  → apps/desktop/packages/main/src/ModuleRunner.ts

~/d/homie/mpup-labs/trader-stack/packages/preload/
  → apps/desktop/packages/preload/

~/d/homie/mpup-labs/trader-stack/buildResources/
  → apps/desktop/buildResources/ (replace icons)
```

#### Modify During Copy:
```
~/d/homie/mpup-labs/trader-stack/package.json 
  → apps/desktop/package.json (update names, descriptions, scripts)

~/d/homie/mpup-labs/trader-stack/packages/main/src/modules/ServiceManager.ts 
  → apps/desktop/packages/main/src/modules/LeviathanServiceManager.ts

~/d/homie/mpup-labs/trader-stack/packages/renderer/src/ 
  → apps/desktop/packages/renderer/src/ (replace UI content)
```

#### Create New (Based on Patterns):
- Service definitions for Neo4j, Graphiti, Agent
- Leviathan-specific security modules  
- Custom system tray menus
- Service health monitoring
- Auto-start integration with Leviathan services

## Risk Mitigation 🛡️

### High-Risk Operations:
1. **Bulk import refactoring** - Use AST tools, not regex
2. **Configuration updates** - Test each workspace individually
3. **Service integration** - Start with one service, validate, then expand
4. **Cross-dependencies** - Map and verify all internal package dependencies

### Safety Measures:
- **Feature flags** for new desktop app during development
- **Parallel development** - Keep old packages/desktop working during transition
- **Incremental rollout** - Phase approach with validation gates
- **Comprehensive testing** at each checkpoint
- **Backup strategy** - Multiple restore points

### Monitoring Points:
- **Build status** - All workspaces must build
- **Import resolution** - No broken imports
- **Test coverage** - Maintain existing test pass rates
- **Performance** - Desktop app startup and responsiveness
- **Integration** - Services start/stop correctly

## Success Criteria ✅

### Phase 1 Complete (Desktop Migration):
- [ ] Electron app builds without errors
- [ ] System tray appears and functions
- [ ] Can start/stop Leviathan services (Neo4j, Graphiti, Agent)
- [ ] Professional packaging works (DMG/NSIS/AppImage)
- [ ] Auto-start functionality works on macOS
- [ ] Service health monitoring works
- [ ] UI reflects service status accurately
- [ ] No regressions in existing Leviathan functionality

### Phase 2 Complete (Core Reorganization):
- [ ] All imports use core/* instead of packages/*
- [ ] All documentation updated and verified
- [ ] All workspaces build successfully
- [ ] No broken references in any configuration
- [ ] Clean, logical workspace structure
- [ ] Agent system maintains independence
- [ ] OS system maintains independence
- [ ] Plugin ecosystem unaffected

## Execution Timeline 📅

### Phase 1 (Desktop Migration):
- **Step 1.1-1.2**: Copy operations (30 minutes)
- **Step 1.3**: Systematic modifications (2-3 hours)
- **Step 1.4**: Icon and asset setup (30 minutes) 
- **Step 1.5**: Service integration (1-2 hours)
- **Testing & validation**: (1 hour)
- **Total Phase 1**: ~5-7 hours

### Phase 2 (Core Reorganization):
- **Preparation & mapping**: (1 hour)
- **Automated refactoring**: (2-3 hours)
- **Manual validation & fixes**: (2-4 hours) 
- **Documentation updates**: (1-2 hours)
- **Comprehensive testing**: (1 hour)
- **Total Phase 2**: ~7-11 hours

---

**Status**: Ready for execution
**Next Action**: Execute Phase 1.1 - Copy MPUP-Labs structure
**Dependencies**: Access to ~/d/homie/mpup-labs/trader-stack/