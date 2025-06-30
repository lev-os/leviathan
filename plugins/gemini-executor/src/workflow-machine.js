
import { createMachine, interpret } from 'xstate';
import yaml from 'js-yaml';
import fs from 'fs/promises';
import path from 'path';

class WorkflowMachine {
  constructor(workflowId, stateFilePath) {
    this.workflowId = workflowId;
    this.stateFilePath = stateFilePath;
    this.machine = null;
    this.service = null;
  }

  async loadWorkflow(workflowPath) {
    const workflowPhases = await this.loadWorkflowPhases(workflowPath);
    this.machine = this.createXstateMachine(workflowPhases);
    this.service = interpret(this.machine).onTransition((state) => {
      this.saveState(state);
    });
  }

  async loadWorkflowPhases(workflowPath) {
    const phaseFiles = await fs.readdir(workflowPath);
    const phases = [];
    for (const file of phaseFiles) {
      if (file.endsWith('.yaml')) {
        const content = await fs.readFile(path.join(workflowPath, file), 'utf8');
        phases.push(yaml.load(content));
      }
    }
    return phases.sort((a, b) => a.metadata.id.localeCompare(b.metadata.id));
  }

  createXstateMachine(phases) {
    const machineConfig = {
      id: this.workflowId,
      initial: phases[0]?.metadata.id,
      states: {},
    };

    for (const phase of phases) {
      machineConfig.states[phase.metadata.id] = {
        on: {
          NEXT: phase.phase_config.next_phase,
          PREV: phase.phase_config.prev_phase, // Assuming you add this to your YAML
          JUMP: {
            target: phase.phase_config.can_loop_to,
          },
        },
      };
    }

    return createMachine(machineConfig);
  }

  async start() {
    const savedState = await this.loadState();
    if (savedState) {
      this.service.start(savedState);
    } else {
      this.service.start();
    }
  }

  send(event) {
    this.service.send(event);
  }

  async saveState(state) {
    try {
      await fs.writeFile(this.stateFilePath, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('Failed to save workflow state:', error);
    }
  }

  async loadState() {
    try {
      if (await fs.stat(this.stateFilePath)) {
        const stateJson = await fs.readFile(this.stateFilePath, 'utf8');
        return JSON.parse(stateJson);
      }
    } catch (error) {
      // File doesn't exist or other error
      return null;
    }
    return null;
  }
}

export { WorkflowMachine };
