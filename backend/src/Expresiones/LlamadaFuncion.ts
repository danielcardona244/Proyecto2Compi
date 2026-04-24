import { Instruccion } from '../Abstract/Instruccion';
import { Arbol } from '../Simbolo/Arbol';
import { TablaSimbolos } from '../Simbolo/TablaSimbolos';
import { Tipo } from '../Simbolo/Tipo';
import { Node } from '../Abstract/Node';
import { tipoDato } from '../Simbolo/tipoDato';
import { BuiltinFunctions } from '../interpreter/builtins';
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
        // Buscar la funci�n en la tabla
        let funcion = tabla.getFuncion(this.nombre);
        if (funcion) {
            // Crear nueva tabla para el scope de la funci�n
            let nuevaTabla = new TablaSimbolos(tabla);
            // Asignar par�metros
            for (let i = 0; i < this.argumentos.length; i++) {
                let valor = this.argumentos[i].interpretar(arbol, tabla);
                nuevaTabla.setSimbolo(new Simbolo(funcion.parametros[i].nombre, funcion.parametros[i].tipo, valor, this.linea, this.columna));
            }
            // Ejecutar instrucciones de la funci�n
            for (let instr of funcion.instrucciones) {
                let resultado = instr.interpretar(arbol, nuevaTabla);
                if (resultado !== null) return resultado; // Retorno
            }
        } else {
            // Verificar built-ins
            if (this.nombre === 'fmt.Println') {
                const valores = this.argumentos.map(arg => arg.interpretar(arbol, tabla));
                arbol.print(valores.map(valor => this.formatear(valor)).join(' '));
                return null;
            }
        }
        return null;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        let node = new Node('LLAMADA_FUNCION');
        node.pushChild(new Node(this.nombre));
        return node;
    }

    private formatear(valor: any): string {
        if (valor === null || valor === undefined) return "nil";
        if (Array.isArray(valor)) return `[${valor.map(item => this.formatear(item)).join(" ")}]`;
        return String(valor);
    }
}
