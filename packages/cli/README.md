# COON CLI

[![npm version](https://img.shields.io/npm/v/@coon/cli.svg?labelColor=1b1b1f&color=60a5fa)](https://www.npmjs.com/package/@coon/cli)
[![Node Version](https://img.shields.io/badge/node-18%2B-60a5fa?labelColor=1b1b1f)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/license-MIT-60a5fa?labelColor=1b1b1f)](../../LICENSE)

Language-agnostic command-line interface for COON compression.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Commands](#commands)
- [Options](#options)
- [Backends](#backends)
- [Examples](#examples)
- [Supported Languages](#supported-languages)
- [License](#license)

## Installation

### Global Installation

```bash
npm install -g @coon/cli
```

### Using npx (No Installation)

```bash
npx @coon/cli compress app.dart -o app.coon
```

## Quick Start

```bash
# Compress a Dart file
coon compress app.dart -o app.coon

# Decompress back to Dart
coon decompress app.coon -o app.dart

# Analyze compression opportunities
coon analyze app.dart

# Compare all strategies
coon stats app.dart
```

## Commands

### compress

Compress source code to COON format.

```bash
coon compress <input> [options]

# Examples
coon compress app.dart -o app.coon
coon compress app.dart -s aggressive -o app.coon
coon compress app.dart                              # Output to stdout
cat app.dart | coon compress                        # Read from stdin
```

**Options:**
| Option | Description |
|--------|-------------|
| `-o, --output <file>` | Output file path |
| `-s, --strategy <name>` | Compression strategy |
| `--backend <backend>` | Backend to use (js/python) |

### decompress

Decompress COON format back to source code.

```bash
coon decompress <input> [options]

# Examples
coon decompress app.coon -o app.dart
coon decompress app.coon                            # Output to stdout
```

**Options:**
| Option | Description |
|--------|-------------|
| `-o, --output <file>` | Output file path |
| `--backend <backend>` | Backend to use (js/python) |

### analyze

Analyze code for compression opportunities.

```bash
coon analyze <input>

# Example
coon analyze app.dart
```

**Output includes:**
- Widget count and types
- Compression opportunities
- Recommended strategy
- Estimated reduction

### stats

Compare all compression strategies for a file.

```bash
coon stats <input>

# Example
coon stats app.dart
```

**Output includes:**
- Token counts for each strategy
- Compression percentages
- Processing time
- Recommended strategy

### validate

Validate round-trip compression integrity.

```bash
coon validate <input> [options]

# Examples
coon validate app.dart
coon validate app.dart --strict
```

**Options:**
| Option | Description |
|--------|-------------|
| `--strict` | Enable strict validation mode |

### info

Show CLI information and supported features.

```bash
coon info
```

**Output includes:**
- Available backends
- Supported languages
- Compression strategies

## Options

### Global Options

| Option | Description | Default |
|--------|-------------|---------|
| `--backend <backend>` | Backend to use: `js` or `python` | `js` |
| `-l, --language <lang>` | Source language | auto-detect |
| `-h, --help` | Show help | - |
| `-V, --version` | Show version | - |

### Compression Strategies

| Strategy | Description | Compression |
|----------|-------------|-------------|
| `auto` | Automatic optimal selection | 50-70% |
| `basic` | Simple abbreviations | 30-40% |
| `aggressive` | Maximum compression | 60-70% |
| `ast_based` | Syntax tree analysis | 50-65% |
| `component_ref` | Pattern-based references | 70-80% |

## Backends

The CLI supports multiple backends for flexibility.

### JavaScript Backend (Default)

Uses the `@coon-format` npm package. Fast and runs natively in Node.js.

```bash
coon compress app.dart --backend js
```

### Python Backend

Uses the `coon` Python package via subprocess. Useful when Python-specific features are needed.

```bash
coon compress app.dart --backend python
```

**Requirements:**
- Python 3.8+
- `coon` package installed (`pip install coon`)

## Examples

### Basic Workflow

```bash
# Compress with default settings
coon compress src/main.dart -o build/main.coon

# Decompress when needed
coon decompress build/main.coon -o src/restored.dart
```

### Maximum Compression

```bash
# Use aggressive strategy for smallest output
coon compress app.dart -s aggressive -o app.coon
```

### Pipeline Integration

```bash
# Compress all Dart files in a directory
for file in src/*.dart; do
    coon compress "$file" -o "build/$(basename "$file" .dart).coon"
done
```

### Validation Workflow

```bash
# Validate before production use
coon validate app.dart --strict && echo "Valid"
```

### Analysis Before Compression

```bash
# Check compression potential first
coon analyze app.dart

# Then compress with recommended strategy
coon stats app.dart
```

## Supported Languages

| Language | Extension | Status |
|----------|-----------|--------|
| Dart/Flutter | `.dart` | Stable |
| Python | `.py` | Planned |
| TypeScript | `.ts` | Planned |
| Kotlin | `.kt` | Planned |
| Swift | `.swift` | Planned |

## Exit Codes

| Code | Description |
|------|-------------|
| 0 | Success |
| 1 | General error |
| 2 | Invalid input |
| 3 | Validation failed |

## License

MIT - See [LICENSE](../../LICENSE) for details.
