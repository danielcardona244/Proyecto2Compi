import { Instruccion } from '../Abstract/Instruccion';
import { Arbol } from '../Simbolo/Arbol';
import { TablaSimbolos } from '../Simbolo/TablaSimbolos';
import { Tipo } from '../Simbolo/Tipo';
import { Node } from '../Abstract/Node';
import { tipoDato } from '../Simbolo/tipoDato';

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
                nuevaTabla.setVariable(funcion.parametros[i].nombre, valor, funcion.parametros[i].tipo);
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
                arbol.print(valores.join(' '));
                return null;
            } else if (this.nombre === 'strconv.Atoi') {
                if (this.argumentos.length !== 1) throw new Error('strconv.Atoi expects 1 argument');
                const str = this.argumentos[0].interpretar(arbol, tabla);
                return BuiltinFunctions.strconvAtoi(str);
            } else if (this.nombre === 'strconv.ParseFloat') {
                if (this.argumentos.length !== 1) throw new Error('strconv.ParseFloat expects 1 argument');
                const str = this.argumentos[0].interpretar(arbol, tabla);
                return BuiltinFunctions.strconvParseFloat(str);
            } else if (this.nombre === 'reflect.TypeOf') {
                if (this.argumentos.length !== 1) throw new Error('reflect.TypeOf expects 1 argument');
                const val = this.argumentos[0].interpretar(arbol, tabla);
                return BuiltinFunctions.reflectTypeOf(val);
            } else if (this.nombre === 'len') {
                if (this.argumentos.length !== 1) throw new Error('len expects 1 argument');
                const val = this.argumentos[0].interpretar(arbol, tabla);
                return BuiltinFunctions.len(val);
            } else if (this.nombre === 'append') {
                if (this.argumentos.length < 2) throw new Error('append expects at least 2 arguments');
                const slice = this.argumentos[0].interpretar(arbol, tabla);
                const elements = this.argumentos.slice(1).map(arg => arg.interpretar(arbol, tabla));
                return BuiltinFunctions.append(slice, ...elements);
            } else if (this.nombre === 'strings.Join') {
                if (this.argumentos.length !== 2) throw new Error('strings.Join expects 2 arguments');
                const slice = this.argumentos[0].interpretar(arbol, tabla);
                const sep = this.argumentos[1].interpretar(arbol, tabla);
                return BuiltinFunctions.stringsJoin(slice, sep);
            } else if (this.nombre === 'slices.Index') {
                if (this.argumentos.length !== 2) throw new Error('slices.Index expects 2 arguments');
                const slice = this.argumentos[0].interpretar(arbol, tabla);
                const value = this.argumentos[1].interpretar(arbol, tabla);
                return BuiltinFunctions.slicesIndex(slice, value);
            }
        }
        return null;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        let node = new Node('LLAMADA_FUNCION');
        node.pushChild(new Node(this.nombre));
        return node;
    }
}
