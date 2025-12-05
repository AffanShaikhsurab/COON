/**
 * COON Benchmark Types
 */

// ============================================================
// Answer Types
// ============================================================

export type AnswerType =
  | 'integer'
  | 'number'
  | 'boolean'
  | 'string'
  | 'widget-name'
  | 'csv-list-ordered'
  | 'csv-list-unordered';

export type QuestionType =
  | 'widget-identification'
  | 'property-retrieval'
  | 'structure-understanding'
  | 'semantic-analysis'
  | 'relationship-mapping'
  | 'structural-awareness'
  | 'pattern-recognition';

export type GenerationTaskType =
  | 'dart-to-coon'
  | 'coon-modification'
  | 'coon-completion'
  | 'nl-to-coon';

export type ModificationTaskType =
  | 'add-widget'
  | 'change-property'
  | 'remove-widget'
  | 'refactor'
  | 'fix-bug';

export type CodeFormat = 'coon' | 'dart' | 'minified';

export type CodeComplexity = 'simple' | 'medium' | 'complex';

// ============================================================
// Code Samples
// ============================================================

export interface CodeSample {
  /** Unique identifier */
  id: string;
  /** Descriptive name */
  name: string;
  /** Original Dart code */
  dartCode: string;
  /** COON-compressed code (generated dynamically by SDK) */
  coonCode: string;
  /** Minified Dart (whitespace removed) */
  minifiedCode: string;
  /** Code complexity level */
  complexity: CodeComplexity;
  /** List of widgets used */
  widgets: string[];
  /** Category (e.g., "widget", "screen", "state") */
  category: string;
  /** Optional description */
  description?: string;
}

/**
 * Source-only code sample definition.
 * COON code will be generated dynamically using the SDK.
 */
export interface CodeSampleSource {
  /** Unique identifier */
  id: string;
  /** Descriptive name */
  name: string;
  /** Original Dart code (source of truth) */
  dartCode: string;
  /** Code complexity level */
  complexity: CodeComplexity;
  /** List of widgets used */
  widgets: string[];
  /** Category (e.g., "widget", "screen", "state", "repository") */
  category: string;
  /** Optional description */
  description?: string;
}

// ============================================================
// Questions (Comprehension Benchmark)
// ============================================================

export interface Question {
  /** Unique question ID */
  id: string;
  /** Question type */
  type: QuestionType;
  /** Question prompt shown to LLM */
  prompt: string;
  /** COON code for this question */
  coonCode: string;
  /** Original Dart code */
  dartCode: string;
  /** Expected answer (ground truth) */
  groundTruth: string;
  /** Answer type for validation */
  answerType: AnswerType;
  /** Code sample this question is based on */
  sampleId: string;
  /** Optional normalization options */
  normalizationOptions?: NormalizationOptions;
}

export interface NormalizationOptions {
  /** Case-sensitive comparison */
  caseSensitive?: boolean;
  /** Numeric tolerance */
  tolerance?: number;
  /** Decimal places to round to */
  decimalPlaces?: number;
}

// ============================================================
// Generation Tasks (Generation Benchmark)
// ============================================================

export interface GenerationTask {
  /** Unique task ID */
  id: string;
  /** Task type */
  type: GenerationTaskType;
  /** Task prompt */
  prompt: string;
  /** Input code (Dart for dart-to-coon, COON for modification) */
  inputCode: string;
  /** Expected output (for validation) */
  expectedOutput?: string;
  /** Validation method */
  validationMethod: ValidationMethod;
  /** Requirements to check (for nl-to-coon) */
  requirements?: string[];
}

export type ValidationMethod =
  | 'exact-match'
  | 'semantic-equivalence'
  | 'syntax-valid'
  | 'contains-widget'
  | 'requirements-check'
  | 'behavior-check';

// ============================================================
// Modification Tasks (Modification Benchmark)
// ============================================================

export interface ModificationTask {
  /** Unique task ID */
  id: string;
  /** Modification type */
  type: ModificationTaskType;
  /** Task description */
  prompt: string;
  /** Input COON code */
  inputCoon: string;
  /** Expected behavior or output */
  expectedBehavior: string;
  /** Validation method */
  validationMethod: ValidationMethod;
}

// ============================================================
// Evaluation Results
// ============================================================

export interface EvaluationResult {
  /** Question or task ID */
  id: string;
  /** Format tested (coon, dart, minified) */
  format: CodeFormat;
  /** Model used */
  model: string;
  /** Expected answer */
  expected: string;
  /** Actual answer from LLM */
  actual: string;
  /** Whether answer was correct */
  isCorrect: boolean;
  /** Input tokens used */
  inputTokens: number;
  /** Output tokens used */
  outputTokens: number;
  /** Response latency in ms */
  latencyMs: number;
  /** Optional error message */
  error?: string;
}

export interface GenerationResult {
  /** Task ID */
  taskId: string;
  /** Model used */
  model: string;
  /** Generated COON code */
  generatedCode: string;
  /** Syntax validation result */
  syntaxValid: boolean;
  /** Whether code decompresses successfully */
  decompressable: boolean;
  /** Semantic equivalence (if applicable) */
  semanticallyCorrect?: boolean;
  /** Requirements met (for nl-to-coon) */
  requirementsMet?: Record<string, boolean>;
  /** Input tokens used */
  inputTokens: number;
  /** Output tokens used */
  outputTokens: number;
  /** Response latency in ms */
  latencyMs: number;
}

// ============================================================
// Aggregate Metrics
// ============================================================

export interface FormatMetrics {
  /** Format name */
  format: CodeFormat;
  /** Overall accuracy (0-1) */
  accuracy: number;
  /** Total questions answered */
  totalQuestions: number;
  /** Correct answers */
  correctAnswers: number;
  /** Average tokens per question */
  avgTokens: number;
  /** Average latency in ms */
  avgLatencyMs: number;
  /** Accuracy per 1K tokens */
  efficiencyScore: number;
}

export interface ModelMetrics {
  /** Model ID */
  model: string;
  /** Metrics by format */
  byFormat: Record<CodeFormat, FormatMetrics>;
  /** Overall accuracy */
  overallAccuracy: number;
  /** Total evaluations */
  totalEvaluations: number;
}

export interface BenchmarkSummary {
  /** Benchmark name */
  name: string;
  /** Total questions/tasks */
  totalItems: number;
  /** Models tested */
  models: string[];
  /** Formats tested */
  formats: CodeFormat[];
  /** Overall metrics */
  overall: {
    accuracy: number;
    avgTokens: number;
    avgLatencyMs: number;
  };
  /** Metrics by model */
  byModel: ModelMetrics[];
  /** Metrics by format */
  byFormat: FormatMetrics[];
  /** Metrics by question type */
  byQuestionType?: Record<QuestionType, FormatMetrics[]>;
}

// ============================================================
// Configuration
// ============================================================

export interface BenchmarkConfig {
  /** Models to test */
  models: string[];
  /** Formats to test */
  formats: CodeFormat[];
  /** Concurrency limit */
  concurrency: number;
  /** Rate limits per model (requests per minute) */
  rateLimits: Record<string, number>;
  /** Dry run mode (limited questions) */
  dryRun: boolean;
  /** Maximum questions in dry run */
  dryRunLimit: number;
}
