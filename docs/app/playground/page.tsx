'use client'

import { useState, useCallback, useMemo } from 'react'
import { CopyButton } from '@/components/CopyButton'
import {
    compress,
    getAbbreviationsByCategory,
    sampleDartCode,
    sampleReactCode,
    type Language
} from '@/lib/coon-browser'

export default function PlaygroundPage() {
    const [language, setLanguage] = useState<Language>('dart')
    const [code, setCode] = useState(sampleDartCode)

    // Compress code whenever it changes
    const result = useMemo(() => compress(code, language), [code, language])

    // Get abbreviations for reference section
    const abbreviations = useMemo(() => getAbbreviationsByCategory(language), [language])

    // Handle language change
    const handleLanguageChange = useCallback((newLanguage: Language) => {
        setLanguage(newLanguage)
        setCode(newLanguage === 'dart' ? sampleDartCode : sampleReactCode)
    }, [])

    // Load sample code
    const loadSampleCode = useCallback(() => {
        setCode(language === 'dart' ? sampleDartCode : sampleReactCode)
    }, [language])

    return (
        <div className="min-h-screen bg-[#14120B]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-4">COON Playground</h1>
                    <p className="text-white/70 text-lg">
                        Compress your Dart/Flutter or React/JavaScript code in real-time using COON format.
                    </p>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <label htmlFor="language-select" className="text-white/80 text-sm">
                            Language:
                        </label>
                        <select
                            id="language-select"
                            value={language}
                            onChange={(e) => handleLanguageChange(e.target.value as Language)}
                            className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="dart">Dart/Flutter</option>
                            <option value="javascript">React/JavaScript</option>
                        </select>
                    </div>
                    <button
                        onClick={loadSampleCode}
                        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg px-4 py-2 text-sm transition-colors"
                    >
                        Load Sample Code
                    </button>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Input Panel */}
                    <div className="flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-lg font-semibold text-white">Input Code</h2>
                            <span className="text-white/60 text-sm">
                                {result.originalLength} characters
                            </span>
                        </div>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder={`Enter your ${language === 'dart' ? 'Dart/Flutter' : 'React/JavaScript'} code here...`}
                            className="flex-1 min-h-[400px] bg-[#1a1814] text-white border border-white/10 rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            spellCheck={false}
                        />
                    </div>

                    {/* Output Panel */}
                    <div className="flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-lg font-semibold text-white">Compressed Output</h2>
                            <div className="flex items-center gap-3">
                                <span className="text-white/60 text-sm">
                                    {result.compressedLength} characters
                                </span>
                                <CopyButton text={result.compressedCode} size="sm" />
                            </div>
                        </div>
                        <div className="flex-1 min-h-[400px] bg-[#1a1814] text-white border border-white/10 rounded-lg p-4 font-mono text-sm overflow-auto">
                            <pre className="whitespace-pre-wrap break-all">
                                {result.compressedCode || <span className="text-white/40">Compressed output will appear here...</span>}
                            </pre>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Compression Statistics</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/5 rounded-lg p-4">
                            <div className="text-white/60 text-sm mb-1">Original</div>
                            <div className="text-2xl font-bold text-white">{result.originalLength}</div>
                            <div className="text-white/40 text-xs">characters</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <div className="text-white/60 text-sm mb-1">Compressed</div>
                            <div className="text-2xl font-bold text-white">{result.compressedLength}</div>
                            <div className="text-white/40 text-xs">characters</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <div className="text-white/60 text-sm mb-1">Saved</div>
                            <div className="text-2xl font-bold text-green-400">
                                {result.percentageSaved}%
                            </div>
                            <div className="text-white/40 text-xs">reduction</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <div className="text-white/60 text-sm mb-1">Abbreviations</div>
                            <div className="text-2xl font-bold text-blue-400">
                                {result.abbreviationsUsed.length}
                            </div>
                            <div className="text-white/40 text-xs">used</div>
                        </div>
                    </div>

                    {/* Abbreviations Used */}
                    {result.abbreviationsUsed.length > 0 && (
                        <div className="mt-4">
                            <h3 className="text-sm font-medium text-white/80 mb-2">Abbreviations Applied:</h3>
                            <div className="flex flex-wrap gap-2">
                                {result.abbreviationsUsed.map((abbrev, index) => (
                                    <span
                                        key={index}
                                        className="bg-white/10 text-white/80 text-xs px-2 py-1 rounded font-mono"
                                    >
                                        {abbrev}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Abbreviation Reference */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">
                        {language === 'dart' ? 'Dart/Flutter' : 'React/JavaScript'} Abbreviation Reference
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Keywords */}
                        <div>
                            <h3 className="text-lg font-medium text-white mb-3">Keywords</h3>
                            <div className="bg-white/5 rounded-lg p-3 max-h-[300px] overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-white/60">
                                            <th className="text-left pb-2">Original</th>
                                            <th className="text-left pb-2">Abbrev</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {Object.entries(abbreviations.keywords).map(([full, abbrev]) => (
                                            <tr key={full} className="text-white/80">
                                                <td className="py-1 font-mono">{full}</td>
                                                <td className="py-1 font-mono text-blue-400">{abbrev}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Widgets/Components */}
                        <div>
                            <h3 className="text-lg font-medium text-white mb-3">
                                {language === 'dart' ? 'Widgets' : 'Components'}
                            </h3>
                            <div className="bg-white/5 rounded-lg p-3 max-h-[300px] overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-white/60">
                                            <th className="text-left pb-2">Original</th>
                                            <th className="text-left pb-2">Abbrev</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {Object.entries(language === 'dart' ? abbreviations.widgets || {} : abbreviations.components || {}).map(([full, abbrev]) => (
                                            <tr key={full} className="text-white/80">
                                                <td className="py-1 font-mono">{full}</td>
                                                <td className="py-1 font-mono text-green-400">{abbrev}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Properties */}
                        <div>
                            <h3 className="text-lg font-medium text-white mb-3">Properties</h3>
                            <div className="bg-white/5 rounded-lg p-3 max-h-[300px] overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-white/60">
                                            <th className="text-left pb-2">Original</th>
                                            <th className="text-left pb-2">Abbrev</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {Object.entries(abbreviations.properties).map(([full, abbrev]) => (
                                            <tr key={full} className="text-white/80">
                                                <td className="py-1 font-mono">{full}</td>
                                                <td className="py-1 font-mono text-purple-400">{abbrev}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
