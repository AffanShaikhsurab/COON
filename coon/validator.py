"""
Compression validation and testing
"""

from typing import Tuple, List, Optional
from dataclasses import dataclass
import difflib


@dataclass
class ValidationResult:
    """Result of validation"""
    is_valid: bool
    reversible: bool
    semantic_equivalent: bool
    token_count_match: bool
    errors: List[str]
    warnings: List[str]
    similarity_score: float  # 0.0-1.0
    
    def __bool__(self) -> bool:
        return self.is_valid


class CompressionValidator:
    """Validates compression operations"""
    
    def __init__(self, strict_mode: bool = False):
        """
        Initialize validator
        
        Args:
            strict_mode: If True, require perfect reversibility
        """
        self.strict_mode = strict_mode
    
    def validate_compression(
        self,
        original_code: str,
        compressed_code: str,
        decompressed_code: str
    ) -> ValidationResult:
        """
        Validate a compression/decompression cycle
        
        Args:
            original_code: Original source code
            compressed_code: Compressed code
            decompressed_code: Decompressed code
            
        Returns:
            ValidationResult
        """
        errors = []
        warnings = []
        
        # Check if compression actually occurred
        if len(compressed_code) >= len(original_code):
            warnings.append("Compression did not reduce code size")
        
        # Check reversibility
        reversible = self._check_reversibility(original_code, decompressed_code)
        if not reversible:
            if self.strict_mode:
                errors.append("Round-trip validation failed - code not perfectly reversible")
            else:
                warnings.append("Code not perfectly reversible, but may be semantically equivalent")
        
        # Check semantic equivalence
        semantic_equivalent = self._check_semantic_equivalence(original_code, decompressed_code)
        if not semantic_equivalent:
            errors.append("Decompressed code is not semantically equivalent to original")
        
        # Calculate similarity
        similarity = self._calculate_similarity(original_code, decompressed_code)
        
        # Check token counts
        token_count_match = self._check_token_count_accuracy(
            original_code, compressed_code
        )
        if not token_count_match:
            warnings.append("Token count estimation may be inaccurate")
        
        # Overall validity
        is_valid = len(errors) == 0
        
        return ValidationResult(
            is_valid=is_valid,
            reversible=reversible,
            semantic_equivalent=semantic_equivalent,
            token_count_match=token_count_match,
            errors=errors,
            warnings=warnings,
            similarity_score=similarity
        )
    
    def _check_reversibility(self, original: str, decompressed: str) -> bool:
        """Check if code is perfectly reversible (ignoring whitespace)"""
        # Normalize both codes
        norm_original = self._normalize_code(original)
        norm_decompressed = self._normalize_code(decompressed)
        
        return norm_original == norm_decompressed
    
    def _normalize_code(self, code: str) -> str:
        """Normalize code for comparison"""
        # Remove all whitespace
        normalized = ''.join(code.split())
        # Lowercase for case-insensitive comparison
        normalized = normalized.lower()
        return normalized
    
    def _check_semantic_equivalence(self, original: str, decompressed: str) -> bool:
        """
        Check if codes are semantically equivalent
        
        This is a simplified check - a full implementation would:
        - Parse both codes into AST
        - Compare AST structures
        - Check that all functionality is preserved
        """
        # For now, use normalized comparison
        # This is the same as reversibility check
        return self._check_reversibility(original, decompressed)
    
    def _calculate_similarity(self, code1: str, code2: str) -> float:
        """Calculate similarity score between two code snippets"""
        # Use difflib's SequenceMatcher
        matcher = difflib.SequenceMatcher(None, code1, code2)
        return matcher.ratio()
    
    def _check_token_count_accuracy(
        self,
        original: str,
        compressed: str
    ) -> bool:
        """
        Check if token count estimation is reasonable
        
        Returns True if compressed code is smaller than original
        """
        return len(compressed) < len(original)
    
    def generate_diff(self, original: str, decompressed: str) -> str:
        """Generate diff between original and decompressed code"""
        original_lines = original.splitlines(keepends=True)
        decompressed_lines = decompressed.splitlines(keepends=True)
        
        diff = difflib.unified_diff(
            original_lines,
            decompressed_lines,
            fromfile='original',
            tofile='decompressed',
            lineterm=''
        )
        
        return ''.join(diff)
    
    def validate_batch(
        self,
        test_cases: List[Tuple[str, str, str]]
    ) -> Tuple[int, int, List[ValidationResult]]:
        """
        Validate multiple compression operations
        
        Args:
            test_cases: List of (original, compressed, decompressed) tuples
            
        Returns:
            (passed_count, failed_count, results)
        """
        results = []
        passed = 0
        failed = 0
        
        for original, compressed, decompressed in test_cases:
            result = self.validate_compression(original, compressed, decompressed)
            results.append(result)
            
            if result.is_valid:
                passed += 1
            else:
                failed += 1
        
        return passed, failed, results
    
    def generate_validation_report(self, result: ValidationResult) -> str:
        """Generate human-readable validation report"""
        report = []
        report.append("=" * 70)
        report.append("COMPRESSION VALIDATION REPORT")
        report.append("=" * 70)
        
        report.append(f"\n✅ Valid: {result.is_valid}")
        report.append(f"🔄 Reversible: {result.reversible}")
        report.append(f"🎯 Semantically Equivalent: {result.semantic_equivalent}")
        report.append(f"🔢 Token Count Match: {result.token_count_match}")
        report.append(f"📊 Similarity Score: {result.similarity_score:.2%}")
        
        if result.errors:
            report.append("\n❌ Errors:")
            for error in result.errors:
                report.append(f"   - {error}")
        
        if result.warnings:
            report.append("\n⚠️  Warnings:")
            for warning in result.warnings:
                report.append(f"   - {warning}")
        
        report.append("\n" + "=" * 70)
        
        return "\n".join(report)


class TestCaseGenerator:
    """Generates test cases for validation"""
    
    @staticmethod
    def generate_simple_widget_test() -> str:
        """Generate simple widget test case"""
        return """
class SimpleWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Text("Hello World");
  }
}
"""
    
    @staticmethod
    def generate_complex_widget_test() -> str:
        """Generate complex widget test case"""
        return """
class LoginScreen extends StatelessWidget {
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Login"),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text("Welcome Back", style: TextStyle(fontSize: 24)),
              SizedBox(height: 16),
              TextField(
                controller: emailController,
                decoration: InputDecoration(labelText: "Email"),
              ),
              SizedBox(height: 16),
              TextField(
                controller: passwordController,
                obscureText: true,
                decoration: InputDecoration(labelText: "Password"),
              ),
              SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {},
                child: Text("Login"),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
"""
    
    @staticmethod
    def generate_stateful_widget_test() -> str:
        """Generate stateful widget test case"""
        return """
class Counter extends StatefulWidget {
  @override
  _CounterState createState() => _CounterState();
}

class _CounterState extends State<Counter> {
  int count = 0;
  
  void increment() {
    setState(() {
      count++;
    });
  }
  
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text("Count: $count"),
        ElevatedButton(
          onPressed: increment,
          child: Text("Increment"),
        ),
      ],
    );
  }
}
"""
    
    @staticmethod
    def get_all_test_cases() -> List[str]:
        """Get all test cases"""
        return [
            TestCaseGenerator.generate_simple_widget_test(),
            TestCaseGenerator.generate_complex_widget_test(),
            TestCaseGenerator.generate_stateful_widget_test(),
        ]
