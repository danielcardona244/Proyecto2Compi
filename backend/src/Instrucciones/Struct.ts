import { Instruccion } from '../Abstract/Instruccion';
import { Arbol } from '../Simbolo/Arbol';
import { TablaSimbolos } from '../Simbolo/TablaSimbolos';
import { Tipo } from '../Simbolo/Tipo';
import { Node } from '../Abstract/Node';
import { tipoDato } from '../Simbolo/tipoDato';

export class Struct extends Instruccion {
    public nombre: string;
    public campos: any[];

    constructor(nombre: string, campos: any[], linea: number, columna: number) {
        super(new Tipo(tipoDato.VOID, false), linea, columna);
        this.nombre = nombre;
        this.campos = campos;
    }

    public interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        // Definir el struct en la tabla de símbolos global
        tabla.setStruct(this.nombre, this);
        return null;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        let node = new Node('STRUCT');
        node.pushChild(new Node(this.nombre));
        // Agregar campos
        return node;
    }
}
