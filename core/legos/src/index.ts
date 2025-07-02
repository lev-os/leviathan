/**
 * @lev-os/legos - The Lego Builder
 * 
 * Assembles schema-validated pieces to build things in the Leviathan ecosystem.
 * Uses schemas from @lev-os/schema to ensure proper lego composition.
 */

export * from './assembly/index.js';
export * from './generation/index.js';
export * from './templates/index.js';
export * from './validation/index.js';
export * from './composition/index.js';

// Core types
export interface LegoContext {
  id: string;
  type: string;
  description: string;
  version: string;
  [key: string]: any;
}

export interface AssemblyOptions {
  strict?: boolean;
  validate?: boolean;
  allowPartial?: boolean;
}

export interface GenerationOptions {
  template?: string;
  outputFormat?: 'yaml' | 'json' | 'typescript';
  includeComments?: boolean;
}

// Main builder interface
export interface LegoBuilder {
  assemble(contexts: LegoContext[], options?: AssemblyOptions): Promise<any>;
  generate(type: string, data: any, options?: GenerationOptions): Promise<string>;
  validate(context: LegoContext): Promise<boolean>;
  compose(pattern: string, contexts: LegoContext[]): Promise<LegoContext>;
}