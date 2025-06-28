# LLM-First Principles

## Core Philosophy: "Can an LLM do this?"

This is the foundational principle of the Leviathan project. Before implementing any logic in code, the primary question to ask is: "Can a Large Language Model (LLM) perform this task?"

*   **If YES:** Do not write traditional code (e.g., JavaScript) for it. Instead, leverage the LLM's native intelligence.
*   **If NO:** Provide only the minimal necessary Model Context Protocol (MCP) tools to allow the LLM to access data or interact with external systems.

**Corollary:** Never replicate LLM capabilities in traditional code. The LLM is the intelligence; the code provides the infrastructure.

## Key Architectural Decisions Driven by LLM-First

1.  **All Intelligence Lives in LLM:** The LLM is inherently better at complexity assessment, natural language reasoning, flexibility, and adaptability than hardcoded algorithms or rigid rules. Therefore, business logic, routing, splitting, and execution decisions are handled by the LLM.
    *   **Anti-Patterns:** Avoid JavaScript confidence algorithms, hardcoded routing logic, vocabulary lists, or pattern matching in code.
2.  **YAML Agent Definitions:** Agents are defined in YAML, not JavaScript classes. This makes them easily readable and understandable by LLMs, declarative, version controllable, and human-readable.
3.  **MCP as Dynamic Instruction Nexus:** Each MCP response is designed as a complete mini-system prompt, providing the LLM with all necessary context, instructions, and tool usage examples. This enables dynamic instruction injection and avoids reliance on conversation memory.
4.  **Everything is an Agent:** Every system component is designed as an autonomous agent, maximizing flexibility, composability, and future scaling. Agents can call other agents, and communication follows uniform patterns.

## Anti-Patterns to Avoid

To maintain the LLM-First philosophy, certain anti-patterns are strictly avoided:

*   **Simulation Code:** Do not build JavaScript versions of LLM capabilities (e.g., hardcoded routing, confidence assessment, vocabulary lists).
*   **Complex Abstractions:** Avoid elaborate class hierarchies or unnecessary frameworks that abstract away LLM decision-making.
*   **Business Logic in Infrastructure:** Do not embed domain logic in MCP tools or make decisions that LLMs should make. The code provides data; the LLM provides intelligence.

## Required Patterns

*   **MCP Tool Design:** MCP tools should primarily provide data access and dynamic instruction injection, enabling the LLM to make decisions.
*   **LLM-Driven Flow:** The LLM drives all decisions, with MCP providing the necessary access and context.

## Core Insight

Traditional code taught us the patterns. LLMs apply the intelligence. The goal is to enable the LLM, not replace it.

## Source References

*   `_ref/orig-agent/CORE_PRINCIPLES.md`: This document is the primary source for all LLM-First principles and architectural decisions.
*   `CLAUDE.md`: Reinforces the LLM-First Architecture as a core technical principle.
*   `README.md`: Lists LLM-First as a key design principle.
*   `docs/consolidation-dependencies.md` (L327): Shows "LLM-First → Everything is Context → Semantic Control" as a core concept evolution.
*   `docs/consolidation-inventory.md` (L307, L377): Lists LLM-First Philosophy as a revolutionary concept and a part of the LLM-First evolutionary path.
