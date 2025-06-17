#!/usr/bin/env node
/**
 * CLI Help System - Terminal help for Leviathan hybrid commands
 */

import { COMMAND_REGISTRY, generateHelpText } from './command-registry.js';

function showCommandHelp(command) {
  const cmd = COMMAND_REGISTRY[command];
  if (!cmd) {
    return `Unknown command: ${command}\n\nRun 'lev help' for available commands.`;
  }

  return `${cmd.syntax}
${cmd.description}

Examples:
${cmd.examples.map(ex => `  ${ex}`).join('\n')}

Usage guidance:
${cmd.whisper.context_hint}
`;
}

function showAllCommands() {
  const commands = Object.entries(COMMAND_REGISTRY)
    .map(([name, cmd]) => `  ${cmd.syntax.padEnd(35)} ${cmd.description}`)
    .join('\n');
    
  return `🔮 LEVIATHAN HYBRID COMMAND SYSTEM

EXPLICIT COMMANDS:
${commands}

NATURAL LANGUAGE:
  lev <natural language>             Semantic workflow discovery
  
Examples:
  lev find creative brainstorming
  lev "help me with strategic planning"
  lev "what workflows for startup launch?"
  
For detailed help: lev help <command>

BINARY:
  lev                                Main Leviathan command
`;
}

function main() {
  const command = process.argv[2];
  
  if (command) {
    console.log(showCommandHelp(command));
  } else {
    console.log(showAllCommands());
  }
}

main();