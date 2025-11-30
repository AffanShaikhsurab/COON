# Contributing to COON

Thank you for your interest in contributing to COON. This document provides guidelines for contributing to the project.

## Getting Started

### Prerequisites

- Python 3.8 or higher
- Git
- Basic understanding of Python packaging

### Setup Development Environment

1. Fork the repository on GitHub
2. Clone your fork:
   ```bash
   git clone https://github.com/affanshaikhsurab/COON.git
   cd COON
   ```

3. Install in development mode:
   ```bash
   pip install -e .
   pip install -e ".[dev]"
   ```

4. Verify installation:
   ```bash
   python -c "from coon import compress_dart; print('Setup complete')"
   ```

## How to Contribute

### Reporting Bugs

If you find a bug:

1. Check if the bug is already reported in Issues
2. If not, create a new issue with:
   - Clear title describing the problem
   - Steps to reproduce the bug
   - Expected behavior
   - Actual behavior
   - Python version and OS

### Suggesting Features

To suggest a new feature:

1. Check existing issues for similar requests
2. Create a new issue with:
   - Clear description of the feature
   - Why it would be useful
   - How it might work

### Code Contributions

#### Before You Start

1. Create an issue to discuss your proposed changes
2. Wait for feedback from maintainers
3. Fork the repository

#### Making Changes

1. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```

2. Make your changes following these guidelines:
   - Keep code simple and readable
   - Add comments where needed
   - Follow existing code style
   - Update documentation if needed

3. Test your changes:
   ```bash
   python -m pytest tests/
   ```

4. Commit your changes:
   ```bash
   git add .
   git commit -m "Clear description of changes"
   ```

5. Push to your fork:
   ```bash
   git push origin feature-name
   ```

6. Create a Pull Request on GitHub

#### Pull Request Guidelines

Your pull request should:

- Have a clear title and description
- Reference related issues
- Include tests for new features
- Update documentation if needed
- Pass all existing tests

## Code Style

### Python Code

- Use meaningful variable names
- Keep functions short and focused
- Add docstrings to functions and classes
- Follow PEP 8 style guide

Example:
```python
def compress_code(code: str) -> str:
    """
    Compress the given code.
    
    Args:
        code: Source code to compress
        
    Returns:
        Compressed code string
    """
    # Implementation here
    pass
```

### Documentation

- Write clear, simple sentences
- Use examples where helpful
- Keep explanations brief
- Update README.md if adding features

## Testing

### Running Tests

Run all tests:
```bash
python -m pytest tests/
```

Run specific test:
```bash
python -m pytest tests/test_compressor.py
```

### Writing Tests

When adding new features:

1. Add tests in the `tests/` directory
2. Test both success and failure cases
3. Keep tests simple and focused

Example:
```python
def test_compression():
    code = "class Test {}"
    result = compress_dart(code)
    assert len(result) < len(code)
```

## Documentation

### Updating Documentation

If your changes affect usage:

1. Update README.md
2. Update relevant docs in `docs/`
3. Add examples if helpful

### Writing Documentation

- Use simple language
- Provide code examples
- Explain why, not just how
- Keep it brief

## Release Process

Maintainers handle releases. Contributors do not need to worry about versioning.

## Questions

If you have questions:

- Check existing documentation
- Search closed issues
- Create a new issue with your question

## Code of Conduct

### Expected Behavior

- Be respectful
- Be helpful
- Be professional
- Be patient

### Unacceptable Behavior

- Harassment
- Discrimination  
- Spam
- Off-topic discussions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

All contributors will be recognized in the project. Thank you for helping improve COON.
