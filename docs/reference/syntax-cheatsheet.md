# COON Syntax Cheatsheet

Quick reference for COON format abbreviations and syntax patterns.

## Widget Abbreviations

| Abbreviation | Widget | Abbreviation | Widget |
|--------------|--------|--------------|--------|
| `S` | Scaffold | `B` | AppBar |
| `C` | Column | `R` | Row |
| `A` | SafeArea | `P` | Padding |
| `T` | Text | `K` | Container |
| `N` | Center | `Z` | SizedBox |
| `F` | TextField | `E` | ElevatedButton |
| `L` | ListView | `G` | GridView |
| `St` | Stack | `Ps` | Positioned |
| `Ex` | Expanded | `Fl` | Flexible |
| `Cd` | Card | `Ic` | Icon |
| `Ib` | IconButton | `Fb` | FloatingActionButton |
| `Bt` | TextButton | `Tf` | TextFormField |
| `Im` | Image | `Dv` | Divider |
| `Dr` | Drawer | `Al` | Align |
| `Bn` | BottomNavigationBar | `Tb` | TabBar |
| `Tv` | TabBarView | `Sv` | SingleChildScrollView |
| `Cv` | CustomScrollView | `Y` | TextStyle |
| `D` | InputDecoration | `O` | OutlineInputBorder |
| `X` | TextEditingController | `Cp` | CircularProgressIndicator |
| `Lp` | LinearProgressIndicator | | |

## Property Abbreviations

| Abbreviation | Property | Abbreviation | Property |
|--------------|----------|--------------|----------|
| `a:` | appBar | `b:` | body |
| `c:` | child | `h:` | children |
| `t:` | title | `r:` | controller |
| `p:` | padding | `o:` | onPressed |
| `s:` | style | `z:` | fontSize |
| `w:` | fontWeight | `l:` | color |
| `d:` | decoration | `L:` | labelText |
| `H:` | hintText | `B:` | border |
| `e:` | height | `W:` | width |
| `x:` | obscureText | `T:` | centerTitle |
| `A:` | mainAxisAlignment | `X:` | crossAxisAlignment |
| `M:` | minimumSize | `m:` | margin |
| `n:` | alignment | `bg:` | backgroundColor |
| `oc:` | onChanged | `bl:` | builder |
| `ms:` | mainAxisSize | `xs:` | crossAxisSize |

## MainAxisAlignment Values

| Abbreviation | Value |
|--------------|-------|
| `start` | MainAxisAlignment.start |
| `end` | MainAxisAlignment.end |
| `center` | MainAxisAlignment.center |
| `spB` | MainAxisAlignment.spaceBetween |
| `spA` | MainAxisAlignment.spaceAround |
| `spE` | MainAxisAlignment.spaceEvenly |

## CrossAxisAlignment Values

| Abbreviation | Value |
|--------------|-------|
| `start` | CrossAxisAlignment.start |
| `end` | CrossAxisAlignment.end |
| `center` | CrossAxisAlignment.center |
| `str` | CrossAxisAlignment.stretch |
| `bl` | CrossAxisAlignment.baseline |

## Color Abbreviations

| Abbreviation | Color |
|--------------|-------|
| `Cl.r` | Colors.red |
| `Cl.g` | Colors.green |
| `Cl.b` | Colors.blue |
| `Cl.w` | Colors.white |
| `Cl.bl` | Colors.black |
| `Cl.gr` | Colors.grey |
| `Cl.t` | Colors.transparent |
| `Cl.o` | Colors.orange |
| `Cl.y` | Colors.yellow |
| `Cl.p` | Colors.purple |
| `Cl.pk` | Colors.pink |
| `Cl.cy` | Colors.cyan |
| `Cl.te` | Colors.teal |
| `Cl.in` | Colors.indigo |
| `Cl.am` | Colors.amber |

## Keyword Abbreviations

| Abbreviation | Keyword | Abbreviation | Keyword |
|--------------|---------|--------------|---------|
| `c:` | class | `f:` | final |
| `<` | extends | `>` | implements |
| `+` | with | `im:` | import |
| `ret` | return | `asy` | async |
| `awt` | await | `cn:` | const |
| `st:` | static | `v:` | void |
| `ov:` | @override | `W` | Widget |
| `ctx` | BuildContext | `1` | true |
| `0` | false | `_` | null |

## Class Definition Syntax

```
c:ClassName<SuperClass
```

**Example:**
```
c:MyWidget<StatelessWidget
```

Expands to:
```dart
class MyWidget extends StatelessWidget
```

## Method Definition Syntax

```
m:methodName(params)->ReturnType{body}
```

**Example:**
```
m:build(ctx)->W{ret C{c:Cl.r}}
```

Expands to:
```dart
Widget build(BuildContext context) {
  return Container(color: Colors.red);
}
```

## Widget Tree Syntax

**Children:** Use `[...]` for children list
```
Col[T"A",T"B",T"C"]
```

**Properties:** Use `{...}` for properties
```
C{w:100,h:50,c:Cl.r}
```

**Combined:**
```
C{p:16}[Col{mA:center}[T"Hello",SB{h:10},T"World"]]
```

## Full Examples

### Simple Widget

**COON:**
```
C{c:Cl.b,br:8,p:16}[T"Hello World"]
```

**Dart:**
```dart
Container(
  color: Colors.blue,
  borderRadius: BorderRadius.circular(8),
  padding: EdgeInsets.all(16),
  child: Text("Hello World"),
)
```

### ListView with Items

**COON:**
```
LV.b[C{m:8}[T"Item 1"],C{m:8}[T"Item 2"]]
```

**Dart:**
```dart
ListView.builder(
  children: [
    Container(margin: EdgeInsets.all(8), child: Text("Item 1")),
    Container(margin: EdgeInsets.all(8), child: Text("Item 2")),
  ],
)
```

### Scaffold with AppBar

**COON:**
```
Scf{aB:AppB{t:T"My App",a:[IBtn{ic:Ic.set,onP:_onSet}]},bod:Ctr[T"Content"],fab:FAB{onP:_onAdd}[Ic.add]}
```

**Dart:**
```dart
Scaffold(
  appBar: AppBar(
    title: Text("My App"),
    actions: [
      IconButton(icon: Icon(Icons.settings), onPressed: _onSettings),
    ],
  ),
  body: Center(child: Text("Content")),
  floatingActionButton: FloatingActionButton(
    onPressed: _onAdd,
    child: Icon(Icons.add),
  ),
)
```

### Complete StatelessWidget Class

**COON:**
```
c:HomePage<StatelessWidget;@o m:b(ctx)->W{ret Scf{aB:AppB{t:T"Home"},bod:Col{mA:center,cA:center}[Ic.home{sz:64,c:Cl.b},SB{h:16},T"Welcome Home"]}}
```

**Dart:**
```dart
class HomePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Home")),
      body: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Icon(Icons.home, size: 64, color: Colors.blue),
          SizedBox(height: 16),
          Text("Welcome Home"),
        ],
      ),
    );
  }
}
```

## Edge Cases

### Empty Widgets

```
C{}          # Empty Container
SB{}         # Empty SizedBox
Col[]        # Empty Column
```

### Nested Functions

```
GD{onTap:()=>_nav(ctx,'home')}[T"Go"]
```

### String Escaping

```
T"Hello \"World\""      # Escaped quotes
T'It\'s working'        # Single quote escaping
```

### Multi-line COON

```
c:App<StatelessWidget;
@o m:b(ctx)->W{
  ret Scf{
    aB:AppB{t:T"App"},
    bod:Col[T"Line1",T"Line2"]
  }
}
```
