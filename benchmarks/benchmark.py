# COON Benchmarking Suite - Real Measurements
from coon import Compressor
import json

# Real Dart code samples
test_cases = {
    "simple_widget": """
class SimpleWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Text("Hello World");
  }
}
""",
    
    "login_screen": """
class LoginScreen extends StatelessWidget {
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Login"),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text("Welcome Back", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
              SizedBox(height: 16),
              TextField(
                controller: emailController,
                decoration: InputDecoration(
                  labelText: "Email",
                  hintText: "you@example.com",
                  border: OutlineInputBorder(),
                ),
              ),
              SizedBox(height: 16),
              TextField(
                controller: passwordController,
                obscureText: true,
                decoration: InputDecoration(
                  labelText: "Password",
                  border: OutlineInputBorder(),
                ),
              ),
              SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {},
                child: Text("Login"),
                style: ElevatedButton.styleFrom(
                  minimumSize: Size(double.infinity, 50),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
""",
    
    "list_view": """
class ProductList extends StatelessWidget {
  final List<Product> products;
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Products")),
      body: ListView.builder(
        itemCount: products.length,
        itemBuilder: (context, index) {
          return ListTile(
            leading: Icon(Icons.shopping_bag),
            title: Text(products[index].name),
            subtitle: Text("\$${products[index].price}"),
            trailing: IconButton(
              icon: Icon(Icons.add_shopping_cart),
              onPressed: () {},
            ),
          );
        },
      ),
    );
  }
}
""",

    "stateful_counter": """
class Counter extends StatefulWidget {
  @override
  _CounterState createState() => _CounterState();
}

class _CounterState extends State<Counter> {
  int count = 0;
  
  void increment() {
    setState(() {
      count++;
    });
  }
  
  void decrement() {
    setState(() {
      count--;
    });
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Counter")),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text("Count:", style: TextStyle(fontSize: 20)),
            Text("$count", style: TextStyle(fontSize: 48, fontWeight: FontWeight.bold)),
            SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ElevatedButton(
                  onPressed: decrement,
                  child: Icon(Icons.remove),
                ),
                SizedBox(width: 16),
                ElevatedButton(
                  onPressed: increment,
                  child: Icon(Icons.add),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
"""
}

def run_benchmarks():
    """Run actual benchmarks on real code"""
    compressor = Compressor()
    strategies = ["basic", "aggressive"]
    
    results = {}
    
    print("=" * 80)
    print("COON REAL BENCHMARKS - ACTUAL MEASUREMENTS")
    print("=" * 80)
    
    for test_name, code in test_cases.items():
        print(f"\n{'='*80}")
        print(f"Test Case: {test_name}")
        print(f"{'='*80}")
        print(f"Original code length: {len(code)} characters")
        
        results[test_name] = {}
        
        for strategy in strategies:
            result = compressor.compress(code, strategy=strategy)
            
            print(f"\n{strategy.upper()} Strategy:")
            print(f"  Original tokens: {result.original_tokens}")
            print(f"  Compressed tokens: {result.compressed_tokens}")
            print(f"  Tokens saved: {result.token_savings}")
            print(f"  Reduction: {result.percentage_saved:.1f}%")
            print(f"  Compressed length: {len(result.compressed_code)} characters")
            
            results[test_name][strategy] = {
                "original_tokens": result.original_tokens,
                "compressed_tokens": result.compressed_tokens,
                "reduction_percent": result.percentage_saved,
                "compressed_length": len(result.compressed_code)
            }
    
    # Calculate averages
    print(f"\n{'='*80}")
    print("SUMMARY - ACTUAL AVERAGE REDUCTIONS")
    print(f"{'='*80}")
    
    for strategy in strategies:
        reductions = [results[test][strategy]["reduction_percent"] for test in test_cases.keys()]
        avg_reduction = sum(reductions) / len(reductions)
        
        print(f"\n{strategy.upper()} Strategy:")
        print(f"  Average reduction: {avg_reduction:.1f}%")
        print(f"  Min reduction: {min(reductions):.1f}%")
        print(f"  Max reduction: {max(reductions):.1f}%")
    
    # Save results
    with open("benchmark_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\n{'='*80}")
    print("✅ Benchmark results saved to benchmark_results.json")
    print(f"{'='*80}")
    
    return results

if __name__ == "__main__":
    run_benchmarks()
