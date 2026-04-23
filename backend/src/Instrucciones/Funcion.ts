import { Instruccion } from '../Abstract/Instruccion';
import { Arbol } from '../Simbolo/Arbol';
import { TablaSimbolos } from '../Simbolo/TablaSimbolos';
import { Tipo } from '../Simbolo/Tipo';
import { Node } from '../Abstract/Node';
import { tipoDato } from '../Simbolo/tipoDato';

export class Funcion extends Instruccion {
    public nombre: string;
    public parametros: any[];
    public tipoRetorno: Tipo | null;
    public instrucciones: Instruccion[];

    constructor(nombre: string, parametros: any[], tipoRetorno: Tipo | null, instrucciones: Instruccion[], linea: number, columna: number) {
        super(new Tipo(tipoDato.VOID, false), linea, columna);
        this.nombre = nombre;
        this.parametros = parametros;
        this.tipoRetorno = tipoRetorno;
        this.instrucciones = instrucciones;
    }

    public interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        // Definir la función en la tabla de símbolos global
        tabla.setFuncion(this.nombre, this);
        return null;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        let node = new Node('FUNCION');
        node.pushChild(new Node(this.nombre));
        // Agregar parámetros, etc.
        return node;
    }
}
