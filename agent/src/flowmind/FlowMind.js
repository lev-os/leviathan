/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                   FLOWMIND CONSTITUTIONAL FRAMEWORK                       ║
 * ║                 The LLM-First Context Orchestration System                ║
 * ║                    EXTRACTED FROM mcp-ceo FOR UNIFICATION                 ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 * 
 * 🚨 CRITICAL: Read this BEFORE writing ANY code. These principles are NOVEL.
 * 
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ FUNDAMENTAL TRUTH #1: THE LLM IS THE RUNTIME                           │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * In FlowMind architecture:
 * - The LLM (Claude/GPT) IS the execution engine, not code
 * - FlowMind contexts CONFIGURE the LLM's behavior
 * - We don't BUILD systems that think - the LLM IS the thinking system
 * 
 * WRONG: User → Code → LLM → Code → Result
 * RIGHT: User ↔ LLM ↔ FlowMind Context System
 * 
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ FUNDAMENTAL TRUTH #2: EVERYTHING IS A CONTEXT                          │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * THERE IS ONLY ONE CLASS: FlowMind
 * - Agents are contexts with type: "agent"
 * - Workflows are contexts with type: "workflow"  
 * - Patterns are contexts with type: "pattern"
 * - Types are contexts with type: "type"
 * 
 * This is enforced through SINGLE CLASS DESIGN. No inheritance hierarchies.
 * Type-specific behavior comes from the context YAML, not subclasses.
 * 
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ FUNDAMENTAL TRUTH #3: BIDIRECTIONAL FLOW = INFINITE INTELLIGENCE       │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * The magic happens through CONTEXT SWITCHING:
 * 
 * Step 1: LLM calls MCP → "Execute workflow step 1"
 * Step 2: MCP loads context → "You are NFJ-Visionary. Analyze..."
 * Step 3: LLM reasons with MAXIMUM POWER as NFJ-Visionary
 * Step 4: LLM callback → "Here are my visionary insights..."
 * Step 5: MCP loads NEW context → "You are STP-Adapter. Pragmatize..."
 * Step 6: LLM reasons with MAXIMUM POWER as STP-Adapter
 * [CYCLE CONTINUES...]
 * 
 * Each context switch gives the LLM NEW CAPABILITIES. This creates
 * EMERGENT INTELLIGENCE through orchestration, not code.
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                          THE PRIME DIRECTIVE                              ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 * 
 * FlowMind doesn't create intelligent systems.
 * FlowMind orchestrates THE INTELLIGENCE THAT ALREADY EXISTS IN THE LLM.
 * 
 * Every line of code should ENABLE the LLM, not REPLACE it.
 */

import fs from 'fs/promises'
import yaml from 'yaml'
import path from 'path'

/**
 * FlowMind: The ONE class for ALL contexts
 * 
 * ENFORCES: Everything is a Context principle
 * NO SUBCLASSES - Type differences handled through data, not inheritance
 */export class FlowMind {
  /**
   * Create a FlowMind context from YAML
   * @param {Object} rawYaml - The parsed YAML object (1:1 preserved)
   * @param {string} contextPath - Path to the YAML file
   * @param {Object} options - Optional configuration
   * @param {ContextTracker} options.tracker - Optional tracker for attribution
   */
  constructor(rawYaml, contextPath = null, options = {}) {
    // FUNDAMENTAL: Preserve complete YAML structure
    this._raw = rawYaml
    this._path = contextPath
    this._tracker = options.tracker || null
    
    // Cache commonly accessed paths for performance
    this._metadata = rawYaml.metadata || {}
    this._config = this._detectConfigSection(rawYaml)
    
    // Version tracking for compatibility
    this._flowmindVersion = '0.1.0'
  }

  // ===========================
  // METADATA ACCESS (1:1 YAML)
  // ===========================
  
  /**
   * @returns {string} The context ID from metadata.id
   */
  get id() { 
    return this._metadata.id 
  }
  
  /**
   * @returns {string} The full name from metadata.name
   * IMPORTANT: This returns metadata.name AS IS. Don't "normalize" to id.
   * If no name in metadata, default to id for usability
   */
  get name() { 
    return this._metadata.name || this._metadata.id || 'unnamed'
  }  
  /**
   * @returns {string} Convenience accessor for short name (returns id)
   */
  get shortName() { 
    return this._metadata.id 
  }
  
  /**
   * @returns {string} The context type (agent, workflow, pattern, etc.)
   */
  get type() { 
    return this._metadata.type || 'unknown' 
  }
  
  /**
   * @returns {string} Version string from metadata
   */
  get version() { 
    return this._metadata.version 
  }
  
  /**
   * @returns {string} Description from metadata
   */
  get description() { 
    return this._metadata.description 
  }
  
  /**
   * @returns {Object} Full metadata object
   */
  get metadata() {
    return this._metadata
  }