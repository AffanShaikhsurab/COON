/**
 * npm Package Integration Test
 * 
 * This test downloads the published package from npm and verifies
 * that it works correctly as an end-user would use it.
 * 
 * USAGE:
 *   npm run test:npm-integration
 * 
 * NOTE: This test requires the package to be published to npm.
 * It will skip if the package is not available.
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const PACKAGE_NAME = 'coon-format';

describe('npm Package Integration Tests', () => {
    let testDir: string;
    let packageInstalled = false;

    beforeAll(() => {
        // Create a temporary directory for testing
        testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'coon-npm-test-'));
        
        // Initialize a minimal package.json
        const packageJson = {
            name: 'coon-npm-integration-test',
            version: '1.0.0',
            type: 'commonjs'
        };
        fs.writeFileSync(
            path.join(testDir, 'package.json'),
            JSON.stringify(packageJson, null, 2)
        );

        // Try to install the package from npm
        try {
            console.log(`\nInstalling ${PACKAGE_NAME} from npm...`);
            execSync(`npm install ${PACKAGE_NAME}`, {
                cwd: testDir,
                stdio: 'pipe',
                timeout: 60000 // 60 second timeout
            });
            packageInstalled = true;
            console.log(`Successfully installed ${PACKAGE_NAME}`);
        } catch (error) {
            console.warn(`\nWarning: Could not install ${PACKAGE_NAME} from npm.`);
            console.warn('This test will be skipped. Package may not be published yet.\n');
        }
    });

    afterAll(() => {
        // Clean up the temporary directory
        if (testDir && fs.existsSync(testDir)) {
            try {
                fs.rmSync(testDir, { recursive: true, force: true });
            } catch {
                // Ignore cleanup errors
            }
        }
    });

    const skipIfNotInstalled = () => {
        if (!packageInstalled) {
            return true;
        }
        return false;
    };

    describe('Package Installation', () => {
        test('package is installed from npm', () => {
            if (skipIfNotInstalled()) {
                console.log('Skipping: package not installed');
                return;
            }

            const nodeModulesPath = path.join(testDir, 'node_modules', PACKAGE_NAME);
            expect(fs.existsSync(nodeModulesPath)).toBe(true);
        });

        test('package.json exists in installed package', () => {
            if (skipIfNotInstalled()) {
                console.log('Skipping: package not installed');
                return;
            }

            const packageJsonPath = path.join(testDir, 'node_modules', PACKAGE_NAME, 'package.json');
            expect(fs.existsSync(packageJsonPath)).toBe(true);
            
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            expect(packageJson.name).toBe(PACKAGE_NAME);
        });

        test('dist folder exists with compiled files', () => {
            if (skipIfNotInstalled()) {
                console.log('Skipping: package not installed');
                return;
            }

            const distPath = path.join(testDir, 'node_modules', PACKAGE_NAME, 'dist');
            expect(fs.existsSync(distPath)).toBe(true);
            
            // Check for main entry file
            const indexPath = path.join(distPath, 'index.js');
            expect(fs.existsSync(indexPath)).toBe(true);
        });

        test('type definitions exist', () => {
            if (skipIfNotInstalled()) {
                console.log('Skipping: package not installed');
                return;
            }

            const typesPath = path.join(testDir, 'node_modules', PACKAGE_NAME, 'dist', 'index.d.ts');
            expect(fs.existsSync(typesPath)).toBe(true);
        });
    });

    describe('Public API - require() import', () => {
        test('can require the package and access exports', () => {
            if (skipIfNotInstalled()) {
                console.log('Skipping: package not installed');
                return;
            }

            // Create a test script that requires the package
            const testScript = `
                const coon = require('${PACKAGE_NAME}');
                
                // Verify exports exist
                const exports = Object.keys(coon);
                console.log(JSON.stringify({ 
                    success: true, 
                    exports: exports,
                    hasCompressor: typeof coon.Compressor === 'function',
                    hasDecompressor: typeof coon.Decompressor === 'function'
                }));
            `;
            
            const scriptPath = path.join(testDir, 'test-require.js');
            fs.writeFileSync(scriptPath, testScript);
            
            const result = execSync(`node ${scriptPath}`, { cwd: testDir, encoding: 'utf-8' });
            const output = JSON.parse(result.trim());
            
            expect(output.success).toBe(true);
            expect(output.exports.length).toBeGreaterThan(0);
            expect(output.hasCompressor).toBe(true);
            expect(output.hasDecompressor).toBe(true);
        });
    });

    describe('Compression Functionality', () => {
        test('Compressor compresses Dart code', () => {
            if (skipIfNotInstalled()) {
                console.log('Skipping: package not installed');
                return;
            }

            const testScript = `
                const { Compressor } = require('${PACKAGE_NAME}');
                
                const compressor = new Compressor();
                const code = \`
                    class MyWidget extends StatelessWidget {
                        Widget build(BuildContext context) {
                            return Text("Hello");
                        }
                    }
                \`;
                
                const result = compressor.compress(code);
                
                console.log(JSON.stringify({
                    success: true,
                    hasCompressedCode: typeof result.compressedCode === 'string',
                    isSmaller: result.compressedCode.length < code.length,
                    percentageSaved: result.percentageSaved
                }));
            `;
            
            const scriptPath = path.join(testDir, 'test-compress.js');
            fs.writeFileSync(scriptPath, testScript);
            
            const result = execSync(`node ${scriptPath}`, { cwd: testDir, encoding: 'utf-8' });
            const output = JSON.parse(result.trim());
            
            expect(output.success).toBe(true);
            expect(output.hasCompressedCode).toBe(true);
            expect(output.isSmaller).toBe(true);
            expect(output.percentageSaved).toBeGreaterThan(0);
        });

        test('Decompressor decompresses COON format', () => {
            if (skipIfNotInstalled()) {
                console.log('Skipping: package not installed');
                return;
            }

            const testScript = `
                const { Decompressor } = require('${PACKAGE_NAME}');
                
                const decompressor = new Decompressor();
                const compressed = 'c:MyWidget<StatelessWidget';
                
                const result = decompressor.decompress(compressed);
                
                console.log(JSON.stringify({
                    success: true,
                    hasDecompressedCode: typeof result.decompressedCode === 'string',
                    containsClass: result.decompressedCode.includes('class'),
                    containsMyWidget: result.decompressedCode.includes('MyWidget')
                }));
            `;
            
            const scriptPath = path.join(testDir, 'test-decompress.js');
            fs.writeFileSync(scriptPath, testScript);
            
            const result = execSync(`node ${scriptPath}`, { cwd: testDir, encoding: 'utf-8' });
            const output = JSON.parse(result.trim());
            
            expect(output.success).toBe(true);
            expect(output.hasDecompressedCode).toBe(true);
            expect(output.containsClass).toBe(true);
            expect(output.containsMyWidget).toBe(true);
        });

        test('round-trip compression works correctly', () => {
            if (skipIfNotInstalled()) {
                console.log('Skipping: package not installed');
                return;
            }

            const testScript = `
                const { Compressor, Decompressor } = require('${PACKAGE_NAME}');
                
                const compressor = new Compressor();
                const decompressor = new Decompressor();
                
                const originalCode = 'class TestWidget extends StatelessWidget {}';
                
                // Compress
                const compressed = compressor.compress(originalCode);
                
                // Decompress
                const decompressed = decompressor.decompress(compressed.compressedCode);
                
                // Check key elements are preserved
                const hasClass = decompressed.decompressedCode.includes('class');
                const hasTestWidget = decompressed.decompressedCode.includes('TestWidget');
                const hasStatelessWidget = decompressed.decompressedCode.includes('StatelessWidget');
                
                console.log(JSON.stringify({
                    success: true,
                    roundTripWorks: hasClass && hasTestWidget && hasStatelessWidget,
                    originalLength: originalCode.length,
                    compressedLength: compressed.compressedCode.length,
                    decompressedLength: decompressed.decompressedCode.length
                }));
            `;
            
            const scriptPath = path.join(testDir, 'test-roundtrip.js');
            fs.writeFileSync(scriptPath, testScript);
            
            const result = execSync(`node ${scriptPath}`, { cwd: testDir, encoding: 'utf-8' });
            const output = JSON.parse(result.trim());
            
            expect(output.success).toBe(true);
            expect(output.roundTripWorks).toBe(true);
        });
    });

    describe('Convenience Functions', () => {
        test('decompressCoon function works', () => {
            if (skipIfNotInstalled()) {
                console.log('Skipping: package not installed');
                return;
            }

            const testScript = `
                const { decompressCoon } = require('${PACKAGE_NAME}');
                
                const compressed = 'T"Hello"';
                const result = decompressCoon(compressed);
                
                console.log(JSON.stringify({
                    success: true,
                    isString: typeof result === 'string',
                    hasContent: result.length > 0
                }));
            `;
            
            const scriptPath = path.join(testDir, 'test-convenience.js');
            fs.writeFileSync(scriptPath, testScript);
            
            const result = execSync(`node ${scriptPath}`, { cwd: testDir, encoding: 'utf-8' });
            const output = JSON.parse(result.trim());
            
            expect(output.success).toBe(true);
            expect(output.isString).toBe(true);
            expect(output.hasContent).toBe(true);
        });
    });

    describe('Strategy Options', () => {
        test('CompressionStrategyType enum is exported', () => {
            if (skipIfNotInstalled()) {
                console.log('Skipping: package not installed');
                return;
            }

            const testScript = `
                const { CompressionStrategyType } = require('${PACKAGE_NAME}');
                
                console.log(JSON.stringify({
                    success: true,
                    hasBasic: CompressionStrategyType.BASIC !== undefined,
                    hasAggressive: CompressionStrategyType.AGGRESSIVE !== undefined,
                    hasAuto: CompressionStrategyType.AUTO !== undefined
                }));
            `;
            
            const scriptPath = path.join(testDir, 'test-strategies.js');
            fs.writeFileSync(scriptPath, testScript);
            
            const result = execSync(`node ${scriptPath}`, { cwd: testDir, encoding: 'utf-8' });
            const output = JSON.parse(result.trim());
            
            expect(output.success).toBe(true);
            expect(output.hasBasic).toBe(true);
            expect(output.hasAggressive).toBe(true);
            expect(output.hasAuto).toBe(true);
        });

        test('compression with different strategies works', () => {
            if (skipIfNotInstalled()) {
                console.log('Skipping: package not installed');
                return;
            }

            const testScript = `
                const { Compressor, CompressionStrategyType } = require('${PACKAGE_NAME}');
                
                const compressor = new Compressor();
                const code = 'class Widget extends StatelessWidget { Widget build(BuildContext ctx) { return Container(); } }';
                
                const basicResult = compressor.compress(code, { strategy: CompressionStrategyType.BASIC });
                const aggressiveResult = compressor.compress(code, { strategy: CompressionStrategyType.AGGRESSIVE });
                
                console.log(JSON.stringify({
                    success: true,
                    basicWorks: basicResult.compressedCode.length > 0,
                    aggressiveWorks: aggressiveResult.compressedCode.length > 0,
                    bothStrategiesRan: basicResult.strategyUsed !== undefined && aggressiveResult.strategyUsed !== undefined
                }));
            `;
            
            const scriptPath = path.join(testDir, 'test-strategy-options.js');
            fs.writeFileSync(scriptPath, testScript);
            
            const result = execSync(`node ${scriptPath}`, { cwd: testDir, encoding: 'utf-8' });
            const output = JSON.parse(result.trim());
            
            expect(output.success).toBe(true);
            expect(output.basicWorks).toBe(true);
            expect(output.aggressiveWorks).toBe(true);
            expect(output.bothStrategiesRan).toBe(true);
        });
    });

    describe('Error Handling', () => {
        test('handles empty string gracefully', () => {
            if (skipIfNotInstalled()) {
                console.log('Skipping: package not installed');
                return;
            }

            const testScript = `
                const { Compressor, Decompressor } = require('${PACKAGE_NAME}');
                
                const compressor = new Compressor();
                const decompressor = new Decompressor();
                
                let compressError = null;
                let decompressError = null;
                
                try {
                    compressor.compress('');
                } catch (e) {
                    compressError = e.message;
                }
                
                try {
                    decompressor.decompress('');
                } catch (e) {
                    decompressError = e.message;
                }
                
                console.log(JSON.stringify({
                    success: true,
                    compressHandledEmpty: compressError === null,
                    decompressHandledEmpty: decompressError === null
                }));
            `;
            
            const scriptPath = path.join(testDir, 'test-error-handling.js');
            fs.writeFileSync(scriptPath, testScript);
            
            const result = execSync(`node ${scriptPath}`, { cwd: testDir, encoding: 'utf-8' });
            const output = JSON.parse(result.trim());
            
            expect(output.success).toBe(true);
            expect(output.compressHandledEmpty).toBe(true);
            expect(output.decompressHandledEmpty).toBe(true);
        });
    });
});
