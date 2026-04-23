import { Instruccion } from '../Abstract/Instruccion';
import { Arbol } from '../Simbolo/Arbol';
import { TablaSimbolos } from '../Simbolo/TablaSimbolos';
import { Tipo } from '../Simbolo/Tipo';
import { Node } from '../Abstract/Node';
import { tipoDato } from '../Simbolo/tipoDato';

export class AccesoArreglo extends Instruccion {
    public arreglo: Instruccion;
    public indice: Instruccion;

    constructor(arreglo: Instruccion, indice: Instruccion, linea: number, columna: number) {
        super(new Tipo(tipoDato.VOID, false), linea, columna);
        this.arreglo = arreglo;
        this.indice = indice;
    }

    public interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        let arr = this.arreglo.interpretar(arbol, tabla);
        let idx = this.indice.interpretar(arbol, tabla);
        if (Array.isArray(arr) && typeof idx === 'number') {
            return arr[idx];
        }
        return null;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        let node = new Node('ACCESO_ARREGLO');
        node.pushChild(this.arreglo.ast(arbol, tabla));
        node.pushChild(this.indice.ast(arbol, tabla));
        return node;
    }
}
