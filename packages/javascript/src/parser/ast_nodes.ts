/**
 * COON Parser - AST Node Types
 */

/**
 * AST Node types
 */
export enum NodeType {
  PROGRAM = "PROGRAM",
  IMPORT = "IMPORT",
  CLASS_DECLARATION = "CLASS_DECLARATION",
  METHOD_DECLARATION = "METHOD_DECLARATION",
  FIELD_DECLARATION = "FIELD_DECLARATION",
  CONSTRUCTOR = "CONSTRUCTOR",
  PARAMETER = "PARAMETER",
  BLOCK = "BLOCK",
  RETURN_STATEMENT = "RETURN_STATEMENT",
  EXPRESSION_STATEMENT = "EXPRESSION_STATEMENT",
  VARIABLE_DECLARATION = "VARIABLE_DECLARATION",
  IF_STATEMENT = "IF_STATEMENT",
  FOR_STATEMENT = "FOR_STATEMENT",
  WHILE_STATEMENT = "WHILE_STATEMENT",
  WIDGET_INSTANTIATION = "WIDGET_INSTANTIATION",
  FUNCTION_CALL = "FUNCTION_CALL",
  PROPERTY_ACCESS = "PROPERTY_ACCESS",
  NAMED_ARGUMENT = "NAMED_ARGUMENT",
  BINARY_EXPRESSION = "BINARY_EXPRESSION",
  UNARY_EXPRESSION = "UNARY_EXPRESSION",
  LITERAL = "LITERAL",
  IDENTIFIER = "IDENTIFIER",
  LIST_LITERAL = "LIST_LITERAL",
  MAP_LITERAL = "MAP_LITERAL",
}

/**
 * Base AST Node interface
 */
export interface ASTNode {
  type: NodeType;
  line: number;
  column: number;
}

/**
 * Program node (root)
 */
export interface ProgramNode extends ASTNode {
  type: NodeType.PROGRAM;
  imports: ImportNode[];
  declarations: DeclarationNode[];
}

/**
 * Import node
 */
export interface ImportNode extends ASTNode {
  type: NodeType.IMPORT;
  path: string;
  alias?: string;
  isShow?: boolean;
  isHide?: boolean;
  names?: string[];
}

/**
 * Declaration base
 */
export type DeclarationNode = ClassDeclarationNode | FieldDeclarationNode;

/**
 * Class declaration node
 */
export interface ClassDeclarationNode extends ASTNode {
  type: NodeType.CLASS_DECLARATION;
  name: string;
  superclass?: string;
  interfaces?: string[];
  mixins?: string[];
  members: MemberNode[];
}

/**
 * Member types
 */
export type MemberNode =
  | MethodDeclarationNode
  | FieldDeclarationNode
  | ConstructorNode;

/**
 * Method declaration node
 */
export interface MethodDeclarationNode extends ASTNode {
  type: NodeType.METHOD_DECLARATION;
  name: string;
  returnType?: string;
  parameters: ParameterNode[];
  body?: BlockNode;
  isStatic: boolean;
  isAsync: boolean;
  isOverride: boolean;
  isGetter: boolean;
  isSetter: boolean;
}

/**
 * Field declaration node
 */
export interface FieldDeclarationNode extends ASTNode {
  type: NodeType.FIELD_DECLARATION;
  name: string;
  fieldType?: string;
  initializer?: ExpressionNode;
  isFinal: boolean;
  isStatic: boolean;
  isConst: boolean;
}

/**
 * Constructor node
 */
export interface ConstructorNode extends ASTNode {
  type: NodeType.CONSTRUCTOR;
  name?: string;
  parameters: ParameterNode[];
  initializers?: string[];
  body?: BlockNode;
  isConst: boolean;
}

/**
 * Parameter node
 */
export interface ParameterNode extends ASTNode {
  type: NodeType.PARAMETER;
  name: string;
  paramType?: string;
  defaultValue?: ExpressionNode;
  isRequired: boolean;
  isNamed: boolean;
}

/**
 * Block node
 */
export interface BlockNode extends ASTNode {
  type: NodeType.BLOCK;
  statements: StatementNode[];
}

/**
 * Statement types
 */
export type StatementNode =
  | ReturnStatementNode
  | ExpressionStatementNode
  | VariableDeclarationNode
  | IfStatementNode
  | ForStatementNode
  | WhileStatementNode;

/**
 * Return statement
 */
export interface ReturnStatementNode extends ASTNode {
  type: NodeType.RETURN_STATEMENT;
  value?: ExpressionNode;
}

/**
 * Expression statement
 */
export interface ExpressionStatementNode extends ASTNode {
  type: NodeType.EXPRESSION_STATEMENT;
  expression: ExpressionNode;
}

/**
 * Variable declaration
 */
export interface VariableDeclarationNode extends ASTNode {
  type: NodeType.VARIABLE_DECLARATION;
  name: string;
  varType?: string;
  initializer?: ExpressionNode;
  isFinal: boolean;
  isConst: boolean;
}

/**
 * If statement
 */
export interface IfStatementNode extends ASTNode {
  type: NodeType.IF_STATEMENT;
  condition: ExpressionNode;
  thenBranch: StatementNode | BlockNode;
  elseBranch?: StatementNode | BlockNode;
}

/**
 * For statement
 */
export interface ForStatementNode extends ASTNode {
  type: NodeType.FOR_STATEMENT;
  initializer?: ExpressionNode | VariableDeclarationNode;
  condition?: ExpressionNode;
  increment?: ExpressionNode;
  body: StatementNode | BlockNode;
}

/**
 * While statement
 */
export interface WhileStatementNode extends ASTNode {
  type: NodeType.WHILE_STATEMENT;
  condition: ExpressionNode;
  body: StatementNode | BlockNode;
}

/**
 * Expression types
 */
export type ExpressionNode =
  | WidgetInstantiationNode
  | FunctionCallNode
  | PropertyAccessNode
  | BinaryExpressionNode
  | UnaryExpressionNode
  | LiteralNode
  | IdentifierNode
  | ListLiteralNode
  | MapLiteralNode
  | NamedArgumentNode;

/**
 * Widget instantiation
 */
export interface WidgetInstantiationNode extends ASTNode {
  type: NodeType.WIDGET_INSTANTIATION;
  widgetName: string;
  arguments: (ExpressionNode | NamedArgumentNode)[];
  isConst: boolean;
}

/**
 * Function call
 */
export interface FunctionCallNode extends ASTNode {
  type: NodeType.FUNCTION_CALL;
  callee: ExpressionNode;
  arguments: (ExpressionNode | NamedArgumentNode)[];
}

/**
 * Property access
 */
export interface PropertyAccessNode extends ASTNode {
  type: NodeType.PROPERTY_ACCESS;
  object: ExpressionNode;
  property: string;
}

/**
 * Named argument
 */
export interface NamedArgumentNode extends ASTNode {
  type: NodeType.NAMED_ARGUMENT;
  name: string;
  value: ExpressionNode;
}

/**
 * Binary expression
 */
export interface BinaryExpressionNode extends ASTNode {
  type: NodeType.BINARY_EXPRESSION;
  operator: string;
  left: ExpressionNode;
  right: ExpressionNode;
}

/**
 * Unary expression
 */
export interface UnaryExpressionNode extends ASTNode {
  type: NodeType.UNARY_EXPRESSION;
  operator: string;
  operand: ExpressionNode;
  isPrefix: boolean;
}

/**
 * Literal
 */
export interface LiteralNode extends ASTNode {
  type: NodeType.LITERAL;
  value: string | number | boolean | null;
  literalType: "string" | "number" | "boolean" | "null";
}

/**
 * Identifier
 */
export interface IdentifierNode extends ASTNode {
  type: NodeType.IDENTIFIER;
  name: string;
}

/**
 * List literal
 */
export interface ListLiteralNode extends ASTNode {
  type: NodeType.LIST_LITERAL;
  elements: ExpressionNode[];
  isConst: boolean;
}

/**
 * Map literal
 */
export interface MapLiteralNode extends ASTNode {
  type: NodeType.MAP_LITERAL;
  entries: { key: ExpressionNode; value: ExpressionNode }[];
  isConst: boolean;
}
