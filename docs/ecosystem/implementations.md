# SDK Implementations

Official and community COON SDK implementations.

## Official SDKs

### Python SDK

Full-featured Python implementation with analysis tools.

| | |
|---|---|
| **Package** | `coon` |
| **Version** | 1.0.0 |
| **Python** | 3.8+ |
| **Status** | Stable |
| **Repository** | [packages/python](https://github.com/AffanShaikhsurab/COON/tree/master/packages/python) |

**Installation:**
```bash
pip install coon
```

**Features:**
- Complete compression/decompression
- All compression strategies
- Code analysis and metrics
- Syntax validation
- Round-trip testing

**Quick Start:**
```python
from coon import compress_dart, decompress_coon

compressed = compress_dart(dart_code)
restored = decompress_coon(compressed)
```

[Python SDK Documentation](/guide/getting-started#python)

---

### JavaScript/TypeScript SDK

Native TypeScript implementation for Node.js and browser.

| | |
|---|---|
| **Package** | `@coon-format` |
| **Version** | 1.0.0 |
| **Node.js** | 16+ |
| **Status** | Stable |
| **Repository** | [packages/javascript](https://github.com/AffanShaikhsurab/COON/tree/master/packages/javascript) |

**Installation:**
```bash
npm install @coon-format
```

**Features:**
- Full TypeScript types
- Tree-shakeable exports
- Browser compatible
- All compression strategies
- Streaming support

**Quick Start:**
```typescript
import { compressDart, decompressCoon } from '@coon-format';

const compressed = compressDart(dartCode);
const restored = decompressCoon(compressed);
```

[JavaScript SDK Documentation](/guide/getting-started#javascript--typescript)

---

### CLI

Cross-platform command-line interface.

| | |
|---|---|
| **Package** | `@coon/cli` |
| **Version** | 1.0.0 |
| **Node.js** | 16+ |
| **Status** | Stable |
| **Repository** | [packages/cli](https://github.com/AffanShaikhsurab/COON/tree/master/packages/cli) |

**Installation:**
```bash
npm install -g @coon/cli
```

**Features:**
- Compress/decompress commands
- Directory processing
- Analysis and statistics
- Multiple output formats
- CI/CD integration

**Quick Start:**
```bash
coon compress app.dart -o app.coon
coon decompress app.coon -o app.dart
```

[CLI Documentation](/cli/)

---

## SDK Comparison

| Feature | Python | JavaScript | CLI |
|---------|--------|------------|-----|
| Compression | Yes | Yes | Yes |
| Decompression | Yes | Yes | Yes |
| All Strategies | Yes | Yes | Yes |
| Analysis | Yes | Partial | Yes |
| Metrics | Yes | Yes | Yes |
| Validation | Yes | Yes | Yes |
| Streaming | No | Yes | No |
| Browser | No | Yes | No |
| Batch Processing | Yes | Yes | Yes |

---

## Community Implementations

::: tip Contribute
Want to add your implementation? Submit a PR to the [COON repository](https://github.com/AffanShaikhsurab/COON).
:::

### Planned SDKs

The following SDK implementations are planned:

| Language | Status | ETA |
|----------|--------|-----|
| Go | Planned | Q2 2025 |
| Rust | Planned | Q2 2025 |
| Ruby | Planned | Q3 2025 |
| Java/Kotlin | Planned | Q3 2025 |

---

## Implementation Guidelines

### Conformance Requirements

All implementations MUST:

1. **Support Core Abbreviations**
   - Widget abbreviations (spec section 3)
   - Property abbreviations (spec section 4)
   - Keyword abbreviations (spec section 5)

2. **Guarantee Round-Trip**
   ```
   decompress(compress(code)) ≡ normalize(code)
   ```

3. **Pass Conformance Tests**
   - Basic compression tests
   - Widget abbreviation tests
   - Class definition tests
   - Edge case tests
   - Round-trip validation tests

### Conformance Test Suite

The official conformance test suite is located at:
```
spec/fixtures/conformance/
├── basic_compression.json
├── class_definitions.json
├── edge_cases.json
├── round_trip.json
└── widget_abbreviations.json
```

Run conformance tests:
```bash
# Python
pytest tests/test_conformance.py

# JavaScript
npm test -- conformance
```

### API Design Guidelines

Implementations SHOULD follow these API patterns:

**Primary Functions:**
```python
# Compression
compress_dart(code: str, strategy: str = "auto") -> str

# Decompression
decompress_coon(compressed: str) -> str
```

**Class-Based API:**
```python
class Compressor:
    def __init__(self, config: CompressorConfig = None)
    def compress(self, code: str) -> CompressionResult

class Decompressor:
    def __init__(self, config: DecompressorConfig = None)
    def decompress(self, compressed: str) -> DecompressionResult
```

### Error Handling

Implementations SHOULD provide specific error types:

| Error Type | Description |
|------------|-------------|
| `SyntaxError` | Invalid input syntax |
| `CompressionError` | Compression failed |
| `DecompressionError` | Decompression failed |
| `ValidationError` | Validation failed |

---

## Building a New SDK

### Step 1: Study the Specification

Read the [COON Specification](/reference/spec) thoroughly.

### Step 2: Implement Core Components

1. **Lexer**: Tokenize input
2. **Parser**: Build AST
3. **Compressor**: Apply abbreviations
4. **Decompressor**: Expand abbreviations
5. **Validator**: Verify round-trip

### Step 3: Add Abbreviation Data

Load from spec data files:
```
spec/data/
├── keywords.json
├── properties.json
└── widgets.json
```

### Step 4: Pass Conformance Tests

Run against the official test suite.

### Step 5: Document and Publish

- Write README with examples
- Add API documentation
- Publish to package registry
- Submit PR to COON repository

---

## Resources

- [COON Specification](/reference/spec)
- [API Reference](/reference/api)
- [Syntax Cheatsheet](/reference/syntax-cheatsheet)
- [GitHub Repository](https://github.com/AffanShaikhsurab/COON)
- [Contributing Guide](https://github.com/AffanShaikhsurab/COON/blob/master/CONTRIBUTING.md)
