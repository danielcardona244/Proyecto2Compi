import { Instruccion } from "../Abstract/Instruccion";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { Errores } from "../Excepciones/Errores";
import { Simbolo } from "../Simbolo/Simbolo";
import { Node } from "../Abstract/Node";

export class Declaracion extends Instruccion {
    public tipoDeclarado: tipoDato;
    public id: string;
    public valor: Instruccion | null;

    constructor(tipo: tipoDato, id: string, valor: Instruccion | null, linea: number, columna: number) {
        super(new Tipo(tipo, false), linea, columna);
        this.tipoDeclarado = tipo;
        this.id = id;
        this.valor = valor;
    }

    public interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        let valorInterpretado: any = null;
        if (this.valor !== null) {
            valorInterpretado = this.valor.interpretar(arbol, tabla);
            if (valorInterpretado instanceof Errores) {
                return valorInterpretado;
            }
        }

        let simbolo = new Simbolo(this.id, new Tipo(this.tipoDeclarado, false), valorInterpretado, this.linea, this.columna);
        if (!tabla.setSimbolo(simbolo)) {
            arbol.errores.push(new Errores("SEMANTICO", `Variable ${this.id} ya declarada`, this.linea, this.columna));
            return null;
        }
        return null;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        let node = new Node("DECLARACION");
        node.pushChild(new Node(this.tipoDeclarado.toString()));
        node.pushChild(new Node(this.id));
        if (this.valor !== null) {
            node.pushChild(this.valor.ast(arbol, tabla));
        }
        return node;
    }
}