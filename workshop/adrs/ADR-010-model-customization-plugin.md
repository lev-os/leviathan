# ADR-010: Model Customization Plugin Architecture

**Status**: PROPOSED  
**Date**: 2025-06-26  
**Decision Makers**: Workshop Intelligence System

## Context

The analysis of `reusable-openai-fine-tune` repository revealed that Leviathan currently lacks native LLM fine-tuning and model customization capabilities. While the repository itself isn't architecturally aligned with our LLM-first principles, it provides clean patterns for model customization workflows that could significantly enhance agent specialization.

### Current State
- No fine-tuning capabilities in Leviathan ecosystem
- OpenAI integration exists but only for inference
- No model training or customization infrastructure
- No automated dataset generation from agent interactions

### Opportunity
- Enable specialized agent creation through fine-tuning
- Leverage memory system data for training datasets
- Support multiple LLM providers beyond OpenAI
- Create feedback loop from successful agent interactions

## Decision

Create a new `@lev-os/model-customization` plugin that abstracts model fine-tuning workflows across multiple providers while maintaining Leviathan's architectural principles.

### Architecture

```yaml
@lev-os/model-customization:
  providers:
    openai:
      - fine-tuning API integration
      - model management
      - dataset formatting
    anthropic:
      - constitutional AI training
      - harmlessness fine-tuning
    local:
      - LoRA/QLoRA support
      - Ollama integration
      
  features:
    dataset_generation:
      - from memory system
      - from agent interactions
      - from workflow successes
    
    training_management:
      - job orchestration
      - progress monitoring
      - resource optimization
    
    model_evaluation:
      - performance metrics
      - A/B testing
      - automated benchmarks
```

### Integration Points

1. **Memory System**
   - Auto-generate training data from episodic memory
   - Extract successful interaction patterns
   - Create personality-specific datasets from EEPS

2. **Agent System**
   - Deploy fine-tuned models to specific agents
   - Switch models based on task requirements
   - Create specialized agent personalities

3. **Workshop Tools**
   - Fine-tune models for code analysis
   - Create language-specific models
   - Train on successful patterns

## Consequences

### Positive
- Enables true agent specialization through fine-tuning
- Creates feedback loop for continuous improvement
- Reduces dependency on base model capabilities
- Supports multi-provider strategy

### Negative
- Adds complexity to model management
- Requires compute resources for training
- Needs careful dataset curation
- Potential for model drift

### Risks
- Over-specialization reducing general capabilities
- Training data quality affecting model performance
- Provider API changes breaking workflows
- Cost implications of frequent fine-tuning

## Implementation Plan

### Phase 1: Pattern Extraction (2-3 days)
- Extract CLI patterns from reusable-openai-fine-tune
- Document workflow stages and best practices
- Identify reusable abstractions

### Phase 2: Plugin Architecture (1 week)
- Design provider abstraction layer
- Create dataset generation interface
- Plan integration with memory system

### Phase 3: OpenAI Provider (1 week)
- Implement OpenAI fine-tuning integration
- Add job management and monitoring
- Create example workflows

### Phase 4: Memory Integration (2 weeks)
- Connect to memory system for dataset generation
- Implement interaction pattern extraction
- Add automated dataset curation

### Phase 5: Multi-Provider Support (3 weeks)
- Add Anthropic provider support
- Integrate local model fine-tuning
- Create provider selection logic

## Alternatives Considered

1. **Direct Integration** - Rejected due to lack of LLM-first architecture
2. **External Service** - Rejected to maintain sovereignty principle
3. **Manual Workflows** - Rejected as it doesn't scale with agent proliferation

## References

- Original repository: https://github.com/disler/reusable-openai-fine-tune
- Analysis document: workshop/analysis/reusable-openai-fine-tune/analysis.md
- OpenAI fine-tuning docs: https://platform.openai.com/docs/guides/fine-tuning
- Anthropic fine-tuning: https://www.anthropic.com/news/fine-tune-claude-3-haiku