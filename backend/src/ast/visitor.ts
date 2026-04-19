// src/ast/visitor.ts

import { Statement, Expression } from './nodes';

export abstract class Visitor<T> {
  abstract visitStatement(stmt: Statement): T;
  abstract visitExpression(expr: Expression): T;

  // Specific visit methods
  abstract visitVariableDeclaration(stmt: any): T;
  abstract visitFunctionDeclaration(stmt: any): T;
  abstract visitStructDeclaration(stmt: any): T;
  abstract visitExpressionStatement(stmt: any): T;
  abstract visitIfStatement(stmt: any): T;
  abstract visitForStatement(stmt: any): T;
  abstract visitForRangeStatement(stmt: any): T;
  abstract visitSwitchStatement(stmt: any): T;
  abstract visitBreakStatement(stmt: any): T;
  abstract visitContinueStatement(stmt: any): T;
  abstract visitReturnStatement(stmt: any): T;

  abstract visitBinaryExpression(expr: any): T;
  abstract visitUnaryExpression(expr: any): T;
  abstract visitLiteral(expr: any): T;
  abstract visitIdentifier(expr: any): T;
  abstract visitFunctionCall(expr: any): T;
  abstract visitSliceLiteral(expr: any): T;
  abstract visitStructLiteral(expr: any): T;
  abstract visitMemberAccess(expr: any): T;
  abstract visitArrayAccess(expr: any): T;
  abstract visitAssignment(expr: any): T;
}