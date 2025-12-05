/**
 * Logic Comprehension Questions for COON Benchmarks
 * 
 * Tests LLM's ability to understand COON-compressed business logic code
 * (repositories, services, state management, models)
 */

import type { Question, CodeSample } from '../types.js';
import { ALL_LOGIC_SAMPLES } from '../datasets-logic.js';

// ============================================================
// Question Generators for Business Logic
// ============================================================

/**
 * Generate questions about method return types
 */
function createReturnTypeQuestion(sample: CodeSample): Question | null {
  // Look for method signatures with return types
  const methodMatch = sample.coonCode.match(/m:(\w+)\([^)]*\)(?:asy)?->(\w+[<>\w,]*)/);
  if (!methodMatch) return null;
  
  const [, methodName, returnType] = methodMatch;
  
  return {
    id: `return-type-${sample.id}`,
    type: 'property-retrieval',
    prompt: `What is the return type of the ${methodName} method?`,
    coonCode: sample.coonCode,
    dartCode: sample.dartCode,
    groundTruth: returnType.replace(/[<>]/g, (match: string) => match === '<' ? '<' : '>'),
    answerType: 'string',
    sampleId: sample.id,
  };
}

/**
 * Generate questions about class fields
 */
function createFieldCountQuestion(sample: CodeSample): Question | null {
  // Look for field declarations: f:field1:Type,field2:Type
  const fieldsMatch = sample.coonCode.match(/f:([^;]+);/);
  if (!fieldsMatch) return null;
  
  // Count fields by splitting on commas (accounting for generics)
  const fieldsStr = fieldsMatch[1];
  let depth = 0;
  let count = 1;
  for (const char of fieldsStr) {
    if (char === '<') depth++;
    else if (char === '>') depth--;
    else if (char === ',' && depth === 0) count++;
  }
  
  return {
    id: `field-count-${sample.id}`,
    type: 'structure-understanding',
    prompt: 'How many fields/properties are declared in this class?',
    coonCode: sample.coonCode,
    dartCode: sample.dartCode,
    groundTruth: String(count),
    answerType: 'integer',
    sampleId: sample.id,
  };
}

/**
 * Generate questions about method count
 */
function createMethodCountQuestion(sample: CodeSample): Question | null {
  // Count methods by m: prefix
  const methodMatches = sample.coonCode.match(/m:/g);
  if (!methodMatches || methodMatches.length === 0) return null;
  
  return {
    id: `method-count-${sample.id}`,
    type: 'structure-understanding',
    prompt: 'How many methods are defined in this class?',
    coonCode: sample.coonCode,
    dartCode: sample.dartCode,
    groundTruth: String(methodMatches.length),
    answerType: 'integer',
    sampleId: sample.id,
  };
}

/**
 * Generate questions about async methods
 */
function createAsyncMethodQuestion(sample: CodeSample): Question | null {
  const hasAsync = sample.coonCode.includes('asy');
  
  return {
    id: `has-async-${sample.id}`,
    type: 'semantic-analysis',
    prompt: 'Does this code contain any async methods? Answer YES or NO.',
    coonCode: sample.coonCode,
    dartCode: sample.dartCode,
    groundTruth: hasAsync ? 'YES' : 'NO',
    answerType: 'boolean',
    sampleId: sample.id,
  };
}

/**
 * Generate questions about error handling
 */
function createErrorHandlingQuestion(sample: CodeSample): Question | null {
  const hasTryCatch = sample.coonCode.includes('try{') || sample.coonCode.includes('catch(');
  const hasOnException = sample.coonCode.includes('on ') && sample.coonCode.includes('Exception');
  
  if (!hasTryCatch && !hasOnException) return null;
  
  return {
    id: `error-handling-${sample.id}`,
    type: 'semantic-analysis',
    prompt: 'Does this code implement try-catch error handling? Answer YES or NO.',
    coonCode: sample.coonCode,
    dartCode: sample.dartCode,
    groundTruth: 'YES',
    answerType: 'boolean',
    sampleId: sample.id,
  };
}

/**
 * Generate questions about inheritance/implementation
 */
function createInheritanceQuestion(sample: CodeSample): Question | null {
  // Look for extends (<) or implements (>)
  const extendsMatch = sample.coonCode.match(/c:\w+<(\w+[<>\w,]*)/);
  const implementsMatch = sample.coonCode.match(/c:\w+>(\w+)/);
  
  if (!extendsMatch && !implementsMatch) return null;
  
  if (extendsMatch) {
    return {
      id: `extends-${sample.id}`,
      type: 'relationship-mapping',
      prompt: 'What class does this class extend?',
      coonCode: sample.coonCode,
      dartCode: sample.dartCode,
      groundTruth: extendsMatch[1].replace(/<.*>/, ''), // Remove generics for comparison
      answerType: 'string',
      sampleId: sample.id,
    };
  }
  
  if (implementsMatch) {
    return {
      id: `implements-${sample.id}`,
      type: 'relationship-mapping',
      prompt: 'What interface does this class implement?',
      coonCode: sample.coonCode,
      dartCode: sample.dartCode,
      groundTruth: implementsMatch[1],
      answerType: 'string',
      sampleId: sample.id,
    };
  }
  
  return null;
}

/**
 * Generate questions about dependencies (injected via constructor)
 */
function createDependencyQuestion(sample: CodeSample): Question | null {
  // Look for this. in constructor indicating dependency injection
  const constructorMatch = sample.coonCode.match(/~\(this\.(\w+)/);
  if (!constructorMatch) return null;
  
  // Count all this.X dependencies
  const thisMatches = sample.coonCode.match(/this\.\w+/g);
  if (!thisMatches) return null;
  
  const uniqueDeps = new Set(thisMatches.map((m: string) => m.replace('this.', '')));
  
  return {
    id: `dependency-count-${sample.id}`,
    type: 'structure-understanding',
    prompt: 'How many dependencies are injected via the constructor?',
    coonCode: sample.coonCode,
    dartCode: sample.dartCode,
    groundTruth: String(uniqueDeps.size),
    answerType: 'integer',
    sampleId: sample.id,
  };
}

/**
 * Generate questions about state emits (for BLoC/Cubit)
 */
function createStateEmitQuestion(sample: CodeSample): Question | null {
  if (sample.category !== 'state-management') return null;
  
  // Count emit() calls
  const emitMatches = sample.coonCode.match(/emit\(/g);
  if (!emitMatches) return null;
  
  return {
    id: `emit-count-${sample.id}`,
    type: 'semantic-analysis',
    prompt: 'How many times does this code emit a new state?',
    coonCode: sample.coonCode,
    dartCode: sample.dartCode,
    groundTruth: String(emitMatches.length),
    answerType: 'integer',
    sampleId: sample.id,
  };
}

/**
 * Generate questions about specific method names
 */
function createMethodIdentificationQuestion(sample: CodeSample): Question | null {
  // Extract all method names
  const methodMatches = sample.coonCode.matchAll(/m:(\w+)/g);
  const methods = [...methodMatches].map(m => m[1]);
  
  if (methods.length === 0) return null;
  
  return {
    id: `method-list-${sample.id}`,
    type: 'structure-understanding',
    prompt: 'List all method names defined in this class (comma-separated).',
    coonCode: sample.coonCode,
    dartCode: sample.dartCode,
    groundTruth: methods.join(','),
    answerType: 'csv-list-unordered',
    sampleId: sample.id,
  };
}

/**
 * Generate questions about getters
 */
function createGetterQuestion(sample: CodeSample): Question | null {
  // Look for getters: get propertyName
  const getterMatches = sample.coonCode.match(/get \w+/g);
  if (!getterMatches || getterMatches.length === 0) return null;
  
  return {
    id: `getter-count-${sample.id}`,
    type: 'structure-understanding',
    prompt: 'How many getter properties are defined in this class?',
    coonCode: sample.coonCode,
    dartCode: sample.dartCode,
    groundTruth: String(getterMatches.length),
    answerType: 'integer',
    sampleId: sample.id,
  };
}

/**
 * Generate questions about class name
 */
function createClassNameQuestion(sample: CodeSample): Question | null {
  const classMatch = sample.coonCode.match(/c:(\w+)/);
  if (!classMatch) return null;
  
  return {
    id: `class-name-${sample.id}`,
    type: 'structure-understanding',
    prompt: 'What is the name of the main class in this code?',
    coonCode: sample.coonCode,
    dartCode: sample.dartCode,
    groundTruth: classMatch[1],
    answerType: 'string',
    sampleId: sample.id,
  };
}

/**
 * Generate questions about factory constructors
 */
function createFactoryQuestion(sample: CodeSample): Question | null {
  const hasFactory = sample.coonCode.includes('factory ~');
  
  return {
    id: `has-factory-${sample.id}`,
    type: 'semantic-analysis',
    prompt: 'Does this class have a factory constructor? Answer YES or NO.',
    coonCode: sample.coonCode,
    dartCode: sample.dartCode,
    groundTruth: hasFactory ? 'YES' : 'NO',
    answerType: 'boolean',
    sampleId: sample.id,
  };
}

/**
 * Generate questions about static methods
 */
function createStaticMethodQuestion(sample: CodeSample): Question | null {
  const staticMatches = sample.coonCode.match(/st:m:/g);
  if (!staticMatches) return null;
  
  return {
    id: `static-method-count-${sample.id}`,
    type: 'structure-understanding',
    prompt: 'How many static methods are defined in this class?',
    coonCode: sample.coonCode,
    dartCode: sample.dartCode,
    groundTruth: String(staticMatches.length),
    answerType: 'integer',
    sampleId: sample.id,
  };
}

/**
 * Generate questions about null checks
 */
function createNullHandlingQuestion(sample: CodeSample): Question | null {
  const hasNullCheck = sample.coonCode.includes('!=_') || sample.coonCode.includes('==_') || 
                       sample.coonCode.includes('??') || sample.coonCode.includes('?.');
  
  return {
    id: `null-handling-${sample.id}`,
    type: 'semantic-analysis',
    prompt: 'Does this code contain null checks or null-aware operators? Answer YES or NO.',
    coonCode: sample.coonCode,
    dartCode: sample.dartCode,
    groundTruth: hasNullCheck ? 'YES' : 'NO',
    answerType: 'boolean',
    sampleId: sample.id,
  };
}

/**
 * Generate questions about await usage
 */
function createAwaitCountQuestion(sample: CodeSample): Question | null {
  const awaitMatches = sample.coonCode.match(/awt /g);
  if (!awaitMatches) return null;
  
  return {
    id: `await-count-${sample.id}`,
    type: 'semantic-analysis',
    prompt: 'How many await expressions are used in this code?',
    coonCode: sample.coonCode,
    dartCode: sample.dartCode,
    groundTruth: String(awaitMatches.length),
    answerType: 'integer',
    sampleId: sample.id,
  };
}

// ============================================================
// EXTREMELY CHALLENGING EDGE CASE QUESTIONS
// ============================================================

/**
 * Generate complex questions about generic type parameters
 */
function createGenericTypeQuestion(sample: CodeSample): Question | null {
  // Check for generic types like <T>, <K, V>, etc.
  const genericMatch = sample.coonCode.match(/c:\w+<(\w+(?:,\s*\w+)*)>/);
  if (!genericMatch) return null;
  
  const typeParams = genericMatch[1].split(',').map(t => t.trim());
  
  return {
    id: `generic-types-${sample.id}`,
    type: 'semantic-analysis',
    prompt: 'What are the generic type parameters of this class? List them comma-separated.',
    coonCode: sample.coonCode,
    dartCode: sample.dartCode,
    groundTruth: typeParams.join(','),
    answerType: 'csv-list-ordered',
    sampleId: sample.id,
  };
}

/**
 * Questions about mixin usage
 */
function createMixinQuestion(sample: CodeSample): Question | null {
  // Look for mixin usage (mixin M on B or with mixins)
  const hasMixin = sample.coonCode.includes('mixin ') || sample.dartCode.includes('with ');
  const mixinOnMatch = sample.coonCode.match(/mixin \w+ on (\w+)/);
  
  if (!hasMixin) return null;
  
  if (mixinOnMatch) {
    return {
      id: `mixin-constraint-${sample.id}`,
      type: 'relationship-mapping',
      prompt: 'What class does the mixin have as its "on" constraint?',
      coonCode: sample.coonCode,
      dartCode: sample.dartCode,
      groundTruth: mixinOnMatch[1],
      answerType: 'string',
      sampleId: sample.id,
    };
  }
  
  return {
    id: `has-mixin-${sample.id}`,
    type: 'semantic-analysis',
    prompt: 'Does this code use mixins? Answer YES or NO.',
    coonCode: sample.coonCode,
    dartCode: sample.dartCode,
    groundTruth: 'YES',
    answerType: 'boolean',
    sampleId: sample.id,
  };
}

/**
 * Questions about stream transformations
 */
function createStreamTransformerQuestion(sample: CodeSample): Question | null {
  const hasStreamTransformer = sample.coonCode.includes('StreamTransformer') || 
                                sample.dartCode.includes('StreamTransformer');
  
  if (!hasStreamTransformer) return null;
  
  // Look for bind method which is key in StreamTransformer
  const hasBindMethod = sample.coonCode.includes('m:bind');
  
  return {
    id: `stream-transform-${sample.id}`,
    type: 'semantic-analysis',
    prompt: 'Does this StreamTransformer implement the bind method? Answer YES or NO.',
    coonCode: sample.coonCode,
    dartCode: sample.dartCode,
    groundTruth: hasBindMethod ? 'YES' : 'NO',
    answerType: 'boolean',
    sampleId: sample.id,
  };
}

/**
 * Complex algorithmic questions - find specific operations
 */
function createAlgorithmicQuestion(sample: CodeSample): Question | null {
  // Rate limiter specific
  if (sample.id === 'rate-limiter') {
    const hasRemoveWhere = sample.coonCode.includes('removeWhere') || 
                           sample.dartCode.includes('removeWhere');
    return {
      id: `algorithm-cleanup-${sample.id}`,
      type: 'semantic-analysis',
      prompt: 'Does this rate limiter clean up old requests from its window? Answer YES or NO.',
      coonCode: sample.coonCode,
      dartCode: sample.dartCode,
      groundTruth: hasRemoveWhere ? 'YES' : 'NO',
      answerType: 'boolean',
      sampleId: sample.id,
    };
  }
  
  // Circuit breaker specific
  if (sample.id === 'circuit-breaker') {
    const stateCount = (sample.dartCode.match(/CircuitState\.\w+/g) || []).length;
    const uniqueStates = new Set((sample.dartCode.match(/CircuitState\.(\w+)/g) || []).map(s => s.split('.')[1]));
    return {
      id: `circuit-states-${sample.id}`,
      type: 'structure-understanding',
      prompt: 'How many distinct circuit states are referenced in this code?',
      coonCode: sample.coonCode,
      dartCode: sample.dartCode,
      groundTruth: String(uniqueStates.size),
      answerType: 'integer',
      sampleId: sample.id,
    };
  }
  
  return null;
}

/**
 * Questions about callbacks and function types
 */
function createCallbackTypeQuestion(sample: CodeSample): Question | null {
  // Look for Function type or callback patterns
  const callbackMatches = sample.dartCode.match(/(\w+)\s*Function/g);
  if (!callbackMatches || callbackMatches.length === 0) return null;
  
  return {
    id: `callback-count-${sample.id}`,
    type: 'structure-understanding',
    prompt: 'How many callback function type parameters are declared in this code?',
    coonCode: sample.coonCode,
    dartCode: sample.dartCode,
    groundTruth: String(callbackMatches.length),
    answerType: 'integer',
    sampleId: sample.id,
  };
}

/**
 * Questions about private fields (underscore prefix)
 */
function createPrivateFieldQuestion(sample: CodeSample): Question | null {
  // Count _underscore prefixed fields
  const privateFields = sample.dartCode.match(/\b_\w+(?=\s*[;=])/g);
  if (!privateFields || privateFields.length === 0) return null;
  
  const unique = new Set(privateFields);
  
  return {
    id: `private-field-count-${sample.id}`,
    type: 'structure-understanding',
    prompt: 'How many private fields (underscore-prefixed) are in this class?',
    coonCode: sample.coonCode,
    dartCode: sample.dartCode,
    groundTruth: String(unique.size),
    answerType: 'integer',
    sampleId: sample.id,
  };
}

/**
 * Questions about recursion
 */
function createRecursionQuestion(sample: CodeSample): Question | null {
  // Check if a method calls itself
  const methodNames = [...sample.dartCode.matchAll(/(\w+)\s*\([^)]*\)\s*(?:async\s*)?\{/g)]
    .map(m => m[1])
    .filter(name => name !== 'if' && name !== 'while' && name !== 'for');
  
  let hasRecursion = false;
  for (const methodName of methodNames) {
    // Check if this method name appears as a call inside its body
    const methodRegex = new RegExp(`${methodName}\\s*\\([^)]*\\)\\s*(?:async\\s*)?\\{[^}]*${methodName}\\s*\\(`);
    if (methodRegex.test(sample.dartCode)) {
      hasRecursion = true;
      break;
    }
  }
  
  // Simple check - see if any method name appears more than once
  for (const methodName of methodNames) {
    const calls = sample.dartCode.match(new RegExp(`\\b${methodName}\\s*\\(`, 'g'));
    if (calls && calls.length > 1) {
      hasRecursion = true;
      break;
    }
  }
  
  return {
    id: `has-recursion-${sample.id}`,
    type: 'semantic-analysis',
    prompt: 'Does this code use recursion (a method calling itself)? Answer YES or NO.',
    coonCode: sample.coonCode,
    dartCode: sample.dartCode,
    groundTruth: hasRecursion ? 'YES' : 'NO',
    answerType: 'boolean',
    sampleId: sample.id,
  };
}

/**
 * Questions about late/lazy initialization
 */
function createLateInitQuestion(sample: CodeSample): Question | null {
  const lateCount = (sample.dartCode.match(/\blate\b/g) || []).length;
  
  return {
    id: `late-init-${sample.id}`,
    type: 'semantic-analysis',
    prompt: 'Does this code use late initialization (late keyword)? Answer YES or NO.',
    coonCode: sample.coonCode,
    dartCode: sample.dartCode,
    groundTruth: lateCount > 0 ? 'YES' : 'NO',
    answerType: 'boolean',
    sampleId: sample.id,
  };
}

/**
 * Questions about exception/rethrow patterns
 */
function createExceptionPatternQuestion(sample: CodeSample): Question | null {
  const hasRethrow = sample.dartCode.includes('rethrow') || sample.coonCode.includes('rethrow');
  const hasCustomException = sample.dartCode.includes('Exception(') || sample.dartCode.includes('Error(');
  
  if (!hasRethrow && !hasCustomException) return null;
  
  return {
    id: `exception-pattern-${sample.id}`,
    type: 'semantic-analysis',
    prompt: 'Does this code rethrow exceptions or create custom exceptions? Answer YES or NO.',
    coonCode: sample.coonCode,
    dartCode: sample.dartCode,
    groundTruth: 'YES',
    answerType: 'boolean',
    sampleId: sample.id,
  };
}

/**
 * Questions about singleton patterns
 */
function createSingletonQuestion(sample: CodeSample): Question | null {
  const hasSingleton = sample.dartCode.includes('static final') && 
                       sample.dartCode.includes('_instance') ||
                       sample.dartCode.includes('factory ') && 
                       sample.dartCode.includes('_instance');
  
  return {
    id: `is-singleton-${sample.id}`,
    type: 'pattern-recognition',
    prompt: 'Does this class implement the Singleton pattern? Answer YES or NO.',
    coonCode: sample.coonCode,
    dartCode: sample.dartCode,
    groundTruth: hasSingleton ? 'YES' : 'NO',
    answerType: 'boolean',
    sampleId: sample.id,
  };
}

/**
 * Deep nested structure questions
 */
function createNestedStructureQuestion(sample: CodeSample): Question | null {
  // Count nesting depth by tracking braces
  let maxDepth = 0;
  let currentDepth = 0;
  for (const char of sample.dartCode) {
    if (char === '{') {
      currentDepth++;
      maxDepth = Math.max(maxDepth, currentDepth);
    } else if (char === '}') {
      currentDepth--;
    }
  }
  
  if (maxDepth < 4) return null; // Only ask for deeply nested code
  
  return {
    id: `nesting-depth-${sample.id}`,
    type: 'structure-understanding',
    prompt: 'What is the maximum brace nesting depth in this code?',
    coonCode: sample.coonCode,
    dartCode: sample.dartCode,
    groundTruth: String(maxDepth),
    answerType: 'integer',
    sampleId: sample.id,
  };
}

// ============================================================
// Main Question Generator
// ============================================================

/**
 * Generate all logic comprehension questions
 */
export function generateLogicComprehensionQuestions(): Question[] {
  const questions: Question[] = [];
  
  for (const sample of ALL_LOGIC_SAMPLES) {
    // Structure questions
    const classNameQ = createClassNameQuestion(sample);
    if (classNameQ) questions.push(classNameQ);
    
    const fieldCountQ = createFieldCountQuestion(sample);
    if (fieldCountQ) questions.push(fieldCountQ);
    
    const methodCountQ = createMethodCountQuestion(sample);
    if (methodCountQ) questions.push(methodCountQ);
    
    const methodListQ = createMethodIdentificationQuestion(sample);
    if (methodListQ) questions.push(methodListQ);
    
    const getterQ = createGetterQuestion(sample);
    if (getterQ) questions.push(getterQ);
    
    // Type/signature questions
    const returnTypeQ = createReturnTypeQuestion(sample);
    if (returnTypeQ) questions.push(returnTypeQ);
    
    // Relationship questions
    const inheritanceQ = createInheritanceQuestion(sample);
    if (inheritanceQ) questions.push(inheritanceQ);
    
    const dependencyQ = createDependencyQuestion(sample);
    if (dependencyQ) questions.push(dependencyQ);
    
    // Semantic questions
    const asyncQ = createAsyncMethodQuestion(sample);
    if (asyncQ) questions.push(asyncQ);
    
    const errorQ = createErrorHandlingQuestion(sample);
    if (errorQ) questions.push(errorQ);
    
    const stateEmitQ = createStateEmitQuestion(sample);
    if (stateEmitQ) questions.push(stateEmitQ);
    
    const factoryQ = createFactoryQuestion(sample);
    if (factoryQ) questions.push(factoryQ);
    
    const staticQ = createStaticMethodQuestion(sample);
    if (staticQ) questions.push(staticQ);
    
    const nullQ = createNullHandlingQuestion(sample);
    if (nullQ) questions.push(nullQ);
    
    const awaitQ = createAwaitCountQuestion(sample);
    if (awaitQ) questions.push(awaitQ);
    
    // =====================================================
    // ADVANCED EDGE CASE QUESTIONS (for harder samples)
    // =====================================================
    
    // Generic type questions
    const genericQ = createGenericTypeQuestion(sample);
    if (genericQ) questions.push(genericQ);
    
    // Mixin questions  
    const mixinQ = createMixinQuestion(sample);
    if (mixinQ) questions.push(mixinQ);
    
    // Stream transformer questions
    const streamQ = createStreamTransformerQuestion(sample);
    if (streamQ) questions.push(streamQ);
    
    // Algorithmic questions (rate limiter, circuit breaker)
    const algoQ = createAlgorithmicQuestion(sample);
    if (algoQ) questions.push(algoQ);
    
    // Callback type questions
    const callbackQ = createCallbackTypeQuestion(sample);
    if (callbackQ) questions.push(callbackQ);
    
    // Private field questions
    const privateQ = createPrivateFieldQuestion(sample);
    if (privateQ) questions.push(privateQ);
    
    // Recursion questions
    const recursionQ = createRecursionQuestion(sample);
    if (recursionQ) questions.push(recursionQ);
    
    // Late initialization questions
    const lateQ = createLateInitQuestion(sample);
    if (lateQ) questions.push(lateQ);
    
    // Exception pattern questions
    const exceptionQ = createExceptionPatternQuestion(sample);
    if (exceptionQ) questions.push(exceptionQ);
    
    // Singleton pattern questions
    const singletonQ = createSingletonQuestion(sample);
    if (singletonQ) questions.push(singletonQ);
    
    // Nesting depth questions
    const nestingQ = createNestedStructureQuestion(sample);
    if (nestingQ) questions.push(nestingQ);
  }
  
  return questions;
}

/**
 * Get questions by category
 */
export function getLogicQuestionsByCategory(category: string): Question[] {
  return generateLogicComprehensionQuestions().filter(q => {
    const sample = ALL_LOGIC_SAMPLES.find((s: CodeSample) => s.id === q.sampleId);
    return sample?.category === category;
  });
}

/**
 * Get logic question statistics
 */
export function getLogicQuestionStats() {
  const questions = generateLogicComprehensionQuestions();
  
  const byType: Record<string, number> = {};
  for (const q of questions) {
    byType[q.type] = (byType[q.type] || 0) + 1;
  }
  
  const byCategory: Record<string, number> = {};
  for (const q of questions) {
    const sample = ALL_LOGIC_SAMPLES.find((s: CodeSample) => s.id === q.sampleId);
    if (sample) {
      byCategory[sample.category] = (byCategory[sample.category] || 0) + 1;
    }
  }
  
  return {
    total: questions.length,
    byType,
    byCategory,
  };
}
