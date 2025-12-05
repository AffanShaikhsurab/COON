/**
 * Code Samples for COON Benchmarks
 * 
 * Contains Dart/Flutter code samples - COON versions are generated
 * dynamically using the actual COON SDK to ensure accuracy.
 */

import type { CodeSample, CodeSampleSource, CodeComplexity } from './types.js';
import { compressToCoon } from './coon-generator.js';

// ============================================================
// Helper Functions
// ============================================================

function minify(dart: string): string {
  return dart
    .replace(/\/\/.*$/gm, '')           // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '')   // Remove multi-line comments
    .replace(/\s+/g, ' ')               // Collapse whitespace
    .replace(/\s*([{}(),;:])\s*/g, '$1') // Remove space around punctuation
    .trim();
}

/**
 * Convert a source-only sample to a full CodeSample by generating COON
 */
function toCodeSample(source: CodeSampleSource): CodeSample {
  return {
    ...source,
    coonCode: compressToCoon(source.dartCode),
    minifiedCode: minify(source.dartCode),
  };
}

// ============================================================
// Simple Widget Samples (Source Only)
// ============================================================

const simpleWidgetSources: CodeSampleSource[] = [
  {
    id: 'simple-text',
    name: 'Simple Text Widget',
    dartCode: `Text('Hello World')`,
    complexity: 'simple',
    widgets: ['Text'],
    category: 'widget',
  },
  {
    id: 'text-with-style',
    name: 'Text with Style',
    dartCode: `Text(
  'Welcome',
  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
)`,
    complexity: 'simple',
    widgets: ['Text'],
    category: 'widget',
  },
  {
    id: 'container-basic',
    name: 'Basic Container',
    dartCode: `Container(
  padding: EdgeInsets.all(16),
  child: Text('Content'),
)`,
    complexity: 'simple',
    widgets: ['Container', 'Text'],
    category: 'widget',
  },
  {
    id: 'center-child',
    name: 'Center with Child',
    dartCode: `Center(
  child: Text('Centered'),
)`,
    complexity: 'simple',
    widgets: ['Center', 'Text'],
    category: 'widget',
  },
  {
    id: 'sizedbox-spacer',
    name: 'SizedBox Spacer',
    dartCode: `SizedBox(height: 20, width: 100)`,
    complexity: 'simple',
    widgets: ['SizedBox'],
    category: 'widget',
  },
  {
    id: 'padding-widget',
    name: 'Padding Widget',
    dartCode: `Padding(
  padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
  child: Text('Padded'),
)`,
    complexity: 'simple',
    widgets: ['Padding', 'Text'],
    category: 'widget',
  },
  {
    id: 'icon-basic',
    name: 'Basic Icon',
    dartCode: `Icon(Icons.home, size: 24, color: Colors.blue)`,
    complexity: 'simple',
    widgets: ['Icon'],
    category: 'widget',
  },
  {
    id: 'elevated-button',
    name: 'Elevated Button',
    dartCode: `ElevatedButton(
  onPressed: () => print('clicked'),
  child: Text('Click Me'),
)`,
    complexity: 'simple',
    widgets: ['ElevatedButton', 'Text'],
    category: 'widget',
  },
];

// ============================================================
// Layout Widget Samples (Source Only)
// ============================================================

const layoutWidgetSources: CodeSampleSource[] = [
  {
    id: 'column-basic',
    name: 'Basic Column',
    dartCode: `Column(
  children: [
    Text('First'),
    Text('Second'),
    Text('Third'),
  ],
)`,
    complexity: 'simple',
    widgets: ['Column', 'Text'],
    category: 'layout',
  },
  {
    id: 'row-basic',
    name: 'Basic Row',
    dartCode: `Row(
  mainAxisAlignment: MainAxisAlignment.spaceBetween,
  children: [
    Text('Left'),
    Text('Right'),
  ],
)`,
    complexity: 'simple',
    widgets: ['Row', 'Text'],
    category: 'layout',
  },
  {
    id: 'column-with-expanded',
    name: 'Column with Expanded',
    dartCode: `Column(
  children: [
    Text('Header'),
    Expanded(child: Container(color: Colors.blue)),
    Text('Footer'),
  ],
)`,
    complexity: 'medium',
    widgets: ['Column', 'Text', 'Expanded', 'Container'],
    category: 'layout',
  },
  {
    id: 'stack-basic',
    name: 'Basic Stack',
    dartCode: `Stack(
  children: [
    Container(width: 200, height: 200, color: Colors.red),
    Positioned(
      top: 10,
      left: 10,
      child: Text('Overlay'),
    ),
  ],
)`,
    complexity: 'medium',
    widgets: ['Stack', 'Container', 'Positioned', 'Text'],
    category: 'layout',
  },
  {
    id: 'wrap-basic',
    name: 'Basic Wrap',
    dartCode: `Wrap(
  spacing: 8,
  runSpacing: 4,
  children: [
    Chip(label: Text('Tag 1')),
    Chip(label: Text('Tag 2')),
    Chip(label: Text('Tag 3')),
  ],
)`,
    complexity: 'medium',
    widgets: ['Wrap', 'Chip', 'Text'],
    category: 'layout',
  },
];

// ============================================================
// Screen Samples (Source Only)
// ============================================================

const screenSampleSources: CodeSampleSource[] = [
  {
    id: 'basic-scaffold',
    name: 'Basic Scaffold Screen',
    dartCode: `class HomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Home')),
      body: Center(child: Text('Welcome')),
    );
  }
}`,
    complexity: 'medium',
    widgets: ['Scaffold', 'AppBar', 'Text', 'Center'],
    category: 'screen',
  },
  {
    id: 'scaffold-with-fab',
    name: 'Scaffold with FAB',
    dartCode: `class CounterScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Counter')),
      body: Center(child: Text('0')),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        child: Icon(Icons.add),
      ),
    );
  }
}`,
    complexity: 'medium',
    widgets: ['Scaffold', 'AppBar', 'Text', 'Center', 'FloatingActionButton', 'Icon'],
    category: 'screen',
  },
  {
    id: 'list-screen',
    name: 'List Screen',
    dartCode: `class ListScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Items')),
      body: ListView(
        children: [
          ListTile(title: Text('Item 1'), leading: Icon(Icons.star)),
          ListTile(title: Text('Item 2'), leading: Icon(Icons.star)),
          ListTile(title: Text('Item 3'), leading: Icon(Icons.star)),
        ],
      ),
    );
  }
}`,
    complexity: 'medium',
    widgets: ['Scaffold', 'AppBar', 'Text', 'ListView', 'ListTile', 'Icon'],
    category: 'screen',
  },
  {
    id: 'login-screen',
    name: 'Login Screen',
    dartCode: `class LoginScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Login')),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextField(decoration: InputDecoration(labelText: 'Email')),
            SizedBox(height: 16),
            TextField(decoration: InputDecoration(labelText: 'Password'), obscureText: true),
            SizedBox(height: 24),
            ElevatedButton(onPressed: () {}, child: Text('Login')),
          ],
        ),
      ),
    );
  }
}`,
    complexity: 'complex',
    widgets: ['Scaffold', 'AppBar', 'Text', 'Padding', 'Column', 'TextField', 'SizedBox', 'ElevatedButton'],
    category: 'screen',
  },
  {
    id: 'settings-screen',
    name: 'Settings Screen',
    dartCode: `class SettingsScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Settings')),
      body: ListView(
        children: [
          ListTile(
            title: Text('Notifications'),
            trailing: Switch(value: true, onChanged: (v) {}),
          ),
          ListTile(
            title: Text('Dark Mode'),
            trailing: Switch(value: false, onChanged: (v) {}),
          ),
          Divider(),
          ListTile(
            title: Text('About'),
            trailing: Icon(Icons.chevron_right),
          ),
        ],
      ),
    );
  }
}`,
    complexity: 'complex',
    widgets: ['Scaffold', 'AppBar', 'Text', 'ListView', 'ListTile', 'Switch', 'Divider', 'Icon'],
    category: 'screen',
  },
];

// ============================================================
// Complex Samples (Source Only)
// ============================================================

const complexSampleSources: CodeSampleSource[] = [
  {
    id: 'card-list',
    name: 'Card List',
    dartCode: `class CardListScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Cards')),
      body: ListView(
        padding: EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Card Title', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  SizedBox(height: 8),
                  Text('Card description goes here'),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}`,
    complexity: 'complex',
    widgets: ['Scaffold', 'AppBar', 'Text', 'ListView', 'Card', 'Padding', 'Column', 'SizedBox'],
    category: 'complex',
  },
  {
    id: 'profile-header',
    name: 'Profile Header',
    dartCode: `class ProfileHeader extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(16),
      child: Row(
        children: [
          CircleAvatar(radius: 40, backgroundImage: NetworkImage('https://example.com/avatar.png')),
          SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('John Doe', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                Text('@johndoe', style: TextStyle(color: Colors.grey)),
                SizedBox(height: 8),
                Text('Flutter Developer | Coffee Lover'),
              ],
            ),
          ),
        ],
      ),
    );
  }
}`,
    complexity: 'complex',
    widgets: ['Container', 'Row', 'CircleAvatar', 'SizedBox', 'Expanded', 'Column', 'Text'],
    category: 'complex',
  },
  {
    id: 'bottom-nav-screen',
    name: 'Bottom Navigation Screen',
    dartCode: `class MainScreen extends StatefulWidget {
  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _selectedIndex,
        children: [
          Center(child: Text('Home')),
          Center(child: Text('Search')),
          Center(child: Text('Profile')),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (i) => setState(() => _selectedIndex = i),
        items: [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.search), label: 'Search'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}`,
    complexity: 'complex',
    widgets: ['Scaffold', 'IndexedStack', 'Center', 'Text', 'BottomNavigationBar', 'BottomNavigationBarItem', 'Icon'],
    category: 'complex',
  },
];

// ============================================================
// Edge Cases (Source Only)
// ============================================================

const edgeCaseSources: CodeSampleSource[] = [
  {
    id: 'empty-container',
    name: 'Empty Container',
    dartCode: `Container()`,
    complexity: 'simple',
    widgets: ['Container'],
    category: 'edge-case',
  },
  {
    id: 'deeply-nested',
    name: 'Deeply Nested Widgets',
    dartCode: `Center(
  child: Container(
    child: Padding(
      padding: EdgeInsets.all(8),
      child: Card(
        child: Center(
          child: Text('Deep'),
        ),
      ),
    ),
  ),
)`,
    complexity: 'medium',
    widgets: ['Center', 'Container', 'Padding', 'Card', 'Text'],
    category: 'edge-case',
  },
  {
    id: 'multiple-text-styles',
    name: 'Multiple Text Styles',
    dartCode: `Column(
  children: [
    Text('Regular'),
    Text('Bold', style: TextStyle(fontWeight: FontWeight.bold)),
    Text('Italic', style: TextStyle(fontStyle: FontStyle.italic)),
    Text('Large', style: TextStyle(fontSize: 24)),
    Text('Colored', style: TextStyle(color: Colors.red)),
  ],
)`,
    complexity: 'medium',
    widgets: ['Column', 'Text'],
    category: 'edge-case',
  },
  {
    id: 'special-characters',
    name: 'Special Characters in Text',
    dartCode: `Text("Hello 'World' with \\"quotes\\" & special <chars>")`,
    complexity: 'simple',
    widgets: ['Text'],
    category: 'edge-case',
  },
  {
    id: 'builder-pattern',
    name: 'Builder Pattern Widget',
    dartCode: `ListView.builder(
  itemCount: 10,
  itemBuilder: (context, index) => ListTile(title: Text('Item \$index')),
)`,
    complexity: 'medium',
    widgets: ['ListView', 'ListTile', 'Text'],
    category: 'edge-case',
  },
];

// ============================================================
// All Sources Combined
// ============================================================

const ALL_SOURCES: CodeSampleSource[] = [
  ...simpleWidgetSources,
  ...layoutWidgetSources,
  ...screenSampleSources,
  ...complexSampleSources,
  ...edgeCaseSources,
];

// ============================================================
// Lazy-loaded Samples (generated on first access)
// ============================================================

let _cachedSamples: CodeSample[] | null = null;

/**
 * Get all code samples with COON generated by SDK.
 * Samples are cached after first generation.
 */
export function getAllCodeSamples(): CodeSample[] {
  if (!_cachedSamples) {
    console.log('🔄 Generating COON code using SDK...');
    _cachedSamples = ALL_SOURCES.map(toCodeSample);
    console.log(`✅ Generated ${_cachedSamples.length} samples with COON compression`);
  }
  return _cachedSamples;
}

// ============================================================
// Sample Getters
// ============================================================

export function getSamplesByComplexity(complexity: CodeComplexity): CodeSample[] {
  return getAllCodeSamples().filter(s => s.complexity === complexity);
}

export function getSamplesByCategory(category: string): CodeSample[] {
  return getAllCodeSamples().filter(s => s.category === category);
}

export function getSampleById(id: string): CodeSample | undefined {
  return getAllCodeSamples().find(s => s.id === id);
}

export function getRandomSamples(count: number): CodeSample[] {
  const shuffled = [...getAllCodeSamples()].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ============================================================
// Statistics
// ============================================================

export function getSampleStats() {
  const samples = getAllCodeSamples();
  
  const byComplexity = {
    simple: getSamplesByComplexity('simple').length,
    medium: getSamplesByComplexity('medium').length,
    complex: getSamplesByComplexity('complex').length,
  };

  const categories = [...new Set(samples.map(s => s.category))];
  const byCategory = Object.fromEntries(
    categories.map(c => [c, getSamplesByCategory(c).length])
  );

  const allWidgets = new Set(samples.flatMap(s => s.widgets));

  return {
    total: samples.length,
    byComplexity,
    byCategory,
    uniqueWidgets: allWidgets.size,
    widgetList: [...allWidgets].sort(),
  };
}

/**
 * Force regeneration of COON code (useful for testing SDK changes)
 */
export function clearSampleCache(): void {
  _cachedSamples = null;
}

// ============================================================
// Backward compatibility - export as ALL_CODE_SAMPLES
// ============================================================

// Note: This is eagerly evaluated - consider using getAllCodeSamples() for lazy loading
export const ALL_CODE_SAMPLES: CodeSample[] = getAllCodeSamples();

// ============================================================
// Exports for direct access to source definitions
// ============================================================

export {
  simpleWidgetSources,
  layoutWidgetSources,
  screenSampleSources,
  complexSampleSources,
  edgeCaseSources,
  ALL_SOURCES,
};
