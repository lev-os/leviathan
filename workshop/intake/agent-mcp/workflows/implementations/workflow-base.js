/**
 * Base Workflow Class
 * All workflow implementations extend this base class
 */

export class WorkflowBase {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.type = config.type;
    this.description = config.description;
    this.agents = new Map();
    this.context = null;
    this.metrics = {
      tasksCompleted: 0,
      averageQuality: 0,
      resourceEfficiency: 0,
      collaborationScore: 0
    };
  }

  // Abstract methods - must be implemented by subclasses
  async initialize(agents, context) {
    throw new Error('initialize() must be implemented by subclass');
  }

  async execute(task) {
    throw new Error('execute() must be implemented by subclass');
  }

  async cleanup() {
    throw new Error('cleanup() must be implemented by subclass');
  }

  // Common utility methods
  registerAgent(id, agent) {
    this.agents.set(id, agent);
  }

  getAgent(id) {
    return this.agents.get(id);
  }

  getAllAgents() {
    return Array.from(this.agents.values());
  }

  updateMetrics(results) {
    this.metrics.tasksCompleted++;
    this.metrics.averageQuality = this.calculateAverageQuality(results);
    this.metrics.resourceEfficiency = this.calculateResourceEfficiency(results);
    this.metrics.collaborationScore = this.calculateCollaborationScore(results);
  }

  calculateAverageQuality(results) {
    if (!results.qualityScores) return this.metrics.averageQuality;
    const avg = results.qualityScores.reduce((a, b) => a + b, 0) / results.qualityScores.length;
    return (this.metrics.averageQuality + avg) / 2;
  }

  calculateResourceEfficiency(results) {
    if (!results.resourcesUsed || !results.outputValue) return this.metrics.resourceEfficiency;
    const efficiency = results.outputValue / results.resourcesUsed;
    return (this.metrics.resourceEfficiency + efficiency) / 2;
  }

  calculateCollaborationScore(results) {
    if (!results.collaborationMetrics) return this.metrics.collaborationScore;
    const score = results.collaborationMetrics.reduce((a, b) => a + b, 0) / results.collaborationMetrics.length;
    return (this.metrics.collaborationScore + score) / 2;
  }

  getMetrics() {
    return { ...this.metrics };
  }

  // Common workflow patterns
  async conductAuction(item, bidders, auctionType = 'first-price') {
    const bids = [];
    
    for (const bidder of bidders) {
      try {
        const bid = await bidder.generateBid(item);
        bids.push({ bidder, bid: bid.amount, proposal: bid.proposal });
      } catch (error) {
        console.warn(`Bidder ${bidder.id} failed to bid:`, error.message);
      }
    }

    return this.selectWinner(bids, auctionType);
  }

  selectWinner(bids, auctionType) {
    if (bids.length === 0) return null;

    switch (auctionType) {
      case 'first-price':
        return bids.reduce((max, bid) => bid.bid > max.bid ? bid : max);
      case 'second-price':
        const sorted = bids.sort((a, b) => b.bid - a.bid);
        return { ...sorted[0], winningPrice: sorted[1]?.bid || sorted[0].bid };
      case 'dutch':
        // Simplified dutch auction - first bidder at or above reserve
        return bids.find(bid => bid.bid >= item.reservePrice) || null;
      default:
        return bids.reduce((max, bid) => bid.bid > max.bid ? bid : max);
    }
  }

  async facilitateNegotiation(parties, issue) {
    const rounds = [];
    let currentRound = 0;
    let agreement = null;
    const maxRounds = 10;

    while (!agreement && currentRound < maxRounds) {
      const roundResults = [];
      
      for (const party of parties) {
        const position = await party.generatePosition(issue, rounds);
        roundResults.push({ party: party.id, position });
      }

      rounds.push(roundResults);
      agreement = this.checkForAgreement(roundResults);
      currentRound++;
    }

    return { agreement, rounds, successful: !!agreement };
  }

  checkForAgreement(roundResults) {
    // Simple agreement detection - can be overridden by subclasses
    const positions = roundResults.map(r => r.position);
    const avgPosition = positions.reduce((sum, pos) => sum + pos.value, 0) / positions.length;
    const maxDeviation = Math.max(...positions.map(pos => Math.abs(pos.value - avgPosition)));
    
    // Agreement if all positions are within 10% of average
    return maxDeviation < avgPosition * 0.1 ? { value: avgPosition, consensus: true } : null;
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${this.name}] [${level.toUpperCase()}] ${message}`);
  }
}