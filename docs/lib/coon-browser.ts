/**
 * Browser-compatible COON compression library
 * This is a simplified version of the full SDK for use in the browser
 * Supports both Dart/Flutter and React/JavaScript
 */

// ============================================
// DART ABBREVIATIONS
// ============================================

const DART_WIDGETS: Record<string, string> = {
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

const DART_PROPERTIES: Record<string, string> = {
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

const DART_KEYWORDS: Record<string, string> = {
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

// ============================================
// REACT/JAVASCRIPT ABBREVIATIONS
// ============================================

const REACT_HOOKS: Record<string, string> = {
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
};

const JSX_ELEMENTS: Record<string, string> = {
  button: "B",
  input: "I",
  form: "F",
  label: "L",
  textarea: "TA",
  select: "SL",
  option: "O",
};

const REACT_COMPONENTS: Record<string, string> = {
  Fragment: "Fr",
  StrictMode: "SM",
  Suspense: "Su",
};

const REACT_PROPERTIES: Record<string, string> = {
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
  defaultValue: "dv",
  checked: "chk",
  disabled: "dis",
  readOnly: "ro",
  required: "req",
  placeholder: "ph",
  htmlFor: "hf",
  tabIndex: "ti",
};

const JS_KEYWORDS: Record<string, string> = {
  function: "fn:",
  const: "cn:",
  return: "ret",
  export: "exp",
  import: "imp",
  default: "def",
  async: "asn:",
  await: "awt",
  true: "1",
  false: "0",
  null: "nul",
  undefined: "udf",
};

export type Language = "dart" | "react";

export interface CompressionResult {
  compressedCode: string;
  originalTokens: number;
  compressedTokens: number;
  percentageSaved: number;
  language: Language;
}

/**
 * Estimate token count (rough approximation)
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Escape special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Compress Dart code to COON format
 */
export function compressDart(code: string): CompressionResult {
  let compressed = code;

  compressed = compressed
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");

  const sortedWidgets = Object.entries(DART_WIDGETS).sort(
    (a, b) => b[0].length - a[0].length
  );

  for (const [full, abbrev] of sortedWidgets) {
    const regex = new RegExp(`\\b${full}\\b`, "g");
    compressed = compressed.replace(regex, abbrev);
  }

  for (const [full, abbrev] of Object.entries(DART_PROPERTIES)) {
    compressed = compressed.replace(
      new RegExp(escapeRegExp(full), "g"),
      abbrev
    );
  }

  const sortedKeywords = Object.entries(DART_KEYWORDS).sort(
    (a, b) => b[0].length - a[0].length
  );

  for (const [full, abbrev] of sortedKeywords) {
    const regex = new RegExp(`\\b${escapeRegExp(full)}\\b`, "g");
    compressed = compressed.replace(regex, abbrev);
  }

  compressed = compressed
    .replace(/\s*:\s*/g, ":")
    .replace(/\s*\(\s*/g, "(")
    .replace(/\s*\)\s*/g, ")")
    .replace(/\s*\{\s*/g, "{")
    .replace(/\s*\}\s*/g, "}")
    .replace(/\s*,\s*/g, ",")
    .replace(/\s*;\s*/g, ";")
    .replace(/@ov:\s*/g, "")
    .replace(/W\s+build\s*\(\s*ctx\s+context\s*\)/g, "m:b")
    .replace(/\n/g, "");

  const originalTokens = estimateTokens(code);
  const compressedTokens = estimateTokens(compressed);
  const percentageSaved =
    ((originalTokens - compressedTokens) / originalTokens) * 100;

  return {
    compressedCode: compressed,
    originalTokens,
    compressedTokens,
    percentageSaved: Math.max(0, percentageSaved),
    language: "dart",
  };
}

/**
 * Compress React/JavaScript code to COON format
 */
export function compressReact(code: string): CompressionResult {
  let compressed = code;

  compressed = compressed
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");

  const sortedHooks = Object.entries(REACT_HOOKS).sort(
    (a, b) => b[0].length - a[0].length
  );

  for (const [full, abbrev] of sortedHooks) {
    const regex = new RegExp(`\\b${full}\\b`, "g");
    compressed = compressed.replace(regex, abbrev);
  }

  const sortedComponents = Object.entries(REACT_COMPONENTS).sort(
    (a, b) => b[0].length - a[0].length
  );

  for (const [full, abbrev] of sortedComponents) {
    const regex = new RegExp(`\\b${full}\\b`, "g");
    compressed = compressed.replace(regex, abbrev);
  }

  for (const [full, abbrev] of Object.entries(JSX_ELEMENTS)) {
    compressed = compressed.replace(
      new RegExp(`<${full}\\b`, "g"),
      `<${abbrev}`
    );
    compressed = compressed.replace(
      new RegExp(`</${full}>`, "g"),
      `</${abbrev}>`
    );
  }

  const sortedProps = Object.entries(REACT_PROPERTIES).sort(
    (a, b) => b[0].length - a[0].length
  );

  for (const [full, abbrev] of sortedProps) {
    const regex = new RegExp(`\\b${full}=`, "g");
    compressed = compressed.replace(regex, `${abbrev}=`);
  }

  const sortedKeywords = Object.entries(JS_KEYWORDS).sort(
    (a, b) => b[0].length - a[0].length
  );

  for (const [full, abbrev] of sortedKeywords) {
    const regex = new RegExp(`\\b${escapeRegExp(full)}\\b`, "g");
    compressed = compressed.replace(regex, abbrev);
  }

  compressed = compressed
    .replace(/\s*=>\s*/g, "=>")
    .replace(/\s*\(\s*/g, "(")
    .replace(/\s*\)\s*/g, ")")
    .replace(/\s*\{\s*/g, "{")
    .replace(/\s*\}\s*/g, "}")
    .replace(/\s*,\s*/g, ",")
    .replace(/\s*;\s*/g, ";")
    .replace(/\s*<\s*/g, "<")
    .replace(/\s*>\s*/g, ">")
    .replace(/\s*\/>\s*/g, "/>")
    .replace(/\n/g, "");

  const originalTokens = estimateTokens(code);
  const compressedTokens = estimateTokens(compressed);
  const percentageSaved =
    ((originalTokens - compressedTokens) / originalTokens) * 100;

  return {
    compressedCode: compressed,
    originalTokens,
    compressedTokens,
    percentageSaved: Math.max(0, percentageSaved),
    language: "react",
  };
}

/**
 * Compress code based on language
 */
export function compress(code: string, language: Language): CompressionResult {
  if (language === "react") {
    return compressReact(code);
  }
  return compressDart(code);
}

/**
 * Get Dart abbreviations for reference
 */
export function getDartAbbreviations() {
  return {
    widgets: DART_WIDGETS,
    properties: DART_PROPERTIES,
    keywords: DART_KEYWORDS,
  };
}

/**
 * Get React abbreviations for reference
 */
export function getReactAbbreviations() {
  return {
    hooks: REACT_HOOKS,
    components: REACT_COMPONENTS,
    elements: JSX_ELEMENTS,
    properties: REACT_PROPERTIES,
    keywords: JS_KEYWORDS,
  };
}
