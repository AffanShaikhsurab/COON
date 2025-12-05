# Format Overview

This guide explains the COON compression format syntax, transformation rules, and best practices.

## Core Concepts

COON compresses Dart/Flutter code through:

1. **Keyword Abbreviation** - Dart keywords → short codes
2. **Widget Abbreviation** - Widget names → single/double letters
3. **Property Abbreviation** - Property names → short codes
4. **Whitespace Optimization** - Remove unnecessary whitespace
5. **Special Notation** - Compact representations for common patterns

## Structure Delimiters

| Delimiter | Usage |
|-----------|-------|
| `{}` | Widget/class body, parameter groups |
| `[]` | Arrays, children lists |
| `:` | Property name separator |
| `;` | Statement/section separator |
| `,` | List item separator |
| `<>` | Type parameters, extends/implements |

## Keyword Abbreviations

### Class Structure

| Dart Keyword | COON | Example |
|--------------|------|---------|
| `class` | `c:` | `c:MyWidget` |
| `extends` | `<` | `c:MyWidget<StatelessWidget` |
| `implements` | `>` | `c:MyWidget>Interface` |
| `with` | `+` | `c:MyWidget+Mixin` |
| `final` | `f:` | `f:name=value` |
| `const` | `cn:` | `cn:value` |
| `static` | `st:` | `st:field` |

### Method Structure

| Dart Keyword | COON | Example |
|--------------|------|---------|
| `void` | `v:` | `v:method` |
| `return` | `ret` | `ret value` |
| `async` | `asy` | `asy method` |
| `await` | `awt` | `awt call()` |
| `@override` | (removed) | - |

### Types

| Dart Type | COON |
|-----------|------|
| `Widget` | `W` |
| `BuildContext` | `ctx` |
| `String` | `Str` |
| `int` | `i` |
| `double` | `d` |
| `bool` | `bl` |

## Widget Abbreviations

Common Flutter widgets are mapped to single/double-letter codes:

### Layout Widgets

| Widget | COON | Widget | COON |
|--------|------|--------|------|
| `Scaffold` | `S` | `AppBar` | `B` |
| `Column` | `C` | `Row` | `R` |
| `Center` | `N` | `Container` | `K` |
| `Padding` | `P` | `SizedBox` | `Z` |
| `SafeArea` | `A` | `Expanded` | `Ex` |
| `Stack` | `St` | `Positioned` | `Ps` |

### Content Widgets

| Widget | COON | Widget | COON |
|--------|------|--------|------|
| `Text` | `T` | `Icon` | `Ic` |
| `Image` | `Im` | `Card` | `Cd` |
| `ListView` | `L` | `GridView` | `G` |

### Interactive Widgets

| Widget | COON | Widget | COON |
|--------|------|--------|------|
| `TextField` | `F` | `ElevatedButton` | `E` |
| `TextButton` | `Bt` | `IconButton` | `Ib` |
| `FloatingActionButton` | `Fb` | `TextFormField` | `Tf` |

## Property Abbreviations

| Property | COON | Property | COON |
|----------|------|----------|------|
| `appBar:` | `a:` | `body:` | `b:` |
| `child:` | `c:` | `children:` | `h:` |
| `title:` | `t:` | `padding:` | `p:` |
| `style:` | `s:` | `color:` | `l:` |
| `decoration:` | `d:` | `controller:` | `r:` |
| `onPressed:` | `o:` | `onChanged:` | `oc:` |
| `height:` | `e:` | `width:` | `W:` |
| `mainAxisAlignment:` | `A:` | `crossAxisAlignment:` | `X:` |

## Special Notations

### EdgeInsets

```dart
// Original Dart
EdgeInsets.all(24)
EdgeInsets.symmetric(horizontal: 16, vertical: 8)
EdgeInsets.only(left: 10, top: 5, right: 10, bottom: 5)

// COON notation
@24
@16,8
@10,5,10,5
```

### Constructors

```dart
// Original Dart
TextEditingController()
TextStyle.bold()

// COON notation
~TextEditingController
~TextStyle.bold
```

### Boolean Values

```dart
// Original Dart
true
false

// COON notation
1
0
```

### Null Values

```dart
// Original Dart
null

// COON notation
_
```

## Complete Example

### Original Dart Code

```dart
class LoginScreen extends StatelessWidget {
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Login"),
      ),
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(24.0),
          child: Column(
            children: [
              Text("Welcome Back"),
              Text("Login to continue"),
            ],
          ),
        ),
      ),
    );
  }
}
```

### COON Compressed (65% reduction)

```
c:LoginScreen<StatelessWidget>;f:emailController=~TextEditingController,passwordController=~TextEditingController;m:b S{a:B{t:T"Login"},b:A{c:P{p:@24,c:C{h:[T"Welcome Back",T"Login to continue"]}}}}
```

### Breakdown

| Part | Meaning |
|------|---------|
| `c:LoginScreen<StatelessWidget` | `class LoginScreen extends StatelessWidget` |
| `f:emailController=~TextEditingController` | `final emailController = TextEditingController()` |
| `m:b` | `method: build` |
| `S{...}` | `Scaffold(...)` |
| `a:B{t:T"Login"}` | `appBar: AppBar(title: Text("Login"))` |
| `b:A{c:P{...}}` | `body: SafeArea(child: Padding(...))` |
| `p:@24` | `padding: EdgeInsets.all(24)` |
| `h:[...]` | `children: [...]` |

## Whitespace Rules

1. **Remove all unnecessary whitespace** between tokens
2. **Use semicolons (`;`)** to separate major sections (class, fields, methods)
3. **Use commas (`,`)** to separate list items
4. **Use curly braces (`{}`)** to denote widget trees

## Annotation Rules

1. **Remove `@override`** annotations (implied for build methods)
2. **Remove `@deprecated`** annotations
3. **Preserve custom annotations** as comments if semantically important

## Best Practices

::: tip Strategy Selection
- Use `basic` for simple widgets and when debugging
- Use `aggressive` for production compression
- Use `ast_based` for complex nested structures
- Use `auto` when unsure (analyzes code automatically)
:::

::: warning Round-Trip Validation
Always validate that decompressed code matches the original semantics before using in production.
:::
