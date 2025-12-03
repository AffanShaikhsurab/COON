/**
 * COON Language Abstraction Tests
 * 
 * Tests for the language abstraction layer that enables multi-language support.
 */

import {
    LanguageRegistry,
    DartLanguageHandler
} from '../src/languages';

describe('LanguageRegistry', () => {
    beforeEach(() => {
        // Clear registry before each test
        LanguageRegistry.clear();
    });

    afterAll(() => {
        // Re-register dart for other tests
        LanguageRegistry.register('dart', DartLanguageHandler);
    });

    describe('register', () => {
        it('registers a language handler', () => {
            LanguageRegistry.register('dart', DartLanguageHandler);
            
            const handler = LanguageRegistry.get('dart');
            expect(handler).toBeInstanceOf(DartLanguageHandler);
        });

        it('overwrites existing registration', () => {
            LanguageRegistry.register('dart', DartLanguageHandler);
            LanguageRegistry.register('dart', DartLanguageHandler);
            
            // Should not throw, just overwrite
            const handler = LanguageRegistry.get('dart');
            expect(handler).toBeInstanceOf(DartLanguageHandler);
        });
    });

    describe('get', () => {
        beforeEach(() => {
            LanguageRegistry.register('dart', DartLanguageHandler);
        });

        it('returns registered handler', () => {
            const handler = LanguageRegistry.get('dart');
            expect(handler).toBeInstanceOf(DartLanguageHandler);
        });

        it('throws error for unknown language', () => {
            expect(() => LanguageRegistry.get('unknown'))
                .toThrow('Unknown language');
        });

        it('is case-insensitive', () => {
            const handler1 = LanguageRegistry.get('DART');
            const handler2 = LanguageRegistry.get('Dart');
            
            expect(handler1).toBeDefined();
            expect(handler2).toBeDefined();
        });
    });

    describe('detect', () => {
        beforeEach(() => {
            LanguageRegistry.register('dart', DartLanguageHandler);
        });

        it('detects Dart class definition', () => {
            const code = 'class MyWidget extends StatelessWidget {}';
            expect(LanguageRegistry.detect(code)).toBe('dart');
        });

        it('returns null for unknown code', () => {
            const code = 'print("hello")';
            expect(LanguageRegistry.detect(code)).toBeNull();
        });
    });

    describe('detectFromExtension', () => {
        beforeEach(() => {
            LanguageRegistry.register('dart', DartLanguageHandler);
        });

        it('detects Dart by file extension', () => {
            expect(LanguageRegistry.detectFromExtension('.dart')).toBe('dart');
        });

        it('returns null for unknown extension', () => {
            expect(LanguageRegistry.detectFromExtension('.py')).toBeNull();
        });
    });

    describe('listLanguages', () => {
        it('returns empty array when no handlers registered', () => {
            expect(LanguageRegistry.listLanguages()).toEqual([]);
        });

        it('returns registered language names', () => {
            LanguageRegistry.register('dart', DartLanguageHandler);
            expect(LanguageRegistry.listLanguages()).toEqual(['dart']);
        });
    });

    describe('isRegistered', () => {
        it('returns false for unregistered language', () => {
            expect(LanguageRegistry.isRegistered('dart')).toBe(false);
        });

        it('returns true for registered language', () => {
            LanguageRegistry.register('dart', DartLanguageHandler);
            expect(LanguageRegistry.isRegistered('dart')).toBe(true);
        });
    });
});

describe('DartLanguageHandler', () => {
    let handler: DartLanguageHandler;

    beforeEach(() => {
        handler = new DartLanguageHandler();
    });

    describe('spec', () => {
        it('returns language specification', () => {
            const spec = handler.spec;
            
            expect(spec).toHaveProperty('name', 'dart');
            expect(spec).toHaveProperty('version');
            expect(spec).toHaveProperty('extensions');
        });

        it('includes .dart extension', () => {
            expect(handler.spec.extensions).toContain('.dart');
        });
    });

    describe('name', () => {
        it('returns dart', () => {
            expect(handler.name).toBe('dart');
        });
    });

    describe('getKeywords', () => {
        it('returns keyword abbreviations', () => {
            const keywords = handler.getKeywords();
            
            expect(keywords['class']).toBe('c:');
            expect(keywords['final']).toBe('f:');
        });
    });

    describe('getTypeAbbreviations (widgets)', () => {
        it('returns widget abbreviation map', () => {
            const widgets = handler.getTypeAbbreviations();
            
            expect(widgets['Container']).toBe('K');
            expect(widgets['Scaffold']).toBe('S');
        });
    });

    describe('getWidgets (alias)', () => {
        it('returns same as getTypeAbbreviations', () => {
            const widgets = handler.getWidgets();
            
            expect(widgets['Container']).toBe('K');
        });
    });

    describe('getPropertyAbbreviations', () => {
        it('returns property abbreviation map', () => {
            const properties = handler.getPropertyAbbreviations();
            
            expect(properties['child:']).toBe('c:');
            expect(properties['height:']).toBe('e:');
        });
    });

    describe('getProperties (alias)', () => {
        it('returns same as getPropertyAbbreviations', () => {
            const properties = handler.getProperties();
            
            expect(properties['child:']).toBe('c:');
        });
    });

    describe('getAllAbbreviations', () => {
        it('returns all abbreviations combined', () => {
            const all = handler.getAllAbbreviations();
            
            expect(all['class']).toBe('c:');
            expect(all['Container']).toBe('K');
            expect(all['child:']).toBe('c:');
        });
    });

    describe('getReverseAbbreviations', () => {
        it('returns reverse abbreviation map', () => {
            const reverse = handler.getReverseAbbreviations();
            
            // Note: 'c:' maps to 'child:' due to property taking precedence when combined
            expect(reverse['K']).toBe('Container');
            expect(reverse['S']).toBe('Scaffold');
        });
    });

    describe('detectLanguage', () => {
        it('returns high score for Flutter widget code', () => {
            const code = 'class MyWidget extends StatelessWidget {}';
            expect(handler.detectLanguage(code)).toBeGreaterThan(0.5);
        });

        it('returns high score for package imports', () => {
            const code = 'import \'package:flutter/material.dart\';';
            expect(handler.detectLanguage(code)).toBeGreaterThan(0.25);
        });

        it('returns low score for non-Dart code', () => {
            const code = 'def hello(): pass';  // Python
            expect(handler.detectLanguage(code)).toBeLessThan(0.5);
        });

        it('returns 0 for empty code', () => {
            expect(handler.detectLanguage('')).toBe(0);
        });
    });

    describe('createLexer', () => {
        it('creates a DartLexer instance', () => {
            const lexer = handler.createLexer('class Test {}');
            expect(lexer).toBeDefined();
            expect(typeof lexer.tokenize).toBe('function');
        });
    });

    describe('createParser', () => {
        it('creates a DartParser instance', () => {
            const parser = handler.createParser();
            expect(parser).toBeDefined();
            expect(typeof parser.parse).toBe('function');
        });
    });
});

