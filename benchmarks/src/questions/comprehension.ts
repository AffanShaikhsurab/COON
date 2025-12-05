/**
 * Comprehension Questions for COON Benchmarks
 * 
 * Tests LLM's ability to understand COON-compressed code
 */

import type { Question, CodeSample, QuestionType, AnswerType } from '../types.js';
import { ALL_CODE_SAMPLES } from '../datasets.js';

// ============================================================
// Question Generators
// ============================================================

function createWidgetIdentificationQuestion(sample: CodeSample): Question {
  return {
    id: `widget-id-${sample.id}`,
    type: 'widget-identification',
    prompt: 'List all Flutter widgets used in this code (comma-separated, in any order).',
    coonCode: sample.coonCode,
    dartCode: sample.dartCode,
    groundTruth: sample.widgets.join(','),
    answerType: 'csv-list-unordered',
    sampleId: sample.id,
  };
}

function createWidgetCountQuestion(sample: CodeSample): Question {
  return {
    id: `widget-count-${sample.id}`,
    type: 'structure-understanding',
    prompt: 'How many unique widget types are used in this code?',
    coonCode: sample.coonCode,
    dartCode: sample.dartCode,
    groundTruth: String(sample.widgets.length),
    answerType: 'integer',
    sampleId: sample.id,
  };
}

function createRootWidgetQuestion(sample: CodeSample): Question | null {
  // For screen samples, the root widget is usually Scaffold
  // For simple widgets, it's the first widget
  if (sample.category === 'screen') {
    return {
      id: `root-widget-${sample.id}`,
      type: 'structure-understanding',
      prompt: 'What is the root widget returned by the build method?',
      coonCode: sample.coonCode,
      dartCode: sample.dartCode,
      groundTruth: 'Scaffold',
      answerType: 'widget-name',
      sampleId: sample.id,
    };
  }
  
  if (sample.widgets.length > 0) {
    return {
      id: `root-widget-${sample.id}`,
      type: 'structure-understanding',
      prompt: 'What is the outermost/root widget in this code?',
      coonCode: sample.coonCode,
      dartCode: sample.dartCode,
      groundTruth: sample.widgets[0],
      answerType: 'widget-name',
      sampleId: sample.id,
    };
  }
  
  return null;
}

function createChildrenCountQuestion(sample: CodeSample): Question | null {
  // Look for Column, Row, ListView, etc. with children
  const containerWidgets = ['Column', 'Row', 'ListView', 'Stack', 'Wrap'];
  const hasContainer = sample.widgets.some(w => containerWidgets.includes(w));
  
  if (!hasContainer) return null;
  
  // Count children from COON code - look for h:[...] pattern
  const childrenMatch = sample.coonCode.match(/h:\[([^\]]*)\]/);
  if (!childrenMatch) return null;
  
  // Count items by splitting on commas (simplified)
  const childrenStr = childrenMatch[1];
  const childCount = childrenStr.split(/,(?=[A-Z])/).length;
  
  return {
    id: `children-count-${sample.id}`,
    type: 'structure-understanding',
    prompt: 'How many direct children does the main layout widget (Column/Row/ListView) have?',
    coonCode: sample.coonCode,
    dartCode: sample.dartCode,
    groundTruth: String(childCount),
    answerType: 'integer',
    sampleId: sample.id,
  };
}

function createHasWidgetQuestion(sample: CodeSample, widgetName: string): Question | null {
  const hasWidget = sample.widgets.includes(widgetName);
  
  return {
    id: `has-${widgetName.toLowerCase()}-${sample.id}`,
    type: 'widget-identification',
    prompt: `Does this code contain a ${widgetName} widget? Answer YES or NO.`,
    coonCode: sample.coonCode,
    dartCode: sample.dartCode,
    groundTruth: hasWidget ? 'YES' : 'NO',
    answerType: 'boolean',
    sampleId: sample.id,
  };
}

function createTextContentQuestion(sample: CodeSample): Question | null {
  // Extract first text content from COON code
  const textMatch = sample.coonCode.match(/T['"]([^'"]+)['"]/);
  if (!textMatch) return null;
  
  return {
    id: `text-content-${sample.id}`,
    type: 'property-retrieval',
    prompt: 'What is the text content of the first Text widget?',
    coonCode: sample.coonCode,
    dartCode: sample.dartCode,
    groundTruth: textMatch[1],
    answerType: 'string',
    sampleId: sample.id,
  };
}

function createAppBarTitleQuestion(sample: CodeSample): Question | null {
  if (!sample.widgets.includes('AppBar')) return null;
  
  // Extract AppBar title from COON: B{t:T'Title'}
  const titleMatch = sample.coonCode.match(/B\{[^}]*t:T['"]([^'"]+)['"]/);
  if (!titleMatch) return null;
  
  return {
    id: `appbar-title-${sample.id}`,
    type: 'property-retrieval',
    prompt: 'What is the title text in the AppBar?',
    coonCode: sample.coonCode,
    dartCode: sample.dartCode,
    groundTruth: titleMatch[1],
    answerType: 'string',
    sampleId: sample.id,
  };
}

function createPaddingValueQuestion(sample: CodeSample): Question | null {
  // Look for @16 style padding
  const paddingMatch = sample.coonCode.match(/@(\d+)/);
  if (!paddingMatch) return null;
  
  return {
    id: `padding-value-${sample.id}`,
    type: 'property-retrieval',
    prompt: 'What is the padding value (in pixels) used for EdgeInsets.all?',
    coonCode: sample.coonCode,
    dartCode: sample.dartCode,
    groundTruth: paddingMatch[1],
    answerType: 'integer',
    sampleId: sample.id,
  };
}

function createClassNameQuestion(sample: CodeSample): Question | null {
  if (!sample.category.includes('screen') && sample.complexity === 'simple') {
    return null;
  }
  
  // Extract class name from COON: c:ClassName<
  const classMatch = sample.coonCode.match(/c:(\w+)</);
  if (!classMatch) return null;
  
  return {
    id: `class-name-${sample.id}`,
    type: 'structure-understanding',
    prompt: 'What is the name of the class defined in this code?',
    coonCode: sample.coonCode,
    dartCode: sample.dartCode,
    groundTruth: classMatch[1],
    answerType: 'string',
    sampleId: sample.id,
  };
}

function createWidgetParentQuestion(sample: CodeSample): Question | null {
  // Look for nested patterns like N{c:T'text'} (Center containing Text)
  const patterns = [
    { regex: /N\{c:T/, parent: 'Center', child: 'Text' },
    { regex: /P\{[^}]*c:/, parent: 'Padding', child: 'child widget' },
    { regex: /K\{[^}]*c:/, parent: 'Container', child: 'child widget' },
    { regex: /Ex\{c:/, parent: 'Expanded', child: 'child widget' },
  ];
  
  for (const pattern of patterns) {
    if (pattern.regex.test(sample.coonCode)) {
      return {
        id: `parent-of-${pattern.child.replace(' ', '-')}-${sample.id}`,
        type: 'relationship-mapping',
        prompt: `In this code, what widget is the immediate parent of the ${pattern.child}?`,
        coonCode: sample.coonCode,
        dartCode: sample.dartCode,
        groundTruth: pattern.parent,
        answerType: 'widget-name',
        sampleId: sample.id,
      };
    }
  }
  
  return null;
}

// ============================================================
// Main Generator
// ============================================================

export function generateComprehensionQuestions(
  samples: CodeSample[] = ALL_CODE_SAMPLES,
  options?: { maxPerSample?: number }
): Question[] {
  const maxPerSample = options?.maxPerSample ?? 5;
  const questions: Question[] = [];
  
  for (const sample of samples) {
    const sampleQuestions: (Question | null)[] = [
      createWidgetIdentificationQuestion(sample),
      createWidgetCountQuestion(sample),
      createRootWidgetQuestion(sample),
      createChildrenCountQuestion(sample),
      createTextContentQuestion(sample),
      createAppBarTitleQuestion(sample),
      createPaddingValueQuestion(sample),
      createClassNameQuestion(sample),
      createWidgetParentQuestion(sample),
      
      // Random widget presence checks
      createHasWidgetQuestion(sample, 'Scaffold'),
      createHasWidgetQuestion(sample, 'Column'),
      createHasWidgetQuestion(sample, 'Text'),
      createHasWidgetQuestion(sample, 'Container'),
    ];
    
    // Filter out nulls and limit per sample
    const validQuestions = sampleQuestions.filter(q => q !== null) as Question[];
    questions.push(...validQuestions.slice(0, maxPerSample));
  }
  
  return questions;
}

// ============================================================
// Predefined Question Sets
// ============================================================

export const WIDGET_IDENTIFICATION_QUESTIONS: Question[] = [
  {
    id: 'q001',
    type: 'widget-identification',
    prompt: 'List all Flutter widgets used in this code (comma-separated).',
    coonCode: `c:MyScreen<StatelessWidget>;m:b S{b:C{h:[T'Hello',E{c:T'Click',p:()=>print('Hi')}]}}`,
    dartCode: `class MyScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Text('Hello'),
          ElevatedButton(
            child: Text('Click'),
            onPressed: () => print('Hi'),
          ),
        ],
      ),
    );
  }
}`,
    groundTruth: 'Scaffold,Column,Text,ElevatedButton',
    answerType: 'csv-list-unordered',
    sampleId: 'predefined-001',
  },
  {
    id: 'q002',
    type: 'property-retrieval',
    prompt: 'What is the text content of the first Text widget?',
    coonCode: `c:MyWidget<StatelessWidget>;m:b S{b:P{p:@16,c:T'Welcome Back'}}`,
    dartCode: `class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Text('Welcome Back'),
      ),
    );
  }
}`,
    groundTruth: 'Welcome Back',
    answerType: 'string',
    sampleId: 'predefined-002',
  },
  {
    id: 'q003',
    type: 'structure-understanding',
    prompt: 'How many direct children does the Column widget have?',
    coonCode: `c:MyScreen<StatelessWidget>;m:b S{b:C{h:[T'One',T'Two',T'Three',Z{h:10}]}}`,
    dartCode: `class MyScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Text('One'),
          Text('Two'),
          Text('Three'),
          SizedBox(height: 10),
        ],
      ),
    );
  }
}`,
    groundTruth: '4',
    answerType: 'integer',
    sampleId: 'predefined-003',
  },
];

// ============================================================
// Get Questions by Type
// ============================================================

export function getQuestionsByType(type: QuestionType): Question[] {
  const allQuestions = generateComprehensionQuestions();
  return allQuestions.filter(q => q.type === type);
}

export function getQuestionStats() {
  const questions = generateComprehensionQuestions();
  const byType = questions.reduce((acc, q) => {
    acc[q.type] = (acc[q.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const byAnswerType = questions.reduce((acc, q) => {
    acc[q.answerType] = (acc[q.answerType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    total: questions.length,
    byType,
    byAnswerType,
  };
}
