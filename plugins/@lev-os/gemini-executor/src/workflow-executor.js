
import { WorkflowMachine } from './workflow-machine.js';
import fs from 'fs/promises';
import path from 'path';

class WorkflowExecutor {
  constructor(workflowId, workflowPath) {
    this.workflowId = workflowId;
    this.workflowPath = workflowPath;
    const stateFileName = `.${workflowId}.state.json`;
    this.stateFilePath = path.join(this.workflowPath, stateFileName);
    this.workflowMachine = new WorkflowMachine(this.workflowId, this.stateFilePath);
  }

  async initialize() {
    await this.workflowMachine.loadWorkflow(this.workflowPath);
    await this.workflowMachine.start();
  }

  async run() {
    const currentState = this.workflowMachine.service.getSnapshot();
    const currentPhaseId = currentState.value;
    const phase = this.workflowMachine.machine.states[currentPhaseId];

    if (phase) {
      const promptPath = path.join(this.workflowPath, '..', phase.config.on.NEXT.target);
      // This is a simplified execution. In a real scenario, you would
      // load the prompt, interact with the LLM, and then transition
      // to the next state based on the response.
      console.log(`Executing phase: ${currentPhaseId}`);
      console.log(`Next phase would be: ${phase.config.on.NEXT.target}`);
      // this.workflowMachine.send('NEXT');
    }
  }
}

export { WorkflowExecutor };
