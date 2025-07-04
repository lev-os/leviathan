# AGENT TASK: Generate Session Handoff Report

Your task is to generate a detailed handoff report based on the preceding conversation session. Your goal is to produce a timeline, a trail guide through code and context, key decisions made, and user feedback so the next agent can quickly get to a similar deterministic state.

## TEMPLATE & FORMATTING

Analyze the current conversation context and manage session state based on the mode and $ARGUMENTS provided.

List in chronological order the files worked on, what files you loaded into your context, what you came to understand after loading them and why it is important.

The goal of this is to produce a timeline, a trail guide through code and context, key decisions made and user feedback so the next session will have a roadmap to get to a similar deterministic state that you are currently in.

## Response Format:

We should have a series of 3-15 "checkpoints", outlined below. For each checkpoint, use 1 of the 3 templates for general progress (Checkpoint format), Code Context, or Key Decision.

At the end of the handoff response provide a system prompt for the agent on what to do next and how to proceed summarzing the entire session + next steps. Ask it to load and analyze the files listed and ensure that you understand the same things at various checkpoints. Provide a "context confidence" score after priming the context, so the user understands if they should work w/ the LLM in order to properly get back to a similar state

### Checkpoint Format:

```
⚡ CHECKPOINT Progress

**Current State:** [What we're actively working on]
**Context:** [Key conversation points from recent work]
**Files Modified:** [Recent file changes and their purpose]
**Progress:** [What's been accomplished this session]
**Next Steps:** [Immediate actions needed]
**Session ID:** [For continuity tracking]
```

### Code Context:

```
📋 Code Context: [file:lines or function]
[Relevant code snippet with line numbers]

**Why Important:** [How this code relates to current work]
**Changes Made:** [If any modifications to this code]
**Context for Next Session:** [How this code fits in timeline]
```

### Key Decision:

```
📋 User feedback / ADR created

**Why Important:** [How this decision relates to current work]
**Changes Made:** [If any modifications were made]
**Context for Next Session:** [How this fits in timeline]
```

## Guidelines

- Use appropriate mode based on session state
- Include specific file references and line numbers when relevant
- Focus on actionable insights and continuity
- Code snippets should include enough context to understand
- Explain WHY decisions were made, not just WHAT happened

At the end of the handoff response provide a system prompt for the agent on what to do next and how to proceed summarzing the entire session + next steps. Ask it to load and analyze the files listed and ensure that you understand the same things at various checkpoints. Provide a "context confidence" score after priming the context, so the user understands if they should work w/ the LLM in order to properly get back to a similar state
