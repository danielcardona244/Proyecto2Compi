import { Instruccion } from "../Abstract/Instruccion";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { Node } from "../Abstract/Node";

export class Bloque extends Instruccion {
    public sentencias: Instruccion[];

    constructor(sentencias: Instruccion[], linea: number, columna: number) {
        super(new Tipo(tipoDato.VOID, false), linea, columna);
        this.sentencias = sentencias;
    }

    public interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        let tablaBloque = new TablaSimbolos(tabla);

        for (const sentencia of this.sentencias) {
            const resultado = sentencia.interpretar(arbol, tablaBloque);
            if (resultado !== null && resultado !== undefined) {
                return resultado;
            }
        }
        return null;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        let node = new Node("BLOQUE");
        for (const sentencia of this.sentencias) {
            node.pushChild(sentencia.ast(arbol, tabla));
        }
        return node;
    }
}