import { Instruccion } from "../Abstract/Instruccion";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { Errores } from "../Excepciones/Errores";
import { OperadoresRelacionales } from "./OperadoresRelacionales";
import { Node } from "../Abstract/Node";

export class Igual extends Instruccion {
    private operando1: Instruccion;
    private operando2: Instruccion;
    private operador: OperadoresRelacionales;

    constructor(
        operando1: Instruccion,
        operando2: Instruccion,
        operador: OperadoresRelacionales,
        linea: number,
        columna: number
    ) {
        super(new Tipo(tipoDato.BOOLEANO, false), linea, columna);
        this.operando1 = operando1;
        this.operando2 = operando2;
        this.operador = operador;
    }

    public interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const opIzq = this.operando1.interpretar(arbol, tabla);
        if (opIzq instanceof Errores) return opIzq;

        const opDer = this.operando2.interpretar(arbol, tabla);
        if (opDer instanceof Errores) return opDer;

        return opIzq === opDer;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        let node = new Node("IGUAL");
        node.pushChild(this.operando1.ast(arbol, tabla));
        node.pushChild(new Node("=="));
        node.pushChild(this.operando2.ast(arbol, tabla));
        return node;
    }
}