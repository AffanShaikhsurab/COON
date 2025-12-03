# COON JavaScript/TypeScript SDK

[![npm version](https://img.shields.io/npm/v/@coon/sdk.svg?labelColor=1b1b1f&color=60a5fa)](https://www.npmjs.com/package/@coon/sdk)
[![Node Version](https://img.shields.io/badge/node-18%2B-60a5fa?labelColor=1b1b1f)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/license-MIT-60a5fa?labelColor=1b1b1f)](../../LICENSE)

Token-efficient code compression for Dart/Flutter, optimized for LLM contexts.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Advanced Usage](#advanced-usage)
- [Compression Strategies](#compression-strategies)
- [API Reference](#api-reference)
- [Architecture](#architecture)
- [Testing](#testing)
- [License](#license)

## Installation

```bash
# npm
npm install @coon/sdk

# pnpm
pnpm add @coon/sdk

# yarn
yarn add @coon/sdk
```

## Quick Start

```typescript
import { compressDart, decompressCoon } from '@coon/sdk';

// Compress Dart code
const dartCode = `
class MyWidget extends StatelessWidget {
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Text("Hello World"),
      ),
    );
  }
}
`;

const compressed = compressDart(dartCode);
console.log(compressed);
// Output: c:MyWidget<StatelessWidget>;m:b S{b:N{c:T"Hello World"}}

// Decompress back to Dart
const original = decompressCoon(compressed);
```

## Advanced Usage

### Using the Compressor Class

```typescript
import { Compressor, CompressionStrategyType } from '@coon/sdk';

const compressor = new Compressor({
    strategy: CompressionStrategyType.AUTO,
    enableMetrics: true,
    validate: true
});

const result = compressor.compress(dartCode);

console.log(`Original tokens: ${result.originalTokens}`);
console.log(`Compressed tokens: ${result.compressedTokens}`);
console.log(`Savings: ${result.percentageSaved.toFixed(1)}%`);
console.log(`Strategy used: ${result.strategyUsed}`);
```

### Using Specific Strategies

```typescript
import { Compressor, CompressionStrategyType } from '@coon/sdk';

const compressor = new Compressor();

// Use aggressive strategy for maximum compression
const result = compressor.compress(dartCode, CompressionStrategyType.AGGRESSIVE);

// Use basic strategy for safer compression
const safeResult = compressor.compress(dartCode, CompressionStrategyType.BASIC);
```

### Decompression with Formatting

```typescript
import { Decompressor } from '@coon/sdk';

const decompressor = new Decompressor({
    formatOutput: true,
    indentSize: 2
});

const result = decompressor.decompress(compressed);
console.log(result.code);
```

## Compression Strategies

| Strategy | Compression | Speed | Description |
|----------|-------------|-------|-------------|
| `AUTO` | 50-70% | Fast | Automatic optimal selection |
| `BASIC` | 30-40% | Fastest | Simple abbreviations |
| `AGGRESSIVE` | 60-70% | Fast | Maximum compression |
| `AST_BASED` | 50-65% | Moderate | Syntax tree analysis |
| `COMPONENT_REF` | 70-80% | Moderate | Pattern-based references |

### Strategy Selection

```typescript
import { CompressionStrategyType } from '@coon/sdk';

// Available strategies
CompressionStrategyType.AUTO          // Default - automatic selection
CompressionStrategyType.BASIC         // Conservative compression
CompressionStrategyType.AGGRESSIVE    // Maximum compression
CompressionStrategyType.AST_BASED     // Syntax-aware compression
CompressionStrategyType.COMPONENT_REF // Pattern reference compression
```

## API Reference

### Core Functions

#### `compressDart(code: string, strategy?: CompressionStrategyType): string`

Compress Dart code to COON format.

```typescript
const compressed = compressDart(dartCode);
const compressed = compressDart(dartCode, CompressionStrategyType.AGGRESSIVE);
```

#### `decompressCoon(compressed: string): string`

Decompress COON format back to Dart code.

```typescript
const original = decompressCoon(compressed);
```

### Classes

#### `Compressor`

Main compression class with configuration options.

```typescript
interface CompressorConfig {
    strategy?: CompressionStrategyType;
    enableMetrics?: boolean;
    validate?: boolean;
}

const compressor = new Compressor(config);
const result = compressor.compress(code, strategy?);
```

#### `Decompressor`

Decompression class with formatting options.

```typescript
interface DecompressorConfig {
    formatOutput?: boolean;
    indentSize?: number;
}

const decompressor = new Decompressor(config);
const result = decompressor.decompress(compressed);
```

#### `CompressionResult`

Result object containing compression output and metrics.

```typescript
interface CompressionResult {
    compressed: string;       // Compressed code string
    originalTokens: number;   // Original token count
    compressedTokens: number; // Compressed token count
    percentageSaved: number;  // Compression percentage
    strategyUsed: string;     // Strategy that was used
}
```

### Types

```typescript
import {
    Compressor,
    Decompressor,
    CompressionResult,
    CompressionStrategyType,
    CompressorConfig,
    DecompressorConfig
} from '@coon/sdk';
```

## Architecture

```
src/
├── core/           # Compressor, Decompressor, Config, Result
│   ├── compressor.ts
│   ├── decompressor.ts
│   ├── config.ts
│   └── result.ts
├── strategies/     # Compression strategy implementations
│   ├── base.ts
│   ├── basic.ts
│   ├── aggressive.ts
│   ├── ast_based.ts
│   └── component_ref.ts
├── data/           # Data loader for abbreviations
├── languages/      # Language-specific handlers
│   └── dart/
├── parser/         # Lexer, Parser, AST
└── utils/          # Validator, Formatter, Registry
```

## Data Files

The SDK loads abbreviation data from the shared `spec/data/` directory:

| File | Description |
|------|-------------|
| `widgets.json` | Widget abbreviations (Scaffold → S, Column → C) |
| `properties.json` | Property abbreviations (appBar: → a:, body: → b:) |
| `keywords.json` | Keyword abbreviations (class → c:, extends → <) |

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run conformance tests
npm run test:conformance

# Watch mode for development
npm run test:watch
```

## Building

```bash
# Build the package
npm run build

# Type checking
npm run typecheck

# Linting
npm run lint
```

## License

MIT - See [LICENSE](../../LICENSE) for details.
