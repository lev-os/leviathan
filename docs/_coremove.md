# Core Move Migration Plan

## **Executive Summary**
Brute force migration from `packages/*` to `core/*` and flatten `plugins/@lev-os/*` to `plugins/*`. No worktree needed - we're already refactoring and this isn't production.

## **Migration Steps**

### **Phase 1: Directory Restructure**
1. **Create core/ and move packages:**
   ```bash
   mkdir core/
   mv packages/commands/ core/commands/
   mv packages/debug/ core/debug/
   mv packages/memory/ core/memory/
   mv packages/testing/ core/testing/
   mv packages/validation/ core/validation/
   mv packages/workshop/ core/workshop/
   ```

2. **Flatten plugin structure:**
   ```bash
   mv plugins/@lev-os/workflow-orchestrator/ plugins/workflow-orchestrator/
   mv plugins/@lev-os/constitutional-ai/ plugins/constitutional-ai/
   mv plugins/@lev-os/gemini-executor/ plugins/gemini-executor/
   mv plugins/@lev-os/constitutional-framework/ plugins/constitutional-framework/
   mv plugins/@lev-os/eeps-system/ plugins/eeps-system/
   # Archive @lev-os directory (NEVER DELETE - always archive)
   mv plugins/@lev-os/ _archive/plugins-lev-os-$(date +%Y%m%d-%H%M%S)/
   ```

### **Phase 2: Update Workspace Configuration**
1. **Update pnpm-workspace.yaml:**
   ```yaml
   packages:
     - 'core/*'        # New core packages
     - 'packages/*'     # Keep remaining packages  
     - 'plugins/*'      # Flattened plugins (no @lev-os nesting)
     - 'agent'
     - 'apps/*'
     - 'tooling/*'
   ```

2. **Update root package.json workspaces array** to match

3. **Run pnpm install** to rebuild workspace links

### **Phase 3: Fix All Imports**

**Import Testing Strategy:**
- **Use grep first** for speed and confidence
- **AST only if grep misses edge cases**

**Grep approach confidence: 85%** - Good for:
✅ Standard import patterns  
✅ Simple string replacement  
✅ Fast iteration  
❌ Complex multi-line imports  
❌ Dynamic imports  

**Text replacements needed:**
```bash
# Convert relative imports to workspace imports
find . -name "*.js" -o -name "*.ts" -exec sed -i 's|from ['\''"][^'\''"]*packages/\([^'\''"]*\)['\''"]|from '\''@lev-os/\1'\''|g' {} \;

# Ensure all @lev-os imports use workspace protocol in package.json
find . -name "package.json" -exec sed -i 's|"@lev-os/\([^"]*\)": "[^"]*"|"@lev-os/\1": "workspace:*"|g' {} \;
```

### **Phase 4: Testing Import Resolution**

**Import Test Commands:**
```bash
# Test 1: Check all imports resolve
pnpm -r exec "node -e 'console.log(\"Package resolved:\", require(\"./package.json\").name)'"

# Test 2: Find remaining relative imports
grep -r "from ['\"]\.\./" --include="*.js" --include="*.ts" .

# Test 3: Verify workspace dependencies
grep -r "@lev-os/" --include="package.json" . | grep -v "workspace:"

# Test 4: Run actual tests
pnpm test
```

### **Phase 5: Validation & Cleanup**
1. **Run all tests** to ensure everything works
2. **Check for broken imports** using grep patterns
3. **Verify build works** across all packages
4. **Commit atomic change** with descriptive message

## **Why This Approach Works**
- **pnpm workspace magic** - Handles resolution automatically
- **Already refactoring** - No production risk
- **Simple file moves** - No complex git operations
- **Fast feedback** - Break quickly, fix immediately

## **Risk Mitigation**
- **Git checkpoint** before starting
- **Test frequently** - After each phase
- **Rollback plan** - `git reset --hard` if needed
- **NEVER DELETE - Always Archive** - Move unused directories to `_archive/` with timestamp

## **Success Criteria**
✅ All packages moved to correct locations  
✅ pnpm install completes without errors  
✅ All tests pass  
✅ No relative imports to old locations  
✅ Clean workspace dependency graph

## **Testing Import Resolution - Confidence Analysis**

### **Grep vs AST Confidence Levels**

**Grep Approach: 85% confidence**
- **Pros:**
  - Fast and simple
  - Good for standard import patterns
  - Easy to iterate and fix
  - No complex tooling needed
- **Cons:**
  - Misses complex multi-line imports
  - Can't handle dynamic imports
  - May miss edge cases in string formatting

**AST Approach: 95% confidence**
- **Pros:**
  - Understands JavaScript syntax perfectly
  - Handles all import variations
  - Can validate semantic correctness
- **Cons:**
  - Slower to set up and run
  - Overkill for this brute force approach
  - More complex tooling required

### **Recommendation: Start with Grep**
Given we're in brute force mode and this isn't production:
1. **Use grep first** - 85% confidence is good enough to start
2. **Test frequently** - Run import resolution tests after each change
3. **AST as fallback** - Only if grep approach leaves significant issues
4. **Manual cleanup** - Handle any remaining edge cases by hand

The grep approach fits the "brute force" philosophy - fast, simple, and good enough for a refactoring system.