/**
 * Constitutional AI Plugin
 *
 * Provides optional neurochemical optimization and ethical decision-making
 * framework for the Leviathan system.
 */

// Export the core framework
export { ConstitutionalFramework } from './constitutional-framework.js'

// Export commands for auto-discovery
export { constitutionalValidate, constitutionalValidateTool } from './commands/constitutional-validate.js'

// Plugin metadata
export const plugin = {
  name: '@lev-os/constitutional-ai',
  version: '0.1.0',
  type: 'extension-plugin',
  experimental: true,

  // Optional integration interface for universal-context-system
  createValidator: async () => {
    const { ConstitutionalFramework } = await import('./constitutional-framework.js')
    return new ConstitutionalFramework()
  },
}
