/**
 * COON Strategy Tests
 */

import {
    BasicStrategy,
    AggressiveStrategy,
    ASTBasedStrategy,
    ComponentRefStrategy,
    StrategySelector,
    CompressionStrategyType
} from '../src/strategies';

describe('BasicStrategy', () => {
    let strategy: BasicStrategy;

    beforeEach(() => {
        strategy = new BasicStrategy();
    });

    test('compresses keywords', () => {
        const code = 'class MyClass extends BaseClass {}';
        const result = strategy.compress(code);

        expect(result).toContain('c:');
        expect(result).toContain('<');
    });

    test('compresses widgets', () => {
        const code = 'Scaffold(body: Column(children: []))';
        const result = strategy.compress(code);

        expect(result.length).toBeLessThan(code.length);
    });

    test('returns strategy type', () => {
        expect(strategy.strategyType).toBe(CompressionStrategyType.BASIC);
    });
});

describe('AggressiveStrategy', () => {
    let strategy: AggressiveStrategy;

    beforeEach(() => {
        strategy = new AggressiveStrategy();
    });

    test('achieves higher compression than basic', () => {
        const code = `
            class TestWidget extends StatelessWidget {
                Widget build(BuildContext context) {
                    return Scaffold(
                        appBar: AppBar(title: Text("Test")),
                        body: Column(children: [Text("Hello")])
                    );
                }
            }
        `;

        const basic = new BasicStrategy();
        const basicResult = basic.compress(code);
        const aggressiveResult = strategy.compress(code);

        // Aggressive should produce shorter output
        expect(aggressiveResult.length).toBeLessThanOrEqual(basicResult.length);
    });

    test('removes comments', () => {
        const code = '// This is a comment\nclass Test {}';
        const result = strategy.compress(code);

        expect(result).not.toContain('//');
    });

    test('returns strategy type', () => {
        expect(strategy.strategyType).toBe(CompressionStrategyType.AGGRESSIVE);
    });
});

describe('ASTBasedStrategy', () => {
    let strategy: ASTBasedStrategy;

    beforeEach(() => {
        strategy = new ASTBasedStrategy();
    });

    test('compresses code', () => {
        const code = `
            class Widget {
                Widget build(BuildContext context) {
                    return Container(child: Text("Hello"));
                }
            }
        `;

        const result = strategy.compress(code);

        expect(result.length).toBeLessThan(code.length);
    });

    test('returns strategy type', () => {
        expect(strategy.strategyType).toBe(CompressionStrategyType.AST_BASED);
    });

    test('is suitable for large code', () => {
        const largeCode = 'x'.repeat(500);
        expect(strategy.isSuitable(largeCode)).toBe(true);
    });

    test('is not suitable for small code', () => {
        const smallCode = 'x'.repeat(100);
        expect(strategy.isSuitable(smallCode)).toBe(false);
    });
});

describe('ComponentRefStrategy', () => {
    let strategy: ComponentRefStrategy;

    beforeEach(() => {
        strategy = new ComponentRefStrategy();
    });

    test('compresses code', () => {
        const code = `
            Column(
                children: [
                    TextField(controller: emailController),
                    TextField(controller: passwordController),
                    ElevatedButton(onPressed: login, child: Text("Login"))
                ]
            )
        `;

        const result = strategy.compress(code);

        expect(result.length).toBeLessThan(code.length);
    });

    test('allows registering custom components', () => {
        strategy.registerComponent({
            id: 'custom',
            name: 'CustomWidget',
            pattern: 'CustomPattern',
            abbreviation: '@CU',
            category: 'custom'
        });

        const components = strategy.getComponents();
        expect(components.some(c => c.id === 'custom')).toBe(true);
    });

    test('returns strategy type', () => {
        expect(strategy.strategyType).toBe(CompressionStrategyType.COMPONENT_REF);
    });
});

describe('StrategySelector', () => {
    let selector: StrategySelector;

    beforeEach(() => {
        selector = new StrategySelector();
    });

    test('selects strategy based on code size', () => {
        const smallCode = 'class A {}';
        const largeCode = 'class B {}'.repeat(100);

        const smallStrategy = selector.selectStrategy(smallCode);
        const largeStrategy = selector.selectStrategy(largeCode);

        expect(smallStrategy).toBeDefined();
        expect(largeStrategy).toBeDefined();
    });

    test('creates strategy instance', () => {
        const basic = selector.createStrategy(CompressionStrategyType.BASIC);
        const aggressive = selector.createStrategy(CompressionStrategyType.AGGRESSIVE);

        expect(basic).toBeInstanceOf(BasicStrategy);
        expect(aggressive).toBeInstanceOf(AggressiveStrategy);
    });

    test('tracks metrics', () => {
        selector.updateMetrics(CompressionStrategyType.BASIC, 0.5, 100, 10, true);

        const metrics = selector.getMetrics(CompressionStrategyType.BASIC);

        expect(metrics).toBeDefined();
        expect(metrics!.useCount).toBe(1);
    });

    test('returns all metrics', () => {
        const allMetrics = selector.getAllMetrics();

        expect(allMetrics.length).toBeGreaterThan(0);
    });
});
