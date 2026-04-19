// src/ast/astReporter.ts

import { Visitor } from './visitor';
import { Statement, Expression, BinaryExpression, UnaryExpression, Literal, Identifier, FunctionCall, SliceLiteral, StructLiteral, MemberAccess, ArrayAccess, Assignment } from './nodes';

export class ASTReporter extends Visitor<string> {
  private nodeId = 0;
  private dot = 'digraph AST {\n  node [shape=box];\n';

  visitStatement(stmt: Statement): string {
    switch (stmt.type) {
      case 'variable_declaration': return this.visitVariableDeclaration(stmt);
      case 'function_declaration': return this.visitFunctionDeclaration(stmt);
      case 'struct_declaration': return this.visitStructDeclaration(stmt);
      case 'expression_statement': return this.visitExpressionStatement(stmt);
      case 'if_statement': return this.visitIfStatement(stmt);
      case 'for_statement': return this.visitForStatement(stmt);
      case 'for_range_statement': return this.visitForRangeStatement(stmt);
      case 'switch_statement': return this.visitSwitchStatement(stmt);
      case 'break': return this.visitBreakStatement(stmt);
      case 'continue': return this.visitContinueStatement(stmt);
      case 'return': return this.visitReturnStatement(stmt);
      default: return '';
    }
  }

  visitExpression(expr: Expression): string {
    switch (expr.type) {
      case 'binary': return this.visitBinaryExpression(expr);
      case 'unary': return this.visitUnaryExpression(expr);
      case 'literal': return this.visitLiteral(expr);
      case 'identifier': return this.visitIdentifier(expr);
      case 'function_call': return this.visitFunctionCall(expr);
      case 'slice_literal': return this.visitSliceLiteral(expr);
      case 'struct_literal': return this.visitStructLiteral(expr);
      case 'member_access': return this.visitMemberAccess(expr);
      case 'array_access': return this.visitArrayAccess(expr);
      case 'assignment': return this.visitAssignment(expr);
      default: return '';
    }
  }

  visitVariableDeclaration(stmt: any): string {
    const id = this.getNodeId();
    this.dot += `  ${id} [label="Variable Declaration\\n${stmt.name}"];\n`;

    if (stmt.varType) {
      const typeId = this.getNodeId();
      this.dot += `  ${typeId} [label="Type: ${stmt.varType}"];\n`;
      this.dot += `  ${id} -> ${typeId};\n`;
    }

    if (stmt.value) {
      const valueId = this.visitExpression(stmt.value);
      this.dot += `  ${id} -> ${valueId};\n`;
    }

    return id;
  }

  visitFunctionDeclaration(stmt: any): string {
    const id = this.getNodeId();
    this.dot += `  ${id} [label="Function Declaration\\n${stmt.name}"];\n`;

    if (stmt.returnType) {
      const returnId = this.getNodeId();
      this.dot += `  ${returnId} [label="Return Type: ${stmt.returnType}"];\n`;
      this.dot += `  ${id} -> ${returnId};\n`;
    }

    // Parameters
    if (stmt.params && stmt.params.length > 0) {
      const paramsId = this.getNodeId();
      this.dot += `  ${paramsId} [label="Parameters"];\n`;
      this.dot += `  ${id} -> ${paramsId};\n`;

      stmt.params.forEach((param: any) => {
        const paramId = this.getNodeId();
        this.dot += `  ${paramId} [label="Param: ${param.name} ${param.type}"];\n`;
        this.dot += `  ${paramsId} -> ${paramId};\n`;
      });
    }

    // Body
    if (stmt.body && stmt.body.length > 0) {
      const bodyId = this.getNodeId();
      this.dot += `  ${bodyId} [label="Body"];\n`;
      this.dot += `  ${id} -> ${bodyId};\n`;

      stmt.body.forEach((s: Statement) => {
        const stmtId = this.visitStatement(s);
        this.dot += `  ${bodyId} -> ${stmtId};\n`;
      });
    }

    return id;
  }

  visitStructDeclaration(stmt: any): string {
    const id = this.getNodeId();
    this.dot += `  ${id} [label="Struct Declaration\\n${stmt.name}"];\n`;

    if (stmt.fields && stmt.fields.length > 0) {
      const fieldsId = this.getNodeId();
      this.dot += `  ${fieldsId} [label="Fields"];\n`;
      this.dot += `  ${id} -> ${fieldsId};\n`;

      stmt.fields.forEach((field: any) => {
        const fieldId = this.getNodeId();
        this.dot += `  ${fieldId} [label="Field: ${field.name} ${field.type}"];\n`;
        this.dot += `  ${fieldsId} -> ${fieldId};\n`;
      });
    }

    return id;
  }

  visitExpressionStatement(stmt: any): string {
    const id = this.getNodeId();
    this.dot += `  ${id} [label="Expression Statement"];\n`;

    const exprId = this.visitExpression(stmt.expression);
    this.dot += `  ${id} -> ${exprId};\n`;

    return id;
  }

  visitIfStatement(stmt: any): string {
    const id = this.getNodeId();
    this.dot += `  ${id} [label="If Statement"];\n`;

    const conditionId = this.visitExpression(stmt.condition);
    this.dot += `  ${id} -> ${conditionId} [label="condition"];\n`;

    if (stmt.body && stmt.body.length > 0) {
      const bodyId = this.getNodeId();
      this.dot += `  ${bodyId} [label="Body"];\n`;
      this.dot += `  ${id} -> ${bodyId};\n`;

      stmt.body.forEach((s: Statement) => {
        const stmtId = this.visitStatement(s);
        this.dot += `  ${bodyId} -> ${stmtId};\n`;
      });
    }

    if (stmt.else) {
      const elseId = this.getNodeId();
      this.dot += `  ${elseId} [label="Else"];\n`;
      this.dot += `  ${id} -> ${elseId};\n`;

      if (Array.isArray(stmt.else)) {
        stmt.else.forEach((s: Statement) => {
          const stmtId = this.visitStatement(s);
          this.dot += `  ${elseId} -> ${stmtId};\n`;
        });
      } else {
        const elseStmtId = this.visitStatement(stmt.else);
        this.dot += `  ${elseId} -> ${elseStmtId};\n`;
      }
    }

    return id;
  }

  visitForStatement(stmt: any): string {
    const id = this.getNodeId();
    this.dot += `  ${id} [label="For Statement"];\n`;

    if (stmt.init) {
      const initId = this.visitStatement(stmt.init);
      this.dot += `  ${id} -> ${initId} [label="init"];\n`;
    }

    if (stmt.condition) {
      const conditionId = this.visitExpression(stmt.condition);
      this.dot += `  ${id} -> ${conditionId} [label="condition"];\n`;
    }

    if (stmt.increment) {
      const incrementId = this.visitExpression(stmt.increment);
      this.dot += `  ${id} -> ${incrementId} [label="increment"];\n`;
    }

    if (stmt.body && stmt.body.length > 0) {
      const bodyId = this.getNodeId();
      this.dot += `  ${bodyId} [label="Body"];\n`;
      this.dot += `  ${id} -> ${bodyId};\n`;

      stmt.body.forEach((s: Statement) => {
        const stmtId = this.visitStatement(s);
        this.dot += `  ${bodyId} -> ${stmtId};\n`;
      });
    }

    return id;
  }

  visitForRangeStatement(stmt: any): string {
    const id = this.getNodeId();
    this.dot += `  ${id} [label="For Range Statement\\n${stmt.index}, ${stmt.value}"];\n`;

    const rangeId = this.visitExpression(stmt.range);
    this.dot += `  ${id} -> ${rangeId} [label="range"];\n`;

    if (stmt.body && stmt.body.length > 0) {
      const bodyId = this.getNodeId();
      this.dot += `  ${bodyId} [label="Body"];\n`;
      this.dot += `  ${id} -> ${bodyId};\n`;

      stmt.body.forEach((s: Statement) => {
        const stmtId = this.visitStatement(s);
        this.dot += `  ${bodyId} -> ${stmtId};\n`;
      });
    }

    return id;
  }

  visitSwitchStatement(stmt: any): string {
    const id = this.getNodeId();
    this.dot += `  ${id} [label="Switch Statement"];\n`;

    const exprId = this.visitExpression(stmt.expression);
    this.dot += `  ${id} -> ${exprId} [label="expression"];\n`;

    if (stmt.cases && stmt.cases.length > 0) {
      const casesId = this.getNodeId();
      this.dot += `  ${casesId} [label="Cases"];\n`;
      this.dot += `  ${id} -> ${casesId};\n`;

      stmt.cases.forEach((case_: any) => {
        const caseId = this.getNodeId();
        this.dot += `  ${caseId} [label="${case_.type}"];\n`;
        this.dot += `  ${casesId} -> ${caseId};\n`;

        if (case_.value) {
          const valueId = this.visitExpression(case_.value);
          this.dot += `  ${caseId} -> ${valueId} [label="value"];\n`;
        }

        if (case_.body && case_.body.length > 0) {
          const bodyId = this.getNodeId();
          this.dot += `  ${bodyId} [label="Body"];\n`;
          this.dot += `  ${caseId} -> ${bodyId};\n`;

          case_.body.forEach((s: Statement) => {
            const stmtId = this.visitStatement(s);
            this.dot += `  ${bodyId} -> ${stmtId};\n`;
          });
        }
      });
    }

    return id;
  }

  visitBreakStatement(stmt: any): string {
    const id = this.getNodeId();
    this.dot += `  ${id} [label="Break"];\n`;
    return id;
  }

  visitContinueStatement(stmt: any): string {
    const id = this.getNodeId();
    this.dot += `  ${id} [label="Continue"];\n`;
    return id;
  }

  visitReturnStatement(stmt: any): string {
    const id = this.getNodeId();
    this.dot += `  ${id} [label="Return"];\n`;

    if (stmt.value) {
      const valueId = this.visitExpression(stmt.value);
      this.dot += `  ${id} -> ${valueId};\n`;
    }

    return id;
  }

  visitBinaryExpression(expr: BinaryExpression): string {
    const id = this.getNodeId();
    this.dot += `  ${id} [label="Binary\\n${expr.operator}"];\n`;

    const leftId = this.visitExpression(expr.left);
    const rightId = this.visitExpression(expr.right);

    this.dot += `  ${id} -> ${leftId} [label="left"];\n`;
    this.dot += `  ${id} -> ${rightId} [label="right"];\n`;

    return id;
  }

  visitUnaryExpression(expr: UnaryExpression): string {
    const id = this.getNodeId();
    this.dot += `  ${id} [label="Unary\\n${expr.operator}"];\n`;

    const operandId = this.visitExpression(expr.operand);
    this.dot += `  ${id} -> ${operandId};\n`;

    return id;
  }

  visitLiteral(expr: Literal): string {
    const id = this.getNodeId();
    const value = typeof expr.value === 'string' ? `"${expr.value}"` : expr.value;
    this.dot += `  ${id} [label="Literal\\n${value} (${expr.literalType})"];\n`;
    return id;
  }

  visitIdentifier(expr: Identifier): string {
    const id = this.getNodeId();
    this.dot += `  ${id} [label="Identifier\\n${expr.name}"];\n`;
    return id;
  }

  visitFunctionCall(expr: FunctionCall): string {
    const id = this.getNodeId();
    this.dot += `  ${id} [label="Function Call\\n${expr.name}"];\n`;

    if (expr.args && expr.args.length > 0) {
      const argsId = this.getNodeId();
      this.dot += `  ${argsId} [label="Arguments"];\n`;
      this.dot += `  ${id} -> ${argsId};\n`;

      expr.args.forEach((arg: Expression) => {
        const argId = this.visitExpression(arg);
        this.dot += `  ${argsId} -> ${argId};\n`;
      });
    }

    return id;
  }

  visitSliceLiteral(expr: SliceLiteral): string {
    const id = this.getNodeId();
    this.dot += `  ${id} [label="Slice Literal\\n[]${expr.elementType}"];\n`;

    if (expr.elements && expr.elements.length > 0) {
      const elementsId = this.getNodeId();
      this.dot += `  ${elementsId} [label="Elements"];\n`;
      this.dot += `  ${id} -> ${elementsId};\n`;

      expr.elements.forEach((element: Expression) => {
        const elementId = this.visitExpression(element);
        this.dot += `  ${elementsId} -> ${elementId};\n`;
      });
    }

    return id;
  }

  visitStructLiteral(expr: StructLiteral): string {
    const id = this.getNodeId();
    this.dot += `  ${id} [label="Struct Literal\\n${expr.structName}"];\n`;

    if (expr.fields) {
      const fieldsId = this.getNodeId();
      this.dot += `  ${fieldsId} [label="Fields"];\n`;
      this.dot += `  ${id} -> ${fieldsId};\n`;

      Object.entries(expr.fields).forEach(([key, value]) => {
        const fieldId = this.getNodeId();
        this.dot += `  ${fieldId} [label="Field: ${key}"];\n`;
        this.dot += `  ${fieldsId} -> ${fieldId};\n`;

        const valueId = this.visitExpression(value);
        this.dot += `  ${fieldId} -> ${valueId};\n`;
      });
    }

    return id;
  }

  visitMemberAccess(expr: MemberAccess): string {
    const id = this.getNodeId();
    this.dot += `  ${id} [label="Member Access\\n.${expr.member}"];\n`;

    const objectId = this.visitExpression(expr.object);
    this.dot += `  ${id} -> ${objectId} [label="object"];\n`;

    return id;
  }

  visitArrayAccess(expr: ArrayAccess): string {
    const id = this.getNodeId();
    this.dot += `  ${id} [label="Array Access"];\n`;

    const arrayId = this.visitExpression(expr.array);
    const indexId = this.visitExpression(expr.index);

    this.dot += `  ${id} -> ${arrayId} [label="array"];\n`;
    this.dot += `  ${id} -> ${indexId} [label="index"];\n`;

    return id;
  }

  visitAssignment(expr: Assignment): string {
    const id = this.getNodeId();
    const operator = expr.operator ? expr.operator : '=';
    this.dot += `  ${id} [label="Assignment\\n${operator}"];\n`;

    const leftId = this.getNodeId();
    this.dot += `  ${leftId} [label="Left: ${expr.left}"];\n`;
    this.dot += `  ${id} -> ${leftId};\n`;

    const rightId = this.visitExpression(expr.right);
    this.dot += `  ${id} -> ${rightId} [label="right"];\n`;

    return id;
  }

  private getNodeId(): string {
    return `node${this.nodeId++}`;
  }

  getDot(): string {
    return this.dot + '}\n';
  }

  generateReport(statements: Statement[]): string {
    this.nodeId = 0;
    this.dot = 'digraph AST {\n  node [shape=box];\n';

    const rootId = this.getNodeId();
    this.dot += `  ${rootId} [label="Program"];\n`;

    statements.forEach((stmt) => {
      const stmtId = this.visitStatement(stmt);
      this.dot += `  ${rootId} -> ${stmtId};\n`;
    });

    return this.getDot();
  }
}