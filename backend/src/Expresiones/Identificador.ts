import { Instruccion } from "../Abstract/Instruccion";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { Errores } from "../Excepciones/Errores";
import { Node } from "../Abstract/Node";

export class Identificador extends Instruccion {
    public id: string;

    constructor(id: string, linea: number, columna: number) {
        super(new Tipo(tipoDato.CADENA, false), linea, columna); // Tipo temporal
        this.id = id;
    }

    public interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        let simbolo = tabla.getSimbolo(this.id);
        if (simbolo === null) {
            arbol.errores.push(new Errores("SEMANTICO", `Variable ${this.id} no definida`, this.linea, this.columna));
            return null;
        }
        this.tipo = simbolo.tipo;
        return simbolo.valor;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        let node = new Node("IDENTIFICADOR");
        node.pushChild(new Node(this.id));
        return node;
    }
}
