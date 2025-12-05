/**
 * Generation Tasks for COON Benchmarks
 * 
 * Tests LLM's ability to generate valid COON output
 */

import type { GenerationTask, ValidationMethod } from '../types.js';

// ============================================================
// Dart to COON Conversion Tasks
// ============================================================

const dartToCoonTasks: GenerationTask[] = [
  {
    id: 'gen-d2c-001',
    type: 'dart-to-coon',
    prompt: 'Convert this Dart code to COON format:',
    inputCode: `class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Hello')),
      body: Center(child: Text('World')),
    );
  }
}`,
    expectedOutput: `c:MyWidget<StatelessWidget>;m:b S{a:B{t:T'Hello'},b:N{c:T'World'}}`,
    validationMethod: 'semantic-equivalence',
  },
  {
    id: 'gen-d2c-002',
    type: 'dart-to-coon',
    prompt: 'Convert this Dart code to COON format:',
    inputCode: `Container(
  padding: EdgeInsets.all(16),
  child: Column(
    children: [
      Text('Title'),
      Text('Subtitle'),
    ],
  ),
)`,
    expectedOutput: `K{p:@16,c:C{h:[T'Title',T'Subtitle']}}`,
    validationMethod: 'semantic-equivalence',
  },
  {
    id: 'gen-d2c-003',
    type: 'dart-to-coon',
    prompt: 'Convert this Dart code to COON format:',
    inputCode: `Row(
  mainAxisAlignment: MainAxisAlignment.spaceBetween,
  children: [
    Icon(Icons.home),
    Text('Home'),
    Icon(Icons.settings),
  ],
)`,
    expectedOutput: `R{ma:spaceBetween,h:[Ic{i:home},T'Home',Ic{i:settings}]}`,
    validationMethod: 'semantic-equivalence',
  },
  {
    id: 'gen-d2c-004',
    type: 'dart-to-coon',
    prompt: 'Convert this Dart code to COON format:',
    inputCode: `Card(
  child: ListTile(
    leading: Icon(Icons.album),
    title: Text('Album Title'),
    subtitle: Text('Artist Name'),
  ),
)`,
    expectedOutput: `Cd{c:Li{ld:Ic{i:album},t:T'Album Title',st:T'Artist Name'}}`,
    validationMethod: 'semantic-equivalence',
  },
  {
    id: 'gen-d2c-005',
    type: 'dart-to-coon',
    prompt: 'Convert this Dart code to COON format:',
    inputCode: `ElevatedButton(
  onPressed: () => print('clicked'),
  child: Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      Icon(Icons.add),
      SizedBox(width: 8),
      Text('Add Item'),
    ],
  ),
)`,
    expectedOutput: `E{p:()=>print('clicked'),c:R{ms:min,h:[Ic{i:add},Z{w:8},T'Add Item']}}`,
    validationMethod: 'semantic-equivalence',
  },
];

// ============================================================
// COON Modification Tasks
// ============================================================

const coonModificationTasks: GenerationTask[] = [
  {
    id: 'gen-mod-001',
    type: 'coon-modification',
    prompt: 'Add a floating action button with a "+" icon to this COON code:',
    inputCode: `c:MyScreen<StatelessWidget>;m:b S{b:N{c:T'Content'}}`,
    expectedOutput: `c:MyScreen<StatelessWidget>;m:b S{b:N{c:T'Content'},f:Fa{c:Ic{i:add}}}`,
    validationMethod: 'contains-widget',
    requirements: ['FloatingActionButton', 'Icon'],
  },
  {
    id: 'gen-mod-002',
    type: 'coon-modification',
    prompt: 'Add an AppBar with title "Settings" to this COON code:',
    inputCode: `c:SettingsScreen<StatelessWidget>;m:b S{b:L{h:[Li{t:T'Option 1'},Li{t:T'Option 2'}]}}`,
    expectedOutput: `c:SettingsScreen<StatelessWidget>;m:b S{a:B{t:T'Settings'},b:L{h:[Li{t:T'Option 1'},Li{t:T'Option 2'}]}}`,
    validationMethod: 'contains-widget',
    requirements: ['AppBar'],
  },
  {
    id: 'gen-mod-003',
    type: 'coon-modification',
    prompt: 'Change the padding value from 16 to 24 in this COON code:',
    inputCode: `P{p:@16,c:T'Padded Content'}`,
    expectedOutput: `P{p:@24,c:T'Padded Content'}`,
    validationMethod: 'exact-match',
  },
  {
    id: 'gen-mod-004',
    type: 'coon-modification',
    prompt: 'Add a third Text widget with content "Third" to the Column:',
    inputCode: `C{h:[T'First',T'Second']}`,
    expectedOutput: `C{h:[T'First',T'Second',T'Third']}`,
    validationMethod: 'semantic-equivalence',
  },
  {
    id: 'gen-mod-005',
    type: 'coon-modification',
    prompt: 'Wrap the Text widget in a Center widget:',
    inputCode: `K{p:@8,c:T'Hello'}`,
    expectedOutput: `K{p:@8,c:N{c:T'Hello'}}`,
    validationMethod: 'contains-widget',
    requirements: ['Center'],
  },
];

// ============================================================
// Natural Language to COON Tasks
// ============================================================

const nlToCoonTasks: GenerationTask[] = [
  {
    id: 'gen-nl-001',
    type: 'nl-to-coon',
    prompt: 'Generate COON code for a simple screen with an AppBar titled "Home" and a centered Text widget saying "Welcome".',
    inputCode: '', // No input for NL tasks
    validationMethod: 'requirements-check',
    requirements: ['Scaffold', 'AppBar', 'Center', 'Text'],
  },
  {
    id: 'gen-nl-002',
    type: 'nl-to-coon',
    prompt: 'Generate COON code for a login form with email and password text fields, and a login button.',
    inputCode: '',
    validationMethod: 'requirements-check',
    requirements: ['TextField', 'ElevatedButton', 'Column'],
  },
  {
    id: 'gen-nl-003',
    type: 'nl-to-coon',
    prompt: 'Generate COON code for a card with a title, subtitle, and an icon on the left.',
    inputCode: '',
    validationMethod: 'requirements-check',
    requirements: ['Card', 'ListTile', 'Icon', 'Text'],
  },
  {
    id: 'gen-nl-004',
    type: 'nl-to-coon',
    prompt: 'Generate COON code for a row with three buttons: Home, Search, and Profile.',
    inputCode: '',
    validationMethod: 'requirements-check',
    requirements: ['Row', 'ElevatedButton', 'Text'],
  },
  {
    id: 'gen-nl-005',
    type: 'nl-to-coon',
    prompt: 'Generate COON code for a list with 3 items, each having a star icon and item number text.',
    inputCode: '',
    validationMethod: 'requirements-check',
    requirements: ['ListView', 'ListTile', 'Icon'],
  },
];

// ============================================================
// COON Completion Tasks
// ============================================================

const coonCompletionTasks: GenerationTask[] = [
  {
    id: 'gen-cmp-001',
    type: 'coon-completion',
    prompt: 'Complete this COON code to add body content with a Column containing two Text widgets:',
    inputCode: `c:MyScreen<StatelessWidget>;m:b S{a:B{t:T'Title'},b:___}`,
    expectedOutput: `c:MyScreen<StatelessWidget>;m:b S{a:B{t:T'Title'},b:C{h:[T'First',T'Second']}}`,
    validationMethod: 'syntax-valid',
    requirements: ['Column', 'Text'],
  },
  {
    id: 'gen-cmp-002',
    type: 'coon-completion',
    prompt: 'Complete the children array with two more items (Text widgets):',
    inputCode: `C{h:[T'Item 1',___]}`,
    expectedOutput: `C{h:[T'Item 1',T'Item 2',T'Item 3']}`,
    validationMethod: 'syntax-valid',
    requirements: ['Text'],
  },
  {
    id: 'gen-cmp-003',
    type: 'coon-completion',
    prompt: 'Complete the Container with padding and a child Text widget:',
    inputCode: `K{___}`,
    expectedOutput: `K{p:@16,c:T'Content'}`,
    validationMethod: 'syntax-valid',
    requirements: ['Text'],
  },
];

// ============================================================
// All Generation Tasks
// ============================================================

export const ALL_GENERATION_TASKS: GenerationTask[] = [
  ...dartToCoonTasks,
  ...coonModificationTasks,
  ...nlToCoonTasks,
  ...coonCompletionTasks,
];

// ============================================================
// Task Getters
// ============================================================

export function generateGenerationTasks(): GenerationTask[] {
  return ALL_GENERATION_TASKS;
}

export function getTasksByType(type: GenerationTask['type']): GenerationTask[] {
  return ALL_GENERATION_TASKS.filter(t => t.type === type);
}

export function getTaskById(id: string): GenerationTask | undefined {
  return ALL_GENERATION_TASKS.find(t => t.id === id);
}

export function getTaskStats() {
  const byType = ALL_GENERATION_TASKS.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const byValidation = ALL_GENERATION_TASKS.reduce((acc, t) => {
    acc[t.validationMethod] = (acc[t.validationMethod] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    total: ALL_GENERATION_TASKS.length,
    byType,
    byValidation,
  };
}
