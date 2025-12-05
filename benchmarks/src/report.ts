/**
 * Report Generation for COON Benchmarks
 */

import type { 
  EvaluationResult, 
  GenerationResult,
  FormatMetrics,
  ModelMetrics,
  BenchmarkSummary,
  CodeFormat 
} from './types.js';
import { BENCHMARK_THRESHOLDS } from './constants.js';

// ============================================================
// Metrics Calculation
// ============================================================

/**
 * Separate successful results from API errors
 * This is CRITICAL: API errors should NOT count as incorrect answers
 */
function partitionResults(results: EvaluationResult[]): {
  successful: EvaluationResult[];
  errors: EvaluationResult[];
} {
  return {
    successful: results.filter(r => !r.error),
    errors: results.filter(r => !!r.error),
  };
}

/**
 * Calculate metrics for a specific format
 * IMPORTANT: Only counts successful API calls in accuracy calculation
 */
export function calculateFormatMetrics(
  results: EvaluationResult[],
  format: CodeFormat
): FormatMetrics {
  const formatResults = results.filter(r => r.format === format);
  const { successful, errors } = partitionResults(formatResults);
  
  // Only count successful API calls for accuracy
  const correctCount = successful.filter(r => r.isCorrect).length;
  const totalTokens = successful.reduce((sum, r) => sum + r.inputTokens + r.outputTokens, 0);
  const totalLatency = successful.reduce((sum, r) => sum + r.latencyMs, 0);
  
  // Accuracy based on successful responses only (not API errors)
  const accuracy = successful.length > 0 ? correctCount / successful.length : 0;
  const avgTokens = successful.length > 0 ? totalTokens / successful.length : 0;
  const avgLatencyMs = successful.length > 0 ? totalLatency / successful.length : 0;
  
  // Efficiency = accuracy per 1K tokens
  const efficiencyScore = avgTokens > 0 ? (accuracy * 1000) / avgTokens : 0;

  return {
    format,
    accuracy,
    totalQuestions: formatResults.length,
    correctAnswers: correctCount,
    avgTokens,
    avgLatencyMs,
    efficiencyScore,
    // Extended metrics for transparency
    successfulResponses: successful.length,
    apiErrors: errors.length,
  } as FormatMetrics & { successfulResponses: number; apiErrors: number };
}

/**
 * Calculate metrics for a specific model
 * IMPORTANT: Only counts successful API calls in accuracy calculation
 */
export function calculateModelMetrics(
  results: EvaluationResult[],
  model: string,
  formats: CodeFormat[]
): ModelMetrics {
  const modelResults = results.filter(r => r.model === model);
  const { successful, errors } = partitionResults(modelResults);
  
  const byFormat = {} as Record<CodeFormat, FormatMetrics>;
  for (const format of formats) {
    byFormat[format] = calculateFormatMetrics(modelResults, format);
  }
  
  // Only count successful API calls for accuracy
  const totalCorrect = successful.filter(r => r.isCorrect).length;
  const overallAccuracy = successful.length > 0 ? totalCorrect / successful.length : 0;

  return {
    model,
    byFormat,
    overallAccuracy,
    totalEvaluations: modelResults.length,
    // Extended metrics
    successfulResponses: successful.length,
    apiErrors: errors.length,
  } as ModelMetrics & { successfulResponses: number; apiErrors: number };
}

/**
 * Create a benchmark summary
 */
export function createBenchmarkSummary(
  name: string,
  results: EvaluationResult[],
  formats: CodeFormat[]
): BenchmarkSummary {
  // Get unique models
  const models = [...new Set(results.map(r => r.model))];
  
  // Separate successful results from API errors
  const { successful, errors } = partitionResults(results);
  
  // Calculate overall metrics (only from successful responses)
  const totalCorrect = successful.filter(r => r.isCorrect).length;
  const totalTokens = successful.reduce((sum, r) => sum + r.inputTokens + r.outputTokens, 0);
  const totalLatency = successful.reduce((sum, r) => sum + r.latencyMs, 0);
  
  const overall = {
    accuracy: successful.length > 0 ? totalCorrect / successful.length : 0,
    avgTokens: successful.length > 0 ? totalTokens / successful.length : 0,
    avgLatencyMs: successful.length > 0 ? totalLatency / successful.length : 0,
    // Extended metrics for transparency
    totalEvaluations: results.length,
    successfulResponses: successful.length,
    apiErrors: errors.length,
  };
  
  // Calculate per-model metrics
  const byModel = models.map(model => calculateModelMetrics(results, model, formats));
  
  // Calculate per-format metrics (across all models)
  const byFormat = formats.map(format => calculateFormatMetrics(results, format));

  return {
    name,
    totalItems: results.length / formats.length, // Questions evaluated
    models,
    formats,
    overall,
    byModel,
    byFormat,
  };
}

// ============================================================
// Markdown Report Generation
// ============================================================

/**
 * Generate efficiency bar chart (ASCII)
 */
function generateBar(value: number, max: number, width = 20): string {
  const filled = Math.round((value / max) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

/**
 * Generate comprehension report
 */
export function generateComprehensionReport(summary: BenchmarkSummary): string {
  const lines: string[] = [];
  
  lines.push('# COON LLM Comprehension Benchmark Results');
  lines.push('');
  lines.push(`**Generated**: ${new Date().toISOString()}`);
  lines.push(`**Total Questions**: ${summary.totalItems}`);
  lines.push(`**Models Tested**: ${summary.models.length}`);
  lines.push('');
  
  // Efficiency Ranking
  lines.push('## Efficiency Ranking (Accuracy per 1K Tokens)');
  lines.push('');
  lines.push('```');
  
  const maxEfficiency = Math.max(...summary.byFormat.map(f => f.efficiencyScore));
  const sortedFormats = [...summary.byFormat].sort((a, b) => b.efficiencyScore - a.efficiencyScore);
  
  for (const format of sortedFormats) {
    const bar = generateBar(format.efficiencyScore, maxEfficiency);
    const accPct = (format.accuracy * 100).toFixed(1);
    const effStr = format.efficiencyScore.toFixed(1);
    const tokStr = format.avgTokens.toFixed(0);
    const padName = format.format.padEnd(12);
    lines.push(`${padName} ${bar}   ${effStr} acc%/1K tok  │  ${accPct}% acc  │  ${tokStr} tokens`);
  }
  
  lines.push('```');
  lines.push('');
  
  // Per-Model Accuracy
  lines.push('## Per-Model Accuracy');
  lines.push('');
  lines.push('```');
  
  for (const modelMetrics of summary.byModel) {
    lines.push(modelMetrics.model);
    
    for (const format of summary.formats) {
      const formatMetrics = modelMetrics.byFormat[format];
      if (!formatMetrics) continue;
      
      const accPct = (formatMetrics.accuracy * 100).toFixed(1);
      const bar = generateBar(formatMetrics.accuracy, 1);
      const correct = formatMetrics.correctAnswers;
      const total = formatMetrics.totalQuestions;
      const padFormat = format.padEnd(12);
      const prefix = format === 'coon' ? '→' : ' ';
      lines.push(`${prefix} ${padFormat} ${bar}    ${accPct}% (${correct}/${total})`);
    }
    lines.push('');
  }
  
  lines.push('```');
  lines.push('');
  
  // Summary Table
  lines.push('## Summary Table');
  lines.push('');
  lines.push('| Format | Accuracy | Correct | Total | Avg Tokens | Efficiency |');
  lines.push('|--------|----------|---------|-------|------------|------------|');
  
  for (const format of sortedFormats) {
    const acc = (format.accuracy * 100).toFixed(1) + '%';
    const eff = format.efficiencyScore.toFixed(1);
    const tok = format.avgTokens.toFixed(0);
    lines.push(`| ${format.format} | ${acc} | ${format.correctAnswers} | ${format.totalQuestions} | ${tok} | ${eff} |`);
  }
  
  lines.push('');
  
  // Success Criteria
  lines.push('## Success Criteria');
  lines.push('');
  
  const coonMetrics = summary.byFormat.find(f => f.format === 'coon');
  const dartMetrics = summary.byFormat.find(f => f.format === 'dart');
  
  if (coonMetrics && dartMetrics) {
    const coonAcc = coonMetrics.accuracy;
    const dartAcc = dartMetrics.accuracy;
    const accGap = dartAcc - coonAcc;
    const effGain = coonMetrics.efficiencyScore / dartMetrics.efficiencyScore;
    
    const meetComprehension = coonAcc >= BENCHMARK_THRESHOLDS.minComprehensionAccuracy;
    const meetGap = accGap <= BENCHMARK_THRESHOLDS.maxAccuracyGap;
    const meetEfficiency = effGain >= BENCHMARK_THRESHOLDS.minEfficiencyGain;
    
    lines.push(`| Criteria | Target | Actual | Status |`);
    lines.push(`|----------|--------|--------|--------|`);
    lines.push(`| COON Comprehension | ≥${(BENCHMARK_THRESHOLDS.minComprehensionAccuracy * 100).toFixed(0)}% | ${(coonAcc * 100).toFixed(1)}% | ${meetComprehension ? '✅' : '❌'} |`);
    lines.push(`| Accuracy Gap vs Dart | ≤${(BENCHMARK_THRESHOLDS.maxAccuracyGap * 100).toFixed(0)}% | ${(accGap * 100).toFixed(1)}% | ${meetGap ? '✅' : '❌'} |`);
    lines.push(`| Efficiency Gain | ≥${BENCHMARK_THRESHOLDS.minEfficiencyGain.toFixed(1)}x | ${effGain.toFixed(2)}x | ${meetEfficiency ? '✅' : '❌'} |`);
    lines.push('');
    
    const allMet = meetComprehension && meetGap && meetEfficiency;
    const someMet = meetComprehension || meetEfficiency;
    
    if (allMet) {
      lines.push('### ✅ **Success**: COON achieves target comprehension with efficiency gains');
    } else if (someMet) {
      lines.push('### ⚠️ **Partial**: Some criteria met, optimization needed');
    } else {
      lines.push('### ❌ **Needs Work**: Key criteria not met');
    }
  }
  
  lines.push('');
  
  return lines.join('\n');
}

/**
 * Generate generation benchmark report
 */
export function generateGenerationReport(results: GenerationResult[]): string {
  const lines: string[] = [];
  
  lines.push('# COON Generation Benchmark Results');
  lines.push('');
  lines.push(`**Generated**: ${new Date().toISOString()}`);
  lines.push(`**Total Tasks**: ${results.length}`);
  lines.push('');
  
  // Calculate metrics
  const syntaxValidCount = results.filter(r => r.syntaxValid).length;
  const decompressableCount = results.filter(r => r.decompressable).length;
  const semanticCount = results.filter(r => r.semanticallyCorrect).length;
  
  const syntaxValidPct = ((syntaxValidCount / results.length) * 100).toFixed(1);
  const decompressablePct = ((decompressableCount / results.length) * 100).toFixed(1);
  const semanticPct = ((semanticCount / results.length) * 100).toFixed(1);
  
  // By Model
  const models = [...new Set(results.map(r => r.model))];
  
  lines.push('## Syntax Validity by Model');
  lines.push('');
  lines.push('| Model | Valid Syntax | Decompressable | Semantic Match |');
  lines.push('|-------|--------------|----------------|----------------|');
  
  for (const model of models) {
    const modelResults = results.filter(r => r.model === model);
    const sv = ((modelResults.filter(r => r.syntaxValid).length / modelResults.length) * 100).toFixed(1);
    const dc = ((modelResults.filter(r => r.decompressable).length / modelResults.length) * 100).toFixed(1);
    const sm = ((modelResults.filter(r => r.semanticallyCorrect).length / modelResults.length) * 100).toFixed(1);
    lines.push(`| ${model} | ${sv}% | ${dc}% | ${sm}% |`);
  }
  
  lines.push('');
  
  // Overall
  lines.push('## Overall Metrics');
  lines.push('');
  lines.push(`- **Syntax Validity**: ${syntaxValidPct}%`);
  lines.push(`- **Decompressable**: ${decompressablePct}%`);
  lines.push(`- **Semantic Match**: ${semanticPct}%`);
  lines.push('');
  
  // Success criteria
  const meetSyntax = syntaxValidCount / results.length >= BENCHMARK_THRESHOLDS.minSyntaxValidity;
  lines.push('## Success Criteria');
  lines.push('');
  lines.push(`| Criteria | Target | Actual | Status |`);
  lines.push(`|----------|--------|--------|--------|`);
  lines.push(`| Syntax Validity | ≥${(BENCHMARK_THRESHOLDS.minSyntaxValidity * 100).toFixed(0)}% | ${syntaxValidPct}% | ${meetSyntax ? '✅' : '❌'} |`);
  lines.push('');
  
  return lines.join('\n');
}

// ============================================================
// JSON Export
// ============================================================

/**
 * Export results to JSON
 */
export function exportResultsToJSON(
  comprehensionResults: EvaluationResult[],
  generationResults: GenerationResult[]
): string {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    comprehension: comprehensionResults,
    generation: generationResults,
  }, null, 2);
}
