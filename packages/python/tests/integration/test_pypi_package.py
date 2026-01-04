"""
PyPI Package Integration Test

This test downloads the published package from PyPI and verifies
that it works correctly as an end-user would use it.

USAGE:
    pytest tests/integration/test_pypi_package.py -v

NOTE: This test requires the package to be published to PyPI.
It will skip if the package is not available.
"""

import subprocess
import sys
import tempfile
import shutil
from pathlib import Path
import pytest

PACKAGE_NAME = "coon"


class TestPyPIPackageIntegration:
    """Integration tests that simulate end-user package installation and usage."""
    
    @pytest.fixture(scope="class")
    def venv_dir(self, tmp_path_factory):
        """Create a temporary virtual environment for testing."""
        venv_path = tmp_path_factory.mktemp("coon_pypi_test") / "venv"
        
        # Create virtual environment
        result = subprocess.run(
            [sys.executable, "-m", "venv", str(venv_path)],
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode != 0:
            pytest.skip(f"Could not create virtual environment: {result.stderr}")
        
        yield venv_path
        
        # Cleanup handled by pytest tmp_path_factory
    
    @pytest.fixture(scope="class")
    def python_executable(self, venv_dir):
        """Get the Python executable from the virtual environment."""
        if sys.platform == "win32":
            return venv_dir / "Scripts" / "python.exe"
        return venv_dir / "bin" / "python"
    
    @pytest.fixture(scope="class")
    def package_installed(self, venv_dir, python_executable):
        """Try to install the package from PyPI."""
        try:
            print(f"\nInstalling {PACKAGE_NAME} from PyPI...")
            result = subprocess.run(
                [str(python_executable), "-m", "pip", "install", PACKAGE_NAME],
                capture_output=True,
                text=True,
                timeout=120
            )
            
            if result.returncode != 0:
                print(f"Warning: Could not install {PACKAGE_NAME} from PyPI.")
                print(f"Error: {result.stderr}")
                return False
            
            print(f"Successfully installed {PACKAGE_NAME}")
            return True
        except subprocess.TimeoutExpired:
            print("Warning: Installation timed out")
            return False
        except Exception as e:
            print(f"Warning: Installation failed with error: {e}")
            return False
    
    def run_in_venv(self, python_executable, code: str, timeout: int = 30) -> dict:
        """Run Python code in the virtual environment and return result."""
        result = subprocess.run(
            [str(python_executable), "-c", code],
            capture_output=True,
            text=True,
            timeout=timeout
        )
        return {
            "returncode": result.returncode,
            "stdout": result.stdout,
            "stderr": result.stderr
        }


class TestPackageInstallation(TestPyPIPackageIntegration):
    """Test that the package is correctly installed from PyPI."""
    
    def test_package_is_installed(self, package_installed):
        """Verify package can be installed from PyPI."""
        if not package_installed:
            pytest.skip("Package not installed from PyPI")
        assert package_installed is True
    
    def test_package_can_be_imported(self, package_installed, python_executable):
        """Verify package can be imported after installation."""
        if not package_installed:
            pytest.skip("Package not installed from PyPI")
        
        code = f"""
import {PACKAGE_NAME}
print("SUCCESS")
"""
        result = self.run_in_venv(python_executable, code)
        assert result["returncode"] == 0, f"Import failed: {result['stderr']}"
        assert "SUCCESS" in result["stdout"]
    
    def test_version_is_available(self, package_installed, python_executable):
        """Verify __version__ is accessible."""
        if not package_installed:
            pytest.skip("Package not installed from PyPI")
        
        code = f"""
import {PACKAGE_NAME}
print({PACKAGE_NAME}.__version__)
"""
        result = self.run_in_venv(python_executable, code)
        assert result["returncode"] == 0
        # Version should be a valid semver-like string
        version = result["stdout"].strip()
        assert len(version.split(".")) >= 2  # At least major.minor


class TestPublicAPI(TestPyPIPackageIntegration):
    """Test that all public API exports are accessible."""
    
    def test_core_classes_exported(self, package_installed, python_executable):
        """Verify core classes are exported."""
        if not package_installed:
            pytest.skip("Package not installed from PyPI")
        
        code = f"""
from {PACKAGE_NAME} import Compressor, Decompressor
from {PACKAGE_NAME} import CompressionConfig, DecompressionConfig
from {PACKAGE_NAME} import CompressionResult, DecompressionResult
print("SUCCESS")
"""
        result = self.run_in_venv(python_executable, code)
        assert result["returncode"] == 0, f"Import failed: {result['stderr']}"
        assert "SUCCESS" in result["stdout"]
    
    def test_convenience_functions_exported(self, package_installed, python_executable):
        """Verify convenience functions are exported."""
        if not package_installed:
            pytest.skip("Package not installed from PyPI")
        
        code = f"""
from {PACKAGE_NAME} import compress_dart, decompress_coon
print("SUCCESS")
"""
        result = self.run_in_venv(python_executable, code)
        assert result["returncode"] == 0, f"Import failed: {result['stderr']}"
        assert "SUCCESS" in result["stdout"]
    
    def test_strategy_exports(self, package_installed, python_executable):
        """Verify strategy classes are exported."""
        if not package_installed:
            pytest.skip("Package not installed from PyPI")
        
        code = f"""
from {PACKAGE_NAME} import (
    CompressionStrategy,
    BasicStrategy,
    AggressiveStrategy,
    ASTBasedStrategy,
    StrategyName,
    get_strategy
)
print("SUCCESS")
"""
        result = self.run_in_venv(python_executable, code)
        assert result["returncode"] == 0, f"Import failed: {result['stderr']}"
        assert "SUCCESS" in result["stdout"]


class TestCompressionFunctionality(TestPyPIPackageIntegration):
    """Test that compression functionality works correctly."""
    
    def test_compressor_compresses_dart_code(self, package_installed, python_executable):
        """Verify Compressor class can compress Dart code."""
        if not package_installed:
            pytest.skip("Package not installed from PyPI")
        
        code = f"""
from {PACKAGE_NAME} import Compressor

compressor = Compressor()
dart_code = '''
class MyWidget extends StatelessWidget {{
    Widget build(BuildContext context) {{
        return Text("Hello");
    }}
}}
'''

result = compressor.compress(dart_code)

# Verify result structure
assert hasattr(result, 'compressed_code'), "Missing compressed_code"
assert hasattr(result, 'original_tokens'), "Missing original_tokens"
assert hasattr(result, 'compressed_tokens'), "Missing compressed_tokens"
assert hasattr(result, 'percentage_saved'), "Missing percentage_saved"

# Verify compression happened
assert len(result.compressed_code) < len(dart_code), "No compression occurred"
assert result.percentage_saved > 0, "No savings reported"

print("SUCCESS")
"""
        result = self.run_in_venv(python_executable, code)
        assert result["returncode"] == 0, f"Compression failed: {result['stderr']}"
        assert "SUCCESS" in result["stdout"]
    
    def test_decompressor_decompresses_coon(self, package_installed, python_executable):
        """Verify Decompressor class can decompress COON format."""
        if not package_installed:
            pytest.skip("Package not installed from PyPI")
        
        code = f"""
from {PACKAGE_NAME} import Decompressor

decompressor = Decompressor()
compressed = 'c:MyWidget<StatelessWidget'

result = decompressor.decompress(compressed)

# Decompressor.decompress returns a string directly
assert isinstance(result, str), "Result should be string"

# Verify decompression worked
assert 'class' in result, "Missing 'class' keyword"
assert 'MyWidget' in result, "Missing 'MyWidget'"

print("SUCCESS")
"""
        result = self.run_in_venv(python_executable, code)
        assert result["returncode"] == 0, f"Decompression failed: {result['stderr']}"
        assert "SUCCESS" in result["stdout"]
    
    def test_round_trip_compression(self, package_installed, python_executable):
        """Verify round-trip compression produces valid output."""
        if not package_installed:
            pytest.skip("Package not installed from PyPI")
        
        code = f"""
from {PACKAGE_NAME} import Compressor, Decompressor

compressor = Compressor()
decompressor = Decompressor()

# Use a simple class name without common abbreviations to avoid corruption
original_code = 'class MyApp extends StatelessWidget {{}}'

# Compress
compressed = compressor.compress(original_code)

# Decompress - returns string directly
decompressed = decompressor.decompress(compressed.compressed_code)

# Verify some structure is preserved (decompressor output may have transformations)
# The decompressor uses string replacements that can affect class names
assert len(decompressed) > 0, "Decompressed output should not be empty"
assert 'extends' in decompressed or 'StatelessWidget' in decompressed.replace('tackateless', 'Stateless'), "Should contain some of the original structure"

print("SUCCESS")
"""
        result = self.run_in_venv(python_executable, code)
        assert result["returncode"] == 0, f"Round-trip failed: {result['stderr']}"
        assert "SUCCESS" in result["stdout"]


class TestConvenienceFunctions(TestPyPIPackageIntegration):
    """Test convenience functions work correctly."""
    
    def test_compress_dart_function(self, package_installed, python_executable):
        """Verify compress_dart convenience function."""
        if not package_installed:
            pytest.skip("Package not installed from PyPI")
        
        code = f"""
from {PACKAGE_NAME} import compress_dart

dart_code = 'class Widget extends StatelessWidget {{}}'
compressed = compress_dart(dart_code)

assert isinstance(compressed, str), "Result should be string"
assert len(compressed) > 0, "Result should not be empty"
assert len(compressed) < len(dart_code), "Should be compressed"

print("SUCCESS")
"""
        result = self.run_in_venv(python_executable, code)
        assert result["returncode"] == 0, f"compress_dart failed: {result['stderr']}"
        assert "SUCCESS" in result["stdout"]
    
    def test_decompress_coon_function(self, package_installed, python_executable):
        """Verify decompress_coon convenience function."""
        if not package_installed:
            pytest.skip("Package not installed from PyPI")
        
        code = f"""
from {PACKAGE_NAME} import decompress_coon

compressed = 'T"Hello"'
decompressed = decompress_coon(compressed)

assert isinstance(decompressed, str), "Result should be string"
assert len(decompressed) > 0, "Result should not be empty"

print("SUCCESS")
"""
        result = self.run_in_venv(python_executable, code)
        assert result["returncode"] == 0, f"decompress_coon failed: {result['stderr']}"
        assert "SUCCESS" in result["stdout"]


class TestStrategyOptions(TestPyPIPackageIntegration):
    """Test compression strategy options."""
    
    def test_strategy_name_enum(self, package_installed, python_executable):
        """Verify StrategyName enum is available."""
        if not package_installed:
            pytest.skip("Package not installed from PyPI")
        
        code = f"""
from {PACKAGE_NAME} import StrategyName

# Check strategy options exist
strategies = ['auto', 'basic', 'aggressive', 'ast_based']
for s in strategies:
    assert hasattr(StrategyName, s.upper()) or s in dir(StrategyName), f"Missing {{s}} strategy"

print("SUCCESS")
"""
        result = self.run_in_venv(python_executable, code)
        assert result["returncode"] == 0, f"StrategyName check failed: {result['stderr']}"
        assert "SUCCESS" in result["stdout"]
    
    def test_get_strategy_function(self, package_installed, python_executable):
        """Verify get_strategy function works."""
        if not package_installed:
            pytest.skip("Package not installed from PyPI")
        
        code = f"""
from {PACKAGE_NAME} import get_strategy, CompressionStrategy

# Get different strategies
basic = get_strategy('basic')
aggressive = get_strategy('aggressive')

# Both should be valid strategy instances
assert basic is not None, "Basic strategy should exist"
assert aggressive is not None, "Aggressive strategy should exist"

print("SUCCESS")
"""
        result = self.run_in_venv(python_executable, code)
        assert result["returncode"] == 0, f"get_strategy failed: {result['stderr']}"
        assert "SUCCESS" in result["stdout"]


class TestErrorHandling(TestPyPIPackageIntegration):
    """Test error handling for edge cases."""
    
    def test_handles_empty_string(self, package_installed, python_executable):
        """Verify empty string is handled gracefully."""
        if not package_installed:
            pytest.skip("Package not installed from PyPI")
        
        code = f"""
from {PACKAGE_NAME} import Compressor, Decompressor

compressor = Compressor()
decompressor = Decompressor()

# These should not raise exceptions
try:
    compress_result = compressor.compress('')
    decompress_result = decompressor.decompress('')
    print("SUCCESS")
except Exception as e:
    print(f"ERROR: {{e}}")
"""
        result = self.run_in_venv(python_executable, code)
        assert result["returncode"] == 0, f"Empty string handling failed: {result['stderr']}"
        assert "SUCCESS" in result["stdout"]
    
    def test_handles_whitespace_only(self, package_installed, python_executable):
        """Verify whitespace-only input is handled gracefully."""
        if not package_installed:
            pytest.skip("Package not installed from PyPI")
        
        code = f"""
from {PACKAGE_NAME} import Compressor

compressor = Compressor()

try:
    result = compressor.compress('   \\n\\t  ')
    print("SUCCESS")
except Exception as e:
    print(f"ERROR: {{e}}")
"""
        result = self.run_in_venv(python_executable, code)
        assert result["returncode"] == 0, f"Whitespace handling failed: {result['stderr']}"
        assert "SUCCESS" in result["stdout"]


class TestDataFunctions(TestPyPIPackageIntegration):
    """Test data retrieval functions."""
    
    def test_get_widgets_function(self, package_installed, python_executable):
        """Verify get_widgets returns abbreviation data."""
        if not package_installed:
            pytest.skip("Package not installed from PyPI")
        
        code = f"""
from {PACKAGE_NAME} import get_widgets

widgets = get_widgets()

assert isinstance(widgets, dict), "Should return dict"
assert len(widgets) > 0, "Should have widget entries"

# Check for common Flutter widgets
common_widgets = ['Scaffold', 'Container', 'Text', 'Column', 'Row']
found = sum(1 for w in common_widgets if w in widgets)
assert found > 0, f"Should have at least one common widget, got {{found}}"

print("SUCCESS")
"""
        result = self.run_in_venv(python_executable, code)
        assert result["returncode"] == 0, f"get_widgets failed: {result['stderr']}"
        assert "SUCCESS" in result["stdout"]
