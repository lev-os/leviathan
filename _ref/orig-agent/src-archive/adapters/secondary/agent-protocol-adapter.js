/**
 * Agent Protocol Adapter
 * Implements AgentCommunicationPort using agent:// protocol
 */

import { AgentCommunicationPort } from '../../ports/agent-communication.js';
import AgentProtocol from './agent-protocol.js';

export class AgentProtocolAdapter extends AgentCommunicationPort {
  constructor(agentsPath = './agents') {
    super();
    this.agentProtocol = new AgentProtocol({ agentsPath });
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      await this.agentProtocol.initialize();
      this.initialized = true;
    }
  }

  async routeToAgent(agentUrl) {
    await this.initialize();
    return await this.agentProtocol.route(agentUrl);
  }

  async delegateTask(fromAgent, toAgent, task) {
    await this.initialize();
    return await this.agentProtocol.delegate(fromAgent, toAgent, task);
  }

  async broadcastToAgents(action, params) {
    await this.initialize();
    return await this.agentProtocol.broadcast(action, params);
  }

  async findBestAgent(request) {
    await this.initialize();
    // Use broadcast to find best match
    const responses = await this.agentProtocol.broadcast('analyze', { request });
    return responses.responses
      .sort((a, b) => (b.result?.confidence || 0) - (a.result?.confidence || 0))[0];
  }

  async getAgentCapabilities(agentId) {
    await this.initialize();
    const agent = this.agentProtocol.agents.get(agentId);
    return agent ? agent.capabilities : null;
  }

  async listAvailableAgents() {
    await this.initialize();
    return Array.from(this.agentProtocol.agents.values());
  }
}