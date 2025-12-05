/**
 * Constants and Configuration for COON Benchmarks
 */

import type { CodeFormat, BenchmarkConfig } from './types.js';
import type { ProviderModelConfig } from './providers/factory.js';

// ============================================================
// COON Format Primers
// ============================================================

export const PRIMERS: Record<CodeFormat, string> = {
  coon: `COON (Code-Oriented Object Notation) is a compressed format for Dart/Flutter code.`,

  dart: `Standard Dart/Flutter code with full widget names and formatting.`,

  minified: `Dart code with whitespace removed but full names preserved.`,
};

// ============================================================
// Default Benchmark Configuration
// ============================================================

export const DEFAULT_BENCHMARK_CONFIG: BenchmarkConfig = {
  models: [],
  formats: ['coon', 'dart', 'minified'],
  concurrency: 5,
  rateLimits: {
    // Gemini
    'gemini-2.5-flash': 15,
    'gemini-2.5-flash-lite': 15,
    'gemini-2.0-flash': 15,
    // Groq
    'moonshotai/kimi-k2-instruct': 60,
    'openai/gpt-oss-120b': 30,
    'llama-3.3-70b-versatile': 30,
    'qwen/qwen3-32b': 60,
    // OpenRouter (free)
    'x-ai/grok-4-1-fast': 50,
    'google/gemma-3-27b:free': 50,
    'z-ai/glm-4.5-air:free': 50,
  },
  dryRun: false,
  dryRunLimit: 10,
};

// ============================================================
// Model Configurations for Benchmarking
// ============================================================

// NOTE: Run `npm run validate:models` to check which models are available
// Model IDs change frequently - update as needed

/**
 * BENCHMARK MODELS - OpenRouter free models for benchmarking
 * These are the models used for COON compression efficiency testing
 * All models use OpenRouter API for consistency
 */
export const TOP_5_MODELS: ProviderModelConfig[] = [
  // GLM 4.5 Air - Z.AI lightweight MoE model
  { provider: 'openrouter', model: 'z-ai/glm-4.5-air:free' },

  // Qwen3 235B - Alibaba's large reasoning model
  { provider: 'openrouter', model: 'qwen/qwen3-235b-a22b:free' },

  // Gemini 2.0 Flash Exp - Google's fast model via OpenRouter
  { provider: 'openrouter', model: 'google/gemini-2.0-flash-exp:free' },

  // Kimi K2 - Moonshot AI's model
  { provider: 'openrouter', model: 'moonshotai/kimi-k2:free' },
];

/**
 * ALL MODELS - Same as TOP_5 for this benchmark
 * All models use OpenRouter API only
 */
export const ALL_BENCHMARK_MODELS: ProviderModelConfig[] = [
  ...TOP_5_MODELS,
];

/**
 * @deprecated Use TOP_5_MODELS or ALL_BENCHMARK_MODELS instead
 * Kept for backward compatibility
 */
export const BENCHMARK_MODELS: ProviderModelConfig[] = TOP_5_MODELS;

// ============================================================
// Benchmark Thresholds
// ============================================================

export const BENCHMARK_THRESHOLDS = {
  /** Minimum comprehension accuracy for COON to be considered successful */
  minComprehensionAccuracy: 0.75,
  /** Maximum accuracy gap vs raw Dart (COON shouldn't be much worse) */
  maxAccuracyGap: 0.05,
  /** Minimum efficiency gain (accuracy per token) */
  minEfficiencyGain: 1.5,
  /** Minimum syntax validity for generation */
  minSyntaxValidity: 0.85,
};

// ============================================================
// Question Categories
// ============================================================

export const QUESTION_CATEGORIES = {
  widgetIdentification: {
    name: 'Widget Identification',
    description: 'Identify widgets in compressed code',
    weight: 0.25,
  },
  propertyRetrieval: {
    name: 'Property Retrieval',
    description: 'Extract specific property values',
    weight: 0.25,
  },
  structureUnderstanding: {
    name: 'Structure Understanding',
    description: 'Understand code hierarchy',
    weight: 0.30,
  },
  semanticAnalysis: {
    name: 'Semantic Analysis',
    description: 'Understand code behavior',
    weight: 0.20,
  },
};

// ============================================================
// Widget Abbreviations Mapping
// ============================================================

export const WIDGET_ABBREVIATIONS: Record<string, string> = {
  'S': 'Scaffold',
  'C': 'Column',
  'R': 'Row',
  'T': 'Text',
  'K': 'Container',
  'N': 'Center',
  'P': 'Padding',
  'B': 'AppBar',
  'E': 'ElevatedButton',
  'F': 'TextField',
  'L': 'ListView',
  'Z': 'SizedBox',
  'Ic': 'Icon',
  'Cd': 'Card',
  'St': 'Stack',
  'Wr': 'Wrap',
  'Sw': 'SingleChildScrollView',
  'Gi': 'GestureDetector',
  'In': 'InkWell',
  'An': 'AnimatedContainer',
  'Tr': 'Transform',
  'Op': 'Opacity',
  'Cl': 'ClipRRect',
  'Im': 'Image',
  'Ci': 'CircleAvatar',
  'Li': 'ListTile',
  'Ds': 'Dismissible',
  'Dr': 'Drawer',
  'Tb': 'TabBar',
  'Tv': 'TabBarView',
  'Fa': 'FloatingActionButton',
  'Ib': 'IconButton',
  'Tb2': 'TextButton',
  'Ob': 'OutlinedButton',
  'Dd': 'DropdownButton',
  'Sw2': 'Switch',
  'Cb': 'Checkbox',
  'Rd': 'Radio',
  'Sl': 'Slider',
  'Pr': 'CircularProgressIndicator',
  'Pr2': 'LinearProgressIndicator',
  'Dv': 'Divider',
  'Sp': 'Spacer',
  'Ex': 'Expanded',
  'Fl': 'Flexible',
  'Al': 'Align',
  'Ps': 'Positioned',
  'As': 'AspectRatio',
  'Fr': 'FractionallySizedBox',
  'Cn': 'ConstrainedBox',
  'Sz': 'SizedBox',
  'Ls': 'LimitedBox',
  'Ov': 'OverflowBox',
  'Gv': 'GridView',
  'Pb': 'PageView',
  'Nv': 'Navigator',
  'Rt': 'Route',
  'Mr': 'MaterialPageRoute',
  'Al2': 'AlertDialog',
  'Sd': 'SimpleDialog',
  'Bs': 'BottomSheet',
  'Sb': 'SnackBar',
  'Pp': 'PopupMenuButton',
  'Mn': 'Menu',
};

// Reverse mapping for decompression
export const REVERSE_WIDGET_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(WIDGET_ABBREVIATIONS).map(([k, v]) => [v, k])
);

// ============================================================
// Answer Format Instructions
// ============================================================

export const ANSWER_FORMAT_INSTRUCTIONS: Record<string, string> = {
  integer: 'Answer with a single integer number only.',
  number: 'Answer with a single number only.',
  boolean: 'Answer with YES or NO only.',
  string: 'Answer with a single word or short phrase only.',
  'widget-name': 'Answer with the full widget name only (e.g., Scaffold, Column).',
  'csv-list-ordered': 'Answer with a comma-separated list in the exact order shown.',
  'csv-list-unordered': 'Answer with a comma-separated list (order does not matter).',
};

// ============================================================
// Rate Limit Delays
// ============================================================

export function getRateLimitDelay(model: string): number {
  const rpm = DEFAULT_BENCHMARK_CONFIG.rateLimits[model] || 30;
  // Add 10% buffer
  return Math.ceil((60 / rpm) * 1000 * 1.1);
}
