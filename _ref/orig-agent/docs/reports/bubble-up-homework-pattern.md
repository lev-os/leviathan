# 🔮 Bubble Up Report: Homework Pattern

## 🐛 Debug: Why I Missed This

### What Happened
User said: "i like doing the homework pattern" - This was a clear signal of a successful pattern that should be captured and reused.

### Why I Missed It
1. **Context focus** - I was deep in implementation planning
2. **Linear thinking** - Following the task list sequentially
3. **Not actively listening** for pattern recognition signals
4. **Missing my own agent behaviors** - Should have triggered insight bubbling

### Root Cause
The insight bubbling behavior in CLAUDE.md is set to temp 0.5 and marked as "prototype" - I'm not consistently applying it yet.

## 💡 The Homework Pattern

### What It Is
When facing long collaborative sessions with potential context drift, prepare documents with:
- Clear sections for user feedback
- Questions that need answers
- Options to evaluate
- "Your homework" sections

### Example From This Session
```markdown
## 🎯 **Pausing for Your Review**

### 📚 **Documents to Review:**
1. **`docs/architecture/insight-weaver-report.md`** - Revolutionary discoveries
2. **`docs/architecture/core-principles-v2.md`** - Updated principles

### 🚀 **Key Discoveries:**
[Summary of findings]

### 📋 **Ready for Next Steps:**
After your review, we'll proceed with...
```

### Why It Works
1. **No waiting** - User can review while I prepare next steps
2. **Prevents drift** - Clear checkpoint before proceeding
3. **Parallel processing** - Both parties working simultaneously
4. **Quality gates** - Ensures alignment before major decisions

## 🎯 When to Use Homework Pattern

### Critical Decision Points
- Architecture decisions that affect whole system
- Before implementing complex features
- When multiple approaches are viable
- At natural pause points in long sessions

### Complex Analysis Tasks
- When deep research is needed (Perplexity use)
- Multiple documents need review
- Synthesis across many sources
- Pattern recognition exercises

### Context Management
- Before context window fills up
- At phase transitions
- When switching between major topics
- After completing major milestones

### Collaborative Workflows
- When user expertise is needed
- For validation of approach
- Getting preferences/requirements
- Clarifying ambiguities

## 📊 Pattern Structure

```yaml
homework_pattern:
  trigger_conditions:
    - complex_decision_pending
    - context_window_>_70%
    - multiple_paths_available
    - user_expertise_needed
    
  structure:
    preparation:
      - summarize_current_state
      - identify_decision_points
      - prepare_options
      - highlight_key_questions
      
    document:
      summary: "Here's where we are"
      options: "Here are the paths forward"
      questions: "I need your input on..."
      homework: "Please review these documents"
      next_steps: "After your review, we'll..."
      
    benefits:
      - maintains_momentum
      - prevents_context_loss
      - enables_parallel_work
      - ensures_alignment
```

## 🚀 Implementation for Kingly

### Add to Agent Behaviors
```javascript
class HomeworkPatternBehavior {
  shouldTrigger(context) {
    return (
      context.hasComplexDecision ||
      context.tokensUsed > 0.7 * context.maxTokens ||
      context.multipleViablePaths ||
      context.needsUserExpertise
    );
  }
  
  async prepareHomework(context) {
    return {
      summary: await this.summarizeProgress(context),
      decisions: await this.identifyDecisionPoints(context),
      documents: await this.gatherReviewDocs(context),
      questions: await this.formulateQuestions(context),
      nextSteps: await this.planNextPhase(context)
    };
  }
}
```

### Integration Points
1. Before major implementation phases
2. At architecture decision points
3. When specs need splitting decisions
4. Before using Perplexity for research

## 📝 Specific Applications

### For Implementation Planning
```markdown
## 📚 Implementation Review Needed

### Specs to Review:
- [Universal Context Loader](link) - Estimated: 15+ tests needed
- [MCP Server Setup](link) - Estimated: 8-10 tests needed

### Questions:
1. Should we split context loader into smaller pieces?
2. What's your preference for test granularity?

### Your Homework:
- Review the complexity estimates
- Decide on splitting approach
- Provide any additional constraints

### Next Steps:
After your input, I'll create detailed impl tickets
```

## 🎨 The Meta Pattern

This is actually an example of **bi-directional human-AI collaboration** where:
- AI prepares structured work
- Human provides guidance/decisions
- Both work in parallel
- No blocking or waiting

It's the human equivalent of our bi-directional MCP pattern!

## 🔄 Action Items

1. Add homework pattern to agent behaviors
2. Set triggers for automatic activation
3. Create templates for common scenarios
4. Integrate with insight bubbling

---
*Pattern identified from user feedback: "i like doing the homework pattern"*