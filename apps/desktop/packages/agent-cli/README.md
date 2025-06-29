# Multi-Agent CLI with Dual LLM

A sophisticated command-line interface for trading bot automation using multiple AI agents and dual LLM validation.

## Architecture

### Multi-Agent System
- **Strategy Agent**: Analyzes market conditions and generates trading recommendations
- **Risk Agent**: Evaluates trade risk and provides safety recommendations  
- **Execution Agent**: Handles trade execution (future implementation)
- **Monitoring Agent**: Tracks performance and alerts (future implementation)

### Dual LLM Integration
- **Primary LLM**: Main analysis and reasoning (Claude by default)
- **Validator LLM**: Cross-validation and consensus checking (OpenAI by default)
- **Consensus Mechanism**: Resolves conflicts between LLM responses

## Installation

```bash
cd packages/agent-cli
npm install
```

## Configuration

Create a `.env` file in the project root:

```env
ANTHROPIC_API_KEY=your_anthropic_key_here
OPENAI_API_KEY=your_openai_key_here
```

## Usage

### Interactive Mode

```bash
npm run cli
```

This starts the interactive CLI where you can run commands like:

```
trader-agent> /strategy analyze SOL-USDC
trader-agent> /risk assess  
trader-agent> /agents
trader-agent> /help
trader-agent> /quit
```
