// src/environment/symbolTable.ts

export interface SymbolInfo {
  id: string;
  type: 'variable' | 'function' | 'struct' | 'parameter';
  dataType: string;
  scope: string;
  line: number;
  column: number;
  value?: any;
  params?: ParameterInfo[];
  fields?: FieldInfo[];
}

export interface ParameterInfo {
  name: string;
  type: string;
}

export interface FieldInfo {
  name: string;
  type: string;
}

export class SymbolTable {
  private symbols: Map<string, SymbolInfo[]> = new Map();
  private currentScope: string = 'global';

  constructor() {
    // Inicializar scope global
    this.symbols.set('global', []);
  }

  enterScope(scopeName: string): void {
    this.currentScope = scopeName;
    if (!this.symbols.has(scopeName)) {
      this.symbols.set(scopeName, []);
    }
  }

  exitScope(): void {
    // Volver al scope padre (simplificado - asumimos jerarquía simple)
    this.currentScope = 'global';
  }

  addSymbol(symbol: SymbolInfo): void {
    const scopeSymbols = this.symbols.get(this.currentScope) || [];
    // Verificar si ya existe en el mismo scope
    const existing = scopeSymbols.find(s => s.id === symbol.id);
    if (existing) {
      throw new Error(`Símbolo '${symbol.id}' ya declarado en el scope '${this.currentScope}'`);
    }
    scopeSymbols.push(symbol);
    this.symbols.set(this.currentScope, scopeSymbols);
  }

  lookupSymbol(id: string, scope?: string): SymbolInfo | null {
    const searchScope = scope || this.currentScope;

    // Buscar en el scope actual
    const scopeSymbols = this.symbols.get(searchScope) || [];
    const symbol = scopeSymbols.find(s => s.id === id);
    if (symbol) return symbol;

    // Si no está en el scope actual, buscar en global
    if (searchScope !== 'global') {
      const globalSymbols = this.symbols.get('global') || [];
      return globalSymbols.find(s => s.id === id) || null;
    }

    return null;
  }

  getAllSymbols(): SymbolInfo[] {
    const allSymbols: SymbolInfo[] = [];
    for (const scopeSymbols of this.symbols.values()) {
      allSymbols.push(...scopeSymbols);
    }
    return allSymbols;
  }

  getSymbolsByScope(scope: string): SymbolInfo[] {
    return this.symbols.get(scope) || [];
  }

  getGlobalSymbols(): SymbolInfo[] {
    return this.symbols.get('global') || [];
  }

  clear(): void {
    this.symbols.clear();
    this.symbols.set('global', []);
    this.currentScope = 'global';
  }
}