# Leviathan Migration Roadmap

## Project Overview
**Objective**: Rebrand from "kingly agent/os" to "leviathan agent/os" using `@lev-os/*` NPM scope with simplified single-folder plugin structure while maintaining Kingly Agency sponsorship.

**Timeline**: 6-8 days (comprehensive rebranding)  
**Start Date**: 2025-06-16  
**Target Completion**: 2025-06-24

## Milestones

### 🎯 Milestone 1: Foundation Setup (Day 1)
**Target Date**: June 16, 2025
- ✅ Create tracking system (tracker.csv, roadmap.md)
- ✅ Analyze current package structure  
- ✅ Plan simplified plugins directory structure
- ✅ Create migration ignore patterns

**Success Criteria**: Clear migration plan with single plugins folder boundary

### 🎯 Milestone 2: Directory Structure Creation (Day 1-2)
**Target Date**: June 17, 2025
- ✅ Create `/plugins/@lev-os/` directory structure
- ✅ Move all @kingly packages to `/plugins/@lev-os/`
- 🔄 Update root workspace configuration
- 📝 Update agent core package.json

**Success Criteria**: All packages moved to plugins folder, workspaces updated

### 🎯 Milestone 3: Comprehensive Rebranding (Days 2-5)
**Target Date**: June 21, 2025
- ✅ Update all package.json files (@kingly → @lev-os)
- ✅ Find and update ALL @kingly imports across entire codebase
- 📝 Update agent, apps, and os/kernel imports
- ✅ Update binary names (kingly-* → lev-*)
- ⚠️ Update tsconfig.json and build configurations
- ✅ Update CLI commands and help text
- ✅ Add Kingly Agency sponsorship attribution

**Success Criteria**: Zero @kingly references remain, all builds work with @lev-os scope

### 🎯 Milestone 4: Documentation & Testing (Days 5-6)
**Target Date**: June 22, 2025
- 📚 Update all README files with Leviathan branding
- 📖 Update architecture documentation
- ⚠️ Search and update all remaining "kingly" text references
- ⚠️ Test build system with new @lev-os structure
- ⚠️ Verify all imports and dependencies work
- ⚠️ Test agent functionality end-to-end
- ⚠️ Test MCP integration

**Success Criteria**: All documentation updated, system fully functional with @lev-os scope

### 🎯 Milestone 5: Final Validation & Publishing (Days 6-8)
**Target Date**: June 24, 2025
- 🕵️ Final sweep for any remaining @kingly references
- 📦 Verify @lev-os NPM scope availability
- 🚀 Prepare packages for NPM publishing
- ✅ Complete end-to-end migration validation
- 📋 Document any migration notes for future reference

**Success Criteria**: Zero @kingly references, @lev-os scope validated, ready for open source release

## Risk Management

### High-Risk Items
- **Package Dependency Conflicts**: All cross-package dependencies must be updated simultaneously
- **Build System Breakage**: Complex monorepo build configuration requires careful testing
- **NPM Scope Availability**: Must verify @lev-os scope is available before cutover

### Mitigation Strategies
- Create comprehensive test suite before making changes
- Maintain backup branches for rollback capability
- Test migration process in isolated environment first
- Coordinate with NPM registry for scope availability

## Success Metrics

### Technical Metrics
- ⚠️ 100% of @kingly references converted to @lev-os
- ✅ All build processes complete successfully
- ✅ Zero broken dependencies or imports
- ✅ All tests passing post-migration

### Business Metrics
- 📄 Clear Kingly Agency attribution in all packages
- 📚 Updated documentation reflects new branding
- 👥 User migration path clearly documented
- 🌐 Open source positioning established

## Communication Plan

### Internal Updates
- Daily standup updates on tracker.csv progress
- Weekly milestone reviews
- Risk escalation as needed

### External Communication
- Migration announcement with timeline
- User guide for updating dependencies
- Kingly Agency sponsorship announcement
- Open source community outreach

## Dependencies & Blockers

### External Dependencies
- NPM registry @lev scope availability
- Kingly Agency approval for sponsorship language
- Community feedback on migration timeline

### Internal Dependencies
- Complete package structure analysis
- Build system testing infrastructure
- Documentation review and approval

## Rollback Plan

If critical issues arise:
1. **Phase 1-3**: Revert file changes from git
2. **Phase 4+**: Use backup branches and restore package.json files
3. **Post-NPM**: Maintain @kingly packages until migration complete

## Next Actions

### Immediate (Today)
- Complete package structure analysis
- Create .migrationignore file
- Verify NPM @lev scope availability

### This Week
- Begin directory restructuring
- Update root package configuration
- Start documentation updates

### Ongoing
- Update tracker.csv daily
- Review progress against milestones
- Communicate blockers immediately