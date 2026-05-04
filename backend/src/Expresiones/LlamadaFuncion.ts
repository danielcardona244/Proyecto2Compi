import { Instruccion } from '../Abstract/Instruccion';
import { Arbol } from '../Simbolo/Arbol';
import { TablaSimbolos } from '../Simbolo/TablaSimbolos';
import { Tipo } from '../Simbolo/Tipo';
import { Node } from '../Abstract/Node';
import { tipoDato } from '../Simbolo/tipoDato';
import { Simbolo } from '../Simbolo/Simbolo';

export class LlamadaFuncion extends Instruccion {
    public nombre: string;
    public argumentos: Instruccion[];

    constructor(nombre: string, argumentos: Instruccion[], linea: number, columna: number) {
        super(new Tipo(tipoDato.VOID, false), linea, columna);
        this.nombre = nombre;
        this.argumentos = argumentos;
    }

    public interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const funcion = tabla.getFuncion(this.nombre);
        if (funcion) {
            const nuevaTabla = new TablaSimbolos(tabla, funcion.nombre);

            for (let i = 0; i < funcion.parametros.length; i++) {
                const parametro = funcion.parametros[i];
                const argumento = this.argumentos[i];
                const valor = argumento ? argumento.interpretar(arbol, tabla) : null;
                const simbolo = new Simbolo(parametro.nombre, parametro.tipo, valor, this.linea, this.columna, "Parametro", funcion.nombre);
                nuevaTabla.setSimbolo(simbolo);
                arbol.simbolos.push(simbolo);
            }

            for (const instr of funcion.instrucciones) {
                const resultado = instr.interpretar(arbol, nuevaTabla);
                if (resultado && resultado.control === "RETURN") return resultado.value;
                if (resultado !== null) return resultado;
            }
            return null;
        }

        return this.ejecutarBuiltin(arbol, tabla);
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node('LLAMADA_FUNCION');
        const nombreNode = new Node('NOMBRE');
        nombreNode.pushChild(new Node(this.nombre));
        node.pushChild(nombreNode);

        const argumentosNode = new Node('ARGUMENTOS');
        for (const argumento of this.argumentos) {
            argumentosNode.pushChild(argumento.ast(arbol, tabla));
        }
        node.pushChild(argumentosNode);
        return node;
    }

    private ejecutarBuiltin(arbol: Arbol, tabla: TablaSimbolos): any {
        if (this.nombre === 'fmt.Println') {
            const valores = this.argumentos.map(arg => arg.interpretar(arbol, tabla));
            arbol.print(valores.map(valor => this.formatear(valor)).join(' '));
            return null;
        }
        if (this.nombre === 'len') {
            const valor = this.argumentos[0]?.interpretar(arbol, tabla);
            return Array.isArray(valor) || typeof valor === "string" ? valor.length : 0;
        }
        if (this.nombre === 'append') {
            const slice = this.argumentos[0]?.interpretar(arbol, tabla);
            const valores = this.argumentos.slice(1).map(arg => arg.interpretar(arbol, tabla));
            if (slice === null || slice === undefined) return [...valores];
            return Array.isArray(slice) ? [...slice, ...valores] : null;
        }
        if (this.nombre === 'slices.Index') {
            const slice = this.argumentos[0]?.interpretar(arbol, tabla);
            const valor = this.argumentos[1]?.interpretar(arbol, tabla);
            return Array.isArray(slice) ? slice.indexOf(valor) : -1;
        }
        if (this.nombre === 'strings.Join') {
            const slice = this.argumentos[0]?.interpretar(arbol, tabla);
            const sep = this.argumentos[1]?.interpretar(arbol, tabla);
            return Array.isArray(slice) ? slice.join(String(sep)) : "";
        }
        if (this.nombre === 'strconv.Atoi') {
            const valor = this.argumentos[0]?.interpretar(arbol, tabla);
            const parsed = parseInt(String(valor), 10);
            return Number.isNaN(parsed) ? null : parsed;
        }
        if (this.nombre === 'strconv.ParseFloat') {
            const valor = this.argumentos[0]?.interpretar(arbol, tabla);
            const parsed = parseFloat(String(valor));
            return Number.isNaN(parsed) ? null : parsed;
        }
        if (this.nombre === 'reflect.TypeOf') {
            const argumento = this.argumentos[0];
            const valor = argumento?.interpretar(arbol, tabla);
            const tipo = argumento?.tipo?.tipoDato;
            if (tipo === tipoDato.ENTERO) return "int";
            if (tipo === tipoDato.DECIMAL) return "float64";
            if (tipo === tipoDato.CADENA) return "string";
            if (tipo === tipoDato.BOOLEANO) return "bool";
            if (tipo === tipoDato.CARACTER) return "rune";
            if (tipo === tipoDato.SLICE) return "slice";
            if (tipo === tipoDato.MAP) return "map";
            if (tipo === tipoDato.STRUCT) return "struct";
            if (valor === null || valor === undefined) return "nil";
            if (Array.isArray(valor)) return "slice";
            if (typeof valor === "number") return Number.isInteger(valor) ? "int" : "float64";
            if (typeof valor === "boolean") return "bool";
            if (typeof valor === "string") return "string";
            return "struct";
        }
        if (this.nombre === 'int') {
            const valor = this.argumentos[0]?.interpretar(arbol, tabla);
            return Math.trunc(Number(valor));
        }
        if (this.nombre === 'float64') {
            const valor = this.argumentos[0]?.interpretar(arbol, tabla);
            return Number(valor);
        }
        if (this.nombre === 'string') {
            const valor = this.argumentos[0]?.interpretar(arbol, tabla);
            return String(valor);
        }
        if (this.nombre === 'bool') {
            const valor = this.argumentos[0]?.interpretar(arbol, tabla);
            return Boolean(valor);
        }
        return null;
    }

    private formatear(valor: any): string {
        if (valor === null || valor === undefined) return "nil";
        if (Array.isArray(valor)) return `[${valor.map(item => this.formatear(item)).join(" ")}]`;
        if (typeof valor === "object") {
            const nombre = valor.__structName || "struct";
            const campos = Object.entries(valor)
                .filter(([key]) => key !== "__structName")
                .map(([key, value]) => `${key}: ${this.formatear(value)}`)
                .join(" ");
            return `${nombre}{${campos}}`;
        }
        return String(valor);
    }
}
