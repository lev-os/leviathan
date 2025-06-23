/**
 * Secondary Port: Agent Communication
 * Interface for agent:// protocol and inter-agent communication
 */

export class AgentCommunicationPort {
  async routeToAgent(agentUrl) {
    throw new Error('AgentCommunicationPort.routeToAgent must be implemented');
  }

  async delegateTask(fromAgent, toAgent, task) {
    throw new Error('AgentCommunicationPort.delegateTask must be implemented');
  }

  async broadcastToAgents(action, params) {
    throw new Error('AgentCommunicationPort.broadcastToAgents must be implemented');
  }

  async findBestAgent(request) {
    throw new Error('AgentCommunicationPort.findBestAgent must be implemented');
  }

  async getAgentCapabilities(agentId) {
    throw new Error('AgentCommunicationPort.getAgentCapabilities must be implemented');
  }

  async listAvailableAgents() {
    throw new Error('AgentCommunicationPort.listAvailableAgents must be implemented');
  }
}