/**
 * Main Index for COON Benchmarks
 */

// Types
export * from './types.js';

// COON Generator (uses actual SDK)
export {
  compressToCoon,
  compressToCoonWithStrategy,
  getCompressionStats,
  batchCompress,
  resetCompressor,
  CompressionStrategyType,
} from './coon-generator.js';

// Providers
export { 
  GeminiProvider, 
  GroqProvider, 
  OpenRouterProvider,
  createProvider,
  getAvailableProviders,
} from './providers/index.js';

// Constants
export { 
  PRIMERS, 
  DEFAULT_BENCHMARK_CONFIG,
  BENCHMARK_MODELS,
  TOP_5_MODELS,
  ALL_BENCHMARK_MODELS,
  BENCHMARK_THRESHOLDS,
  WIDGET_ABBREVIATIONS,
  getRateLimitDelay,
} from './constants.js';

// Datasets (UI/Widget samples)
export {
  ALL_CODE_SAMPLES,
  getAllCodeSamples,
  getSamplesByComplexity,
  getSamplesByCategory,
  getSampleById,
  getRandomSamples,
  getSampleStats,
  clearSampleCache,
  ALL_SOURCES,
} from './datasets.js';

// Datasets (Large files for compression testing)
export {
  LARGE_CODE_SAMPLES,
} from './datasets-large.js';

// Datasets (Logic/Business samples)
export {
  ALL_LOGIC_SAMPLES,
  getAllLogicSamples,
  repositorySamples,
  stateManagementSamples,
  serviceSamples,
  modelSamples,
  utilitySamples,
  getLogicSamplesByCategory,
  getLogicSampleById,
  getLogicSampleStats,
  clearLogicSampleCache,
  ALL_LOGIC_SOURCES,
} from './datasets-logic.js'

// Questions
export {
  generateComprehensionQuestions,
  generateGenerationTasks,
  generateStructuralQuestions,
  generateLogicComprehensionQuestions,
  generateAllQuestions,
  getQuestionStats,
  getQuestionsByType,
  getTasksByType,
  getTaskById,
  getTaskStats,
  getLogicQuestionsByCategory,
  getLogicQuestionStats,
} from './questions/index.js';

// Normalization
export {
  compareAnswers,
  extractAnswer,
  isValidCoonSyntax,
  containsWidgets,
  normalizeWidgetName,
} from './normalize.js';

// Evaluation
export {
  evaluateComprehension,
  evaluateGeneration,
  evaluateComprehensionBatch,
  evaluateGenerationBatch,
} from './evaluate.js';

// Reports
export {
  calculateFormatMetrics,
  calculateModelMetrics,
  createBenchmarkSummary,
  generateComprehensionReport,
  generateGenerationReport,
  exportResultsToJSON,
} from './report.js';
