  import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";

export class Unario extends Instruccion {
    constructor(
        private operador: "!" | "-",
        private operando: Instruccion,
        linea: number,
        columna: number
    ) {
        super(new Tipo(operador === "!" ? tipoDato.BOOLEANO : tipoDato.ENTERO, false), linea, columna);
    }

    public interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const valor = this.operando.interpretar(arbol, tabla);
        if (valor instanceof Errores) return valor;

        if (this.operador === "!") {
            this.tipo.tipoDato = tipoDato.BOOLEANO;
            return !Boolean(valor);
        }

        if (typeof valor !== "number") {
            return new Errores("SEMANTICO", "Negacion numerica requiere un numero", this.linea, this.columna);
        }

        this.tipo.tipoDato = this.operando.tipo.tipoDato === tipoDato.DECIMAL ? tipoDato.DECIMAL : tipoDato.ENTERO;
        return -valor;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("UNARIO");
        node.pushChild(new Node(this.operador));
        node.pushChild(this.operando.ast(arbol, tabla));
        return node;
    }
}
