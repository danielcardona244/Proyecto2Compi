import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";

export class Logica extends Instruccion {
    constructor(
        private operando1: Instruccion,
        private operando2: Instruccion,
        private operador: "&&" | "||",
        linea: number,
        columna: number
    ) {
        super(new Tipo(tipoDato.BOOLEANO, false), linea, columna);
    }

    public interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const opIzq = this.operando1.interpretar(arbol, tabla);
        if (opIzq instanceof Errores) return opIzq;

        if (this.operador === "&&" && !Boolean(opIzq)) return false;
        if (this.operador === "||" && Boolean(opIzq)) return true;

        const opDer = this.operando2.interpretar(arbol, tabla);
        if (opDer instanceof Errores) return opDer;

        return this.operador === "&&" ? Boolean(opIzq) && Boolean(opDer) : Boolean(opIzq) || Boolean(opDer);
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("LOGICA");
        node.pushChild(this.operando1.ast(arbol, tabla));
        node.pushChild(new Node(this.operador));
        node.pushChild(this.operando2.ast(arbol, tabla));
        return node;
    }
}
