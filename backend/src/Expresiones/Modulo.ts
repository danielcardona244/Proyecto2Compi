import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";

export class Modulo extends Instruccion {
    constructor(
        private operando1: Instruccion,
        private operando2: Instruccion,
        linea: number,
        columna: number
    ) {
        super(new Tipo(tipoDato.ENTERO, false), linea, columna);
    }

    public interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const opIzq = this.operando1.interpretar(arbol, tabla);
        if (opIzq instanceof Errores) return opIzq;

        const opDer = this.operando2.interpretar(arbol, tabla);
        if (opDer instanceof Errores) return opDer;

        if (!Number.isInteger(opIzq) || !Number.isInteger(opDer)) {
            return new Errores("SEMANTICO", "Modulo requiere operandos enteros", this.linea, this.columna);
        }

        if (opDer === 0) {
            return new Errores("SEMANTICO", "Modulo por cero", this.linea, this.columna);
        }

        return opIzq % opDer;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("MODULO");
        node.pushChild(this.operando1.ast(arbol, tabla));
        node.pushChild(new Node("%"));
        node.pushChild(this.operando2.ast(arbol, tabla));
        return node;
    }
}
