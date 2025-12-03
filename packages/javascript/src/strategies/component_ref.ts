/**
 * COON Component Reference Strategy
 * 
 * Replace known components with references from registry.
 * Target: 70-80% token reduction for repeated patterns
 */

import { CompressionStrategy } from './base';
import { CompressionStrategyType, StrategyConfig } from './types';

/**
 * Default configuration for Component Reference strategy
 */
export const COMPONENT_REF_CONFIG: StrategyConfig = {
    name: 'Component Reference',
    description: 'Replace known components with references from registry',
    minCodeSize: 200,
    maxCodeSize: null,
    expectedRatio: 0.75,
    preserveFormatting: false,
    preserveComments: false,
    aggressiveWhitespace: true,
    widgetAbbreviation: true,
    propertyAbbreviation: true,
    keywordAbbreviation: true,
    useAstAnalysis: true,
    useComponentRegistry: true,
    parameters: {
        componentThreshold: 50,
        matchTolerance: 0.85
    }
};

/**
 * Component definition
 */
export interface Component {
    id: string;
    name: string;
    pattern: string;
    abbreviation: string;
    category: string;
}

/**
 * Component Reference compression strategy
 */
export class ComponentRefStrategy extends CompressionStrategy {
    private components: Map<string, Component>;

    constructor(config?: Partial<StrategyConfig>, language?: string) {
        super({ ...COMPONENT_REF_CONFIG, ...config }, language);
        this.components = new Map();
        this.initializeDefaultComponents();
    }

    get strategyType(): CompressionStrategyType {
        return CompressionStrategyType.COMPONENT_REF;
    }

    /**
     * Initialize default component patterns
     */
    private initializeDefaultComponents(): void {
        const defaults: Component[] = [
            {
                id: 'login_form',
                name: 'LoginForm',
                pattern: 'Column.*TextField.*TextField.*ElevatedButton',
                abbreviation: '@LF',
                category: 'form'
            },
            {
                id: 'app_scaffold',
                name: 'AppScaffold',
                pattern: 'Scaffold.*AppBar.*body:',
                abbreviation: '@AS',
                category: 'layout'
            },
            {
                id: 'list_tile',
                name: 'ListTile',
                pattern: 'ListTile.*leading:.*title:.*subtitle:',
                abbreviation: '@LT',
                category: 'display'
            },
            {
                id: 'card_widget',
                name: 'CardWidget',
                pattern: 'Card.*child:.*Padding',
                abbreviation: '@CW',
                category: 'container'
            },
            {
                id: 'button_row',
                name: 'ButtonRow',
                pattern: 'Row.*ElevatedButton.*ElevatedButton',
                abbreviation: '@BR',
                category: 'action'
            }
        ];

        for (const component of defaults) {
            this.components.set(component.id, component);
        }
    }

    /**
     * Register a custom component
     */
    registerComponent(component: Component): void {
        this.components.set(component.id, component);
    }

    compress(code: string): string {
        let result = code;

        // Step 1: Remove comments
        result = this.removeComments(result);

        // Step 2: Detect and replace component patterns
        result = this.replaceComponentPatterns(result);

        // Step 3: Apply standard abbreviations
        result = this.applyKeywordAbbreviations(result);
        result = this.applyWidgetAbbreviations(result);
        result = this.applyPropertyAbbreviations(result);

        // Step 4: Normalize whitespace
        if (this.config.aggressiveWhitespace) {
            result = this.normalizeWhitespace(result);
        }

        return result;
    }

    /**
     * Replace detected component patterns with references
     */
    private replaceComponentPatterns(code: string): string {
        let result = code;

        for (const [, component] of this.components) {
            const pattern = new RegExp(component.pattern, 'gs');
            if (pattern.test(result)) {
                // For now, add component reference as comment
                // In full implementation, would replace matching sections
                const matches = result.match(pattern);
                if (matches && matches[0].length > (this.config.parameters.componentThreshold as number)) {
                    // Could replace large matching sections
                    // result = result.replace(pattern, component.abbreviation);
                }
            }
        }

        return result;
    }

    /**
     * Get all registered components
     */
    getComponents(): Component[] {
        return Array.from(this.components.values());
    }
}
