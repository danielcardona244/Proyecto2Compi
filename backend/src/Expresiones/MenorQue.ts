import { Instruccion } from "../Abstract/Instruccion";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { Node } from "../Abstract/Node";

export class MenorQue extends Instruccion {
    private operando1: Instruccion;
    private operando2: Instruccion;

    constructor(operando1: Instruccion, operando2: Instruccion, linea: number, columna: number) {
        super(new Tipo(tipoDato.BOOLEANO, false), linea, columna);
        this.operando1 = operando1;
        this.operando2 = operando2;
    }

    public interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const opIzq = this.operando1.interpretar(arbol, tabla);
        const opDer = this.operando2.interpretar(arbol, tabla);
        return opIzq < opDer;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        let node = new Node("MENORQUE");
        node.pushChild(this.operando1.ast(arbol, tabla));
        node.pushChild(new Node("<"));
        node.pushChild(this.operando2.ast(arbol, tabla));
        return node;
    }
}