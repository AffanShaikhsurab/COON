# CLI Reference

Command-line interface for COON compression operations.

## Installation

```bash
# npm
npm install -g @coon/cli

# pnpm
pnpm add -g @coon/cli

# yarn
yarn global add @coon/cli
```

## Commands

### compress

Compress Dart code to COON format.

```bash
coon compress <input> [options]
```

**Arguments:**
| Argument | Description |
|----------|-------------|
| `input` | Input file path or `-` for stdin |

**Options:**
| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--output` | `-o` | Output file path | stdout |
| `--strategy` | `-s` | Compression strategy | `auto` |
| `--language` | `-l` | Source language (auto-detected) | auto |
| `--validate` | | Validate compression result | `false` |
| `--analyze` | | Include code analysis | `false` |
| `--backend` | | Backend to use: js, python | `js` |

**Strategies:**
- `auto` - Automatically select best strategy
- `basic` - Simple abbreviation replacement
- `aggressive` - Maximum compression
- `ast_based` - AST-aware optimization
- `component_ref` - Component reference deduplication
- `semantic` - Semantic analysis

**Examples:**

```bash
# Compress file to stdout
coon compress app.dart

# Compress with output file
coon compress app.dart -o app.coon

# Use specific strategy
coon compress app.dart -s aggressive -o app.coon

# Show metrics
coon compress app.dart -m

# Validate compression
coon compress app.dart -v

# Read from stdin
cat app.dart | coon compress -
```

**Output with metrics:**
```
Compressing app.dart...

Strategy: aggressive
Original tokens: 1,245
Compressed tokens: 432
Tokens saved: 813 (65.3%)

Output written to: app.coon
```

---

### decompress

Decompress COON format back to Dart code.

```bash
coon decompress <input> [options]
```

**Arguments:**
| Argument | Description |
|----------|-------------|
| `input` | Input file path or `-` for stdin |

**Options:**
| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--output` | `-o` | Output file path | stdout |
| `--language` | `-l` | Target language | `dart` |
| `--format` | | Format output code | `true` |
| `--backend` | | Backend to use: js, python | `js` |

**Examples:**

```bash
# Decompress to stdout
coon decompress app.coon

# Decompress with output file
coon decompress app.coon -o app.dart

# Custom indentation
coon decompress app.coon -i 4 -o app.dart

# No formatting
coon decompress app.coon --no-format

# Read from stdin
cat app.coon | coon decompress -
```

---

### validate

Validate COON syntax and round-trip accuracy.

```bash
coon validate <input> [options]
```

**Arguments:**
| Argument | Description |
|----------|-------------|
| `input` | Input file path (COON or Dart) |

**Options:**
| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--strict` | | Use strict validation mode | `false` |
| `--language` | `-l` | Source language (auto-detected) | auto |
| `--backend` | | Backend to use: js, python | `js` |

**Examples:**

```bash
# Validate COON syntax
coon validate app.coon

# Validate Dart round-trip
coon validate app.dart -t dart

# Verbose validation
coon validate app.coon -v
```

**Output:**
```
Validating app.coon...

✓ Syntax valid
✓ Structure valid
✓ Round-trip successful

Validation passed.
```

---

### analyze

Analyze code for compression opportunities.

```bash
coon analyze <input> [options]
```

**Arguments:**
| Argument | Description |
|----------|-------------|
| `input` | Input Dart file path |

**Options:**
| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--output` | `-o` | Output format: `text`, `json` | `text` |
| `--strategy` | `-s` | Test specific strategy | all |

**Examples:**

```bash
# Analyze file
coon analyze app.dart

# JSON output
coon analyze app.dart -o json

# Test specific strategy
coon analyze app.dart -s aggressive
```

**Output:**
```
Analyzing app.dart...

Code Analysis:
  Widgets found: 23
  Classes: 4
  Methods: 12
  Properties: 67
  
Compression Estimates:
  BASIC:         48.2% reduction
  AGGRESSIVE:    62.5% reduction
  AST_BASED:     67.8% reduction
  COMPONENT_REF: 71.2% reduction

Recommended strategy: ast_based

Identified optimizations:
  • 5 duplicate widget patterns
  • 3 repeated color references
  • 2 reusable component structures
```

---

### stats

Show compression statistics for files or directories.

```bash
coon stats <input> [options]
```

**Arguments:**
| Argument | Description |
|----------|-------------|
| `input` | File or directory path |

**Options:**
| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--recursive` | `-r` | Process directories recursively | `false` |
| `--pattern` | `-p` | File pattern to match | `*.dart` |
| `--output` | `-o` | Output format: `text`, `json`, `csv` | `text` |

**Examples:**

```bash
# Stats for single file
coon stats app.dart

# Stats for directory
coon stats lib/ -r

# Custom pattern
coon stats lib/ -r -p "**/*.dart"

# JSON output
coon stats lib/ -r -o json
```

**Output:**
```
Statistics for lib/

Files analyzed: 24
Total lines: 3,456

Token Analysis:
  Original tokens:   45,678
  Compressed tokens: 15,983
  Total savings:     29,695 (65.0%)

By Strategy:
  Strategy       | Tokens | Savings
  ---------------|--------|--------
  BASIC          | 24,567 | 46.2%
  AGGRESSIVE     | 18,234 | 60.1%
  AST_BASED      | 15,983 | 65.0%
  COMPONENT_REF  | 14,567 | 68.1%

Top compression candidates:
  1. screens/home.dart     - 72.3% potential
  2. widgets/card.dart     - 69.8% potential
  3. pages/settings.dart   - 68.4% potential
```

---

### info

Display information about COON format and version.

```bash
coon info [options]
```

**Options:**
| Option | Alias | Description |
|--------|-------|-------------|
| `--version` | `-V` | Show version only |
| `--formats` | `-f` | List supported formats |
| `--strategies` | `-s` | List available strategies |

**Examples:**

```bash
# Full info
coon info

# Version only
coon info -V

# List strategies
coon info -s
```

**Output:**
```
COON CLI v1.0.0

Format: COON (Code-Oriented Object Notation)
Specification: 1.0.0
License: MIT

Supported Languages:
  • Dart/Flutter

Compression Strategies:
  • auto         - Automatic strategy selection
  • basic        - Simple abbreviation replacement
  • aggressive   - Maximum compression
  • ast_based    - AST-aware optimization
  • component_ref - Component reference deduplication
  • semantic     - Semantic analysis

Documentation: https://coon.dev
Repository: https://github.com/AffanShaikhsurab/COON
```

---

## Configuration

### Config File

Create `.coonrc` or `.coonrc.json` in your project root:

```json
{
  "defaultStrategy": "ast_based",
  "validate": true,
  "metrics": true,
  "output": {
    "format": true,
    "indent": 2
  },
  "exclude": [
    "**/*.g.dart",
    "**/*.freezed.dart"
  ]
}
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `COON_STRATEGY` | Default compression strategy | `auto` |
| `COON_VALIDATE` | Enable validation by default | `false` |
| `COON_METRICS` | Show metrics by default | `false` |

---

## Exit Codes

| Code | Description |
|------|-------------|
| `0` | Success |
| `1` | General error |
| `2` | Invalid arguments |
| `3` | File not found |
| `4` | Syntax error |
| `5` | Validation failed |

---

## Programmatic Usage

The CLI can be used programmatically in Node.js:

```typescript
import { compress, decompress, analyze } from '@coon/cli';

// Compress
const result = await compress('app.dart', {
  strategy: 'aggressive',
  metrics: true
});

console.log(result.compressed);
console.log(`Saved: ${result.percentageSaved}%`);

// Decompress
const dart = await decompress('app.coon', {
  format: true,
  indent: 2
});

// Analyze
const analysis = await analyze('app.dart');
console.log(`Recommended: ${analysis.recommendedStrategy}`);
```

---

## Integration Examples

### npm Scripts

```json
{
  "scripts": {
    "coon:compress": "coon compress lib/ -r -o dist/",
    "coon:validate": "coon validate lib/ -r",
    "coon:stats": "coon stats lib/ -r"
  }
}
```

### Git Hooks

Using husky:

```bash
# .husky/pre-commit
coon validate lib/ -r
```

### CI/CD

GitHub Actions:

```yaml
- name: Validate COON compression
  run: |
    npm install -g @coon/cli
    coon validate lib/ -r
```

---

## Troubleshooting

### Common Issues

**"Syntax error in COON file"**
```bash
coon validate file.coon -v
```

**"Round-trip validation failed"**
```bash
coon compress file.dart -v --debug
```

**"Unknown widget abbreviation"**
- Check for typos in abbreviation
- Verify widget is supported (see [Syntax Cheatsheet](/reference/syntax-cheatsheet))

### Debug Mode

```bash
DEBUG=coon* coon compress app.dart
```

### Getting Help

```bash
coon --help
coon <command> --help
```
