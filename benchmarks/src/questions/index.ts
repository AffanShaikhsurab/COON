/**
 * Question Generators for COON Benchmarks
 */

export { 
  generateComprehensionQuestions,
  getQuestionsByType,
} from './comprehension.js';

export { 
  generateGenerationTasks,
  getTasksByType,
  getTaskById,
  getTaskStats,
} from './generation.js';

export { 
  generateStructuralQuestions,
} from './structural.js';

// Logic comprehension (business logic, repositories, services, etc.)
export {
  generateLogicComprehensionQuestions,
  getLogicQuestionsByCategory,
  getLogicQuestionStats,
} from './logic-comprehension.js';

import { generateComprehensionQuestions } from './comprehension.js';
import { generateStructuralQuestions } from './structural.js';
import { generateLogicComprehensionQuestions } from './logic-comprehension.js';
import type { CodeSample } from '../types.js';

/**
 * Get statistics for comprehension questions
 */
export function getQuestionStats(samples?: CodeSample[]): {
  total: number;
  byType: Record<string, number>;
} {
  const questions = samples ? generateComprehensionQuestions(samples) : [];
  const structural = generateStructuralQuestions();
  const all = [...questions, ...structural];
  
  const byType: Record<string, number> = {};
  for (const q of all) {
    const type = q.type;
    byType[type] = (byType[type] || 0) + 1;
  }
  
  return { total: all.length, byType };
}

/**
 * Generate all questions (UI + Logic)
 */
export function generateAllQuestions(samples?: CodeSample[]) {
  const uiQuestions = samples ? generateComprehensionQuestions(samples) : [];
  const structuralQuestions = generateStructuralQuestions();
  const logicQuestions = generateLogicComprehensionQuestions();
  
  return {
    ui: [...uiQuestions, ...structuralQuestions],
    logic: logicQuestions,
    all: [...uiQuestions, ...structuralQuestions, ...logicQuestions],
  };
}

