# COON Project - AI Agent Instructions

## Project Overview

COON (Code-Oriented Object Notation) is a **token-efficient compression format** for Dart/Flutter code designed to reduce LLM context window usage by 30-70%. It's a monorepo with Python and JavaScript SDKs, CLI tools, benchmarking suite, and Next.js documentation site.

**Core Value Proposition**: Compress `class LoginScreen extends StatelessWidget {...}` (150 tokens) to `c:LoginScreen<StatelessWidget>;m:b S{a:B{t:T"Login"},...}` (45 tokens, 70% reduction) while maintaining lossless reversibility.

## Architecture

### Monorepo Structure
```
packages/
  ├── python/          # Python SDK (pip install coon)
  ├── javascript/      # JS/TS SDK (npm install coon-format)
  └── cli/             # Language-agnostic CLI (@coon/cli)
benchmarks/            # LLM comprehension testing
docs/                  # Next.js documentation site
spec/                  # Format specification & shared fixtures
```

**Critical Files**:
- [spec/SPEC.md](spec/SPEC.md) - Single source of truth for compression rules
- [spec/data/](spec/data/) - Canonical abbreviation mappings (widgets.json, properties.json, keywords.json)
- [spec/fixtures/conformance/](spec/fixtures/conformance/) - Cross-SDK validation tests

### Compression Pipeline (Strategy Pattern)

Both Python and JavaScript implementations follow identical architecture:

```
Code → Analyzer → Strategy Selector → Strategy → Compressed Output
                     ↓
              [Basic, Aggressive, AST-Based, Component-Ref]
```

**Strategies** ([packages/javascript/src/strategies/](packages/javascript/src/strategies/), [packages/python/src/coon/strategies/](packages/python/src/coon/strategies/)):
- `Basic`: Simple keyword/widget abbreviations (40-50% reduction)
- `Aggressive`: Maximum compression with whitespace removal (60-70%)
- `AST-Based`: Parse-aware optimization for complex code (300+ chars)
- `Component-Ref`: Registry-based for repeated patterns

**Key Pattern**: Strategies inherit from `CompressionStrategy` base class and implement `compress()` method. The `StrategySelector` auto-selects based on code size and complexity.

## Development Workflows

### Testing

**Python SDK**:
```bash
cd packages/python
pytest tests/                    # All tests
pytest tests/test_compressor.py  # Specific test
```

**JavaScript SDK**:
```bash
cd packages/javascript
npm test                         # Jest tests
npm run test:conformance         # Cross-SDK validation
```

**Cross-SDK Conformance** (CRITICAL for consistency):
```bash
python scripts/run_conformance.py  # Validates both SDKs against spec/fixtures/conformance/
```

### Benchmarks

**LLM Comprehension Testing** ([benchmarks/](benchmarks/)):
```bash
cd benchmarks
npm run benchmark:comprehension       # Test Gemini, Groq, OpenRouter models
npm run benchmark:compression         # Token efficiency metrics
npm run benchmark:full                # Complete suite
```

**Important**: Benchmarks require API keys in `.env` (GOOGLE_GENERATIVE_AI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY). Use `DRY_RUN=true` for testing without API calls.

### Documentation Site

```bash
cd docs
npm run dev      # Local development (http://localhost:3000)
npm run build    # Static generation
```

Content lives in [docs/guide/](docs/guide/), [docs/reference/](docs/reference/), [docs/ecosystem/](docs/ecosystem/) as Markdown files.

## Project-Specific Conventions

### Abbreviation System

**NEVER hardcode abbreviations** - Always load from [spec/data/](spec/data/):

```typescript
// ✅ Correct
import { loadWidgets } from './data';
const widgets = loadWidgets();  // Loads from spec/data/widgets.json

// ❌ Wrong
const widgets = { "Scaffold": "S", "Column": "C" };  // Will drift from spec
```

**Adding New Abbreviations**:
1. Update [spec/data/widgets.json](spec/data/widgets.json) or [spec/data/properties.json](spec/data/properties.json)
2. Run conformance tests: `python scripts/run_conformance.py`
3. Both SDKs automatically pick up changes (data module caches are cleared)

### Reversibility is Sacred

Every compression **MUST** be reversible:

```typescript
const original = "class MyWidget extends StatelessWidget {...}";
const compressed = compressor.compress(original);
const decompressed = decompressor.decompress(compressed);
assert(normalize(original) === normalize(decompressed));  // Must pass
```

Use `CompressionValidator` ([packages/javascript/src/utils/validator.ts](packages/javascript/src/utils/validator.ts)) to verify:
```typescript
const validator = new CompressionValidator();
const result = validator.validate(original, compressed);
console.log(result.reversible);  // Must be true
```

### Token Counting

**Consistent across codebase**: 4 characters ≈ 1 token (LLM tokenizer approximation)

```python
# Python
def count_tokens(text: str) -> int:
    return len(text) // 4
```

```typescript
// JavaScript
function countTokens(text: string): number {
  return Math.floor(text.length / 4);
}
```

Do NOT use external tokenizer libraries unless explicitly benchmarking against real LLM APIs.

### Language Support Architecture

Currently Dart/Flutter only, but designed for extensibility ([packages/javascript/src/languages/](packages/javascript/src/languages/)):

```typescript
interface LanguageHandler {
  language: string;
  extensions: string[];
  compress(code: string, strategy: Strategy): string;
  decompress(coon: string): string;
}
```

To add JavaScript/React support (future):
1. Create `JavaScriptLanguageHandler` in [packages/javascript/src/languages/](packages/javascript/src/languages/)
2. Add abbreviation mappings to [spec/data/](spec/data/)
3. Update [spec/SPEC.md](spec/SPEC.md) with new language section

## Common Pitfalls

### 1. Breaking Cross-SDK Compatibility
**Problem**: Changing compression logic in one SDK without updating the other.
**Solution**: Always run `python scripts/run_conformance.py` after changes to compression/decompression.

### 2. Hardcoding Abbreviations
**Problem**: Duplicating abbreviation maps leads to drift.
**Solution**: Use data module loaders ([packages/javascript/src/data/](packages/javascript/src/data/), [packages/python/src/coon/data/](packages/python/src/coon/data/)) which read from [spec/data/](spec/data/).

### 3. Forgetting Strategy Auto-Selection
**Problem**: Users don't know which strategy to use.
**Solution**: Default to `strategy: "auto"` in `CompressionConfig`. The `StrategySelector` analyzes code and picks optimal strategy.

### 4. Benchmark Dataset Synchronization
**Problem**: [benchmarks/src/datasets.ts](benchmarks/src/datasets.ts) has Dart code without COON equivalents.
**Solution**: COON code is generated dynamically using SDK's `compressDart()` - datasets store only Dart source as single source of truth.

## Integration Points

### CLI → SDK Adapters
[packages/cli/src/adapters/](packages/cli/src/adapters/) provide abstraction layer:
- `JSBackendAdapter` wraps `coon-format` package
- `PythonBackendAdapter` spawns Python subprocess
- CLI users can choose backend with `--backend js|python`

### Benchmarks → Multiple LLM Providers
[benchmarks/src/providers/](benchmarks/src/providers/) implement unified interface:
- `GeminiProvider`, `GroqProvider`, `OpenRouterProvider`
- Factory pattern: `createProvider(modelConfig)`
- Rate limiting handled per-provider in [benchmarks/src/constants.ts](benchmarks/src/constants.ts)

### Docs → Markdown Processing
[docs/lib/markdown.ts](docs/lib/markdown.ts) processes Markdown files at build time:
- Syntax highlighting via Prism.js
- Auto-generates navigation from directory structure
- All pages are statically generated (Next.js SSG)

## Decision Context

### Why Strategy Pattern?
Different code sizes need different approaches. Small widgets benefit from basic compression (minimal overhead), while large screens need AST analysis for optimal results.

### Why Monorepo?
- Shared spec/fixtures ensure cross-SDK compatibility
- Benchmarks can import and test both SDKs directly
- Documentation references all packages without version drift

### Why Separate CLI Package?
The CLI needs to support both Python and JavaScript backends without forcing users to install both runtimes. [packages/cli/](packages/cli/) uses adapter pattern to delegate to available SDK.

### Why Token Approximation?
Exact token counting requires loading large tokenizer models (GPT-4, Claude). The 4-char approximation is 95%+ accurate for code and keeps SDKs lightweight.

## Quick Reference

**Compress Dart Code**:
```typescript
import { Compressor } from 'coon-format';
const result = new Compressor().compress(dartCode);
console.log(`Saved ${result.percentageSaved}% tokens`);
```

**Add New Widget Abbreviation**:
1. Edit [spec/data/widgets.json](spec/data/widgets.json): `"MyWidget": "Mw"`
2. Run: `python scripts/run_conformance.py`

**Run Specific Benchmark**:
```bash
cd benchmarks
TEST_TYPE=ui npm run benchmark:comprehension  # Only UI/widget tests
```

**Format Code**:
```bash
cd packages/javascript && npm run format  # Prettier
cd packages/python && ruff format src/    # Python (if ruff installed)
```

**Check Errors**:
- TypeScript: `cd packages/javascript && npx tsc --noEmit`
- Python: `cd packages/python && mypy src/`
