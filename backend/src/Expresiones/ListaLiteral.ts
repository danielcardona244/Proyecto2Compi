import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";

export class ListaLiteral extends Instruccion {
    constructor(public elementos: Instruccion[], linea: number, columna: number) {
        super(new Tipo(tipoDato.SLICE, true), linea, columna);
    }

    public interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        return this.elementos.map(elemento => elemento.interpretar(arbol, tabla));
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("LISTA_LITERAL");
        const elementosNode = new Node("ELEMENTOS");
        for (const elemento of this.elementos) elementosNode.pushChild(elemento.ast(arbol, tabla));
        node.pushChild(elementosNode);
        return node;
    }
}
