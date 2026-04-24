import { Instruccion } from "../Abstract/Instruccion";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { Errores } from "../Excepciones/Errores";
import { OperadoresAritmeticos } from "./OperadoresAritmeticos";
import { Node } from "../Abstract/Node";

export class Resta extends Instruccion {
    private operando1: Instruccion;
    private operando2: Instruccion;
    private operacion: OperadoresAritmeticos;

    constructor(
        operando1: Instruccion,
        operando2: Instruccion,
        operacion: OperadoresAritmeticos,
        linea: number,
        columna: number
    ) {
        super(new Tipo(tipoDato.ENTERO, false), linea, columna);
        this.operando1 = operando1;
        this.operando2 = operando2;
        this.operacion = operacion;
    }

    public interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const opIzq = this.operando1.interpretar(arbol, tabla);
        if (opIzq instanceof Errores) return opIzq;

        const opDer = this.operando2.interpretar(arbol, tabla);
        if (opDer instanceof Errores) return opDer;

        switch (this.operacion) {
            case OperadoresAritmeticos.RESTA:
                return this.resta(opIzq, opDer);
            default:
                return new Errores("SEMANTICO", "Operador invalido", this.linea, this.columna);
        }
    }

    private resta(op1: any, op2: any): any {
        const tipo1 = this.operando1.tipo.tipoDato;
        const tipo2 = this.operando2.tipo.tipoDato;

        const n1 = this.toNumber(op1, tipo1);
        const n2 = this.toNumber(op2, tipo2);
        if (n1 === null || n2 === null) {
            return new Errores("SEMANTICO", "Resta erronea", this.linea, this.columna);
        }
        this.tipo.tipoDato = tipo1 === tipoDato.DECIMAL || tipo2 === tipoDato.DECIMAL ? tipoDato.DECIMAL : tipoDato.ENTERO;
        return n1 - n2;
    }

    private toNumber(valor: any, tipo: tipoDato): number | null {
        if (tipo === tipoDato.BOOLEANO) return valor ? 1 : 0;
        if (tipo === tipoDato.CARACTER) return String(valor).charCodeAt(0);
        if (typeof valor === "number") return valor;
        return null;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        let node = new Node("RESTA");
        node.pushChild(this.operando1.ast(arbol, tabla));
        node.pushChild(new Node("-"));
        node.pushChild(this.operando2.ast(arbol, tabla));
        return node;
    }
}
