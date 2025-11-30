# COON API Reference

## Installation

```bash
pip install coon-compress
```

Or install from source:

```bash
git clone https://github.com/yourusername/COON.git
cd COON
pip install -e .
```

---

## Core API

### compress_dart()

Compress Dart code to COON format.

```python
def compress_dart(dart_code: str, strategy: str = "auto") -> str
```

**Parameters:**
- `dart_code` (str): Original Dart source code
- `strategy` (str): Compression strategy. Options: `"auto"`, `"basic"`, `"aggressive"`, `"template_ref"`, `"component_ref"`, `"ast_based"`, `"hybrid"`. Default: `"auto"`

**Returns:**
- str: Compressed COON code

**Example:**
```python
from coon import compress_dart

code = """
class MyWidget extends StatelessWidget {
  Widget build(BuildContext context) {
    return Text("Hello");
  }
}
"""

compressed = compress_dart(code, strategy="aggressive")
print(compressed)
# Output: c:MyWidget<StatelessWidget>;m:b T"Hello"
```

---

### decompress_coon()

Decompress COON format back to Dart.

```python
def decompress_coon(coon_code: str) -> str
```

**Parameters:**
- `coon_code` (str): Compressed COON code

**Returns:**
- str: Decompressed Dart code

**Example:**
```python
from coon import decompress_coon

compressed = 'c:MyWidget<StatelessWidget>;m:b T"Hello"'
original = decompress_coon(compressed)
print(original)
```

---

## Compressor Class

### Compressor

Main compression engine with advanced features.

```python
class Compressor:
    def __init__(
        self,
        component_registry: Optional[str] = None,
        template_library: Optional[TemplateLibrary] = None,
        enable_metrics: bool = False,
        metrics_storage: Optional[str] = None
    )
```

**Parameters:**
- `component_registry` (str, optional): Path to component registry JSON file
- `template_library` (TemplateLibrary, optional): Pre-initialized template library
- `enable_metrics` (bool): Enable metrics collection. Default: False
- `metrics_storage` (str, optional): Path to metrics storage file

**Example:**
```python
from coon import Compressor

compressor = Compressor(
    component_registry="components.json",
    enable_metrics=True,
    metrics_storage="metrics.json"
)

result = compressor.compress(code, strategy="hybrid", analyze_code=True)
print(f"Saved {result.token_savings} tokens ({result.percentage_saved:.1f}%)")
```

---

### Compressor.compress()

Compress code with detailed options.

```python
def compress(
    self,
    dart_code: str,
    strategy: str = "auto",
    analyze_code: bool = True,
    validate: bool = False
) -> CompressionResult
```

**Parameters:**
- `dart_code` (str): Code to compress
- `strategy` (str): Compression strategy
- `analyze_code` (bool): Perform code analysis for strategy selection. Default: True
- `validate` (bool): Validate compression reversibility. Default: False

**Returns:**
- CompressionResult: Detailed result object

**Example:**
```python
result = compressor.compress(
    code,
    strategy="auto",
    analyze_code=True,
    validate=True
)

print(f"Original tokens: {result.original_tokens}")
print(f"Compressed tokens: {result.compressed_tokens}")
print(f"Compression ratio: {result.compression_ratio:.2f}")
print(f"Processing time: {result.processing_time_ms:.2f}ms")
```

---

### Compressor.decompress()

Decompress with formatting options.

```python
def decompress(self, coon_code: str, format_output: bool = True) -> str
```

**Parameters:**
- `coon_code` (str): Compressed code
- `format_output` (bool): Format decompressed code. Default: True

**Returns:**
- str: Decompressed code

---

## CompressionResult

Result object returned by `Compressor.compress()`.

**Attributes:**
- `compressed_code` (str): The compressed COON code
- `original_tokens` (int): Token count of original code
- `compressed_tokens` (int): Token count of compressed code
- `compression_ratio` (float): Compression ratio (0.0-1.0)
- `strategy_used` (CompressionStrategy): Strategy that was used
- `processing_time_ms` (float): Processing time in milliseconds
- `analysis_insights` (dict, optional): Code analysis results

**Properties:**
- `token_savings` (int): Tokens saved (original - compressed)
- `percentage_saved` (float): Percentage saved

---

## Code Analysis

### CodeAnalyzer

Analyzes code for compression optimization.

```python
from coon import CodeAnalyzer

analyzer = CodeAnalyzer()
analysis = analyzer.analyze(dart_code)

print(f"Complexity: {analysis.complexity_score:.2f}")
print(f"Widget count: {sum(analysis.widget_frequency.values())}")
print(f"Recommended strategy: {analyzer.recommend_strategy(analysis)}")

# Print detailed report
print(analyzer.generate_report(analysis))
```

**Key Methods:**
- `analyze(code: str) -> AnalysisResult`: Analyze code
- `recommend_strategy(analysis: AnalysisResult) -> str`: Get recommended strategy
- `generate_report(analysis: AnalysisResult) -> str`: Generate human-readable report

---

## Template Library

### TemplateLibrary

Manages screen templates for ultra-compression.

```python
from coon import TemplateLibrary

library = TemplateLibrary()

# Find matching templates
matches = library.find_matching_templates(code, threshold=0.75)
if matches:
    template, similarity = matches[0]
    print(f"Matched template: {template.name} ({similarity:.1%} similar)")
    compressed = template.compress(code)
```

**Key Methods:**
- `add_template(template: Template)`: Add custom template
- `find_matching_templates(code: str, threshold: float) -> List`: Find matches
- `export_to_json(filepath: str)`: Export templates
- `import_from_json(filepath: str)`: Import templates

---

## Component Registry

### ComponentRegistry

Manages custom components.

```python
from coon import ComponentRegistry, create_default_registry

# Create with default components
registry = create_default_registry()

# Or load from file
registry = ComponentRegistry("my_components.json")

# Register new component
registry.register_component(
    id="custom_button",
    name="Custom Button",
    code="""ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        minimumSize: Size(double.infinity, 50),
      ),
      child: Text(label),
    )""",
    parameters=["onPressed", "label"],
    category="buttons",
    tags=["button", "custom"]
)

# Save registry
registry.save_to_file("my_components.json")
```

---

## Metrics Collection

### MetricsCollector

Tracks compression metrics.

```python
from coon import MetricsCollector

metrics = MetricsCollector(storage_path="metrics.json")

# Metrics are automatically recorded if enable_metrics=True in Compressor

# Get summary
summary = metrics.get_summary()
print(f"Total compressions: {summary['total_compressions']}")
print(f"Average tokens saved: {summary['avg_tokens_saved']}")

# Get cost savings (GPT-4 pricing)
savings = metrics.get_cost_savings()
print(f"Total cost saved: ${savings['total_cost_saved_usd']:.4f}")

# Generate report
print(metrics.generate_report())
```

---

## Validation

### CompressionValidator

Validates compression operations.

```python
from coon import CompressionValidator

validator = CompressionValidator(strict_mode=False)

result = validator.validate_compression(
    original_code,
    compressed_code,
    decompressed_code
)

print(f"Valid: {result.is_valid}")
print(f"Reversible: {result.reversible}")
print(f"Similarity: {result.similarity_score:.2%}")

if result.errors:
    print("Errors:", result.errors)
```

---

## Formatter

### DartFormatter

Formats decompressed code.

```python
from coon import DartFormatter

formatter = DartFormatter(indent_spaces=2, max_line_length=80)
formatted_code = formatter.format(decompressed_code)
```

---

## Complete Example

```python
from coon import Compressor, CodeAnalyzer

# Initialize
compressor = Compressor(
    component_registry="components.json",
    enable_metrics=True,
    metrics_storage="metrics.json"
)

analyzer = CodeAnalyzer()

# Analyze code
dart_code = """
class LoginScreen extends StatelessWidget {
  // ... login screen code ...
}
"""

analysis = analyzer.analyze(dart_code)
print(analyzer.generate_report(analysis))

# Compress with recommended strategy
result = compressor.compress(
    dart_code,
    strategy="auto",
    analyze_code=True,
    validate=True
)

print(f"\n📦 Compression Results:")
print(f"Strategy: {result.strategy_used.value}")
print(f"Tokens saved: {result.token_savings} ({result.percentage_saved:.1f}%)")
print(f"Processing time: {result.processing_time_ms:.2f}ms")

# Decompress
decompressed = compressor.decompress(result.compressed_code)

# View metrics
if compressor.metrics:
    print("\n" + compressor.metrics.generate_report())
```

---

## Type Hints

All functions and classes include complete type hints:

```python
from coon import (
    Compressor,
    CompressionResult,
    CompressionStrategy,
    AnalysisResult
)
from typing import Optional, List, Dict

compressor: Compressor = Compressor()
result: CompressionResult = compressor.compress(code)
strategy: CompressionStrategy = CompressionStrategy.AGGRESSIVE
```

---

## Error Handling

```python
try:
    result = compressor.compress(code, strategy="invalid_strategy")
except KeyError:
    # Invalid strategy falls back to BASIC
    pass

try:
    registry = ComponentRegistry("nonexistent.json")
except FileNotFoundError:
    # Handle missing file
    pass
```

---

## See Also

- [Specification](SPECIFICATION.md)
- [CLI Guide](CLI.md)
- [Examples](../examples/)
