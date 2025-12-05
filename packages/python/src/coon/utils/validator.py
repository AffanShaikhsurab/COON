"""
Compression validation and testing.
"""

import difflib
from dataclasses import dataclass
from typing import Any


@dataclass
class ValidationResult:
    """
    Result of compression validation.

    Attributes:
        is_valid: Whether validation passed
        reversible: Whether code is perfectly reversible
        semantic_equivalent: Whether codes are semantically equivalent
        token_count_match: Whether token counts are reasonable
        errors: List of error messages
        warnings: List of warning messages
        similarity_score: Similarity between original and decompressed (0.0-1.0)
    """

    is_valid: bool
    reversible: bool
    semantic_equivalent: bool
    token_count_match: bool
    errors: list[str]
    warnings: list[str]
    similarity_score: float

    def __bool__(self) -> bool:
        return self.is_valid

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "is_valid": self.is_valid,
            "reversible": self.reversible,
            "semantic_equivalent": self.semantic_equivalent,
            "token_count_match": self.token_count_match,
            "errors": self.errors,
            "warnings": self.warnings,
            "similarity_score": self.similarity_score,
        }


class CompressionValidator:
    """
    Validates compression operations.

    Checks that compression is reversible, semantically equivalent,
    and provides meaningful compression.

    Example:
        >>> validator = CompressionValidator()
        >>> result = validator.validate_compression(
        ...     original_code,
        ...     compressed_code,
        ...     decompressed_code
        ... )
        >>> if result.is_valid:
        ...     print("Compression is valid!")
    """

    def __init__(self, strict_mode: bool = False):
        """
        Initialize validator.

        Args:
            strict_mode: If True, require perfect reversibility
        """
        self.strict_mode = strict_mode

    def validate_compression(
        self, original_code: str, compressed_code: str, decompressed_code: str
    ) -> ValidationResult:
        """
        Validate a compression/decompression cycle.

        Args:
            original_code: Original source code
            compressed_code: Compressed code
            decompressed_code: Decompressed code

        Returns:
            ValidationResult with detailed validation info
        """
        errors: list[str] = []
        warnings: list[str] = []

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
        token_count_match = self._check_token_count_accuracy(original_code, compressed_code)
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
            similarity_score=similarity,
        )

    def validate_coon_syntax(self, coon_code: str) -> ValidationResult:
        """
        Validate COON format syntax.

        Args:
            coon_code: COON format code to validate

        Returns:
            ValidationResult for syntax check
        """
        errors: list[str] = []
        warnings: list[str] = []

        # Check for balanced brackets
        if not self._check_balanced_brackets(coon_code):
            errors.append("Unbalanced brackets in COON code")

        # Check for valid abbreviation patterns
        # Pattern: @refs should be followed by content
        if "@" in coon_code:
            # Basic check for EdgeInsets patterns
            import re

            invalid_patterns = re.findall(r"@[a-zA-Z]", coon_code)
            if invalid_patterns:
                warnings.append("Potentially invalid @ references found")

        is_valid = len(errors) == 0

        return ValidationResult(
            is_valid=is_valid,
            reversible=True,
            semantic_equivalent=True,
            token_count_match=True,
            errors=errors,
            warnings=warnings,
            similarity_score=1.0 if is_valid else 0.0,
        )

    def _check_reversibility(self, original: str, decompressed: str) -> bool:
        """Check if code is perfectly reversible (ignoring whitespace)."""
        norm_original = self._normalize_code(original)
        norm_decompressed = self._normalize_code(decompressed)
        return norm_original == norm_decompressed

    def _normalize_code(self, code: str) -> str:
        """Normalize code for comparison."""
        # Remove all whitespace
        normalized = "".join(code.split())
        # Lowercase for case-insensitive comparison
        normalized = normalized.lower()
        return normalized

    def _check_semantic_equivalence(self, original: str, decompressed: str) -> bool:
        """
        Check if codes are semantically equivalent.

        This is a simplified check using normalized comparison.
        A full implementation would parse both into AST and compare.
        """
        return self._check_reversibility(original, decompressed)

    def _calculate_similarity(self, code1: str, code2: str) -> float:
        """Calculate similarity score between two code snippets."""
        matcher = difflib.SequenceMatcher(None, code1, code2)
        return matcher.ratio()

    def _check_token_count_accuracy(self, original: str, compressed: str) -> bool:
        """Check if token count estimation is reasonable."""
        return len(compressed) < len(original)

    def _check_balanced_brackets(self, code: str) -> bool:
        """Check if all brackets are balanced."""
        stack = []
        pairs = {"(": ")", "[": "]", "{": "}", "<": ">"}

        for char in code:
            if char in pairs:
                stack.append(pairs[char])
            elif char in pairs.values():
                if not stack or stack.pop() != char:
                    return False

        return len(stack) == 0

    def generate_diff(self, original: str, decompressed: str) -> str:
        """
        Generate diff between original and decompressed code.

        Args:
            original: Original code
            decompressed: Decompressed code

        Returns:
            Unified diff string
        """
        original_lines = original.splitlines(keepends=True)
        decompressed_lines = decompressed.splitlines(keepends=True)

        diff = difflib.unified_diff(
            original_lines,
            decompressed_lines,
            fromfile="original",
            tofile="decompressed",
            lineterm="",
        )

        return "".join(diff)

    def compare_codes(self, code1: str, code2: str, context_lines: int = 3) -> dict[str, Any]:
        """
        Detailed comparison of two code snippets.

        Args:
            code1: First code snippet
            code2: Second code snippet
            context_lines: Number of context lines in diff

        Returns:
            Dictionary with comparison details
        """
        similarity = self._calculate_similarity(code1, code2)

        # Generate diff
        diff = difflib.unified_diff(
            code1.splitlines(keepends=True),
            code2.splitlines(keepends=True),
            lineterm="",
            n=context_lines,
        )
        diff_str = "".join(diff)

        # Calculate changes
        matcher = difflib.SequenceMatcher(None, code1, code2)
        opcodes = matcher.get_opcodes()

        additions = sum(j2 - j1 for tag, i1, i2, j1, j2 in opcodes if tag == "insert")
        deletions = sum(i2 - i1 for tag, i1, i2, j1, j2 in opcodes if tag == "delete")

        return {
            "similarity": similarity,
            "diff": diff_str,
            "additions": additions,
            "deletions": deletions,
            "identical": similarity >= 0.99,
        }
