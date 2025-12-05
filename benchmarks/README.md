# COON LLM Comprehension Benchmark

Comprehensive benchmarks for testing LLM comprehension of COON-compressed Dart/Flutter code.

## What's Tested

The benchmark tests LLM understanding of COON across **two code categories**:

### 1. UI/Widget Code
- Flutter widgets (Text, Container, Column, Row, Scaffold, etc.)
- Screens with AppBar, navigation, FAB
- Layouts and nested widget trees
- Simple to complex UI compositions

### 2. Business Logic Code ⭐ NEW
- **Repository Pattern** - Data access layers, caching strategies
- **State Management** - BLoC, Cubit, state emissions
- **Services** - API services, authentication, validation
- **Models** - Data models with serialization, computed properties
- **Utilities** - Result types, extension methods, helpers

## Quick Start

```bash
# Install dependencies
npm install

# Run benchmark with TOP 5 models (default)
npm run benchmark

# Run with ALL models
npm run benchmark:all-models

# Run UI-only or Logic-only tests
npm run benchmark:ui
npm run benchmark:logic

# Dry run (limited questions for testing)
npm run benchmark:dry

# Validate questions
npm run validate
```

## Top 5 Models (Default)

These top-tier models are tested by default:

| # | Model | Provider |
|---|-------|----------|
| 1 | gemini-2.0-flash | Gemini |
| 2 | llama-3.3-70b-versatile | Groq |
| 3 | grok-4.1-fast:free | OpenRouter |
| 4 | deepseek-r1t2-chimera:free | OpenRouter |
| 5 | qwen3-coder:free | OpenRouter |

Use `npm run benchmark:all-models` to test with ALL available models.

## Supported Providers

### Gemini (Google)
- `gemini-2.0-flash` - Fast, capable model
- `gemini-2.5-flash-preview` - Advanced preview

### Groq (Free Tier)
- `llama-3.3-70b-versatile` - Llama 3.3 70B
- `llama-3.1-8b-instant` - Llama 3.1 8B
- `openai/gpt-oss-120b` - GPT-OSS 120B

### OpenRouter (Free Models)
- `x-ai/grok-4.1-fast:free` - Grok 4.1 Fast
- `tngtech/deepseek-r1t2-chimera:free` - DeepSeek R1T
- `qwen/qwen3-coder:free` - Qwen3 Coder
- `google/gemma-3-27b:free` - Gemma 3 27B

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Keys

Copy `.env.example` to `.env` and add your API keys:

```bash
cp .env.example .env
```

Add keys for the providers you want to test:
- `GOOGLE_GENERATIVE_AI_API_KEY` - For Gemini models ([Get key](https://aistudio.google.com/apikey))
- `GROQ_API_KEY` - For Groq free models ([Get key](https://console.groq.com/keys))
- `OPENROUTER_API_KEY` - For OpenRouter free models ([Get key](https://openrouter.ai/settings/keys))

### 3. Run Benchmarks

```bash
# Full benchmark (all models, all questions)
npm run benchmark:comprehension

# Dry run (limited questions for testing)
DRY_RUN=true npm run benchmark:comprehension

# Run with specific provider
PROVIDER=gemini npm run benchmark:comprehension
PROVIDER=groq npm run benchmark:comprehension
PROVIDER=openrouter npm run benchmark:comprehension
```

## Benchmark Types

### Comprehension Benchmark

Tests whether LLMs can understand COON-compressed code by answering questions.

**Question Types:**
- **Widget Identification** - Identify widgets in code
- **Property Retrieval** - Extract specific values
- **Structure Understanding** - Understand code hierarchy
- **Semantic Analysis** - Understand code behavior

**Formats Tested:**
- COON (compressed)
- Raw Dart (original)
- Minified Dart (whitespace removed)

### Generation Benchmark

Tests whether LLMs can generate valid COON output.

**Task Types:**
- **Dart to COON** - Convert Dart to COON format
- **COON Modification** - Modify existing COON
- **NL to COON** - Generate from description

### Modification Benchmark

Tests whether LLMs can modify COON code correctly.

**Modification Types:**
- Add widgets
- Change properties
- Remove widgets
- Refactor code

## Project Structure

```
benchmarks/
├── README.md                 # This file
├── package.json
├── .env.example
├── results/
│   ├── comprehension.md      # Comprehension results
│   └── generation.md         # Generation results
├── scripts/
│   ├── comprehension-benchmark.ts  # Main comprehension runner
│   ├── generation-benchmark.ts     # Main generation runner
│   ├── run-all.ts                  # Run all benchmarks
│   └── validate-questions.ts       # Validate questions
└── src/
    ├── index.ts              # Main exports
    ├── constants.ts          # Configuration & model lists
    ├── datasets.ts           # Code sample definitions
    ├── evaluate.ts           # LLM evaluation logic
    ├── normalize.ts          # Answer normalization
    ├── report.ts             # Report generation
    ├── providers/
    │   ├── index.ts          # Provider exports
    │   ├── types.ts          # Provider interfaces
    │   ├── factory.ts        # Provider factory
    │   ├── gemini.ts         # Google Gemini adapter
    │   ├── groq.ts           # Groq adapter
    │   └── openrouter.ts     # OpenRouter adapter
    └── questions/
        ├── index.ts          # Question exports
        ├── comprehension.ts  # Comprehension questions
        ├── generation.ts     # Generation tasks
        └── structural.ts     # Structural questions
```

## Configuration

Edit `src/constants.ts` to adjust:

```typescript
// Models by provider
export const MODELS = {
  gemini: [
    'gemini-2.0-flash',
    'gemini-2.5-flash-lite-preview',
    'gemini-2.5-pro-preview'
  ],
  groq: [
    'moonshotai/kimi-k2-instruct',
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b'
  ],
  openrouter: [
    'x-ai/grok-4.1-fast:free',
    'tngtech/deepseek-r1t-chimera:free',
    'zhipu-ai/glm-4.5-air:free',
    'google/gemma-3-27b:free'
  ]
};

// Rate limits per model
export const MODEL_RPM_LIMITS = {
  // Gemini
  'gemini-2.0-flash': 15,
  'gemini-2.5-flash-lite-preview': 10,
  'gemini-2.5-pro-preview': 5,
  // Groq
  'moonshotai/kimi-k2-instruct': 30,
  'openai/gpt-oss-120b': 30,
  // OpenRouter (free tier)
  'x-ai/grok-4.1-fast:free': 20,
  'tngtech/deepseek-r1t-chimera:free': 20,
};

// Concurrency settings
export const DEFAULT_CONCURRENCY = 5;
```

## Provider Architecture

The benchmark uses a factory pattern to create providers:

```typescript
import { createProvider } from './providers/factory.js';

// Create provider by name
const gemini = createProvider('gemini');
const groq = createProvider('groq');
const openrouter = createProvider('openrouter');

// Use provider
const response = await gemini.chat('gemini-2.0-flash', [
  { role: 'user', content: 'What widgets are in this COON code?' }
]);

console.log(response.content);        // Response text
console.log(response.inputTokens);    // Input token count
console.log(response.outputTokens);   // Output token count
console.log(response.latencyMs);      // Response time in ms
```

## Results

Results are saved to `results/` as Markdown reports:

- `comprehension.md` - Comprehension accuracy by model/format
- `generation.md` - Generation quality metrics
- `efficiency.md` - Token efficiency analysis

### Sample Output

```markdown
#### Comprehension Accuracy

| Format | Accuracy | Tokens | Efficiency |
|--------|----------|--------|------------|
| COON | 78.2% | 2,744 | 28.5 acc/1K |
| Minified | 76.5% | 3,461 | 22.1 acc/1K |
| Raw Dart | 79.1% | 5,008 | 15.8 acc/1K |
```

## Methodology

### Deterministic Validation

Answers are validated deterministically (no LLM judge):

1. Normalize both actual and expected answers
2. Compare using type-aware comparison
3. Handle common variations (case, formatting, etc.)

### Metrics Collected

- **Accuracy** - Percentage of correct answers
- **Token Usage** - Input/output tokens per question
- **Latency** - Response time per question
- **Efficiency** - Accuracy per 1K tokens

## Adding New Questions

1. Add questions to `src/questions/comprehension.ts`
2. Include ground truth and answer type
3. Run validation: `npm run validate`

```typescript
// Example question
{
  id: "widget-001",
  type: "widget-identification",
  prompt: "What widgets are in this code?",
  coonCode: "c:MyScreen<StatelessWidget>;m:b S{b:C{h:[T'Hi']}}",
  dartCode: `class MyScreen extends StatelessWidget {
    Widget build(context) => Scaffold(body: Column(children: [Text('Hi')]));
  }`,
  groundTruth: "Scaffold,Column,Text",
  answerType: "csv-list-unordered"
}
```

## Contributing

1. Add code samples to `data/code-samples/`
2. Generate questions using `src/questions/`
3. Run benchmarks and verify results
4. Submit PR with updated results
