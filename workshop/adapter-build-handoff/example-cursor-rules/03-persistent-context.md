# Persistent Context Comments

Use `@llm-note:` comments to embed critical context in code.

Add these after:

- Plan rejections: `// @llm-note: user rejected pagination`
- User frustration: `// @llm-note: STOP suggesting TypeScript`
- Intentional patterns: `// @llm-note: setTimeout(0) is intentional`
- Failed attempts: `// @llm-note: tried 3x - correct as-is`
- Personal preferences: `// @llm-note: user hates semicolons`

Stack multiple for complex context.
Date stamp time-sensitive decisions.
Mark ownership and emotional context.
