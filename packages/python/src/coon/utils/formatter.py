"""
Decompression formatting and beautification.
"""

import re


class DartFormatter:
    """
    Formats decompressed Dart code.

    Applies standard Dart formatting rules to make
    decompressed code readable.

    Example:
        >>> formatter = DartFormatter(indent_spaces=2)
        >>> formatted = formatter.format(raw_code)
    """

    def __init__(
        self, indent_spaces: int = 2, max_line_length: int = 80, preserve_blank_lines: bool = True
    ):
        """
        Initialize formatter.

        Args:
            indent_spaces: Number of spaces per indentation level
            max_line_length: Maximum line length (0 for no limit)
            preserve_blank_lines: Whether to preserve blank lines
        """
        self.indent_spaces = indent_spaces
        self.max_line_length = max_line_length
        self.preserve_blank_lines = preserve_blank_lines

    def format(self, code: str) -> str:
        """
        Format Dart code according to style guide.

        Args:
            code: Unformatted Dart code

        Returns:
            Formatted code
        """
        if not code or not code.strip():
            return code

        # Step 1: Normalize whitespace
        code = self._normalize_whitespace(code)

        # Step 2: Add proper indentation
        code = self._apply_indentation(code)

        # Step 3: Format specific constructs
        code = self._format_class_declarations(code)
        code = self._format_method_declarations(code)
        code = self._format_import_statements(code)

        # Step 4: Add proper spacing
        code = self._add_spacing(code)

        # Step 5: Final cleanup
        code = self._final_cleanup(code)

        return code

    def format_minimal(self, code: str) -> str:
        """
        Apply minimal formatting (just indentation).

        Args:
            code: Unformatted code

        Returns:
            Minimally formatted code
        """
        if not code or not code.strip():
            return code

        code = self._normalize_whitespace(code)
        code = self._apply_indentation(code)
        return code

    def _normalize_whitespace(self, code: str) -> str:
        """Normalize whitespace in code."""
        # Remove trailing whitespace
        lines = code.split("\n")
        lines = [line.rstrip() for line in lines]

        # Collapse multiple blank lines
        if not self.preserve_blank_lines:
            result: list[str] = []
            prev_blank = False
            for line in lines:
                is_blank = not line.strip()
                if is_blank and prev_blank:
                    continue
                result.append(line)
                prev_blank = is_blank
            lines = result

        return "\n".join(lines)

    def _apply_indentation(self, code: str) -> str:
        """Apply proper indentation based on nesting."""
        lines = code.split("\n")
        formatted_lines: list[str] = []
        indent_level = 0

        for line in lines:
            stripped = line.strip()

            # Skip empty lines
            if not stripped:
                formatted_lines.append("")
                continue

            # Decrease indent for closing braces
            if stripped.startswith(("}", ")", "]")):
                indent_level = max(0, indent_level - 1)

            # Apply indentation
            indent = " " * (indent_level * self.indent_spaces)
            formatted_lines.append(indent + stripped)

            # Increase indent for opening braces
            if stripped.endswith(("{", "(", "[")):
                indent_level += 1

            # Handle same-line open/close
            open_count = stripped.count("{") + stripped.count("(") + stripped.count("[")
            close_count = stripped.count("}") + stripped.count(")") + stripped.count("]")
            indent_level += (
                open_count - close_count - (1 if stripped.endswith(("{", "(", "[")) else 0)
            )
            indent_level = max(0, indent_level)

        return "\n".join(formatted_lines)

    def _format_class_declarations(self, code: str) -> str:
        """Format class declarations."""
        # Add blank line before class declaration
        code = re.sub(r"(\n)(\s*)(class\s)", r"\n\n\2\3", code)

        # Add blank line before abstract class
        code = re.sub(r"(\n)(\s*)(abstract\s+class\s)", r"\n\n\2\3", code)

        return code

    def _format_method_declarations(self, code: str) -> str:
        """Format method declarations."""
        # Add @override annotation on separate line
        code = re.sub(r"@override\s+(\w)", r"@override\n  \1", code)

        # Add blank line before methods
        code = re.sub(
            r"(\n)(\s+)(@override\n\s+)?(\w+\s+\w+\s*\([^)]*\)\s*\{)", r"\n\n\2\3\4", code
        )

        return code

    def _format_import_statements(self, code: str) -> str:
        """Format import statements."""
        lines = code.split("\n")
        imports: list[str] = []
        other_lines: list[str] = []

        for line in lines:
            stripped = line.strip()
            if stripped.startswith("import ") or stripped.startswith("export "):
                imports.append(stripped)
            else:
                other_lines.append(line)

        if imports:
            # Sort imports
            dart_imports = sorted([i for i in imports if "dart:" in i])
            package_imports = sorted([i for i in imports if "package:" in i])
            relative_imports = sorted(
                [i for i in imports if i not in dart_imports and i not in package_imports]
            )

            sorted_imports: list[str] = []
            if dart_imports:
                sorted_imports.extend(dart_imports)
                sorted_imports.append("")
            if package_imports:
                sorted_imports.extend(package_imports)
                sorted_imports.append("")
            if relative_imports:
                sorted_imports.extend(relative_imports)
                sorted_imports.append("")

            # Remove leading blank lines from other_lines
            while other_lines and not other_lines[0].strip():
                other_lines.pop(0)

            return "\n".join(sorted_imports + other_lines)

        return code

    def _add_spacing(self, code: str) -> str:
        """Add proper spacing around operators and keywords."""
        # Space after commas
        code = re.sub(r",(\S)", r", \1", code)

        # Space around binary operators
        code = re.sub(r"(\w)([+\-*/=<>!&|^%]+)(\w)", r"\1 \2 \3", code)

        # But not for arrows
        code = re.sub(r"= >", "=>", code)

        # Space after keywords
        for keyword in ["if", "else", "for", "while", "switch", "catch"]:
            code = re.sub(rf"\b{keyword}\(", f"{keyword} (", code)

        return code

    def _final_cleanup(self, code: str) -> str:
        """Final cleanup pass."""
        # Remove multiple consecutive blank lines
        code = re.sub(r"\n{3,}", "\n\n", code)

        # Ensure single newline at end
        code = code.rstrip() + "\n"

        return code

    def format_widget_tree(self, code: str) -> str:
        """
        Format a widget tree with visual structure.

        Adds extra indentation and spacing to make
        widget hierarchy clear.

        Args:
            code: Widget tree code

        Returns:
            Formatted widget tree
        """
        code = self.format(code)

        # Add extra blank line after widget declarations
        code = re.sub(r"(\w+\([^)]*$)", r"\1\n", code, flags=re.MULTILINE)

        return code
