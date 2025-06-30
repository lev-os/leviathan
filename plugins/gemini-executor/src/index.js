
import { WorkflowExecutor } from './workflow-executor.js';
import { specImplement } from '@lev-os/cmd';

async function main() {
  // Example of how to start a workflow
  // In a real CLI, you would parse arguments to get the spec file
  const specFile = '_01-prime.md';
  const initialContext = await specImplement({ spec: specFile }, { logger: console });

  const executor = new WorkflowExecutor(
    initialContext.context.worktree_name,
    initialContext.workflow_context
  );

  await executor.initialize();
  await executor.run();
}

main().catch(console.error);
