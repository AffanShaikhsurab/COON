# COON 🚀

**TL;DR:** COON empowers **Agentic Coding** by allowing LLMs to generate compressed code directly, saving **30-70% on output tokens** and generation time.

---

## The Agentic Shift

In the era of AI agents, code generation speed and cost are bottlenecks. **COON** flips the script: instead of just compressing code *input*, it enables LLMs to **output** compressed code.

You give the LLM a base prompt, it generates concise COON syntax, and you decompress it locally.

---

## Why COON?

**🚀 Turbocharged Generation** - LLMs write up to 3x faster by generating fewer tokens.
**💰 Massive Cost Savings** - Pay for 70% fewer output tokens.
**🧠 Larger Context Window** - Fit more logic into a single response.
**🤖 Native to Agents** - Designed to be the "machine code" for high-level AI agents.

---

## How It Works

### The Agentic Workflow

1.  **Prompt**: You provide the LLM with your request + the COON System Prompt (see below).
2.  **Generate**: The LLM thinks and outputs code in compressed COON format.
3.  **Decompress**: Your agent or script uses the `coon` library to expand it into full source code.
4.  **Save**: The full code is written to your file system.

### Visual Comparison

**Standard Generation (Slow & Expensive):**
`User Prompt` -> `LLM` -> `[150 Tokens of Dart Code]` -> `File`

**COON Generation (Fast & Efficient):**
`User Prompt` -> `LLM` -> `[45 Tokens of COON]` -> `Decompressor` -> `[150 Tokens of Dart Code]` -> `File`

---

## Token Savings

**Scenario: Generating a Login Screen**

**Traditional Output (150 tokens):**
```dart
class LoginScreen extends StatelessWidget {
  final TextEditingController emailController = TextEditingController();
  // ... verbose boilerplate ...
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Login")),
      // ... more code ...
    );
  }
}
```

**COON Output (45 tokens - 70% reduction):**
```
c:LoginScreen<StatelessWidget>;f:emailController=X;m:b S{a:B{t:T"Login"}}...
```

**Result:**
- **Speed:** 3x faster generation
- **Cost:** 70% cheaper per request

---

## Agentic Integration

To enable your LLM agent (custom script, Cursor, Windsurf, etc.) to speak COON, append this to your system prompt:

### System Prompt Snippet

```text
You are an expert coder. When asked to generate code, output it in COON (Code-Oriented Object Notation) format to save tokens.
COON Rules:
- Class definition: `c:Name<Parent>;`
- Fields: `f:name=Value,name2=Value;`
- Methods: `m:name Body` (default name 'b' is build)
- Widgets: Abbreviate common widgets (S=Scaffold, C=Column, R=Row, T=Text, B=AppBar, etc.)
- Properties: Abbreviate keys (b=body, c=child/children, a=appBar)
- Strings: `T"Content"` for Text widgets.

Example Output:
c:MyWidget<StatelessWidget>;m:b S{b:C{h:[T"Hello",T"World"]}}
```

---

## Supported Platforms

![Flutter](https://img.shields.io/badge/Flutter-02569B?style=flat&logo=flutter&logoColor=white)
![Dart](https://img.shields.io/badge/Dart-0175C2?style=flat&logo=dart&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)

---

## Getting Started

### 1. Install the Library
```bash
pip install coon
# or
npm install coon-format
```

### 2. Decompression Script
Use this in your agent's toolchain to handle the LLM's output:

```python
from coon import decompress_dart

# LLM Output
coon_code = "c:Hello<StatelessWidget>;m:b T'Hi'"

# Decompress to source
full_code = decompress_dart(coon_code)
print(full_code)
# Output:
# class Hello extends StatelessWidget {
#   Widget build(context) => Text('Hi');
# }
```

---

## Need Help?

**📧 Email:** affanshaikhsurabofficial@gmail.com

**🐙 GitHub:** [github.com/AffanShaikhsurab/COON](https://github.com/AffanShaikhsurab/COON)

**💬 Issues:** Create a GitHub issue for support

---

## License

MIT License - Use COON in any project, commercial or personal.

**Ready to save money?** [Get started now](#getting-started) 🚀
