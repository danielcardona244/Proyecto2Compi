
import { Environment, GoFunction } from './environment';
import { BuiltinFunctions } from './builtins';

export type ASTNode = any;

export class Interpreter {
  private globalEnv: Environment;
  private currentEnv: Environment;
  private returnValue: any = undefined;
  private shouldReturn: boolean = false;
  private breakFlag: boolean = false;
  private continueFlag: boolean = false;

  constructor() {
    this.globalEnv = new Environment(null, 'global');
    this.currentEnv = this.globalEnv;
    this.setupGlobalEnvironment();
  }

  /**
   * Configura funciones built-in en el ambiente global
   */
  private setupGlobalEnvironment(): void {
    // fmt.Println y fmt.Print se manejan especialmente en el evaluador
  }

  /**
   * Interpreta un programa (lista de statements)
   */
  interpret(ast: ASTNode[]): any {
    BuiltinFunctions.clearOutput();
    this.returnValue = undefined;
    this.shouldReturn = false;

    try {
      for (const statement of ast) {
        this.execute(statement);
        if (this.shouldReturn) {
          break;
        }
      }
    } catch (error: any) {
      throw new Error(`Error de ejecución: ${error.message}`);
    }

    return BuiltinFunctions.getOutput();
  }

  /**
   * Ejecuta un statement
   */
  private execute(node: ASTNode): any {
    if (!node) return undefined;

    switch (node.type) {
      case 'variable_declaration':
        return this.executeVariableDeclaration(node);
      case 'function_declaration':
        return this.executeFunctionDeclaration(node);
      case 'struct_declaration':
        return this.executeStructDeclaration(node);
      case 'assignment':
        return this.evaluateAssignment(node);
      case 'if_statement':
        return this.executeIfStatement(node);
      case 'for_statement':
        return this.executeForStatement(node);
      case 'switch_statement':
        return this.executeSwitchStatement(node);
      case 'break':
        this.breakFlag = true;
        return undefined;
      case 'continue':
        this.continueFlag = true;
        return undefined;
      case 'return':
        this.shouldReturn = true;
        this.returnValue = node.value ? this.evaluate(node.value) : undefined;
        return undefined;
      case 'expression':
      case 'expression_statement':
        return this.evaluate(node.expression || node);
      default:
        return this.evaluate(node);
    }
  }

  /**
   * Evalúa una expresión
   */
  private evaluate(node: ASTNode): any {
    if (!node) return undefined;

    switch (node.type) {
      case 'variable':
        return this.currentEnv.get(node.name);

      case 'number':
        return Number(node);

      case 'string':
        return String(node);

      case 'boolean':
        return Boolean(node);

      case 'nil':
        return null;

      case 'binary':
        return this.evaluateBinary(node);

      case 'unary':
        return this.evaluateUnary(node);

      case 'assignment':
        return this.evaluateAssignment(node);

      case 'function_call':
        return this.evaluateFunctionCall(node);

      case 'method_call':
        return this.evaluateMethodCall(node);

      case 'array_literal':
        return this.evaluateArrayLiteral(node);

      case 'struct_literal':
        return this.evaluateStructLiteral(node);

      // Los literales numéricos y strings vienen sin type
      default:
        // Asumir que es un valor literal si es un primitivo
        if (typeof node === 'number') return node;
        if (typeof node === 'string') return node;
        if (typeof node === 'boolean') return node;
        if (node === null) return null;
        
        throw new Error(`Tipo de nodo desconocido: ${node.type || typeof node}`);
    }
  }

  /**
   * Operaciones binarias
   */
  private evaluateBinary(node: ASTNode): any {
    const left = this.evaluate(node.left);
    const right = this.evaluate(node.right);
    const op = node.operator;

    switch (op) {
      // Aritméticas
      case '+':
        if (typeof left === 'string' || typeof right === 'string') {
          return String(left) + String(right);
        }
        return left + right;
      case '-':
        return left - right;
      case '*':
        return left * right;
      case '/':
        if (right === 0) throw new Error('División por cero');
        return left / right;
      case '%':
        return left % right;

      // Comparación
      case '==':
        return left === right;
      case '!=':
        return left !== right;
      case '<':
        return left < right;
      case '<=':
        return left <= right;
      case '>':
        return left > right;
      case '>=':
        return left >= right;

      // Lógicas
      case '&&':
        return this.isTruthy(left) && this.isTruthy(right);
      case '||':
        return this.isTruthy(left) || this.isTruthy(right);

      default:
        throw new Error(`Operador binario desconocido: ${op}`);
    }
  }

  /**
   * Operaciones unarias
   */
  private evaluateUnary(node: ASTNode): any {
    const operand = this.evaluate(node.operand);

    switch (node.operator) {
      case '-':
        return -operand;
      case '!':
        return !this.isTruthy(operand);
      default:
        throw new Error(`Operador unario desconocido: ${node.operator}`);
    }
  }

  /**
   * Asignaciones
   */
  private evaluateAssignment(node: ASTNode): any {
    const value = this.evaluate(node.right);

    if (node.operator === ':=') {
      // Declaración corta con :=
      const type = BuiltinFunctions.typeof(value);
      this.currentEnv.define(node.left, value, type);
      return value;
    } else if (node.operator && node.operator !== '=') {
      // Operadores compuestos: +=, -=, etc.
      const current = this.currentEnv.get(node.left);
      const newValue = this.evaluateBinary({
        type: 'binary',
        operator: node.operator.slice(0, -1), // Eliminar el '='
        left: current,
        right: value,
      });
      this.currentEnv.set(node.left, newValue);
      return newValue;
    } else {
      // Asignación simple
      this.currentEnv.set(node.left, value);
      return value;
    }
  }

  /**
   * Declaración de variables
   */
  private executeVariableDeclaration(node: ASTNode): any {
    const value = node.value ? this.evaluate(node.value) : this.getDefaultValue(node.varType);
    this.currentEnv.define(node.name, value, node.varType || BuiltinFunctions.typeof(value));
    return undefined;
  }

  /**
   * Declaración de funciones
   */
  private executeFunctionDeclaration(node: ASTNode): any {
    const func: GoFunction = {
      name: node.name,
      params: node.params || [],
      body: node.body || [],
      returnType: node.returnType || null,
      closure: this.currentEnv, // Capturar closure
    };
    this.currentEnv.defineFunction(func);
    return undefined;
  }

  /**
   * Declaración de structs (por ahora solo registrar como tipo)
   */
  private executeStructDeclaration(node: ASTNode): any {
    // Los structs se manejan en las llamadas a constructor
    return undefined;
  }

  /**
   * Control: if/else
   */
  private executeIfStatement(node: ASTNode): any {
    const condition = this.evaluate(node.condition);

    if (this.isTruthy(condition)) {
      const childEnv = this.currentEnv.createChild('if');
      const prevEnv = this.currentEnv;
      this.currentEnv = childEnv;

      for (const stmt of node.body || []) {
        this.execute(stmt);
        if (this.shouldReturn || this.breakFlag || this.continueFlag) break;
      }

      this.currentEnv = prevEnv;
    } else if (node.else) {
      // Si el else es otro if_statement, ejecutarlo
      if (node.else.type === 'if_statement') {
        this.executeIfStatement(node.else);
      } else {
        // Si no, es un bloque de statements
        const childEnv = this.currentEnv.createChild('else');
        const prevEnv = this.currentEnv;
        this.currentEnv = childEnv;

        for (const stmt of node.else || []) {
          this.execute(stmt);
          if (this.shouldReturn || this.breakFlag || this.continueFlag) break;
        }

        this.currentEnv = prevEnv;
      }
    }

    return undefined;
  }

  /**
   * Control: for loop
   */
  private executeForStatement(node: ASTNode): any {
    // Crear nuevo scope para el loop
    const loopEnv = this.currentEnv.createChild('for');
    const prevEnv = this.currentEnv;
    this.currentEnv = loopEnv;

    try {
      // for range: for i, v := range slice { ... }
      if (node.index !== undefined) {
        const rangeValue = this.evaluate(node.range);
        if (!Array.isArray(rangeValue)) {
          throw new Error('for range requiere un slice o array');
        }

        for (let i = 0; i < rangeValue.length; i++) {
          this.currentEnv.define(node.index, i, 'int');
          this.currentEnv.define(node.value, rangeValue[i], BuiltinFunctions.typeof(rangeValue[i]));

          for (const stmt of node.body || []) {
            this.execute(stmt);
            if (this.continueFlag) {
              this.continueFlag = false;
              break;
            }
            if (this.breakFlag || this.shouldReturn) break;
          }

          if (this.breakFlag) {
            this.breakFlag = false;
            break;
          }
          if (this.shouldReturn) break;
        }
      }
      // for condition { ... }
      else if (node.condition !== undefined) {
        while (this.isTruthy(this.evaluate(node.condition))) {
          for (const stmt of node.body || []) {
            this.execute(stmt);
            if (this.continueFlag) {
              this.continueFlag = false;
              break;
            }
            if (this.breakFlag || this.shouldReturn) break;
          }

          if (this.breakFlag) {
            this.breakFlag = false;
            break;
          }
          if (this.shouldReturn) break;
        }
      }
      // for init; condition; increment { ... }
      else if (node.init !== undefined) {
        this.execute(node.init);

        while (this.isTruthy(this.evaluate(node.condition))) {
          for (const stmt of node.body || []) {
            this.execute(stmt);
            if (this.continueFlag) {
              this.continueFlag = false;
              break;
            }
            if (this.breakFlag || this.shouldReturn) break;
          }

          if (this.breakFlag) {
            this.breakFlag = false;
            break;
          }
          if (this.shouldReturn) break;

          this.evaluate(node.increment);
        }
      }
    } finally {
      this.currentEnv = prevEnv;
    }

    return undefined;
  }

  /**
   * Control: switch
   */
  private executeSwitchStatement(node: ASTNode): any {
    const switchValue = this.evaluate(node.expression);
    const switchEnv = this.currentEnv.createChild('switch');
    const prevEnv = this.currentEnv;
    this.currentEnv = switchEnv;

    try {
      let caseMatched = false;

      for (const caseNode of node.cases || []) {
        if (caseNode.type === 'default' || caseMatched || this.evaluate(caseNode.value) === switchValue) {
          caseMatched = true;

          for (const stmt of caseNode.body || []) {
            this.execute(stmt);
            if (this.breakFlag) {
              this.breakFlag = false;
              return undefined;
            }
            if (this.shouldReturn) return undefined;
          }
        }
      }
    } finally {
      this.currentEnv = prevEnv;
    }

    return undefined;
  }

  /**
   * Llamadas a funciones
   */
  private evaluateFunctionCall(node: ASTNode): any {
    // Funciones built-in
    if (node.name === 'len') {
      const arg = this.evaluate(node.args[0]);
      return BuiltinFunctions.len(arg);
    }
    if (node.name === 'make') {
      const typeStr = node.args[0];
      const size = node.args[1] ? this.evaluate(node.args[1]) : 0;
      return BuiltinFunctions.make(typeStr, size);
    }
    if (node.name === 'append') {
      const slice = this.evaluate(node.args[0]);
      const elements = node.args.slice(1).map((arg: ASTNode) => this.evaluate(arg));
      return BuiltinFunctions.append(slice, ...elements);
    }

    // Funciones definidas por el usuario
    const func = this.currentEnv.getFunction(node.name);
    if (!func) {
      throw new Error(`Función no definida: ${node.name}`);
    }

    // Crear nuevo ambiente para la función
    const funcEnv = func.closure.createChild(`func_${node.name}`);

    // Vincular parámetros
    const args = node.args.map((arg: ASTNode) => this.evaluate(arg));
    for (let i = 0; i < func.params.length; i++) {
      const paramName = func.params[i].name;
      const paramValue = args[i];
      funcEnv.define(paramName, paramValue, func.params[i].type);
    }

    // Ejecutar cuerpo
    const prevEnv = this.currentEnv;
    const prevShouldReturn = this.shouldReturn;
    const prevReturnValue = this.returnValue;

    this.currentEnv = funcEnv;
    this.shouldReturn = false;
    this.returnValue = undefined;

    try {
      for (const stmt of func.body) {
        this.execute(stmt);
        if (this.shouldReturn) break;
      }
    } finally {
      const result = this.returnValue;
      this.currentEnv = prevEnv;
      this.shouldReturn = prevShouldReturn;
      this.returnValue = prevReturnValue;
      return result;
    }
  }

  /**
   * Llamadas a métodos (especialmente fmt.Println, fmt.Print)
   */
  private evaluateMethodCall(node: ASTNode): any {
    const objectName = node.object.name || node.object.type === 'variable' ? node.object.name : null;
    const method = node.method;
    const args = node.args.map((arg: ASTNode) => this.evaluate(arg));

    if (objectName === 'fmt') {
      if (method === 'Println') {
        BuiltinFunctions.fmtPrintln(...args);
        return undefined;
      }
      if (method === 'Print') {
        BuiltinFunctions.fmtPrint(...args);
        return undefined;
      }
    }

    throw new Error(`Método no soportado: ${objectName}.${method}`);
  }

  /**
   * Literales de array
   */
  private evaluateArrayLiteral(node: ASTNode): any[] {
    return node.elements.map((elem: ASTNode) => this.evaluate(elem));
  }

  /**
   * Literales de struct
   */
  private evaluateStructLiteral(node: ASTNode): any {
    const obj: any = {};
    for (const [key, value] of Object.entries(node.fields || {})) {
      obj[key] = this.evaluate(value);
    }
    return obj;
  }

  /**
   * Determina si un valor es truthy
   */
  private isTruthy(value: any): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') return value !== '';
    return true;
  }

  /**
   * Obtiene el valor por defecto para un tipo
   */
  private getDefaultValue(type: string): any {
    switch (type) {
      case 'int':
      case 'float64':
        return 0;
      case 'string':
        return '';
      case 'bool':
        return false;
      case 'rune':
        return 0;
      default:
        return null;
    }
  }

  /**
   * Obtiene el output capturado
   */
  getOutput(): string {
    return BuiltinFunctions.getOutput();
  }
}
