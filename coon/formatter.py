"""
Decompression formatting and beautification
"""

import re
from typing import Optional


class DartFormatter:
    """Formats decompressed Dart code"""
    
    def __init__(
        self,
        indent_spaces: int = 2,
        max_line_length: int = 80,
        preserve_blank_lines: bool = True
    ):
        """
        Initialize formatter
        
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
        Format Dart code according to style guide
        
        Args:
            code: Unformatted Dart code
            
        Returns:
            Formatted code
        """
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
    
    def _normalize_whitespace(self, code: str) -> str:
        """Normalize whitespace in code"""
        # Remove trailing whitespace
        lines = code.split('\n')
        lines = [line.rstrip() for line in lines]
        
        # Collapse multiple blank lines
        if not self.preserve_blank_lines:
            result = []
            prev_blank = False
            for line in lines:
                is_blank = not line.strip()
                if is_blank and prev_blank:
                    continue
                result.append(line)
                prev_blank = is_blank
            lines = result
        
        return '\n'.join(lines)
    
    def _apply_indentation(self, code: str) -> str:
        """Apply proper indentation based on nesting"""
        lines = code.split('\n')
        formatted_lines = []
        indent_level = 0
        
        for line in lines:
            stripped = line.strip()
            
            # Skip empty lines
            if not stripped:
                formatted_lines.append('')
                continue
            
            # Decrease indent for closing braces
            if stripped.startswith('}'):
                indent_level = max(0, indent_level - 1)
            
            # Apply indentation
            indent = ' ' * (indent_level * self.indent_spaces)
            formatted_lines.append(indent + stripped)
            
            # Increase indent for opening braces
            if stripped.endswith('{'):
                indent_level += 1
        
        return '\n'.join(formatted_lines)
    
    def _format_class_declarations(self, code: str) -> str:
        """Format class declarations"""
        # Add newline before class declaration
        code = re.sub(
            r'(\n)?class ',
            r'\n\nclass ',
            code
        )
        
        # Add newline after class declaration
        code = re.sub(
            r'(class \w+.*\{)',
            r'\1\n',
            code
        )
        
        return code
    
    def _format_method_declarations(self, code: str) -> str:
        """Format method declarations"""
        # Add @override annotation on separate line
        code = re.sub(
            r'@override\s+',
            '@override\n  ',
            code
        )
        
        return code
    
    def _format_import_statements(self, code: str) -> str:
        """Format import statements"""
        # Ensure imports are at top and grouped
        lines = code.split('\n')
        imports = []
        other_lines = []
        
        for line in lines:
            if line.strip().startswith('import '):
                imports.append(line)
            else:
                other_lines.append(line)
        
        if imports:
            # Sort imports
            imports.sort()
            # Join with newlines
            result = '\n'.join(imports) + '\n\n' + '\n'.join(other_lines)
            return result
        
        return code
    
    def _add_spacing(self, code: str) -> str:
        """Add proper spacing around operators and keywords"""
        # Space around operators
        code = re.sub(r'([^\s])([=+\-*/<>!&|])([^\s=])', r'\1 \2 \3', code)
        
        # Space after commas
        code = re.sub(r',([^\s])', r', \1', code)
        
        # Space after colons (but not ::)
        code = re.sub(r':([^\s:])', r': \1', code)
        
        # No space before semicolon
        code = re.sub(r'\s+;', ';', code)
        
        return code
    
    def _final_cleanup(self, code: str) -> str:
        """Final cleanup and normalization"""
        # Remove multiple consecutive blank lines
        code = re.sub(r'\n\n\n+', '\n\n', code)
        
        # Ensure single newline at end of file
        code = code.rstrip() + '\n'
        
        return code
    
    def format_widget_tree(self, code: str) -> str:
        """
        Special formatting for widget trees
        Aligns widget constructors for better readability
        """
        # This is a simplified version
        # A full implementation would use AST-based alignment
        return self.format(code)
