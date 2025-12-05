/**
 * Structural Questions for COON Benchmarks
 * 
 * Tests LLM's understanding of COON format conventions
 */

import type { Question, AnswerType } from '../types.js';

// ============================================================
// Abbreviation Recognition Questions
// ============================================================

const abbreviationQuestions: Question[] = [
  {
    id: 'struct-abbrev-001',
    type: 'structural-awareness',
    prompt: 'What Flutter widget does "S" represent in COON format?',
    coonCode: 'S{b:T"Hello"}',
    dartCode: 'Scaffold(body: Text("Hello"))',
    groundTruth: 'Scaffold',
    answerType: 'widget-name',
    sampleId: 'struct-001',
  },
  {
    id: 'struct-abbrev-002',
    type: 'structural-awareness',
    prompt: 'What Flutter widget does "C" represent in COON format?',
    coonCode: 'C{h:[T"1",T"2"]}',
    dartCode: 'Column(children: [Text("1"), Text("2")])',
    groundTruth: 'Column',
    answerType: 'widget-name',
    sampleId: 'struct-002',
  },
  {
    id: 'struct-abbrev-003',
    type: 'structural-awareness',
    prompt: 'What Flutter widget does "R" represent in COON format?',
    coonCode: 'R{h:[T"A",T"B"]}',
    dartCode: 'Row(children: [Text("A"), Text("B")])',
    groundTruth: 'Row',
    answerType: 'widget-name',
    sampleId: 'struct-003',
  },
  {
    id: 'struct-abbrev-004',
    type: 'structural-awareness',
    prompt: 'What Flutter widget does "K" represent in COON format?',
    coonCode: 'K{p:@16}',
    dartCode: 'Container(padding: EdgeInsets.all(16))',
    groundTruth: 'Container',
    answerType: 'widget-name',
    sampleId: 'struct-004',
  },
  {
    id: 'struct-abbrev-005',
    type: 'structural-awareness',
    prompt: 'What Flutter widget does "N" represent in COON format?',
    coonCode: 'N{c:T"Centered"}',
    dartCode: 'Center(child: Text("Centered"))',
    groundTruth: 'Center',
    answerType: 'widget-name',
    sampleId: 'struct-005',
  },
  {
    id: 'struct-abbrev-006',
    type: 'structural-awareness',
    prompt: 'What Flutter widget does "P" represent in COON format?',
    coonCode: 'P{p:@8,c:T"Padded"}',
    dartCode: 'Padding(padding: EdgeInsets.all(8), child: Text("Padded"))',
    groundTruth: 'Padding',
    answerType: 'widget-name',
    sampleId: 'struct-006',
  },
  {
    id: 'struct-abbrev-007',
    type: 'structural-awareness',
    prompt: 'What Flutter widget does "B" represent in COON format?',
    coonCode: 'B{t:T"Title"}',
    dartCode: 'AppBar(title: Text("Title"))',
    groundTruth: 'AppBar',
    answerType: 'widget-name',
    sampleId: 'struct-007',
  },
  {
    id: 'struct-abbrev-008',
    type: 'structural-awareness',
    prompt: 'What Flutter widget does "E" represent in COON format?',
    coonCode: 'E{c:T"Click"}',
    dartCode: 'ElevatedButton(child: Text("Click"))',
    groundTruth: 'ElevatedButton',
    answerType: 'widget-name',
    sampleId: 'struct-008',
  },
  {
    id: 'struct-abbrev-009',
    type: 'structural-awareness',
    prompt: 'What Flutter widget does "L" represent in COON format?',
    coonCode: 'L{h:[Li{t:T"Item"}]}',
    dartCode: 'ListView(children: [ListTile(title: Text("Item"))])',
    groundTruth: 'ListView',
    answerType: 'widget-name',
    sampleId: 'struct-009',
  },
  {
    id: 'struct-abbrev-010',
    type: 'structural-awareness',
    prompt: 'What Flutter widget does "Z" represent in COON format?',
    coonCode: 'Z{h:20,w:100}',
    dartCode: 'SizedBox(height: 20, width: 100)',
    groundTruth: 'SizedBox',
    answerType: 'widget-name',
    sampleId: 'struct-010',
  },
];

// ============================================================
// Prefix Understanding Questions
// ============================================================

const prefixQuestions: Question[] = [
  {
    id: 'struct-prefix-001',
    type: 'structural-awareness',
    prompt: 'In COON format, what does the "c:" prefix indicate?',
    coonCode: 'c:MyWidget<StatelessWidget>',
    dartCode: 'class MyWidget extends StatelessWidget',
    groundTruth: 'class declaration',
    answerType: 'string',
    sampleId: 'struct-prefix-001',
  },
  {
    id: 'struct-prefix-002',
    type: 'structural-awareness',
    prompt: 'In COON format, what does the "m:" prefix indicate?',
    coonCode: 'm:b S{b:T"Hi"}',
    dartCode: 'Widget build(context) { return Scaffold(body: Text("Hi")); }',
    groundTruth: 'method declaration',
    answerType: 'string',
    sampleId: 'struct-prefix-002',
  },
  {
    id: 'struct-prefix-003',
    type: 'structural-awareness',
    prompt: 'In COON format, what does "@" represent when used with numbers like "@16"?',
    coonCode: 'P{p:@16}',
    dartCode: 'Padding(padding: EdgeInsets.all(16))',
    groundTruth: 'EdgeInsets',
    answerType: 'string',
    sampleId: 'struct-prefix-003',
  },
];

// ============================================================
// Property Abbreviation Questions
// ============================================================

const propertyQuestions: Question[] = [
  {
    id: 'struct-prop-001',
    type: 'structural-awareness',
    prompt: 'In COON format, what does the "b:" property represent in a Scaffold?',
    coonCode: 'S{b:T"Content"}',
    dartCode: 'Scaffold(body: Text("Content"))',
    groundTruth: 'body',
    answerType: 'string',
    sampleId: 'struct-prop-001',
  },
  {
    id: 'struct-prop-002',
    type: 'structural-awareness',
    prompt: 'In COON format, what does the "c:" property represent (inside widgets)?',
    coonCode: 'N{c:T"Child"}',
    dartCode: 'Center(child: Text("Child"))',
    groundTruth: 'child',
    answerType: 'string',
    sampleId: 'struct-prop-002',
  },
  {
    id: 'struct-prop-003',
    type: 'structural-awareness',
    prompt: 'In COON format, what does the "h:" property represent?',
    coonCode: 'C{h:[T"A",T"B"]}',
    dartCode: 'Column(children: [Text("A"), Text("B")])',
    groundTruth: 'children',
    answerType: 'string',
    sampleId: 'struct-prop-003',
  },
  {
    id: 'struct-prop-004',
    type: 'structural-awareness',
    prompt: 'In COON format, what does the "a:" property represent in a Scaffold?',
    coonCode: 'S{a:B{t:T"Title"}}',
    dartCode: 'Scaffold(appBar: AppBar(title: Text("Title")))',
    groundTruth: 'appBar',
    answerType: 'string',
    sampleId: 'struct-prop-004',
  },
  {
    id: 'struct-prop-005',
    type: 'structural-awareness',
    prompt: 'In COON format, what does the "t:" property represent in an AppBar?',
    coonCode: 'B{t:T"My Title"}',
    dartCode: 'AppBar(title: Text("My Title"))',
    groundTruth: 'title',
    answerType: 'string',
    sampleId: 'struct-prop-005',
  },
  {
    id: 'struct-prop-006',
    type: 'structural-awareness',
    prompt: 'In COON format, what does the "p:" property typically represent?',
    coonCode: 'K{p:@16}',
    dartCode: 'Container(padding: EdgeInsets.all(16))',
    groundTruth: 'padding',
    answerType: 'string',
    sampleId: 'struct-prop-006',
  },
  {
    id: 'struct-prop-007',
    type: 'structural-awareness',
    prompt: 'In COON format, what does the "f:" property represent in a Scaffold?',
    coonCode: 'S{f:Fa{c:Ic{i:add}}}',
    dartCode: 'Scaffold(floatingActionButton: FloatingActionButton(child: Icon(Icons.add)))',
    groundTruth: 'floatingActionButton',
    answerType: 'string',
    sampleId: 'struct-prop-007',
  },
];

// ============================================================
// Syntax Validation Questions
// ============================================================

const syntaxValidationQuestions: Question[] = [
  {
    id: 'struct-syntax-001',
    type: 'structural-awareness',
    prompt: 'Is this valid COON syntax? Answer YES or NO: c:MyWidget<;m:b T"Hi"',
    coonCode: 'c:MyWidget<;m:b T"Hi"',
    dartCode: '',
    groundTruth: 'NO',
    answerType: 'boolean',
    sampleId: 'struct-syntax-001',
  },
  {
    id: 'struct-syntax-002',
    type: 'structural-awareness',
    prompt: 'Is this valid COON syntax? Answer YES or NO: S{b:C{h:[T"A",T"B"]}}',
    coonCode: 'S{b:C{h:[T"A",T"B"]}}',
    dartCode: '',
    groundTruth: 'YES',
    answerType: 'boolean',
    sampleId: 'struct-syntax-002',
  },
  {
    id: 'struct-syntax-003',
    type: 'structural-awareness',
    prompt: 'Is this valid COON syntax? Answer YES or NO: T"Hello World"',
    coonCode: 'T"Hello World"',
    dartCode: '',
    groundTruth: 'YES',
    answerType: 'boolean',
    sampleId: 'struct-syntax-003',
  },
  {
    id: 'struct-syntax-004',
    type: 'structural-awareness',
    prompt: 'Is this valid COON syntax? Answer YES or NO: K{p:@16,c:}',
    coonCode: 'K{p:@16,c:}',
    dartCode: '',
    groundTruth: 'NO',
    answerType: 'boolean',
    sampleId: 'struct-syntax-004',
  },
  {
    id: 'struct-syntax-005',
    type: 'structural-awareness',
    prompt: 'Is this valid COON syntax? Answer YES or NO: R{h:[Ic{i:home},Z{w:8},T"Home"]}',
    coonCode: 'R{h:[Ic{i:home},Z{w:8},T"Home"]}',
    dartCode: '',
    groundTruth: 'YES',
    answerType: 'boolean',
    sampleId: 'struct-syntax-005',
  },
];

// ============================================================
// All Structural Questions
// ============================================================

export const ALL_STRUCTURAL_QUESTIONS: Question[] = [
  ...abbreviationQuestions,
  ...prefixQuestions,
  ...propertyQuestions,
  ...syntaxValidationQuestions,
];

// ============================================================
// Question Getters
// ============================================================

export function generateStructuralQuestions(): Question[] {
  return ALL_STRUCTURAL_QUESTIONS;
}

export function getAbbreviationQuestions(): Question[] {
  return abbreviationQuestions;
}

export function getPrefixQuestions(): Question[] {
  return prefixQuestions;
}

export function getPropertyQuestions(): Question[] {
  return propertyQuestions;
}

export function getSyntaxValidationQuestions(): Question[] {
  return syntaxValidationQuestions;
}

export function getStructuralQuestionStats() {
  return {
    total: ALL_STRUCTURAL_QUESTIONS.length,
    abbreviations: abbreviationQuestions.length,
    prefixes: prefixQuestions.length,
    properties: propertyQuestions.length,
    syntaxValidation: syntaxValidationQuestions.length,
  };
}
