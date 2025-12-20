/**
 * COON Utils - Component Registry
 */

/**
 * Component definition
 */
export interface Component {
  id: string;
  name: string;
  pattern: string;
  template: string;
  category: string;
  parameters: string[];
  description?: string;
}

/**
 * Component registry for managing reusable components
 */
export class ComponentRegistry {
  private components: Map<string, Component> = new Map();

  constructor() {
    this.initializeDefaults();
  }

  /**
   * Initialize default components
   */
  private initializeDefaults(): void {
    const defaults: Component[] = [
      {
        id: "login_form",
        name: "LoginForm",
        pattern: "Column(TextField,TextField,ElevatedButton)",
        template: "@LF({email},{password},{onSubmit})",
        category: "forms",
        parameters: ["email", "password", "onSubmit"],
        description: "Standard login form with email and password fields",
      },
      {
        id: "app_bar_basic",
        name: "BasicAppBar",
        pattern: "AppBar(title:Text)",
        template: "@AB({title})",
        category: "navigation",
        parameters: ["title"],
        description: "Basic app bar with title",
      },
      {
        id: "list_item",
        name: "ListItem",
        pattern: "ListTile(leading:,title:,subtitle:)",
        template: "@LI({icon},{title},{subtitle})",
        category: "lists",
        parameters: ["icon", "title", "subtitle"],
        description: "Standard list tile item",
      },
      {
        id: "card_widget",
        name: "CardWidget",
        pattern: "Card(child:Padding)",
        template: "@CW({content},{padding})",
        category: "containers",
        parameters: ["content", "padding"],
        description: "Card with padding wrapper",
      },
    ];

    for (const component of defaults) {
      this.register(component);
    }
  }

  /**
   * Register a component
   */
  register(component: Component): void {
    this.components.set(component.id, component);
  }

  /**
   * Get component by ID
   */
  get(id: string): Component | undefined {
    return this.components.get(id);
  }

  /**
   * Get component by name
   */
  getByName(name: string): Component | undefined {
    for (const component of this.components.values()) {
      if (component.name === name) {
        return component;
      }
    }
    return undefined;
  }

  /**
   * Find matching components
   */
  findMatches(code: string): Component[] {
    const matches: Component[] = [];

    for (const component of this.components.values()) {
      if (this.matchesPattern(code, component.pattern)) {
        matches.push(component);
      }
    }

    return matches;
  }

  /**
   * Check if code matches pattern
   */
  private matchesPattern(code: string, pattern: string): boolean {
    // Convert pattern to regex
    const regexPattern = pattern
      .replace(/\(/g, "\\s*\\(\\s*")
      .replace(/\)/g, "\\s*\\)\\s*")
      .replace(/,/g, "\\s*,\\s*")
      .replace(/:/g, "\\s*:\\s*");

    const regex = new RegExp(regexPattern, "i");
    return regex.test(code);
  }

  /**
   * List all components
   */
  listAll(): Component[] {
    return Array.from(this.components.values());
  }

  /**
   * List components by category
   */
  listByCategory(category: string): Component[] {
    return Array.from(this.components.values()).filter((c) => c.category === category);
  }

  /**
   * Get all categories
   */
  getCategories(): string[] {
    const categories = new Set<string>();
    for (const component of this.components.values()) {
      categories.add(component.category);
    }
    return Array.from(categories);
  }

  /**
   * Remove a component
   */
  remove(id: string): boolean {
    return this.components.delete(id);
  }

  /**
   * Clear all components
   */
  clear(): void {
    this.components.clear();
  }

  /**
   * Export to JSON
   */
  toJSON(): object {
    return {
      version: "1.0.0",
      components: Array.from(this.components.values()),
    };
  }

  /**
   * Import from JSON
   */
  fromJSON(data: { components: Component[] }): void {
    for (const component of data.components) {
      this.register(component);
    }
  }
}

/**
 * Create default registry
 */
export function createDefaultRegistry(): ComponentRegistry {
  return new ComponentRegistry();
}
