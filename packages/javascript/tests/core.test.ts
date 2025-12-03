/**
 * COON Core Tests
 */

import { Compressor, Decompressor, decompressCoon } from '../src/core';
import { CompressionStrategyType } from '../src/strategies';

describe('Compressor', () => {
    let compressor: Compressor;

    beforeEach(() => {
        compressor = new Compressor();
    });

    describe('compress', () => {
        test('compresses simple class', () => {
            const code = `
                class MyWidget extends StatelessWidget {
                    Widget build(BuildContext context) {
                        return Text("Hello");
                    }
                }
            `;

            const result = compressor.compress(code);

            expect(result.compressedCode).toBeDefined();
            expect(result.compressedCode.length).toBeLessThan(code.length);
            expect(result.percentageSaved).toBeGreaterThan(0);
        });

        test('uses specified strategy', () => {
            const code = `
                class LoginPage extends StatelessWidget {
                    Widget build(BuildContext context) {
                        return Scaffold(
                            appBar: AppBar(title: Text("Login")),
                            body: Column(children: [
                                TextField(),
                                ElevatedButton(onPressed: () {}, child: Text("Submit"))
                            ])
                        );
                    }
                }
            `;

            const basicResult = compressor.compress(code, { strategy: CompressionStrategyType.BASIC });
            const aggressiveResult = compressor.compress(code, { strategy: CompressionStrategyType.AGGRESSIVE });

            expect(aggressiveResult.percentageSaved).toBeGreaterThanOrEqual(
                basicResult.percentageSaved - 10 // Allow some variance
            );
        });

        test('returns correct metadata', () => {
            const code = `
                class TestWidget extends StatefulWidget {
                    void initState() {}
                    Widget build(BuildContext context) {
                        return Container();
                    }
                }
            `;

            const result = compressor.compress(code);

            expect(result.originalTokens).toBeGreaterThan(0);
            expect(result.compressedTokens).toBeLessThan(result.originalTokens);
            expect(result.strategyUsed).toBeDefined();
            expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
        });

        test('handles empty input', () => {
            const result = compressor.compress('');
            
            expect(result.compressedCode).toBe('');
            expect(result.percentageSaved).toBe(0);
        });

        test('handles whitespace-only input', () => {
            const result = compressor.compress('   \n\t  ');
            
            expect(result.compressedCode.trim()).toBe('');
        });
    });

    describe('auto strategy selection', () => {
        test('selects appropriate strategy for small code', () => {
            const smallCode = 'class A {}';
            const result = compressor.compress(smallCode, { strategy: CompressionStrategyType.AUTO });
            
            expect(result.strategyUsed).toBeDefined();
        });

        test('selects appropriate strategy for large code', () => {
            const largeCode = `
                class LargeWidget extends StatelessWidget {
                    final String title;
                    final int count;
                    
                    LargeWidget({required this.title, required this.count});
                    
                    Widget build(BuildContext context) {
                        return Scaffold(
                            appBar: AppBar(
                                title: Text(title),
                                centerTitle: true,
                            ),
                            body: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                    Text("Count: $count"),
                                    SizedBox(height: 20),
                                    ElevatedButton(
                                        onPressed: () {},
                                        child: Text("Click me")
                                    ),
                                ],
                            ),
                        );
                    }
                }
            `;
            
            const result = compressor.compress(largeCode, { strategy: CompressionStrategyType.AUTO });
            
            expect(result.strategyUsed).toBeDefined();
            expect(result.percentageSaved).toBeGreaterThan(30);
        });
    });
});

describe('Decompressor', () => {
    let decompressor: Decompressor;

    beforeEach(() => {
        decompressor = new Decompressor();
    });

    describe('decompress', () => {
        test('decompresses basic COON format', () => {
            const compressed = 'c:MyWidget<StatelessWidget';
            const result = decompressor.decompress(compressed);

            expect(result.decompressedCode).toContain('class');
            expect(result.decompressedCode).toContain('MyWidget');
            expect(result.decompressedCode).toContain('extends');
            expect(result.decompressedCode).toContain('StatelessWidget');
        });

        test('handles empty input', () => {
            const result = decompressor.decompress('');
            expect(result.decompressedCode).toBe('');
        });
    });
});

describe('decompressCoon function', () => {
    test('provides convenience decompression', () => {
        const compressed = 'T"Hello"';
        const result = decompressCoon(compressed);

        expect(typeof result).toBe('string');
    });
});
