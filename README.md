# COON: Code-Oriented Object Notation

**Token-efficient code compression format for Dart/Flutter and LLM contexts**

[![Python Version](https://img.shields.io/badge/python-3.8%2B-blue)](https://www.python.org/downloads/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![PyPI version](https://badge.fury.io/py/coon-compress.svg)](https://pypi.org/project/coon-compress/)

---

## Key Benefits

COON delivers immediate value for LLM-based development workflows:

*   **📉 ~30-34% Token Reduction**: Significantly reduces context window usage, allowing for larger codebases in prompts.
*   **💰 Cost Efficiency**: Direct reduction in API costs. Benchmarks show **33% savings** on real-world applications.
*   **⚡ Faster Inference**: Compressed prompts lead to faster generation. Tests show **~2x lower latency** with models like GLM-4.6.
*   **🧠 High Comprehension**: Modern LLMs maintain high understanding of COON format (e.g., GLM-4.6 achieves **62.5% accuracy**, matching Dart baseline).

---

## Overview

COON is a compression format designed to reduce token count in Dart/Flutter code by 30-70% while maintaining semantic meaning and reversibility. It addresses the token inefficiency problem in code transmission and storage for LLM-based applications.

Inspired by [TOON (Token-Oriented Object Notation)](https://github.com/toon-format/toon), COON applies similar compression principles to source code.

### Problem

When working with Large Language Models in code generation:
- Raw code contains excessive whitespace and boilerplate
- Multi-agent systems transfer large amounts of code between agents
- Context windows fill quickly with uncompressed code
- API costs scale with token count

### Solution

COON compresses code through:
- Keyword abbreviation
- Widget name shortening
- Property name compression
- Whitespace optimization
- Structure simplification

**Example:**

Before (150 tokens):
```dart
class LoginScreen extends StatelessWidget {
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Login"),
      ),
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(24.0),
          child: Column(
            children: [
              Text("Welcome Back"),
              Text("Login to continue"),
            ],
          ),
        ),
      ),
    );
  }
}
```

After (45 tokens, 70% reduction):
```
c:LoginScreen<StatelessWidget>;f:emailController=X,passwordController=X;m:b S{a:B{t:T"Login"},b:A{c:P{p:@24,c:C{h:[T"Welcome Back",T"Login to continue"]}}}}
```

---

## Installation

```bash
pip install coon
```

Or install from source:
```bash
git clone https://github.com/AffanShaikhsurab/COON.git
cd COON
pip install -e .
```

---

## Usage

### Python API

```python
from coon import compress_dart, decompress_coon

# Compress code
dart_code = """
class MyWidget extends StatelessWidget {
  Widget build(BuildContext context) {
    return Text("Hello");
  }
}
"""

compressed = compress_dart(dart_code)
print(compressed)
# Output: c:MyWidget<StatelessWidget>;m:b T"Hello"

# Decompress
original = decompress_coon(compressed)
```

### Advanced Usage

```python
from coon import Compressor

# Initialize with options
compressor = Compressor(
    component_registry="components.json",
    enable_metrics=True
)

# Compress with analysis
result = compressor.compress(
    dart_code,
    strategy="auto",
    analyze_code=True,
    validate=True
)

print(f"Tokens saved: {result.token_savings}")
print(f"Reduction: {result.percentage_saved:.1f}%")
```

### Command Line

```bash
# Compress a file
coon compress input.dart -o output.coon

# Decompress
coon decompress output.coon -o generated.dart

# Show statistics
coon stats input.dart
```

---

## Compression Methods

### Keyword Abbreviation
- `class` → `c:`
- `final` → `f:`
- `return` → `ret`
- `override` → removed

### Widget Abbreviation
- `Scaffold` → `S`
- `Column` → `C`
- `SafeArea` → `A`
- `Padding` → `P`
- `Text` → `T`

### Property Abbreviation
- `appBar:` → `a:`
- `body:` → `b:`
- `children:` → `h:`
- `padding:` → `p:`

### Special Notation
- `EdgeInsets.all(24)` → `@24`
- `Type()` → `~Type`
- `true`/`false` → `1`/`0`

---

## Compression Strategies

COON provides 6 compression strategies:

1. **AUTO** - Automatic strategy selection based on code analysis
2. **BASIC** - Simple abbreviations (40-50% reduction)
3. **AGGRESSIVE** - Maximum compression (60-70% reduction)
4. **COMPONENT_REF** - Uses component registry for reusable widgets
5. **AST_BASED** - Abstract syntax tree analysis
6. **SEMANTIC** - Preserves semantic meaning with optimization

---

## Performance Benchmarks

> **Comprehensive analysis of COON's token efficiency and LLM comprehension accuracy**
>
> **Benchmark Date**: December 5, 2025
> **Full Report**: [benchmarks/results/COON-Benchmark-Summary.md](benchmarks/results/COON-Benchmark-Summary.md)

### Key Findings

| Metric | Value |
|--------|-------|
| **Token Reduction** | **~30-34%** (33% on E-Commerce App) |
| **Accuracy (Dart Baseline)** | 54.2% |
| **Accuracy (COON + Context)** | **54.2%** (Same as Dart Baseline) |
| **Best Model** | GLM-4.6 (62.5% accuracy) |

### Detailed Analysis

#### Accuracy: COON + Context Matches Dart Baseline
Our benchmarks show that with the proper context primer, **COON achieves the same accuracy as the Dart baseline (54.2%)** across tested models.
- **GLM-4.6** is the top performer, achieving **62.5% accuracy** on both Dart and COON + Context formats.
- Boolean questions (e.g., "Does code contain Scaffold?") have a **100% success rate** across all formats.

#### Cost Efficiency: ~34% Cheaper
COON reduces token count by approximately **30-34%** for real-world applications.
- **E-Commerce App**: 33.1% reduction (1.49x compression ratio).
- **Social Media App**: 28.4% reduction (1.40x compression ratio).
- Projected savings: **$253 per 1 million requests** (based on typical API pricing).

#### Latency: 2x Faster
Compressed code leads to significantly faster response times.
- **GLM-4.6** processes COON prompts **2x faster** than Dart baseline (2,092 ms vs 4,674 ms).

### Trade-offs

While COON offers significant benefits, there are trade-offs to consider:
- **Counting Tasks**: Models struggle with exact widget counts in both Dart and COON formats.
- **Deep Nesting**: Deeply nested hierarchies can be harder for models to parse without context.
- **Root Widget Identification**: Models may return the class name instead of the widget type for root widgets.
- **Debugging**: Compressed output is less human-readable, requiring decompression for manual review.

### Why Choose COON?

**COON + Context with GLM-4.6** is the recommended configuration, offering:
1.  **Same Accuracy** as raw Dart code.
2.  **~34% Lower Costs** due to token reduction.
3.  **2x Faster** inference speeds.

For large-scale applications or high-volume API usage, COON provides a clear efficiency advantage without compromising LLM comprehension.

---

## Use Cases

### Multi-Agent Code Generation

Pass compressed code between agents to reduce context usage:

```python
# Agent 1 generates screen
screen_code = generate_screen("LoginScreen")
compressed = compress_dart(screen_code)

# Agent 2 receives compressed version
context_manager.store("LoginScreen", compressed)
```

### LLM Context Optimization

Fit more code examples in prompts:

```python
prompt = f"""
Example screens in COON format:
{compress_dart(screen1)}
{compress_dart(screen2)}

Generate similar screen for: {user_request}
"""
```

### Code Storage

Store code artifacts efficiently:

```python
db.save("artifact", compress_dart(code), {"format": "coon"})
```

---

## API Reference

### Core Functions

**compress_dart(code, strategy="auto")**
- Compresses Dart code
- Returns compressed string

**decompress_coon(compressed_code)**
- Decompresses COON format
- Returns original Dart code

### Compressor Class

**Compressor(component_registry=None, enable_metrics=False)**
- Advanced compression with options
- Supports metrics collection and validation

### Analysis Tools

**CodeAnalyzer.analyze(code)**
- Analyzes code for compression opportunities
- Returns analysis results

**MetricsCollector**
- Tracks compression performance
- Generates reports and statistics

Full API documentation: [docs/API.md](docs/API.md)

---

## Advanced Features

### Component Registry

Register reusable components:

```python
from coon import ComponentRegistry

registry = ComponentRegistry()
registry.register_component(
    id="email_input",
    code=email_field_code,
    parameters=["controller", "label"]
)
```

### Metrics Collection

Track compression performance:

```python
compressor = Compressor(enable_metrics=True)
# ... perform compressions ...

print(compressor.metrics.generate_report())
```

### Validation

Verify compression reversibility:

```python
from coon import CompressionValidator

validator = CompressionValidator()
result = validator.validate_compression(
    original_code,
    compressed_code,
    decompressed_code
)
```

---

## Architecture

```
COON/
├── coon/
│   ├── __init__.py       # Package entry point
│   ├── compressor.py     # Core compression engine
│   ├── strategy.py       # Compression strategies
│   ├── parser.py         # Dart code parser
│   ├── analyzer.py       # Code analysis
│   ├── registry.py       # Component registry
│   ├── metrics.py        # Performance metrics
│   ├── formatter.py      # Code formatting
│   ├── validator.py      # Validation tools
│   └── cli.py            # Command-line interface
├── docs/                 # Documentation
├── tests/                # Test suite
├── benchmarks/           # Performance benchmarks
└── examples/             # Usage examples
```

---

## Requirements

- Python 3.9 or higher
- click >= 8.0.0 (for CLI)

---

## Development

### Setup Development Environment

```bash
git clone https://github.com/AffanShaikhsurab/COON.git
cd COON
pip install -e ".[dev]"
```

### Run Tests

```bash
pytest tests/
```

### Run Benchmarks

```bash
cd benchmarks
npm install
npx tsx --env-file=.env scripts/compression-efficiency-benchmark.ts
```

---

## Limitations

- Designed for Dart/Flutter code (other languages not supported)
- Comments are removed during compression
- Code formatting is not preserved (can be restored with formatter)
- Requires valid Dart syntax

---

## Roadmap

- [ ] VS Code extension
- [ ] Multi-language support (Kotlin, Swift)
- [x] npm package for JavaScript/TypeScript ✓
- [ ] Web-based demo

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## Contact

- **Author**: Affan Shaikhsurab
- **Email**: affanshaikhsurabofficial@gmail.com
- **GitHub**: [@AffanShaikhsurab](https://github.com/AffanShaikhsurab)
- **Twitter**: [@AffanShaikhsurab](https://twitter.com/AffanShaiksurab)

---

## Acknowledgments

Inspired by [TOON](https://github.com/toon-format/toon) by Context7.

---

## Statistics

![GitHub stars](https://img.shields.io/github/stars/affanshaikhsurab/COON?style=social)
![GitHub forks](https://img.shields.io/github/forks/affanshaikhsurab/COON?style=social)
