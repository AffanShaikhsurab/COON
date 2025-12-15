"use client";

import { useState, useCallback, useEffect } from "react";
import {
  compress,
  getDartAbbreviations,
  getReactAbbreviations,
  CompressionResult,
  Language,
} from "@/lib/coon-browser";

const SAMPLE_DART_CODE = `class LoginScreen extends StatelessWidget {
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
                labelText: "Email",
                hintText: "Enter your email",
                border: OutlineInputBorder(),
              ),
            ),
            SizedBox(height: 16),
            TextField(
              obscureText: true,
              decoration: InputDecoration(
                labelText: "Password",
                hintText: "Enter your password",
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

const SAMPLE_REACT_CODE = `import React, { useState, useEffect } from 'react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = 'Login';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Handle login logic
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
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
          placeholder="Enter your password"
          required
        />
      </div>
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}`;

export default function PlaygroundPage() {
  const [language, setLanguage] = useState<Language>("dart");
  const [input, setInput] = useState(SAMPLE_DART_CODE);
  const [output, setOutput] = useState("");
  const [stats, setStats] = useState<CompressionResult | null>(null);
  const [showReference, setShowReference] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleCompress = useCallback(() => {
    setIsCompressing(true);
    // Small delay to show loading state for better UX
    setTimeout(() => {
      const result = compress(input, language);
      setOutput(result.compressedCode);
      setStats(result);
      setIsCompressing(false);
    }, 150);
  }, [input, language]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleLoadSample = useCallback(() => {
    if (language === "dart") {
      setInput(SAMPLE_DART_CODE);
    } else {
      setInput(SAMPLE_REACT_CODE);
    }
    setOutput("");
    setStats(null);
  }, [language]);

  const handleLanguageChange = useCallback((newLang: Language) => {
    setLanguage(newLang);
    if (newLang === "dart") {
      setInput(SAMPLE_DART_CODE);
    } else {
      setInput(SAMPLE_REACT_CODE);
    }
    setOutput("");
    setStats(null);
  }, []);

  // Keyboard shortcut: Ctrl/Cmd + Enter to compress
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleCompress();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleCompress]);

  const dartAbbreviations = getDartAbbreviations();
  const reactAbbreviations = getReactAbbreviations();

  return (
    <div className="min-h-screen bg-[#14120B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
            COON Playground
          </h1>
          <p className="text-white/70 text-sm sm:text-base md:text-lg px-2">
            Compress your code to COON format and see the token savings in
            real-time
          </p>
        </div>

        {/* Language Toggle */}
        <div className="flex justify-center mb-4 sm:mb-6 px-2">
          <div className="inline-flex rounded-lg border border-white/20 p-1 bg-white/5 w-full sm:w-auto">
            <button
              onClick={() => handleLanguageChange("dart")}
              className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-2.5 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1.5 sm:gap-2 ${
                language === "dart"
                  ? "bg-[#FFEDAC] text-[#14120B]"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M4.105 4.105S9.158 1.58 11.684.316a3.079 3.079 0 0 1 1.481-.315c.766.047 1.677.788 1.677.788L24 9.948v9.789h-4.263V24H9.789l-9-9c-.303-.303-.592-.592-.644-.644C.015 14.227-.003 14.01 0 13.724V4.105zm6.316 10.106l6.316-6.316v6.316H10.42z" />
              </svg>
              <span className="hidden xs:inline">Dart / Flutter</span>
              <span className="xs:hidden">Dart</span>
            </button>
            <button
              onClick={() => handleLanguageChange("react")}
              className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-2.5 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1.5 sm:gap-2 ${
                language === "react"
                  ? "bg-[#FFEDAC] text-[#14120B]"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z" />
              </svg>
              <span className="hidden xs:inline">React / JavaScript</span>
              <span className="xs:hidden">React</span>
            </button>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Input Panel */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs sm:text-sm font-medium text-white/80">
                {language === "dart"
                  ? "Dart / Flutter Code"
                  : "React / JavaScript Code"}
              </label>
              <button
                onClick={handleLoadSample}
                className="text-xs text-white/50 hover:text-white transition-colors"
              >
                Load Sample
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 min-h-[250px] sm:min-h-[350px] lg:min-h-[400px] p-3 sm:p-4 bg-[#0D0B07] border border-white/10 rounded-lg font-mono text-xs sm:text-sm text-white resize-none focus:outline-none focus:ring-2 focus:ring-[#FFEDAC]/50 focus:border-transparent"
              placeholder={`Paste your ${
                language === "dart" ? "Dart" : "React"
              } code here...`}
              spellCheck={false}
            />
          </div>

          {/* Output Panel */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs sm:text-sm font-medium text-white/80">
                COON Output
              </label>
              {output && (
                <button
                  onClick={handleCopy}
                  className="text-xs text-white/50 hover:text-white transition-colors flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="flex-1 min-h-[250px] sm:min-h-[350px] lg:min-h-[400px] p-3 sm:p-4 bg-[#0D0B07] border border-white/10 rounded-lg font-mono text-xs sm:text-sm text-white overflow-auto whitespace-pre-wrap break-all">
              {output || (
                <span className="text-white/30">
                  Output will appear here...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Compress Button */}
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <button
            onClick={handleCompress}
            disabled={isCompressing}
            className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-[#FFEDAC] text-[#14120B] rounded-lg font-semibold hover:bg-[#FFE082] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isCompressing ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Compressing...
              </>
            ) : (
              <>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "20px" }}
                >
                  compress
                </span>
                Compress to COON
              </>
            )}
          </button>
          <span className="mt-2 text-xs text-white/40">
            Press Ctrl+Enter (⌘+Enter on Mac) to compress
          </span>
        </div>

        {/* Stats Panel */}
        {stats && (
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white/5 border border-white/10 rounded-xl">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "20px" }}
              >
                analytics
              </span>
              Compression Statistics
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 bg-[#0D0B07] rounded-lg border border-white/10">
                <div className="text-lg sm:text-2xl font-bold text-white">
                  {stats.originalTokens}
                </div>
                <div className="text-xs sm:text-sm text-white/60">
                  Original Tokens
                </div>
              </div>
              <div className="p-3 sm:p-4 bg-[#0D0B07] rounded-lg border border-white/10">
                <div className="text-lg sm:text-2xl font-bold text-[#FFEDAC]">
                  {stats.compressedTokens}
                </div>
                <div className="text-xs sm:text-sm text-white/60">
                  Compressed Tokens
                </div>
              </div>
              <div className="p-3 sm:p-4 bg-[#0D0B07] rounded-lg border border-white/10">
                <div className="text-lg sm:text-2xl font-bold text-green-400">
                  {stats.percentageSaved.toFixed(1)}%
                </div>
                <div className="text-xs sm:text-sm text-white/60">
                  Tokens Saved
                </div>
              </div>
              <div className="p-3 sm:p-4 bg-[#0D0B07] rounded-lg border border-white/10">
                <div className="text-lg sm:text-2xl font-bold text-white">
                  {stats.originalTokens - stats.compressedTokens}
                </div>
                <div className="text-xs sm:text-sm text-white/60">
                  Tokens Reduced
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reference Toggle */}
        <div className="border-t border-white/10 pt-4 sm:pt-6">
          <button
            onClick={() => setShowReference(!showReference)}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-3 sm:mb-4 text-sm sm:text-base"
          >
            <svg
              className={`w-4 h-4 transition-transform ${
                showReference ? "rotate-90" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span className="font-medium">
              {language === "dart" ? "Dart" : "React"} Abbreviation Reference
            </span>
          </button>

          {showReference && language === "dart" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Widgets */}
              <div className="p-3 sm:p-4 bg-white/5 border border-white/10 rounded-lg">
                <h4 className="font-semibold text-white mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "16px" }}
                  >
                    widgets
                  </span>
                  Widgets
                </h4>
                <div className="space-y-1 max-h-48 sm:max-h-64 overflow-y-auto">
                  {Object.entries(dartAbbreviations.widgets).map(
                    ([full, abbrev]) => (
                      <div key={full} className="flex justify-between text-sm">
                        <span className="text-white/70">{full}</span>
                        <span className="text-[#FFEDAC] font-mono">
                          {abbrev}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Properties */}
              <div className="p-3 sm:p-4 bg-white/5 border border-white/10 rounded-lg">
                <h4 className="font-semibold text-white mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "16px" }}
                  >
                    tune
                  </span>
                  Properties
                </h4>
                <div className="space-y-1 max-h-48 sm:max-h-64 overflow-y-auto">
                  {Object.entries(dartAbbreviations.properties).map(
                    ([full, abbrev]) => (
                      <div
                        key={full}
                        className="flex justify-between text-xs sm:text-sm"
                      >
                        <span className="text-white/70">{full}</span>
                        <span className="text-[#FFEDAC] font-mono">
                          {abbrev}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Keywords */}
              <div className="p-3 sm:p-4 bg-white/5 border border-white/10 rounded-lg">
                <h4 className="font-semibold text-white mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "16px" }}
                  >
                    code
                  </span>
                  Keywords
                </h4>
                <div className="space-y-1 max-h-48 sm:max-h-64 overflow-y-auto">
                  {Object.entries(dartAbbreviations.keywords).map(
                    ([full, abbrev]) => (
                      <div
                        key={full}
                        className="flex justify-between text-xs sm:text-sm"
                      >
                        <span className="text-white/70">{full}</span>
                        <span className="text-[#FFEDAC] font-mono">
                          {abbrev}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {showReference && language === "react" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* React Hooks */}
              <div className="p-3 sm:p-4 bg-white/5 border border-white/10 rounded-lg">
                <h4 className="font-semibold text-white mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "16px" }}
                  >
                    link
                  </span>
                  React Hooks
                </h4>
                <div className="space-y-1 max-h-48 sm:max-h-64 overflow-y-auto">
                  {Object.entries(reactAbbreviations.hooks).map(
                    ([full, abbrev]) => (
                      <div key={full} className="flex justify-between text-sm">
                        <span className="text-white/70">{full}</span>
                        <span className="text-[#FFEDAC] font-mono">
                          {abbrev}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Properties */}
              <div className="p-3 sm:p-4 bg-white/5 border border-white/10 rounded-lg">
                <h4 className="font-semibold text-white mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "16px" }}
                  >
                    tune
                  </span>
                  JSX Properties
                </h4>
                <div className="space-y-1 max-h-48 sm:max-h-64 overflow-y-auto">
                  {Object.entries(reactAbbreviations.properties).map(
                    ([full, abbrev]) => (
                      <div
                        key={full}
                        className="flex justify-between text-xs sm:text-sm"
                      >
                        <span className="text-white/70">{full}</span>
                        <span className="text-[#FFEDAC] font-mono">
                          {abbrev}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Keywords */}
              <div className="p-3 sm:p-4 bg-white/5 border border-white/10 rounded-lg">
                <h4 className="font-semibold text-white mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "16px" }}
                  >
                    code
                  </span>
                  JS Keywords
                </h4>
                <div className="space-y-1 max-h-48 sm:max-h-64 overflow-y-auto">
                  {Object.entries(reactAbbreviations.keywords).map(
                    ([full, abbrev]) => (
                      <div
                        key={full}
                        className="flex justify-between text-xs sm:text-sm"
                      >
                        <span className="text-white/70">{full}</span>
                        <span className="text-[#FFEDAC] font-mono">
                          {abbrev}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
