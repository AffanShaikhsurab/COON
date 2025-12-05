# API Reference

Complete API documentation for COON SDKs.

## Python API

### Core Functions

#### `compress_dart()`

Compress Dart code to COON format.

```python
def compress_dart(
    code: str,
    strategy: str = "auto"
) -> str
```

**Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `code` | `str` | required | Dart source code to compress |
| `strategy` | `str` | `"auto"` | Compression strategy name |

**Returns:** Compressed COON string

**Example:**
```python
from coon import compress_dart

dart_code = """
class MyWidget extends StatelessWidget {
  Widget build(BuildContext context) {
    return Text("Hello");
  }
}
"""

compressed = compress_dart(dart_code)
# Output: c:MyWidget<StatelessWidget>;m:b T"Hello"

compressed = compress_dart(dart_code, strategy="aggressive")
```

---

#### `decompress_coon()`

Decompress COON format back to Dart code.

```python
def decompress_coon(
    compressed: str,
    format_output: bool = True,
    indent_size: int = 2
) -> str
```

**Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `compressed` | `str` | required | COON compressed string |
| `format_output` | `bool` | `True` | Apply formatting to output |
| `indent_size` | `int` | `2` | Indentation size in spaces |

**Returns:** Decompressed Dart code string

**Example:**
```python
from coon import decompress_coon

coon_code = 'c:MyWidget<StatelessWidget>;m:b T"Hello"'
dart_code = decompress_coon(coon_code)
```

---

### Compressor Class

Full-featured compression with configuration and metrics.

```python
class Compressor:
    def __init__(self, config: CompressionConfig = None)
    def compress(
        self,
        code: str,
        strategy: CompressionStrategyType = None
    ) -> CompressionResult
```

**Example:**
```python
from coon import Compressor, CompressionConfig, CompressionStrategyType

config = CompressionConfig(
    strategy="aggressive",
    enable_metrics=True,
    validate_output=True
)

compressor = Compressor(config)
result = compressor.compress(dart_code)

print(f"Original: {result.original_tokens} tokens")
print(f"Compressed: {result.compressed_tokens} tokens")
print(f"Saved: {result.percentage_saved:.1f}%")
```

---

### CompressionConfig

Configuration options for the Compressor.

```python
@dataclass
class CompressionConfig:
    strategy: str = "auto"
    enable_metrics: bool = True
    validate_output: bool = False
    preserve_comments: bool = False
```

**Fields:**
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `strategy` | `str` | `"auto"` | Default compression strategy |
| `enable_metrics` | `bool` | `True` | Calculate token metrics |
| `validate_output` | `bool` | `False` | Validate compression reversibility |
| `preserve_comments` | `bool` | `False` | Keep comments in output |

---

### CompressionResult

Result object from compression operations.

```python
@dataclass
class CompressionResult:
    compressed: str
    original_tokens: int
    compressed_tokens: int
    percentage_saved: float
    strategy_used: str
    is_valid: bool = True
    validation_errors: List[str] = None
```

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `compressed` | `str` | Compressed COON string |
| `original_tokens` | `int` | Token count of original code |
| `compressed_tokens` | `int` | Token count of compressed code |
| `percentage_saved` | `float` | Percentage of tokens saved |
| `strategy_used` | `str` | Strategy that was applied |
| `is_valid` | `bool` | Whether validation passed |
| `validation_errors` | `List[str]` | List of validation errors if any |

---

### CompressionStrategyType

Enum of available compression strategies.

```python
class CompressionStrategyType(Enum):
    AUTO = "auto"
    BASIC = "basic"
    AGGRESSIVE = "aggressive"
    AST_BASED = "ast_based"
    COMPONENT_REF = "component_ref"
    SEMANTIC = "semantic"
```

---

### Decompressor Class

Full-featured decompression with formatting options.

```python
class Decompressor:
    def __init__(self, config: DecompressionConfig = None)
    def decompress(self, compressed: str) -> DecompressionResult
```

**Example:**
```python
from coon import Decompressor, DecompressionConfig

config = DecompressionConfig(
    format_output=True,
    indent_size=2,
    add_trailing_commas=True
)

decompressor = Decompressor(config)
result = decompressor.decompress(coon_code)

print(result.code)
```

---

### CodeAnalyzer

Analyze code for compression opportunities.

```python
class CodeAnalyzer:
    def analyze(self, code: str) -> CodeAnalysis
    def generate_report(self, analysis: CodeAnalysis) -> str
```

**Example:**
```python
from coon import CodeAnalyzer

analyzer = CodeAnalyzer()
analysis = analyzer.analyze(dart_code)

print(f"Widgets found: {analysis.widget_count}")
print(f"Complexity score: {analysis.complexity}")
print(f"Recommended strategy: {analysis.recommended_strategy}")

report = analyzer.generate_report(analysis)
print(report)
```

---

### Validation Functions

#### `validate_round_trip()`

Validate that compression is lossless.

```python
def validate_round_trip(code: str, strategy: str = "auto") -> bool
```

**Example:**
```python
from coon import validate_round_trip

is_valid = validate_round_trip(dart_code)
print(f"Round-trip valid: {is_valid}")
```

#### `validate_syntax()`

Validate COON syntax without decompressing.

```python
def validate_syntax(coon_code: str) -> Tuple[bool, List[str]]
```

**Example:**
```python
from coon import validate_syntax

valid, errors = validate_syntax(coon_code)
if not valid:
    print(f"Syntax errors: {errors}")
```

---

## TypeScript API

### Core Functions

#### `compressDart()`

```typescript
function compressDart(
    code: string,
    strategy?: CompressionStrategyType
): string
```

**Example:**
```typescript
import { compressDart } from 'coon-format';

const compressed = compressDart(dartCode);
const aggressive = compressDart(dartCode, CompressionStrategyType.AGGRESSIVE);
```

---

#### `decompressCoon()`

```typescript
function decompressCoon(
    compressed: string,
    options?: DecompressOptions
): string
```

**Example:**
```typescript
import { decompressCoon } from 'coon-format';

const dartCode = decompressCoon(coonCode);
const formatted = decompressCoon(coonCode, { formatOutput: true });
```

---

### Compressor Class

```typescript
class Compressor {
    constructor(config?: CompressorConfig)
    compress(code: string, strategy?: CompressionStrategyType): CompressionResult
}
```

**Example:**
```typescript
import { Compressor, CompressionStrategyType } from 'coon-format';

const compressor = new Compressor({
    strategy: CompressionStrategyType.AUTO,
    enableMetrics: true
});

const result = compressor.compress(dartCode);
console.log(`Saved: ${result.percentageSaved}%`);
```

---

### Interfaces

#### CompressorConfig

```typescript
interface CompressorConfig {
    strategy?: CompressionStrategyType;
    enableMetrics?: boolean;
    validate?: boolean;
}
```

#### CompressionResult

```typescript
interface CompressionResult {
    compressed: string;
    originalTokens: number;
    compressedTokens: number;
    percentageSaved: number;
    strategyUsed: string;
}
```

#### DecompressOptions

```typescript
interface DecompressOptions {
    formatOutput?: boolean;
    indentSize?: number;
}
```

---

### CompressionStrategyType

```typescript
enum CompressionStrategyType {
    AUTO = 'auto',
    BASIC = 'basic',
    AGGRESSIVE = 'aggressive',
    AST_BASED = 'ast_based',
    COMPONENT_REF = 'component_ref',
    SEMANTIC = 'semantic'
}
```

---

## Error Handling

### Python

```python
from coon import compress_dart, CoonError, SyntaxError, DecompressionError

try:
    compressed = compress_dart(code)
except SyntaxError as e:
    print(f"Invalid Dart syntax: {e}")
except CoonError as e:
    print(f"Compression error: {e}")
```

### TypeScript

```typescript
import { compressDart, CoonError, SyntaxError } from 'coon-format';

try {
    const compressed = compressDart(code);
} catch (e) {
    if (e instanceof SyntaxError) {
        console.error(`Invalid Dart syntax: ${e.message}`);
    } else if (e instanceof CoonError) {
        console.error(`Compression error: ${e.message}`);
    }
}
```
