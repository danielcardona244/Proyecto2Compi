/**
 * Environment.ts - Gestión de variables, funciones y scope
 */

export interface Variable {
  name: string;
  value: any;
  type: string;
  scope: string;
}

export interface GoFunction {
  name: string;
  params: Array<{ name: string; type: string }>;
  body: any[];
  returnType: string | null;
  closure: Environment; // Para soportar closures
}

export class Environment {
  private variables: Map<string, Variable> = new Map();
  private functions: Map<string, GoFunction> = new Map();
  private parent: Environment | null;
  private scopeName: string;

  constructor(parent: Environment | null = null, scopeName: string = 'global') {
    this.parent = parent;
    this.scopeName = scopeName;
  }

  /**
   * Define una variable en el scope actual
   */
  define(name: string, value: any, type: string): void {
    this.variables.set(name, {
      name,
      value,
      type,
      scope: this.scopeName,
    });
  }

  /**
   * Obtiene una variable (busca en el scope actual y en parents)
   */
  get(name: string): any {
    const variable = this.variables.get(name);
    if (variable) {
      return variable.value;
    }

    if (this.parent) {
      return this.parent.get(name);
    }

    throw new Error(`Variable no definida: ${name}`);
  }

  /**
   * Establece el valor de una variable existente
   */
  set(name: string, value: any): void {
    const variable = this.variables.get(name);
    if (variable) {
      variable.value = value;
      return;
    }

    if (this.parent) {
      this.parent.set(name, value);
      return;
    }

    throw new Error(`Variable no definida: ${name}`);
  }

  /**
   * Verifica si una variable existe
   */
  has(name: string): boolean {
    if (this.variables.has(name)) {
      return true;
    }

    if (this.parent) {
      return this.parent.has(name);
    }

    return false;
  }

  /**
   * Define una función
   */
  defineFunction(func: GoFunction): void {
    this.functions.set(func.name, func);
  }

  /**
   * Obtiene una función
   */
  getFunction(name: string): GoFunction | undefined {
    const func = this.functions.get(name);
    if (func) {
      return func;
    }

    if (this.parent) {
      return this.parent.getFunction(name);
    }

    return undefined;
  }

  /**
   * Crea un nuevo scope child
   */
  createChild(scopeName: string = 'block'): Environment {
    return new Environment(this, scopeName);
  }

  /**
   * Obtiene todas las variables del scope actual (para debugging)
   */
  getAllVariables(): Variable[] {
    return Array.from(this.variables.values());
  }

  /**
   * Obtiene el tipo de una variable
   */
  getType(name: string): string {
    const variable = this.variables.get(name);
    if (variable) {
      return variable.type;
    }

    if (this.parent) {
      return this.parent.getType(name);
    }

    throw new Error(`Variable no definida: ${name}`);
  }
}
