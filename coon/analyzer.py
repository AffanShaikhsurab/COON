"""
Code analysis for intelligent compression
"""

from typing import Dict, List, Tuple, Set
from dataclasses import dataclass
from collections import Counter
import re


@dataclass
class AnalysisResult:
    """Results from code analysis"""
    widget_frequency: Dict[str, int]
    property_frequency: Dict[str, int]
    complexity_score: float
    nesting_depth: int
    code_size: int
    token_count: int
    has_state: bool
    has_async: bool
    widget_tree_depth: int
    repeated_patterns: List[str]
    compression_opportunities: Dict[str, float]
    
    def get_most_common_widgets(self, n: int = 10) -> List[Tuple[str, int]]:
        """Get n most common widgets"""
        return Counter(self.widget_frequency).most_common(n)
    
    def get_most_common_properties(self, n: int = 10) -> List[Tuple[str, int]]:
        """Get n most common properties"""
        return Counter(self.property_frequency).most_common(n)


class CodeAnalyzer:
    """Analyzes Dart code for compression optimization"""
    
    # Common Flutter widgets to track
    FLUTTER_WIDGETS = {
        'Scaffold', 'AppBar', 'Container', 'Column', 'Row', 
        'Text', 'Padding', 'Center', 'Align', 'SafeArea',
        'SizedBox', 'Expanded', 'Flexible', 'Stack', 'Positioned',
        'ListView', 'GridView', 'CustomScrollView', 'SingleChildScrollView',
        'TextField', 'TextFormField', 'ElevatedButton', 'TextButton',
        'IconButton', 'FloatingActionButton', 'Card', 'Divider',
        'Drawer', 'BottomNavigationBar', 'TabBar', 'TabBarView',
        'Image', 'Icon', 'CircularProgressIndicator', 'LinearProgressIndicator',
        'StatelessWidget', 'StatefulWidget', 'State'
    }
    
    # Common properties to track
    COMMON_PROPERTIES = {
        'child', 'children', 'builder', 'controller', 'onPressed',
        'onChanged', 'text', 'title', 'body', 'appBar', 'padding',
        'margin', 'height', 'width', 'color', 'backgroundColor',
        'style', 'decoration', 'alignment', 'mainAxisAlignment',
        'crossAxisAlignment', 'mainAxisSize', 'crossAxisSize'
    }
    
    def analyze(self, code: str) -> AnalysisResult:
        """
        Analyze Dart code and return comprehensive analysis results
        
        Args:
            code: Dart source code to analyze
            
        Returns:
            AnalysisResult with detailed metrics
        """
        # Widget frequency analysis
        widget_freq = self._analyze_widget_frequency(code)
        
        # Property frequency analysis
        property_freq = self._analyze_property_frequency(code)
        
        # Complexity metrics
        complexity = self._calculate_complexity(code)
        nesting_depth = self._calculate_nesting_depth(code)
        widget_tree_depth = self._calculate_widget_tree_depth(code)
        
        # Code characteristics
        code_size = len(code)
        token_count = self._estimate_token_count(code)
        has_state = 'StatefulWidget' in code or 'State<' in code
        has_async = 'async' in code or 'await' in code
        
        # Pattern detection
        repeated_patterns = self._find_repeated_patterns(code)
        
        # Compression opportunities
        opportunities = self._identify_compression_opportunities(
            code, widget_freq, property_freq, complexity
        )
        
        return AnalysisResult(
            widget_frequency=widget_freq,
            property_frequency=property_freq,
            complexity_score=complexity,
            nesting_depth=nesting_depth,
            code_size=code_size,
            token_count=token_count,
            has_state=has_state,
            has_async=has_async,
            widget_tree_depth=widget_tree_depth,
            repeated_patterns=repeated_patterns,
            compression_opportunities=opportunities
        )
    
    def _analyze_widget_frequency(self, code: str) -> Dict[str, int]:
        """Count frequency of each widget"""
        frequency = {}
        for widget in self.FLUTTER_WIDGETS:
            # Match widget name followed by ( or <
            pattern = r'\b' + re.escape(widget) + r'[\(<]'
            matches = re.findall(pattern, code)
            if matches:
                frequency[widget] = len(matches)
        return frequency
    
    def _analyze_property_frequency(self, code: str) -> Dict[str, int]:
        """Count frequency of each property"""
        frequency = {}
        for prop in self.COMMON_PROPERTIES:
            # Match property name followed by :
            pattern = r'\b' + re.escape(prop) + r'\s*:'
            matches = re.findall(pattern, code)
            if matches:
                frequency[prop] = len(matches)
        return frequency
    
    def _calculate_complexity(self, code: str) -> float:
        """
        Calculate code complexity score (0.0-1.0)
        Based on multiple factors:
        - Cyclomatic complexity
        - Nesting depth
        - Code size
        - Widget count
        """
        # Count decision points
        decision_keywords = ['if', 'else', 'switch', 'case', 'for', 'while', '&&', '||', '?']
        decision_count = sum(code.count(keyword) for keyword in decision_keywords)
        
        # Nesting depth
        nesting = self._calculate_nesting_depth(code)
        
        # Code lines
        lines = len(code.split('\n'))
        
        # Normalize to 0-1 scale
        # Complexity = (decisions * 0.3) + (nesting * 0.4) + (lines/1000 * 0.3)
        complexity = min((decision_count * 0.01) + (nesting / 20.0) + (lines / 1000.0 * 0.3), 1.0)
        
        return complexity
    
    def _calculate_nesting_depth(self, code: str) -> int:
        """Calculate maximum nesting depth"""
        depth = 0
        max_depth = 0
        
        for char in code:
            if char in '{([':
                depth += 1
                max_depth = max(max_depth, depth)
            elif char in '})]':
                depth = max(0, depth - 1)
        
        return max_depth
    
    def _calculate_widget_tree_depth(self, code: str) -> int:
        """Estimate widget tree depth"""
        # Simple heuristic: count nested widgets
        # This is approximate - proper implementation would need AST
        widget_pattern = r'(?:' + '|'.join(re.escape(w) for w in self.FLUTTER_WIDGETS) + r')\s*\('
        
        lines = code.split('\n')
        max_widget_depth = 0
        current_depth = 0
        
        for line in lines:
            # Count opening widgets
            widget_opens = len(re.findall(widget_pattern, line))
            # Count closing parens
            closes = line.count(')')
            
            current_depth += widget_opens
            max_widget_depth = max(max_widget_depth, current_depth)
            current_depth = max(0, current_depth - closes)
        
        return max_widget_depth
    
    def _estimate_token_count(self, code: str) -> int:
        """Estimate token count (rough: 4 chars ≈ 1 token)"""
        return len(code) // 4
    
    def _find_repeated_patterns(self, code: str, min_length: int = 20) -> List[str]:
        """Find repeated code patterns that could be compressed"""
        patterns = []
        
        # Look for repeated widget constructions
        widget_constructions = re.findall(
            r'(\w+\([^)]{' + str(min_length) + r',}\))',
            code,
            re.DOTALL
        )
        
        # Find patterns that appear multiple times
        pattern_counts = Counter(widget_constructions)
        repeated = [pattern for pattern, count in pattern_counts.items() if count > 1]
        
        return repeated[:10]  # Return top  10
    
    def _identify_compression_opportunities(
        self,
        code: str,
        widget_freq: Dict[str, int],
        property_freq: Dict[str, int],
        complexity: float
    ) -> Dict[str, float]:
        """
        Identify specific compression opportunities with estimated savings
        
        Returns:
            Dict mapping opportunity type to estimated token savings ratio
        """
        opportunities = {}
        
        # Widget abbreviation opportunity
        total_widget_chars = sum(
            len(widget) * count 
            for widget, count in widget_freq.items()
        )
        if total_widget_chars > 100:
            # Estimate: average widget name from 10 chars to 2 chars = 80% reduction
            opportunities['widget_abbreviation'] = 0.8 * (total_widget_chars / len(code))
        
        # Property abbreviation opportunity
        total_property_chars = sum(
            len(prop) * count 
            for prop, count in property_freq.items()
        )
        if total_property_chars > 50:
            # Estimate: average property from 10 chars to 2 chars = 80% reduction
            opportunities['property_abbreviation'] = 0.8 * (total_property_chars / len(code))
        
        # Whitespace elimination
        whitespace_chars = len(re.findall(r'\s+', code)[0] if re.findall(r'\s+', code) else '')
        whitespace_total = sum(len(match) for match in re.findall(r'\s+', code))
        if whitespace_total > 100:
            opportunities['whitespace_removal'] = whitespace_total / len(code)
        
        # Template matching (if high widget tree depth)
        if self._calculate_widget_tree_depth(code) > 5:
            opportunities['template_matching'] = 0.5  # Estimated 50% potential savings
        
        # Component extraction (if repeated patterns found)
        repeated = self._find_repeated_patterns(code)
        if len(repeated) > 2:
            # Estimate based on number of repeated patterns
            opportunities['component_extraction'] = min(0.3 * len(repeated) / 10, 0.6)
        
        return opportunities
    
    def recommend_strategy(self, analysis: AnalysisResult) -> str:
        """
        Recommend best compression strategy based on analysis
        
        Returns:
            Strategy name
        """
        # High complexity with repeated patterns -> HYBRID
        if analysis.complexity_score > 0.7 and len(analysis.repeated_patterns) > 3:
            return "hybrid"
        
        # Many widgets -> AGGRESSIVE or COMPONENT_REF
        widget_count = sum(analysis.widget_frequency.values())
        if widget_count > 20:
            if len(analysis.repeated_patterns) > 5:
                return "component_ref"
            else:
                return "aggressive"
        
        # Deep widget tree -> TEMPLATE_REF
        if analysis.widget_tree_depth > 6:
            return "template_ref"
        
        # Complex code -> AST_BASED
        if analysis.complexity_score > 0.5:
            return "ast_based"
        
        # Default to BASIC for simple code
        return "basic"
    
    def generate_report(self, analysis: AnalysisResult) -> str:
        """Generate human-readable analysis report"""
        report = []
        report.append("=" * 70)
        report.append("CODE ANALYSIS REPORT")
        report.append("=" * 70)
        
        report.append("\n📊 Basic Metrics:")
        report.append(f"   - Code size: {analysis.code_size} characters")
        report.append(f"   - Estimated tokens: {analysis.token_count}")
        report.append(f"   - Complexity score: {analysis.complexity_score:.2f}")
        report.append(f"   - Max nesting depth: {analysis.nesting_depth}")
        report.append(f"   - Widget tree depth: {analysis.widget_tree_depth}")
        
        report.append("\n🔧 Code Characteristics:")
        report.append(f"   - Has state management: {'Yes' if analysis.has_state else 'No'}")
        report.append(f"   - Has async operations: {'Yes' if analysis.has_async else 'No'}")
        
        if analysis.widget_frequency:
            report.append("\n📦 Top Widgets:")
            for widget, count in analysis.get_most_common_widgets(5):
                report.append(f"   - {widget}: {count}")
        
        if analysis.property_frequency:
            report.append("\n⚙️  Top Properties:")
            for prop, count in analysis.get_most_common_properties(5):
                report.append(f"   - {prop}: {count}")
        
        if analysis.repeated_patterns:
            report.append(f"\n🔁 Repeated Patterns Found: {len(analysis.repeated_patterns)}")
        
        if analysis.compression_opportunities:
            report.append("\n💡 Compression Opportunities:")
            for opp, ratio in sorted(analysis.compression_opportunities.items(), key=lambda x: x[1], reverse=True):
                report.append(f"   - {opp}: {ratio*100:.1f}% potential savings")
        
        report.append("\n✅ Recommended Strategy: " + self.recommend_strategy(analysis).upper())
        report.append("")
        
        return "\n".join(report)
