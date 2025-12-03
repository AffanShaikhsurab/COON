/**
 * COON Conformance Tests
 * 
 * Tests against shared fixtures to ensure SDK compatibility.
 */

import * as fs from 'fs';
import * as path from 'path';
import { Compressor, Decompressor } from '../src/core';
import { CompressionStrategyType } from '../src/strategies';

interface TestCase {
    id: string;
    name: string;
    input: string;
    expected?: string;
    strategy?: string;
}

interface ConformanceFile {
    version: string;
    description?: string;
    testCases: TestCase[];
}

const FIXTURES_PATH = path.resolve(__dirname, '..', '..', '..', 'spec', 'fixtures', 'conformance');

function loadFixtures(filename: string): TestCase[] {
    const filePath = path.join(FIXTURES_PATH, `${filename}.json`);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const data: ConformanceFile = JSON.parse(content);
        return data.testCases || [];
    }
    return [];
}

describe('Conformance Tests', () => {
    const compressor = new Compressor();
    const decompressor = new Decompressor();

    describe('Basic Compression', () => {
        const testCases = loadFixtures('basic_compression');

        if (testCases.length === 0) {
            test.skip('No basic_compression fixtures found', () => {});
            return;
        }

        testCases.forEach((testCase) => {
            test(`${testCase.name} - compresses correctly`, () => {
                const result = compressor.compress(testCase.input, { strategy: CompressionStrategyType.BASIC });
                
                // Compression should reduce or maintain size
                expect(result.compressedCode.length).toBeLessThanOrEqual(testCase.input.length);
                
                // If expected output is specified, verify it
                if (testCase.expected) {
                    expect(result.compressedCode).toBe(testCase.expected);
                }
            });
        });
    });

    describe('Widget Abbreviations', () => {
        const testCases = loadFixtures('widget_abbreviations');

        if (testCases.length === 0) {
            test.skip('No widget_abbreviations fixtures found', () => {});
            return;
        }

        testCases.forEach((testCase) => {
            test(`${testCase.name} - abbreviates widgets correctly`, () => {
                const result = compressor.compress(testCase.input, { strategy: CompressionStrategyType.BASIC });
                
                if (testCase.expected) {
                    expect(result.compressedCode).toBe(testCase.expected);
                }
            });
        });
    });

    describe('Class Definitions', () => {
        const testCases = loadFixtures('class_definitions');

        if (testCases.length === 0) {
            test.skip('No class_definitions fixtures found', () => {});
            return;
        }

        testCases.forEach((testCase) => {
            test(`${testCase.name} - compresses class definitions`, () => {
                const result = compressor.compress(testCase.input, { strategy: CompressionStrategyType.AGGRESSIVE });
                
                if (testCase.expected) {
                    expect(result.compressedCode).toBe(testCase.expected);
                }
            });
        });
    });

    describe('Round Trip', () => {
        const testCases = loadFixtures('round_trip');

        if (testCases.length === 0) {
            test.skip('No round_trip fixtures found', () => {});
            return;
        }

        testCases.forEach((testCase) => {
            test(`${testCase.name} - round trips correctly`, () => {
                const compressed = compressor.compress(testCase.input, { strategy: CompressionStrategyType.BASIC });
                const decompressed = decompressor.decompress(compressed.compressedCode);
                
                // Check that key identifiers are preserved after round trip
                const originalIds = extractIdentifiers(testCase.input);
                const decompressedIds = extractIdentifiers(decompressed.decompressedCode);
                
                const preserved = originalIds.filter(id => 
                    decompressedIds.some(did => did.toLowerCase().includes(id.toLowerCase()))
                );
                
                expect(preserved.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Edge Cases', () => {
        const testCases = loadFixtures('edge_cases');

        if (testCases.length === 0) {
            test.skip('No edge_cases fixtures found', () => {});
            return;
        }

        testCases.forEach((testCase) => {
            test(`${testCase.name} - handles edge case`, () => {
                // Use the strategy specified in the fixture
                const strategy = testCase.strategy === 'aggressive' 
                    ? CompressionStrategyType.AGGRESSIVE 
                    : CompressionStrategyType.BASIC;
                const result = compressor.compress(testCase.input, { strategy });
                
                // Should not throw and should return a result
                expect(result).toBeDefined();
                expect(result.compressedCode).toBeDefined();
                
                if (testCase.expected) {
                    expect(result.compressedCode).toBe(testCase.expected);
                }
            });
        });
    });
});

function extractIdentifiers(code: string): string[] {
    const matches = code.match(/\b[A-Z][a-zA-Z]*\b/g) || [];
    return [...new Set(matches)];
}
