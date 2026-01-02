/**
 * COON Browser Module
 *
 * Browser-compatible compression implementation with embedded abbreviation data.
 * This module does NOT use Node.js fs/path APIs and can be safely bundled for browsers.
 *
 * @packageDocumentation
 */

// ============================================================================
// Embedded Dart/Flutter Abbreviations (from spec/languages/dart/)
// ============================================================================

export const dartWidgets: Record<string, string> = {
  Scaffold: "S",
  Column: "C",
  Row: "R",
  SafeArea: "A",
  Padding: "P",
  Text: "T",
  AppBar: "B",
  SizedBox: "Z",
  TextField: "F",
  ElevatedButton: "E",
  TextStyle: "Y",
  InputDecoration: "D",
  OutlineInputBorder: "O",
  TextEditingController: "X",
  Container: "K",
  Center: "N",
  Expanded: "Ex",
  ListView: "L",
  GridView: "G",
  Stack: "St",
  Positioned: "Ps",
  Card: "Cd",
  IconButton: "Ib",
  Icon: "Ic",
  FloatingActionButton: "Fb",
  CircularProgressIndicator: "Cp",
  LinearProgressIndicator: "Lp",
  Drawer: "Dr",
  BottomNavigationBar: "Bn",
  TabBar: "Tb",
  TabBarView: "Tv",
  Image: "Im",
  Divider: "Dv",
  Flexible: "Fl",
  Align: "Al",
  CustomScrollView: "Cv",
  SingleChildScrollView: "Sv",
  TextFormField: "Tf",
  TextButton: "Bt",
};

export const dartKeywords: Record<string, string> = {
  class: "c:",
  final: "f:",
  extends: "<",
  import: "im:",
  return: "ret",
  async: "asy",
  await: "awt",
  const: "cn:",
  static: "st:",
  void: "v:",
  override: "ov:",
  implements: ">",
  with: "+",
  Widget: "W",
  BuildContext: "ctx",
  true: "1",
  false: "0",
  null: "_",
};

export const dartProperties: Record<string, string> = {
  "appBar:": "a:",
  "body:": "b:",
  "child:": "c:",
  "children:": "h:",
  "title:": "t:",
  "controller:": "r:",
  "padding:": "p:",
  "onPressed:": "o:",
  "style:": "s:",
  "fontSize:": "z:",
  "fontWeight:": "w:",
  "color:": "l:",
  "decoration:": "d:",
  "labelText:": "L:",
  "hintText:": "H:",
  "border:": "B:",
  "height:": "e:",
  "width:": "W:",
  "obscureText:": "x:",
  "centerTitle:": "T:",
  "mainAxisAlignment:": "A:",
  "crossAxisAlignment:": "X:",
  "minimumSize:": "M:",
  "margin:": "m:",
  "alignment:": "n:",
  "backgroundColor:": "bg:",
  "onChanged:": "oc:",
  "builder:": "bl:",
  "mainAxisSize:": "ms:",
  "crossAxisSize:": "xs:",
};

// ============================================================================
// Embedded JavaScript/React Abbreviations (from spec/languages/javascript/)
// ============================================================================

export const jsKeywords: Record<string, string> = {
  function: "fn:",
  const: "cn:",
  let: "lt:",
  var: "vr:",
  return: "ret",
  export: "exp",
  import: "imp",
  default: "def",
  class: "cls:",
  extends: "ext",
  constructor: "ctr:",
  async: "asn:",
  await: "awt",
  try: "try:",
  catch: "ctch:",
  finally: "fnl:",
  if: "if:",
  else: "els:",
  switch: "sw:",
  case: "cs:",
  break: "brk",
  continue: "cnt",
  for: "fr:",
  while: "whl:",
  do: "do:",
  throw: "thr",
  new: "nw",
  this: "ths",
  super: "spr",
  typeof: "tof",
  instanceof: "iof",
  null: "nul",
  undefined: "udf",
  true: "1",
  false: "0",
};

export const jsComponents: Record<string, string> = {
  // React Hooks
  useState: "us",
  useEffect: "ue",
  useContext: "uc",
  useReducer: "ur",
  useCallback: "ucb",
  useMemo: "um",
  useRef: "urf",
  useImperativeHandle: "uih",
  useLayoutEffect: "ule",
  useDebugValue: "udv",
  // JSX Elements
  div: "D",
  span: "S",
  button: "B",
  input: "I",
  form: "F",
  label: "L",
  textarea: "TA",
  select: "SL",
  option: "O",
  ul: "UL",
  ol: "OL",
  li: "LI",
  p: "P",
  h1: "H1",
  h2: "H2",
  h3: "H3",
  h4: "H4",
  h5: "H5",
  h6: "H6",
  a: "A",
  img: "IM",
  nav: "N",
  header: "HD",
  footer: "FT",
  section: "SC",
  article: "AR",
  aside: "AS",
  main: "M",
  // React Components
  Fragment: "Fr",
  StrictMode: "SM",
  Suspense: "Su",
  lazy: "lz",
};

export const jsProperties: Record<string, string> = {
  className: "cn",
  onClick: "oc",
  onChange: "och",
  onSubmit: "os",
  onFocus: "of",
  onBlur: "ob",
  onKeyPress: "okp",
  onKeyDown: "okd",
  onKeyUp: "oku",
  onMouseEnter: "ome",
  onMouseLeave: "oml",
  children: "ch",
  style: "st",
  id: "id",
  key: "k",
  ref: "rf",
  value: "v",
  defaultValue: "dv",
  checked: "chk",
  disabled: "dis",
  readOnly: "ro",
  required: "req",
  placeholder: "ph",
  type: "tp",
  name: "nm",
  href: "hr",
  src: "sr",
  alt: "al",
  title: "tt",
  target: "tg",
  rel: "rl",
  htmlFor: "hf",
  tabIndex: "ti",
  "aria-label": "arl",
  "aria-describedby": "ad",
  role: "rol",
};

// ============================================================================
// Types
// ============================================================================

export type Language = "dart" | "javascript";

export interface BrowserCompressionResult {
  compressedCode: string;
  originalLength: number;
  compressedLength: number;
  originalTokens: number;
  compressedTokens: number;
  tokenSavings: number;
  percentageSaved: number;
  abbreviationsUsed: string[];
}

export interface LanguageAbbreviations {
  keywords: Record<string, string>;
  widgets?: Record<string, string>;
  components?: Record<string, string>;
  properties: Record<string, string>;
}

// ============================================================================
// Browser-Compatible Compression Functions
// ============================================================================

/**
 * Get all abbreviations for a language
 */
export function getAbbreviations(language: Language): Record<string, string> {
  if (language === "dart") {
    return { ...dartKeywords, ...dartWidgets, ...dartProperties };
  }
  return { ...jsKeywords, ...jsComponents, ...jsProperties };
}

/**
 * Get abbreviations grouped by category
 */
export function getAbbreviationsByCategory(language: Language): LanguageAbbreviations {
  if (language === "dart") {
    return {
      keywords: dartKeywords,
      widgets: dartWidgets,
      properties: dartProperties,
    };
  }
  return {
    keywords: jsKeywords,
    components: jsComponents,
    properties: jsProperties,
  };
}

/**
 * Estimate token count (4 chars ≈ 1 token)
 */
function countTokens(text: string): number {
  return Math.floor(text.length / 4);
}

/**
 * Remove comments from code
 */
function removeComments(code: string): string {
  // Remove single-line comments
  let result = code.replace(/\/\/.*$/gm, "");
  // Remove multi-line comments
  result = result.replace(/\/\*[\s\S]*?\*\//g, "");
  return result;
}

/**
 * Normalize whitespace (same logic as SDK's BasicStrategy)
 */
function normalizeWhitespace(code: string): string {
  // Collapse multiple spaces to single space
  let result = code.replace(/\s+/g, " ");
  // Remove spaces around punctuation
  result = result.replace(/ ?([:,{}[\]()]) ?/g, "$1");
  return result.trim();
}

/**
 * Apply keyword abbreviations (same logic as SDK's CompressionStrategy)
 */
function applyKeywordAbbreviations(code: string, keywords: Record<string, string>): string {
  let result = code;
  for (const [keyword, abbrev] of Object.entries(keywords)) {
    const regex = new RegExp(`\\b${keyword}\\b`, "g");
    result = result.replace(regex, abbrev);
  }
  return result;
}

/**
 * Apply widget/component abbreviations (same logic as SDK)
 */
function applyWidgetAbbreviations(code: string, widgets: Record<string, string>): string {
  let result = code;
  for (const [widget, abbrev] of Object.entries(widgets)) {
    const regex = new RegExp(`\\b${widget}\\b`, "g");
    result = result.replace(regex, abbrev);
  }
  return result;
}

/**
 * Apply property abbreviations (same logic as SDK)
 */
function applyPropertyAbbreviations(code: string, properties: Record<string, string>): string {
  let result = code;
  for (const [prop, abbrev] of Object.entries(properties)) {
    // Properties include colons, so match literally
    result = result.replace(new RegExp(prop.replace(":", "\\:"), "g"), abbrev);
  }
  return result;
}

/**
 * Compress code using COON format (browser-compatible)
 *
 * This implements the same compression logic as the SDK's BasicStrategy
 * but without Node.js dependencies.
 */
export function compressBrowser(code: string, language: Language): BrowserCompressionResult {
  if (!code || !code.trim()) {
    return {
      compressedCode: "",
      originalLength: 0,
      compressedLength: 0,
      originalTokens: 0,
      compressedTokens: 0,
      tokenSavings: 0,
      percentageSaved: 0,
      abbreviationsUsed: [],
    };
  }

  const abbrevs = getAbbreviationsByCategory(language);
  const usedAbbreviations: string[] = [];

  // Track which abbreviations are used
  function trackAbbreviations(
    before: string,
    after: string,
    mapping: Record<string, string>
  ): void {
    for (const [full, abbrev] of Object.entries(mapping)) {
      if (before.includes(full) && after.includes(abbrev)) {
        usedAbbreviations.push(`${full} → ${abbrev}`);
      }
    }
  }

  let result = code;

  // Step 1: Remove comments
  result = removeComments(result);

  // Step 2: Apply keyword abbreviations
  const beforeKeywords = result;
  result = applyKeywordAbbreviations(result, abbrevs.keywords);
  trackAbbreviations(beforeKeywords, result, abbrevs.keywords);

  // Step 3: Apply widget/component abbreviations
  const beforeWidgets = result;
  const widgetsOrComponents =
    language === "dart" ? abbrevs.widgets || {} : abbrevs.components || {};
  result = applyWidgetAbbreviations(result, widgetsOrComponents);
  trackAbbreviations(beforeWidgets, result, widgetsOrComponents);

  // Step 4: Apply property abbreviations
  const beforeProps = result;
  result = applyPropertyAbbreviations(result, abbrevs.properties);
  trackAbbreviations(beforeProps, result, abbrevs.properties);

  // Step 5: Normalize whitespace
  result = normalizeWhitespace(result);

  const originalLength = code.length;
  const compressedLength = result.length;
  const originalTokens = countTokens(code);
  const compressedTokens = countTokens(result);
  const tokenSavings = originalTokens - compressedTokens;
  const percentageSaved =
    originalLength > 0
      ? Math.round(((originalLength - compressedLength) / originalLength) * 100)
      : 0;

  return {
    compressedCode: result,
    originalLength,
    compressedLength,
    originalTokens,
    compressedTokens,
    tokenSavings,
    percentageSaved,
    abbreviationsUsed: [...new Set(usedAbbreviations)], // Remove duplicates
  };
}

/**
 * Compress Dart/Flutter code (browser-compatible)
 */
export function compressDartBrowser(code: string): BrowserCompressionResult {
  return compressBrowser(code, "dart");
}

/**
 * Compress JavaScript/React code (browser-compatible)
 */
export function compressJavaScriptBrowser(code: string): BrowserCompressionResult {
  return compressBrowser(code, "javascript");
}

// ============================================================================
// Sample Code for Testing/Demo
// ============================================================================

export const sampleDartCode = `class LoginScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Login"),
        centerTitle: true,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextField(
              decoration: InputDecoration(
                labelText: "Username",
                border: OutlineInputBorder(),
              ),
            ),
            SizedBox(height: 16),
            TextField(
              obscureText: true,
              decoration: InputDecoration(
                labelText: "Password",
                border: OutlineInputBorder(),
              ),
            ),
            SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {},
              child: Text("Sign In"),
            ),
          ],
        ),
      ),
    );
  }
}`;

export const sampleReactCode = `import { useState, useEffect } from 'react';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Handle login
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          required
        />
      </div>
      <button type="submit" disabled={!username || !password}>
        Sign In
      </button>
    </form>
  );
}`;
