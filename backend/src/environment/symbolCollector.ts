// src/environment/symbolCollector.ts

import { Visitor } from '../ast/visitor';
import { SymbolTable, SymbolInfo } from './symbolTable';
import { Statement, Expression, VariableDeclaration, FunctionDeclaration, StructDeclaration, Parameter } from '../ast/nodes';

export class SymbolCollector extends Visitor<void> {
  private symbolTable: SymbolTable;
  private currentLine: number = 1;
  private currentColumn: number = 1;

  constructor(symbolTable: SymbolTable) {
    super();
    this.symbolTable = symbolTable;
  }

  setPosition(line: number, column: number): void {
    this.currentLine = line;
    this.currentColumn = column;
  }

  visitStatement(stmt: Statement): void {
    // Actualizar posición si está disponible
    if (stmt.position) {
      this.currentLine = stmt.position.line;
      this.currentColumn = stmt.position.column;
    }

    switch (stmt.type) {
      case 'variable_declaration':
        this.visitVariableDeclaration(stmt);
        break;
      case 'function_declaration':
        this.visitFunctionDeclaration(stmt);
        break;
      case 'struct_declaration':
        this.visitStructDeclaration(stmt);
        break;
      case 'expression_statement':
        this.visitExpressionStatement(stmt);
        break;
      case 'if_statement':
        this.visitIfStatement(stmt);
        break;
      case 'for_statement':
        this.visitForStatement(stmt);
        break;
      case 'for_range_statement':
        this.visitForRangeStatement(stmt);
        break;
      case 'switch_statement':
        this.visitSwitchStatement(stmt);
        break;
      case 'break':
        this.visitBreakStatement(stmt);
        break;
      case 'continue':
        this.visitContinueStatement(stmt);
        break;
      case 'return':
        this.visitReturnStatement(stmt);
        break;
    }
  }

  visitExpression(expr: Expression): void {
    // No recolectamos símbolos de expresiones individuales
    // Solo procesamos las que contienen declaraciones
    switch (expr.type) {
      case 'binary':
        this.visitBinaryExpression(expr);
        break;
      case 'unary':
        this.visitUnaryExpression(expr);
        break;
      case 'literal':
        this.visitLiteral(expr);
        break;
      case 'identifier':
        this.visitIdentifier(expr);
        break;
      case 'function_call':
        this.visitFunctionCall(expr);
        break;
      case 'slice_literal':
        this.visitSliceLiteral(expr);
        break;
      case 'struct_literal':
        this.visitStructLiteral(expr);
        break;
      case 'member_access':
        this.visitMemberAccess(expr);
        break;
      case 'array_access':
        this.visitArrayAccess(expr);
        break;
      case 'assignment':
        this.visitAssignment(expr);
        break;
    }
  }

  visitVariableDeclaration(stmt: VariableDeclaration): void {
    const dataType = typeof stmt.varType === 'string' ? stmt.varType : 'complex';

    const symbol: SymbolInfo = {
      id: stmt.name,
      type: 'variable',
      dataType: dataType,
      scope: this.symbolTable['currentScope'] || 'global',
      line: this.currentLine,
      column: this.currentColumn,
      value: stmt.value ? 'initialized' : 'declared'
    };

    this.symbolTable.addSymbol(symbol);
  }

  visitFunctionDeclaration(stmt: FunctionDeclaration): void {
    const returnType = typeof stmt.returnType === 'string' ? stmt.returnType : 'complex';

    const params = stmt.params ? stmt.params.map(p => ({
      name: p.name,
      type: typeof p.type === 'string' ? p.type : 'complex'
    })) : [];

    const symbol: SymbolInfo = {
      id: stmt.name,
      type: 'function',
      dataType: returnType,
      scope: 'global', // Funciones son globales
      line: this.currentLine,
      column: this.currentColumn,
      params: params
    };

    this.symbolTable.addSymbol(symbol);

    // Procesar parámetros en scope de función
    if (stmt.params && stmt.params.length > 0) {
      const functionScope = `function_${stmt.name}`;
      this.symbolTable.enterScope(functionScope);

      stmt.params.forEach(param => {
        const paramSymbol: SymbolInfo = {
          id: param.name,
          type: 'parameter',
          dataType: typeof param.type === 'string' ? param.type : 'complex',
          scope: functionScope,
          line: this.currentLine,
          column: this.currentColumn
        };
        this.symbolTable.addSymbol(paramSymbol);
      });

      // Procesar cuerpo de la función
      if (stmt.body) {
        stmt.body.forEach(s => this.visitStatement(s));
      }

      this.symbolTable.exitScope();
    }
  }

  visitStructDeclaration(stmt: StructDeclaration): void {
    const fields = stmt.fields ? stmt.fields.map(f => ({
      name: f.name,
      type: typeof f.type === 'string' ? f.type : 'complex'
    })) : [];

    const symbol: SymbolInfo = {
      id: stmt.name,
      type: 'struct',
      dataType: 'struct',
      scope: 'global', // Structs son globales
      line: this.currentLine,
      column: this.currentColumn,
      fields: fields
    };

    this.symbolTable.addSymbol(symbol);
  }

  visitExpressionStatement(stmt: any): void {
    this.visitExpression(stmt.expression);
  }

  visitIfStatement(stmt: any): void {
    this.visitExpression(stmt.condition);

    if (stmt.body) {
      this.symbolTable.enterScope('if_block');
      stmt.body.forEach((s: Statement) => this.visitStatement(s));
      this.symbolTable.exitScope();
    }

    if (stmt.else) {
      this.symbolTable.enterScope('else_block');
      if (Array.isArray(stmt.else)) {
        stmt.else.forEach((s: Statement) => this.visitStatement(s));
      } else {
        this.visitStatement(stmt.else);
      }
      this.symbolTable.exitScope();
    }
  }

  visitForStatement(stmt: any): void {
    this.symbolTable.enterScope('for_block');

    if (stmt.init) {
      this.visitStatement(stmt.init);
    }

    if (stmt.condition) {
      this.visitExpression(stmt.condition);
    }

    if (stmt.increment) {
      this.visitExpression(stmt.increment);
    }

    if (stmt.body) {
      stmt.body.forEach((s: Statement) => this.visitStatement(s));
    }

    this.symbolTable.exitScope();
  }

  visitForRangeStatement(stmt: any): void {
    this.symbolTable.enterScope('for_range_block');

    // Agregar variables del range
    const indexSymbol: SymbolInfo = {
      id: stmt.index,
      type: 'variable',
      dataType: 'int', // índice es int
      scope: 'for_range_block',
      line: this.currentLine,
      column: this.currentColumn
    };
    this.symbolTable.addSymbol(indexSymbol);

    const valueSymbol: SymbolInfo = {
      id: stmt.value,
      type: 'variable',
      dataType: 'inferred', // tipo del elemento del slice
      scope: 'for_range_block',
      line: this.currentLine,
      column: this.currentColumn
    };
    this.symbolTable.addSymbol(valueSymbol);

    this.visitExpression(stmt.range);

    if (stmt.body) {
      stmt.body.forEach((s: Statement) => this.visitStatement(s));
    }

    this.symbolTable.exitScope();
  }

  visitSwitchStatement(stmt: any): void {
    this.visitExpression(stmt.expression);

    if (stmt.cases) {
      stmt.cases.forEach((case_: any) => {
        this.symbolTable.enterScope('case_block');

        if (case_.value) {
          this.visitExpression(case_.value);
        }

        if (case_.body) {
          case_.body.forEach((s: Statement) => this.visitStatement(s));
        }

        this.symbolTable.exitScope();
      });
    }
  }

  visitBreakStatement(stmt: any): void {
    // No recolecta símbolos
  }

  visitContinueStatement(stmt: any): void {
    // No recolecta símbolos
  }

  visitReturnStatement(stmt: any): void {
    if (stmt.value) {
      this.visitExpression(stmt.value);
    }
  }

  visitBinaryExpression(expr: any): void {
    this.visitExpression(expr.left);
    this.visitExpression(expr.right);
  }

  visitUnaryExpression(expr: any): void {
    this.visitExpression(expr.operand);
  }

  visitLiteral(expr: any): void {
    // No recolecta símbolos
  }

  visitIdentifier(expr: any): void {
    // Podríamos verificar si el identificador existe, pero por ahora solo recolectamos declaraciones
  }

  visitFunctionCall(expr: any): void {
    // Verificar que la función existe
    const funcSymbol = this.symbolTable.lookupSymbol(expr.name);
    if (!funcSymbol) {
      console.warn(`Función '${expr.name}' no declarada`);
    }

    if (expr.args) {
      expr.args.forEach((arg: Expression) => this.visitExpression(arg));
    }
  }

  visitSliceLiteral(expr: any): void {
    if (expr.elements) {
      expr.elements.forEach((element: Expression) => this.visitExpression(element));
    }
  }

  visitStructLiteral(expr: any): void {
    // Verificar que el struct existe
    const structSymbol = this.symbolTable.lookupSymbol(expr.structName);
    if (!structSymbol) {
      console.warn(`Struct '${expr.structName}' no declarado`);
    }

    if (expr.fields) {
      Object.values(expr.fields).forEach((value: any) => this.visitExpression(value));
    }
  }

  visitMemberAccess(expr: any): void {
    this.visitExpression(expr.object);
    // Podríamos verificar que el miembro existe en el struct
  }

  visitArrayAccess(expr: any): void {
    this.visitExpression(expr.array);
    this.visitExpression(expr.index);
  }

  visitAssignment(expr: any): void {
    // Verificar que la variable existe
    const varSymbol = this.symbolTable.lookupSymbol(expr.left);
    if (!varSymbol) {
      console.warn(`Variable '${expr.left}' no declarada`);
    }

    this.visitExpression(expr.right);
  }

  collectSymbols(statements: Statement[]): SymbolTable {
    this.symbolTable.clear();

    statements.forEach(stmt => {
      this.visitStatement(stmt);
    });

    return this.symbolTable;
  }
}