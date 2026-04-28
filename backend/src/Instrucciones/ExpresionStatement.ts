import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";

export class ExpresionStatement extends Instruccion {
    constructor(private expresion: Instruccion, linea: number, columna: number) {
        super(new Tipo(tipoDato.VOID, false), linea, columna);
    }

    public interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const resultado = this.expresion.interpretar(arbol, tabla);
        if (resultado instanceof Errores) return resultado;
        return null;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("EXPRESION_STATEMENT");
        node.pushChild(this.expresion.ast(arbol, tabla));
        return node;
    }
}
