import { Instruccion } from "../Abstract/Instruccion";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { Node } from "../Abstract/Node";

export class Continue extends Instruccion {
    constructor(linea: number, columna: number) {
        super(new Tipo(tipoDato.VOID, false), linea, columna);
    }

    public interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        return "CONTINUE";
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        return new Node("CONTINUE");
    }
}