# Getting Started

COON (Code-Oriented Object Notation) is a token-efficient compression format for Dart/Flutter code, designed to minimize token usage in LLM contexts while maintaining lossless, round-trip compression.

## What is COON?

COON addresses the token inefficiency problem when working with Large Language Models in code generation scenarios:

- **Raw code contains excessive whitespace and boilerplate**
- **Multi-agent systems transfer large amounts of code between agents**
- **Context windows fill quickly with uncompressed code**
- **API costs scale with token count**

By compressing code through systematic abbreviation of keywords, widgets, and properties, COON achieves **60-70% token reduction** while preserving full semantic meaning.

## Installation

### Python

```bash
# Standard installation
pip install coon

# With CLI support
pip install coon[cli]

# For development
pip install coon[dev]
```

### JavaScript/TypeScript

::: code-group

```bash [npm]
npm install @coon-format
```

```bash [pnpm]
pnpm add @coon-format
```

```bash [yarn]
yarn add @coon-format
```

:::

### CLI (No Installation Required)

```bash
npx @coon/cli compress input.dart -o output.coon
```

## Quick Start

### Python

```python
from coon import compress_dart, decompress_coon

# Your Dart code
dart_code = """
class MyWidget extends StatelessWidget {
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Text("Hello World"),
      ),
    );
  }
}
"""

# Compress
compressed = compress_dart(dart_code)
print(compressed)
# Output: c:MyWidget<StatelessWidget>;m:b S{b:N{c:T"Hello World"}}

# Decompress
original = decompress_coon(compressed)
```

### JavaScript/TypeScript

```typescript
import { compressDart, decompressCoon } from '@coon-format';

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

// Compress
const compressed = compressDart(dartCode);
console.log(compressed);
// Output: c:MyWidget<StatelessWidget>;m:b S{b:N{c:T"Hello World"}}

// Decompress
const original = decompressCoon(compressed);
```

## Compression Strategies

COON provides six compression strategies for different use cases:

| Strategy | Compression | Best For |
|----------|-------------|----------|
| `auto` | 50-70% | Automatic optimal selection (default) |
| `basic` | 30-40% | Simple code, safety-first |
| `aggressive` | 60-70% | Maximum compression |
| `ast_based` | 50-65% | Complex nested structures |
| `component_ref` | 70-80% | Repeated patterns |
| `semantic` | 55-65% | Readability preservation |

### Using Strategies

::: code-group

```python [Python]
from coon import Compressor, CompressionStrategyType

compressor = Compressor()
result = compressor.compress(code, strategy=CompressionStrategyType.AGGRESSIVE)
```

```typescript [TypeScript]
import { Compressor, CompressionStrategyType } from '@coon-format';

const compressor = new Compressor();
const result = compressor.compress(code, CompressionStrategyType.AGGRESSIVE);
```

:::

## What's Next?

- **[Format Overview](/guide/format-overview)** - Learn the COON syntax in detail
- **[LLM Integration](/guide/llm-prompts)** - Best practices for using COON with LLMs
- **[API Reference](/reference/api)** - Complete API documentation
- **[CLI Reference](/cli/)** - Command-line tool usage
