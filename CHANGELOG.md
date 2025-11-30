# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-11-30

### Added
- **6 Compression Strategies**: AUTO, BASIC, AGGRESSIVE, COMPONENT_REF, AST_BASED, SEMANTIC, HYBRID
- **Code Analyzer** (`analyzer.py`): Pattern detection, complexity scoring, compression opportunity identification
- **Component Registry** (`registry.py`): Reusable component management with JSON persistence
- **Metrics System** (`metrics.py`): Performance tracking, cost analysis, detailed reporting
- **Validation System** (`validator.py`): Round-trip validation, semantic equivalence checking
- **Code Formatter** (`formatter.py`): Dart code formatting with style guide compliance
- **Dart Parser** (`parser.py`): Lexical analysis and AST construction
- **Enhanced Strategy System**: Adaptive strategy selection based on code characteristics
- **Comprehensive Documentation**: API.md, SPECIFICATION.md, USER_JOURNEY.md, PYPI_PUBLISHING.md
- **Benchmarking Suite**: Real compression ratio measurements (60-70% verified)

### Changed
- Enhanced widget abbreviations from 15 to 80+
- Enhanced property abbreviations from 15 to 30+
- Improved compression ratios: verified 60-70% reduction in real tests
- Upgraded from 3 basic strategies to 6 advanced strategies
- Migrated to language-agnostic design
- Updated `__init__.py` to export all new modules
- Updated version to 0.2.0

### Removed
- Template library (removed for language-agnostic design)
- `TEMPLATE_REF` strategy (Flutter-specific patterns removed)
- `use_templates` parameter from all strategies

### Fixed
- Python typing errors in templates module
- Regex escape sequence warnings
- Missing Tuple import
- Strategy configuration inconsistencies

## [0.1.0] - 2024-12-XX

### Added
- Initial release
- Basic compression with 3 strategies (AUTO, BASIC, AGGRESSIVE)
- Core compressor engine with keyword, widget, and property abbreviations
- CLI interface with compress/decompress commands
- Basic compression result tracking
- README with examples
- MIT License
- Setup.py for installation

### Known Limitations
- Limited to basic abbreviation strategies
- No code analysis or optimization
- No validation system
- Limited documentation
- No benchmarks
