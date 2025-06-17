# Relevance Analysis for Strategic Planning Task

## Context Evaluation

I'll analyze each context for relevance to the strategic planning task:

**CEO Context Analysis:**
The CEO context contains strategic planning capabilities, resource allocation frameworks, and business impact assessment tools. This is highly relevant for strategic planning tasks as it provides executive perspective and decision-making frameworks.

**NFJ-Visionary Context Analysis:**  
The NFJ-Visionary agent brings long-term vision, pattern recognition, and intuitive strategic insights. This personality type excels at seeing future possibilities and connecting disparate ideas into coherent strategic narratives. Highly relevant for planning phases.

**STP-Adapter Context Analysis:**
The STP-Adapter provides practical, action-oriented perspective focused on immediate implementation and tactical execution. While valuable, this is less directly relevant to high-level strategic planning compared to visionary and executive perspectives.

## Confidence Assessment

Based on semantic analysis of context content against the strategic planning task requirements:

---

## HANDOFF_SECTION

```json
{
  "relevance_scores": [
    {
      "context_id": "ceo",
      "relevance": 0.92,
      "confidence": 0.95,
      "reasoning": "Direct strategic planning capabilities and executive decision frameworks"
    },
    {
      "context_id": "nfj-visionary", 
      "relevance": 0.88,
      "confidence": 0.91,
      "reasoning": "Strong future-vision and strategic pattern recognition alignment"
    },
    {
      "context_id": "stp-adapter",
      "relevance": 0.45, 
      "confidence": 0.78,
      "reasoning": "Implementation-focused but less strategic planning relevant"
    }
  ],
  "task_analysis": {
    "task_type": "strategic_planning",
    "complexity": "high",
    "required_perspectives": ["executive", "visionary", "systematic"]
  },
  "filtering_recommendation": {
    "threshold_applied": 0.6,
    "contexts_above_threshold": ["ceo", "nfj-visionary"],
    "contexts_filtered_out": ["stp-adapter"]
  }
}
```