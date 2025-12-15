import { Hero } from "@/components/Hero";
import { CopyButton } from "@/components/CopyButton";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="bg-[#14120B]">
      <Hero />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-white">Why COON?</h2>
          <p className="text-lg text-white/80 mb-4">
            When working with Large Language Models for code generation, token
            efficiency directly impacts cost and context utilization:
          </p>
          <ul className="list-disc list-inside space-y-2 text-white/80">
            <li>
              <strong className="text-white">Context Windows</strong>: LLMs have
              finite context windows that fill quickly with verbose code
            </li>
            <li>
              <strong className="text-white">API Costs</strong>: Token count
              directly correlates with API pricing
            </li>
            <li>
              <strong className="text-white">Multi-Agent Systems</strong>:
              Agents passing code between each other multiply token overhead
            </li>
            <li>
              <strong className="text-white">Response Quality</strong>: More
              context space for examples improves generation quality
            </li>
          </ul>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-white">Quick Example</h2>

          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2 text-white">
              Standard Dart code (verbose):
            </h3>
            <pre className="bg-[#14120B] border border-white/10 p-4 rounded-lg overflow-x-auto">
              <code className="text-sm text-white">{`class LoginScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Login")),
      body: Center(child: Text("Welcome")),
    );
  }
}`}</code>
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 text-white">
              COON format (65% fewer tokens):
            </h3>
            <pre className="bg-[#14120B] border border-white/10 p-4 rounded-lg overflow-x-auto">
              <code className="text-sm text-white">{`c:LoginScreen<StatelessWidget>;m:b S{a:B{t:T"Login"},b:N{c:T"Welcome"}}`}</code>
            </pre>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-white">Installation</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-white/10 rounded-lg p-4 bg-[#14120B]">
              <h3 className="font-semibold mb-2 text-white">npm</h3>
              <div className="flex items-center justify-between bg-white/10 p-2 rounded">
                <code className="text-white text-sm">
                  npm install coon-format
                </code>
                <CopyButton text="npm install coon-format" />
              </div>
            </div>
            <div className="border border-white/10 rounded-lg p-4 bg-[#14120B]">
              <h3 className="font-semibold mb-2 text-white">pip</h3>
              <div className="flex items-center justify-between bg-white/10 p-2 rounded">
                <code className="text-white text-sm">pip install coon</code>
                <CopyButton text="pip install coon" />
              </div>
            </div>
            <div className="border border-white/10 rounded-lg p-4 bg-[#14120B]">
              <h3 className="font-semibold mb-2 text-white">
                npx (no install)
              </h3>
              <div className="flex items-center justify-between bg-white/10 p-2 rounded">
                <code className="text-white text-sm">
                  npx @coon/cli compress app.dart
                </code>
                <CopyButton text="npx @coon/cli compress app.dart" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6 text-white">Token Savings</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-white/20">
              <thead>
                <tr className="bg-white/5">
                  <th className="border border-white/20 px-4 py-2 text-left text-white">
                    Test Case
                  </th>
                  <th className="border border-white/20 px-4 py-2 text-left text-white">
                    Original
                  </th>
                  <th className="border border-white/20 px-4 py-2 text-left text-white">
                    Compressed
                  </th>
                  <th className="border border-white/20 px-4 py-2 text-left text-white">
                    Reduction
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-white/20 px-4 py-2 text-white">
                    Simple Widget
                  </td>
                  <td className="border border-white/20 px-4 py-2 text-white">
                    33 tokens
                  </td>
                  <td className="border border-white/20 px-4 py-2 text-white">
                    13 tokens
                  </td>
                  <td className="border border-white/20 px-4 py-2 text-white">
                    60.6%
                  </td>
                </tr>
                <tr>
                  <td className="border border-white/20 px-4 py-2 text-white">
                    Login Screen
                  </td>
                  <td className="border border-white/20 px-4 py-2 text-white">
                    405 tokens
                  </td>
                  <td className="border border-white/20 px-4 py-2 text-white">
                    121 tokens
                  </td>
                  <td className="border border-white/20 px-4 py-2 text-white">
                    70.1%
                  </td>
                </tr>
                <tr>
                  <td className="border border-white/20 px-4 py-2 text-white">
                    List View
                  </td>
                  <td className="border border-white/20 px-4 py-2 text-white">
                    165 tokens
                  </td>
                  <td className="border border-white/20 px-4 py-2 text-white">
                    78 tokens
                  </td>
                  <td className="border border-white/20 px-4 py-2 text-white">
                    52.7%
                  </td>
                </tr>
                <tr className="font-semibold">
                  <td className="border border-white/20 px-4 py-2 text-white">
                    Average
                  </td>
                  <td className="border border-white/20 px-4 py-2 text-white">
                    -
                  </td>
                  <td className="border border-white/20 px-4 py-2 text-white">
                    -
                  </td>
                  <td className="border border-white/20 px-4 py-2 text-white">
                    61.3%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
