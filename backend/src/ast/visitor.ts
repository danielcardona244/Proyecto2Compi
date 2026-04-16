// src/ast/visitor.ts

import { Statement, Expression } from './nodes';

export interface Visitor<T> {
  visitStatement(stmt: Statement): T;
  visitExpression(expr: Expression): T;

  // Specific visit methods
  visitVariableDeclaration(stmt: any): T;
  visitFunctionDeclaration(stmt: any): T;
  visitStructDeclaration(stmt: any): T;
  visitExpressionStatement(stmt: any): T;
  visitIfStatement(stmt: any): T;
  visitForStatement(stmt: any): T;
  visitForRangeStatement(stmt: any): T;
  visitSwitchStatement(stmt: any): T;
  visitBreakStatement(stmt: any): T;
  visitContinueStatement(stmt: any): T;
  visitReturnStatement(stmt: any): T;

  visitBinaryExpression(expr: any): T;
  visitUnaryExpression(expr: any): T;
  visitLiteral(expr: any): T;
  visitIdentifier(expr: any): T;
  visitFunctionCall(expr: any): T;
  visitSliceLiteral(expr: any): T;
  visitStructLiteral(expr: any): T;
  visitMemberAccess(expr: any): T;
  visitArrayAccess(expr: any): T;
  visitAssignment(expr: any): T;
}