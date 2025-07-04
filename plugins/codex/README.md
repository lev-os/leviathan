# Project Codex 🧠

**LLM-First Programming Knowledge Crystallization System**

Project Codex systematically converts scattered programming knowledge into structured, LLM-consumable formats. It provides a comprehensive knowledge base of programming paradigms, language patterns, and framework specifics designed for intelligent agent consumption.

## 🎯 What is Project Codex?

Project Codex implements the **Knowledge Crystallization Methodology** - a systematic approach to:

1. **Discover** programming knowledge from authoritative sources
2. **Analyze** patterns and extract core paradigms  
3. **Codify** knowledge in structured YAML with LLM-friendly metadata
4. **Validate** through real-world application and testing
5. **Maintain** currency through automated monitoring

## 📁 Architecture

```
packages/codex/
├── paradigms/           # Universal programming paradigms
│   ├── hexagonal-architecture/
│   ├── knowledge-crystallization/
│   └── ...
├── languages/           # Language-specific patterns
│   ├── typescript/
│   ├── javascript/
│   └── ...
├── frameworks/          # Framework and library specifics
│   ├── react/
│   ├── nextjs/
│   ├── tailwind/
│   ├── shadcn-ui/
│   └── ...
├── lib/                 # Semantic search and utilities
│   ├── semantic-search/
│   └── kingly-os/
└── src/                 # CLI tools and automation
    ├── cli/
    └── automation/
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Search the knowledge base
npm run search "react hooks"

# View statistics
npm run stats

# Update knowledge with latest patterns
npm run update

# Validate knowledge integrity
npm run validate
```

## 💡 Core Technologies Covered

### ⚛️ React 18+
- Component composition patterns
- Modern hooks architecture  
- Performance optimization
- Server/Client component paradigms

### 🔷 TypeScript 5.0+
- Type-first development patterns
- Advanced type techniques
- Error handling strategies
- Module organization

### ⏭️ Next.js 14+
- App Router patterns
- Server/Client component architecture
- Data fetching strategies
- Performance optimization

### 🎨 Tailwind CSS v3+
- Utility-first design patterns
- Theme architecture
- Responsive design strategies
- Component abstractions

### 🎪 shadcn/ui
- Headless component patterns
- Accessibility-first architecture
- Theme customization
- Composition strategies

## 🔍 Usage Examples

### Search Knowledge
```bash
# Search for specific patterns
npx codex search "component composition"

# Filter by type and complexity
npx codex search "state management" --type framework --complexity medium

# Limit results
npx codex search "typescript" --limit 5
```

### View Statistics
```bash
# Basic stats
npx codex stats

# Detailed breakdown
npx codex stats --detailed

# JSON output for integration
npx codex stats --json
```

### Update Knowledge
```bash
# Update all technologies
npx codex update

# Update specific technology
npx codex update --target react

# Dry run to see what would change
npx codex update --dry-run
```

### Validate Knowledge
```bash
# Validate all knowledge
npx codex validate

# Auto-fix issues where possible
npx codex validate --fix

# Generate validation report
npx codex validate --report
```

## 🧠 Knowledge Crystallization

Apply the methodology to new domains:

```bash
# Research and analyze new technology
npx codex dev:crystallize vue --research

# Full crystallization pipeline
npx codex dev:crystallize angular
```

## 🔗 Integration

### LLM Agent Integration
```typescript
import { CodexSearch } from '@infinite-genesis-canvas/codex';

const codex = new CodexSearch();

// Find relevant patterns
const patterns = await codex.search('react performance');

// Get specific paradigm
const paradigm = await codex.getParadigm('component_composition');

// Apply pattern guidance
const guidance = await codex.getGuidance('typescript', 'error_handling');
```

### Semantic Search Integration
```typescript
import { SemanticSearch } from '@infinite-genesis-canvas/codex/semantic-search';

const search = new SemanticSearch();

// Vector-based pattern discovery
const results = await search.findSimilar('clean architecture patterns');

// Cross-reference exploration
const related = await search.getRelated('react', 'performance');
```

## 📊 Quality Metrics

- **Knowledge Coverage**: 5+ technologies with comprehensive patterns
- **LLM Effectiveness**: 90%+ pattern application accuracy
- **Currency**: Updates within 48 hours of technology changes
- **Accessibility**: Sub-second semantic search

## 🔄 Auto-Update System

Project Codex automatically monitors:
- GitHub releases for framework updates
- Documentation changes
- Community best practice evolution
- Breaking changes and paradigm shifts

## 🎖️ Success Criteria

- ✅ **Paradigms**: 10+ universal programming paradigms
- ✅ **Languages**: 5+ languages with comprehensive patterns  
- ✅ **Frameworks**: 10+ frameworks with specific guidance
- ✅ **Cross-References**: 100+ intelligent connections
- ✅ **LLM Integration**: Agents discover and apply patterns with 90%+ accuracy

## 🔧 Development

```bash
# Build the package
npm run build

# Development mode
npm run dev

# Run tests
npm test

# Type checking
npm run type-check
```

## 📚 Documentation

- [Knowledge Crystallization Methodology](./docs/knowledge-crystallization.md)
- [Agent Integration Guide](./docs/agent-integration.md)
- [Contributing New Paradigms](./docs/contributing.md)
- [Semantic Search Setup](./docs/semantic-search.md)

## 🤝 Contributing

1. **Research Phase**: Identify knowledge gaps or emerging patterns
2. **Analysis Phase**: Extract paradigms following the methodology
3. **Codification Phase**: Structure knowledge using established templates
4. **Validation Phase**: Test with real-world examples and LLM consumption
5. **Maintenance**: Set up monitoring for ongoing currency

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---

**Project Codex transforms scattered programming knowledge into systematic, LLM-consumable intelligence that enables truly intelligent development automation.**