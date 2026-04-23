/**
 * Builtins.ts - Funciones built-in de GoScript
 */

export class BuiltinFunctions {
  public static output: string[] = []; // Buffer de salida para capturar print

  /**
   * fmt.Println - Imprime valores seguidos de newline
   */
  static fmtPrintln(...args: any[]): void {
    const output = args.map((arg) => this.valueToString(arg)).join(' ');
    this.output.push(output);
    console.log(output);
  }

  /**
   * fmt.Print - Imprime valores sin newline
   */
  static fmtPrint(...args: any[]): void {
    const output = args.map((arg) => this.valueToString(arg)).join('');
    this.output[this.output.length - 1] = (this.output[this.output.length - 1] || '') + output;
    process.stdout.write(output);
  }

  /**
   * len - Devuelve la longitud de una cadena, slice o array
   */
  static len(value: any): number {
    if (typeof value === 'string') {
      return value.length;
    }
    if (Array.isArray(value)) {
      return value.length;
    }
    throw new Error(`len() no soporta tipo: ${typeof value}`);
  }

  /**
   * append - Añade elementos a un slice
   */
  static append(slice: any[], ...elements: any[]): any[] {
    return [...slice, ...elements];
  }

  /**
   * make - Crea slices o maps
   */
  static make(typeStr: string, size: number = 0): any[] {
    return new Array(size).fill(null);
  }

  /**
   * Conversiones de tipo
   */
  static toInt(value: any): number {
    if (typeof value === 'number') return Math.floor(value);
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      if (isNaN(parsed)) throw new Error(`No se puede convertir "${value}" a int`);
      return parsed;
    }
    if (typeof value === 'boolean') return value ? 1 : 0;
    throw new Error(`No se puede convertir ${typeof value} a int`);
  }

  static toFloat64(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      if (isNaN(parsed)) throw new Error(`No se puede convertir "${value}" a float64`);
      return parsed;
    }
    if (typeof value === 'boolean') return value ? 1.0 : 0.0;
    throw new Error(`No se puede convertir ${typeof value} a float64`);
  }

  static toString(value: any): string {
    return this.valueToString(value);
  }

  static toBool(value: any): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') return value !== '';
    if (value === null || value === undefined) return false;
    return true;
  }

  /**
   * Convierte un valor a su representación en string
   */
  private static valueToString(value: any): string {
    if (value === null || value === undefined) {
      return 'nil';
    }
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'number') {
      // Si es un entero, mostrarlo sin decimales
      return Number.isInteger(value) ? value.toString() : value.toString();
    }
    if (Array.isArray(value)) {
      return '[' + value.map((v) => this.valueToString(v)).join(' ') + ']';
    }
    if (typeof value === 'object') {
      // Struct
      const pairs = Object.entries(value)
        .map(([k, v]) => `${k}:${this.valueToString(v)}`)
        .join(' ');
      return '{' + pairs + '}';
    }
    return String(value);
  }

  /**
   * Limpia el buffer de salida
   */
  static clearOutput(): void {
    this.output = [];
  }

  /**
   * Obtiene todo el output capturado
   */
  static getOutput(): string {
    return this.output.join('\n');
  }

  /**
   * Determina el tipo de un valor
   */
  static typeof(value: any): string {
    if (value === null || value === undefined) {
      return 'nil';
    }
    if (typeof value === 'boolean') {
      return 'bool';
    }
    if (typeof value === 'number') {
      return Number.isInteger(value) ? 'int' : 'float64';
    }
    if (typeof value === 'string') {
      return 'string';
    }
    if (Array.isArray(value)) {
      return 'slice';
    }
    if (typeof value === 'object') {
      return value.constructor?.name || 'struct';
    }
    return 'unknown';
  }
}
  /**
   * strconv.Atoi - Convierte string a int
   */
  static strconvAtoi(s: string): number {
    const num = parseInt(s, 10);
    if (isNaN(num)) {
      throw new Error('strconv.Atoi: invalid syntax');
    }
    return num;
  }

  /**
   * strconv.ParseFloat - Convierte string a float64
   */
  static strconvParseFloat(s: string): number {
    const num = parseFloat(s);
    if (isNaN(num)) {
      throw new Error('strconv.ParseFloat: invalid syntax');
    }
    return num;
  }

  /**
   * reflect.TypeOf - Devuelve el tipo como string
   */
  static reflectTypeOf(value: any): string {
    if (value === null) return 'nil';
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'float64'; // Asumiendo float64 por defecto
    if (typeof value === 'boolean') return 'bool';
    if (Array.isArray(value)) return '[]interface{}'; // Slice
    if (typeof value === 'object') return 'struct'; // Struct
    return 'unknown';
  }

  /**
   * strings.Join - Une elementos de slice con separador
   */
  static stringsJoin(slice: any[], sep: string): string {
    return slice.map((item) => this.valueToString(item)).join(sep);
  }

  /**
   * slices.Index - Encuentra �ndice de elemento en slice
   */
  static slicesIndex(slice: any[], value: any): number {
    return slice.indexOf(value);
  }

  private static valueToString(value: any): string {
    if (value === null) return 'nil';
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return '[' + value.map((v) => this.valueToString(v)).join(' ') + ']';
    if (typeof value === 'object') {
      const entries = Object.entries(value).map(([k, v]) => ${k}: );
      return '{' + entries.join(' ') + '}';
    }
    return String(value);
  }
}
