// src/errors/errorCollector.ts

export interface CompilerError {
  id: number;
  type: 'lexical' | 'syntactic' | 'semantic';
  description: string;
  line: number;
  column: number;
}

export class ErrorCollector {
  private errors: CompilerError[] = [];
  private errorIdCounter = 1;

  addError(type: 'lexical' | 'syntactic' | 'semantic', description: string, line: number = 1, column: number = 1): void {
    const error: CompilerError = {
      id: this.errorIdCounter++,
      type,
      description,
      line,
      column
    };
    this.errors.push(error);
  }

  addLexicalError(description: string, line: number = 1, column: number = 1): void {
    this.addError('lexical', description, line, column);
  }

  addSyntacticError(description: string, line: number = 1, column: number = 1): void {
    this.addError('syntactic', description, line, column);
  }

  addSemanticError(description: string, line: number = 1, column: number = 1): void {
    this.addError('semantic', description, line, column);
  }

  getErrors(): CompilerError[] {
    return this.errors;
  }

  getErrorsByType(type: 'lexical' | 'syntactic' | 'semantic'): CompilerError[] {
    return this.errors.filter(error => error.type === type);
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  hasErrorsOfType(type: 'lexical' | 'syntactic' | 'semantic'): boolean {
    return this.errors.some(error => error.type === type);
  }

  clear(): void {
    this.errors = [];
    this.errorIdCounter = 1;
  }

  getErrorCount(): number {
    return this.errors.length;
  }

  getErrorTable(): any[] {
    return this.errors.map(error => ({
      'No': error.id,
      'Descripción': error.description,
      'Línea': error.line,
      'Columna': error.column,
      'Tipo': this.getTypeLabel(error.type)
    }));
  }

  private getTypeLabel(type: 'lexical' | 'syntactic' | 'semantic'): string {
    switch (type) {
      case 'lexical': return 'Léxico';
      case 'syntactic': return 'Sintáctico';
      case 'semantic': return 'Semántico';
      default: return 'Desconocido';
    }
  }
}