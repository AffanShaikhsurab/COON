/**
 * Evaluation Logic for COON Benchmarks
 */

import type { 
  Question, 
  EvaluationResult, 
  GenerationTask, 
  GenerationResult,
  CodeFormat 
} from './types.js';
import type { ProviderInterface, ChatMessage } from './providers/types.js';
import { PRIMERS, ANSWER_FORMAT_INSTRUCTIONS } from './constants.js';
import { compareAnswers, extractAnswer, isValidCoonSyntax, containsWidgets } from './normalize.js';

// ============================================================
// Comprehension Evaluation
// ============================================================

/**
 * Build a prompt for comprehension questions
 */
function buildComprehensionPrompt(
  question: Question, 
  format: CodeFormat
): string {
  const code = format === 'coon' ? question.coonCode : 
               format === 'dart' ? question.dartCode :
               question.dartCode; // minified uses dart for now

  const primer = PRIMERS[format];
  const formatInstruction = ANSWER_FORMAT_INSTRUCTIONS[question.answerType] || '';
  const formatLabel = format === 'coon' ? 'COON-compressed' : 
                      format === 'minified' ? 'minified Dart' : 'Dart';

  return `${primer}

Given the following ${formatLabel} code:

\`\`\`${format === 'coon' ? 'coon' : 'dart'}
${code}
\`\`\`

Question: ${question.prompt}

${formatInstruction}

Answer:`;
}

/**
 * Evaluate a single comprehension question
 */
export async function evaluateComprehension(
  question: Question,
  format: CodeFormat,
  provider: ProviderInterface
): Promise<EvaluationResult> {
  const prompt = buildComprehensionPrompt(question, format);
  
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: 'You are a code analysis assistant. IMPORTANT: Give ONLY the direct answer - no explanations, no reasoning, no code blocks, no markdown. Just the answer value itself (e.g., "Text", "3", "YES", "Container,Row,Column"). One word or short phrase only.',
    },
    {
      role: 'user',
      content: prompt,
    },
  ];

  const startTime = Date.now();
  const response = await provider.chat(messages, {
    temperature: 0.1,
    maxTokens: 256,
  });
  const latencyMs = Date.now() - startTime;

  if (response.error) {
    return {
      id: question.id,
      format,
      model: provider.model,
      expected: question.groundTruth,
      actual: '',
      isCorrect: false,
      inputTokens: response.inputTokens,
      outputTokens: response.outputTokens,
      latencyMs,
      error: response.error,
    };
  }

  const extractedAnswer = extractAnswer(response.content, question.answerType);
  const isCorrect = compareAnswers(
    extractedAnswer,
    question.groundTruth,
    question.answerType,
    question.normalizationOptions
  );

  return {
    id: question.id,
    format,
    model: provider.model,
    expected: question.groundTruth,
    actual: extractedAnswer,
    isCorrect,
    inputTokens: response.inputTokens,
    outputTokens: response.outputTokens,
    latencyMs,
  };
}

// ============================================================
// Generation Evaluation
// ============================================================

/**
 * Build a prompt for generation tasks
 */
function buildGenerationPrompt(task: GenerationTask): string {
  const primer = PRIMERS.coon;
  
  let prompt = `${primer}

${task.prompt}

`;

  if (task.inputCode) {
    prompt += `Input:
\`\`\`
${task.inputCode}
\`\`\`

`;
  }

  if (task.type === 'nl-to-coon') {
    prompt += `Generate valid COON code that satisfies the requirements.`;
  } else if (task.type === 'dart-to-coon') {
    prompt += `Convert the Dart code to COON format only. Output just the COON code.`;
  } else if (task.type === 'coon-modification') {
    prompt += `Output the modified COON code only.`;
  } else if (task.type === 'coon-completion') {
    prompt += `Complete the COON code. Output the full completed code only.`;
  }

  prompt += `

Output (COON code only):`;

  return prompt;
}

/**
 * Evaluate a single generation task
 */
export async function evaluateGeneration(
  task: GenerationTask,
  provider: ProviderInterface
): Promise<GenerationResult> {
  const prompt = buildGenerationPrompt(task);
  
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: 'You are an expert at COON (Code-Oriented Object Notation) format. Generate only valid COON code without explanations.',
    },
    {
      role: 'user',
      content: prompt,
    },
  ];

  const startTime = Date.now();
  const response = await provider.chat(messages, {
    temperature: 0.1,
    maxTokens: 1024,
  });
  const latencyMs = Date.now() - startTime;

  // Extract code from response (remove markdown fences if present)
  let generatedCode = response.content
    .replace(/```coon\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  // Validate syntax
  const syntaxValid = isValidCoonSyntax(generatedCode);
  
  // Check requirements if applicable
  let requirementsMet: Record<string, boolean> | undefined;
  if (task.requirements && task.requirements.length > 0) {
    requirementsMet = containsWidgets(generatedCode, task.requirements);
  }

  // Determine semantic correctness based on validation method
  let semanticallyCorrect: boolean | undefined;
  
  switch (task.validationMethod) {
    case 'exact-match':
      semanticallyCorrect = generatedCode === task.expectedOutput;
      break;
    case 'syntax-valid':
      semanticallyCorrect = syntaxValid;
      break;
    case 'contains-widget':
      if (task.requirements) {
        semanticallyCorrect = Object.values(containsWidgets(generatedCode, task.requirements))
          .every(v => v);
      }
      break;
    case 'requirements-check':
      if (requirementsMet) {
        semanticallyCorrect = Object.values(requirementsMet).every(v => v);
      }
      break;
    case 'semantic-equivalence':
      // For semantic equivalence, we do a relaxed comparison
      // Check if key widgets and structure are present
      if (task.expectedOutput) {
        const expectedWidgets = task.expectedOutput.match(/[A-Z][a-z]*/g) || [];
        const generatedWidgets = generatedCode.match(/[A-Z][a-z]*/g) || [];
        const expectedSet = new Set(expectedWidgets);
        const generatedSet = new Set(generatedWidgets);
        // At least 70% of expected widgets should be present
        const matches = [...expectedSet].filter(w => generatedSet.has(w)).length;
        semanticallyCorrect = matches / expectedSet.size >= 0.7;
      }
      break;
  }

  return {
    taskId: task.id,
    model: provider.model,
    generatedCode,
    syntaxValid,
    decompressable: syntaxValid, // Simplified: assume valid syntax = decompressable
    semanticallyCorrect,
    requirementsMet,
    inputTokens: response.inputTokens,
    outputTokens: response.outputTokens,
    latencyMs,
  };
}

// ============================================================
// Batch Evaluation
// ============================================================

export interface BatchEvaluationOptions {
  onProgress?: (completed: number, total: number) => void;
  delayMs?: number;
}

/**
 * Evaluate multiple comprehension questions
 */
export async function evaluateComprehensionBatch(
  questions: Question[],
  formats: CodeFormat[],
  provider: ProviderInterface,
  options?: BatchEvaluationOptions
): Promise<EvaluationResult[]> {
  const results: EvaluationResult[] = [];
  const total = questions.length * formats.length;
  let completed = 0;

  for (const question of questions) {
    for (const format of formats) {
      const result = await evaluateComprehension(question, format, provider);
      results.push(result);
      completed++;
      
      if (options?.onProgress) {
        options.onProgress(completed, total);
      }
      
      if (options?.delayMs && completed < total) {
        await sleep(options.delayMs);
      }
    }
  }

  return results;
}

/**
 * Evaluate multiple generation tasks
 */
export async function evaluateGenerationBatch(
  tasks: GenerationTask[],
  provider: ProviderInterface,
  options?: BatchEvaluationOptions
): Promise<GenerationResult[]> {
  const results: GenerationResult[] = [];
  let completed = 0;

  for (const task of tasks) {
    const result = await evaluateGeneration(task, provider);
    results.push(result);
    completed++;
    
    if (options?.onProgress) {
      options.onProgress(completed, tasks.length);
    }
    
    if (options?.delayMs && completed < tasks.length) {
      await sleep(options.delayMs);
    }
  }

  return results;
}

// ============================================================
// Helpers
// ============================================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
