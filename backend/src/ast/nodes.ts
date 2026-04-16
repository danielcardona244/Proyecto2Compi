// src/ast/nodes.ts

export interface Position {
  line: number;
  column: number;
}

export interface BaseNode {
  type: string;
  position?: Position;
}

export interface VariableDeclaration extends BaseNode {
  type: 'variable_declaration';
  name: string;
  varType?: Type;
  value?: Expression;
}

export interface FunctionDeclaration extends BaseNode {
  type: 'function_declaration';
  name: string;
  params: Parameter[];
  returnType?: Type;
  body: Statement[];
}

export interface StructDeclaration extends BaseNode {
  type: 'struct_declaration';
  name: string;
  fields: StructField[];
}

export interface StructField {
  type: Type;
  name: string;
}

export interface Parameter {
  name: string;
  type: Type;
}

export type Type =
  | 'int'
  | 'float64'
  | 'string'
  | 'bool'
  | 'rune'
  | { type: 'slice'; elementType: Type }
  | string; // for struct names

export type Statement =
  | VariableDeclaration
  | FunctionDeclaration
  | StructDeclaration
  | ExpressionStatement
  | IfStatement
  | ForStatement
  | ForRangeStatement
  | SwitchStatement
  | BreakStatement
  | ContinueStatement
  | ReturnStatement;

export interface ExpressionStatement extends BaseNode {
  type: 'expression_statement';
  expression: Expression;
}

export interface IfStatement extends BaseNode {
  type: 'if_statement';
  condition: Expression;
  body: Statement[];
  else?: Statement[] | IfStatement;
}

export interface ForStatement extends BaseNode {
  type: 'for_statement';
  init?: VariableDeclaration;
  condition?: Expression;
  increment?: Expression;
  body: Statement[];
}

export interface ForRangeStatement extends BaseNode {
  type: 'for_range_statement';
  index: string;
  value: string;
  range: Expression;
  body: Statement[];
}

export interface SwitchStatement extends BaseNode {
  type: 'switch_statement';
  expression: Expression;
  cases: CaseClause[];
}

export interface CaseClause extends BaseNode {
  type: 'case' | 'default';
  value?: Expression;
  body: Statement[];
}

export interface BreakStatement extends BaseNode {
  type: 'break';
}

export interface ContinueStatement extends BaseNode {
  type: 'continue';
}

export interface ReturnStatement extends BaseNode {
  type: 'return';
  value?: Expression;
}

export type Expression =
  | BinaryExpression
  | UnaryExpression
  | Literal
  | Identifier
  | FunctionCall
  | SliceLiteral
  | StructLiteral
  | MemberAccess
  | ArrayAccess
  | Assignment;

export interface BinaryExpression extends BaseNode {
  type: 'binary';
  operator: string;
  left: Expression;
  right: Expression;
}

export interface UnaryExpression extends BaseNode {
  type: 'unary';
  operator: string;
  operand: Expression;
}

export interface Literal extends BaseNode {
  type: 'literal';
  value: any;
  literalType: 'number' | 'string' | 'rune' | 'bool' | 'nil';
}

export interface Identifier extends BaseNode {
  type: 'identifier';
  name: string;
}

export interface FunctionCall extends BaseNode {
  type: 'function_call';
  name: string;
  args: Expression[];
}

export interface SliceLiteral extends BaseNode {
  type: 'slice_literal';
  elementType: Type;
  elements: Expression[];
}

export interface StructLiteral extends BaseNode {
  type: 'struct_literal';
  structName: string;
  fields: { [key: string]: Expression };
}

export interface MemberAccess extends BaseNode {
  type: 'member_access';
  object: Expression;
  member: string;
}

export interface ArrayAccess extends BaseNode {
  type: 'array_access';
  array: Expression;
  index: Expression;
}

export interface Assignment extends BaseNode {
  type: 'assignment';
  left: string;
  operator?: string;
  right: Expression;
}