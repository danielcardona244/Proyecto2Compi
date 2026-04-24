/**
 * Builtins.ts - Funciones built-in de GoScript
 */

export class BuiltinFunctions {
  public static output: string[] = [];

  static fmtPrintln(...args: any[]): void {
    const output = args.map((arg) => this.valueToString(arg)).join(' ');
    this.output.push(output);
    console.log(output);
  }

  static fmtPrint(...args: any[]): void {
    const output = args.map((arg) => this.valueToString(arg)).join('');
    this.output[this.output.length - 1] = (this.output[this.output.length - 1] || '') + output;
    process.stdout.write(output);
  }

  static len(value: any): number {
    if (typeof value === 'string') return value.length;
    if (Array.isArray(value)) return value.length;
    throw new Error(`len() no soporta tipo: ${typeof value}`);
  }

  static append(slice: any[], ...elements: any[]): any[] {
    return [...slice, ...elements];
  }

  static make(typeName: string, size: number = 0): any[] {
    if (typeof typeName === 'string' && typeName.startsWith('[]')) {
      return new Array(size).fill(null);
    }
    throw new Error(`make() no soporta tipo: ${typeName}`);
  }

  static strconvAtoi(str: string): number {
    const parsed = parseInt(str, 10);
    if (isNaN(parsed)) throw new Error(`strconv.Atoi: parsing "${str}": invalid syntax`);
    return parsed;
  }

  static strconvParseFloat(str: string): number {
    const parsed = parseFloat(str);
    if (isNaN(parsed)) throw new Error(`strconv.ParseFloat: parsing "${str}": invalid syntax`);
    return parsed;
  }

  static reflectTypeOf(val: any): string {
    if (val === null) return 'nil';
    if (typeof val === 'boolean') return 'bool';
    if (typeof val === 'number') return val % 1 === 0 ? 'int' : 'float64';
    if (typeof val === 'string') return 'string';
    if (Array.isArray(val)) return '[]interface{}';
    return 'interface{}';
  }

  static stringsJoin(slice: string[], sep: string): string {
    return slice.join(sep);
  }

  static slicesIndex(slice: any[], value: any): number {
    return slice.indexOf(value);
  }

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

  static typeof(value: any): string {
    if (value === null || value === undefined) return 'nil';
    if (typeof value === 'boolean') return 'bool';
    if (typeof value === 'number') return Number.isInteger(value) ? 'int' : 'float64';
    if (typeof value === 'string') return 'string';
    if (Array.isArray(value)) return 'slice';
    if (typeof value === 'object') return value.constructor?.name || 'struct';
    return 'unknown';
  }

  static clearOutput(): void {
    this.output = [];
  }

  static getOutput(): string {
    return this.output.join('\n');
  }

  private static valueToString(value: any): string {
    if (value === null || value === undefined) return 'nil';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (Array.isArray(value)) return '[' + value.map((v) => this.valueToString(v)).join(' ') + ']';
    if (typeof value === 'object') {
      const pairs = Object.entries(value)
        .map(([k, v]) => `${k}:${this.valueToString(v)}`)
        .join(' ');
      return '{' + pairs + '}';
    }
    return String(value);
  }
}
